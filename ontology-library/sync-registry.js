#!/usr/bin/env node
/**
 * sync-registry.js — Recalculate ont-registry-index.json metadata from entries.
 *
 * Keeps version, statistics, lastUpdated, namespaceRegistry, and validationSummary
 * in sync with the actual entries array. Run after adding/removing ontologies.
 *
 * Usage:
 *   node sync-registry.js                  # recalculate stats, bump patch version
 *   node sync-registry.js --minor          # bump minor version
 *   node sync-registry.js --major          # bump major version
 *   node sync-registry.js --dry-run        # show changes without writing
 *   node sync-registry.js --check          # exit 1 if metadata is stale (CI mode)
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.resolve(__dirname, 'ont-registry-index.json');

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const checkOnly = args.includes('--check');
  const bumpType = args.includes('--major') ? 'major'
                 : args.includes('--minor') ? 'minor' : 'patch';

  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const registry = JSON.parse(raw);
  const entries = registry.entries || [];

  // --- Recalculate statistics ---
  const newStats = {
    totalOntologies: entries.length,
    compliant: 0,
    nearCompliance: 0,
    partialCompliance: 0,
    pendingReview: 0,
    placeholder: 0,
    deprecated: 0
  };

  for (const entry of entries) {
    const s = (entry.status || '').toLowerCase();
    if (s === 'compliant') newStats.compliant++;
    else if (s === 'near-compliance') newStats.nearCompliance++;
    else if (s === 'partial-compliance') newStats.partialCompliance++;
    else if (s === 'pending-review' || s === 'pending') newStats.pendingReview++;
    else if (s === 'placeholder') newStats.placeholder++;
    else if (s === 'deprecated') newStats.deprecated++;
  }

  // --- Rebuild namespaceRegistry ---
  const newNamespaceRegistry = {};
  for (const entry of entries) {
    if (entry.namespace) {
      const prefix = entry.namespace.replace(/:$/, '');
      // Preserve existing URI if present; otherwise generate a default
      newNamespaceRegistry[prefix] =
        (registry.namespaceRegistry && registry.namespaceRegistry[prefix]) ||
        'https://platformcore.io/ontology/' + prefix + '/';
    }
  }

  // --- Rebuild validationSummary ---
  const validated = entries.filter(e => e.status === 'compliant' && e.validatedDate);
  const deprecated = entries.filter(e => e.status === 'deprecated');
  const placeholders = entries.filter(e => e.status === 'placeholder');

  function shortName(entry) {
    const match = (entry['@id'] || '').match(/Entry-ONT-([A-Z0-9-]+)-\d+/i);
    return match ? match[1] : (entry.name || 'UNKNOWN').split(/\s/)[0];
  }

  const today = new Date().toISOString().split('T')[0];
  const newValidationSummary = {
    validated: validated.length,
    validatedOntologies: validated.map(shortName),
    deprecatedOntologies: deprecated.map(shortName),
    placeholders: placeholders.map(shortName),
    oaaVersion: registry.oaaVersion || '6.1.0',
    oaaVersionNotes: (registry.validationSummary && registry.validationSummary.oaaVersionNotes) || '',
    lastFullValidation: today
  };

  // --- Bump version ---
  const oldVersion = registry.version || '0.0.0';
  const parts = oldVersion.split('.').map(Number);
  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;

  let newVersion;
  if (bumpType === 'major') newVersion = (major + 1) + '.0.0';
  else if (bumpType === 'minor') newVersion = major + '.' + (minor + 1) + '.0';
  else newVersion = major + '.' + minor + '.' + (patch + 1);

  // --- Detect changes ---
  const changes = [];

  if (JSON.stringify(registry.statistics) !== JSON.stringify(newStats)) {
    changes.push('statistics: ' + JSON.stringify(registry.statistics) + ' -> ' + JSON.stringify(newStats));
  }
  if (registry.lastUpdated !== today) {
    changes.push('lastUpdated: ' + registry.lastUpdated + ' -> ' + today);
  }
  if (JSON.stringify(registry.namespaceRegistry) !== JSON.stringify(newNamespaceRegistry)) {
    changes.push('namespaceRegistry: entries updated');
  }
  if (JSON.stringify(registry.validationSummary) !== JSON.stringify(newValidationSummary)) {
    changes.push('validationSummary: recalculated');
  }

  // Version is always bumped if other changes exist
  if (changes.length > 0) {
    changes.unshift('version: ' + registry.version + ' -> ' + newVersion);
  }

  if (changes.length === 0) {
    console.log('Registry metadata is already in sync. No changes needed.');
    process.exit(0);
  }

  console.log('Changes detected:');
  changes.forEach(function(c) { console.log('  - ' + c); });

  if (checkOnly) {
    console.error('\nRegistry metadata is stale. Run `node sync-registry.js` to update.');
    process.exit(1);
  }

  if (dryRun) {
    console.log('\n--dry-run mode: no files modified.');
    process.exit(0);
  }

  // --- Apply ---
  registry.version = newVersion;
  registry.lastUpdated = today;
  registry.statistics = newStats;
  registry.namespaceRegistry = newNamespaceRegistry;
  registry.validationSummary = newValidationSummary;

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  console.log('\nRegistry updated to v' + newVersion + ' (' + today + ').');
}

main();
