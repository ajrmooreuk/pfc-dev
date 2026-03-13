# ALZ Assessment Scoring Model

**Version:** v0.1.0 (scaffold)
**Feature:** F74.2–F74.5, F74.14

---

## Three-State Scoring

Every assessment domain produces three scores:

| State | Source | Purpose |
|---|---|---|
| **Best Practice** | WAF/CAF/MCSB documentation + azure-validate reference | Benchmark ceiling |
| **Current State** | azure-skills live MCP data extraction | Measured reality |
| **Desired Destination** | VE Value Discovery (VP-ONT, OKR-ONT, KPI-ONT) | Customer's target |

## Scoring Scale

| Score | Rating | Colour | Meaning |
|---|---|---|---|
| 90–100% | Excellent | Green | At or near best practice |
| 70–89% | Good | Light Green | Minor gaps, low risk |
| 50–69% | Adequate | Amber | Significant gaps, medium risk |
| 30–49% | Poor | Orange | Critical gaps, high risk |
| 0–29% | Critical | Red | Fundamental gaps, immediate action required |

## Gap Calculation

```text
Gap to Desired = Desired Destination Score − Current State Score
Gap to Best    = Best Practice Score − Current State Score
Gap Priority   = f(VE weight, RMF risk rating, Kano classification)
```

### Priority Weighting

| Factor | Weight | Source |
|---|---|---|
| VE Value Weight | 0.40 | VP-ONT: how much does this domain matter to the customer? |
| RMF Risk Rating | 0.35 | RMF-IS27005-ONT: how risky is this gap? |
| Kano Classification | 0.25 | KANO-ONT: MUST-BE always tops the list |

**Override:** Kano MUST-BE findings are always priority regardless of weighted score (compliance floor).

## Aggregation

| Level | Method |
|---|---|
| Finding → Domain | Average of finding scores within domain |
| Domain → Assessment | Weighted average (VE weights per domain) |
| Assessment → Executive | Traffic-light summary + top 5 findings |

## Backcasting Roadmap Scoring

Each phase in the backcasted roadmap has projected scores:

```text
Phase 1 (Now + quick wins):     Current 40% → Projected 55%
Phase 2 (Transform):            55% → Projected 72%
Phase 3 (Sustain):              72% → Projected 80% = Desired Destination
Phase 4 (Optimise):             80% → Projected 90% = Near Best Practice
```

## RMF Risk Scoring (per finding)

| Dimension | Scale | Source |
|---|---|---|
| Impact | 1–5 (Negligible → Catastrophic) | RMF-IS27005-ONT |
| Likelihood | 1–5 (Rare → Almost Certain) | RMF-IS27005-ONT |
| Risk Rating | Impact × Likelihood = 1–25 | Calculated |
| Risk Level | Low (1–6), Medium (7–12), High (13–18), Critical (19–25) | Threshold |
