# PE-ONT v4.0.0 Upgrade Guide --- Platform Team

**Date:** 2026-02-25
**Audience:** Platform Foundation Core engineers, PFI instance leads, Skill Builder contributors
**Depends on:** PE-ONT v3.0.0, ARCH-PE-SKILL-CATALOGUE.md, skill-builder.js (F34.11)

---

## 1. What Changed and Why

PE-ONT v3.0.0 had 10 entities that described processes well but left three things informal:

| Gap in v3.0.0 | How it was handled | v4.0.0 formalisation |
|---|---|---|
| **Skills** were free-text strings on `AIAgent.capabilities` | Skill Builder extracted signals heuristically via `extractProcessSignals()` | `pe:Skill` entity with typed inputs/outputs, version, provider enum |
| **Plugins** had no ontology model | Scaffolded as ad-hoc `plugin.json` by `scaffoldPluginLightweight()` etc. | `pe:Plugin` entity with cascade tier, config schema, skill bindings |
| **Cross-process routing** was manual | User navigated processes one at a time, no composition model | `pe:ProcessPath` / `pe:PathStep` / `pe:PathLink` --- directed graph with no fixed start |

### The Core Shift

**v3.0.0:** Process is the top-level unit. Skills are scaffolded *from* processes by the Skill Builder.

**v4.0.0:** Skill is a first-class entity *alongside* Process. A process phase can invoke a skill. A path step can reference a process OR invoke a skill directly. The Skill Builder now has ontology-level entities to read, not just heuristic extraction.

```
v3.0.0 Pipeline:
  pe:Process --> extractProcessSignals() --> Dtree --> scaffoldSkill() --> SKILL.md

v4.0.0 Pipeline:
  pe:Process --|hasPhase|--> pe:ProcessPhase --|invokesSkill|--> pe:Skill
       |                                                            ^
       |--via ProcessPath/PathStep/PathLink--- cross-series --------|
       |                                                            |
  pe:Plugin --|providesSkill|----------------------------------------
  pe:AIAgent --|agentProvidesSkill|----------------------------------
```

The Skill Builder still scaffolds templates, but now it reads `pe:Skill` entities directly rather than inferring them from process signals. Both paths coexist during migration.

---

## 2. The Five New Entities

### 2.1 pe:Skill --- The Atomic Callable Unit

```
pe:Skill
  skillId          : string (required)
  skillName        : string (required)
  version          : string (required)
  skillType        : analysis | transformation | generation | validation |
                     extraction | orchestration | governance | visualisation | custom
  inputs           : JSON array [{name, dataType, required}]
  outputs          : JSON array [{name, dataType}]
  provider         : agent | human | plugin | service | hybrid
  owningOntology   : string (e.g. "VSOM-ONT", "KPI-ONT")
  idempotent       : boolean
  qualityThreshold : 0-100
  status           : draft | active | deprecated | archived
```

**Key design point:** Skills are *cross-cutting*. A `vsom:analyseVision` skill with `owningOntology: "VSOM-ONT"` can be invoked from a PPM process phase, an EFS workflow, or a ProcessPath step. The skill doesn't care who calls it --- it has typed inputs and outputs.

**Linkage to Skill Builder:** Currently `mapAgentsToCapabilities()` reads `agent.capabilities` as a string. With v4.0.0, it should read `pe:agentProvidesSkill` relationships and resolve to `pe:Skill` entities with their formal `inputs`/`outputs`. The scaffolded SKILL.md gains typed parameter sections.

### 2.2 pe:Plugin --- The Extension Bundle

```
pe:Plugin
  pluginId     : string (required)
  pluginName   : string (required)
  version      : string (required)
  pluginType   : data-source | transformation | visualisation | integration |
                 design-system | governance | analytics | custom
  cascadeTier  : PFC | PFI | Product | App
  configSchema : JSON Schema string
  entryPoint   : module path or URL
  status       : active | deprecated | experimental
```

**Key design point:** A plugin *must* expose at least one skill (BR-016). The `cascadeTier` aligns with the EMC 4-tier cascade that already governs brand/DS resolution in DS-ONT.

**Linkage to Skill Builder:** The 11 scaffold functions (`scaffoldSkillSimple`, `scaffoldPluginLightweight`, `scaffoldPluginClaudeCode`, etc.) currently produce ad-hoc `plugin.json` manifests. With v4.0.0, they should produce `pe:Plugin` JSON-LD entities with `providesSkill` relationships. The `buildRegistryArtifact()` function gains a direct ontology-backed model.

### 2.3 pe:ProcessPath --- The Directed Graph

```
pe:ProcessPath
  pathId    : string (required)
  pathName  : string (required)
  version   : string (required)
  pathType  : linear | branching | graph | pipeline
  scope     : cross-series | intra-series | instance-specific
  seriesRefs    : comma-separated series (e.g. "PE-Series,VE-Series")
  instanceScope : PFI instance name (if scope is instance-specific)
  status    : draft | active | deprecated | archived
```

**No fixed start.** Any `PathStep` with `entryPoint: true` can be entered directly. The graph encodes what *can* follow, not what *must* start.

### 2.4 pe:PathStep --- Graph Node

```
pe:PathStep
  stepId        : string (required)
  stepName      : string (required)
  stepType      : required | optional | conditional | parallel
  entryPoint    : boolean (required, default false)
  conditionExpr : state expression (e.g. "scope.includes(VE-Series)")
  ontologyRef   : owning ontology ID
```

Each step references **either** a process (`stepRefersToProcess`) **or** a skill (`stepInvokesSkill`) --- never both (BR-013).

### 2.5 pe:PathLink --- Directed Edge

```
pe:PathLink
  linkId          : string (required)
  bindingStrength : mandatory | recommended | optional | conditional
  linkType        : sequential | parallel | fork | join | fallback
  condition       : state expression (required when bindingStrength is "conditional")
  weight          : integer (priority ordering)
```

---

## 3. Linkages to the Skill Builder

### 3.1 Current State (F34.11 on PE-ONT v3.0.0)

The Skill Builder pipeline as documented in ARCH-PE-SKILL-CATALOGUE.md:

```
1. User loads ontology with pe:Process entities
2. extractProcessSignals() reads process, phases, agents, gates, patterns, artifacts, metrics
3. Heuristic scores populate 7 Dtree gates (HG-01 through HG-07)
4. Dtree evaluates gates, reaches one of 13 recommendations
5. scaffoldXxx() produces SKILL.md, plugin.json, RegistryArtifact JSON-LD, workflow Mermaid
6. buildRegistryArtifact() wraps output as pfc:RegistryArtifact
```

### 3.2 What v4.0.0 Changes for the Skill Builder

#### A. Signal extraction gains formal skill data

`extractProcessSignals()` currently reads `AIAgent.capabilities` as a free-text string and scores it heuristically. With v4.0.0:

| v3.0.0 signal | v4.0.0 replacement |
|---|---|
| `agent.capabilities` (string) | `pe:agentProvidesSkill` -> `pe:Skill` entities (typed) |
| `agentCount` (heuristic) | Count of `pe:Skill` entities linked via `invokesSkill` from phases |
| Manual capability parsing | `skill.inputs` / `skill.outputs` JSON arrays (formal I/O) |
| No dependency info | `pe:skillDependsOn` relationship chain (DAG) |

**Impact on HG-01 (Autonomy Assessment):** Criterion C1 ("How many decisions?") can now count distinct skills rather than inferring from agent count. Criterion C3 ("Coordinates?") can check `skillDependsOn` chains.

**Impact on HG-03 (Bundling Requirement):** Criterion C0 ("Multiple skills?") can directly count `pe:Skill` entities rather than inferring from phase count. If a process has 5 skills, bundling is clearly needed.

#### B. Scaffolding produces ontology-backed entities

The 11 scaffold functions currently produce ad-hoc markdown and JSON. With v4.0.0 they can produce valid PE-ONT entities:

| Scaffold function | v3.0.0 output | v4.0.0 output |
|---|---|---|
| `scaffoldSkillSimple()` | SKILL.md | SKILL.md + `pe:Skill` JSON-LD |
| `scaffoldSkillStandalone()` | SKILL.md | SKILL.md + `pe:Skill` JSON-LD |
| `scaffoldPluginLightweight()` | plugin.json | `pe:Plugin` + `pe:providesSkill` -> `pe:Skill` JSON-LD |
| `scaffoldPluginClaudeCode()` | plugin.json | `pe:Plugin` + skills JSON-LD |
| `scaffoldAgentOrchestrator()` | agent config | `pe:AIAgent` + `pe:agentProvidesSkill` -> skills JSON-LD |
| `buildRegistryArtifact()` | pfc:RegistryArtifact | pfc:RegistryArtifact + `pe:derivesSkill` -> `pe:Skill` |

#### C. Process paths enable cross-series scaffolding

Currently the Skill Builder works on one process at a time. Section 9.2 of ARCH-PE-SKILL-CATALOGUE.md noted this gap:

> *"Some skills span multiple PE-Series ontologies (e.g., a compliance audit skill needs PE-ONT + GRC-FW-ONT + NCSC-CAF-ONT)."*

`pe:ProcessPath` solves this. A path like:

```
PPM (entry) --recommended--> EFS --optional/fork--> VSOM --mandatory--> OKR --mandatory--> KPI --mandatory--> VP
```

...gives the Skill Builder a *graph* to scaffold from, not just a single process. The builder can:

1. Read `pe:ProcessPath` entities from loaded ontologies
2. Resolve each `PathStep` to its process or skill via `stepRefersToProcess` / `stepInvokesSkill`
3. Use `bindingStrength` to determine which steps are core vs optional in the scaffolded template
4. Generate a multi-section SKILL.md that spans series boundaries
5. Use `pathType` (linear/branching/graph/pipeline) to select the right Mermaid workflow diagram layout

#### D. Plugin dependency resolution

`pe:pluginRequires` gives the Skill Builder transitive dependency information. When scaffolding a plugin that requires another plugin, the builder can:

1. Walk the `pluginRequires` chain
2. Collect all `providesSkill` relationships from the dependency tree
3. Generate a complete `dependencies` section in the plugin manifest
4. Warn if a required plugin is `deprecated` or `experimental`

---

## 4. Join Patterns for the Skill Builder

PE-ONT v4.0.0 defines 8 join patterns. The ones most relevant to the Skill Builder:

### JP-PE-001: Skill Invocation Chain
```
pe:ProcessPhase -> invokesSkill -> pe:Skill <- agentProvidesSkill <- pe:AIAgent
pe:Skill <- providesSkill <- pe:Plugin
```
**Use:** Given a phase, discover all available skills and their providers.
**Skill Builder use:** Replace the heuristic `mapAgentsToCapabilities()` with a graph traversal.

### JP-PE-002: Process Path Traversal
```
pe:ProcessPath -> hasPathStep -> pe:PathStep [entryPoint=true]
pe:ProcessPath -> hasPathLink -> pe:PathLink -> linkFrom/linkTo -> pe:PathStep
```
**Use:** Walk a path graph from any entry point through links.
**Skill Builder use:** New "Scaffold from Path" mode --- select a ProcessPath, walk the graph, scaffold a multi-process template.

### JP-PE-003: Cross-Series Path Resolution
```
pe:PathStep -> stepRefersToProcess -> pe:Process [ontologyRef identifies series]
pe:PathStep -> stepInvokesSkill -> pe:Skill [owningOntology identifies series]
```
**Use:** Resolve path steps to concrete process definitions across series boundaries.
**Skill Builder use:** When scaffolding from a cross-series path, resolve each step to its ontology and pull the relevant process/skill metadata.

### JP-PE-005: Skill Dependency Chain
```
pe:Skill -> skillDependsOn -> pe:Skill (recursive)
```
**Use:** Build the execution DAG for a skill invocation.
**Skill Builder use:** Generate the "Prerequisites" section of SKILL.md from the dependency chain. Warn if a skill dependency is `deprecated`.

---

## 5. Worked Example: Cross-Series Path Scaffolding

### The Path: "Strategic Execution Route"

```
PathStep: PPM       (entry, optional,    ontologyRef: PPM-ONT)
PathStep: EFS       (entry, optional,    ontologyRef: EFS-ONT)
PathStep: VSOM      (entry, conditional, ontologyRef: VSOM-ONT, condition: scope.includes(VE-Series))
PathStep: OKR       (not entry, conditional, ontologyRef: OKR-ONT,  condition: scope.includes(VE-Series))
PathStep: KPI       (not entry, conditional, ontologyRef: KPI-ONT,  condition: scope.includes(VE-Series))
PathStep: VP        (not entry, conditional, ontologyRef: VP-ONT,   condition: scope.includes(VE-Series))

Links:
  PPM --recommended--> EFS
  EFS --recommended--> PPM      (bidirectional, either can come first)
  PPM --optional/fork--> VSOM   (can fork from PPM to VE chain)
  EFS --optional/fork--> VSOM   (can fork from EFS to VE chain)
  VSOM --mandatory--> OKR       (VE chain is strictly sequential once entered)
  OKR  --mandatory--> KPI
  KPI  --mandatory--> VP
```

### Skill Builder reads this path

1. **Discover entry points:** PPM, EFS, VSOM are all `entryPoint: true`
2. **Resolve processes:** Each step's `stepRefersToProcess` links to a process in its owning ontology
3. **Evaluate conditions:** If instance scope includes VE-Series, VSOM/OKR/KPI/VP steps activate
4. **Map binding strengths:**
   - `mandatory` links (VSOM->OKR->KPI->VP) become required sections in SKILL.md
   - `recommended` links (PPM<->EFS) become "recommended prerequisite" notes
   - `optional` forks (PPM/EFS->VSOM) become conditional sections with `conditionExpr` as the guard
5. **Scaffold output:**

```markdown
---
name: "Strategic Execution Route"
version: "1.0.0"
path-type: "branching"
scope: "cross-series"
series: "PE-Series, VE-Series"
---

## Entry Points (any of these can start the route)

### PPM --- Portfolio/Programme/Project Management
- **Binding:** Optional entry
- **Ontology:** PPM-ONT
- **Recommended next:** EFS (Enterprise Fulfilment Services)

### EFS --- Enterprise Fulfilment Services
- **Binding:** Optional entry
- **Ontology:** EFS-ONT
- **Recommended next:** PPM (if not already visited)

### VSOM --- Vision/Strategy/Objectives/Metrics
- **Binding:** Conditional entry (requires VE-Series in scope)
- **Ontology:** VSOM-ONT

## VE Chain (mandatory sequential once entered)

### Section 1: VSOM (Vision Analysis)
[activities from VSOM process phases]

### Section 2: OKR (Objectives & Key Results)
[activities from OKR process phases]

### Section 3: KPI (Key Performance Indicators)
[activities from KPI process phases]

### Section 4: VP (Value Proposition)
[activities from VP process phases]
```

---

## 6. Migration Checklist for Skill Builder

### Phase 1: Read formal skills (non-breaking)

- [ ] Add `pe:Skill` to the ontology loader entity discovery (alongside `pe:Process`)
- [ ] Populate `state.discoveredSkills[]` at load time
- [ ] Update `extractProcessSignals()` to also count linked `pe:Skill` entities via `invokesSkill`
- [ ] Update `mapAgentsToCapabilities()` to resolve `agentProvidesSkill` -> `pe:Skill` entities
- [ ] Fall back to `agent.capabilities` string if no skill relationships found (backward compat)

### Phase 2: Scaffold formal entities (non-breaking)

- [ ] Update `buildRegistryArtifact()` to emit `pe:Skill` JSON-LD alongside `pfc:RegistryArtifact`
- [ ] Update plugin scaffold functions to emit `pe:Plugin` JSON-LD with `providesSkill` relationships
- [ ] Add `pe:agentProvidesSkill` relationships to agent scaffold output
- [ ] Extend workflow Mermaid generation (`generateWorkflowMermaid()`) with skill-dependency subgraph

### Phase 3: Path-based scaffolding (new feature)

- [ ] Add `pe:ProcessPath` to ontology loader entity discovery
- [ ] Populate `state.discoveredPaths[]` at load time
- [ ] Add "Scaffold from Path" button in Dtree UI (alongside existing "Build from Process")
- [ ] Implement `scaffoldFromPath(pathEntity)` --- walks graph, resolves steps, generates multi-section template
- [ ] Use `bindingStrength` to classify sections as required / recommended / optional / conditional
- [ ] Use `conditionExpr` to generate guard clauses in scaffolded templates

### Phase 4: Plugin dependency resolution (new feature)

- [ ] Implement `resolvePluginDependencies(pluginEntity)` --- walks `pluginRequires` chain
- [ ] Collect transitive `providesSkill` from dependency tree
- [ ] Generate dependencies section in plugin manifests
- [ ] Add deprecation warnings for `deprecated`/`experimental` dependencies

---

## 7. Impact on PFI Instances

Each PFI instance declares `instanceOntologies` in its EMC configuration. Process paths can be scoped to instances via `pathScopedToInstance`:

| PFI Instance | Available Paths | Example |
|---|---|---|
| **BAIV** | Cross-series + BAIV-specific | "BAIV Discovery Route": PPM -> PE -> DS -> EFS |
| **W4M-WWG** | Cross-series + W4M-specific | "Supply Chain Route": LSC -> OFM -> KPI -> VP |
| **AIRL-CAF-AZA** | Cross-series + AIRL-specific | "Azure Readiness Route": EA -> PE -> GRC -> NCSC-CAF |
| **VHF** | Cross-series only (PoC) | Uses generic paths, no instance-specific yet |

The `constrainToInstanceOntologies()` filter in `emc-composer.js` already narrows compositions to declared ontologies. Process paths respect the same constraint --- a W4M-WWG path can only include steps referencing ontologies in W4M's `instanceOntologies` array (VP, RRR, LSC, OFM, KPI, BSC, EMC).

---

## 8. Relationship to Existing Architecture

### How this connects to what already exists:

```
                    ARCH-PE-SKILL-CATALOGUE.md (unchanged)
                    Documents the PE-Series-as-skill-catalogue thesis
                    JP-PE-SK-001 join pattern still valid
                              |
                              v
    PE-ONT v3.0.0 ----upgrade----> PE-ONT v4.0.0
    (10 entities)                  (15 entities)
    Process-centric               Process + Skill + Path centric
                              |
                              v
                    skill-builder.js (F34.11)
                    extractProcessSignals() --- now reads pe:Skill formally
                    scaffoldXxx()           --- now emits pe:Plugin/pe:Skill JSON-LD
                    NEW: scaffoldFromPath() --- path-based multi-process scaffolding
                              |
                              v
                    decision-tree.js (Dtree engine, unchanged)
                    7 Hypothesis Gates still evaluate the same criteria
                    Scores improve with formal skill data vs heuristic extraction
                              |
                              v
                    ont-registry-index.json (Unified Registry)
                    pfc:RegistryArtifact now links to pe:Skill / pe:Plugin entities
                    Catalogue gains typed skill metadata
```

### What does NOT change:

- **Dtree engine** --- 7 gates, 13 recommendations, gate evaluation logic unchanged
- **ARCH-PE-SKILL-CATALOGUE.md** --- thesis and pipeline remain valid, v4.0.0 formalises what was informal
- **EMC composition engine** --- `emc-composer.js` unchanged, paths respect instance constraints
- **Visualiser UI** --- existing "Build from Process" flow works as before
- **All v3.0.0 entities** --- fully preserved, no breaking changes to existing data

---

## 9. Files Summary

| File | Location | Status |
|---|---|---|
| `process-engineering-v4.0.0-oaa-v7.json` | `ontology-library/PE-Series/PE-ONT/` | New (v4.0.0 schema) |
| `process-engineering-v3.0.0-oaa-v6.json` | `ontology-library/PE-Series/PE-ONT/` | Retained (archive) |
| `CHANGELOG.md` | `ontology-library/PE-Series/PE-ONT/` | New |
| `UPGRADE-PE-v4-SKILL-BUILDER.md` | `PBS/TOOLS/ontology-visualiser/` | This document |
| `ARCH-PE-SKILL-CATALOGUE.md` | `PBS/TOOLS/ontology-visualiser/` | Unchanged (still valid) |
| `skill-builder.js` | `PBS/TOOLS/ontology-visualiser/js/` | To be updated (Phases 1-4 above) |
