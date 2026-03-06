/**
 * Skill Builder — F34.11 (Process-to-Skill Template Scaffolding)
 *
 * Bridges PE-ONT process definitions with the Dtree (Decision Tree) engine
 * to scaffold skill, plugin, and agent templates. Extracts process signals
 * (phases, gates, agents, patterns) and maps them to template artifacts.
 *
 * Pipeline: PE Process → Auto-Score Extraction → Dtree Recommendation → Template Scaffold
 *
 * @module skill-builder
 */

import { state } from './state.js';
import { RECOMMENDATIONS, getRecommendation, generateDecisionRecord } from './decision-tree.js';

// ========================================
// PROCESS SIGNAL EXTRACTION
// ========================================

/**
 * Autonomy level to numeric score mapping.
 * @type {Object<string, number>}
 */
const AUTONOMY_SCORES = {
  'highly-autonomous': 9,
  'hybrid': 7,
  'supervised': 5,
  'manual': 2,
};

/**
 * Process type to state-maintenance score mapping (HG-01 C2).
 * @type {Object<string, number>}
 */
const PROCESS_TYPE_STATE_SCORES = {
  discovery: 7,
  optimization: 7,
  analysis: 6,
  governance: 5,
  development: 4,
  deployment: 3,
  custom: 5,
};

/**
 * Extract heuristic Dtree criterion scores from a PE process entity and its
 * related entities. Returns pre-fill scores for HG-01 and the likely next
 * gates based on process characteristics.
 *
 * PE-ONT v4.0.0: accepts optional extras containing Skill, Plugin, Hypothesis,
 * and ValueChain entities for improved heuristic accuracy.
 *
 * @param {Object} processEntity - The pe:Process entity
 * @param {Object[]} phases - pe:ProcessPhase entities linked to this process
 * @param {Object[]} agents - pe:AIAgent entities linked to this process
 * @param {Object[]} gates - pe:ProcessGate entities linked to this process
 * @param {Object[]} patterns - pe:ProcessPattern entities linked to this process
 * @param {Object[]} artifacts - pe:ProcessArtifact entities linked to this process
 * @param {Object[]} metrics - pe:ProcessMetric entities linked to this process
 * @param {Object} [extras={}] - PE-ONT v4.0.0 entity arrays { skills, plugins, hypotheses, valueChains }
 * @returns {Object} { gateScores: {gateId: [s0,s1,s2,s3]}, signals: {key: value} }
 */
export function extractProcessSignals(processEntity, phases, agents, gates, patterns, artifacts = [], metrics = [], extras = {}) {
  const p = processEntity || {};
  const automationLevel = p.automationLevel ?? 0;
  const processType = p.processType || 'custom';
  const agentCount = agents.length;
  const hasParallel = phases.some(ph => ph.parallelExecution === true);
  const hasAutomatedGates = gates.some(g => g.automated === true);
  const patternCount = patterns.length;

  // PE-ONT v4.0.0 entity types
  const skills = extras.skills || [];
  const plugins = extras.plugins || [];
  const hypotheses = extras.hypotheses || [];

  // Derived v4.0.0 signals
  const formalSkillCount = skills.length;
  const skillChainCount = skills.filter(s => s.skillDependsOn).length;
  const hasCascadePlugin = plugins.some(p => p.cascadeTier);

  // Highest autonomy level among agents
  const maxAutonomy = agents.reduce((max, a) => {
    const s = AUTONOMY_SCORES[a.autonomyLevel] || 0;
    return s > max ? s : max;
  }, 0);

  // HG-01: Autonomy Assessment [C0: ambiguity, C1: decisions, C2: state, C3: coordinates]
  const baseC0 = automationLevel > 50 ? Math.min(Math.round(automationLevel / 10), 10) : Math.max(Math.round(automationLevel / 15), 1);
  const hg01 = [
    Math.min(baseC0 + (hypotheses.length > 0 ? 3 : 0), 10),
    agentCount > 0 ? maxAutonomy : (automationLevel > 30 ? 4 : 2),
    PROCESS_TYPE_STATE_SCORES[processType] || 5,
    skillChainCount > 0 ? Math.min(skillChainCount + 5, 10) : (agentCount > 2 ? 8 : agentCount > 0 ? 5 : 1),
  ];

  // HG-02: Orchestration Scope [C0: multi-domain, C1: parallel, C2: workflow state, C3: human-in-loop]
  const hg02 = [
    agentCount > 2 ? 8 : agentCount > 1 ? 6 : 3,
    hasParallel ? 7 : 3,
    phases.length > 3 ? 7 : phases.length > 1 ? 5 : 2,
    gates.some(g => !g.automated && g.blockingFactor === 'blocking') ? 7 : 3,
  ];

  // HG-03: Bundling Requirement [C0: multiple skills, C1: MCP integrations, C2: commands, C3: team role]
  const hg03 = [
    formalSkillCount > 0 ? Math.min(formalSkillCount + 3, 10) : (phases.length > 3 ? 7 : phases.length > 1 ? 5 : 2),
    hasCascadePlugin ? 7 : (agents.some(a => a.model && a.model.includes('+')) ? 6 : 3),
    artifacts.length > 3 ? 7 : artifacts.length > 0 ? 4 : 2,
    patternCount > 0 ? 6 : 3,
  ];

  // HG-04: Task Complexity [C0: instructions length, C1: scripts needed, C2: repeatable, C3: quality std]
  const hg04 = [
    phases.length > 3 ? 8 : phases.length > 1 ? 6 : 3,
    agents.length > 0 ? 7 : 3,
    patternCount > 0 ? 8 : (phases.length > 1 ? 5 : 3),
    hasAutomatedGates ? 8 : (gates.length > 0 ? 5 : 2),
  ];

  // HG-05: Agent Distribution [C0: multi-instance, C1: ships with tools, C2: version mgmt, C3: GUI]
  const hg05 = [5, agentCount > 0 ? 7 : 3, 5, 3];

  // HG-06: User Persona [C0: non-devs, C1: GUI, C2: conversational, C3: org-wide]
  const hg06 = [3, 3, 5, 3];

  // HG-07: Skill Enhancement [C0: 1-2 extras, C1: skill primary, C2: maintenance, C3: cross-platform]
  const hg07 = [
    agentCount <= 1 ? 8 : 4,
    phases.length > 0 ? 7 : 4,
    patternCount > 0 ? 3 : 7,
    7,
  ];

  const signals = {
    automationLevel,
    processType,
    agentCount,
    phaseCount: phases.length,
    gateCount: gates.length,
    patternCount,
    artifactCount: artifacts.length,
    metricCount: metrics.length,
    hasParallelPhases: hasParallel,
    hasAutomatedGates,
    maxAutonomyLevel: maxAutonomy,
    skillCount: formalSkillCount,
    pluginCount: plugins.length,
    hypothesisCount: hypotheses.length,
    hasSkillChains: skillChainCount > 0,
    hasCascadePlugin,
  };

  return {
    gateScores: {
      'HG-01': hg01,
      'HG-02': hg02,
      'HG-03': hg03,
      'HG-04': hg04,
      'HG-05': hg05,
      'HG-06': hg06,
      'HG-07': hg07,
    },
    signals,
  };
}

/**
 * Pre-fill Dtree state from a PE process entity. Populates dtAllScores
 * as suggestions and sets dtProblemStatement from the process objective.
 *
 * @param {Object} processEntity - pe:Process entity
 * @param {Object[]} phases - pe:ProcessPhase entities
 * @param {Object[]} agents - pe:AIAgent entities
 * @param {Object[]} gates - pe:ProcessGate entities
 * @param {Object[]} patterns - pe:ProcessPattern entities
 * @param {Object[]} artifacts - pe:ProcessArtifact entities
 * @param {Object[]} metrics - pe:ProcessMetric entities
 * @param {Object} [extras={}] - PE-ONT v4.0.0 entity arrays { skills, plugins, hypotheses, valueChains }
 * @returns {Object} The extracted signals summary
 */
export function prefillDTFromProcess(processEntity, phases, agents, gates, patterns, artifacts = [], metrics = [], extras = {}) {
  const { gateScores, signals } = extractProcessSignals(
    processEntity, phases, agents, gates, patterns, artifacts, metrics, extras,
  );
  state.dtAllScores = { ...gateScores };
  state.dtProblemStatement = processEntity.businessObjective || processEntity.description || '';
  state.dtEvaluator = processEntity.owner || '';
  return signals;
}

// ========================================
// TEMPLATE SCAFFOLDING ENGINE
// ========================================

/**
 * Map process phases to skill workflow sections.
 * @param {Object[]} phases - Sorted pe:ProcessPhase entities
 * @param {Object[]} gates - pe:ProcessGate entities
 * @param {Object[]} artifacts - pe:ProcessArtifact entities
 * @param {Object[]} relationships - relationship triples
 * @returns {Object[]} Mapped sections: [{number, name, instructions, prerequisites, successCriteria, outputs, qualityGates}]
 */
export function mapPhasesToSections(phases, gates = [], artifacts = [], relationships = []) {
  const sorted = [...phases].sort((a, b) => (a.phaseNumber || 0) - (b.phaseNumber || 0));

  return sorted.map((phase, idx) => {
    // Find gates linked to this phase
    const phaseGates = gates.filter(g =>
      relationships.some(r =>
        r['@type'] === 'pe:hasGate' && r.from === phase['@id'] && r.to === g['@id'],
      ),
    );

    // Find artifacts produced by this phase
    const phaseArtifacts = artifacts.filter(a =>
      relationships.some(r =>
        r['@type'] === 'pe:produces' && r.from === phase['@id'] && r.to === a['@id'],
      ),
    );

    return {
      number: idx + 1,
      name: phase.phaseName || `Phase ${idx + 1}`,
      instructions: phase.activities || phase.description || '',
      prerequisites: phase.entryConditions || '',
      successCriteria: phase.exitConditions || '',
      estimatedDuration: phase.estimatedDuration || '',
      parallelExecution: phase.parallelExecution || false,
      outputs: phaseArtifacts.map(a => ({
        name: a.artifactName || a['@id'],
        type: a.artifactType || 'document',
        format: a.format || '',
        mandatory: a.mandatory !== false,
      })),
      qualityGates: phaseGates.map(g => ({
        name: g.gateName || g['@id'],
        type: g.gateType || 'quality',
        criteria: g.criteria || '',
        threshold: g.threshold || 0,
        automated: g.automated || false,
        blocking: g.blockingFactor === 'blocking',
      })),
    };
  });
}

/**
 * Map AI agents to capability definitions.
 * PE-ONT v4.0.0: resolves agentProvidesSkill relationships to formal pe:Skill
 * entities instead of relying on deprecated free-text capabilities.
 *
 * @param {Object[]} agents - pe:AIAgent entities
 * @param {Object[]} [skills=[]] - pe:Skill entities
 * @param {Object[]} [relationships=[]] - relationship triples from the template
 * @returns {Object[]} Capability definitions
 */
export function mapAgentsToCapabilities(agents, skills = [], relationships = []) {
  return agents.map(a => {
    // Resolve formal skills linked via agentProvidesSkill
    const linkedSkillIds = relationships
      .filter(r => r['@type'] === 'pe:agentProvidesSkill' && r.from === a['@id'])
      .map(r => r.to);
    const linkedSkills = skills.filter(s => linkedSkillIds.includes(s['@id']));

    return {
      id: a.agentId || a['@id'],
      name: a.agentName || a['@id'],
      type: a.agentType || 'custom',
      capabilities: linkedSkills.length > 0
        ? linkedSkills.map(s => s.skillName || s['@id']).join('; ')
        : (a.capabilities || ''),
      autonomyLevel: a.autonomyLevel || 'manual',
      model: a.model || '',
      qualityThreshold: a.qualityThreshold || 0,
      linkedSkills: linkedSkills.map(s => s['@id']),
    };
  });
}

// ── Shared markdown helpers ──

function _yamlFrontmatter(process, recKey, rec) {
  const lines = [
    '---',
    `name: "${(process.processName || process['@id'] || 'Untitled Process').replace(/"/g, '\\"')}"`,
    `version: "1.0.0"`,
    `derived-from-process: "${process.processId || process['@id'] || ''}"`,
    `recommendation: "${recKey}"`,
    `complexity: "${rec.complexity || ''}"`,
    `effort: "${rec.effort || ''}"`,
    `created: "${new Date().toISOString().split('T')[0]}"`,
    '---',
  ];
  return lines.join('\n');
}

function _sectionMarkdown(section) {
  const lines = [];
  lines.push(`## Section ${section.number}: ${section.name}`);
  if (section.prerequisites) {
    lines.push('', '### Prerequisites', section.prerequisites);
  }
  if (section.instructions) {
    lines.push('', '### Instructions', section.instructions);
  }
  if (section.outputs.length > 0) {
    lines.push('', '### Expected Outputs');
    for (const o of section.outputs) {
      lines.push(`- **${o.name}** (${o.type}, ${o.format})${o.mandatory ? ' [mandatory]' : ''}`);
    }
  }
  if (section.qualityGates.length > 0) {
    lines.push('', '### Quality Gates');
    for (const g of section.qualityGates) {
      lines.push(`- **${g.name}** — ${g.type}, threshold: ${g.threshold}%${g.automated ? ' [automated]' : ''}${g.blocking ? ' [blocking]' : ''}`);
      if (g.criteria) lines.push(`  - Criteria: ${g.criteria}`);
    }
  }
  if (section.successCriteria) {
    lines.push('', '### Success Criteria', section.successCriteria);
  }
  return lines.join('\n');
}

function _agentCapabilityMarkdown(cap) {
  const lines = [
    `### ${cap.name}`,
    `- **Type**: ${cap.type}`,
    `- **Autonomy**: ${cap.autonomyLevel}`,
    `- **Model**: ${cap.model || 'Not specified'}`,
    `- **Quality threshold**: ${cap.qualityThreshold}%`,
  ];
  if (cap.capabilities) {
    lines.push(`- **Capabilities**: ${cap.capabilities}`);
  }
  return lines.join('\n');
}

function _metricsMarkdown(metrics) {
  if (!metrics || metrics.length === 0) return '';
  const lines = ['## Success Metrics', ''];
  for (const m of metrics) {
    lines.push(`- **${m.metricName || m['@id']}** (${m.metricType || 'metric'}): target ${m.target}${m.unit ? ' ' + m.unit : ''}, collected ${m.collectionMethod || 'manually'} ${m.frequency || ''}`);
  }
  return lines.join('\n');
}

function _patternsMarkdown(patterns) {
  if (!patterns || patterns.length === 0) return '';
  const lines = ['## Applied Patterns', ''];
  for (const p of patterns) {
    lines.push(`### ${p.patternName || p['@id']}`);
    if (p.context) lines.push(`**Context**: ${p.context}`);
    if (p.problem) lines.push(`**Problem**: ${p.problem}`);
    if (p.solution) lines.push(`**Solution**: ${p.solution}`);
    if (p.benefits) lines.push(`**Benefits**: ${p.benefits}`);
    lines.push('');
  }
  return lines.join('\n');
}

// ── SKILL scaffolders ──

/**
 * Scaffold a Simple Skill (SKILL.md frontmatter only).
 */
export function scaffoldSkillSimple(process, sections, capabilities, metrics, patterns, recKey) {
  const rec = getRecommendation(recKey) || RECOMMENDATIONS.SKILL_SIMPLE;
  const md = [
    _yamlFrontmatter(process, recKey, rec),
    '',
    `# ${process.processName || 'Skill'}`,
    '',
    process.description || process.businessObjective || '',
  ].join('\n');

  return { markdown: md, jsonld: null, manifest: null };
}

/**
 * Scaffold a Standalone Skill (SKILL.md with phase-mapped sections).
 */
export function scaffoldSkillStandalone(process, sections, capabilities, metrics, patterns, recKey) {
  const rec = getRecommendation(recKey) || RECOMMENDATIONS.SKILL_STANDALONE;
  const parts = [
    _yamlFrontmatter(process, recKey, rec),
    '',
    `# ${process.processName || 'Skill'}`,
    '',
    process.description || process.businessObjective || '',
    '',
  ];

  for (const s of sections) {
    parts.push(_sectionMarkdown(s), '');
  }

  if (metrics.length > 0) parts.push(_metricsMarkdown(metrics), '');
  if (patterns.length > 0) parts.push(_patternsMarkdown(patterns), '');

  return { markdown: parts.join('\n'), jsonld: null, manifest: null };
}

/**
 * Scaffold a Skill + MCP Enhancement.
 */
export function scaffoldSkillWithMcp(process, sections, capabilities, metrics, patterns, recKey) {
  const base = scaffoldSkillStandalone(process, sections, capabilities, metrics, patterns, recKey);

  // MCP config stub
  const mcpConfig = {
    mcpServers: {
      'process-data': {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', './data'],
        description: `MCP server for ${process.processName || 'process'} data access`,
      },
    },
  };

  return {
    markdown: base.markdown,
    jsonld: null,
    manifest: null,
    mcpConfig,
  };
}

// ── AGENT scaffolders ──

function _agentTemplate(process, sections, capabilities, metrics, patterns, recKey, tier) {
  const rec = getRecommendation(recKey) || RECOMMENDATIONS[recKey];
  const parts = [
    _yamlFrontmatter(process, recKey, rec),
    '',
    `# Agent: ${process.processName || 'Agent'}`,
    '',
    `**Tier**: ${tier}`,
    `**Process Type**: ${process.processType || 'custom'}`,
    `**Automation Level**: ${process.automationLevel || 0}%`,
    '',
    process.description || process.businessObjective || '',
    '',
  ];

  // Agent capabilities section
  if (capabilities.length > 0) {
    parts.push('## Agent Capabilities', '');
    for (const cap of capabilities) {
      parts.push(_agentCapabilityMarkdown(cap), '');
    }
  }

  // Workflow sections from process phases
  if (sections.length > 0) {
    parts.push('## Workflow', '');
    for (const s of sections) {
      parts.push(_sectionMarkdown(s), '');
    }
  }

  if (metrics.length > 0) parts.push(_metricsMarkdown(metrics), '');
  if (patterns.length > 0) parts.push(_patternsMarkdown(patterns), '');

  return { markdown: parts.join('\n'), jsonld: null, manifest: null };
}

export function scaffoldAgentOrchestrator(process, sections, capabilities, metrics, patterns, recKey) {
  return _agentTemplate(process, sections, capabilities, metrics, patterns, recKey, 'Orchestrator');
}

export function scaffoldAgentSpecialist(process, sections, capabilities, metrics, patterns, recKey) {
  return _agentTemplate(process, sections, capabilities, metrics, patterns, recKey, 'Specialist');
}

export function scaffoldAgentUtility(process, sections, capabilities, metrics, patterns, recKey) {
  return _agentTemplate(process, sections, capabilities, metrics, patterns, recKey, 'Utility');
}

export function scaffoldAgentStandalone(process, sections, capabilities, metrics, patterns, recKey) {
  return _agentTemplate(process, sections, capabilities, metrics, patterns, recKey, 'Standalone');
}

// ── PLUGIN scaffolders ──

function _pluginManifest(process, recKey, rec, includeAgents = false, cowork = false) {
  const slug = (process.processName || 'plugin').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    name: slug,
    version: '1.0.0',
    description: process.description || process.businessObjective || '',
    derivedFromProcess: process.processId || process['@id'] || '',
    recommendation: recKey,
    skills: [`./${slug}-skill.md`],
    commands: [`/${slug}`],
    agents: includeAgents ? [`./${slug}-agent.md`] : [],
    mcpServers: {},
    cowork: cowork ? { ui: { panel: true, actions: true } } : undefined,
  };
}

export function scaffoldPluginLightweight(process, sections, capabilities, metrics, patterns, recKey) {
  const rec = getRecommendation(recKey) || RECOMMENDATIONS.PLUGIN_LIGHTWEIGHT;
  const skill = scaffoldSkillStandalone(process, sections, capabilities, metrics, patterns, recKey);
  return {
    markdown: skill.markdown,
    jsonld: null,
    manifest: _pluginManifest(process, recKey, rec),
  };
}

export function scaffoldPluginClaudeCode(process, sections, capabilities, metrics, patterns, recKey) {
  const rec = getRecommendation(recKey) || RECOMMENDATIONS.PLUGIN_CLAUDECODE;
  const skill = scaffoldSkillStandalone(process, sections, capabilities, metrics, patterns, recKey);
  return {
    markdown: skill.markdown,
    jsonld: null,
    manifest: _pluginManifest(process, recKey, rec),
  };
}

export function scaffoldPluginCowork(process, sections, capabilities, metrics, patterns, recKey) {
  const rec = getRecommendation(recKey) || RECOMMENDATIONS.PLUGIN_COWORK;
  const skill = scaffoldSkillStandalone(process, sections, capabilities, metrics, patterns, recKey);
  return {
    markdown: skill.markdown,
    jsonld: null,
    manifest: _pluginManifest(process, recKey, rec, false, true),
  };
}

export function scaffoldPluginCCAgent(process, sections, capabilities, metrics, patterns, recKey) {
  const rec = getRecommendation(recKey) || RECOMMENDATIONS.PLUGIN_CLAUDECODE_WITH_AGENT;
  const agent = _agentTemplate(process, sections, capabilities, metrics, patterns, recKey, 'Plugin-Embedded');
  return {
    markdown: agent.markdown,
    jsonld: null,
    manifest: _pluginManifest(process, recKey, rec, true),
  };
}

export function scaffoldPluginCoworkAgent(process, sections, capabilities, metrics, patterns, recKey) {
  const rec = getRecommendation(recKey) || RECOMMENDATIONS.PLUGIN_COWORK_WITH_AGENT;
  const agent = _agentTemplate(process, sections, capabilities, metrics, patterns, recKey, 'Cowork-Embedded');
  return {
    markdown: agent.markdown,
    jsonld: null,
    manifest: _pluginManifest(process, recKey, rec, true, true),
  };
}

// ── DISPATCHER ──

const SCAFFOLD_MAP = {
  SKILL_SIMPLE: scaffoldSkillSimple,
  SKILL_STANDALONE: scaffoldSkillStandalone,
  SKILL_WITH_MCP: scaffoldSkillWithMcp,
  AGENT_ORCHESTRATOR: scaffoldAgentOrchestrator,
  AGENT_SPECIALIST: scaffoldAgentSpecialist,
  AGENT_UTILITY: scaffoldAgentUtility,
  AGENT_STANDALONE: scaffoldAgentStandalone,
  PLUGIN_LIGHTWEIGHT: scaffoldPluginLightweight,
  PLUGIN_CLAUDECODE: scaffoldPluginClaudeCode,
  PLUGIN_COWORK: scaffoldPluginCowork,
  PLUGIN_CLAUDECODE_WITH_AGENT: scaffoldPluginCCAgent,
  PLUGIN_COWORK_WITH_AGENT: scaffoldPluginCoworkAgent,
};

/**
 * Scaffold a template artifact from a Dtree recommendation and PE process data.
 *
 * @param {string} recKey - Recommendation key (e.g. 'SKILL_STANDALONE')
 * @param {Object} processEntity - pe:Process entity
 * @param {Object[]} phases - pe:ProcessPhase entities
 * @param {Object[]} agents - pe:AIAgent entities
 * @param {Object[]} gates - pe:ProcessGate entities
 * @param {Object[]} patterns - pe:ProcessPattern entities
 * @param {Object[]} artifacts - pe:ProcessArtifact entities
 * @param {Object[]} metrics - pe:ProcessMetric entities
 * @param {Object[]} relationships - relationship triples from the template
 * @param {Object[]} [skills=[]] - pe:Skill entities (PE-ONT v4.0.0)
 * @returns {{ markdown: string, jsonld: Object|null, manifest: Object|null, mcpConfig?: Object }|null}
 */
export function scaffoldFromRecommendation(
  recKey, processEntity, phases, agents, gates, patterns, artifacts, metrics, relationships, skills = [],
) {
  if (recKey === 'NO_ACTION_INLINE_PROMPTING') return null;

  const fn = SCAFFOLD_MAP[recKey];
  if (!fn) return null;

  const sections = mapPhasesToSections(phases, gates, artifacts, relationships || []);
  const capabilities = mapAgentsToCapabilities(agents, skills, relationships || []);

  return fn(processEntity, sections, capabilities, metrics || [], patterns || [], recKey);
}

// ========================================
// REGISTRY ARTIFACT OUTPUT (JSON-LD)
// ========================================

/**
 * Build a PFC Registry Artifact JSON-LD from scaffold output.
 *
 * @param {{ markdown: string, manifest?: Object }} scaffold - Output from scaffoldFromRecommendation
 * @param {Object} processEntity - pe:Process entity
 * @param {string} recKey - Recommendation key
 * @returns {Object} JSON-LD registry artifact
 */
export function buildRegistryArtifact(scaffold, processEntity, recKey) {
  const rec = getRecommendation(recKey) || {};
  const processId = processEntity.processId || processEntity['@id'] || 'unknown';
  const slug = processId.replace(/[^a-zA-Z0-9-]/g, '-');

  // Determine artifact type from recommendation key
  let artifactType = 'skill';
  if (recKey.startsWith('AGENT_')) artifactType = 'agent';
  else if (recKey.startsWith('PLUGIN_')) artifactType = 'plugin';

  // Build components list
  const components = ['SKILL.md'];
  if (scaffold.manifest) components.push('plugin.json');
  if (scaffold.mcpConfig) components.push('mcp-config.json');
  if (artifactType === 'agent') components.push('agent.md');

  // Link to decision record if available
  const decisionRecord = generateDecisionRecord();

  return {
    '@context': {
      pfc: 'https://platformcore.io/ontology/',
      pe: 'https://oaa-ontology.org/v6/process-engineering/',
      dt: 'https://platformcore.io/ontology/dt/',
      schema: 'https://schema.org/',
    },
    '@type': 'pfc:RegistryArtifact',
    '@id': `pfc:${artifactType}-${slug}-v1.0.0`,
    'pfc:artifactType': artifactType,
    'pfc:scope': 'instance',
    'pfc:status': 'draft',
    'pfc:version': '1.0.0',
    'pfc:created': new Date().toISOString().split('T')[0],
    'pfc:derivedFromProcess': processId,
    'pfc:recommendation': recKey,
    'pfc:complexity': rec.complexity || '',
    'pfc:estimatedEffort': rec.effort || '',
    'pfc:components': components,
    'pfc:decisionRecord': decisionRecord ? decisionRecord['@id'] : null,
    'pfc:joinPattern': 'JP-PE-SK-001',
  };
}

// ========================================
// MERMAID WORKFLOW EXPORT
// ========================================

/**
 * Generate a Mermaid flowchart of the scaffolded skill workflow.
 * Shows process phases as steps with gates as decision diamonds.
 *
 * @param {Object[]} sections - Mapped sections from mapPhasesToSections
 * @param {string} processName - Process name for the title
 * @returns {string} Mermaid syntax
 */
export function generateWorkflowMermaid(sections, processName) {
  if (!sections || sections.length === 0) return '';

  const lines = ['flowchart TD'];
  const safe = s => s.replace(/[^a-zA-Z0-9]/g, '_');

  lines.push(`    START(["Start: ${processName || 'Process'}"])`);

  for (const s of sections) {
    const nodeId = `S${s.number}`;
    lines.push(`    ${nodeId}["Section ${s.number}: ${s.name}"]`);

    for (let gi = 0; gi < s.qualityGates.length; gi++) {
      const g = s.qualityGates[gi];
      const gateId = `${nodeId}_G${gi}`;
      lines.push(`    ${gateId}{{"${g.name}\\nThreshold: ${g.threshold}%"}}`);
    }
  }

  lines.push('    DONE(["Complete"])');

  // Edges
  lines.push(`    START --> S1`);
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const nodeId = `S${s.number}`;
    const nextId = i < sections.length - 1 ? `S${sections[i + 1].number}` : 'DONE';

    if (s.qualityGates.length > 0) {
      lines.push(`    ${nodeId} --> ${nodeId}_G0`);
      for (let gi = 0; gi < s.qualityGates.length - 1; gi++) {
        lines.push(`    ${nodeId}_G${gi} -->|"PASS"| ${nodeId}_G${gi + 1}`);
      }
      lines.push(`    ${nodeId}_G${s.qualityGates.length - 1} -->|"PASS"| ${nextId}`);
    } else {
      lines.push(`    ${nodeId} --> ${nextId}`);
    }
  }

  // Styling
  lines.push('');
  lines.push('    classDef section fill:#3b82f6,stroke:#333,color:#fff');
  lines.push('    classDef gate fill:#eab308,stroke:#333,color:#fff');
  lines.push('    classDef done fill:#22c55e,stroke:#333,color:#fff');

  const sectionNodes = sections.map(s => `S${s.number}`).join(',');
  lines.push(`    class ${sectionNodes} section`);
  lines.push('    class DONE done');

  const gateNodes = [];
  for (const s of sections) {
    for (let gi = 0; gi < s.qualityGates.length; gi++) {
      gateNodes.push(`S${s.number}_G${gi}`);
    }
  }
  if (gateNodes.length > 0) {
    lines.push(`    class ${gateNodes.join(',')} gate`);
  }

  return lines.join('\n');
}

// ========================================
// PROCESS ENTITY EXTRACTION FROM LOADED DATA
// ========================================

/**
 * Extract all PE process-related entities from a template/instance JSON-LD.
 * Handles the flat entity array format used in PE-ONT templates.
 *
 * PE-ONT v4.0.0: includes Skill, Plugin, ProcessPath, PathStep, PathLink,
 * Hypothesis, and ValueChain entity types.
 *
 * @param {Object} templateData - Parsed JSON-LD template (with entities[] and relationships[])
 * @returns {{ process: Object, phases: Object[], agents: Object[], gates: Object[], patterns: Object[], artifacts: Object[], metrics: Object[], skills: Object[], plugins: Object[], paths: Object[], pathSteps: Object[], pathLinks: Object[], hypotheses: Object[], valueChains: Object[], relationships: Object[] }}
 */
export function extractProcessEntities(templateData) {
  const entities = templateData.entities || [];
  const relationships = templateData.relationships || [];

  const byType = (type) => entities.filter(e => e['@type'] === type);

  return {
    process: byType('pe:Process')[0] || null,
    phases: byType('pe:ProcessPhase'),
    agents: byType('pe:AIAgent'),
    gates: byType('pe:ProcessGate'),
    patterns: byType('pe:ProcessPattern'),
    artifacts: byType('pe:ProcessArtifact'),
    metrics: byType('pe:ProcessMetric'),
    // PE-ONT v4.0.0 entity types
    skills: byType('pe:Skill'),
    plugins: byType('pe:Plugin'),
    paths: byType('pe:ProcessPath'),
    pathSteps: byType('pe:PathStep'),
    pathLinks: byType('pe:PathLink'),
    hypotheses: byType('pe:Hypothesis'),
    valueChains: byType('pe:ValueChain'),
    relationships,
  };
}
