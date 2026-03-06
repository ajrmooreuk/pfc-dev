// ============================================================
// Quantum Lane AI — Cyber Risk Assessment Graph Schema
// Target: Neo4j 5.x with APOC
// Integration: OneLake via Neo4j Connector for Fabric
// ============================================================
//
// CROSS-REFERENCES:
// - Epic 18 (F18.1): Template for all ontology Cypher generation
//   See: PBS/PROPOSALS/Epic-18-Neo4j-PowerPlatform-Productisation-Proposal-v1.0.0.md
//   Sections: §2.1 (Assets We Can Leverage), §3.2 (OAA v6 → Cypher Mapping Rules)
// - Epic 18 (F18.2 S18.2.2): Loaded as baseline schema into Neo4j AuraDB
// - Epic 18 (§3.3): Power Platform views (lines 258-273) reused in Fabric pipeline
// - Epic 34 (S1): Neo4j-ready graph patterns — #518
// ============================================================

// --- CONSTRAINTS & INDEXES ---

CREATE CONSTRAINT threat_actor_id IF NOT EXISTS
FOR (ta:ThreatActor) REQUIRE ta.id IS UNIQUE;

CREATE CONSTRAINT attack_technique_id IF NOT EXISTS
FOR (at:AttackTechnique) REQUIRE at.mitreId IS UNIQUE;

CREATE CONSTRAINT vulnerability_id IF NOT EXISTS
FOR (v:Vulnerability) REQUIRE v.cveId IS UNIQUE;

CREATE CONSTRAINT asset_id IF NOT EXISTS
FOR (a:InformationAsset) REQUIRE a.id IS UNIQUE;

CREATE CONSTRAINT control_id IF NOT EXISTS
FOR (c:SecurityControl) REQUIRE c.id IS UNIQUE;

CREATE CONSTRAINT requirement_id IF NOT EXISTS
FOR (r:ComplianceRequirement) REQUIRE r.requirementId IS UNIQUE;

CREATE CONSTRAINT risk_scenario_id IF NOT EXISTS
FOR (rs:RiskScenario) REQUIRE rs.id IS UNIQUE;

CREATE CONSTRAINT sector_id IF NOT EXISTS
FOR (s:IndustrySector) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT engagement_id IF NOT EXISTS
FOR (e:AssessmentEngagement) REQUIRE e.id IS UNIQUE;

// Full-text indexes for search
CREATE FULLTEXT INDEX asset_search IF NOT EXISTS
FOR (a:InformationAsset) ON EACH [a.name, a.description];

CREATE FULLTEXT INDEX control_search IF NOT EXISTS
FOR (c:SecurityControl) ON EACH [c.name, c.description, c.iso27002Control];

CREATE FULLTEXT INDEX requirement_search IF NOT EXISTS
FOR (r:ComplianceRequirement) ON EACH [r.requirementText, r.framework];

// Composite indexes for common queries
CREATE INDEX asset_criticality IF NOT EXISTS
FOR (a:InformationAsset) ON (a.businessCriticality, a.dataClassification);

CREATE INDEX control_status IF NOT EXISTS
FOR (c:SecurityControl) ON (c.implementationStatus, c.nistFunction);

CREATE INDEX risk_score IF NOT EXISTS
FOR (rs:RiskScenario) ON (rs.residualRiskScore, rs.riskTreatment);

CREATE INDEX compliance_status IF NOT EXISTS
FOR (r:ComplianceRequirement) ON (r.framework, r.complianceStatus);


// --- SECTOR TEMPLATES (Financial Services example) ---

CREATE (fs:IndustrySector {
  id: 'sector-financial-services',
  sectorName: 'Financial Services',
  regulatoryBodies: 'PRA, FCA, ICO',
  benchmarkRiskScore: 0.0
})

CREATE (ins:IndustrySector {
  id: 'sector-insurance',
  sectorName: 'Insurance',
  regulatoryBodies: 'PRA, FCA, Lloyds',
  benchmarkRiskScore: 0.0
})

CREATE (health:IndustrySector {
  id: 'sector-healthcare',
  sectorName: 'Healthcare',
  regulatoryBodies: 'NHS Digital, ICO, CQC',
  benchmarkRiskScore: 0.0
})

CREATE (ci:IndustrySector {
  id: 'sector-critical-infrastructure',
  sectorName: 'Critical National Infrastructure',
  regulatoryBodies: 'NCSC, OFGEM, Defra',
  benchmarkRiskScore: 0.0
});


// --- NIST CSF 2.0 FUNCTIONS (top-level compliance requirements) ---

CREATE (govern:ComplianceRequirement {
  requirementId: 'NIST-CSF2-GV',
  framework: 'NIST_CSF_2',
  requirementText: 'GOVERN - Establish and monitor cybersecurity risk management strategy, expectations, and policy',
  complianceStatus: 'NotAssessed',
  mandatory: true,
  effectiveDate: date('2024-02-26')
})

CREATE (identify:ComplianceRequirement {
  requirementId: 'NIST-CSF2-ID',
  framework: 'NIST_CSF_2',
  requirementText: 'IDENTIFY - Understand assets, suppliers, risks, and cybersecurity posture to prioritise effort',
  complianceStatus: 'NotAssessed',
  mandatory: true,
  effectiveDate: date('2024-02-26')
})

CREATE (protect:ComplianceRequirement {
  requirementId: 'NIST-CSF2-PR',
  framework: 'NIST_CSF_2',
  requirementText: 'PROTECT - Use safeguards to manage cybersecurity risks',
  complianceStatus: 'NotAssessed',
  mandatory: true,
  effectiveDate: date('2024-02-26')
})

CREATE (detect:ComplianceRequirement {
  requirementId: 'NIST-CSF2-DE',
  framework: 'NIST_CSF_2',
  requirementText: 'DETECT - Find and analyse possible cybersecurity attacks and compromises',
  complianceStatus: 'NotAssessed',
  mandatory: true,
  effectiveDate: date('2024-02-26')
})

CREATE (respond:ComplianceRequirement {
  requirementId: 'NIST-CSF2-RS',
  framework: 'NIST_CSF_2',
  requirementText: 'RESPOND - Take action regarding a detected cybersecurity incident',
  complianceStatus: 'NotAssessed',
  mandatory: true,
  effectiveDate: date('2024-02-26')
})

CREATE (recover:ComplianceRequirement {
  requirementId: 'NIST-CSF2-RC',
  framework: 'NIST_CSF_2',
  requirementText: 'RECOVER - Restore assets and operations affected by a cybersecurity incident',
  complianceStatus: 'NotAssessed',
  mandatory: true,
  effectiveDate: date('2024-02-26')
});


// --- PRA SS1/21 KEY REQUIREMENTS (Insurance sector) ---

CREATE (pra1:ComplianceRequirement {
  requirementId: 'PRA-SS1-21-3.1',
  framework: 'PRA_SS1_21',
  requirementText: 'Board responsible for setting strategy for managing operational resilience including important business services',
  complianceStatus: 'NotAssessed',
  mandatory: true,
  effectiveDate: date('2022-03-31')
})

CREATE (pra2:ComplianceRequirement {
  requirementId: 'PRA-SS1-21-5.1',
  framework: 'PRA_SS1_21',
  requirementText: 'Firms must identify important business services and set impact tolerances for maximum tolerable disruption',
  complianceStatus: 'NotAssessed',
  mandatory: true,
  effectiveDate: date('2022-03-31')
})

CREATE (pra3:ComplianceRequirement {
  requirementId: 'PRA-SS1-21-7.1',
  framework: 'PRA_SS1_21',
  requirementText: 'Firms must map important business services identifying people, processes, technology, facilities and information',
  complianceStatus: 'NotAssessed',
  mandatory: true,
  effectiveDate: date('2022-03-31')
});

// Cross-framework mapping: PRA SS1/21 -> NIST CSF 2.0
MATCH (pra1:ComplianceRequirement {requirementId: 'PRA-SS1-21-3.1'})
MATCH (govern:ComplianceRequirement {requirementId: 'NIST-CSF2-GV'})
CREATE (pra1)-[:MAPS_TO {mappingConfidence: 0.85}]->(govern);

MATCH (pra2:ComplianceRequirement {requirementId: 'PRA-SS1-21-5.1'})
MATCH (identify:ComplianceRequirement {requirementId: 'NIST-CSF2-ID'})
CREATE (pra2)-[:MAPS_TO {mappingConfidence: 0.90}]->(identify);

MATCH (pra3:ComplianceRequirement {requirementId: 'PRA-SS1-21-7.1'})
MATCH (identify:ComplianceRequirement {requirementId: 'NIST-CSF2-ID'})
CREATE (pra3)-[:MAPS_TO {mappingConfidence: 0.92}]->(identify);


// --- SAMPLE THREAT ACTORS ---

CREATE (apt29:ThreatActor {
  id: 'ta-apt29',
  name: 'APT29 (Cozy Bear)',
  actorType: 'NationState',
  motivation: 'Espionage',
  sophisticationLevel: 'Advanced',
  mitreThreatGroupId: 'G0016',
  threatLevel: 'Critical',
  lastObservedActivity: date('2025-11-15')
})

CREATE (lockbit:ThreatActor {
  id: 'ta-lockbit',
  name: 'LockBit Ransomware Group',
  actorType: 'OrganisedCrime',
  motivation: 'Financial',
  sophisticationLevel: 'High',
  threatLevel: 'Critical',
  lastObservedActivity: date('2025-12-01')
});


// --- SAMPLE ATTACK TECHNIQUES (MITRE ATT&CK) ---

CREATE (phishing:AttackTechnique {
  mitreId: 'T1566.001',
  name: 'Spearphishing Attachment',
  mitreTactic: 'InitialAccess',
  killChainPhase: 'Delivery',
  detectionDifficulty: 'Moderate',
  prevalence: 'VeryCommon'
})

CREATE (ransomware:AttackTechnique {
  mitreId: 'T1486',
  name: 'Data Encrypted for Impact',
  mitreTactic: 'Impact',
  killChainPhase: 'ActionsOnObjectives',
  detectionDifficulty: 'Moderate',
  prevalence: 'Common'
})

CREATE (supply_chain:AttackTechnique {
  mitreId: 'T1195.002',
  name: 'Compromise Software Supply Chain',
  mitreTactic: 'InitialAccess',
  killChainPhase: 'Delivery',
  detectionDifficulty: 'VeryDifficult',
  prevalence: 'Uncommon'
});

// Link threat actors to techniques
MATCH (apt29:ThreatActor {id: 'ta-apt29'})
MATCH (phishing:AttackTechnique {mitreId: 'T1566.001'})
MATCH (supply:AttackTechnique {mitreId: 'T1195.002'})
CREATE (apt29)-[:EMPLOYS {frequency: 'Frequent', lastSeen: date('2025-10-01')}]->(phishing)
CREATE (apt29)-[:EMPLOYS {frequency: 'Occasional', lastSeen: date('2025-08-15')}]->(supply);

MATCH (lockbit:ThreatActor {id: 'ta-lockbit'})
MATCH (ransomware:AttackTechnique {mitreId: 'T1486'})
MATCH (phishing:AttackTechnique {mitreId: 'T1566.001'})
CREATE (lockbit)-[:EMPLOYS {frequency: 'Frequent', lastSeen: date('2025-12-01')}]->(ransomware)
CREATE (lockbit)-[:EMPLOYS {frequency: 'Frequent', lastSeen: date('2025-11-20')}]->(phishing);


// --- POWER PLATFORM / ONELAKE INTEGRATION PATTERN ---
// Neo4j → OneLake flow:
// 1. Neo4j Spark Connector exports graph projections to Parquet
// 2. Parquet files land in OneLake Lakehouse via shortcut or data pipeline
// 3. Power BI DirectLake mode reads Parquet without import
// 4. Semantic model defines DAX measures for risk scoring

// Key exported views for Power BI:
// - vw_risk_heatmap:     (asset, inherentScore, residualScore, treatment, owner)
// - vw_control_coverage: (control, status, assets_protected, techniques_mitigated, compliance_satisfied)
// - vw_compliance_gaps:  (framework, requirement, status, gap_description, remediation_priority)
// - vw_threat_landscape: (actor, technique, target_sector, prevalence, detection_difficulty)
// - vw_cascade_chains:   (source_risk, target_risk, probability, combined_impact)
// - vw_benchmark_comparison: (client_sector, client_score, sector_avg, percentile)


// ============================================================
// GRAPH QUERIES FOR KEY USE CASES
// ============================================================

// 1. Find all unmitigated attack paths to critical assets
// MATCH path = (ta:ThreatActor)-[:EMPLOYS]->(at:AttackTechnique)-[:TARGETS]->(a:InformationAsset {businessCriticality: 'Critical'})
// WHERE NOT exists { (c:SecurityControl)-[:MITIGATES]->(at) WHERE c.implementationStatus = 'Implemented' }
// RETURN path

// 2. Cascading failure impact analysis
// MATCH chain = (rs1:RiskScenario)-[:CASCADES_TO*1..5]->(rsN:RiskScenario)
// WHERE rs1.residualRiskScore >= 15
// RETURN chain, reduce(total = 0, rs IN nodes(chain) | total + rs.residualRiskScore) AS cumulativeRisk

// 3. Cross-framework compliance coverage
// MATCH (c:SecurityControl)-[:SATISFIES]->(r1:ComplianceRequirement)-[:MAPS_TO]->(r2:ComplianceRequirement)
// WHERE c.implementationStatus = 'Implemented'
// RETURN r1.framework, r2.framework, count(c) AS controlsCovering

// 4. Sector benchmarking query
// MATCH (e:AssessmentEngagement)-[:IN_SECTOR]->(s:IndustrySector)
// MATCH (e)<-[:ASSESSED_IN]-(org:Organization)
// MATCH (org)-[:OWNS]->(a:InformationAsset)-[:HAS_RISK]->(rs:RiskScenario)
// RETURN s.sectorName, avg(rs.residualRiskScore) AS avgRisk, percentileCont(rs.residualRiskScore, 0.5) AS medianRisk
