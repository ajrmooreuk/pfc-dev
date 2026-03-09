# ALZ Environment Audit Report

**Generated:** 2026-02-05 21:30:52 UTC
**Tool:** 16-ALZ-SS-Audit-AzCLI-v1 v1.0.0
**Method:** Pure Azure CLI (no Python dependencies)
**Output Directory:** `./alz-audit-20260205-212418`

---

## Executive Summary

This report contains the results of an automated Azure environment audit
designed to support Azure Landing Zone (ALZ) planning and implementation.
All data was collected using Azure CLI Resource Graph queries (`az graph query`)
with no external dependencies.

| Metric | Value |
|--------|-------|
| Total Resources | 16 |
| Resource Types | 11 |
| Subscriptions | 3 |
| Regions | 4 |
| Tagging Compliance | 12.5% |
| Untagged Resources | 10 |

---

## 1. Tenant & Management Group Discovery

| Metric | Value |
|--------|-------|
| Tenants | 0 |
| Management Groups | 1 |
| Enabled Subscriptions | 10 |

**Files:** `01-tenant-discovery/`

---

## 2. Resource Inventory

### Execution Summary

| Metric | Value |
|--------|-------|
| Queries Executed | 45 |
| Successful | 44 |
| Failed | 1 |
| Total Rows Collected | 116 |

### Top Resource Types

| Resource Type | Count |
|---------------|-------|
| microsoft.storage/storageaccounts | 3 |
| microsoft.cognitiveservices/accounts | 2 |
| microsoft.cognitiveservices/accounts/projects | 2 |
| microsoft.powerplatform/enterprisepolicies | 2 |
| microsoft.visualstudio/account | 1 |
| microsoft.search/searchservices | 1 |
| microsoft.network/networkwatchers | 1 |
| microsoft.web/staticsites | 1 |
| microsoft.powerplatform/accounts | 1 |
| microsoft.documentdb/databaseaccounts | 1 |
| microsoft.keyvault/vaults | 1 |

**Files:** `02-resource-inventory/`

---

## 3. Security & Compliance

### Defender for Cloud - Secure Scores

| Subscription | Score | Max |
|-------------|-------|-----|
| 495bf684-02f... | 5.0 | 13 |

### Security Assessment Summary

| Status | Count |
|--------|-------|
| Healthy | 17 |
| Unhealthy | 37 |
| Not Applicable | 7 |

### MCSB v2 Compliance Snapshot

| Control Area | Total | Compliant | Notes |
|-------------|-------|-----------|-------|
| Storage (DP-3: Data in Transit) | 3 | 3 | HTTPS + TLS 1.2 |
| Key Vault (DP-5: Data at Rest) | 1 | 1 | Soft Delete + Purge Protection |
| Network (NS-1: Subnet NSGs) | - | - | 0 subnets without NSG |

**Files:** `03-compliance-summary/`

---

## 4. Output File Structure

```
./alz-audit-20260205-212418/
+-- 01-tenant-discovery/
|   +-- current-context.json          # Current az account context
|   +-- tenants.json                  # All accessible tenants
|   +-- subscriptions-full.json       # Full subscription details
|   +-- subscriptions-summary.json    # Subscription summary
|   +-- management-groups.json        # Management group list
|   +-- mg-hierarchy.json             # MG tree structure
|   +-- subscription-resource-counts.json
|   +-- subscription-mg-mapping.json
|   +-- tenant-discovery.json         # Discovery summary
|
+-- 02-resource-inventory/
|   +-- summary-metrics.json          # Estate-wide metrics
|   +-- tagging-compliance.json       # Tagging analysis
|   +-- resource-types.json           # Type distribution
|   +-- region-distribution.json      # Region distribution
|   +-- inventory-full.json           # Complete inventory
|   +-- inventory-by-type.json        # Count by type
|   +-- untagged-resources.json       # Untagged resources
|   +-- tag-keys.json                 # Tag key distribution
|   +-- management-groups.json        # MGs via Resource Graph
|   +-- subscriptions.json            # Subs via Resource Graph
|   +-- policy-assignments.json       # Policy assignments
|   +-- policy-compliance.json        # Policy compliance
|   +-- policy-enforcement.json       # Enforcement modes
|   +-- keyvaults.json                # Key Vault config
|   +-- nsgs.json                     # NSG inventory
|   +-- nsg-rules.json                # NSG rule details
|   +-- storage-security.json         # Storage security
|   +-- public-ips.json               # Public IP addresses
|   +-- sql-security.json             # SQL Server config
|   +-- vnets.json                    # Virtual networks
|   +-- subnets.json                  # Subnet details
|   +-- subnets-no-nsg.json           # Subnets missing NSGs
|   +-- peerings.json                 # VNet peerings
|   +-- network-connectivity.json     # Connectivity resources
|   +-- private-endpoints.json        # Private endpoints
|   +-- managed-identities.json       # Managed identities
|   +-- rbac-summary.json             # RBAC summary
|   +-- rbac-assignments.json         # RBAC detail
|   +-- custom-roles.json             # Custom roles
|   +-- data-ai-resources.json        # Data & AI services
|   +-- databases.json                # Database services
|   +-- storage-datalake.json         # Storage/Data Lake
|   +-- mcsb-v1-storage.json          # MCSB v1 storage
|   +-- mcsb-v2-storage.json          # MCSB v2 storage
|   +-- mcsb-v1-keyvault.json         # MCSB v1 Key Vault
|   +-- mcsb-v2-keyvault.json         # MCSB v2 Key Vault
|   +-- mcsb-v2-network.json          # MCSB v2 network
|   +-- waf-reliability-backup.json   # WAF: backup
|   +-- waf-reliability-zones.json    # WAF: availability zones
|   +-- waf-cost-unattached-disks.json    # WAF: cost
|   +-- waf-cost-unused-publicips.json    # WAF: cost
|   +-- waf-opex-diagnostics.json     # WAF: diagnostics
|   +-- waf-opex-alerts.json          # WAF: alerts
|   +-- waf-perf-autoscale.json       # WAF: autoscale
|   +-- waf-perf-cdn.json             # WAF: CDN/FrontDoor
|   +-- execution-summary.json        # Query execution log
|
+-- 03-compliance-summary/
|   +-- secure-scores.json            # Defender secure scores
|   +-- assessment-summary.json       # Assessment counts
|   +-- defender-per-sub/             # Per-subscription data
|       +-- secure-score-XXXXXXXX.json
|       +-- mcsb-v2-controls-XXXXXXXX.json
|
+-- ALZ-Audit-Report.md              # This report
```

---

## 5. Compliance Frameworks Assessed

| Framework | ID | Status |
|-----------|----|--------|
| Microsoft Cloud Security Benchmark v2 | MCSB-v2 | Primary |
| Microsoft Cloud Security Benchmark v1 | MCSB-v1 | Legacy |
| NIST SP 800-53 Rev 5 | NIST-800-53-R5 | Mapped via compliance-mapping.json |
| ISO 27001:2022 | ISO-27001-2022 | Mapped via compliance-mapping.json |
| UK NCSC 14 Cloud Security Principles | NCSC-14 | Reference |

---

## 6. Well-Architected Framework Pillar Coverage

| WAF Pillar | Data Collected | Key Files |
|------------|---------------|-----------|
| Security | NSGs, Storage config, Key Vaults, SQL, Public IPs, RBAC | keyvaults.json, storage-security.json, nsgs.json |
| Reliability | Backup vaults, Availability zones | waf-reliability-backup.json, waf-reliability-zones.json |
| Cost Optimization | Unattached disks, Unused public IPs | waf-cost-unattached-disks.json, waf-cost-unused-publicips.json |
| Operational Excellence | Diagnostics settings, Alerts | waf-opex-diagnostics.json, waf-opex-alerts.json |
| Performance Efficiency | Autoscale settings, CDN/FrontDoor | waf-perf-autoscale.json, waf-perf-cdn.json |

---

## 7. Next Steps

1. **Review** the tenant discovery output to understand current structure
2. **Analyze** the resource inventory for ALZ migration planning
3. **Prioritize** MCSB non-compliant resources for remediation
4. **Address** subnets without NSGs (0 found)
5. **Review** untagged resources (10 found) for governance gaps
6. **Map** findings to target ALZ architecture design
7. **Import** JSON files into analysis tools (Excel, Power BI, etc.)

---

*Generated by 16-ALZ-SS-Audit-AzCLI-v1 v1.0.0 -- Pure Azure CLI, no Python dependencies.*
*Works in Azure Cloud Shell without installing anything.*
