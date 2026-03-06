# Product Requirements Document (PRD) Template
## Epic-Features-Stories (EFS) Specification

**Version:** 1.0.0
**Template Type:** EFS-PRD
**Status:** `{{DRAFT | IN_REVIEW | APPROVED | RELEASED}}`
**Last Updated:** {{YYYY-MM-DD}}

---

## Document Control

| Field | Value |
|-------|-------|
| PRD ID | `PRD-{{PRODUCT_CODE}}-{{SEQ}}` |
| Product | {{PRODUCT_NAME}} |
| Version | {{SEMANTIC_VERSION}} |
| Author | {{AUTHOR_NAME}} |
| Reviewers | {{REVIEWER_LIST}} |
| Approval Date | {{DATE}} |

### Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | {{DATE}} | {{AUTHOR}} | Initial draft |

---

## 1. Executive Summary

### 1.1 Vision Statement
{{Brief statement connecting this PRD to the overall product vision and value proposition}}

### 1.2 Strategic Alignment

| Strategic Element | Connection |
|-------------------|------------|
| VSOM Initiative | `{{INITIATIVE_ID}}` - {{INITIATIVE_NAME}} |
| Strategic Objective | `{{OBJECTIVE_ID}}` - {{OBJECTIVE_NAME}} |
| Value Proposition | `{{VP_ID}}` - {{VP_SUMMARY}} |
| Target Release | `{{RELEASE_VERSION}}` |

### 1.3 Success Metrics

| Metric | Type | Baseline | Target | Measurement Method |
|--------|------|----------|--------|-------------------|
| {{METRIC_1}} | Lead/Lag | {{VALUE}} | {{VALUE}} | {{METHOD}} |
| {{METRIC_2}} | Lead/Lag | {{VALUE}} | {{VALUE}} | {{METHOD}} |

---

## 2. Problem Statement

### 2.1 Current State
{{Description of the current situation and pain points}}

### 2.2 User Pain Points

| Pain Point | Affected Persona | Impact | Priority |
|------------|------------------|--------|----------|
| {{PAIN_1}} | {{PERSONA}} | High/Medium/Low | P{{N}} |
| {{PAIN_2}} | {{PERSONA}} | High/Medium/Low | P{{N}} |

### 2.3 Business Impact
{{Quantified impact of not solving this problem}}

---

## 3. Target Personas

### Persona: {{PERSONA_NAME}}

| Attribute | Description |
|-----------|-------------|
| **Role** | {{ROLE}} |
| **Segment** | {{PMF_CUSTOMER_SEGMENT}} |
| **Goals** | {{GOAL_LIST}} |
| **Pain Points** | {{PAIN_POINT_LIST}} |
| **Jobs To Be Done** | {{JTBD_LIST}} |

### Persona: {{PERSONA_NAME_2}}
{{Repeat structure for additional personas}}

---

## 4. Hypotheses

### Hypothesis {{N}}: {{HYPOTHESIS_NAME}}

| Field | Value |
|-------|-------|
| **ID** | `HYP-{{EPIC_CODE}}-{{SEQ}}` |
| **Statement** | We believe that [{{CAPABILITY}}] will result in [{{OUTCOME}}] for [{{PERSONA}}] |
| **Validation Method** | {{A/B Test | Survey | Analytics | Prototype Test | Other}} |
| **Success Criteria** | {{MEASURABLE_CRITERIA}} |
| **Status** | `{{NOT_TESTED | TESTING | VALIDATED | INVALIDATED | NEEDS_MORE_DATA}}` |
| **Learnings** | {{INSIGHTS_FROM_VALIDATION}} |
| **PMF Connection** | `{{PMF_FIT_VALIDATION_ID}}` |

---

## 5. Epic Specification

### Epic: {{EPIC_NAME}}

| Field | Value |
|-------|-------|
| **Epic ID** | `EPIC-{{PRODUCT_CODE}}-{{SEQ}}` |
| **Theme** | `{{THEME_ID}}` - {{THEME_NAME}} |
| **Priority** | `{{CRITICAL | HIGH | MEDIUM | LOW}}` |
| **Status** | `{{IDEA | BACKLOG | READY | IN_PROGRESS | IN_REVIEW | DONE | RELEASED}}` |
| **Target Release** | `{{RELEASE_VERSION}}` |
| **Strategic Objective** | `{{VSOM_OBJECTIVE_ID}}` |
| **Value Score** | {{1-10}} |
| **Risk Score** | {{1-5}} |

#### 5.1 Business Outcome
{{Description of expected business result when epic is delivered}}

**Outcome Metrics:**

| Metric | Lead/Lag | Target | Measurement |
|--------|----------|--------|-------------|
| {{OUTCOME_METRIC}} | {{TYPE}} | {{TARGET}} | {{METHOD}} |

#### 5.2 MVP Scope

Features required for minimum viable delivery:

| Feature ID | Feature Name | MVP Justification |
|------------|--------------|-------------------|
| `F-{{N}}` | {{NAME}} | {{WHY_MVP}} |

#### 5.3 Hypotheses

| Hypothesis ID | Statement Summary | Status |
|---------------|-------------------|--------|
| `HYP-{{N}}` | {{SUMMARY}} | {{STATUS}} |

---

## 6. Features

### Feature {{N}}: {{FEATURE_NAME}}

| Field | Value |
|-------|-------|
| **Feature ID** | `F-{{EPIC_CODE}}-{{SEQ}}` |
| **Epic** | `{{EPIC_ID}}` |
| **Type** | `{{FUNCTIONAL | NON_FUNCTIONAL | COMPLIANCE | INTEGRATION | MIGRATION}}` |
| **Priority** | `{{CRITICAL | HIGH | MEDIUM | LOW}}` |
| **Status** | `{{IDEA | BACKLOG | READY | IN_PROGRESS | IN_REVIEW | DONE | RELEASED}}` |
| **Estimate** | {{STORY_POINTS | T-SHIRT_SIZE}} |
| **Capability** | `{{CAPABILITY_ID}}` - {{CAPABILITY_NAME}} |
| **Value Proposition** | `{{PMF_VP_ID}}` |

#### 6.1 Benefit Hypothesis
{{Statement of expected benefit to validate}}

#### 6.2 Acceptance Criteria

| AC ID | Given | When | Then | Automated |
|-------|-------|------|------|-----------|
| `AC-{{N}}` | {{PRECONDITION}} | {{ACTION}} | {{EXPECTED_OUTCOME}} | Yes/No |

#### 6.3 Technical Enablers

| Enabler ID | Type | Description | Status |
|------------|------|-------------|--------|
| `E-{{N}}` | {{INFRASTRUCTURE | ARCHITECTURAL | EXPLORATION | COMPLIANCE}} | {{DESC}} | {{STATUS}} |

---

## 7. User Stories

### Story {{N}}: {{STORY_NAME}}

| Field | Value |
|-------|-------|
| **Story ID** | `US-{{FEATURE_CODE}}-{{SEQ}}` |
| **Feature** | `{{FEATURE_ID}}` |
| **Priority** | `{{CRITICAL | HIGH | MEDIUM | LOW}}` |
| **Status** | `{{BACKLOG | READY | IN_PROGRESS | IN_REVIEW | DONE}}` |
| **Story Points** | {{NUMBER}} |
| **Persona** | `{{PERSONA_ID}}` - {{PERSONA_NAME}} |

#### User Story Statement

> **As a** {{PERSONA}}
> **I want** {{DESIRED_FUNCTIONALITY}}
> **So that** {{BENEFIT_OR_VALUE}}

#### Acceptance Criteria (Given-When-Then)

**AC {{N}}.1:**
- **Given** {{PRECONDITION}}
- **When** {{ACTION}}
- **Then** {{EXPECTED_OUTCOME}}

**AC {{N}}.2:**
{{Repeat as needed}}

#### Tasks

| Task ID | Description | Type | Estimate (hrs) | Assignee |
|---------|-------------|------|----------------|----------|
| `T-{{N}}` | {{TASK_DESC}} | {{DEV | QA | DESIGN | DOC}} | {{HOURS}} | {{PERSON}} |

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Dependency ID | Source Item | Target Item | Type | Strength |
|---------------|-------------|-------------|------|----------|
| `DEP-{{N}}` | `{{SOURCE_ID}}` | `{{TARGET_ID}}` | {{FINISH_TO_START | START_TO_START | FINISH_TO_FINISH}} | {{HARD | SOFT}} |

### 8.2 External Dependencies

| Dependency | External System/Team | Impact | Mitigation |
|------------|----------------------|--------|------------|
| {{DEPENDENCY}} | {{SYSTEM_TEAM}} | {{IMPACT_DESC}} | {{MITIGATION_PLAN}} |

---

## 9. Risks

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation |
|---------|----------|-------------|-------------|--------|-------|------------|
| `RISK-{{N}}` | {{TECHNICAL | RESOURCE | SCHEDULE | SCOPE | EXTERNAL | COMPLIANCE}} | {{DESC}} | {{0.1-1.0}} | {{1-5}} | {{P*I}} | {{STRATEGY}} |

---

## 10. Release Planning

### Release: {{RELEASE_VERSION}}

| Field | Value |
|-------|-------|
| **Release Type** | `{{MVP | MAJOR | MINOR | PATCH | BETA | GA}}` |
| **Target Date** | {{DATE}} |
| **Market Readiness** | `{{INITIAL | DEVELOPING | DEFINED | MANAGED | OPTIMIZING}}` |
| **GTM Launch Plan** | `{{GTM_LAUNCH_ID}}` |

#### Included Features

| Feature ID | Feature Name | Status | Dependencies Met |
|------------|--------------|--------|------------------|
| `F-{{N}}` | {{NAME}} | {{STATUS}} | Yes/No |

#### Release Checklist

- [ ] All features complete
- [ ] All acceptance criteria verified
- [ ] Documentation complete
- [ ] GTM materials ready
- [ ] Stakeholder sign-off obtained

---

## 11. Stakeholders

| Stakeholder | Role | Influence | Interest | Communication |
|-------------|------|-----------|----------|---------------|
| {{NAME}} | {{ROLE}} | {{1-5}} | {{1-5}} | {{WEEKLY | BIWEEKLY | MONTHLY | AS_NEEDED}} |

---

## 12. Appendices

### A. Glossary
{{Domain-specific terms and definitions}}

### B. References
{{Links to related documents, ontologies, and external resources}}

### C. Ontology Mappings

| PRD Element | EFS Class | External Ontology |
|-------------|-----------|-------------------|
| Epic | `efs:Epic` | `vsom:StrategicObjective` |
| Feature | `efs:Feature` | `pmf:ValueProposition` |
| Story | `efs:UserStory` | `pmf:CustomerNeed` |
| Hypothesis | `efs:Hypothesis` | `pmf:FitValidation` |
| Release | `efs:Release` | `gtm:LaunchPlan` |

---

## 13. GitHub Projects Integration

### Field Mappings

| PRD Field | GitHub Projects Field | Notes |
|-----------|----------------------|-------|
| Epic ID | Milestone | One milestone per epic |
| Feature ID | Issue (Label: feature) | Parent of stories |
| Story ID | Issue (Label: story) | Task items in checklist |
| Priority | Priority field | Custom field |
| Status | Status field | Built-in status |
| Story Points | Size field | Custom field |
| Assignee | Assignees | Built-in field |

### Labels Required

```
Labels to create in GitHub:
- epic
- feature
- story
- task
- enabler
- hypothesis
- priority:critical
- priority:high
- priority:medium
- priority:low
- type:functional
- type:non-functional
- type:compliance
- type:integration
- mvp
```

### Automation Workflows

1. **Epic → Milestone Creation**
   - When PRD approved, create milestone for each Epic
   - Set milestone due date to target release

2. **Feature → Issue Creation**
   - Create issue with `feature` label
   - Link to epic milestone
   - Include acceptance criteria in issue body

3. **Story → Issue Creation**
   - Create issue with `story` label
   - Link to feature issue (parent)
   - Include Given-When-Then acceptance criteria
   - Add tasks as checklist items

4. **Status Sync**
   - PRD status maps to GitHub Project status column
   - Automation moves cards on status change

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Engineering Lead | | | |
| Design Lead | | | |
| Stakeholder | | | |

---

*Template Version: 1.0.0 | Based on EFS Ontology v1.0.0*
