# pfc-qvf-grc-value — Unified Cyber Value Equation

**Skill ID:** pfc-qvf-grc-value
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_SUPERVISED
**Feature:** F74.24b
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Aggregate the unified Cyber Value Equation from all QVF cyber economics skill outputs. Produces the single financial narrative that answers: "What is our cyber GRC programme worth?"

## Core Formula

```text
Cyber Value = Risk Reduction Value + Insurance Savings
            + Compliance Value + Operational Value
            − GRC Investment Cost

Where:
  Risk Reduction Value = ΔALE (from pfc-qvf-cyber-impact)
  Insurance Savings    = ΔPremium + ΔExcess (from pfc-qvf-cyber-insure)
  Compliance Value     = Penalties avoided + Market access
  Operational Value    = Downtime avoided + Productivity
  GRC Investment Cost  = Implementation + Tooling + People (from pfc-cost-model)
```

## Inputs

- pfc-qvf-cyber-impact: ΔALE (risk reduction value)
- pfc-qvf-cyber-insure: ΔPremium, ΔExcess, coverage delta (insurance savings)
- pfc-qvf-grc-roi: ROI, NPV, payback (investment case)
- pfc-qvf-breach-model: cost components (compliance value — penalties avoided)
- pfc-cost-model: GRC investment cost
- pfc-grc-mcsb-assess: compliance score (market access — compliance-gated contracts)

## Process

1. Collect all QVF cyber economics outputs
2. Aggregate Risk Reduction Value from ΔALE
3. Aggregate Insurance Savings from premium and excess deltas
4. Calculate Compliance Value (regulatory penalties avoided + market access)
5. Calculate Operational Value (downtime avoided + productivity gains)
6. Subtract GRC Investment Cost
7. Produce unified Cyber Value with sensitivity envelope
8. Map to VP-RRR convention: `vp:Benefit` → `rrr:Result`

## Outputs

- Unified Cyber Value (single £ figure with confidence range)
- Component breakdown (risk, insurance, compliance, operational, cost)
- Sensitivity envelope (optimistic/base/pessimistic)
- VE chain integration points (VSOM → OKR → KPI → QVF)
- VP-RRR aligned benefit statements
- `qvf:ValueModel` with complete cash flow model

## Ontology Surface

- QVF-ONT v1.0.0 (`qvf:ValueModel`, `qvf:CashFlow`, `qvf:EconomicCase`)
- VP-ONT (`vp:Benefit` → `rrr:Result` per JP-VP-RRR-001 convention)
- Cyber-Risk-ONT v1.0.0 (`cra:BusinessImpact`)
- RMF-IS27005-ONT v1.0.0 (risk treatment economics)

## Downstream Consumers

- pfc-value-calc (Tier 1 QVF — consumes as COST_AVOIDANCE cash flow)
- pfc-benefit-realisation (tracks projected vs actual cyber value)
- pfc-narrative (financial narrative for deliverables)
- pfc-slide-engine (cyber value equation slides)
- pfc-proposal-composer (client-facing proposals)
