# ALZ Audit Snapshot Package Index

## Package: ALZ-Audit-Snapshot-alz-ss-v1

**Version:** 1.4.0
**Last Updated:** 2026-02-03

---

## Essential Documents (E-Series)

| Ref | Filename | Audience | Description |
|-----|----------|----------|-------------|
| E1 | 01-ALZ-SS-Audit-README-v1.md | All | Package overview, manifest, change record |
| E2 | 02-ALZ-SS-Audit-Vision-Strategy-Plan-v1.md | Client + Consultant | VSOM framework, client questions |
| E3 | 16-ALZ-SS-Audit-Architecture-HLD-v1.md | Consultant | High-level design & workflow |
| E4 | 03-ALZ-SS-Audit-Operating-Deployment-Guide-v1.md | Consultant | Detailed delivery procedures |

---

## Supporting Documents (S-Series)

### S1. Automation Tools

| Ref | Filename | Description |
|-----|----------|-------------|
| S1.1 | 15-ALZ-SS-Audit-Full-Auto-v1.sh | Full automated audit orchestrator |
| S1.2 | 14-ALZ-SS-Audit-Tenant-Discovery-v1.py | Tenant/MG discovery script |
| S1.3 | 11-ALZ-SS-Audit-Query-Executor-v1.py | Python query executor |
| S1.4 | 12-ALZ-SS-Audit-Run-Script-v1.sh | Bash run script (legacy) |
| S1.5 | 04-ALZ-SS-Audit-Azure-Workbook-v1.workbook | Azure Workbook JSON |
| S1.6 | 05-ALZ-SS-Audit-KQL-Queries-v1.json | KQL query library |
| S1.7 | 13-ALZ-SS-Audit-Requirements-v1.txt | Python requirements |

### S2. Compliance & Reference Data

| Ref | Filename | Description |
|-----|----------|-------------|
| S2.1 | 06-ALZ-SS-Audit-Compliance-Mapping-v1.json | Compliance control mapping |
| S2.2 | 07-ALZ-SS-Audit-OAA-Ontology-v1.json | OAA ontology definition |
| S2.3 | 08-ALZ-SS-Audit-OAA-Visual-Guide-v1.md | Ontology visual guide |
| S2.4 | 09-ALZ-SS-Audit-OAA-Glossary-v1.json | Glossary of terms |
| S2.5 | 10-ALZ-SS-Audit-OAA-TestData-v1.json | Test data set |

---

## Quick Links

- **Start Here:** [E1 - README](01-ALZ-SS-Audit-README-v1.md)
- **Client Questionnaire:** [E2 - VSOM](02-ALZ-SS-Audit-Vision-Strategy-Plan-v1.md)
- **Architecture:** [E3 - HLD](16-ALZ-SS-Audit-Architecture-HLD-v1.md)
- **Run Full Audit:** `./15-ALZ-SS-Audit-Full-Auto-v1.sh`

---

## Reading Order

| Audience | Path |
|----------|------|
| **Client** | E1 → E2 (stop) |
| **Consultant** | E1 → E2 → E3 → E4 + S-docs as needed |

---

## Document Control

**Status:** DRAFT - To Be Discussed

| Version | Date | Status | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-03 | Draft | Initial package (13 files) |
| 1.1.0 | 2026-02-03 | Draft | Added tenant discovery, full auto script, VSOM restructure |
| 1.2.0 | 2026-02-03 | Draft | Added architecture HLD (E3) |
| 1.3.0 | 2026-02-03 | Draft | Reorganised with Essential/Supporting structure |
| 1.4.0 | 2026-02-03 | Draft | Added Azure WAF + CAF framework references |
