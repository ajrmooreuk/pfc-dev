# Ontology Visualiser Enhanced — High Level Design v1.0.0

## Vision

Transform the Ontology Visualiser from a standalone browser tool into a **PFC Core Capability** with:
- Supabase-backed unified registry
- OAA v6.1.0 compliance validation
- Tiered organizational graph modeling
- PFI-customizable theming via Figma design tokens

```mermaid
flowchart TB
    subgraph PFC["PFC CORE CAPABILITY"]
        VIS["Ontology Visualiser"]
        VAL["OAA v6.1.0 Validator"]
        REG["Unified Registry"]
    end

    subgraph STORAGE["SUPABASE"]
        ONT_DB["ontologies JSONB"]
        GRAPH_DB["graph_nodes JSONB"]
        VERSIONS["version_history"]
    end

    subgraph PFI["PFI INSTANCES"]
        BAIV["PFI-BAIV"]
        W4M["PFI-W4M"]
        AZLAN["PFI-Azlan"]
    end

    subgraph FIGMA["FIGMA DESIGN SYSTEMS"]
        BAIV_DS["BAIV Tokens"]
        W4M_DS["W4M Tokens"]
    end

    PFC --> STORAGE
    PFI --> PFC
    FIGMA -->|"MCP extraction"| PFC

    style PFC fill:#e2f7ff,stroke:#00a4bf,stroke-width:3px
    style STORAGE fill:#c5fff5,stroke:#019587,stroke-width:2px
    style PFI fill:#f0e7fe,stroke:#6f0eb0,stroke-width:2px
    style FIGMA fill:#feedeb,stroke:#e84e1c,stroke-width:2px
```

---

## Feature Set

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| F1 | Supabase Registry | Store ontologies in JSONB with versioning | High |
| F2 | OAA v6.1.0 Validator | Validate any JSON against v6.1.0 spec | High |
| F3 | Tiered Graph Navigation | Drill-down from org → domain → entity | High |
| F4 | PFI Theming | Customize via Figma design tokens | Medium |
| F5 | Compliance Processor | Auto-upgrade non-compliant ontologies | Medium |
| F6 | Cross-Ontology Links | Connect nodes across ontologies | Low |

---

## Architecture Options

### Option A: Supabase-First (Recommended)

All ontologies stored in Supabase. Visualiser fetches from DB.

```mermaid
flowchart LR
    subgraph CLIENT["Browser Visualiser"]
        UI["Graph UI"]
        THEME["Theme Engine"]
        CACHE["Local Cache"]
    end

    subgraph EDGE["Supabase Edge Functions"]
        VALIDATE["validate-ontology"]
        RESOLVE["resolve-graph"]
        EXTRACT["extract-figma-tokens"]
    end

    subgraph DB["Supabase Postgres"]
        ONT["ontologies"]
        NODES["graph_nodes"]
        EDGES["graph_edges"]
        TOKENS["design_tokens"]
    end

    UI --> RESOLVE
    RESOLVE --> ONT
    RESOLVE --> NODES
    THEME --> TOKENS
    VALIDATE --> ONT

    style CLIENT fill:#f0e7fe,stroke:#6f0eb0
    style EDGE fill:#feedeb,stroke:#e84e1c
    style DB fill:#c5fff5,stroke:#019587
```

**Pros:**
- Single source of truth
- Real-time sync across instances
- Version history built-in
- Cross-ontology queries via SQL

**Cons:**
- Requires Supabase setup per PFI
- Network dependency for all operations

---

### Option B: Hybrid (Local + Sync)

Visualiser works offline with local files. Syncs to Supabase when connected.

```mermaid
flowchart LR
    subgraph LOCAL["Local Mode"]
        FILE["JSON Files"]
        INDEXDB["IndexedDB Cache"]
    end

    subgraph SYNC["Sync Layer"]
        DIFF["Diff Engine"]
        PUSH["Push to Supabase"]
        PULL["Pull from Supabase"]
    end

    subgraph CLOUD["Supabase"]
        REG["Registry"]
    end

    FILE --> INDEXDB
    INDEXDB --> DIFF
    DIFF --> PUSH
    PULL --> INDEXDB
    PUSH --> REG
    REG --> PULL

    style LOCAL fill:#fffad1,stroke:#cec528
    style SYNC fill:#feedeb,stroke:#e84e1c
    style CLOUD fill:#c5fff5,stroke:#019587
```

**Pros:**
- Works offline
- Fast local operations
- Gradual migration path

**Cons:**
- Sync complexity
- Potential conflicts
- Duplicate storage

---

### Option C: Registry-as-Service

Central PFC registry. PFIs query via API.

```mermaid
flowchart TB
    subgraph CENTRAL["PFC Central Registry"]
        API["REST/GraphQL API"]
        STORE["Ontology Store"]
        VAL["Validator Service"]
    end

    subgraph PFI1["PFI-BAIV"]
        VIS1["Visualiser Instance"]
    end

    subgraph PFI2["PFI-W4M"]
        VIS2["Visualiser Instance"]
    end

    VIS1 --> API
    VIS2 --> API
    API --> STORE
    API --> VAL

    style CENTRAL fill:#e2f7ff,stroke:#00a4bf,stroke-width:3px
```

**Pros:**
- True single source of truth
- Centralized governance
- Shared validation rules

**Cons:**
- Single point of failure
- Cross-org access control complexity
- Higher infrastructure cost

---

## Database Schema (Option A)

```sql
-- Ontology Registry
CREATE TABLE ontologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    pfi_id TEXT NOT NULL,           -- Which PFI owns this
    tier TEXT DEFAULT 'domain',     -- 'org', 'domain', 'entity'
    parent_id UUID REFERENCES ontologies(id),

    -- OAA v6.1.0 structure
    definition JSONB NOT NULL,      -- Full ontology JSON
    entities JSONB GENERATED ALWAYS AS (definition->'hasDefinedTerm') STORED,
    relationships JSONB GENERATED ALWAYS AS (definition->'relationships') STORED,

    -- Compliance
    oaa_version TEXT DEFAULT '5.0.0',
    compliance_status TEXT DEFAULT 'pending',
    validation_report JSONB,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by TEXT,

    UNIQUE(name, version, pfi_id)
);

-- Graph Nodes (denormalized for fast queries)
CREATE TABLE graph_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ontology_id UUID REFERENCES ontologies(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,          -- @id from ontology
    label TEXT NOT NULL,
    node_type TEXT,                 -- 'class', 'property', 'external'
    tier TEXT,                      -- Inherited from ontology
    properties JSONB,

    UNIQUE(ontology_id, node_id)
);

-- Graph Edges
CREATE TABLE graph_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ontology_id UUID REFERENCES ontologies(id) ON DELETE CASCADE,
    source_node TEXT NOT NULL,
    target_node TEXT NOT NULL,
    edge_type TEXT NOT NULL,        -- 'relationship', 'inheritance', 'reference'
    label TEXT,
    properties JSONB
);

-- Design Tokens (per PFI)
CREATE TABLE design_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pfi_id TEXT NOT NULL,
    figma_file_key TEXT,
    tokens JSONB NOT NULL,          -- Extracted token values
    last_synced_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(pfi_id)
);

-- Indexes for graph queries
CREATE INDEX idx_nodes_ontology ON graph_nodes(ontology_id);
CREATE INDEX idx_nodes_type ON graph_nodes(node_type);
CREATE INDEX idx_edges_source ON graph_edges(source_node);
CREATE INDEX idx_edges_target ON graph_edges(target_node);
CREATE INDEX idx_ontologies_tier ON ontologies(tier);
CREATE INDEX idx_ontologies_parent ON ontologies(parent_id);
```

---

## OAA v6.1.0 Validation

### Validation Gates (from OAA v6.1.0 Spec)

| Gate | Check | Action on Fail |
|------|-------|----------------|
| G1 | Schema completeness | Block |
| G2 | Relationship cardinality | Block |
| G2B | Entity connectivity (NEW) | Block |
| G2C | Graph connectivity | Warn |
| G3 | Business rules syntax | Block |
| G4 | Glossary completeness | Warn |
| G5 | Test data coverage | Warn |
| G6 | UniRegistry format | Block |

### Validation Flow

```mermaid
flowchart TB
    INPUT["Upload JSON"]
    DETECT["Detect Format"]

    subgraph VALIDATE["Validation Pipeline"]
        G1["G1: Schema"]
        G2["G2: Cardinality"]
        G2B["G2B: Entity Connectivity"]
        G3["G3: Business Rules"]
        G6["G6: UniRegistry"]
    end

    PASS["✓ Compliant"]
    FAIL["✗ Non-Compliant"]

    subgraph REMEDIATE["Remediation Options"]
        AUTO["Auto-fix (where possible)"]
        GUIDE["Guided manual fix"]
        UPGRADE["Upgrade to v6.1.0"]
    end

    INPUT --> DETECT
    DETECT --> G1
    G1 --> G2
    G2 --> G2B
    G2B --> G3
    G3 --> G6
    G6 -->|Pass| PASS
    G6 -->|Fail| FAIL
    FAIL --> REMEDIATE
    REMEDIATE --> INPUT

    style VALIDATE fill:#feedeb,stroke:#e84e1c
    style REMEDIATE fill:#fffad1,stroke:#cec528
```

---

## Tiered Graph Navigation

### Tier Hierarchy

```
Organization Graph (Tier 0)
└── Domain Ontologies (Tier 1)
    ├── VE Domain
    ├── CE Domain
    ├── Process Domain
    └── ...
        └── Entity Details (Tier 2)
            ├── Properties
            ├── Relationships
            └── Business Rules
```

### Navigation UX

```mermaid
flowchart LR
    subgraph T0["Tier 0: Organization"]
        ORG["Organization Node"]
    end

    subgraph T1["Tier 1: Domains"]
        VE["VE"]
        CE["CE"]
        PROC["Process"]
    end

    subgraph T2["Tier 2: Entities"]
        VP["ValueProposition"]
        CUST["Customer"]
        WF["Workflow"]
    end

    ORG --> VE
    ORG --> CE
    ORG --> PROC
    VE --> VP
    CE --> CUST
    PROC --> WF

    VP -.->|"cross-link"| CUST

    style T0 fill:#e2f7ff,stroke:#00a4bf
    style T1 fill:#c5fff5,stroke:#019587
    style T2 fill:#f0e7fe,stroke:#6f0eb0
```

**Interactions:**
- Click node → Drill down to next tier
- Double-click → Expand inline
- Right-click → Context menu (validate, edit, export)
- Breadcrumb navigation at top

---

## DS-E2E Integration (PFI Theming)

### Cross-Reference with ds-e2e-prototype

| DS-E2E Component | Visualiser Integration |
|------------------|------------------------|
| `DS_ACTIVE_BRAND` env var | Determines which Figma file to extract |
| MCP `get_variable_defs()` | Fetches color/typography tokens |
| 3-tier tokens (primitives → semantic → component) | Maps to visualiser CSS variables |
| Supabase `design_tokens` table | Caches extracted tokens |

### Theming Flow

```mermaid
flowchart LR
    subgraph CONFIG["PFI Config"]
        ENV["DS_ACTIVE_BRAND=baiv"]
        URL["Figma File URL"]
    end

    subgraph EXTRACT["MCP Extraction"]
        MCP["get_variable_defs()"]
        TRANSFORM["Token Transformer"]
    end

    subgraph STORE["Supabase"]
        TOKENS["design_tokens table"]
    end

    subgraph APPLY["Visualiser"]
        CSS["CSS Variables"]
        GRAPH["Graph Styles"]
    end

    ENV --> URL
    URL --> MCP
    MCP --> TRANSFORM
    TRANSFORM --> TOKENS
    TOKENS --> CSS
    CSS --> GRAPH

    style CONFIG fill:#fffad1,stroke:#cec528
    style EXTRACT fill:#feedeb,stroke:#e84e1c
    style STORE fill:#c5fff5,stroke:#019587
    style APPLY fill:#f0e7fe,stroke:#6f0eb0
```

### Token Mapping

```javascript
// Figma semantic tokens → Visualiser CSS
const tokenMapping = {
  // Node colors
  'color.surface.primary': '--vis-node-bg',
  'color.text.primary': '--vis-node-text',
  'color.border.default': '--vis-node-border',

  // Edge colors
  'color.accent.primary': '--vis-edge-relationship',
  'color.accent.secondary': '--vis-edge-inheritance',

  // Typography
  'font.family.body': '--vis-font-family',
  'font.size.sm': '--vis-font-size-label',

  // Spacing
  'spacing.md': '--vis-node-padding',
  'radius.md': '--vis-node-radius'
};
```

---

## Recommended Approach

### Phase 1: Foundation (Option A - Supabase-First)
1. Set up Supabase schema in Azlan (test PFI)
2. Implement OAA v6.1.0 validator as Edge Function
3. Add "Save to Registry" button in visualiser
4. Basic tiered navigation (2 levels)

### Phase 2: Theming
1. Integrate DS-E2E token extraction
2. Add theme switcher to visualiser
3. Store tokens in `design_tokens` table
4. Apply CSS variables dynamically

### Phase 3: Advanced Features
1. Cross-ontology linking
2. Full 3-tier navigation
3. Compliance auto-remediation
4. Organization-wide graph view

---

## Decision Points

| # | Decision | Options | Resolution |
|---|----------|---------|------------|
| D1 | Storage architecture | A (Supabase-First) / B (Hybrid) / C (Central) | **A** - Supabase-First |
| D2 | Validation location | Browser / Edge Function / Both | **Both** - Client + server |
| D3 | Theming source | Figma MCP / Pre-built CSS / Both | **Both** - MCP primary, CSS fallback |
| D4 | Graph library | vis.js (current) / D3 / Cytoscape | **vis.js** - Already integrated |
| D5 | Tier navigation | Separate views / Inline expansion / Both | **Both** - Flexibility |
| D6 | Multi-tenancy | Per-PFI Supabase / Shared with RLS | **Shared** - PFC distributes to PFIs |
| D7 | Compliance enforcement | Block / Allow with warning | **Allow + Recommend** - Non-blocking |
| D8 | Branding control | Open / RBAC-restricted | **RBAC** - Admins only |

---

## Governance Model (RESOLVED)

### PFC → PFI Arbitration

```mermaid
flowchart TB
    subgraph PFC["PF-CORE (Central)"]
        CONFIG["Core Config"]
        VALIDATOR["OAA v6.1.0 Validator"]
        REGISTRY["Master Registry"]
    end

    subgraph DIST["Distribution"]
        SYNC["Config Sync"]
    end

    subgraph PFI1["PFI-BAIV"]
        DS1["BAIV Design System"]
        ENV1["dev / test / prod"]
    end

    subgraph PFI2["PFI-W4M"]
        DS2["W4M Design System"]
        ENV2["dev / test / prod"]
    end

    subgraph PFI3["PFI-Azlan"]
        DS3["Azlan Design System"]
        ENV3["dev / test / prod"]
    end

    PFC -->|"arbitrates"| DIST
    DIST --> PFI1
    DIST --> PFI2
    DIST --> PFI3

    style PFC fill:#e2f7ff,stroke:#00a4bf,stroke-width:3px
    style DIST fill:#fffad1,stroke:#cec528
    style PFI1 fill:#f0e7fe,stroke:#6f0eb0
    style PFI2 fill:#f0e7fe,stroke:#6f0eb0
    style PFI3 fill:#f0e7fe,stroke:#6f0eb0
```

**Key Principles:**
- **One PF-Core config** distributed to all sub-platform PFIs
- **Each PFI** owns its design system (Figma file)
- **PFC arbitrates** validation rules, PFI handles execution
- **Visualiser** = PFC core capability, theming = PFI customization

---

## RBAC & Branding Control

### Default Behavior

| Role | Can View | Can Upload Ontology | Can Change PFI/Brand |
|------|----------|---------------------|----------------------|
| Viewer | ✓ | ✗ | ✗ |
| Editor | ✓ | ✓ | ✗ |
| Admin | ✓ | ✓ | ✓ |

### Brand Switching (RBAC-Protected)

```sql
-- RLS policy: Only admins can modify pfi_config
CREATE POLICY "Admins can modify PFI config"
ON pfi_config
FOR UPDATE
USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- Default PFI loaded on startup
CREATE TABLE pfi_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pfi_id TEXT NOT NULL DEFAULT 'baiv',
    figma_file_key TEXT,
    is_default BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### UI Behavior

- **Non-admins**: See current PFI branding, no switcher visible
- **Admins**: See brand switcher dropdown, can select PFI
- **Default PFI**: Configurable per deployment, defaults to primary brand

---

## Compliance Workflow (RESOLVED)

### Allow + Recommend Approach

```mermaid
flowchart TB
    UPLOAD["Upload Ontology"]
    VALIDATE["Run OAA v6.1.0 Validator"]

    subgraph RESULT["Validation Result"]
        PASS["✓ Compliant"]
        FAIL["⚠ Non-Compliant"]
    end

    subgraph ACTIONS["Non-Compliant Actions"]
        STORE["Store anyway (flagged)"]
        RECOMMEND["Recommend: Run OAA v6.1.0"]
        REPORT["Show validation report"]
    end

    UPLOAD --> VALIDATE
    VALIDATE --> PASS
    VALIDATE --> FAIL
    FAIL --> STORE
    FAIL --> RECOMMEND
    FAIL --> REPORT
    PASS -->|"Store clean"| DB[(Registry)]
    STORE -->|"Store with flag"| DB

    style PASS fill:#c5fff5,stroke:#019587
    style FAIL fill:#fffad1,stroke:#cec528
    style RECOMMEND fill:#feedeb,stroke:#e84e1c
```

**Workflow:**
1. User uploads ontology
2. Validator checks against OAA v6.1.0 gates
3. If non-compliant:
   - **Allow storage** with `compliance_status = 'non-compliant'`
   - **Show recommendation**: "Run OAA v6.1.0 agent to upgrade"
   - **Display report**: Which gates failed
4. Non-compliant ontologies visible but flagged in UI

---

## Environment Model (Dev/Test/Prod)

### Version Flow

```mermaid
flowchart LR
    subgraph DEV["Development"]
        D_ONT["Ontology v1.2.0-dev"]
        D_VAL["Validation: Optional"]
    end

    subgraph TEST["Testing"]
        T_ONT["Ontology v1.2.0-rc1"]
        T_VAL["Validation: Required"]
    end

    subgraph PROD["Production"]
        P_ONT["Ontology v1.1.0"]
        P_VAL["Validation: Enforced"]
    end

    DEV -->|"Promote"| TEST
    TEST -->|"Release"| PROD

    style DEV fill:#fffad1,stroke:#cec528
    style TEST fill:#feedeb,stroke:#e84e1c
    style PROD fill:#c5fff5,stroke:#019587
```

### Environment-Specific Rules

| Environment | Compliance Required | OAA Version | Branding |
|-------------|---------------------|-------------|----------|
| **dev** | No (warnings only) | Any | Switchable |
| **test** | Yes (must pass gates) | v6.1.0+ | Locked to target |
| **prod** | Yes (enforced) | v6.1.0+ | Locked |

### Database Schema Addition

```sql
-- Add environment column to ontologies
ALTER TABLE ontologies ADD COLUMN environment TEXT DEFAULT 'dev'
    CHECK (environment IN ('dev', 'test', 'prod'));

-- Environment-specific validation
CREATE OR REPLACE FUNCTION validate_for_environment()
RETURNS TRIGGER AS $$
BEGIN
    -- Prod requires full compliance
    IF NEW.environment = 'prod' AND NEW.compliance_status != 'compliant' THEN
        RAISE EXCEPTION 'Production ontologies must be OAA v6.1.0 compliant';
    END IF;

    -- Test requires validation to have run
    IF NEW.environment = 'test' AND NEW.validation_report IS NULL THEN
        RAISE EXCEPTION 'Test ontologies must have validation report';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_environment_rules
    BEFORE INSERT OR UPDATE ON ontologies
    FOR EACH ROW EXECUTE FUNCTION validate_for_environment();
```

---

## Updated Architecture

```mermaid
flowchart TB
    subgraph PFC["PF-CORE"]
        VIS["Ontology Visualiser<br/>(Core Capability)"]
        VAL["OAA v6.1.0 Validator"]
        CONFIG["PFC Config"]
    end

    subgraph SUPABASE["Shared Supabase"]
        ONT["ontologies<br/>+ environment column"]
        TOKENS["design_tokens<br/>per PFI"]
        RBAC["RLS Policies<br/>role-based access"]
    end

    subgraph PFI_LAYER["PFI Instances"]
        subgraph BAIV["PFI-BAIV"]
            B_DS["BAIV Figma"]
            B_ENV["dev|test|prod"]
        end
        subgraph W4M["PFI-W4M"]
            W_DS["W4M Figma"]
            W_ENV["dev|test|prod"]
        end
    end

    CONFIG -->|"distributes"| VIS
    VIS --> ONT
    VAL --> ONT
    TOKENS --> VIS
    B_DS -->|"MCP"| TOKENS
    W_DS -->|"MCP"| TOKENS
    RBAC --> ONT
    RBAC --> TOKENS

    style PFC fill:#e2f7ff,stroke:#00a4bf,stroke-width:3px
    style SUPABASE fill:#c5fff5,stroke:#019587,stroke-width:2px
    style PFI_LAYER fill:#f0e7fe,stroke:#6f0eb0,stroke-width:2px
```

---

## Related Documents

| Document | Location | Relevance |
|----------|----------|-----------|
| DS-E2E Implementation Plan | `PBS/DESIGN-SYSTEM/ds-e2e-prototype-azlan/ds-e2e-implementation-plan-azlan.md` | Token extraction pipeline |
| Azlan DS Config | `PBS/DESIGN-SYSTEM/ds-e2e-prototype-azlan/azlan-ds-config.json` | Brand switching config |
| OAA v6.1.0 System Prompt | `PBS/ONTOLOGIES/pfc-foundation-ont/oaa-system-prompts/oaa-v6.1.0-sys-prompt/` | Validation gates |
| Design System Ontology | `PBS/DESIGN-SYSTEM/ds-e2e-prototype-azlan/design-system-ontology-v1.0.0.json` | Token taxonomy |

---

## Resolved Questions

| # | Question | Resolution |
|---|----------|------------|
| Q1 | Multi-tenancy | Shared Supabase with RLS. PFC config distributed to PFIs. |
| Q2 | Compliance enforcement | Allow non-compliant + recommend OAA v6.1.0 upgrade |
| Q3 | Branding control | RBAC-protected. Default PFI. Only admins can switch. |
| Q4 | Environment handling | dev/test/prod with escalating validation requirements |

## Open Questions

1. **Graph performance**: At what scale (nodes/edges) do we need pagination/virtualization?
2. **Version promotion**: Automated dev→test→prod pipeline, or manual?
3. **Cross-PFI ontology sharing**: Can PFI-A reference ontologies from PFI-B?
4. **Offline mode**: Cache strategy for disconnected usage?

---

*HLD Version: 1.1.0*
*Created: 2026-01-31*
*Updated: 2026-01-31*
*Status: DECISIONS RESOLVED - Ready for Phase 1*
