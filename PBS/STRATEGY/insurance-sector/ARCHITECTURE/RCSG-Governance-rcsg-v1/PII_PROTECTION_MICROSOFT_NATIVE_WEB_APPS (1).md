# PII Protection Architecture: Microsoft-Native Stack for Web Applications

## Azure SQL Database Graph × Microsoft Graph API × Presidio × Azure OpenAI

**Document Version:** 2.0.0  
**Date:** February 2026  
**Platform:** PF-Core Security Module  
**PF-Instance:** [BAIV-SEC / W4M-RCS / AIR-GOV]  
**Module Type:** Enterprise Architecture Reference  
**Classification:** CONFIDENTIAL - INTERNAL USE

---

## Executive Summary

This document defines the reference architecture for PII (Personally Identifiable Information) protection in custom web applications using a **Microsoft-native data stack**. It replaces Supabase-based patterns with Azure SQL Database Graph for organisations requiring:

- **UK/EU data sovereignty** with guaranteed regional processing
- **Graph-capable data storage** for relationship-rich agent architectures
- **Enterprise compliance** through Purview, Entra ID, and MCSB v2 alignment
- **Custom web applications** (Next.js, React) rather than Power Platform

### Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Primary Database** | Azure SQL Database (Graph Tables) | UK South region, Always Encrypted, RLS, familiar SQL + graph |
| **M365 Data Access** | Microsoft Graph API | Native user/file/permission access |
| **PII Detection** | Presidio + Azure AI Content Safety | Defense-in-depth, anonymization options |
| **AI Processing** | Azure OpenAI (UK South Regional) | Data residency guarantee |
| **Identity** | Microsoft Entra ID | Enterprise SSO, Conditional Access |
| **Governance** | Microsoft Purview | Classification, audit, compliance |
| **Frontend** | Next.js + shadcn/ui | Modern web stack, Figma Make compatible |

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    MICROSOFT-NATIVE WEB APP ARCHITECTURE                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         USER LAYER                                   │   │
│   │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │   │
│   │  │   Next.js    │    │   Mobile     │    │   Desktop    │          │   │
│   │  │   Web App    │    │   App        │    │   App        │          │   │
│   │  │  (shadcn/ui) │    │              │    │              │          │   │
│   │  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │   │
│   └─────────┼───────────────────┼───────────────────┼───────────────────┘   │
│             │                   │                   │                        │
│             └───────────────────┼───────────────────┘                        │
│                                 │                                            │
│   ┌─────────────────────────────┼───────────────────────────────────────┐   │
│   │                      GATEWAY LAYER                                   │   │
│   │                                 ▼                                    │   │
│   │            ┌────────────────────────────────────┐                   │   │
│   │            │    Azure API Management (UK)       │                   │   │
│   │            │    • Rate limiting                 │                   │   │
│   │            │    • Auth validation               │                   │   │
│   │            │    • Request logging               │                   │   │
│   │            └─────────────┬──────────────────────┘                   │   │
│   │                          │                                           │   │
│   │            ┌─────────────┴──────────────┐                           │   │
│   │            ▼                            ▼                           │   │
│   │   ┌─────────────────┐         ┌─────────────────┐                  │   │
│   │   │ Microsoft       │         │ App Service /   │                  │   │
│   │   │ Entra ID        │         │ Container Apps  │                  │   │
│   │   │ (Authentication)│         │ (API Backend)   │                  │   │
│   │   └─────────────────┘         └────────┬────────┘                  │   │
│   └────────────────────────────────────────┼────────────────────────────┘   │
│                                            │                                 │
│   ┌────────────────────────────────────────┼────────────────────────────┐   │
│   │                       PII PROTECTION LAYER                           │   │
│   │                                        ▼                             │   │
│   │   ┌────────────────────────────────────────────────────────────┐    │   │
│   │   │                    PRESIDIO (Container App)                 │    │   │
│   │   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │    │   │
│   │   │   │   Analyzer  │  │  Anonymizer │  │ UK Custom   │       │    │   │
│   │   │   │   Engine    │  │  Engine     │  │ Recognizers │       │    │   │
│   │   │   └─────────────┘  └─────────────┘  └─────────────┘       │    │   │
│   │   └───────────────────────────┬────────────────────────────────┘    │   │
│   │                               │                                      │   │
│   │                               ▼                                      │   │
│   │   ┌────────────────────────────────────────────────────────────┐    │   │
│   │   │           Azure AI Content Safety (UK South)                │    │   │
│   │   │           • PII detection (UK entities built-in)            │    │   │
│   │   │           • Content moderation                              │    │   │
│   │   │           • Jailbreak detection                             │    │   │
│   │   └───────────────────────────┬────────────────────────────────┘    │   │
│   └───────────────────────────────┼──────────────────────────────────────┘   │
│                                   │                                          │
│   ┌───────────────────────────────┼──────────────────────────────────────┐   │
│   │                       AI PROCESSING LAYER                             │   │
│   │                               ▼                                       │   │
│   │   ┌────────────────────────────────────────────────────────────┐     │   │
│   │   │           Azure OpenAI (UK South Regional)                  │     │   │
│   │   │           • GPT-4o, GPT-4o-mini                             │     │   │
│   │   │           • Data NEVER leaves UK                            │     │   │
│   │   │           • Data NEVER used for training                    │     │   │
│   │   └───────────────────────────┬────────────────────────────────┘     │   │
│   └───────────────────────────────┼──────────────────────────────────────┘   │
│                                   │                                          │
│   ┌───────────────────────────────┼──────────────────────────────────────┐   │
│   │                         DATA LAYER                                    │   │
│   │                               ▼                                       │   │
│   │   ┌─────────────────────┐  ┌─────────────────────┐                   │   │
│   │   │  Azure SQL Database │  │  Microsoft Graph    │                   │   │
│   │   │  (UK South)         │  │  API                │                   │   │
│   │   │  ┌───────────────┐  │  │  ┌───────────────┐  │                   │   │
│   │   │  │ Graph Tables  │  │  │  │ Users/Groups  │  │                   │   │
│   │   │  │ (Nodes+Edges) │  │  │  │ Files/Perms   │  │                   │   │
│   │   │  ├───────────────┤  │  │  │ Calendar/Mail │  │                   │   │
│   │   │  │ Always        │  │  │  └───────────────┘  │                   │   │
│   │   │  │ Encrypted     │  │  └─────────────────────┘                   │   │
│   │   │  ├───────────────┤  │                                            │   │
│   │   │  │ Row-Level     │  │                                            │   │
│   │   │  │ Security      │  │                                            │   │
│   │   │  └───────────────┘  │                                            │   │
│   │   └─────────────────────┘                                            │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │                      GOVERNANCE LAYER                                 │   │
│   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│   │   │ Microsoft       │  │ Azure Monitor   │  │ Microsoft       │     │   │
│   │   │ Purview         │  │ + Log Analytics │  │ Sentinel        │     │   │
│   │   │ (Classification)│  │ (Observability) │  │ (Security)      │     │   │
│   │   └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Sequence

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     PII-PROTECTED REQUEST FLOW                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────┐     ┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐ │
│  │ User │────►│ APIM │────►│ Entra ID │────►│ Backend  │────►│ Presidio │ │
│  │      │     │      │     │ Auth     │     │ API      │     │ Scan     │ │
│  └──────┘     └──────┘     └──────────┘     └──────────┘     └────┬─────┘ │
│                                                                    │       │
│                            ┌───────────────────────────────────────┘       │
│                            │                                               │
│                            ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      DECISION GATE                                   │  │
│  │                                                                      │  │
│  │   ┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐  │  │
│  │   │ HIGH-RISK PII?  │────►│ ANONYMIZABLE?   │────►│ PROCEED      │  │  │
│  │   │ (NINO, NHS,     │ NO  │ (Email, Phone,  │ YES │ WITH         │  │  │
│  │   │  Credit Card)   │     │  Name)          │     │ ANONYMIZED   │  │  │
│  │   └────────┬────────┘     └────────┬────────┘     └──────────────┘  │  │
│  │            │ YES                   │ NO                              │  │
│  │            ▼                       ▼                                 │  │
│  │   ┌─────────────────┐     ┌─────────────────┐                       │  │
│  │   │ BLOCK REQUEST   │     │ PASS THROUGH    │                       │  │
│  │   │ Log to Audit    │     │ (No PII found)  │                       │  │
│  │   │ Return 400      │     │                 │                       │  │
│  │   └─────────────────┘     └─────────────────┘                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│                            │                                               │
│                            ▼                                               │
│  ┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────────┐ │
│  │ Content  │────►│ Azure OpenAI │────►│ Presidio │────►│ Azure SQL    │ │
│  │ Safety   │     │ (UK South)   │     │ Output   │     │ Graph        │ │
│  │ Check    │     │              │     │ Scan     │     │ (Audit Log)  │ │
│  └──────────┘     └──────────────┘     └──────────┘     └──────────────┘ │
│                                                                            │
│                            │                                               │
│                            ▼                                               │
│                       ┌──────────┐                                         │
│                       │ Response │                                         │
│                       │ to User  │                                         │
│                       └──────────┘                                         │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Azure SQL Database Graph Implementation

### 2.1 Why Azure SQL Database Graph

| Requirement | Azure SQL Graph Capability |
|-------------|---------------------------|
| **UK Data Residency** | UK South region with geo-redundancy |
| **Graph Queries** | Native MATCH syntax for relationship traversal |
| **PII Encryption** | Always Encrypted for column-level protection |
| **Tenant Isolation** | Row-Level Security (RLS) policies |
| **Compliance** | Purview scanning, TDE, audit logs |
| **Familiar Tooling** | T-SQL, Entity Framework, existing skills |
| **ACID Transactions** | Full transactional integrity |
| **Cost Predictability** | DTU/vCore pricing (no consumption surprises) |

### 2.2 Graph Schema Design

#### 2.2.1 Node Tables

```sql
-- ============================================================================
-- AZURE SQL DATABASE GRAPH SCHEMA
-- PII-Protected Agent Architecture
-- UK South Regional Deployment
-- ============================================================================

-- Enable Always Encrypted Column Master Key
CREATE COLUMN MASTER KEY CMK_PII
WITH (
    KEY_STORE_PROVIDER_NAME = 'AZURE_KEY_VAULT',
    KEY_PATH = 'https://your-keyvault-uk.vault.azure.net/keys/CMK-PII/version'
);

CREATE COLUMN ENCRYPTION KEY CEK_PII
WITH VALUES (
    COLUMN_MASTER_KEY = CMK_PII,
    ALGORITHM = 'RSA_OAEP',
    ENCRYPTED_VALUE = 0x... -- Generated by Azure Key Vault
);

-- ============================================================================
-- ORGANISATION NODE
-- ============================================================================
CREATE TABLE dbo.Organisation (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(255) NOT NULL,
    industry NVARCHAR(100),
    data_residency_region NVARCHAR(50) DEFAULT 'UK',
    compliance_frameworks NVARCHAR(MAX),  -- JSON array: ["GDPR", "UK-GDPR", "ISO27001"]
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    INDEX IX_Organisation_Tenant (tenant_id)
) AS NODE;

-- ============================================================================
-- PERSON NODE (PII-Protected)
-- ============================================================================
CREATE TABLE dbo.Person (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL,
    
    -- Entra ID reference (not PII itself)
    entra_object_id NVARCHAR(255),
    
    -- PII: Always Encrypted (Deterministic for equality searches)
    email_encrypted NVARCHAR(255) ENCRYPTED WITH (
        COLUMN_ENCRYPTION_KEY = CEK_PII,
        ENCRYPTION_TYPE = Deterministic,
        ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256'
    ),
    
    -- PII: Hashed for audit (Presidio hashes original, stores hash)
    email_hash VARBINARY(64),
    name_hash VARBINARY(64),
    
    -- Non-PII attributes
    role NVARCHAR(100),
    department NVARCHAR(100),
    pii_access_level TINYINT DEFAULT 0,  -- 0=None, 1=Redacted, 2=Specific, 3=Full
    
    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    last_synced_from_graph DATETIME2,
    
    INDEX IX_Person_Tenant (tenant_id),
    INDEX IX_Person_Entra (entra_object_id),
    INDEX IX_Person_EmailHash (email_hash)
) AS NODE;

-- ============================================================================
-- DOCUMENT NODE
-- ============================================================================
CREATE TABLE dbo.Document (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL,
    
    -- Microsoft Graph reference
    graph_drive_item_id NVARCHAR(255),
    graph_site_id NVARCHAR(255),
    
    -- Document metadata
    title NVARCHAR(500) NOT NULL,
    document_type NVARCHAR(50),  -- 'policy', 'report', 'contract', etc.
    
    -- Purview classification
    sensitivity_label NVARCHAR(100),  -- 'Public', 'Internal', 'Confidential', 'Highly-Confidential'
    sensitivity_label_id NVARCHAR(255),
    
    -- PII indicators
    contains_pii BIT DEFAULT 0,
    pii_types_detected NVARCHAR(MAX),  -- JSON array: ["EMAIL", "PHONE", "UK_NINO"]
    pii_scan_date DATETIME2,
    
    -- Content hash for change detection
    content_hash VARBINARY(64),
    
    -- Metadata
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    INDEX IX_Document_Tenant (tenant_id),
    INDEX IX_Document_Sensitivity (sensitivity_label),
    INDEX IX_Document_PII (contains_pii)
) AS NODE;

-- ============================================================================
-- AI INTERACTION NODE (Audit Trail)
-- ============================================================================
CREATE TABLE dbo.AIInteraction (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL,
    
    -- Request context
    session_id UNIQUEIDENTIFIER,
    request_id UNIQUEIDENTIFIER,
    
    -- AI model used
    model_provider NVARCHAR(50),  -- 'azure-openai', 'anthropic-foundry'
    model_name NVARCHAR(100),     -- 'gpt-4o', 'claude-sonnet-4'
    model_deployment NVARCHAR(100),
    deployment_region NVARCHAR(50),
    
    -- Content hashes (never store raw prompts with PII)
    prompt_hash VARBINARY(64),
    response_hash VARBINARY(64),
    
    -- PII detection results
    pii_detected_input BIT DEFAULT 0,
    pii_detected_output BIT DEFAULT 0,
    pii_action_taken NVARCHAR(50),  -- 'none', 'anonymized', 'blocked'
    
    -- Presidio results (structured)
    presidio_input_scan NVARCHAR(MAX),   -- JSON
    presidio_output_scan NVARCHAR(MAX),  -- JSON
    
    -- Content Safety results
    content_safety_input NVARCHAR(MAX),  -- JSON
    content_safety_output NVARCHAR(MAX), -- JSON
    
    -- Performance metrics
    prompt_tokens INT,
    completion_tokens INT,
    total_tokens INT,
    latency_ms INT,
    
    -- Timestamps
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    INDEX IX_AIInteraction_Tenant_Date (tenant_id, created_at DESC),
    INDEX IX_AIInteraction_Session (session_id),
    INDEX IX_AIInteraction_PII (pii_detected_input, pii_detected_output)
) AS NODE;

-- ============================================================================
-- AGENT NODE
-- ============================================================================
CREATE TABLE dbo.Agent (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL,
    
    -- Agent identity
    name NVARCHAR(255) NOT NULL,
    agent_type NVARCHAR(100),  -- 'discovery', 'analysis', 'generation', 'orchestrator'
    version NVARCHAR(50),
    
    -- Permissions
    pii_access_level TINYINT DEFAULT 0,
    allowed_tools NVARCHAR(MAX),  -- JSON array
    allowed_data_sources NVARCHAR(MAX),  -- JSON array
    
    -- Configuration
    system_prompt_hash VARBINARY(64),
    max_tokens INT,
    temperature DECIMAL(3,2),
    
    -- Status
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    INDEX IX_Agent_Tenant (tenant_id),
    INDEX IX_Agent_Type (agent_type)
) AS NODE;

-- ============================================================================
-- PII AUDIT LOG NODE
-- ============================================================================
CREATE TABLE dbo.PIIAuditLog (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    tenant_id UNIQUEIDENTIFIER NOT NULL,
    
    -- What happened
    event_type NVARCHAR(50) NOT NULL,  -- 'detection', 'anonymization', 'block', 'leak'
    event_severity NVARCHAR(20),        -- 'info', 'warning', 'critical'
    
    -- What was detected
    pii_entity_types NVARCHAR(MAX),     -- JSON array: ["UK_NINO", "EMAIL"]
    pii_entity_count INT,
    high_risk_entities NVARCHAR(MAX),   -- JSON array of high-risk types
    
    -- Action taken
    action_taken NVARCHAR(50),          -- 'allowed', 'anonymized', 'blocked', 'alerted'
    anonymization_operators NVARCHAR(MAX), -- JSON: {"EMAIL": "mask", "PHONE": "replace"}
    
    -- Context
    source_endpoint NVARCHAR(500),
    user_agent NVARCHAR(500),
    client_ip_hash VARBINARY(64),       -- Hashed for privacy
    
    -- Timestamps
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    INDEX IX_PIIAudit_Tenant_Date (tenant_id, created_at DESC),
    INDEX IX_PIIAudit_EventType (event_type),
    INDEX IX_PIIAudit_Severity (event_severity)
) AS NODE;
```

#### 2.2.2 Edge Tables (Relationships)

```sql
-- ============================================================================
-- EDGE TABLES (Relationships)
-- ============================================================================

-- Person works for Organisation
CREATE TABLE dbo.WorksFor AS EDGE;

-- Person authored Document
CREATE TABLE dbo.Authored AS EDGE;

-- Person has access to Document (permission edge)
CREATE TABLE dbo.HasAccess (
    permission_level NVARCHAR(50),  -- 'read', 'write', 'owner'
    granted_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    granted_by NVARCHAR(255),
    expires_at DATETIME2
) AS EDGE;

-- Person initiated AIInteraction
CREATE TABLE dbo.Initiated AS EDGE;

-- AIInteraction referenced Document
CREATE TABLE dbo.Referenced (
    reference_type NVARCHAR(50),  -- 'rag_context', 'direct_query', 'tool_output'
    chunk_ids NVARCHAR(MAX)       -- JSON array of chunk IDs if RAG
) AS EDGE;

-- AIInteraction was performed by Agent
CREATE TABLE dbo.PerformedBy AS EDGE;

-- Agent has tool access
CREATE TABLE dbo.HasToolAccess (
    tool_name NVARCHAR(255),
    permission_scope NVARCHAR(MAX)  -- JSON: tool-specific permissions
) AS EDGE;

-- PIIAuditLog relates to AIInteraction
CREATE TABLE dbo.AuditedInteraction AS EDGE;

-- Organisation owns Document
CREATE TABLE dbo.Owns AS EDGE;
```

### 2.3 Row-Level Security (Tenant Isolation)

```sql
-- ============================================================================
-- ROW-LEVEL SECURITY FOR MULTI-TENANT ISOLATION
-- ============================================================================

-- Security function: Filter by tenant_id from session context
CREATE FUNCTION dbo.fn_tenant_security_predicate(@tenant_id UNIQUEIDENTIFIER)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN 
    SELECT 1 AS result
    WHERE @tenant_id = CAST(SESSION_CONTEXT(N'tenant_id') AS UNIQUEIDENTIFIER)
       OR IS_MEMBER('db_owner') = 1  -- Allow admins to see all
       OR IS_MEMBER('PlatformAdmin') = 1;

-- Apply to all node tables
CREATE SECURITY POLICY TenantIsolationPolicy
    ADD FILTER PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.Organisation,
    ADD FILTER PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.Person,
    ADD FILTER PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.Document,
    ADD FILTER PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.AIInteraction,
    ADD FILTER PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.Agent,
    ADD FILTER PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.PIIAuditLog,
    ADD BLOCK PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.Organisation,
    ADD BLOCK PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.Person,
    ADD BLOCK PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.Document,
    ADD BLOCK PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.AIInteraction,
    ADD BLOCK PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.Agent,
    ADD BLOCK PREDICATE dbo.fn_tenant_security_predicate(tenant_id) ON dbo.PIIAuditLog
WITH (STATE = ON);

-- Usage in application: Set tenant context before queries
-- EXEC sp_set_session_context @key = N'tenant_id', @value = @tenant_id;
```

### 2.4 Graph Query Examples

```sql
-- ============================================================================
-- GRAPH QUERIES (MATCH Syntax)
-- ============================================================================

-- 1. Find all documents a person can access
SELECT 
    d.id AS document_id,
    d.title,
    d.sensitivity_label,
    d.contains_pii,
    ha.permission_level
FROM 
    Person AS p,
    HasAccess AS ha,
    Document AS d
WHERE MATCH(p-(ha)->d)
    AND p.entra_object_id = @entra_object_id
    AND p.tenant_id = @tenant_id;

-- 2. Find AI interactions that referenced sensitive documents
SELECT 
    ai.id AS interaction_id,
    ai.created_at,
    ai.pii_action_taken,
    d.title AS document_title,
    d.sensitivity_label
FROM 
    AIInteraction AS ai,
    Referenced AS r,
    Document AS d
WHERE MATCH(ai-(r)->d)
    AND d.sensitivity_label IN ('Confidential', 'Highly-Confidential')
    AND ai.tenant_id = @tenant_id
    AND ai.created_at > DATEADD(day, -7, SYSUTCDATETIME())
ORDER BY ai.created_at DESC;

-- 3. Audit trail: Who queried AI about which documents?
SELECT 
    p.entra_object_id,
    p.role,
    ai.id AS interaction_id,
    ai.model_name,
    ai.pii_detected_input,
    ai.pii_action_taken,
    d.title AS document_title,
    d.sensitivity_label,
    ai.created_at
FROM 
    Person AS p,
    Initiated AS i,
    AIInteraction AS ai,
    Referenced AS r,
    Document AS d
WHERE MATCH(p-(i)->ai-(r)->d)
    AND ai.created_at > DATEADD(day, -30, SYSUTCDATETIME())
    AND p.tenant_id = @tenant_id
ORDER BY ai.created_at DESC;

-- 4. Find indirect document access through organisation membership
SELECT DISTINCT
    d.id AS document_id,
    d.title,
    d.sensitivity_label,
    'indirect_via_org' AS access_type
FROM 
    Person AS p,
    WorksFor AS wf,
    Organisation AS o,
    Owns AS owns,
    Document AS d
WHERE MATCH(p-(wf)->o-(owns)->d)
    AND p.entra_object_id = @entra_object_id
    AND p.tenant_id = @tenant_id
    AND NOT EXISTS (
        -- Exclude if direct access already exists
        SELECT 1 FROM Person AS p2, HasAccess AS ha, Document AS d2
        WHERE MATCH(p2-(ha)->d2)
        AND p2.id = p.id AND d2.id = d.id
    );

-- 5. Agent permission audit: What can each agent access?
SELECT 
    a.name AS agent_name,
    a.agent_type,
    a.pii_access_level,
    hta.tool_name,
    hta.permission_scope
FROM 
    Agent AS a,
    HasToolAccess AS hta
WHERE MATCH(a-(hta)->a)  -- Self-referential for tool access
    AND a.is_active = 1
    AND a.tenant_id = @tenant_id;

-- 6. PII exposure report: High-risk interactions in last 24 hours
SELECT 
    pal.event_type,
    pal.event_severity,
    pal.pii_entity_types,
    pal.action_taken,
    ai.model_name,
    ai.deployment_region,
    p.role AS user_role,
    pal.created_at
FROM 
    PIIAuditLog AS pal,
    AuditedInteraction AS aui,
    AIInteraction AS ai,
    Initiated AS init,
    Person AS p
WHERE MATCH(pal-(aui)->ai<-(init)-p)
    AND pal.event_severity IN ('warning', 'critical')
    AND pal.created_at > DATEADD(hour, -24, SYSUTCDATETIME())
    AND pal.tenant_id = @tenant_id
ORDER BY pal.created_at DESC;

-- 7. Graph traversal: Find all PII-containing documents accessible to high-risk users
SELECT 
    p.entra_object_id,
    p.role,
    d.title,
    d.pii_types_detected,
    ha.permission_level
FROM 
    Person AS p,
    HasAccess AS ha,
    Document AS d
WHERE MATCH(p-(ha)->d)
    AND p.pii_access_level >= 2  -- Users with elevated PII access
    AND d.contains_pii = 1
    AND d.sensitivity_label IN ('Confidential', 'Highly-Confidential')
    AND p.tenant_id = @tenant_id;
```

### 2.5 Stored Procedures for PII Operations

```sql
-- ============================================================================
-- STORED PROCEDURES FOR PII-SAFE OPERATIONS
-- ============================================================================

-- Log AI interaction with PII audit
CREATE PROCEDURE dbo.sp_LogAIInteraction
    @tenant_id UNIQUEIDENTIFIER,
    @session_id UNIQUEIDENTIFIER,
    @request_id UNIQUEIDENTIFIER,
    @user_entra_id NVARCHAR(255),
    @model_provider NVARCHAR(50),
    @model_name NVARCHAR(100),
    @deployment_region NVARCHAR(50),
    @prompt_hash VARBINARY(64),
    @response_hash VARBINARY(64),
    @pii_detected_input BIT,
    @pii_detected_output BIT,
    @pii_action_taken NVARCHAR(50),
    @presidio_input_scan NVARCHAR(MAX),
    @presidio_output_scan NVARCHAR(MAX),
    @content_safety_input NVARCHAR(MAX),
    @content_safety_output NVARCHAR(MAX),
    @prompt_tokens INT,
    @completion_tokens INT,
    @latency_ms INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Set tenant context for RLS
    EXEC sp_set_session_context @key = N'tenant_id', @value = @tenant_id;
    
    DECLARE @interaction_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @person_id UNIQUEIDENTIFIER;
    
    -- Get person ID from Entra ID
    SELECT @person_id = id 
    FROM dbo.Person 
    WHERE entra_object_id = @user_entra_id 
      AND tenant_id = @tenant_id;
    
    -- Insert AI interaction
    INSERT INTO dbo.AIInteraction (
        id, tenant_id, session_id, request_id,
        model_provider, model_name, deployment_region,
        prompt_hash, response_hash,
        pii_detected_input, pii_detected_output, pii_action_taken,
        presidio_input_scan, presidio_output_scan,
        content_safety_input, content_safety_output,
        prompt_tokens, completion_tokens, total_tokens, latency_ms
    )
    VALUES (
        @interaction_id, @tenant_id, @session_id, @request_id,
        @model_provider, @model_name, @deployment_region,
        @prompt_hash, @response_hash,
        @pii_detected_input, @pii_detected_output, @pii_action_taken,
        @presidio_input_scan, @presidio_output_scan,
        @content_safety_input, @content_safety_output,
        @prompt_tokens, @completion_tokens, 
        @prompt_tokens + @completion_tokens, @latency_ms
    );
    
    -- Create edge: Person initiated AIInteraction
    IF @person_id IS NOT NULL
    BEGIN
        INSERT INTO dbo.Initiated ($from_id, $to_id)
        SELECT p.$node_id, ai.$node_id
        FROM dbo.Person p, dbo.AIInteraction ai
        WHERE p.id = @person_id AND ai.id = @interaction_id;
    END
    
    -- Log PII audit if PII was detected
    IF @pii_detected_input = 1 OR @pii_detected_output = 1
    BEGIN
        DECLARE @audit_id BIGINT;
        
        INSERT INTO dbo.PIIAuditLog (
            tenant_id, event_type, event_severity,
            pii_entity_types, action_taken,
            source_endpoint
        )
        VALUES (
            @tenant_id,
            CASE 
                WHEN @pii_action_taken = 'blocked' THEN 'block'
                WHEN @pii_detected_output = 1 THEN 'leak'
                ELSE 'detection'
            END,
            CASE 
                WHEN @pii_action_taken = 'blocked' THEN 'warning'
                WHEN @pii_detected_output = 1 THEN 'critical'
                ELSE 'info'
            END,
            JSON_QUERY(@presidio_input_scan, '$.entities_found'),
            @pii_action_taken,
            '/api/ai/completion'
        );
        
        SET @audit_id = SCOPE_IDENTITY();
        
        -- Create edge: PIIAuditLog audited AIInteraction
        INSERT INTO dbo.AuditedInteraction ($from_id, $to_id)
        SELECT pal.$node_id, ai.$node_id
        FROM dbo.PIIAuditLog pal, dbo.AIInteraction ai
        WHERE pal.id = @audit_id AND ai.id = @interaction_id;
    END
    
    SELECT @interaction_id AS interaction_id;
END;
GO

-- Sync user from Microsoft Graph
CREATE PROCEDURE dbo.sp_SyncUserFromGraph
    @tenant_id UNIQUEIDENTIFIER,
    @entra_object_id NVARCHAR(255),
    @email_hash VARBINARY(64),
    @name_hash VARBINARY(64),
    @role NVARCHAR(100),
    @department NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    EXEC sp_set_session_context @key = N'tenant_id', @value = @tenant_id;
    
    MERGE dbo.Person AS target
    USING (
        SELECT 
            @tenant_id AS tenant_id,
            @entra_object_id AS entra_object_id,
            @email_hash AS email_hash,
            @name_hash AS name_hash,
            @role AS role,
            @department AS department
    ) AS source
    ON target.entra_object_id = source.entra_object_id 
       AND target.tenant_id = source.tenant_id
    WHEN MATCHED THEN
        UPDATE SET
            email_hash = source.email_hash,
            name_hash = source.name_hash,
            role = source.role,
            department = source.department,
            updated_at = SYSUTCDATETIME(),
            last_synced_from_graph = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN
        INSERT (tenant_id, entra_object_id, email_hash, name_hash, role, department, last_synced_from_graph)
        VALUES (source.tenant_id, source.entra_object_id, source.email_hash, source.name_hash, 
                source.role, source.department, SYSUTCDATETIME());
END;
GO
```

---

## 3. Microsoft Graph API Integration

### 3.1 Graph Integration Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                MICROSOFT GRAPH API INTEGRATION                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │                    MICROSOFT GRAPH API                          │    │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │    │
│   │   │  Users   │  │  Groups  │  │  Files   │  │  Sites   │      │    │
│   │   │  /users  │  │  /groups │  │  /drive  │  │  /sites  │      │    │
│   │   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │    │
│   │        │             │             │             │              │    │
│   │        └─────────────┴─────────────┴─────────────┘              │    │
│   │                              │                                   │    │
│   └──────────────────────────────┼───────────────────────────────────┘    │
│                                  │                                        │
│                                  ▼                                        │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │                    GRAPH SERVICE LAYER                          │    │
│   │                                                                  │    │
│   │   ┌─────────────────┐    ┌─────────────────┐                   │    │
│   │   │  User Sync      │    │  Permission     │                   │    │
│   │   │  Service        │    │  Checker        │                   │    │
│   │   │                 │    │                 │                   │    │
│   │   │  • Sync users   │    │  • Check access │                   │    │
│   │   │  • Hash PII     │    │  • Sync perms   │                   │    │
│   │   │  • Update SQL   │    │  • Create edges │                   │    │
│   │   └────────┬────────┘    └────────┬────────┘                   │    │
│   │            │                      │                             │    │
│   │            └──────────┬───────────┘                             │    │
│   │                       │                                         │    │
│   │   ┌─────────────────┐ │ ┌─────────────────┐                    │    │
│   │   │  Document Sync  │ │ │  Sensitivity    │                    │    │
│   │   │  Service        │◄┴►│  Label Service  │                    │    │
│   │   │                 │   │                 │                    │    │
│   │   │  • Sync docs    │   │  • Get labels   │                    │    │
│   │   │  • PII scan     │   │  • Apply labels │                    │    │
│   │   │  • Create edges │   │  • Purview sync │                    │    │
│   │   └────────┬────────┘   └────────┬────────┘                    │    │
│   └────────────┼─────────────────────┼──────────────────────────────┘    │
│                │                     │                                    │
│                ▼                     ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │              AZURE SQL DATABASE (Graph Tables)                  │    │
│   └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.2 TypeScript Graph Service Implementation

```typescript
// services/graph-service.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import { createHash } from 'crypto';
import { sql } from '@/lib/azure-sql';

interface GraphUser {
  id: string;
  mail: string;
  displayName: string;
  jobTitle: string;
  department: string;
}

interface GraphDocument {
  id: string;
  name: string;
  webUrl: string;
  sensitivityLabel?: {
    id: string;
    displayName: string;
  };
}

export class MicrosoftGraphService {
  private client: Client;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!
    );

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });

    this.client = Client.initWithMiddleware({
      authProvider,
    });
  }

  /**
   * Hash PII data using SHA-256 (for audit, not encryption)
   */
  private hashPII(value: string): Buffer {
    return createHash('sha256').update(value.toLowerCase().trim()).digest();
  }

  /**
   * Sync user from Microsoft Graph to Azure SQL Graph
   * PII is hashed, not stored in plain text
   */
  async syncUser(entraObjectId: string): Promise<void> {
    const user: GraphUser = await this.client
      .api(`/users/${entraObjectId}`)
      .select('id,mail,displayName,jobTitle,department')
      .get();

    // Hash PII before storage
    const emailHash = this.hashPII(user.mail || '');
    const nameHash = this.hashPII(user.displayName || '');

    // Call stored procedure to sync user
    await sql.query`
      EXEC dbo.sp_SyncUserFromGraph
        @tenant_id = ${this.tenantId},
        @entra_object_id = ${user.id},
        @email_hash = ${emailHash},
        @name_hash = ${nameHash},
        @role = ${user.jobTitle || 'Unknown'},
        @department = ${user.department || 'Unknown'}
    `;
  }

  /**
   * Check if user has permission to access a document
   */
  async checkDocumentAccess(
    userId: string, 
    driveItemId: string
  ): Promise<{ hasAccess: boolean; permissionLevel: string }> {
    try {
      const permissions = await this.client
        .api(`/users/${userId}/drive/items/${driveItemId}/permissions`)
        .get();

      if (permissions.value.length === 0) {
        return { hasAccess: false, permissionLevel: 'none' };
      }

      // Determine highest permission level
      const roles = permissions.value.map((p: any) => p.roles).flat();
      
      if (roles.includes('owner')) {
        return { hasAccess: true, permissionLevel: 'owner' };
      } else if (roles.includes('write')) {
        return { hasAccess: true, permissionLevel: 'write' };
      } else if (roles.includes('read')) {
        return { hasAccess: true, permissionLevel: 'read' };
      }

      return { hasAccess: false, permissionLevel: 'none' };
    } catch (error) {
      // 403 or 404 = no access
      return { hasAccess: false, permissionLevel: 'none' };
    }
  }

  /**
   * Sync document permissions to Azure SQL Graph edges
   */
  async syncDocumentPermissions(
    driveItemId: string,
    documentId: string
  ): Promise<void> {
    const permissions = await this.client
      .api(`/drive/items/${driveItemId}/permissions`)
      .get();

    for (const permission of permissions.value) {
      if (permission.grantedToV2?.user?.id) {
        const userId = permission.grantedToV2.user.id;
        const role = permission.roles[0] || 'read';

        // Create or update HasAccess edge
        await sql.query`
          EXEC sp_set_session_context @key = N'tenant_id', @value = ${this.tenantId};
          
          -- Merge HasAccess edge
          MERGE dbo.HasAccess AS target
          USING (
            SELECT p.$node_id AS from_id, d.$node_id AS to_id
            FROM dbo.Person p, dbo.Document d
            WHERE p.entra_object_id = ${userId}
              AND d.id = ${documentId}
              AND p.tenant_id = ${this.tenantId}
          ) AS source
          ON target.$from_id = source.from_id AND target.$to_id = source.to_id
          WHEN MATCHED THEN
            UPDATE SET permission_level = ${role}, granted_at = SYSUTCDATETIME()
          WHEN NOT MATCHED THEN
            INSERT ($from_id, $to_id, permission_level, granted_at)
            VALUES (source.from_id, source.to_id, ${role}, SYSUTCDATETIME());
        `;
      }
    }
  }

  /**
   * Get sensitivity label for a document
   */
  async getDocumentSensitivityLabel(
    driveItemId: string
  ): Promise<{ labelId: string; labelName: string } | null> {
    try {
      const labels = await this.client
        .api(`/drive/items/${driveItemId}/extractSensitivityLabels`)
        .post({});

      if (labels.labels && labels.labels.length > 0) {
        return {
          labelId: labels.labels[0].sensitivityLabelId,
          labelName: labels.labels[0].name,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sync document metadata from Graph to Azure SQL
   */
  async syncDocument(
    driveItemId: string,
    siteId?: string
  ): Promise<string> {
    const item = await this.client
      .api(`/drive/items/${driveItemId}`)
      .select('id,name,webUrl,file,folder')
      .get();

    // Get sensitivity label
    const label = await this.getDocumentSensitivityLabel(driveItemId);

    // Upsert document to Azure SQL Graph
    const result = await sql.query`
      EXEC sp_set_session_context @key = N'tenant_id', @value = ${this.tenantId};
      
      DECLARE @doc_id UNIQUEIDENTIFIER;
      
      SELECT @doc_id = id FROM dbo.Document 
      WHERE graph_drive_item_id = ${driveItemId} AND tenant_id = ${this.tenantId};
      
      IF @doc_id IS NULL
      BEGIN
        SET @doc_id = NEWID();
        INSERT INTO dbo.Document (
          id, tenant_id, graph_drive_item_id, graph_site_id,
          title, sensitivity_label, sensitivity_label_id
        )
        VALUES (
          @doc_id, ${this.tenantId}, ${driveItemId}, ${siteId},
          ${item.name}, ${label?.labelName}, ${label?.labelId}
        );
      END
      ELSE
      BEGIN
        UPDATE dbo.Document SET
          title = ${item.name},
          sensitivity_label = ${label?.labelName},
          sensitivity_label_id = ${label?.labelId},
          updated_at = SYSUTCDATETIME()
        WHERE id = @doc_id;
      END
      
      SELECT @doc_id AS document_id;
    `;

    return result.recordset[0].document_id;
  }

  /**
   * Get users who can access documents containing PII
   * Returns for compliance reporting
   */
  async getPIIAccessReport(): Promise<Array<{
    userId: string;
    documentCount: number;
    piiTypes: string[];
    highestSensitivity: string;
  }>> {
    const result = await sql.query`
      EXEC sp_set_session_context @key = N'tenant_id', @value = ${this.tenantId};
      
      SELECT 
        p.entra_object_id AS userId,
        COUNT(DISTINCT d.id) AS documentCount,
        STRING_AGG(DISTINCT pii_type.value, ',') AS piiTypes,
        MAX(CASE d.sensitivity_label
          WHEN 'Highly-Confidential' THEN 4
          WHEN 'Confidential' THEN 3
          WHEN 'Internal' THEN 2
          ELSE 1
        END) AS sensitivityRank
      FROM 
        dbo.Person AS p,
        dbo.HasAccess AS ha,
        dbo.Document AS d
        CROSS APPLY OPENJSON(d.pii_types_detected) AS pii_type
      WHERE MATCH(p-(ha)->d)
        AND d.contains_pii = 1
        AND p.tenant_id = ${this.tenantId}
      GROUP BY p.entra_object_id
      ORDER BY sensitivityRank DESC, documentCount DESC;
    `;

    return result.recordset.map(row => ({
      userId: row.userId,
      documentCount: row.documentCount,
      piiTypes: row.piiTypes ? row.piiTypes.split(',') : [],
      highestSensitivity: ['Public', 'Internal', 'Confidential', 'Highly-Confidential'][row.sensitivityRank - 1],
    }));
  }
}
```

### 3.3 Permission Enforcement Middleware

```typescript
// middleware/graph-permission-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { MicrosoftGraphService } from '@/services/graph-service';
import { getToken } from 'next-auth/jwt';

export async function graphPermissionMiddleware(
  req: NextRequest,
  documentId?: string
) {
  const token = await getToken({ req });
  
  if (!token?.sub) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const tenantId = token.tid as string;
  const userId = token.oid as string;

  const graphService = new MicrosoftGraphService(tenantId);

  // If document ID provided, check access
  if (documentId) {
    const { hasAccess, permissionLevel } = await graphService.checkDocumentAccess(
      userId,
      documentId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to document' },
        { status: 403 }
      );
    }

    // Attach permission level to request for downstream use
    req.headers.set('x-document-permission', permissionLevel);
  }

  return null; // Continue processing
}
```

---

## 4. Presidio Integration for Web Apps

### 4.1 Presidio Service Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    PRESIDIO SERVICE (Azure Container App)                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │                      API ENDPOINTS                              │    │
│   │                                                                  │    │
│   │   POST /analyze         Detect PII entities                     │    │
│   │   POST /anonymize       Detect + anonymize PII                  │    │
│   │   POST /deanonymize     Reverse encryption                      │    │
│   │   GET  /health          Health check                            │    │
│   │   GET  /recognizers     List available recognizers              │    │
│   └────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │                    PRESIDIO ENGINES                             │    │
│   │                                                                  │    │
│   │   ┌─────────────────┐    ┌─────────────────┐                   │    │
│   │   │  Analyzer       │    │  Anonymizer     │                   │    │
│   │   │  Engine         │    │  Engine         │                   │    │
│   │   │                 │    │                 │                   │    │
│   │   │  • NER Models   │    │  • Replace      │                   │    │
│   │   │  • Regex        │    │  • Mask         │                   │    │
│   │   │  • Checksums    │    │  • Hash         │                   │    │
│   │   │  • Context      │    │  • Encrypt      │                   │    │
│   │   └─────────────────┘    └─────────────────┘                   │    │
│   │                                                                  │    │
│   │   ┌────────────────────────────────────────────────────────┐   │    │
│   │   │              UK CUSTOM RECOGNIZERS                      │   │    │
│   │   │                                                         │   │    │
│   │   │   UK_NINO          National Insurance Number            │   │    │
│   │   │   UK_NHS_NUMBER    NHS Number                           │   │    │
│   │   │   UK_POSTCODE      UK Postal Code                       │   │    │
│   │   │   UK_DRIVING_LICENCE  DVLA Licence Number              │   │    │
│   │   │   UK_PASSPORT      UK Passport Number                   │   │    │
│   │   │   UK_BANK_ACCOUNT  Sort Code + Account Number           │   │    │
│   │   └────────────────────────────────────────────────────────┘   │    │
│   └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Presidio FastAPI Service

```python
# presidio_service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig
import hashlib
import json

# Import UK custom recognizers
from uk_recognizers import (
    UKNINORecognizer,
    UKNHSNumberRecognizer,
    UKPostcodeRecognizer,
    UKDrivingLicenceRecognizer,
    UKPassportRecognizer,
    UKBankAccountRecognizer
)

app = FastAPI(
    title="Presidio PII Protection Service",
    description="PII detection and anonymization for UK compliance",
    version="1.0.0"
)

# Initialize engines with UK recognizers
def create_analyzer_engine() -> AnalyzerEngine:
    """Create analyzer with UK custom recognizers"""
    
    # Create NLP engine
    nlp_configuration = {
        "nlp_engine_name": "spacy",
        "models": [{"lang_code": "en", "model_name": "en_core_web_lg"}]
    }
    nlp_engine = NlpEngineProvider(nlp_configuration=nlp_configuration).create_engine()
    
    # Create registry with UK recognizers
    registry = RecognizerRegistry()
    registry.load_predefined_recognizers(nlp_engine=nlp_engine)
    
    # Add UK-specific recognizers
    registry.add_recognizer(UKNINORecognizer())
    registry.add_recognizer(UKNHSNumberRecognizer())
    registry.add_recognizer(UKPostcodeRecognizer())
    registry.add_recognizer(UKDrivingLicenceRecognizer())
    registry.add_recognizer(UKPassportRecognizer())
    registry.add_recognizer(UKBankAccountRecognizer())
    
    return AnalyzerEngine(registry=registry, nlp_engine=nlp_engine)

analyzer = create_analyzer_engine()
anonymizer = AnonymizerEngine()

# High-risk PII types that should be blocked, not anonymized
HIGH_RISK_PII_TYPES = {
    "UK_NINO",
    "UK_NHS_NUMBER", 
    "CREDIT_CARD",
    "IBAN_CODE",
    "UK_BANK_ACCOUNT"
}

# Request/Response models
class AnalyzeRequest(BaseModel):
    text: str
    language: str = "en"
    entities: Optional[List[str]] = None
    score_threshold: float = 0.5

class AnalyzeResponse(BaseModel):
    entities: List[Dict[str, Any]]
    contains_high_risk: bool
    high_risk_types: List[str]

class AnonymizeRequest(BaseModel):
    text: str
    language: str = "en"
    entities: Optional[List[str]] = None
    score_threshold: float = 0.5
    operators: Optional[Dict[str, Dict[str, Any]]] = None
    block_high_risk: bool = True

class AnonymizeResponse(BaseModel):
    original_length: int
    anonymized_text: str
    entities_found: List[Dict[str, Any]]
    operators_applied: Dict[str, str]
    blocked: bool
    block_reason: Optional[str]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/recognizers")
async def list_recognizers():
    """List all available recognizers"""
    recognizers = analyzer.get_recognizers()
    return {
        "recognizers": [
            {
                "name": r.name,
                "supported_entities": r.supported_entities,
                "supported_language": r.supported_language
            }
            for r in recognizers
        ]
    }

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """Analyze text for PII entities"""
    
    results = analyzer.analyze(
        text=request.text,
        language=request.language,
        entities=request.entities,
        score_threshold=request.score_threshold
    )
    
    entities = [
        {
            "entity_type": r.entity_type,
            "start": r.start,
            "end": r.end,
            "score": r.score,
            "text_preview": f"{request.text[r.start:r.start+2]}...{request.text[r.end-2:r.end]}" if r.end - r.start > 4 else "[REDACTED]"
        }
        for r in results
    ]
    
    high_risk_types = [
        e["entity_type"] for e in entities 
        if e["entity_type"] in HIGH_RISK_PII_TYPES
    ]
    
    return AnalyzeResponse(
        entities=entities,
        contains_high_risk=len(high_risk_types) > 0,
        high_risk_types=list(set(high_risk_types))
    )

@app.post("/anonymize", response_model=AnonymizeResponse)
async def anonymize_text(request: AnonymizeRequest):
    """Analyze and anonymize PII in text"""
    
    # First, analyze
    results = analyzer.analyze(
        text=request.text,
        language=request.language,
        entities=request.entities,
        score_threshold=request.score_threshold
    )
    
    if not results:
        return AnonymizeResponse(
            original_length=len(request.text),
            anonymized_text=request.text,
            entities_found=[],
            operators_applied={},
            blocked=False,
            block_reason=None
        )
    
    # Check for high-risk PII
    high_risk_found = [r for r in results if r.entity_type in HIGH_RISK_PII_TYPES]
    
    if request.block_high_risk and high_risk_found:
        return AnonymizeResponse(
            original_length=len(request.text),
            anonymized_text="",
            entities_found=[
                {
                    "entity_type": r.entity_type,
                    "start": r.start,
                    "end": r.end,
                    "score": r.score
                }
                for r in results
            ],
            operators_applied={},
            blocked=True,
            block_reason=f"High-risk PII detected: {', '.join(set(r.entity_type for r in high_risk_found))}"
        )
    
    # Configure operators
    default_operators = {
        "PERSON": OperatorConfig("replace", {"new_value": "[PERSON]"}),
        "EMAIL_ADDRESS": OperatorConfig("mask", {"chars_to_mask": 8, "masking_char": "*", "from_end": False}),
        "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "[PHONE]"}),
        "LOCATION": OperatorConfig("replace", {"new_value": "[LOCATION]"}),
        "UK_POSTCODE": OperatorConfig("mask", {"chars_to_mask": 4, "masking_char": "*", "from_end": True}),
        "DEFAULT": OperatorConfig("replace", {"new_value": "[PII]"})
    }
    
    # Override with custom operators if provided
    if request.operators:
        for entity_type, config in request.operators.items():
            default_operators[entity_type] = OperatorConfig(
                config.get("operator", "replace"),
                config.get("params", {})
            )
    
    # Anonymize
    anonymized = anonymizer.anonymize(
        text=request.text,
        analyzer_results=results,
        operators=default_operators
    )
    
    operators_applied = {
        r.entity_type: default_operators.get(r.entity_type, default_operators["DEFAULT"]).operator_name
        for r in results
    }
    
    return AnonymizeResponse(
        original_length=len(request.text),
        anonymized_text=anonymized.text,
        entities_found=[
            {
                "entity_type": r.entity_type,
                "start": r.start,
                "end": r.end,
                "score": r.score
            }
            for r in results
        ],
        operators_applied=operators_applied,
        blocked=False,
        block_reason=None
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

### 4.3 UK Custom Recognizers

```python
# presidio_service/uk_recognizers.py
from presidio_analyzer import Pattern, PatternRecognizer

class UKNINORecognizer(PatternRecognizer):
    """UK National Insurance Number recognizer"""
    
    PATTERNS = [
        Pattern(
            "UK NINO",
            r"\b[A-CEGHJ-PR-TW-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b",
            0.85
        ),
        Pattern(
            "UK NINO (no spaces)",
            r"\b[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]\b",
            0.85
        )
    ]
    
    CONTEXT = [
        "national insurance", "NI number", "NINO", "insurance number",
        "tax", "HMRC", "employer", "payroll"
    ]
    
    def __init__(self):
        super().__init__(
            supported_entity="UK_NINO",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en"
        )


class UKNHSNumberRecognizer(PatternRecognizer):
    """UK NHS Number recognizer (10 digits with checksum)"""
    
    PATTERNS = [
        Pattern(
            "UK NHS Number (spaces)",
            r"\b\d{3}\s\d{3}\s\d{4}\b",
            0.6  # Lower base score, needs context
        ),
        Pattern(
            "UK NHS Number (no spaces)",
            r"\b\d{10}\b",
            0.3  # Very low without context
        )
    ]
    
    CONTEXT = [
        "NHS", "health", "patient", "medical", "hospital", "GP",
        "doctor", "clinic", "prescription", "treatment"
    ]
    
    def __init__(self):
        super().__init__(
            supported_entity="UK_NHS_NUMBER",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en"
        )


class UKPostcodeRecognizer(PatternRecognizer):
    """UK Postcode recognizer"""
    
    PATTERNS = [
        Pattern(
            "UK Postcode (full)",
            r"\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b",
            0.7
        )
    ]
    
    CONTEXT = [
        "address", "postcode", "postal", "post code", "zip",
        "delivery", "location", "home", "office"
    ]
    
    def __init__(self):
        super().__init__(
            supported_entity="UK_POSTCODE",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en"
        )


class UKDrivingLicenceRecognizer(PatternRecognizer):
    """UK Driving Licence Number recognizer"""
    
    PATTERNS = [
        Pattern(
            "UK Driving Licence",
            r"\b[A-Z]{5}\d{6}[A-Z]{2}\d{2}\b",
            0.8
        )
    ]
    
    CONTEXT = [
        "driving", "licence", "license", "DVLA", "driver",
        "vehicle", "car", "insurance"
    ]
    
    def __init__(self):
        super().__init__(
            supported_entity="UK_DRIVING_LICENCE",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en"
        )


class UKPassportRecognizer(PatternRecognizer):
    """UK Passport Number recognizer"""
    
    PATTERNS = [
        Pattern(
            "UK Passport",
            r"\b\d{9}\b",
            0.3  # Low without context
        )
    ]
    
    CONTEXT = [
        "passport", "travel", "border", "immigration", "visa",
        "identity", "document"
    ]
    
    def __init__(self):
        super().__init__(
            supported_entity="UK_PASSPORT",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en"
        )


class UKBankAccountRecognizer(PatternRecognizer):
    """UK Bank Account (Sort Code + Account Number) recognizer"""
    
    PATTERNS = [
        Pattern(
            "UK Sort Code",
            r"\b\d{2}-\d{2}-\d{2}\b",
            0.6
        ),
        Pattern(
            "UK Sort Code (no dash)",
            r"\b\d{6}\b",
            0.2  # Very low without context
        ),
        Pattern(
            "UK Account Number",
            r"\b\d{8}\b",
            0.2  # Very low without context
        )
    ]
    
    CONTEXT = [
        "bank", "account", "sort code", "account number", "payment",
        "transfer", "BACS", "direct debit", "standing order"
    ]
    
    def __init__(self):
        super().__init__(
            supported_entity="UK_BANK_ACCOUNT",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="en"
        )
```

### 4.4 TypeScript Presidio Client

```typescript
// services/presidio-client.ts
import { sql } from '@/lib/azure-sql';

interface PIIEntity {
  entity_type: string;
  start: number;
  end: number;
  score: number;
  text_preview?: string;
}

interface AnalyzeResult {
  entities: PIIEntity[];
  contains_high_risk: boolean;
  high_risk_types: string[];
}

interface AnonymizeResult {
  original_length: number;
  anonymized_text: string;
  entities_found: PIIEntity[];
  operators_applied: Record<string, string>;
  blocked: boolean;
  block_reason?: string;
}

export class PresidioClient {
  private baseUrl: string;
  private tenantId: string;

  constructor(tenantId: string) {
    this.baseUrl = process.env.PRESIDIO_SERVICE_URL || 'http://presidio:8080';
    this.tenantId = tenantId;
  }

  /**
   * Analyze text for PII without anonymization
   */
  async analyze(text: string): Promise<AnalyzeResult> {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language: 'en',
        score_threshold: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`Presidio analyze failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Analyze and anonymize text, blocking high-risk PII
   */
  async anonymize(
    text: string,
    options?: {
      blockHighRisk?: boolean;
      operators?: Record<string, { operator: string; params?: Record<string, any> }>;
    }
  ): Promise<AnonymizeResult> {
    const response = await fetch(`${this.baseUrl}/anonymize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language: 'en',
        score_threshold: 0.5,
        block_high_risk: options?.blockHighRisk ?? true,
        operators: options?.operators
      })
    });

    if (!response.ok) {
      throw new Error(`Presidio anonymize failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Full PII protection pipeline for AI requests
   * Returns anonymized text and audit data
   */
  async protectForAI(
    prompt: string,
    requestId: string
  ): Promise<{
    processedPrompt: string;
    blocked: boolean;
    auditData: Record<string, any>;
  }> {
    const result = await this.anonymize(prompt, {
      blockHighRisk: true,
      operators: {
        'PERSON': { operator: 'replace', params: { new_value: '[PERSON]' } },
        'EMAIL_ADDRESS': { operator: 'mask', params: { chars_to_mask: 8 } },
        'PHONE_NUMBER': { operator: 'replace', params: { new_value: '[PHONE]' } }
      }
    });

    const auditData = {
      request_id: requestId,
      pii_detected: result.entities_found.length > 0,
      entities_found: result.entities_found.map(e => e.entity_type),
      high_risk_blocked: result.blocked,
      block_reason: result.block_reason,
      operators_applied: result.operators_applied,
      timestamp: new Date().toISOString()
    };

    return {
      processedPrompt: result.blocked ? '' : result.anonymized_text,
      blocked: result.blocked,
      auditData
    };
  }

  /**
   * Scan AI output for PII leakage
   */
  async scanOutput(response: string): Promise<{
    containsPII: boolean;
    entities: PIIEntity[];
    severity: 'none' | 'low' | 'medium' | 'high';
  }> {
    const result = await this.analyze(response);

    let severity: 'none' | 'low' | 'medium' | 'high' = 'none';
    
    if (result.contains_high_risk) {
      severity = 'high';
    } else if (result.entities.length > 5) {
      severity = 'medium';
    } else if (result.entities.length > 0) {
      severity = 'low';
    }

    return {
      containsPII: result.entities.length > 0,
      entities: result.entities,
      severity
    };
  }

  /**
   * Log PII scan results to Azure SQL
   */
  async logToAudit(
    interactionId: string,
    inputScan: Record<string, any>,
    outputScan: Record<string, any>,
    actionTaken: 'none' | 'anonymized' | 'blocked'
  ): Promise<void> {
    await sql.query`
      EXEC sp_set_session_context @key = N'tenant_id', @value = ${this.tenantId};
      
      UPDATE dbo.AIInteraction SET
        pii_detected_input = ${inputScan.pii_detected ? 1 : 0},
        pii_detected_output = ${outputScan.containsPII ? 1 : 0},
        pii_action_taken = ${actionTaken},
        presidio_input_scan = ${JSON.stringify(inputScan)},
        presidio_output_scan = ${JSON.stringify(outputScan)}
      WHERE id = ${interactionId} AND tenant_id = ${this.tenantId};
    `;
  }
}
```

---

## 5. Azure OpenAI Integration

### 5.1 Secure AI Client

```typescript
// services/azure-openai-client.ts
import { AzureOpenAI } from 'openai';
import { DefaultAzureCredential } from '@azure/identity';
import { PresidioClient } from './presidio-client';
import { sql } from '@/lib/azure-sql';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

interface AICompletionOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  userId: string;
  sessionId?: string;
}

interface AICompletionResult {
  response: string;
  interactionId: string;
  piiBlocked: boolean;
  piiBlockReason?: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

export class SecureAzureOpenAIClient {
  private client: AzureOpenAI;
  private presidio: PresidioClient;
  private tenantId: string;
  private deploymentName: string;
  private deploymentRegion: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
    this.deploymentRegion = process.env.AZURE_OPENAI_REGION || 'uksouth';

    // Use managed identity for auth
    const credential = new DefaultAzureCredential();

    this.client = new AzureOpenAI({
      azureADTokenProvider: async () => {
        const token = await credential.getToken('https://cognitiveservices.azure.com/.default');
        return token.token;
      },
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
      apiVersion: '2024-06-01'
    });

    this.presidio = new PresidioClient(tenantId);
  }

  /**
   * Hash content for audit (never store raw prompts with PII)
   */
  private hashContent(content: string): Buffer {
    return createHash('sha256').update(content).digest();
  }

  /**
   * Complete with full PII protection pipeline
   */
  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    const startTime = Date.now();
    const requestId = uuidv4();
    const sessionId = options.sessionId || uuidv4();

    // STEP 1: PII protection on input
    const piiProtection = await this.presidio.protectForAI(
      options.prompt,
      requestId
    );

    // If high-risk PII blocked, return early
    if (piiProtection.blocked) {
      // Log blocked attempt
      await this.logInteraction({
        tenantId: this.tenantId,
        sessionId,
        requestId,
        userId: options.userId,
        promptHash: this.hashContent(options.prompt),
        responseHash: Buffer.alloc(0),
        piiDetectedInput: true,
        piiDetectedOutput: false,
        piiActionTaken: 'blocked',
        presidioInputScan: piiProtection.auditData,
        presidioOutputScan: {},
        promptTokens: 0,
        completionTokens: 0,
        latencyMs: Date.now() - startTime
      });

      return {
        response: '',
        interactionId: requestId,
        piiBlocked: true,
        piiBlockReason: piiProtection.auditData.block_reason,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        latencyMs: Date.now() - startTime
      };
    }

    // STEP 2: Call Azure OpenAI
    const completion = await this.client.chat.completions.create({
      model: this.deploymentName,
      messages: [
        ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        { role: 'user' as const, content: piiProtection.processedPrompt }
      ],
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // STEP 3: Scan output for PII leakage
    const outputScan = await this.presidio.scanOutput(responseText);

    // STEP 4: Log interaction
    await this.logInteraction({
      tenantId: this.tenantId,
      sessionId,
      requestId,
      userId: options.userId,
      promptHash: this.hashContent(options.prompt),
      responseHash: this.hashContent(responseText),
      piiDetectedInput: piiProtection.auditData.pii_detected,
      piiDetectedOutput: outputScan.containsPII,
      piiActionTaken: piiProtection.auditData.pii_detected ? 'anonymized' : 'none',
      presidioInputScan: piiProtection.auditData,
      presidioOutputScan: outputScan,
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      latencyMs: Date.now() - startTime
    });

    // STEP 5: Alert if PII leaked in output
    if (outputScan.severity === 'high') {
      await this.alertPIILeakage(requestId, outputScan);
    }

    return {
      response: responseText,
      interactionId: requestId,
      piiBlocked: false,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0
      },
      latencyMs: Date.now() - startTime
    };
  }

  /**
   * Log interaction to Azure SQL Graph
   */
  private async logInteraction(data: {
    tenantId: string;
    sessionId: string;
    requestId: string;
    userId: string;
    promptHash: Buffer;
    responseHash: Buffer;
    piiDetectedInput: boolean;
    piiDetectedOutput: boolean;
    piiActionTaken: string;
    presidioInputScan: Record<string, any>;
    presidioOutputScan: Record<string, any>;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
  }): Promise<void> {
    await sql.query`
      EXEC dbo.sp_LogAIInteraction
        @tenant_id = ${data.tenantId},
        @session_id = ${data.sessionId},
        @request_id = ${data.requestId},
        @user_entra_id = ${data.userId},
        @model_provider = 'azure-openai',
        @model_name = ${this.deploymentName},
        @deployment_region = ${this.deploymentRegion},
        @prompt_hash = ${data.promptHash},
        @response_hash = ${data.responseHash},
        @pii_detected_input = ${data.piiDetectedInput ? 1 : 0},
        @pii_detected_output = ${data.piiDetectedOutput ? 1 : 0},
        @pii_action_taken = ${data.piiActionTaken},
        @presidio_input_scan = ${JSON.stringify(data.presidioInputScan)},
        @presidio_output_scan = ${JSON.stringify(data.presidioOutputScan)},
        @content_safety_input = NULL,
        @content_safety_output = NULL,
        @prompt_tokens = ${data.promptTokens},
        @completion_tokens = ${data.completionTokens},
        @latency_ms = ${data.latencyMs}
    `;
  }

  /**
   * Alert on PII leakage (integrate with Azure Monitor/Sentinel)
   */
  private async alertPIILeakage(
    requestId: string,
    outputScan: { entities: any[]; severity: string }
  ): Promise<void> {
    // Log to Azure Monitor custom metrics
    console.error(JSON.stringify({
      event: 'PII_LEAKAGE_DETECTED',
      severity: 'critical',
      request_id: requestId,
      tenant_id: this.tenantId,
      entities_leaked: outputScan.entities.map(e => e.entity_type),
      timestamp: new Date().toISOString()
    }));

    // In production, integrate with Azure Monitor or Sentinel
    // await azureMonitorClient.trackEvent({ name: 'PIILeakage', properties: {...} });
  }
}
```

---

## 6. API Routes Implementation

### 6.1 AI Completion Endpoint

```typescript
// app/api/ai/completion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SecureAzureOpenAIClient } from '@/services/azure-openai-client';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const token = await getToken({ req });
    
    if (!token?.sub || !token?.tid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tenantId = token.tid as string;
    const userId = token.oid as string;

    // 2. Parse request
    const body = await req.json();
    const { prompt, systemPrompt, maxTokens, temperature, sessionId } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      );
    }

    // 3. Create secure client and complete
    const client = new SecureAzureOpenAIClient(tenantId);
    
    const result = await client.complete({
      prompt,
      systemPrompt,
      maxTokens,
      temperature,
      userId,
      sessionId
    });

    // 4. Handle PII blocking
    if (result.piiBlocked) {
      return NextResponse.json(
        { 
          error: 'Request blocked due to sensitive data',
          reason: result.piiBlockReason,
          interactionId: result.interactionId
        },
        { status: 400 }
      );
    }

    // 5. Return response
    return NextResponse.json({
      response: result.response,
      interactionId: result.interactionId,
      usage: result.usage,
      latencyMs: result.latencyMs
    });

  } catch (error) {
    console.error('AI completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 6.2 PII Audit Endpoint

```typescript
// app/api/governance/pii-audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { sql } from '@/lib/azure-sql';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token?.tid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = token.tid as string;
    const { searchParams } = new URL(req.url);
    
    const days = parseInt(searchParams.get('days') || '7');
    const severity = searchParams.get('severity'); // 'info', 'warning', 'critical'

    // Set tenant context
    await sql.query`EXEC sp_set_session_context @key = N'tenant_id', @value = ${tenantId}`;

    // Query PII audit log with graph relationships
    const result = await sql.query`
      SELECT 
        pal.id,
        pal.event_type,
        pal.event_severity,
        pal.pii_entity_types,
        pal.pii_entity_count,
        pal.action_taken,
        pal.source_endpoint,
        pal.created_at,
        ai.model_name,
        ai.deployment_region,
        p.role AS user_role,
        p.department
      FROM 
        dbo.PIIAuditLog AS pal
        LEFT JOIN dbo.AuditedInteraction AS aui ON pal.$node_id = aui.$from_id
        LEFT JOIN dbo.AIInteraction AS ai ON aui.$to_id = ai.$node_id
        LEFT JOIN dbo.Initiated AS init ON ai.$node_id = init.$to_id
        LEFT JOIN dbo.Person AS p ON init.$from_id = p.$node_id
      WHERE 
        pal.tenant_id = ${tenantId}
        AND pal.created_at > DATEADD(day, -${days}, SYSUTCDATETIME())
        ${severity ? sql`AND pal.event_severity = ${severity}` : sql``}
      ORDER BY pal.created_at DESC
    `;

    // Aggregate statistics
    const stats = await sql.query`
      SELECT 
        event_severity,
        COUNT(*) as count,
        COUNT(DISTINCT CAST(created_at AS DATE)) as days_with_events
      FROM dbo.PIIAuditLog
      WHERE tenant_id = ${tenantId}
        AND created_at > DATEADD(day, -${days}, SYSUTCDATETIME())
      GROUP BY event_severity
    `;

    return NextResponse.json({
      events: result.recordset,
      statistics: stats.recordset,
      period: { days, startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    });

  } catch (error) {
    console.error('PII audit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 7. Infrastructure as Code

### 7.1 Azure Resources (Bicep)

```bicep
// infrastructure/main.bicep
@description('The location for all resources')
param location string = 'uksouth'

@description('Environment name')
param environmentName string = 'prod'

@description('The tenant identifier')
param tenantId string

// Azure SQL Database
module sqlDatabase 'modules/sql-database.bicep' = {
  name: 'sql-database'
  params: {
    location: location
    environmentName: environmentName
    administratorLogin: 'sqladmin'
    administratorLoginPassword: keyVault.getSecret('sql-admin-password')
  }
}

// Azure OpenAI
module openAI 'modules/azure-openai.bicep' = {
  name: 'azure-openai'
  params: {
    location: location
    environmentName: environmentName
    deployments: [
      {
        name: 'gpt-4o'
        model: 'gpt-4o'
        version: '2024-05-13'
        capacity: 30
      }
      {
        name: 'gpt-4o-mini'
        model: 'gpt-4o-mini'
        version: '2024-07-18'
        capacity: 60
      }
    ]
  }
}

// Presidio Container App
module presidio 'modules/presidio-container.bicep' = {
  name: 'presidio-service'
  params: {
    location: location
    environmentName: environmentName
    containerImage: 'your-acr.azurecr.io/presidio-service:latest'
  }
}

// API Management
module apim 'modules/api-management.bicep' = {
  name: 'api-management'
  params: {
    location: location
    environmentName: environmentName
    publisherEmail: 'admin@yourdomain.com'
    publisherName: 'Your Company'
  }
}

// Key Vault for secrets
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: 'kv-${environmentName}-${uniqueString(resourceGroup().id)}'
}

// Outputs
output sqlServerFqdn string = sqlDatabase.outputs.serverFqdn
output openAIEndpoint string = openAI.outputs.endpoint
output presidioUrl string = presidio.outputs.url
output apimGatewayUrl string = apim.outputs.gatewayUrl
```

### 7.2 SQL Database Module

```bicep
// infrastructure/modules/sql-database.bicep
param location string
param environmentName string
param administratorLogin string
@secure()
param administratorLoginPassword string

var serverName = 'sql-${environmentName}-${uniqueString(resourceGroup().id)}'
var databaseName = 'db-pii-protected'

resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: serverName
  location: location
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Disabled'
  }
  
  // Enable Microsoft Entra authentication
  resource azureADAdmin 'administrators' = {
    name: 'ActiveDirectory'
    properties: {
      administratorType: 'ActiveDirectory'
      login: 'EntraAdminGroup'
      sid: 'your-entra-group-object-id'
      tenantId: tenant().tenantId
    }
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  sku: {
    name: 'GP_S_Gen5'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 2
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 34359738368  // 32 GB
    zoneRedundant: true
    
    // Enable Transparent Data Encryption
    isLedgerOn: false
  }
}

// Enable Advanced Threat Protection
resource advancedThreatProtection 'Microsoft.Sql/servers/advancedThreatProtectionSettings@2023-05-01-preview' = {
  parent: sqlServer
  name: 'Default'
  properties: {
    state: 'Enabled'
  }
}

// Enable Auditing to Log Analytics
resource sqlAudit 'Microsoft.Sql/servers/auditingSettings@2023-05-01-preview' = {
  parent: sqlServer
  name: 'default'
  properties: {
    state: 'Enabled'
    isAzureMonitorTargetEnabled: true
    retentionDays: 90
    auditActionsAndGroups: [
      'SUCCESSFUL_DATABASE_AUTHENTICATION_GROUP'
      'FAILED_DATABASE_AUTHENTICATION_GROUP'
      'BATCH_COMPLETED_GROUP'
    ]
  }
}

output serverFqdn string = sqlServer.properties.fullyQualifiedDomainName
output databaseName string = sqlDatabase.name
```

---

## 8. Compliance Mapping

### 8.1 MCSB v2 AI Controls Coverage

| MCSB Control | Implementation | Evidence Location |
|--------------|---------------|-------------------|
| **AI-1: Approved Models** | Azure OpenAI UK South only | Bicep deployment, no Anthropic global |
| **AI-2: Content Filtering** | Presidio + Content Safety | API middleware, audit logs |
| **AI-3: Safety Meta-Prompts** | System prompt templates | Code repository |
| **AI-4: Least Privilege** | RLS, Graph permissions | SQL policies, stored procs |
| **AI-5: Human-in-Loop** | PII blocking + alerts | API responses, Sentinel |
| **AI-6: Monitoring** | Azure Monitor + SQL audit | Log Analytics workspace |
| **AI-7: Red Teaming** | Quarterly pen tests | Security assessment reports |

### 8.2 UK GDPR Compliance

| Requirement | Implementation | Evidence |
|-------------|---------------|----------|
| **Article 5(1)(f)** Integrity & Confidentiality | Always Encrypted, RLS, TDE | SQL configuration |
| **Article 17** Right to Erasure | Soft delete + hash-only storage | Stored procedures |
| **Article 25** Data Protection by Design | PII never stored in plain text | Schema design |
| **Article 30** Records of Processing | Full audit trail in SQL Graph | PIIAuditLog table |
| **Article 32** Security of Processing | Defense-in-depth architecture | This document |
| **Article 33** Breach Notification | High-severity alerts | Sentinel playbooks |

### 8.3 Cross-Framework Traceability

| Control Family | MCSB v2 | ISO 27001 | NIST 800-53 | UK Cyber Essentials |
|----------------|---------|-----------|-------------|---------------------|
| Data Classification | AI-1, DP-2 | A.8.2 | AC-3, SC-28 | Access Control |
| Encryption | AI-2, DP-4 | A.10.1 | SC-8, SC-28 | Secure Configuration |
| Access Control | AI-4, IM-1 | A.9.1 | AC-2, AC-6 | Access Control |
| Logging & Monitoring | AI-6, LT-1 | A.12.4 | AU-2, AU-6 | Security Monitoring |
| Incident Response | AI-5, IR-1 | A.16.1 | IR-4, IR-6 | Incident Management |

---

## 9. Deployment Checklist

### 9.1 Pre-Deployment

- [ ] Azure subscription with UK South resources enabled
- [ ] Microsoft Entra ID tenant configured
- [ ] Key Vault created with CMK for Always Encrypted
- [ ] Presidio container image built and pushed to ACR
- [ ] Network security groups configured
- [ ] Private endpoints for SQL and OpenAI

### 9.2 Database Setup

- [ ] Azure SQL Database created in UK South
- [ ] Graph tables created (Section 2.2)
- [ ] Row-Level Security enabled (Section 2.3)
- [ ] Always Encrypted configured for PII columns
- [ ] Stored procedures deployed
- [ ] Purview scanner registered

### 9.3 Application Deployment

- [ ] API Management gateway configured
- [ ] Presidio Container App deployed
- [ ] Next.js application deployed (App Service/Container Apps)
- [ ] Microsoft Graph API permissions granted
- [ ] Environment variables configured

### 9.4 Security Validation

- [ ] Penetration test completed
- [ ] PII detection accuracy validated (>95%)
- [ ] RLS tenant isolation verified
- [ ] Audit logging confirmed
- [ ] Alert pipeline tested

### 9.5 Go-Live

- [ ] Runbook documented
- [ ] On-call rotation established
- [ ] Compliance evidence package prepared
- [ ] User training completed

---

## 10. Summary

This architecture provides a **Microsoft-native, UK data sovereign** solution for PII protection in web applications with:

| Capability | Technology | Region |
|------------|-----------|--------|
| **Graph Database** | Azure SQL Database (Graph Tables) | UK South |
| **M365 Integration** | Microsoft Graph API | EU Data Boundary |
| **PII Detection** | Presidio + Azure Content Safety | UK South |
| **AI Processing** | Azure OpenAI (Regional) | UK South |
| **Identity** | Microsoft Entra ID | Global (UK tenant) |
| **Governance** | Microsoft Purview | UK/EU |
| **Monitoring** | Azure Monitor + Sentinel | UK South |

### Key Differentiators from Supabase Approach

| Aspect | Supabase | Azure SQL Graph |
|--------|----------|-----------------|
| **UK Data Residency** | Limited (EU region) | ✅ UK South native |
| **Graph Queries** | PostgreSQL extensions | ✅ Native MATCH syntax |
| **Column Encryption** | Application-level | ✅ Always Encrypted |
| **Tenant Isolation** | RLS (manual) | ✅ RLS (enterprise-grade) |
| **Purview Integration** | ❌ None | ✅ Full classification |
| **M365 Integration** | ❌ None | ✅ Graph API native |
| **Compliance Evidence** | Manual | ✅ Automated audit |

---

**Document Classification:** CONFIDENTIAL - INTERNAL USE  
**Last Updated:** February 2026  
**Platform Instances:** PF-Core, BAIV, W4M, AIR  
**Review Cycle:** Quarterly

---

*© 2026 Platform Foundation Core Holdings. BAIV and W4M licensed under PF-Core Participant Arrangements.*
