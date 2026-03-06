# Claude Prompt Guide — PFI Application Skeleton Generation

**Version**: 1.0.0
**Date**: 2026-02-24
**Status**: Active
**Story**: S40.21.5 (#661) — F40.21 (#646) — Epic 40 (#577)

---

## Purpose

This guide enables Claude (or any AI agent) to auto-generate a valid PFI application skeleton from a VSOM brief, using the parameterised template and mapping rules defined in F40.21.

---

## 1. System Prompt Template

Use this system prompt when asking Claude to generate a PFI skeleton:

```
You are a PF-Core application skeleton generator. Given a PFI VSOM brief, generate a valid JSON-LD PFI application skeleton that:

1. Uses ds:extendsApp to inherit from ds:pfc-app-skeleton-v1.0.0 (22 zones, 5 nav layers, 26 nav items, 25 zone components)
2. Follows the PFI Zone ID Allocation Convention (Z-{PFI}-{nnn})
3. Generates zones, L4 nav items, and zone components based on the VSOM content
4. Applies visibility conditions scoped to the PFI instance
5. Passes DS-ONT business rules (BR-DS-013, BR-DS-014, BR-DS-015)

Reference files:
- Template: PE-Series/DS-ONT/instance-data/pfi-app-skeleton-template-v1.0.0.jsonld
- Mapping rules: PE-Series/DS-ONT/docs/MAPPING-VSOM-to-Skeleton.md
- Zone ID convention: PE-Series/DS-ONT/docs/CONVENTION-PFI-Zone-ID.md
- Inheritance model: PE-Series/DS-ONT/docs/CONVENTION-Skeleton-Inheritance.md
- PFC base skeleton: PE-Series/DS-ONT/instance-data/pfc-app-skeleton-v1.0.0.jsonld
- Example output: PE-Series/DS-ONT/instance-data/dice-app-skeleton-v1.0.0.jsonld
```

---

## 2. Input Specification

The input is a VSOM brief in markdown format with these required sections:

| Section | Required | Extracts |
|---------|----------|----------|
| 2. Vision | Yes | Application description |
| 3. Value Proposition | Yes | Customer segments (stakeholder roles) |
| 4. Strategies (S1-S6) | Yes | Feature scope, regulatory frameworks |
| 5. Ontology Stack | Yes | instanceOntologies, conditional flags |
| 5.4 EMC Instance Configuration | Yes | instanceId, requirementScopes, graphScopeRules |
| 6. Agent Architecture | Yes | Inherited + domain agents |
| 7. BSC Objectives | If hasKPI/BSC | Analytics dashboard content |
| 8. Metrics | If hasKPI | KPI definitions |
| 11. PFI Instance Summary | Yes | Short code, agent count, role count |

---

## 3. Step-by-Step Generation Instructions

### Step 1: Extract Template Variables

From the VSOM brief, extract:

```json
{
  "pfiShortCode": "DICE",
  "pfiInstanceId": "PFI-PC-DICE",
  "pfiInstanceName": "FloodGraph AI — Paul Cowen",
  "pfiVersion": "1.0.0",
  "pfiDate": "2026-02-24",
  "emcInstanceConfigId": "emc:InstanceConfiguration-PFI-PC-DICE",
  "visionStatement": "from Section 2",
  "domainAgents": [
    { "agentName": "FRA-Assessment-Agent", "agentSlot": "Hazard-Assessment", "description": "..." },
    ...
  ],
  "inheritedAgents": [
    { "agentName": "Intake-Agent", "role": "Scope validation" },
    ...
  ],
  "stakeholderRoles": [
    { "roleName": "Developer", "description": "...", "keyActions": "..." },
    ...
  ],
  "hasGRCFW": true,
  "hasKPI": true,
  "hasBSC": true,
  "hasPPM": true
}
```

### Step 2: Create JSON-LD Header

```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "ds": "https://platformcore.io/ontology/ds/",
    "emc": "https://platformcore.io/ontology/emc/",
    "xsd": "http://www.w3.org/2001/XMLSchema#"
  },
  "@id": "ds:{pfiShortCode}-app-skeleton-v{version}",
  "@type": "ds:AppSkeletonInstance",
  "ds:version": "{version}",
  "ds:dateCreated": "{date}",
  "@graph": [ ... ]
}
```

### Step 3: Create Application Entity

- Set `ds:extendsApp` to `ds:pfc-app-skeleton-v1.0.0`
- Set `ds:cascadeTier` to `"PFI"`
- Set `ds:configuredByApp` to the EMC InstanceConfiguration @id
- Copy the vision statement into `ds:description`

### Step 4: Create PFI Identity Zone (Z-{PFI}-100)

Always created. Type: Conditional, position: top, defaultVisible: false.

### Step 5: Create Agent Dashboard Zone (Z-{PFI}-101)

Always created. Include all agent names (inherited + domain) in the description.

### Step 6: Create Agent Panel Zones (Z-{PFI}-102 to Z-{PFI}-{101+D})

One zone per domain agent. Include PE-RMF slot reference and governance info in description.

### Step 7: Create Stakeholder View Zones (Z-{PFI}-200 to Z-{PFI}-{199+R})

One zone per stakeholder role. Visibility condition includes both instance AND role match.

### Step 8: Create Conditional Dashboard Zones

- Z-{PFI}-300: Compliance Dashboard (if hasGRCFW)
- Z-{PFI}-301: Analytics Dashboard (if hasKPI && hasBSC)
- Z-{PFI}-302: PPM Zone (if hasPPM, with `state.ppmActive === true` condition)

### Step 9: Create L4 Nav Items

Generate nav items for:
1. AI Agents (always)
2. Individual domain agent buttons (if D > 3)
3. Stakeholder Views dropdown (if R > 0)
4. Compose Graph (always)
5. Freeze Snapshot (conditional on `state.composedPFIGraph`)
6. Compliance (if hasGRCFW)
7. Analytics (if hasKPI && hasBSC)
8. Projects/PPM (if hasPPM)

All items: `ds:belongsToLayer: { "@id": "ds:navlayer-L4" }`, sequential `ds:renderOrder`.

### Step 10: Create Zone Components

One component per new zone. Follow the naming pattern `cmp-{pfi}-{feature}`.

### Step 11: Create Token Overrides (Optional)

If brand accent colours are known, override `cmp-pfi-context-bar` with `ds:tokenOverrides`.

---

## 4. Validation Checklist

After generating, verify all of these:

- [ ] Valid JSON — no syntax errors
- [ ] `@context` includes `ds`, `emc`, and `xsd` namespaces
- [ ] `ds:extendsApp` points to `ds:pfc-app-skeleton-v1.0.0`
- [ ] `ds:cascadeTier` is `"PFI"` on ALL new entities
- [ ] All zone IDs follow `Z-{PFI}-{nnn}` convention
- [ ] No zone IDs in PFC range (Z1-Z99)
- [ ] All nav item IDs follow `nav-{pfi}-{name}` convention
- [ ] All component IDs follow `cmp-{pfi}-{name}` convention
- [ ] All nav items have non-empty `ds:action` (BR-DS-014)
- [ ] All zones have `ds:zoneType` and `ds:defaultVisible` (BR-DS-015)
- [ ] All visibility conditions include `state.activeInstanceId === '{instanceId}'`
- [ ] `ds:renderOrder` values are sequential within L4
- [ ] Every zone has at least one zone component
- [ ] Every zone component references a valid zone `@id`
- [ ] Entity counts match the formula: Zones = 2 + D + R + G + K + P

### Quick Count Check

```
D = domain agents, R = stakeholder roles
G = 1 if GRC-FW, K = 1 if KPI+BSC, P = 1 if PPM

Expected: Zones = 2 + D + R + G + K + P
          Nav Items = 3 + D*(D>3?1:0) + (R>0?1:0) + G + K + P
          Components = Zones + (brand override ? 1 : 0)
```

---

## 5. Example Invocation

**Input**: FloodGraph AI VSOM v1.0.0 (PBS/STRATEGY/VSOM-FloodGraph-AI-FRA.md)

**Variables extracted**:
- D = 4 (FRA-Assessment, SuDS-Mitigation, Climate-Projection, FRA-Narrative)
- R = 4 (Developer, Consultant, LPA, Insurer)
- G = 1 (GRC-FW in ontology stack)
- K = 1 (KPI + BSC in ontology stack)
- P = 1 (PPM in ontology stack)

**Expected counts**:
- Zones: 2 + 4 + 4 + 1 + 1 + 1 = 13
- Nav Items: 3 + 4 + 1 + 1 + 1 + 1 = 11
- Zone Components: 13 + 1 (context-bar override) = 14

**Output**: `dice-app-skeleton-v1.0.0.jsonld` — see instance-data directory.

---

## 6. Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Missing `ds:extendsApp` | Loader loads skeleton as standalone, missing 22 PFC zones | Always include `ds:extendsApp` reference |
| Zone ID in PFC range | `Z23` instead of `Z-DICE-100` | Use `Z-{PFI}-{nnn}` convention |
| PFC entity modification | BR-DS-013 warning at merge time, change silently dropped | Never redefine PFC-owned entities |
| Missing visibility condition | Zone visible for all PFI instances | Always scope to `state.activeInstanceId === '...'` |
| Non-sequential renderOrder | Nav items appear in wrong order in toolbar | Number renderOrder 1, 2, 3... sequentially |
| Duplicate @id | Merge overwrites instead of adding | Ensure all @ids are unique across base + overlay |
| Missing zone component | Zone appears empty in Z22 inspector | Create one component per zone |
| Wrong JSON-LD @type | Entity not parsed by `parseAppSkeleton()` | Use exact types: `ds:Application`, `ds:AppZone`, `ds:NavItem`, `ds:ZoneComponent` |

---

*DS-ONT Guide — Claude Skeleton Generation v1.0.0*
*Ref: pfi-app-skeleton-template-v1.0.0.jsonld, MAPPING-VSOM-to-Skeleton.md, dice-app-skeleton-v1.0.0.jsonld*
