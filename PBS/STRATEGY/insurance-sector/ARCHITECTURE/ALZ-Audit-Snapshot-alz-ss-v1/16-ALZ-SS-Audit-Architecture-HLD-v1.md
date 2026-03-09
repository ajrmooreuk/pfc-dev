# ALZ Snapshot Audit - High-Level Design

**Document Version:** 1.1.0
**Date:** February 2026
**Document Type:** Architecture Overview
**Classification:** Technical Reference

---

## 1. Solution Overview

The ALZ Snapshot Audit is an automated assessment solution that provides rapid visibility into an Azure environment's security posture, compliance alignment, and governance maturity.

### 1.1 Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| **Read-Only** | All discovery via Azure APIs, no modifications |
| **Automated** | Minimal manual intervention required |
| **Modular** | Components can run independently |
| **Portable** | No Azure-side deployment required |
| **Auditable** | All outputs preserved for evidence |

### 1.2 Framework Alignment

The audit aligns with Microsoft's architecture frameworks:

| Framework | Alignment |
|-----------|-----------|
| **Cloud Adoption Framework (CAF)** | ALZ structure, governance maturity assessment |
| **Well-Architected Framework (WAF)** | 5-pillar quality assessment |
| **Microsoft Cloud Security Benchmark** | Security posture and compliance |

**WAF Pillar Coverage:**

```mermaid
flowchart LR
    subgraph WAF["Well-Architected Framework"]
        RE["Reliability<br/>RE"]
        SE["Security<br/>SE"]
        CO["Cost Optimization<br/>CO"]
        OE["Operational Excellence<br/>OE"]
        PE["Performance Efficiency<br/>PE"]
    end

    subgraph Audit["Audit Coverage"]
        A1["Backup & DR<br/>Assessment"]
        A2["MCSB & Defender<br/>Scores"]
        A3["Unused Resource<br/>Discovery"]
        A4["Monitoring &<br/>Automation"]
        A5["Scalability<br/>Review"]
    end

    RE --> A1
    SE --> A2
    CO --> A3
    OE --> A4
    PE --> A5

    style WAF fill:#e3f2fd
    style Audit fill:#e8f5e9
```

---

## 2. Component Architecture

```mermaid
flowchart TB
    subgraph Client["Client Environment"]
        subgraph Azure["Azure Estate"]
            Tenant[("Azure AD/Entra ID<br/>Tenant")]
            MGs["Management<br/>Groups"]
            Subs["Subscriptions"]
            Resources["Resources"]
            Defender["Defender for Cloud"]

            Tenant --> MGs
            MGs --> Subs
            Subs --> Resources
            Subs --> Defender
        end

        subgraph Access["Access Layer"]
            SP["Service Principal"]
            Reader["Reader Role"]
            SecReader["Security Reader"]
        end
    end

    subgraph Audit["Audit Toolkit"]
        subgraph Scripts["Automation Scripts"]
            FullAuto["15-Full-Auto.sh<br/>Orchestrator"]
            TenantDisc["14-Tenant-Discovery.py<br/>Structure Discovery"]
            QueryExec["11-Query-Executor.py<br/>Resource Queries"]
        end

        subgraph Config["Configuration"]
            KQL["05-KQL-Queries.json<br/>40+ Queries"]
            Compliance["06-Compliance-Mapping.json<br/>Control Mapping"]
        end

        subgraph Outputs["Output Artifacts"]
            JSON["JSON Exports"]
            CSV["CSV Reports"]
            Mermaid["Architecture Diagrams"]
            Summary["Compliance Summary"]
        end
    end

    subgraph Analysis["Analysis Layer"]
        Workbook["04-Azure-Workbook<br/>Interactive Dashboard"]
        Manual["Manual Review<br/>& Gap Analysis"]
        Report["Final Report<br/>Generation"]
    end

    Access -->|"Azure CLI Auth"| Scripts
    Azure -->|"Resource Graph API"| QueryExec
    Azure -->|"Management API"| TenantDisc
    Defender -->|"Security API"| QueryExec

    FullAuto --> TenantDisc
    FullAuto --> QueryExec
    Config --> QueryExec

    Scripts --> Outputs
    Outputs --> Analysis
    Outputs --> Workbook

    style Azure fill:#e3f2fd
    style Scripts fill:#fff3e0
    style Outputs fill:#e8f5e9
    style Analysis fill:#f3e5f5
```

---

## 3. Component Descriptions

### 3.1 Automation Scripts

| Component | File | Purpose | Dependencies |
|-----------|------|---------|--------------|
| **Orchestrator** | `15-ALZ-SS-Audit-Full-Auto-v1.sh` | Single-command audit execution | All below |
| **Tenant Discovery** | `14-ALZ-SS-Audit-Tenant-Discovery-v1.py` | MG/Subscription structure | Azure CLI |
| **Query Executor** | `11-ALZ-SS-Audit-Query-Executor-v1.py` | Resource Graph queries | Azure CLI, Python |
| **Run Script** | `12-ALZ-SS-Audit-Run-Script-v1.sh` | Legacy manual wrapper | Bash |

### 3.2 Configuration Files

| Component | File | Purpose |
|-----------|------|---------|
| **KQL Library** | `05-ALZ-SS-Audit-KQL-Queries-v1.json` | 40+ Resource Graph queries |
| **Compliance Map** | `06-ALZ-SS-Audit-Compliance-Mapping-v1.json` | MCSB/NIST/NCSC/ISO mapping |
| **Requirements** | `13-ALZ-SS-Audit-Requirements-v1.txt` | Python dependencies |

### 3.3 Analysis Tools

| Component | File | Purpose |
|-----------|------|---------|
| **Azure Workbook** | `04-ALZ-SS-Audit-Azure-Workbook-v1.workbook` | Interactive dashboard |
| **Ontology** | `07-ALZ-SS-Audit-OAA-Ontology-v1.json` | OAA compliance structure |

---

## 4. Workflow Architecture

### 4.1 End-to-End Process Flow

```mermaid
flowchart LR
    subgraph Phase1["Phase 1: Setup"]
        P1A[Client Grants<br/>Azure Access]
        P1B[Consultant<br/>Authenticates]
        P1A --> P1B
    end

    subgraph Phase2["Phase 2: Discovery"]
        P2A[Tenant<br/>Discovery]
        P2B[Resource<br/>Inventory]
        P2C[Security<br/>Scan]
        P2A --> P2B --> P2C
    end

    subgraph Phase3["Phase 3: Client Input"]
        P3A[Supplementary<br/>Questions]
        P3B[Diagram<br/>Review]
    end

    subgraph Phase4["Phase 4: Analysis"]
        P4A[Gap<br/>Analysis]
        P4B[Risk<br/>Assessment]
        P4C[Report<br/>Generation]
        P4A --> P4B --> P4C
    end

    subgraph Phase5["Phase 5: Delivery"]
        P5A[Findings<br/>Presentation]
        P5B[Data<br/>Handover]
    end

    Phase1 --> Phase2
    Phase2 --> Phase3
    Phase3 --> Phase4
    Phase4 --> Phase5

    style Phase1 fill:#ffecb3
    style Phase2 fill:#c8e6c9
    style Phase3 fill:#bbdefb
    style Phase4 fill:#e1bee7
    style Phase5 fill:#ffccbc
```

### 4.2 Automated Discovery Sequence

```mermaid
sequenceDiagram
    participant C as Consultant
    participant S as Full-Auto Script
    participant T as Tenant Discovery
    participant Q as Query Executor
    participant A as Azure APIs
    participant O as Output Files

    C->>S: ./15-Full-Auto.sh --output ./audit

    rect rgb(255, 243, 224)
        Note over S,T: Phase: Tenant Discovery
        S->>T: Execute tenant discovery
        T->>A: GET /tenants
        A-->>T: Tenant details
        T->>A: GET /managementGroups
        A-->>T: MG hierarchy
        T->>A: GET /subscriptions
        A-->>T: Subscription list
        T->>O: tenant-discovery.json
        T->>O: tenant-architecture.md (Mermaid)
        T-->>S: Discovery complete
    end

    rect rgb(200, 230, 201)
        Note over S,Q: Phase: Resource Inventory
        S->>Q: Execute KQL queries
        loop For each query in KQL config
            Q->>A: Resource Graph Query
            A-->>Q: Query results
            Q->>O: {query-name}.json/csv
        end
        Q-->>S: Queries complete
    end

    rect rgb(187, 222, 251)
        Note over S,O: Phase: Compliance Summary
        S->>O: Generate compliance-summary.md
        S->>O: Generate audit-report.md
    end

    S-->>C: Audit complete - see ./audit/
```

---

## 5. Data Flow Architecture

### 5.1 Data Sources and Sinks

```mermaid
flowchart LR
    subgraph Sources["Data Sources"]
        S1[("Azure Resource<br/>Graph")]
        S2[("Management<br/>Groups API")]
        S3[("Subscriptions<br/>API")]
        S4[("Defender<br/>for Cloud")]
        S5[("RBAC<br/>Assignments")]
    end

    subgraph Transform["Processing"]
        T1["Query<br/>Executor"]
        T2["Tenant<br/>Discovery"]
        T3["Compliance<br/>Mapper"]
    end

    subgraph Outputs["Output Formats"]
        O1["JSON<br/>(Raw Data)"]
        O2["CSV<br/>(Analysis)"]
        O3["Markdown<br/>(Diagrams)"]
        O4["Workbook<br/>(Interactive)"]
    end

    S1 --> T1
    S4 --> T1
    S5 --> T1
    S2 --> T2
    S3 --> T2

    T1 --> O1
    T1 --> O2
    T2 --> O1
    T2 --> O3
    T3 --> O2

    O1 --> O4

    style Sources fill:#e3f2fd
    style Transform fill:#fff3e0
    style Outputs fill:#e8f5e9
```

### 5.2 Output File Taxonomy

```mermaid
flowchart TB
    subgraph Root["audit-output/"]
        subgraph Tenant["tenant/"]
            TF1["tenant-discovery.json"]
            TF2["subscriptions.json"]
            TF3["management-groups.json"]
            TF4["tenant-architecture.md"]
        end

        subgraph Resources["resources/"]
            RF1["inventory-full.json"]
            RF2["inventory-by-type.csv"]
            RF3["untagged-resources.csv"]
        end

        subgraph Security["security/"]
            SF1["secure-scores.json"]
            SF2["mcsb-v2-storage.csv"]
            SF3["keyvaults.json"]
            SF4["storage-security.csv"]
        end

        subgraph Network["network/"]
            NF1["vnets.json"]
            NF2["subnets.csv"]
            NF3["peerings.json"]
            NF4["nsgs.json"]
        end

        subgraph Reports["reports/"]
            RPT1["compliance-summary.md"]
            RPT2["audit-report.md"]
            RPT3["risk-summary.csv"]
        end
    end

    style Tenant fill:#e3f2fd
    style Resources fill:#fff3e0
    style Security fill:#ffcdd2
    style Network fill:#c8e6c9
    style Reports fill:#f3e5f5
```

---

## 6. Integration Architecture

### 6.1 Azure API Integration

| API | Endpoint | Purpose | Auth |
|-----|----------|---------|------|
| **Resource Graph** | `management.azure.com/providers/Microsoft.ResourceGraph/resources` | Resource queries | Bearer token |
| **Management Groups** | `management.azure.com/providers/Microsoft.Management/managementGroups` | Hierarchy discovery | Bearer token |
| **Subscriptions** | `management.azure.com/subscriptions` | Subscription list | Bearer token |
| **Defender** | `management.azure.com/providers/Microsoft.Security` | Security posture | Bearer token |
| **Policy** | `management.azure.com/providers/Microsoft.Authorization/policyAssignments` | Governance | Bearer token |

### 6.2 Authentication Flow

```mermaid
flowchart LR
    subgraph Local["Local Machine"]
        CLI["Azure CLI"]
        Scripts["Audit Scripts"]
    end

    subgraph Auth["Authentication"]
        AAD["Azure AD<br/>/Entra ID"]
        Token["Access Token"]
    end

    subgraph Azure["Azure"]
        ARM["Azure Resource<br/>Manager"]
        Graph["Resource<br/>Graph"]
    end

    CLI -->|"az login"| AAD
    AAD -->|"OAuth 2.0"| Token
    Token --> Scripts
    Scripts -->|"Bearer Token"| ARM
    Scripts -->|"Bearer Token"| Graph

    style Auth fill:#fff3e0
```

---

## 7. Deployment Topology

### 7.1 Runtime Environment

```mermaid
flowchart TB
    subgraph Consultant["Consultant Workstation"]
        subgraph Runtime["Runtime Requirements"]
            Python["Python 3.10+"]
            AzCLI["Azure CLI 2.x"]
            Bash["Bash 4.x+"]
        end

        subgraph Toolkit["Audit Toolkit"]
            Scripts2["Scripts (11-15)"]
            Config2["Config (05-07)"]
            Docs["Documentation (01-03)"]
        end

        subgraph LocalOut["Local Output"]
            Exports["JSON/CSV Exports"]
            Diagrams["Mermaid Diagrams"]
        end
    end

    subgraph Optional["Optional: Azure Portal"]
        Workbook2["Azure Workbook<br/>(Interactive View)"]
    end

    Runtime --> Toolkit
    Toolkit --> LocalOut
    LocalOut -.->|"Upload"| Workbook2

    style Runtime fill:#e3f2fd
    style Toolkit fill:#fff3e0
    style LocalOut fill:#e8f5e9
    style Optional fill:#f5f5f5
```

### 7.2 No Azure Deployment Required

The audit toolkit is **fully portable** and requires:
- No resources deployed to client Azure
- No Azure Functions or Logic Apps
- No storage accounts for outputs
- No network connectivity from Azure to consultant

All processing occurs on the consultant's local machine using standard Azure CLI authentication.

---

## 8. Security Architecture

### 8.1 Permissions Model

```mermaid
flowchart TB
    subgraph SP["Service Principal / User"]
        Identity["Audit Identity"]
    end

    subgraph Roles["Required Roles"]
        R1["Reader<br/>(All Subscriptions)"]
        R2["Security Reader<br/>(All Subscriptions)"]
        R3["Management Group<br/>Reader (Root)"]
    end

    subgraph Scope["Permission Scope"]
        Root["Root Management<br/>Group"]
        AllSubs["All Subscriptions<br/>(Inherited)"]
    end

    Identity --> R1
    Identity --> R2
    Identity --> R3

    R1 --> Root
    R2 --> Root
    R3 --> Root
    Root --> AllSubs

    style SP fill:#e3f2fd
    style Roles fill:#fff3e0
    style Scope fill:#e8f5e9
```

### 8.2 Data Handling

| Data Type | Handling | Retention |
|-----------|----------|-----------|
| Resource metadata | Exported to local files | Client discretion |
| Security scores | Exported to local files | Client discretion |
| RBAC assignments | Exported to local files | Redact before sharing |
| Secrets/keys | **Never exported** | N/A |
| Access tokens | In-memory only | Session duration |

---

## 9. Extensibility Points

### 9.1 Adding Custom Queries

New KQL queries can be added to `05-ALZ-SS-Audit-KQL-Queries-v1.json`:

```json
{
  "queries": [
    {
      "name": "custom-query",
      "description": "Custom resource query",
      "query": "Resources | where type == 'microsoft.compute/virtualmachines'",
      "outputFormat": "json"
    }
  ]
}
```

### 9.2 Adding Compliance Controls

New control mappings can be added to `06-ALZ-SS-Audit-Compliance-Mapping-v1.json`:

```json
{
  "controls": [
    {
      "id": "CUSTOM-001",
      "framework": "Custom Framework",
      "mcsbMapping": ["NS-1", "NS-2"],
      "queryRef": "custom-query"
    }
  ]
}
```

---

## 10. Component Dependencies

```mermaid
flowchart BT
    subgraph Core["Core Dependencies"]
        AzCLI2["Azure CLI"]
        Python2["Python 3.10+"]
        Bash2["Bash 4.x"]
    end

    subgraph PyDeps["Python Packages"]
        Azure["azure-mgmt-resource"]
        Identity["azure-identity"]
        Graph["azure-mgmt-resourcegraph"]
    end

    subgraph Scripts3["Audit Scripts"]
        S15["15-Full-Auto.sh"]
        S14["14-Tenant-Discovery.py"]
        S11["11-Query-Executor.py"]
    end

    AzCLI2 --> S15
    Bash2 --> S15
    Python2 --> S14
    Python2 --> S11
    PyDeps --> S14
    PyDeps --> S11

    S15 --> S14
    S15 --> S11

    style Core fill:#e3f2fd
    style PyDeps fill:#fff3e0
    style Scripts3 fill:#e8f5e9
```

---

## Document Control

**Status:** DRAFT - To Be Discussed

| Version | Date | Author | Status | Changes |
|---------|------|--------|--------|---------|
| 1.0.0 | 2026-02-03 | Advisory Team | Draft | Initial release |
| 1.1.0 | 2026-02-03 | Advisory Team | Draft | Added Section 1.2 Framework Alignment with WAF pillar coverage |
