# Power Platform & Data Layer Snapshot Audit
## Client Supplementary Questions

**Purpose:** These questions capture context that cannot be discovered via API. Please complete prior to the synthesis workshop.

**Client:** _________________________
**Completed By:** _________________________
**Date:** _________________________

---

## Section A: Power Platform Overview

| # | Question | Response |
|---|----------|----------|
| A1 | Who is the Power Platform administrator? | |
| A2 | Is there a Power Platform Centre of Excellence (CoE)? | ☐ Yes ☐ No ☐ Planned |
| A3 | What Power Platform licensing is in place? | ☐ Per-user ☐ Per-app ☐ Developer ☐ Trial |
| A4 | How many active citizen developers (non-IT) build apps/flows? | |
| A5 | Is there a governance policy for citizen development? | ☐ Yes ☐ No ☐ Informal |
| A6 | Are Power Platform environments structured (Dev/Test/Prod)? | ☐ Yes ☐ No |
| A7 | Is the CoE Starter Kit deployed? | ☐ Yes ☐ No ☐ Unknown |

## Section B: Power Apps & Power Automate

| # | Question | Response |
|---|----------|----------|
| B1 | What are the top 5 business-critical Power Apps? | |
| B2 | Are any Power Apps used for insurance operations (quotes, claims)? | ☐ Yes ☐ No |
| B3 | Do any Power Apps connect to Acturis? | ☐ Yes ☐ No ☐ Unknown |
| B4 | Are there Power Automate flows processing insurance data? | ☐ Yes ☐ No |
| B5 | Do any flows connect to external systems via HTTP/API? | ☐ Yes ☐ No ☐ Unknown |
| B6 | Are flows used for regulatory reporting? | ☐ Yes ☐ No |
| B7 | Is there a process for app/flow decommissioning? | ☐ Yes ☐ No |
| B8 | Are desktop flows (RPA) in use? | ☐ Yes ☐ No ☐ Planned |

## Section C: Power BI & Reporting

| # | Question | Response |
|---|----------|----------|
| C1 | Who manages Power BI administration? | |
| C2 | How many active Power BI users? | |
| C3 | Is Power BI used for regulatory/board reporting? | ☐ Yes ☐ No |
| C4 | Are Power BI reports shared externally (insurers, brokers)? | ☐ Yes ☐ No |
| C5 | Is an on-premises data gateway in use? | ☐ Yes ☐ No |
| C6 | What data sources feed Power BI? | ☐ SQL ☐ Excel ☐ Acturis ☐ SharePoint ☐ Dataverse ☐ Other: |
| C7 | Is row-level security (RLS) applied to reports? | ☐ Yes ☐ No ☐ Some |
| C8 | Are there certified/promoted datasets? | ☐ Yes ☐ No |

## Section D: Data Architecture

| # | Question | Response |
|---|----------|----------|
| D1 | Is there a data architecture lead/team? | ☐ Yes ☐ No ☐ Outsourced |
| D2 | What is the primary data warehouse technology? | ☐ Azure SQL ☐ Synapse ☐ Fabric Warehouse ☐ On-prem SQL ☐ Other: |
| D3 | Is Microsoft Fabric in use or planned? | ☐ Active ☐ Trial ☐ Planned ☐ Not considered |
| D4 | Is OneLake/Lakehouse in use? | ☐ Yes ☐ No ☐ Planned |
| D5 | Is Synapse Analytics deployed? | ☐ Dedicated Pool ☐ Serverless ☐ Spark ☐ No |
| D6 | Is there a data lake (Azure Storage/ADLS Gen2)? | ☐ Yes ☐ No |
| D7 | What is the estimated total data volume? | ☐ <100GB ☐ 100GB-1TB ☐ 1TB-10TB ☐ >10TB |
| D8 | Is there a data retention/archiving policy? | ☐ Yes ☐ No |

## Section E: Data Governance

| # | Question | Response |
|---|----------|----------|
| E1 | Is there a data governance framework in place? | ☐ Yes ☐ No ☐ In progress |
| E2 | Are data stewards/owners assigned? | ☐ Yes ☐ No ☐ Informal |
| E3 | Is data classified (sensitivity levels)? | ☐ Yes ☐ No ☐ Partial |
| E4 | Is data lineage tracked? | ☐ Yes ☐ No ☐ Unknown |
| E5 | Are sensitivity labels applied to data assets? | ☐ Yes ☐ No ☐ Partial |
| E6 | Is there a master data management (MDM) approach? | ☐ Yes ☐ No |
| E7 | Is data quality monitored? | ☐ Yes ☐ No ☐ Ad-hoc |
| E8 | Is there a data catalogue or data dictionary? | ☐ Yes ☐ No ☐ Partial |

## Section F: Acturis & Third-Party Applications

| # | Question | Response |
|---|----------|----------|
| F1 | What version of Acturis is in use? | |
| F2 | Is Acturis SaaS (hosted by Acturis) or self-hosted? | ☐ SaaS ☐ Self-hosted ☐ Unknown |
| F3 | How does Acturis integrate with your M365/Azure estate? | ☐ SSO ☐ API ☐ File transfer ☐ Direct DB ☐ Manual |
| F4 | What data flows from Acturis to your data warehouse? | ☐ Policies ☐ Claims ☐ Premiums ☐ Client data ☐ Bordereaux ☐ MI |
| F5 | How frequently does data sync between Acturis and DW? | ☐ Real-time ☐ Hourly ☐ Daily ☐ Weekly ☐ Manual |
| F6 | Are Acturis API credentials stored securely (Key Vault)? | ☐ Yes ☐ No ☐ Unknown |
| F7 | Does Acturis hold policyholder PII? | ☐ Yes ☐ No |
| F8 | Does Acturis hold special category data (health/injury)? | ☐ Yes (injury claims) ☐ No ☐ Unknown |
| F9 | Is there a data processing agreement with Acturis? | ☐ Yes ☐ No ☐ Unknown |
| F10 | Does Acturis have SOC 2 / ISO 27001 certification? | ☐ Yes ☐ No ☐ Not verified |
| F11 | Is there a documented exit strategy from Acturis? | ☐ Yes ☐ No |
| F12 | Is Acturis DR/BC aligned with your DR plans? | ☐ Yes ☐ No ☐ Unknown |

### Other Third-Party Applications

| # | Application Name | Purpose | Integration Method | Data Types |
|---|-----------------|---------|-------------------|------------|
| F13 | | | | |
| F14 | | | | |
| F15 | | | | |
| F16 | | | | |
| F17 | | | | |

**Common insurance third-party systems to consider:**
- Insurer portals (Aviva, AXA, Allianz, etc.)
- Lloyd's systems (PPL, Vitesse, Crystal)
- Claims management systems
- Accounting software (Sage, Xero)
- Document management (iManage, NetDocuments)
- HR/Payroll systems
- CRM (Salesforce, Dynamics)

## Section G: Integration & APIs

| # | Question | Response |
|---|----------|----------|
| G1 | Is Azure API Management (APIM) deployed? | ☐ Yes ☐ No |
| G2 | Are there Azure Logic Apps handling integrations? | ☐ Yes ☐ No |
| G3 | Are Azure Functions used for data processing? | ☐ Yes ☐ No |
| G4 | Is there SFTP/FTP file exchange with external parties? | ☐ Yes ☐ No |
| G5 | Are integration credentials rotated regularly? | ☐ Yes ☐ No ☐ Unknown |
| G6 | Is there API monitoring/logging? | ☐ Yes ☐ No |
| G7 | Are data transfers encrypted in transit? | ☐ Yes ☐ No ☐ Unknown |

## Section H: Regulatory & Insurance Specific

| # | Question | Response |
|---|----------|----------|
| H1 | Is Power Platform/Fabric in scope for FCA operational resilience? | ☐ Yes ☐ No ☐ Under review |
| H2 | Is Acturis classified as a material third party (PRA SS1/21)? | ☐ Yes ☐ No ☐ Unknown |
| H3 | Are there Lloyd's reporting requirements met via Power BI/DW? | ☐ Yes ☐ No |
| H4 | Is insurance data subject to UK data residency requirements? | ☐ Yes ☐ No ☐ Under review |
| H5 | Are actuarial models running on Azure/Fabric? | ☐ Yes ☐ No |
| H6 | Is Solvency II reporting generated from the data warehouse? | ☐ Yes ☐ No |
| H7 | Are bordereaux generated automatically from the DW? | ☐ Yes ☐ No ☐ Manual |
| H8 | Is DORA (2027) on the compliance roadmap? | ☐ Yes ☐ No ☐ Unknown |

## Section I: Documentation Request

| Document | Required | Received |
|----------|----------|----------|
| Data architecture diagram | ☐ Required | ☐ |
| Acturis integration documentation | ☐ Required | ☐ |
| DLP policy documentation | ☐ If available | ☐ |
| Data governance policy | ☐ If available | ☐ |
| Third-party application register | ☐ If available | ☐ |
| Data classification policy | ☐ If available | ☐ |
| Power BI governance policy | ☐ If available | ☐ |
| DR/BC plans (data layer) | ☐ If available | ☐ |

---

**Please return completed questionnaire to [consultant email] at least 2 business days before the scheduled workshop.**
