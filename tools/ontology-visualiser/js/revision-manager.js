/**
 * Revision Manager — revision history tracking, auto-changelog generation,
 * glossary management, and glossary-to-node linking.
 *
 * Feature 7.2: Revision Documentation & Glossary Management
 */

import { state, REGISTRY_BASE_PATH } from './state.js';
import { bumpVersion, getVersion } from './ontology-author.js';
import { diffOntologies, generateChangelog } from './diff-engine.js';

// ─── Revision History (7.2.1, 7.2.3) ────────────────────────────────────────

/**
 * Creates a new revision with auto-generated changelog.
 * Diffs the baseline snapshot (captured when authoring began) against
 * the current data, bumps the version, generates a changelog, and
 * stores the revision record.
 *
 * @param {Object} data - Raw ontology JSON (state.currentData)
 * @param {'major'|'minor'|'patch'} bumpType
 * @returns {{ success: boolean, oldVersion?: string, newVersion?: string, changelog?: string, diff?: Object, error?: string }}
 */
export function createRevision(data, bumpType) {
  if (!data) return { success: false, error: 'No ontology data' };

  // Use baseline snapshot (captured at authoring start) to capture all edits
  const baseline = state.authoringBaselineSnapshot
    ? JSON.parse(state.authoringBaselineSnapshot)
    : JSON.parse(JSON.stringify(data));

  const oldVersion = getVersion(baseline);

  // Bump version on the live data
  const result = bumpVersion(data, bumpType);
  if (!result.success) return result;

  // Diff baseline vs bumped data — captures all entity/relationship changes + version bump
  const diff = diffOntologies(baseline, data);
  const changelog = generateChangelog(diff);

  // Store revision record
  const ontologyId = getOntologyId(data);
  const revision = {
    ontologyId,
    oldVersion,
    newVersion: result.newVersion,
    bumpType,
    timestamp: new Date().toISOString(),
    diff: {
      summary: diff.summary,
      metadata: diff.metadata,
      oldVersion: diff.oldVersion,
      newVersion: diff.newVersion,
      entities: {
        added: diff.entities.added.map(a => ({ id: a.id, description: a.entity?.description })),
        removed: diff.entities.removed.map(r => ({ id: r.id })),
        modified: diff.entities.modified.map(m => ({ id: m.id, changes: m.changes.map(c => c.property) })),
      },
      relationships: {
        added: diff.relationships.added.map(a => ({ id: a.id })),
        removed: diff.relationships.removed.map(r => ({ id: r.id })),
        modified: diff.relationships.modified.map(m => ({ id: m.id })),
      },
    },
    changelog,
  };

  state.revisionHistory.push(revision);
  _persistRevisionHistory();

  // Reset baseline to current state for the next revision cycle
  state.authoringBaselineSnapshot = JSON.stringify(data);

  return {
    success: true,
    oldVersion,
    newVersion: result.newVersion,
    changelog,
    diff,
  };
}

/**
 * Gets revision history for the current or specified ontology.
 * @param {string} [ontologyId] - Optional ontology ID filter
 * @returns {Array} Revision records, newest first
 */
export function getRevisionHistory(ontologyId) {
  const id = ontologyId || getOntologyId(state.currentData);
  if (!id) return [];
  return state.revisionHistory
    .filter(r => r.ontologyId === id)
    .slice()
    .reverse();
}

/**
 * Gets all revision history across all ontologies.
 * @returns {Array} All revision records, newest first
 */
export function getAllRevisionHistory() {
  return state.revisionHistory.slice().reverse();
}

/**
 * Clears revision history for a given ontology (or all if no id).
 */
export function clearRevisionHistory(ontologyId) {
  if (ontologyId) {
    state.revisionHistory = state.revisionHistory.filter(r => r.ontologyId !== ontologyId);
  } else {
    state.revisionHistory = [];
  }
  _persistRevisionHistory();
}

/**
 * Exports all revisions for the current ontology as a single Markdown document.
 * (Story 7.2.4)
 * @param {string} [ontologyId] - Optional ontology ID filter
 * @returns {string} Markdown document
 */
export function exportRevisionDocs(ontologyId) {
  const id = ontologyId || getOntologyId(state.currentData);
  const revisions = state.revisionHistory.filter(r => r.ontologyId === id);

  const name = state.currentData?.metadata?.name
    || state.currentData?.name
    || id || 'Ontology';

  if (revisions.length === 0) {
    return `# Revision History: ${name}\n\n**Generated:** ${new Date().toISOString().split('T')[0]}\n\nNo revisions recorded yet.\n`;
  }

  let md = `# Revision History: ${name}\n\n`;
  md += `**Generated:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Total Revisions:** ${revisions.length}\n\n`;

  // Table of contents
  md += `## Table of Contents\n\n`;
  revisions.forEach((rev, i) => {
    const date = rev.timestamp.split('T')[0];
    md += `${i + 1}. **${rev.oldVersion} → ${rev.newVersion}** (${rev.bumpType}, ${date})\n`;
  });
  md += '\n---\n\n';

  // Each revision's changelog
  revisions.forEach(rev => {
    md += rev.changelog;
    md += `\n*Revision type: ${rev.bumpType} | Date: ${rev.timestamp.split('T')[0]}*\n`;
    md += '\n---\n\n';
  });

  return md;
}

// ─── Glossary Management (7.2.2, 7.2.5) ──────────────────────────────────────

/**
 * Loads the unified glossary from the ontology library path.
 * Returns the loaded glossary or a blank structure if unavailable.
 */
export async function loadGlossary() {
  if (state.glossaryData) return state.glossaryData;

  try {
    const response = await fetch(REGISTRY_BASE_PATH + 'unified-glossary-v2.0.0.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.glossaryData = await response.json();
    if (!state.glossaryData.customEntries) state.glossaryData.customEntries = {};
    return state.glossaryData;
  } catch {
    state.glossaryData = _blankGlossary();
    return state.glossaryData;
  }
}

/**
 * Loads a glossary from an already-parsed object (for testing / offline use).
 */
export function loadGlossaryFromData(data) {
  state.glossaryData = data || _blankGlossary();
  if (!state.glossaryData.customEntries) state.glossaryData.customEntries = {};
  return state.glossaryData;
}

/**
 * Searches the glossary for a term (case-insensitive substring match).
 * @param {string} query - Search string
 * @returns {Array<{term, definition, ontology, layer}>}
 */
export function searchGlossary(query) {
  if (!state.glossaryData || !query) return [];
  const q = query.toLowerCase();
  const results = [];

  // Search through all known layer keys
  const layerKeys = Object.keys(state.glossaryData).filter(k =>
    k.endsWith('Layer') || k.endsWith('layer')
  );

  for (const layerKey of layerKeys) {
    const layer = state.glossaryData[layerKey];
    if (!layer || typeof layer !== 'object') continue;
    for (const [ontKey, terms] of Object.entries(layer)) {
      if (!terms || typeof terms !== 'object') continue;
      for (const [term, definition] of Object.entries(terms)) {
        if (typeof definition !== 'string') continue;
        if (term.toLowerCase().includes(q) || definition.toLowerCase().includes(q)) {
          results.push({ term, definition, ontology: ontKey, layer: layerKey });
        }
      }
    }
  }

  // Search custom entries
  const custom = state.glossaryData.customEntries;
  if (custom) {
    for (const [term, entry] of Object.entries(custom)) {
      const def = typeof entry === 'string' ? entry : entry.definition || '';
      if (term.toLowerCase().includes(q) || def.toLowerCase().includes(q)) {
        results.push({
          term,
          definition: def,
          ontology: (typeof entry === 'object' ? entry.ontology : null) || 'custom',
          layer: 'custom',
        });
      }
    }
  }

  return results;
}

/**
 * Adds a new custom glossary entry.
 * (Story 7.2.2)
 */
export function addGlossaryEntry(term, definition, ontologyRef) {
  if (!term || !definition) return { success: false, error: 'Term and definition required' };
  if (!state.glossaryData) state.glossaryData = _blankGlossary();
  if (!state.glossaryData.customEntries) state.glossaryData.customEntries = {};

  if (state.glossaryData.customEntries[term]) {
    return { success: false, error: `Entry "${term}" already exists` };
  }

  state.glossaryData.customEntries[term] = {
    definition,
    ontology: ontologyRef || 'custom',
    addedAt: new Date().toISOString(),
  };

  return { success: true };
}

/**
 * Updates an existing custom glossary entry.
 */
export function updateGlossaryEntry(term, changes) {
  if (!state.glossaryData?.customEntries?.[term]) {
    return { success: false, error: `Custom entry "${term}" not found` };
  }
  const entry = state.glossaryData.customEntries[term];
  if (changes.definition !== undefined) entry.definition = changes.definition;
  if (changes.ontology !== undefined) entry.ontology = changes.ontology;
  entry.modifiedAt = new Date().toISOString();
  return { success: true };
}

/**
 * Removes a custom glossary entry.
 */
export function removeGlossaryEntry(term) {
  if (!state.glossaryData?.customEntries?.[term]) {
    return { success: false, error: `Custom entry "${term}" not found` };
  }
  delete state.glossaryData.customEntries[term];
  return { success: true };
}

/**
 * Gets all custom glossary entries.
 */
export function getCustomGlossaryEntries() {
  if (!state.glossaryData?.customEntries) return [];
  return Object.entries(state.glossaryData.customEntries).map(([term, entry]) => ({
    term,
    definition: typeof entry === 'string' ? entry : entry.definition || '',
    ontology: typeof entry === 'object' ? entry.ontology : 'custom',
  }));
}

// ─── Glossary-to-Node Linking (7.2.5) ────────────────────────────────────────

/**
 * Links a glossary term to a graph entity node.
 */
export function linkGlossaryToNode(term, entityId) {
  if (!term || !entityId) return { success: false, error: 'Term and entity ID required' };

  if (!state.glossaryLinks.has(entityId)) {
    state.glossaryLinks.set(entityId, []);
  }
  const links = state.glossaryLinks.get(entityId);
  if (!links.includes(term)) {
    links.push(term);
  }
  _persistGlossaryLinks();
  return { success: true };
}

/**
 * Unlinks a glossary term from a graph entity node.
 */
export function unlinkGlossaryFromNode(term, entityId) {
  if (!state.glossaryLinks.has(entityId)) return { success: false, error: 'No links for entity' };
  const links = state.glossaryLinks.get(entityId);
  const idx = links.indexOf(term);
  if (idx < 0) return { success: false, error: 'Link not found' };
  links.splice(idx, 1);
  if (links.length === 0) state.glossaryLinks.delete(entityId);
  _persistGlossaryLinks();
  return { success: true };
}

/**
 * Gets glossary entries linked to a specific node.
 */
export function getGlossaryForNode(entityId) {
  const terms = state.glossaryLinks.get(entityId) || [];
  return terms.map(term => {
    const results = searchGlossary(term);
    const exact = results.find(r => r.term === term);
    return exact || { term, definition: '(not found in glossary)', layer: 'unknown', ontology: 'unknown' };
  });
}

/**
 * Gets all glossary links as a plain object.
 */
export function getAllGlossaryLinks() {
  const obj = {};
  for (const [k, v] of state.glossaryLinks) {
    if (v.length > 0) obj[k] = [...v];
  }
  return obj;
}

/**
 * Auto-suggests glossary links for entities in the current ontology.
 * Matches entity names to glossary terms (exact match).
 */
export function suggestGlossaryLinks(data) {
  if (!state.glossaryData || !data) return [];
  const entities = data.entities || data.hasDefinedTerm || [];
  const entityList = Array.isArray(entities) ? entities : Object.values(entities);

  const suggestions = [];
  for (const entity of entityList) {
    const entityId = entity['@id'] || entity.id || entity.name;
    const entityName = entity.name || entityId;
    if (!entityName) continue;
    if (state.glossaryLinks.has(entityId)) continue;

    const matches = searchGlossary(entityName).filter(r =>
      r.term.toLowerCase() === entityName.toLowerCase()
    );
    if (matches.length > 0) {
      suggestions.push({ entityId, entityName, matches: matches.slice(0, 3) });
    }
  }

  return suggestions;
}

// ─── Persistence Helpers ──────────────────────────────────────────────────────

function getOntologyId(data) {
  if (!data) return null;
  return data['@id'] || data.metadata?.name || data.name || 'unknown';
}

function _blankGlossary() {
  return {
    '@context': 'https://platformcore.io/ontology/glossary/',
    '@type': 'UnifiedGlossary',
    version: 'local',
    customEntries: {},
  };
}

function _persistRevisionHistory() {
  try {
    localStorage.setItem('oaa-viz-revision-history', JSON.stringify(state.revisionHistory));
  } catch { /* quota exceeded — ignore */ }
}

function _persistGlossaryLinks() {
  try {
    const obj = {};
    for (const [k, v] of state.glossaryLinks) obj[k] = v;
    localStorage.setItem('oaa-viz-glossary-links', JSON.stringify(obj));
  } catch { /* quota exceeded — ignore */ }
}

/**
 * Restores revision history and glossary links from localStorage.
 * Call during app initialisation.
 */
export function restoreRevisionState() {
  try {
    const hist = localStorage.getItem('oaa-viz-revision-history');
    if (hist) state.revisionHistory = JSON.parse(hist);
  } catch { /* ignore */ }

  try {
    const links = localStorage.getItem('oaa-viz-glossary-links');
    if (links) {
      const obj = JSON.parse(links);
      for (const [k, v] of Object.entries(obj)) {
        state.glossaryLinks.set(k, v);
      }
    }
  } catch { /* ignore */ }
}
