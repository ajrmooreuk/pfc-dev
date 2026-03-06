/**
 * Ontology Diff Engine — compares two ontology versions.
 * Pure functions (no DOM), works with raw ontology JSON data.
 */

import { extractEntities, extractRelationships } from './audit-engine.js';

/**
 * Compare two ontology data objects and return a structured diff.
 * @param {Object} oldData - Previous version raw ontology JSON
 * @param {Object} newData - Current version raw ontology JSON
 * @returns {Object} diff result
 */
export function diffOntologies(oldData, newData) {
  const oldEntities = extractEntities(oldData);
  const newEntities = extractEntities(newData);
  const oldRels = extractRelationships(oldData);
  const newRels = extractRelationships(newData);

  const oldEntityMap = buildEntityMap(oldEntities);
  const newEntityMap = buildEntityMap(newEntities);

  // Entity diff
  const added = [];
  const removed = [];
  const modified = [];
  const unchanged = [];

  for (const [id, entity] of newEntityMap) {
    if (!oldEntityMap.has(id)) {
      added.push({ id, entity, type: 'entity' });
    } else {
      const oldEntity = oldEntityMap.get(id);
      const changes = diffProps(oldEntity, entity);
      if (changes.length > 0) {
        modified.push({ id, entity, oldEntity, changes, type: 'entity' });
      } else {
        unchanged.push({ id, entity, type: 'entity' });
      }
    }
  }

  for (const [id, entity] of oldEntityMap) {
    if (!newEntityMap.has(id)) {
      removed.push({ id, entity, type: 'entity' });
    }
  }

  // Relationship diff
  const oldRelMap = buildRelMap(oldRels);
  const newRelMap = buildRelMap(newRels);
  const addedRels = [];
  const removedRels = [];
  const modifiedRels = [];

  for (const [id, rel] of newRelMap) {
    if (!oldRelMap.has(id)) {
      addedRels.push({ id, rel, type: 'relationship' });
    } else {
      const oldRel = oldRelMap.get(id);
      const changes = diffProps(oldRel, rel);
      if (changes.length > 0) {
        modifiedRels.push({ id, rel, oldRel, changes, type: 'relationship' });
      }
    }
  }

  for (const [id, rel] of oldRelMap) {
    if (!newRelMap.has(id)) {
      removedRels.push({ id, rel, type: 'relationship' });
    }
  }

  // Metadata diff
  const metadataChanges = diffMetadata(oldData, newData);

  return {
    summary: {
      entitiesAdded: added.length,
      entitiesRemoved: removed.length,
      entitiesModified: modified.length,
      entitiesUnchanged: unchanged.length,
      relsAdded: addedRels.length,
      relsRemoved: removedRels.length,
      relsModified: modifiedRels.length
    },
    entities: { added, removed, modified, unchanged },
    relationships: { added: addedRels, removed: removedRels, modified: modifiedRels },
    metadata: metadataChanges,
    oldVersion: oldData.version || oldData.metadata?.version || oldData['oaa:moduleVersion'] || 'unknown',
    newVersion: newData.version || newData.metadata?.version || newData['oaa:moduleVersion'] || 'unknown'
  };
}

/**
 * Generate Markdown changelog from a diff result.
 */
export function generateChangelog(diff) {
  let md = `# Changelog: ${diff.oldVersion} → ${diff.newVersion}\n\n`;
  md += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`;

  // Summary table
  md += `## Summary\n\n`;
  md += `| Category | Added | Removed | Modified | Unchanged |\n`;
  md += `|----------|-------|---------|----------|-----------|\n`;
  md += `| Entities | ${diff.summary.entitiesAdded} | ${diff.summary.entitiesRemoved} | ${diff.summary.entitiesModified} | ${diff.summary.entitiesUnchanged} |\n`;
  md += `| Relationships | ${diff.summary.relsAdded} | ${diff.summary.relsRemoved} | ${diff.summary.relsModified} | — |\n\n`;

  // Metadata changes
  if (diff.metadata.length > 0) {
    md += `## Metadata Changes\n\n`;
    diff.metadata.forEach(c => {
      md += `- **${c.property}:** \`${c.oldValue ?? '(none)'}\` → \`${c.newValue ?? '(none)'}\`\n`;
    });
    md += '\n';
  }

  // Added entities
  if (diff.entities.added.length > 0) {
    md += `## Added Entities\n\n`;
    diff.entities.added.forEach(a => {
      const desc = a.entity.description || a.entity['rdfs:comment'] || '';
      md += `- **${a.id}** — ${desc.substring(0, 100)}\n`;
    });
    md += '\n';
  }

  // Removed entities
  if (diff.entities.removed.length > 0) {
    md += `## Removed Entities\n\n`;
    diff.entities.removed.forEach(r => {
      md += `- ~~${r.id}~~\n`;
    });
    md += '\n';
  }

  // Modified entities
  if (diff.entities.modified.length > 0) {
    md += `## Modified Entities\n\n`;
    diff.entities.modified.forEach(m => {
      md += `### ${m.id}\n\n`;
      m.changes.forEach(c => {
        const oldStr = typeof c.oldValue === 'object' ? JSON.stringify(c.oldValue) : String(c.oldValue ?? '');
        const newStr = typeof c.newValue === 'object' ? JSON.stringify(c.newValue) : String(c.newValue ?? '');
        md += `- **${c.property}:** \`${oldStr.substring(0, 60)}\` → \`${newStr.substring(0, 60)}\`\n`;
      });
      md += '\n';
    });
  }

  // Relationship changes
  if (diff.relationships.added.length > 0) {
    md += `## Added Relationships\n\n`;
    diff.relationships.added.forEach(a => {
      md += `- **${a.id}**\n`;
    });
    md += '\n';
  }

  if (diff.relationships.removed.length > 0) {
    md += `## Removed Relationships\n\n`;
    diff.relationships.removed.forEach(r => {
      md += `- ~~${r.id}~~\n`;
    });
    md += '\n';
  }

  if (diff.relationships.modified.length > 0) {
    md += `## Modified Relationships\n\n`;
    diff.relationships.modified.forEach(m => {
      md += `- **${m.id}:** ${m.changes.map(c => c.property).join(', ')} changed\n`;
    });
    md += '\n';
  }

  return md;
}

// --- Internal helpers ---

function buildEntityMap(entities) {
  const map = new Map();
  for (const e of entities) {
    const id = e['@id'] || e.id || e.name;
    if (id) map.set(id, e);
  }
  return map;
}

function buildRelMap(rels) {
  const map = new Map();
  for (const r of rels) {
    const domain = r.domainIncludes || r.domain || r.sourceEntity || r.source || '';
    const range = r.rangeIncludes || r.range || r.targetEntity || r.target || '';
    const domainStr = Array.isArray(domain) ? domain[0] : String(domain);
    const rangeStr = Array.isArray(range) ? range[0] : String(range);
    const id = r['@id'] || r.id || r.name || `${domainStr}->${rangeStr}`;
    if (id) map.set(id, r);
  }
  return map;
}

function diffProps(oldObj, newObj) {
  const changes = [];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  for (const key of allKeys) {
    if (key.startsWith('_')) continue;
    const oldVal = JSON.stringify(oldObj[key]);
    const newVal = JSON.stringify(newObj[key]);
    if (oldVal !== newVal) {
      changes.push({ property: key, oldValue: oldObj[key], newValue: newObj[key] });
    }
  }
  return changes;
}

function diffMetadata(oldData, newData) {
  const metaKeys = ['version', 'oaa:moduleVersion', 'oaa:schemaVersion', 'name', 'description', 'oaa:domain'];
  const changes = [];
  for (const key of metaKeys) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes.push({ property: key, oldValue: oldData[key], newValue: newData[key] });
    }
  }
  return changes;
}
