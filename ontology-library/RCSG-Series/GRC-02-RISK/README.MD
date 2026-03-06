# GRC-02-RISK — Risk Domain

Enterprise Risk Management domain within the GRC hub-spoke architecture.

**Hub:** GRC-FW-ONT v3.0.0 (GRC-01-GOV)
**Governed by:** GovernanceFramework → governsRisk → erm:RiskRegister

## Tier Architecture

| Tier | Ontology | Standard | Entities |
|------|----------|----------|----------|
| 1 | ERM-ONT v1.0.0 | ISO 31000:2018 | RiskRegister, Risk, RiskAppetite, Control, ResilienceCapability, RiskAssessment |
| 2 | RMF-IS27005-ONT v1.0.0 | ISO 27005 | RiskContext, Asset, Threat, Vulnerability, Risk, RiskAssessment, RiskTreatment, Control, RiskOwner, RiskCriteria, ComplianceMapping, RiskMonitoringPlan |

## Cross-Series Bridges

- **UP**: erm:RiskRegister → governedBy → grc-fw:GRCContext
- **DOWN**: erm:Risk → specialisedByInfoSecRisk → rmf:Risk
- **ACROSS**: erm:Control → controlAlignsToBenchmark → mcsb:SecurityControl
- **ACROSS**: erm:RiskRegister → assessedByCAFOutcome → ncsc-caf:ContributingOutcome
- **VSEM**: erm:Risk → riskThreatsObjective → vsom:StrategicObjective
