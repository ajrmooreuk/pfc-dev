> ✅ **PFC-Dev Copy** | Sourced from [Azlan-EA-AAA](https://github.com/ajrmooreuk/pfc-dev/blob/main/docs/strategy/PFC-SKBLD-OPS-Skill-Building-Capability-v1.0.0.md) on 2026-03-14. Canonical version lives in the Azlan monorepo.

# PFC-SKBLD: Skill Building Capability — Operating Guide

**Product Code:** PFC-SKBLD (Skill Builder)
**Version:** 1.0.0
**Date:** 2026-03-07
**Audience:** Platform architects, PFI instance leads, skill authors
**Prerequisite:** Read `PFC-SKBLD-ARCH-Skill-Building-Capability-v1.0.0.md` for architecture context

---

## 1. Overview

This guide covers day-to-day operations for the PFC Skill Building Capability:

1. **Using the Decision Tree** — evaluating capability needs
2. **Using the Skill Builder** — scaffolding artefacts from PE processes
3. **Authoring a new skill manually** — SKILL.md + registry entry
4. **Registering skills** — adding to the skills register index
5. **Maintaining the catalogue** — versioning, deprecation, updates

---

## 2. Using the Decision Tree (Dtree)

### 2.1 Opening the Dtree View

1. Open the Ontology Visualiser (`browser-viewer.html`)
2. Click the **"Decision Tree"** view button in the toolbar
3. The vis-network graph renders showing all 7 gates and 13 recommendation terminals
4. Gate HG-01 is highlighted as the active gate

### 2.2 Evaluating a Capability Need

**Step 1: Define the problem**
- Before scoring, write a clear capability need statement (e.g. "BAIV needs an autonomous discovery agent that scans client websites and generates AI visibility reports")
- This is recorded in `state.dtProblemStatement` and included in the exported decision record

**Step 2: Score each gate**
1. Click the active gate node (hexagon) in the graph
2. The scoring panel opens showing the gate hypothesis and 4 evaluation criteria
3. For each criterion, drag the slider (0-10) based on how well it applies
4. The panel shows a live normalised score and PASS/PARTIAL/FAIL badge
5. Click **"Evaluate & Continue"** to lock the score and advance

**Step 3: Follow the path**
- The Dtree routes you through 2-3 gates based on your scores
- Completed gates turn green (PASS), yellow (PARTIAL), or red (FAIL) in the graph
- Traversed edges are highlighted; un-traversed paths are dimmed

**Step 4: Receive recommendation**
- When you reach a terminal node, the recommendation card appears
- Shows: recommendation key, label, complexity, effort estimate, template type
- Options: Export Decision Record (JSON-LD), Export Mermaid Path, Build from Process

### 2.3 Re-evaluating a Gate

If you want to change a previous score:
1. Click a completed gate node in the graph
2. The scoring panel opens in read-only mode showing your previous scores
3. Click **"Re-evaluate"** to clear this gate and all subsequent gates
4. Score again — the path recalculates from this point

### 2.4 Resetting the Evaluation

- Click **"Reset"** in the floating toolbar to clear all scores and return to HG-01
- This preserves the problem statement but clears all gate scores and the recommendation

### 2.5 Exporting Results

| Export | Format | When Available |
|--------|--------|---------------|
| **Decision Record** | JSON-LD (`dt:AutomationDecisionRecord`) | After reaching a terminal recommendation |
| **Mermaid Path** | Mermaid flowchart syntax | After completing at least one gate |

Both exports are copied to clipboard and can be pasted into documentation.

---

## 3. Using the Skill Builder

### 3.1 Prerequisites

- At least one ontology containing `pe:Process` entities must be loaded in the visualiser
- The Dtree evaluation must have reached a terminal recommendation

### 3.2 Building from a Process

1. From the recommendation card, click **"Build from Process"**
2. The Skill Build Panel opens showing:
   - The recommendation (e.g. SKILL_STANDALONE)
   - A dropdown of all discovered PE processes from loaded ontologies
3. Select a process from the dropdown
4. The panel renders checkboxes for:
   - **Phases** — toggle which process phases map to skill workflow sections
   - **Agents** — toggle which agent capabilities to include
   - **Gates** — toggle which quality gates become quality checkpoints
5. Select output format: Markdown, JSON-LD, or Plugin Manifest
6. Click **"Generate Template"**

### 3.3 Output Artefacts

The Skill Builder generates up to 4 artefacts depending on the recommendation:

| Artefact | Description | Generated For |
|----------|-------------|---------------|
| **SKILL.md** | Markdown skill definition with YAML frontmatter, workflow sections, quality checkpoints | All SKILL_* and AGENT_* recommendations |
| **Registry Entry** (JSON-LD) | `pfc:RegistryArtifact` linking back to source process and decision record | All recommendations except NO_ACTION |
| **Plugin Manifest** (`plugin.json`) | Plugin configuration with commands, skills, MCP bindings | All PLUGIN_* recommendations |
| **Workflow Mermaid** | Visual flowchart of the skill workflow with gate diamonds | All recommendations |

### 3.4 Template Preview

- After generation, a preview modal shows the rendered markdown
- Download buttons for each artefact type
- The generated artefacts are ready to place in `skills/<skill-name>/`

---

## 4. Authoring a New Skill Manually

When you know the skill type without running the Dtree, follow this structure:

### 4.1 Directory Structure

```
skills/<skill-name>/
  ├── SKILL.md                          # Skill definition (mandatory)
  ├── registry-entry-v1.0.0.jsonld      # Registry metadata (mandatory)
  ├── templates/                        # Optional template files
  └── scripts/                          # Optional automation scripts
```

### 4.2 SKILL.md Template

```markdown
---
name: "<skill-name>"
displayName: "<Human-Readable Name>"
version: "1.0.0"
classification: "SKILL_STANDALONE"      # One of 13 recommendation keys
category: "<foundation|analysis|strategy|execution|measurement|value|delta|orchestrator|plugin>"
ontologyDependencies:
  - "<ONT-NAME>"
invocation: "/azlan-github-workflow:<skill-name>"
---

# <Display Name>

## Purpose
<What this skill does and when to use it>

## Prerequisites
<Required ontologies, data, or context>

## Workflow

### Section 1: <Phase Name>
**Entry Conditions:** <what must be true before starting>
**Activities:**
1. <step>
2. <step>
**Exit Conditions:** <what must be true when complete>

### Section 2: <Phase Name>
...

## Quality Checkpoints
- [ ] <Gate criteria from PE process>

## Expected Outputs
- <Artefact name> (<format>)

## Success Metrics
- <Metric>: <target> (<unit>, <frequency>)
```

### 4.3 Registry Entry Template

```json
{
  "@context": {
    "pfc": "https://platformcore.io/ontology/",
    "pe": "https://platformcore.io/ontology/pe/",
    "schema": "https://schema.org/"
  },
  "@type": "pfc:RegistryArtifact",
  "@id": "pfc:skill-<name>-v1.0.0",
  "pfc:skillName": "<skill-name>",
  "pfc:displayName": "<Human-Readable Name>",
  "pfc:artifactType": "skill",
  "pfc:classification": "SKILL_STANDALONE",
  "pfc:scope": "core",
  "pfc:version": "1.0.0",
  "pfc:status": "active",
  "pfc:category": "<category>",
  "pfc:invocation": "/azlan-github-workflow:<skill-name>",
  "pfc:dependencies": ["<ONT-NAME>"],
  "pfc:components": ["SKILL.md"],
  "schema:dateCreated": "2026-03-07T00:00:00Z"
}
```

---

## 5. Registering a Skill

### 5.1 Adding to the Skills Register Index

After creating the skill folder and files:

1. Open `skills/skills-register-index.json`
2. Add a new entry to the `entries` array:

```json
{
  "entryId": "Entry-SKL-<next number>",
  "skillName": "<skill-name>",
  "displayName": "<Human-Readable Name>",
  "classification": "<recommendation key>",
  "version": "1.0.0",
  "status": "active",
  "category": "<category>",
  "filePath": "skills/<skill-name>/registry-entry-v1.0.0.jsonld",
  "invocation": "/azlan-github-workflow:<skill-name>"
}
```

3. Update the `totalEntries` count
4. Update the `summary` counts for the appropriate classification
5. Update the `lastModified` timestamp

### 5.2 Entry ID Convention

| Classification | Prefix | Example |
|---------------|--------|---------|
| SKILL_* | `Entry-SKL-` | `Entry-SKL-018` |
| AGENT_* | `Entry-AGT-` | `Entry-AGT-003` |
| PLUGIN_* | `Entry-PLG-` | `Entry-PLG-002` |

Note: Current register uses `Entry-SKL-` for agents too (SKL-009, SKL-015, SKL-016). Standardise new entries using the correct prefix going forward.

### 5.3 Validation

Run tests to verify the register is valid:

```bash
cd PBS/TOOLS/ontology-visualiser
npx vitest run tests/skills-register.test.js
```

---

## 6. Skill Categories

| Category | Skills | Description |
|----------|--------|-------------|
| `foundation` | pfc-efs, pfc-org-context | Platform baseline — project structure, org context |
| `analysis` | pfc-macro-analysis, pfc-industry-analysis | Environmental scanning — PESTEL, Porter's, scenarios |
| `strategy` | pfc-vsom | Strategic planning — vision, strategy, objectives, metrics |
| `execution` | pfc-okr | Execution planning — OKR cascades |
| `measurement` | pfc-kpi | Performance measurement — KPI definition, BSC classification |
| `value` | pfc-vp | Value definition — value propositions, customer segments |
| `delta` | pfc-delta-scope/evaluate/leverage/narrate/adapt | Gap analysis — DELTA 5-step pipeline |
| `orchestrator` | pfc-ve-pipeline, pfc-delta-pipeline, pfc-dmaic-ve | Pipeline orchestrators — multi-skill sequencing |
| `plugin` | pfc-reason | Lightweight plugins — cross-cutting utilities |

---

## 7. Skill Pipelines — Invocation Order

### 7.1 VE Pipeline (`/azlan-github-workflow:pfc-ve-pipeline`)

The VE (Value Engineering) pipeline orchestrates 7 skills in sequence:

```
Step 1: pfc-org-context     → Establish organisation context
Step 2: pfc-macro-analysis   → PESTEL, scenarios, futures funnel, backcasting
Step 3: pfc-industry-analysis → Porter's Five Forces, competitive landscape
Step 4: pfc-vsom             → Vision, Strategy, Objectives, Metrics + BSC
Step 5: pfc-okr              → OKR cascade from VSOM objectives
Step 6: pfc-kpi              → KPI definition from OKR key results
Step 7: pfc-vp               → Value propositions from KPI/strategy alignment
```

Each step produces JSON-LD output that feeds the next. The orchestrator validates inter-step dependencies.

### 7.2 DELTA Pipeline (`/azlan-github-workflow:pfc-delta-pipeline`)

The DELTA pipeline orchestrates 5 skills for gap analysis:

```
Step 1: pfc-delta-scope      → Discovery scoping & stakeholder mapping
Step 2: pfc-delta-evaluate   → Comparative gap analysis & quantification
Step 3: pfc-delta-leverage   → Lever analysis & recommendations
Step 4: pfc-delta-narrate    → VE-SC transformation narrative
Step 5: pfc-delta-adapt      → Variance analysis & cycle adaptation
```

### 7.3 DMAIC-VE Pipeline (`/azlan-github-workflow:pfc-dmaic-ve`)

The DMAIC-VE orchestrator combines Lean Six Sigma DMAIC with Value Engineering, using templates from `pfc-dmaic-ve/templates/`.

---

## 8. Versioning and Lifecycle

### 8.1 Version Scheme

Skills follow semantic versioning: `MAJOR.MINOR.PATCH`

| Change | Version Bump | Example |
|--------|-------------|---------|
| Breaking workflow change | MAJOR | Renaming sections, removing gates |
| New optional section or output | MINOR | Adding a quality checkpoint |
| Bug fix or wording clarification | PATCH | Fixing a template typo |

### 8.2 Lifecycle States

```
Draft → Active → Updated → Active (loop)
                         → Deprecated → Archived
```

- **Draft**: Scaffolded by Skill Builder, not yet reviewed
- **Active**: Published in register, available for invocation
- **Deprecated**: Superseded by a newer skill, still functional
- **Archived**: Removed from active register

### 8.3 Updating a Skill

1. Increment version in SKILL.md frontmatter and registry entry
2. Create a new `registry-entry-v<new>.jsonld` (keep old for history)
3. Update `skills-register-index.json` with new version
4. Create a Release Bulletin entry (see Section 9)

---

## 9. Release Bulletin Convention

Every new skill or significant skill update should have a release bulletin entry in `docs/strategy/PFC-SKBLD-REL-Skill-Building-Capability-v1.0.0.md`. The format:

```markdown
### <Skill Name> v<version> — <date>

**Classification:** <recommendation key>
**Category:** <category>
**Ontology Dependencies:** <list>

**What's New:**
- <change 1>
- <change 2>

**Breaking Changes:** None | <list>

**Files:**
- `skills/<name>/SKILL.md`
- `skills/<name>/registry-entry-v<version>.jsonld`
```

For skill-family releases (e.g. all 5 DELTA skills), use the family-level bulletin pattern established by `UPDATE-BULLETIN-PFC-DELTA-v1.0.0.md`.

---

## 10. Troubleshooting

| Issue | Cause | Resolution |
|-------|-------|------------|
| No processes in dropdown | No PE-ONT loaded | Load an ontology containing `pe:Process` entities |
| "Build from Process" disabled | Dtree not completed | Complete all gates to reach a terminal recommendation |
| Signal extraction scores all zeros | Process has no phases/agents | Ensure process has `ProcessPhase` and optionally `AIAgent` entities |
| Register test failures | Malformed JSON | Check `skills-register-index.json` for valid JSON and matching entry counts |
| Dtree graph doesn't render | vis-network not loaded | Ensure `vis-network.min.js` is loaded in `browser-viewer.html` |

---

## 11. Quick Reference

### Invocation Cheat Sheet

| Skill | Invocation |
|-------|-----------|
| EFS | `/azlan-github-workflow:pfc-efs` |
| Org Context | `/azlan-github-workflow:pfc-org-context` |
| Macro Analysis | `/azlan-github-workflow:pfc-macro-analysis` |
| Industry Analysis | `/azlan-github-workflow:pfc-industry-analysis` |
| VSOM | `/azlan-github-workflow:pfc-vsom` |
| OKR | `/azlan-github-workflow:pfc-okr` |
| KPI | `/azlan-github-workflow:pfc-kpi` |
| VP | `/azlan-github-workflow:pfc-vp` |
| VE Pipeline | `/azlan-github-workflow:pfc-ve-pipeline` |
| DELTA Scope | `/azlan-github-workflow:pfc-delta-scope` |
| DELTA Evaluate | `/azlan-github-workflow:pfc-delta-evaluate` |
| DELTA Leverage | `/azlan-github-workflow:pfc-delta-leverage` |
| DELTA Narrate | `/azlan-github-workflow:pfc-delta-narrate` |
| DELTA Adapt | `/azlan-github-workflow:pfc-delta-adapt` |
| DELTA Pipeline | `/azlan-github-workflow:pfc-delta-pipeline` |
| DMAIC-VE | `/azlan-github-workflow:pfc-dmaic-ve` |
| Reason | `/azlan-github-workflow:pfc-reason` |

### Key File Paths

| What | Path |
|------|------|
| Skills register | `skills/skills-register-index.json` |
| Skill folders | `skills/<skill-name>/` |
| Dtree engine | `tools/ontology-visualiser/js/decision-tree.js` |
| Skill Builder | `tools/ontology-visualiser/js/skill-builder.js` |
| Tests | `tools/ontology-visualiser/tests/` |
| Architecture | `docs/strategy/PFC-SKBLD-ARCH-Skill-Building-Capability-v1.0.0.md` |
| Dtree data source | `docs/strategy/extensibility-decision-tree-v1.0.json` |
| URG Strategy | `docs/strategy/PFC-SKBLD-BRIEF-URG-OpenSource-Skill-Intake-Strategy-v1.0.0.md` |

---

## 12. URG Intake Operations — Open-Source & Partner Skills

For full URG intake procedures (architecture, ops, dev guide), see the consolidated document:
`PFC-SKBLD-BRIEF-URG-OpenSource-Skill-Intake-Strategy-v1.0.0.md` (Sections 12-14).
