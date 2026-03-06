/**
 * Ontology authoring — entity/relationship CRUD, version management, fork, serialization.
 * Operates on raw ontology JSON (state.currentData) and syncs to vis.DataSet for live updates.
 */

import { state, OAA_ENTITY_TYPES, TYPE_COLORS, getArchetypeColor, getArchetypeShape, getArchetypeSize } from './state.js';
import { parseOntology } from './ontology-parser.js';

// ─── OAA v7.0.0 Template ───────────────────────────────────────────────────

/**
 * Creates a blank OAA v7.0.0 ontology skeleton.
 * Uses the pf-ontology format (entities as array) for maximum compatibility.
 * Includes v7 mandatory fields: oaa:schemaVersion, oaa:ontologyId, oaa:series, competencyQuestions.
 */
export function createBlankOntology(name, namespace, description, category) {
  if (!name || !namespace) throw new Error('Name and namespace are required');
  const ns = namespace.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const now = new Date().toISOString().split('T')[0];
  const ontologyId = `${ns.toUpperCase()}-ONT`;
  return {
    "@context": {
      "@vocab": "https://schema.org/",
      "oaa": "https://platformcore.io/ontology/oaa/",
      "pf": "https://platform.framework/ontology/",
      [ns]: `https://platformcore.io/ontology/${ns}/`
    },
    "@type": "Ontology",
    "@id": `${ns}:${ns}-ontology`,
    "oaa:schemaVersion": "7.0.0",
    "oaa:ontologyId": ontologyId,
    "oaa:series": category || 'custom',
    "metadata": {
      "name": name,
      "version": "1.0.0",
      "status": "Draft",
      "description": description || '',
      "dateCreated": now,
      "dateModified": now,
      "creator": "",
      "domain": category || 'custom',
      "oaaVersion": "7.0.0"
    },
    "entities": [],
    "relationships": [],
    "oaa:businessRules": [],
    "competencyQuestions": []
  };
}

// ─── Entity CRUD ────────────────────────────────────────────────────────────

function getEntities(data) {
  if (Array.isArray(data.entities)) return data.entities;
  if (data.hasDefinedTerm && Array.isArray(data.hasDefinedTerm)) return data.hasDefinedTerm;
  if (data.ontologyDefinition) {
    const od = data.ontologyDefinition;
    if (od['@graph'] && Array.isArray(od['@graph'])) return od['@graph'];
    if (Array.isArray(od.entities)) return od.entities;
  }
  if (data.entities && typeof data.entities === 'object') return Object.values(data.entities);
  return null;
}

function getRelationships(data) {
  if (Array.isArray(data.relationships)) return data.relationships;
  if (data.ontologyDefinition && Array.isArray(data.ontologyDefinition.relationships)) return data.ontologyDefinition.relationships;
  return null;
}

function findEntityIndex(entities, entityId) {
  return entities.findIndex(e => (e['@id'] || e.id || e.name) === entityId);
}

/**
 * Adds a new entity to the ontology data.
 * @param {Object} data - Raw ontology JSON
 * @param {Object} entity - { id, name, entityType, description, properties? }
 * @returns {{ success: boolean, error?: string }}
 */
export function addEntity(data, entity) {
  if (!entity || !entity.id || !entity.name) return { success: false, error: 'Entity requires id and name' };
  const entities = getEntities(data);
  if (!entities) return { success: false, error: 'Cannot locate entities array in ontology data' };

  const existing = findEntityIndex(entities, entity.id);
  if (existing >= 0) return { success: false, error: `Entity "${entity.id}" already exists` };

  const oaaEntity = {
    "@type": "pf:EntityDefinition",
    "@id": entity.id,
    "name": entity.name,
    "description": entity.description || '',
    "oaa:entityType": entity.entityType || 'class'
  };
  if (entity.properties && Array.isArray(entity.properties)) {
    oaaEntity.properties = entity.properties;
  }
  entities.push(oaaEntity);
  touchModified(data);
  return { success: true };
}

/**
 * Updates an existing entity.
 * @param {Object} data - Raw ontology JSON
 * @param {string} entityId - The @id of the entity to update
 * @param {Object} changes - Fields to merge ({ name?, description?, entityType?, properties? })
 * @returns {{ success: boolean, error?: string }}
 */
export function updateEntity(data, entityId, changes) {
  const entities = getEntities(data);
  if (!entities) return { success: false, error: 'Cannot locate entities array' };

  const idx = findEntityIndex(entities, entityId);
  if (idx < 0) return { success: false, error: `Entity "${entityId}" not found` };

  const ent = entities[idx];
  if (changes.name !== undefined) ent.name = changes.name;
  if (changes.description !== undefined) ent.description = changes.description;
  if (changes.entityType !== undefined) ent['oaa:entityType'] = changes.entityType;
  if (changes.properties !== undefined) ent.properties = changes.properties;
  touchModified(data);
  return { success: true };
}

/**
 * Removes an entity and cascades to remove referencing relationships.
 * @param {Object} data - Raw ontology JSON
 * @param {string} entityId - The @id of the entity to remove
 * @returns {{ success: boolean, removedRelationships: number, error?: string }}
 */
export function removeEntity(data, entityId) {
  const entities = getEntities(data);
  if (!entities) return { success: false, removedRelationships: 0, error: 'Cannot locate entities array' };

  const idx = findEntityIndex(entities, entityId);
  if (idx < 0) return { success: false, removedRelationships: 0, error: `Entity "${entityId}" not found` };

  entities.splice(idx, 1);

  // Cascade: remove relationships that reference this entity
  let removedCount = 0;
  const rels = getRelationships(data);
  if (rels) {
    for (let i = rels.length - 1; i >= 0; i--) {
      const r = rels[i];
      const domain = r.domainIncludes || [];
      const range = r.rangeIncludes || [];
      if (domain.includes(entityId) || range.includes(entityId)) {
        rels.splice(i, 1);
        removedCount++;
      }
    }
  }
  touchModified(data);
  return { success: true, removedRelationships: removedCount };
}

// ─── Relationship CRUD ──────────────────────────────────────────────────────

function findRelIndex(rels, relName) {
  return rels.findIndex(r => r.name === relName);
}

/**
 * Adds a new relationship.
 * @param {Object} data - Raw ontology JSON
 * @param {Object} rel - { name, domainIncludes: [entityIds], rangeIncludes: [entityIds], description?, cardinality? }
 * @returns {{ success: boolean, error?: string }}
 */
export function addRelationship(data, rel) {
  if (!rel || !rel.name) return { success: false, error: 'Relationship requires a name' };
  if (!rel.domainIncludes || !rel.domainIncludes.length) return { success: false, error: 'Relationship requires at least one domain entity' };
  if (!rel.rangeIncludes || !rel.rangeIncludes.length) return { success: false, error: 'Relationship requires at least one range entity' };

  const rels = getRelationships(data);
  if (!rels) return { success: false, error: 'Cannot locate relationships array in ontology data' };

  const existing = findRelIndex(rels, rel.name);
  if (existing >= 0) return { success: false, error: `Relationship "${rel.name}" already exists` };

  const oaaRel = {
    "@type": "rdf:Property",
    "name": rel.name,
    "domainIncludes": rel.domainIncludes,
    "rangeIncludes": rel.rangeIncludes
  };
  if (rel.description) oaaRel.description = rel.description;
  if (rel.cardinality) oaaRel.cardinality = rel.cardinality;
  rels.push(oaaRel);
  touchModified(data);
  return { success: true };
}

/**
 * Updates an existing relationship.
 */
export function updateRelationship(data, relName, changes) {
  const rels = getRelationships(data);
  if (!rels) return { success: false, error: 'Cannot locate relationships array' };

  const idx = findRelIndex(rels, relName);
  if (idx < 0) return { success: false, error: `Relationship "${relName}" not found` };

  const r = rels[idx];
  if (changes.name !== undefined) r.name = changes.name;
  if (changes.domainIncludes !== undefined) r.domainIncludes = changes.domainIncludes;
  if (changes.rangeIncludes !== undefined) r.rangeIncludes = changes.rangeIncludes;
  if (changes.description !== undefined) r.description = changes.description;
  if (changes.cardinality !== undefined) r.cardinality = changes.cardinality;
  touchModified(data);
  return { success: true };
}

/**
 * Removes a relationship by name.
 */
export function removeRelationship(data, relName) {
  const rels = getRelationships(data);
  if (!rels) return { success: false, error: 'Cannot locate relationships array' };

  const idx = findRelIndex(rels, relName);
  if (idx < 0) return { success: false, error: `Relationship "${relName}" not found` };

  rels.splice(idx, 1);
  touchModified(data);
  return { success: true };
}

// ─── Version Management ─────────────────────────────────────────────────────

/**
 * Bumps the ontology version.
 * @param {Object} data - Raw ontology JSON
 * @param {'major'|'minor'|'patch'} bumpType
 * @returns {{ success: boolean, oldVersion: string, newVersion: string }}
 */
export function bumpVersion(data, bumpType) {
  const meta = data.metadata || data;
  const current = meta.version || '0.0.0';
  const parts = current.split('.').map(Number);
  while (parts.length < 3) parts.push(0);

  if (bumpType === 'major') { parts[0]++; parts[1] = 0; parts[2] = 0; }
  else if (bumpType === 'minor') { parts[1]++; parts[2] = 0; }
  else { parts[2]++; }

  const newVersion = parts.join('.');
  if (meta === data.metadata) {
    data.metadata.version = newVersion;
  } else {
    data.version = newVersion;
  }
  touchModified(data);
  return { success: true, oldVersion: current, newVersion };
}

/**
 * Gets the current version string from ontology data.
 */
export function getVersion(data) {
  if (data.metadata && data.metadata.version) return data.metadata.version;
  if (data.version) return data.version;
  return '0.0.0';
}

// ─── Fork ───────────────────────────────────────────────────────────────────

/**
 * Deep-clones an ontology with a new namespace and name.
 * Resets version to 1.0.0.
 */
export function forkOntology(data, newName, newNamespace) {
  if (!newName || !newNamespace) throw new Error('New name and namespace are required');
  const ns = newNamespace.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const clone = JSON.parse(JSON.stringify(data));

  // Update identity
  if (clone['@id']) clone['@id'] = `${ns}:${ns}-ontology`;
  if (clone['@context'] && typeof clone['@context'] === 'object') {
    clone['@context'][ns] = `https://platformcore.io/ontology/${ns}/`;
  }

  // Update metadata
  if (clone.metadata) {
    clone.metadata.name = newName;
    clone.metadata.version = '1.0.0';
    clone.metadata.status = 'Draft';
    clone.metadata.dateCreated = new Date().toISOString().split('T')[0];
    clone.metadata.dateModified = clone.metadata.dateCreated;
  } else {
    clone.name = newName;
    clone.version = '1.0.0';
  }

  return clone;
}

// ─── Serialization ──────────────────────────────────────────────────────────

/**
 * Ensures all required OAA fields are present and returns clean JSON string.
 */
export function serializeToOAAJsonLD(data) {
  const copy = JSON.parse(JSON.stringify(data));
  // Ensure required top-level fields
  if (!copy['@context']) copy['@context'] = { "@vocab": "https://schema.org/" };
  if (!copy['@type']) copy['@type'] = 'Ontology';
  if (!copy.metadata) {
    copy.metadata = { name: copy.name || 'Untitled', version: copy.version || '1.0.0', oaaVersion: '7.0.0' };
  }
  if (!copy.metadata.oaaVersion) copy.metadata.oaaVersion = '7.0.0';
  if (!copy.entities && !copy.hasDefinedTerm) copy.entities = [];
  if (!copy.relationships) copy.relationships = [];
  return JSON.stringify(copy, null, 2);
}

// ─── Graph Sync (vis.DataSet live mutation) ─────────────────────────────────

/**
 * Applies an entity change to the live vis.Network graph without full re-render.
 * @param {'add'|'update'|'remove'} action
 */
export function applyEntityToGraph(entity, action) {
  if (!state.network) return;
  const ds = state.network.body.data.nodes;
  const id = entity.id || entity['@id'];
  const label = entity.name || id;
  const entityType = entity.entityType || entity['oaa:entityType'] || 'default';

  if (action === 'add') {
    const arcColor = getArchetypeColor(entityType);
    ds.add({
      id,
      label,
      title: entity.description || label,
      color: { background: arcColor, border: '#333',
               highlight: { background: arcColor, border: '#fff' } },
      size: getArchetypeSize(entityType),
      shape: getArchetypeShape(entityType),
      font: { color: '#e0e0e0', size: 12 },
      entityType
    });
  } else if (action === 'update') {
    const arcColor = getArchetypeColor(entityType);
    ds.update({ id, label, title: entity.description || label,
                color: { background: arcColor, border: '#333',
                         highlight: { background: arcColor, border: '#fff' } } });
  } else if (action === 'remove') {
    ds.remove(id);
  }
}

/**
 * Applies a relationship change to the live vis.Network graph.
 */
export function applyRelationshipToGraph(rel, action) {
  if (!state.network) return;
  const ds = state.network.body.data.edges;

  if (action === 'add') {
    const domain = rel.domainIncludes || [];
    const range = rel.rangeIncludes || [];
    domain.forEach(from => {
      range.forEach(to => {
        const edgeId = `${from}--${rel.name}-->${to}`;
        ds.add({
          id: edgeId, from, to, label: rel.name,
          color: { color: '#4CAF50', highlight: '#81C784' },
          font: { color: '#aaa', size: 10, strokeWidth: 0 },
          arrows: 'to', width: 1.5,
          smooth: { type: 'continuous', roundness: 0.15 }
        });
      });
    });
  } else if (action === 'remove') {
    // Remove all edges with this relationship name
    const allEdges = ds.get();
    allEdges.forEach(e => {
      if (e.label === rel.name || (e.id && e.id.includes(`--${rel.name}-->`))) {
        ds.remove(e.id);
      }
    });
  }
}

// ─── Undo / Redo ────────────────────────────────────────────────────────────

/**
 * Takes a snapshot of currentData for undo tracking.
 * Call before every mutation.
 */
export function pushUndoSnapshot(operation) {
  if (!state.currentData) return;
  state.authoringUndoStack.push({
    operation,
    timestamp: Date.now(),
    snapshot: JSON.stringify(state.currentData)
  });
  // Clear redo stack on new mutation
  state.authoringRedoStack = [];
  state.authoringDirty = true;
}

/**
 * Undoes the last authoring operation.
 * @returns {{ success: boolean, operation?: string }}
 */
export function undo() {
  if (!state.authoringUndoStack.length) return { success: false };
  const entry = state.authoringUndoStack.pop();
  // Push current state to redo
  state.authoringRedoStack.push({
    operation: 'undo:' + entry.operation,
    timestamp: Date.now(),
    snapshot: JSON.stringify(state.currentData)
  });
  // Restore snapshot
  state.currentData = JSON.parse(entry.snapshot);
  state.lastParsed = parseOntology(state.currentData, 'authoring');
  state.authoringDirty = state.authoringUndoStack.length > 0;
  return { success: true, operation: entry.operation };
}

/**
 * Redoes the last undone operation.
 */
export function redo() {
  if (!state.authoringRedoStack.length) return { success: false };
  const entry = state.authoringRedoStack.pop();
  state.authoringUndoStack.push({
    operation: 'redo:' + entry.operation,
    timestamp: Date.now(),
    snapshot: JSON.stringify(state.currentData)
  });
  state.currentData = JSON.parse(entry.snapshot);
  state.lastParsed = parseOntology(state.currentData, 'authoring');
  state.authoringDirty = true;
  return { success: true, operation: entry.operation };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function touchModified(data) {
  if (data.metadata) {
    data.metadata.dateModified = new Date().toISOString().split('T')[0];
  }
}

/**
 * Lists entity IDs from the ontology data (for relationship domain/range dropdowns).
 */
export function listEntityIds(data) {
  const entities = getEntities(data);
  if (!entities) return [];
  return entities.map(e => e['@id'] || e.id || e.name).filter(Boolean);
}

/**
 * Gets an entity by ID.
 */
export function getEntity(data, entityId) {
  const entities = getEntities(data);
  if (!entities) return null;
  return entities.find(e => (e['@id'] || e.id || e.name) === entityId) || null;
}

/**
 * Gets a relationship by name.
 */
export function getRelationship(data, relName) {
  const rels = getRelationships(data);
  if (!rels) return null;
  return rels.find(r => r.name === relName) || null;
}
