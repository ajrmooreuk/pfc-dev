# ALZ Snapshot Audit — Quick Start Guide

**For experienced Azure Architects.** Shortform install-configure-run instructions.
Full detail: [03-ALZ-SS-Audit-Operating-Deployment-Guide-v1.md](03-ALZ-SS-Audit-Operating-Deployment-Guide-v1.md)

| Property | Value |
|----------|-------|
| Version | 1.0.0 |
| Date | February 2026 |
| Audience | Azure Architect / Platform Engineer |
| Delivery | 3-5 days |
| Automation | 2-4 hours unattended |

---

## Prerequisites

### Workstation

```bash
# Azure CLI 2.50.0+
az version

# Resource Graph extension
az extension add --name resource-graph

# Python 3.10+
python3 --version

# Python packages
pip install azure-identity azure-mgmt-resourcegraph azure-mgmt-resource azure-mgmt-security pandas openpyxl
```

Or from the package:

```bash
pip install -r 13-ALZ-SS-Audit-Requirements-v1.txt
```

### Client Information (obtain before starting)

| Required | Item |
|----------|------|
| **Tenant ID** | Azure AD tenant GUID |
| **Subscription list** | All subscriptions in scope |
| **Technical contact** | For access approvals |
| **Audit window** | Business hours / maintenance |
| **Data residency** | UK sovereignty constraints |

### Azure Permissions

Request one of these from the client:

**Option A — Built-in roles** (at Management Group root or all subs):

```
Reader
Security Reader
Resource Policy Contributor
Log Analytics Reader
```

**Option B — Custom role** (minimal privilege):

```json
{
  "Name": "ALZ-Audit-Reader",
  "Actions": [
    "*/read",
    "Microsoft.Security/*/read",
    "Microsoft.PolicyInsights/*/read",
    "Microsoft.Authorization/*/read",
    "Microsoft.Network/*/read",
    "Microsoft.Storage/*/read",
    "Microsoft.KeyVault/*/read",
    "Microsoft.Compute/*/read",
    "Microsoft.Sql/*/read",
    "Microsoft.OperationalInsights/*/read"
  ],
  "NotActions": [],
  "AssignableScopes": ["/providers/Microsoft.Management/managementGroups/{mg-id}"]
}
```

---

## Step 1: Authenticate

```bash
az login --tenant <tenant-id>
az account show --output table          # verify correct tenant
az account list --output table          # verify subscription access
```

### Verify permissions

```bash
az graph query -q "resources | summarize count()" --output table
az security assessment list --subscription <sub-id> --output table
az policy state list --subscription <sub-id> --top 5 --output table
```

All three commands must return data without errors before proceeding.

---

## Step 2: Run the Audit

### Option A — Fully Automated (recommended)

```bash
cd PBS/ARCHITECTURE/ALZ-Audit-Snapshot-alz-ss-v1/
./15-ALZ-SS-Audit-Full-Auto-v1.sh --output ./audit-$(date +%Y%m%d)
```

This runs all three stages sequentially:
1. Tenant discovery (management groups, subscriptions)
2. Resource queries (40+ KQL queries across 8 domains)
3. Compliance summary (Defender secure scores, assessments)

Output structure:

```
audit-YYYYMMDD/
├── 01-tenant-discovery/     # Tenant structure + Mermaid diagrams
├── 02-resource-inventory/   # KQL query results (JSON + CSV)
├── 03-compliance-summary/   # Secure scores + assessments
└── ALZ-Audit-Report.md      # Summary report
```

### Option B — Step-by-Step

```bash
# 1. Tenant discovery
python3 14-ALZ-SS-Audit-Tenant-Discovery-v1.py --output ./tenant-audit

# 2. Resource queries
python3 11-ALZ-SS-Audit-Query-Executor-v1.py \
  --config 05-ALZ-SS-Audit-KQL-Queries-v1.json \
  --output ./exports

# 3. MCSB v1 compliance
az security regulatory-compliance-assessments list \
  --standard-name "Azure-Security-Benchmark" \
  --output json > exports/mcsb-v1-assessments.json

# 4. MCSB v2 compliance
az security regulatory-compliance-assessments list \
  --standard-name "Microsoft-cloud-security-benchmark" \
  --output json > exports/mcsb-v2-assessments.json

# 5. Secure scores (all subscriptions)
for sub in $(az account list --query "[].id" -o tsv); do
  az security secure-score list --subscription $sub --output json \
    >> exports/secure-scores.json
done
```

### Option C — Individual Domain Queries

Skip automation entirely — run targeted KQL queries from the CLI.

**Resource inventory:**

```bash
az graph query -q "
resources
| summarize count() by type
| order by count_ desc
" --output table
```

**Untagged resources (governance gap):**

```bash
az graph query -q "
resources
| where isnull(tags) or tags == '{}'
| summarize count() by type
| order by count_ desc
" --output table
```

**Storage security posture:**

```bash
az graph query -q "
resources
| where type == 'microsoft.storage/storageaccounts'
| extend httpsOnly = properties.supportsHttpsTrafficOnly,
         minTls = properties.minimumTlsVersion,
         publicAccess = properties.allowBlobPublicAccess,
         networkAction = properties.networkAcls.defaultAction
| project name, resourceGroup, httpsOnly, minTls, publicAccess, networkAction
" --output table
```

**Subnets missing NSGs:**

```bash
az graph query -q "
resources
| where type == 'microsoft.network/virtualnetworks'
| mv-expand subnet = properties.subnets
| extend subnetName = subnet.name,
         hasNsg = isnotnull(subnet.properties.networkSecurityGroup.id)
| where hasNsg == false
| project vnetName=name, subnetName, resourceGroup
" --output table
```

**Key Vault configuration:**

```bash
az graph query -q "
resources
| where type == 'microsoft.keyvault/vaults'
| extend rbac = properties.enableRbacAuthorization,
         softDelete = properties.enableSoftDelete,
         purgeProtect = properties.enablePurgeProtection,
         publicAccess = properties.publicNetworkAccess
| project name, resourceGroup, rbac, softDelete, purgeProtect, publicAccess
" --output table
```

**RBAC role assignments:**

```bash
az graph query -q "
authorizationresources
| where type == 'microsoft.authorization/roleassignments'
| extend principalType = properties.principalType,
         scope = properties.scope
| summarize count() by tostring(principalType)
" --output table
```

---

## Step 3: Deploy Azure Workbook (Optional)

For interactive dashboard access within the Azure Portal:

```bash
# Create audit resource group
az group create --name rg-alz-audit-tools --location uksouth \
  --tags Environment=Audit Project=ALZ-Assessment

# Deploy workbook
az monitor workbook create \
  --resource-group rg-alz-audit-tools \
  --location uksouth \
  --display-name "Pre-ALZ Environment Audit" \
  --serialized-data @04-ALZ-SS-Audit-Azure-Workbook-v1.workbook \
  --category workbook
```

Or: Azure Portal -> Azure Monitor -> Workbooks -> New -> Advanced Editor -> paste contents of `04-ALZ-SS-Audit-Azure-Workbook-v1.workbook`.

---

## Step 4: Review Outputs

### Key files to check

| File | What to look for |
|------|------------------|
| `inventory-full.json` | Total resource count, resource types |
| `untagged-resources.json` | Governance gaps (tagging compliance) |
| `storage-security.json` | HTTPS-only, TLS 1.2, public blob access |
| `keyvaults.json` | RBAC auth, soft delete, purge protection |
| `subnets.json` | Subnets without NSGs |
| `mcsb-v1-assessments.json` | MCSB v1 compliance score |
| `mcsb-v2-assessments.json` | MCSB v2 compliance score |
| `secure-scores.json` | Defender for Cloud secure score |
| `rbac-assignments.json` | Over-privileged accounts, orphaned assignments |
| `policy-compliance.json` | Non-compliant policy assignments |

### Quick compliance score

```python
import json

with open('exports/mcsb-v2-assessments.json') as f:
    a = json.load(f)

total = len(a)
passed = sum(1 for x in a if x['properties']['state'] == 'Passed')
failed = sum(1 for x in a if x['properties']['state'] == 'Failed')
skipped = sum(1 for x in a if x['properties']['state'] == 'Skipped')
score = (passed / (total - skipped)) * 100 if (total - skipped) > 0 else 0

print(f"MCSB v2: {score:.1f}% ({passed} passed, {failed} failed, {skipped} skipped)")
```

---

## Step 5: Post-Audit Cleanup

```bash
# Verify all exports collected
ls -la exports/ | wc -l

# Request client revoke access (email template in Operating Guide section 8.3)

# Remove local data after handover confirmed
rm -rf exports/ reports/

# Logout and clear credentials
az logout
az cache purge
az account clear
```

---

## Compliance Frameworks Covered

| Framework | Version | Scope |
|-----------|---------|-------|
| MCSB v1 | 1.0.0 | Azure Security Benchmark (legacy) |
| MCSB v2 | 2.0.0 | Microsoft Cloud Security Benchmark (current) |
| NIST 800-53 | Rev 5 | US federal security controls |
| UK NCSC 14 | Latest | UK cloud security principles |
| ISO 27001 | 2022 | International ISMS |
| Azure WAF | Latest | Well-Architected Framework (5 pillars) |

### Insurance Sector Regulatory Context

| Regulator | Standard | Domain |
|-----------|----------|--------|
| FCA | SYSC 13.9 | Operational resilience |
| PRA | SS1/21 | Outsourcing & third-party risk |
| Lloyd's | MS13 | Cyber security |
| ICO | GDPR Art.32 | Data protection |
| EU | DORA | Digital operational resilience (Jan 2027) |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `AuthorizationFailed` | Request additional role assignments from client |
| `QuotaExceeded` on Resource Graph | Use `--first 1000 --skip N` pagination |
| `TooManyRequests` | Add `sleep 1` between queries |
| Empty regulatory compliance data | Enable standards in Defender for Cloud -> Regulatory Compliance -> Manage Standards |
| `InvalidSubscription` | Verify subscription list with client — may be out of scope |

---

## Package Reference

| # | File | Purpose |
|---|------|---------|
| 01 | README | Package overview and manifest |
| 02 | Vision-Strategy-Plan | VSOM framework + client questions |
| 03 | Operating-Deployment-Guide | **Full detailed procedures** |
| 04 | Azure-Workbook | Interactive dashboard (ARM template) |
| 05 | KQL-Queries | 40+ Resource Graph queries |
| 06 | Compliance-Mapping | MCSB/NIST/NCSC/ISO cross-mapping |
| 07 | OAA-Ontology | JSON-LD ontology (16 entities) |
| 11 | Query-Executor | Python query runner |
| 14 | Tenant-Discovery | Python tenant/MG/sub discovery |
| 15 | Full-Auto | Single-command audit orchestrator |

---

*ALZ Snapshot Audit Quick Start Guide v1.0.0*
*For full procedures: [03-ALZ-SS-Audit-Operating-Deployment-Guide-v1.md](03-ALZ-SS-Audit-Operating-Deployment-Guide-v1.md)*
*Classification: Internal — Vendor Operations*
