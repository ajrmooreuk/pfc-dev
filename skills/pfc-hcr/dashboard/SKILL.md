# pfc-hcr-dashboard — Interactive Dashboard & Drill-Down

**Skill ID:** pfc-hcr-dashboard
**Version:** v0.1.0 (scaffold)
**Type:** AGENT_AUTONOMOUS
**Feature:** F74.25d
**Epic:** [Epic 74 (#1074)](https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/1074)

---

## Purpose

Generate interactive dashboard views with four-level drill-down: Executive → Domain → Finding → Evidence. Provides the living, queryable interface to the Health Check Report that updates as posture changes.

## Dashboard Hierarchy

```text
LEVEL 0: EXECUTIVE DASHBOARD (1-page)
├── Unified posture gauge (0–100%, compliance-reporter pattern)
├── Domain heatmap (RAG per domain)
├── Top 5 critical findings (sortable)
├── Risk profile radar chart (RMF aggregate)
├── Roadmap timeline (Gantt, 4 phases)
├── Cyber Value Equation summary (£ investment → £ value)
└── Trend sparklines (historical posture per domain)
    │
    ↓ CLICK domain
LEVEL 1: DOMAIN DASHBOARD
├── Three-state gauge (current / desired / best practice)
├── Findings table (sortable: severity, risk, VE priority, Kano)
├── Cross-framework correlation view
├── Domain risk heatmap (impact × likelihood)
├── Recommendations list (prioritised, effort-tagged, phase-assigned)
└── SPC control chart (if historical data available)
    │
    ↓ CLICK finding
LEVEL 2: FINDING DETAIL
├── Description, severity, control reference (MCSB/WAF/CAF/AZALZ)
├── Current state evidence (screenshot, KQL, config)
├── Desired state definition (VE/WAF/MCSB target)
├── RMF risk assessment (impact × likelihood, ALE if calculated)
├── Remediation recommendation (effort, cost, value, phase)
├── Cross-framework correlation (same finding across frameworks)
└── Evidence chain (timestamped, hash-verified, source-attributed)
    │
    ↓ CLICK evidence
LEVEL 3: EVIDENCE VIEWER
├── Raw evidence (KQL result, policy JSON, config export)
├── Extraction source (azure-skill MCP call ID)
├── Timestamp, hash, verification status
└── Audit trail (verifier, date, methodology)
```

## Visualisation Types

| View | Type | Technology | Data Source |
|---|---|---|---|
| Posture gauge | Circular gauge | compliance-reporter.js pattern | pfc-grc-posture |
| Domain heatmap | RAG grid | CSS grid + colour scale | Three-state scores |
| Risk heatmap | Impact × Likelihood matrix | SVG matrix | RMF-IS27005 scores |
| Radar chart | Multi-axis comparison | Chart.js / D3 | Domain scores |
| Gantt timeline | Phase roadmap | vis-timeline | hcr:Roadmap |
| SPC control chart | Time series + UCL/LCL | Chart.js line | pfc-grc-baseline |
| Trend sparklines | Inline mini-charts | SVG inline | Supabase historical |
| Sankey diagram | Finding → Recommendation → Phase | D3 sankey | HCR-ONT relationships |
| Financial waterfall | Cost → Value breakdown | Chart.js bar | QVF outputs |
| Correlation matrix | Framework × Framework | Heatmap grid | pfc-hcr-analyse |

## Inputs

- HCR-ONT graph instance (from pfc-hcr-compose)
- Supabase historical data (for trend views)
- pfc-grc-baseline SPC data (for control charts)
- Dashboard configuration (filters, drill path, permissions)

## Outputs

- Interactive HTML dashboard (deployable to GitHub Pages or customer-hosted)
- Dashboard configuration as `hcr:DashboardView` entities
- Export: PDF snapshots, PNG charts, CSV data extracts
- Embeddable widgets for customer portals

## Technology Stack

- vis-network v9.1.2 (graph-based views, ontology explorer)
- compliance-reporter.js patterns (gauges, bar charts)
- Supabase real-time subscriptions (live updates, Epic 59)
- Zero-build-step ES modules (consistent with visualiser architecture)

## Downstream Consumers

- pfc-slide-engine (generates slides from dashboard views)
- pfc-proposal-composer (embeds dashboard screenshots in proposals)
- Customer portal (embedded widgets)
