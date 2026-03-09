# PII Protection Architecture: Visual Guide

## Microsoft-Native Stack for Web Applications

**Document Version:** 2.0.0  
**Date:** February 2026  
**Platform:** PF-Core Security Module  
**Classification:** INTERNAL USE

---

## 1. High-Level Architecture Overview

The architecture follows a defense-in-depth approach with six distinct layers, each providing specific security controls for PII protection. All components deploy to UK South for data residency compliance.

```mermaid
flowchart TB
    subgraph USER["👤 USER LAYER"]
        WebApp[Next.js Web App<br/>shadcn/ui]
        Mobile[Mobile App]
        Desktop[Desktop App]
    end

    subgraph GATEWAY["🔐 GATEWAY LAYER"]
        APIM[Azure API Management<br/>Rate Limiting • Logging]
        Entra[Microsoft Entra ID<br/>Authentication • RBAC]
    end

    subgraph PII["🛡️ PII PROTECTION LAYER"]
        Presidio[Presidio Service<br/>Detection • Anonymization]
        ContentSafety[Azure AI Content Safety<br/>UK Entities • Moderation]
    end

    subgraph AI["🤖 AI PROCESSING LAYER"]
        OpenAI[Azure OpenAI<br/>UK South Regional<br/>GPT-4o]
    end

    subgraph DATA["💾 DATA LAYER"]
        SQLGraph[Azure SQL Database<br/>Graph Tables<br/>Always Encrypted]
        GraphAPI[Microsoft Graph API<br/>Users • Files • Permissions]
    end

    subgraph GOV["📊 GOVERNANCE LAYER"]
        Purview[Microsoft Purview<br/>Classification • DLP]
        Monitor[Azure Monitor<br/>Log Analytics]
        Sentinel[Microsoft Sentinel<br/>Security Alerts]
    end

    USER --> GATEWAY
    GATEWAY --> PII
    PII --> AI
    AI --> DATA
    DATA --> GOV
    
    Entra -.->|Auth| APIM
    GraphAPI -.->|Sync| SQLGraph
    Purview -.->|Scan| SQLGraph

    style USER fill:#e3f2fd,stroke:#1976d2
    style GATEWAY fill:#fff3e0,stroke:#f57c00
    style PII fill:#ffebee,stroke:#c62828
    style AI fill:#e8f5e9,stroke:#388e3c
    style DATA fill:#f3e5f5,stroke:#7b1fa2
    style GOV fill:#eceff1,stroke:#546e7a
```

**Layer Responsibilities:**

| Layer | Primary Function | UK Data Residency |
|-------|-----------------|-------------------|
| **User** | Frontend interfaces | App Service UK South |
| **Gateway** | Authentication, rate limiting, request logging | APIM UK South |
| **PII Protection** | Detect, block, or anonymize PII before AI processing | Container Apps UK South |
| **AI Processing** | LLM inference with anonymized inputs only | Azure OpenAI UK South Regional |
| **Data** | Graph storage with encryption, M365 integration | SQL Database UK South |
| **Governance** | Classification, audit trails, security monitoring | Purview + Monitor UK South |

---

## 2. PII-Protected Request Flow

Every request passes through a strict pipeline that ensures PII is either blocked (for high-risk types) or anonymized (for lower-risk types) before reaching the AI model. The response is also scanned for potential PII leakage.

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 User
    participant A as 🔐 API Gateway
    participant E as 🎫 Entra ID
    participant P as 🛡️ Presidio
    participant C as ⚠️ Content Safety
    participant O as 🤖 Azure OpenAI
    participant D as 💾 SQL Graph
    participant S as 🚨 Sentinel

    U->>A: POST /api/ai/completion
    A->>E: Validate Token
    E-->>A: ✓ tenant_id, user_id
    
    A->>P: Scan Input for PII
    
    alt High-Risk PII Detected (NINO, NHS, Credit Card)
        P-->>A: 🚫 BLOCK
        A->>D: Log blocked attempt
        A-->>U: 400 - Request blocked
        D->>S: Alert: High-risk PII blocked
    else Low/Medium Risk PII Detected
        P->>P: Anonymize (replace, mask)
        P-->>A: ✓ Anonymized prompt
        A->>C: Content Safety Check
        C-->>A: ✓ Safe
        A->>O: Send anonymized prompt
        O-->>A: AI Response
        A->>P: Scan Output for PII
        
        alt PII in Output (Leakage)
            P-->>A: ⚠️ Leakage detected
            A->>D: Log with severity=critical
            D->>S: Alert: PII Leakage
        else Clean Output
            P-->>A: ✓ Clean
        end
        
        A->>D: Log interaction + audit
        A-->>U: 200 - Response
    else No PII Detected
        P-->>A: ✓ Clean prompt
        A->>O: Send prompt
        O-->>A: AI Response
        A->>P: Scan Output
        P-->>A: ✓ Clean
        A->>D: Log interaction
        A-->>U: 200 - Response
    end
```

**Key Decision Points:**

1. **Authentication Gate** - Entra ID validates the bearer token and extracts tenant/user context for RLS
2. **Input PII Gate** - Presidio scans for 15+ PII entity types including UK-specific (NINO, NHS Number)
3. **High-Risk Block** - Critical PII types are NEVER anonymized, always blocked
4. **Anonymization** - Lower-risk PII is replaced, masked, or hashed before AI processing
5. **Output Scan** - AI responses are scanned for potential PII leakage (hallucination risk)
6. **Audit Trail** - Every interaction logged to SQL Graph with full lineage

---

## 3. PII Risk Classification & Actions

Not all PII carries the same risk. The system classifies PII into four risk levels and applies different actions based on the combination of risk level and document sensitivity.

```mermaid
flowchart LR
    subgraph INPUT["📥 INPUT ANALYSIS"]
        Prompt[User Prompt]
        Scan[Presidio Scan]
    end

    subgraph CLASSIFY["🏷️ CLASSIFICATION"]
        Critical[🔴 CRITICAL<br/>NINO, NHS, Credit Card<br/>Bank Account]
        High[🟠 HIGH<br/>Driving Licence<br/>Passport]
        Medium[🟡 MEDIUM<br/>Email, Phone<br/>Name, Postcode]
        Low[🟢 LOW<br/>Location<br/>Date of Birth]
    end

    subgraph ACTION["⚡ ACTION"]
        Block[🚫 BLOCK<br/>Return 400<br/>Log + Alert]
        Anonymize[🔄 ANONYMIZE<br/>Replace/Mask<br/>Continue]
        Allow[✅ ALLOW<br/>Pass through<br/>Log only]
    end

    Prompt --> Scan
    Scan --> Critical
    Scan --> High
    Scan --> Medium
    Scan --> Low

    Critical -->|Always| Block
    High -->|If Confidential+| Block
    High -->|Otherwise| Anonymize
    Medium -->|Always| Anonymize
    Low -->|If Public| Allow
    Low -->|Otherwise| Anonymize

    style Critical fill:#ffcdd2,stroke:#c62828
    style High fill:#ffe0b2,stroke:#ef6c00
    style Medium fill:#fff9c4,stroke:#f9a825
    style Low fill:#c8e6c9,stroke:#388e3c
    style Block fill:#ef5350,stroke:#b71c1c,color:#fff
    style Anonymize fill:#ffb74d,stroke:#e65100
    style Allow fill:#81c784,stroke:#2e7d32
```

**Risk Level Definitions:**

| Risk Level | PII Types | Default Action | Rationale |
|------------|-----------|----------------|-----------|
| **CRITICAL** | UK NINO, NHS Number, Credit Card, Bank Account, IBAN | Always BLOCK | Identity theft, financial fraud risk |
| **HIGH** | UK Driving Licence, Passport Number | BLOCK or ANONYMIZE | Government-issued ID, context-dependent |
| **MEDIUM** | Email, Phone, Full Name, UK Postcode | ANONYMIZE | Personal but recoverable, useful for AI context |
| **LOW** | General Location, Dates | ALLOW or ANONYMIZE | Minimal direct risk, often needed for queries |

---

## 4. Azure SQL Database Graph Schema

The data layer uses Azure SQL Database's native graph capabilities with Node tables (entities) and Edge tables (relationships). This enables powerful traversal queries for permission checking and audit trails.

```mermaid
erDiagram
    Organisation ||--o{ Person : "WorksFor"
    Organisation ||--o{ Document : "Owns"
    Person ||--o{ Document : "Authored"
    Person ||--o{ Document : "HasAccess"
    Person ||--o{ AIInteraction : "Initiated"
    AIInteraction ||--o{ Document : "Referenced"
    AIInteraction ||--o{ Agent : "PerformedBy"
    PIIAuditLog ||--o{ AIInteraction : "AuditedInteraction"

    Organisation {
        uuid id PK
        uuid tenant_id
        string name
        string industry
        string data_residency_region
    }

    Person {
        uuid id PK
        uuid tenant_id
        string entra_object_id
        binary email_encrypted "Always Encrypted"
        binary email_hash
        binary name_hash
        string role
        int pii_access_level
    }

    Document {
        uuid id PK
        uuid tenant_id
        string graph_drive_item_id
        string title
        string sensitivity_label
        bool contains_pii
        json pii_types_detected
    }

    AIInteraction {
        uuid id PK
        uuid tenant_id
        uuid session_id
        string model_name
        binary prompt_hash
        binary response_hash
        bool pii_detected_input
        bool pii_detected_output
        string pii_action_taken
        json presidio_input_scan
        json presidio_output_scan
    }

    Agent {
        uuid id PK
        uuid tenant_id
        string name
        string agent_type
        int pii_access_level
        json allowed_tools
    }

    PIIAuditLog {
        bigint id PK
        uuid tenant_id
        string event_type
        string event_severity
        json pii_entity_types
        string action_taken
    }
```

**Schema Design Principles:**

1. **PII Never Stored in Plain Text** - All PII columns use either Always Encrypted (for searchable fields) or one-way hashing (for audit)
2. **Tenant Isolation via RLS** - Row-Level Security ensures queries only return data for the authenticated tenant
3. **Graph Edges for Lineage** - Relationships are first-class citizens, enabling queries like "who accessed what through which AI interaction"
4. **Audit as Graph Nodes** - PIIAuditLog entries connect to AIInteractions via edges for complete traceability

---

## 5. Graph Query Patterns

Azure SQL Graph uses the `MATCH` clause for traversing relationships. These patterns power permission checks, audit reports, and compliance evidence.

```mermaid
flowchart TD
    subgraph Q1["🔍 Query 1: User Document Access"]
        P1[Person] -->|HasAccess| D1[Document]
    end

    subgraph Q2["🔍 Query 2: AI Interaction Audit Trail"]
        P2[Person] -->|Initiated| AI2[AIInteraction]
        AI2 -->|Referenced| D2[Document]
    end

    subgraph Q3["🔍 Query 3: PII Exposure Report"]
        PAL[PIIAuditLog] -->|AuditedInteraction| AI3[AIInteraction]
        AI3 -->|"←Initiated"| P3[Person]
    end

    subgraph Q4["🔍 Query 4: Indirect Access via Org"]
        P4[Person] -->|WorksFor| O4[Organisation]
        O4 -->|Owns| D4[Document]
    end

    style Q1 fill:#e3f2fd,stroke:#1976d2
    style Q2 fill:#fff3e0,stroke:#f57c00
    style Q3 fill:#ffebee,stroke:#c62828
    style Q4 fill:#e8f5e9,stroke:#388e3c
```

**Example SQL Queries:**

```sql
-- Query 1: What documents can this user access?
SELECT d.title, d.sensitivity_label, ha.permission_level
FROM Person p, HasAccess ha, Document d
WHERE MATCH(p-(ha)->d)
  AND p.entra_object_id = @user_id;

-- Query 2: Full audit trail for AI interactions
SELECT p.role, ai.model_name, ai.pii_action_taken, d.title
FROM Person p, Initiated i, AIInteraction ai, Referenced r, Document d
WHERE MATCH(p-(i)->ai-(r)->d)
  AND ai.created_at > DATEADD(day, -7, GETUTCDATE());

-- Query 3: High-severity PII incidents
SELECT pal.event_severity, pal.pii_entity_types, ai.model_name, p.department
FROM PIIAuditLog pal, AuditedInteraction aui, AIInteraction ai, Initiated init, Person p
WHERE MATCH(pal-(aui)->ai<-(init)-p)
  AND pal.event_severity = 'critical';
```

---

## 6. Presidio Processing Pipeline

Presidio runs as a containerized service providing PII detection and anonymization. It includes custom recognizers for UK-specific PII types that aren't built into the base library.

```mermaid
flowchart TB
    subgraph INPUT["📥 INPUT"]
        Text[Raw Text]
    end

    subgraph ANALYZER["🔬 ANALYZER ENGINE"]
        NER[NER Models<br/>spaCy en_core_web_lg]
        Regex[Regex Patterns]
        Checksum[Checksum Validators]
        Context[Context Enhancement]
        
        subgraph RECOGNIZERS["Recognizers"]
            BuiltIn[Built-in<br/>PERSON, EMAIL<br/>PHONE, CREDIT_CARD]
            UK[UK Custom<br/>NINO, NHS<br/>POSTCODE, LICENCE]
        end
    end

    subgraph DECISION["⚖️ DECISION"]
        Score[Score Threshold<br/>≥ 0.5]
        RiskCheck{High Risk?}
    end

    subgraph ANONYMIZER["🔄 ANONYMIZER ENGINE"]
        Replace[Replace<br/>→ PERSON]
        Mask[Mask<br/>john****@example.com]
        Hash[Hash<br/>→ a3f2b8...]
        Encrypt[Encrypt<br/>→ enc_xyz...]
        Redact[Redact<br/>→ removed]
    end

    subgraph OUTPUT["📤 OUTPUT"]
        Blocked[🚫 Blocked Response]
        Anonymized[✓ Anonymized Text]
        AuditData[📋 Audit Data]
    end

    Text --> NER
    Text --> Regex
    NER --> Score
    Regex --> Score
    Checksum --> Score
    Context --> Score
    BuiltIn --> Score
    UK --> Score
    
    Score --> RiskCheck
    RiskCheck -->|Yes| Blocked
    RiskCheck -->|No| Replace
    RiskCheck -->|No| Mask
    RiskCheck -->|No| Hash
    
    Replace --> Anonymized
    Mask --> Anonymized
    Hash --> AuditData
    Encrypt --> Anonymized
    Redact --> Anonymized

    style ANALYZER fill:#e3f2fd,stroke:#1976d2
    style ANONYMIZER fill:#fff3e0,stroke:#f57c00
    style Blocked fill:#ef5350,stroke:#b71c1c,color:#fff
    style Anonymized fill:#81c784,stroke:#2e7d32
```

**UK Custom Recognizer Patterns:**

| Entity | Pattern | Context Keywords | Confidence |
|--------|---------|------------------|------------|
| **UK_NINO** | `[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]` | national insurance, NI, HMRC, tax | 0.85 |
| **UK_NHS_NUMBER** | `\d{3}\s?\d{3}\s?\d{4}` | NHS, patient, medical, hospital | 0.60 |
| **UK_POSTCODE** | `[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}` | address, postcode, delivery | 0.70 |
| **UK_DRIVING_LICENCE** | `[A-Z]{5}\d{6}[A-Z]{2}\d{2}` | driving, licence, DVLA | 0.80 |
| **UK_BANK_ACCOUNT** | `\d{2}-\d{2}-\d{2}` (sort code) | bank, account, payment, BACS | 0.60 |

---

## 7. Microsoft Graph API Integration

The system synchronises user and document metadata from Microsoft 365 while protecting PII through hashing. This enables permission-aware AI interactions without storing sensitive data.

```mermaid
flowchart LR
    subgraph M365["☁️ MICROSOFT 365"]
        Users["/users<br/>Email, Name, Role"]
        Groups["/groups<br/>Membership"]
        Drive["/drive/items<br/>Files, Permissions"]
        Sites["/sites<br/>SharePoint"]
        Labels["/sensitivityLabels<br/>Purview Labels"]
    end

    subgraph SERVICE["⚙️ GRAPH SERVICE"]
        Sync[User Sync<br/>Service]
        Perms[Permission<br/>Checker]
        DocSync[Document<br/>Sync]
        LabelSync[Label<br/>Service]
    end

    subgraph TRANSFORM["🔄 PII TRANSFORM"]
        HashPII[Hash PII<br/>SHA-256]
        StoreRef[Store Reference<br/>IDs Only]
    end

    subgraph SQLGRAPH["💾 AZURE SQL GRAPH"]
        PersonNode[Person Node<br/>email_hash, name_hash]
        DocNode[Document Node<br/>sensitivity_label]
        Edges[Graph Edges<br/>HasAccess, Authored]
    end

    Users --> Sync
    Groups --> Sync
    Drive --> Perms
    Drive --> DocSync
    Sites --> DocSync
    Labels --> LabelSync

    Sync --> HashPII
    Perms --> StoreRef
    DocSync --> StoreRef
    LabelSync --> StoreRef

    HashPII --> PersonNode
    StoreRef --> DocNode
    StoreRef --> Edges

    style M365 fill:#e3f2fd,stroke:#1976d2
    style TRANSFORM fill:#ffebee,stroke:#c62828
    style SQLGRAPH fill:#f3e5f5,stroke:#7b1fa2
```

**Data Transformation Rules:**

| M365 Field | Storage Approach | Rationale |
|------------|-----------------|-----------|
| `user.mail` | SHA-256 hash | Audit correlation without storing email |
| `user.displayName` | SHA-256 hash | Reference only, not displayed |
| `user.id` (Entra Object ID) | Plain text | Non-PII identifier |
| `driveItem.id` | Plain text | Non-PII identifier |
| `permission.grantedTo.user.id` | Plain text | Reference to Person node |
| `sensitivityLabel.displayName` | Plain text | Classification metadata |

---

## 8. Security Layers & Encryption

Multiple encryption mechanisms protect data at rest and in transit. The architecture implements defense-in-depth with no single point of failure.

```mermaid
flowchart TB
    subgraph TRANSIT["🔒 IN TRANSIT"]
        TLS[TLS 1.3<br/>All connections]
    end

    subgraph APP["🔒 APPLICATION LAYER"]
        Presidio[Presidio Anonymization<br/>Before AI processing]
        Hash[SHA-256 Hashing<br/>Audit fields]
    end

    subgraph DB["🔒 DATABASE LAYER"]
        AE[Always Encrypted<br/>PII columns<br/>Column Master Key in Key Vault]
        TDE[Transparent Data Encryption<br/>All data files]
        RLS[Row-Level Security<br/>Tenant isolation]
    end

    subgraph INFRA["🔒 INFRASTRUCTURE LAYER"]
        KV[Azure Key Vault<br/>CMK storage<br/>HSM-backed]
        PE[Private Endpoints<br/>No public internet]
        NSG[Network Security Groups<br/>Deny by default]
    end

    TLS --> APP
    APP --> DB
    DB --> INFRA

    AE -.->|Key retrieval| KV

    style TRANSIT fill:#e8f5e9,stroke:#388e3c
    style APP fill:#fff3e0,stroke:#f57c00
    style DB fill:#e3f2fd,stroke:#1976d2
    style INFRA fill:#f3e5f5,stroke:#7b1fa2
```

**Encryption Specifications:**

| Layer | Mechanism | Key Management | Scope |
|-------|-----------|----------------|-------|
| **Transit** | TLS 1.3 | Azure-managed certificates | All HTTP/SQL connections |
| **Application** | Presidio anonymization | N/A (transformation, not encryption) | PII fields before AI |
| **Column** | Always Encrypted (AES-256) | Customer-managed key in Key Vault | `email_encrypted` column |
| **Database** | TDE (AES-256) | Service-managed or CMK | All data/log files |
| **Backup** | Azure Backup encryption | Service-managed | All backup data |

---

## 9. Compliance Framework Mapping

The architecture maps directly to MCSB v2 AI controls and UK GDPR requirements, with clear evidence locations for audit.

```mermaid
flowchart TB
    subgraph MCSB["📋 MCSB v2 AI CONTROLS"]
        AI1[AI-1<br/>Approved Models]
        AI2[AI-2<br/>Content Filtering]
        AI3[AI-3<br/>Safety Prompts]
        AI4[AI-4<br/>Least Privilege]
        AI5[AI-5<br/>Human-in-Loop]
        AI6[AI-6<br/>Monitoring]
        AI7[AI-7<br/>Red Teaming]
    end

    subgraph IMPL["⚙️ IMPLEMENTATION"]
        OpenAI[Azure OpenAI<br/>UK South Only]
        PresidioImpl[Presidio +<br/>Content Safety]
        SystemPrompt[System Prompt<br/>Templates]
        RLSRBAC[RLS + Graph<br/>Permissions]
        BlockAlert[PII Blocking +<br/>Alerts]
        MonitorSentinel[Azure Monitor +<br/>Sentinel]
        PenTest[Quarterly<br/>Pen Testing]
    end

    subgraph GDPR["🇬🇧 UK GDPR"]
        Art5[Article 5.1.f<br/>Integrity]
        Art17[Article 17<br/>Erasure]
        Art25[Article 25<br/>By Design]
        Art30[Article 30<br/>Records]
        Art32[Article 32<br/>Security]
        Art33[Article 33<br/>Breach Notification]
    end

    AI1 --> OpenAI
    AI2 --> PresidioImpl
    AI3 --> SystemPrompt
    AI4 --> RLSRBAC
    AI5 --> BlockAlert
    AI6 --> MonitorSentinel
    AI7 --> PenTest

    OpenAI --> Art32
    PresidioImpl --> Art25
    RLSRBAC --> Art5
    BlockAlert --> Art33
    MonitorSentinel --> Art30

    style MCSB fill:#e3f2fd,stroke:#1976d2
    style IMPL fill:#fff3e0,stroke:#f57c00
    style GDPR fill:#e8f5e9,stroke:#388e3c
```

**Evidence Locations:**

| Control | Evidence Type | Location |
|---------|--------------|----------|
| AI-1 | Deployment configuration | Bicep templates, Azure Portal |
| AI-2 | PII detection logs | `PIIAuditLog` table, Azure Monitor |
| AI-3 | System prompts | Code repository, version controlled |
| AI-4 | RLS policies, Graph permissions | SQL schema, Entra app registrations |
| AI-5 | Blocked request logs | `PIIAuditLog` where `action_taken = 'blocked'` |
| AI-6 | Monitoring dashboards | Log Analytics workbooks, Sentinel |
| AI-7 | Pen test reports | Security assessment documents |

---

## 10. Deployment Architecture

All components deploy to UK South with private networking. No PII traverses the public internet.

```mermaid
flowchart TB
    subgraph INTERNET["🌐 INTERNET"]
        Users[Users]
    end

    subgraph AZURE["☁️ AZURE UK SOUTH"]
        subgraph PUBLIC["Public Endpoint"]
            AFD[Azure Front Door<br/>WAF + CDN]
        end

        subgraph VNET["🔒 Virtual Network"]
            subgraph WEB["Web Subnet"]
                AppService[App Service<br/>Next.js]
            end

            subgraph API["API Subnet"]
                APIM[API Management]
                ContainerApps[Container Apps<br/>Presidio]
            end

            subgraph DATA["Data Subnet"]
                SQL[(Azure SQL<br/>Graph Tables)]
                OpenAI[Azure OpenAI]
            end

            subgraph MGMT["Management Subnet"]
                KV[Key Vault]
                Monitor[Log Analytics]
            end
        end

        subgraph PRIVATE["Private Endpoints"]
            PESQL[PE: SQL]
            PEOAI[PE: OpenAI]
            PEKV[PE: Key Vault]
        end
    end

    Users -->|HTTPS| AFD
    AFD -->|Private| AppService
    AppService --> APIM
    APIM --> ContainerApps
    ContainerApps --> OpenAI
    ContainerApps --> SQL
    
    SQL --- PESQL
    OpenAI --- PEOAI
    KV --- PEKV

    style INTERNET fill:#ffebee,stroke:#c62828
    style PUBLIC fill:#fff3e0,stroke:#f57c00
    style VNET fill:#e3f2fd,stroke:#1976d2
    style PRIVATE fill:#e8f5e9,stroke:#388e3c
```

**Network Security Rules:**

| Source | Destination | Port | Action |
|--------|-------------|------|--------|
| Internet | Front Door | 443 | Allow |
| Front Door | App Service | 443 | Allow |
| App Service | APIM | 443 | Allow |
| APIM | Container Apps | 8080 | Allow |
| Container Apps | SQL (PE) | 1433 | Allow |
| Container Apps | OpenAI (PE) | 443 | Allow |
| * | * | * | Deny |

---

## 11. Monitoring & Alerting

Real-time monitoring detects PII incidents and triggers alerts through Microsoft Sentinel.

```mermaid
flowchart LR
    subgraph SOURCES["📊 DATA SOURCES"]
        App[Application Logs]
        SQL[SQL Audit Logs]
        Presidio[Presidio Scan Results]
        APIM[API Management Logs]
    end

    subgraph ANALYTICS["📈 LOG ANALYTICS"]
        Workspace[Log Analytics<br/>Workspace]
        KQL[KQL Queries]
    end

    subgraph SENTINEL["🚨 MICROSOFT SENTINEL"]
        Rules[Analytics Rules]
        Incidents[Incidents]
        Playbooks[Automation<br/>Playbooks]
    end

    subgraph RESPONSE["⚡ RESPONSE"]
        Email[Email Alert]
        Teams[Teams Notification]
        Ticket[ServiceNow Ticket]
        Block[Auto-Block IP]
    end

    App --> Workspace
    SQL --> Workspace
    Presidio --> Workspace
    APIM --> Workspace

    Workspace --> KQL
    KQL --> Rules
    Rules --> Incidents
    Incidents --> Playbooks

    Playbooks --> Email
    Playbooks --> Teams
    Playbooks --> Ticket
    Playbooks --> Block

    style SOURCES fill:#e3f2fd,stroke:#1976d2
    style ANALYTICS fill:#fff3e0,stroke:#f57c00
    style SENTINEL fill:#ffebee,stroke:#c62828
    style RESPONSE fill:#e8f5e9,stroke:#388e3c
```

**Alert Rules:**

| Rule Name | Condition | Severity | Response |
|-----------|-----------|----------|----------|
| PII Leakage Detected | `pii_detected_output = true` | Critical | Immediate notification + incident |
| High-Risk PII Blocked | `action_taken = 'blocked' AND entity_type IN ('UK_NINO', 'UK_NHS_NUMBER')` | High | Log + weekly report |
| Unusual AI Query Volume | `count > 100 per user per hour` | Medium | Investigation trigger |
| Failed Auth Spike | `auth_failures > 10 per minute` | High | Auto-block IP |

---

## 12. Summary: Defense-in-Depth

The architecture implements seven layers of PII protection, ensuring no single failure compromises data security.

```mermaid
flowchart TB
    subgraph L1["Layer 1: Authentication"]
        Auth[Microsoft Entra ID<br/>Token validation, MFA]
    end

    subgraph L2["Layer 2: Authorization"]
        Authz[RBAC + RLS<br/>Tenant isolation, least privilege]
    end

    subgraph L3["Layer 3: Input Protection"]
        Input[Presidio Input Scan<br/>Detect, block, or anonymize]
    end

    subgraph L4["Layer 4: AI Guardrails"]
        Guard[Content Safety + System Prompts<br/>Secondary validation]
    end

    subgraph L5["Layer 5: Output Protection"]
        Output[Presidio Output Scan<br/>Leakage detection]
    end

    subgraph L6["Layer 6: Data Protection"]
        Data[Always Encrypted + TDE<br/>Encryption at rest]
    end

    subgraph L7["Layer 7: Monitoring"]
        Mon[Sentinel + Audit Logs<br/>Detection and response]
    end

    L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7

    style L1 fill:#ffcdd2,stroke:#c62828
    style L2 fill:#ffe0b2,stroke:#ef6c00
    style L3 fill:#fff9c4,stroke:#f9a825
    style L4 fill:#c8e6c9,stroke:#388e3c
    style L5 fill:#bbdefb,stroke:#1976d2
    style L6 fill:#d1c4e9,stroke:#512da8
    style L7 fill:#cfd8dc,stroke:#455a64
```

**Protection Summary:**

| Layer | Threat Mitigated | Failure Impact |
|-------|------------------|----------------|
| **Authentication** | Unauthorized access | Other layers still protect data |
| **Authorization** | Cross-tenant access | Encryption still protects data |
| **Input Protection** | PII in prompts | AI never sees raw PII |
| **AI Guardrails** | Prompt injection, jailbreak | Presidio provides backup |
| **Output Protection** | Hallucinated PII | Alerts trigger before user sees |
| **Data Protection** | Database breach | Encrypted data unusable |
| **Monitoring** | Undetected incidents | Forensic evidence preserved |

---

**Document Classification:** INTERNAL USE  
**Last Updated:** February 2026  
**Platform Instances:** PF-Core, BAIV, W4M, AIR

---

*© 2026 Platform Foundation Core Holdings. All rights reserved.*
