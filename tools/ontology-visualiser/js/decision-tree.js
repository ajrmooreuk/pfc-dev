/**
 * Dtree (Decision Tree) Engine — F40.1 (Extensibility Decision Engine)
 *
 * Interactive hypothesis-testing decision engine for choosing the correct
 * automation mechanism: Skills, Plugins, or Agents. 7 hypothesis gates
 * with weighted scoring route to 12 terminal recommendations.
 *
 * Pure logic + vis-network rendering. Gate data translated from
 * PBS/STRATEGY/extensibility-decision-tree-v1.0.json.
 *
 * @module decision-tree
 */

import { state } from './state.js';

// ========================================
// LAYER DEFINITIONS
// ========================================

export const LAYERS = {
  L1_Capability: {
    name: 'Capability',
    color: '#ef4444',
    description: 'Determine if the need requires autonomous reasoning (Agent) or scripted execution (Skill/Plugin)',
    gates: ['HG-01', 'HG-02'],
  },
  L2_Composition: {
    name: 'Composition',
    color: '#3b82f6',
    description: 'Determine bundling requirements — standalone vs packaged',
    gates: ['HG-03', 'HG-04', 'HG-07'],
  },
  L3_Distribution: {
    name: 'Distribution',
    color: '#8b5cf6',
    description: 'Determine target users and distribution mechanism',
    gates: ['HG-05', 'HG-06'],
  },
};

// ========================================
// GATE DEFINITIONS (from ontology)
// ========================================

export const GATES = [
  {
    gateId: 'HG-01',
    layer: 'L1_Capability',
    name: 'Autonomy Assessment',
    hypothesis: 'This capability requires autonomous reasoning, judgment, or decision-making that goes beyond executing predefined instructions',
    testMethod: 'Evaluate whether the capability needs to: (a) interpret ambiguous inputs, (b) make contextual decisions, (c) adapt behavior based on state, (d) coordinate with other capabilities',
    evaluationCriteria: [
      { criterion: 'Requires interpretation of ambiguous or novel inputs', weight: 3, passExample: 'Analyzing a client\'s competitive landscape and recommending AI visibility strategy', failExample: 'Converting a CSV file into a formatted Excel spreadsheet' },
      { criterion: 'Must make decisions with incomplete information', weight: 3, passExample: 'Prioritizing gap analysis findings when multiple issues exist', failExample: 'Applying brand colors to a presentation template' },
      { criterion: 'Needs to maintain and reason over state across interactions', weight: 2, passExample: 'Tracking a client\'s AI visibility improvement over a 30-day engagement', failExample: 'Generating a single PDF report from provided data' },
      { criterion: 'Coordinates or delegates to other capabilities', weight: 2, passExample: 'Orchestrating discovery agents to feed analysis agents to produce strategy', failExample: 'Running a Python script to extract text from documents' },
    ],
    thresholds: {
      pass:    { minScore: 7, nextGate: 'HG-02' },
      partial: { minScore: 4, nextGate: 'HG-03' },
      fail:    { minScore: 0, nextGate: 'HG-04' },
    },
  },
  {
    gateId: 'HG-02',
    layer: 'L1_Capability',
    name: 'Orchestration Scope',
    hypothesis: 'This autonomous capability needs to orchestrate sub-agents, tools, or multi-step workflows beyond a single agent\'s scope',
    testMethod: 'Evaluate whether the capability: (a) spans multiple domains, (b) requires parallel execution, (c) needs workflow state management, (d) involves human-in-the-loop checkpoints',
    evaluationCriteria: [
      { criterion: 'Spans multiple domain ontologies or agent scopes', weight: 3, passExample: 'BAIV Discovery → Analysis → Generation → Optimization pipeline', failExample: 'Single-domain content quality analysis' },
      { criterion: 'Requires parallel or sequential sub-agent coordination', weight: 3, passExample: 'Running SEO audit, content analysis, and competitor research simultaneously', failExample: 'Sequential steps within a single analysis task' },
      { criterion: 'Needs persistent workflow state management', weight: 2, passExample: '30-day AI visibility engagement with checkpoints and deliverables', failExample: 'Stateless request-response analysis' },
      { criterion: 'Involves human-in-the-loop decision points', weight: 2, passExample: 'Strategy recommendations requiring executive approval before execution', failExample: 'Fully automated data transformation' },
    ],
    thresholds: {
      pass:    { minScore: 7, recommendation: 'AGENT_ORCHESTRATOR', nextGate: 'HG-05' },
      partial: { minScore: 4, recommendation: 'AGENT_SPECIALIST', nextGate: 'HG-05' },
      fail:    { minScore: 0, recommendation: 'AGENT_UTILITY', nextGate: 'HG-05' },
    },
  },
  {
    gateId: 'HG-03',
    layer: 'L2_Composition',
    name: 'Bundling Requirement',
    hypothesis: 'This capability needs to bundle multiple extension types (skills + MCP + commands + agents) into a distributable package',
    testMethod: 'Evaluate whether: (a) multiple skills need coordinated loading, (b) external tool integrations are required, (c) custom commands streamline workflow, (d) the package serves a specific role or team',
    evaluationCriteria: [
      { criterion: 'Requires coordinated loading of multiple skills', weight: 2, passExample: 'Brand guidelines skill + document creation skill + design system skill needed together', failExample: 'Single skill for PDF generation is sufficient' },
      { criterion: 'Needs MCP integrations to external services', weight: 3, passExample: 'Must connect to Figma, Notion, and Supabase to complete workflow', failExample: 'Works entirely with local files and Claude\'s built-in capabilities' },
      { criterion: 'Custom slash commands would streamline repeated workflows', weight: 2, passExample: '/audit-client, /generate-report, /run-gap-analysis as team shortcuts', failExample: 'One-off task with no repeated pattern' },
      { criterion: 'Serves a specific team role or department function', weight: 3, passExample: 'Marketing team needs consistent AI visibility audit workflow', failExample: 'General-purpose utility used across all contexts' },
    ],
    thresholds: {
      pass:    { minScore: 7, nextGate: 'HG-06' },
      partial: { minScore: 4, nextGate: 'HG-07' },
      fail:    { minScore: 0, recommendation: 'SKILL_STANDALONE' },
    },
  },
  {
    gateId: 'HG-04',
    layer: 'L2_Composition',
    name: 'Task Complexity Assessment',
    hypothesis: 'This scripted capability is complex enough to warrant a formal Skill rather than inline instructions or simple prompting',
    testMethod: 'Evaluate whether: (a) instructions exceed simple prompt scope, (b) executable scripts are needed, (c) the task is repeatable across contexts, (d) quality requires standardized approach',
    evaluationCriteria: [
      { criterion: 'Instructions exceed 500 words or require multi-step procedures', weight: 2, passExample: 'Detailed brand-compliant document generation with 15 formatting rules', failExample: 'Simple instruction: "Summarize this document in 3 bullet points"' },
      { criterion: 'Requires executable scripts (Python, Node.js, Bash) for reliable output', weight: 3, passExample: 'PPTX generation requiring python-pptx with specific template layouts', failExample: 'Text transformation that Claude handles natively' },
      { criterion: 'Task is repeatable and benefits from standardized approach', weight: 3, passExample: 'Client onboarding data collection follows same 12-step process every time', failExample: 'One-time creative brainstorming session' },
      { criterion: 'Quality/consistency requires formalized instructions over ad-hoc prompting', weight: 2, passExample: 'Ontology generation must follow OAA Registry v3.0 compliance standards', failExample: 'Casual note-taking with no format requirements' },
    ],
    thresholds: {
      pass:    { minScore: 7, recommendation: 'SKILL_STANDALONE' },
      partial: { minScore: 4, recommendation: 'SKILL_SIMPLE' },
      fail:    { minScore: 0, recommendation: 'NO_ACTION_INLINE_PROMPTING' },
    },
  },
  {
    gateId: 'HG-05',
    layer: 'L3_Distribution',
    name: 'Agent Distribution Strategy',
    hypothesis: 'This agent capability needs to be packaged for distribution beyond its original development context',
    testMethod: 'Evaluate whether: (a) other teams/projects need this agent, (b) the agent needs to ship with its tools and skills, (c) version management is needed, (d) marketplace distribution adds value',
    evaluationCriteria: [
      { criterion: 'Multiple PF-Core instances or teams need this agent capability', weight: 3, passExample: 'OAA agent needed by BAIV, W4M, and AIR instances', failExample: 'BAIV-specific discovery agent only used in one context' },
      { criterion: 'Agent needs to ship bundled with its tools, skills, and MCP configs', weight: 3, passExample: 'Agent + ontology validation skill + Supabase MCP + /validate command', failExample: 'Agent operates with only built-in Claude capabilities' },
      { criterion: 'Formal version management and update distribution required', weight: 2, passExample: 'Breaking changes to agent behavior need controlled rollout across teams', failExample: 'Informal updates shared via documentation' },
      { criterion: 'Non-technical users need GUI-based access to this agent\'s capabilities', weight: 2, passExample: 'Client account managers need to run AI visibility audits without terminal', failExample: 'Only developers use this agent via Claude Code' },
    ],
    // Special 3-tier thresholds
    thresholds: {
      pass_with_gui: { minScore: 8, recommendation: 'PLUGIN_COWORK_WITH_AGENT' },
      pass_dev_only: { minScore: 6, recommendation: 'PLUGIN_CLAUDECODE_WITH_AGENT' },
      fail:          { minScore: 0, recommendation: 'AGENT_STANDALONE' },
    },
  },
  {
    gateId: 'HG-06',
    layer: 'L3_Distribution',
    name: 'User Persona Assessment',
    hypothesis: 'The primary users of this bundled capability are non-technical knowledge workers who need GUI-based access',
    testMethod: 'Evaluate the target user persona: (a) technical proficiency, (b) workflow context, (c) customization needs, (d) team distribution requirements',
    evaluationCriteria: [
      { criterion: 'Primary users are non-developers (marketing, sales, operations, legal)', weight: 3, passExample: 'Marketing team running weekly content campaigns', failExample: 'Development team managing CI/CD pipelines' },
      { criterion: 'Users need desktop GUI installation, not terminal commands', weight: 3, passExample: 'Account manager clicks "Install" in Cowork sidebar', failExample: 'Developer runs "/plugin install" in Claude Code' },
      { criterion: 'Conversational customization adds value over file editing', weight: 2, passExample: 'User says "customize this for my sales process" and Claude adapts', failExample: 'Configuration requires editing YAML files and MCP configs' },
      { criterion: 'Organization-wide deployment to non-technical teams is needed', weight: 2, passExample: 'Roll out standardized audit workflow to 50-person consulting team', failExample: 'Individual developer tool used in personal workflow' },
    ],
    thresholds: {
      pass: { minScore: 7, recommendation: 'PLUGIN_COWORK' },
      fail: { minScore: 0, recommendation: 'PLUGIN_CLAUDECODE' },
    },
  },
  {
    gateId: 'HG-07',
    layer: 'L2_Composition',
    name: 'Skill Enhancement Assessment',
    hypothesis: 'This capability should be a standalone Skill enhanced with additional components rather than a full Plugin',
    testMethod: 'Evaluate whether minimal additions to a Skill would satisfy the need without full Plugin overhead',
    evaluationCriteria: [
      { criterion: 'One or two additional components (MCP or command) complete the solution', weight: 3, passExample: 'Skill + one MCP connection to Supabase is sufficient', failExample: 'Needs 5+ MCP integrations, 3 sub-agents, and custom commands' },
      { criterion: 'The Skill is the primary value; extras are convenience', weight: 3, passExample: 'Ontology generation skill works alone; Supabase storage is optional enhancement', failExample: 'Without the MCP integrations, the skill is useless' },
      { criterion: 'Maintenance burden of full Plugin is unjustified', weight: 2, passExample: 'Simple skill that rarely changes; plugin.json overhead is waste', failExample: 'Frequently updated workflow requiring coordinated component versioning' },
      { criterion: 'Cross-platform portability (Claude.ai + Code + API) is important', weight: 2, passExample: 'Skill needs to work identically in Claude.ai chat and API calls', failExample: 'Only used in Claude Code terminal context' },
    ],
    thresholds: {
      pass: { minScore: 7, recommendation: 'SKILL_WITH_MCP' },
      fail: { minScore: 0, recommendation: 'PLUGIN_LIGHTWEIGHT' },
    },
  },
];

// ========================================
// RECOMMENDATION DEFINITIONS
// ========================================

export const RECOMMENDATIONS = {
  AGENT_ORCHESTRATOR: {
    label: 'Full Agent (Orchestrator Tier)',
    description: 'Autonomous agent with sub-agent coordination, workflow state, and multi-domain reasoning',
    complexity: 'High',
    effort: '2-4 weeks',
    template: 'Full Agent Template v6.1 with S0-S14 sections',
    color: '#dc2626',
    icon: '\u{1F3AF}',
  },
  AGENT_SPECIALIST: {
    label: 'Full Agent (Specialist Tier)',
    description: 'Domain-focused autonomous agent with bounded decision-making scope',
    complexity: 'Medium-High',
    effort: '1-2 weeks',
    template: 'Full Agent Template v6.1 with domain-specific ontology bindings',
    color: '#e11d48',
    icon: '\u{1F50D}',
  },
  AGENT_UTILITY: {
    label: 'Full Agent (Utility Tier)',
    description: 'Lightweight autonomous agent for specific bounded tasks requiring judgment',
    complexity: 'Medium',
    effort: '3-5 days',
    template: 'Simplified Agent Template focused on T1 and S6 sections',
    color: '#f43f5e',
    icon: '\u{1F527}',
  },
  AGENT_STANDALONE: {
    label: 'Standalone Agent',
    description: 'Agent used within its original development context without distribution packaging',
    complexity: 'Medium',
    effort: '3-5 days',
    template: 'Agent Template v6.1 (no plugin wrapper)',
    color: '#fb7185',
    icon: '\u{1F916}',
  },
  SKILL_STANDALONE: {
    label: 'Standalone Skill',
    description: 'SKILL.md with instructions and optional scripts, portable across all Claude surfaces',
    complexity: 'Low-Medium',
    effort: '1-3 days',
    template: 'SKILL.md with YAML frontmatter, optional scripts',
    color: '#16a34a',
    icon: '\u{1F4DD}',
  },
  SKILL_SIMPLE: {
    label: 'Simple Skill',
    description: 'Minimal SKILL.md with instructions only, no scripts required',
    complexity: 'Low',
    effort: 'Hours',
    template: 'SKILL.md with YAML frontmatter only',
    color: '#22c55e',
    icon: '\u{1F4CB}',
  },
  SKILL_WITH_MCP: {
    label: 'Skill + MCP Enhancement',
    description: 'Standalone skill with one or two MCP integrations for data access',
    complexity: 'Medium',
    effort: '3-5 days',
    template: 'SKILL.md + MCP configuration',
    color: '#15803d',
    icon: '\u{1F50C}',
  },
  PLUGIN_CLAUDECODE: {
    label: 'Claude Code Plugin',
    description: 'Bundled developer-facing package with skills, commands, MCP, and optional agents',
    complexity: 'Medium-High',
    effort: '1-2 weeks',
    template: 'Plugin manifest with /commands, /skills, /agents',
    color: '#7c3aed',
    icon: '\u{1F4E6}',
  },
  PLUGIN_COWORK: {
    label: 'Cowork Plugin',
    description: 'Business-user facing GUI plugin for Claude Desktop with role-specific workflows',
    complexity: 'Medium-High',
    effort: '1-2 weeks',
    template: 'Plugin manifest with connectors, skills, commands, sub-agents',
    color: '#8b5cf6',
    icon: '\u{1F465}',
  },
  PLUGIN_COWORK_WITH_AGENT: {
    label: 'Cowork Plugin wrapping Agent(s)',
    description: 'Cowork plugin that packages full agent capabilities for non-technical users',
    complexity: 'High',
    effort: '3-4 weeks',
    template: 'Agent Template v6.1 + Plugin packaging + Cowork UI integration',
    color: '#6d28d9',
    icon: '\u{1F680}',
  },
  PLUGIN_CLAUDECODE_WITH_AGENT: {
    label: 'Claude Code Plugin wrapping Agent(s)',
    description: 'Developer plugin packaging agent capabilities with full tooling',
    complexity: 'High',
    effort: '2-3 weeks',
    template: 'Agent Template v6.1 + Plugin packaging',
    color: '#5b21b6',
    icon: '\u{2699}\u{FE0F}',
  },
  PLUGIN_LIGHTWEIGHT: {
    label: 'Lightweight Plugin',
    description: 'Minimal plugin packaging for distribution when skill alone isn\'t sufficient',
    complexity: 'Low-Medium',
    effort: '2-3 days',
    template: 'Minimal plugin.json + Skills',
    color: '#a78bfa',
    icon: '\u{1F4E4}',
  },
  NO_ACTION_INLINE_PROMPTING: {
    label: 'No Formal Extensibility Needed',
    description: 'The capability can be achieved through inline prompting, system prompts, or existing features',
    complexity: 'None',
    effort: 'None',
    template: 'None',
    color: '#6b7280',
    icon: '\u{2705}',
  },
};

// ========================================
// TEST SCENARIOS (from ontology testData)
// ========================================

export const TEST_SCENARIOS = [
  { id: 'TS-01', category: 'typical', description: 'BAIV Discovery Agent — autonomous multi-source client analysis', expectedPath: 'HG-01(PASS) -> HG-02(PARTIAL) -> HG-05(pass_dev_only)', expectedRecommendation: 'PLUGIN_CLAUDECODE_WITH_AGENT' },
  { id: 'TS-02', category: 'typical', description: 'Brand Guidelines enforcement for document generation', expectedPath: 'HG-01(FAIL) -> HG-04(PASS)', expectedRecommendation: 'SKILL_STANDALONE' },
  { id: 'TS-03', category: 'typical', description: 'Client-facing AI Visibility Audit workflow for account managers', expectedPath: 'HG-01(PASS) -> HG-02(PASS) -> HG-05(pass_with_gui)', expectedRecommendation: 'PLUGIN_COWORK_WITH_AGENT' },
  { id: 'TS-04', category: 'typical', description: 'Ontology generation following OAA v4.0 patterns', expectedPath: 'HG-01(PARTIAL) -> HG-03(PARTIAL) -> HG-07(PASS)', expectedRecommendation: 'SKILL_WITH_MCP' },
  { id: 'TS-05', category: 'edge', description: 'Capability that is 50/50 between Agent and Skill — simple reasoning but highly scripted', expectedPath: 'HG-01(PARTIAL) -> HG-03(PASS) -> HG-06(context-dependent)', expectedRecommendation: 'PLUGIN_CLAUDECODE or PLUGIN_COWORK' },
  { id: 'TS-06', category: 'edge', description: 'Single-use complex analysis that won\'t repeat', expectedPath: 'HG-01(PASS) -> HG-02(FAIL) -> HG-05(FAIL)', expectedRecommendation: 'AGENT_STANDALONE' },
  { id: 'TS-07', category: 'boundary', description: 'Capability that scores exactly at threshold on HG-01', expectedPath: 'HG-01(PARTIAL at score=4) -> HG-03', expectedRecommendation: 'Depends on bundling assessment' },
  { id: 'TS-08', category: 'invalid', description: 'Request for capability that already exists in Claude natively', expectedPath: 'HG-01(FAIL) -> HG-04(FAIL)', expectedRecommendation: 'NO_ACTION_INLINE_PROMPTING' },
];

// ========================================
// SCORING ENGINE
// ========================================

/**
 * Calculate normalised gate score from per-criterion scores.
 * Formula: sum(weight_i * score_i) / sum(weight_i * 10) * 10
 * @param {Object} gate - Gate definition from GATES
 * @param {number[]} scores - Array of 4 criterion scores (0-10 each)
 * @returns {number} Normalised score 0-10 (rounded to 1 decimal)
 */
export function calculateNormalizedScore(gate, scores) {
  const criteria = gate.evaluationCriteria;
  let weightedSum = 0;
  let maxWeighted = 0;
  for (let i = 0; i < criteria.length; i++) {
    const w = criteria[i].weight;
    const s = (scores[i] != null && scores[i] >= 0) ? Math.min(scores[i], 10) : 0;
    weightedSum += w * s;
    maxWeighted += w * 10;
  }
  if (maxWeighted === 0) return 0;
  return Math.round((weightedSum / maxWeighted) * 100) / 10;
}

/**
 * Determine outcome from normalised score against gate thresholds.
 * Most gates: PASS (>= 7), PARTIAL (>= 4), FAIL (< 4).
 * HG-05 special: pass_with_gui (>= 8), pass_dev_only (>= 6), fail (< 6).
 * HG-06/HG-07: PASS (>= 7), FAIL (< 7) (two-tier).
 * @param {Object} gate - Gate definition
 * @param {number} normalizedScore - Score 0-10
 * @returns {string} Outcome key matching a threshold key
 */
export function determineOutcome(gate, normalizedScore) {
  const t = gate.thresholds;
  // Sort threshold keys by minScore descending to find first match
  const sortedKeys = Object.keys(t).sort((a, b) => t[b].minScore - t[a].minScore);
  for (const key of sortedKeys) {
    if (normalizedScore >= t[key].minScore) {
      return key;
    }
  }
  // Fallback to the key with minScore 0 (should always exist)
  return sortedKeys[sortedKeys.length - 1];
}

/**
 * Get the next target for a given gate outcome.
 * @param {Object} gate - Gate definition
 * @param {string} outcome - Outcome key (e.g. 'pass', 'partial', 'fail')
 * @returns {{ type: 'gate'|'recommendation', target: string, recommendation?: string }}
 */
export function getNextTarget(gate, outcome) {
  const branch = gate.thresholds[outcome];
  if (!branch) return null;
  if (branch.nextGate) {
    return { type: 'gate', target: branch.nextGate, recommendation: branch.recommendation || null };
  }
  return { type: 'recommendation', target: branch.recommendation };
}

/**
 * Full gate evaluation: calculate score, determine outcome, resolve next target.
 * @param {Object} gate - Gate definition
 * @param {number[]} scores - 4 criterion scores
 * @returns {{ normalizedScore: number, outcome: string, nextTarget: Object }}
 */
export function evaluateGate(gate, scores) {
  const normalizedScore = calculateNormalizedScore(gate, scores);
  const outcome = determineOutcome(gate, normalizedScore);
  const nextTarget = getNextTarget(gate, outcome);
  return { normalizedScore, outcome, nextTarget };
}

// ========================================
// LOOKUPS
// ========================================

/**
 * Get gate definition by ID.
 * @param {string} gateId
 * @returns {Object|null}
 */
export function getGate(gateId) {
  return GATES.find(g => g.gateId === gateId) || null;
}

/**
 * Get recommendation definition by key.
 * @param {string} key
 * @returns {Object|null}
 */
export function getRecommendation(key) {
  return RECOMMENDATIONS[key] || null;
}

// ========================================
// PATH TRAVERSAL
// ========================================

/**
 * Advance the decision tree by evaluating the current active gate.
 * Reads scores from state.dtAllScores[activeGateId].
 * Updates dtCompletedGates, dtPath, and either advances dtActiveGateId
 * or sets dtFinalRecommendation.
 * @returns {{ normalizedScore: number, outcome: string, nextTarget: Object }|null}
 */
export function advanceGate() {
  const gateId = state.dtActiveGateId;
  if (!gateId) return null;
  const gate = getGate(gateId);
  if (!gate) return null;

  const scores = state.dtAllScores[gateId] || [0, 0, 0, 0];
  const result = evaluateGate(gate, scores);

  // Record completed gate
  state.dtCompletedGates.push({
    gateId,
    scores: [...scores],
    normalizedScore: result.normalizedScore,
    outcome: result.outcome,
  });

  // Update path
  if (!state.dtPath.includes(gateId)) {
    state.dtPath.push(gateId);
  }

  // Advance to next gate or set final recommendation
  if (result.nextTarget.type === 'gate') {
    state.dtActiveGateId = result.nextTarget.target;
    if (!state.dtPath.includes(result.nextTarget.target)) {
      state.dtPath.push(result.nextTarget.target);
    }
  } else {
    state.dtActiveGateId = null;
    state.dtFinalRecommendation = result.nextTarget.target;
  }

  return result;
}

/**
 * Reset from a specific gate onward (inclusive).
 * Clears that gate and all subsequent gates from the completed list.
 * @param {string} gateId - Gate to reset from
 */
export function resetFromGate(gateId) {
  const idx = state.dtCompletedGates.findIndex(g => g.gateId === gateId);
  if (idx === -1) return;

  // Remove completed gates from idx onward
  const removed = state.dtCompletedGates.splice(idx);

  // Clear scores for removed gates
  for (const g of removed) {
    delete state.dtAllScores[g.gateId];
  }

  // Rebuild path from remaining completed gates
  state.dtPath = state.dtCompletedGates.map(g => g.gateId);
  state.dtPath.push(gateId);

  // Reset active gate to this gate
  state.dtActiveGateId = gateId;
  state.dtFinalRecommendation = null;
}

/**
 * Full reset to initial state — HG-01 active, nothing completed.
 */
export function resetDecisionTree() {
  state.dtActiveGateId = 'HG-01';
  state.dtCompletedGates = [];
  state.dtPath = ['HG-01'];
  state.dtFinalRecommendation = null;
  state.dtAllScores = {};
  state.dtScoringPanelOpen = false;
}

// ========================================
// DECISION RECORD GENERATION (JSON-LD)
// ========================================

/**
 * Generate a JSON-LD decision record from the completed evaluation.
 * Returns null if evaluation is not complete.
 * @returns {Object|null}
 */
export function generateDecisionRecord() {
  if (!state.dtFinalRecommendation) return null;

  const rec = getRecommendation(state.dtFinalRecommendation);
  return {
    '@context': {
      pfc: 'https://platformcore.io/ontology/',
      dt: 'https://platformcore.io/ontology/dt/',
      schema: 'https://schema.org/',
    },
    '@type': 'dt:AutomationDecisionRecord',
    '@id': 'dt:decision-' + Date.now(),
    'dt:problemStatement': state.dtProblemStatement || '',
    'dt:evaluator': state.dtEvaluator || 'Anonymous',
    'dt:evaluationDate': new Date().toISOString(),
    'dt:gateResults': state.dtCompletedGates.map(g => {
      const gate = getGate(g.gateId);
      return {
        '@type': 'dt:HypothesisGateResult',
        'dt:gateId': g.gateId,
        'dt:gateName': gate ? gate.name : g.gateId,
        'dt:hypothesis': gate ? gate.hypothesis : '',
        'dt:criterionScores': g.scores.map((s, i) => ({
          'dt:criterion': gate ? gate.evaluationCriteria[i].criterion : '',
          'dt:weight': gate ? gate.evaluationCriteria[i].weight : 0,
          'dt:score': s,
        })),
        'dt:normalizedScore': g.normalizedScore,
        'dt:outcome': g.outcome.toUpperCase(),
      };
    }),
    'dt:path': state.dtPath,
    'dt:recommendation': {
      '@type': 'dt:TerminalRecommendation',
      'dt:key': state.dtFinalRecommendation,
      'dt:label': rec ? rec.label : state.dtFinalRecommendation,
      'dt:description': rec ? rec.description : '',
      'dt:complexity': rec ? rec.complexity : '',
      'dt:estimatedEffort': rec ? rec.effort : '',
      'dt:template': rec ? rec.template : '',
    },
  };
}

// ========================================
// MERMAID EXPORT
// ========================================

/**
 * Generate a Mermaid flowchart of the traversed decision path.
 * Returns empty string if no gates completed.
 * @returns {string} Mermaid syntax
 */
export function generateMermaidPath() {
  if (state.dtCompletedGates.length === 0) return '';

  const lines = ['flowchart TD'];
  const safeId = id => id.replace(/-/g, '_');

  // Start node
  lines.push('    START([Start: Evaluate Extensibility Need])');

  // Gate nodes (traversed)
  for (const completed of state.dtCompletedGates) {
    const gate = getGate(completed.gateId);
    const name = gate ? gate.name : completed.gateId;
    lines.push(`    ${safeId(completed.gateId)}{{"${name}\\n${completed.gateId} | Score: ${completed.normalizedScore}/10"}}`);
  }

  // Recommendation node
  if (state.dtFinalRecommendation) {
    const rec = getRecommendation(state.dtFinalRecommendation);
    const label = rec ? rec.label : state.dtFinalRecommendation;
    lines.push(`    REC["${label}"]`);
  }

  // Edges
  lines.push(`    START --> ${safeId(state.dtCompletedGates[0].gateId)}`);
  for (let i = 0; i < state.dtCompletedGates.length; i++) {
    const g = state.dtCompletedGates[i];
    const from = safeId(g.gateId);
    const isLast = i === state.dtCompletedGates.length - 1;
    const target = isLast && state.dtFinalRecommendation
      ? 'REC'
      : (state.dtCompletedGates[i + 1] ? safeId(state.dtCompletedGates[i + 1].gateId) : 'REC');
    const label = g.outcome.toUpperCase();
    const arrow = g.outcome.includes('pass') ? '==>' : g.outcome === 'partial' ? '-->' : '-.->';
    lines.push(`    ${from} ${arrow}|"${label} ${g.normalizedScore}/10"| ${target}`);
  }

  // Styling
  lines.push('');
  lines.push('    classDef passNode fill:#22c55e,stroke:#333,color:#fff');
  lines.push('    classDef partialNode fill:#eab308,stroke:#333,color:#fff');
  lines.push('    classDef failNode fill:#ef4444,stroke:#333,color:#fff');
  lines.push('    classDef recNode fill:#8b5cf6,stroke:#333,color:#fff');

  for (const g of state.dtCompletedGates) {
    const cls = g.outcome.includes('pass') ? 'passNode' : g.outcome === 'partial' ? 'partialNode' : 'failNode';
    lines.push(`    class ${safeId(g.gateId)} ${cls}`);
  }
  if (state.dtFinalRecommendation) {
    lines.push('    class REC recNode');
  }

  return lines.join('\n');
}

// ========================================
// VIS-NETWORK GRAPH BUILDING
// ========================================

/**
 * Assign hierarchical level to a gate node based on its position in the tree.
 */
function _gateLevel(gateId) {
  const levels = { 'HG-01': 1, 'HG-02': 2, 'HG-03': 2, 'HG-04': 2, 'HG-05': 3, 'HG-06': 3, 'HG-07': 3 };
  return levels[gateId] || 1;
}

/**
 * Get the layer colour for a gate.
 */
function _layerColor(layerKey) {
  return LAYERS[layerKey] ? LAYERS[layerKey].color : '#6b7280';
}

/**
 * Build vis-network nodes and edges for the full decision tree.
 * @returns {{ nodes: Array, edges: Array }}
 */
export function buildDecisionTreeGraph() {
  const nodes = [];
  const edges = [];
  let edgeId = 0;

  // Gate nodes
  for (const gate of GATES) {
    const color = _layerColor(gate.layer);
    const isCompleted = state.dtCompletedGates.some(g => g.gateId === gate.gateId);
    const isActive = state.dtActiveGateId === gate.gateId;
    const completedData = state.dtCompletedGates.find(g => g.gateId === gate.gateId);

    let label = `${gate.gateId}\n${gate.name}`;
    if (completedData) {
      label += `\n[${completedData.normalizedScore}/10 ${completedData.outcome.toUpperCase()}]`;
    }

    nodes.push({
      id: gate.gateId,
      label,
      group: 'gate',
      level: _gateLevel(gate.gateId),
      _type: 'gate',
      _layer: gate.layer,
      title: gate.hypothesis,
      shape: 'hexagon',
      color: {
        background: isActive ? color : (isCompleted ? _dimColor(color, 0.8) : _dimColor(color, 0.3)),
        border: isActive ? '#fff' : (isCompleted ? color : _dimColor(color, 0.15)),
        highlight: { background: color, border: '#fff' },
      },
      font: {
        color: (isActive || isCompleted) ? '#fff' : '#999',
        size: isActive ? 14 : 12,
        face: 'Inter, sans-serif',
        multi: 'md',
      },
      borderWidth: isActive ? 3 : (isCompleted ? 2 : 1),
      size: 30,
    });
  }

  // Recommendation nodes
  for (const [key, rec] of Object.entries(RECOMMENDATIONS)) {
    const isChosen = state.dtFinalRecommendation === key;
    const historyEntry = state.skillBuilderScaffoldHistory?.[key];
    const isBuilt = !!historyEntry;

    let label = rec.label;
    if (isBuilt) label = '\u2692\uFE0F ' + label; // hammer icon prefix
    if (isChosen) label += '\n(RECOMMENDED)';

    let tooltip = `${rec.description}\nComplexity: ${rec.complexity}\nEffort: ${rec.effort}`;
    if (isBuilt) {
      const builtDate = historyEntry.timestamp ? historyEntry.timestamp.slice(0, 10) : 'unknown';
      tooltip += `\n\nBuilt from: ${historyEntry.processName || 'process'} (${builtDate})`;
    }

    nodes.push({
      id: 'rec-' + key,
      label,
      group: 'recommendation',
      level: 4,
      _type: 'recommendation',
      _recKey: key,
      title: tooltip,
      shape: 'box',
      color: {
        background: isChosen ? rec.color : _dimColor(rec.color, isBuilt ? 0.45 : 0.25),
        border: isChosen ? '#fff' : (isBuilt ? '#eab308' : _dimColor(rec.color, 0.15)),
        highlight: { background: rec.color, border: '#fff' },
      },
      font: {
        color: isChosen ? '#fff' : (isBuilt ? '#ddd' : '#777'),
        size: isChosen ? 12 : 10,
        face: 'Inter, sans-serif',
      },
      borderWidth: isChosen ? 3 : (isBuilt ? 2 : 1),
      shapeProperties: { borderRadius: 6 },
    });
  }

  // Edges from gates to their threshold targets
  for (const gate of GATES) {
    for (const [outcome, branch] of Object.entries(gate.thresholds)) {
      const target = branch.nextGate || ('rec-' + branch.recommendation);
      const isPass = outcome.includes('pass');
      const isPartial = outcome === 'partial';
      const isFail = outcome === 'fail';

      // Check if this edge was traversed
      const completedGate = state.dtCompletedGates.find(g => g.gateId === gate.gateId);
      const isTraversed = completedGate && completedGate.outcome === outcome;

      const edgeColor = isPass ? '#22c55e' : isPartial ? '#eab308' : '#ef4444';

      edges.push({
        id: 'e-' + (edgeId++),
        from: gate.gateId,
        to: target,
        label: outcome.toUpperCase() + ' (' + branch.minScore + '+)',
        _outcome: outcome,
        color: {
          color: isTraversed ? edgeColor : _dimColor(edgeColor, 0.3),
          highlight: edgeColor,
        },
        width: isTraversed ? 3 : 1,
        dashes: isPartial ? [5, 5] : (isFail ? [3, 3] : false),
        font: {
          color: isTraversed ? edgeColor : '#666',
          size: 9,
          strokeWidth: 0,
          align: 'top',
        },
        arrows: { to: { enabled: true, scaleFactor: 0.6 } },
        smooth: { type: 'cubicBezier', forceDirection: 'vertical' },
      });
    }
  }

  return { nodes, edges };
}

/**
 * Dim a hex colour by mixing towards grey/transparent.
 * @param {string} hex - Hex colour
 * @param {number} factor - 0 = fully dimmed, 1 = original
 * @returns {string}
 */
function _dimColor(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const bg = 30; // dark background base
  const mix = v => Math.round(bg + (v - bg) * factor);
  return '#' + [mix(r), mix(g), mix(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ========================================
// VIS-NETWORK RENDERING
// ========================================

/** vis-network options for decision tree */
const DT_NETWORK_OPTIONS = {
  layout: {
    hierarchical: {
      enabled: true,
      direction: 'UD',
      sortMethod: 'directed',
      levelSeparation: 140,
      nodeSpacing: 70,
      treeSpacing: 80,
      blockShifting: true,
      edgeMinimization: true,
      parentCentralization: true,
    },
  },
  physics: { enabled: false },
  interaction: {
    dragNodes: false,
    hover: true,
    multiselect: false,
    tooltipDelay: 200,
    zoomView: true,
    dragView: true,
  },
  nodes: {
    margin: { top: 8, bottom: 8, left: 12, right: 12 },
  },
};

/**
 * Render the decision tree graph into a container.
 * @param {HTMLElement} container - DOM element to render into
 * @param {Object} options - { onSelectNode }
 * @returns {{ network, nodesDataSet, edgesDataSet }}
 */
export function renderDecisionTreeGraph(container, options = {}) {
  if (typeof vis === 'undefined') {
    console.warn('[decision-tree] vis-network not available');
    return { network: null, nodesDataSet: null, edgesDataSet: null };
  }

  const { nodes, edges } = buildDecisionTreeGraph();
  const nodesDataSet = new vis.DataSet(nodes);
  const edgesDataSet = new vis.DataSet(edges);

  const network = new vis.Network(container, { nodes: nodesDataSet, edges: edgesDataSet }, DT_NETWORK_OPTIONS);

  // Click handler
  if (options.onSelectNode) {
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const nodeData = nodesDataSet.get(nodeId);
        if (nodeData) options.onSelectNode(nodeData);
      }
    });
  }

  // Fit after stabilisation
  network.once('afterDrawing', () => {
    network.fit({ animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
  });

  return { network, nodesDataSet, edgesDataSet };
}

/**
 * Update graph highlighting to reflect current evaluation state.
 * Rebuilds node/edge visual properties without destroying the network.
 * @param {vis.DataSet} nodesDataSet
 * @param {vis.DataSet} edgesDataSet
 */
export function updateGraphHighlighting(nodesDataSet, edgesDataSet) {
  if (!nodesDataSet || !edgesDataSet) return;

  const { nodes, edges } = buildDecisionTreeGraph();

  // Batch update nodes
  for (const node of nodes) {
    const existing = nodesDataSet.get(node.id);
    if (existing) {
      nodesDataSet.update(node);
    }
  }

  // Batch update edges
  for (const edge of edges) {
    const existing = edgesDataSet.get(edge.id);
    if (existing) {
      edgesDataSet.update(edge);
    }
  }
}

/**
 * Convenience wrapper: refresh highlighting using state refs.
 */
export function refreshDecisionTreeHighlighting() {
  updateGraphHighlighting(state.decisionTreeNodes, state.decisionTreeEdges);
}

// ========================================
// FLOATING TOOLBAR
// ========================================

/**
 * Create the floating toolbar for the decision tree view.
 * @param {HTMLElement} parent - Container to append toolbar to
 * @param {Object} callbacks - { onReset, onFit, onExportRecord, onExportMermaid }
 * @returns {HTMLElement}
 */
export function createDTToolbar(parent, callbacks = {}) {
  const existing = document.getElementById('dt-toolbar');
  if (existing) existing.remove();

  const toolbar = document.createElement('div');
  toolbar.id = 'dt-toolbar';
  toolbar.className = 'dt-toolbar';

  const buttons = [
    { label: 'Reset', title: 'Reset entire evaluation', action: callbacks.onReset },
    { label: 'Fit', title: 'Fit graph to view', action: callbacks.onFit },
    { sep: true },
    { label: 'Record', title: 'Export Decision Record (JSON-LD)', action: callbacks.onExportRecord, disabledFn: () => !state.dtFinalRecommendation },
    { label: 'Mermaid', title: 'Export traversed path as Mermaid', action: callbacks.onExportMermaid, disabledFn: () => state.dtCompletedGates.length === 0 },
  ];

  for (const btn of buttons) {
    if (btn.sep) {
      const sep = document.createElement('span');
      sep.className = 'dt-toolbar-sep';
      sep.textContent = '|';
      toolbar.appendChild(sep);
      continue;
    }
    const el = document.createElement('button');
    el.className = 'dt-toolbar-btn';
    el.textContent = btn.label;
    el.title = btn.title || '';
    if (btn.action) el.addEventListener('click', btn.action);
    if (btn.disabledFn && btn.disabledFn()) {
      el.disabled = true;
      el.classList.add('disabled');
    }
    toolbar.appendChild(el);
  }

  parent.appendChild(toolbar);
  return toolbar;
}

/**
 * Update toolbar button disabled states (called after gate evaluation).
 */
export function updateDTToolbar() {
  const toolbar = document.getElementById('dt-toolbar');
  if (!toolbar) return;
  const buttons = toolbar.querySelectorAll('.dt-toolbar-btn');
  for (const btn of buttons) {
    if (btn.textContent === 'Record') {
      btn.disabled = !state.dtFinalRecommendation;
      btn.classList.toggle('disabled', !state.dtFinalRecommendation);
    } else if (btn.textContent === 'Mermaid') {
      btn.disabled = state.dtCompletedGates.length === 0;
      btn.classList.toggle('disabled', state.dtCompletedGates.length === 0);
    }
  }
}
