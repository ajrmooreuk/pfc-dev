# VP↔RRR Integration Enhancement Proposal v1.0.0

**Date:** 2026-02-02
**Author:** PFI Integration Architecture Agent
**Status:** PROPOSAL
**Target:** VP Ontology v1.2.0, BAIV VP Instance v1.1.0

---

## 1. Executive Summary

This proposal addresses the integration of **Value Proposition (VP)** ontology with **Roles, RACI & RBAC (RRR)** ontology to enable:

1. **Hierarchical ICP Structure** - CMO as top-level ICP cascading to marketing team roles as sub-ICPs
2. **Role-Based Problem Decomposition** - Functional role-specific problems that roll up to strategic CMO-level
3. **RACI Integration** - Accountability framework for VP activities and problem resolution
4. **RBAC Alignment** - Access control for VP artifacts based on role permissions

---

## 2. Current State Analysis

### 2.1 VP Ontology v1.1.0 Structure
```
ValueProposition
    ├── targetsICP ──────────► IdealCustomerProfile (flat structure)
    │                              ├── icpHasStakeholder ──► Stakeholder
    │                              └── manifestsAsPersona ──► efs:Persona
    └── addressesProblem ────► Problem (flat, not role-scoped)
                                   └── problemHasPainPoint ──► PainPoint
```

**Gap:** ICPs and Problems exist in flat hierarchy without role-based decomposition or roll-up mechanism.

### 2.2 RRR Ontology v3.0.0 Structure
```
ExecutiveRole (CMO, CEO, CTO...)
    ├── reportsTo ──────────► ExecutiveRole (hierarchy)
    ├── collaboratesWith ───► ExecutiveRole/FunctionalRole
    └── hasCapability ──────► Capability

FunctionalRole (Marketing, Sales...)
    ├── reportsTo ──────────► ExecutiveRole/FunctionalRole
    └── function ───────────► "Marketing" | "Sales" | etc.

RACIAssignment
    ├── activity ───────────► Activity/Process
    ├── role ───────────────► ExecutiveRole/FunctionalRole
    └── raciType ───────────► Responsible | Accountable | Consulted | Informed
```

**Opportunity:** Rich role hierarchy and RACI framework available for integration.

### 2.3 BAIV VP Instance Current State
```
ICPs (flat):
├── icp:midmarket-b2b-cmo ──────► Stakeholders: sh:cmo, sh:content-lead, sh:demand-gen
└── icp:growth-stage-marketer ──► Stakeholders: sh:vp-marketing, sh:founder

Problems (flat, not role-scoped):
├── prob:ai-invisibility
└── prob:legacy-seo-ineffective
```

---

## 3. Proposed Enhancements

### 3.1 New Entity: RoleBasedICP

**Purpose:** Bridge between VP ICP and RRR FunctionalRole to create role-scoped customer profiles with their own problems.

```json
{
  "@id": "vp:RoleBasedICP",
  "@type": "rdfs:Class",
  "name": "RoleBasedICP",
  "rdfs:subClassOf": "vp:IdealCustomerProfile",
  "description": "ICP specialized for a specific organizational role, enabling role-level problem decomposition and roll-up to strategic ICP",
  "properties": [
    {
      "name": "roleRef",
      "type": "Reference",
      "required": true,
      "references": ["pf:ExecutiveRole", "pf:FunctionalRole"],
      "description": "Link to RRR role this ICP represents"
    },
    {
      "name": "parentICP",
      "type": "Reference",
      "required": false,
      "references": "vp:IdealCustomerProfile",
      "description": "Parent ICP in hierarchy (for roll-up)"
    },
    {
      "name": "seniorityLevel",
      "type": "xsd:integer",
      "required": true,
      "description": "Mirrors RRR seniorityLevel: 1=C-Suite, 2=VP, 3=Director, 4=Manager, 5=Individual Contributor"
    },
    {
      "name": "functionScope",
      "type": "xsd:string",
      "required": false,
      "enum": ["Strategic", "Tactical", "Operational"],
      "description": "Scope of problems this role addresses"
    },
    {
      "name": "problemScopeFilter",
      "type": "xsd:string",
      "required": false,
      "description": "Filter for which problems apply at this role level"
    }
  ]
}
```

### 3.2 New Relationship: icpReportsTo

**Purpose:** Create ICP hierarchy mirroring organizational reporting structure.

```json
{
  "@id": "vp:icpReportsTo",
  "@type": "owl:ObjectProperty",
  "name": "ICP Reports To",
  "description": "Hierarchical ICP relationship mirroring organizational structure. Sub-ICP problems roll up to parent ICP.",
  "domainIncludes": ["vp:RoleBasedICP"],
  "rangeIncludes": ["vp:RoleBasedICP", "vp:IdealCustomerProfile"],
  "oaa:cardinality": {"min": 0, "max": 1},
  "oaa:crossOntologyRef": "RRR-ONT.reportsTo",
  "oaa:businessRule": "IF roleA.reportsTo = roleB THEN icpA.icpReportsTo = icpB"
}
```

### 3.3 New Relationship: problemRollsUpTo

**Purpose:** Enable tactical problems to aggregate to strategic problems.

```json
{
  "@id": "vp:problemRollsUpTo",
  "@type": "owl:ObjectProperty",
  "name": "Problem Rolls Up To",
  "description": "Tactical/operational problems roll up to strategic problems. Enables CMO-level visibility into team-level pain points.",
  "domainIncludes": ["vp:Problem"],
  "rangeIncludes": ["vp:Problem"],
  "oaa:cardinality": {"min": 0, "max": "*"},
  "oaa:constraint": "Child problem severity must be <= parent problem severity"
}
```

### 3.4 New Entity: VPRACIAssignment

**Purpose:** Apply RACI framework to VP activities (validation, problem resolution, solution delivery).

```json
{
  "@id": "vp:VPRACIAssignment",
  "@type": "rdfs:Class",
  "name": "VP RACI Assignment",
  "rdfs:subClassOf": "raci:RACIAssignment",
  "description": "RACI assignment for Value Proposition activities - who validates, who resolves problems, who delivers solutions",
  "properties": [
    {
      "name": "vpActivity",
      "type": "xsd:string",
      "required": true,
      "enum": [
        "VP_Validation",
        "ICP_Research",
        "Problem_Discovery",
        "Solution_Design",
        "Benefit_Measurement",
        "Pain_Resolution",
        "Competitive_Analysis",
        "Messaging_Development"
      ],
      "description": "VP-specific activity for RACI assignment"
    },
    {
      "name": "vpEntityRef",
      "type": "Reference",
      "required": false,
      "references": ["vp:ValueProposition", "vp:Problem", "vp:Solution", "vp:Benefit"],
      "description": "Specific VP entity this RACI applies to"
    }
  ]
}
```

---

## 4. BAIV AI Visibility: Proposed ICP Hierarchy

### 4.1 Role Hierarchy (From RRR)

```
CMO (seniorityLevel: 1)
├── VP Marketing (seniorityLevel: 2)
│   ├── Content Marketing Director (seniorityLevel: 3)
│   │   ├── SEO Manager (seniorityLevel: 4)
│   │   └── Content Manager (seniorityLevel: 4)
│   └── Demand Generation Director (seniorityLevel: 3)
│       ├── Digital Marketing Manager (seniorityLevel: 4)
│       └── Marketing Ops Manager (seniorityLevel: 4)
└── Brand Director (seniorityLevel: 3)
```

### 4.2 Corresponding ICP Hierarchy

```
icp:midmarket-b2b-cmo (Strategic - seniorityLevel: 1)
│   Problems: Strategic AI invisibility, Market positioning, Budget allocation
│
├── icp:vp-marketing (Tactical - seniorityLevel: 2)
│   │   Problems: Channel strategy gaps, Team capability, Tool selection
│   │
│   ├── icp:content-marketing-director (Tactical - seniorityLevel: 3)
│   │   │   Problems: Content optimization for AI, Content strategy alignment
│   │   │
│   │   ├── icp:seo-manager (Operational - seniorityLevel: 4)
│   │   │   Problems: Traditional SEO ineffective for AI, Keyword strategy gaps
│   │   │
│   │   └── icp:content-manager (Operational - seniorityLevel: 4)
│   │       Problems: Content structure for LLM retrieval, Metadata optimization
│   │
│   └── icp:demand-gen-director (Tactical - seniorityLevel: 3)
│       │   Problems: Attribution in AI channel, Lead source tracking
│       │
│       ├── icp:digital-marketing-manager (Operational - seniorityLevel: 4)
│       │   Problems: Campaign optimization for AI, Performance measurement
│       │
│       └── icp:marketing-ops-manager (Operational - seniorityLevel: 4)
│           Problems: Tool integration, Reporting automation, Data quality
│
└── icp:brand-director (Tactical - seniorityLevel: 3)
        Problems: Brand consistency in AI responses, Brand authority positioning
```

### 4.3 Problem Roll-Up Example

```
OPERATIONAL LEVEL (Manager):
├── prob:seo-keywords-ineffective (SEO Manager)
│   "Traditional keyword strategies don't influence AI citation"
│
├── prob:content-structure-poor (Content Manager)
│   "Content not structured for LLM retrieval patterns"
│
└── prob:attribution-gaps (Marketing Ops Manager)
    "Cannot attribute leads to AI discovery channel"

        │ problemRollsUpTo
        ▼

TACTICAL LEVEL (Director):
├── prob:content-not-ai-optimized (Content Marketing Director)
│   "Content strategy not aligned for AI visibility"
│   Aggregates: prob:seo-keywords-ineffective, prob:content-structure-poor
│
└── prob:measurement-blind-spots (Demand Gen Director)
    "Cannot measure AI channel performance"
    Aggregates: prob:attribution-gaps

        │ problemRollsUpTo
        ▼

STRATEGIC LEVEL (CMO):
└── prob:ai-invisibility (CMO - existing)
    "Complete invisibility to AI assistants"
    Aggregates: prob:content-not-ai-optimized, prob:measurement-blind-spots

    IMPACT: Strategic decision-making requires visibility into root causes
            CMO sees aggregated problem view with drill-down capability
```

---

## 5. RACI Matrix for BAIV VP Activities

| VP Activity | CMO | VP Marketing | Content Dir | SEO Mgr | Demand Gen Dir | Mktg Ops |
|-------------|-----|--------------|-------------|---------|----------------|----------|
| VP Validation | **A** | R | C | I | C | I |
| ICP Research | A | **R** | C | I | C | I |
| Problem Discovery | A | **R** | R | R | R | C |
| Solution Design | A | **R** | C | R | C | R |
| Benefit Measurement | **A** | R | I | I | R | **R** |
| Pain Resolution | A | **A** | R | R | R | C |
| Competitive Analysis | C | **A** | R | R | I | I |
| Messaging Development | **A** | R | **R** | C | C | I |

**Legend:** A = Accountable, R = Responsible, C = Consulted, I = Informed

---

## 6. New Join Patterns

### JP-VP-008: RRR-to-ICP Role Bridge
```
pf:ExecutiveRole[CMO] → vp:roleRef ← vp:RoleBasedICP → vp:icpReportsTo → vp:RoleBasedICP
```
**Use Case:** Navigate from organizational role to customer profile and hierarchy

### JP-VP-009: Problem Roll-Up Chain
```
vp:Problem[Operational] → vp:problemRollsUpTo → vp:Problem[Tactical] → vp:problemRollsUpTo → vp:Problem[Strategic]
```
**Use Case:** Trace root cause from strategic problem to operational details

### JP-VP-010: RACI-VP Activity Chain
```
vp:VPRACIAssignment → raci:role → pf:FunctionalRole → vp:roleRef ← vp:RoleBasedICP → vp:addressesProblem → vp:Problem
```
**Use Case:** Determine who is responsible for resolving specific problems

### JP-VP-011: ICP Hierarchy to EFS Persona
```
vp:RoleBasedICP[Operational] → vp:icpReportsTo → vp:RoleBasedICP[Tactical] → vp:manifestsAsPersona → efs:Persona
```
**Use Case:** Multiple operational ICPs can share tactical-level persona for story writing

---

## 7. Business Rules Additions

### BR-VP-017: ICP Hierarchy Consistency
```
IF vp:RoleBasedICP.roleRef.reportsTo = roleB
THEN vp:RoleBasedICP.icpReportsTo MUST reference RoleBasedICP where roleRef = roleB
```

### BR-VP-018: Problem Severity Roll-Up
```
IF vp:Problem.problemRollsUpTo = parentProblem
THEN vp:Problem.severity MUST be <= parentProblem.severity
(Critical > Major > Moderate > Minor)
```

### BR-VP-019: RACI Completeness for VP
```
IF vp:VPRACIAssignment.vpActivity = "VP_Validation"
THEN EXACTLY ONE role MUST have raciType = "Accountable"
AND AT LEAST ONE role MUST have raciType = "Responsible"
```

### BR-VP-020: ICP Seniority Alignment
```
IF vp:RoleBasedICP.parentICP exists
THEN vp:RoleBasedICP.seniorityLevel > parentICP.seniorityLevel
(Higher number = lower in hierarchy)
```

---

## 8. RBAC Integration for VP Artifacts

### Permission Model
```json
{
  "vpPermissions": [
    {
      "action": "Create",
      "resource": "vp:ValueProposition",
      "minimumSeniorityLevel": 2,
      "raciRequirement": "Accountable or Responsible"
    },
    {
      "action": "Update",
      "resource": "vp:Problem",
      "minimumSeniorityLevel": 4,
      "raciRequirement": "Responsible"
    },
    {
      "action": "Approve",
      "resource": "vp:ValueProposition",
      "minimumSeniorityLevel": 1,
      "raciRequirement": "Accountable"
    },
    {
      "action": "Read",
      "resource": "vp:*",
      "minimumSeniorityLevel": 5,
      "raciRequirement": "Informed"
    }
  ]
}
```

---

## 9. Implementation Approach

### Phase 1: Schema Enhancement (VP v1.2.0)
1. Add `vp:RoleBasedICP` entity
2. Add `vp:icpReportsTo` relationship
3. Add `vp:problemRollsUpTo` relationship
4. Add `vp:VPRACIAssignment` entity
5. Add new join patterns JP-VP-008 through JP-VP-011
6. Add business rules BR-VP-017 through BR-VP-020

### Phase 2: BAIV Instance Update (v1.1.0)
1. Convert existing flat ICPs to hierarchical RoleBasedICPs
2. Add role-specific sub-ICPs for marketing team
3. Create problem roll-up relationships
4. Add RACI assignments for VP activities
5. Link to RRR roles via roleRef

### Phase 3: Validation & Test Data
1. Generate G5 test data for new entities
2. Validate business rules
3. Test join pattern traversal
4. Update registry entry

---

## 10. Benefits

### For CMO (Strategic Level)
- **Aggregated problem view** with drill-down to root causes
- **Clear accountability** for VP validation and problem resolution
- **Strategic-to-tactical alignment** visible in ICP hierarchy

### For Marketing Team (Operational Level)
- **Role-specific problems** and pain points recognized
- **Clear ownership** of problem resolution via RACI
- **Contribution visibility** to strategic value proposition

### For BAIV Platform (AI Visibility)
- **Complete organizational mapping** from CMO to team roles
- **Process automation** with RACI-driven workflows
- **Contextual AI agent guidance** based on role and RACI

---

## 11. Next Steps

1. **Review & Approve** this proposal
2. **Create VP v1.2.0 schema** with new entities/relationships
3. **Update BAIV VP instance** with hierarchical ICPs
4. **Generate validation test data**
5. **Update unified registry** entry

---

## Appendix A: Visual Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VSOM-VP-RRR-EFS INTEGRATION                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐           ┌─────────────────────┐                         │
│  │ VSOM Layer  │           │      RRR Layer      │                         │
│  │ (Strategy)  │           │  (Organizational)   │                         │
│  │             │           │                     │                         │
│  │ Objective   │           │  ExecutiveRole:CMO  │◄────────────────────┐   │
│  │     │       │           │        │            │                     │   │
│  └─────┼───────┘           │        │ reportsTo  │                     │   │
│        │ alignsToObjective │        ▼            │                     │   │
│        │                   │  FunctionalRole     │                     │   │
│        ▼                   │  (Content,DemandGen)│                     │   │
│  ┌─────────────────────────┴─────────────────────┴─────────────────┐   │   │
│  │                         VP Layer                                 │   │   │
│  │                                                                  │   │   │
│  │  ValueProposition ────────► RoleBasedICP (CMO) ◄── roleRef ─────┘   │   │
│  │        │                          │                                  │   │
│  │        │ addressesProblem         │ icpReportsTo                    │   │
│  │        │                          ▼                                  │   │
│  │        │                    RoleBasedICP (Director)                 │   │
│  │        │                          │                                  │   │
│  │        ▼                          │ icpReportsTo                    │   │
│  │  Problem (Strategic) ◄────────────┼───────────────────┐             │   │
│  │        ▲                          ▼                   │             │   │
│  │        │ problemRollsUpTo   RoleBasedICP (Manager)    │             │   │
│  │        │                          │                   │             │   │
│  │  Problem (Tactical) ◄─────────────┼───────────────────┤             │   │
│  │        ▲                          │                   │             │   │
│  │        │ problemRollsUpTo         │                   │             │   │
│  │        │                          ▼                   │             │   │
│  │  Problem (Operational) ◄── addressesProblem ──────────┘             │   │
│  │                                                                     │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                          │
│                                 │ manifestsAsPersona, mapsToEpic          │
│                                 ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         EFS Layer                                     │  │
│  │                                                                       │  │
│  │  Persona (from ICP) ──► UserStory ──► Feature ──► Epic               │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Document Version: 1.0.0 | Proposal Status: Ready for Review*
