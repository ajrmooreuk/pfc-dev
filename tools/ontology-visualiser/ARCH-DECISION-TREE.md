# Dtree (Decision Tree) Engine & Skill Builder — Architecture

**Feature:** F40.1 (Extensibility Decision Engine) + F34.11 (Process-to-Skill Scaffolding)
**Version:** 1.0.0
**Date:** 2026-02-25

---

## 1. Overview

The Decision Tree (Dtree) Engine is an interactive hypothesis-testing engine for choosing the correct automation mechanism — Skills, Plugins, or Agents — for any given capability need. It evaluates 7 hypothesis gates with weighted criterion scoring, routing through 3 architectural layers to reach one of 13 terminal recommendations.

The Skill Builder (F34.11) extends the Dtree by bridging PE-ONT process definitions to the recommendation output, auto-scaffolding ready-to-use template artifacts (SKILL.md, agent templates, plugin manifests) with process phases mapped to workflow steps.

---

## 2. Module Dependency Graph

```mermaid
graph TD
    STATE["state.js<br/>(centralised state)"]
    DTREE["decision-tree.js<br/>(evaluation engine)"]
    SB["skill-builder.js<br/>(template scaffolding)"]
    APP["app.js<br/>(UI rendering)"]
    HTML["browser-viewer.html<br/>(DOM containers)"]

    STATE --> DTREE
    STATE --> SB
    DTREE --> SB
    STATE --> APP
    DTREE --> APP
    SB --> APP
    HTML --> APP

    style STATE fill:#1a1a2e,stroke:#3b82f6,color:#ccc
    style DTREE fill:#1a1a2e,stroke:#ef4444,color:#ccc
    style SB fill:#1a1a2e,stroke:#22c55e,color:#ccc
    style APP fill:#1a1a2e,stroke:#8b5cf6,color:#ccc
    style HTML fill:#1a1a2e,stroke:#6b7280,color:#ccc
```

| Module | Lines | Responsibility | Exports |
|--------|-------|----------------|---------|
| `state.js` | 8 new props | Centralised state for Dtree + Skill Builder | `state` object |
| `decision-tree.js` | 931 | Gate definitions, scoring engine, path traversal, vis-network graph, toolbar | 25+ functions/constants |
| `skill-builder.js` | 718 | Process signal extraction, template scaffolding, registry artifacts | 8 public functions |
| `app.js` | ~200 added | UI rendering: scoring panel, build panel, template preview | Window-exposed event handlers |

---

## 3. Decision Tree Architecture

### 3.1 Three-Layer Gate Model

The Dtree organises 7 hypothesis gates across 3 decision layers. Each layer addresses a different architectural concern:

```mermaid
graph TD
    subgraph L1["Layer 1: Capability<br/>(Is this an Agent or Skill?)"]
        HG01["HG-01<br/>Autonomy Assessment"]
        HG02["HG-02<br/>Orchestration Scope"]
    end

    subgraph L2["Layer 2: Composition<br/>(How should it be packaged?)"]
        HG03["HG-03<br/>Bundling Requirement"]
        HG04["HG-04<br/>Task Complexity"]
        HG07["HG-07<br/>Skill Enhancement"]
    end

    subgraph L3["Layer 3: Distribution<br/>(Who consumes it?)"]
        HG05["HG-05<br/>Agent Distribution"]
        HG06["HG-06<br/>User Persona"]
    end

    HG01 -->|"PASS >=7"| HG02
    HG01 -->|"PARTIAL 4-6.9"| HG03
    HG01 -->|"FAIL <4"| HG04

    HG02 -->|"PASS/PARTIAL/FAIL"| HG05
    HG03 -->|"PASS >=7"| HG06
    HG03 -->|"PARTIAL 4-6.9"| HG07
    HG04 -.->|"terminal"| R_SKILL["SKILL_*"]
    HG07 -.->|"terminal"| R_MCP["SKILL_WITH_MCP<br/>or PLUGIN_LIGHTWEIGHT"]

    HG05 -.->|"terminal"| R_AGENT["AGENT/PLUGIN+AGENT"]
    HG06 -.->|"terminal"| R_PLUGIN["PLUGIN_COWORK<br/>or PLUGIN_CLAUDECODE"]

    style L1 fill:#1c1c2e,stroke:#ef4444,color:#ccc
    style L2 fill:#1c1c2e,stroke:#3b82f6,color:#ccc
    style L3 fill:#1c1c2e,stroke:#8b5cf6,color:#ccc
```

### 3.2 Gate Routing Rules

| Gate | Layer | PASS (>=7) | PARTIAL (4-6.9) | FAIL (<4) |
|------|-------|-----------|-----------------|-----------|
| HG-01 | Capability | -> HG-02 | -> HG-03 | -> HG-04 |
| HG-02 | Capability | AGENT_ORCHESTRATOR -> HG-05 | AGENT_SPECIALIST -> HG-05 | AGENT_UTILITY -> HG-05 |
| HG-03 | Composition | -> HG-06 | -> HG-07 | SKILL_STANDALONE |
| HG-04 | Composition | SKILL_STANDALONE | SKILL_SIMPLE | NO_ACTION |
| HG-05* | Distribution | PLUGIN_COWORK_WITH_AGENT (>=8) | PLUGIN_CC_WITH_AGENT (>=6) | AGENT_STANDALONE (<6) |
| HG-06 | Distribution | PLUGIN_COWORK (>=7) | - | PLUGIN_CLAUDECODE (<7) |
| HG-07 | Composition | SKILL_WITH_MCP (>=7) | - | PLUGIN_LIGHTWEIGHT (<7) |

*HG-05 uses special 3-tier thresholds: pass_with_gui (>=8), pass_dev_only (>=6), fail (<6)

### 3.3 Gate Scoring Formula

Each gate has 4 evaluation criteria, each with a weight (2 or 3). User scores each criterion 0-10:

```
normalizedScore = sum(weight_i * score_i) / sum(weight_i * 10) * 10
```

Example (HG-01 with weights [3, 3, 2, 2] and scores [8, 6, 7, 5]):
```
weightedSum = (3*8) + (3*6) + (2*7) + (2*5) = 24 + 18 + 14 + 10 = 66
maxWeighted = (3*10) + (3*10) + (2*10) + (2*10) = 100
normalizedScore = (66 / 100) * 10 = 6.6 → PARTIAL (4 <= 6.6 < 7)
```

### 3.4 Complete Gate-to-Recommendation Flow

```mermaid
flowchart TD
    START(["Start: Define Capability Need"])

    HG01{"HG-01: Autonomy<br/>Assessment"}
    HG02{"HG-02: Orchestration<br/>Scope"}
    HG03{"HG-03: Bundling<br/>Requirement"}
    HG04{"HG-04: Task<br/>Complexity"}
    HG05{"HG-05: Agent<br/>Distribution"}
    HG06{"HG-06: User<br/>Persona"}
    HG07{"HG-07: Skill<br/>Enhancement"}

    R1["AGENT_ORCHESTRATOR"]
    R2["AGENT_SPECIALIST"]
    R3["AGENT_UTILITY"]
    R4["AGENT_STANDALONE"]
    R5["SKILL_STANDALONE"]
    R6["SKILL_SIMPLE"]
    R7["SKILL_WITH_MCP"]
    R8["PLUGIN_CLAUDECODE"]
    R9["PLUGIN_COWORK"]
    R10["PLUGIN_COWORK_WITH_AGENT"]
    R11["PLUGIN_CC_WITH_AGENT"]
    R12["PLUGIN_LIGHTWEIGHT"]
    R13["NO_ACTION"]

    START --> HG01
    HG01 -->|"PASS"| HG02
    HG01 -->|"PARTIAL"| HG03
    HG01 -->|"FAIL"| HG04

    HG02 -->|"PASS"| R1
    HG02 -->|"PARTIAL"| R2
    HG02 -->|"FAIL"| R3
    R1 --> HG05
    R2 --> HG05
    R3 --> HG05

    HG03 -->|"PASS"| HG06
    HG03 -->|"PARTIAL"| HG07
    HG03 -->|"FAIL"| R5

    HG04 -->|"PASS"| R5
    HG04 -->|"PARTIAL"| R6
    HG04 -->|"FAIL"| R13

    HG05 -->|"pass_with_gui"| R10
    HG05 -->|"pass_dev_only"| R11
    HG05 -->|"FAIL"| R4

    HG06 -->|"PASS"| R9
    HG06 -->|"FAIL"| R8

    HG07 -->|"PASS"| R7
    HG07 -->|"FAIL"| R12

    style R1 fill:#dc2626,color:#fff
    style R2 fill:#e11d48,color:#fff
    style R3 fill:#f43f5e,color:#fff
    style R4 fill:#fb7185,color:#fff
    style R5 fill:#16a34a,color:#fff
    style R6 fill:#22c55e,color:#fff
    style R7 fill:#15803d,color:#fff
    style R8 fill:#7c3aed,color:#fff
    style R9 fill:#8b5cf6,color:#fff
    style R10 fill:#6d28d9,color:#fff
    style R11 fill:#5b21b6,color:#fff
    style R12 fill:#a78bfa,color:#fff
    style R13 fill:#6b7280,color:#fff
```

### 3.5 Thirteen Terminal Recommendations

| Key | Label | Complexity | Effort | Template |
|-----|-------|-----------|--------|----------|
| `AGENT_ORCHESTRATOR` | Full Agent (Orchestrator) | High | 2-4 weeks | Agent Template v6.1 S0-S14 |
| `AGENT_SPECIALIST` | Full Agent (Specialist) | Medium-High | 1-2 weeks | Agent Template v6.1 domain-specific |
| `AGENT_UTILITY` | Full Agent (Utility) | Medium | 3-5 days | Simplified Agent (T1+S6) |
| `AGENT_STANDALONE` | Standalone Agent | Medium | 3-5 days | Agent Template (no plugin) |
| `SKILL_STANDALONE` | Standalone Skill | Low-Medium | 1-3 days | SKILL.md + YAML + scripts |
| `SKILL_SIMPLE` | Simple Skill | Low | Hours | SKILL.md frontmatter only |
| `SKILL_WITH_MCP` | Skill + MCP | Medium | 3-5 days | SKILL.md + MCP config |
| `PLUGIN_CLAUDECODE` | Claude Code Plugin | Medium-High | 1-2 weeks | plugin.json + commands/skills |
| `PLUGIN_COWORK` | Cowork Plugin | Medium-High | 1-2 weeks | plugin.json + connectors |
| `PLUGIN_COWORK_WITH_AGENT` | Cowork + Agent | High | 3-4 weeks | Agent + Plugin + Cowork UI |
| `PLUGIN_CLAUDECODE_WITH_AGENT` | CC Plugin + Agent | High | 2-3 weeks | Agent + Plugin packaging |
| `PLUGIN_LIGHTWEIGHT` | Lightweight Plugin | Low-Medium | 2-3 days | Minimal plugin.json |
| `NO_ACTION_INLINE_PROMPTING` | No Extensibility | None | None | Inline prompting guidance |

---

## 4. UI Flow — Dtree Interaction

### 4.1 View Activation

```mermaid
sequenceDiagram
    participant User
    participant Toolbar as View Toolbar
    participant App as app.js
    participant Dtree as decision-tree.js
    participant Network as vis-network
    participant Panel as Scoring Panel

    User->>Toolbar: Click "Decision Tree" view
    Toolbar->>App: setViewMode('decision-tree')
    App->>App: _switchToDecisionTreeMode()
    Note over App: Hide network, drop-zone,<br/>skeleton containers
    App->>App: _renderDecisionTreeView()
    App->>Dtree: resetDecisionTree()
    Note over Dtree: state.dtActiveGateId = 'HG-01'<br/>state.dtCompletedGates = []
    App->>Dtree: renderDecisionTreeGraph(container)
    Dtree->>Network: Create vis-network with<br/>gate + recommendation nodes
    Network-->>App: { network, nodesDataSet, edgesDataSet }
    App->>Dtree: createDTToolbar(container, callbacks)
    App->>App: _updateDTStats()
```

### 4.2 Gate Scoring Flow

```mermaid
sequenceDiagram
    participant User
    participant Graph as vis-network Graph
    participant App as app.js
    participant Panel as Scoring Panel
    participant Dtree as decision-tree.js

    User->>Graph: Click active gate node (HG-01)
    Graph->>App: onSelectNode({ _type: 'gate', id: 'HG-01' })
    App->>App: _openDTScoringPanel('HG-01')
    App->>App: _renderDTScoringContent('HG-01', false)
    Note over Panel: Renders: hypothesis, 4 criterion<br/>sliders (0-10), live score bar,<br/>pass/partial/fail badge

    loop Adjust Scores
        User->>Panel: Drag criterion slider
        Panel->>Dtree: calculateNormalizedScore(gate, scores)
        Panel->>Dtree: determineOutcome(gate, score)
        Panel->>Panel: Update score bar + badge in real-time
    end

    User->>Panel: Click "Evaluate & Continue"
    Panel->>Dtree: advanceGate()
    Note over Dtree: 1. evaluateGate(gate, scores)<br/>2. Push to dtCompletedGates<br/>3. Set next dtActiveGateId<br/>   or dtFinalRecommendation
    Dtree-->>App: { normalizedScore, outcome, nextTarget }
    App->>Dtree: refreshDecisionTreeHighlighting()
    Note over Graph: Completed gates turn<br/>green/yellow/red

    alt Next gate exists
        App->>App: _openDTScoringPanel(nextGateId)
    else Final recommendation reached
        App->>App: _showDTRecommendation(recKey)
    end
```

### 4.3 Recommendation Card

When the Dtree reaches a terminal recommendation, the scoring panel shows:

```
+---------------------------------------------+
| [Gate breadcrumb: HG-01 -> HG-02 -> REC]   |
|                                              |
| AGENT_ORCHESTRATOR                           |
| Full Agent (Orchestrator Tier)               |
| Autonomous agent with sub-agent              |
| coordination, workflow state...              |
|                                              |
| Complexity: High    Effort: 2-4 weeks        |
| Template: Full Agent Template v6.1            |
|                                              |
| [Export Decision Record (JSON-LD)]            |
| [Export Mermaid Path]                         |
| [Build from Process]  <-- F34.11             |
| [Close]                                      |
+---------------------------------------------+
```

### 4.4 State Properties (decision-tree)

```javascript
// Dtree state in state.js
dtActiveGateId: 'HG-01',      // Currently scoring gate
dtCompletedGates: [],          // [{gateId, scores[], normalizedScore, outcome}]
dtPath: ['HG-01'],             // Ordered gate IDs traversed
dtFinalRecommendation: null,   // Terminal recommendation key
dtAllScores: {},               // {gateId: [s0,s1,s2,s3]}
dtScoringPanelOpen: false,     // Panel visibility
dtProblemStatement: '',        // User's capability description
dtEvaluator: '',               // Who ran the evaluation
```

---

## 5. Skill Builder Architecture (F34.11)

### 5.1 Pipeline

```mermaid
flowchart LR
    PE["PE Process<br/>Definition"]
    SIG["Extract Process<br/>Signals"]
    DTREE["Dtree<br/>Recommendation"]
    MAP["Map Phases/<br/>Agents/Gates"]
    SCAFFOLD["Template<br/>Scaffold"]
    OUT["Output Artifacts"]

    PE --> SIG
    SIG -->|"Auto-score<br/>suggestions"| DTREE
    DTREE -->|"recKey"| MAP
    PE --> MAP
    MAP --> SCAFFOLD
    SCAFFOLD --> OUT

    OUT --> MD["SKILL.md"]
    OUT --> JSONLD["JSON-LD<br/>Registry Artifact"]
    OUT --> MANIFEST["plugin.json<br/>manifest"]
    OUT --> MERMAID["Workflow<br/>Mermaid"]

    style PE fill:#1a1a2e,stroke:#3b82f6,color:#ccc
    style SIG fill:#1a1a2e,stroke:#22c55e,color:#ccc
    style DTREE fill:#1a1a2e,stroke:#ef4444,color:#ccc
    style SCAFFOLD fill:#1a1a2e,stroke:#8b5cf6,color:#ccc
```

### 5.2 Process Signal Extraction

`extractProcessSignals()` maps PE process characteristics to Dtree criterion scores for all 7 gates:

| PE Process Field | Gate | Criterion | Score Heuristic |
|------------------|------|-----------|-----------------|
| `automationLevel` (0-100%) | HG-01 | C0 (ambiguity) | >50 → `round(level/10)`, else `round(level/15)` |
| `AIAgent[].autonomyLevel` | HG-01 | C1 (decisions) | highly-auto=9, hybrid=7, supervised=5, manual=2 |
| `processType` | HG-01 | C2 (state) | discovery/optimization=7, analysis=6, governance=5, development=4, deployment=3 |
| `AIAgent[].length` | HG-01 | C3 (coordinates) | >2 agents=8, >0=5, 0=1 |
| `ProcessPhase[].parallelExecution` | HG-02 | C1 (parallel) | any parallel=7, else=3 |
| `ProcessGate[].automated` | HG-04 | C3 (quality) | automated gates=8, else=4 |
| `ProcessPattern[].length` | HG-04 | C2 (repeatable) | patterns exist=8, else=3 |

### 5.3 Template Scaffolding — PE-to-Skill Mapping

The core mapping logic shared across all 12 scaffold generators:

```mermaid
graph TD
    subgraph PE["PE-ONT Entities"]
        PROC["pe:Process"]
        PHASE["pe:ProcessPhase"]
        GATE["pe:ProcessGate"]
        AGENT["pe:AIAgent"]
        ART["pe:ProcessArtifact"]
        MET["pe:ProcessMetric"]
        PAT["pe:ProcessPattern"]
    end

    subgraph SKILL["Skill/Agent Template"]
        FRONT["YAML Frontmatter"]
        SEC["Workflow Section"]
        QC["Quality Checkpoint"]
        CAP["Agent Capability"]
        OUTPUT["Expected Output"]
        METRIC["Success Metric"]
        BP["Best Practice"]
    end

    PROC -->|"processName, objective"| FRONT
    PHASE -->|"phaseName, activities"| SEC
    PHASE -->|"entryConditions"| SEC
    PHASE -->|"exitConditions"| SEC
    GATE -->|"criteria, threshold"| QC
    AGENT -->|"type, autonomy, model"| CAP
    ART -->|"name, type, format"| OUTPUT
    MET -->|"target, unit, frequency"| METRIC
    PAT -->|"context, problem, solution"| BP

    style PE fill:#1a1a2e,stroke:#3b82f6,color:#ccc
    style SKILL fill:#1a1a2e,stroke:#22c55e,color:#ccc
```

### 5.4 Scaffold Dispatch Map

```javascript
SCAFFOLD_MAP = {
  SKILL_SIMPLE:                   scaffoldSkillSimple,
  SKILL_STANDALONE:               scaffoldSkillStandalone,
  SKILL_WITH_MCP:                 scaffoldSkillWithMcp,
  AGENT_UTILITY:                  scaffoldAgentUtility,
  AGENT_SPECIALIST:               scaffoldAgentSpecialist,
  AGENT_ORCHESTRATOR:             scaffoldAgentOrchestrator,
  AGENT_STANDALONE:               scaffoldAgentStandalone,
  PLUGIN_LIGHTWEIGHT:             scaffoldPluginLightweight,
  PLUGIN_CLAUDECODE:              scaffoldPluginClaudeCode,
  PLUGIN_COWORK:                  scaffoldPluginCowork,
  PLUGIN_CLAUDECODE_WITH_AGENT:   scaffoldPluginCCAgent,
  PLUGIN_COWORK_WITH_AGENT:       scaffoldPluginCoworkAgent,
  NO_ACTION_INLINE_PROMPTING:     scaffoldNoAction,
}
```

Each generator returns `{ markdown: string, jsonld: object|null, manifest: object|null }`.

### 5.5 Build Panel UI Flow

```mermaid
sequenceDiagram
    participant User
    participant RecCard as Recommendation Card
    participant BuildPanel as Skill Build Panel
    participant SB as skill-builder.js
    participant Preview as Template Preview Modal

    User->>RecCard: Click "Build from Process"
    RecCard->>BuildPanel: _openSkillBuildPanel(recKey)
    Note over BuildPanel: Shows recommendation card +<br/>process dropdown + output format

    User->>BuildPanel: Select PE process from dropdown
    BuildPanel->>BuildPanel: _onSkillBuilderProcessChange(recKey)
    BuildPanel->>SB: extractProcessEntities(templateData)
    Note over BuildPanel: Renders checkboxes for:<br/>- Phase mapping (toggle include/skip)<br/>- Agent capabilities<br/>- Quality gates

    User->>BuildPanel: Toggle phases/agents/gates
    User->>BuildPanel: Select output format

    User->>BuildPanel: Click "Generate Template"
    BuildPanel->>SB: scaffoldFromRecommendation(recKey, process, ...)
    SB-->>BuildPanel: { markdown, jsonld, manifest }

    BuildPanel->>Preview: _showTemplatePreview(scaffold)
    Note over Preview: Rendered markdown preview +<br/>download buttons

    User->>Preview: Click "Download SKILL.md"
    Preview->>Preview: _downloadFile(markdown, 'SKILL.md')
```

### 5.6 Skill Builder State Properties

```javascript
// Skill Builder state in state.js
skillBuilderOpen: false,              // Build panel visibility
skillBuilderSelectedProcess: null,    // Selected PE process entity ID
skillBuilderPhaseMap: [],             // [{phaseId, included, sectionNumber}]
skillBuilderAgentMap: [],             // [{agentId, included}]
skillBuilderGateMap: [],              // [{gateId, included}]
skillBuilderOutputFormat: 'markdown', // 'markdown' | 'jsonld' | 'manifest'
skillBuilderLastScaffold: null,       // Last generated scaffold result
skillBuilderProcessData: null,        // Extracted process entities
```

---

## 6. JSON-LD Decision Record

When the user exports a decision record, `generateDecisionRecord()` produces:

```jsonld
{
  "@context": {
    "pfc": "https://platformcore.io/ontology/",
    "dt": "https://platformcore.io/ontology/dt/",
    "schema": "https://schema.org/"
  },
  "@type": "dt:AutomationDecisionRecord",
  "@id": "dt:decision-1740500000000",
  "dt:problemStatement": "BAIV Discovery Agent needs...",
  "dt:evaluator": "architect@example.com",
  "dt:evaluationDate": "2026-02-25T10:00:00.000Z",
  "dt:gateResults": [
    {
      "@type": "dt:HypothesisGateResult",
      "dt:gateId": "HG-01",
      "dt:gateName": "Autonomy Assessment",
      "dt:criterionScores": [
        { "dt:criterion": "Requires interpretation...", "dt:weight": 3, "dt:score": 8 },
        { "dt:criterion": "Must make decisions...", "dt:weight": 3, "dt:score": 7 }
      ],
      "dt:normalizedScore": 7.2,
      "dt:outcome": "PASS"
    }
  ],
  "dt:path": ["HG-01", "HG-02", "HG-05"],
  "dt:recommendation": {
    "@type": "dt:TerminalRecommendation",
    "dt:key": "PLUGIN_CLAUDECODE_WITH_AGENT",
    "dt:label": "Claude Code Plugin wrapping Agent(s)",
    "dt:complexity": "High",
    "dt:estimatedEffort": "2-3 weeks"
  }
}
```

---

## 7. JSON-LD Registry Artifact

When the Skill Builder scaffolds a template, `buildRegistryArtifact()` produces:

```jsonld
{
  "@context": {
    "pfc": "https://platformcore.io/ontology/",
    "pe": "https://platformcore.io/ontology/pe/",
    "dt": "https://platformcore.io/ontology/dt/"
  },
  "@type": "pfc:RegistryArtifact",
  "@id": "pfc:skill-ins-ea-assessment-v1.0.0",
  "pfc:artifactType": "skill",
  "pfc:scope": "instance",
  "pfc:derivedFromProcess": "pe:ins-ea-assessment",
  "pfc:decisionRecord": "dt:decision-1740500000000",
  "pfc:version": "1.0.0",
  "pfc:recommendation": "SKILL_STANDALONE",
  "pfc:components": ["SKILL.md"],
  "pfc:dependencies": ["PE-ONT", "VP-ONT"],
  "pfc:phaseCount": 5,
  "pfc:agentCount": 3,
  "pfc:gateCount": 4
}
```

---

## 8. Test Coverage

| Suite | Tests | File |
|-------|-------|------|
| Process Signal Extraction | 7 | `tests/skill-builder.test.js` |
| Heuristic Scoring | 5 | `tests/skill-builder.test.js` |
| Dtree Prefill Integration | 3 | `tests/skill-builder.test.js` |
| Phase-to-Section Mapping | 4 | `tests/skill-builder.test.js` |
| Agent Capability Mapping | 3 | `tests/skill-builder.test.js` |
| Gate Mapping | 3 | `tests/skill-builder.test.js` |
| Template Scaffolding (12 recs) | 12 | `tests/skill-builder.test.js` |
| Registry Artifact Output | 2 | `tests/skill-builder.test.js` |
| Mermaid Workflow Export | 2 | `tests/skill-builder.test.js` |
| Edge Cases | 3 | `tests/skill-builder.test.js` |
| Extract Process Entities | 2 | `tests/skill-builder.test.js` |
| **Total Skill Builder** | **46** | |
| Dtree Scoring Engine | ~25 | `tests/decision-tree.test.js` |
| Dtree Path Traversal | ~15 | `tests/decision-tree.test.js` |

---

## 9. File Reference

| File | Feature | Key Functions |
|------|---------|---------------|
| `js/decision-tree.js:323` | Scoring | `calculateNormalizedScore(gate, scores)` |
| `js/decision-tree.js:346` | Outcome | `determineOutcome(gate, normalizedScore)` |
| `js/decision-tree.js:420` | Traversal | `advanceGate()` |
| `js/decision-tree.js:503` | Export | `generateDecisionRecord()` |
| `js/skill-builder.js:59` | Signals | `extractProcessSignals(...)` |
| `js/skill-builder.js:161` | Prefill | `prefillDTFromProcess(...)` |
| `js/skill-builder.js:183` | Mapping | `mapPhasesToSections(...)` |
| `js/skill-builder.js:232` | Mapping | `mapAgentsToCapabilities(...)` |
| `js/app.js:5152` | UI | `_renderDecisionTreeView()` |
| `js/app.js:5263` | UI | `_renderDTScoringContent(gateId, readOnly)` |
| `js/app.js:5430` | UI | `_renderDTRecommendationContent(recKey)` |
| `js/app.js:5503` | UI | `_openSkillBuildPanel(recKey)` |
| `js/app.js:5689` | UI | `_generateSkillTemplate(recKey)` |
