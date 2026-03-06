# MCSB Ontology Traceability Report v2.0.0

**Document Version:** 2.0.0  
**Date:** 2026-01-23  
**Author:** OAA v4.0.0 (Ontology Architect Agent)  
**Platform:** PF-Core | PF-Instance: W4M-RCS  
**Purpose:** Complete traceability matrix and impact assessment for MCSB v1 → v2 migration

---

## 1. Executive Summary

This traceability report documents all changes between MCSB Ontology v1.0.0 and v2.0.0, providing a complete audit trail for compliance and governance purposes.

### 1.1 Migration Statistics

| Metric | Value |
|--------|-------|
| **Entities Added** | 3 |
| **Entities Modified** | 4 |
| **Properties Added** | 15 |
| **Properties Modified** | 8 |
| **New Domains** | 1 (AI Security) |
| **New Controls** | 7 (AI-1 through AI-7) |
| **Compliance Frameworks Added** | 3 (NIST CSF v2.0, ISO 27001:2022, SOC 2) |
| **Breaking Changes** | 2 |
| **Migration Required** | Yes |
| **Backwards Compatible** | No (Major version change) |

### 1.2 Impact Classification

| Impact Level | Count | Description |
|--------------|-------|-------------|
| 🔴 **HIGH** | 3 | Breaking changes requiring code updates |
| 🟡 **MEDIUM** | 8 | Additive changes, may require schema updates |
| 🟢 **LOW** | 4 | Documentation/metadata only |

---

## 2. Entity Traceability Matrix

### 2.1 New Entities (v2 Only)

| Entity ID | Entity Name | Schema.org Base | Rationale | Impact |
|-----------|-------------|-----------------|-----------|--------|
| mcsb:AISecurityControl | AISecurityControl | DefinedTerm | Required for new AI security domain controls (AI-1 through AI-7) | 🔴 HIGH |
| mcsb:MITREATLASMapping | MITREATLASMapping | PropertyValue | Required for AI-specific threat mappings from MITRE ATLAS framework | 🟡 MEDIUM |
| mcsb:ImplementationExample | ImplementationExample | HowTo | Structured Challenge/Solution/Outcome format new in v2 | 🟡 MEDIUM |

### 2.2 Modified Entities

| Entity ID | Change Type | v1 State | v2 State | Impact |
|-----------|-------------|----------|----------|--------|
| mcsb:ControlDomain | ADD_INSTANCE | 12 domains | 13 domains (+AI) | 🔴 HIGH |
| mcsb:SecurityControl | ADD_PROPERTIES | Basic structure | +riskToMitigate, +criticalityLevel, +implementationExample, +mitreAttackMappings | 🔴 HIGH |
| mcsb:ComplianceMapping | ADD_PROPERTIES | 4 frameworks | 6 frameworks (+nistCsfV2, +iso27001_2022, +soc2) | 🟡 MEDIUM |
| mcsb:ImplementationGuidance | RESTRUCTURE | Text-based | Numbered sub-sections (e.g., AI-1.1, NS-2.3) | 🟡 MEDIUM |

### 2.3 Unchanged Entities

| Entity ID | Entity Name | Notes |
|-----------|-------------|-------|
| mcsb:ResponsibilityAssignment | ResponsibilityAssignment | RACI structure unchanged |
| mcsb:CloudPlatform | CloudPlatform | Azure/AWS guidance structure unchanged |
| mcsb:ControlAssessment | ControlAssessment | Assessment tracking unchanged |

---

## 3. Property Traceability Matrix

### 3.1 New Properties

| Entity | Property Name | Type | Required | Rationale |
|--------|---------------|------|----------|-----------|
| SecurityControl | riskToMitigate | string | Yes | v2 adds explicit risk documentation |
| SecurityControl | criticalityLevel | enum | Yes | Must_Have/Should_Have/Nice_to_Have classification |
| SecurityControl | implementationExample | object | Yes | Challenge/Solution/Outcome structure |
| SecurityControl | mitreAttackMappings | array | No | MITRE ATT&CK technique mappings |
| SecurityControl | azurePolicyDefinitions | array | No | Links to 420+ Azure Policy definitions |
| AISecurityControl | aiSecurityPillar | enum | Yes | Platform/Application/Monitor classification |
| AISecurityControl | mitreAtlasMappings | array | Yes | AI-specific MITRE ATLAS mappings |
| AISecurityControl | azureAIServices | array | Yes | Azure AI services for implementation |
| AISecurityControl | relatedControls | array | No | Cross-references to other controls |
| ComplianceMapping | nistCsfV2 | array | No | NIST CSF v2.0 mappings |
| ComplianceMapping | iso27001_2022 | array | No | ISO 27001:2022 mappings |
| ComplianceMapping | soc2 | array | No | SOC 2 Trust Services Criteria |
| ImplementationGuidance | guidanceId | string | Yes | Numbered section ID (e.g., AI-1.1) |
| MITREATLASMapping | techniqueId | string | Yes | AML.Txxxx format |
| MITREATLASMapping | tacticId | string | No | AML.TAxxxx format |

### 3.2 Modified Properties

| Entity | Property | v1 Value | v2 Value | Breaking? |
|--------|----------|----------|----------|-----------|
| ComplianceMapping | nistSp80053 | Rev.4 | Rev.5 | Yes |
| ComplianceMapping | pciDss | v3.2.1 | v4.0 | Yes |
| ComplianceMapping | cisControls | v7.1/v8 | v8.1 | No |
| ControlDomain | controlCount | Fixed | Variable | No |
| SecurityControl | azureGuidance | Text | Numbered sections | No |

---

## 4. Control Traceability Matrix

### 4.1 New Controls (AI Security Domain)

| Control ID | Control Name | Pillar | Criticality | MITRE ATLAS | Dependencies |
|------------|--------------|--------|-------------|-------------|--------------|
| AI-1 | Ensure Use of Approved Models | Platform | Must Have | AML.T0050, AML.T0020 | IM-3, NS-2, LT-3, DP-4 |
| AI-2 | Implement Multi-Layered Content Filtering | Application | Must Have | AML.T0011, AML.T0013, AML.T0022 | DP-1 |
| AI-3 | Adopt Safety Meta-Prompts | Application | Must Have | AML.T0051, AML.T0054, AML.T0024 | None |
| AI-4 | Apply Least Privilege for Agent Functions | Application | Must Have | T1078, T1570, T1567 | None |
| AI-5 | Ensure Human-in-the-Loop | Application | Must Have | AML.TA0010, AML.TA0009 | None |
| AI-6 | Establish Monitoring and Detection | Monitor | Must Have | AML.TA0001, AML.TA0010, AML.TA0009 | None |
| AI-7 | Perform Continuous AI Red Teaming | Monitor | Must Have | AML.TA0001, AML.TA0010, AML.TA0009 | None |

### 4.2 Enhanced Controls (Existing)

| Control ID | v1 → v2 Enhancements | Impact |
|------------|---------------------|--------|
| IM-1 | Added Microsoft Entra Agent ID support | Medium |
| IM-3 | Extended to AI agent identities | Medium |
| NS-2 | AI endpoint protection guidance | Low |
| DP-1 | AI training data classification | Medium |
| DP-4 | Model artifact encryption | Medium |
| LT-3 | AI-specific logging patterns | Medium |
| LT-4 | AI API traffic monitoring | Medium |
| IR-4 | AI incident playbooks | Low |
| PV-5 | AI model vulnerability scanning | Medium |
| DS-1 | MLOps security integration | Medium |

### 4.3 CIS Azure Foundations → MCSB v2 Mapping

Based on the uploaded mapping file (asb_v2_to_cis_microsoft_azure_foundations_benchmark_v1_3_0.xlsx):

| CIS Section | CIS Controls | MCSB v2 Domains | Coverage |
|-------------|--------------|-----------------|----------|
| 1. Identity & Access Management | 23 | IM, PA, GS | 100% |
| 2. Security Center | 15 | ES, DP, IR | 87% |
| 3. Storage Accounts | 11 | DP, NS, LT | 91% |
| 4. Database Services | 19 | DP, LT, PV | 100% |
| 5. Logging & Monitoring | 18 | LT | 100% |
| 6. Networking | 6 | NS, LT | 100% |
| 7. Virtual Machines | 7 | ES, DP, PV | 100% |
| 8. Other Security | 5 | BR, PA | 60% |
| 9. App Service | 11 | DP, NS, IM, PV | 100% |

---

## 5. Compliance Framework Traceability

### 5.1 Framework Version Changes

| Framework | v1 Version | v2 Version | Change Type |
|-----------|------------|------------|-------------|
| NIST SP 800-53 | Rev.4 | Rev.5 | **UPGRADE** |
| PCI-DSS | v3.2.1 | v4.0 | **UPGRADE** |
| CIS Controls | v7.1/v8 | v8.1 | Upgrade |
| NIST CSF | v1.1 | v2.0 | **NEW** |
| ISO 27001 | 2013 | 2022 | **NEW** |
| SOC 2 | N/A | TSC | **NEW** |

### 5.2 AI Control Compliance Mapping

| Control | NIST 800-53 r5 | PCI-DSS v4.0 | CIS v8.1 | NIST CSF v2.0 | ISO 27001:2022 | SOC 2 |
|---------|----------------|--------------|----------|---------------|----------------|-------|
| AI-1 | SA-3, SA-10, SA-15 | 6.3.2, 6.5.5 | 16.7 | ID.SC-04, GV.SC-06 | A.5.19, A.5.20 | CC7.1 |
| AI-2 | SI-3, SI-4, AC-2 | 6.4.3, 11.6.1 | 8.3, 13.2 | PR.DS-05, DE.CM-04 | A.8.16, A.8.7 | CC7.2 |
| AI-3 | SA-8, SI-16 | 6.5.1, 6.5.10 | 18.5 | PR.IP-03, PR.AT-01 | A.8.28, A.8.15 | CC8.1 |
| AI-4 | AC-6, AC-3, CM-7 | 7.2.1, 7.3.1 | 5.4, 6.8 | PR.AC-04, PR.PT-03 | A.5.15, A.8.3 | CC6.3 |
| AI-5 | IA-9, AC-2, AU-6 | 10.2.2, 12.10.1 | 6.7, 8.11 | PR.AC-07, DE.AE-02 | A.5.17, A.6.8 | CC6.1 |
| AI-6 | SI-4, AU-6, IR-4 | 10.6.2, 11.5.1 | 8.5, 13.1 | DE.CM-01, DE.AE-03 | A.8.16, A.8.15 | CC7.2 |
| AI-7 | CA-8, SI-2, RA-5 | 11.4.1, 11.4.7 | 15.1, 18.5 | ID.RA-01, RS.AN-03 | A.8.8, A.5.7 | CC7.1 |

---

## 6. Impact Assessment

### 6.1 Technical Impact

| Area | Impact Level | Description | Migration Action |
|------|--------------|-------------|------------------|
| Database Schema | 🔴 HIGH | New tables for AI controls, MITRE mappings | ALTER/CREATE statements |
| API Endpoints | 🔴 HIGH | New /ai-controls, /mitre-atlas endpoints | Add new routes |
| Validation Rules | 🟡 MEDIUM | New enums, patterns for AI entities | Update validators |
| Query Patterns | 🟡 MEDIUM | New AI-specific query support | Add query templates |
| Test Data | 🟡 MEDIUM | 7 new AI control test records | Generate test data |
| Documentation | 🟢 LOW | New glossary terms, visual guides | Update docs |

### 6.2 Business Impact

| Stakeholder | Impact | Action Required |
|-------------|--------|-----------------|
| Security Team | 🔴 HIGH | Implement 7 new AI controls |
| MLOps Team | 🔴 HIGH | Deploy model governance (AI-1) |
| AI Engineering | 🔴 HIGH | Implement content filtering, meta-prompts (AI-2, AI-3) |
| Identity Team | 🟡 MEDIUM | Configure Microsoft Entra Agent ID (AI-4) |
| SOC Team | 🟡 MEDIUM | Enable AI threat detection (AI-6) |
| Red Team | 🟡 MEDIUM | Establish AI red teaming program (AI-7) |
| Compliance/GRC | 🟡 MEDIUM | Update compliance mappings |

### 6.3 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking changes affect existing integrations | High | High | Provide migration scripts, v1 compatibility layer |
| AI controls not implemented timely | Medium | High | Prioritize AI-1, AI-2, AI-6 as P0 |
| Compliance mapping gaps | Low | Medium | Validate against all 6 frameworks |
| Test coverage insufficient | Medium | Medium | Generate 60-20-10-10 test distribution |

---

## 7. Migration Checklist

### 7.1 Pre-Migration

- [ ] Review all breaking changes documented in this report
- [ ] Backup existing v1 ontology and data
- [ ] Validate v2 schema against current database
- [ ] Prepare rollback plan

### 7.2 Schema Migration

- [ ] Add AISecurityControl entity
- [ ] Add MITREATLASMapping entity
- [ ] Add ImplementationExample entity
- [ ] Add new properties to SecurityControl
- [ ] Add new properties to ComplianceMapping
- [ ] Add AI domain to ControlDomain

### 7.3 Data Migration

- [ ] Migrate existing controls to v2 structure
- [ ] Add riskToMitigate to all controls
- [ ] Add criticalityLevel to all controls
- [ ] Create AI-1 through AI-7 control records
- [ ] Update compliance mappings to v2 framework versions
- [ ] Generate MITRE ATT&CK/ATLAS mappings

### 7.4 Post-Migration

- [ ] Validate all controls load correctly
- [ ] Test API endpoints
- [ ] Run compliance mapping validation
- [ ] Execute test suite
- [ ] Update documentation
- [ ] Archive v1 ontology

---

## 8. Approval & Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Platform Architect | Amanda Moore | 2026-01-23 | __________ |
| Security Lead | __________ | __________ | __________ |
| Compliance Officer | __________ | __________ | __________ |
| Technical Lead | __________ | __________ | __________ |

---

## 9. Appendices

### Appendix A: Full Change Log

```
MCSB Ontology Change Log v1.0.0 → v2.0.0
=========================================

[CHG-001] ADD_DOMAIN: AI (Artificial Intelligence Security)
  - 7 new controls (AI-1 through AI-7)
  - New pillar classification system
  - MITRE ATLAS integration

[CHG-002] ADD_ENTITY: AISecurityControl
  - Extends SecurityControl
  - Adds aiSecurityPillar, mitreAtlasMappings, azureAIServices
  - Required for AI domain controls

[CHG-003] ADD_ENTITY: MITREATLASMapping
  - New entity for AI-specific threat mappings
  - Properties: techniqueId, techniqueName, tacticId, description

[CHG-004] ADD_ENTITY: ImplementationExample
  - Structured Challenge/Solution/Outcome format
  - Required for all v2 controls

[CHG-005] UPDATE_ENTITY: SecurityControl
  - ADD: riskToMitigate (required)
  - ADD: criticalityLevel (required, enum)
  - ADD: implementationExample (required, object)
  - ADD: mitreAttackMappings (optional, array)
  - ADD: azurePolicyDefinitions (optional, array)

[CHG-006] UPDATE_ENTITY: ComplianceMapping
  - ADD: nistCsfV2 (NIST CSF v2.0)
  - ADD: iso27001_2022 (ISO 27001:2022)
  - ADD: soc2 (SOC 2 TSC)
  - UPDATE: nistSp80053 (Rev.4 → Rev.5)
  - UPDATE: pciDss (v3.2.1 → v4.0)
  - UPDATE: cisControls (v8 → v8.1)

[CHG-007] UPDATE_ENTITY: ImplementationGuidance
  - RESTRUCTURE: Text → Numbered sub-sections
  - ADD: guidanceId property (pattern: XX-N.N)
```

### Appendix B: Test Data Distribution

| Category | Percentage | Count | Description |
|----------|------------|-------|-------------|
| Typical | 60% | 42 | Standard AI security scenarios |
| Edge | 20% | 14 | Boundary conditions, unusual inputs |
| Boundary | 10% | 7 | Min/max values, limits |
| Invalid | 10% | 7 | Error handling, validation failures |

### Appendix C: Related Documents

| Document | Version | Location |
|----------|---------|----------|
| MCSB-ONTOLOGY-V2.0.0.json | 2.0.0 | /mcsb-ontology-v2/ |
| MCSB-ONTOLOGY-V2-DIFFERENTIAL-ANALYSIS.md | 2.0.0 | /mcsb-ontology-v2/ |
| MCSB-GLOSSARY-V2.0.0.json | 2.0.0 | /mcsb-ontology-v2/ |
| OAA System Prompt | 4.0.0 | Project Knowledge |

---

**Document Control:**
- **Created:** 2026-01-23
- **Author:** OAA v4.0.0
- **Status:** Ready for Approval
- **Classification:** Internal
- **Review Cycle:** Upon MCSB v2 GA Release
