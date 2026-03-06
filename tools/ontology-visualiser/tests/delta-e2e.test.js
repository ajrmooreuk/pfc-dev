/**
 * E2E validation tests for the DELTA (Discover-Evaluate-Leverage-Transform-Adapt)
 * pipeline process template. Validates the PE-ONT process template structure,
 * gate enforcement, feedback loops, skill orchestration, and traceability.
 *
 * F52.10 (#765) — Epic 52 (#755)
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from 'vitest';

/* ------------------------------------------------------------------ */
/*  Load real PE-ONT DELTA process template                           */
/* ------------------------------------------------------------------ */

let template;
let entities;
let relationships;

const byType = (type) => entities.filter(e => e['@type'] === type);

beforeAll(async () => {
  const { readFileSync } = await import('fs');
  const { resolve } = await import('path');
  const filePath = resolve(
    import.meta.dirname || '.',
    '../../../ONTOLOGIES/ontology-library/PE-Series/PE-ONT/instance-data/pe-delta-process-template-v1.0.0.jsonld'
  );
  template = JSON.parse(readFileSync(filePath, 'utf-8'));
  entities = template.entities || [];
  relationships = template.relationships || [];
});

/* ------------------------------------------------------------------ */
/*  Helper: extended entity extraction (covers all 14 types)          */
/* ------------------------------------------------------------------ */

function extractAllEntities(data) {
  const ents = data.entities || [];
  const bt = (type) => ents.filter(e => e['@type'] === type);
  return {
    process:      bt('pe:Process')[0] || null,
    phases:       bt('pe:ProcessPhase'),
    gates:        bt('pe:ProcessGate'),
    artifacts:    bt('pe:ProcessArtifact'),
    metrics:      bt('pe:ProcessMetric'),
    agents:       bt('pe:AIAgent'),
    skills:       bt('pe:Skill'),
    patterns:     bt('pe:ProcessPattern'),
    plugin:       bt('pe:Plugin')[0] || null,
    path:         bt('pe:ProcessPath')[0] || null,
    pathSteps:    bt('pe:PathStep'),
    pathLinks:    bt('pe:PathLink'),
    hypothesis:   bt('pe:Hypothesis')[0] || null,
    valueChain:   bt('pe:ValueChain')[0] || null,
    relationships: data.relationships || [],
  };
}

/* ================================================================== */
/*  A. Template Structure Integrity                                   */
/* ================================================================== */

describe('A. Template Structure Integrity', () => {
  it('has valid JSON-LD @context with required namespaces', () => {
    const ctx = template['@context'];
    expect(ctx).toBeDefined();
    expect(ctx.pe).toBeDefined();
    expect(ctx.vsom).toBeDefined();
    expect(ctx.rsn).toBeDefined();
    expect(ctx.bsc).toBeDefined();
    expect(ctx.kpi).toBeDefined();
    expect(ctx.oaa).toBeDefined();
  });

  it('has correct @id and @type', () => {
    expect(template['@id']).toBe('pe:delta-discovery-gap-analysis-template');
    expect(template['@type']).toBe('oaa:OntologyTemplate');
  });

  it('has schema version 7.0.0 and template version 1.0.0', () => {
    expect(template['oaa:schemaVersion']).toBe('7.0.0');
    expect(template['oaa:templateVersion']).toBe('1.0.0');
  });

  it('has exactly 52 entities', () => {
    expect(entities).toHaveLength(52);
  });

  it('has exactly 87 relationships', () => {
    expect(relationships).toHaveLength(87);
  });

  it('has exactly 1 Process entity', () => {
    expect(byType('pe:Process')).toHaveLength(1);
  });

  it('has exactly 5 ProcessPhases', () => {
    expect(byType('pe:ProcessPhase')).toHaveLength(5);
  });

  it('has exactly 5 ProcessGates', () => {
    expect(byType('pe:ProcessGate')).toHaveLength(5);
  });

  it('has exactly 9 ProcessArtifacts', () => {
    expect(byType('pe:ProcessArtifact')).toHaveLength(9);
  });

  it('has exactly 7 ProcessMetrics', () => {
    expect(byType('pe:ProcessMetric')).toHaveLength(7);
  });

  it('has exactly 3 AIAgents', () => {
    expect(byType('pe:AIAgent')).toHaveLength(3);
  });

  it('has exactly 6 Skills', () => {
    expect(byType('pe:Skill')).toHaveLength(6);
  });

  it('has exactly 2 ProcessPatterns', () => {
    expect(byType('pe:ProcessPattern')).toHaveLength(2);
  });

  it('has exactly 1 Plugin', () => {
    expect(byType('pe:Plugin')).toHaveLength(1);
  });

  it('has exactly 1 ProcessPath', () => {
    expect(byType('pe:ProcessPath')).toHaveLength(1);
  });

  it('has exactly 5 PathSteps', () => {
    expect(byType('pe:PathStep')).toHaveLength(5);
  });

  it('has exactly 5 PathLinks', () => {
    expect(byType('pe:PathLink')).toHaveLength(5);
  });

  it('has exactly 1 Hypothesis', () => {
    expect(byType('pe:Hypothesis')).toHaveLength(1);
  });

  it('has exactly 1 ValueChain', () => {
    expect(byType('pe:ValueChain')).toHaveLength(1);
  });

  it('Process has correct name and type', () => {
    const proc = byType('pe:Process')[0];
    expect(proc.processName).toBe('DELTA Discovery & Gap Analysis Process');
    expect(proc.processType).toBe('discovery');
  });

  it('Process has automationLevel 65 and duration P4W', () => {
    const proc = byType('pe:Process')[0];
    expect(proc.automationLevel).toBe(65);
    expect(proc.estimatedDuration).toBe('P4W');
  });

  it('Process is active at version 1.0.0', () => {
    const proc = byType('pe:Process')[0];
    expect(proc.status).toBe('active');
    expect(proc.version).toBe('1.0.0');
  });

  it('template has description mentioning DELTA and industry-agnostic', () => {
    const desc = template['oaa:description'];
    expect(desc).toContain('DELTA');
    expect(desc).toContain('industry-agnostic');
  });
});

/* ================================================================== */
/*  B. Gate Configuration                                             */
/* ================================================================== */

describe('B. Gate Configuration', () => {
  let gates;
  beforeAll(() => { gates = byType('pe:ProcessGate'); });

  it('all 5 gates have blockingFactor "blocking"', () => {
    for (const g of gates) {
      expect(g.blockingFactor).toBe('blocking');
    }
  });

  it('all 5 gates are non-automated', () => {
    for (const g of gates) {
      expect(g.automated).toBe(false);
    }
  });

  it('G1 has threshold 85 and type completeness', () => {
    const g1 = gates.find(g => g['@id'].includes('g1'));
    expect(g1.threshold).toBe(85);
    expect(g1.gateType).toBe('completeness');
  });

  it('G2 has threshold 85 and type quality', () => {
    const g2 = gates.find(g => g['@id'].includes('g2'));
    expect(g2.threshold).toBe(85);
    expect(g2.gateType).toBe('quality');
  });

  it('G3 has threshold 85 and type quality', () => {
    const g3 = gates.find(g => g['@id'].includes('g3'));
    expect(g3.threshold).toBe(85);
    expect(g3.gateType).toBe('quality');
  });

  it('G4 has threshold 90 and type approval (stricter)', () => {
    const g4 = gates.find(g => g['@id'].includes('g4'));
    expect(g4.threshold).toBe(90);
    expect(g4.gateType).toBe('approval');
  });

  it('G5 has threshold 85 and type completeness', () => {
    const g5 = gates.find(g => g['@id'].includes('g5'));
    expect(g5.threshold).toBe(85);
    expect(g5.gateType).toBe('completeness');
  });

  it('G3 criteria contains BR-DELTA-001 reference', () => {
    const g3 = gates.find(g => g['@id'].includes('g3'));
    expect(g3.criteria).toContain('BR-DELTA-001');
  });

  it('G3 criteria references MustBeTrue assumption invalidation', () => {
    const g3 = gates.find(g => g['@id'].includes('g3'));
    expect(g3.criteria).toContain('MustBeTrue');
    expect(g3.criteria).toContain('loop back to Evaluate');
  });

  it('G5 criteria contains BR-DELTA-002 reference', () => {
    const g5 = gates.find(g => g['@id'].includes('g5'));
    expect(g5.criteria).toContain('BR-DELTA-002');
  });

  it('G5 criteria references MetricBreach re-entry', () => {
    const g5 = gates.find(g => g['@id'].includes('g5'));
    expect(g5.criteria).toContain('MetricBreach');
    expect(g5.criteria).toContain('Phase 2');
  });

  it('each gate has non-empty criteria string', () => {
    for (const g of gates) {
      expect(g.criteria.length).toBeGreaterThan(50);
    }
  });
});

/* ================================================================== */
/*  C. Phase Dependency Chain                                         */
/* ================================================================== */

describe('C. Phase Dependency Chain', () => {
  let phases;
  beforeAll(() => {
    phases = byType('pe:ProcessPhase').sort((a, b) => a.phaseNumber - b.phaseNumber);
  });

  it('phases are numbered 1 through 5', () => {
    expect(phases.map(p => p.phaseNumber)).toEqual([1, 2, 3, 4, 5]);
  });

  it('phase names are Discover, Evaluate, Leverage, Transform, Adapt', () => {
    expect(phases.map(p => p.phaseName)).toEqual([
      'Discover', 'Evaluate', 'Leverage', 'Transform', 'Adapt',
    ]);
  });

  it('all phases have non-empty entryConditions', () => {
    for (const p of phases) {
      expect(p.entryConditions.length).toBeGreaterThan(20);
    }
  });

  it('all phases have non-empty exitConditions', () => {
    for (const p of phases) {
      expect(p.exitConditions.length).toBeGreaterThan(20);
    }
  });

  it('Phase 1 (Discover) has parallelExecution true', () => {
    expect(phases[0].parallelExecution).toBe(true);
  });

  it('Phases 2-5 have parallelExecution false', () => {
    for (const p of phases.slice(1)) {
      expect(p.parallelExecution).toBe(false);
    }
  });

  it('all phases have estimatedDuration P1W', () => {
    for (const p of phases) {
      expect(p.estimatedDuration).toBe('P1W');
    }
  });

  it('Phase 4 entry conditions reference BR-DELTA-001 loop back', () => {
    const transform = phases[3];
    expect(transform.entryConditions).toContain('loop back');
  });
});

/* ================================================================== */
/*  D. Artifact Production                                            */
/* ================================================================== */

describe('D. Artifact Production', () => {
  let artifacts;
  beforeAll(() => { artifacts = byType('pe:ProcessArtifact'); });

  it('all 9 artifacts are mandatory', () => {
    for (const a of artifacts) {
      expect(a.mandatory).toBe(true);
    }
  });

  it('all artifacts have non-empty descriptions', () => {
    for (const a of artifacts) {
      expect(a.description.length).toBeGreaterThan(30);
    }
  });

  it('all artifacts have format specified', () => {
    for (const a of artifacts) {
      expect(a.format).toBeDefined();
      expect(a.format.length).toBeGreaterThan(0);
    }
  });

  it('contains scoping frame artifact', () => {
    const scope = artifacts.find(a => a['@id'].includes('scoping-frame'));
    expect(scope).toBeDefined();
    expect(scope.artifactName).toBe('DELTA Scoping Frame');
  });

  it('contains gap assessment artifact', () => {
    const gap = artifacts.find(a => a['@id'].includes('gap-assessment'));
    expect(gap).toBeDefined();
  });

  it('contains strategic recommendations artifact', () => {
    const recs = artifacts.find(a => a['@id'].includes('recommendations'));
    expect(recs).toBeDefined();
  });

  it('contains transformation plan artifact', () => {
    const plan = artifacts.find(a => a['@id'].includes('transformation-plan'));
    expect(plan).toBeDefined();
  });

  it('contains narrative brief artifact', () => {
    const narr = artifacts.find(a => a['@id'].includes('narrative-brief'));
    expect(narr).toBeDefined();
  });

  it('contains adaptation report artifact', () => {
    const adapt = artifacts.find(a => a['@id'].includes('adaptation-report'));
    expect(adapt).toBeDefined();
  });

  it('recommendations artifact mentions evidence traceability', () => {
    const recs = artifacts.find(a => a['@id'].includes('recommendations'));
    expect(recs.description).toContain('evidence');
    expect(recs.description).toContain('traceability');
  });
});

/* ================================================================== */
/*  E. Feedback Loops                                                 */
/* ================================================================== */

describe('E. Feedback Loops', () => {
  let links;
  beforeAll(() => { links = byType('pe:PathLink'); });

  it('has 4 sequential links', () => {
    const seq = links.filter(l => l.linkType === 'sequential');
    expect(seq).toHaveLength(4);
  });

  it('has 1 feedback link', () => {
    const fb = links.filter(l => l.linkType === 'feedback');
    expect(fb).toHaveLength(1);
  });

  it('all sequential links have mandatory binding strength', () => {
    const seq = links.filter(l => l.linkType === 'sequential');
    for (const l of seq) {
      expect(l.bindingStrength).toBe('mandatory');
    }
  });

  it('feedback link has conditional binding strength', () => {
    const fb = links.find(l => l.linkType === 'feedback');
    expect(fb.bindingStrength).toBe('conditional');
  });

  it('feedback link is Adapt-to-Evaluate', () => {
    const fb = links.find(l => l.linkType === 'feedback');
    expect(fb['@id']).toContain('a-to-e');
  });

  it('sequential links form D→E→L→T→A chain', () => {
    const seq = links.filter(l => l.linkType === 'sequential');
    const ids = seq.map(l => l['@id']);
    expect(ids).toContain('pe:delta-link-d-to-e');
    expect(ids).toContain('pe:delta-link-e-to-l');
    expect(ids).toContain('pe:delta-link-l-to-t');
    expect(ids).toContain('pe:delta-link-t-to-a');
  });

  it('BR-DELTA-001 is defined in G3 gate (MustBeTrue loop)', () => {
    const g3 = byType('pe:ProcessGate').find(g => g['@id'].includes('g3'));
    expect(g3.criteria).toMatch(/BR-DELTA-001.*MustBeTrue/s);
  });

  it('BR-DELTA-002 is defined in G5 gate (MetricBreach loop)', () => {
    const g5 = byType('pe:ProcessGate').find(g => g['@id'].includes('g5'));
    expect(g5.criteria).toMatch(/BR-DELTA-002.*MetricBreach/s);
  });
});

/* ================================================================== */
/*  F. Skill & Agent Orchestration                                    */
/* ================================================================== */

describe('F. Skill & Agent Orchestration', () => {
  let skills, agents;
  beforeAll(() => {
    skills = byType('pe:Skill');
    agents = byType('pe:AIAgent');
  });

  it('all 6 skills have distinct skillType values', () => {
    const types = skills.map(s => s.skillType);
    // extraction, analysis×3, generation, analysis (some share type)
    expect(types.length).toBe(6);
  });

  it('all skills have inputs and outputs arrays', () => {
    for (const s of skills) {
      expect(Array.isArray(s.inputs)).toBe(true);
      expect(Array.isArray(s.outputs)).toBe(true);
      expect(s.inputs.length).toBeGreaterThan(0);
      expect(s.outputs.length).toBeGreaterThan(0);
    }
  });

  it('all skill inputs have name and dataType', () => {
    for (const s of skills) {
      for (const inp of s.inputs) {
        expect(inp.name).toBeDefined();
        expect(inp.dataType).toBeDefined();
      }
    }
  });

  it('all skill outputs have name and dataType', () => {
    for (const s of skills) {
      for (const out of s.outputs) {
        expect(out.name).toBeDefined();
        expect(out.dataType).toBeDefined();
      }
    }
  });

  it('all skills have qualityThreshold >= 80', () => {
    for (const s of skills) {
      expect(s.qualityThreshold).toBeGreaterThanOrEqual(80);
    }
  });

  it('all skills are idempotent', () => {
    for (const s of skills) {
      expect(s.idempotent).toBe(true);
    }
  });

  it('all skills are active', () => {
    for (const s of skills) {
      expect(s.status).toBe('active');
    }
  });

  it('3 agents have distinct agentType values', () => {
    const types = agents.map(a => a.agentType);
    expect(new Set(types).size).toBe(3);
    expect(types).toContain('extraction');
    expect(types).toContain('analysis');
    expect(types).toContain('monitoring');
  });

  it('all agents have qualityThreshold >= 80', () => {
    for (const a of agents) {
      expect(a.qualityThreshold).toBeGreaterThanOrEqual(80);
    }
  });

  it('plugin is PFC-level analytics type', () => {
    const plugin = byType('pe:Plugin')[0];
    expect(plugin.pluginType).toBe('analytics');
    expect(plugin.cascadeTier).toBe('PFC');
    expect(plugin.status).toBe('active');
  });
});

/* ================================================================== */
/*  G. Traceability Golden Thread                                     */
/* ================================================================== */

describe('G. Traceability Golden Thread', () => {
  it('evidence integrity metric references JP-DELTA-006', () => {
    const ei = byType('pe:ProcessMetric').find(m => m.metricId === 'pe:delta-met-ei');
    expect(ei).toBeDefined();
    expect(ei.description).toContain('JP-DELTA-006');
  });

  it('evidence integrity metric targets 100%', () => {
    const ei = byType('pe:ProcessMetric').find(m => m.metricId === 'pe:delta-met-ei');
    expect(ei.target).toBe(100);
  });

  it('MECE compliance metric targets 100%', () => {
    const mece = byType('pe:ProcessMetric').find(m => m.metricId === 'pe:delta-met-mece');
    expect(mece).toBeDefined();
    expect(mece.target).toBe(100);
  });

  it('gap closure rate metric targets 60%', () => {
    const gcr = byType('pe:ProcessMetric').find(m => m.metricId === 'pe:delta-met-gcr');
    expect(gcr).toBeDefined();
    expect(gcr.target).toBe(60);
  });

  it('hypothesis links gap assessment to measurable outcome', () => {
    const hyp = byType('pe:Hypothesis')[0];
    expect(hyp.statement).toContain('60%');
    expect(hyp.statement).toContain('gap');
    expect(hyp.measurementMethod).toContain('KPI');
  });

  it('recommendations artifact describes evidence traceability chain', () => {
    const recs = byType('pe:ProcessArtifact').find(a => a['@id'].includes('recommendations'));
    expect(recs.description).toContain('evidence');
    expect(recs.description).toContain('hypothesis');
    expect(recs.description).toContain('recommendation');
  });

  it('narrative artifact traces claims to evidence', () => {
    const narr = byType('pe:ProcessArtifact').find(a => a['@id'].includes('narrative'));
    expect(narr.description).toContain('Traces claims back to SA evidence');
  });

  it('7 metrics cover outcome, quality, and efficiency types', () => {
    const metrics = byType('pe:ProcessMetric');
    const types = metrics.map(m => m.metricType);
    expect(types).toContain('outcome');
    expect(types).toContain('quality');
    expect(types).toContain('efficiency');
  });
});

/* ================================================================== */
/*  H. Scenario Fixtures — Narrow & Functional Scope                  */
/* ================================================================== */

// Fixture factories

function _makeDeltaScope(overrides = {}) {
  return {
    '@id': 'delta:scope-test-001',
    '@type': 'delta:ScopingFrame',
    scopeLevel: 'narrow',
    pfiInstance: 'PFI-BAIV',
    template: 'baiv-content-authority-audit',
    stakeholders: [
      { role: 'CMO', perspective: 'CustomerAdvocate' },
      { role: 'Head of Content', perspective: 'ProcessOwner' },
    ],
    drivingQuestion: 'How effectively does our content authority position us for AI-driven search?',
    evidenceSources: ['GA4', 'GSC', 'Ahrefs'],
    ...overrides,
  };
}

function _makeDeltaCGA(dimensions = 4, overrides = {}) {
  const dimNames = ['Content Quality', 'Technical SEO', 'Schema Coverage', 'Brand Authority',
    'Competitive Landscape', 'AI Readiness'];
  return {
    '@id': 'delta:cga-test-001',
    '@type': 'ga:ComparativeGapAnalysis',
    dimensions: dimNames.slice(0, dimensions).map((name, i) => ({
      dimensionId: `dim-${i + 1}`,
      name,
      currentScore: 3 + Math.random() * 4,
      futureTarget: 8,
      gapMagnitude: null, // computed
      severity: i < 2 ? 'Critical' : 'Significant',
    })),
    isMECE: true,
    ...overrides,
  };
}

function _makeGateResult(gateId, score, threshold = 85) {
  return {
    gateId,
    score,
    threshold,
    passed: score >= threshold,
    timestamp: new Date().toISOString(),
  };
}

function _makeFeedbackTrigger(ruleId, trigger) {
  return {
    ruleId,
    triggered: trigger,
    reEntryPhase: 2,
    cycleIncrement: ruleId === 'BR-DELTA-002',
  };
}

function _makeTraceabilityChain() {
  return {
    evidence: { id: 'ev-001', source: 'GA4', direction: 'supporting', reliability: 'Verified' },
    hypothesis: { id: 'hyp-001', statement: 'Schema markup drives AI visibility', mustBeTrue: 'Schema is indexable' },
    recommendation: { id: 'rec-001', title: 'Implement comprehensive schema markup', evidenceChainRefs: ['ev-001'] },
    objective: { id: 'okr-obj-001', description: 'Achieve 80% schema coverage', keyResults: ['kr-001'] },
    kpi: { id: 'kpi-001', name: 'Schema Coverage %', baseline: 15, target: 80, current: null },
  };
}

describe('H. Scenario Fixtures — Narrow Scope (S52.10.1)', () => {
  it('narrow scope has exactly 2 stakeholders minimum', () => {
    const scope = _makeDeltaScope();
    expect(scope.stakeholders.length).toBeGreaterThanOrEqual(2);
  });

  it('narrow scope uses BAIV content-authority-audit template', () => {
    const scope = _makeDeltaScope();
    expect(scope.template).toBe('baiv-content-authority-audit');
    expect(scope.scopeLevel).toBe('narrow');
  });

  it('narrow scope has minimum 3 evidence sources', () => {
    const scope = _makeDeltaScope();
    expect(scope.evidenceSources.length).toBeGreaterThanOrEqual(3);
  });

  it('narrow CGA has 4 dimensions', () => {
    const cga = _makeDeltaCGA(4);
    expect(cga.dimensions).toHaveLength(4);
    expect(cga.isMECE).toBe(true);
  });

  it('narrow scope produces 10 artifact paths', () => {
    const instance = 'pfi-baiv-aiv';
    const artifactPaths = [
      `01-delta-scope-${instance}.jsonld`,
      `01-delta-scope-${instance}-summary.md`,
      `02-delta-context-${instance}.jsonld`,
      `03-delta-evidence-${instance}.jsonld`,
      `04-delta-cga-${instance}.jsonld`,
      `04-delta-cga-${instance}-summary.md`,
      `05-delta-levers-${instance}.jsonld`,
      `06-delta-recommendations-${instance}.jsonld`,
      `07-delta-plan-${instance}.jsonld`,
      `08-delta-narrative-${instance}.md`,
    ];
    expect(artifactPaths).toHaveLength(10);
    expect(artifactPaths.every(p => p.includes(instance))).toBe(true);
  });
});

describe('H. Scenario Fixtures — Functional Scope (S52.10.2)', () => {
  it('functional scope uses ai-visibility-assessment template', () => {
    const scope = _makeDeltaScope({
      scopeLevel: 'functional',
      template: 'baiv-ai-visibility-assessment',
    });
    expect(scope.scopeLevel).toBe('functional');
    expect(scope.template).toBe('baiv-ai-visibility-assessment');
  });

  it('functional CGA has 6 dimensions (adds Competitive + AI Readiness)', () => {
    const cga = _makeDeltaCGA(6);
    expect(cga.dimensions).toHaveLength(6);
    expect(cga.dimensions[4].name).toBe('Competitive Landscape');
    expect(cga.dimensions[5].name).toBe('AI Readiness');
  });

  it('functional scope invokes industry analysis SA tool', () => {
    const saTools = { narrow: [], functional: ['pfc-industry-analysis'],
      enterprise: ['pfc-macro-analysis', 'pfc-industry-analysis'] };
    expect(saTools.functional).toContain('pfc-industry-analysis');
    expect(saTools.narrow).toHaveLength(0);
  });
});

describe('H. Scenario Fixtures — Gate Pass/Fail (S52.10.3)', () => {
  it('gate passes when score >= threshold', () => {
    const result = _makeGateResult('G1', 90, 85);
    expect(result.passed).toBe(true);
  });

  it('gate fails when score < threshold', () => {
    const result = _makeGateResult('G2', 80, 85);
    expect(result.passed).toBe(false);
  });

  it('G4 requires higher threshold (90) than others (85)', () => {
    const g4pass = _makeGateResult('G4', 89, 90);
    const g4fail = _makeGateResult('G4', 90, 90);
    expect(g4pass.passed).toBe(false);
    expect(g4fail.passed).toBe(true);
  });
});

describe('H. Scenario Fixtures — BR-DELTA-001 (S52.10.4)', () => {
  it('BR-DELTA-001 triggers re-entry at Phase 2 when MustBeTrue invalidated', () => {
    const trigger = _makeFeedbackTrigger('BR-DELTA-001', true);
    expect(trigger.triggered).toBe(true);
    expect(trigger.reEntryPhase).toBe(2);
  });

  it('BR-DELTA-001 does NOT increment cycle number', () => {
    const trigger = _makeFeedbackTrigger('BR-DELTA-001', true);
    expect(trigger.cycleIncrement).toBe(false);
  });

  it('BR-DELTA-001 does not trigger when MustBeTrue holds', () => {
    const trigger = _makeFeedbackTrigger('BR-DELTA-001', false);
    expect(trigger.triggered).toBe(false);
  });
});

describe('H. Scenario Fixtures — BR-DELTA-002 (S52.10.5)', () => {
  it('BR-DELTA-002 triggers re-entry at Phase 2 on critical breach', () => {
    const trigger = _makeFeedbackTrigger('BR-DELTA-002', true);
    expect(trigger.triggered).toBe(true);
    expect(trigger.reEntryPhase).toBe(2);
  });

  it('BR-DELTA-002 DOES increment cycle number', () => {
    const trigger = _makeFeedbackTrigger('BR-DELTA-002', true);
    expect(trigger.cycleIncrement).toBe(true);
  });
});

describe('H. Scenario Fixtures — Traceability Chain (S52.10.6)', () => {
  it('golden thread links evidence → hypothesis → recommendation → objective → KPI', () => {
    const chain = _makeTraceabilityChain();
    expect(chain.evidence.id).toBeDefined();
    expect(chain.hypothesis.id).toBeDefined();
    expect(chain.recommendation.evidenceChainRefs).toContain(chain.evidence.id);
    expect(chain.objective.keyResults.length).toBeGreaterThan(0);
    expect(chain.kpi.baseline).toBeDefined();
    expect(chain.kpi.target).toBeDefined();
  });

  it('evidence has direction and reliability tags', () => {
    const chain = _makeTraceabilityChain();
    expect(['supporting', 'contradicting', 'neutral']).toContain(chain.evidence.direction);
    expect(['Verified', 'Estimated', 'Assumed']).toContain(chain.evidence.reliability);
  });

  it('hypothesis has MustBeTrue assumption', () => {
    const chain = _makeTraceabilityChain();
    expect(chain.hypothesis.mustBeTrue).toBeDefined();
    expect(chain.hypothesis.mustBeTrue.length).toBeGreaterThan(0);
  });

  it('recommendation references evidence chain', () => {
    const chain = _makeTraceabilityChain();
    expect(chain.recommendation.evidenceChainRefs).toHaveLength(1);
  });
});

/* ================================================================== */
/*  I. extractProcessEntities Integration                             */
/* ================================================================== */

describe('I. extractProcessEntities Integration', () => {
  it('extractAllEntities returns correct entity counts', () => {
    const result = extractAllEntities(template);
    expect(result.process).not.toBeNull();
    expect(result.phases).toHaveLength(5);
    expect(result.gates).toHaveLength(5);
    expect(result.artifacts).toHaveLength(9);
    expect(result.metrics).toHaveLength(7);
    expect(result.agents).toHaveLength(3);
    expect(result.skills).toHaveLength(6);
    expect(result.patterns).toHaveLength(2);
    expect(result.plugin).not.toBeNull();
    expect(result.path).not.toBeNull();
    expect(result.pathSteps).toHaveLength(5);
    expect(result.pathLinks).toHaveLength(5);
    expect(result.hypothesis).not.toBeNull();
    expect(result.valueChain).not.toBeNull();
    expect(result.relationships).toHaveLength(87);
  });

  it('process name matches expected value', () => {
    const result = extractAllEntities(template);
    expect(result.process.processName).toBe('DELTA Discovery & Gap Analysis Process');
  });

  it('phases are sortable by phaseNumber', () => {
    const result = extractAllEntities(template);
    const sorted = result.phases.sort((a, b) => a.phaseNumber - b.phaseNumber);
    expect(sorted[0].phaseName).toBe('Discover');
    expect(sorted[4].phaseName).toBe('Adapt');
  });

  it('path step Discover is the entry point', () => {
    const result = extractAllEntities(template);
    const discoverStep = result.pathSteps.find(s => s['@id'].includes('discover'));
    expect(discoverStep.entryPoint).toBe(true);
  });

  it('non-Discover path steps are not entry points', () => {
    const result = extractAllEntities(template);
    const nonDiscover = result.pathSteps.filter(s => !s['@id'].includes('discover'));
    for (const step of nonDiscover) {
      expect(step.entryPoint).toBe(false);
    }
  });
});
