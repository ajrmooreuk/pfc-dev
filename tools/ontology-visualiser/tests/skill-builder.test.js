/**
 * Unit tests for skill-builder.js — process signal extraction,
 * template scaffolding, registry artifact output, and Mermaid export.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock state with both DT and Skill Builder properties
import { vi } from 'vitest';
vi.mock('../js/state.js', () => ({
  state: {
    dtActiveGateId: null,
    dtCompletedGates: [],
    dtPath: [],
    dtFinalRecommendation: null,
    dtProblemStatement: '',
    dtEvaluator: '',
    dtAllScores: {},
    dtScoringPanelOpen: false,
    skillBuilderOpen: false,
    skillBuilderSelectedProcess: null,
    skillBuilderPhaseMap: [],
    skillBuilderAgentMap: [],
    skillBuilderGateMap: [],
    skillBuilderOutputFormat: 'markdown',
    skillBuilderLastScaffold: null,
    skillBuilderProcessData: null,
    discoveredProcesses: [],
    loadedOntologies: new Map(),
  },
}));

import { state } from '../js/state.js';
import {
  extractProcessSignals,
  prefillDTFromProcess,
  scaffoldFromRecommendation,
  buildRegistryArtifact,
  generateWorkflowMermaid,
  mapPhasesToSections,
  mapAgentsToCapabilities,
  extractProcessEntities,
  scaffoldSkillSimple,
  scaffoldSkillStandalone,
  scaffoldSkillWithMcp,
  scaffoldAgentOrchestrator,
  scaffoldAgentSpecialist,
  scaffoldAgentUtility,
  scaffoldAgentStandalone,
  scaffoldPluginLightweight,
  scaffoldPluginClaudeCode,
  scaffoldPluginCowork,
  scaffoldPluginCCAgent,
  scaffoldPluginCoworkAgent,
} from '../js/skill-builder.js';

// ========================================
// TEST FIXTURES
// ========================================

function _makeProcess(overrides = {}) {
  return {
    '@id': 'pe:test-process',
    '@type': 'pe:Process',
    processId: 'pe:test-001',
    processName: 'Test Process',
    processType: 'analysis',
    description: 'A test process for skill builder unit tests',
    businessObjective: 'Validate skill builder functionality',
    owner: 'Test Lead',
    automationLevel: 45,
    ...overrides,
  };
}

function _makePhases(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    '@id': `pe:test-phase-${i + 1}`,
    '@type': 'pe:ProcessPhase',
    phaseId: `pe:ph-${i + 1}`,
    phaseName: `Phase ${i + 1}`,
    phaseNumber: i + 1,
    description: `Description for phase ${i + 1}`,
    entryConditions: `Entry conditions for phase ${i + 1}`,
    exitConditions: `Exit conditions for phase ${i + 1}`,
    activities: `Activity A; Activity B; Activity C for phase ${i + 1}`,
    estimatedDuration: `P${i + 1}W`,
    parallelExecution: i === 0,
  }));
}

function _makeAgents(count = 2) {
  const types = ['analysis', 'generation', 'optimization', 'orchestration', 'validation'];
  const autonomy = ['supervised', 'highly-autonomous', 'manual', 'hybrid'];
  return Array.from({ length: count }, (_, i) => ({
    '@id': `pe:test-agent-${i + 1}`,
    '@type': 'pe:AIAgent',
    agentId: `pe:ai-${i + 1}`,
    agentName: `Agent ${i + 1}`,
    agentType: types[i % types.length],
    capabilities: `Capability A; Capability B for agent ${i + 1}`,
    autonomyLevel: autonomy[i % autonomy.length],
    model: i === 0 ? 'GPT-4 + custom rules' : 'Claude',
    qualityThreshold: 80 - i * 5,
  }));
}

function _makeGates(count = 2) {
  return Array.from({ length: count }, (_, i) => ({
    '@id': `pe:test-gate-${i + 1}`,
    '@type': 'pe:ProcessGate',
    gateId: `pe:g-${i + 1}`,
    gateName: `G${i + 1}: Quality Gate`,
    gateType: i === 0 ? 'quality' : 'compliance',
    criteria: `Criteria for gate ${i + 1}`,
    threshold: 80 + i * 5,
    automated: i === 1,
    blockingFactor: 'blocking',
  }));
}

function _makePatterns(count = 1) {
  return Array.from({ length: count }, (_, i) => ({
    '@id': `pe:test-pattern-${i + 1}`,
    '@type': 'pe:ProcessPattern',
    patternId: `pe:pat-${i + 1}`,
    patternName: `Pattern ${i + 1}`,
    context: 'Test context',
    problem: 'Test problem',
    solution: 'Test solution',
    benefits: 'Test benefits',
  }));
}

function _makeArtifacts(count = 2) {
  return Array.from({ length: count }, (_, i) => ({
    '@id': `pe:test-artifact-${i + 1}`,
    '@type': 'pe:ProcessArtifact',
    artifactId: `pe:art-${i + 1}`,
    artifactName: `Artifact ${i + 1}`,
    artifactType: i === 0 ? 'document' : 'report',
    format: 'Markdown',
    mandatory: true,
  }));
}

function _makeMetrics(count = 2) {
  return Array.from({ length: count }, (_, i) => ({
    '@id': `pe:test-metric-${i + 1}`,
    '@type': 'pe:ProcessMetric',
    metricId: `pe:met-${i + 1}`,
    metricName: `Metric ${i + 1}`,
    metricType: i === 0 ? 'quality' : 'outcome',
    unit: 'percentage',
    target: 85 + i * 5,
    collectionMethod: i === 0 ? 'automated' : 'manual',
    frequency: 'per-phase',
  }));
}

function _makeRelationships(phases, gates, artifacts) {
  const rels = [];
  // Process has phases
  for (const ph of phases) {
    rels.push({ '@type': 'pe:hasPhase', from: 'pe:test-process', to: ph['@id'] });
  }
  // Phase 1 has gate 1
  if (gates.length > 0 && phases.length > 0) {
    rels.push({ '@type': 'pe:hasGate', from: phases[0]['@id'], to: gates[0]['@id'] });
  }
  // Phase 2 has gate 2
  if (gates.length > 1 && phases.length > 1) {
    rels.push({ '@type': 'pe:hasGate', from: phases[1]['@id'], to: gates[1]['@id'] });
  }
  // Phase 1 produces artifact 1
  if (artifacts.length > 0 && phases.length > 0) {
    rels.push({ '@type': 'pe:produces', from: phases[0]['@id'], to: artifacts[0]['@id'] });
  }
  return rels;
}

function _resetState() {
  state.dtActiveGateId = null;
  state.dtCompletedGates = [];
  state.dtPath = [];
  state.dtFinalRecommendation = null;
  state.dtProblemStatement = '';
  state.dtEvaluator = '';
  state.dtAllScores = {};
  state.dtScoringPanelOpen = false;
  state.skillBuilderOpen = false;
  state.skillBuilderSelectedProcess = null;
  state.skillBuilderPhaseMap = [];
  state.skillBuilderAgentMap = [];
  state.skillBuilderGateMap = [];
  state.skillBuilderOutputFormat = 'markdown';
  state.skillBuilderLastScaffold = null;
  state.skillBuilderProcessData = null;
}

// ========================================
// PROCESS SIGNAL EXTRACTION
// ========================================

describe('Process Signal Extraction', () => {
  beforeEach(_resetState);

  it('extracts signals from a fully-specified process', () => {
    const process = _makeProcess();
    const phases = _makePhases(3);
    const agents = _makeAgents(2);
    const gates = _makeGates(2);
    const patterns = _makePatterns(1);

    const { gateScores, signals } = extractProcessSignals(process, phases, agents, gates, patterns);

    expect(signals.automationLevel).toBe(45);
    expect(signals.processType).toBe('analysis');
    expect(signals.agentCount).toBe(2);
    expect(signals.phaseCount).toBe(3);
    expect(signals.gateCount).toBe(2);
    expect(signals.patternCount).toBe(1);
    expect(signals.hasParallelPhases).toBe(true);
    expect(signals.hasAutomatedGates).toBe(true);
    expect(gateScores['HG-01']).toHaveLength(4);
    expect(gateScores['HG-02']).toHaveLength(4);
  });

  it('produces valid 0-10 scores for all gates', () => {
    const { gateScores } = extractProcessSignals(
      _makeProcess(), _makePhases(5), _makeAgents(3), _makeGates(3), _makePatterns(2),
    );
    for (const [gateId, scores] of Object.entries(gateScores)) {
      expect(scores).toHaveLength(4);
      for (const s of scores) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(10);
      }
    }
  });

  it('handles discovery process type', () => {
    const { gateScores } = extractProcessSignals(
      _makeProcess({ processType: 'discovery' }), _makePhases(2), [], [], [],
    );
    // discovery maps to state score 7 (HG-01 C2)
    expect(gateScores['HG-01'][2]).toBe(7);
  });

  it('handles deployment process type', () => {
    const { gateScores } = extractProcessSignals(
      _makeProcess({ processType: 'deployment' }), _makePhases(2), [], [], [],
    );
    expect(gateScores['HG-01'][2]).toBe(3);
  });

  it('handles optimization process type', () => {
    const { gateScores } = extractProcessSignals(
      _makeProcess({ processType: 'optimization' }), _makePhases(2), [], [], [],
    );
    expect(gateScores['HG-01'][2]).toBe(7);
  });

  it('handles governance process type', () => {
    const { gateScores } = extractProcessSignals(
      _makeProcess({ processType: 'governance' }), _makePhases(2), [], [], [],
    );
    expect(gateScores['HG-01'][2]).toBe(5);
  });

  it('handles custom process type', () => {
    const { gateScores } = extractProcessSignals(
      _makeProcess({ processType: 'custom' }), _makePhases(1), [], [], [],
    );
    expect(gateScores['HG-01'][2]).toBe(5);
  });
});

// ========================================
// HEURISTIC SCORING
// ========================================

describe('Heuristic Scoring', () => {
  beforeEach(_resetState);

  it('high automation level produces higher HG-01 C0 scores', () => {
    const { gateScores: high } = extractProcessSignals(
      _makeProcess({ automationLevel: 80 }), _makePhases(2), [], [], [],
    );
    const { gateScores: low } = extractProcessSignals(
      _makeProcess({ automationLevel: 10 }), _makePhases(2), [], [], [],
    );
    expect(high['HG-01'][0]).toBeGreaterThan(low['HG-01'][0]);
  });

  it('more agents produce higher HG-01 C3 coordination scores', () => {
    const { gateScores: many } = extractProcessSignals(
      _makeProcess(), _makePhases(2), _makeAgents(3), [], [],
    );
    const { gateScores: few } = extractProcessSignals(
      _makeProcess(), _makePhases(2), _makeAgents(1), [], [],
    );
    const { gateScores: none } = extractProcessSignals(
      _makeProcess(), _makePhases(2), [], [], [],
    );
    expect(many['HG-01'][3]).toBeGreaterThan(few['HG-01'][3]);
    expect(few['HG-01'][3]).toBeGreaterThan(none['HG-01'][3]);
  });

  it('parallel phases produce higher HG-02 C1 scores', () => {
    const parallelPhases = _makePhases(2);
    parallelPhases[0].parallelExecution = true;
    const { gateScores: parallel } = extractProcessSignals(
      _makeProcess(), parallelPhases, [], [], [],
    );
    const seqPhases = _makePhases(2);
    seqPhases[0].parallelExecution = false;
    seqPhases[1].parallelExecution = false;
    const { gateScores: sequential } = extractProcessSignals(
      _makeProcess(), seqPhases, [], [], [],
    );
    expect(parallel['HG-02'][1]).toBeGreaterThan(sequential['HG-02'][1]);
  });

  it('highly-autonomous agents produce higher HG-01 C1 scores', () => {
    const autoAgent = [{ '@id': 'a1', '@type': 'pe:AIAgent', agentId: 'a1', agentName: 'Auto', agentType: 'analysis', autonomyLevel: 'highly-autonomous', capabilities: '' }];
    const manualAgent = [{ '@id': 'a2', '@type': 'pe:AIAgent', agentId: 'a2', agentName: 'Manual', agentType: 'analysis', autonomyLevel: 'manual', capabilities: '' }];
    const { gateScores: auto } = extractProcessSignals(_makeProcess(), _makePhases(1), autoAgent, [], []);
    const { gateScores: manual } = extractProcessSignals(_makeProcess(), _makePhases(1), manualAgent, [], []);
    expect(auto['HG-01'][1]).toBeGreaterThan(manual['HG-01'][1]);
  });

  it('automated gates produce higher HG-04 C3 scores', () => {
    const autoGate = [{ '@id': 'g1', '@type': 'pe:ProcessGate', gateId: 'g1', gateName: 'G1', gateType: 'quality', automated: true, blockingFactor: 'blocking' }];
    const manualGate = [{ '@id': 'g2', '@type': 'pe:ProcessGate', gateId: 'g2', gateName: 'G2', gateType: 'quality', automated: false, blockingFactor: 'blocking' }];
    const { gateScores: auto } = extractProcessSignals(_makeProcess(), _makePhases(1), [], autoGate, []);
    const { gateScores: manual } = extractProcessSignals(_makeProcess(), _makePhases(1), [], manualGate, []);
    expect(auto['HG-04'][3]).toBeGreaterThan(manual['HG-04'][3]);
  });
});

// ========================================
// DT PREFILL INTEGRATION
// ========================================

describe('DT Prefill Integration', () => {
  beforeEach(_resetState);

  it('populates state.dtAllScores from process data', () => {
    const process = _makeProcess();
    const phases = _makePhases(3);
    const agents = _makeAgents(2);
    const gates = _makeGates(2);
    const patterns = _makePatterns(1);

    prefillDTFromProcess(process, phases, agents, gates, patterns);

    expect(state.dtAllScores['HG-01']).toHaveLength(4);
    expect(state.dtAllScores['HG-02']).toHaveLength(4);
    expect(state.dtAllScores['HG-03']).toHaveLength(4);
  });

  it('sets dtProblemStatement from businessObjective', () => {
    prefillDTFromProcess(
      _makeProcess({ businessObjective: 'Test objective' }),
      [], [], [], [],
    );
    expect(state.dtProblemStatement).toBe('Test objective');
  });

  it('sets dtEvaluator from process owner', () => {
    prefillDTFromProcess(
      _makeProcess({ owner: 'Lead Architect' }),
      [], [], [], [],
    );
    expect(state.dtEvaluator).toBe('Lead Architect');
  });
});

// ========================================
// PHASE-TO-SECTION MAPPING
// ========================================

describe('Phase-to-Section Mapping', () => {
  it('maps phases to numbered sections in order', () => {
    const phases = _makePhases(3);
    const sections = mapPhasesToSections(phases);
    expect(sections).toHaveLength(3);
    expect(sections[0].number).toBe(1);
    expect(sections[1].number).toBe(2);
    expect(sections[2].number).toBe(3);
    expect(sections[0].name).toBe('Phase 1');
  });

  it('includes gate and artifact data when relationships provided', () => {
    const phases = _makePhases(2);
    const gates = _makeGates(1);
    const artifacts = _makeArtifacts(1);
    const rels = _makeRelationships(phases, gates, artifacts);

    const sections = mapPhasesToSections(phases, gates, artifacts, rels);
    expect(sections[0].qualityGates).toHaveLength(1);
    expect(sections[0].qualityGates[0].name).toBe('G1: Quality Gate');
    expect(sections[0].outputs).toHaveLength(1);
    expect(sections[0].outputs[0].name).toBe('Artifact 1');
  });

  it('preserves entry/exit conditions as prerequisites/successCriteria', () => {
    const phases = _makePhases(1);
    const sections = mapPhasesToSections(phases);
    expect(sections[0].prerequisites).toBe('Entry conditions for phase 1');
    expect(sections[0].successCriteria).toBe('Exit conditions for phase 1');
  });

  it('handles empty phases array', () => {
    const sections = mapPhasesToSections([]);
    expect(sections).toHaveLength(0);
  });
});

// ========================================
// AGENT CAPABILITY MAPPING
// ========================================

describe('Agent Capability Mapping', () => {
  it('maps agents to capability definitions', () => {
    const agents = _makeAgents(2);
    const caps = mapAgentsToCapabilities(agents);
    expect(caps).toHaveLength(2);
    expect(caps[0].name).toBe('Agent 1');
    expect(caps[0].type).toBe('analysis');
    expect(caps[0].autonomyLevel).toBe('supervised');
    expect(caps[1].autonomyLevel).toBe('highly-autonomous');
  });

  it('preserves quality threshold', () => {
    const agents = _makeAgents(1);
    const caps = mapAgentsToCapabilities(agents);
    expect(caps[0].qualityThreshold).toBe(80);
  });

  it('handles empty agents array', () => {
    const caps = mapAgentsToCapabilities([]);
    expect(caps).toHaveLength(0);
  });
});

// ========================================
// GATE MAPPING
// ========================================

describe('Gate Mapping in Sections', () => {
  it('maps gate thresholds to quality checks', () => {
    const phases = _makePhases(1);
    const gates = _makeGates(1);
    const rels = [{ '@type': 'pe:hasGate', from: phases[0]['@id'], to: gates[0]['@id'] }];
    const sections = mapPhasesToSections(phases, gates, [], rels);
    expect(sections[0].qualityGates[0].threshold).toBe(80);
    expect(sections[0].qualityGates[0].type).toBe('quality');
    expect(sections[0].qualityGates[0].blocking).toBe(true);
  });

  it('marks automated gates correctly', () => {
    const phases = _makePhases(1);
    const gates = [{ '@id': 'g1', '@type': 'pe:ProcessGate', gateId: 'g1', gateName: 'Auto Gate', gateType: 'compliance', threshold: 85, automated: true, blockingFactor: 'blocking' }];
    const rels = [{ '@type': 'pe:hasGate', from: phases[0]['@id'], to: 'g1' }];
    const sections = mapPhasesToSections(phases, gates, [], rels);
    expect(sections[0].qualityGates[0].automated).toBe(true);
  });

  it('handles phases with no gates', () => {
    const phases = _makePhases(2);
    const sections = mapPhasesToSections(phases, [], [], []);
    expect(sections[0].qualityGates).toHaveLength(0);
    expect(sections[1].qualityGates).toHaveLength(0);
  });
});

// ========================================
// TEMPLATE SCAFFOLDING (one per recommendation)
// ========================================

describe('Template Scaffolding', () => {
  const process = _makeProcess();
  const phases = _makePhases(3);
  const agents = _makeAgents(2);
  const gates = _makeGates(2);
  const patterns = _makePatterns(1);
  const artifacts = _makeArtifacts(2);
  const metrics = _makeMetrics(2);
  const rels = _makeRelationships(phases, gates, artifacts);

  it('scaffolds SKILL_SIMPLE with frontmatter only', () => {
    const result = scaffoldFromRecommendation('SKILL_SIMPLE', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result).not.toBeNull();
    expect(result.markdown).toContain('---');
    expect(result.markdown).toContain('name: "Test Process"');
    expect(result.markdown).toContain('recommendation: "SKILL_SIMPLE"');
  });

  it('scaffolds SKILL_STANDALONE with phase-mapped sections', () => {
    const result = scaffoldFromRecommendation('SKILL_STANDALONE', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.markdown).toContain('Section 1: Phase 1');
    expect(result.markdown).toContain('Section 2: Phase 2');
    expect(result.markdown).toContain('Section 3: Phase 3');
    expect(result.markdown).toContain('Quality Gates');
  });

  it('scaffolds SKILL_WITH_MCP with MCP config', () => {
    const result = scaffoldFromRecommendation('SKILL_WITH_MCP', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.markdown).toContain('Section 1');
    expect(result.mcpConfig).toBeDefined();
    expect(result.mcpConfig.mcpServers).toBeDefined();
  });

  it('scaffolds AGENT_ORCHESTRATOR with orchestrator tier', () => {
    const result = scaffoldFromRecommendation('AGENT_ORCHESTRATOR', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.markdown).toContain('**Tier**: Orchestrator');
    expect(result.markdown).toContain('Agent Capabilities');
    expect(result.markdown).toContain('Agent 1');
  });

  it('scaffolds AGENT_SPECIALIST with specialist tier', () => {
    const result = scaffoldFromRecommendation('AGENT_SPECIALIST', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.markdown).toContain('**Tier**: Specialist');
  });

  it('scaffolds AGENT_UTILITY with utility tier', () => {
    const result = scaffoldFromRecommendation('AGENT_UTILITY', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.markdown).toContain('**Tier**: Utility');
  });

  it('scaffolds AGENT_STANDALONE with standalone tier', () => {
    const result = scaffoldFromRecommendation('AGENT_STANDALONE', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.markdown).toContain('**Tier**: Standalone');
  });

  it('scaffolds PLUGIN_LIGHTWEIGHT with manifest', () => {
    const result = scaffoldFromRecommendation('PLUGIN_LIGHTWEIGHT', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.manifest).toBeDefined();
    expect(result.manifest.name).toBe('test-process');
    expect(result.manifest.skills).toHaveLength(1);
  });

  it('scaffolds PLUGIN_CLAUDECODE with manifest', () => {
    const result = scaffoldFromRecommendation('PLUGIN_CLAUDECODE', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.manifest).toBeDefined();
    expect(result.manifest.commands).toContain('/test-process');
  });

  it('scaffolds PLUGIN_COWORK with cowork UI config', () => {
    const result = scaffoldFromRecommendation('PLUGIN_COWORK', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.manifest).toBeDefined();
    expect(result.manifest.cowork).toBeDefined();
    expect(result.manifest.cowork.ui.panel).toBe(true);
  });

  it('scaffolds PLUGIN_CLAUDECODE_WITH_AGENT with agent directory', () => {
    const result = scaffoldFromRecommendation('PLUGIN_CLAUDECODE_WITH_AGENT', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.manifest).toBeDefined();
    expect(result.manifest.agents).toHaveLength(1);
    expect(result.markdown).toContain('Agent Capabilities');
  });

  it('scaffolds PLUGIN_COWORK_WITH_AGENT with agent + cowork', () => {
    const result = scaffoldFromRecommendation('PLUGIN_COWORK_WITH_AGENT', process, phases, agents, gates, patterns, artifacts, metrics, rels);
    expect(result.manifest).toBeDefined();
    expect(result.manifest.agents).toHaveLength(1);
    expect(result.manifest.cowork).toBeDefined();
  });
});

// ========================================
// REGISTRY ARTIFACT OUTPUT
// ========================================

describe('Registry Artifact Output', () => {
  beforeEach(_resetState);

  it('generates valid JSON-LD with @context and @type', () => {
    const process = _makeProcess();
    const scaffold = { markdown: '# Test', manifest: null };
    const artifact = buildRegistryArtifact(scaffold, process, 'SKILL_STANDALONE');
    expect(artifact['@context']).toBeDefined();
    expect(artifact['@context'].pfc).toBe('https://platformcore.io/ontology/');
    expect(artifact['@type']).toBe('pfc:RegistryArtifact');
    expect(artifact['pfc:artifactType']).toBe('skill');
    expect(artifact['pfc:derivedFromProcess']).toBe('pe:test-001');
    expect(artifact['pfc:joinPattern']).toBe('JP-PE-SK-001');
  });

  it('sets correct artifact type based on recommendation category', () => {
    const process = _makeProcess();
    const scaffold = { markdown: '# Test', manifest: null };

    const skill = buildRegistryArtifact(scaffold, process, 'SKILL_STANDALONE');
    expect(skill['pfc:artifactType']).toBe('skill');

    const agent = buildRegistryArtifact(scaffold, process, 'AGENT_ORCHESTRATOR');
    expect(agent['pfc:artifactType']).toBe('agent');

    const plugin = buildRegistryArtifact({ markdown: '# Test', manifest: {} }, process, 'PLUGIN_CLAUDECODE');
    expect(plugin['pfc:artifactType']).toBe('plugin');
    expect(plugin['pfc:components']).toContain('plugin.json');
  });
});

// ========================================
// MERMAID WORKFLOW EXPORT
// ========================================

describe('Mermaid Workflow Export', () => {
  it('generates valid Mermaid flowchart from sections', () => {
    const phases = _makePhases(3);
    const gates = _makeGates(2);
    const rels = _makeRelationships(phases, gates, []);
    const sections = mapPhasesToSections(phases, gates, [], rels);

    const mermaid = generateWorkflowMermaid(sections, 'Test Process');
    expect(mermaid).toContain('flowchart TD');
    expect(mermaid).toContain('Start: Test Process');
    expect(mermaid).toContain('S1');
    expect(mermaid).toContain('S2');
    expect(mermaid).toContain('S3');
    expect(mermaid).toContain('DONE');
  });

  it('returns empty string for empty sections', () => {
    expect(generateWorkflowMermaid([], 'Test')).toBe('');
  });
});

// ========================================
// EDGE CASES
// ========================================

describe('Edge Cases', () => {
  beforeEach(_resetState);

  it('handles process with no agents', () => {
    const result = scaffoldFromRecommendation(
      'SKILL_STANDALONE', _makeProcess(), _makePhases(2), [], _makeGates(1), [], _makeArtifacts(1), _makeMetrics(1), [],
    );
    expect(result).not.toBeNull();
    expect(result.markdown).not.toContain('Agent Capabilities');
  });

  it('handles process with no gates', () => {
    const result = scaffoldFromRecommendation(
      'SKILL_STANDALONE', _makeProcess(), _makePhases(2), [], [], [], [], [], [],
    );
    expect(result).not.toBeNull();
    expect(result.markdown).not.toContain('Quality Gates');
  });

  it('returns null for NO_ACTION_INLINE_PROMPTING', () => {
    const result = scaffoldFromRecommendation(
      'NO_ACTION_INLINE_PROMPTING', _makeProcess(), _makePhases(1), [], [], [], [], [], [],
    );
    expect(result).toBeNull();
  });
});

// ========================================
// EXTRACT PROCESS ENTITIES
// ========================================

describe('Extract Process Entities', () => {
  it('extracts entities by type from template data', () => {
    const templateData = {
      entities: [
        { '@id': 'p1', '@type': 'pe:Process', processId: 'p1', processName: 'P1' },
        { '@id': 'ph1', '@type': 'pe:ProcessPhase', phaseNumber: 1, phaseName: 'Phase 1' },
        { '@id': 'ph2', '@type': 'pe:ProcessPhase', phaseNumber: 2, phaseName: 'Phase 2' },
        { '@id': 'a1', '@type': 'pe:AIAgent', agentName: 'Agent 1' },
        { '@id': 'g1', '@type': 'pe:ProcessGate', gateName: 'Gate 1' },
        { '@id': 'pat1', '@type': 'pe:ProcessPattern', patternName: 'Pattern 1' },
        { '@id': 'art1', '@type': 'pe:ProcessArtifact', artifactName: 'Art 1' },
        { '@id': 'met1', '@type': 'pe:ProcessMetric', metricName: 'Met 1' },
      ],
      relationships: [
        { '@type': 'pe:hasPhase', from: 'p1', to: 'ph1' },
      ],
    };

    const result = extractProcessEntities(templateData);
    expect(result.process).toBeDefined();
    expect(result.process.processName).toBe('P1');
    expect(result.phases).toHaveLength(2);
    expect(result.agents).toHaveLength(1);
    expect(result.gates).toHaveLength(1);
    expect(result.patterns).toHaveLength(1);
    expect(result.artifacts).toHaveLength(1);
    expect(result.metrics).toHaveLength(1);
    expect(result.relationships).toHaveLength(1);
  });

  it('handles template with no entities', () => {
    const result = extractProcessEntities({ entities: [], relationships: [] });
    expect(result.process).toBeNull();
    expect(result.phases).toHaveLength(0);
  });

  it('extracts PE-ONT v4.0.0 entity types (skills, plugins, paths, hypotheses, valueChains)', () => {
    const templateData = {
      entities: [
        { '@id': 'p1', '@type': 'pe:Process', processId: 'p1', processName: 'P1' },
        { '@id': 's1', '@type': 'pe:Skill', skillName: 'Skill 1', skillDependsOn: 's2' },
        { '@id': 's2', '@type': 'pe:Skill', skillName: 'Skill 2' },
        { '@id': 'pl1', '@type': 'pe:Plugin', pluginName: 'Plugin 1', cascadeTier: 'PFC' },
        { '@id': 'pp1', '@type': 'pe:ProcessPath', pathName: 'Main Path' },
        { '@id': 'ps1', '@type': 'pe:PathStep', stepName: 'Step 1' },
        { '@id': 'ps2', '@type': 'pe:PathStep', stepName: 'Step 2' },
        { '@id': 'pl1link', '@type': 'pe:PathLink', linkType: 'sequential' },
        { '@id': 'h1', '@type': 'pe:Hypothesis', statement: 'Test hypothesis' },
        { '@id': 'vc1', '@type': 'pe:ValueChain', chainName: 'Test chain' },
      ],
      relationships: [],
    };

    const result = extractProcessEntities(templateData);
    expect(result.skills).toHaveLength(2);
    expect(result.plugins).toHaveLength(1);
    expect(result.paths).toHaveLength(1);
    expect(result.pathSteps).toHaveLength(2);
    expect(result.pathLinks).toHaveLength(1);
    expect(result.hypotheses).toHaveLength(1);
    expect(result.valueChains).toHaveLength(1);
  });
});

// ========================================
// PE-ONT v4.0.0 HEURISTIC IMPROVEMENTS (S40.24.5)
// ========================================

describe('PE-ONT v4.0.0 Heuristic Improvements', () => {
  beforeEach(_resetState);

  it('hypothesis presence boosts HG-01 C0 ambiguity score', () => {
    const { gateScores: withH } = extractProcessSignals(
      _makeProcess(), _makePhases(2), [], [], [], [], [],
      { hypotheses: [{ '@id': 'h1', '@type': 'pe:Hypothesis', statement: 'test' }] },
    );
    const { gateScores: noH } = extractProcessSignals(
      _makeProcess(), _makePhases(2), [], [], [], [], [], {},
    );
    expect(withH['HG-01'][0]).toBeGreaterThan(noH['HG-01'][0]);
  });

  it('hypothesis bonus is capped at 10', () => {
    const { gateScores } = extractProcessSignals(
      _makeProcess({ automationLevel: 95 }), _makePhases(2), [], [], [], [], [],
      { hypotheses: [{ '@id': 'h1', '@type': 'pe:Hypothesis' }] },
    );
    expect(gateScores['HG-01'][0]).toBeLessThanOrEqual(10);
  });

  it('formal skill count boosts HG-03 C0 over phase-based fallback', () => {
    const skills = Array.from({ length: 4 }, (_, i) => ({ '@id': `s${i}`, '@type': 'pe:Skill', skillName: `Skill ${i}` }));
    const { gateScores: withSkills } = extractProcessSignals(
      _makeProcess(), _makePhases(2), [], [], [], [], [],
      { skills },
    );
    const { gateScores: noSkills } = extractProcessSignals(
      _makeProcess(), _makePhases(2), [], [], [], [], [], {},
    );
    expect(withSkills['HG-03'][0]).toBeGreaterThan(noSkills['HG-03'][0]);
  });

  it('skill chains boost HG-01 C3 coordination score', () => {
    const skills = [
      { '@id': 's1', '@type': 'pe:Skill', skillName: 'S1', skillDependsOn: 's2' },
      { '@id': 's2', '@type': 'pe:Skill', skillName: 'S2', skillDependsOn: 's3' },
      { '@id': 's3', '@type': 'pe:Skill', skillName: 'S3' },
    ];
    const { gateScores: withChains } = extractProcessSignals(
      _makeProcess(), _makePhases(2), [], [], [], [], [],
      { skills },
    );
    const { gateScores: noChains } = extractProcessSignals(
      _makeProcess(), _makePhases(2), [], [], [], [], [], {},
    );
    expect(withChains['HG-01'][3]).toBeGreaterThan(noChains['HG-01'][3]);
  });

  it('cascade plugin boosts HG-03 C1 score', () => {
    const plugins = [{ '@id': 'pl1', '@type': 'pe:Plugin', cascadeTier: 'PFC' }];
    const { gateScores: withPlugin } = extractProcessSignals(
      _makeProcess(), _makePhases(2), [], [], [], [], [],
      { plugins },
    );
    const { gateScores: noPlugin } = extractProcessSignals(
      _makeProcess(), _makePhases(2), [], [], [], [], [], {},
    );
    expect(withPlugin['HG-03'][1]).toBeGreaterThanOrEqual(7);
    expect(withPlugin['HG-03'][1]).toBeGreaterThan(noPlugin['HG-03'][1]);
  });

  it('signals include v4.0.0 entity counts', () => {
    const skills = [{ '@id': 's1', '@type': 'pe:Skill' }];
    const plugins = [{ '@id': 'pl1', '@type': 'pe:Plugin', cascadeTier: 'PFC' }];
    const hypotheses = [{ '@id': 'h1', '@type': 'pe:Hypothesis' }];
    const { signals } = extractProcessSignals(
      _makeProcess(), _makePhases(2), [], [], [], [], [],
      { skills, plugins, hypotheses },
    );
    expect(signals.skillCount).toBe(1);
    expect(signals.pluginCount).toBe(1);
    expect(signals.hypothesisCount).toBe(1);
    expect(signals.hasCascadePlugin).toBe(true);
  });

  it('prefillDTFromProcess passes extras to extractProcessSignals', () => {
    const extras = {
      skills: [{ '@id': 's1', '@type': 'pe:Skill', skillDependsOn: 's2' }],
      hypotheses: [{ '@id': 'h1', '@type': 'pe:Hypothesis' }],
    };
    const signals = prefillDTFromProcess(
      _makeProcess(), _makePhases(3), _makeAgents(2), _makeGates(2), _makePatterns(1), _makeArtifacts(1), _makeMetrics(1), extras,
    );
    expect(signals.skillCount).toBe(1);
    expect(signals.hypothesisCount).toBe(1);
    expect(signals.hasSkillChains).toBe(true);
    expect(state.dtAllScores['HG-01']).toHaveLength(4);
  });
});

// ========================================
// AGENT CAPABILITY MAPPING WITH SKILLS (S40.24.5)
// ========================================

describe('Agent Capability Mapping with Skills', () => {
  it('resolves agentProvidesSkill relationships to formal skill names', () => {
    const agents = [{ '@id': 'a1', '@type': 'pe:AIAgent', agentName: 'Agent 1', capabilities: 'old caps' }];
    const skills = [
      { '@id': 's1', '@type': 'pe:Skill', skillName: 'pfc-kpi' },
      { '@id': 's2', '@type': 'pe:Skill', skillName: 'pfc-vp' },
    ];
    const relationships = [
      { '@type': 'pe:agentProvidesSkill', from: 'a1', to: 's1' },
      { '@type': 'pe:agentProvidesSkill', from: 'a1', to: 's2' },
    ];
    const caps = mapAgentsToCapabilities(agents, skills, relationships);
    expect(caps[0].capabilities).toBe('pfc-kpi; pfc-vp');
    expect(caps[0].linkedSkills).toEqual(['s1', 's2']);
  });

  it('falls back to free-text capabilities when no skills linked', () => {
    const agents = [{ '@id': 'a1', '@type': 'pe:AIAgent', agentName: 'Agent 1', capabilities: 'legacy caps' }];
    const caps = mapAgentsToCapabilities(agents, [], []);
    expect(caps[0].capabilities).toBe('legacy caps');
    expect(caps[0].linkedSkills).toEqual([]);
  });

  it('backward compatible with no skills/relationships args', () => {
    const agents = _makeAgents(1);
    const caps = mapAgentsToCapabilities(agents);
    expect(caps).toHaveLength(1);
    expect(caps[0].linkedSkills).toEqual([]);
  });
});
