# RRR-RACI-RBAC Ontology Visual Guide

**Platform Foundation Core | Governance & Access Control Framework**

Version: 1.0.0  
Date: November 2025  
Status: Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [RRR: Roles, Responsibilities, Relationships](#2-rrr-roles-responsibilities-relationships)
3. [RACI: Assignment Matrix](#3-raci-assignment-matrix)
4. [RBAC: Access Control Model](#4-rbac-access-control-model)
5. [Ontology Structure](#5-ontology-structure)
6. [Integration with Solution Architect Agent](#6-integration-with-solution-architect-agent)
7. [Implementation Guidelines](#7-implementation-guidelines)

---

## 1. Overview

This guide defines the comprehensive governance framework for PF-Core platform operations, combining:
- **RRR (Roles, Responsibilities, Relationships)**: Organizational structure and accountability
- **RACI (Responsible, Accountable, Consulted, Informed)**: Task assignment and communication matrix
- **RBAC (Role-Based Access Control)**: Technical permission and security model

### Key Principles

```mermaid
graph TB
    subgraph "Governance Framework"
        RRR[RRR: Organizational Structure]
        RACI[RACI: Task Assignment]
        RBAC[RBAC: Access Control]
    end
    
    subgraph "Core Entities"
        Individual[INDIVIDUAL<br/>Real Person]
        Role[ROLE<br/>Organizational Position]
        User[USER<br/>System Account]
    end
    
    RRR --> Role
    RACI --> Role
    RBAC --> User
    
    Individual -->|fills| Role
    Individual -->|has| User
    Role -->|grants| User
    
    style RRR fill:#e1f5ff
    style RACI fill:#fff4e1
    style RBAC fill:#ffe1f5
    style Individual fill:#c8e6c9
    style Role fill:#ffcc80
    style User fill:#ce93d8
```

### Critical Distinctions

| Entity | Definition | Example | Governed By |
|--------|------------|---------|-------------|
| **INDIVIDUAL** | Real person who fills roles | Amanda Wilson | HR, Legal |
| **ROLE** | Organizational position/function | Solution Architect, CMO | RRR, RACI |
| **USER** | System account with permissions | amanda@baiv.ai (user_id: uuid) | RBAC |

---

## 2. RRR: Roles, Responsibilities, Relationships

### 2.1 Role Hierarchy

```mermaid
graph TD
    subgraph "Executive Layer"
        CEO[CEO<br/>Chief Executive Officer]
        CTO[CTO<br/>Chief Technology Officer]
        CMO[CMO<br/>Chief Marketing Officer]
        CFO[CFO<br/>Chief Financial Officer]
    end
    
    subgraph "Management Layer"
        PlatArch[Platform Architect<br/>Human]
        SolArch[Solution Architect<br/>Human Lead]
        MarDir[Marketing Director]
        FinDir[Finance Director]
    end
    
    subgraph "Operational Layer - Human"
        DevLead[Development Lead]
        QALead[QA Lead]
        ContentLead[Content Strategist]
        Analyst[Business Analyst]
    end
    
    subgraph "Operational Layer - Agents"
        SolArchAgent[Solution Architect Agent<br/>Claude SDK]
        DBAgent[Database Designer Agent]
        UIAgent[UI/UX Builder Agent]
        IntAgent[Integration Agent]
        VSOMAgent[VSOM Context Agent]
        OAAAgent[Ontology Architect Agent]
    end
    
    CEO --> CTO
    CEO --> CMO
    CEO --> CFO
    
    CTO --> PlatArch
    CTO --> SolArch
    CMO --> MarDir
    CFO --> FinDir
    
    PlatArch --> DevLead
    PlatArch --> QALead
    SolArch --> DevLead
    MarDir --> ContentLead
    FinDir --> Analyst
    
    SolArch -.orchestrates.-> SolArchAgent
    SolArchAgent -.delegates to.-> DBAgent
    SolArchAgent -.delegates to.-> UIAgent
    SolArchAgent -.delegates to.-> IntAgent
    SolArchAgent -.coordinates with.-> VSOMAgent
    SolArchAgent -.validates with.-> OAAAgent
    
    style CEO fill:#ff6b6b
    style CTO fill:#4ecdc4
    style PlatArch fill:#95e1d3
    style SolArch fill:#95e1d3
    style SolArchAgent fill:#f3a683
    style DBAgent fill:#f7d794
    style UIAgent fill:#f7d794
    style IntAgent fill:#f7d794
```

### 2.2 Role Responsibilities Matrix

```mermaid
graph LR
    subgraph "Strategic Roles"
        R1[CEO<br/>-Vision & Mission<br/>-Strategic Objectives<br/>-Board Relations]
        R2[CTO<br/>-Technology Strategy<br/>-Architecture Governance<br/>-Innovation Pipeline]
        R3[CMO<br/>-Market Strategy<br/>-Brand Management<br/>-Customer Acquisition]
    end
    
    subgraph "Architectural Roles"
        R4[Platform Architect<br/>-PF-Core Standards<br/>-Technology Stack<br/>-Security Baseline]
        R5[Solution Architect<br/>-HLD/LLD Generation<br/>-Agent Orchestration<br/>-Pattern Library]
        R6[Solution Architect Agent<br/>-Automated Design<br/>-Compliance Validation<br/>-Context Packaging]
    end
    
    subgraph "Implementation Roles"
        R7[Database Designer Agent<br/>-Schema Design<br/>-RLS Policies<br/>-Migration Scripts]
        R8[UI/UX Builder Agent<br/>-Component Generation<br/>-Figma Integration<br/>-Accessibility]
        R9[Integration Agent<br/>-API Specifications<br/>-MCP Configuration<br/>-Data Contracts]
    end
    
    R1 --> R2
    R2 --> R4
    R4 --> R5
    R5 --> R6
    R6 --> R7
    R6 --> R8
    R6 --> R9
    
    style R1 fill:#ff6b6b
    style R2 fill:#4ecdc4
    style R3 fill:#95e1d3
    style R4 fill:#f3a683
    style R5 fill:#f3a683
    style R6 fill:#f7d794
    style R7 fill:#c8e6c9
    style R8 fill:#c8e6c9
    style R9 fill:#c8e6c9
```

### 2.3 Role Relationships

```mermaid
graph TD
    subgraph "Upstream Dependencies"
        VSOM[VSOM Strategic<br/>Context Agent]
        VE[Value Engineering<br/>Agent]
        OAA[Ontology Architect<br/>Agent]
    end
    
    subgraph "Core Architecture"
        SA[Solution Architect<br/>Agent]
    end
    
    subgraph "Downstream Consumers"
        DB[Database Designer<br/>Agent]
        UI[UI/UX Builder<br/>Agent]
        INT[Integration<br/>Agent]
        SEC[Security<br/>Agent]
    end
    
    subgraph "Orchestration"
        AM[Agent Manager]
    end
    
    VSOM -->|provides strategic context| SA
    VE -->|provides value propositions| SA
    OAA -->|validates ontology| SA
    
    SA -->|generates schema specs| DB
    SA -->|generates component specs| UI
    SA -->|generates API contracts| INT
    SA -->|generates security baseline| SEC
    
    AM -->|coordinates| SA
    AM -->|monitors| DB
    AM -->|monitors| UI
    AM -->|monitors| INT
    AM -->|monitors| SEC
    
    style VSOM fill:#e1f5ff
    style VE fill:#e1f5ff
    style OAA fill:#e1f5ff
    style SA fill:#f3a683
    style DB fill:#c8e6c9
    style UI fill:#c8e6c9
    style INT fill:#c8e6c9
    style SEC fill:#c8e6c9
    style AM fill:#ce93d8
```

---

## 3. RACI: Assignment Matrix

### 3.1 RACI Definitions

| Letter | Role | Description |
|--------|------|-------------|
| **R** | Responsible | Does the work to complete the task |
| **A** | Accountable | Ultimately answerable for correct completion (only ONE per task) |
| **C** | Consulted | Provides input and expertise (two-way communication) |
| **I** | Informed | Kept up-to-date on progress (one-way communication) |

### 3.2 RACI Matrix - Architecture Process

```mermaid
graph TB
    subgraph "Architecture Activities"
        A1[1. Requirements<br/>Analysis]
        A2[2. HLD<br/>Generation]
        A3[3. LLD<br/>Generation]
        A4[4. Ontology<br/>Validation]
        A5[5. Agent<br/>Handoff]
        A6[6. Implementation<br/>Monitoring]
    end
    
    subgraph "RACI Assignments"
        direction TB
        
        R1["Platform Architect:<br/>C, A, I, C, I, A"]
        R2["Solution Architect (Human):<br/>R, A, C, C, R, C"]
        R3["Solution Architect Agent:<br/>C, R, R, R, R, R"]
        R4["Ontology Architect Agent:<br/>I, C, C, A, I, I"]
        R5["Database Designer Agent:<br/>I, I, C, I, C, R"]
        R6["Agent Manager:<br/>I, I, I, I, A, A"]
    end
    
    A1 --> R1
    A2 --> R1
    A3 --> R1
    A4 --> R1
    A5 --> R1
    A6 --> R1
    
    A1 --> R2
    A2 --> R2
    A3 --> R2
    A4 --> R2
    A5 --> R2
    A6 --> R2
    
    A1 --> R3
    A2 --> R3
    A3 --> R3
    A4 --> R3
    A5 --> R3
    A6 --> R3
    
    A1 --> R4
    A2 --> R4
    A3 --> R4
    A4 --> R4
    A5 --> R4
    A6 --> R4
    
    A1 --> R5
    A2 --> R5
    A3 --> R5
    A4 --> R5
    A5 --> R5
    A6 --> R5
    
    A1 --> R6
    A2 --> R6
    A3 --> R6
    A4 --> R6
    A5 --> R6
    A6 --> R6
    
    style A1 fill:#e1f5ff
    style A2 fill:#fff4e1
    style A3 fill:#ffe1f5
    style A4 fill:#e1ffe1
    style A5 fill:#ffe1e1
    style A6 fill:#f5e1ff
```

### 3.3 Detailed RACI Matrix Table

| Activity | Platform Architect | Solution Architect (Human) | Solution Architect Agent | Ontology Architect Agent | Database Designer Agent | UI/UX Builder Agent | Agent Manager |
|----------|-------------------|---------------------------|-------------------------|------------------------|------------------------|-------------------|--------------|
| **Requirements Analysis** | C | R, A | C | I | I | I | I |
| **VSOM Alignment Validation** | A | R | C | C | I | I | I |
| **HLD Generation** | A | C | R | C | I | I | I |
| **Ontology Compliance Check** | I | C | R | A | I | I | C |
| **LLD Generation** | I | C | R | C | C | C | I |
| **Database Schema Design** | I | C | C | C | R, A | I | C |
| **UI Component Specification** | I | C | C | I | I | R, A | C |
| **API Contract Definition** | I | C | R | C | C | C | A |
| **Agent Context Packaging** | I | C | R | I | C | C | A |
| **Implementation Validation** | A | R | C | C | C | C | A |
| **Architecture Decision Records** | C | R, A | R | C | I | I | I |
| **Pattern Library Management** | A | R | R | C | I | I | C |

**Legend:**
- **R** = Responsible (does the work)
- **A** = Accountable (ultimately answerable)
- **C** = Consulted (provides input)
- **I** = Informed (kept updated)

---

## 4. RBAC: Access Control Model

### 4.1 RBAC Architecture

```mermaid
graph TB
    subgraph "Users (System Accounts)"
        U1[user_id: uuid<br/>email<br/>auth_provider]
        U2[tenant_users table<br/>user ↔ tenant ↔ role]
    end
    
    subgraph "Roles (Positions)"
        R1[super_admin]
        R2[admin]
        R3[manager]
        R4[member]
        R5[viewer]
        R6[agent]
    end
    
    subgraph "Permissions (Actions)"
        P1[tenant.create]
        P2[tenant.read]
        P3[tenant.update]
        P4[tenant.delete]
        P5[architecture.create]
        P6[architecture.read]
        P7[architecture.update]
        P8[agent.execute]
    end
    
    subgraph "Resources (Objects)"
        RES1[Tenant Data]
        RES2[Architectures]
        RES3[Ontologies]
        RES4[Agent Executions]
    end
    
    U1 --> U2
    U2 --> R1
    U2 --> R2
    U2 --> R3
    U2 --> R4
    U2 --> R5
    U2 --> R6
    
    R1 --> P1
    R1 --> P2
    R1 --> P3
    R1 --> P4
    R1 --> P5
    R1 --> P6
    R1 --> P7
    R1 --> P8
    
    R2 --> P2
    R2 --> P3
    R2 --> P5
    R2 --> P6
    R2 --> P7
    
    R3 --> P2
    R3 --> P6
    R3 --> P7
    
    R4 --> P2
    R4 --> P6
    
    R5 --> P2
    R5 --> P6
    
    R6 --> P8
    
    P1 --> RES1
    P2 --> RES1
    P3 --> RES1
    P4 --> RES1
    P5 --> RES2
    P6 --> RES2
    P7 --> RES2
    P8 --> RES4
    
    style U1 fill:#ce93d8
    style U2 fill:#ce93d8
    style R1 fill:#ff6b6b
    style R2 fill:#f3a683
    style R3 fill:#f7d794
    style R4 fill:#95e1d3
    style R5 fill:#c8e6c9
    style R6 fill:#dda0dd
```

### 4.2 Permission Hierarchy

```mermaid
graph LR
    subgraph "Permission Levels"
        L1[NONE<br/>No Access]
        L2[READ<br/>View Only]
        L3[WRITE<br/>Create/Update]
        L4[DELETE<br/>Remove]
        L5[ADMIN<br/>Full Control]
    end
    
    subgraph "Role Mappings"
        direction TB
        Viewer[Viewer<br/>READ]
        Member[Member<br/>READ, WRITE]
        Manager[Manager<br/>READ, WRITE]
        Admin[Admin<br/>READ, WRITE, DELETE]
        SuperAdmin[Super Admin<br/>ADMIN]
    end
    
    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> L5
    
    L2 -.grants.-> Viewer
    L3 -.grants.-> Member
    L3 -.grants.-> Manager
    L4 -.grants.-> Admin
    L5 -.grants.-> SuperAdmin
    
    style L1 fill:#ffcccc
    style L2 fill:#c8e6c9
    style L3 fill:#fff4e1
    style L4 fill:#ffe1f5
    style L5 fill:#ff6b6b
```

### 4.3 Row-Level Security (RLS) Model

```mermaid
graph TB
    subgraph "User Context"
        UC[Current User<br/>user_id, tenant_id, role]
    end
    
    subgraph "RLS Policies"
        P1{Tenant Isolation<br/>Policy}
        P2{Role-Based<br/>Policy}
        P3{Owner-Based<br/>Policy}
    end
    
    subgraph "Database Tables"
        T1[tenant_users]
        T2[solution_architectures]
        T3[high_level_designs]
        T4[low_level_designs]
        T5[architecture_patterns]
    end
    
    subgraph "Access Decision"
        GRANT[GRANT Access]
        DENY[DENY Access]
    end
    
    UC --> P1
    UC --> P2
    UC --> P3
    
    P1 -->|tenant_id matches| T1
    P1 -->|tenant_id matches| T2
    P1 -->|tenant_id matches| T3
    P1 -->|tenant_id matches| T4
    P1 -->|tenant_id matches| T5
    
    P2 -->|role has permission| T2
    P2 -->|role has permission| T3
    P2 -->|role has permission| T4
    
    P3 -->|user is owner| T2
    P3 -->|user is owner| T3
    P3 -->|user is owner| T4
    
    T1 --> GRANT
    T2 --> GRANT
    T3 --> GRANT
    T4 --> GRANT
    T5 --> GRANT
    
    P1 -.fails.-> DENY
    P2 -.fails.-> DENY
    P3 -.fails.-> DENY
    
    style UC fill:#ce93d8
    style P1 fill:#fff4e1
    style P2 fill:#ffe1f5
    style P3 fill:#e1ffe1
    style GRANT fill:#c8e6c9
    style DENY fill:#ffcccc
```

---

## 5. Ontology Structure

### 5.1 Core Ontology Entities

```mermaid
graph TB
    subgraph "Person & Identity Ontologies"
        Individual[schema:Person<br/>INDIVIDUAL<br/>Real human being]
        User[schema:UserAccount<br/>USER<br/>System account]
    end
    
    subgraph "Organization & Role Ontologies"
        Org[schema:Organization<br/>ORGANIZATION<br/>Tenant/Company]
        Role[schema:Role<br/>ROLE<br/>Organizational position]
        Team[schema:OrganizationTeam<br/>TEAM<br/>Functional group]
    end
    
    subgraph "Authorization Ontologies"
        Permission[schema:DigitalDocumentPermission<br/>PERMISSION<br/>Access right]
        Policy[baiv:SecurityPolicy<br/>POLICY<br/>Access rule]
    end
    
    subgraph "Architecture Ontologies"
        SolArch[sa:SolutionArchitecture<br/>Architecture design]
        HLD[sa:HighLevelDesign<br/>Component design]
        LLD[sa:LowLevelDesign<br/>Detailed specs]
    end
    
    Individual -->|hasAccount| User
    Individual -->|memberOf| Org
    Individual -->|holds| Role
    Role -->|memberOf| Team
    Team -->|partOf| Org
    
    User -->|hasRole| Role
    Role -->|grants| Permission
    Permission -->|governs| Policy
    
    Role -->|responsible for| SolArch
    SolArch -->|contains| HLD
    HLD -->|details| LLD
    
    Policy -->|protects| SolArch
    Policy -->|protects| HLD
    Policy -->|protects| LLD
    
    style Individual fill:#c8e6c9
    style User fill:#ce93d8
    style Org fill:#ffcc80
    style Role fill:#f3a683
    style Permission fill:#dda0dd
    style Policy fill:#ff9999
    style SolArch fill:#e1f5ff
    style HLD fill:#fff4e1
    style LLD fill:#ffe1f5
```

### 5.2 RACI Ontology Mapping

```mermaid
graph LR
    subgraph "RACI Matrix Ontology"
        Activity[schema:Action<br/>ACTIVITY<br/>Work to be done]
        Assignment[baiv:RACIAssignment<br/>Role assignment]
        RACIType[baiv:RACIType<br/>R, A, C, or I]
    end
    
    subgraph "Role Ontology"
        Role[schema:Role<br/>ROLE<br/>Position]
    end
    
    subgraph "Task Ontology"
        Task[schema:Task<br/>TASK<br/>Specific work item]
        Status[schema:ActionStatusType<br/>STATUS]
    end
    
    Activity -->|hasAssignment| Assignment
    Assignment -->|assignsRole| Role
    Assignment -->|withType| RACIType
    
    Activity -->|creates| Task
    Task -->|assignedTo| Role
    Task -->|hasStatus| Status
    
    RACIType -->|values| R[Responsible]
    RACIType -->|values| A[Accountable]
    RACIType -->|values| C[Consulted]
    RACIType -->|values| I[Informed]
    
    style Activity fill:#e1f5ff
    style Assignment fill:#fff4e1
    style RACIType fill:#ffe1f5
    style Role fill:#f3a683
    style Task fill:#c8e6c9
    style R fill:#ff9999
    style A fill:#ff6b6b
    style C fill:#fff4e1
    style I fill:#c8e6c9
```

### 5.3 RBAC Ontology Mapping

```mermaid
graph TB
    subgraph "Access Control Ontology"
        Subject[schema:Person<br/>or schema:Agent<br/>SUBJECT<br/>Who requests access]
        Action[schema:Action<br/>ACTION<br/>What to do]
        Resource[schema:Thing<br/>RESOURCE<br/>What to access]
    end
    
    subgraph "Permission Model"
        Permission[schema:DigitalDocumentPermission<br/>PERMISSION]
        Grant[baiv:PermissionGrant<br/>Allowed action]
        Deny[baiv:PermissionDeny<br/>Forbidden action]
    end
    
    subgraph "Policy Enforcement"
        Policy[baiv:AccessPolicy<br/>POLICY]
        Rule[baiv:AccessRule<br/>RULE]
        Decision[baiv:AccessDecision<br/>GRANT/DENY]
    end
    
    Subject -->|requests| Action
    Action -->|on| Resource
    
    Subject -->|has| Permission
    Permission -->|enables| Grant
    Permission -->|restricts| Deny
    
    Grant -->|allows| Action
    Deny -->|blocks| Action
    
    Policy -->|contains| Rule
    Rule -->|evaluates| Decision
    Decision -->|affects| Action
    
    style Subject fill:#ce93d8
    style Action fill:#e1f5ff
    style Resource fill:#c8e6c9
    style Permission fill:#dda0dd
    style Grant fill:#c8e6c9
    style Deny fill:#ffcccc
    style Policy fill:#ff9999
    style Decision fill:#f3a683
```

---

## 6. Integration with Solution Architect Agent

### 6.1 Agent RACI Assignment

```mermaid
graph TB
    subgraph "Architecture Workflow"
        W1[Requirements<br/>Analysis]
        W2[HLD<br/>Generation]
        W3[LLD<br/>Generation]
        W4[Agent<br/>Handoff]
        W5[Implementation<br/>Validation]
    end
    
    subgraph "Solution Architect Agent RACI"
        R1[W1: Consulted<br/>Provides technical context]
        R2[W2: Responsible<br/>Generates HLD]
        R3[W3: Responsible<br/>Generates LLD]
        R4[W4: Responsible<br/>Creates context packages]
        R5[W5: Consulted<br/>Validates compliance]
    end
    
    subgraph "Human Oversight"
        H1[Platform Architect:<br/>Accountable for all]
        H2[Solution Architect:<br/>Responsible for W1<br/>Accountable for W2-W4]
    end
    
    W1 --> R1
    W2 --> R2
    W3 --> R3
    W4 --> R4
    W5 --> R5
    
    R1 -.reports to.-> H2
    R2 -.reports to.-> H2
    R3 -.reports to.-> H2
    R4 -.reports to.-> H2
    R5 -.reports to.-> H1
    
    H2 -.escalates to.-> H1
    
    style W1 fill:#e1f5ff
    style W2 fill:#fff4e1
    style W3 fill:#ffe1f5
    style W4 fill:#e1ffe1
    style W5 fill:#ffe1e1
    style R2 fill:#f3a683
    style R3 fill:#f3a683
    style R4 fill:#f3a683
    style H1 fill:#ff6b6b
    style H2 fill:#ff9999
```

### 6.2 Agent RBAC Configuration

```mermaid
graph LR
    subgraph "Agent Identity"
        AgentUser[Agent User Account<br/>pf-core-solution-architect<br/>user_id: uuid]
        AgentRole[Agent Role<br/>solution_architect_agent]
    end
    
    subgraph "Granted Permissions"
        P1[architecture.create]
        P2[architecture.read]
        P3[architecture.update]
        P4[ontology.read]
        P5[ontology.validate]
        P6[pattern.read]
        P7[agent.delegate]
        P8[vsom.read]
    end
    
    subgraph "Restricted Actions"
        D1[❌ architecture.delete]
        D2[❌ ontology.create]
        D3[❌ ontology.update]
        D4[❌ user.manage]
        D5[❌ tenant.configure]
    end
    
    AgentUser --> AgentRole
    
    AgentRole --> P1
    AgentRole --> P2
    AgentRole --> P3
    AgentRole --> P4
    AgentRole --> P5
    AgentRole --> P6
    AgentRole --> P7
    AgentRole --> P8
    
    AgentRole -.denied.-> D1
    AgentRole -.denied.-> D2
    AgentRole -.denied.-> D3
    AgentRole -.denied.-> D4
    AgentRole -.denied.-> D5
    
    style AgentUser fill:#ce93d8
    style AgentRole fill:#dda0dd
    style P1 fill:#c8e6c9
    style P2 fill:#c8e6c9
    style P3 fill:#c8e6c9
    style P4 fill:#c8e6c9
    style P5 fill:#c8e6c9
    style P6 fill:#c8e6c9
    style P7 fill:#c8e6c9
    style P8 fill:#c8e6c9
    style D1 fill:#ffcccc
    style D2 fill:#ffcccc
    style D3 fill:#ffcccc
    style D4 fill:#ffcccc
    style D5 fill:#ffcccc
```

---

## 7. Implementation Guidelines

### 7.1 Database Schema for RRR-RACI-RBAC

```mermaid
erDiagram
    individuals ||--o{ tenant_users : fills
    tenant_users }o--|| tenants : belongs_to
    tenant_users }o--|| roles : has
    roles ||--o{ role_permissions : grants
    role_permissions }o--|| permissions : specifies
    
    individuals {
        uuid individual_id PK
        string name
        string email
        string phone
        jsonb metadata
    }
    
    tenants {
        uuid tenant_id PK
        string name
        string domain
        jsonb settings
    }
    
    tenant_users {
        uuid id PK
        uuid user_id FK
        uuid tenant_id FK
        enum role
        boolean is_active
        timestamp created_at
    }
    
    roles {
        uuid role_id PK
        string role_name
        string description
        jsonb raci_assignments
        enum role_type
    }
    
    role_permissions {
        uuid id PK
        uuid role_id FK
        uuid permission_id FK
        boolean is_granted
    }
    
    permissions {
        uuid permission_id PK
        string permission_name
        string resource_type
        enum action_type
        jsonb constraints
    }
    
    raci_assignments {
        uuid assignment_id PK
        uuid activity_id FK
        uuid role_id FK
        enum raci_type
        jsonb metadata
    }
    
    activities {
        uuid activity_id PK
        string activity_name
        string description
        uuid accountable_role FK
        jsonb requirements
    }
```

### 7.2 Implementation Checklist

#### Phase 1: Foundation

- [ ] Define individuals table for real people
- [ ] Implement tenant_users for user-tenant-role mapping
- [ ] Create roles enum with all organizational positions
- [ ] Establish permissions table with resource-action pairs
- [ ] Build role_permissions junction table
- [ ] Implement RLS policies for tenant isolation

#### Phase 2: RACI Matrix

- [ ] Create activities table for workflow steps
- [ ] Build raci_assignments table for role assignments
- [ ] Implement RACI validation rules (exactly one Accountable)
- [ ] Create RACI matrix views for reporting
- [ ] Build agent role assignment system
- [ ] Implement RACI change notification system

#### Phase 3: RBAC Enforcement

- [ ] Implement permission checking functions
- [ ] Create RLS policies per table
- [ ] Build permission inheritance model
- [ ] Implement agent service accounts
- [ ] Create audit logging for access attempts
- [ ] Build permission escalation workflows

#### Phase 4: Ontology Integration

- [ ] Map database entities to schema.org types
- [ ] Create JSON-LD representations of all entities
- [ ] Implement OAA Registry v3.0 compliance
- [ ] Build ontology validation tools
- [ ] Create semantic query capabilities
- [ ] Implement knowledge graph exports

### 7.3 Key SQL Implementation Examples

#### Creating Role with Permissions

```sql
-- Create a role
INSERT INTO roles (role_id, role_name, description, role_type)
VALUES (
    gen_random_uuid(),
    'solution_architect_agent',
    'Automated solution architecture generation and validation',
    'agent'
);

-- Grant permissions
INSERT INTO role_permissions (role_id, permission_id, is_granted)
SELECT 
    r.role_id,
    p.permission_id,
    true
FROM roles r
CROSS JOIN permissions p
WHERE r.role_name = 'solution_architect_agent'
AND p.permission_name IN (
    'architecture.create',
    'architecture.read',
    'architecture.update',
    'ontology.read',
    'ontology.validate',
    'pattern.read',
    'agent.delegate',
    'vsom.read'
);
```

#### RACI Assignment

```sql
-- Create activity
INSERT INTO activities (activity_id, activity_name, accountable_role)
VALUES (
    gen_random_uuid(),
    'HLD Generation',
    (SELECT role_id FROM roles WHERE role_name = 'platform_architect')
);

-- Assign RACI
INSERT INTO raci_assignments (assignment_id, activity_id, role_id, raci_type)
VALUES
    (gen_random_uuid(), 
     (SELECT activity_id FROM activities WHERE activity_name = 'HLD Generation'),
     (SELECT role_id FROM roles WHERE role_name = 'solution_architect_agent'),
     'responsible'),
    (gen_random_uuid(),
     (SELECT activity_id FROM activities WHERE activity_name = 'HLD Generation'),
     (SELECT role_id FROM roles WHERE role_name = 'platform_architect'),
     'accountable'),
    (gen_random_uuid(),
     (SELECT activity_id FROM activities WHERE activity_name = 'HLD Generation'),
     (SELECT role_id FROM roles WHERE role_name = 'ontology_architect_agent'),
     'consulted');
```

#### RLS Policy Example

```sql
-- Tenant isolation policy
CREATE POLICY tenant_isolation_policy ON solution_architectures
    FOR ALL
    TO authenticated
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

-- Role-based read policy
CREATE POLICY role_read_policy ON solution_architectures
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM tenant_users tu
            JOIN role_permissions rp ON tu.role = rp.role_id
            JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE tu.user_id = auth.uid()
            AND tu.tenant_id = solution_architectures.tenant_id
            AND p.permission_name = 'architecture.read'
            AND rp.is_granted = true
        )
    );
```

---

## 8. Validation and Testing

### 8.1 RACI Validation Rules

```mermaid
graph TD
    Start[RACI Assignment] --> Check1{Exactly one<br/>Accountable?}
    Check1 -->|No| Error1[ERROR: Must have<br/>exactly one A]
    Check1 -->|Yes| Check2{At least one<br/>Responsible?}
    Check2 -->|No| Error2[ERROR: Must have<br/>at least one R]
    Check2 -->|Yes| Check3{Accountable is not<br/>also Responsible?}
    Check3 -->|A is also R| Warning1[WARNING: A should<br/>delegate to R]
    Check3 -->|A is not R| Check4{All roles exist?}
    Warning1 --> Check4
    Check4 -->|No| Error3[ERROR: Invalid<br/>role reference]
    Check4 -->|Yes| Valid[VALID RACI]
    
    style Start fill:#e1f5ff
    style Valid fill:#c8e6c9
    style Error1 fill:#ffcccc
    style Error2 fill:#ffcccc
    style Error3 fill:#ffcccc
    style Warning1 fill:#fff4e1
```

### 8.2 RBAC Test Cases

| Test Case | Subject | Resource | Action | Expected Result |
|-----------|---------|----------|--------|-----------------|
| TC-001 | solution_architect_agent | architecture-123 | create | GRANT |
| TC-002 | solution_architect_agent | architecture-123 | delete | DENY |
| TC-003 | solution_architect_agent | ontology-456 | update | DENY |
| TC-004 | solution_architect_agent | ontology-456 | validate | GRANT |
| TC-005 | admin_user | architecture-123 | delete | GRANT |
| TC-006 | viewer_user | architecture-123 | update | DENY |
| TC-007 | agent (different tenant) | architecture-123 | read | DENY |

---

## Appendix A: Complete Role Catalog

| Role Name | Type | RBAC Level | Primary Responsibilities |
|-----------|------|------------|-------------------------|
| super_admin | Human | ADMIN | Platform administration, tenant management |
| admin | Human | DELETE | Tenant administration, user management |
| platform_architect | Human | DELETE | Architecture governance, technology standards |
| solution_architect | Human | WRITE | Architecture design, agent supervision |
| manager | Human | WRITE | Team management, project oversight |
| developer | Human | WRITE | Code implementation, testing |
| member | Human | WRITE | Content creation, collaboration |
| viewer | Human | READ | View-only access |
| solution_architect_agent | Agent | WRITE | HLD/LLD generation, validation |
| database_designer_agent | Agent | WRITE | Schema design, migration scripts |
| ui_ux_builder_agent | Agent | WRITE | Component generation, Figma integration |
| integration_agent | Agent | WRITE | API contracts, MCP configuration |
| vsom_context_agent | Agent | READ | Strategic context retrieval |
| ontology_architect_agent | Agent | READ | Ontology validation, compliance |
| agent_manager | Agent | ADMIN | Agent orchestration, monitoring |

---

## Appendix B: Schema.org Ontology Mappings

| PF-Core Entity | Schema.org Type | Properties |
|----------------|-----------------|------------|
| Individual | schema:Person | name, email, telephone, memberOf |
| User | schema:UserAccount | accountId, hasRole |
| Organization | schema:Organization | name, legalName, member |
| Role | schema:Role | roleName, description, namedPosition |
| Team | schema:OrganizationTeam | name, member, parentOrganization |
| Permission | schema:DigitalDocumentPermission | grantee, permissionType |
| Activity | schema:Action | name, agent, object, result |
| RACI Assignment | baiv:RACIAssignment (custom) | activity, role, raciType |
| Solution Architecture | sa:SolutionArchitecture (custom) | name, version, components |

---

***--- END OF DOCUMENT ---***
