/**
 * Shared application state and constants.
 * All modules import from here to avoid circular dependencies.
 */

export const state = {
  network: null,
  physicsEnabled: true,
  currentData: null,
  lastAudit: null,
  lastParsed: null,
  currentNodeId: null,
  registryIndex: null,
  registryMeta: null,
  currentRegistryEntry: null,
  lastValidation: null,
  lastCompletenessScore: null,
  libraryDB: null,

  // Multi-ontology state (Phase 1)
  loadedOntologies: new Map(),
  mergedGraph: null,
  seriesData: null,
  viewMode: 'single',  // 'single' | 'multi'

  // Navigation state (Phase 2)
  currentTier: -1,          // -1 = single, 0 = series, 1 = ontologies, 2 = entities
  currentSeries: null,      // 'VE-Series' etc. when drilled into a series
  currentOntology: null,    // namespace when drilled into an ontology
  navigationStack: [],      // breadcrumb history [{tier, series, ontology, label}]
  crossEdges: [],           // cross-ontology edges from detectCrossReferences
  crossSeriesEdges: [],     // aggregated series-to-series edges
  currentSubSeries: null,   // 'VSOM-SA' when drilled into a sub-series view
  subSeriesData: null,      // { 'VE-Series::VSOM-SA': { name, parentSeries, parentOntologyNs, ontologies, count, color } }

  // Series highlight + cross-edge state (Phase 2/4)
  highlightedSeries: new Set(),  // multi-select: series keys like 'VE-Series'
  crossEdgeFilterActive: false,  // show only cross-ontology edges
  bridgeFilterActive: false,     // bridge node filter
  bridgeNodes: null,             // Map of bridge node IDs

  // OAA Gate settings (Epic 1)
  densityThreshold: parseFloat(localStorage.getItem('oaa-viz-density-threshold')) || 0.8,

  // Component colouring state (Epic 1 — Story #61, #62)
  componentColoringActive: false,
  componentFilter: null,  // null = show all, number = component index
  componentMap: null,      // Map<nodeId, componentIndex> built by auditGraph

  // Library panel state (Epic 2)
  libraryView: 'registry',    // 'registry' | 'deps' | 'saved'
  libraryDepNetwork: null,    // mini vis.Network for dependency graph

  // Multi-ontology comparison (Epic 3)
  multiOntologyScores: null,  // [{namespace, name, series, version, score, ...}]

  // Diff state (Epic 4 — Changelog)
  lastDiff: null,        // diffOntologies() result
  diffBaseData: null,    // raw JSON of the old version
  diffMode: false,        // diff highlighting active

  // GitHub browser (Epic 5)
  githubBrowser: { owner: null, repo: null, ref: null, currentPath: '' },

  // Authoring state (Epic 7 — Phase 1)
  authoringMode: false,          // true when an ontology is being edited
  authoringDirty: false,         // unsaved changes exist
  authoringUndoStack: [],        // [{operation, timestamp, snapshot}] for undo
  authoringRedoStack: [],        // [{operation, timestamp, snapshot}] for redo

  // Selection state (Epic 7 — Feature 7.5)
  selectionMode: false,          // rubber-band selection active
  selectedNodeIds: new Set(),    // nodes selected for export
  selectedEdgeIds: new Set(),    // edges selected for export
  savedSelections: JSON.parse(localStorage.getItem('oaa-viz-saved-selections') || '[]'),

  // Revision & Glossary state (Epic 7 — Feature 7.2)
  authoringBaselineSnapshot: null,   // JSON string of ontology at authoring session start
  revisionHistory: [],               // [{ontologyId, oldVersion, newVersion, bumpType, timestamp, diff, changelog}]
  glossaryData: null,                // Loaded unified glossary object
  glossaryLinks: new Map(),          // entityId → [glossary term strings]

  // EMC Composition state (Epic 7 — Feature 7.3)
  pfiInstances: new Map(),           // instanceId → PFI instance config object
  compositionManifests: [],          // [{manifestId, compositionId, ontologyVersions, ...}]
  lastComposition: null,             // Last composeOntologySet() result

  // Domain Instance state (Epic 7 — Feature 7.4)
  domainInstances: new Map(),        // instanceId → domain ontology instance
  domainVersionHistory: new Map(),   // instanceId → [{version, timestamp, bumpType, ...}]

  // DS Instance state (Epic 7 — Feature 7.6 / Epic 8)
  dsInstances: new Map(),            // brand → parsedDSInstance
  activeDSBrand: null,               // selected brand string (e.g., 'baiv', 'vhf-viridian')
  dsAppliedCSSVars: null,            // currently applied CSS vars for reset
  brandContext: null,                 // { brand, tier, accentColor } — set when DS brand applied (DR-BRAND-001)
  dsArtefactHistory: new Map(),      // artefactId → [{version, timestamp, changes}]

  // PFI Graph Series state (Epic 9D — Composition Filter Bridge)
  activeComposition: null,             // Current CompositionResult from composeOntologySet()
  compositionFilterActive: false,      // true when composition filter is applied to graph
  ghostNodesVisible: true,            // F40.22: toggle to show/hide ghost (context) nodes
  activeInstanceId: null,              // Selected PFI instance ID (e.g., 'PFI-BAIV')
  contextLevel: 'PFC',                // 'PFC' (Core Templates) | 'PFI' (Instance View)
  pfiInstanceData: new Map(),          // instanceId → { files, orgContext, parsed }

  // Epic 9E/9F — Instance Selection & Category Composition
  activeCategories: [],                // Selected category codes for composition
  multiCategoryResult: null,           // Last composeMultiCategory() result
  activeMaturityLevel: 5,              // Maturity slider value (1–5)
  complianceScopeActive: false,        // RCSG governance overlay toggle
  categoryPanelOpen: false,            // Category panel visibility

  // PFI Scope Rule Engine state (Epic 19 — Feature 19.2)
  composedPFIGraph: null,             // Result from composeInstanceGraph() — { nodes, edges, metadata }
  activeScopeRules: null,             // Active scope rules array for the selected instance
  scopeRulesActive: false,            // true when scope rules are being applied to PFI graph
  canonicalSnapshots: new Map(),      // snapshotId → CanonicalSnapshot
  activePersonaScope: null,           // ICP reference string when persona-scoped view is active
  productContext: null,               // Result from resolveProductContext() — context bag for rule eval
  scopeRuleLog: [],                   // Execution log from last evaluateScopeRules() run

  // PFI Product/ICP Entity Bindings (Epic 19 — Feature 19.5)
  productBindings: null,               // Map<entityId, Array<{productCode, bindingType, confidence}>>
  icpBindings: null,                   // Map<entityId, Array<{icpRef, icpLabel, seniorityLevel, functionScope}>>

  // EMC Cascade Navigation Bar (Epic 19 — F19.4+)
  activeProductCode: null,             // Selected product code (e.g., 'AIV', 'CAF-Audit')
  emcNavLevel: 0,                      // Current cascade level (0=PFC, 1=PFI, 2=Product, 3=App)
  activeZoneOverlays: new Set(),       // Set of zoneId strings currently highlighted by Token Map

  // Canonical Snapshot persistence (Epic 19 — Feature 19.3)
  snapshotVersionIndex: new Map(),     // specId → [snapshotId, ...] sorted by version

  // Centralised view mode — replaces scattered mermaidMode/mindmapMode toggles
  activeView: 'graph',             // 'graph' | 'mermaid' | 'mindmap'

  // Mermaid Viewer state (Epic 9F)
  mermaidMode: false,              // true when viewing a Mermaid diagram (derived from activeView)
  mermaidSource: null,             // raw Mermaid text (string)
  mermaidFileName: null,           // loaded file name
  mermaidDiagrams: [],             // parsed diagram sections [{title, type, source}]
  mermaidActiveDiagram: 0,         // index of currently rendered diagram
  mermaidEditorOpen: false,        // code editor panel visible
  mermaidOrigin: null,             // 'file' | 'export' — how the mermaid diagram was loaded
  mermaidRelatedPanelOpen: false,  // related diagrams panel visible
  mermaidNodeMap: null,            // Map<mermaidNodeId, {label, ontologyEntityId}> for linking
  mermaidLastIdMap: null,          // reverse map from exportMermaid (safeId -> entityId)
  mermaidLibrary: [],              // discovered .mermaid files [{path, name, type, relatedEntities}]

  // Mindmap Canvas state (F9F.8)
  mindmapMode: false,              // true when mindmap canvas is active (derived from activeView)
  mindmapNetwork: null,            // vis.Network instance for mindmap
  mindmapNodes: null,              // vis.DataSet for mindmap nodes
  mindmapEdges: null,              // vis.DataSet for mindmap edges
  mindmapActiveWorkspaceId: null,  // IndexedDB id of current workspace
  mindmapWorkspaceName: '',        // display name of current workspace
  mindmapNodeCounter: 0,           // auto-increment for unique node IDs
  mindmapEdgeCounter: 0,           // auto-increment for unique edge IDs
  mindmapSelectedNode: null,       // currently selected node ID
  mindmapEdgeMode: false,          // true when drawing an edge
  mindmapEdgeSource: null,         // source node ID when in edge-drawing mode
  mindmapDirty: false,             // unsaved changes exist
  mindmapPropertiesPanelOpen: false, // node properties panel visible

  // Backlog Manager state (Epic 8C — PE-Ontology-Management-Functions)
  backlogView: 'overview',           // 'overview' | 'daily' | 'weekly' | 'matrix'
  backlogPanelOpen: false,           // panel visibility
  backlogFilterText: '',             // current search filter
  backlogFilterStatus: [],           // status filter for list
  backlogFilterCategory: [],         // category filter
  backlogFilterEpic: null,           // epic filter (epicId or null)
  backlogEditingFeatureId: null,     // feature being edited (null = new)
  backlogEditingEpicId: null,        // epic being edited (null = new)

  // Layer filter state (F8.7 — Multilayer Semantic Filtering)
  layerFilterActive: false,            // true when layer filter is applied
  activeLayers: new Set(),             // Set of layer keys ('strategic', 'operational', ...)
  layerMode: 'or',                     // 'or' | 'and'
  layerPreset: null,                   // active preset key or null
  layerSearchQuery: '',                // current layer search query
  layerSearchAll: false,               // search across all layers (not just active)
  layerPanelOpen: false,               // panel visibility

  // Strategic Lens state (Epic 9G — VESM / BSC / Role-Authority)
  strategicLensActive: false,            // true when any strategic lens filter is applied
  strategicLensPanelOpen: false,         // panel visibility
  strategicLensTab: 'vesm',             // active tab: 'vesm' | 'bsc' | 'role'
  vesmTiersActive: new Set(),            // Set of active VESM tier keys
  vesmScopeLevel: 'all',                // 'all' | 'corporate' | 'functional' | 'bu' | 'product' | 'geo'
  bscPerspectivesActive: new Set(),      // Set of active BSC perspective keys
  bscOverlayMode: 'border',             // 'border' (colour-coded borders) | 'group' (clustering)
  roleFilterActive: false,               // true when role filter is applied
  activeRoleRef: null,                   // role @id string or null for all roles
  raciFilterMode: null,                  // null | 'accountable' | 'responsible' | 'consulted' | 'informed'
  roleAuthorityChain: [],                // ordered array of role @ids

  // App Skeleton state (F40.13 — DS-ONT v2.0.0 Application Skeleton)
  appSkeleton: null,                   // Merged skeleton after EMC cascade
  appSkeletonBase: null,               // PFC base skeleton (immutable ref)
  navLayerRegistry: new Map(),         // layerId → { layer, items[] }
  zoneRegistry: new Map(),             // zoneId → { zone, components[] }
  actionIndex: new Map(),              // @id → ds:Action entity (from skeleton JSONLD)
  zoneDomSelectors: new Map(),         // zoneId → CSS selector (from ds:domSelector)
  skeletonSource: null,                // 'registry' | 'file' | null — how skeleton was loaded
  skeletonPanelOpen: false,            // Z22 Skeleton Inspector panel visibility
  skeletonPanelTab: 'zones',           // Active tab: 'zones' | 'functions' | 'nav'
  skeletonEditMode: false,             // F40.19 — Skeleton Editor: edit mode active
  skeletonDirty: false,                // unsaved skeleton edits exist
  skeletonUndoStack: [],               // [{operation, timestamp, snapshot}]
  skeletonRedoStack: [],               // [{operation, timestamp, snapshot}]
  skeletonBaselineSnapshot: null,      // JSON string of appSkeleton at edit mode entry

  // Skeleton Graph View state (F40.22)
  skeletonNetwork: null,               // vis.Network instance for skeleton graph
  skeletonGraphNodes: null,            // vis.DataSet for skeleton graph nodes
  skeletonGraphEdges: null,            // vis.DataSet for skeleton graph edges
  _skeletonShowActions: false,         // toggle Action entity nodes visibility
  _skeletonDirection: 'UD',            // hierarchical layout direction: 'UD' or 'LR'
  _skeletonSelectedNode: null,         // currently selected node in skeleton graph

  // Decision Tree Engine state (F40.1)
  decisionTreeNetwork: null,           // vis.Network instance
  decisionTreeNodes: null,             // vis.DataSet for nodes
  decisionTreeEdges: null,             // vis.DataSet for edges
  dtActiveGateId: null,                // currently active gate ('HG-01' etc)
  dtCompletedGates: [],                // [{gateId, scores[], normalizedScore, outcome}]
  dtPath: [],                          // ordered gateId traversal path
  dtFinalRecommendation: null,         // recommendation key or null
  dtProblemStatement: '',              // user-entered problem description
  dtEvaluator: '',                     // user name
  dtAllScores: {},                     // {gateId: [s0,s1,s2,s3]}
  dtPrefilled: false,                  // true when scores pre-filled from process (S40.24.5)
  dtScoringPanelOpen: false,           // scoring panel visibility
  skillsRegisterIndex: null,           // loaded skills-register-index.json (F48.11)

  // Skill Builder state (F34.11)
  skillBuilderOpen: false,              // build panel visibility
  skillBuilderSelectedProcess: null,    // selected PE process entity ID
  skillBuilderPhaseMap: [],             // [{phaseId, included: bool, sectionNumber}]
  skillBuilderAgentMap: [],             // [{agentId, included: bool}]
  skillBuilderGateMap: [],              // [{gateId, included: bool}]
  skillBuilderOutputFormat: 'markdown', // 'markdown' | 'jsonld' | 'manifest'
  skillBuilderLastScaffold: null,       // last generated scaffold result
  skillBuilderProcessData: null,        // extracted process entities cache
  skillBuilderScaffoldHistory: {},      // recKey → {recKey, processId, processName, timestamp, outputFormat}

  // Token Inheritance Engine state (F40.8)
  tokenResolutionCache: new Map(),    // cssVar → ResolutionResult

  // Registry filter views (F40.16 — Process & Application discovery)
  libraryFilter: 'all',              // 'all' | 'processes' | 'applications'
  discoveredProcesses: [],           // [{ processId, name, version, automation, phases, parentNs, parentName }]
  discoveredApplications: [],        // [{ appId, appName, appType, cascadeTier, version, parentNs, brand }]

  // Global Search state (F40.25)
  globalSearchIndex: null,             // SearchIndexEntry[] — flat search index built by buildSearchIndex()
};

export const TYPE_COLORS = {
  'class': '#4CAF50', 'core': '#4CAF50', 'framework': '#2196F3',
  'supporting': '#FF9800', 'agent': '#E91E63', 'external': '#9E9E9E',
  'layer': '#00BCD4', 'concept': '#AB47BC', 'default': '#017c75'
};

export const EDGE_COLORS = {
  'subClassOf': '#888', 'inheritance': '#888', 'relationship': '#4CAF50',
  'binding': '#FF9800', 'value_chain': '#2196F3', 'default': '#555'
};

/**
 * Centralised edge semantic styling (DR-EDGE-005 through DR-EDGE-008).
 * Maps edge semantic type to full visual config. Used by getEdgeStyle() in graph-renderer.js.
 * Priority 1-5 encodes width hierarchy: wider = more dominant.
 */
export const EDGE_STYLES = {
  // Intra-ontology (Tier 2 / single mode)
  relationship:   { color: '#4CAF50', highlightColor: '#9dfff5', width: 1.5, dashes: false,   arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
  binding:        { color: '#FF9800', highlightColor: '#9dfff5', width: 2.5, dashes: false,   arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
  value_chain:    { color: '#2196F3', highlightColor: '#9dfff5', width: 2,   dashes: false,   arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
  inheritance:    { color: '#888',    highlightColor: '#9dfff5', width: 1.5, dashes: [5, 5],  arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
  subClassOf:     { color: '#888',    highlightColor: '#9dfff5', width: 1.5, dashes: [5, 5],  arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
  default:        { color: '#555',    highlightColor: '#9dfff5', width: 1.5, dashes: false,   arrows: 'to', fontColor: '#888', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
  // Cross-ontology (Tier 1 / multi mode)
  crossOntology:  { color: '#eab839', highlightColor: '#FFF176', width: 2.5, dashes: [8, 4],  arrows: 'to', fontColor: '#eab839', fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 4 },
  // Cross-series (Tier 0)
  crossSeries:    { color: '#eab839', highlightColor: '#FFF176', width: 2,   dashes: [8, 4],  arrows: 'to', fontColor: '#eab839', fontSize: 11, smooth: { type: 'continuous', roundness: 0.4 }, priority: 4 },
  // Sub-series link (Tier 1 → sub-series grouping node)
  subSeriesLink:  { color: '#90CAF9', highlightColor: '#BBDEFB', width: 2,   dashes: [6, 3],  arrows: 'to', fontColor: '#90CAF9', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
  // Kano enrichment edges (VP→KANO→PMF, dashed enrichment lines per F49.11)
  kanoEnrichment: { color: '#43A047', highlightColor: '#81C784', width: 2,   dashes: [6, 3],  arrows: 'to', fontColor: '#43A047', fontSize: 9,  smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
  // Lineage chain edges (highlight overlay)
  lineageVE:           { color: '#cec528', highlightColor: '#e8e05a', width: 3.5, dashes: false,  arrows: 'to', fontColor: '#cec528', fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 5 },
  lineagePE:           { color: '#b87333', highlightColor: '#d4956a', width: 3.5, dashes: false,  arrows: 'to', fontColor: '#b87333', fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 5 },
  lineageConvergence:  { color: '#FF6B35', highlightColor: '#ff8f5e', width: 4,   dashes: false,  arrows: 'to', fontColor: '#FF6B35', fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 5 },
  lineageSeriesFull:   { color: null,      highlightColor: null,      width: 3,   dashes: false,  arrows: 'to', fontColor: null,      fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 4 },
  lineageSeriesPartial:{ color: null,      highlightColor: null,      width: 2,   dashes: [6, 3], arrows: 'to', fontColor: null,      fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 3 },
  lineageDimmed:       { color: '#444',    highlightColor: '#666',    width: 1,   dashes: [8, 4], arrows: 'to', fontColor: '#444',    fontSize: 9, smooth: { type: 'continuous', roundness: 0.4 }, priority: 0 }
};

export const REGISTRY_BASE_PATH = '../../ONTOLOGIES/ontology-library/';

export const SERIES_COLORS = {
  'VE-Series': '#2196F3',
  'PE-Series': '#4CAF50',
  'Foundation': '#FF9800',
  'RCSG-Series': '#9C27B0',
  'Orchestration': '#00BCD4',
  'placeholder': '#616161'
};

export const LINEAGE_CHAINS = {
  VE: ['VSOM', 'OKR', 'VP', 'PMF', 'EFS'],
  PE: ['PPM', 'PE', 'EFS', 'EA'],
  EA: ['EA-CORE', 'EA-TOGAF', 'EA-MSFT', 'EA-AI']
};

export const LINEAGE_COLORS = {
  VE: '#cec528',          // Gold for Value Engineering chain
  PE: '#b87333',          // Copper for Product Engineering chain
  EA: '#2e7d32',          // Forest green for EA hub-spoke chain
  convergence: '#FF6B35'  // Orange-red for EFS convergence point
};

export const SERIES_HIGHLIGHT_COLORS = {
  'VE-Series':     '#cec528',   // Gold (matches VE lineage colour)
  'PE-Series':     '#b87333',   // Copper (matches PE lineage colour)
  'Foundation':    '#FF9800',   // Orange
  'RCSG-Series':   '#9C27B0',   // Purple
  'Orchestration': '#00BCD4',   // Cyan
  'convergence':   '#FF6B35'    // Multi-series overlap
};

/**
 * DS bridge pattern-specific styles (S7.6.2).
 * Each join pattern gets a distinct colour so bridge types are visually distinguishable.
 * Keys are bridge relationship names (matching registry crossOntology[].name).
 */
export const DS_BRIDGE_STYLES = {
  realizesFeature:     { color: '#76ff03', highlightColor: '#b2ff59', dashes: [8, 3],  patternId: 'JP-DS-001', label: 'Feature Realisation',  targetPrefix: 'efs' },
  configuredByInstance:{ color: '#00bcd4', highlightColor: '#4dd0e1', dashes: [6, 4],  patternId: 'JP-DS-002', label: 'Instance Config',       targetPrefix: 'emc' },
  configuredByApp:     { color: '#00bcd4', highlightColor: '#4dd0e1', dashes: [6, 4],  patternId: 'JP-DS-002', label: 'Instance Config',       targetPrefix: 'emc' },
  governedByProcess:   { color: '#ff7043', highlightColor: '#ff8a65', dashes: [4, 6],  patternId: 'JP-DS-003', label: 'Process Governance',    targetPrefix: 'pe' },
  ownedByBrand:        { color: '#ab47bc', highlightColor: '#ce93d8', dashes: [10, 3], patternId: 'JP-DS-004', label: 'Brand Ownership',       targetPrefix: 'org-ctx' }
};

// DR-CONTEXT-001: Context/ghost node opacity — high enough to read, low enough to recede
export const CONTEXT_OPACITY = 0.55;

// F40.22 S40.22.3: Ghost edge opacity (matches CONTEXT_OPACITY for consistency)
export const GHOST_EDGE_OPACITY = 0.55;

// Colour-blind-friendly palette for connected components (ColorBrewer Set2, 12 colours)
export const COMPONENT_COLORS = [
  '#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f',
  '#e5c494', '#b3b3b3', '#1b9e77', '#d95f02', '#7570b3', '#e7298a'
];

// OAA entity type options (for authoring dropdowns)
export const OAA_ENTITY_TYPES = [
  'class', 'supporting', 'framework', 'agent', 'core', 'layer', 'concept'
];

/**
 * Maps OAA entity archetype to vis-network shape (DR-SEMANTIC-003).
 * Shape encodes archetype at a glance without needing colour.
 */
export const ARCHETYPE_SHAPES = {
  core:       'hexagon',
  class:      'dot',
  framework:  'box',
  supporting: 'triangle',
  agent:      'star',
  external:   'diamond',
  layer:      'square',
  concept:    'ellipse',
  default:    'dot',
};

/**
 * Maps OAA entity archetype to base node size (DR-SEMANTIC-003).
 * Larger = more architecturally significant.
 */
export const ARCHETYPE_SIZES = {
  core: 30, class: 20, framework: 22, supporting: 18,
  agent: 25, external: 16, layer: 22, concept: 18, default: 20,
};

/**
 * Maps relationship label names to edge semantic categories (DR-SEMANTIC-002).
 * Categories determine visual style independently of the parser's edgeType.
 */
export const EDGE_LABEL_CATEGORIES = {
  'contains':    'structural',
  'composedOf':  'structural',
  'hasScope':    'structural',
  'belongsToCategory': 'structural',
  'subClassOf':  'taxonomy',
  'extends':     'taxonomy',
  'dependsOn':   'dependency',
  'requires':    'dependency',
  'depends on':  'dependency',
  'informs':     'informational',
  'informedBy':  'informational',
  'defines':     'informational',
  'measuredBy':  'informational',
  'setBy':       'informational',
  'produces':    'operational',
  'supports':    'operational',
  'enables':     'operational',
  'realizes':    'operational',
  'hostedOn':    'operational',
  'realizesFeature': 'operational',
};

/**
 * Semantic edge category visual styles (DR-SEMANTIC-002).
 * Overrides EDGE_STYLES when a label-based category is resolved.
 */
export const EDGE_SEMANTIC_STYLES = {
  structural:    { color: '#7E57C2', highlightColor: '#B39DDB', width: 2.5, dashes: false,      arrows: 'to', fontColor: '#B39DDB', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
  taxonomy:      { color: '#888',    highlightColor: '#9dfff5', width: 1.5, dashes: [5, 5],     arrows: 'to', fontColor: '#888',    fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 1 },
  dependency:    { color: '#EF5350', highlightColor: '#EF9A9A', width: 2,   dashes: false,      arrows: 'to', fontColor: '#EF9A9A', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 3 },
  informational: { color: '#42A5F5', highlightColor: '#90CAF9', width: 1.5, dashes: [3,3,8,3],  arrows: 'to', fontColor: '#90CAF9', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
  operational:   { color: '#66BB6A', highlightColor: '#A5D6A7', width: 1.5, dashes: false,      arrows: 'to', fontColor: '#A5D6A7', fontSize: 10, smooth: { type: 'continuous', roundness: 0.3 }, priority: 2 },
};

// --- Semantic Layer definitions (DR-LAYER-001) ---

/**
 * Semantic layers mapped to OAA series metadata.
 * Each layer groups ontologies by their strategic role in the architecture.
 */
export const SEMANTIC_LAYERS = {
  strategic:     { name: 'Strategic',     series: ['VE-Series'],     color: '#2196F3' },
  operational:   { name: 'Operational',   series: ['PE-Series'],     color: '#4CAF50' },
  compliance:    { name: 'Compliance',    series: ['RCSG-Series'],   color: '#9C27B0' },
  foundation:    { name: 'Foundation',    series: ['Foundation'],    color: '#FF9800' },
  orchestration: { name: 'Orchestration', series: ['Orchestration'], color: '#00BCD4' },
  crossRef:      { name: 'Cross-Ref',    series: [],                color: '#eab839' },
};

/**
 * Preset layer views for one-click filtering (DR-LAYER-004).
 */
export const LAYER_PRESETS = {
  complianceAudit:   { name: 'Compliance Audit',   layers: ['compliance', 'foundation', 'crossRef'],                                                mode: 'or' },
  strategicOverview: { name: 'Strategic Overview',  layers: ['strategic', 'foundation'],                                                             mode: 'or' },
  fullMesh:          { name: 'Full Mesh',           layers: ['strategic', 'operational', 'compliance', 'foundation', 'orchestration', 'crossRef'],    mode: 'or' },
  crossRefOnly:      { name: 'Cross-Ref Only',      layers: ['crossRef'],                                                                            mode: 'or' },
};

// --- Archetype helper functions (DR-SEMANTIC-001/003) ---

/** Cache for computed archetype CSS colours; refreshed by refreshArchetypeCache(). */
let _archetypeColorCache = null;

/**
 * Refresh the archetype colour cache from current CSS custom properties.
 * Call once at the start of each render function to avoid per-node getComputedStyle.
 */
export function refreshArchetypeCache() {
  _archetypeColorCache = {};
  const style = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  for (const key of Object.keys(TYPE_COLORS)) {
    const cssVal = style?.getPropertyValue(`--viz-archetype-${key}`)?.trim();
    _archetypeColorCache[key] = cssVal || TYPE_COLORS[key];
  }
}

/**
 * Get the semantic colour for an OAA entity archetype.
 * Reads from cached CSS custom properties (brand-overridable) with TYPE_COLORS fallback.
 */
export function getArchetypeColor(archetype) {
  if (_archetypeColorCache && _archetypeColorCache[archetype]) return _archetypeColorCache[archetype];
  return TYPE_COLORS[archetype] || TYPE_COLORS['default'];
}

/** Get the vis-network shape for an OAA entity archetype. */
export function getArchetypeShape(archetype) {
  return ARCHETYPE_SHAPES[archetype] || ARCHETYPE_SHAPES['default'];
}

/** Get the base node size for an OAA entity archetype. */
export function getArchetypeSize(archetype) {
  return ARCHETYPE_SIZES[archetype] || ARCHETYPE_SIZES['default'];
}

/**
 * Get the edge semantic colour, reading from CSS var first with fallback to EDGE_SEMANTIC_STYLES.
 */
export function getEdgeSemanticColor(category) {
  if (typeof document !== 'undefined') {
    const cssVal = getComputedStyle(document.documentElement).getPropertyValue(`--viz-edge-${category}`)?.trim();
    if (cssVal) return cssVal;
  }
  return EDGE_SEMANTIC_STYLES[category]?.color || '#555';
}

// G7 required property lists
export const OAA_REQUIRED_ENTITY_PROPS = ['@id', '@type', 'name', 'description'];
export const OAA_REQUIRED_REL_PROPS = ['@type', 'name'];

export const DB_NAME = 'OntologyLibrary';
export const DB_VERSION = 4;  // v4: adds mindmap-workspaces store (F9F.8)

export const DEFAULT_CATEGORIES = [
  'ontology-library',
  'pfi-ontologies',
  'domain-ontologies',
  'custom'
];

// Backlog Manager constants (Epic 8C)
export const FEATURE_STATUSES = ['draft', 'pending-review', 'approved', 'proposed', 'prioritised', 'in-progress', 'done', 'archived'];
export const FEATURE_CATEGORIES = ['ontology', 'visualiser', 'toolkit', 'workbench'];
export const PRIORITY_BANDS = [
  { min: 1,  max: 5,  label: 'Low',       css: 'low' },
  { min: 6,  max: 10, label: 'Medium',    css: 'medium' },
  { min: 11, max: 15, label: 'High',      css: 'high' },
  { min: 16, max: 20, label: 'Very High', css: 'very-high' },
  { min: 21, max: 25, label: 'Critical',  css: 'critical' },
];
export const EPIC_STATUSES = ['planning', 'active', 'done', 'archived'];

// Mindmap Canvas constants (F9F.8)
export const MINDMAP_NODE_TYPES = {
  idea:    { shape: 'ellipse', color: '#9C27B0', border: '#7B1FA2', label: 'Idea' },
  ontRef:  { shape: 'box',     color: null,       border: null,      label: 'Ontology Ref' },
  mermaid: { shape: 'image',   color: null,       border: '#9dfff5', label: 'Mermaid Embed' },
  action:  { shape: 'box',     color: '#FF9800',  border: '#F57C00', label: 'Action Card' },
  lane:    { shape: 'box',     color: 'transparent', border: '#3a3d47', label: 'Lane/Zone' },
};

export const MINDMAP_EDGE_TYPES = [
  'supports', 'implements', 'derives-from', 'challenges', 'informs',
  'depends-on', 'conflicts-with', 'extends', 'refines', 'custom'
];

export const MINDMAP_LANES = [
  { id: 'ideation',  label: 'Ideation',  color: 'rgba(156,39,176,0.08)' },
  { id: 'analysis',  label: 'Analysis',  color: 'rgba(33,150,243,0.08)' },
  { id: 'design',    label: 'Design',    color: 'rgba(76,175,80,0.08)'  },
  { id: 'execution', label: 'Execution', color: 'rgba(255,152,0,0.08)'  },
];

// --- Strategic Lens constants (Epic 9G — DR-VESM-001 / DR-BSC-001 / DR-RACI-001) ---

/**
 * VESM Tier definitions — maps each tier of the Vision-Strategy-Execution-Metrics
 * cascade to the ontology entity types that belong to it.
 */
export const VESM_TIERS = {
  vision:    { name: 'Vision',    color: '#7C4DFF', ontologies: ['VSOM'],           entityTypes: ['Vision', 'VisionComponent'] },
  strategy:  { name: 'Strategy',  color: '#2196F3', ontologies: ['VSOM', 'BSC'],    entityTypes: ['Strategy', 'StrategyComponent', 'BalancedScorecard', 'StrategyMap', 'BSCPerspective', 'StrategicReviewCycle'] },
  execution: { name: 'Execution', color: '#FF9800', ontologies: ['OKR', 'RRR', 'PE'], entityTypes: ['Objective', 'KeyResult', 'ObjectivesComponent', 'BSCObjective', 'ExecutiveRole', 'FunctionalRole', 'RoleAssignment', 'StakeholderAlignment'] },
  metrics:   { name: 'Metrics',   color: '#4CAF50', ontologies: ['KPI', 'BSC'],     entityTypes: ['Metric', 'MetricsComponent', 'KPI', 'BSCMeasure', 'ValueMeasure', 'VEAnalysis', 'VEFunction', 'VECostElement'] },
};

/**
 * BSC Perspective definitions — the four canonical Balanced Scorecard perspectives
 * with associated colours for border overlays.
 */
export const BSC_PERSPECTIVES = {
  'financial':        { name: 'Financial',           color: '#4CAF50', shortCode: 'F' },
  'customer':         { name: 'Customer',            color: '#2196F3', shortCode: 'C' },
  'internal-process': { name: 'Internal Process',    color: '#FF9800', shortCode: 'IP' },
  'learning-growth':  { name: 'Learning & Growth',   color: '#9C27B0', shortCode: 'LG' },
};

/**
 * RACI Badge configuration for Role-Authority overlay.
 */
export const RACI_BADGES = {
  accountable: { label: 'A', color: '#E91E63', tooltip: 'Accountable' },
  responsible: { label: 'R', color: '#FF9800', tooltip: 'Responsible' },
  consulted:   { label: 'C', color: '#2196F3', tooltip: 'Consulted' },
  informed:    { label: 'I', color: '#9E9E9E', tooltip: 'Informed' },
};
