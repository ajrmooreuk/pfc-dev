# Business Rules & Application Logic Specification

**Version:** 1.0.0
**Date:** 2026-02-13
**Author:** Azlan EA-AAA
**Status:** Normative
**Scope:** All ontologies in the Azlan Ontology Library

---

## 1. Purpose

This document is the **single authoritative reference** for all business rules (BR-\*), application rules (AR-\*), and lineage rules (LR-\*) across the Azlan Ontology Library. It is the business logic equivalent of [DESIGN-SYSTEM-SPEC.md](../TOOLS/ontology-visualiser/DESIGN-SYSTEM-SPEC.md), which governs visual/design rules (DR-\*).

**Audience:** Ontology authors, AI agent developers, workbench engineers, validators, stakeholders.

**Normative statement:** All BR-\* and AR-\* rules documented here are normative. Implementations MUST comply with `error` severity rules and SHOULD comply with `warning` severity rules.

---

## 2. Rule Architecture

### Rule Categories

| Prefix | Category | Scope | Defined In |
|--------|----------|-------|------------|
| **BR-\*** | Business Rules | Entity-level constraints within a single ontology | Individual ontology JSON files |
| **AR-\*** | Application Rules | Cross-ontology rules governing how ontologies interact | This document (new) |
| **LR-\*** | Lineage Rules | Strategy-to-execution traceability chain validation | EFS Lineage Specification + this document |
| **DR-\*** | Design Rules | Visual/UI rules for the ontology visualiser | [DESIGN-SYSTEM-SPEC.md](../TOOLS/ontology-visualiser/DESIGN-SYSTEM-SPEC.md) |

### Severity Model

| Severity | Keyword | Meaning |
|----------|---------|---------|
| `error` | MUST / MUST NOT | Mandatory. Violation is a validation failure. |
| `warning` | SHOULD / SHOULD NOT | Recommended. Violation triggers advisory notice. |
| `info` | MAY | Advisory. Best practice guidance. |

### Rule Format

All rules follow the IF-THEN format:
- **Condition:** `IF <entity/state condition>`
- **Action:** `THEN <required/recommended action>`
- **Severity:** `error` | `warning` | `info`

---

## 3. VE-Series Business Rules

### 3.1 VSOM-ONT (10 rules)

Vision-Strategy-Objectives-Metrics framework structure and lifecycle.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-VSOM-001 | VSOM Framework Completeness | IF a VSOMFramework is created | THEN the framework MUST have at least one Vision, Strategy, Objective, and Metric component | error |
| BR-VSOM-002 | Framework Organization Reference | IF a VSOMFramework is created | THEN organizationRef MUST reference a valid org:Organization @id | error |
| BR-VSOM-003 | Objective Must Have Deadline | IF an ObjectivesComponent is created | THEN deadline MUST be specified | error |
| BR-VSOM-004 | Metric Must Have Target | IF a MetricsComponent is created | THEN thresholdTarget SHOULD be specified | warning |
| BR-VSOM-005 | Strategy Alignment | IF a StrategyComponent exists | THEN it MUST have derivesFromVision relationship to VisionComponent | error |
| BR-VSOM-006 | Objective Tracking | IF an ObjectivesComponent exists | THEN it MUST have at least one trackedByMetric relationship | error |
| BR-VSOM-007 | Impact-Outcome-Value Chain | IF BusinessImpact drives Outcome | THEN Outcome MUST measure at least one ValueMeasure | warning |
| BR-VSOM-008 | Review Cycle Requires Landscape | IF a StrategicReviewCycle has triggerType 'MarketEvent' or 'CompetitorAction' or 'OpportunityIdentified' | THEN reviewsLandscape SHOULD reference a CompetitiveLandscape | warning |
| BR-VSOM-009 | Major Strategy Change Requires Review | IF a StrategicReviewCycle has strategyImpact 'Major-Pivot' or 'Full-Revision' | THEN producesUpdatedStrategy MUST reference a new StrategyComponent | error |
| BR-VSOM-010 | Metric Breach Requires Review | IF a MetricsComponent value breaches thresholdCritical | THEN a StrategicReviewCycle with triggerType 'MetricBreach' SHOULD be created | warning |

### 3.2 OKR-ONT (8 rules)

Objective-Key Result alignment and scoring.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| okr:rule-objective-key-results-count | ObjectiveKeyResultsCount | IF okr:Objective exists | THEN COUNT(okr:hasKeyResult) >= 2 AND <= 5 | error |
| okr:rule-key-result-target-differs | KeyResultTargetDiffers | IF okr:KeyResult.targetValue is set | THEN targetValue != startValue | error |
| okr:rule-key-result-weights-sum | KeyResultWeightsSum | IF okr:Objective has multiple KeyResults with weights | THEN SUM(weight) = 100 for each Objective | warning |
| okr:rule-objective-time-period-required | ObjectiveTimePeriodRequired | IF okr:Objective exists | THEN scopedByPeriod relationship must exist with valid TimePeriod | error |
| okr:rule-progress-from-key-results | ProgressFromKeyResults | IF okr:Objective.progressPercentage is calculated | THEN progressPercentage = WEIGHTED_AVG(KeyResults.progressPercentage, KeyResults.weight) | warning |
| okr:rule-alignment-cascade-required | AlignmentCascadeRequired | IF okr:ObjectiveType != COMPANY | THEN alignsTo relationship must exist to a higher-level Objective | warning |
| okr:rule-check-in-cadence | CheckInCadenceRequired | IF okr:ObjectiveStatus = ACTIVE or ON_TRACK or AT_RISK or OFF_TRACK | THEN hasCheckIn should have entries within last 30 days | warning |
| okr:rule-initiative-links-key-result | InitiativeLinksKeyResult | IF okr:Initiative exists | THEN hasInitiative relationship must connect to at least one KeyResult | error |

### 3.3 VP-ONT (22 rules)

Value proposition structure, ICP targeting, and evidence chains.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-VP-001 | VP Requires Primary Statement | IF a ValueProposition is created | THEN primaryStatement MUST be defined with length >= 50 characters | error |
| BR-VP-002 | VP Must Target ICP | IF a ValueProposition is created | THEN it MUST have at least one targetsICP relationship | error |
| BR-VP-003 | VP Must Address Problem | IF a ValueProposition is created | THEN it MUST have at least one addressesProblem relationship | error |
| BR-VP-004 | VP Must Have Evidence | IF a ValueProposition has status = 'Validated' OR 'Active' | THEN it MUST have at least one supportedByEvidence relationship | error |
| BR-VP-005 | VP Must Align to VSOM Objective | IF a ValueProposition is created | THEN it MUST have at least one alignsToObjective relationship to vsom:ObjectivesComponent | error |
| BR-VP-006 | VP Must Be Org Context Scoped | IF a ValueProposition is created | THEN organizationContextRef MUST reference a valid org:OrganizationContext | error |
| BR-VP-007 | Problem Must Have Pain Points | IF a Problem is created | THEN it MUST have at least one problemHasPainPoint relationship | error |
| BR-VP-008 | Problem Must Be Validated | IF a Problem is used in active ValueProposition | THEN it MUST have at least one problemValidatedBy relationship | error |
| BR-VP-009 | Critical Problem Maps to Epic | IF Problem.severity = 'Critical' OR 'Major' | THEN Problem SHOULD have mapsToEpic relationship to efs:Epic | warning |
| BR-VP-010 | Solution Must Address Problem | IF a Solution is created | THEN it MUST have at least one solutionAddressesProblem relationship | error |
| BR-VP-011 | Solution Must Deliver Benefit | IF a Solution is created | THEN it MUST have at least one solutionDeliversBenefit relationship | error |
| BR-VP-012 | Solution Must Have Differentiator | IF a Solution is created | THEN it MUST have at least one solutionDifferentiatedBy relationship | error |
| BR-VP-013 | Benefit Must Mitigate Pain | IF a Benefit is created | THEN it MUST have at least one benefitMitigatesPain relationship | error |
| BR-VP-014 | ICP Must Have Stakeholder | IF an IdealCustomerProfile or RoleBasedICP is created | THEN it MUST have at least one icpHasStakeholder relationship | error |
| BR-VP-015 | ICP Should Map to Persona | IF an ICP is used in active ValueProposition | THEN it SHOULD have at least one manifestsAsPersona relationship to efs:Persona | warning |
| BR-VP-016 | Benefit Should Realize in Story | IF a Benefit is in active ValueProposition | THEN it SHOULD have at least one realizesInStory relationship to efs:UserStory | warning |
| BR-VP-017 | ICP Hierarchy Must Match Role Hierarchy | IF RoleBasedICP.roleRef.reportsTo = roleB | THEN icpReportsTo MUST reference RoleBasedICP where roleRef = roleB | error |
| BR-VP-018 | Problem Severity Roll-Up Constraint | IF Problem.problemRollsUpTo = parentProblem | THEN Problem.severity ordinal MUST be <= parentProblem.severity ordinal | warning |
| BR-VP-019 | VP RACI Must Have One Accountable | IF VPRACIAssignment exists for a specific activity | THEN EXACTLY ONE must have raciType = 'Accountable' AND AT LEAST ONE 'Responsible' | error |
| BR-VP-020 | ICP Seniority Level Consistency | IF RoleBasedICP.icpReportsTo = parentICP | THEN seniorityLevel MUST be > parentICP.seniorityLevel | error |
| BR-VP-021 | RoleBasedICP Must Have Role Reference | IF a RoleBasedICP is created | THEN it MUST have roleRef pointing to valid ExecutiveRole or FunctionalRole | error |
| BR-VP-022 | Problem Scope Must Match ICP Function | IF Problem owned by RoleBasedICP via icpHasProblem | THEN Problem.scopeLevel SHOULD match RoleBasedICP.functionScope | warning |

### 3.4 RRR-ONT (8 rules)

Roles, RACI, RBAC, and reporting hierarchy.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-RRR-001 | CEO Fallback Rule | IF ExecutiveRole.isActive = false AND roleCategory contains 'CSuite' | THEN CEO assumes accountability until role filled | info |
| BR-RRR-002 | One Accountable Per Activity | IF Activity has RACIAssignments | THEN COUNT(raciType='Accountable') = 1 | error |
| BR-RRR-003 | At Least One Responsible | IF Activity has RACIAssignments | THEN COUNT(raciType='Responsible') >= 1 | error |
| BR-RRR-004 | No Circular Reporting | IF Role.reportsTo chain exists | THEN chain MUST NOT contain cycles | error |
| BR-RRR-005 | CFO Financial Accountability | IF CFO role exists | THEN CFO.raciAccountable MUST include financial reporting, statutory compliance, capital allocation, financial planning | warning |
| BR-RRR-006 | C-Suite Seniority Level | IF ExecutiveRole.roleCategory contains 'CSuite' | THEN seniorityLevel = 1 | warning |
| BR-RRR-007 | Delegation Requires Accountability | IF ExecutiveRole.delegatesTo exists | THEN delegationScope MUST be subset of role's coreResponsibilities or raciAccountable | error |
| BR-RRR-008 | VP-RoleRef Alignment | IF RoleBasedICP.roleRef exists | THEN roleRef MUST reference valid ExecutiveRole or FunctionalRole @id | error |

### 3.5 PMF-ONT (10 rules)

Product-market fit validation and go-to-market readiness.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-PMF-001 | PMF Requires Validation | IF a ProductMarketFit is created | THEN it MUST have at least one MarketValidation with validationType | error |
| BR-PMF-002 | PMF Requires Segment | IF a ProductMarketFit is created | THEN it MUST have at least one CustomerSegmentFit | error |
| BR-PMF-003 | Scale Decision Requires Score | IF ProductMarketFit.decision = 'scale' | THEN fitScore MUST be > 0.7 | error |
| BR-PMF-004 | Retention Threshold | IF MarketValidation.validationType = 'quantitative' | THEN retentionRate SHOULD be >= 0.40 for PMF achievement | warning |
| BR-PMF-005 | NPS Threshold | IF MarketValidation.validationType = 'quantitative' | THEN netPromoterScore SHOULD be > 50 for PMF achievement | warning |
| BR-PMF-006 | WTP Before GTM | IF a GTMStrategy is created for a CustomerSegmentFit | THEN willingnessToPayValidated MUST be true | error |
| BR-PMF-007 | Iteration Hypothesis Required | IF a PMFIteration is created | THEN it MUST have a hypothesis defined before entering build phase | error |
| BR-PMF-008 | Execution Requires PMF | IF ProductMarketFit has enablesExecution relationship | THEN fitStatus MUST be 'achieved' or 'scaling' | error |
| BR-PMF-009 | LTV-CAC Ratio | IF CustomerSegmentFit has both lifetimeValue and acquisitionCost | THEN lifetimeValue SHOULD be at least 3x acquisitionCost | warning |
| BR-PMF-010 | Competitive Positioning Required | IF ProductMarketFit.fitStatus = 'validating' or higher | THEN it MUST have CompetitivePositioning with positioningStatement | error |

### 3.6 KPI-ONT (12 rules)

Metric structure, thresholds, and Value Engineering.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-001 | Vision Lifecycle Cascade | Vision.status = 'Archived' | All child Strategy entities MUST have status IN ['Superseded', 'Archived'] | Critical |
| BR-002 | P0 Objective Quarterly Coverage | StrategicObjective.priority = 'P0-Critical' | At least one child Objective MUST exist with timeframe = current_quarter OR next_quarter | High |
| BR-003 | Active OKR Completeness | Objective.status = 'Active' | Objective MUST have minimum 2 KeyResult entities AND all KeyResults MUST have currentValue ≠ NULL | Critical |
| BR-004 | Key Result Achievement | KeyResult.currentValue >= KeyResult.targetValue | KeyResult.progressPercentage MUST = 100 AND parent Objective.status SHOULD = 'Completed' | Medium |
| BR-005 | KPI Data Freshness Alert | KPI.updateFrequency = 'Daily' AND (now - measurementTimestamp) > 36 hours | Data quality alert MUST be triggered | Medium |
| BR-006 | VE Analysis Completeness | VEAnalysis.recommendation IN ['Proceed', 'Optimize'] | VEAnalysis MUST have minimum 3 VEFunction entities with functionType IN ['Basic', 'Secondary'] | High |
| BR-007 | VE Basic Function Requirement | VEAnalysis has zero VEFunction with functionType = 'Basic' | VEAnalysis is incomplete; MUST identify primary purpose function | Critical |
| BR-008 | VE Cost Allocation Integrity | SUM(VECostElement.amount) ≠ VEAnalysis.totalCost | Cost allocation incomplete; MUST be corrected before approval | Critical |
| BR-009 | VE Value Ratio Decision Threshold | VEAnalysis.valueRatio < 0.8 | Recommendation MUST be 'Redesign' OR 'Cancel' OR provide explicit rationale | High |
| BR-010 | Metric-KPI Relationship Consistency | KPI.calculationMethod references Metric.metricId | Explicit 'quantifiedBy' relationship MUST exist in relationship graph | Medium |
| BR-011 | Objective-Strategic Objective Temporal Alignment | Objective.strategicObjectiveId IS NOT NULL | Objective.timeframe MUST be within StrategicObjective.timeframe date range | High |
| BR-012 | Balanced Scorecard KPI Coverage | Organization has >10 active KPIs | KPIs SHOULD span all four BSC categories (minimum 1 per category) | Low |

---

## 4. VE-Series VSOM-SA Business Rules

Strategy Analysis sub-series: 67 rules across 5 ontologies.

### 4.1 BSC-ONT (15 rules)

Balanced Scorecard strategy execution, perspectives, and causal maps.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-BSC-001 | BSC Must Have Four Perspectives | IF a BalancedScorecard is created | THEN it MUST have exactly four BSCPerspective instances: Financial, Customer, Internal Process, Learning & Growth | error |
| BR-BSC-002 | BSC Must Reference VSOM | IF a BalancedScorecard is created | THEN vsomFrameworkRef MUST reference a valid vsom:VSOMFramework @id | error |
| BR-BSC-003 | Perspective Weights Must Sum to 1.0 | IF BSCPerspective.weight values are specified | THEN sum of all four MUST equal 1.0 | error |
| BR-BSC-004 | Perspective Must Have Objectives | IF a BSCPerspective exists | THEN it MUST have at least one BSCObjective (recommended 3-5) | error |
| BR-BSC-005 | Objective Must Have Owner | IF a BSCObjective is created | THEN ownerRoleRef MUST reference a valid rrr:ExecutiveRole @id | error |
| BR-BSC-006 | Objective Must Have Measure | IF a BSCObjective exists | THEN it MUST have at least one BSCMeasure via measuredByKPI relationship | error |
| BR-BSC-007 | Measure Must Reference KPI | IF a BSCMeasure is created | THEN kpiRef MUST reference a valid kpi:KPI @id | error |
| BR-BSC-008 | Strategy Map Causal Direction | IF a CausalLink is created in a StrategyMap | THEN fromPerspective SHOULD be at a lower BSC level than toPerspective | warning |
| BR-BSC-009 | Objective Weight Sum Within Perspective | IF BSCObjective.weight values specified within a BSCPerspective | THEN sum MUST equal 1.0 | error |
| BR-BSC-010 | Perspective Owner Must Match RRR | IF a perspectiveOwnedBy relationship is created | THEN rrr:ExecutiveRole.bscPerspective SHOULD include the perspectiveType value | warning |
| BR-BSC-011 | BSCObjective Must Align to VSOM | IF a BSCObjective is created | THEN vsomObjectiveRef MUST reference a valid vsom:ObjectivesComponent @id | error |
| BR-BSC-012 | Measure Polarity Consistency | IF BSCMeasure has polarity 'HigherIsBetter' | THEN thresholdGreen MUST be >= thresholdAmber >= thresholdRed | error |
| BR-BSC-013 | Stakeholder Alignment Coverage | IF a StakeholderAlignment assessment is created | THEN it SHOULD include assessments for all rrr:ExecutiveRole instances with bscPerspective ownership | warning |
| BR-BSC-014 | Value Chain Activity Categorization | IF ValueChainActivity has activityType 'Primary' | THEN primaryCategory MUST be specified | error |
| BR-BSC-015 | Lifecycle Stage Dominant Perspective | IF a LifecycleStageAnalysis is created | THEN dominantBSCPerspective MUST be specified based on lifecycle stage | error |

### 4.2 INDUSTRY-ONT (15 rules)

Porter's Five Forces, SWOT/TOWS, Ansoff, competitive positioning.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-IND-001 | Porter's Must Have Five Assessments | IF a PortersFiveForcesAnalysis is created | THEN it MUST have exactly five ForceAssessment instances | error |
| BR-IND-002 | Porter's Must Reference Landscape | IF a PortersFiveForcesAnalysis is created | THEN competitiveLandscapeRef MUST reference a valid orgctx:CompetitiveLandscape @id | error |
| BR-IND-003 | Force Assessment Must Reference Force | IF a ForceAssessment is created | THEN competitiveForceRef MUST reference a valid orgctx:CompetitiveForce @id | error |
| BR-IND-004 | Force Weights Must Sum to 1.0 | IF ForceAssessment.weight values are specified | THEN sum of all five MUST equal 1.0 | error |
| BR-IND-005 | SWOT Must Have All Quadrants | IF a SWOTAnalysis is created | THEN it MUST have at least one SWOTFactor in each quadrant | error |
| BR-IND-006 | SWOT Weakness Should Link Gap | IF SWOTFactor has quadrant 'Weakness' and significance 'Critical' or 'High' | THEN gapRef SHOULD reference a ga:IdentifiedGap or ea:CapabilityGap @id | warning |
| BR-IND-007 | SWOT External Factor Should Link Trend | IF SWOTFactor has quadrant 'Opportunity' or 'Threat' | THEN trendRef or competitiveForceRef SHOULD reference an orgctx entity | warning |
| BR-IND-008 | TOWS Strategy Must Cross Quadrants | IF a TOWSStrategy is created | THEN internalFactorRefs MUST reference S or W factors AND externalFactorRefs MUST reference O or T factors matching the TOWS quadrant | error |
| BR-IND-009 | TOWS Quadrant Factor Consistency | IF TOWSStrategy has towsQuadrant 'SO' | THEN internalFactorRefs MUST reference Strength factors AND externalFactorRefs MUST reference Opportunity factors (similarly for WO, ST, WT) | error |
| BR-IND-010 | Ansoff Must Have Four Quadrants | IF an AnsoffGrowthMatrix is created | THEN it MUST have exactly four AnsoffQuadrant instances | error |
| BR-IND-011 | Ansoff Penetration References Existing | IF AnsoffQuadrant has quadrantType 'MarketPenetration' | THEN existingProductRefs and existingMarketRefs SHOULD reference existing orgctx entities | warning |
| BR-IND-012 | Ansoff Diversification Must Specify Type | IF AnsoffQuadrant has quadrantType 'Diversification' | THEN diversificationType MUST be specified | error |
| BR-IND-013 | Competitive Positioning Generic Strategy | IF a CompetitivePositioning is created | THEN genericStrategy MUST be one of Porter's four generic strategies | error |
| BR-IND-014 | Adopted TOWS Must Reference VSOM | IF TOWSStrategy has adoptionStatus 'Adopted' | THEN vsomStrategyRef MUST reference a valid vsom:StrategyComponent @id | error |
| BR-IND-015 | Significant Porter Force Change Triggers Review | IF ForceAssessment shows intensityLevel changed by 2+ levels | THEN a vsom:StrategicReviewCycle with triggerType 'MarketEvent' SHOULD be triggered | warning |

### 4.3 REASON-ONT (15 rules)

MECE decomposition, Logic Trees, Hypothesis-Driven Analysis, Synthesis.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-RSN-001 | Question Must Have VSOM Target | IF a StrategicQuestion is created | THEN vsomLayerTarget MUST be specified | error |
| BR-RSN-002 | MECE Tree Must Be Validated | IF a MECETree is used for analysis | THEN isMECE SHOULD be explicitly validated — gaps and overlaps documented in meceValidationNotes | warning |
| BR-RSN-003 | Leaf Branches Must Have Framework | IF MECEBranch is a leaf node (isLeaf=true) | THEN assignedFramework SHOULD be specified for AI agent routing | warning |
| BR-RSN-004 | Hypothesis Must Have Assumptions | IF a StrategicHypothesis is created | THEN it MUST have at least one HypothesisAssumption with criticality 'MustBeTrue' | error |
| BR-RSN-005 | Must-Be-True Assumptions Tested First | IF StrategicHypothesis has assumptions with criticality 'MustBeTrue' | THEN those assumptions MUST be tested before hypothesis can move to 'Validated' | error |
| BR-RSN-006 | Invalidated Assumption Invalidates Hypothesis | IF any HypothesisAssumption with criticality 'MustBeTrue' has status 'Invalidated' | THEN parent StrategicHypothesis status MUST be 'Invalidated' or 'Pivoted' | error |
| BR-RSN-007 | Evidence Must Declare Direction | IF an EvidenceItem is created | THEN direction (Supporting/Contradicting/Neutral) MUST be declared to prevent confirmation bias | error |
| BR-RSN-008 | Hypothesis Must Seek Contradicting Evidence | IF a StrategicHypothesis is being tested | THEN analysis SHOULD explicitly seek contradicting evidence | warning |
| BR-RSN-009 | Logic Tree Operator Required For Non-Leaf | IF LogicTreeNode has isLeaf=false | THEN operator MUST be specified (Add, Subtract, Multiply, Divide) | error |
| BR-RSN-010 | Logic Tree Leaf Must Map to KPI | IF LogicTreeNode has isLeaf=true | THEN kpiRef SHOULD reference a valid kpi:KPI @id | warning |
| BR-RSN-011 | High Sensitivity Levers Become Objectives | IF LogicTreeNode has sensitivityRank <= 3 | THEN vsomObjectiveRef SHOULD reference a vsom:ObjectivesComponent | warning |
| BR-RSN-012 | Synthesis Must Reference Question | IF an AnalysisSynthesis is created | THEN questionRef MUST reference the rsn:StrategicQuestion @id | error |
| BR-RSN-013 | Synthesis Must Identify Divergent Findings | IF AnalysisSynthesis contains multiple framework inputs | THEN contradictions MUST be documented as SynthesisFinding with findingType 'Divergent' | error |
| BR-RSN-014 | Recommendation Must Have Evidence Chain | IF StrategicRecommendation has priority 'Critical' or 'High' | THEN evidenceChainRefs MUST reference at least one EvidenceItem @id | error |
| BR-RSN-015 | Accepted Recommendation Must Target VSOM | IF StrategicRecommendation has adoptionStatus 'Accepted' | THEN vsomComponentRef MUST reference a valid vsom:StrategyComponent or ObjectivesComponent @id | error |

### 4.4 MACRO-ONT (12 rules)

PESTEL, Scenario Planning, Futures Funnel, Backcasting.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-MAC-001 | PESTEL Must Cover All Six Dimensions | IF a PESTELAnalysis is created | THEN it MUST have at least one PESTELFactor in each of the six dimensions | error |
| BR-MAC-002 | PESTEL Factor Should Enrich Existing Trend | IF PESTELFactor overlaps with existing orgctx:Trend | THEN trendRef SHOULD reference the existing Trend @id | warning |
| BR-MAC-003 | Critical PESTEL Factor Triggers Review | IF PESTELFactor has impactLevel 'Critical' and timeToImpact 'Imminent' or 'NearTerm' | THEN a vsom:StrategicReviewCycle SHOULD be triggered | warning |
| BR-MAC-004 | Scenario Set Must Have 3-5 Scenarios | IF a ScenarioSet is created | THEN it MUST contain between 3 and 5 Scenario instances | error |
| BR-MAC-005 | Scenario Set Must Define Two Uncertainties | IF a ScenarioSet is created | THEN uncertaintyAxisX and uncertaintyAxisY MUST be specified | error |
| BR-MAC-006 | Each Scenario Must Assess Strategy | IF strategies are being stress-tested | THEN each Scenario SHOULD have at least one ScenarioStrategyAssessment per strategy | warning |
| BR-MAC-007 | Scenario Probabilities Should Sum to ~1.0 | IF Scenario.probability values specified within a ScenarioSet | THEN sum SHOULD approximately equal 1.0 | warning |
| BR-MAC-008 | Futures Funnel Must Narrow | IF a FuturesFunnel is created | THEN count SHOULD decrease from possible to plausible to probable to preferable | warning |
| BR-MAC-009 | Backcasting Must Start From Vision | IF a BackcastingPlan is created | THEN desiredFutureStateRef MUST reference a valid vsom:VisionComponent @id | error |
| BR-MAC-010 | Backcasting Milestones Must Be Ordered | IF a BackcastingPlan has milestones | THEN milestones MUST have sequenceOrder forming a coherent reverse-chronological chain | error |
| BR-MAC-011 | Milestone Dependencies Must Respect Order | IF BackcastMilestone has dependsOnMilestoneRefs | THEN referenced milestones MUST have earlier targetYear | error |
| BR-MAC-012 | Near-Term Milestones Should Have Initiatives | IF BackcastMilestone has targetYear within 2 years | THEN initiativeRefs SHOULD reference executable okr:Initiative @ids | warning |

### 4.5 PORTFOLIO-ONT (10 rules)

BCG Growth-Share Matrix, Three Horizons, Strategic Investment Maps.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-PFL-001 | BCG Entry Must Have Market Data | IF a GrowthShareEntry is created | THEN relativeMarketShare and marketGrowthRate MUST be specified | error |
| BR-PFL-002 | BCG Quadrant Must Match Data | IF GrowthShareEntry has quadrant specified | THEN quadrant MUST be consistent with market data (Star=high/high, CashCow=high/low, QuestionMark=low/high, Dog=low/low) | error |
| BR-PFL-003 | Three Horizons Investment Must Sum to 100 | IF a ThreeHorizonsModel is created | THEN h1InvestmentPct + h2InvestmentPct + h3InvestmentPct MUST equal 100 | error |
| BR-PFL-004 | Horizon Risk Must Match Horizon | IF a HorizonInitiative is created | THEN riskLevel SHOULD be consistent with horizon (H1=Low/Moderate, H2=Moderate/High, H3=High/VeryHigh) | warning |
| BR-PFL-005 | Investment Map Must Reference VSOM | IF a StrategicInvestmentMap is created | THEN vsomFrameworkRef MUST reference a valid vsom:VSOMFramework @id | error |
| BR-PFL-006 | Portfolio Lens Must Have Direction | IF a PortfolioStrategicLens is created | THEN strategicDirection MUST be specified | error |
| BR-PFL-007 | Strategic Direction Summary Must Reference Layers | IF a StrategicDirectionSummary is created | THEN at least pestelRef OR porterRef OR swotRef SHOULD be populated | warning |
| BR-PFL-008 | Investment Allocation Must Align to Strategy | IF an InvestmentAllocation is created | THEN vsomStrategyRef MUST reference a valid vsom:StrategyComponent @id | error |
| BR-PFL-009 | Star Entries Should Have Investment | IF GrowthShareEntry has quadrant 'Star' | THEN strategicDirection SHOULD be 'InvestGrow' | warning |
| BR-PFL-010 | Dog Entries Should Be Reviewed | IF GrowthShareEntry has quadrant 'Dog' | THEN strategicDirection SHOULD be 'DivestEliminate' or 'Turnaround' with rationale | warning |

---

## 5. PE-Series Business Rules

### 5.1 PPM-ONT (10 rules)

Portfolio, Programme, Project governance and hierarchy.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| ppm:rule-001 | Organisation Required | IF Entity is Portfolio, Programme, Project, PBS, WBS, or Stakeholder | THEN Entity.org_id MUST reference a valid Organisation | error |
| ppm:rule-002 | Valid Org Type | IF Organisation.org_type is set | THEN MUST be one of: platform_owner, client, agency, affiliate | error |
| ppm:rule-003 | Programme Requires Portfolio | IF Programme exists | THEN portfolio_id MUST reference a valid Portfolio | error |
| ppm:rule-004 | PBS Type Consistency | IF PBS.pbs_type = 'platform_product' | THEN platform_product_id SHOULD be set | warning |
| ppm:rule-005 | WBS Effort Estimate Range | IF WBS.wbs_type = 'work_package' | THEN estimated_effort_hours SHOULD be between 8 and 80 | warning |
| ppm:rule-006 | Financial Values in USD | IF financial field is set | THEN value MUST be in USD base currency | error |
| ppm:rule-007 | Dates in ISO 8601 | IF date/datetime field is set | THEN value MUST be in ISO 8601 format with timezone | error |
| ppm:rule-008 | No Circular PBS Hierarchy | IF PBS.parent_pbs_id is set | THEN hierarchy MUST NOT contain circular references | error |
| ppm:rule-009 | No Circular WBS Hierarchy | IF WBS.parent_wbs_id is set | THEN hierarchy MUST NOT contain circular references | error |
| ppm:rule-010 | Localization Via Bridge | IF entity requires localization | THEN localization MUST be applied via localization_bridge_refs, NOT embedded fields | error |

### 5.2 EFS-ONT (11 BR rules + 6 LR rules)

Epic-Features-Stories execution hierarchy and lineage.

**Business Rules:**

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-EFS-001 | Epic Must Have Features | IF efs:Epic exists | THEN COUNT(hasFeature) >= 1 | error |
| BR-EFS-002 | Feature Must Have Stories | IF efs:Feature exists | THEN COUNT(hasStory) >= 1 | error |
| BR-EFS-003 | Story Must Have Persona | IF efs:UserStory exists | THEN forPersona IS NOT NULL | error |
| BR-EFS-004 | Story Must Have Acceptance Criteria | IF efs:UserStory exists | THEN COUNT(storyHasAcceptanceCriteria) >= 1 | error |
| BR-EFS-005 | Epic Must Target Outcome | IF efs:Epic exists | THEN COUNT(targetsOutcome) >= 1 | error |
| BR-EFS-006 | Epic Should Have Hypothesis | IF efs:Epic exists | THEN COUNT(hasHypothesis) >= 1 | warning |
| BR-EFS-007 | Release Must Have Features | IF efs:Release exists | THEN COUNT(includesFeature) >= 1 | error |
| BR-EFS-008 | Sprint Must Have Stories | IF efs:Sprint exists | THEN COUNT(containsStory) >= 1 | error |
| BR-EFS-009 | Benefit Must Have Stakeholder | IF efs:Benefit exists | THEN COUNT(benefitsStakeholder) >= 1 | warning |
| BR-EFS-010 | Dependency Must Link Items | IF efs:Dependency exists | THEN hasDependencySource IS NOT NULL AND hasDependencyTarget IS NOT NULL | error |
| BR-EFS-011 | PPM Epic Traceability | IF efs:Epic.receivesFromPPM exists | THEN ppm:Project reference IS valid AND NOT placeholder | warning |

**Lineage Rules (LR):**

| Rule ID | Name | Rule | Severity |
|---------|------|------|----------|
| LR-001 | Epic Must Link to Pain | IF efs:Epic THEN lineage.addressesPain IS NOT NULL | error |
| LR-002 | Feature Must Link to Gain | IF efs:Feature THEN lineage.deliversGain IS NOT NULL | error |
| LR-003 | Story Must Reference Persona | IF efs:UserStory THEN asA REFERENCES pmf:Persona FROM pmf:ICP | error |
| LR-004 | Pain Must Trace to VP | IF pmf:Pain THEN TRACES_TO vp:ValueProposition | error |
| LR-005 | VP Must Have OKR Context | IF vp:ValueProposition THEN HAS_CONTEXT okr:Objective | error |
| LR-006 | OKR Must Align to VSOM | IF okr:Objective THEN ALIGNS_TO vsom:StrategicObjective | error |

### 5.3 PE-ONT (8 rules)

Process Engineering workflow governance.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| pe:BR-001 | Phase Sequence Validation | IF ProcessPhase has dependsOn relationships | THEN all dependency phases MUST be completed before this phase can begin | error |
| pe:BR-002 | Gate Enforcement | IF ProcessPhase has blocking ProcessGates | THEN all blocking gates MUST pass before phase can complete | error |
| pe:BR-003 | Mandatory Artifact Production | IF ProcessArtifact is marked as mandatory | THEN producing phase MUST NOT complete until artifact is produced and validated | error |
| pe:BR-004 | Metric Threshold Monitoring | IF actual ProcessMetric value falls below threshold | THEN system MUST generate alert and trigger escalation | warning |
| pe:BR-005 | Agent Autonomy Supervision | IF AIAgent has autonomyLevel = 'supervised' | THEN agent outputs MUST require human review before downstream use | error |
| pe:BR-006 | Process Instance Blockers | IF ProcessInstance has blockers | THEN status MUST be 'blocked' until blockers are resolved | error |
| pe:BR-007 | Circular Dependency Prevention | IF phase A dependsOn phase B AND phase B dependsOn phase A | THEN configuration MUST be rejected | error |
| pe:BR-008 | Value Chain Completeness | IF Process is partOfValueChain | THEN all upstream processes in value chain MUST be defined | warning |

### 5.4 DS-ONT (9 rules)

Design token cascade, theme modes, brand variant immutability.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| ds:rule-semantic-must-ref-primitive | SemanticMustReferencePrimitive | IF SemanticToken exists | THEN it MUST have exactly one referencesPrimitive relationship | error |
| ds:rule-component-must-ref-semantic | ComponentMustReferenceSemantic | IF ComponentToken exists | THEN it MUST have exactly one referencesSemantic relationship | error |
| ds:rule-component-tokens-exist | ConsumedTokensMustExist | IF DesignComponent has consumesTokens references | THEN all referenced ComponentTokens MUST exist | error |
| ds:rule-theme-mode-completeness | ThemeModeCompleteness | IF DesignSystem.themeModeSupport = true | THEN all SemanticTokens MUST have both lightModeValue AND darkModeValue | error |
| ds:rule-figma-sync-staleness | FigmaSyncStaleness | IF FigmaSource.lastSyncedAt is older than 7 days | THEN syncStatus MUST be set to 'Stale' | warning |
| ds:rule-brand-must-have-figma | BrandMustHaveFigmaSource | IF BrandVariant exists | THEN it MUST have exactly one hasFigmaSource relationship | error |
| ds:rule-component-should-realise-feature | ComponentShouldRealiseFeature | IF DesignComponent exists | THEN it SHOULD have at least one realizesFeature relationship | warning |
| ds:rule-instance-must-specify-brand | InstanceMustSpecifyBrand | IF DesignSystem has configuredByInstance relationship | THEN referenced InstanceConfiguration MUST specify a valid brandId | warning |
| ds:rule-brand-override-immutability | BrandOverrideImmutability | IF BrandVariant.tokenOverrides contains a token reference | THEN token.mutabilityTier MUST equal 'PF-Instance' (PF-Core tokens are immutable) | error |

### 5.5 EA-CORE-ONT (8 rules)

Enterprise Architecture governance and capability management.

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-CORE-001 | Business Capability Domain Assignment | IF ea-core:BusinessCapability exists | THEN it MUST be referenced by exactly one architecture domain via composedOf | error |
| BR-CORE-002 | Application Capability Realisation | IF ea-core:Application exists | THEN it MUST have at least one realizes relationship to BusinessCapability | error |
| BR-CORE-003 | Architecture Decision Rationale | IF ea-core:ArchitectureDecision exists | THEN it MUST have a non-empty rationale property | error |
| BR-CORE-004 | Capability Gap Progression | IF ea-core:CapabilityGap has currentState and targetState | THEN targetState MUST be greater than currentState | error |
| BR-CORE-005 | Principle Governance Coverage | IF ea-core:ArchitecturePrinciple exists | THEN it MUST have at least one governs relationship | warning |
| BR-CORE-006 | Deprecated Application Replacement | IF ea-core:Application has lifecycleStatus 'Deprecated' | THEN it SHOULD have a dependsOn reference to its replacement | warning |
| BR-CORE-007 | Critical Entity Security Coverage | IF ea-core:EAEntity has businessCriticality 'Critical' | THEN it MUST have at least one securedBy relationship to SecurityArchitecture | error |
| BR-CORE-008 | Roadmap Gap Identification | IF ea-core:ArchitectureRoadmap exists | THEN it MUST have at least one identifiesGap relationship to CapabilityGap | error |

---

## 6. Foundation Series Business Rules

### 6.1 ORG-ONT (4 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-ORG-001 | Unique Organization ID | IF an Organization is created | THEN organizationId MUST be unique across all organizations | error |
| BR-ORG-002 | Competitor Relationship Restriction | IF Organization.type = 'Competitor' | THEN Organization MUST NOT have isClientOf relationship | error |
| BR-ORG-003 | Context Requires Parent Organization | IF an OrganizationContext exists | THEN it MUST have exactly one contextBelongsTo relationship to a valid Organization | error |
| BR-ORG-004 | Active Status for Relationships | IF Organization.status = 'archived' | THEN Organization MUST NOT be domain of isClientOf, isPartnerOf, or isAffiliateOf | warning |

### 6.2 ORG-CONTEXT-ONT (6 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| org-ctx:rule-context-requires-org | ContextRequiresOrganization | IF OrganizationContext exists | THEN organizationRef IS NOT NULL | error |
| org-ctx:rule-competitor-limit | CompetitorLimit | IF CompetitiveLandscape exists | THEN COUNT(hasCompetitors) <= 10 | warning |
| org-ctx:rule-maturity-scores-range | MaturityScoresRange | IF OrganizationMaturity exists | THEN all maturity levels BETWEEN 1 AND 5 | error |
| org-ctx:rule-vp-reference-only | ValuePropositionReferenceOnly | IF hasValueProposition exists | THEN vsom:ValueProposition reference IS valid AND NOT inline definition | error |
| org-ctx:rule-brand-must-be-named | BrandMustBeNamed | IF Brand exists | THEN brandName IS NOT NULL | error |
| org-ctx:rule-segment-should-have-needs | SegmentShouldHaveNeeds | IF MarketSegment exists | THEN COUNT(segmentHasNeed) >= 1 | warning |

### 6.3 ORG-MAT-ONT (8 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-MAT-001 | Profile Requires Dimension Scores | IF MaturityProfile is created | THEN it MUST have at least one hasDimensionScore relationship | error |
| BR-MAT-002 | Dimension Score Range | IF DimensionScore has numericScore | THEN numericScore MUST be between 1.0 and 5.0 | error |
| BR-MAT-003 | Weight Range | IF DimensionScore has weight | THEN weight MUST be between 0.0 and 1.0 | error |
| BR-MAT-004 | Assessment Date Required | IF MaturityProfile is created | THEN assessmentDate MUST be specified | error |
| BR-MAT-005 | Level Score Consistency | IF DimensionScore has both maturityLevel and numericScore | THEN maturityLevel SHOULD correspond to score range | warning |
| BR-MAT-006 | Core Dimensions Recommended | IF MaturityProfile for comprehensive assessment | THEN SHOULD include SizeProfile, SectorProfile, GeographyProfile, and at least 3 maturity dimensions | info |
| BR-MAT-007 | Evidence for High Scores | IF DimensionScore has numericScore >= 4.0 | THEN evidence SHOULD be provided | warning |
| BR-MAT-008 | NPS Score Range | IF CustomerExperienceMaturity has npsScore | THEN npsScore MUST be between -100 and 100 | error |

### 6.4 GA-ONT (8 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| ga:rule-gap-evidence-required | GapEvidenceRequired | IF ga:IdentifiedGap exists | THEN COUNT(hasEvidence) >= 1 | error |
| ga:rule-threat-risk-score | ThreatRiskScoreCalculation | IF ThreatAssessment.probability AND impact ARE SET | THEN riskScore MUST EQUAL probability * impact | error |
| ga:rule-low-confidence-escalation | LowConfidenceEscalation | IF IdentifiedGap.confidence < 0.6 | THEN flag for human review with escalation note | warning |
| ga:rule-recommendation-linkage | RecommendationLinkageRequired | IF Recommendation exists | THEN at least one of addressesGap, addressesThreat, or enablesOpportunity MUST exist | error |
| ga:rule-minimum-comparative-entities | MinimumComparativeEntities | IF GapAnalysisReport.analysisType = 'comparative' | THEN entityCount >= 3 | error |
| ga:rule-priority-matrix-weights | PriorityMatrixWeightsSum | IF PriorityMatrix weights ARE SET | THEN weightImpact + weightEffort + weightUrgency + weightAlignment = 1.0 | error |
| ga:rule-strategic-alignment-high-priority | StrategicAlignmentForHighPriority | IF Recommendation.priority IN ['critical', 'high'] | THEN alignsToObjective relationship SHOULD exist | warning |
| ga:rule-executive-summary-completeness | ExecutiveSummaryCompleteness | IF ExecutiveSummary exists | THEN keyFindings AND recommendedNextSteps MUST have at least one item each | error |

---

## 7. RCSG-Series Business Rules

### 7.1 RCSG-FW-ONT (4 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-RCSG-001 | RCSG Context Requires Coverage | IF an RCSGContext is created | THEN it MUST have at least one RegulatoryRequirement or ComplianceFramework | error |
| BR-RCSG-002 | Regulatory Requirement Requires Jurisdiction | IF a RegulatoryRequirement is created | THEN jurisdictions MUST be specified | error |
| BR-RCSG-003 | Certified Framework Requires Expiry | IF ComplianceFramework has certificationStatus of Certified | THEN certificationExpiry MUST be specified | warning |
| BR-RCSG-004 | Governance Model Requires Type | IF a GovernanceModel is created | THEN governanceType MUST be specified | error |

### 7.2 RMF-IS27005-ONT (10 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-RMF-001 | Risk Requires Owner | IF a Risk is identified | THEN it MUST have exactly one ownedByRiskOwner relationship | error |
| BR-RMF-002 | Risk Must Reference Asset | IF a Risk exists | THEN it MUST have at least one affectsAsset relationship | error |
| BR-RMF-003 | Risk Requires Threat And Vulnerability | IF a Risk is assessed | THEN it MUST link to at least one Threat AND at least one Vulnerability | error |
| BR-RMF-004 | High Risk Must Have Treatment | IF Risk has inherentRiskLevel of high or critical | THEN it MUST have at least one treatedBy relationship with strategy other than accept | error |
| BR-RMF-005 | Treatment Must Implement Controls | IF RiskTreatment has treatmentStrategy of mitigate | THEN it MUST have at least one implementsControl relationship | error |
| BR-RMF-006 | Assessment Requires Context | IF a RiskAssessment is created | THEN it MUST have exactly one assessesContext relationship to a RiskContext | error |
| BR-RMF-007 | Assessment Requires Monitoring Plan | IF RiskAssessment status is completed | THEN it MUST have hasMonitoringPlan with status active | warning |
| BR-RMF-008 | Risk Evaluation Criteria Required | IF a Risk is evaluated | THEN it MUST be evaluatedAgainst a RiskCriteria | error |
| BR-RMF-009 | Compliance Mapping For Regulated Risks | IF RiskContext has regulatoryEnvironment defined | THEN Risks SHOULD have mappedToCompliance relationship | warning |
| BR-RMF-010 | Risk Acceptance Requires Approval | IF RiskTreatment has treatmentStrategy of accept | THEN RiskOwner MUST have authorityLevel of senior-management or executive | error |

### 7.3 GDPR-ONT (6 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| gdpr:rule-lawful-basis-required | LawfulBasisRequired | IF processing personal data | THEN at least one gdpr:LawfulBasis must apply | error |
| gdpr:rule-special-category-conditions | SpecialCategoryConditions | IF processing SpecialCategoryData | THEN both Article 6 basis AND Article 9 condition must apply | error |
| gdpr:rule-breach-notification-72h | BreachNotification72Hours | IF personal data breach detected AND risk to rights | THEN notify supervisory authority within 72 hours | error |
| gdpr:rule-dpia-high-risk | DPIAHighRisk | IF processing likely to result in high risk | THEN conduct DPIA before processing | error |
| gdpr:rule-respond-dsar-1-month | RespondDSAR1Month | IF DataSubjectRight request received | THEN respond within 1 month (extendable by 2 months for complex) | error |
| gdpr:rule-transfer-safeguards | TransferSafeguards | IF transferring personal data outside EEA/UK | THEN TransferMechanism must be in place | error |

### 7.4 PII-ONT (8 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| pii:rule-critical-pii-blocked | CriticalPIIBlocking | IF PIIEntityType.riskLevel = 'CRITICAL' | THEN PIIProtectionAction = 'BLOCKED' | error |
| pii:rule-highly-confidential-blocked | HighlyConfidentialBlocking | IF SensitivityLabel.labelName = 'Highly-Confidential' | THEN PIIProtectionAction = 'BLOCKED' | error |
| pii:rule-uk-residency-required | UKDataResidencyRequired | IF DataResidencyRegion.dataProtectionLaw = 'UK-GDPR' | THEN AzureOpenAIDeployment.ukDataResidency = true | error |
| pii:rule-no-training-data | NoTrainingDataUsage | IF AzureOpenAIDeployment exists | THEN dataUsedForTraining = false | error |
| pii:rule-output-scan-required | OutputScanRequired | IF PIIProtectedWorkflow.step = 'AI Completion' | THEN nextStep = 'Output Scan' | error |
| pii:rule-audit-logging-required | AuditLoggingRequired | IF PIIEntityType detected | THEN create PIIAuditLog record with hash (no raw PII) | error |
| pii:rule-rls-tenant-isolation | RLSTenantIsolation | IF AzureSQLGraphNode.hasPIIColumns = true | THEN rlsEnabled = true | error |
| pii:rule-admin-consent-high-exposure | AdminConsentHighExposure | IF MicrosoftGraphAPIScope.piiExposure = 'HIGH' | THEN consentType = 'Admin' | error |

### 7.5 MCSB-ONT (10 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| mcsb:BR-001 | Domain Code Uniqueness | IF ControlDomain exists | THEN domainCode MUST be unique across all instances | error |
| mcsb:BR-002 | Control Domain Assignment | IF SecurityControl exists | THEN it MUST have exactly one belongsToDomain relationship | error |
| mcsb:BR-003 | Compliance Mapping Completeness | IF SecurityControl exists | THEN it MUST have at least one hasComplianceMapping relationship | error |
| mcsb:BR-004 | Responsibility Assignment Required | IF SecurityControl exists | THEN it MUST have exactly one hasResponsibility relationship | error |
| mcsb:BR-005 | Joint Responsibility Actions | IF ResponsibilityAssignment has responsibilityType 'Joint' | THEN both clientActions AND providerActions MUST be defined | error |
| mcsb:BR-006 | NonCompliant Gap Documentation | IF ControlAssessment has assessmentStatus 'NonCompliant' | THEN implementationGaps MUST contain at least one gap description | error |
| mcsb:BR-007 | Gap Remediation Priority | IF ControlAssessment has non-empty implementationGaps | THEN remediationPriority MUST be defined | error |
| mcsb:BR-008 | Guidance Platform Assignment | IF ImplementationGuidance exists | THEN it SHOULD have guidanceForPlatform to a CloudPlatform | warning |
| mcsb:BR-009 | Control ID Format Validation | IF SecurityControl exists | THEN controlId MUST match pattern ^[A-Z]{2}-\d{1,2}$ | error |
| mcsb:BR-010 | Security Architecture Coverage | IF SecurityControl exists | THEN it SHOULD have appliesTo relationship to SecurityArchitecture | warning |

---

## 8. Orchestration Business Rules

### 8.1 EMC-ONT (15 rules)

Enterprise Model Composition — orchestration hub connecting all 5 series, with graph-scope rules for PFI data slicing (v5.0.0).

#### 8.1.1 Composition Rules (8 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| emc:rule-foundation-always-required | FoundationAlwaysRequired | IF OntologyComposition is created | THEN requiredOntologies MUST include org:Organisation | error |
| emc:rule-dependency-chain-resolution | DependencyChainResolution | IF ontology X is in requiredOntologies | THEN all ontologies in X.dependencies MUST also be included | error |
| emc:rule-category-minimum-ontologies | CategoryMinimumOntologies | IF RequirementCategory is specified | THEN requiredOntologies.length >= 1 | error |
| emc:rule-pfi-requires-product | PFIRequiresProductContext | IF ContextLevel = PFI | THEN ScopingDimension-ProductContext MUST be specified | error |
| emc:rule-maturity-filter | MaturityBasedFiltering | IF ScopingDimension-OrgContext.maturityLevel < 3 | THEN exclude advanced ontologies (KPI-ONT, GA-ONT) | warning |
| emc:rule-rcsg-governance-overlay | RCSGGovernanceOverlay | IF RequirementCategory.categoryCode = COMPLIANCE | THEN activate OntologySeries-RCSG with MCSB and GDPR | warning |
| emc:rule-enterprise-all-series | EnterpriseAllSeries | IF RequirementCategory.categoryCode = ENTERPRISE | THEN activeSeries MUST include all 5 series | error |
| emc:rule-agent-role-bridge | AgentRoleBridgeRequired | IF RequirementCategory = AGENTIC AND ContextLevel = PFI | THEN pe:AIAgent MUST have agentActsAs + agentGovernedBy | error |

#### 8.1.2 Graph-Scope Rules (7 rules, added v5.0.0)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| emc:rule-scope-rule-requires-condition | ScopeRuleRequiresCondition | IF GraphScopeRule is created | THEN MUST have >= 1 ScopeCondition | error |
| emc:rule-scope-rule-requires-action | ScopeRuleRequiresAction | IF GraphScopeRule is created | THEN MUST have exactly 1 ScopeAction | error |
| emc:rule-scope-priority-unique | ScopePriorityUnique | IF GraphScopeRule in InstanceConfiguration | THEN priority MUST be unique within that instance | error |
| emc:rule-include-before-exclude | IncludeBeforeExclude | IF same-priority scope rules conflict | THEN include-data SHOULD evaluate before exclude-data | warning |
| emc:rule-product-match-valid | ProductMatchValid | IF ScopeCondition.conditionType = product-match | THEN conditionValue MUST reference valid org-ctx:Product | error |
| emc:rule-composed-graph-not-empty | ComposedGraphNotEmpty | IF ComposedGraphSpec evaluated with scope rules | THEN resolved entity set MUST NOT be empty | error |
| emc:rule-snapshot-immutable | SnapshotImmutable | IF CanonicalSnapshot.changeControlStatus = locked | THEN snapshot MUST NOT be modified; new version required | error |

---

## 9. Competitive Series Business Rules (Deprecated)

These ontologies are in `_orphans/Competitive-deprecated/` but retain business rules for reference.

### 9.1 CA-ONT (6 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-CA-001 | Minimum Competitor Assessments | IF CompetitiveAnalysis is created | THEN it MUST have at least 3 hasCompetitorAssessment relationships | warning |
| BR-CA-002 | Blue Ocean Qualification | IF BlueOceanOpportunity is classified as true blue ocean | THEN competitiveBarriers MUST be 'Low' or 'None' | error |
| BR-CA-003 | Threat Level for Direct Competitors | IF CompetitorAssessment has competitorType 'Direct' | THEN threatLevel MUST be specified | error |
| BR-CA-004 | Analysis Must Reference Target Org | IF CompetitiveAnalysis is created | THEN targetOrgRef MUST reference a valid org:Organization | error |
| BR-CA-005 | Competitive Position Requires Org | IF CompetitivePosition is defined | THEN organizationRef MUST reference a valid org:Organization | error |
| BR-CA-006 | Landscape Context Recommended | IF CompetitiveAnalysis for comprehensive assessment | THEN it SHOULD have analysisUsesLandscape relationship to CL-ONT | info |

### 9.2 CL-ONT (8 rules)

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| BR-CL-001 | Landscape Requires Context Bridge | IF CompetitiveLandscape is created | THEN it MUST have exactly one landscapeBelongsToContext relationship | error |
| BR-CL-002 | Minimum Segments Required | IF CompetitiveLandscape is defined | THEN it MUST have at least one hasSegment relationship | error |
| BR-CL-003 | Minimum Competitors Required | IF CompetitiveLandscape for competitive analysis | THEN it MUST have at least 3 hasCompetitorProfile relationships | warning |
| BR-CL-004 | Competitor Must Reference Organization | IF CompetitorProfile is created | THEN competitorOrgRef MUST reference a valid org:Organization @id | error |
| BR-CL-005 | Competitor Segment Coverage | IF CompetitorProfile is defined | THEN it MUST have at least one competitorOperatesIn relationship | error |
| BR-CL-006 | Blue Ocean Low Barriers | IF StrategicOpportunity has opportunityType 'Blue-Ocean' | THEN competitiveBarriers MUST be 'None' or 'Low' | error |
| BR-CL-007 | High Threat Requires Evidence | IF CompetitorProfile has threatLevel 'Critical' or 'High' | THEN strategicIntent and keyDifferentiators SHOULD be populated | warning |
| BR-CL-008 | Landscape Validity Period | IF CompetitiveLandscape has validFrom date older than 12 months | THEN landscape SHOULD be flagged for reassessment | warning |

---

## 10. Cross-Ontology Application Rules (AR-\*)

These rules are **new** — they govern how ontologies interact across series boundaries. They do not exist in individual ontology JSONs; they are defined here as the authoritative cross-ontology contract.

### 10.1 AR-LINEAGE: Strategy-to-Execution Lineage

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| AR-LINEAGE-001 | End-to-End Traceability | IF VSOM → OKR → VP → PMF → EFS chain exists | THEN the full chain MUST be traceable end-to-end via cross-ontology references | error |
| AR-LINEAGE-002 | Epic Strategic Lineage | IF efs:Epic exists in an active backlog | THEN it MUST trace to at least one vsom:StrategicObjective via the lineage chain | error |
| AR-LINEAGE-003 | Lineage Break Detection | IF a lineage link is missing between adjacent layers | THEN the gap MUST be flagged as WARNING in validation | warning |
| AR-LINEAGE-004 | VP-Story Semantic Consistency | IF vp:Benefit.description exists AND efs:UserStory.soThat exists | THEN benefit language and story value clause SHOULD maintain semantic consistency | warning |

### 10.2 AR-XREF: Cross-Ontology Reference Integrity

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| AR-XREF-001 | Valid Namespace Prefixes | IF a cross-ontology reference uses a namespace prefix | THEN the prefix MUST be a valid registered prefix in the ontology library | error |
| AR-XREF-002 | Referenced Entity Must Exist | IF a cross-ontology reference targets entity X in ontology Y | THEN entity X MUST exist in the current version of ontology Y | error |
| AR-XREF-003 | No Circular Cross-References | IF ontology A references ontology B AND ontology B references ontology A | THEN the circular reference MUST NOT create an infinite resolution loop | error |
| AR-XREF-004 | Deprecated Ontology Warning | IF a cross-ontology reference targets a deprecated or archived ontology | THEN the reference MUST trigger WARNING during validation | warning |

### 10.3 AR-SA: Strategy Analysis Cross-Rules

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| AR-SA-001 | Portfolio Capstone Must Reference Layers | IF pfl:StrategicDirectionSummary is created | THEN it MUST reference at least 3 of the 4 upstream SA layers (BSC, INDUSTRY, REASON, MACRO) | error |
| AR-SA-002 | Synthesis Multi-Layer Evidence | IF rsn:AnalysisSynthesis is created | THEN it MUST consider evidence from at least 2 SA layers | error |
| AR-SA-003 | BSC-VSOM Alignment | IF bsc:BSCObjective exists | THEN it MUST align to a vsom:StrategicObjective via vsomObjectiveRef (already enforced by BR-BSC-011) | error |

### 10.4 AR-PE: PPM-EFS Alignment Contract

**This section formalises the governance-to-execution bridge between PPM and EFS.**

PPM defines the **governance layer**: Portfolio → Programme → Project → PBS/WBS.
EFS defines the **execution layer**: Epic → Feature → Story → Task.
Bridge: `ppm:Project` → `efs:Epic` via `receivesFromPPM` (1:n).

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| AR-PE-001 | Valid PPM Reference | IF efs:Epic has receivesFromPPM reference | THEN the reference MUST point to a valid ppm:Project @id | error |
| AR-PE-002 | PPM Status Propagation | IF ppm:Project status changes to 'On Hold' or 'Cancelled' | THEN linked efs:Epic entities MUST be flagged for status review | warning |
| AR-PE-003 | PBS-Feature Traceability | IF efs:Feature reaches status 'Done' | THEN it SHOULD trace to a ppm:PBS item for deliverable tracking | warning |
| AR-PE-004 | WBS-Sprint Execution Mapping | IF ppm:WBS work packages exist for a project | THEN they SHOULD map to efs:Sprint/Task execution for resource tracking | warning |

**Entity Mapping:**

| PPM Entity | EFS Entity | Relationship | Cardinality | Boundary |
|-----------|-----------|--------------|-------------|----------|
| ppm:Portfolio | — | — | — | PPM owns portfolio governance |
| ppm:Programme | — | — | — | PPM owns programme governance |
| ppm:Project | efs:Epic | receivesFromPPM | 1:n | Bridge: PPM→EFS |
| ppm:PBS | efs:Feature | traces to | n:m | Deliverable traceability |
| ppm:WBS | efs:Sprint/Task | maps to | n:m | Execution mapping |

### 10.5 AR-RCSG: Compliance Cross-Rules

| Rule ID | Name | Condition | Action | Severity |
|---------|------|-----------|--------|----------|
| AR-RCSG-001 | Controls Must Reference Framework | IF mcsb:SecurityControl or pii:ComplianceFramework exists | THEN it MUST trace to a rcsg-fw:ComplianceFramework or RegulatoryRequirement | error |
| AR-RCSG-002 | Risk-Project Linkage | IF rmf:Risk affects an asset used by a ppm:Project | THEN the RiskAssessment SHOULD link to the affected Project | warning |

---

## 11. EFS-PPM Alignment Detail

### Governance vs Execution Boundary

| Concern | Owned By | Description |
|---------|----------|-------------|
| Portfolio strategy & investment allocation | PPM | Which programmes/projects get funded |
| Programme governance & benefits realisation | PPM | Cross-project coordination and benefits tracking |
| Project delivery governance | PPM | Project status, milestones, risk, budget |
| PBS/WBS work decomposition | PPM | What must be delivered and work breakdown |
| Epic-level scope & hypothesis | EFS | What value is being built and why |
| Feature/Story execution | EFS | How the work is implemented |
| Sprint/Task planning | EFS | Day-to-day execution cadence |
| Lineage traceability | EFS (LR rules) | Strategy→Epic→Feature→Story chain |

### Status Propagation Rules

| PPM Status Change | EFS Impact | Rule |
|-------------------|------------|------|
| Project → On Hold | Linked Epics flagged for review | AR-PE-002 |
| Project → Cancelled | Linked Epics MUST be moved to Cancelled or re-assigned | AR-PE-002 |
| Project → Completed | Linked Epics SHOULD be at Done or Closed | AR-PE-002 |
| PBS item updated | Linked Features validated for coverage | AR-PE-003 |

### Validation Checklist

- [ ] Every EFS Epic with `receivesFromPPM` references a valid PPM Project
- [ ] PPM Project status changes are reflected in linked EFS Epics
- [ ] Completed Features trace to PBS items
- [ ] WBS work packages have corresponding Sprint/Task execution
- [ ] LR-001 through LR-006 pass for all active Epics

---

## 12. Rule Enforcement

### Enforcement Layers

| Layer | Enforcement Point | Rules Applied |
|-------|-------------------|---------------|
| Ontology Loading | Parser validates individual ontology JSON | BR-\* rules within each ontology |
| Cross-Ontology Graph | Graph builder validates references | AR-XREF-\* rules |
| Lineage View | On-demand lineage validation | LR-\* and AR-LINEAGE-\* rules |
| Validation Panel | UI displays violations with severity badges | All rules with severity |
| AI Agent Traversal | Agents check rules during graph traversal | BR-\* and AR-\* rules relevant to current analysis |

### Severity Badges

| Badge | Severity | Meaning |
|-------|----------|---------|
| `error` | Mandatory | Blocks validation pass |
| `warning` | Recommended | Advisory notice, does not block |
| `info` | Best practice | Informational only |

---

## 13. Rule Index

Complete catalogue of all rules across the ontology library.

| # | Rule ID | Ontology | Series | Name | Severity |
|---|---------|----------|--------|------|----------|
| 1 | BR-VSOM-001 | VSOM-ONT | VE | VSOM Framework Completeness | error |
| 2 | BR-VSOM-002 | VSOM-ONT | VE | Framework Organization Reference | error |
| 3 | BR-VSOM-003 | VSOM-ONT | VE | Objective Must Have Deadline | error |
| 4 | BR-VSOM-004 | VSOM-ONT | VE | Metric Must Have Target | warning |
| 5 | BR-VSOM-005 | VSOM-ONT | VE | Strategy Alignment | error |
| 6 | BR-VSOM-006 | VSOM-ONT | VE | Objective Tracking | error |
| 7 | BR-VSOM-007 | VSOM-ONT | VE | Impact-Outcome-Value Chain | warning |
| 8 | BR-VSOM-008 | VSOM-ONT | VE | Review Cycle Requires Landscape | warning |
| 9 | BR-VSOM-009 | VSOM-ONT | VE | Major Strategy Change Requires Review | error |
| 10 | BR-VSOM-010 | VSOM-ONT | VE | Metric Breach Requires Review | warning |
| 11 | okr:rule-001 | OKR-ONT | VE | ObjectiveKeyResultsCount | error |
| 12 | okr:rule-002 | OKR-ONT | VE | KeyResultTargetDiffers | error |
| 13 | okr:rule-003 | OKR-ONT | VE | KeyResultWeightsSum | warning |
| 14 | okr:rule-004 | OKR-ONT | VE | ObjectiveTimePeriodRequired | error |
| 15 | okr:rule-005 | OKR-ONT | VE | ProgressFromKeyResults | warning |
| 16 | okr:rule-006 | OKR-ONT | VE | AlignmentCascadeRequired | warning |
| 17 | okr:rule-007 | OKR-ONT | VE | CheckInCadenceRequired | warning |
| 18 | okr:rule-008 | OKR-ONT | VE | InitiativeLinksKeyResult | error |
| 19–40 | BR-VP-001–022 | VP-ONT | VE | Value Proposition rules (22) | mixed |
| 41–48 | BR-RRR-001–008 | RRR-ONT | VE | Roles/RACI rules (8) | mixed |
| 49–58 | BR-PMF-001–010 | PMF-ONT | VE | PMF rules (10) | mixed |
| 59–70 | BR-001–012 | KPI-ONT | VE | KPI/VE rules (12) | mixed |
| 71–85 | BR-BSC-001–015 | BSC-ONT | VE-SA | BSC rules (15) | mixed |
| 86–100 | BR-IND-001–015 | INDUSTRY-ONT | VE-SA | Industry rules (15) | mixed |
| 101–115 | BR-RSN-001–015 | REASON-ONT | VE-SA | Reasoning rules (15) | mixed |
| 116–127 | BR-MAC-001–012 | MACRO-ONT | VE-SA | Macro env rules (12) | mixed |
| 128–137 | BR-PFL-001–010 | PORTFOLIO-ONT | VE-SA | Portfolio rules (10) | mixed |
| 138–147 | ppm:rule-001–010 | PPM-ONT | PE | PPM governance rules (10) | mixed |
| 148–158 | BR-EFS-001–011 | EFS-ONT | PE | EFS execution rules (11) | mixed |
| 159–164 | LR-001–006 | EFS-ONT | PE | Lineage rules (6) | error |
| 165–172 | pe:BR-001–008 | PE-ONT | PE | Process rules (8) | mixed |
| 173–181 | ds:rule-* | DS-ONT | PE | Design system rules (9) | mixed |
| 182–189 | BR-CORE-001–008 | EA-CORE-ONT | PE | EA rules (8) | mixed |
| 190–193 | BR-ORG-001–004 | ORG-ONT | Foundation | Org rules (4) | mixed |
| 194–199 | org-ctx:rule-* | ORG-CONTEXT-ONT | Foundation | Context rules (6) | mixed |
| 200–207 | BR-MAT-001–008 | ORG-MAT-ONT | Foundation | Maturity rules (8) | mixed |
| 208–215 | ga:rule-* | GA-ONT | Foundation | Gap Analysis rules (8) | mixed |
| 216–219 | BR-RCSG-001–004 | RCSG-FW-ONT | RCSG | Framework rules (4) | mixed |
| 220–229 | BR-RMF-001–010 | RMF-IS27005-ONT | RCSG | Risk management rules (10) | mixed |
| 230–235 | gdpr:rule-* | GDPR-ONT | RCSG | GDPR rules (6) | error |
| 236–243 | pii:rule-* | PII-ONT | RCSG | PII governance rules (8) | mixed |
| 244–253 | mcsb:BR-001–010 | MCSB-ONT | RCSG | Security benchmark rules (10) | mixed |
| 254–268 | emc:rule-* | EMC-ONT | Orchestration | Orchestration rules (15: 8 composition + 7 graph-scope) | mixed |
| 261–266 | BR-CA-001–006 | CA-ONT | Competitive* | Analysis rules (6) | mixed |
| 267–274 | BR-CL-001–008 | CL-ONT | Competitive* | Landscape rules (8) | mixed |
| 275–278 | AR-LINEAGE-001–004 | — | Cross-ontology | Lineage application rules (4) | mixed |
| 279–282 | AR-XREF-001–004 | — | Cross-ontology | Reference integrity rules (4) | mixed |
| 283–285 | AR-SA-001–003 | — | Cross-ontology | Strategy Analysis rules (3) | mixed |
| 286–289 | AR-PE-001–004 | — | Cross-ontology | PPM-EFS alignment rules (4) | mixed |
| 290–291 | AR-RCSG-001–002 | — | Cross-ontology | Compliance cross-rules (2) | mixed |

**Total: 298 rules** (281 BR/LR from ontology JSONs + 17 AR cross-ontology rules)

\* Competitive series is deprecated (`_orphans/`)

---

## 14. Related Documentation

| Document | Path | Purpose |
|----------|------|---------|
| [DESIGN-SYSTEM-SPEC.md](../TOOLS/ontology-visualiser/DESIGN-SYSTEM-SPEC.md) | DR-\* design rules | Visual/UI equivalent of this document |
| [EFS-ONTOLOGY-SPEC.md](./PE-Series/EFS-ONT/EFS-ONTOLOGY-SPEC.md) | EFS module specification | Detailed EFS entity/module documentation |
| [EFS-Lineage-Specification-v3.0.0.md](./PE-Series/EFS-ONT/EFS-Lineage-Specification-v3.0.0.md) | 5-layer lineage model | LR-001 through LR-006 source specification |
| [Series/Sub-Series Design Strategy](../TOOLS/ontology-visualiser/BRIEFING-Series-SubSeries-Design-Strategy.md) | Tier model and sub-series pattern | Visual hierarchy and DP-SERIES principles |
| [VSOM-SA Strategy Analysis Briefing](./VE-Series/VSOM-SA/BRIEFING-VSOM-Strategy-Analysis.md) | SA architecture and AI agent traversal | 5-layer SA framework and cross-ontology bridges |
| [VSOM-SC Strategy Communication Briefing](./VE-Series/VSOM-SC/BRIEFING-VSOM-Strategy-Communication.md) | SC architectural patterns | Communication patterns and templates |
| Individual ontology JSON files | `<Series>/<Ontology>-ONT/*.json` | Source of truth for BR rules |

---

## 15. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-13 | Initial release — 274 BR/LR rules catalogued from 22 ontologies, 17 new AR cross-ontology rules defined, EFS-PPM alignment contract formalised |

---

*This document is the authoritative reference for all business rules and application logic across the Azlan Ontology Library. Individual ontology JSON files remain the source of truth for BR rules; this document catalogues, cross-references, and extends them with AR application rules.*
