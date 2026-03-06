import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const SKILLS_DIR = resolve(__dirname, '../../../../azlan-github-workflow/skills');
const INDEX_PATH = join(SKILLS_DIR, 'skills-register-index.json');

function loadJSON(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

describe('Skills Register Index', () => {
  let index;

  it('index file exists and parses as valid JSON', () => {
    expect(existsSync(INDEX_PATH)).toBe(true);
    index = loadJSON(INDEX_PATH);
    expect(index).toBeDefined();
    expect(index['@type']).toBe('SkillsRegisterIndex');
  });

  it('has required top-level fields', () => {
    index = loadJSON(INDEX_PATH);
    expect(index.version).toBeDefined();
    expect(index.entries).toBeInstanceOf(Array);
    expect(index.totalEntries).toBe(index.entries.length);
    expect(index.summary).toBeDefined();
  });

  it('summary counts match entry classifications', () => {
    index = loadJSON(INDEX_PATH);
    const counts = {};
    for (const entry of index.entries) {
      counts[entry.classification] = (counts[entry.classification] || 0) + 1;
    }
    for (const [classification, count] of Object.entries(index.summary)) {
      expect(counts[classification] || 0).toBe(count);
    }
  });

  it('no duplicate entryId values', () => {
    index = loadJSON(INDEX_PATH);
    const ids = index.entries.map(e => e.entryId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('no duplicate skillName values', () => {
    index = loadJSON(INDEX_PATH);
    const names = index.entries.map(e => e.skillName);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('all entries have required fields', () => {
    index = loadJSON(INDEX_PATH);
    const requiredFields = ['entryId', 'skillName', 'displayName', 'classification', 'version', 'status', 'category', 'filePath', 'invocation'];
    for (const entry of index.entries) {
      for (const field of requiredFields) {
        expect(entry[field], `${entry.entryId || entry.skillName} missing ${field}`).toBeDefined();
      }
    }
  });

  it('all classification values are valid Dtree types', () => {
    index = loadJSON(INDEX_PATH);
    const validTypes = [
      'SKILL_STANDALONE', 'SKILL_TEMPLATE', 'SKILL_COMPLEX',
      'AGENT_STANDALONE', 'AGENT_ORCHESTRATOR', 'AGENT_FLEET',
      'PLUGIN_LIGHTWEIGHT', 'PLUGIN_INTEGRATION', 'PLUGIN_COMPOSITE',
      'EXTENSION_HOOK', 'EXTENSION_ADAPTER', 'EXTENSION_BRIDGE',
      'MODULE_PASSIVE'
    ];
    for (const entry of index.entries) {
      expect(validTypes).toContain(entry.classification);
    }
  });

  it('all filePath references resolve to real files', () => {
    index = loadJSON(INDEX_PATH);
    const repoRoot = resolve(SKILLS_DIR, '../..');
    for (const entry of index.entries) {
      const fullPath = join(repoRoot, entry.filePath);
      expect(existsSync(fullPath), `${entry.entryId}: ${entry.filePath} does not exist`).toBe(true);
    }
  });

  it('all invocation paths follow the expected pattern', () => {
    index = loadJSON(INDEX_PATH);
    for (const entry of index.entries) {
      expect(entry.invocation).toMatch(/^\/azlan-github-workflow:/);
      expect(entry.invocation).toContain(entry.skillName);
    }
  });

  it('entries are ordered by entryId', () => {
    index = loadJSON(INDEX_PATH);
    // Group by prefix (SKL vs PLG) and check each group is sorted
    const sklEntries = index.entries.filter(e => e.entryId.startsWith('Entry-SKL-'));
    const sklIds = sklEntries.map(e => parseInt(e.entryId.replace('Entry-SKL-', ''), 10));
    for (let i = 1; i < sklIds.length; i++) {
      expect(sklIds[i]).toBeGreaterThan(sklIds[i - 1]);
    }
  });
});

describe('Individual Registry Entries', () => {
  let index;

  it('each registry entry file parses as valid JSON-LD', () => {
    index = loadJSON(INDEX_PATH);
    const repoRoot = resolve(SKILLS_DIR, '../..');
    for (const entry of index.entries) {
      const fullPath = join(repoRoot, entry.filePath);
      if (!existsSync(fullPath)) continue;
      const data = loadJSON(fullPath);
      expect(data['@context'], `${entry.entryId} missing @context`).toBeDefined();
      expect(data['@type'], `${entry.entryId} missing @type`).toBe('UniRegistryEntry');
      expect(data['@id'], `${entry.entryId} missing @id`).toBeDefined();
    }
  });

  it('index entry matches individual file metadata', () => {
    index = loadJSON(INDEX_PATH);
    const repoRoot = resolve(SKILLS_DIR, '../..');
    for (const entry of index.entries) {
      const fullPath = join(repoRoot, entry.filePath);
      if (!existsSync(fullPath)) continue;
      const data = loadJSON(fullPath);
      const meta = data.registryMetadata;
      expect(meta.entryId, `${entry.entryId} entryId mismatch`).toBe(entry.entryId);
      expect(meta.version, `${entry.entryId} version mismatch`).toBe(entry.version);
      expect(data.artifactDefinition.skillType, `${entry.entryId} classification mismatch`).toBe(entry.classification);
    }
  });

  it('every registry entry has artifactDefinition with skillType', () => {
    index = loadJSON(INDEX_PATH);
    const repoRoot = resolve(SKILLS_DIR, '../..');
    for (const entry of index.entries) {
      const fullPath = join(repoRoot, entry.filePath);
      if (!existsSync(fullPath)) continue;
      const data = loadJSON(fullPath);
      expect(data.artifactDefinition, `${entry.entryId} missing artifactDefinition`).toBeDefined();
      expect(data.artifactDefinition.skillType, `${entry.entryId} missing skillType`).toBeDefined();
    }
  });

  it('every registry entry has a source SKILL.md that exists', () => {
    index = loadJSON(INDEX_PATH);
    const repoRoot = resolve(SKILLS_DIR, '../..');
    for (const entry of index.entries) {
      const fullPath = join(repoRoot, entry.filePath);
      if (!existsSync(fullPath)) continue;
      const data = loadJSON(fullPath);
      const source = data.artifactDefinition.source;
      if (source) {
        const sourcePath = join(repoRoot, source);
        expect(existsSync(sourcePath), `${entry.entryId}: source ${source} does not exist`).toBe(true);
      }
    }
  });
});
