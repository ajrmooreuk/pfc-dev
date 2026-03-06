/**
 * migrate-v7.mjs — OAA v6→v7 Migration Tool
 *
 * Upgrades ontology JSON files to v7 by adding:
 *   - oaa:schemaVersion: "7.0.0"
 *   - oaa:ontologyId (derived from registry entry)
 *   - oaa:series (derived from registry layer field)
 *   - competencyQuestions[] (skeleton: 1 CQ per entity)
 *
 * Usage:
 *   node scripts/migrate-v7.mjs                    # dry-run all
 *   node scripts/migrate-v7.mjs --apply            # apply to all
 *   node scripts/migrate-v7.mjs --wave 1           # dry-run Wave 1 only
 *   node scripts/migrate-v7.mjs --wave 1 --apply   # apply Wave 1
 *
 * F21.14 / Epic 21 (#270) / S21.14.2
 */

// ── Helpers (exported for testing) ──

/**
 * Derive ontology ID from registry entry @id.
 * "Entry-ONT-VSOM-001" → "VSOM-ONT"
 * "Entry-ONT-GRC-FW-001" → "GRC-FW-ONT"
 */
export function deriveOntologyIdFromEntry(entryId) {
  const core = entryId.replace(/^Entry-ONT-/, '').replace(/-\d{3}$/, '');
  return `${core}-ONT`;
}

/**
 * Derive series name from registry entry layer field.
 * "STRATEGIC LAYER (VE-Series)" → "VE-Series"
 * "Foundation" → "Foundation"
 */
export function deriveSeriesFromLayer(layer) {
  const match = layer.match(/\(([^)]+)\)/);
  return match ? match[1] : layer;
}

/**
 * Generate skeleton competency questions — 1 per entity.
 */
export function generateSkeletonCQs(data) {
  const entities = data.entities || [];
  const list = Array.isArray(entities) ? entities : Object.values(entities);

  return list.map((ent, i) => {
    const id = ent['@id'] || ent.id || `entity-${i}`;
    const name = ent.name || ent['rdfs:label'] || id.split(':').pop();
    const num = String(i + 1).padStart(3, '0');

    return {
      '@id': `CQ-${num}`,
      question: `What is the role and purpose of ${name} within this ontology?`,
      targetEntities: [id],
      targetRelationships: [],
      targetRules: [],
    };
  });
}

/**
 * Migrate a single ontology JSON object to v7.
 * Non-destructive — preserves existing fields.
 * Attaches _migrationReport for tracking.
 */
export function migrateOntologyToV7(data, registryEntry) {
  const result = { ...data };
  const report = { fieldsAdded: [], cqsGenerated: 0, skipped: [] };

  if (!result['oaa:schemaVersion'] || result['oaa:schemaVersion'] !== '7.0.0') {
    const prev = result['oaa:schemaVersion'];
    result['oaa:schemaVersion'] = '7.0.0';
    report.fieldsAdded.push(prev ? `oaa:schemaVersion (${prev}→7.0.0)` : 'oaa:schemaVersion');
  } else {
    report.skipped.push('oaa:schemaVersion (already 7.0.0)');
  }

  if (!result['oaa:ontologyId']) {
    result['oaa:ontologyId'] = deriveOntologyIdFromEntry(registryEntry['@id']);
    report.fieldsAdded.push('oaa:ontologyId');
  } else {
    report.skipped.push('oaa:ontologyId (already set)');
  }

  if (!result['oaa:series']) {
    result['oaa:series'] = deriveSeriesFromLayer(registryEntry.layer || 'Unknown');
    report.fieldsAdded.push('oaa:series');
  } else {
    report.skipped.push('oaa:series (already set)');
  }

  if (!result.competencyQuestions || result.competencyQuestions.length === 0) {
    const cqs = generateSkeletonCQs(result);
    if (cqs.length > 0) {
      result.competencyQuestions = cqs;
      report.fieldsAdded.push('competencyQuestions');
      report.cqsGenerated = cqs.length;
    }
  } else {
    report.skipped.push('competencyQuestions (already present)');
  }

  result._migrationReport = report;
  return result;
}

// ── CLI ──

const isDirectRun = typeof process !== 'undefined' && process.argv[1] &&
  (process.argv[1].endsWith('migrate-v7.mjs') || process.argv[1].endsWith('migrate-v7'));

if (isDirectRun) {
  const fs = await import('fs');
  const path = await import('path');

  const args = process.argv.slice(2);
  const applyMode = args.includes('--apply');
  const waveIdx = args.indexOf('--wave');
  const waveFilter = waveIdx !== -1 ? parseInt(args[waveIdx + 1], 10) : null;

  const WAVES = {
    1: ['EMC-ONT', 'VSOM-ONT', 'GRC-FW-ONT', 'ORG-CTX-ONT'],
    2: ['OKR-ONT', 'VP-ONT', 'RRR-ONT', 'PMF-ONT', 'EFS-ONT', 'KPI-ONT'],
    3: ['BSC-ONT', 'IND-ONT', 'RSN-ONT', 'MAC-ONT', 'PFL-ONT',
        'NAR-ONT', 'CSC-ONT', 'CUL-ONT', 'VIZ-ONT'],
    4: ['PPM-ONT', 'PE-ONT', 'EA-ONT', 'EA-CORE-ONT', 'EA-TOGAF-ONT',
        'EA-MSFT-ONT', 'DS-ONT', 'CICD-ONT', 'LSC-ONT'],
    5: ['ERM-ONT', 'ALZ-ONT', 'GDPR-ONT', 'PII-ONT', 'NCSC-CAF-ONT',
        'DSPT-ONT', 'RMF-ONT'],
    6: ['ORG-ONT', 'ORG-MAT-ONT', 'CTX-ONT', 'GA-ONT', 'CRT-ONT',
        'ANTIQUES-ONT'],
  };

  let targetOntologies = null;
  if (waveFilter) {
    targetOntologies = new Set(WAVES[waveFilter] || []);
    console.log(`Wave ${waveFilter}: ${[...targetOntologies].join(', ')}`);
  }

  const libDir = path.resolve(import.meta.dirname, '../../../ONTOLOGIES/ontology-library');
  const registryPath = path.join(libDir, 'ont-registry-index.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

  const migrationResults = [];

  for (const indexEntry of registry.entries) {
    if (['deprecated', 'superseded', 'placeholder'].includes(indexEntry.status)) continue;

    const entryPath = path.join(libDir, indexEntry.path);
    if (!fs.existsSync(entryPath)) continue;

    const fullEntry = JSON.parse(fs.readFileSync(entryPath, 'utf-8'));
    if (!fullEntry['@id']) continue;
    const ontId = deriveOntologyIdFromEntry(fullEntry['@id']);

    if (targetOntologies && !targetOntologies.has(ontId)) continue;

    const artRelPath = fullEntry.artifacts?.ontology;
    if (!artRelPath) {
      console.log(`  SKIP ${ontId}: no artifacts.ontology path`);
      continue;
    }

    const artPath = path.resolve(path.dirname(entryPath), artRelPath);
    if (!fs.existsSync(artPath)) {
      console.log(`  SKIP ${ontId}: artifact not found at ${artRelPath}`);
      continue;
    }

    const ontData = JSON.parse(fs.readFileSync(artPath, 'utf-8'));
    const migrated = migrateOntologyToV7(ontData, fullEntry);

    const report = migrated._migrationReport;
    delete migrated._migrationReport;

    migrationResults.push({ ontologyId: ontId, file: artRelPath, ...report });

    if (report.fieldsAdded.length === 0) {
      console.log(`  OK   ${ontId}: already v7 compliant`);
    } else if (applyMode) {
      fs.writeFileSync(artPath, JSON.stringify(migrated, null, 2) + '\n', 'utf-8');
      console.log(`  DONE ${ontId}: +${report.fieldsAdded.join(', ')} (${report.cqsGenerated} CQs)`);
    } else {
      console.log(`  DRY  ${ontId}: would add ${report.fieldsAdded.join(', ')} (${report.cqsGenerated} CQs)`);
    }
  }

  const reportDir = path.join(libDir, 'validation-reports');
  const reportPath = path.join(reportDir, 'migration-report-v7.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    date: new Date().toISOString().split('T')[0],
    mode: applyMode ? 'apply' : 'dry-run',
    wave: waveFilter,
    results: migrationResults,
  }, null, 2) + '\n', 'utf-8');

  console.log(`\nReport: ${reportPath}`);
  console.log(`Total: ${migrationResults.length} ontologies, ${migrationResults.filter(r => r.fieldsAdded.length > 0).length} need migration`);
}
