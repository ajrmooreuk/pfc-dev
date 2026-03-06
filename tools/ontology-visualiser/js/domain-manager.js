/**
 * Domain Manager — product/domain-specific ontology instance management.
 * Handles PFI domain extensions, validation against parent PFC schema,
 * lineage tracking, independent versioning, and merge-back to shared ontologies.
 *
 * Feature 7.4: Domain-Specific Data & Knowledge Management
 * Pure logic (no DOM), all functions operate on data + state.
 */

import { state } from './state.js';
import { extractEntities, extractRelationships } from './audit-engine.js';
import { diffOntologies } from './diff-engine.js';

// ─── Domain Instance Creation (7.4.1) ──────────────────────────────────────

/**
 * Creates a product-specific ontology instance extending a PFC parent.
 *
 * @param {Object} params
 * @param {string} params.instanceId   - e.g. 'BAIV-AIV-VP'
 * @param {string} params.parentOntology - Short name of PFC parent, e.g. 'VP'
 * @param {string} params.productCode   - e.g. 'BAIV-AIV'
 * @param {string} params.instanceName  - e.g. 'BAIV AI Visibility Value Proposition'
 * @param {string} [params.description]
 * @param {Object} [params.parentData]  - Raw JSON of the parent ontology (for schema extraction)
 * @returns {{ success: boolean, instance?: Object, error?: string }}
 */
export function createDomainInstance(params) {
  const { instanceId, parentOntology, productCode, instanceName, description, parentData } = params;

  if (!instanceId || !parentOntology || !productCode || !instanceName) {
    return { success: false, error: 'instanceId, parentOntology, productCode, and instanceName are required' };
  }

  // Extract parent schema if provided
  let parentSchema = null;
  if (parentData) {
    parentSchema = extractParentSchema(parentData);
  }

  const instance = {
    '@context': 'https://platformcore.io/ontology/domain-instance/',
    '@type': 'DomainOntologyInstance',
    '@id': instanceId,
    instanceId,
    instanceName,
    description: description || '',
    parentOntology,
    productCode,
    contextLevel: 'PFI',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    parentSchema,
    entities: [],
    relationships: [],
    domainExtensions: [],
    lineage: {
      parent: parentOntology,
      parentVersion: parentData?.version || parentData?.metadata?.version || 'unknown',
      createdFrom: 'PFC',
      divergencePoints: [],
    },
  };

  state.domainInstances.set(instanceId, instance);
  _persistDomainInstances();

  return { success: true, instance };
}

/**
 * Adds a domain-specific entity to a domain instance.
 */
export function addDomainEntity(instanceId, entity) {
  const instance = state.domainInstances.get(instanceId);
  if (!instance) return { success: false, error: `Instance ${instanceId} not found` };

  if (!entity['@id'] && !entity.id && !entity.name) {
    return { success: false, error: 'Entity must have @id, id, or name' };
  }

  const entityId = entity['@id'] || entity.id || entity.name;

  // Check for duplicate
  if (instance.entities.some(e => (e['@id'] || e.id || e.name) === entityId)) {
    return { success: false, error: `Entity ${entityId} already exists in instance` };
  }

  instance.entities.push({
    ...entity,
    '@id': entityId,
    addedAt: new Date().toISOString(),
    isDomainExtension: true,
  });
  instance.lastModified = new Date().toISOString();
  instance.domainExtensions.push({
    type: 'entity-added',
    entityId,
    timestamp: new Date().toISOString(),
  });

  _persistDomainInstances();
  return { success: true };
}

/**
 * Adds a domain-specific relationship to a domain instance.
 */
export function addDomainRelationship(instanceId, relationship) {
  const instance = state.domainInstances.get(instanceId);
  if (!instance) return { success: false, error: `Instance ${instanceId} not found` };

  const relId = relationship['@id'] || relationship.name || `rel-${Date.now()}`;

  instance.relationships.push({
    ...relationship,
    '@id': relId,
    addedAt: new Date().toISOString(),
    isDomainExtension: true,
  });
  instance.lastModified = new Date().toISOString();

  _persistDomainInstances();
  return { success: true };
}

// ─── Domain Validation (7.4.2) ─────────────────────────────────────────────

/**
 * Validates a domain instance against its parent PFC ontology schema.
 * Checks that domain entities conform to parent entity types, required properties,
 * and relationship constraints.
 *
 * @param {string} instanceId
 * @param {Object} [parentData] - Parent ontology raw JSON (optional, uses cached schema)
 * @returns {{ success: boolean, valid: boolean, errors: Array, warnings: Array }}
 */
export function validateDomainInstance(instanceId, parentData) {
  const instance = state.domainInstances.get(instanceId);
  if (!instance) return { success: false, valid: false, errors: ['Instance not found'], warnings: [] };

  const errors = [];
  const warnings = [];

  // Extract parent schema
  const schema = parentData ? extractParentSchema(parentData) : instance.parentSchema;

  // 1. Check basic structure
  if (!instance.entities || instance.entities.length === 0) {
    warnings.push('Domain instance has no entities');
  }

  // 2. Check entity types exist in parent (if schema available)
  if (schema?.entityTypes) {
    for (const entity of instance.entities) {
      const type = entity['@type'] || entity.entityType;
      if (type && !schema.entityTypes.includes(type) && type !== 'class' && type !== 'supporting') {
        warnings.push(`Entity "${entity['@id']}" has type "${type}" not found in parent ${instance.parentOntology}`);
      }
    }
  }

  // 3. Check required properties
  if (schema?.requiredProperties) {
    for (const entity of instance.entities) {
      for (const prop of schema.requiredProperties) {
        if (!entity[prop] && !entity.properties?.[prop]) {
          errors.push(`Entity "${entity['@id']}" missing required property "${prop}"`);
        }
      }
    }
  }

  // 4. Check relationship endpoints exist
  const entityIds = new Set(instance.entities.map(e => e['@id'] || e.id || e.name));
  for (const rel of instance.relationships) {
    const domains = rel.domainIncludes || (rel.sourceEntity ? [rel.sourceEntity] : []);
    const ranges = rel.rangeIncludes || (rel.targetEntity ? [rel.targetEntity] : []);
    const domainArr = Array.isArray(domains) ? domains : [domains];
    const rangeArr = Array.isArray(ranges) ? ranges : [ranges];

    for (const d of domainArr) {
      if (d && !entityIds.has(d) && !d.includes(':')) {
        warnings.push(`Relationship "${rel.name || rel['@id']}" references unknown domain entity "${d}"`);
      }
    }
    for (const r of rangeArr) {
      if (r && !entityIds.has(r) && !r.includes(':')) {
        warnings.push(`Relationship "${rel.name || rel['@id']}" references unknown range entity "${r}"`);
      }
    }
  }

  // 5. Check @id uniqueness
  const idCounts = {};
  for (const entity of instance.entities) {
    const id = entity['@id'] || entity.id || entity.name;
    idCounts[id] = (idCounts[id] || 0) + 1;
  }
  for (const [id, count] of Object.entries(idCounts)) {
    if (count > 1) {
      errors.push(`Duplicate entity @id: "${id}" (appears ${count} times)`);
    }
  }

  return {
    success: true,
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Domain Lineage Tracking (7.4.3) ───────────────────────────────────────

/**
 * Gets the lineage chain from PFC core entities to domain-specific extensions.
 *
 * @param {string} instanceId
 * @returns {{ success: boolean, lineage?: Object }}
 */
export function getDomainLineage(instanceId) {
  const instance = state.domainInstances.get(instanceId);
  if (!instance) return { success: false, error: `Instance ${instanceId} not found` };

  const lineageNodes = [];
  const lineageEdges = [];

  // PFC parent node
  lineageNodes.push({
    id: `pfc:${instance.parentOntology}`,
    label: `${instance.parentOntology} (PFC)`,
    type: 'pfc-parent',
    level: 0,
  });

  // Domain instance node
  lineageNodes.push({
    id: instance.instanceId,
    label: instance.instanceName,
    type: 'domain-instance',
    level: 1,
  });

  lineageEdges.push({
    from: `pfc:${instance.parentOntology}`,
    to: instance.instanceId,
    label: 'extends',
    type: 'inheritance',
  });

  // Domain entities
  for (const entity of instance.entities) {
    const entityId = entity['@id'] || entity.id || entity.name;
    lineageNodes.push({
      id: `${instance.instanceId}::${entityId}`,
      label: entity.name || entityId,
      type: 'domain-entity',
      level: 2,
    });
    lineageEdges.push({
      from: instance.instanceId,
      to: `${instance.instanceId}::${entityId}`,
      label: 'defines',
      type: 'composition',
    });
  }

  return {
    success: true,
    lineage: {
      instanceId: instance.instanceId,
      parentOntology: instance.parentOntology,
      parentVersion: instance.lineage?.parentVersion || 'unknown',
      nodes: lineageNodes,
      edges: lineageEdges,
      divergencePoints: instance.lineage?.divergencePoints || [],
      extensions: instance.domainExtensions,
    },
  };
}

// ─── Domain Version Control (7.4.4) ────────────────────────────────────────

/**
 * Bumps the version of a domain instance.
 *
 * @param {string} instanceId
 * @param {'major'|'minor'|'patch'} bumpType
 * @returns {{ success: boolean, oldVersion?: string, newVersion?: string }}
 */
export function bumpDomainVersion(instanceId, bumpType = 'patch') {
  const instance = state.domainInstances.get(instanceId);
  if (!instance) return { success: false, error: `Instance ${instanceId} not found` };

  const oldVersion = instance.version;
  const parts = oldVersion.split('.').map(Number);
  if (parts.length !== 3) return { success: false, error: 'Invalid version format' };

  if (bumpType === 'major') { parts[0]++; parts[1] = 0; parts[2] = 0; }
  else if (bumpType === 'minor') { parts[1]++; parts[2] = 0; }
  else { parts[2]++; }

  const newVersion = parts.join('.');
  instance.version = newVersion;
  instance.lastModified = new Date().toISOString();

  // Record version in history
  if (!state.domainVersionHistory.has(instanceId)) {
    state.domainVersionHistory.set(instanceId, []);
  }
  state.domainVersionHistory.get(instanceId).push({
    version: oldVersion,
    timestamp: new Date().toISOString(),
    bumpType,
    entityCount: instance.entities.length,
    relationshipCount: instance.relationships.length,
  });

  _persistDomainInstances();
  _persistDomainVersionHistory();

  return { success: true, oldVersion, newVersion };
}

/**
 * Gets version history for a domain instance.
 */
export function getDomainVersionHistory(instanceId) {
  return (state.domainVersionHistory.get(instanceId) || []).slice().reverse();
}

// ─── Merge Back to Shared Ontology (7.4.5) ─────────────────────────────────

/**
 * Prepares a merge-back proposal: identifies domain entities/relationships
 * that could be promoted to the shared PFC ontology.
 *
 * @param {string} instanceId
 * @param {Object} parentData - Current PFC parent ontology raw JSON
 * @returns {{ success: boolean, proposal?: Object }}
 */
export function prepareMergeBack(instanceId, parentData) {
  const instance = state.domainInstances.get(instanceId);
  if (!instance) return { success: false, error: `Instance ${instanceId} not found` };
  if (!parentData) return { success: false, error: 'Parent ontology data required' };

  const parentEntities = extractEntities(parentData);
  const parentEntityIds = new Set(parentEntities.map(e => e['@id'] || e.id || e.name));

  const parentRels = extractRelationships(parentData);
  const parentRelNames = new Set(parentRels.map(r => r.name || r['@id']));

  // Entities to promote (new to parent)
  const entitiesToAdd = instance.entities.filter(entity => {
    const id = entity['@id'] || entity.id || entity.name;
    return !parentEntityIds.has(id);
  });

  // Relationships to promote (new to parent)
  const relationshipsToAdd = instance.relationships.filter(rel => {
    const name = rel.name || rel['@id'];
    return !parentRelNames.has(name);
  });

  // Entities that overlap (may need property merge)
  const entitiesToMerge = instance.entities.filter(entity => {
    const id = entity['@id'] || entity.id || entity.name;
    return parentEntityIds.has(id);
  });

  const proposal = {
    instanceId,
    parentOntology: instance.parentOntology,
    timestamp: new Date().toISOString(),
    entitiesToAdd: entitiesToAdd.map(e => ({
      '@id': e['@id'] || e.id || e.name,
      name: e.name,
      '@type': e['@type'] || e.entityType || 'class',
      description: e.description,
    })),
    relationshipsToAdd: relationshipsToAdd.map(r => ({
      name: r.name || r['@id'],
      domainIncludes: r.domainIncludes || [r.sourceEntity],
      rangeIncludes: r.rangeIncludes || [r.targetEntity],
    })),
    entitiesToMerge: entitiesToMerge.map(e => ({
      '@id': e['@id'] || e.id || e.name,
      name: e.name,
      mergeAction: 'review-properties',
    })),
    summary: {
      newEntities: entitiesToAdd.length,
      newRelationships: relationshipsToAdd.length,
      overlappingEntities: entitiesToMerge.length,
    },
  };

  return { success: true, proposal };
}

/**
 * Applies a merge-back proposal to parent ontology data (returns a new merged copy).
 *
 * @param {Object} parentData - Current PFC parent ontology raw JSON
 * @param {Object} proposal - From prepareMergeBack()
 * @returns {{ success: boolean, mergedData?: Object, changeCount?: number }}
 */
export function applyMergeBack(parentData, proposal) {
  if (!parentData || !proposal) {
    return { success: false, error: 'Parent data and proposal required' };
  }

  const merged = JSON.parse(JSON.stringify(parentData));
  let changeCount = 0;

  // Add new entities
  const entities = merged.entities || merged.hasDefinedTerm || [];
  const isArray = Array.isArray(entities);

  if (isArray) {
    for (const entity of proposal.entitiesToAdd) {
      entities.push({
        '@id': entity['@id'],
        '@type': entity['@type'] || 'class',
        name: entity.name,
        description: entity.description || '',
        mergedFrom: proposal.instanceId,
        mergedAt: new Date().toISOString(),
      });
      changeCount++;
    }
  }

  // Add new relationships
  if (merged.relationships && Array.isArray(merged.relationships)) {
    for (const rel of proposal.relationshipsToAdd) {
      merged.relationships.push({
        name: rel.name,
        domainIncludes: rel.domainIncludes,
        rangeIncludes: rel.rangeIncludes,
        mergedFrom: proposal.instanceId,
        mergedAt: new Date().toISOString(),
      });
      changeCount++;
    }
  }

  return { success: true, mergedData: merged, changeCount };
}

// ─── CRUD Operations ────────────────────────────────────────────────────────

/**
 * Gets all domain instances.
 */
export function getDomainInstances() {
  return [...state.domainInstances.values()];
}

/**
 * Gets a specific domain instance.
 */
export function getDomainInstance(instanceId) {
  return state.domainInstances.get(instanceId) || null;
}

/**
 * Deletes a domain instance.
 */
export function deleteDomainInstance(instanceId) {
  if (!state.domainInstances.has(instanceId)) {
    return { success: false, error: `Instance ${instanceId} not found` };
  }
  state.domainInstances.delete(instanceId);
  state.domainVersionHistory.delete(instanceId);
  _persistDomainInstances();
  _persistDomainVersionHistory();
  return { success: true };
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Extracts a schema summary from parent ontology data for validation.
 */
function extractParentSchema(data) {
  const entities = extractEntities(data);
  const relationships = extractRelationships(data);

  const entityTypes = [...new Set(
    entities.map(e => e['@type'] || e.entityType).filter(Boolean)
  )];

  // Gather commonly required properties
  const propCounts = {};
  for (const entity of entities) {
    for (const key of Object.keys(entity)) {
      if (!key.startsWith('_') && !key.startsWith('@')) {
        propCounts[key] = (propCounts[key] || 0) + 1;
      }
    }
  }
  // Properties present in >80% of entities are considered required
  const threshold = entities.length * 0.8;
  const requiredProperties = Object.entries(propCounts)
    .filter(([, count]) => count >= threshold && count >= 2)
    .map(([key]) => key)
    .filter(k => ['name', 'description', '@id'].includes(k));

  return {
    entityCount: entities.length,
    relationshipCount: relationships.length,
    entityTypes,
    requiredProperties,
    entityNames: entities.map(e => e.name || e['@id'] || e.id).filter(Boolean),
    relationshipNames: relationships.map(r => r.name || r['@id']).filter(Boolean),
  };
}

function _persistDomainInstances() {
  try {
    const arr = [...state.domainInstances.values()];
    localStorage.setItem('oaa-viz-domain-instances', JSON.stringify(arr));
  } catch { /* quota */ }
}

function _persistDomainVersionHistory() {
  try {
    const obj = {};
    for (const [k, v] of state.domainVersionHistory) {
      obj[k] = v;
    }
    localStorage.setItem('oaa-viz-domain-version-history', JSON.stringify(obj));
  } catch { /* quota */ }
}

/**
 * Restores domain state from localStorage.
 * Call during app initialisation.
 */
export function restoreDomainState() {
  try {
    const inst = localStorage.getItem('oaa-viz-domain-instances');
    if (inst) {
      const arr = JSON.parse(inst);
      for (const item of arr) {
        state.domainInstances.set(item.instanceId || item['@id'], item);
      }
    }
  } catch { /* ignore */ }

  try {
    const hist = localStorage.getItem('oaa-viz-domain-version-history');
    if (hist) {
      const obj = JSON.parse(hist);
      for (const [k, v] of Object.entries(obj)) {
        state.domainVersionHistory.set(k, v);
      }
    }
  } catch { /* ignore */ }
}
