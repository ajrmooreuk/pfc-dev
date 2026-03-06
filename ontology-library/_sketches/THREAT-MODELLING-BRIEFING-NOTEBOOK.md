# Threat Modelling Briefing Notebook

## Agentic AI-Enhanced Threat Modelling: From Strategy to Implementation

**Document:** `THREAT-MODELLING-BRIEFING-NOTEBOOK.md`
**Version:** 1.0.0-DRAFT
**Date:** 2026-02-18
**Classification:** INTERNAL
**Status:** Briefing Notebook — Feature Candidate for GRC-ONT Series
**Epic Reference:** Epic 30 (#370) — GRC Series Architecture

---

## Part 1: Strategic Context — VSOM Alignment

### 1.1 Vision Statement

> **Establish adaptive, AI-enhanced threat modelling as a continuous governance capability within the GRC framework, enabling organisations to dynamically assess, model, and respond to evolving threats across their AI and enterprise technology landscape.**

### 1.2 VSOM Framework Mapping

| VSOM Component | Threat Modelling Alignment |
|----------------|---------------------------|
| **Driver** | Business Impact — threat exposure directly threatens strategic objectives (via `erm:riskThreatsObjective → vsom:StrategicObjective`) |
| **Goal** | Outcomes — measurable reduction in residual risk, faster mean-time-to-detect, continuous compliance posture |
| **Measure** | Value — quantified risk reduction (ALE delta), compliance coverage %, threat detection latency |

### 1.3 Strategic Positioning — Where Threat Modelling Fits

```
VSOM (Strategy)
  └─► "Protect and sustain the value we create"
       └─► GRC-FW (Governance Hub, Tier 0)
            ├─► GRC-02-RISK / ERM-ONT (Tier 1) — Enterprise Risk Register
            │    ├─► RMF-IS27005-ONT (Tier 2) — ISO 27005 InfoSec Risk
            │    └─► ★ THREAT-MODEL-ONT (Tier 2) ← NEW FEATURE CANDIDATE
            │         ├─► Cyber-Risk-ONT integration (MITRE ATT&CK graph)
            │         ├─► OWASP AI Top 10 / LLM Top 10 coverage
            │         └─► ISO 27005 threat-vulnerability-asset chain
            ├─► GRC-04-SEC / SEC-FW-ONT (Tier 1, planned)
            │    ├─► MCSB-ONT, PII-ONT (Tier 2)
            │    └─► ★ Threat model outputs → security control selection
            └─► GRC-06-AI / AI-GOV-ONT (Tier 1, planned)
                 └─► ★ AI-specific threat scenarios → governance policies
```

### 1.4 Strategy Component — Competitive Advantage

| Strategy Dimension | Approach |
|--------------------|----------|
| **Strategy Type** | Digital + Innovation (from `vsom:StrategyComponent.strategyType`) |
| **Strategic Thrust** | Shift from periodic point-in-time threat assessments to continuous, agentic threat modelling |
| **Competitive Advantage** | Ontology-grounded threat intelligence with full MITRE ATLAS + OWASP AI coverage, automated via AI agents |
| **Resource Requirements** | GRC ontology extensions + agentic skills + PPM-EFS delivery pipeline |

---

## Part 2: Source Analysis — Threat Modelling Framework Review

### 2.1 Framework Structure Assessment

The source document ("Threat Modeling in ISO 27005: Gen AI Enhanced Solutions Framework v2.0") provides comprehensive coverage across three standards frameworks:

| Framework | Coverage Claimed | Assessment |
|-----------|-----------------|------------|
| **MITRE ATLAS** | 14/14 tactics, 48 techniques, 25 sub-techniques | Comprehensive taxonomy — maps directly to `cyber-risk:AttackTechnique.mitreTactic` |
| **OWASP LLM Top 10 (2025)** | 10/10 risks + extended RAG/agentic/multi-modal | Excellent — covers all current AI-specific threat classes |
| **ISO 27005:2022** | Full process alignment (Context → Identify → Analyse → Evaluate → Treat → Monitor) | Aligns to existing `rmf:RiskAssessment` process in RMF-IS27005-ONT |

### 2.2 Key Concepts Extracted for Ontology Modelling

From the source document, these are the **first-class entities** a threat modelling ontology needs:

| Concept | Source Reference | Existing Ontology Coverage | Gap |
|---------|-----------------|---------------------------|-----|
| **ThreatScenario** | ATLAS case studies, OWASP risk scenarios | `cyber-risk:RiskScenario` (partial) | Needs threat model lifecycle, versioning |
| **ThreatActor** | ATLAS Reconnaissance, Resource Development | `cyber-risk:ThreatActor` (full) | Already modelled |
| **AttackTechnique** | ATLAS 48 techniques across 14 tactics | `cyber-risk:AttackTechnique` (full) | Already modelled |
| **AttackChain** | Multi-stage attack sequences (Section 4) | Not modelled | **NEW ENTITY NEEDED** — ordered sequence of techniques |
| **ThreatModel** | Overall model container with scope config | Not modelled | **NEW ENTITY NEEDED** — the model itself as first-class |
| **ScopeConfiguration** | [INCLUDE/EXCLUDE] toggles (Section 5) | Not modelled | **NEW ENTITY NEEDED** — configurable threat scope |
| **CoverageValidation** | Attestation/audit results (Section 6) | Not modelled | **NEW ENTITY NEEDED** — coverage gap analysis |
| **MitigationControl** | ISO 27005 treatment controls | `erm:Control` + `cyber-risk:SecurityControl` | Already modelled at Tier 1+2 |
| **ArchitecturalPattern** | Cloud-native, on-premise, RAG, agentic patterns | `ea-core:TechnologyArchitecture` (partial) | Needs AI architecture specialisation |

### 2.3 Configurable Scope System — Analysis

The source document introduces a powerful **scope configuration pattern** with `[INCLUDE/EXCLUDE]` toggles:

```
ALWAYS_INCLUDE (Core AI Threats)
  ├── Prompt Injection (ATLAS AML.T0070 + OWASP LLM01)
  ├── Training Data Poisoning (ATLAS AML.T0148 + OWASP LLM03)
  ├── Model Extraction (ATLAS AML.T0140 + OWASP LLM10)
  ├── Information Disclosure (ATLAS AML.T0135 + OWASP LLM06)
  └── Denial of Service (ATLAS AML.T0150 + OWASP LLM04)

CONDITIONAL_INCLUDE (Architecture-Dependent)
  ├── Multi-Modal Threats [IF: multi-modal capabilities]
  ├── RAG System Threats [IF: retrieval-augmented generation]
  ├── Agentic AI Threats [IF: autonomous agent capabilities]
  └── Fine-tuning Threats [IF: custom model training]

EXCLUDE_BY_DEFAULT (Separate Assessment)
  ├── Physical Hardware Attacks → Physical Security Assessment
  ├── Traditional IT Security → Enterprise Security Framework
  └── Research-Stage Attacks → Emerging Technology Watch
```

**Ontology Implication:** This maps to an enum-driven `ScopeConfiguration` entity with `inclusion-rule` properties and `justification` text fields, linked to `ea-core:TechnologyArchitecture` patterns.

### 2.4 ISO 27005 Integration Points — Risk Process Mapping

| ISO 27005 Phase | Source Document Section | Ontology Entity Chain |
|-----------------|------------------------|----------------------|
| **Context Establishment** | Section 4.1 — Scope Configuration | `grc-fw:GRCContext` → `erm:RiskRegister` → `threat:ThreatModel` |
| **Risk Identification** | Section 2 + 3 — ATLAS/OWASP enumeration | `threat:ThreatModel` → `threat:ThreatScenario` → `cyber-risk:ThreatActor` + `AttackTechnique` |
| **Risk Analysis** | Section 4.1.2 — Architectural design integration | `threat:ThreatScenario` → `cyber-risk:RiskScenario` (likelihood × impact) |
| **Risk Evaluation** | Section 5 — Scope justification framework | `erm:Risk` → `erm:RiskAppetite` → acceptance/treatment decision |
| **Risk Treatment** | Section 6 — Implementation validation | `erm:Control` + `cyber-risk:SecurityControl` → `mcsb:SecurityControl` |
| **Monitoring & Review** | Section 6.1 — Continuous validation | `threat:CoverageValidation` → periodic re-assessment triggers |

---

## Part 3: GRC-ONT Feature Candidate — THREAT-MODEL-ONT

### 3.1 Feature Proposal Summary

| Field | Value |
|-------|-------|
| **Feature ID** | F30.13 (next sequential under Epic 30) |
| **Feature Title** | F30.13: AI-Enhanced Threat Modelling — THREAT-MODEL-ONT v1.0.0 |
| **Parent Epic** | Epic 30: GRC Series Architecture (#370) |
| **Phase** | Phase C (Extended Domains) or new Phase F (Advanced Capabilities) |
| **Tier** | Tier 2 — specialisation under GRC-02-RISK/ERM-ONT |
| **Directory** | `RCSG-Series/GRC-02-RISK/THREAT-MODEL-ONT/` |
| **Dependencies** | ERM-ONT v1.0.0 (Tier 1), Cyber-Risk-ONT v1.0.0 (graph integration), RMF-IS27005-ONT v1.0.0 |
| **Cross-Series** | EA-CORE-ONT (architecture patterns), VSOM-ONT (strategic alignment), AI-GOV-ONT (when available) |

### 3.2 Proposed Entity Model

```
THREAT-MODEL-ONT v1.0.0 — Entity Architecture

┌─────────────────────────────────────────────────────┐
│  ThreatModel (Container)                            │
│  ─────────────────────                              │
│  modelId: UUID                                      │
│  name: string                                       │
│  version: semver                                    │
│  modelType: enum(Baseline, Incremental, Continuous) │
│  methodology: enum(STRIDE, PASTA, LINDDUN, VAST,   │
│               ATLAS-Driven, Hybrid)                 │
│  status: enum(Draft, Active, UnderReview, Archived) │
│  scopeRef: → ScopeConfiguration                     │
│  targetSystemRef: → ea-core:EAEntity                │
│  riskRegisterRef: → erm:RiskRegister                │
│  validFrom: ISO-8601                                │
│  validUntil: ISO-8601                               │
│  reviewCadence: enum(Monthly, Quarterly, Biannual,  │
│                      Annual, Continuous)             │
│  lastReviewDate: ISO-8601                           │
│  owner: string                                      │
│  confidentiality: enum(Public, Internal,            │
│                        Confidential, Restricted)    │
└─────────────────────────────────────────────────────┘
         │ hasScopeConfig (1..1)
         │ containsScenario (1..*)
         │ hasValidation (0..*)
         ▼
┌─────────────────────────────────────────────────────┐
│  ScopeConfiguration                                 │
│  ──────────────────                                 │
│  scopeId: UUID                                      │
│  architecturePattern: enum(CloudNativeLLM,          │
│    OnPremiseTraining, RAGEnhanced, AgenticAI,       │
│    MultiModal, FederatedLearning, EdgeAI,           │
│    HybridCloud, APIService)                         │
│  includedCategories: [ThreatCategoryInclusion]      │
│  excludedCategories: [ThreatCategoryExclusion]      │
│  standardsCoverage: [enum(MITRE_ATLAS, OWASP_LLM,  │
│    OWASP_AI, ISO_27005, STRIDE, PASTA, NIST_AI)]   │
│  scopeJustification: text                           │
│  approvedBy: string                                 │
│  approvalDate: ISO-8601                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ThreatCategoryInclusion / ThreatCategoryExclusion  │
│  ─────────────────────────────────────────────────  │
│  category: enum(CoreAIThreats,                      │
│    MITREATLASMapped, OWASPLLMTop10,                 │
│    SupplyChain, PluginSecurity,                     │
│    MultiModalThreats, RAGThreats,                   │
│    AgenticAIThreats, FineTuningThreats,             │
│    PhysicalHardware, TraditionalIT,                 │
│    EmergingAI, ResearchStage, QuantumAI)            │
│  inclusionRule: enum(Always, Default, Conditional,  │
│                      ExcludeByDefault)              │
│  condition: text (nullable)                         │
│  justification: text                                │
│  alternativeCoverage: text (nullable)               │
│  reviewTrigger: text                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ThreatScenario                                     │
│  ──────────────                                     │
│  scenarioId: UUID                                   │
│  name: string                                       │
│  description: text                                  │
│  scenarioType: enum(SingleVector, MultiStage,       │
│    ChainedAttack, InsiderThreat, SupplyChain,       │
│    AdversarialML, PromptExploit, DataPoisoning,     │
│    ModelExtraction, PrivilegeEscalation)             │
│  atlasRef: string (AML.Txxxx)                       │
│  owaspRef: string (LLMxx)                           │
│  isoRiskId: string (R-xxx-xxx)                      │
│  likelihood: enum(Rare, Unlikely, Possible,         │
│              Likely, AlmostCertain)                  │
│  impact: enum(Insignificant, Minor, Moderate,       │
│          Major, Catastrophic)                        │
│  inherentRiskScore: integer (1-25)                  │
│  residualRiskScore: integer (1-25)                  │
│  threatActorRef: → cyber-risk:ThreatActor           │
│  attackChainRef: → AttackChain                      │
│  targetAssetRef: → cyber-risk:InformationAsset      │
│  mitigatingControls: [→ erm:Control]                │
│  detectionCapability: enum(None, Low, Medium,       │
│                        High, Automated)             │
│  status: enum(Identified, Analysed, Treated,        │
│          Accepted, Monitored, Retired)              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  AttackChain                                        │
│  ───────────                                        │
│  chainId: UUID                                      │
│  name: string                                       │
│  description: text                                  │
│  chainType: enum(KillChain, ATLASChain,             │
│    PromptInjectionChain, DataPoisoningChain,        │
│    ModelExtractionChain, SupplyChainCompromise)      │
│  steps: [AttackChainStep] (ordered)                 │
│  complexity: enum(Low, Medium, High, Advanced)      │
│  estimatedTimeToExecute: duration                   │
│  detectionDifficulty: enum(Trivial, Moderate,       │
│                        Difficult, VeryDifficult)    │
│  prerequisiteAccess: enum(None, NetworkAccess,      │
│    APIAccess, AuthenticatedAccess,                  │
│    PrivilegedAccess, PhysicalAccess)                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  AttackChainStep                                    │
│  ───────────────                                    │
│  stepOrder: integer                                 │
│  techniqueRef: → cyber-risk:AttackTechnique         │
│  atlasTacticPhase: enum(Reconnaissance,             │
│    ResourceDevelopment, InitialAccess, Execution,   │
│    Persistence, PrivilegeEscalation,                │
│    DefenseEvasion, CredentialAccess, Discovery,     │
│    LateralMovement, Collection, Exfiltration,       │
│    Impact)                                          │
│  description: text                                  │
│  detectableAt: boolean                              │
│  preventableAt: boolean                             │
│  controlRef: → erm:Control (nullable)               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  CoverageValidation                                 │
│  ──────────────────                                 │
│  validationId: UUID                                 │
│  validationDate: ISO-8601                           │
│  validatedBy: string                                │
│  validationType: enum(Manual, Automated, Hybrid)    │
│  atlasCoverage: percentage (0-100)                  │
│  owaspCoverage: percentage (0-100)                  │
│  isoProcessAlignment: percentage (0-100)            │
│  gapsIdentified: [CoverageGap]                      │
│  attestationStatus: enum(Full, Partial, Failed)     │
│  nextReviewDate: ISO-8601                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  CoverageGap                                        │
│  ───────────                                        │
│  gapId: UUID                                        │
│  framework: enum(MITRE_ATLAS, OWASP_LLM,           │
│             OWASP_AI, ISO_27005)                    │
│  techniqueOrRiskId: string                          │
│  gapDescription: text                               │
│  exclusionJustified: boolean                        │
│  remediationPlan: text (nullable)                   │
│  priority: enum(Critical, High, Medium, Low)        │
└─────────────────────────────────────────────────────┘
```

### 3.3 Proposed Relationships

| Relationship | From | To | Cardinality | Type |
|-------------|------|-----|-------------|------|
| `hasScopeConfig` | ThreatModel | ScopeConfiguration | 1..1 | Internal |
| `containsScenario` | ThreatModel | ThreatScenario | 1..* | Internal |
| `hasValidation` | ThreatModel | CoverageValidation | 0..* | Internal |
| `hasAttackChain` | ThreatScenario | AttackChain | 0..1 | Internal |
| `identifiesGap` | CoverageValidation | CoverageGap | 0..* | Internal |
| `targetsSystem` | ThreatModel | `ea-core:EAEntity` | 1..1 | Cross-ontology |
| `feedsRiskRegister` | ThreatScenario | `erm:Risk` | 0..* | Cross-ontology |
| `informsControl` | ThreatScenario | `erm:Control` | 0..* | Cross-ontology |
| `referencesActor` | ThreatScenario | `cyber-risk:ThreatActor` | 0..1 | Cross-ontology |
| `referencesTechnique` | AttackChainStep | `cyber-risk:AttackTechnique` | 1..1 | Cross-ontology |
| `threatenObjective` | ThreatScenario | `vsom:StrategicObjective` | 0..* | VSEM Bridge |
| `governedByContext` | ThreatModel | `grc-fw:GRCContext` | 1..1 | Cross-ontology |
| `assessedByCAF` | ThreatModel | `ncsc-caf:ContributingOutcome` | 0..* | Cross-ontology |
| `alignsToSecurityDomain` | ThreatScenario | `sec-fw:SecurityDomain` | 0..* | Cross-ontology (future) |
| `informsAIGovernance` | ThreatScenario | `ai-gov:AIMonitoring` | 0..* | Cross-ontology (future) |

### 3.4 Join Patterns

```
JP-THREAT-001: GRC Governance → Threat Model
  grc-fw:GRCContext → governedByContext → threat:ThreatModel

JP-THREAT-002: Threat Model → Risk Register Feed
  threat:ThreatModel → containsScenario → threat:ThreatScenario
    → feedsRiskRegister → erm:Risk → belongsToRegister → erm:RiskRegister

JP-THREAT-003: Threat Scenario → MITRE ATLAS Graph
  threat:ThreatScenario → hasAttackChain → threat:AttackChain
    → steps[].techniqueRef → cyber-risk:AttackTechnique
    → cyber-risk:EMPLOYS ← cyber-risk:ThreatActor

JP-THREAT-004: Threat Model → Strategic Impact (VSEM Bridge)
  threat:ThreatScenario → threatenObjective → vsom:StrategicObjective
  (extends existing JP-ERM-006: erm:Risk → riskThreatsObjective)

JP-THREAT-005: Architecture-Driven Scope Selection
  ea-core:EAEntity → targetsSystem ← threat:ThreatModel
    → hasScopeConfig → threat:ScopeConfiguration
    → architecturePattern → drives includedCategories

JP-THREAT-006: Threat Model → CAF Assessment
  threat:ThreatModel → assessedByCAF → ncsc-caf:ContributingOutcome
  (links to NCSC CAF Objective B: Protecting Against Cyber Attack)

JP-THREAT-007: Coverage Validation → Gap Remediation
  threat:CoverageValidation → identifiesGap → threat:CoverageGap
    → remediationPlan → triggers efs:Epic (via PPM pipeline)
```

### 3.5 Proposed Enumerations

| Enum | Values | Source |
|------|--------|--------|
| **ModelType** | Baseline, Incremental, Continuous | ISO 27005 process types |
| **Methodology** | STRIDE, PASTA, LINDDUN, VAST, ATLAS-Driven, Hybrid | Industry standard methodologies |
| **ArchitecturePattern** | CloudNativeLLM, OnPremiseTraining, RAGEnhanced, AgenticAI, MultiModal, FederatedLearning, EdgeAI, HybridCloud, APIService | Source doc Section 5.2 |
| **ThreatCategory** | 14 values — CoreAIThreats through QuantumAI | Source doc Section 5.1 |
| **InclusionRule** | Always, Default, Conditional, ExcludeByDefault | Source doc scope config |
| **ScenarioType** | 10 values — SingleVector through PrivilegeEscalation | Source doc Section 2+3 |
| **ATLASTactic** | 13 values — mirrors MITRE ATLAS | Cyber-Risk-ONT alignment |
| **DetectionCapability** | None, Low, Medium, High, Automated | Operational maturity scale |
| **AttestationStatus** | Full, Partial, Failed | Coverage validation result |

### 3.6 Business Rules

| ID | Rule | Severity |
|----|------|----------|
| BR-TM-001 | Every ThreatModel MUST reference exactly one `ea-core:EAEntity` as target system | Error |
| BR-TM-002 | Every ThreatModel MUST have at least one ThreatScenario | Error |
| BR-TM-003 | Every ThreatScenario with `scenarioType: MultiStage` or `ChainedAttack` MUST have an AttackChain | Error |
| BR-TM-004 | Continuous ThreatModels MUST have `reviewCadence: Continuous` | Error |
| BR-TM-005 | ScopeConfiguration MUST justify every excluded category with `justification` and `alternativeCoverage` | Error |
| BR-TM-006 | CoverageValidation with `attestationStatus: Partial` or `Failed` MUST identify at least one CoverageGap | Error |
| BR-TM-007 | ThreatScenarios with `inherentRiskScore >= 20` (Critical) MUST have at least one mitigatingControl | Warning |
| BR-TM-008 | ThreatModels past `validUntil` date MUST be flagged for review | Warning |
| BR-TM-009 | AttackChain steps MUST be sequentially ordered by `stepOrder` with no gaps | Error |
| BR-TM-010 | Every ThreatModel at Enterprise scope MUST be `governedByContext` to a `grc-fw:GRCContext` | Error |

---

## Part 4: Agentic Threat Modelling — Process & Skills Design

### 4.1 Vision: From Manual to Agentic Threat Modelling

```
MATURITY PROGRESSION:

Level 1: Manual          → Periodic, document-based threat models
Level 2: Template-Driven → Standardised templates with checklists
Level 3: Tool-Assisted   → Threat modelling tools (STRIDE/PASTA)
Level 4: AI-Enhanced     → ★ Gen AI assists enumeration & analysis
Level 5: Agentic         → ★ Autonomous agents continuously model threats

Current Target: Level 4 → Level 5 transition
```

### 4.2 Agentic Skill Architecture

The agentic threat modelling system comprises **5 specialised skills** that can operate independently or orchestrated:

```
┌──────────────────────────────────────────────────────────────┐
│                  THREAT MODELLING AGENT SYSTEM                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐   ┌──────────────────┐                │
│  │ SKILL 1:         │   │ SKILL 2:         │                │
│  │ Scope Analyst     │   │ Threat Enumerator │               │
│  │ ─────────────     │   │ ────────────────  │               │
│  │ • Reads EA arch   │   │ • Enumerates      │               │
│  │ • Selects scope   │──►│   ATLAS techniques│               │
│  │ • Justifies       │   │ • Maps OWASP risks│               │
│  │   exclusions      │   │ • Builds attack   │               │
│  │ • Outputs:        │   │   chains          │               │
│  │   ScopeConfig     │   │ • Outputs:        │               │
│  └──────────────────┘   │   ThreatScenarios │               │
│                          └────────┬─────────┘               │
│                                   │                          │
│  ┌──────────────────┐   ┌────────▼─────────┐                │
│  │ SKILL 3:         │   │ SKILL 4:         │                │
│  │ Risk Scorer       │   │ Control Mapper   │                │
│  │ ─────────────     │   │ ──────────────   │                │
│  │ • Scores L×I      │   │ • Maps controls  │                │
│  │ • Calculates ALE  │◄──│   to scenarios   │                │
│  │ • Ranks by        │   │ • Identifies gaps │                │
│  │   risk appetite   │   │ • Suggests new    │                │
│  │ • Outputs:        │   │   controls        │                │
│  │   RiskScenarios   │   │ • Outputs:        │                │
│  └──────────────────┘   │   ControlMappings │                │
│                          └──────────────────┘                │
│                                                              │
│  ┌─────────────────────────────────────────────┐             │
│  │ SKILL 5: Coverage Validator                  │            │
│  │ ────────────────────────────                 │            │
│  │ • Validates ATLAS coverage %                 │            │
│  │ • Validates OWASP coverage %                 │            │
│  │ • Validates ISO 27005 process alignment      │            │
│  │ • Identifies and classifies gaps             │            │
│  │ • Generates attestation report               │            │
│  │ • Outputs: CoverageValidation + CoverageGaps │            │
│  └─────────────────────────────────────────────┘             │
│                                                              │
│  ┌─────────────────────────────────────────────┐             │
│  │ ORCHESTRATOR: Threat Model Lifecycle Agent   │            │
│  │ ─────────────────────────────────────────    │            │
│  │ • Triggers: Schedule, MetricBreach,          │            │
│  │   ArchitectureChange, IncidentDetected,      │            │
│  │   NewATLASTechnique, NewOWASPRisk            │            │
│  │ • Coordinates Skills 1-5 in sequence         │            │
│  │ • Manages ThreatModel versioning             │            │
│  │ • Feeds outputs to ERM Risk Register         │            │
│  │ • Raises efs:Epics for remediation work      │            │
│  └─────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Skill Specifications

#### Skill 1: Scope Analyst

| Attribute | Value |
|-----------|-------|
| **Input** | `ea-core:EAEntity` (target system), `grc-fw:GRCContext` (governance context) |
| **Process** | 1. Read EA architecture topology (domains, components, integrations) |
| | 2. Classify architecture pattern (CloudNativeLLM, RAGEnhanced, etc.) |
| | 3. Auto-select threat categories based on pattern |
| | 4. Generate exclusion justifications |
| | 5. Cross-reference with `erm:RiskAppetite` for risk appetite-dependent toggles |
| **Output** | `threat:ScopeConfiguration` entity |
| **Trigger** | New system onboarding, architecture change detected, periodic review |
| **AI Capability** | Reasoning over EA topology to determine applicable threat surface |

#### Skill 2: Threat Enumerator

| Attribute | Value |
|-----------|-------|
| **Input** | `threat:ScopeConfiguration`, MITRE ATLAS knowledge base, OWASP AI guidance |
| **Process** | 1. For each included threat category, enumerate applicable ATLAS techniques |
| | 2. Cross-reference OWASP LLM risks |
| | 3. Build multi-stage attack chains for complex scenarios |
| | 4. Map to `cyber-risk:ThreatActor` profiles by sophistication |
| | 5. Assess feasibility within architectural constraints |
| **Output** | `threat:ThreatScenario[]` + `threat:AttackChain[]` entities |
| **Trigger** | New scope configuration, ATLAS update, OWASP update |
| **AI Capability** | Creative adversarial thinking — generating realistic attack narratives from technique taxonomy |

#### Skill 3: Risk Scorer

| Attribute | Value |
|-----------|-------|
| **Input** | `threat:ThreatScenario[]`, `erm:RiskAppetite`, historical incident data |
| **Process** | 1. Assess likelihood per scenario (threat capability × vulnerability exposure) |
| | 2. Assess impact per scenario (business impact categories) |
| | 3. Calculate inherent risk score (5×5 matrix) |
| | 4. Factor existing controls for residual risk |
| | 5. Calculate Annualised Loss Expectancy (ALE) where data available |
| | 6. Rank against risk appetite thresholds |
| **Output** | Scored `threat:ThreatScenario[]`, prioritised risk feed to `erm:RiskRegister` |
| **Trigger** | New scenarios enumerated, control changes, risk appetite change |
| **AI Capability** | Quantitative reasoning over sparse data — calibrating likelihood from threat intelligence |

#### Skill 4: Control Mapper

| Attribute | Value |
|-----------|-------|
| **Input** | Scored `threat:ThreatScenario[]`, `erm:Control` catalogue, `mcsb:SecurityControl` benchmarks |
| **Process** | 1. Map existing controls to threat scenarios |
| | 2. Assess control effectiveness per scenario |
| | 3. Identify uncontrolled or under-controlled scenarios |
| | 4. Suggest new controls from MCSB/NIST CSF benchmarks |
| | 5. Calculate control coverage ratio |
| **Output** | Control mappings, gap analysis, remediation recommendations |
| **Trigger** | New risk scores, control changes, benchmark updates |
| **AI Capability** | Pattern matching between threat scenarios and control catalogues across frameworks |

#### Skill 5: Coverage Validator

| Attribute | Value |
|-----------|-------|
| **Input** | Complete `threat:ThreatModel`, ATLAS/OWASP/ISO reference sets |
| **Process** | 1. Enumerate all ATLAS techniques applicable to scope |
| | 2. Verify each has a corresponding ThreatScenario or justified exclusion |
| | 3. Enumerate all OWASP risks applicable to scope |
| | 4. Verify ISO 27005 process completeness |
| | 5. Generate coverage percentages and gap list |
| **Output** | `threat:CoverageValidation` + `threat:CoverageGap[]` |
| **Trigger** | Model completion, periodic review, framework update |
| **AI Capability** | Systematic completeness checking with intelligent gap classification |

### 4.4 Trigger Events — Continuous Threat Modelling

| Trigger | Source | Agent Response |
|---------|--------|----------------|
| **Scheduled Review** | `threat:ThreatModel.reviewCadence` | Full model refresh (Skills 1-5) |
| **Architecture Change** | `ea-core:EAEntity` lifecycle event | Skill 1 re-scoping → cascade |
| **New ATLAS Technique** | MITRE ATLAS feed | Skill 2 incremental enumeration |
| **New OWASP Risk** | OWASP publication | Skill 2 incremental enumeration |
| **Security Incident** | SOC alert / incident report | Skill 2+3 targeted re-assessment |
| **Control Change** | `erm:Control` update | Skill 3+4 re-scoring |
| **Risk Appetite Change** | `erm:RiskAppetite` update | Skill 3 re-evaluation |
| **Metric Breach** | `vsom:MetricsComponent` threshold | Orchestrator triggers full review |
| **Compliance Change** | Regulatory update | Skill 1 scope review + cascade |

---

## Part 5: PPM-EFS Delivery Lifecycle — From Idea to Implementation

### 5.1 Lifecycle Mapping

The threat modelling capability itself flows through the PPM-EFS delivery pipeline, and its outputs also generate work items in the same pipeline:

```
LAYER 1: VSOM (Strategy)
  "Protect strategic value through continuous threat intelligence"
  └─► vsom:StrategicObjective: "Achieve continuous threat awareness"
       └─► vsom:MetricsComponent: threat coverage %, MTTD, residual risk score

LAYER 2: OKR (Context)
  Objective: "Establish AI-enhanced threat modelling capability"
  KR1: 100% ATLAS coverage for all production AI systems
  KR2: Threat model review latency < 24 hours post-architecture change
  KR3: Zero uncontrolled Critical threat scenarios

LAYER 3: VP (Value Proposition)
  Problem:  Manual threat models are stale before they're finished
  Solution: Agentic continuous threat modelling with ontology grounding
  Benefit:  Real-time threat awareness, automated compliance evidence

  VP-RRR Alignment:
  ├── vp:Problem  → rrr:Risk  (stale threat models = unmanaged risk)
  ├── vp:Solution → rrr:Requirement (agentic platform = build requirement)
  └── vp:Benefit  → rrr:Result (continuous awareness = measurable result)

LAYER 4: PMF (Product-Market Fit)
  Segment: Regulated enterprises with AI workloads (financial services,
           healthcare, public sector)
  Differentiator: Ontology-grounded, multi-framework (ATLAS+OWASP+ISO)

LAYER 5: EFS (Execution — Epics/Features/Stories)
  ┌──────────────────────────────────────────────────────┐
  │ Epic: "AI-Enhanced Threat Modelling Capability"       │
  │ (Feature Candidate F30.13 under Epic 30)             │
  ├──────────────────────────────────────────────────────┤
  │                                                      │
  │ Feature F30.13.1: THREAT-MODEL-ONT Core Schema       │
  │   S1: ThreatModel + ScopeConfiguration entities      │
  │   S2: ThreatScenario + AttackChain entities          │
  │   S3: CoverageValidation + CoverageGap entities      │
  │   S4: Cross-ontology relationships + join patterns   │
  │   S5: Business rules + validation                    │
  │   S6: Registry integration + validation report       │
  │                                                      │
  │ Feature F30.13.2: Cyber-Risk-ONT Integration         │
  │   S1: Promote Cyber-Risk-ONT to GRC-02-RISK-ADV      │
  │   S2: Bridge ThreatScenario → cyber-risk entities    │
  │   S3: ATLAS technique reference alignment            │
  │   S4: ThreatActor profile cross-referencing          │
  │                                                      │
  │ Feature F30.13.3: Agentic Skill Framework            │
  │   S1: Skill 1 — Scope Analyst agent design           │
  │   S2: Skill 2 — Threat Enumerator agent design       │
  │   S3: Skill 3 — Risk Scorer agent design             │
  │   S4: Skill 4 — Control Mapper agent design          │
  │   S5: Skill 5 — Coverage Validator agent design      │
  │   S6: Orchestrator agent design + trigger system     │
  │                                                      │
  │ Feature F30.13.4: Visualiser Integration             │
  │   S1: Threat model graph rendering (vis-network)     │
  │   S2: Attack chain visualisation                     │
  │   S3: Coverage heatmap (ATLAS/OWASP)                 │
  │   S4: Risk score overlay on architecture diagram     │
  │                                                      │
  │ Feature F30.13.5: EA Integration & PaaS Deployment   │
  │   S1: ea-core:SecurityArchitecture bridge            │
  │   S2: Azure policy-as-code threat controls           │
  │   S3: OSCAL export for continuous compliance         │
  │   S4: Power BI threat dashboard (Fabric/DirectLake)  │
  └──────────────────────────────────────────────────────┘

LAYER 6: PPM (Portfolio/Programme/Project)
  Portfolio: Azlan GRC Programme
  Programme: GRC Series (Epic 30)
  Project: Threat Modelling Capability (F30.13)
  PBS: THREAT-MODEL-ONT deliverables
  WBS: Sprint-based delivery of stories above
```

### 5.2 EA Integration Architecture

```
EA INTEGRATION — THREAT MODELLING IN THE ENTERPRISE ARCHITECTURE

┌────────────────────────────────────────────────────────────────┐
│  BusinessArchitecture (ea-core)                                │
│  ├── Strategic risk from threat scenarios                      │
│  ├── Governance body oversight via GRC-FW                      │
│  └── Business capability: "Threat Intelligence & Modelling"    │
├────────────────────────────────────────────────────────────────┤
│  SecurityArchitecture (ea-core, cross-cutting)                 │
│  ├── ★ THREAT-MODEL-ONT feeds security architecture decisions  │
│  ├── Attack surface mapped to architecture components          │
│  ├── Controls selected based on threat scenario scoring        │
│  └── Compliance evidence via coverage validation               │
├────────────────────────────────────────────────────────────────┤
│  ApplicationArchitecture (ea-core)                             │
│  ├── Threat modelling agent as application component           │
│  ├── Integration with SOC/SIEM for incident triggers           │
│  └── API-based threat model queries for DevSecOps              │
├────────────────────────────────────────────────────────────────┤
│  TechnologyArchitecture (ea-core)                              │
│  ├── Neo4j/Cosmos DB for threat graph (from Cyber-Risk-ONT)    │
│  ├── Microsoft Fabric for threat analytics                     │
│  ├── Azure AI services for agentic skill execution             │
│  └── OSCAL format for automated compliance reporting           │
├────────────────────────────────────────────────────────────────┤
│  DataArchitecture (ea-core)                                    │
│  ├── MITRE ATLAS knowledge base (reference data)               │
│  ├── OWASP AI guidance (reference data)                        │
│  ├── Threat model instances (operational data)                 │
│  ├── Risk scores and ALE calculations (analytical data)        │
│  └── Coverage validation reports (compliance data)             │
└────────────────────────────────────────────────────────────────┘
```

### 5.3 PaaS Deployment Architecture

```
AZURE PaaS INTEGRATION

                    ┌──────────────────────┐
                    │   Azure AI Services   │
                    │   (Agent Runtime)     │
                    │                       │
                    │  ┌─────────────────┐  │
                    │  │ Threat Modelling │  │
                    │  │ Agent System     │  │
                    │  │ (Skills 1-5)     │  │
                    │  └────────┬────────┘  │
                    └───────────┼───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                   │
              ▼                 ▼                   ▼
  ┌───────────────────┐ ┌──────────────┐ ┌──────────────────┐
  │ Cosmos DB Gremlin  │ │ Azure APIM   │ │ Microsoft Fabric │
  │ (Threat Graph)     │ │ (Threat API) │ │ (Analytics)      │
  │                    │ │              │ │                  │
  │ • ThreatModels     │ │ • Query      │ │ • OneLake store  │
  │ • AttackChains     │ │ • Score      │ │ • DirectLake     │
  │ • RiskScenarios    │ │ • Validate   │ │ • Power BI       │
  │ • ControlMappings  │ │ • Export     │ │   dashboards     │
  └───────────────────┘ └──────────────┘ └──────────────────┘
              │                                     │
              ▼                                     ▼
  ┌───────────────────┐                 ┌──────────────────┐
  │ Azure Policy       │                 │ OSCAL Export     │
  │ (Policy-as-Code)   │                 │ (Compliance)     │
  │                    │                 │                  │
  │ Threat-informed    │                 │ Automated        │
  │ security controls  │                 │ attestation      │
  └───────────────────┘                 └──────────────────┘
```

---

## Part 6: Objectives & Key Results — Dynamic Threat Modelling

### 6.1 Strategic Objectives

| # | Objective | VSOM Alignment |
|---|-----------|----------------|
| O1 | Establish threat modelling as a governed GRC capability | `grc-fw:GovernanceBody` accountability |
| O2 | Achieve continuous (not periodic) threat assessment | `vsom:StrategyComponent.strategyType: Digital` |
| O3 | Automate threat enumeration and coverage validation | `vsom:MetricsComponent.metricType: Process` |
| O4 | Integrate threat intelligence into EA decision-making | `ea-core:SecurityArchitecture.securedBy` |
| O5 | Deliver threat modelling as a PaaS-integrated service | `ppm:ProductBreakdownStructure.pbs_type: platform_product` |

### 6.2 Key Results

| Objective | Key Result | Target | Metric Source |
|-----------|-----------|--------|---------------|
| O1 | Threat models governed under GRC-FW for all production AI systems | 100% coverage | `threat:ThreatModel.governedByContext` count |
| O2 | Mean time from architecture change to updated threat model | < 24 hours | Agent orchestrator timestamp delta |
| O2 | Threat model staleness (models past validUntil) | 0% | `threat:ThreatModel.validUntil` monitoring |
| O3 | MITRE ATLAS technique coverage for in-scope systems | >= 95% | `threat:CoverageValidation.atlasCoverage` |
| O3 | OWASP LLM risk coverage for in-scope systems | 100% | `threat:CoverageValidation.owaspCoverage` |
| O4 | Security architecture decisions with threat model evidence | >= 80% | `ea-core:ArchitectureDecision` → threat reference |
| O5 | Threat modelling API availability (PaaS SLA) | 99.9% | Azure APIM metrics |

### 6.3 NCSC CAF Alignment

The threat modelling capability maps to NCSC CAF objectives:

| CAF Objective | Relevant Outcomes | Threat Modelling Contribution |
|--------------|-------------------|-------------------------------|
| **A2: Risk Management** | A2.a Risk management process, A2.b Assurance | ThreatModel feeds RiskRegister; CoverageValidation provides assurance evidence |
| **B2: Identity & Access** | B2.a Identity verification | ThreatScenarios for credential access (ATLAS CredentialAccess tactic) |
| **B4: System Security** | B4.a Secure design, B4.b Configuration | Attack chains inform secure architecture patterns |
| **C1: Security Monitoring** | C1.a, C1.b | Threat scenarios define what to monitor; detection capability assessment |
| **C2: Proactive Discovery** | C2.a Threat hunting | Attack chains provide hunting hypotheses |
| **D1: Response Planning** | D1.a, D1.b | Threat scenarios inform incident response playbooks |

---

## Part 7: Implementation Roadmap

### 7.1 Phased Delivery

| Phase | Scope | Duration | Dependencies |
|-------|-------|----------|-------------|
| **Phase 1: Foundation** | THREAT-MODEL-ONT schema design + OAA validation | 2 sprints | ERM-ONT v1.0.0 (done) |
| **Phase 2: Integration** | Cross-ontology bridges (Cyber-Risk, ERM, EA-CORE) | 2 sprints | Phase 1 |
| **Phase 3: Agentic Skills** | Skills 1-5 design + orchestrator | 3 sprints | Phase 2, OAA v7 Agent Architecture |
| **Phase 4: Visualiser** | Threat model rendering in ontology visualiser | 2 sprints | Phase 2, Visualiser v4.x |
| **Phase 5: PaaS** | Azure deployment, API, Fabric dashboards | 3 sprints | Phase 3, Epic 33 Azure Graph |

### 7.2 Dependencies & Sequencing

```
DEPENDENCY GRAPH:

ERM-ONT v1.0.0 (DONE) ─────────────────────┐
Cyber-Risk-ONT v1.0.0 (EXISTS) ─────────────┤
                                             ▼
                               ┌─────────────────────────┐
                               │ Phase 1: THREAT-MODEL-   │
                               │ ONT Schema (F30.13.1)    │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
GRC-FW-ONT v3.0.0 (DONE) ────►│ Phase 2: Integration     │
EA-CORE-ONT v1.0.0 (DONE) ───►│ Bridges (F30.13.2)       │
                               └────────────┬────────────┘
                                            │
                    ┌───────────────────────┤
                    │                       │
                    ▼                       ▼
     ┌──────────────────────┐ ┌──────────────────────┐
     │ Phase 3: Agentic     │ │ Phase 4: Visualiser  │
     │ Skills (F30.13.3)    │ │ Integration (F30.13.4)│
     └──────────┬───────────┘ └──────────────────────┘
                │
                ▼
     ┌──────────────────────┐
     │ Phase 5: PaaS EA     │
     │ Deploy (F30.13.5)    │◄── Epic 33 (Azure Graph)
     └──────────────────────┘
```

### 7.3 Risk Register for the Feature Itself

| Risk | Likelihood | Impact | Response |
|------|-----------|--------|----------|
| Cyber-Risk-ONT (Neo4j-native) schema divergence from OAA format | Likely | High | Mitigate: Create OAA-compliant wrapper/bridge |
| AI-GOV-ONT (F30.4) not ready when threat modelling needs it | Possible | Medium | Accept: Design forward-compatible stubs |
| MITRE ATLAS version update during development | Possible | Low | Mitigate: Version-pin references, update on review cycle |
| Agent architecture (OAA v7/Epic 21) not finalised | Likely | High | Mitigate: Design skill specs independent of runtime |

---

## Part 8: Decision Log

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| D1 | Place THREAT-MODEL-ONT at Tier 2 under GRC-02-RISK | Threat models specialise enterprise risk management; aligns with ERM → RMF tier pattern | 2026-02-18 |
| D2 | 5-skill agentic architecture (not monolithic) | Separation of concerns; skills independently deployable and testable | 2026-02-18 |
| D3 | Bridge to Cyber-Risk-ONT rather than merge | Cyber-Risk-ONT is Neo4j-native; maintain its graph identity while providing OAA bridge | 2026-02-18 |
| D4 | Include configurable scope system as first-class entity | Source framework's [INCLUDE/EXCLUDE] pattern is powerful for multi-architecture support | 2026-02-18 |
| D5 | Map to NCSC CAF objectives explicitly | UK public sector market (AIRL, NCSC-CAF segments) requires CAF traceability | 2026-02-18 |

---

## Appendix A: Source Framework Coverage Summary

### A.1 MITRE ATLAS Techniques Mapped to Proposed Entities

| ATLAS Tactic | Technique Count | Maps To |
|-------------|-----------------|---------|
| Reconnaissance | 5 | ThreatScenario (scenarioType: various) + AttackChainStep |
| Resource Development | 3 | ThreatScenario + ThreatActor capability |
| Initial Access | 4 | AttackChainStep (phase: InitialAccess) |
| Execution | 3 | AttackChainStep (phase: Execution) |
| Persistence | 2 | AttackChainStep (phase: Persistence) |
| Privilege Escalation | 6 | ThreatScenario (scenarioType: PrivilegeEscalation) |
| Defense Evasion | 4 | AttackChainStep (phase: DefenseEvasion) |
| Credential Access | 2 | AttackChainStep (phase: CredentialAccess) |
| Discovery | 3 | AttackChainStep (phase: Discovery) |
| Lateral Movement | 2 | AttackChainStep (phase: LateralMovement) |
| Collection | 5 | AttackChainStep (phase: Collection) |
| Exfiltration | 3 | ThreatScenario (scenarioType: ModelExtraction) |
| Impact | 7 | ThreatScenario inherentRiskScore → erm:Risk |
| **Total** | **49** | Full coverage via ThreatScenario + AttackChain entities |

### A.2 OWASP LLM Top 10 → Ontology Entity Mapping

| OWASP Risk | Proposed ThreatScenario.scenarioType | ScopeConfiguration Category |
|-----------|--------------------------------------|----------------------------|
| LLM01: Prompt Injection | PromptExploit | CoreAIThreats (Always) |
| LLM02: Insecure Output | SingleVector | CoreAIThreats (Always) |
| LLM03: Training Data Poisoning | DataPoisoning | CoreAIThreats (Always) |
| LLM04: Model DoS | SingleVector | CoreAIThreats (Always) |
| LLM05: Supply Chain | SupplyChain | SupplyChain (Default) |
| LLM06: Information Disclosure | ModelExtraction | CoreAIThreats (Always) |
| LLM07: Insecure Plugin | SingleVector | PluginSecurity (Conditional) |
| LLM08: Excessive Agency | SingleVector | AgenticAIThreats (Conditional) |
| LLM09: Overreliance | InsiderThreat | CoreAIThreats (Always) |
| LLM10: Model Theft | ModelExtraction | CoreAIThreats (Always) |

### A.3 Cross-Ontology Reference Index

| Referenced Ontology | Version | Entities Referenced | Relationship Count |
|--------------------|---------|--------------------|--------------------|
| GRC-FW-ONT | 3.0.0 | GRCContext | 1 |
| ERM-ONT | 1.0.0 | Risk, RiskRegister, RiskAppetite, Control | 3 |
| Cyber-Risk-ONT | 1.0.0 | ThreatActor, AttackTechnique, InformationAsset, RiskScenario | 3 |
| RMF-IS27005-ONT | 1.0.0 | (via ERM tier specialisation) | 0 (indirect) |
| EA-CORE-ONT | 1.0.0 | EAEntity, SecurityArchitecture | 1 |
| VSOM-ONT | 3.0.0 | StrategicObjective | 1 |
| NCSC-CAF-ONT | 1.0.0 | ContributingOutcome | 1 |
| SEC-FW-ONT | planned | SecurityDomain | 1 (future) |
| AI-GOV-ONT | planned | AIMonitoring | 1 (future) |

---

*End of Briefing Notebook*
