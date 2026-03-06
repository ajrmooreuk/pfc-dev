# OAA Ontology Workbench - Architecture & Process Guide

**Version:** 1.0.0
**Date:** 2026-02-01

---

## Component Overview

| Component | Version | Type | Purpose |
|-----------|---------|------|---------|
| **OAA v7.0.0** | 7.0.0 | Agent (System Prompt) | AI agent that upgrades/creates ontologies |
| **OAA v5.0.0** | 5.0.0 | Schema Format | JSON-LD structure specification for ontologies |
| **Visualiser** | 1.1.0 | Browser Tool | Validates ontologies, triggers agent |

---

## Architecture Diagram

```mermaid
graph TB
    subgraph "User Interface Layer"
        VIS[/"Ontology Visualiser<br/>(browser-viewer.html)"/]
        LIB[(IndexedDB<br/>Library)]
    end

    subgraph "Validation Layer"
        G1[G1: Schema Structure]
        G2[G2: Relationship Cardinality]
        G2B[G2B: Entity Connectivity]
        G2C[G2C: Graph Connectivity]
        G3[G3: Business Rules]
        G4[G4: Semantic Consistency]
    end

    subgraph "Agent Layer"
        CLI[Claude Code CLI]
        OAA[/"OAA v7.0.0<br/>Agent System Prompt"/]
    end

    subgraph "Schema Layer"
        SCHEMA[/"OAA v5.0.0<br/>Schema Format"/]
    end

    subgraph "Storage Layer"
        FILES[/"Ontology Files<br/>*-oaa-v5.json"/]
        ARCHIVE[/"Archive<br/>*-legacy.json"/]
    end

    VIS -->|Load| FILES
    VIS -->|Validate| G1
    G1 --> G2 --> G2B --> G2C --> G3 --> G4

    G4 -->|Pass| LIB
    G4 -->|Fail| VIS

    VIS -->|"Upgrade with OAA v6"| CLI
    CLI -->|Execute| OAA
    OAA -->|Applies| SCHEMA
    OAA -->|Output| FILES
    FILES -->|Archive old| ARCHIVE

    style OAA fill:#5a67d8,color:#fff
    style SCHEMA fill:#d69e2e,color:#000
    style VIS fill:#017c75,color:#fff
    style G1 fill:#22c55e,color:#fff
    style G2 fill:#22c55e,color:#fff
    style G2B fill:#22c55e,color:#fff
    style G2C fill:#22c55e,color:#fff
    style G3 fill:#22c55e,color:#fff
    style G4 fill:#22c55e,color:#fff
```

---

## Component Relationships

```mermaid
graph LR
    subgraph "OAA v7.0.0 Agent"
        A1[System Prompt]
        A2[Upgrade Logic]
        A3[Validation Rules]
    end

    subgraph "OAA v5.0.0 Schema"
        S1["@context"]
        S2["entities[]"]
        S3["relationships[]"]
        S4["businessRules[]"]
    end

    subgraph "Visualiser"
        V1[File Loader]
        V2[Gate Validator]
        V3[Command Generator]
    end

    A1 -->|Defines| A2
    A2 -->|Produces| S1
    A2 -->|Produces| S2
    A2 -->|Produces| S3
    A2 -->|Produces| S4

    V2 -->|Checks| S1
    V2 -->|Checks| S2
    V2 -->|Checks| S3
    V2 -->|Checks| S4

    V3 -->|Invokes| A1

    style A1 fill:#5a67d8,color:#fff
    style S1 fill:#d69e2e,color:#000
    style S2 fill:#d69e2e,color:#000
    style S3 fill:#d69e2e,color:#000
    style S4 fill:#d69e2e,color:#000
    style V2 fill:#017c75,color:#fff
```

---

## Process Flow - Ontology Upgrade

```mermaid
sequenceDiagram
    participant U as User
    participant V as Visualiser
    participant G as Gate Validator
    participant C as Claude Code CLI
    participant A as OAA v7.0.0 Agent
    participant F as File System

    U->>V: Load ontology (drag/drop or file)
    V->>G: Run validation gates G1-G4

    alt All Gates Pass
        G->>V: ✅ Compliant
        V->>U: Show green status
        U->>V: Save to Library
    else Gates Fail
        G->>V: ❌ Non-compliant (list issues)
        V->>U: Show red status + issues
        U->>V: Click "Upgrade with OAA v6"
        V->>V: Generate upgrade prompt
        V->>U: Copy command to clipboard
        U->>C: Paste & execute command
        C->>A: Process with OAA v7.0.0 system prompt
        A->>A: Apply OAA v5.0.0 schema rules
        A->>C: Return upgraded JSON
        C->>F: Write to *-oaa-v5.json
        U->>F: Archive original to archive/
        U->>V: Load upgraded ontology
        V->>G: Re-validate gates
        G->>V: ✅ Compliant
    end
```

---

## Gate Validation Process

```mermaid
flowchart TD
    START([Load Ontology]) --> G1

    subgraph "Core Gates - Must Pass"
        G1{G1: Schema<br/>Valid JSON-LD?}
        G2{G2: Cardinality<br/>domain/range?}
        G2B{G2B: Connectivity<br/>All entities linked?}
        G2C{G2C: Graph<br/>Single component?}
        G3{G3: Rules<br/>IF-THEN format?}
        G4{G4: Semantic<br/>No duplicates?}
    end

    G1 -->|Pass| G2
    G1 -->|Fail| FAIL

    G2 -->|Pass| G2B
    G2 -->|Fail| FAIL

    G2B -->|Pass| G2C
    G2B -->|Fail| FAIL

    G2C -->|Pass| G3
    G2C -->|Fail| FAIL

    G3 -->|Pass| G4
    G3 -->|Fail| FAIL

    G4 -->|Pass| PASS
    G4 -->|Fail| FAIL

    PASS([✅ OAA v5.0.0 Compliant])
    FAIL([❌ Upgrade Required])

    FAIL --> UPGRADE[Run OAA v7.0.0 Agent]
    UPGRADE --> START

    style G1 fill:#22c55e,color:#fff
    style G2 fill:#22c55e,color:#fff
    style G2B fill:#22c55e,color:#fff
    style G2C fill:#22c55e,color:#fff
    style G3 fill:#22c55e,color:#fff
    style G4 fill:#22c55e,color:#fff
    style PASS fill:#16a34a,color:#fff
    style FAIL fill:#dc2626,color:#fff
    style UPGRADE fill:#5a67d8,color:#fff
```

---

## OAA v5.0.0 Schema Structure

```mermaid
graph TD
    subgraph "OAA v5.0.0 Ontology Structure"
        ROOT["Ontology JSON-LD"]

        CTX["@context<br/>schema.org, oaa, rdfs, owl"]
        ID["@id<br/>Ontology URI"]
        TYPE["@type: owl:Ontology"]
        META["Metadata<br/>name, description, version"]

        ENT["entities[]<br/>Array of entity definitions"]
        REL["relationships[]<br/>Array with cardinality"]
        RULES["businessRules[]<br/>condition/action format"]
        CTRL["changeControl<br/>Version history"]
    end

    ROOT --> CTX
    ROOT --> ID
    ROOT --> TYPE
    ROOT --> META
    ROOT --> ENT
    ROOT --> REL
    ROOT --> RULES
    ROOT --> CTRL

    subgraph "Entity Structure"
        E_ID["@id: namespace:EntityName"]
        E_TYPE["@type: rdfs:Class"]
        E_NAME["name"]
        E_SUB["rdfs:subClassOf"]
        E_DESC["description"]
        E_PROPS["oaa:properties[]"]
    end

    ENT --> E_ID
    ENT --> E_TYPE
    ENT --> E_NAME
    ENT --> E_SUB
    ENT --> E_DESC
    ENT --> E_PROPS

    subgraph "Relationship Structure"
        R_ID["@id: namespace:relationName"]
        R_TYPE["@type: owl:ObjectProperty"]
        R_DOM["domainIncludes[]"]
        R_RNG["rangeIncludes[]"]
        R_CARD["oaa:cardinality"]
    end

    REL --> R_ID
    REL --> R_TYPE
    REL --> R_DOM
    REL --> R_RNG
    REL --> R_CARD

    subgraph "Business Rule Structure"
        BR_ID["@id: namespace:BR-XXX"]
        BR_NAME["name"]
        BR_COND["condition: IF..."]
        BR_ACT["action: THEN...MUST"]
        BR_SEV["severity: error|warning"]
    end

    RULES --> BR_ID
    RULES --> BR_NAME
    RULES --> BR_COND
    RULES --> BR_ACT
    RULES --> BR_SEV

    style ROOT fill:#d69e2e,color:#000
    style ENT fill:#3b82f6,color:#fff
    style REL fill:#8b5cf6,color:#fff
    style RULES fill:#ec4899,color:#fff
```

---

## Step-by-Step Upgrade Process

### Step 1: Load Ontology in Visualiser

```
1. Open https://ajrmooreuk.github.io/Azlan-EA-AAA/
2. Drag & drop ontology JSON file
   OR paste GitHub raw URL
   OR select from Library
```

### Step 2: Review Compliance Status

```
┌─────────────────────────────────────────┐
│ OAA v5.0.0 Compliance                   │
├─────────────────────────────────────────┤
│ G1: Schema Structure      ✅ PASS       │
│ G2: Relationship Cardinality  ❌ FAIL   │
│ G2B: Entity Connectivity  ❌ FAIL       │
│ G2C: Graph Connectivity   ⚠️ WARN       │
│ G3: Business Rules        ❌ FAIL       │
│ G4: Semantic Consistency  ✅ PASS       │
├─────────────────────────────────────────┤
│ Status: NON-COMPLIANT                   │
│ [Upgrade with OAA v6] button visible    │
└─────────────────────────────────────────┘
```

### Step 3: Generate Upgrade Command

```
1. Click "Upgrade with OAA v6" button
2. Modal shows generated command
3. Click "Copy Command"
```

### Step 4: Execute OAA v7.0.0 Agent

```bash
# Paste in terminal with Claude Code installed
claude -p 'You are OAA v7.0.0. Upgrade this ontology to OAA v5.0.0 compliance.

## Issues to Fix
- G2: Missing domainIncludes/rangeIncludes
- G2B: Orphaned entities (no relationships)
- G3: Business rules not in IF-THEN format

## Current Ontology
{...json...}

Output ONLY the upgraded JSON.' > ontology-v2.0.0-oaa-v5.json
```

### Step 5: Archive & Reload

```
1. Move original to archive/ folder
2. Rename with -legacy suffix
3. Load upgraded file in Visualiser
4. Verify all gates now pass ✅
```

### Step 6: Save to Library

```
1. Click "Save to Library"
2. Enter version number
3. Add change notes
4. Previous version auto-archived
```

---

## File Naming Convention

```mermaid
graph LR
    subgraph "Ontology Folder Structure"
        DIR["ONTOLOGY-NAME/"]
        CURR["ontology-v2.0.0-oaa-v5.json<br/>(Current version)"]
        README["README.md"]
        ARCH["archive/"]
        LEGACY["ontology-v1.0.0-legacy.json<br/>(Previous version)"]
    end

    DIR --> CURR
    DIR --> README
    DIR --> ARCH
    ARCH --> LEGACY
```

| Pattern | Example | Purpose |
|---------|---------|---------|
| Folder | `PPM-ONT/` | UPPERCASE-ONT |
| Current | `ppm-module-v3.0.0-oaa-v5.json` | OAA v5.0.0 compliant |
| Legacy | `archive/ppm-module-v2.2.1-legacy.json` | Pre-upgrade version |
| README | `README.md` | Documentation |

---

## Summary

```mermaid
graph TB
    subgraph "What Each Component Does"
        OAA6["OAA v7.0.0<br/>━━━━━━━━━━━━━<br/>THE AGENT<br/>• System prompt for Claude<br/>• Upgrades ontologies<br/>• Applies schema rules<br/>• Fixes compliance issues"]

        OAA5["OAA v5.0.0<br/>━━━━━━━━━━━━━<br/>THE SCHEMA<br/>• JSON-LD structure spec<br/>• entities[] array format<br/>• relationships[] with cardinality<br/>• businessRules[] IF-THEN"]

        VIS2["Visualiser<br/>━━━━━━━━━━━━━<br/>THE VALIDATOR<br/>• Loads ontologies<br/>• Runs G1-G4 gates<br/>• Shows compliance status<br/>• Triggers agent upgrades"]
    end

    OAA6 -->|"Produces ontologies<br/>compliant with"| OAA5
    VIS2 -->|"Validates against"| OAA5
    VIS2 -->|"Invokes when<br/>non-compliant"| OAA6

    style OAA6 fill:#5a67d8,color:#fff
    style OAA5 fill:#d69e2e,color:#000
    style VIS2 fill:#017c75,color:#fff
```

---

*OAA Ontology Workbench v1.1.0 | Be AI Visible Platform*
