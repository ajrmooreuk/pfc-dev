/**
 * Unit tests for cypher-export.js — Neo4j Cypher generation from OAA v6 ontologies.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {
    network: null,
    lastParsed: null,
    currentData: null,
  },
}));

// Mock DOM
vi.stubGlobal('document', {
  getElementById: vi.fn(() => ({ textContent: 'test-ontology.json', style: {} })),
  createElement: vi.fn(() => ({ click: vi.fn(), href: '', download: '' })),
});
vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:test'),
  revokeObjectURL: vi.fn(),
});
vi.stubGlobal('Blob', class { constructor(parts, opts) { this.parts = parts; this.type = opts?.type; } });

import { state } from '../js/state.js';

// --- Test fixtures ---

// OAA v5 style: array entities with oaa:properties
const v5Ontology = {
  name: 'Marketing Campaign Ontology',
  'oaa:schemaVersion': '6.1.0',
  'oaa:moduleVersion': '1.0.0',
  '@context': {
    'mkt': 'https://example.org/marketing/'
  },
  entities: [
    {
      '@id': 'mkt:Campaign',
      '@type': 'rdfs:Class',
      name: 'Campaign',
      'rdfs:subClassOf': 'schema:Action',
      description: 'A marketing campaign',
      'oaa:properties': [
        { name: 'campaignId', type: 'xsd:string', required: true },
        { name: 'budget', type: 'xsd:decimal', required: false, description: 'Total budget' }
      ]
    },
    {
      '@id': 'mkt:Audience',
      '@type': 'rdfs:Class',
      name: 'Audience',
      description: "Target audience it's aimed at",
      'oaa:properties': [
        { name: 'audienceId', type: 'xsd:string', required: true }
      ]
    }
  ],
  relationships: [
    {
      '@id': 'mkt:targets',
      name: 'targets',
      domainIncludes: ['mkt:Campaign'],
      rangeIncludes: ['mkt:Audience'],
      'oaa:cardinality': '1..*'
    }
  ]
};

// OAA v6.2.0 style: object-keyed entities with full metadata
const v6Ontology = {
  name: 'Strategic KPI Ontology',
  'oaa:schemaVersion': '6.2.0',
  'oaa:moduleVersion': '2.0.0',
  '@context': {
    'pfc': 'https://platformcore.io/ontology/kpi/',
    'org': 'https://oaa-ontology.org/v6/organization/'
  },
  entities: {
    'Vision': {
      '@id': 'pfc:Vision',
      '@type': 'Class',
      'rdfs:subClassOf': 'Thing',
      'rdfs:label': 'Vision',
      'rdfs:comment': 'The aspirational future state',
      properties: {
        visionId: { type: 'string', required: true },
        visionStatement: { type: 'string', required: true, minLength: 50 }
      }
    },
    'Strategy': {
      '@id': 'pfc:Strategy',
      '@type': 'Class',
      'rdfs:subClassOf': 'Action',
      'rdfs:label': 'Strategy',
      'rdfs:comment': 'Multi-layer strategic approach',
      properties: {
        strategyId: { type: 'string', required: true },
        horizon: { type: 'string', required: false }
      }
    }
  },
  relationships: [
    {
      relationshipId: 'pfc:rel:vision-defines-strategy',
      name: 'defines',
      sourceEntity: 'pfc:Vision',
      targetEntity: 'pfc:Strategy',
      cardinality: '1:N',
      businessRule: "IF Vision.status='Archived' THEN all child Strategy.status IN ['Superseded','Archived']"
    }
  ],
  'oaa:imports': [
    {
      '@id': 'org:schema',
      name: 'ORG-ONT',
      version: '2.1.0',
      importedEntities: ['org:Organization', 'org:OrganizationContext'],
      importedRelationships: ['org:hasContext']
    }
  ],
  'oaa:joinPatterns': [
    {
      patternId: 'JP-KPI-001',
      name: 'Org-to-Vision Join',
      joinPath: 'org:Organization → org:hasContext → pfc:Vision',
      useCase: 'Full organizational strategic context'
    }
  ],
  businessRules: [
    {
      ruleId: 'BR-001',
      name: 'Vision Lifecycle Cascade',
      condition: "Vision.status = 'Archived'",
      action: "All child Strategy entities MUST have status IN ['Superseded', 'Archived']",
      severity: 'Critical'
    },
    {
      ruleId: 'BR-002',
      name: 'Strategy Naming',
      condition: 'Strategy is created',
      action: 'Strategy name SHOULD follow PascalCase convention',
      severity: 'warning'
    }
  ]
};

// Parsed data (as returned by ontology-parser.js)
const v5Parsed = {
  nodes: [
    { id: 'mkt:Campaign', label: 'Campaign', entityType: 'class', description: 'A marketing campaign' },
    { id: 'mkt:Audience', label: 'Audience', entityType: 'class', description: "Target audience it's aimed at" },
  ],
  edges: [
    { from: 'mkt:Campaign', to: 'mkt:Audience', label: 'targets', edgeType: 'relationship' },
  ],
  name: 'Marketing Campaign Ontology',
  diagnostics: { format: 'pf-ontology' },
};

const v6Parsed = {
  nodes: [
    { id: 'pfc:Vision', label: 'Vision', entityType: 'core', description: 'The aspirational future state' },
    { id: 'pfc:Strategy', label: 'Strategy', entityType: 'class', description: 'Multi-layer strategic approach' },
  ],
  edges: [
    { from: 'pfc:Vision', to: 'pfc:Strategy', label: 'defines', edgeType: 'relationship' },
  ],
  name: 'Strategic KPI Ontology',
  diagnostics: { format: 'pf-ontology-keyed' },
};


// --- Helper function tests ---

describe('escCypher', () => {
  it('escapes single quotes', async () => {
    const { escCypher } = await import('../js/cypher-export.js');
    expect(escCypher("it's")).toBe("it\\'s");
  });

  it('escapes backslashes', async () => {
    const { escCypher } = await import('../js/cypher-export.js');
    expect(escCypher('path\\to')).toBe('path\\\\to');
  });

  it('strips newlines', async () => {
    const { escCypher } = await import('../js/cypher-export.js');
    expect(escCypher('line1\nline2')).toBe('line1 line2');
  });

  it('returns empty string for null', async () => {
    const { escCypher } = await import('../js/cypher-export.js');
    expect(escCypher(null)).toBe('');
    expect(escCypher(undefined)).toBe('');
  });
});

describe('toNeo4jLabel', () => {
  it('converts prefixed IDs to labels', async () => {
    const { toNeo4jLabel } = await import('../js/cypher-export.js');
    expect(toNeo4jLabel('vsom:VSOMFramework')).toBe('VSOM_VSOMFramework');
    expect(toNeo4jLabel('pfc:Vision')).toBe('PFC_Vision');
  });

  it('handles URI-style IDs', async () => {
    const { toNeo4jLabel } = await import('../js/cypher-export.js');
    expect(toNeo4jLabel('https://example.org/Entity')).toBe('Entity');
  });

  it('returns Unknown for null', async () => {
    const { toNeo4jLabel } = await import('../js/cypher-export.js');
    expect(toNeo4jLabel(null)).toBe('Unknown');
  });
});

describe('toRelType', () => {
  it('converts camelCase to UPPER_SNAKE_CASE', async () => {
    const { toRelType } = await import('../js/cypher-export.js');
    expect(toRelType('hasValidation', 'relationship')).toBe('HAS_VALIDATION');
    expect(toRelType('relatesTo', 'relationship')).toBe('RELATES_TO');
  });

  it('maps inheritance to IS_A', async () => {
    const { toRelType } = await import('../js/cypher-export.js');
    expect(toRelType('inherits', 'inheritance')).toBe('IS_A');
    expect(toRelType('subClassOf', 'relationship')).toBe('IS_A');
  });

  it('maps binding to BOUND_TO', async () => {
    const { toRelType } = await import('../js/cypher-export.js');
    expect(toRelType('binds', 'binding')).toBe('BOUND_TO');
  });
});

describe('extractEntityProperties', () => {
  it('extracts from v5 oaa:properties array', async () => {
    const { extractEntityProperties } = await import('../js/cypher-export.js');
    const result = extractEntityProperties(v5Ontology.entities[0]);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('campaignId');
    expect(result[0].required).toBe(true);
    expect(result[1].name).toBe('budget');
    expect(result[1].type).toBe('xsd:decimal');
  });

  it('extracts from v6.2.0 object-keyed properties', async () => {
    const { extractEntityProperties } = await import('../js/cypher-export.js');
    const entity = v6Ontology.entities['Vision'];
    const result = extractEntityProperties(entity);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('visionId');
    expect(result[0].required).toBe(true);
    expect(result[1].name).toBe('visionStatement');
  });

  it('returns empty array when no properties', async () => {
    const { extractEntityProperties } = await import('../js/cypher-export.js');
    const result = extractEntityProperties({ '@id': 'x:Empty' });
    expect(result).toEqual([]);
  });
});

describe('getRawEntities', () => {
  it('extracts from v5 array format', async () => {
    const { getRawEntities } = await import('../js/cypher-export.js');
    const result = getRawEntities(v5Ontology);
    expect(result).toHaveLength(2);
    expect(result[0]['@id']).toBe('mkt:Campaign');
  });

  it('extracts from v6.2.0 object-keyed format', async () => {
    const { getRawEntities } = await import('../js/cypher-export.js');
    const result = getRawEntities(v6Ontology);
    expect(result).toHaveLength(2);
    expect(result[0]['@id']).toBe('pfc:Vision');
  });

  it('returns empty array for missing entities', async () => {
    const { getRawEntities } = await import('../js/cypher-export.js');
    expect(getRawEntities({})).toEqual([]);
  });
});


// --- S18.1.1: Constraints ---

describe('S18.1.1 — Constraints', () => {
  it('generates CREATE CONSTRAINT for each entity', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain('CREATE CONSTRAINT');
    expect(result).toContain('mkt_campaign_id');
    expect(result).toContain('mkt_audience_id');
  });

  it('includes IF NOT EXISTS clause', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain('IF NOT EXISTS');
  });

  it('uses Neo4j label in REQUIRE clause', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain('FOR (n:MKT_Campaign) REQUIRE n.id IS UNIQUE');
  });
});


// --- S18.1.2: Entity nodes ---

describe('S18.1.2 — Entity CREATE statements', () => {
  it('generates CREATE for all entities (v5)', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain('CREATE (mkt_campaign:MKT_Campaign');
    expect(result).toContain('CREATE (mkt_audience:MKT_Audience');
  });

  it('generates CREATE for all entities (v6.2.0)', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('CREATE (pfc_vision:PFC_Vision');
    expect(result).toContain('CREATE (pfc_strategy:PFC_Strategy');
  });

  it('includes id, name and description as properties', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain("id: 'mkt:Campaign'");
    expect(result).toContain("name: 'Campaign'");
    expect(result).toContain("description: 'A marketing campaign'");
  });

  it('includes properties from v5 oaa:properties array', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain('campaignId');
    expect(result).toContain('budget');
  });

  it('includes properties from v6.2.0 object-keyed format', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('visionId');
    expect(result).toContain('visionStatement');
    expect(result).toContain('strategyId');
  });

  it('includes subClassOf reference', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain("subClassOf: 'schema:Action'");
  });

  it('escapes single quotes in descriptions', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    // "Target audience it's aimed at" should have escaped quote
    expect(result).toContain("it\\'s");
  });
});


// --- S18.1.3: Relationships ---

describe('S18.1.3 — Relationship statements', () => {
  it('generates MATCH + CREATE pattern for relationships', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain('MATCH (a:MKT_Campaign');
    expect(result).toContain('MATCH (b:MKT_Audience');
    expect(result).toContain('CREATE (a)-[:TARGETS');
  });

  it('converts camelCase names to UPPER_SNAKE relationship types', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain(':TARGETS');
  });

  it('includes cardinality as relationship property', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain("cardinality: '1..*'");
  });

  it('uses sourceEntity/targetEntity for v6.2.0 format', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('MATCH (a:PFC_Vision');
    expect(result).toContain('MATCH (b:PFC_Strategy');
    expect(result).toContain(':DEFINES');
  });

  it('generates IS_A for inheritance (subClassOf)', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    // Campaign subClassOf schema:Action
    expect(result).toContain(':IS_A');
    expect(result).toContain('SCHEMA_Action');
  });
});


// --- S18.1.4: Imports ---

describe('S18.1.4 — Import MERGE statements', () => {
  it('generates MERGE (not CREATE) for imported entities', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('MERGE (n:ORG_Organization');
    expect(result).toContain('MERGE (n:ORG_OrganizationContext');
    expect(result).not.toContain('CREATE (n:ORG_Organization');
  });

  it('includes source ontology name and version', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain("source: 'ORG-ONT'");
    expect(result).toContain("version: '2.1.0'");
  });

  it('mentions imported relationships as comments', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('org:hasContext');
  });

  it('handles ontologies without imports gracefully', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    // No imports section, no error
    expect(result).not.toContain('IMPORTED ENTITIES');
  });
});


// --- S18.1.5: Join patterns ---

describe('S18.1.5 — Join pattern comments', () => {
  it('emits join patterns as comment blocks', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('// JP-KPI-001');
    expect(result).toContain('JOIN PATTERN');
  });

  it('includes patternId and name', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('JP-KPI-001');
    expect(result).toContain('Org-to-Vision Join');
  });

  it('includes join path', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('org:Organization');
    expect(result).toContain('pfc:Vision');
  });

  it('includes useCase description', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('Full organizational strategic context');
  });
});


// --- S18.1.6: Business rules ---

describe('S18.1.6 — Business rule comments', () => {
  it('emits business rules as comment blocks', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('// BR-001');
    expect(result).toContain('BUSINESS RULES');
  });

  it('includes ruleId, severity, condition, action', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('BR-001');
    expect(result).toContain('[Critical]');
    expect(result).toContain("Vision.status = \\'Archived\\'");
  });

  it('generates APOC stub for critical/error severity', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain("apoc.trigger.add('BR-001'");
  });

  it('does not generate APOC stub for warning severity', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).not.toContain("apoc.trigger.add('BR-002'");
  });
});


// --- S18.1.7: Export function (download) ---

describe('S18.1.7 — exportCypher download', () => {
  beforeEach(() => {
    state.lastParsed = v5Parsed;
    state.currentData = v5Ontology;
  });

  it('triggers file download with .cypher extension', async () => {
    const { exportCypher } = await import('../js/cypher-export.js');
    exportCypher();
    expect(document.createElement).toHaveBeenCalled();
  });

  it('returns Cypher string', async () => {
    const { exportCypher } = await import('../js/cypher-export.js');
    const result = exportCypher();
    expect(typeof result).toBe('string');
    expect(result).toContain('CREATE CONSTRAINT');
    expect(result).toContain('CREATE (mkt_campaign');
  });

  it('returns empty string when no parsed data', async () => {
    state.lastParsed = null;
    const { exportCypher } = await import('../js/cypher-export.js');
    const result = exportCypher();
    expect(result).toBe('');
  });

  it('returns empty string when no current data', async () => {
    state.currentData = null;
    const { exportCypher } = await import('../js/cypher-export.js');
    const result = exportCypher();
    expect(result).toBe('');
  });
});


// --- General: Header ---

describe('Header', () => {
  it('includes ontology name in header', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    expect(result).toContain('Marketing Campaign Ontology');
  });

  it('includes OAA version', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v6Ontology, v6Parsed);
    expect(result).toContain('6.2.0');
  });

  it('includes generation timestamp', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    const result = generateCypherScript(v5Ontology, v5Parsed);
    // ISO timestamp format: 2026-...
    expect(result).toMatch(/Generated: \d{4}-\d{2}-\d{2}T/);
  });

  it('returns empty string for null inputs', async () => {
    const { generateCypherScript } = await import('../js/cypher-export.js');
    expect(generateCypherScript(null, null)).toBe('');
    expect(generateCypherScript(null, v5Parsed)).toBe('');
    expect(generateCypherScript(v5Ontology, null)).toBe('');
  });
});
