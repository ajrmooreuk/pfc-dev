# Team Briefing: VSOM Strategy Analysis (VSOM-SA) Expansion

**Date:** 2026-02-13
**Author:** Azlan EA-AAA
**Audience:** Engineering, strategy consultants, AI agent developers, stakeholders
**Status:** Implemented — 5 ontologies compliant at OAA v6.1.0
**Related:** VE-Series, ont-registry-index.json v6.0.0, Epic 9C (#136), [DESIGN-SYSTEM-SPEC.md](../../../../TOOLS/ontology-visualiser/DESIGN-SYSTEM-SPEC.md)

---

## 1. What Is VSOM-SA?

VSOM-SA (Strategy Analysis) is a **sub-series of VE-Series** that adds 5 strategic analysis ontologies layered on top of the existing VSOM spine. It transforms VSOM from a strategy *definition* framework into a full strategy *analysis and execution* system.

**Before VSOM-SA:** VSOM defines Vision, Strategy, Objectives, Metrics, and Review Cycle — but the *how* of strategic analysis was implicit. There was no structured way to represent a PESTEL scan, a BCG matrix, a balanced scorecard, or a hypothesis-driven reasoning chain.

**After VSOM-SA:** The five new ontologies provide formal, machine-readable representations for the most widely-used strategic analysis frameworks. An AI agent can now traverse from macro environmental scanning through industry analysis, organisational alignment, analytical reasoning, and portfolio execution — all linked to the VSOM spine.

---

## 2. The Five-Layer Architecture

VSOM-SA follows a concentric layer model. Each layer addresses a different scope and time horizon, and each feeds into specific VSOM components.

```
┌─────────────────────────────────────────────────────────────┐
│  L1: MACRO (PESTEL, Scenarios, Futures Funnel, Backcasting) │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  L2: INDUSTRY (Porter 5F, SWOT/TOWS, Ansoff Growth)  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  L3: BSC (Balanced Scorecard, Strategy Maps,    │  │  │
│  │  │       Stakeholder, Value Chain, Lifecycle)       │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │  L4: REASON (MECE, Logic Trees,           │  │  │  │
│  │  │  │       Hypothesis-Driven, Synthesis)        │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  L5: PORTFOLIO (BCG, Three Horizons,│  │  │  │  │
│  │  │  │  │       Investment Maps, Strategic     │  │  │  │  │
│  │  │  │  │       Lens, Direction Summary)       │  │  │  │  │
│  │  │  │  └─────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                    VSOM = SPINE
          (Vision, Strategy, Objectives,
           Metrics, Review Cycle)
```

---

## 3. Layer-by-Layer Summary

### Layer 1: MACRO-ONT (mac:)
**Prefix:** `mac:` | **Frameworks:** PESTEL, Scenario Planning, Futures Funnel, Backcasting

**What it does:** Outermost strategic analysis layer. Scans the macro environment (political, economic, social, technological, environmental, legal), builds plausible future scenarios, stress-tests strategies against those scenarios, and reverse-engineers from a desired future back to present milestones.

**Key entities:**
| Entity | Purpose |
|--------|---------|
| PESTELAnalysis | Structured environmental scan across 6 macro dimensions |
| PESTELFactor | Individual factor with impact/probability scoring |
| ScenarioSet | Collection of 3-5 plausible futures on a 2x2 uncertainty matrix |
| Scenario | Single plausible future with narrative and early warning signals |
| ScenarioStrategyAssessment | Strategy-scenario effectiveness scoring for robustness |
| FuturesFunnel | Cone of plausibility: Possible → Plausible → Probable → Preferable |
| BackcastingPlan | Reverse-engineered path from desired future to present |
| BackcastMilestone | Required state on the backcasting path with target year |

**Cross-ontology bridges:**
- `mac:PESTELFactor` → `orgctx:Trend` (enriches existing org-context trends)
- `mac:ScenarioSet` → `vsom:StrategyComponent` (stress-tests VSOM strategies)
- `mac:BackcastingPlan` → `vsom:VisionComponent` (backcasts from VSOM vision)
- `mac:PESTELFactor` → `ind:SWOTFactor` (provides evidence for SWOT external factors)

**Time horizon:** 5–10+ years

---

### Layer 2: INDUSTRY-ONT (ind:)
**Prefix:** `ind:` | **Frameworks:** Porter's Five Forces, SWOT/TOWS, Ansoff Growth Matrix

**What it does:** Analyses industry structure, competitive positioning, and growth direction. Porter's identifies competitive forces, SWOT maps strengths/weaknesses/opportunities/threats with TOWS strategy generation, Ansoff defines the growth path.

**Key entities:**
| Entity | Purpose |
|--------|---------|
| PortersFiveForces | Industry structure analysis: rivalry, suppliers, buyers, substitutes, entrants |
| CompetitiveForce | Individual force with intensity scoring |
| SWOTAnalysis | Four-quadrant strategic position assessment |
| SWOTFactor | Individual factor with strategic implications and evidence |
| TOWSStrategy | Strategy generated from SWOT intersections (SO/WO/ST/WT) |
| AnsoffGrowthMatrix | 2x2 growth direction: penetration/development/diversification |
| AnsoffGrowthPath | Specific growth path with risk assessment |

**Cross-ontology bridges:**
- `ind:PortersFiveForces` → `orgctx:CompetitiveLandscape` (enriches competitive context)
- `ind:SWOTFactor(weakness)` → `ga:Gap` (SWOT weaknesses = capability gaps)
- `ind:AnsoffGrowthPath` → `vsom:StrategyComponent` (growth paths feed strategy)

**Time horizon:** 3–5 years

---

### Layer 3: BSC-ONT (bsc:)
**Prefix:** `bsc:` | **Frameworks:** Balanced Scorecard, Strategy Maps, Stakeholder Alignment, Value Chain, Lifecycle

**What it does:** Translates strategy into measurable, accountable objectives across four perspectives (Financial, Customer, Internal Process, Learning & Growth). Strategy Maps visualise cause-and-effect chains. Stakeholder alignment connects BSC to RRR executive roles.

**Key entities:**
| Entity | Purpose |
|--------|---------|
| BalancedScorecard | Container for four BSC perspectives |
| BSCPerspective | One of four perspectives with strategic alignment |
| BSCObjective | Strategic objective within a perspective |
| BSCMeasure | Measurable KPI linked to a BSC objective |
| StrategyMap | Cause-and-effect DAG linking objectives across perspectives |
| CausalLink | Directed edge representing cause-effect hypothesis |
| StakeholderAlignment | Stakeholder analysis linked to BSC and VSOM |
| StrategicValueChain | Porter-style value chain mapped to Internal Process perspective |
| LifecycleStageAnalysis | Organisation/product lifecycle with BSC implications |

**Cross-ontology bridges:**
- `bsc:BalancedScorecard` → `vsom:VSOMFramework` (BSC operationalises VSOM)
- `bsc:BSCMeasure` → `kpi:KPI` (BSC measures map to KPI metrics)
- `bsc:BSCObjective` → `okr:Objective` (BSC objectives drive OKR cascade)
- `bsc:StakeholderAssessment` → `rrr:ExecutiveRole` (stakeholders reference RRR roles)

**Time horizon:** 1–3 years

---

### Layer 4: REASON-ONT (rsn:)
**Prefix:** `rsn:` | **Frameworks:** MECE Decomposition, Logic Trees, Hypothesis-Driven Analysis, Synthesis

**What it does:** The AI agent reasoning substrate. MECE decomposes questions into mutually exclusive, collectively exhaustive branches. Logic Trees identify highest-impact levers. Hypothesis-Driven Analysis tests strategic hypotheses against evidence with anti-confirmation-bias safeguards. Synthesis detects convergent, divergent, and blind-spot findings across all analyses.

**Key entities:**
| Entity | Purpose |
|--------|---------|
| StrategicQuestion | Root question driving an analysis tree |
| MECETree | MECE decomposition container |
| MECEBranch | Individual branch with assigned framework for parallel routing |
| StrategicHypothesis | Testable hypothesis with evidence requirements |
| HypothesisAssumption | Assumption underlying a hypothesis |
| EvidenceItem | Evidence for/against a hypothesis with direction and strength |
| LogicTree | Issue/driver/lever decomposition |
| LogicTreeNode | Node with sensitivity rank for highest-impact levers |
| AnalysisSynthesis | Cross-analysis synthesis container |
| SynthesisFinding | Individual finding (convergent/divergent/blind-spot) |
| StrategicRecommendation | Actionable recommendation with confidence and dependencies |

**Cross-ontology bridges:**
- `rsn:StrategicQuestion` → `vsom:VSOMFramework` (questions address VSOM components)
- `rsn:MECEBranch` → `ind:SWOTAnalysis` (branches route to analysis frameworks)
- `rsn:StrategicRecommendation` → `vsom:StrategyComponent` (recommendations feed back into strategy)

**Anti-confirmation-bias:** Business rules BR-RSN-007 and BR-RSN-008 enforce that hypotheses MUST include disconfirming evidence requirements and synthesis MUST flag blind spots.

**Time horizon:** Analysis-time (meta-layer — operates across all other layers)

---

### Layer 5: PORTFOLIO-ONT (pfl:)
**Prefix:** `pfl:` | **Frameworks:** BCG Growth-Share Matrix, Three Horizons, Investment Maps, Strategic Lens, Direction Summary

**What it does:** Innermost execution layer. BCG classifies products/brands/BUs into Star/CashCow/QuestionMark/Dog. Three Horizons structures innovation investment (H1 core, H2 emerging, H3 transformational). Investment Maps align budget to strategy. Strategic Lens enables AI agent zoom-in on specific portfolio elements. Direction Summary produces the executive one-pager capstone.

**Key entities:**
| Entity | Purpose |
|--------|---------|
| GrowthShareMatrix | BCG matrix — portfolio by relative market share x growth rate |
| GrowthShareEntry | Individual entity classified into BCG quadrant |
| ThreeHorizonsModel | McKinsey H1/H2/H3 innovation investment structure |
| HorizonInitiative | Initiative assigned to a specific horizon with risk and ROI |
| StrategicInvestmentMap | Budget-to-strategy alignment across strategic themes |
| InvestmentAllocation | Single allocation linking theme to budget and BSC perspective |
| PortfolioStrategicLens | AI agent zoom-in — focused view for a single portfolio element |
| StrategicDirectionSummary | Executive one-pager: where we play, how we win, what bets we make |

**Cross-ontology bridges:**
- `pfl:GrowthShareEntry` → `orgctx:Product` (BCG classifies existing products/brands)
- `pfl:InvestmentAllocation` → `vsom:StrategyComponent` (investment aligned to strategy pillars)
- `pfl:HorizonInitiative` → `ppm:Initiative` (horizon initiatives executed via PPM)
- `pfl:InvestmentAllocation` → `rrr:ExecutiveRole` (allocations owned by executive roles)
- `pfl:StrategicDirectionSummary` → `vsom:VSOMFramework` (capstone synthesises VSOM)

**Time horizon:** Quarterly to 3 years

---

## 4. How VSOM-SA Connects to Existing Ontologies

VSOM-SA does not duplicate existing entities. It **enriches** them:

```
                    ┌── MACRO ──► orgctx:Trend (enriches)
                    │             vsom:VisionComponent (feeds)
                    │
                    ├── INDUSTRY ──► orgctx:CompetitiveLandscape (enriches)
                    │                ga:Gap (SWOT weakness = gap)
                    │                vsom:StrategyComponent (feeds)
                    │
VSOM (spine) ───────┤── BSC ──► vsom:VSOMFramework (operationalises)
                    │           kpi:KPI (measures map to metrics)
                    │           okr:Objective (objectives drive OKR)
                    │           rrr:ExecutiveRole (stakeholder alignment)
                    │
                    ├── REASON ──► ALL layers (reasoning scaffolding)
                    │              vsom:StrategyComponent (recommendations)
                    │
                    └── PORTFOLIO ──► orgctx:Product (BCG classifies)
                                     ppm:Initiative (horizon execution)
                                     rrr:ExecutiveRole (investment ownership)
                                     vsom:VSOMFramework (capstone summary)
```

**Total cross-ontology bridges:** 19 relationships connecting VSOM-SA to 9 existing ontologies (VSOM, OKR, KPI, RRR, PPM, ORG-CONTEXT, GA, VP, PMF).

---

## 5. The AI Agent Traversal Model

VSOM-SA was designed for AI agent consumption. The entity structure enables a 10-step strategic analysis workflow:

| Step | Action | Layer | Creates/Updates |
|------|--------|-------|----------------|
| 1 | Context Load | Foundation | Load `orgctx:OrganizationContext` with all connected entities |
| 2 | Question Formulate | L4 | `rsn:StrategicQuestion` — classify by type and VSOM layer target |
| 3 | MECE Decompose | L4 | `rsn:MECETree` with framework-tagged branches |
| 4 | Parallel Analysis | L1-L5 | Execute framework analyses across MECE branches in parallel |
| 5 | Hypothesis Test | L4 | `rsn:StrategicHypothesis` with evidence chains |
| 6 | Scenario Stress-Test | L1 | `mac:ScenarioSet` with strategy robustness scores |
| 7 | Synthesise | L4 | `rsn:AnalysisSynthesis` with convergent/divergent findings |
| 8 | Strategy Update | VSOM | Update `vsom:VSOMFramework` with evidence chain |
| 9 | Operationalise | L3/L5 | `bsc:BalancedScorecard`, `pfl:StrategicInvestmentMap`, OKR cascade |
| 10 | Monitor | VSOM | KPI threshold breach → `vsom:StrategicReviewCycle` → loop to step 2 |

**Key design decisions:**
- `rsn:MECEBranch.assignedFramework` enables **parallel framework routing** — the agent can run PESTEL and Porter's simultaneously on different branches
- `rsn:AnalysisSynthesis` forces **cross-analysis convergence** — the agent cannot skip from analysis to recommendation without synthesis
- Business rules BR-RSN-007/008 enforce **anti-confirmation-bias** — the agent must consider disconfirming evidence
- `pfl:PortfolioStrategicLens` enables **focused zoom-in** — the agent can analyse a single product/brand/BU with all connected strategic context

---

## 6. Specialist AI Agent Roles

| Agent | Entry Point | Scope |
|-------|-------------|-------|
| Strategic Analyst | `orgctx:OrganizationContext` | Full E2E analysis (all 10 steps) |
| Portfolio Lens | `pfl:PortfolioStrategicLens` | Single product/brand/BU deep dive |
| Scenario Planner | `mac:ScenarioSet` + `mac:FuturesFunnel` | Futures analysis and strategy robustness |
| Executive Advisor | `rrr:ExecutiveRole` → `bsc:BSCPerspective` | Role-specific strategic intelligence |

---

## 7. Compliance & Validation

All 5 VSOM-SA ontologies pass full OAA v6.1.0 compliance:

| Ontology | Gates Passed | Status | Validated |
|----------|-------------|--------|-----------|
| BSC-ONT (bsc:) | 7/7 | Compliant | 2026-02-12 |
| INDUSTRY-ONT (ind:) | 7/7 | Compliant | 2026-02-12 |
| REASON-ONT (rsn:) | 7/7 | Compliant | 2026-02-12 |
| MACRO-ONT (mac:) | 7/7 | Compliant | 2026-02-12 |
| PORTFOLIO-ONT (pfl:) | 7/7 | Compliant | 2026-02-12 |

Gates: G1 (schema), G2 (entities), G2b (relationships), G2c (business rules), G3 (cross-ontology), G4 (glossary), G7 (documentation).

---

## 8. Registry & File Structure

```
ontology-library/
  VE-Series/
    VSOM-SA/
      BSC-ONT/
        Entry-ONT-BSC-001.json         (registry entry)
        bsc-ontology-v1.0.0-oaa-v6.json (full ontology)
      INDUSTRY-ONT/
        Entry-ONT-IND-001.json
        industry-ontology-v1.0.0-oaa-v6.json
      REASON-ONT/
        Entry-ONT-RSN-001.json
        reason-ontology-v1.0.0-oaa-v6.json
      MACRO-ONT/
        Entry-ONT-MAC-001.json
        macro-ontology-v1.0.0-oaa-v6.json
      PORTFOLIO-ONT/
        Entry-ONT-PFL-001.json
        portfolio-ontology-v1.0.0-oaa-v6.json
    _sketches/
      strategic-patterns-e2e-orchestration.jsonld
      strategic-patterns-layer1-macro.jsonld
      strategic-patterns-layer2-industry.jsonld
      strategic-patterns-layer3-org-bsc.jsonld
      strategic-patterns-layer4-analytical-reasoning.jsonld
      strategic-patterns-layer5-portfolio-execution.jsonld
```

The `_sketches/` directory contains the original design documents that informed the 5-layer architecture. The sketches used `sp:` (Strategic Patterns) prefix and Option B (layered) registry structure, which evolved into the VSOM-SA sub-series pattern.

---

## 9. Visualiser Integration

In the ontology visualiser:
- **Tier 0:** VE-Series node shows 11 ontologies (6 core + 5 SA)
- **Tier 1 (VE-Series):** 6 core ontology nodes + VSOM-SA grouping node (35px, "5 ontologies") + VSOM-SC placeholder (dashed border)
- **Tier 1 Sub-Series (VSOM-SA):** 5 SA ontology nodes as primary, faded VSOM context node as spine reference
- **Tier 2 (any SA ontology):** Full entity graph with cross-ontology edges to VSOM, KPI, OKR, RRR, etc.
- **Breadcrumb:** Library > VE-Series > VSOM-SA > BSC Ontology

Cross-ontology edges between SA ontologies (e.g. MACRO → INDUSTRY via `mac:PESTELFactor` → `ind:SWOTFactor`) are visible in the sub-series view, showing how the layers interconnect.

---

## 10. Future: VSOM-SC (Strategy Communication)

VSOM-SC (Strategy Communication) is a planned sibling sub-series to VSOM-SA. It will cover:
- Strategy storytelling and narrative frameworks
- Executive communication templates
- Strategy cascade communication (board → leadership → teams)

Currently registered as a placeholder with 0 ontologies. When populated, it will appear alongside VSOM-SA as a second grouping node at VE-Series Tier 1.

---

## 11. Dependencies

VSOM-SA ontologies depend on (and bridge to) these existing ontologies:

| VSOM-SA Ontology | Dependencies |
|-----------------|-------------|
| MACRO-ONT | VSOM, INDUSTRY, ORG-CONTEXT, OKR |
| INDUSTRY-ONT | VSOM, ORG-CONTEXT, GA |
| BSC-ONT | VSOM, KPI, OKR, RRR |
| REASON-ONT | VSOM, BSC, INDUSTRY, KPI, OKR |
| PORTFOLIO-ONT | VSOM, BSC, INDUSTRY, MACRO, KPI, OKR, RRR, ORG-CONTEXT, VP, PMF, PPM, EFS |

PORTFOLIO-ONT is the capstone — it has 12 imports because it touches the entire graph. This is by design: it synthesises everything into the executive one-pager.

---

## 12. Related Documents

| Document | Path | Purpose |
| -------- | ---- | ------- |
| Design System Spec | [DESIGN-SYSTEM-SPEC.md](../../../../TOOLS/ontology-visualiser/DESIGN-SYSTEM-SPEC.md) | Normative DR-* design rules, token cascade, theme modes — the authoritative design reference for the visualiser |
| Series/Sub-Series Design Strategy | [BRIEFING-Series-SubSeries-Design-Strategy.md](../../../../TOOLS/ontology-visualiser/BRIEFING-Series-SubSeries-Design-Strategy.md) | Tier model, sub-series pattern, DP-SERIES principles, DR-CONTEXT/DR-NODE-LABEL rules — how VSOM-SA renders in the graph |
| VSOM-SC Briefing | [BRIEFING-VSOM-Strategy-Communication.md](../VSOM-SC/BRIEFING-VSOM-Strategy-Communication.md) | Sibling sub-series — SC architectural patterns, communication patterns, templates/decks, SA+SC patterns map |

**How SA connects to these documents:**

- **Design System Spec** defines the visual rules that govern how SA ontology nodes, edges, and cross-references render in the visualiser (DR-GRAPH, DR-EDGE, DR-SERIES rules)
- **Design Strategy** defines the sub-series drill-through pattern: how SA's 5 ontologies appear as a grouping node at Tier 1 and drill into a sub-series view
- **SC Briefing** extends the SA pipeline: SA steps 1-10 produce analysis, SC steps 11-17 produce communications from that analysis

---

*This briefing should be read alongside the Series/Sub-Series Design Strategy briefing for visualiser-specific details on how VSOM-SA renders in the graph, and the VSOM-SC briefing for how SA analysis feeds into strategy communication.*
