/**
 * OAA Validation Gates (G1-G8, G20-G23) and graph audit.
 * G1-G8: OAA v5/v6 gates (production).
 * G20: Competency Coverage (OAA v7, F21.9).
 * G21: Semantic Duplication Audit (OAA v7, F21.10).
 * G22: Cross-Ontology Rule Enforcement (OAA v7, F21.11).
 * G23: Lineage Chain Integrity (OAA v7, F21.15).
 */

import { OAA_REQUIRED_ENTITY_PROPS, OAA_REQUIRED_REL_PROPS } from './state.js';

export function auditGraph(parsed) {
  const nodeIds = new Set(parsed.nodes.map(n => n.id));
  const edgeSet = new Map();
  nodeIds.forEach(id => edgeSet.set(id, { in: 0, out: 0 }));
  parsed.edges.forEach(e => {
    if (edgeSet.has(e.from)) edgeSet.get(e.from).out++;
    if (edgeSet.has(e.to)) edgeSet.get(e.to).in++;
  });

  const isolated = parsed.nodes.filter(n => {
    const counts = edgeSet.get(n.id);
    return counts && counts.in === 0 && counts.out === 0;
  });

  const adj = new Map();
  nodeIds.forEach(id => adj.set(id, []));
  parsed.edges.forEach(e => {
    if (adj.has(e.from)) adj.get(e.from).push(e.to);
    if (adj.has(e.to)) adj.get(e.to).push(e.from);
  });
  const visited = new Set();
  const components = [];
  nodeIds.forEach(id => {
    if (visited.has(id)) return;
    const component = [];
    const queue = [id];
    while (queue.length > 0) {
      const cur = queue.shift();
      if (visited.has(cur)) continue;
      visited.add(cur);
      component.push(cur);
      (adj.get(cur) || []).forEach(nb => { if (!visited.has(nb)) queue.push(nb); });
    }
    components.push(component);
  });
  components.sort((a, b) => b.length - a.length);

  // Build component membership map (nodeId → componentIndex)
  const componentMap = new Map();
  components.forEach((comp, idx) => {
    comp.forEach(id => componentMap.set(id, idx));
  });

  return {
    format: parsed.diagnostics.format,
    totalNodes: parsed.nodes.length,
    totalEdges: parsed.edges.length,
    isolated,
    components,
    componentMap,
    stubNodes: parsed.diagnostics.stubNodes,
    mainComponentSize: components.length > 0 ? components[0].length : 0,
    disconnectedCount: components.length - 1
  };
}

export function validateOAAv5(data, parsed) {
  const gates = [];

  gates.push(validateG1SchemaStructure(data));
  gates.push(validateG2RelationshipCardinality(data));
  gates.push(validateG2BEntityConnectivity(parsed));
  gates.push(validateG2CGraphConnectivity(parsed));
  gates.push(validateG3BusinessRules(data));
  gates.push(validateG4SemanticConsistency(data, parsed));

  const g5 = validateG5Completeness(data, parsed);
  g5.advisory = true;
  gates.push(g5);

  const g6 = validateG6UniRegistry(data);
  g6.advisory = true;
  gates.push(g6);

  gates.push(validateG7SchemaProperties(data));

  const g8 = validateG8NamingConventions(data);
  g8.advisory = true;
  gates.push(g8);

  const coreGates = gates.filter(g => !g.advisory && !g.skipped);
  const failCount = coreGates.filter(g => g.status === 'fail').length;
  const warnCount = coreGates.filter(g => g.status === 'warn').length;
  const passCount = coreGates.filter(g => g.status === 'pass').length;

  let overall = 'pass';
  if (failCount > 0) overall = 'fail';
  else if (warnCount > 0) overall = 'warn';

  return {
    gates,
    overall,
    summary: { pass: passCount, warn: warnCount, fail: failCount, advisory: gates.filter(g => g.advisory).length }
  };
}

function validateG1SchemaStructure(data) {
  const issues = [];
  const warnings = [];

  if (!data['@context']) {
    warnings.push('Missing @context (not strict JSON-LD)');
  }

  if (!data['@id'] && !data.id && !data.name) {
    issues.push('Missing ontology identifier (@id, id, or name)');
  }

  const hasEntities = data.entities || data.hasDefinedTerm || data['@graph'] ||
                      (data.ontologyDefinition && (data.ontologyDefinition.entities || data.ontologyDefinition['@graph']));
  if (!hasEntities) {
    issues.push('No entities found (entities, hasDefinedTerm, or @graph)');
  }

  const entities = data.entities || data.hasDefinedTerm || data['@graph'] ||
                   (data.ontologyDefinition && (data.ontologyDefinition.entities || data.ontologyDefinition['@graph'])) || [];
  if (Array.isArray(entities)) {
    entities.forEach((e, i) => {
      if (!e['@id'] && !e.id && !e.name) {
        issues.push(`Entity ${i}: missing identifier`);
      }
    });
  }

  return {
    gate: 'G1: Schema Structure',
    status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warn' : 'pass'),
    issues,
    warnings,
    detail: issues.length === 0 ? 'Valid JSON structure' : `${issues.length} issue(s) found`
  };
}

function validateG2RelationshipCardinality(data) {
  const issues = [];
  const warnings = [];

  const relationships = data.relationships ||
                        (data.ontologyDefinition && data.ontologyDefinition.relationships) || [];

  if (relationships.length === 0) {
    warnings.push('No explicit relationships defined');
    return {
      gate: 'G2: Relationship Cardinality',
      status: 'warn',
      issues,
      warnings,
      detail: 'No relationships to validate'
    };
  }

  relationships.forEach((rel, i) => {
    const name = rel.name || rel['@id'] || rel['rdfs:label'] || `Relationship ${i}`;

    const hasDomain = rel.domainIncludes || rel.domain || rel.source || rel['rdfs:domain'] || rel['schema:domainIncludes'] || rel['oaa:domainIncludes'];
    if (!hasDomain) {
      issues.push(`${name}: missing domain`);
    }

    const hasRange = rel.rangeIncludes || rel.range || rel.target || rel['rdfs:range'] || rel['schema:rangeIncludes'] || rel['oaa:rangeIncludes'];
    if (!hasRange) {
      issues.push(`${name}: missing range`);
    }

    const cardinality = rel.cardinality || rel['oaa:cardinality'];
    if (cardinality) {
      // Accept both dot notation (n..1) and colon notation (n:1, n:m, 1:n)
      const cardPattern = /^(0|1|\*|n|m)((\.\.)|([:]))?(0|1|\*|n|m)?$/i;
      if (!cardPattern.test(cardinality)) {
        warnings.push(`${name}: non-standard cardinality notation "${cardinality}"`);
      }
    }
  });

  return {
    gate: 'G2: Relationship Cardinality',
    status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warn' : 'pass'),
    issues,
    warnings,
    detail: `${relationships.length} relationship(s) checked`
  };
}

function validateG2BEntityConnectivity(parsed) {
  if (!parsed || !parsed.nodes) {
    return { gate: 'G2B: Entity Connectivity', status: 'warn', issues: [], warnings: ['No parsed data'], detail: 'Cannot validate' };
  }

  // Meta-node types that are not domain entities (excluded from connectivity checks)
  const metaTypes = new Set(['external', 'core', 'layer']);

  const entityIds = new Set(parsed.nodes.map(n => n.id));
  const connected = new Set();

  parsed.edges.forEach(e => {
    connected.add(e.from);
    connected.add(e.to);
  });

  const orphaned = parsed.nodes.filter(n =>
    !connected.has(n.id) && !metaTypes.has(n.entityType)
  );

  const domainNodeCount = parsed.nodes.filter(n => !metaTypes.has(n.entityType)).length;
  const connectedDomainNodes = parsed.nodes.filter(n =>
    connected.has(n.id) && !metaTypes.has(n.entityType)
  ).length;

  const pct = domainNodeCount > 0 ? Math.round((connectedDomainNodes / domainNodeCount) * 100) : 100;

  return {
    gate: 'G2B: Entity Connectivity',
    status: orphaned.length > 0 ? 'fail' : 'pass',
    issues: orphaned.map(n => `${n.label || n.id} (${n.entityType})`),
    warnings: [],
    detail: `${pct}% entities connected (${connectedDomainNodes}/${domainNodeCount})`,
    orphaned: orphaned.map(n => n.id)
  };
}

function validateG2CGraphConnectivity(parsed) {
  if (!parsed || !parsed.nodes) {
    return { gate: 'G2C: Graph Connectivity', status: 'warn', issues: [], warnings: ['No parsed data'], detail: 'Cannot validate' };
  }

  // Meta-node types that are not domain entities (excluded from connectivity checks)
  const metaTypes = new Set(['external', 'core', 'layer']);

  const domainNodes = parsed.nodes.filter(n => !metaTypes.has(n.entityType));
  const nodeIds = new Set(domainNodes.map(n => n.id));

  if (nodeIds.size === 0) {
    return { gate: 'G2C: Graph Connectivity', status: 'pass', issues: [], warnings: [], detail: 'No domain entities' };
  }

  const adj = new Map();
  nodeIds.forEach(id => adj.set(id, []));

  parsed.edges.forEach(e => {
    if (nodeIds.has(e.from) && nodeIds.has(e.to)) {
      adj.get(e.from).push(e.to);
      adj.get(e.to).push(e.from);
    }
  });

  const visited = new Set();
  const components = [];

  nodeIds.forEach(id => {
    if (visited.has(id)) return;
    const component = [];
    const queue = [id];
    while (queue.length > 0) {
      const cur = queue.shift();
      if (visited.has(cur)) continue;
      visited.add(cur);
      component.push(cur);
      (adj.get(cur) || []).forEach(nb => { if (!visited.has(nb)) queue.push(nb); });
    }
    components.push(component);
  });

  const isConnected = components.length <= 1;

  return {
    gate: 'G2C: Graph Connectivity',
    status: isConnected ? 'pass' : 'warn',
    issues: [],
    warnings: isConnected ? [] : [`${components.length} disconnected clusters`],
    detail: isConnected ? 'Single connected component' : `${components.length} components`,
    components: components.length
  };
}

function validateG3BusinessRules(data) {
  const issues = [];
  const warnings = [];

  const businessRules = data.businessRules || data.rules ||
                        (data.ontologyDefinition && data.ontologyDefinition.businessRules) || [];

  if (businessRules.length === 0) {
    return {
      gate: 'G3: Business Rules',
      status: 'warn',
      issues: [],
      warnings: ['No business rules defined'],
      detail: 'Consider adding IF-THEN business rules'
    };
  }

  const ifThenPattern = /^IF\s+.+\s+THEN\s+.+$/i;
  const expressionPattern = /^[A-Za-z_][A-Za-z0-9_.]*\s*(==|!=|>|<|>=|<=|&&|\|\||\s+AND\s+|\s+OR\s+)/i;

  let compliantCount = 0;
  businessRules.forEach((rule, i) => {
    const ruleName = rule.name || rule['@id'] || rule.id || `Rule ${i + 1}`;

    let ruleText = '';
    if (rule.condition && rule.action) {
      ruleText = `${rule.condition} ${rule.action}`;
    } else {
      ruleText = rule.expression || rule.rule || rule.description || '';
    }

    if (ifThenPattern.test(ruleText)) {
      compliantCount++;
    } else if (rule.condition && rule.action) {
      if (rule.condition.toUpperCase().startsWith('IF') && rule.action.toUpperCase().includes('MUST')) {
        compliantCount++;
      } else {
        warnings.push(`${ruleName}: condition/action should use IF...THEN format`);
      }
    } else if (expressionPattern.test(ruleText)) {
      warnings.push(`${ruleName}: has expression but not IF-THEN format`);
    } else if (ruleText.trim() === '') {
      issues.push(`${ruleName}: empty rule expression`);
    } else {
      warnings.push(`${ruleName}: convert to IF-THEN format`);
    }

    if (!rule.severity) {
      warnings.push(`${ruleName}: missing severity (error/warning/info)`);
    }
  });

  const pct = businessRules.length > 0 ? Math.round((compliantCount / businessRules.length) * 100) : 0;

  return {
    gate: 'G3: Business Rules',
    status: issues.length > 0 ? 'fail' : (pct < 80 ? 'warn' : 'pass'),
    issues,
    warnings: warnings.slice(0, 5),
    detail: `${pct}% rules in IF-THEN format (${compliantCount}/${businessRules.length})`
  };
}

function validateG4SemanticConsistency(data, parsed) {
  const issues = [];
  const warnings = [];

  if (!parsed || !parsed.nodes) {
    return { gate: 'G4: Semantic Consistency', status: 'warn', issues: [], warnings: ['No parsed data'], detail: 'Cannot validate' };
  }

  parsed.nodes.forEach(n => {
    if (n.entityType === 'external') return;

    if (!n.description || n.description.trim() === '') {
      warnings.push(`${n.label}: missing description`);
    }

    if (n.label && n.entityType !== 'layer') {
      const pascalPattern = /^[A-Z][a-zA-Z0-9]*$/;
      const hasSpaces = /\s/.test(n.label);
      if (!pascalPattern.test(n.label) && !hasSpaces) {
        if (!/^[a-z]/.test(n.label) === false && n.label.includes('_')) {
          warnings.push(`${n.label}: consider PascalCase naming`);
        }
      }
    }
  });

  const shownWarnings = warnings.slice(0, 5);
  if (warnings.length > 5) {
    shownWarnings.push(`... and ${warnings.length - 5} more`);
  }

  return {
    gate: 'G4: Semantic Consistency',
    status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warn' : 'pass'),
    issues,
    warnings: shownWarnings,
    detail: warnings.length === 0 ? 'All entities have descriptions' : `${warnings.length} entities missing descriptions`
  };
}

function validateG5Completeness(data, parsed) {
  const issues = [];
  const warnings = [];

  const hasMetadata = data.metadata || data.registryMetadata || data['@context'];
  if (!hasMetadata) {
    warnings.push('No metadata block found');
  } else {
    const meta = data.metadata || data.registryMetadata || {};
    if (!meta.version && !data.version && !data['oaa:moduleVersion'] && !data['owl:versionInfo']) warnings.push('Missing version');
    if (!meta.author && !meta.creator && !data.author && !data.creator) warnings.push('Missing author/creator');
  }

  const entities = data.entities || data.hasDefinedTerm ||
                   (data.ontologyDefinition && (data.ontologyDefinition.entities || data.ontologyDefinition['@graph'])) || [];

  let missingType = 0;
  if (Array.isArray(entities)) {
    entities.forEach(e => {
      if (!e['@type'] && !e.type && !e.entityType) missingType++;
    });
  }

  if (missingType > 0) {
    warnings.push(`${missingType} entities missing @type`);
  }

  if (parsed && parsed.nodes.length > 0) {
    const nonExternal = parsed.nodes.filter(n => n.entityType !== 'external').length;
    const ratio = nonExternal > 0 ? (parsed.edges.length / nonExternal).toFixed(2) : 0;
    if (ratio < 0.5 && nonExternal > 3) {
      warnings.push(`Low edge-to-node ratio: ${ratio} (recommend ≥0.8)`);
    }
  }

  return {
    gate: 'G5: Completeness',
    status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warn' : 'pass'),
    issues,
    warnings,
    detail: issues.length + warnings.length === 0 ? 'All required fields present' : `${warnings.length} recommendation(s)`
  };
}

// --- Shared helpers for G7/G8 ---

export function extractEntities(data) {
  // hasDefinedTerm (jsonld-definedterm)
  if (data.hasDefinedTerm && Array.isArray(data.hasDefinedTerm)) return data.hasDefinedTerm;
  // pf-ontology (array)
  if (data.entities && Array.isArray(data.entities)) return data.entities;
  // pf-ontology-keyed (object → array)
  if (data.entities && typeof data.entities === 'object' && !Array.isArray(data.entities)) {
    return Object.values(data.entities);
  }
  // uni-registry
  if (data.ontologyDefinition) {
    const od = data.ontologyDefinition;
    const graph = od['@graph'] || [];
    const ents = od.entities || [];
    return [...graph, ...ents];
  }
  // jsonld
  if (data['@graph'] && Array.isArray(data['@graph'])) return data['@graph'];
  if (data.classes && Array.isArray(data.classes)) return data.classes;
  return [];
}

export function extractRelationships(data) {
  if (data.relationships && Array.isArray(data.relationships)) return data.relationships;
  if (data.ontologyDefinition && data.ontologyDefinition.relationships) return data.ontologyDefinition.relationships;
  if (data.properties && Array.isArray(data.properties)) return data.properties;
  return [];
}

function validateG7SchemaProperties(data) {
  const issues = [];
  const warnings = [];

  const entities = extractEntities(data);
  const relationships = extractRelationships(data);

  // 1. Required entity properties
  let validEntities = 0;
  entities.forEach(ent => {
    const entName = ent.name || ent['rdfs:label'] || ent['@id'] || ent.id || 'unknown';
    const missing = [];
    OAA_REQUIRED_ENTITY_PROPS.forEach(prop => {
      // Accept common aliases
      if (prop === '@id' && (ent['@id'] || ent.id)) return;
      if (prop === '@type' && (ent['@type'] || ent.type || ent.entityType)) return;
      if (prop === 'name' && (ent.name || ent['rdfs:label'] || ent.label)) return;
      if (prop === 'description' && (ent.description || ent['rdfs:comment'])) return;
      missing.push(prop);
    });
    if (missing.length > 0) {
      issues.push(`Entity '${entName}' missing: ${missing.join(', ')}`);
    } else {
      validEntities++;
    }
  });

  // 2. Required relationship properties
  let validRels = 0;
  relationships.forEach(rel => {
    const relName = rel.name || rel['rdfs:label'] || rel['@id'] || rel.label || 'unnamed';
    const missing = [];
    OAA_REQUIRED_REL_PROPS.forEach(prop => {
      if (prop === '@type' && (rel['@type'] || rel.type)) return;
      if (prop === 'name' && (rel.name || rel['rdfs:label'] || rel.label)) return;
      missing.push(prop);
    });
    // Domain check (at least one form)
    const hasDomain = rel.domainIncludes || rel.domain || rel.source || rel.sourceEntity ||
                      rel['rdfs:domain'] || rel['schema:domainIncludes'] || rel['oaa:domainIncludes'];
    if (!hasDomain) missing.push('domain');
    // Range check
    const hasRange = rel.rangeIncludes || rel.range || rel.target || rel.targetEntity ||
                     rel['rdfs:range'] || rel['schema:rangeIncludes'] || rel['oaa:rangeIncludes'];
    if (!hasRange) missing.push('range');

    if (missing.length > 0) {
      issues.push(`Relationship '${relName}' missing: ${missing.join(', ')}`);
    } else {
      validRels++;
    }
  });

  // 3. Cardinality notation
  const cardPattern = /^(0|1|\*|n|m)((\.\.)|([:]))?(0|1|\*|n|m)?$/i;
  relationships.forEach(rel => {
    const cardinality = rel.cardinality || rel['oaa:cardinality'];
    if (cardinality && !cardPattern.test(cardinality)) {
      const relName = rel.name || rel['rdfs:label'] || rel['@id'] || 'unnamed';
      warnings.push(`Relationship '${relName}' has invalid cardinality: '${cardinality}'`);
    }
  });

  // 4. @id uniqueness
  const idCounts = new Map();
  entities.forEach(ent => {
    const id = ent['@id'] || ent.id;
    if (id) idCounts.set(id, (idCounts.get(id) || 0) + 1);
  });
  relationships.forEach(rel => {
    const id = rel['@id'] || rel.id;
    if (id) idCounts.set(id, (idCounts.get(id) || 0) + 1);
  });
  idCounts.forEach((count, id) => {
    if (count > 1) issues.push(`Duplicate @id: '${id}' (${count} times)`);
  });

  const entTotal = entities.length;
  const relTotal = relationships.length;

  return {
    gate: 'G7: Schema Properties',
    status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warn' : 'pass'),
    issues: issues.slice(0, 10),
    warnings: warnings.slice(0, 5),
    detail: `Schema: ${validEntities}/${entTotal} entities valid, ${validRels}/${relTotal} relationships valid`
  };
}

function validateG8NamingConventions(data) {
  const warnings = [];

  const entities = extractEntities(data);
  const relationships = extractRelationships(data);

  const pascalCase = /^[A-Z][a-zA-Z0-9]*$/;
  const camelCase = /^[a-z][a-zA-Z0-9]*$/;

  // 1. Entity names — PascalCase
  let pascalCount = 0;
  entities.forEach(ent => {
    const name = ent.name || ent['rdfs:label'] || ent.label;
    if (!name) return;
    // Extract local part (after last : or /)
    const localPart = name.replace(/.*[:/]/, '');
    if (pascalCase.test(localPart)) {
      pascalCount++;
    } else if (!/\s/.test(localPart)) {
      // Only flag if it's not a multi-word phrase
      warnings.push(`Entity '${localPart}' is not PascalCase`);
    } else {
      pascalCount++; // multi-word names are acceptable
    }
  });

  // 2. Relationship names — camelCase
  let camelCount = 0;
  relationships.forEach(rel => {
    const name = rel.name || rel['rdfs:label'] || rel.label;
    if (!name) return;
    const localPart = name.replace(/.*[:/]/, '');
    if (camelCase.test(localPart)) {
      camelCount++;
    } else if (!/\s/.test(localPart)) {
      warnings.push(`Relationship '${localPart}' is not camelCase`);
    } else {
      camelCount++;
    }
  });

  // 3. Prefix consistency
  const prefixes = new Set();
  entities.forEach(ent => {
    const id = ent['@id'] || ent.id || '';
    const match = id.match(/^([a-z][a-z0-9-]*):(?!\/\/)/i);
    if (match) prefixes.add(match[1].toLowerCase());
  });
  if (prefixes.size > 1) {
    warnings.push(`Mixed prefixes: ${[...prefixes].join(', ')}`);
  }

  const entTotal = entities.filter(e => e.name || e['rdfs:label'] || e.label).length;
  const relTotal = relationships.filter(r => r.name || r['rdfs:label'] || r.label).length;

  const shownWarnings = warnings.slice(0, 8);
  if (warnings.length > 8) shownWarnings.push(`... and ${warnings.length - 8} more`);

  return {
    gate: 'G8: Naming Conventions',
    status: warnings.length > 0 ? 'warn' : 'pass',
    issues: [],
    warnings: shownWarnings,
    detail: `Naming: ${pascalCount}/${entTotal} entities PascalCase, ${camelCount}/${relTotal} relationships camelCase`
  };
}

function validateG6UniRegistry(data) {
  const issues = [];
  const warnings = [];

  const isUniRegistry = data.ontologyDefinition || data.registryEntry || data.registryMetadata;

  if (!isUniRegistry) {
    return {
      gate: 'G6: UniRegistry Format',
      status: 'pass',
      issues: [],
      warnings: [],
      detail: 'Not UniRegistry format (OK)',
      skipped: true
    };
  }

  if (data.ontologyDefinition) {
    const od = data.ontologyDefinition;
    if (!od.name && !od['rdfs:label']) warnings.push('ontologyDefinition missing name');
    if (!od['@graph'] && !od.entities) warnings.push('ontologyDefinition missing @graph or entities');
  }

  if (data.registryMetadata) {
    const rm = data.registryMetadata;
    if (!rm.registryId) warnings.push('registryMetadata missing registryId');
    if (!rm.registeredAt && !rm.createdAt) warnings.push('registryMetadata missing timestamp');
  }

  return {
    gate: 'G6: UniRegistry Format',
    status: issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warn' : 'pass'),
    issues,
    warnings,
    detail: 'UniRegistry format validated'
  };
}

// --- Completeness Score ---

const SCORE_CATEGORIES = [
  { name: 'Connectivity', weight: 0.30, gates: ['G2B: Entity Connectivity', 'G2C: Graph Connectivity'] },
  { name: 'Schema',       weight: 0.25, gates: ['G1: Schema Structure', 'G7: Schema Properties'] },
  { name: 'Naming',       weight: 0.15, gates: ['G8: Naming Conventions'] },
  { name: 'Semantics',    weight: 0.20, gates: ['G3: Business Rules', 'G4: Semantic Consistency'] },
  { name: 'Completeness', weight: 0.10, gates: ['G5: Completeness', 'G6: UniRegistry Format'] }
];

function gateScore(g) {
  if (!g || g.skipped) return 100;
  if (g.status === 'pass') return 100;
  if (g.status === 'warn') return g.advisory ? 75 : 60;
  return 0;
}

export function computeCompletenessScore(validation) {
  const gateMap = new Map();
  validation.gates.forEach(g => gateMap.set(g.gate, g));

  const categories = SCORE_CATEGORIES.map(cat => {
    const gateResults = cat.gates.map(gName => {
      const g = gateMap.get(gName);
      return { gate: gName, status: g ? g.status : 'skip', score: gateScore(g) };
    });
    const avg = gateResults.reduce((sum, gr) => sum + gr.score, 0) / gateResults.length;
    return { name: cat.name, weight: cat.weight, score: Math.round(avg), gates: gateResults };
  });

  const totalScore = Math.round(categories.reduce((sum, c) => sum + c.weight * c.score, 0));

  let totalLabel = 'Poor';
  if (totalScore >= 90) totalLabel = 'Excellent';
  else if (totalScore >= 80) totalLabel = 'Good';
  else if (totalScore >= 60) totalLabel = 'Needs Work';

  return { totalScore, totalLabel, categories };
}

export function computeMultiOntologyScores(loadedOntologies) {
  const results = [];
  for (const [ns, record] of loadedOntologies) {
    if (record.isPlaceholder || !record.parsed || !record.rawData) continue;
    try {
      const validation = validateOAAv5(record.rawData, record.parsed);
      const score = computeCompletenessScore(validation);
      results.push({
        namespace: ns,
        name: record.name,
        series: record.series,
        version: record.rawData.version || record.rawData['oaa:moduleVersion'] || '—',
        score: score.totalScore,
        label: score.totalLabel,
        overall: validation.overall,
        g7: validation.gates.find(g => g.gate === 'G7: Schema Properties')?.status || '—',
        g8: validation.gates.find(g => g.gate === 'G8: Naming Conventions')?.status || '—'
      });
    } catch (e) {
      console.warn(`Score computation failed for ${ns}:`, e.message);
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results;
}

// --- OAA v7 Quality Gates ---

function isV6Schema(data) {
  const ver = data['oaa:schemaVersion'] || data['oaa:oaaVersion'] || '';
  return ver.startsWith('6.') || ver.startsWith('5.');
}

/**
 * G20: Competency Coverage — validates every entity, relationship, and rule
 * is exercised by at least one competency question.
 * Skips for v6.x ontologies or when no competencyQuestions array exists.
 */
export function validateG20CompetencyCoverage(data) {
  const gate = 'G20: Competency Coverage';

  if (isV6Schema(data)) {
    return { gate, status: 'pass', issues: [], warnings: [], detail: 'Skipped — v6.x ontology', skipped: true };
  }

  const cqs = data.competencyQuestions;
  if (!cqs || !Array.isArray(cqs) || cqs.length === 0) {
    return { gate, status: 'warn', issues: [], warnings: ['No competency questions defined — required for v7 compliance'], detail: 'No competency questions defined', skipped: false };
  }

  const entities = extractEntities(data);
  const relationships = extractRelationships(data);
  const rules = data.businessRules || data.rules ||
    (data.ontologyDefinition && data.ontologyDefinition.businessRules) || [];

  // Build coverage sets from all CQs
  const coveredEntities = new Set();
  const coveredRels = new Set();
  const coveredRules = new Set();

  cqs.forEach(cq => {
    (cq.targetEntities || []).forEach(id => coveredEntities.add(id));
    (cq.targetRelationships || []).forEach(id => coveredRels.add(id));
    (cq.targetRules || []).forEach(id => coveredRules.add(id));
  });

  const issues = [];
  const warnings = [];

  // Entity coverage
  const entityIds = entities.map(e => e['@id'] || e.id).filter(Boolean);
  const uncoveredEntities = entityIds.filter(id => !coveredEntities.has(id));
  uncoveredEntities.forEach(id => {
    const name = entities.find(e => (e['@id'] || e.id) === id)?.name || id;
    warnings.push(`Entity '${name}' (${id}) not covered by any competency question`);
  });

  // Relationship coverage
  const relNames = relationships.map(r => r.name || r['rdfs:label'] || r.label).filter(Boolean);
  const uncoveredRels = relNames.filter(name => !coveredRels.has(name));
  uncoveredRels.forEach(name => {
    warnings.push(`Relationship '${name}' not covered by any competency question`);
  });

  // Rule coverage
  const ruleIds = rules.map(r => r['@id'] || r.id).filter(Boolean);
  const uncoveredRules = ruleIds.filter(id => !coveredRules.has(id));
  uncoveredRules.forEach(id => {
    warnings.push(`Rule '${id}' not covered by any competency question`);
  });

  // Metrics
  const entityPct = entityIds.length > 0 ? Math.round((1 - uncoveredEntities.length / entityIds.length) * 1000) / 10 : 100;
  const relPct = relNames.length > 0 ? Math.round((1 - uncoveredRels.length / relNames.length) * 1000) / 10 : 100;
  const rulePct = ruleIds.length > 0 ? Math.round((1 - uncoveredRules.length / ruleIds.length) * 1000) / 10 : 100;

  const status = (uncoveredEntities.length > 0 || uncoveredRels.length > 0 || uncoveredRules.length > 0) ? 'warn' : 'pass';

  return {
    gate,
    status,
    issues,
    warnings: warnings.slice(0, 10),
    detail: `Coverage: entities ${entityPct}%, relationships ${relPct}%, rules ${rulePct}%`,
    metrics: { entityCoverage: entityPct, relationshipCoverage: relPct, ruleCoverage: rulePct }
  };
}

/**
 * Token-based Jaccard similarity: |intersection| / |union| of lowercased word tokens.
 */
export function tokenJaccard(a, b) {
  const tokA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const tokB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (tokA.size === 0 || tokB.size === 0) return 0.0;
  let intersection = 0;
  tokA.forEach(t => { if (tokB.has(t)) intersection++; });
  const union = new Set([...tokA, ...tokB]).size;
  return union === 0 ? 0.0 : intersection / union;
}

/**
 * G21: Semantic Duplication Audit — detects entities with near-identical
 * descriptions using token-based Jaccard similarity.
 * >70% = warning, >90% = error. Advisory gate (never blocks compliance).
 * Skips for v6.x ontologies or fewer than 2 entities.
 */
export function validateG21SemanticDuplication(data) {
  const gate = 'G21: Semantic Duplication Audit';

  if (isV6Schema(data)) {
    return { gate, status: 'pass', issues: [], warnings: [], detail: 'Skipped — v6.x ontology', skipped: true, advisory: true };
  }

  const entities = extractEntities(data);
  if (entities.length < 2) {
    return { gate, status: 'pass', issues: [], warnings: [], detail: 'Fewer than 2 entities — skipped', skipped: true, advisory: true };
  }

  const issues = [];
  const warnings = [];

  for (let i = 0; i < entities.length; i++) {
    const descA = entities[i].description || entities[i]['rdfs:comment'] || '';
    const nameA = entities[i].name || entities[i]['rdfs:label'] || entities[i]['@id'] || `Entity ${i}`;
    if (!descA) continue;

    for (let j = i + 1; j < entities.length; j++) {
      const descB = entities[j].description || entities[j]['rdfs:comment'] || '';
      const nameB = entities[j].name || entities[j]['rdfs:label'] || entities[j]['@id'] || `Entity ${j}`;
      if (!descB) continue;

      const sim = tokenJaccard(descA, descB);
      const pct = Math.round(sim * 100);

      if (sim > 0.9) {
        issues.push(`'${nameA}' and '${nameB}' are ${pct}% similar — likely duplicates`);
      } else if (sim > 0.7) {
        warnings.push(`'${nameA}' and '${nameB}' are ${pct}% similar — review for duplication`);
      }
    }
  }

  const status = issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warn' : 'pass');

  return {
    gate,
    status,
    issues: issues.slice(0, 10),
    warnings: warnings.slice(0, 10),
    detail: issues.length + warnings.length === 0
      ? `${entities.length} entities checked — no duplicates`
      : `${issues.length} error(s), ${warnings.length} warning(s)`,
    advisory: true
  };
}

/**
 * G8 Extension: Style Guide Compliance — advisory checks per OAA-STYLE-GUIDE.md.
 * Checks relationship verb-object pattern, entity description length,
 * entity @id prefix consistency, and spaced-phrase naming.
 * Skips for v6.x ontologies.
 */
export function validateG8StyleGuideCompliance(data) {
  const gate = 'G8: Style Guide Compliance';

  if (isV6Schema(data)) {
    return { gate, status: 'pass', issues: [], warnings: [], detail: 'Skipped — v6.x ontology', skipped: true, advisory: true };
  }

  const entities = extractEntities(data);
  const relationships = extractRelationships(data);
  const warnings = [];

  // Common verb prefixes for verb-object pattern detection
  const verbPrefixes = [
    'aligns', 'assigns', 'audit', 'authoris', 'belongs', 'cascades', 'classif',
    'compos', 'contains', 'creates', 'defines', 'depends', 'enables', 'evaluat',
    'follows', 'governs', 'has', 'identif', 'includes', 'informs', 'is', 'links',
    'manages', 'maps', 'measur', 'mitigat', 'monitors', 'owns', 'parent', 'part',
    'precedes', 'produces', 'requires', 'resolves', 'responsib', 'scores',
    'sub', 'supersed', 'supports', 'tracks', 'triggers', 'validates',
  ];

  // 1. Relationship naming: flag spaced phrases and bare nouns in v7
  relationships.forEach(rel => {
    const name = rel.name || rel['rdfs:label'] || rel.label;
    if (!name) return;
    const localPart = name.replace(/.*[:/]/, '');

    // Flag spaced phrases — should be camelCase in v7
    if (/\s/.test(localPart)) {
      warnings.push(`Relationship '${localPart}' uses spaced phrase — should be camelCase per REL-01`);
      return;
    }

    // Flag bare nouns (no verb prefix detected) — advisory
    const lower = localPart.toLowerCase();
    const startsWithVerb = verbPrefixes.some(v => lower.startsWith(v));
    if (!startsWithVerb && /^[a-z]/.test(localPart)) {
      warnings.push(`Relationship '${localPart}' may not follow verb-object pattern per REL-02`);
    }
  });

  // 2. Entity @id prefix consistency with ontologyId
  const ontId = data['oaa:ontologyId'] || '';
  if (ontId) {
    const expectedPrefix = ontId.replace(/-ONT$/i, '').toLowerCase();
    const mismatchedPrefixes = new Set();
    entities.forEach(ent => {
      const id = ent['@id'] || ent.id || '';
      const match = id.match(/^([a-z][a-z0-9-]*):(?!\/\/)/i);
      if (match) {
        const actualPrefix = match[1].toLowerCase();
        if (actualPrefix !== expectedPrefix && actualPrefix !== 'oaa' && actualPrefix !== 'schema' && actualPrefix !== 'rdfs') {
          mismatchedPrefixes.add(actualPrefix);
        }
      }
    });
    if (mismatchedPrefixes.size > 0) {
      warnings.push(`Entity @id prefix '${[...mismatchedPrefixes].join(', ')}' does not match expected '${expectedPrefix}' from ontologyId — see NS-03`);
    }
  }

  // 3. Entity description length check (ENT-05: ≥10 chars)
  entities.forEach(ent => {
    const desc = ent.description || ent['rdfs:comment'] || '';
    const name = ent.name || ent['rdfs:label'] || ent['@id'] || 'unnamed';
    if (desc && desc.length < 10) {
      warnings.push(`Entity '${name}' has short description (${desc.length} chars) — should be ≥10 per ENT-05`);
    }
  });

  const status = warnings.length > 0 ? 'warn' : 'pass';
  const shownWarnings = warnings.slice(0, 10);

  return {
    gate,
    status,
    issues: [],
    warnings: shownWarnings,
    detail: `Style guide: ${entities.length} entities, ${relationships.length} relationships checked`,
    advisory: true,
    metrics: { entitiesChecked: entities.length, relationshipsChecked: relationships.length }
  };
}

/**
 * G22: Cross-Ontology Rule Enforcement — validates that every relationship
 * with oaa:crossOntologyRef uses a recognised prefix and does not reference
 * deprecated ontologies.
 * @param {object} data - Parsed ontology JSON
 * @param {string[]} knownPrefixes - Array of valid namespace prefixes
 * @param {string[]} deprecatedPrefixes - Array of deprecated namespace prefixes
 */
export function validateG22CrossOntologyRules(data, knownPrefixes = [], deprecatedPrefixes = []) {
  const gate = 'G22: Cross-Ontology Rule Enforcement';

  if (isV6Schema(data)) {
    return { gate, status: 'pass', issues: [], warnings: [], detail: 'Skipped — v6.x ontology', skipped: true };
  }

  const relationships = extractRelationships(data);
  const crossRefs = relationships.filter(r => r['oaa:crossOntologyRef']);

  const issues = [];
  const warnings = [];

  crossRefs.forEach(rel => {
    const refOnt = rel['oaa:crossOntologyRef'];
    const ranges = rel.rangeIncludes || [];
    ranges.forEach(range => {
      const prefix = range.split(':')[0];
      if (deprecatedPrefixes.includes(prefix)) {
        warnings.push(`Relationship '${rel.name}' references deprecated ontology ${refOnt} (prefix: ${prefix})`);
      } else if (!knownPrefixes.includes(prefix)) {
        warnings.push(`Relationship '${rel.name}' uses unrecognised prefix '${prefix}' (${refOnt})`);
      }
    });
  });

  const status = issues.length > 0 ? 'fail' : (warnings.length > 0 ? 'warn' : 'pass');

  return {
    gate,
    status,
    issues,
    warnings,
    detail: `${crossRefs.length} cross-ref${crossRefs.length !== 1 ? 's' : ''} validated`,
    metrics: { totalCrossRefs: crossRefs.length }
  };
}

/**
 * G23: Lineage Chain Integrity — validates that ontologies within a defined
 * lineage chain (e.g. VE-Series: VSOM→OKR→VP→PMF→EFS) have the required
 * upstream and downstream cross-ontology references.
 * @param {object} data - Parsed ontology JSON
 * @param {string[]} lineageChain - Ordered array of ontology IDs in the chain
 */
export function validateG23LineageChainIntegrity(data, lineageChain = []) {
  const gate = 'G23: Lineage Chain Integrity';

  if (isV6Schema(data)) {
    return { gate, status: 'pass', issues: [], warnings: [], detail: 'Skipped — v6.x ontology', skipped: true };
  }

  const ontId = data['oaa:ontologyId'] || data.name;
  const pos = lineageChain.indexOf(ontId);

  if (pos === -1) {
    return { gate, status: 'pass', issues: [], warnings: [], detail: `${ontId} not in lineage chain — skipped`, skipped: true };
  }

  const relationships = extractRelationships(data);
  const crossRefTargets = relationships
    .filter(r => r['oaa:crossOntologyRef'])
    .map(r => r['oaa:crossOntologyRef']);

  const warnings = [];

  const upstream = pos > 0 ? lineageChain[pos - 1] : null;
  const downstream = pos < lineageChain.length - 1 ? lineageChain[pos + 1] : null;

  const upstreamLinked = upstream ? crossRefTargets.includes(upstream) : true;
  const downstreamLinked = downstream ? crossRefTargets.includes(downstream) : true;

  if (!upstreamLinked) {
    warnings.push(`${ontId} missing upstream link to ${upstream}`);
  }
  if (!downstreamLinked) {
    warnings.push(`${ontId} missing downstream link to ${downstream}`);
  }

  const status = warnings.length > 0 ? 'warn' : 'pass';

  return {
    gate,
    status,
    issues: [],
    warnings,
    detail: `${ontId} at position ${pos + 1} of ${lineageChain.length} in lineage chain`,
    metrics: { upstreamLinked, downstreamLinked }
  };
}

/**
 * G24: Instance Data Quality — validates instance/test data files against
 * their parent ontology schema. Advisory gate (never blocks compliance).
 *
 * Handles two test data formats:
 *   1. OAA JSON-LD: testInstances.{happyPath,edgeCases,boundaryTests,errorScenarios}[]
 *   2. Flat entity-keyed: testData.{EntityName}[] with testCategory field
 *
 * S21.18.1: Schema-conformance (instance @type → declared entity)
 * S21.18.2: Distribution analysis (60-20-10-10 target)
 * S21.18.3: CQ-to-test-data linkage (each CQ ≥1 tagged instance)
 */
export function validateG24InstanceDataQuality(data) {
  const gate = 'G24: Instance Data Quality';

  if (isV6Schema(data)) {
    return { gate, status: 'pass', issues: [], warnings: [], detail: 'Skipped — v6.x ontology', skipped: true, advisory: true };
  }

  const entities = extractEntities(data);
  const entityIds = new Set(entities.map(e => e['@id'] || e.id).filter(Boolean));
  // Also build a set of entity short names (for flat testData format matching)
  const entityShortNames = new Set(entities.map(e => {
    const id = e['@id'] || e.id || '';
    return e.name || id.split(':').pop();
  }).filter(Boolean));

  const warnings = [];

  // ── Collect all test instances from both formats ──
  let allInstances = [];
  let isFlat = false;

  if (data.testInstances) {
    // OAA JSON-LD format
    const cats = data.testInstances;
    for (const key of ['happyPath', 'edgeCases', 'boundaryTests', 'errorScenarios']) {
      if (Array.isArray(cats[key])) {
        allInstances.push(...cats[key]);
      }
    }
  } else if (data.testData) {
    // Flat entity-keyed format
    isFlat = true;
    for (const [entityKey, instances] of Object.entries(data.testData)) {
      if (Array.isArray(instances)) {
        for (const inst of instances) {
          allInstances.push({ ...inst, _entityKey: entityKey });
        }
      }
    }
  }

  if (allInstances.length === 0) {
    return {
      gate, status: 'warn', issues: [], advisory: true,
      warnings: ['No instance/test data found — add testInstances or testData for G24 validation'],
      detail: 'No test data',
      metrics: { totalInstances: 0, distribution: { happyPath: 0, edge: 0, boundary: 0, error: 0 }, cqCoverage: null, uncoveredCQs: 0 }
    };
  }

  // ── S21.18.1: Schema-conformance ──
  if (isFlat) {
    // Flat format: check entity keys match declared entity names
    const entityKeys = new Set(Object.keys(data.testData));
    for (const key of entityKeys) {
      if (!entityShortNames.has(key)) {
        warnings.push(`Test data key '${key}' does not match any declared entity name`);
      }
    }
  } else {
    // JSON-LD format: check @type on each instance
    for (const inst of allInstances) {
      const instType = inst['@type'];
      if (instType && !entityIds.has(instType)) {
        warnings.push(`Instance '${inst['@id'] || 'unknown'}' has @type '${instType}' which is not a declared entity`);
      }
    }
  }

  // ── S21.18.2: Distribution analysis ──
  const catMap = { happyPath: 0, edge: 0, boundary: 0, error: 0 };
  for (const inst of allInstances) {
    const cat = inst.testCategory || '';
    if (cat === 'happy-path' || cat === 'typical') catMap.happyPath++;
    else if (cat === 'edge') catMap.edge++;
    else if (cat === 'boundary') catMap.boundary++;
    else if (cat === 'invalid' || cat === 'error') catMap.error++;
    else catMap.happyPath++; // default to happy-path
  }

  const total = allInstances.length;
  const target = { happyPath: 60, edge: 20, boundary: 10, error: 10 };
  const actual = {
    happyPath: Math.round((catMap.happyPath / total) * 100),
    edge: Math.round((catMap.edge / total) * 100),
    boundary: Math.round((catMap.boundary / total) * 100),
    error: Math.round((catMap.error / total) * 100),
  };

  for (const [key, targetPct] of Object.entries(target)) {
    const diff = Math.abs(actual[key] - targetPct);
    if (diff > 10) {
      warnings.push(`Test data distribution: ${key} is ${actual[key]}% (target ${targetPct}%, deviation ${diff}%)`);
    }
  }

  // ── S21.18.3: CQ-to-test-data linkage ──
  const cqs = data.competencyQuestions || [];
  const cqIds = cqs.map(cq => cq['@id'] || cq.id).filter(Boolean);
  const coveredCQs = new Set();
  for (const inst of allInstances) {
    const ref = inst.cqRef || inst.cqId;
    if (ref) coveredCQs.add(ref);
    // Also check array form
    if (Array.isArray(inst.cqRefs)) {
      inst.cqRefs.forEach(r => coveredCQs.add(r));
    }
  }

  const uncoveredCQs = cqIds.filter(id => !coveredCQs.has(id));
  for (const cqId of uncoveredCQs) {
    warnings.push(`Competency question '${cqId}' has no linked test instances (add cqRef to test data)`);
  }

  const cqCoverage = cqIds.length > 0
    ? Math.round(((cqIds.length - uncoveredCQs.length) / cqIds.length) * 100)
    : (allInstances.length > 0 ? null : null);

  // ── Result ──
  const status = warnings.length > 0 ? 'warn' : 'pass';

  return {
    gate,
    status,
    issues: [],
    warnings: warnings.slice(0, 10),
    advisory: true,
    detail: `${total} instances, distribution: HP=${actual.happyPath}% E=${actual.edge}% B=${actual.boundary}% Er=${actual.error}%` +
      (cqCoverage != null ? `, CQ coverage: ${cqCoverage}%` : ''),
    metrics: {
      totalInstances: total,
      distribution: catMap,
      cqCoverage: cqCoverage != null ? cqCoverage : undefined,
      uncoveredCQs: uncoveredCQs.length,
    }
  };
}

/**
 * Run all OAA v7.0.0 quality gates (G20-G24) and return results array.
 * Gates self-skip for v6 ontologies (backward-compatible).
 */
export function runV7Gates(data) {
  return [
    validateG20CompetencyCoverage(data),
    validateG21SemanticDuplication(data),
    validateG22CrossOntologyRules(data),
    validateG23LineageChainIntegrity(data),
    validateG24InstanceDataQuality(data),
  ];
}
