# ALZ Assessment TDD Test Plan

**Version:** v0.1.0 (scaffold)
**Feature:** [F74.16](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Test Data Sets

| ID | Name | Description | IaC |
|---|---|---|---|
| TD-ALZ-GOLD | Gold Standard | Fully compliant LZ — all WAF pillars high, policies assigned, RBAC correct | Bicep |
| TD-ALZ-DRIFT | Drifted Gold | Gold + injected drift — policy gaps, RBAC over-permission, missing diagnostics | Bicep + drift script |
| TD-ALZ-GREENFIELD | Greenfield | Empty tenant — subscription exists, no LZ deployed | Bicep (minimal) |
| TD-ALZ-LEGACY | Legacy | Classic hub-spoke — NSGs, no Firewall, no Defender, manual RBAC | Bicep (legacy patterns) |
| TD-ALZ-MULTI | Multi-Sub | Multi-subscription, multi-region, mixed maturity | Bicep (3 subscriptions) |
| TD-ALZ-REGULATED | Regulated | Financial services / public sector — NCSC CAF, MCSB, PCI requirements | Bicep + policy packs |
| TD-ALZ-AI | AI Workloads | Azure OpenAI, Cognitive Services, ML workspace on LZ | Bicep + AI resources |

## Use Cases

| ID | Name | Test Data | Skill | Expected Outcome |
|---|---|---|---|---|
| UC-01 | WAF All Pass | TD-ALZ-GOLD | waf | All pillars > 90% |
| UC-02 | WAF Gap Detection | TD-ALZ-DRIFT | waf | Security + OpEx flag gaps |
| UC-03 | CAF Zero State | TD-ALZ-GREENFIELD | caf | Readiness < 20%, full roadmap |
| UC-04 | CAF Legacy | TD-ALZ-LEGACY | caf | Readiness 40-60%, migration roadmap |
| UC-05 | Cyber Compliant | TD-ALZ-GOLD | cyber | MCSB > 85%, no critical |
| UC-06 | Cyber Gaps | TD-ALZ-DRIFT | cyber | Critical RBAC + NSG findings |
| UC-07 | ALZ Pass | TD-ALZ-GOLD | health | No drift, all pass |
| UC-08 | ALZ Drift | TD-ALZ-DRIFT | health | Drift detected, remediation tasks |
| UC-09 | Cross-Framework | TD-ALZ-DRIFT | all | Single finding → WAF + CAF + NCSC + MCSB |
| UC-10 | Backcasting | TD-ALZ-LEGACY + VE | all | Backcasted 4-phase roadmap |
| UC-11 | Multi-Sub | TD-ALZ-MULTI | health | Per-sub + aggregated scores |
| UC-12 | Regulatory | TD-ALZ-REGULATED | cyber | NCSC CAF outcomes mapped |
| UC-13 | AI Workloads | TD-ALZ-AI | cyber | EA-AI-ONT findings, RAI controls |
| UC-14 | VE Priority | TD-ALZ-DRIFT × 2 VE | all | Different prioritisation per VE profile |
| UC-15 | End-to-End | TD-ALZ-LEGACY + VE | all | Full pipeline: extract → report |

## Assertion Types

| Type | What It Checks |
|---|---|
| Score Range | Pillar/domain score within expected range |
| Finding Count | Expected number of findings per category |
| Cross-Ref | Each finding has required cross-framework references |
| RMF Rating | Critical findings have RMF risk statements |
| Roadmap Structure | Backcasted roadmap has 4 phases with projected scores |
| Evidence | Evidence pack contains required artefacts |
| Ontology Mapping | Every finding maps to at least one ontology entity |

## TDD Cycle

```text
RED:    Define UC with expected output → run → fails (skill not implemented)
GREEN:  Implement skill logic → run → passes
REFACTOR: Optimise MCP call sequence, scoring model, ontology mapping
LOCK:   Snapshot golden output → add to regression suite
```

## Dependencies

- Azure sandbox tenant (provisioning TBD)
- Bicep modules for test data deployment (Epic 33 F33.2, F33.3)
- azure-skills MCP Server access
- Assertion framework (to be built — vitest or custom)
