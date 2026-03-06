# BAIV AI Visibility - RRR-RBAC Implementation Plan

## 1. Overview

This plan defines the encoding of BAIV AI Visibility product security, roles, RACI, and RBAC requirements into the PF-Core RRR ontology framework.

**Source Documents:**
- BAIV-Security-REQS.pdf (45 functional requirements, 15 user stories)
- BAIV-PFI-RBAC Roles v2.pdf (11 roles, 60+ permissions)
- BAIV-PFI-AIV-RBAC Roles Legend.pdf (role definitions)
- BAIV-PFC-PFI Security-PBS.pdf (6 packages, 25 deliverables)

**Schema Conformance:** `pf:RRR-ONT-v3.1.0`

---

## 2. Data Files to Create

### 2.1 Role Data
**File:** `RRR-DATA-BAIV-AIV-roles-v1.0.0.jsonld`

| Role ID | Role Title | Category | Seniority | Reports To |
|---------|-----------|----------|-----------|------------|
| `baiv:role:pfi-owner` | PFI Owner | Platform | 1 | - |
| `baiv:role:admin` | Admin | Platform | 2 | pfi-owner |
| `baiv:role:agency-admin` | Agency Admin | Agency | 2 | admin |
| `baiv:role:agency-manager` | Agency Manager | Agency | 3 | agency-admin |
| `baiv:role:agency-analyst` | Agency Analyst | Agency | 4 | agency-manager |
| `baiv:role:client-admin` | Client Admin (Ent) | Client | 2 | admin |
| `baiv:role:client-manager` | Client Manager | Client | 3 | client-admin |
| `baiv:role:client-analyst` | Client Analyst | Client | 4 | client-manager |
| `baiv:role:client-viewer` | Client Viewer | Client | 5 | client-admin |
| `baiv:role:affiliate` | Affiliate | Limited | 3 | admin |
| `baiv:role:api-only` | API Only | Limited | 5 | admin |

### 2.2 Permission Data
**File:** `RRR-DATA-BAIV-AIV-permissions-v1.0.0.jsonld`

**Permission Categories:**
1. Security & Access (10 permissions)
2. Onboarding & Discovery (5 permissions)
3. Dashboards & Reporting (5 permissions)
4. Analysis Tools (5 permissions)
5. Content Creation (5 permissions)
6. Content Planning & Schedule (5 permissions)
7. Lead Generation (4 permissions)
8. Integrations (6 permissions)
9. Platform APIs (4 permissions)
10. Agency-Specific (5 permissions)
11. Ontology & Advanced (3 permissions)

### 2.3 Security Requirements → EFS
**File:** `EFS-DATA-BAIV-AIV-security-v1.0.0.jsonld`

**EPICs:**
- EPIC-SEC-AUTH: Authentication & Authorization
- EPIC-SEC-RLS: Row-Level Security
- EPIC-SEC-COLLAB: Collaboration & Presence
- EPIC-SEC-AUDIT: Audit & Activity Logging

---

## 3. Mapping: Security Requirements → EFS

### EPIC-SEC-AUTH: Authentication & Authorization
| Feature ID | Feature Name | Stories |
|-----------|--------------|---------|
| FEAT-AUTH-01 | Email/Password Auth | US-A01 |
| FEAT-AUTH-02 | OAuth Integration | US-A02 |
| FEAT-AUTH-03 | Magic Link | US-A03 |
| FEAT-AUTH-04 | Multi-Tenant Switching | US-A04, US-A05 |
| FEAT-AUTH-05 | JWT Token Management | FR-AUTH-04, FR-AUTH-05 |

### EPIC-SEC-RLS: Row-Level Security
| Feature ID | Feature Name | Stories |
|-----------|--------------|---------|
| FEAT-RLS-01 | Tenant Isolation | US-S01, FR-SEC-01 |
| FEAT-RLS-02 | Context Propagation | FR-SEC-02, FR-SEC-03 |
| FEAT-RLS-03 | Audit Immutability | US-S02, FR-SEC-04, FR-SEC-05 |

### EPIC-SEC-COLLAB: Collaboration & Presence
| Feature ID | Feature Name | Stories |
|-----------|--------------|---------|
| FEAT-COLLAB-01 | User Presence | US-L01, FR-PRE-01 to FR-PRE-05 |
| FEAT-COLLAB-02 | Record Locking | US-L02, FR-LOCK-01 to FR-LOCK-06 |
| FEAT-COLLAB-03 | Activity Stream | US-L03, FR-ACT-01 to FR-ACT-05 |

### EPIC-SEC-CYCLE: Cycle State Management
| Feature ID | Feature Name | Stories |
|-----------|--------------|---------|
| FEAT-CYCLE-01 | Stage Tracking | US-C01, FR-CYC-01 to FR-CYC-03 |
| FEAT-CYCLE-02 | Stage Advancement | US-C02, FR-CYC-04 to FR-CYC-06 |
| FEAT-CYCLE-03 | Health Indicators | US-C03 |

---

## 4. C-Suite Role Mapping (from PDF)

| Business Role | BAIV RBAC Role | Focus |
|--------------|----------------|-------|
| CMO/VP Marketing | Client Admin | Strategic oversight, ROI |
| Director E-commerce | Client Admin + Manager | Implementation + oversight |
| Marketing Manager | Client Manager | Day-to-day execution |
| SEO Manager | Client Manager + Analyst | Technical + analysis |
| Content Manager | Client Manager + Analyst | Content workflow |
| Paid Media Manager | Client Manager | Attribution focus |
| Social Media Manager | Client Analyst | Monitoring + engagement |
| SEO Specialist | Client Analyst | Technical implementation |
| IT/Technical | Client Admin + API Only | Integration focus |

---

## 5. Implementation Sequence

### Phase 1: Role Data (Current)
1. Create `RRR-DATA-BAIV-AIV-roles-v1.0.0.jsonld`
2. Define 11 roles with full RACI matrices
3. Establish role hierarchy

### Phase 2: Permission Data
1. Create `RRR-DATA-BAIV-AIV-permissions-v1.0.0.jsonld`
2. Define 60+ permission instances
3. Create role-permission access policies

### Phase 3: Security EFS
1. Create `EFS-DATA-BAIV-AIV-security-v1.0.0.jsonld`
2. Map 4 EPICs, 12 Features, 45+ Stories
3. Link to security requirements (FR-* IDs)

### Phase 4: Validation
1. Validate conformance to RRR-ONT v3.1.0
2. Verify RACI completeness (BR-RRR-002, BR-RRR-003)
3. Verify no circular reporting (BR-RRR-004)

---

## 6. File Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| ONT (Schema) | `pf-{domain}-ONT-v{version}.jsonld` | `pf-RRR-ONT-v3.1.0.jsonld` |
| DATA | `RRR-DATA-{product}-{use-case}-v{version}.jsonld` | `RRR-DATA-BAIV-AIV-roles-v1.0.0.jsonld` |
| EFS DATA | `EFS-DATA-{product}-{use-case}-v{version}.jsonld` | `EFS-DATA-BAIV-AIV-security-v1.0.0.jsonld` |

---

## 7. Validation Checklist

- [ ] All roles have `@id`, `roleCode`, `roleTitle`
- [ ] All roles have `reportsTo` (except PFI Owner)
- [ ] All roles have `raciAccountable`, `raciResponsible` defined
- [ ] Permissions use `rbac:action` enum values
- [ ] Access policies bind roles to permissions
- [ ] EFS stories link to FR-* requirement IDs
- [ ] No circular reporting relationships
- [ ] Schema conformance: `conformsTo: pf:RRR-ONT-v3.1.0`

---

*Document Version: 1.0.0*
*Created: 2026-02-02*
*Conformance: pf:RRR-ONT-v3.1.0, pf:EFS-ONT-v1.0*
