# ALZ Environment Snapshot Audit Package

## Quick Reference Guide

**Package Version:** 1.5.0
**Date:** February 2026
**Purpose:** Rapid Azure Estate Assessment
**Audience:** Consultants, Client Technical Teams

---

## Package Manifest

### Essential Documents

These are the primary documents required for audit delivery. Read in order.

| Ref | File | Audience | Purpose |
|-----|------|----------|---------|
| **E1** | `01-ALZ-SS-Audit-README-v1.md` | All | This file - package overview, manifest |
| **E2** | `02-ALZ-SS-Audit-Vision-Strategy-Plan-v1.md` | Client + Consultant | VSOM framework, supplementary questions |
| **E3** | `16-ALZ-SS-Audit-Architecture-HLD-v1.md` | Consultant | High-level design, workflow diagrams |
| **E4** | `03-ALZ-SS-Audit-Operating-Deployment-Guide-v1.md` | Consultant | Step-by-step delivery procedures |

**Reading Order:**
- **Client:** E1 → E2 (stop)
- **Consultant:** E1 → E2 → E3 → E4 + supporting docs as needed

### Supporting Documents

#### S1. Automation Tools

| Ref | File | Purpose |
|-----|------|---------|
| **S1.1** | `15-ALZ-SS-Audit-Full-Auto-v1.sh` | Single-command full audit orchestrator |
| **S1.2** | `14-ALZ-SS-Audit-Tenant-Discovery-v1.py` | Tenant/MG/subscription discovery |
| **S1.3** | `11-ALZ-SS-Audit-Query-Executor-v1.py` | Python KQL query automation |
| **S1.4** | `12-ALZ-SS-Audit-Run-Script-v1.sh` | Bash wrapper script (legacy) |
| **S1.5** | `04-ALZ-SS-Audit-Azure-Workbook-v1.workbook` | Azure Workbook for interactive audit |
| **S1.6** | `05-ALZ-SS-Audit-KQL-Queries-v1.json` | 40+ KQL queries for Resource Graph |
| **S1.7** | `13-ALZ-SS-Audit-Requirements-v1.txt` | Python package requirements |

#### S2. Compliance & Reference Data

| Ref | File | Purpose |
|-----|------|---------|
| **S2.1** | `06-ALZ-SS-Audit-Compliance-Mapping-v1.json` | MCSB/NIST/NCSC/ISO control mapping |
| **S2.2** | `07-ALZ-SS-Audit-OAA-Ontology-v1.json` | OAA-compliant compliance ontology |
| **S2.3** | `08-ALZ-SS-Audit-OAA-Visual-Guide-v1.md` | Ontology visual guide |
| **S2.4** | `09-ALZ-SS-Audit-OAA-Glossary-v1.json` | Glossary of terms |
| **S2.5** | `10-ALZ-SS-Audit-OAA-TestData-v1.json` | Test data for validation |

---

## Package Overview

This package provides automated tooling and documentation for conducting a **rapid snapshot audit** of an existing Azure environment. The audit establishes baseline visibility of security posture, compliance alignment, and governance maturity.

**Key Principle:** Minimise client team time through API-driven automated discovery.

| What | Description |
|------|-------------|
| **Duration** | 3-5 days |
| **Client Time** | ~3-4 hours total |
| **Consultant Time** | ~8-16 hours |
| **Automation** | 2-4 hours (unattended) |

---

## Quick Start

### Option 1: Full Automated Audit (Recommended)

```bash
# Prerequisites: az login, Python 3.10+
cd ALZ-Audit-Snapshot-alz-ss-v1/

# Run single-command audit
./15-ALZ-SS-Audit-Full-Auto-v1.sh --output ./audit-results
```

**Output:** Complete audit in `./audit-results/` including:
- Tenant discovery and architecture diagram
- Resource inventory (JSON/CSV)
- Compliance summary

### Option 2: Step-by-Step Manual

1. **Authenticate**
   ```bash
   az login --tenant <tenant-id>
   ```

2. **Run Tenant Discovery**
   ```bash
   python3 14-ALZ-SS-Audit-Tenant-Discovery-v1.py --output ./tenant-audit
   ```

3. **Run KQL Queries**
   ```bash
   python3 11-ALZ-SS-Audit-Query-Executor-v1.py \
     --config 05-ALZ-SS-Audit-KQL-Queries-v1.json \
     --output ./exports
   ```

4. **Deploy Azure Workbook** (for interactive review)
   - Azure Portal → Monitor → Workbooks → New
   - Import `04-ALZ-SS-Audit-Azure-Workbook-v1.workbook`

---

## Client Requirements

### Access Required

| Permission | Scope | Purpose |
|------------|-------|---------|
| Reader | All subscriptions | Resource inventory |
| Security Reader | All subscriptions | Defender for Cloud |
| Management Group Reader | Root MG | Hierarchy discovery |

### Client Deliverables

| Item | Format | When |
|------|--------|------|
| Azure access provisioned | RBAC assignment | Day 1 |
| Supplementary questions completed | See E2 (VSOM) | Day 2 |
| Architecture diagrams | PDF | Day 2 |

---

## Compliance & Architecture Frameworks

### Security & Compliance

| Framework | Assessment Method |
|-----------|-------------------|
| **MCSB v2** | Defender for Cloud compliance score |
| **MCSB v1** | Defender for Cloud (legacy) |
| **NIST 800-53** | Control mapping via S2.1 |
| **UK NCSC 14 Principles** | Control mapping |
| **ISO 27001** | Control mapping |

### Architecture Quality

| Framework | Assessment Method |
|-----------|-------------------|
| **Azure Well-Architected Framework** | WAF Assessment tool, Azure Advisor |
| **Cloud Adoption Framework** | ALZ alignment, governance review |

**WAF 5 Pillars:**
- Reliability (RE) - Uptime, DR, backup
- Security (SE) - Aligned with MCSB
- Cost Optimization (CO) - Rightsizing, unused resources
- Operational Excellence (OE) - Monitoring, automation
- Performance Efficiency (PE) - Scalability, optimization

### Sector-Specific (if applicable)

- FCA SYSC
- PRA Expectations
- Solvency II
- Lloyd's Standards
- GDPR

---

## Output Files

### Tenant Discovery

| File | Description |
|------|-------------|
| `tenant-discovery.json` | Full tenant/MG/subscription structure |
| `subscriptions.json` | Subscription list with resource counts |
| `tenant-architecture.md` | Mermaid diagram of hierarchy |

### Resource Inventory

| File | Description |
|------|-------------|
| `inventory-full.json` | Complete resource inventory |
| `inventory-by-type.csv` | Resource counts by type |
| `untagged-resources.csv` | Governance gap - untagged resources |

### Security & Compliance

| File | Description |
|------|-------------|
| `secure-scores.json` | Defender Secure Score |
| `mcsb-v2-storage.csv` | Storage MCSB v2 compliance |
| `keyvaults.json` | Key Vault configuration |
| `storage-security.csv` | Storage account security |

### Network

| File | Description |
|------|-------------|
| `vnets.json` | Virtual network topology |
| `subnets.csv` | Subnet configuration with NSG status |
| `peerings.json` | VNet peering relationships |
| `nsgs.json` | Network security groups |

---

## Support

For questions about this audit package, contact the Advisory Team.

---

## Document Control & Change Record

**Status:** DRAFT - To Be Discussed

### Package Change History

| Version | Date | Author | Status | Changes |
|---------|------|--------|--------|---------|
| 1.0.0 | 2026-02-03 | Advisory Team | Draft | Initial release (13 files) |
| 1.1.0 | 2026-02-03 | Advisory Team | Draft | Added tenant discovery (S1.2), full auto script (S1.1) |
| 1.2.0 | 2026-02-03 | Advisory Team | Draft | Added reading order, duration estimates |
| 1.3.0 | 2026-02-03 | Advisory Team | Draft | Added architecture HLD (E3) |
| 1.4.0 | 2026-02-03 | Advisory Team | Draft | Reorganised manifest with Essential/Supporting structure |
| 1.5.0 | 2026-02-03 | Advisory Team | Draft | Added Azure WAF + CAF framework references throughout |

### Document Version Matrix

| Ref | Document | Current Version | Status |
|-----|----------|-----------------|--------|
| E1 | README | 1.5.0 | Draft |
| E2 | VSOM | 2.1 | Draft |
| E3 | Architecture HLD | 1.1.0 | Draft |
| E4 | Operating Guide | 1.1.0 | Draft |
| S1.1 | Full Auto Script | 1.0.0 | Draft |
| S1.2 | Tenant Discovery | 1.0.0 | Draft |
| S1.3 | Query Executor | 1.0.0 | Draft |
| S1.4 | Run Script | 1.0.0 | Draft |
| S1.5 | Azure Workbook | 1.0.0 | Draft |
| S1.6 | KQL Queries | 1.2.0 | Draft |
| S1.7 | Requirements | 1.0.0 | Draft |
| S2.1 | Compliance Mapping | 1.2.0 | Draft |
| S2.2 | OAA Ontology | 1.2.0 | Draft |
| S2.3 | OAA Visual Guide | 1.0.0 | Draft |
| S2.4 | OAA Glossary | 1.0.0 | Draft |
| S2.5 | OAA Test Data | 1.0.0 | Draft |

### Approval Record

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author | Advisory Team | 2026-02-03 | _Pending_ |
| Reviewer | | | _Pending_ |
| Approver | | | _Pending_ |
