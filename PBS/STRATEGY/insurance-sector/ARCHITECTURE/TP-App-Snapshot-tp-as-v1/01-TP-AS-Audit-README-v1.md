# Third-Party Application Snapshot Audit Package

**Package ID:** TP-App-Snapshot-tp-as-v1
**Version:** 1.0.0
**Date:** February 2026
**Status:** DRAFT

## Package Contents

| # | Artifact | Format | Description |
|---|----------|--------|-------------|
| 01 | README | Markdown | This file |
| 02 | Vision/Strategy/Plan | Markdown | VSOM framework |
| 03 | Operating/Deployment Guide | Markdown | Step-by-step execution |
| 04 | Graph API & Discovery Queries | JSON | Automated third-party discovery queries |
| 05 | Compliance Mapping | JSON | Regulatory and framework mapping |
| 06 | Client Supplementary Questions | Markdown | Pre-workshop questionnaire |

## Context

- **Client:** Insurance sector, 800 headcount
- **Key Platform:** Acturis (primary insurance broking platform)
- **Approach:** Semi-automated discovery + structured questionnaire → 1-day synthesis workshop
- **Focus:** Third-party application portfolio, integration security, vendor risk, data flows
- **Reference:** ALZ, O365, and PP Snapshot Audit patterns

## Scope

This audit covers four interconnected assessment areas:

1. **Application Portfolio** — Enterprise application inventory, OAuth consents, SSO integrations
2. **Acturis Integration** — Primary insurance platform assessment (API, data flows, credentials, DR)
3. **Integration Security** — API management, credential handling, data transfer encryption
4. **Vendor Risk** — Third-party risk posture, contract compliance, exit strategies

## Related

- [ALZ Snapshot Audit](../ALZ-Audit-Snapshot-alz-ss-v1/) — Azure Landing Zone
- [O365 Snapshot Audit](../O365-Tenancy-Snapshot-o365-ss-v1/) — Microsoft 365 Tenancy
- [PP Data Snapshot Audit](../PP-Data-Snapshot-pp-ds-v1/) — Power Platform & Data Layer
