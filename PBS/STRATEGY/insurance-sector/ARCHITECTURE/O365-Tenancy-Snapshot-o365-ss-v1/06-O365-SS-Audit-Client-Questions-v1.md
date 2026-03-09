# O365 Tenancy Snapshot Audit
## Client Supplementary Questions

**Purpose:** These questions capture context that **cannot be discovered via API**. Please complete prior to the synthesis workshop.

**Client:** _________________________
**Completed By:** _________________________
**Date:** _________________________

---

## Section A: Organisation & Licensing

| # | Question | Response |
|---|----------|----------|
| A1 | Who is the business owner of the M365 environment? | |
| A2 | Who manages day-to-day M365 administration (internal/external)? | |
| A3 | Confirm current licensing tier (E1/E3/E5/F1)? | |
| A4 | Are there any add-on licences (Defender P1/P2, Compliance)? | |
| A5 | How many users are actively using M365? (confirm ~800) | |
| A6 | Are there other email/collaboration platforms in parallel? | |
| A7 | Is there an M365 roadmap or planned licence changes? | |

## Section B: Identity & Access

| # | Question | Response |
|---|----------|----------|
| B1 | Is Entra ID the primary identity provider? | ☐ Cloud-only ☐ Hybrid (AD Connect) ☐ Federated |
| B2 | Is MFA enforced for all users? | ☐ Yes ☐ No ☐ Partial (which groups?) |
| B3 | How many IT administrators have Global Admin? | |
| B4 | Is Privileged Identity Management (PIM) used? | ☐ Yes ☐ No ☐ Not licensed |
| B5 | Are Conditional Access policies actively managed? | ☐ Yes ☐ No ☐ Basic only |
| B6 | Are service accounts documented? | ☐ Yes ☐ No |
| B7 | When was the last access review conducted? | |
| B8 | Is self-service password reset enabled? | ☐ Yes ☐ No |

## Section C: Email & Communications

| # | Question | Response |
|---|----------|----------|
| C1 | Are there known mail flow rules for external forwarding? | ☐ Yes ☐ No ☐ Unknown |
| C2 | Has DKIM/DMARC been configured for all domains? | ☐ Yes ☐ No ☐ Unknown |
| C3 | Are there third-party email security tools (e.g., Mimecast, Proofpoint)? | |
| C4 | Have there been phishing incidents in the last 12 months? | ☐ Yes ☐ No |
| C5 | Is email journaling or archiving in use? | ☐ Yes ☐ No |
| C6 | Are there shared mailboxes with external access? | ☐ Yes ☐ No ☐ Unknown |

## Section D: Data Protection & Governance

| # | Question | Response |
|---|----------|----------|
| D1 | Is data classification applied (sensitivity labels)? | ☐ Yes ☐ No ☐ Planned |
| D2 | Are DLP policies configured? | ☐ Yes ☐ No ☐ Unknown |
| D3 | What types of sensitive data are stored in M365? | ☐ PII ☐ Financial ☐ Health ☐ Insurance claims ☐ Other: |
| D4 | Is external sharing from SharePoint controlled? | ☐ Restricted ☐ Open ☐ Unknown |
| D5 | Are retention policies in place? | ☐ Yes ☐ No ☐ Partial |
| D6 | Is there a data classification policy documented? | ☐ Yes ☐ No |
| D7 | Are Information Barriers required (Chinese walls)? | ☐ Yes ☐ No ☐ Under review |

## Section E: Collaboration & Teams

| # | Question | Response |
|---|----------|----------|
| E1 | Is Teams the primary collaboration platform? | ☐ Yes ☐ No (what else?) |
| E2 | Can external users join Teams meetings? | ☐ Yes ☐ Restricted ☐ Unknown |
| E3 | Are guest users actively managed? | ☐ Yes ☐ No |
| E4 | Is Teams used for client-facing communication? | ☐ Yes ☐ No |
| E5 | Are there governance controls on Team creation? | ☐ Yes ☐ No |
| E6 | Is Teams phone system (PSTN) in use? | ☐ Yes ☐ No ☐ Planned |

## Section F: Security & Compliance

| # | Question | Response |
|---|----------|----------|
| F1 | What compliance frameworks apply? | ☐ FCA ☐ PRA ☐ Lloyd's ☐ GDPR ☐ ISO 27001 ☐ Other: |
| F2 | Is there a dedicated security team for M365? | ☐ Yes ☐ No ☐ Shared with IT |
| F3 | Is Microsoft Defender for Office 365 in use? | ☐ Plan 1 ☐ Plan 2 ☐ No ☐ Unknown |
| F4 | Are security alerts actively monitored? | ☐ Yes ☐ No ☐ Ad-hoc |
| F5 | When was the last security assessment? | |
| F6 | Is there an incident response plan for M365? | ☐ Yes ☐ No ☐ In progress |
| F7 | Are audit logs retained beyond 90 days? | ☐ Yes ☐ No ☐ Unknown |
| F8 | Is the M365 environment included in SOC/SIEM? | ☐ Yes ☐ No ☐ Planned |

## Section G: Regulatory & Insurance Specific

| # | Question | Response |
|---|----------|----------|
| G1 | Does FCA SYSC 13.9 (operational resilience) apply? | ☐ Yes ☐ No ☐ Under review |
| G2 | Is M365 considered a material third-party service (PRA SS1/21)? | ☐ Yes ☐ No ☐ Unknown |
| G3 | Are there Lloyd's MS13 cyber requirements? | ☐ Yes ☐ No |
| G4 | Is there a documented exit strategy from M365? | ☐ Yes ☐ No |
| G5 | Are insurance claim documents stored in M365? | ☐ Yes ☐ No |
| G6 | Is there policyholder PII in Exchange/SharePoint? | ☐ Yes ☐ No ☐ Unknown |
| G7 | Are client-facing portals integrated with M365? | ☐ Yes ☐ No |

## Section H: Documentation Request

Please provide the following (PDF/screenshot format preferred):

| Document | Required | Received |
|----------|----------|----------|
| M365 licence allocation summary | ☐ Required | ☐ |
| Current Conditional Access policy list | ☐ If available | ☐ |
| Data classification policy | ☐ If available | ☐ |
| M365 architecture/topology diagram | ☐ If available | ☐ |
| Recent security assessment reports | ☐ If available | ☐ |
| Incident response procedures | ☐ If available | ☐ |

---

**Please return completed questionnaire to [consultant email] at least 2 business days before the scheduled workshop.**
