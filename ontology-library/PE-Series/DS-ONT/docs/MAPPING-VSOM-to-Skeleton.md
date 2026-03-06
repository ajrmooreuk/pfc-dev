# VSOM-to-Skeleton Mapping Rules

**Version**: 1.0.0
**Date**: 2026-02-24
**Status**: Active
**Story**: S40.21.2 (#658) — F40.21 (#646) — Epic 40 (#577)

---

## Purpose

Define the formal mapping from each section of a PFI VSOM brief to the corresponding skeleton entities. This document is the authoritative reference for both human authors and AI agents generating PFI skeletons.

---

## 1. Input: VSOM Brief Structure

A VSOM brief follows a standard 11-section structure:

| Section | Title | Skeleton Relevance |
|---------|-------|-------------------|
| 1 | Positioning (PE-RMF Architecture) | Foundation pattern, layer model |
| 2 | Vision | Application description |
| 3 | Value Proposition (VP-ONT + RRR-ONT) | Stakeholder segment identification |
| 4 | Strategies (S1–S6) | Zone planning, feature scope |
| 5 | Ontology Stack | instanceOntologies, conditional zones |
| 6 | Agent Architecture | Agent Dashboard + Agent Panel zones |
| 7 | BSC Objectives | Analytics Dashboard content |
| 8 | Metrics (KPI-ONT) | KPI dashboard zone components |
| 9 | Competitive Positioning | (informational — no skeleton mapping) |
| 10 | Delivery Roadmap | Phase-based visibility conditions |
| 11 | PFI Instance Summary | Agent count, role count, short code |

---

## 2. Mapping Table

### 2.1 Section 11 → Template Variables (Extract First)

Before generating any skeleton entities, extract these template variables from the PFI Summary (Section 11):

| VSOM Field | Template Variable | Example (FloodGraph) |
|------------|------------------|---------------------|
| PFI Instance ID | `pfiInstanceId` | `PFI-PC-DICE` |
| Product Code / Short Code | `pfiShortCode` | `DICE` |
| Instance Name | `pfiInstanceName` | `FloodGraph AI — Paul Cowen` |
| Agent count (total) | `totalAgents` | 11 (7 inherited + 4 domain) |
| Domain agent count | `domainAgents.length` | 4 |
| Stakeholder role count | `stakeholderRoles.length` | 4 |
| Repo triad | (informational) | DICE-Dev / DICE-test / DICE-prod |

### 2.2 Section 2 → Application Entity

| VSOM Source | Skeleton Target | Property |
|-------------|----------------|----------|
| Section 2: Vision statement | `ds:Application` | `ds:description` |
| Section 11: Instance Name | `ds:Application` | `ds:appName` |
| (derived) | `ds:Application` | `ds:extendsApp` → `ds:pfc-app-skeleton-v1.0.0` |
| Section 5.4: EMC config ID | `ds:Application` | `ds:configuredByApp` |

### 2.3 Section 5 → Conditional Zone Flags

Scan the ontology stack to determine which conditional zones to generate:

| Ontology Present | Flag | Triggers Zone |
|-----------------|------|---------------|
| GRC-FW-ONT | `hasGRCFW = true` | Z-{PFI}-300 (Compliance Dashboard) |
| KPI-ONT + BSC-ONT | `hasKPI && hasBSC = true` | Z-{PFI}-301 (Analytics Dashboard) |
| PPM-ONT | `hasPPM = true` | Z-{PFI}-302 (PPM Zone) |

### 2.4 Section 6 → Agent Zones

**Section 6.1 — Inherited PE-RMF Agents** → informational only. These agents use PFC base zones and do not generate new skeleton entities. Record their names for the Agent Dashboard zone description.

**Section 6.2 — Domain Agents** → each generates:

| Agent Field | Skeleton Entity | Property |
|-------------|----------------|----------|
| Agent Name | `ds:AppZone` | `ds:zoneName` = "{agentName} Panel" |
| Agent Name | `ds:AppZone` | `ds:zoneId` = "Z-{PFI}-{102+i}" |
| PE-RMF Slot | `ds:AppZone` | `ds:zoneDescription` includes slot reference |
| Agent Name | `ds:ZoneComponent` | `ds:placementId` = "cmp-{pfi}-{agentName}" |
| Agent Name | `ds:NavItem` (optional) | Individual agent nav items if count > 3 |

**Generation Rule**: For each domain agent at index `i` (0-based):
1. Create zone `Z-{PFI}-{102+i}` (Sliding, right, PFI tier)
2. Create zone component `cmp-{pfi}-{agentName}` placed in that zone
3. If total domain agents > 3, create individual L4 nav items per agent

**Always create**:
- Zone `Z-{PFI}-101` — Agent Dashboard (overview of ALL agents, inherited + domain)
- Component `cmp-{pfi}-agent-dashboard` in Z-{PFI}-101
- Nav item `nav-{pfi}-agents` — single button to toggle Agent Dashboard

### 2.5 Section 4 (S4: Multi-Stakeholder) → Stakeholder View Zones

From Section 4 (S4: Multi-Stakeholder Portal) or Section 3 (Customer Segments), extract the role definitions:

| Role Field | Skeleton Entity | Property |
|------------|----------------|----------|
| Role Name | `ds:AppZone` | `ds:zoneName` = "{roleName} View" |
| Role Name | `ds:AppZone` | `ds:zoneId` = "Z-{PFI}-{200+j}" |
| Key Actions | `ds:AppZone` | `ds:zoneDescription` includes actions |
| Role Name | `ds:ZoneComponent` | `ds:placementId` = "cmp-{pfi}-{roleName}-view" |

**Generation Rule**: For each stakeholder role at index `j` (0-based):
1. Create zone `Z-{PFI}-{200+j}` (Sliding, right, PFI tier)
2. Create zone component `cmp-{pfi}-{roleName}-view` in that zone
3. Add visibility condition scoped to both instance AND active role

**Always create**:
- Nav item `nav-{pfi}-stakeholders` — Dropdown to select stakeholder view

### 2.6 Section 4 (S3: Regulatory Intelligence) → Compliance Dashboard

If `hasGRCFW === true` (GRC-FW-ONT in ontology stack):

| VSOM Source | Skeleton Entity | Property |
|-------------|----------------|----------|
| Section 4 S3: regulatory frameworks | `ds:AppZone` Z-{PFI}-300 | `ds:zoneDescription` lists frameworks |
| GRC-FW instances | `ds:ZoneComponent` | compliance dashboard component |
| — | `ds:NavItem` | `nav-{pfi}-compliance` button |

### 2.7 Section 7 + Section 8 → Analytics Dashboard

If `hasKPI && hasBSC === true`:

| VSOM Source | Skeleton Entity | Property |
|-------------|----------------|----------|
| Section 7: BSC objectives | `ds:AppZone` Z-{PFI}-301 | `ds:zoneDescription` lists BSC perspectives |
| Section 8: KPI metrics | `ds:ZoneComponent` | analytics dashboard component |
| — | `ds:NavItem` | `nav-{pfi}-analytics` button |

### 2.8 Section 5 (PPM-ONT) → PPM Zone

If `hasPPM === true`:

| VSOM Source | Skeleton Entity | Property |
|-------------|----------------|----------|
| Section 1: PPM activation rules | `ds:AppZone` Z-{PFI}-302 | `ds:visibilityCondition` includes `state.ppmActive` |
| — | `ds:ZoneComponent` | PPM dashboard component |
| — | `ds:NavItem` | `nav-{pfi}-ppm` button |

### 2.9 Standard Nav Items (Always Generated)

Regardless of VSOM content, every PFI skeleton gets these L4 nav items:

| Nav Item | Action | Condition |
|----------|--------|-----------|
| `nav-{pfi}-agents` | `toggle{PFI}Agents` | Always |
| `nav-{pfi}-stakeholders` | `toggle{PFI}StakeholderMenu` | Always (if stakeholder roles exist) |
| `nav-{pfi}-compose` | `compose{PFI}Graph` | Always |
| `nav-{pfi}-freeze` | `freeze{PFI}Snapshot` | Only when `state.composedPFIGraph` |
| `nav-{pfi}-compliance` | `toggle{PFI}Compliance` | Only if `hasGRCFW` |
| `nav-{pfi}-analytics` | `toggle{PFI}Analytics` | Only if `hasKPI && hasBSC` |
| `nav-{pfi}-ppm` | `toggle{PFI}PPM` | Only if `hasPPM` |

### 2.10 Section 10 → Phase-Based Visibility (Advanced)

The delivery roadmap can optionally drive zone visibility by development phase. This is implemented via `ds:visibilityCondition` expressions that reference `state.activePhase`:

```
"ds:visibilityCondition": "state.activeInstanceId === '{pfiInstanceId}' && state.activePhase >= 2"
```

This is optional — most PFI skeletons will use the simpler instance-scoped visibility condition. Phase-based visibility is useful for PFI instances with a phased rollout where some zones should only appear when the corresponding phase is active.

---

## 3. Entity Count Formula

Given a VSOM brief with:
- `D` = number of domain agents
- `R` = number of stakeholder roles
- `G` = 1 if hasGRCFW, else 0
- `K` = 1 if hasKPI && hasBSC, else 0
- `P` = 1 if hasPPM, else 0

**Expected PFI entity counts:**

| Entity Type | Count Formula | FloodGraph (D=4, R=4, G=1, K=1, P=1) |
|-------------|--------------|----------------------------------------|
| Zones | 2 + D + R + G + K + P | 2 + 4 + 4 + 1 + 1 + 1 = 13 |
| Nav Items | 3 + D*(D>3?1:0) + 1 + G + K + P | 3 + 4 + 1 + 1 + 1 + 1 = 11 |
| Zone Components | 2 + D + R + G + K + P | 2 + 4 + 4 + 1 + 1 + 1 = 13 |
| Nav Layers | 0 (reuse PFC L4) | 0 |

**After merge with PFC base (22 zones, 26 items, 25 components):**

| Entity Type | PFC + PFI | FloodGraph |
|-------------|-----------|------------|
| Zones | 22 + count | 22 + 13 = 35 |
| Nav Items | 26 + count | 26 + 11 = 37 |
| Zone Components | 25 + count | 25 + 13 = 38 |
| Nav Layers | 5 + 0 | 5 |

---

## 4. Validation Checklist

After generating a PFI skeleton, verify:

- [ ] `ds:extendsApp` points to `ds:pfc-app-skeleton-v1.0.0`
- [ ] `ds:cascadeTier` is `"PFI"` on all new entities
- [ ] All zone IDs follow `Z-{PFI}-{nnn}` convention
- [ ] All nav item IDs follow `nav-{pfi}-{name}` convention
- [ ] All zone component IDs follow `cmp-{pfi}-{name}` convention
- [ ] No PFC zone IDs (Z1–Z99) are redefined
- [ ] No PFC nav items are redefined
- [ ] Every zone has at least one zone component
- [ ] Every zone component references a valid zone
- [ ] All nav items have non-empty `ds:action` (BR-DS-014)
- [ ] All zones have `ds:zoneType` and `ds:defaultVisible` (BR-DS-015)
- [ ] Visibility conditions use `state.activeInstanceId === '{pfiInstanceId}'`
- [ ] `ds:renderOrder` values are sequential within each layer
- [ ] JSON-LD is valid JSON with correct `@context`
- [ ] Entity counts match the formula above

---

*DS-ONT Mapping Rules — VSOM-to-Skeleton v1.0.0*
*Ref: pfi-app-skeleton-template-v1.0.0.jsonld, CONVENTION-PFI-Zone-ID.md, CONVENTION-Skeleton-Inheritance.md*
