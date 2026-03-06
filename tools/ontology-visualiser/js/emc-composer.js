/**
 * EMC Composition Engine — resolves EMC RequirementCategory compositions,
 * applies composition rules, creates PFI instance configs, generates
 * test data, exports JSONB, and manages composition manifests.
 *
 * Feature 7.3: EMC-Driven Composition & Platform Instances
 * Pure logic (no DOM), all functions operate on data + state.
 */

import { state, REGISTRY_BASE_PATH } from './state.js';

// ─── EMC RequirementCategory → OntologyComposition Map ─────────────────────

/**
 * Maps each RequirementCategory code to its default ontology composition.
 * Derived from the EMC ontology (pf-EMC-ONT-v2.0.0.jsonld).
 */
export const CATEGORY_COMPOSITIONS = {
  STRATEGIC: {
    code: 'STRATEGIC',
    name: 'Strategic Planning & Alignment',
    required: ['VSOM', 'OKR', 'ORG'],
    recommended: ['ORG-CONTEXT', 'CTX', 'KPI'],
    optional: ['ORG-MAT', 'KANO'],
    activeSeries: ['VE-Series', 'Foundation'],
  },
  PRODUCT: {
    code: 'PRODUCT',
    name: 'Product Development & Go-to-Market',
    required: ['VP', 'PMF', 'PE', 'EFS', 'ORG'],
    recommended: ['CA', 'CL'],
    optional: ['KPI', 'PPM', 'KANO'],
    activeSeries: ['VE-Series', 'PE-Series', 'Competitive', 'Foundation'],
  },
  PPM: {
    code: 'PPM',
    name: 'Portfolio, Program & Project Management',
    required: ['PPM', 'PE', 'EFS', 'ORG'],
    recommended: ['RRR'],
    optional: ['KPI'],
    activeSeries: ['PE-Series', 'Foundation'],
  },
  COMPETITIVE: {
    code: 'COMPETITIVE',
    name: 'Competitive Intelligence & Analysis',
    required: ['CA', 'CL', 'GA', 'ORG'],
    recommended: ['VP'],
    optional: ['VSOM', 'KANO'],
    activeSeries: ['Competitive', 'Foundation'],
  },
  'ORG-DESIGN': {
    code: 'ORG-DESIGN',
    name: 'Organisation Design & Governance',
    required: ['ORG', 'ORG-MAT', 'RRR', 'ORG-CONTEXT', 'CTX'],
    recommended: [],
    optional: ['PE'],
    activeSeries: ['Foundation', 'VE-Series'],
  },
  PROCESS: {
    code: 'PROCESS',
    name: 'Process Engineering & Automation',
    required: ['PE', 'EFS', 'ORG'],
    recommended: ['PPM'],
    optional: ['EA', 'KPI'],
    activeSeries: ['PE-Series', 'Foundation'],
  },
  ENTERPRISE: {
    code: 'ENTERPRISE',
    name: 'Full Enterprise Model',
    required: ['VSOM', 'OKR', 'VP', 'RRR', 'PMF', 'KPI',
               'PPM', 'PE', 'EFS', 'EA',
               'GRC-FW', 'MCSB', 'GDPR', 'PII',
               'ORG', 'ORG-CONTEXT', 'ORG-MAT', 'CTX',
               'CA', 'CL', 'GA',
               'EMC'],
    recommended: ['EA-CORE', 'EA-TOGAF', 'EA-MSFT', 'DS',
                  'NCSC-CAF', 'DSPT', 'RMF-IS27005', 'AZALZ', 'MCSB2'],
    optional: [],
    activeSeries: ['VE-Series', 'PE-Series', 'RCSG-Series', 'Foundation', 'Competitive', 'Orchestration'],
  },
  COMPLIANCE: {
    code: 'COMPLIANCE',
    name: 'Compliance, Security & Governance',
    required: ['GRC-FW', 'MCSB', 'GDPR', 'PII', 'EA', 'ORG'],
    recommended: ['NCSC-CAF', 'DSPT', 'RMF-IS27005', 'AZALZ', 'MCSB2', 'ORG-CONTEXT', 'CTX'],
    optional: ['PE'],
    activeSeries: ['RCSG-Series', 'PE-Series', 'Foundation'],
  },
  AGENTIC: {
    code: 'AGENTIC',
    name: 'Agentic AI Solution Build',
    required: ['PE', 'EFS', 'EA', 'EA-AI', 'ORG'],
    recommended: ['PPM', 'VSOM', 'OKR'],
    optional: ['CA', 'KPI'],
    activeSeries: ['PE-Series', 'VE-Series', 'Foundation'],
  },
  FULFILMENT: {
    code: 'FULFILMENT',
    name: 'Supply Chain & Order Fulfilment',
    required: ['LSC', 'OFM', 'PE', 'ORG'],
    recommended: ['RRR', 'KPI'],
    optional: ['PPM'],
    activeSeries: ['PE-Series', 'Foundation'],
  },
  SECURITY: {
    code: 'SECURITY',
    name: 'Security Architecture & Controls',
    required: ['MCSB', 'AZALZ', 'EA', 'ORG'],
    recommended: ['GRC-FW', 'NCSC-CAF', 'RMF-IS27005'],
    optional: ['DSPT', 'MCSB2'],
    activeSeries: ['RCSG-Series', 'PE-Series', 'Foundation'],
  },
};

// ─── Ontology Short-Name → Namespace Prefix ────────────────────────────────

const NAME_TO_PREFIX = {
  EMC: 'emc:', ORG: 'org:', 'ORG-CONTEXT': 'org-ctx:', 'ORG-MAT': 'org-mat:', CTX: 'ctx:',
  CA: 'ca:', CL: 'cl:', GA: 'ga:',
  VSOM: 'vsom:', OKR: 'okr:', VP: 'vp:', RRR: 'rrr:', PMF: 'pmf:', KPI: 'kpi:',
  PPM: 'ppm:', PE: 'pe:', EFS: 'efs:', EA: 'ea:',
  'EA-CORE': 'ea-core:', 'EA-TOGAF': 'ea-togaf:', 'EA-MSFT': 'ea-msft:', 'EA-AI': 'ea-ai:', DS: 'ds:',
  MCSB: 'mcsb:', MCSB2: 'mcsb2:', GDPR: 'gdpr:', PII: 'pii:', AZALZ: 'azalz:',
  'GRC-FW': 'grc-fw:',
  'NCSC-CAF': 'ncsc-caf:', DSPT: 'dspt:', 'RMF-IS27005': 'rmf:',
  LSC: 'lsc:', OFM: 'ofm:', BSC: 'bsc:', KANO: 'kano:',
  'K-DMAIC': 'kdmaic:', DMAIC: 'dmaic:',
};

const PREFIX_TO_NAME = Object.fromEntries(
  Object.entries(NAME_TO_PREFIX).map(([k, v]) => [v, k])
);

/**
 * Simple dependency map (derived from registry entry dependencies).
 * Key = short name, Value = array of short-name dependencies.
 * Only tracks direct "oaa:imports" style dependencies.
 */
const DEPENDENCY_MAP = {
  EMC: ['VSOM', 'OKR', 'PPM', 'EA', 'MCSB', 'GDPR', 'ORG', 'CA'],
  EFS: ['ORG'],
  PPM: ['ORG'],
  PE: ['ORG'],
  EA: ['ORG'],
  DS: ['EFS', 'EMC', 'PE'],
  'EA-CORE': ['ORG'],
  'EA-TOGAF': ['ORG'],
  'EA-AI': ['EA-CORE'],
  'EA-MSFT': ['ORG', 'EA-AI'],
  VSOM: ['ORG'],
  OKR: ['VSOM'],
  VP: ['OKR'],
  PMF: ['VP'],
  RRR: ['ORG'],
  KPI: ['VSOM'],
  CA: ['ORG'],
  CL: ['CA'],
  GA: ['CA', 'CL'],
  MCSB: ['ORG'],
  GDPR: ['ORG'],
  PII: ['GDPR'],
  AZALZ: ['MCSB'],
  'GRC-FW': ['CTX', 'ORG', 'NCSC-CAF'],
  'NCSC-CAF': ['GRC-FW', 'MCSB', 'RMF-IS27005'],
  DSPT: ['NCSC-CAF', 'GDPR', 'GRC-FW'],
  'RMF-IS27005': ['GRC-FW', 'GDPR', 'MCSB'],
  'ORG-CONTEXT': ['ORG', 'CTX', 'GRC-FW'],
  CTX: [],
  'ORG-MAT': ['ORG'],
  LSC: ['PE', 'ORG'],
  OFM: ['PE', 'ORG'],
  BSC: ['VSOM', 'KPI'],
  KANO: ['VP', 'PMF'],
  'K-DMAIC': ['PE'],
  DMAIC: ['PE'],
};

// Advanced ontologies excluded at low maturity (Rule 5)
const ADVANCED_ONTOLOGIES = ['KPI', 'GA'];

// GRC/RCSG ontologies added when compliance scope active (Rule 6)
const RCSG_CORE = ['GRC-FW', 'MCSB', 'GDPR', 'PII'];

// All series names for enterprise composition check (Rule 7)
const ALL_SERIES = ['VE-Series', 'PE-Series', 'RCSG-Series', 'Foundation', 'Competitive', 'Orchestration'];

// ─── PFI Graph Scope Rules (Epic 19 — F19.2) ────────────────────────────────

/**
 * Maps instanceId → sorted array of normalised scope rule objects.
 * Populated from EMC v5.0.0 ontology data (InstanceConfiguration.scopeRules).
 * BAIV rules are provided as defaults; other instances populated lazily via
 * populateScopeRulesFromEMC().
 *
 * @type {Map<string, Array<{ruleId: string, ruleName: string, scopeLevel: string, priority: number, isActive: boolean, conditions: Array, action: Object}>>}
 */
export const SCOPE_RULES = new Map();

const BAIV_DEFAULT_SCOPE_RULES = [
  {
    ruleId: 'BAIV-AIV-Product-Scope',
    ruleName: 'BAIV AIV Product Scope',
    scopeLevel: 'entity',
    priority: 1,
    isActive: true,
    conditions: [{
      conditionType: 'product-match',
      conditionOperator: 'equals',
      conditionValue: 'BAIV-AIV',
      conditionTarget: 'org-ctx:Product.productCode',
    }],
    action: {
      actionType: 'include-data',
      targetNamespaces: ['vp:', 'rrr:', 'efs:'],
      targetEntityTypes: ['vp:ValueProposition', 'vp:IdealCustomerProfile', 'rrr:Role', 'rrr:Responsibility', 'efs:Epic', 'efs:Feature', 'efs:Story'],
      targetEntityFilter: "productContext == 'BAIV-AIV'",
      applyToRelationships: true,
    },
  },
  {
    ruleId: 'BAIV-MarTech-Market-Scope',
    ruleName: 'BAIV MarTech Market Scope',
    scopeLevel: 'entity',
    priority: 2,
    isActive: true,
    conditions: [{
      conditionType: 'market-segment',
      conditionOperator: 'equals',
      conditionValue: 'MarTech',
      conditionTarget: 'org-ctx:Organisation.verticalMarket',
    }],
    action: {
      actionType: 'include-data',
      targetNamespaces: ['org-ctx:', 'ind:'],
      targetEntityTypes: ['org-ctx:CompetitiveLandscape', 'org-ctx:Competitor', 'ind:IndustryAnalysis'],
      targetEntityFilter: "marketSegment == 'MarTech'",
      applyToRelationships: true,
    },
  },
  {
    ruleId: 'BAIV-Startup-Maturity-Scope',
    ruleName: 'BAIV Startup Maturity Scope',
    scopeLevel: 'ontology',
    priority: 3,
    isActive: true,
    conditions: [{
      conditionType: 'maturity-threshold',
      conditionOperator: 'less-than',
      conditionValue: '3',
      conditionTarget: 'org-ctx:Organisation.maturityLevel',
    }],
    action: {
      actionType: 'exclude-data',
      targetNamespaces: ['kpi:', 'ga:'],
      targetEntityTypes: ['kpi:KPI', 'kpi:MetricDefinition', 'ga:GapAnalysis', 'ga:Threat'],
      targetEntityFilter: null,
      applyToRelationships: true,
    },
  },
];

// Seed BAIV defaults
SCOPE_RULES.set('PFI-BAIV', BAIV_DEFAULT_SCOPE_RULES);

/**
 * Normalise a raw scope rule from JSON-LD into internal format.
 * Handles both singular `condition` and plural `conditions`,
 * and filters out section markers (`_section` objects).
 * @param {Object} rule - Raw scope rule from EMC JSON-LD
 * @returns {Object|null} Normalised rule or null if invalid
 */
function _normaliseScopeRule(rule) {
  if (!rule || !rule.ruleId || rule._section) return null;
  return {
    ruleId: rule.ruleId,
    ruleName: rule.ruleName || rule.ruleId,
    scopeLevel: rule.scopeLevel || 'entity',
    priority: rule.priority,
    isActive: rule.isActive !== false,
    conditions: rule.condition ? [rule.condition] : (rule.conditions || []),
    action: rule.action || {},
  };
}

/**
 * Populate SCOPE_RULES from loaded EMC data.
 * Supports two formats:
 *   1. Core EMC ontology: hasDefinedTerm → emc:InstanceConfiguration → instances[]
 *   2. Instance data files: examples[] containing emc:InstanceConfiguration objects
 *
 * Normalises condition format (single condition → array), sorts by priority
 * ascending, and stores in the SCOPE_RULES Map.
 *
 * @param {Object} emcRawData - Raw JSON-LD of EMC ontology or instance data file
 * @param {string} [instanceIdOverride] - Force a specific instanceId (used when loading per-instance)
 * @returns {number} Number of instances populated
 */
export function populateScopeRulesFromEMC(emcRawData, instanceIdOverride) {
  if (!emcRawData) return 0;

  // Collect InstanceConfiguration objects from either format
  const configs = [];

  // Format 1: Core EMC ontology (hasDefinedTerm → InstanceConfiguration → instances[])
  if (emcRawData.hasDefinedTerm) {
    const terms = Array.isArray(emcRawData.hasDefinedTerm)
      ? emcRawData.hasDefinedTerm : [emcRawData.hasDefinedTerm];
    const icTerm = terms.find(t => t['@id'] === 'emc:InstanceConfiguration');
    if (icTerm?.instances) {
      configs.push(...icTerm.instances);
    }
  }

  // Format 2: Instance data files (examples[] with @type === emc:InstanceConfiguration)
  if (emcRawData.examples) {
    const examples = Array.isArray(emcRawData.examples)
      ? emcRawData.examples : [emcRawData.examples];
    for (const ex of examples) {
      if (ex['@type'] === 'emc:InstanceConfiguration' && ex.scopeRules) {
        configs.push(ex);
      }
    }
  }

  if (configs.length === 0) return 0;

  let count = 0;
  for (const config of configs) {
    let instanceId = instanceIdOverride
      || config['@id']?.replace('emc:InstanceConfiguration-', 'PFI-')
      || null;
    if (!instanceId || !config.scopeRules) continue;

    const rules = config.scopeRules
      .map(_normaliseScopeRule)
      .filter(Boolean);

    rules.sort((a, b) => a.priority - b.priority);
    SCOPE_RULES.set(instanceId, rules);
    count++;
  }

  return count;
}

/**
 * Get the loaded scope rules for a specific instance.
 * @param {string} instanceId - e.g. 'PFI-W4M-WWG'
 * @returns {Array} Scope rules array, or empty array if none
 */
export function getScopeRulesForInstance(instanceId) {
  return SCOPE_RULES.get(instanceId) || [];
}

/**
 * Clear scope rules for a specific instance (does not remove BAIV defaults).
 * @param {string} instanceId
 */
export function clearScopeRules(instanceId) {
  if (instanceId !== 'PFI-BAIV') {
    SCOPE_RULES.delete(instanceId);
  }
}

// ─── Scope Rule Evaluation (Epic 19 — F19.2) ────────────────────────────────

/**
 * Resolve the context value for a given condition type.
 * @param {string} conditionType
 * @param {Object} context
 * @returns {*} The context value to compare against
 */
function _resolveContextValue(conditionType, context) {
  switch (conditionType) {
    case 'product-match':      return context.products || [];
    case 'brand-match':        return context.brands || [];
    case 'market-segment':     return context.verticalMarket || context.marketSegments?.[0] || '';
    case 'maturity-threshold': return context.maturityLevel ?? 5;
    case 'jurisdiction-match': return context.jurisdictions || [];
    case 'requirement-scope':  return context.requirementScopes || [];
    case 'gap-severity':       return context.gapSeverity || '';
    case 'icp-seniority':      return context.icpSeniority || '';
    case 'persona-scope':      return context.personaScope || '';
    default:                   return '';
  }
}

/**
 * Evaluate a single scope condition against a PFI context.
 * Pure function — no side effects, no state access.
 *
 * @param {Object} condition - { conditionType, conditionOperator, conditionValue, conditionTarget }
 * @param {Object} context - PFI context bag
 * @returns {boolean} Whether the condition is satisfied
 */
export function evaluateScopeCondition(condition, context) {
  if (!condition || !context) return false;

  const { conditionType, conditionOperator, conditionValue } = condition;
  const contextValue = _resolveContextValue(conditionType, context);

  const numericValue = parseFloat(conditionValue);
  const numericContext = typeof contextValue === 'number' ? contextValue : parseFloat(contextValue);

  switch (conditionOperator) {
    case 'equals':
      if (Array.isArray(contextValue)) return contextValue.includes(conditionValue);
      return String(contextValue) === String(conditionValue);

    case 'not-equals':
      if (Array.isArray(contextValue)) return !contextValue.includes(conditionValue);
      return String(contextValue) !== String(conditionValue);

    case 'contains':
      if (Array.isArray(contextValue)) return contextValue.some(v => String(v).includes(conditionValue));
      return String(contextValue).includes(conditionValue);

    case 'greater-than':
      return !isNaN(numericContext) && !isNaN(numericValue) && numericContext > numericValue;

    case 'less-than':
      return !isNaN(numericContext) && !isNaN(numericValue) && numericContext < numericValue;

    case 'in-set': {
      const valueSet = Array.isArray(conditionValue) ? conditionValue : [conditionValue];
      if (Array.isArray(contextValue)) return contextValue.some(v => valueSet.includes(v));
      return valueSet.includes(contextValue);
    }

    default:
      return false;
  }
}

/**
 * Evaluate all scope rules for a PFI instance against a context bag.
 * Returns a ScopeResult describing which namespaces and entity types
 * should be included/excluded in the composed graph.
 *
 * @param {string} instanceId - e.g. 'PFI-BAIV'
 * @param {Object} context - PFI context bag (from resolveProductContext)
 * @returns {{ includedNamespaces: Set, excludedNamespaces: Set,
 *             includedEntityTypes: Set, excludedEntityTypes: Set,
 *             personaScope: string|null, ruleLog: Array }}
 */
export function evaluateScopeRules(instanceId, context) {
  const rules = SCOPE_RULES.get(instanceId);
  if (!rules || rules.length === 0) {
    return {
      includedNamespaces: new Set(),
      excludedNamespaces: new Set(),
      includedEntityTypes: new Set(),
      excludedEntityTypes: new Set(),
      personaScope: null,
      ruleLog: [{ ruleId: 'none', priority: 0, fired: false, action: 'no-rules', reason: `Instance ${instanceId} has no scope rules` }],
    };
  }

  const includedNamespaces = new Set();
  const excludedNamespaces = new Set();
  const includedEntityTypes = new Set();
  const excludedEntityTypes = new Set();
  let personaScope = null;
  const ruleLog = [];

  // Group rules by priority for same-priority ordering (BR-EMC-011)
  const priorityGroups = new Map();
  for (const rule of rules) {
    if (!priorityGroups.has(rule.priority)) priorityGroups.set(rule.priority, []);
    priorityGroups.get(rule.priority).push(rule);
  }

  const sortedPriorities = [...priorityGroups.keys()].sort((a, b) => a - b);

  for (const priority of sortedPriorities) {
    const group = priorityGroups.get(priority);

    // Within same priority: include-data before exclude-data (BR-EMC-011)
    group.sort((a, b) => {
      const aOrder = a.action?.actionType === 'include-data' ? 0 : 1;
      const bOrder = b.action?.actionType === 'include-data' ? 0 : 1;
      return aOrder - bOrder;
    });

    for (const rule of group) {
      if (!rule.isActive) {
        ruleLog.push({ ruleId: rule.ruleId, priority: rule.priority, fired: false, action: 'skipped', reason: 'Rule is inactive' });
        continue;
      }

      const conditions = rule.conditions || [];
      const allConditionsMet = conditions.length === 0 ||
        conditions.every(cond => evaluateScopeCondition(cond, context));

      if (!allConditionsMet) {
        ruleLog.push({ ruleId: rule.ruleId, priority: rule.priority, fired: false, action: 'conditions-not-met', reason: 'One or more conditions evaluated to false' });
        continue;
      }

      const action = rule.action;
      if (!action) {
        ruleLog.push({ ruleId: rule.ruleId, priority: rule.priority, fired: false, action: 'no-action', reason: 'Rule has no action defined' });
        continue;
      }

      switch (action.actionType) {
        case 'include-data':
          for (const ns of (action.targetNamespaces || [])) includedNamespaces.add(ns);
          for (const et of (action.targetEntityTypes || [])) includedEntityTypes.add(et);
          ruleLog.push({ ruleId: rule.ruleId, priority: rule.priority, fired: true, action: 'include-data', reason: `Included ${(action.targetNamespaces || []).join(', ')}` });
          break;

        case 'exclude-data':
          for (const ns of (action.targetNamespaces || [])) excludedNamespaces.add(ns);
          for (const et of (action.targetEntityTypes || [])) excludedEntityTypes.add(et);
          ruleLog.push({ ruleId: rule.ruleId, priority: rule.priority, fired: true, action: 'exclude-data', reason: `Excluded ${(action.targetNamespaces || []).join(', ')}` });
          break;

        case 'ghost':
          for (const ns of (action.targetNamespaces || [])) excludedNamespaces.add(ns);
          ruleLog.push({ ruleId: rule.ruleId, priority: rule.priority, fired: true, action: 'ghost', reason: `Ghosted ${(action.targetNamespaces || []).join(', ')}` });
          break;

        case 'scope-to-persona':
          personaScope = action.targetEntityFilter || action.targetEntityTypes?.[0] || null;
          ruleLog.push({ ruleId: rule.ruleId, priority: rule.priority, fired: true, action: 'scope-to-persona', reason: `Scoped to persona: ${personaScope}` });
          break;

        case 'merge-subgraph':
          ruleLog.push({ ruleId: rule.ruleId, priority: rule.priority, fired: true, action: 'merge-subgraph', reason: 'Merge subgraph (future — not yet implemented)' });
          break;

        default:
          ruleLog.push({ ruleId: rule.ruleId, priority: rule.priority, fired: false, action: action.actionType, reason: `Unknown action type: ${action.actionType}` });
      }
    }
  }

  return { includedNamespaces, excludedNamespaces, includedEntityTypes, excludedEntityTypes, personaScope, ruleLog };
}

/**
 * Resolve the product context bag for a PFI instance.
 * Reads from state.pfiInstances (config) and state.pfiInstanceData (loaded data).
 *
 * @param {string} instanceId - e.g. 'PFI-BAIV'
 * @returns {{ products: string[], brands: string[], marketSegments: string[],
 *             maturityLevel: number, jurisdictions: string[], verticalMarket: string,
 *             icpHierarchy: Array|null, icpSeniority: string|null,
 *             requirementScopes: string[], personaScope: string|null,
 *             gapSeverity: string|null }}
 */
export function resolveProductContext(instanceId) {
  const instanceConfig = state.pfiInstances.get(instanceId);
  const instanceData = state.pfiInstanceData.get(instanceId);
  const config = instanceConfig || instanceData?.config || {};

  // Include both product short names and productCode for scope rule matching
  const products = [...(config.products || [])];
  if (config.productCode && !products.includes(config.productCode)) {
    products.push(config.productCode);
  }

  const context = {
    products,
    brands: config.brands || [],
    marketSegments: config.verticalMarket ? [config.verticalMarket] : [],
    maturityLevel: config.maturityLevel ?? 5,
    jurisdictions: config.jurisdictions || [],
    verticalMarket: config.verticalMarket || '',
    requirementScopes: config.requirementScopes || [],
    icpHierarchy: null,
    icpSeniority: null,
    gapSeverity: null,
    personaScope: null,
  };

  // Enrich from loaded instance data: extract ICP hierarchy from VP-ONT data
  if (instanceData?.files) {
    for (const file of instanceData.files) {
      if (file.ontologyRef === 'VP-ONT' && file.parsed) {
        const icpNodes = (file.parsed.nodes || []).filter(n =>
          n.entityType === 'class' && (n.id?.includes('ICP') || n.id?.includes('IdealCustomerProfile'))
        );
        if (icpNodes.length > 0) {
          context.icpHierarchy = icpNodes.map(n => ({
            id: n.id, label: n.label, seniority: n.properties?.seniority || null,
          }));
          context.icpSeniority = context.icpHierarchy[0]?.seniority || null;
        }
      }
    }
  }

  // Enrich from org context
  const orgContext = config.orgContext || instanceData?.orgContext;
  if (orgContext?.industry && context.marketSegments.length === 0) {
    context.marketSegments.push(orgContext.industry);
  }

  return context;
}

/**
 * Resolve a join endpoint reference to a prefixed node ID.
 * @param {string} ref - e.g. 'vp:IdealCustomerProfile-CMO'
 * @param {Map} nodeIndex - Bidirectional node index
 * @returns {string|null} Prefixed node ID or null
 */
function _resolveJoinEndpoint(ref, nodeIndex) {
  if (!ref) return null;
  const parts = ref.match(/^([a-z][a-z0-9-]*):(.+)$/i);
  if (!parts) return null;
  const prefix = parts[1];
  const entity = parts[2];
  const prefixedId = `${prefix}::${entity}`;
  if (nodeIndex.has(prefixedId)) return prefixedId;
  // Try as-is (full ref might be an originalId in the index)
  const mapped = nodeIndex.get(ref);
  if (mapped && typeof mapped === 'string') return mapped;
  return null;
}

/**
 * Compose a filtered instance graph from loaded PFI instance data.
 * Takes the ScopeResult and assembles a graph from each included
 * ontology's instance data files.
 *
 * @param {string} instanceId - e.g. 'PFI-BAIV'
 * @param {{ includedNamespaces: Set, excludedNamespaces: Set,
 *           includedEntityTypes: Set, excludedEntityTypes: Set }} scopeResult
 * @returns {{ success: boolean, nodes?: Array, edges?: Array,
 *             metadata?: Object, error?: string }}
 */
export function composeInstanceGraph(instanceId, scopeResult) {
  const instanceData = state.pfiInstanceData.get(instanceId);
  if (!instanceData) {
    return { success: false, error: `No instance data loaded for ${instanceId}` };
  }

  const nodes = [];
  const edges = [];
  const nodeIndex = new Map();
  const ontologySources = [];
  let joinCount = 0;

  const hasIncludes = scopeResult.includedNamespaces.size > 0;
  const hasExcludes = scopeResult.excludedNamespaces.size > 0;

  for (const file of instanceData.files) {
    if (file.status !== 'loaded' || !file.parsed) continue;

    const ontShortName = file.ontologyRef?.replace(/-ONT$/, '') || '';
    const fileNs = NAME_TO_PREFIX[ontShortName] || `${ontShortName.toLowerCase()}:`;

    // Namespace filtering
    if (hasIncludes && !scopeResult.includedNamespaces.has(fileNs)) continue;
    if (hasExcludes && scopeResult.excludedNamespaces.has(fileNs)) continue;

    ontologySources.push(file.ontologyRef);
    const prefix = fileNs.replace(/:$/, '');

    for (const node of (file.parsed.nodes || [])) {
      const prefixedId = `${prefix}::${node.id}`;

      // Entity type filtering
      if (scopeResult.excludedEntityTypes.size > 0) {
        const entityTypeRef = `${fileNs}${node.label || node.id}`;
        if (scopeResult.excludedEntityTypes.has(entityTypeRef)) continue;
      }

      nodes.push({
        ...node,
        id: prefixedId,
        originalId: node.id,
        sourceNamespace: fileNs,
        sourceFile: file.ontologyRef,
        isInstanceData: true,
      });
      nodeIndex.set(prefixedId, true);
      nodeIndex.set(node.id, prefixedId);
    }

    for (const edge of (file.parsed.edges || [])) {
      const fromId = `${prefix}::${edge.from}`;
      const toId = `${prefix}::${edge.to}`;

      // Only include edges where both endpoints are in the graph
      const fromResolved = nodeIndex.has(fromId) ? fromId : (typeof nodeIndex.get(edge.from) === 'string' ? nodeIndex.get(edge.from) : null);
      const toResolved = nodeIndex.has(toId) ? toId : (typeof nodeIndex.get(edge.to) === 'string' ? nodeIndex.get(edge.to) : null);

      if (fromResolved && toResolved) {
        edges.push({
          ...edge,
          from: fromResolved,
          to: toResolved,
          sourceNamespace: fileNs,
          isInstanceData: true,
        });
      }
    }
  }

  // Resolve cross-ontology joins from composedGraphSpec
  const instanceConfig = state.pfiInstances.get(instanceId) || instanceData.config;
  const composedSpec = instanceConfig?.composedGraphSpec;
  if (composedSpec?.joinPoints) {
    for (const join of composedSpec.joinPoints) {
      const fromId = _resolveJoinEndpoint(join.from, nodeIndex);
      const toId = _resolveJoinEndpoint(join.to, nodeIndex);
      if (fromId && toId) {
        edges.push({
          from: fromId,
          to: toId,
          label: join.relationship || 'cross-join',
          edgeType: 'crossOntology',
          purpose: join.description || '',
          isCrossOntology: true,
          isInstanceData: true,
        });
        joinCount++;
      }
    }
  }

  return {
    success: true,
    nodes,
    edges,
    metadata: {
      ontologySources: [...new Set(ontologySources)],
      joinCount,
      entityCount: nodes.length,
      edgeCount: edges.length,
    },
  };
}

/**
 * Filter a composed graph to show only entities relevant to a specific persona.
 * BFS depth-2 from the ICP node captures the persona's workflow subgraph.
 *
 * @param {{ nodes: Array, edges: Array }} composedGraph
 * @param {string} icpRef - ICP reference (e.g. 'vp:IdealCustomerProfile-CMO')
 * @returns {{ success: boolean, nodes?: Array, edges?: Array,
 *             metadata?: Object, error?: string }}
 */
export function resolvePersonaWorkflowGraph(composedGraph, icpRef) {
  if (!composedGraph?.nodes || !icpRef) {
    return { success: false, error: 'composedGraph and icpRef are required' };
  }

  const icpNode = composedGraph.nodes.find(n =>
    n.id.includes(icpRef) || n.originalId === icpRef || n.id.endsWith('::' + icpRef)
  );

  if (!icpNode) {
    return { success: false, error: `ICP node ${icpRef} not found in composed graph` };
  }

  // BFS depth-2 from ICP node
  const connectedNodeIds = new Set([icpNode.id]);
  let edgeQueue = [icpNode.id];
  const visited = new Set([icpNode.id]);
  const maxDepth = 2;

  for (let depth = 0; depth < maxDepth && edgeQueue.length > 0; depth++) {
    const nextQueue = [];
    for (const nodeId of edgeQueue) {
      for (const edge of composedGraph.edges) {
        let neighbourId = null;
        if (edge.from === nodeId) neighbourId = edge.to;
        if (edge.to === nodeId) neighbourId = edge.from;
        if (neighbourId && !visited.has(neighbourId)) {
          visited.add(neighbourId);
          connectedNodeIds.add(neighbourId);
          nextQueue.push(neighbourId);
        }
      }
    }
    edgeQueue = nextQueue;
  }

  const filteredNodes = composedGraph.nodes.filter(n => connectedNodeIds.has(n.id));
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = composedGraph.edges.filter(e =>
    filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to)
  );

  return {
    success: true,
    nodes: filteredNodes,
    edges: filteredEdges,
    metadata: {
      personaRef: icpRef,
      filteredFromTotal: composedGraph.nodes.length,
      retainedCount: filteredNodes.length,
      edgeCount: filteredEdges.length,
    },
  };
}

// ─── Product/ICP Entity Bindings (Epic 19 — F19.5) ──────────────────────────

/**
 * Resolve explicit product bindings for a PFI instance.
 * Scans all loaded instance data files and binds every entity in each file
 * to the instance's productCode with confidence 1.0.
 *
 * @param {string} instanceId - e.g. 'PFI-BAIV'
 * @returns {Map<string, Array<{productCode: string, bindingType: string, confidence: number}>>}
 */
export function resolveProductBindings(instanceId) {
  const bindings = new Map();
  const instanceData = state.pfiInstanceData.get(instanceId);
  if (!instanceData?.files) return bindings;

  const instanceConfig = state.pfiInstances.get(instanceId) || instanceData.config || {};
  const productCode = instanceConfig.productCode || null;
  if (!productCode) return bindings;

  for (const file of instanceData.files) {
    if (file.status !== 'loaded' || !file.parsed) continue;

    const ontShortName = file.ontologyRef?.replace(/-ONT$/, '') || '';
    const fileNs = NAME_TO_PREFIX[ontShortName] || `${ontShortName.toLowerCase()}:`;
    const prefix = fileNs.replace(/:$/, '');

    for (const node of (file.parsed.nodes || [])) {
      const prefixedId = `${prefix}::${node.id}`;
      const existing = bindings.get(prefixedId) || [];
      // Avoid duplicate bindings for the same productCode
      if (!existing.some(b => b.productCode === productCode)) {
        existing.push({ productCode, bindingType: 'instance-data', confidence: 1.0 });
        bindings.set(prefixedId, existing);
      }
    }
  }

  return bindings;
}

/**
 * Resolve ICP bindings for a PFI instance.
 * Scans VP-ONT instance data for ownerRole references on Problem entities
 * and cascades ICP binding to related solutions and benefits.
 *
 * @param {string} instanceId - e.g. 'PFI-BAIV'
 * @returns {Map<string, Array<{icpRef: string, icpLabel: string, seniorityLevel: number|null, functionScope: string|null}>>}
 */
export function resolveICPBindings(instanceId) {
  const bindings = new Map();
  const instanceData = state.pfiInstanceData.get(instanceId);
  if (!instanceData?.files) return bindings;

  // Find VP-ONT file
  const vpFile = instanceData.files.find(f =>
    f.ontologyRef === 'VP-ONT' && f.status === 'loaded' && f.parsed
  );
  if (!vpFile) return bindings;

  const vpNodes = vpFile.parsed.nodes || [];
  const vpEdges = vpFile.parsed.edges || [];

  // Build node lookup and ICP map
  const nodeById = new Map();
  const icpByRole = new Map();
  for (const node of vpNodes) {
    nodeById.set(node.id, node);
    // Index ICP/RoleBasedICP nodes by roleRef
    if (node.entityType === 'class' &&
        (node.id?.includes('ICP') || node.id?.includes('IdealCustomerProfile') ||
         node.properties?.roleRef)) {
      const roleRef = node.properties?.roleRef || node.id;
      icpByRole.set(roleRef, {
        icpRef: node.id,
        icpLabel: node.label || node.id,
        seniorityLevel: node.properties?.seniorityLevel ?? null,
        functionScope: node.properties?.functionScope ?? null,
      });
    }
  }

  // Bind ICP/RoleBasedICP nodes to themselves
  for (const [, icpInfo] of icpByRole) {
    const prefixedId = `vp::${icpInfo.icpRef}`;
    bindings.set(prefixedId, [icpInfo]);
  }

  // Bind problems via ownerRole
  const problemIcpMap = new Map(); // problemId → icpInfo
  for (const node of vpNodes) {
    const ownerRole = node.properties?.ownerRole;
    if (!ownerRole) continue;

    // Find matching ICP by roleRef
    const icpInfo = icpByRole.get(ownerRole);
    if (icpInfo) {
      const prefixedId = `vp::${node.id}`;
      const existing = bindings.get(prefixedId) || [];
      if (!existing.some(b => b.icpRef === icpInfo.icpRef)) {
        existing.push(icpInfo);
        bindings.set(prefixedId, existing);
      }
      problemIcpMap.set(node.id, icpInfo);
    }
  }

  // Cascade from problems to solutions/benefits via edges
  for (const edge of vpEdges) {
    const parentIcp = problemIcpMap.get(edge.from);
    if (!parentIcp) continue;

    // Check if target is a solution or benefit (child of problem)
    const targetNode = nodeById.get(edge.to);
    if (!targetNode) continue;

    const edgeLabel = (edge.label || '').toLowerCase();
    const isCascadeEdge = edgeLabel.includes('solution') ||
      edgeLabel.includes('benefit') ||
      edgeLabel.includes('has') ||
      edge.to?.includes('sol-') || edge.to?.includes('ben-');

    if (isCascadeEdge) {
      const prefixedId = `vp::${edge.to}`;
      const existing = bindings.get(prefixedId) || [];
      if (!existing.some(b => b.icpRef === parentIcp.icpRef)) {
        existing.push(parentIcp);
        bindings.set(prefixedId, existing);
      }
    }
  }

  return bindings;
}

/**
 * Infer product bindings by BFS proximity from explicitly-bound entities.
 * Does not override explicit bindings. Confidence: depth 1 = 0.5, depth 2 = 0.25.
 *
 * @param {{ nodes: Array, edges: Array }} composedGraph
 * @param {Map<string, Array<{productCode: string, bindingType: string, confidence: number}>>} explicitBindings
 * @returns {Map<string, Array<{productCode: string, bindingType: string, confidence: number}>>}
 */
export function inferProductBindings(composedGraph, explicitBindings) {
  const inferred = new Map();
  if (!composedGraph?.nodes || !composedGraph?.edges || !explicitBindings) return inferred;

  // Build adjacency from edges
  const adjacency = new Map();
  for (const edge of composedGraph.edges) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
    adjacency.get(edge.from).push(edge.to);
    adjacency.get(edge.to).push(edge.from);
  }

  // BFS from each explicitly-bound node
  const maxDepth = 2;
  const confidenceByDepth = { 1: 0.5, 2: 0.25 };

  for (const [entityId, productBindings] of explicitBindings) {
    for (const binding of productBindings) {
      const visited = new Set([entityId]);
      let queue = [entityId];

      for (let depth = 1; depth <= maxDepth && queue.length > 0; depth++) {
        const nextQueue = [];
        for (const nodeId of queue) {
          const neighbours = adjacency.get(nodeId) || [];
          for (const neighbour of neighbours) {
            if (visited.has(neighbour)) continue;
            visited.add(neighbour);
            nextQueue.push(neighbour);

            // Skip if already explicitly bound to same product
            const existingExplicit = explicitBindings.get(neighbour);
            if (existingExplicit?.some(b => b.productCode === binding.productCode)) continue;

            // Add inferred binding
            const existing = inferred.get(neighbour) || [];
            if (!existing.some(b => b.productCode === binding.productCode)) {
              existing.push({
                productCode: binding.productCode,
                bindingType: 'inferred',
                confidence: confidenceByDepth[depth],
              });
              inferred.set(neighbour, existing);
            }
          }
        }
        queue = nextQueue;
      }
    }
  }

  return inferred;
}

// ─── Canonical Snapshot Freeze Pipeline (Epic 19 — F19.3) ───────────────────

/**
 * Recursively apply Object.freeze() to an object and all nested objects/arrays.
 * Skips already-frozen objects to avoid redundant traversal.
 * @param {*} obj
 * @returns {*} The frozen object
 */
function _deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) return obj;
  Object.freeze(obj);
  for (const val of Object.values(obj)) {
    if (val !== null && typeof val === 'object') _deepFreeze(val);
  }
  return obj;
}

/**
 * Compare two semver strings. Returns -1, 0, or 1.
 * @param {string} a - e.g. '1.0.0'
 * @param {string} b - e.g. '1.1.0'
 * @returns {number}
 */
function _compareSemver(a, b) {
  const pa = (a || '0.0.0').split('.').map(Number);
  const pb = (b || '0.0.0').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
  }
  return 0;
}

/**
 * Freeze a composed graph spec as an immutable canonical snapshot.
 * Deep-clones the spec, stamps metadata, applies Object.freeze(),
 * supersedes any previous version, and persists to state + localStorage.
 *
 * @param {Object} composedGraphSpec - The spec to freeze (must have specId)
 * @param {string} version - Semver version string (e.g. '1.0.0')
 * @param {string} adminRef - Admin or system reference
 * @returns {{ success: boolean, snapshot?: Object, error?: string }}
 */
export function freezeComposedGraph(composedGraphSpec, version, adminRef) {
  if (!composedGraphSpec) {
    return { success: false, error: 'composedGraphSpec is required' };
  }
  if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
    return { success: false, error: `Invalid semver version: ${version}` };
  }

  const specId = composedGraphSpec.specId || composedGraphSpec['@id'] || 'snapshot';
  const snapshotId = `${specId}-v${version}`;

  if (state.canonicalSnapshots.has(snapshotId)) {
    return { success: false, error: `Snapshot ${snapshotId} already exists` };
  }

  // Deep-clone to prevent mutation of source
  const snapshot = JSON.parse(JSON.stringify(composedGraphSpec));
  snapshot.snapshotId = snapshotId;
  snapshot.snapshotVersion = version;
  snapshot.sourceComposedGraphSpec = specId;
  snapshot.frozenAt = new Date().toISOString();
  snapshot.frozenBy = adminRef || 'system';
  snapshot.changeControlStatus = 'locked';
  snapshot.parentSnapshot = null;

  // Find and supersede previous version for same specId
  const versionList = state.snapshotVersionIndex.get(specId) || [];
  if (versionList.length > 0) {
    const previousId = versionList[versionList.length - 1];
    const previous = state.canonicalSnapshots.get(previousId);
    if (previous) {
      // Supersede previous — need to replace with unfrozen copy to change status
      const unfrozenPrev = JSON.parse(JSON.stringify(previous));
      unfrozenPrev.changeControlStatus = 'superseded';
      state.canonicalSnapshots.set(previousId, _deepFreeze(unfrozenPrev));
      snapshot.parentSnapshot = previousId;
    }
  }

  // Freeze and store
  _deepFreeze(snapshot);
  state.canonicalSnapshots.set(snapshotId, snapshot);

  // Update version index
  versionList.push(snapshotId);
  state.snapshotVersionIndex.set(specId, versionList);

  _persistSnapshots();

  return { success: true, snapshot };
}

/**
 * Retrieve a frozen snapshot by ID. Returns an immutable copy (not a reference).
 *
 * @param {string} snapshotId
 * @returns {Object|null} Deep-frozen copy of the snapshot, or null
 */
export function getCanonicalSnapshot(snapshotId) {
  const snapshot = state.canonicalSnapshots.get(snapshotId);
  if (!snapshot) return null;
  // Return a deep-frozen copy, not the stored reference
  return _deepFreeze(JSON.parse(JSON.stringify(snapshot)));
}

/**
 * List all snapshot versions for a ComposedGraphSpec, sorted by semver.
 *
 * @param {string} specId
 * @returns {Array<{ snapshotId: string, version: string, frozenAt: string, changeControlStatus: string, parentSnapshot: string|null }>}
 */
export function listSnapshotVersions(specId) {
  const ids = state.snapshotVersionIndex.get(specId);
  if (!ids || ids.length === 0) return [];

  const versions = [];
  for (const id of ids) {
    const snap = state.canonicalSnapshots.get(id);
    if (snap) {
      versions.push({
        snapshotId: snap.snapshotId,
        version: snap.snapshotVersion,
        frozenAt: snap.frozenAt,
        changeControlStatus: snap.changeControlStatus,
        parentSnapshot: snap.parentSnapshot,
      });
    }
  }

  versions.sort((a, b) => _compareSemver(a.version, b.version));
  return versions;
}

/**
 * Link a PFI instance to a locked canonical snapshot.
 * Validates the snapshot is locked, then triggers graph composition.
 *
 * @param {string} instanceId - e.g. 'PFI-BAIV'
 * @param {string} snapshotId
 * @returns {{ success: boolean, composedGraph?: Object, error?: string }}
 */
export function inheritSnapshot(instanceId, snapshotId) {
  const snapshot = getCanonicalSnapshot(snapshotId);
  if (!snapshot) {
    return { success: false, error: `Snapshot ${snapshotId} not found` };
  }
  if (snapshot.changeControlStatus !== 'locked') {
    return { success: false, error: `Snapshot ${snapshotId} is ${snapshot.changeControlStatus}, not locked` };
  }

  // Update instance config with inherited snapshot reference
  const instanceConfig = state.pfiInstances.get(instanceId);
  if (instanceConfig) {
    instanceConfig.inheritedSnapshotId = snapshotId;
  } else {
    state.pfiInstances.set(instanceId, { instanceId, inheritedSnapshotId: snapshotId });
  }

  // Trigger composed graph generation
  const context = resolveProductContext(instanceId);
  const scopeResult = evaluateScopeRules(instanceId, context);
  const composedGraph = composeInstanceGraph(instanceId, scopeResult);

  state.composedPFIGraph = composedGraph;
  _persistPFIInstances();

  return { success: true, composedGraph };
}

/**
 * Compare two snapshot versions and return a structured diff.
 * Reuses the diffProps pattern from diff-engine.js adapted for graph structures.
 *
 * @param {string} oldSnapshotId - null or snapshotId for old version
 * @param {string} newSnapshotId
 * @returns {{ success: boolean, summary?: Object, nodes?: Object, edges?: Object, metadata?: Array, oldVersion?: string, newVersion?: string, error?: string }}
 */
export function diffSnapshots(oldSnapshotId, newSnapshotId) {
  const newSnap = oldSnapshotId === newSnapshotId ? null : getCanonicalSnapshot(newSnapshotId);
  if (!newSnap && newSnapshotId) {
    const fetched = getCanonicalSnapshot(newSnapshotId);
    if (!fetched) return { success: false, error: `New snapshot ${newSnapshotId} not found` };
  }
  const newSnapshot = getCanonicalSnapshot(newSnapshotId);
  if (!newSnapshot) {
    return { success: false, error: `New snapshot ${newSnapshotId} not found` };
  }

  const oldSnapshot = oldSnapshotId ? getCanonicalSnapshot(oldSnapshotId) : null;

  // Build node maps
  const oldNodes = new Map();
  const newNodes = new Map();
  for (const n of (oldSnapshot?.nodes || oldSnapshot?.componentOntologies || [])) {
    oldNodes.set(n.id || n['@id'] || n.ontologyRef, n);
  }
  for (const n of (newSnapshot.nodes || newSnapshot.componentOntologies || [])) {
    newNodes.set(n.id || n['@id'] || n.ontologyRef, n);
  }

  // Node diff
  const nodesAdded = [];
  const nodesRemoved = [];
  const nodesModified = [];

  for (const [id, node] of newNodes) {
    if (!oldNodes.has(id)) {
      nodesAdded.push({ id, node });
    } else {
      const oldNode = oldNodes.get(id);
      const changes = _diffObjProps(oldNode, node);
      if (changes.length > 0) {
        nodesModified.push({ id, node, oldNode, changes });
      }
    }
  }
  for (const [id, node] of oldNodes) {
    if (!newNodes.has(id)) {
      nodesRemoved.push({ id, node });
    }
  }

  // Edge diff
  const edgeKey = e => `${e.from}→${e.to}:${e.label || e.relationship || ''}`;
  const oldEdges = new Map();
  const newEdges = new Map();
  for (const e of (oldSnapshot?.edges || oldSnapshot?.joinPoints || [])) oldEdges.set(edgeKey(e), e);
  for (const e of (newSnapshot.edges || newSnapshot.joinPoints || [])) newEdges.set(edgeKey(e), e);

  const edgesAdded = [];
  const edgesRemoved = [];
  for (const [key, edge] of newEdges) {
    if (!oldEdges.has(key)) edgesAdded.push({ key, edge });
  }
  for (const [key, edge] of oldEdges) {
    if (!newEdges.has(key)) edgesRemoved.push({ key, edge });
  }

  // Metadata diff
  const metaKeys = ['snapshotVersion', 'frozenAt', 'frozenBy', 'sourceComposedGraphSpec', 'changeControlStatus'];
  const metadata = [];
  for (const key of metaKeys) {
    const oldVal = oldSnapshot?.[key];
    const newVal = newSnapshot[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      metadata.push({ property: key, oldValue: oldVal ?? null, newValue: newVal });
    }
  }

  return {
    success: true,
    summary: {
      nodesAdded: nodesAdded.length,
      nodesRemoved: nodesRemoved.length,
      nodesModified: nodesModified.length,
      edgesAdded: edgesAdded.length,
      edgesRemoved: edgesRemoved.length,
    },
    nodes: { added: nodesAdded, removed: nodesRemoved, modified: nodesModified },
    edges: { added: edgesAdded, removed: edgesRemoved },
    metadata,
    oldVersion: oldSnapshot?.snapshotVersion || null,
    newVersion: newSnapshot.snapshotVersion,
  };
}

/**
 * Compare all properties of two objects, returning changed properties.
 * @param {Object} oldObj
 * @param {Object} newObj
 * @returns {Array<{ property: string, oldValue: *, newValue: * }>}
 */
function _diffObjProps(oldObj, newObj) {
  const changes = [];
  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
  for (const key of allKeys) {
    if (key.startsWith('_')) continue;
    if (JSON.stringify(oldObj?.[key]) !== JSON.stringify(newObj?.[key])) {
      changes.push({ property: key, oldValue: oldObj?.[key], newValue: newObj?.[key] });
    }
  }
  return changes;
}

// ─── PFI Runtime Pipeline (Epic 19 — Feature 19.4) ─────────────────────────

/**
 * Generate a full PFI instance graph from a frozen canonical snapshot.
 * Orchestrates: snapshot validation → product context → scope rules → composed graph.
 *
 * @param {string} instanceId - e.g. 'PFI-BAIV'
 * @param {string} snapshotId - e.g. 'BAIV-COMPOSED-GRAPH-v1.0.0'
 * @returns {{ success: boolean, composedGraph?: Object, scopeResult?: Object, context?: Object, error?: string }}
 */
export function generatePFIGraph(instanceId, snapshotId) {
  if (!instanceId) return { success: false, error: 'instanceId is required' };
  if (!snapshotId) return { success: false, error: 'snapshotId is required' };

  const snapshot = getCanonicalSnapshot(snapshotId);
  if (!snapshot) {
    return { success: false, error: `Snapshot ${snapshotId} not found` };
  }
  if (snapshot.changeControlStatus !== 'locked') {
    return { success: false, error: `Snapshot ${snapshotId} is ${snapshot.changeControlStatus}, not locked` };
  }

  const context = resolveProductContext(instanceId);
  const scopeResult = evaluateScopeRules(instanceId, context);
  const composedGraph = composeInstanceGraph(instanceId, scopeResult);

  state.composedPFIGraph = composedGraph;
  state.scopeRulesActive = true;
  state.productContext = context;
  state.scopeRuleLog = scopeResult.ruleLog || [];

  _persistPFIInstances();

  return { success: true, composedGraph, scopeResult, context };
}

/**
 * Generate a persona-scoped workflow graph for a specific ICP role.
 * Wraps resolvePersonaWorkflowGraph with state management.
 *
 * @param {string} instanceId - e.g. 'PFI-BAIV'
 * @param {string|null} icpRef - e.g. 'vp:IdealCustomerProfile-SocManager', or null to clear
 * @returns {{ success: boolean, workflowGraph?: Object, personaRef?: string, error?: string }}
 */
export function generatePersonaWorkflow(instanceId, icpRef) {
  if (!instanceId) return { success: false, error: 'instanceId is required' };

  // Clear persona scope
  if (!icpRef) {
    state.activePersonaScope = null;
    return { success: true, workflowGraph: state.composedPFIGraph, personaRef: null };
  }

  const composedGraph = state.composedPFIGraph;
  if (!composedGraph) {
    return { success: false, error: 'No composed PFI graph — call generatePFIGraph first' };
  }

  const workflowGraph = resolvePersonaWorkflowGraph(composedGraph, icpRef);
  state.activePersonaScope = icpRef;

  return { success: true, workflowGraph, personaRef: icpRef };
}

// ─── Composition Engine (7.3.1, 7.3.4) ─────────────────────────────────────

/**
 * Compose an ontology set for a given RequirementCategory.
 *
 * @param {string} categoryCode - e.g. 'STRATEGIC', 'ENTERPRISE'
 * @param {Object} [options]
 * @param {'PFC'|'PFI'} [options.contextLevel='PFC']
 * @param {string}       [options.productCode]    - Required when PFI
 * @param {number}       [options.maturityLevel=5] - Org maturity 1-5
 * @param {boolean}      [options.includeRecommended=true]
 * @param {boolean}      [options.includeOptional=false]
 * @param {boolean}      [options.complianceScope=false] - Force RCSG overlay
 * @returns {{ success: boolean, composition?: Object, ruleLog?: Array, error?: string }}
 */
export function composeOntologySet(categoryCode, options = {}) {
  const category = CATEGORY_COMPOSITIONS[categoryCode];
  if (!category) {
    return { success: false, error: `Unknown category: ${categoryCode}` };
  }

  const {
    contextLevel = 'PFC',
    productCode = null,
    maturityLevel = 5,
    includeRecommended = true,
    includeOptional = false,
    complianceScope = false,
  } = options;

  const ruleLog = [];
  const required = new Set(category.required);
  const recommended = new Set(category.recommended);
  const optional = new Set(category.optional);
  const activeSeries = new Set(category.activeSeries);

  // ── Rule 1 (P1): Foundation Always Required ──
  if (!required.has('ORG')) {
    required.add('ORG');
    ruleLog.push({ rule: 'FoundationAlwaysRequired', priority: 1, action: 'Added ORG to required' });
  } else {
    ruleLog.push({ rule: 'FoundationAlwaysRequired', priority: 1, action: 'ORG already in required' });
  }
  activeSeries.add('Foundation');

  // ── Rule 2 (P2): Dependency Chain Resolution ──
  const beforeDeps = new Set(required);
  resolveDependencyChain(required);
  const addedByDep = [...required].filter(x => !beforeDeps.has(x));
  if (addedByDep.length > 0) {
    ruleLog.push({ rule: 'DependencyChainResolution', priority: 2, action: `Added dependencies: ${addedByDep.join(', ')}` });
  } else {
    ruleLog.push({ rule: 'DependencyChainResolution', priority: 2, action: 'No additional dependencies needed' });
  }

  // ── Rule 3 (P3): Category Minimum Ontologies ──
  if (required.size < 1) {
    return { success: false, error: 'Category must have at least 1 required ontology' };
  }
  ruleLog.push({ rule: 'CategoryMinimumOntologies', priority: 3, action: `${required.size} required ontologies — OK` });

  // ── Rule 4 (P4): PFI Requires Product Context ──
  if (contextLevel === 'PFI') {
    if (!productCode) {
      return { success: false, error: 'PFI context requires a product code' };
    }
    ruleLog.push({ rule: 'PFIRequiresProductContext', priority: 4, action: `PFI product: ${productCode}` });
  } else {
    ruleLog.push({ rule: 'PFIRequiresProductContext', priority: 4, action: 'PFC context — no product required' });
  }

  // ── Rule 5 (P5): Maturity-Based Filtering ──
  if (maturityLevel < 3) {
    for (const adv of ADVANCED_ONTOLOGIES) {
      if (required.has(adv)) {
        required.delete(adv);
        ruleLog.push({ rule: 'MaturityBasedFiltering', priority: 5, action: `Excluded ${adv} (maturity ${maturityLevel} < 3)` });
      }
      recommended.delete(adv);
      optional.delete(adv);
    }
  } else {
    ruleLog.push({ rule: 'MaturityBasedFiltering', priority: 5, action: `Maturity ${maturityLevel} ≥ 3 — no filtering` });
  }

  // ── Rule 6 (P6): RCSG Governance Overlay ──
  if (complianceScope || categoryCode === 'COMPLIANCE') {
    for (const rcsg of RCSG_CORE) {
      if (!required.has(rcsg)) {
        required.add(rcsg);
      }
    }
    activeSeries.add('RCSG-Series');
    ruleLog.push({ rule: 'RCSGGovernanceOverlay', priority: 6, action: 'RCSG overlay activated (MCSB, GDPR, PII)' });
    // Re-run dependency chain for RCSG
    resolveDependencyChain(required);
  } else {
    ruleLog.push({ rule: 'RCSGGovernanceOverlay', priority: 6, action: 'No compliance scope — RCSG not activated' });
  }

  // ── Rule 7 (P7): Enterprise All Series ──
  if (categoryCode === 'ENTERPRISE') {
    for (const series of ALL_SERIES) activeSeries.add(series);
    ruleLog.push({ rule: 'EnterpriseAllSeries', priority: 7, action: `All ${ALL_SERIES.length} series activated` });
  } else {
    ruleLog.push({ rule: 'EnterpriseAllSeries', priority: 7, action: 'Not enterprise scope' });
  }

  // Build final ontology list
  const finalOntologies = [...required];
  if (includeRecommended) {
    for (const r of recommended) {
      if (!required.has(r)) finalOntologies.push(r);
    }
  }
  if (includeOptional) {
    for (const o of optional) {
      if (!required.has(o) && !recommended.has(o)) finalOntologies.push(o);
    }
  }

  // Map to namespaces
  const namespaces = finalOntologies.map(n => NAME_TO_PREFIX[n] || `${n.toLowerCase()}:`);

  const composition = {
    compositionId: `comp-${categoryCode}-${contextLevel}-${Date.now()}`,
    categoryCode,
    categoryName: category.name,
    contextLevel,
    productCode: contextLevel === 'PFI' ? productCode : null,
    maturityLevel,
    requiredOntologies: [...required],
    recommendedOntologies: includeRecommended ? [...recommended].filter(r => !required.has(r)) : [],
    optionalOntologies: includeOptional ? [...optional].filter(o => !required.has(o) && !recommended.has(o)) : [],
    allOntologies: finalOntologies,
    namespaces,
    activeSeries: [...activeSeries],
    createdAt: new Date().toISOString(),
  };

  return { success: true, composition, ruleLog };
}

/**
 * Lists all available RequirementCategories.
 */
export function listCategories() {
  return Object.values(CATEGORY_COMPOSITIONS).map(c => ({
    code: c.code,
    name: c.name,
    requiredCount: c.required.length,
    activeSeries: c.activeSeries,
  }));
}

/**
 * Gets a single category definition.
 */
export function getCategory(code) {
  return CATEGORY_COMPOSITIONS[code] || null;
}

// ─── Multi-Category Union Composition (Epic 9F.2) ───────────────────────────

/**
 * Compose a union of multiple RequirementCategory compositions.
 * Deduplicates ontologies across categories and tracks overlap.
 *
 * @param {string[]} categoryCodes - e.g. ['PRODUCT', 'COMPETITIVE', 'STRATEGIC']
 * @param {Object} [options] - Same options as composeOntologySet
 * @returns {{ success, composition?, perCategory?, overlapCount?, ruleLog?, error? }}
 */
export function composeMultiCategory(categoryCodes, options = {}) {
  if (!Array.isArray(categoryCodes) || categoryCodes.length === 0) {
    return { success: false, error: 'At least one category code is required' };
  }

  // Single category — delegate directly for efficiency
  if (categoryCodes.length === 1) {
    const result = composeOntologySet(categoryCodes[0], options);
    if (!result.success) return result;
    return {
      success: true,
      composition: result.composition,
      perCategory: [{ code: categoryCodes[0], composition: result.composition, ruleLog: result.ruleLog }],
      overlapCount: 0,
      ruleLog: result.ruleLog,
    };
  }

  // Compose each category individually
  const perCategory = [];
  const allRuleLogs = [];
  const mergedRequired = new Set();
  const mergedRecommended = new Set();
  const mergedOptional = new Set();
  const mergedSeries = new Set();
  const ontologyCategoryCount = new Map(); // ontName → number of categories containing it

  for (const code of categoryCodes) {
    const result = composeOntologySet(code, options);
    if (!result.success) {
      return { success: false, error: `Category ${code}: ${result.error}` };
    }
    perCategory.push({ code, composition: result.composition, ruleLog: result.ruleLog });
    allRuleLogs.push(...result.ruleLog.map(r => ({ ...r, category: code })));

    for (const ont of result.composition.requiredOntologies) {
      mergedRequired.add(ont);
      ontologyCategoryCount.set(ont, (ontologyCategoryCount.get(ont) || 0) + 1);
    }
    for (const ont of result.composition.recommendedOntologies) {
      mergedRecommended.add(ont);
      ontologyCategoryCount.set(ont, (ontologyCategoryCount.get(ont) || 0) + 1);
    }
    for (const ont of result.composition.optionalOntologies) {
      mergedOptional.add(ont);
      ontologyCategoryCount.set(ont, (ontologyCategoryCount.get(ont) || 0) + 1);
    }
    for (const s of result.composition.activeSeries) {
      mergedSeries.add(s);
    }
  }

  // Deduplicate: required wins over recommended, recommended wins over optional
  for (const r of mergedRequired) {
    mergedRecommended.delete(r);
    mergedOptional.delete(r);
  }
  for (const r of mergedRecommended) {
    mergedOptional.delete(r);
  }

  const allOntologies = [...mergedRequired, ...mergedRecommended, ...mergedOptional];
  const namespaces = allOntologies.map(n => NAME_TO_PREFIX[n] || `${n.toLowerCase()}:`);

  // Count ontologies appearing in 2+ categories
  let overlapCount = 0;
  for (const count of ontologyCategoryCount.values()) {
    if (count > 1) overlapCount++;
  }

  const categoryNames = categoryCodes.map(c => CATEGORY_COMPOSITIONS[c]?.name || c);

  const composition = {
    compositionId: `comp-MULTI-${options.contextLevel || 'PFC'}-${Date.now()}`,
    categoryCode: categoryCodes.join('+'),
    categoryName: categoryNames.join(' + '),
    contextLevel: options.contextLevel || 'PFC',
    productCode: options.contextLevel === 'PFI' ? (options.productCode || null) : null,
    maturityLevel: options.maturityLevel || 5,
    requiredOntologies: [...mergedRequired],
    recommendedOntologies: [...mergedRecommended],
    optionalOntologies: [...mergedOptional],
    allOntologies,
    namespaces,
    activeSeries: [...mergedSeries],
    createdAt: new Date().toISOString(),
  };

  return { success: true, composition, perCategory, overlapCount, ruleLog: allRuleLogs };
}

// ─── Instance Ontology Constraint (PFI filtering) ───────────────────────────

/**
 * Constrain a composition to only the ontologies declared in a PFI instance's
 * instanceOntologies array. The instance list is used as the authoritative set
 * of visible ontologies — no dependency chain expansion (foundation ontologies
 * not in the list render as ghosts via activeSeries classification in
 * buildFilteredView). If instanceOntologies is empty/absent, the composition
 * is returned unchanged.
 *
 * @param {Object} composition - From composeOntologySet() or composeMultiCategory()
 * @param {string[]} instanceOntologies - e.g. ["VP-ONT", "RRR-ONT", "LSC-ONT"]
 * @returns {Object} Constrained composition (new object, original unmodified)
 */
export function constrainToInstanceOntologies(composition, instanceOntologies) {
  if (!composition || !Array.isArray(instanceOntologies) || instanceOntologies.length === 0) {
    return composition;
  }

  // Normalise: strip "-ONT" suffix, uppercase, skip file-path entries
  let skippedPathEntries = 0;
  const normalised = instanceOntologies
    .map(name => {
      if (name.includes('/')) {
        console.warn(`[EMC] Skipping file-path entry in instanceOntologies: "${name}" — use short name (e.g. "VP-ONT") instead`);
        skippedPathEntries++;
        return null;
      }
      return name.replace(/-ONT$/i, '').toUpperCase();
    })
    .filter(Boolean);

  if (normalised.length === 0) return composition;

  // Use instance list directly as the visible ontology set
  const instanceSet = new Set(normalised);
  const namespaces = [...instanceSet].map(n => NAME_TO_PREFIX[n] || `${n.toLowerCase()}:`);

  return {
    ...composition,
    allOntologies: [...instanceSet],
    namespaces,
    requiredOntologies: [...instanceSet],
    recommendedOntologies: [],
    optionalOntologies: [],
    instanceConstrained: true,
    instanceOntologiesRaw: instanceOntologies,
    skippedPathEntries,
  };
}

// ─── Dependency Chain Resolution ────────────────────────────────────────────

/**
 * Recursively resolve dependencies and add them to the set.
 * @param {Set<string>} ontologies - Mutable set of ontology short names
 */
function resolveDependencyChain(ontologies) {
  const queue = [...ontologies];
  const visited = new Set(ontologies);

  while (queue.length > 0) {
    const current = queue.shift();
    const deps = DEPENDENCY_MAP[current] || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        visited.add(dep);
        ontologies.add(dep);
        queue.push(dep);
      }
    }
  }
}

// ─── PFI Instance Configuration (7.3.3) ────────────────────────────────────

/**
 * Creates a new PFI Instance Configuration.
 *
 * @param {Object} params
 * @param {string} params.instanceId    - e.g. 'PFI-BAIV'
 * @param {string} params.productCode   - e.g. 'BAIV-AIV'
 * @param {string} params.instanceName  - e.g. 'BAIV AI Visibility'
 * @param {string} params.description
 * @param {string[]} params.requirementScopes - Category codes, e.g. ['PRODUCT', 'COMPETITIVE']
 * @param {number}  [params.maturityLevel=5]
 * @param {boolean} [params.complianceScope=false]
 * @returns {{ success: boolean, instance?: Object, compositions?: Object[], error?: string }}
 */
export function createPFIInstance(params) {
  const { instanceId, productCode, instanceName, description, requirementScopes, maturityLevel = 5, complianceScope = false } = params;

  if (!instanceId || !productCode || !instanceName) {
    return { success: false, error: 'instanceId, productCode, and instanceName are required' };
  }
  if (!requirementScopes || requirementScopes.length === 0) {
    return { success: false, error: 'At least one requirement scope is required' };
  }

  // Compose ontology set for each scope and merge
  const mergedRequired = new Set();
  const mergedRecommended = new Set();
  const mergedSeries = new Set();
  const compositions = [];

  for (const scope of requirementScopes) {
    const result = composeOntologySet(scope, {
      contextLevel: 'PFI',
      productCode,
      maturityLevel,
      complianceScope,
      includeRecommended: true,
    });
    if (!result.success) return result;
    compositions.push(result);
    for (const ont of result.composition.requiredOntologies) mergedRequired.add(ont);
    for (const ont of result.composition.recommendedOntologies) mergedRecommended.add(ont);
    for (const s of result.composition.activeSeries) mergedSeries.add(s);
  }

  const instance = {
    '@id': instanceId,
    '@type': 'emc:InstanceConfiguration',
    instanceId,
    productCode,
    instanceName,
    description: description || '',
    contextLevel: 'PFI',
    requirementScopes,
    maturityLevel,
    complianceScope,
    requiredOntologies: [...mergedRequired],
    recommendedOntologies: [...mergedRecommended].filter(r => !mergedRequired.has(r)),
    activeSeries: [...mergedSeries],
    instanceDataFiles: [],
    createdAt: new Date().toISOString(),
    version: '1.0.0',
  };

  // Store in state
  state.pfiInstances.set(instanceId, instance);
  _persistPFIInstances();

  return { success: true, instance, compositions };
}

/**
 * Gets all PFI instances.
 */
export function getPFIInstances() {
  return [...state.pfiInstances.values()];
}

/**
 * Gets a specific PFI instance.
 */
export function getPFIInstance(instanceId) {
  return state.pfiInstances.get(instanceId) || null;
}

/**
 * Deletes a PFI instance.
 */
export function deletePFIInstance(instanceId) {
  if (!state.pfiInstances.has(instanceId)) {
    return { success: false, error: `Instance ${instanceId} not found` };
  }
  state.pfiInstances.delete(instanceId);
  _persistPFIInstances();
  return { success: true };
}

// ─── Test Data Generation (7.3.5) ──────────────────────────────────────────

/**
 * Generates sample test data for a composed ontology set.
 * Creates 2-3 sample entities and 1-2 sample relationships per ontology.
 *
 * @param {Object} composition - From composeOntologySet().composition
 * @returns {{ success: boolean, testData?: Object }}
 */
export function generateTestData(composition) {
  if (!composition?.allOntologies) {
    return { success: false, error: 'Invalid composition' };
  }

  const entities = [];
  const relationships = [];

  for (const ontName of composition.allOntologies) {
    const prefix = NAME_TO_PREFIX[ontName] || `${ontName.toLowerCase()}:`;
    const shortPrefix = prefix.replace(':', '');

    // Generate 2 sample entities per ontology
    entities.push({
      '@id': `${prefix}Sample${ontName.replace(/-/g, '')}Entity1`,
      '@type': 'class',
      name: `Sample ${ontName} Entity 1`,
      description: `Test entity for ${ontName} ontology validation`,
      ontology: ontName,
      namespace: prefix,
      properties: {
        status: 'active',
        createdForTesting: true,
      },
    });
    entities.push({
      '@id': `${prefix}Sample${ontName.replace(/-/g, '')}Entity2`,
      '@type': 'supporting',
      name: `Sample ${ontName} Entity 2`,
      description: `Secondary test entity for ${ontName}`,
      ontology: ontName,
      namespace: prefix,
    });

    // Generate 1 sample relationship
    relationships.push({
      '@id': `${prefix}sampleRelation_${shortPrefix}`,
      name: `sampleRelation`,
      domainIncludes: [`${prefix}Sample${ontName.replace(/-/g, '')}Entity1`],
      rangeIncludes: [`${prefix}Sample${ontName.replace(/-/g, '')}Entity2`],
      ontology: ontName,
    });
  }

  // Add 1-2 cross-ontology relationships if multiple ontologies
  if (composition.allOntologies.length >= 2) {
    const ont1 = composition.allOntologies[0];
    const ont2 = composition.allOntologies[1];
    const p1 = NAME_TO_PREFIX[ont1] || `${ont1.toLowerCase()}:`;
    const p2 = NAME_TO_PREFIX[ont2] || `${ont2.toLowerCase()}:`;
    relationships.push({
      '@id': `cross:${ont1}-${ont2}`,
      name: 'crossOntologyTestLink',
      domainIncludes: [`${p1}Sample${ont1.replace(/-/g, '')}Entity1`],
      rangeIncludes: [`${p2}Sample${ont2.replace(/-/g, '')}Entity1`],
      crossOntology: true,
      sourceOntology: ont1,
      targetOntology: ont2,
    });
  }

  const testData = {
    '@context': 'https://platformcore.io/ontology/test-data/',
    '@type': 'CompositionTestData',
    compositionId: composition.compositionId,
    categoryCode: composition.categoryCode,
    contextLevel: composition.contextLevel,
    generatedAt: new Date().toISOString(),
    entityCount: entities.length,
    relationshipCount: relationships.length,
    ontologyCoverage: composition.allOntologies,
    entities,
    relationships,
  };

  return { success: true, testData };
}

// ─── JSONB Export (7.3.6) ───────────────────────────────────────────────────

/**
 * Exports composition + optional test data as JSONB-compatible output.
 *
 * @param {Object} composition
 * @param {Object} [testData]
 * @returns {string} JSON string ready for JSONB ingestion
 */
export function exportAsJSONB(composition, testData) {
  const output = {
    schema_version: '1.0.0',
    composition_id: composition.compositionId,
    category: composition.categoryCode,
    context_level: composition.contextLevel,
    product_code: composition.productCode,
    ontologies: composition.allOntologies.map(name => ({
      name,
      namespace: NAME_TO_PREFIX[name] || `${name.toLowerCase()}:`,
      tier: composition.requiredOntologies.includes(name) ? 'required'
           : composition.recommendedOntologies.includes(name) ? 'recommended'
           : 'optional',
    })),
    active_series: composition.activeSeries,
    created_at: composition.createdAt,
    test_data: testData || null,
  };

  return JSON.stringify(output, null, 2);
}

// ─── Composition Manifest Versioning (7.3.7) ───────────────────────────────

/**
 * Creates a versioned composition manifest.
 *
 * @param {Object} composition
 * @param {Object} [registryIndex] - The ont-registry-index for version lookup
 * @returns {Object} manifest
 */
export function createCompositionManifest(composition, registryIndex) {
  const ontologyVersions = {};

  // Look up current versions from registry index
  const entries = registryIndex?.entries || state.registryIndex?.entries || [];
  const nameToVersion = {};
  for (const entry of entries) {
    // Map entry name to version: "EMC Ontology (Enterprise Model Composition)" → version
    const shortName = entryNameToShort(entry.name || '');
    if (shortName) {
      nameToVersion[shortName] = entry.version || 'unknown';
    }
    // Also try namespace prefix
    const ns = entry.namespace || '';
    const prefixName = PREFIX_TO_NAME[ns];
    if (prefixName) {
      nameToVersion[prefixName] = entry.version || 'unknown';
    }
  }

  for (const ont of composition.allOntologies) {
    ontologyVersions[ont] = nameToVersion[ont] || 'unknown';
  }

  const manifest = {
    '@type': 'CompositionManifest',
    manifestId: `manifest-${composition.compositionId}`,
    compositionId: composition.compositionId,
    categoryCode: composition.categoryCode,
    contextLevel: composition.contextLevel,
    productCode: composition.productCode,
    ontologyVersions,
    activeSeries: composition.activeSeries,
    createdAt: new Date().toISOString(),
    manifestVersion: '1.0.0',
    checksum: simpleChecksum(ontologyVersions),
  };

  // Store in state
  state.compositionManifests.push(manifest);
  _persistManifests();

  return manifest;
}

/**
 * Gets all stored composition manifests.
 */
export function getCompositionManifests() {
  return state.compositionManifests.slice().reverse();
}

/**
 * Clears stored manifests.
 */
export function clearCompositionManifests() {
  state.compositionManifests = [];
  _persistManifests();
}

// ─── Namespace Helpers ──────────────────────────────────────────────────────

export function nameToNamespace(name) {
  return NAME_TO_PREFIX[name] || `${name.toLowerCase()}:`;
}

export function namespaceToName(ns) {
  return PREFIX_TO_NAME[ns] || ns.replace(':', '').toUpperCase();
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Extract short ontology name from registry entry name.
 * e.g. "EMC Ontology (Enterprise Model Composition)" → "EMC"
 */
function entryNameToShort(name) {
  const match = name.match(/^(\S+)\s+Ontology/i);
  if (match) return match[1].toUpperCase();
  const match2 = name.match(/^([A-Z][\w-]*)/);
  return match2 ? match2[1] : null;
}

function simpleChecksum(obj) {
  const str = JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function _persistPFIInstances() {
  try {
    const arr = [...state.pfiInstances.values()];
    localStorage.setItem('oaa-viz-pfi-instances', JSON.stringify(arr));
  } catch { /* quota */ }
}

function _persistManifests() {
  try {
    localStorage.setItem('oaa-viz-composition-manifests', JSON.stringify(state.compositionManifests));
  } catch { /* quota */ }
}

function _persistSnapshots() {
  try {
    const arr = [];
    for (const [, snap] of state.canonicalSnapshots) {
      // Shallow-spread frozen object for JSON serialisation
      arr.push({ ...snap });
    }
    localStorage.setItem('oaa-viz-canonical-snapshots', JSON.stringify(arr));
    // Also persist version index
    const idx = {};
    for (const [specId, ids] of state.snapshotVersionIndex) idx[specId] = ids;
    localStorage.setItem('oaa-viz-snapshot-version-index', JSON.stringify(idx));
  } catch { /* quota */ }
}

/**
 * Restores composition state from localStorage.
 * Call during app initialisation.
 */
export function restoreCompositionState() {
  try {
    const inst = localStorage.getItem('oaa-viz-pfi-instances');
    if (inst) {
      const arr = JSON.parse(inst);
      for (const item of arr) {
        state.pfiInstances.set(item.instanceId || item['@id'], item);
      }
    }
  } catch { /* ignore */ }

  try {
    const man = localStorage.getItem('oaa-viz-composition-manifests');
    if (man) state.compositionManifests = JSON.parse(man);
  } catch { /* ignore */ }

  // Restore canonical snapshots (F19.3)
  try {
    const snaps = localStorage.getItem('oaa-viz-canonical-snapshots');
    if (snaps) {
      const arr = JSON.parse(snaps);
      for (const snap of arr) {
        const frozen = _deepFreeze(JSON.parse(JSON.stringify(snap)));
        state.canonicalSnapshots.set(snap.snapshotId, frozen);
      }
    }
  } catch { /* ignore */ }

  try {
    const idx = localStorage.getItem('oaa-viz-snapshot-version-index');
    if (idx) {
      const obj = JSON.parse(idx);
      for (const [specId, ids] of Object.entries(obj)) {
        state.snapshotVersionIndex.set(specId, ids);
      }
    }
  } catch { /* ignore */ }
}
