# pfc-hcr-analyse — Cross-Domain Finding Analysis & Correlation

**Skill ID:** pfc-hcr-analyse
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_AUTONOMOUS
**Feature:** F74.25b
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Deep cross-domain analysis of assessment findings — correlates findings across WAF, CAF, MCSB, OWASP, and AZALZ frameworks to identify systemic patterns, root causes, and amplification chains where a single weakness creates cascading risk.

## Inputs

- pfc-alz-assess-waf findings (5 WAF pillars)
- pfc-alz-assess-caf findings (CAF readiness areas)
- pfc-alz-assess-cyber findings (MCSB 12 domains + OWASP)
- pfc-alz-assess-health findings (AZALZ drift, configuration)
- Three-state scoring model data (current/desired/best practice per domain)
- RMF risk scores per finding

## Process

1. Normalise findings to common `hcr:Finding` format
2. Cross-reference: find findings that affect multiple frameworks
   - e.g., missing MFA → WAF Security pillar + MCSB IM domain + CAF readiness gap
3. Identify systemic patterns:
   - Governance root causes (policy gaps → multiple downstream findings)
   - Identity root causes (RBAC over-permission → security + compliance findings)
   - Monitoring blind spots (logging gaps → undetectable threats)
4. Calculate amplification chains (single finding → cascading risk score)
5. Cluster findings by root cause for efficient remediation
6. Produce systemic pattern report and correlation matrix

## Correlation Types

| Correlation | Example | Impact |
|---|---|---|
| **Same control, multiple frameworks** | NSG misconfiguration → WAF Security + MCSB NS + AZALZ topology | Single fix, multiple score improvements |
| **Root cause chain** | No Azure Policy → no naming standard → no tagging → no cost allocation | Fix root (policy) to resolve cascade |
| **Amplification** | Missing logging + missing alerting + missing DR → undetectable catastrophic failure | Compound risk far exceeds individual scores |
| **Regulatory intersection** | PII exposure → GDPR Art 83 fine + MCSB DP domain fail + NCSC CAF gap | Regulatory multiplier on risk score |

## Outputs

- Cross-correlated findings (deduplicated, root-cause linked)
- Systemic pattern report (governance, identity, monitoring clusters)
- Amplification chain analysis (compound risk identification)
- Correlation matrix (framework × framework overlap)
- Root cause recommendations (fix one, improve many)
- `hcr:Finding` entities enriched with cross-references

## Ontology Surface

- HCR-ONT v1.0.0 (`hcr:Finding`, `hcr:ReportSection`)
- MCSB-ONT v2.0.0, EA-MSFT-ONT (WAF), AZALZ-ONT, NCSC-CAF-ONT
- RMF-IS27005-ONT v1.0.0 (risk amplification)

## Downstream Consumers

- pfc-hcr-compose (enriched findings for report assembly)
- pfc-hcr-roadmap (root-cause clustering for efficient phasing)
- pfc-hcr-dashboard (correlation views)
