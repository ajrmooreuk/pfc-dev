# Third-Party Application Snapshot Audit
## Client Supplementary Questions

**Purpose:** These questions capture context that **cannot be discovered via API**. Please complete prior to the synthesis workshop.

**Client:** _________________________
**Completed By:** _________________________
**Date:** _________________________

---

## Section A: Third-Party Application Overview

| # | Question | Response |
|---|----------|----------|
| A1 | Is there a formal third-party application register? | ☐ Yes ☐ No ☐ Partial |
| A2 | How many third-party applications are in use? | |
| A3 | Who is responsible for third-party vendor management? | |
| A4 | Is there a vendor onboarding/approval process? | ☐ Yes ☐ No ☐ Informal |
| A5 | Are third-party applications reviewed annually? | ☐ Yes ☐ No |
| A6 | Is there a process for decommissioning third-party apps? | ☐ Yes ☐ No |
| A7 | Has the organisation experienced a third-party security incident? | ☐ Yes ☐ No |

## Section B: Acturis (Primary Insurance Platform)

| # | Question | Response |
|---|----------|----------|
| B1 | What version of Acturis is in use? | |
| B2 | Is Acturis SaaS (hosted by Acturis) or self-hosted? | ☐ SaaS ☐ Self-hosted ☐ Unknown |
| B3 | Who is the Acturis system owner / business sponsor? | |
| B4 | How many users access Acturis? | |
| B5 | How does Acturis authenticate users? | ☐ SSO (SAML/OIDC) ☐ Acturis credentials ☐ Both |
| B6 | How does Acturis integrate with your Azure/M365 estate? | ☐ SSO ☐ API ☐ File transfer ☐ Direct DB ☐ Manual export |
| B7 | What API endpoints are used for Acturis integration? | |
| B8 | Where are Acturis API credentials stored? | ☐ Azure Key Vault ☐ App config ☐ Environment variables ☐ Unknown |
| B9 | How frequently are Acturis API credentials rotated? | ☐ 90 days ☐ Annually ☐ Never ☐ Unknown |
| B10 | What data flows from Acturis to your data warehouse? | ☐ Policies ☐ Claims ☐ Premiums ☐ Client data ☐ Bordereaux ☐ MI |
| B11 | How frequently does data sync between Acturis and your systems? | ☐ Real-time ☐ Hourly ☐ Daily ☐ Weekly ☐ Manual |
| B12 | Does Acturis hold policyholder PII? | ☐ Yes ☐ No |
| B13 | Does Acturis hold special category data (health/injury claims)? | ☐ Yes ☐ No ☐ Unknown |
| B14 | Is there a data processing agreement (DPA) with Acturis? | ☐ Yes ☐ No ☐ Unknown |
| B15 | Has Acturis provided SOC 2 / ISO 27001 certification? | ☐ Yes ☐ No ☐ Not requested |
| B16 | Has Acturis disclosed their sub-processors? | ☐ Yes ☐ No ☐ Not requested |
| B17 | Is Acturis data confirmed as UK-resident? | ☐ Yes ☐ No ☐ Unknown |
| B18 | Is there a documented exit strategy from Acturis? | ☐ Yes ☐ No |
| B19 | Is Acturis DR/BC aligned with your organisation's DR plans? | ☐ Yes ☐ No ☐ Unknown |
| B20 | What is the Acturis incident notification SLA? | ☐ <4 hours ☐ <24 hours ☐ No SLA ☐ Unknown |
| B21 | When was the last Acturis contract review? | |
| B22 | Are there known pain points with the Acturis integration? | |

## Section C: Insurer Portal Integrations

| # | Question | Response |
|---|----------|----------|
| C1 | Which insurer portals does the organisation use? | |
| C2 | How do staff access insurer portals? | ☐ Individual logins ☐ Shared logins ☐ SSO ☐ API |
| C3 | Are insurer portal credentials managed centrally? | ☐ Yes ☐ No ☐ Partially |
| C4 | Are bordereaux submitted electronically? | ☐ Yes (automated) ☐ Yes (manual upload) ☐ Email |
| C5 | Is there EDI connectivity to Lloyd's or insurers? | ☐ Yes ☐ No ☐ Via Acturis |
| C6 | Are there file-based data exchanges (SFTP, email attachments)? | ☐ Yes ☐ No |
| C7 | Is data from insurer portals ingested into your data warehouse? | ☐ Yes ☐ No |

## Section D: Other Third-Party Applications

Please list all significant third-party applications:

| # | Application Name | Vendor | Purpose | Integration Method | Data Types | SSO? |
|---|-----------------|--------|---------|-------------------|------------|------|
| D1 | | | | ☐ API ☐ SSO ☐ File ☐ Manual | | ☐ Y ☐ N |
| D2 | | | | ☐ API ☐ SSO ☐ File ☐ Manual | | ☐ Y ☐ N |
| D3 | | | | ☐ API ☐ SSO ☐ File ☐ Manual | | ☐ Y ☐ N |
| D4 | | | | ☐ API ☐ SSO ☐ File ☐ Manual | | ☐ Y ☐ N |
| D5 | | | | ☐ API ☐ SSO ☐ File ☐ Manual | | ☐ Y ☐ N |
| D6 | | | | ☐ API ☐ SSO ☐ File ☐ Manual | | ☐ Y ☐ N |
| D7 | | | | ☐ API ☐ SSO ☐ File ☐ Manual | | ☐ Y ☐ N |
| D8 | | | | ☐ API ☐ SSO ☐ File ☐ Manual | | ☐ Y ☐ N |
| D9 | | | | ☐ API ☐ SSO ☐ File ☐ Manual | | ☐ Y ☐ N |
| D10 | | | | ☐ API ☐ SSO ☐ File ☐ Manual | | ☐ Y ☐ N |

**Common insurance third-party systems to consider:**
- Insurer portals (Aviva, AXA, Allianz, RSA, Zurich, etc.)
- Lloyd's systems (PPL, Vitesse, Crystal)
- Claims management systems (Guidewire, ClaimCenter)
- Accounting / finance (Sage, Xero, QuickBooks)
- Document management (iManage, NetDocuments)
- HR / Payroll (ADP, Sage HR, BambooHR)
- CRM (Salesforce, Dynamics 365)
- Compliance / RegTech (ComplyAdvantage, Onfido, SmartSearch)
- Email security (Mimecast, Proofpoint)
- Cyber risk tools (BitSight, SecurityScorecard)
- Actuarial tools (Emblem, ResQ)

## Section E: Integration & API Management

| # | Question | Response |
|---|----------|----------|
| E1 | Is Azure API Management (APIM) deployed? | ☐ Yes ☐ No |
| E2 | Are Azure Logic Apps used for third-party integrations? | ☐ Yes ☐ No |
| E3 | Are Azure Functions used for data processing or integration? | ☐ Yes ☐ No |
| E4 | Are Power Automate flows used for third-party integration? | ☐ Yes ☐ No |
| E5 | Is there SFTP/FTP file exchange with external parties? | ☐ Yes ☐ No |
| E6 | Are integration credentials stored in Azure Key Vault? | ☐ All ☐ Some ☐ None ☐ Unknown |
| E7 | Are credentials rotated on a regular schedule? | ☐ Yes ☐ No ☐ Varies |
| E8 | Is there API monitoring and logging? | ☐ Yes ☐ No ☐ Partial |
| E9 | Are data transfers to third parties encrypted in transit? | ☐ Yes ☐ No ☐ Unknown |
| E10 | Is there a VPN or ExpressRoute for any third-party connectivity? | ☐ Yes ☐ No |

## Section F: Credential & Identity Management

| # | Question | Response |
|---|----------|----------|
| F1 | Are service accounts documented and owned? | ☐ Yes ☐ No ☐ Partial |
| F2 | Are service account passwords rotated? | ☐ Quarterly ☐ Annually ☐ Never ☐ Varies |
| F3 | Are managed identities used where possible? | ☐ Yes ☐ No ☐ Some |
| F4 | Is certificate-based authentication used for any integrations? | ☐ Yes ☐ No |
| F5 | Has there been a credential audit in the last 12 months? | ☐ Yes ☐ No |
| F6 | Are there known hard-coded credentials in application configs? | ☐ Yes ☐ No ☐ Unknown |
| F7 | Who can create app registrations in Entra ID? | ☐ Admins only ☐ All users ☐ Unknown |
| F8 | Is user consent to third-party apps restricted? | ☐ Admin consent only ☐ Users can consent ☐ Unknown |

## Section G: Vendor Risk & Compliance

| # | Question | Response |
|---|----------|----------|
| G1 | Is there a formal vendor risk management policy? | ☐ Yes ☐ No ☐ In development |
| G2 | Are critical vendors assessed for security certifications? | ☐ Yes (SOC 2/ISO) ☐ No ☐ Ad-hoc |
| G3 | Do all data-processing vendors have a DPA? | ☐ Yes ☐ No ☐ Some |
| G4 | Are vendor sub-processors tracked? | ☐ Yes ☐ No ☐ Unknown |
| G5 | Is vendor data residency confirmed (UK/EEA)? | ☐ Yes ☐ No ☐ Some |
| G6 | Are vendor exit strategies documented? | ☐ Yes ☐ No ☐ For critical vendors only |
| G7 | Is vendor DR/BC alignment reviewed? | ☐ Yes ☐ No |
| G8 | Is there a vendor incident notification process? | ☐ Yes ☐ No ☐ Informal |
| G9 | Are vendor access rights reviewed periodically? | ☐ Yes ☐ No |

## Section H: Regulatory & Insurance Specific

| # | Question | Response |
|---|----------|----------|
| H1 | Is Acturis classified as a material third party (PRA SS1/21)? | ☐ Yes ☐ No ☐ Under review |
| H2 | Are third-party dependencies mapped for FCA operational resilience? | ☐ Yes ☐ No ☐ In progress |
| H3 | Is a DORA ICT third-party register being prepared? | ☐ Yes ☐ No ☐ Unknown |
| H4 | Are concentration risks identified (single vendor dependencies)? | ☐ Yes ☐ No |
| H5 | Is there a supply chain security assessment process? | ☐ Yes ☐ No |
| H6 | Are Lloyd's MS13 cyber requirements applied to vendor access? | ☐ Yes ☐ No ☐ N/A |
| H7 | Is there cyber liability insurance covering third-party breaches? | ☐ Yes ☐ No ☐ Unknown |
| H8 | Are third-party service level agreements monitored? | ☐ Yes ☐ No ☐ Informal |

## Section I: Documentation Request

| Document | Required | Received |
|----------|----------|----------|
| Third-party application register | ☐ Required | ☐ |
| Acturis integration documentation (API specs, data flows) | ☐ Required | ☐ |
| Acturis contract / DPA | ☐ Required | ☐ |
| Acturis SOC 2 / ISO 27001 certificate | ☐ Required | ☐ |
| Vendor risk management policy | ☐ If available | ☐ |
| Data flow diagrams (third-party integration) | ☐ If available | ☐ |
| API documentation / architecture diagram | ☐ If available | ☐ |
| Key Vault access policies | ☐ If available | ☐ |
| Service account register | ☐ If available | ☐ |
| Vendor security assessment template | ☐ If available | ☐ |
| DR/BC plans (Acturis-related) | ☐ If available | ☐ |

---

**Please return completed questionnaire to [consultant email] at least 2 business days before the scheduled workshop.**
