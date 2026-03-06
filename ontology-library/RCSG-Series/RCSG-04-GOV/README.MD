# RCSG-04-GOV — Governance Domain

Governance owns the RCSG-FW framework hub, manages all inter-domain relationships (Risk, Compliance, Security), and models published cyber governance codes with board-level actions and cross-framework mappings.

## RCSG-FW-ONT v2.0.0 (Framework Hub + Cyber Governance)

Unified RCSG framework ontology combining the abstract R-C-S-G context layer with the NCSC/DSIT Cyber Governance Code of Practice.

### Framework Entities (Original)

- **RCSGContext** — Top-level RCSG profile with compliance posture, primary regulator, data classification
- **RegulatoryRequirement** — Specific regulation with enforcement body, jurisdiction, penalty risk
- **ComplianceFramework** — Framework certification (ISO27001, SOC2, PCI-DSS, MCSB) with scope and expiry
- **GovernanceModel** — Central governance node: board composition, committee structures, policy frameworks

### Governance Code Entities (Merged from CG-ONT)

- **GovernanceCode** — Published governance code, standard, or guide with principles and board-level actions
- **GovernancePrinciple** — High-level governance principle (5 from NCSC Code: Risk Management, Cyber Strategy, People, Incident Planning, Assurance & Oversight)
- **GovernanceAction** — Specific board-level action (22 from NCSC Code: A1-E4) with dependency chains
- **GovernanceGlossaryTerm** — Defined term from governance code glossary (12 terms)
- **GovernanceActionMapping** — Cross-framework mapping to external standard controls (150 mappings across 9 frameworks)

### Key Design: Central Governance Node

GovernanceModel connects directly to GovernanceCode via `hasGovernanceCode`, making governance codes first-class children of the governance model rather than separate spoke ontologies.

### Cross-Framework Mappings (9 Standards)

NCSC CAF v4.0, COBIT 2019, NIST CSF, IASME Cyber Assurance, ISA Directors Handbook 2023, ANSSI 14-Step, ISO 27001:2022, CMMI V3.0, WEF Cyber Governance

### Bridges

- **CTX**: 4 cross-ontology bridges (GeoContext, FunctionalMaturity, MarketClassification, ITMaturity)
- **GDPR/MCSB/PII**: 3 implementation bridges
- **NCSC-CAF**: 2 bridges (GovernanceAction → CAFPrinciple, ContributingOutcome)
- **ORG**: 1 bridge (GovernanceCode → Organization via publishedByAuthority)

### Scope

Three lines of defence, policy lifecycle, risk appetite governance, board oversight, cyber governance codes, cross-framework compliance alignment
