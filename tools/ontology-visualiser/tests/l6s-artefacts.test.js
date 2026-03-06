/**
 * Unit tests for Epic 54: PE-L6S artefacts — skills, ontology upgrades,
 * configs, and worked example.
 *
 * These tests validate the structural integrity of all L6S deliverables
 * without requiring browser/DOM environment.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── Helpers ──────────────────────────────────────────────────────────────────

const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..', '..');
const SKILLS_DIR = resolve(REPO_ROOT, 'azlan-github-workflow/skills');

function readJSON(relPath) {
  const full = resolve(REPO_ROOT, relPath);
  return JSON.parse(readFileSync(full, 'utf-8'));
}

function readSkillMd(skillName) {
  const full = resolve(SKILLS_DIR, skillName, 'SKILL.md');
  return readFileSync(full, 'utf-8');
}

/** Extract YAML frontmatter fields from a SKILL.md */
function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const lines = match[1].split('\n');
  const result = {};
  for (const line of lines) {
    const m = line.match(/^(\w[\w-]*):\s*(.+)$/);
    if (m) result[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return result;
}

// ── 1. L6S Skill SKILL.md Validation ─────────────────────────────────────────

const L6S_SKILLS = [
  { name: 'pfc-voc', output: '01-voc-', sections: 8, gates: 8 },
  { name: 'pfc-procmap', output: '02-procmap-', sections: 8, gates: 8 },
  { name: 'pfc-vsm', output: '03-vsm-', sections: 8, gates: 8 },
  { name: 'pfc-vana', output: '04-vana-', sections: 8, gates: 8 },
  { name: 'pfc-dmaic', output: '05-dmaic-', sections: 8, gates: 8 },
  { name: 'pfc-spc', output: '06-spc-', sections: 6, gates: 6 },
  { name: 'pfc-l6s-pipeline', output: null, sections: 0, gates: 0, headingPattern: /^### Phase \d+/gm, phaseCount: 8 },
  { name: 'pfc-ppm-select', output: '07-selection-', sections: 10, gates: 10 },
];

describe('L6S Skill SKILL.md files', () => {
  for (const skill of L6S_SKILLS) {
    describe(skill.name, () => {
      let md;
      let fm;

      it('file exists', () => {
        const path = resolve(SKILLS_DIR, skill.name, 'SKILL.md');
        expect(existsSync(path)).toBe(true);
        md = readSkillMd(skill.name);
        fm = parseFrontmatter(md);
      });

      it('has valid YAML frontmatter', () => {
        if (!md) md = readSkillMd(skill.name);
        if (!fm) fm = parseFrontmatter(md);
        expect(fm).not.toBeNull();
        expect(fm.name).toBe(skill.name);
        expect(fm['user-invocable']).toBe('true');
        expect(fm.description).toBeTruthy();
        expect(fm['argument-hint']).toBeTruthy();
      });

      it('has allowed-tools field', () => {
        if (!fm) { md = readSkillMd(skill.name); fm = parseFrontmatter(md); }
        expect(fm['allowed-tools']).toBeTruthy();
        expect(fm['allowed-tools']).toContain('Read');
        expect(fm['allowed-tools']).toContain('Write');
      });

      it(`has quality gates or phase headings`, () => {
        if (!md) md = readSkillMd(skill.name);
        if (skill.gates > 0) {
          const gateMatches = md.match(/Quality Gate G\d+/g) || [];
          const uniqueGates = new Set(gateMatches.map(g => g.match(/G(\d+)/)[1]));
          expect(uniqueGates.size).toBeGreaterThanOrEqual(skill.gates);
        } else if (skill.phaseCount) {
          const phases = md.match(skill.headingPattern) || [];
          expect(phases.length).toBeGreaterThanOrEqual(skill.phaseCount);
        }
      });

      it('has section or phase headings', () => {
        if (!md) md = readSkillMd(skill.name);
        if (skill.sections > 0) {
          const sectionHeadings = md.match(/^### Section \d+/gm) || [];
          expect(sectionHeadings.length).toBeGreaterThanOrEqual(skill.sections);
        } else if (skill.phaseCount) {
          const phases = md.match(skill.headingPattern) || [];
          expect(phases.length).toBeGreaterThanOrEqual(skill.phaseCount);
        }
      });

      it('references ontology namespaces', () => {
        if (!md) md = readSkillMd(skill.name);
        // Every L6S skill should reference at least one namespace prefix
        const hasNamespace = /\w+:\w+/.test(md);
        expect(hasNamespace).toBe(true);
      });

      if (skill.output) {
        it(`references output path pattern ${skill.output}`, () => {
          if (!md) md = readSkillMd(skill.name);
          expect(md).toContain(skill.output);
        });
      }
    });
  }
});

// ── 2. DMAIC-ONT v2.0.0 Backward Compatibility ──────────────────────────────

describe('DMAIC-ONT v2.0.0', () => {
  let ont;

  it('file exists and parses as JSON', () => {
    ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/DMAIC-ONT/dmaic-v2.0.0-oaa-v7.json');
    expect(ont).toBeTruthy();
  });

  it('declares moduleVersion 2.0.0', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/DMAIC-ONT/dmaic-v2.0.0-oaa-v7.json');
    expect(ont['oaa:moduleVersion']).toBe('2.0.0');
  });

  it('has @context with voc and procmap namespaces', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/DMAIC-ONT/dmaic-v2.0.0-oaa-v7.json');
    expect(ont['@context'].voc).toBe('https://oaa-ontology.org/v6/voice-of-customer/');
    expect(ont['@context'].procmap).toBe('https://oaa-ontology.org/v6/process-mapping/');
  });

  it('imports VOC-ONT v1.0.0', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/DMAIC-ONT/dmaic-v2.0.0-oaa-v7.json');
    const vocImport = ont['oaa:imports'].find(i => i.ontology === 'VOC-ONT' || i.name === 'VOC-ONT');
    expect(vocImport).toBeTruthy();
    expect(vocImport.version).toBe('1.0.0');
    expect(vocImport.importedEntities).toContain('voc:CTQSpecification');
  });

  it('imports PROCMAP-ONT v1.0.0', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/DMAIC-ONT/dmaic-v2.0.0-oaa-v7.json');
    const procmapImport = ont['oaa:imports'].find(i => i.ontology === 'PROCMAP-ONT' || i.name === 'PROCMAP-ONT');
    expect(procmapImport).toBeTruthy();
    expect(procmapImport.version).toBe('1.0.0');
    expect(procmapImport.importedEntities).toContain('procmap:SIPOC');
  });

  it('deprecates dmaic:SIPOC with replacedBy procmap:SIPOC', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/DMAIC-ONT/dmaic-v2.0.0-oaa-v7.json');
    const sipoc = ont.entities.find(e => e['@id'] === 'dmaic:SIPOC');
    expect(sipoc).toBeTruthy();
    expect(sipoc['oaa:deprecated']).toBe(true);
    expect(sipoc['oaa:deprecatedInVersion']).toBe('2.0.0');
    expect(sipoc['oaa:replacedBy']).toBe('procmap:SIPOC');
  });

  it('deprecates dmaic:CriticalToQuality with replacedBy voc:CTQSpecification', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/DMAIC-ONT/dmaic-v2.0.0-oaa-v7.json');
    const ctq = ont.entities.find(e => e['@id'] === 'dmaic:CriticalToQuality');
    expect(ctq).toBeTruthy();
    expect(ctq['oaa:deprecated']).toBe(true);
    expect(ctq['oaa:deprecatedInVersion']).toBe('2.0.0');
    expect(ctq['oaa:replacedBy']).toBe('voc:CTQSpecification');
  });

  it('has v2.0.0 join patterns (JP-D-004 through JP-D-007)', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/DMAIC-ONT/dmaic-v2.0.0-oaa-v7.json');
    const joinPatterns = ont['oaa:joinPatterns'];
    expect(joinPatterns).toBeTruthy();
    const v2Patterns = joinPatterns.filter(jp => jp.patternId && jp.patternId.match(/JP-D-00[4-7]/));
    expect(v2Patterns.length).toBe(4);
    // SIPOC import bridge
    expect(v2Patterns.find(jp => jp.patternId === 'JP-D-004').joinPath).toContain('procmap:SIPOC');
    // CTQ import bridge
    expect(v2Patterns.find(jp => jp.patternId === 'JP-D-005').joinPath).toContain('voc:CTQSpecification');
  });

  it('retains all original entities (non-breaking upgrade)', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/DMAIC-ONT/dmaic-v2.0.0-oaa-v7.json');
    const entityIds = ont.entities.map(e => e['@id']);
    expect(entityIds).toContain('dmaic:SixSigmaProject');
    expect(entityIds).toContain('dmaic:MeasurementSystem');
    expect(entityIds).toContain('dmaic:ProcessCapability');
    expect(entityIds).toContain('dmaic:RootCauseAnalysis');
    expect(entityIds).toContain('dmaic:Experiment');
    // Deprecated but still present
    expect(entityIds).toContain('dmaic:SIPOC');
    expect(entityIds).toContain('dmaic:CriticalToQuality');
  });
});

// ── 3. K-DMAIC-ONT v2.0.0 Backward Compatibility ────────────────────────────

describe('K-DMAIC-ONT v2.0.0', () => {
  let ont;

  it('file exists and parses as JSON', () => {
    ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/K-DMAIC-ONT/kaizen-dmaic-v2.0.0-oaa-v7.json');
    expect(ont).toBeTruthy();
  });

  it('declares moduleVersion 2.0.0', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/K-DMAIC-ONT/kaizen-dmaic-v2.0.0-oaa-v7.json');
    expect(ont['oaa:moduleVersion']).toBe('2.0.0');
  });

  it('has @context with vsm and vana namespaces', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/K-DMAIC-ONT/kaizen-dmaic-v2.0.0-oaa-v7.json');
    expect(ont['@context'].vsm).toBe('https://oaa-ontology.org/v6/value-stream-mapping/');
    expect(ont['@context'].vana).toBe('https://oaa-ontology.org/v6/value-add-analysis/');
  });

  it('imports VSM-ONT v1.0.0', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/K-DMAIC-ONT/kaizen-dmaic-v2.0.0-oaa-v7.json');
    const vsmImport = ont['oaa:imports'].find(i => i.ontology === 'VSM-ONT' || i.name === 'VSM-ONT');
    expect(vsmImport).toBeTruthy();
    expect(vsmImport.version).toBe('1.0.0');
    expect(vsmImport.importedEntities).toContain('vsm:ValueStreamMap');
  });

  it('imports VANA-ONT v1.0.0', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/K-DMAIC-ONT/kaizen-dmaic-v2.0.0-oaa-v7.json');
    const vanaImport = ont['oaa:imports'].find(i => i.ontology === 'VANA-ONT' || i.name === 'VANA-ONT');
    expect(vanaImport).toBeTruthy();
    expect(vanaImport.version).toBe('1.0.0');
    expect(vanaImport.importedEntities).toContain('vana:WasteCategory');
  });

  it('deprecates kdmaic:WasteCategory with replacedBy vana:WasteCategory', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/K-DMAIC-ONT/kaizen-dmaic-v2.0.0-oaa-v7.json');
    const waste = ont.entities.find(e => e['@id'] === 'kdmaic:WasteCategory');
    expect(waste).toBeTruthy();
    expect(waste['oaa:deprecated']).toBe(true);
    expect(waste['oaa:deprecatedInVersion']).toBe('2.0.0');
    expect(waste['oaa:replacedBy']).toBe('vana:WasteCategory');
  });

  it('deprecates kdmaic:ValueStreamMap with replacedBy vsm:ValueStreamMap', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/K-DMAIC-ONT/kaizen-dmaic-v2.0.0-oaa-v7.json');
    const vsm = ont.entities.find(e => e['@id'] === 'kdmaic:ValueStreamMap');
    expect(vsm).toBeTruthy();
    expect(vsm['oaa:deprecated']).toBe(true);
    expect(vsm['oaa:deprecatedInVersion']).toBe('2.0.0');
    expect(vsm['oaa:replacedBy']).toBe('vsm:ValueStreamMap');
  });

  it('retains all original entities (non-breaking upgrade)', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/K-DMAIC-ONT/kaizen-dmaic-v2.0.0-oaa-v7.json');
    const entityIds = ont.entities.map(e => e['@id']);
    expect(entityIds).toContain('kdmaic:KaizenEvent');
    // Deprecated but still present
    expect(entityIds).toContain('kdmaic:WasteCategory');
    expect(entityIds).toContain('kdmaic:ValueStreamMap');
  });
});

// ── 4. PPM-ONT v5.0.0 Three Voices ──────────────────────────────────────────

describe('PPM-ONT v5.0.0 Three Voices', () => {
  let ont;

  it('file exists and parses as JSON', () => {
    ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    expect(ont).toBeTruthy();
  });

  it('declares moduleVersion 5.0.0', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    expect(ont['oaa:moduleVersion']).toBe('5.0.0');
  });

  it('has @context with L6S namespaces (voc, vsm, vana, dmaic)', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    expect(ont['@context'].voc).toBeTruthy();
    expect(ont['@context'].vsm).toBeTruthy();
    expect(ont['@context'].vana).toBeTruthy();
    expect(ont['@context'].dmaic).toBeTruthy();
  });

  it('imports VOC-ONT, VSM-ONT, VANA-ONT, DMAIC-ONT', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    const importNames = ont['oaa:imports'].map(i => i.name || i['@id']);
    expect(importNames).toContain('VOC-ONT');
    expect(importNames).toContain('VSM-ONT');
    expect(importNames).toContain('VANA-ONT');
    expect(importNames).toContain('DMAIC-ONT');
  });

  it('has 6 Three Voices entities', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    const tvEntities = ont.threeVoicesEntities;
    expect(tvEntities).toBeTruthy();
    expect(tvEntities.length).toBe(6);
  });

  it('Three Voices entities have correct IDs', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    const tvIds = ont.threeVoicesEntities.map(e => e['@id']);
    expect(tvIds).toContain('ppm:VoiceOfCustomer');
    expect(tvIds).toContain('ppm:VoiceOfProcess');
    expect(tvIds).toContain('ppm:VoiceOfBusiness');
    expect(tvIds).toContain('ppm:ThreeVoicesScore');
    expect(tvIds).toContain('ppm:PortfolioSelectionCycle');
    expect(tvIds).toContain('ppm:InitiativeCandidate');
  });

  it('all Three Voices entities are addedInVersion 5.0.0', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    for (const entity of ont.threeVoicesEntities) {
      expect(entity['oaa:addedInVersion']).toBe('5.0.0');
    }
  });

  it('ThreeVoicesScore has composite formula properties', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    const score = ont.threeVoicesEntities.find(e => e['@id'] === 'ppm:ThreeVoicesScore');
    const propNames = score['oaa:properties'].map(p => p.name);
    expect(propNames).toContain('vocScore');
    expect(propNames).toContain('vopScore');
    expect(propNames).toContain('vobScore');
    expect(propNames).toContain('compositeScore');
    expect(propNames).toContain('rank');
    expect(propNames).toContain('recommendation');
  });

  it('ThreeVoicesScore recommendation has correct enum values', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    const score = ont.threeVoicesEntities.find(e => e['@id'] === 'ppm:ThreeVoicesScore');
    const recProp = score['oaa:properties'].find(p => p.name === 'recommendation');
    expect(recProp.enum).toEqual(expect.arrayContaining(['invest', 'maintain', 'phase-out', 'defer', 'kill']));
  });

  it('default weights sum to 1.0 (VoB 0.40 + VoC 0.35 + VoP 0.25)', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    const voc = ont.threeVoicesEntities.find(e => e['@id'] === 'ppm:VoiceOfCustomer');
    const vop = ont.threeVoicesEntities.find(e => e['@id'] === 'ppm:VoiceOfProcess');
    const vob = ont.threeVoicesEntities.find(e => e['@id'] === 'ppm:VoiceOfBusiness');
    const vocWeight = voc['oaa:properties'].find(p => p.name === 'vocWeight').default;
    const vopWeight = vop['oaa:properties'].find(p => p.name === 'vopWeight').default;
    const vobWeight = vob['oaa:properties'].find(p => p.name === 'vobWeight').default;
    expect(vocWeight + vopWeight + vobWeight).toBeCloseTo(1.0, 5);
  });

  it('has ≥8 Three Voices business rules', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    expect(ont.threeVoicesBusinessRules).toBeTruthy();
    expect(ont.threeVoicesBusinessRules.length).toBeGreaterThanOrEqual(8);
  });

  it('has ≥8 Three Voices join patterns', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    expect(ont.threeVoicesJoinPatterns).toBeTruthy();
    expect(ont.threeVoicesJoinPatterns.length).toBeGreaterThanOrEqual(8);
  });

  it('retains all original v4.1.0 entities', () => {
    if (!ont) ont = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/PPM-ONT/ppm-module-v5.0.0-oaa-v7.json');
    const entityIds = ont.entities.map(e => e['@id']);
    expect(entityIds).toContain('ppm:Organisation');
    expect(entityIds).toContain('ppm:Portfolio');
    expect(entityIds).toContain('ppm:Programme');
    expect(entityIds).toContain('ppm:Project');
  });
});

// ── 5. L6S Config Files ──────────────────────────────────────────────────────

describe('L6S Agent Roles Config', () => {
  let config;

  it('file exists and parses as JSON', () => {
    config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-agent-roles-v1.0.0.jsonld');
    expect(config).toBeTruthy();
  });

  it('has @type l6s:AgentConfiguration', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-agent-roles-v1.0.0.jsonld');
    expect(config['@type']).toBe('l6s:AgentConfiguration');
  });

  it('defines 3 agent roles', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-agent-roles-v1.0.0.jsonld');
    expect(config['l6s:agentRoles']).toHaveLength(3);
  });

  it('all agents are pe:AIAgent type', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-agent-roles-v1.0.0.jsonld');
    for (const agent of config['l6s:agentRoles']) {
      expect(agent['@type']).toBe('pe:AIAgent');
    }
  });

  it('L6S Facilitator has orchestration type and supervised autonomy', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-agent-roles-v1.0.0.jsonld');
    const facilitator = config['l6s:agentRoles'].find(a => a['pe:agentName'] === 'L6S Facilitator');
    expect(facilitator['pe:agentType']).toBe('orchestration');
    expect(facilitator['pe:autonomyLevel']).toBe('supervised');
  });

  it('Process Analyst covers 4 analysis skills', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-agent-roles-v1.0.0.jsonld');
    const analyst = config['l6s:agentRoles'].find(a => a['pe:agentName'] === 'Process Analyst');
    expect(analyst['pe:skillsProvided']).toEqual(
      expect.arrayContaining(['pfc-voc', 'pfc-procmap', 'pfc-vsm', 'pfc-vana'])
    );
  });

  it('SPC Monitor is highly-autonomous', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-agent-roles-v1.0.0.jsonld');
    const spc = config['l6s:agentRoles'].find(a => a['pe:agentName'] === 'SPC Monitor');
    expect(spc['pe:autonomyLevel']).toBe('highly-autonomous');
  });

  it('total human checkpoints across all agents = 9', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-agent-roles-v1.0.0.jsonld');
    const total = config['l6s:agentRoles'].reduce(
      (sum, agent) => sum + (agent['l6s:humanCheckpoints']?.length || 0), 0
    );
    expect(total).toBe(9);
  });

  it('has escalation policy with chain', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-agent-roles-v1.0.0.jsonld');
    const policy = config['l6s:checkpointEscalationPolicy'];
    expect(policy).toBeTruthy();
    expect(policy.timeoutMinutes).toBe(60);
    expect(policy.escalationChain).toHaveLength(3);
  });
});

describe('L6S Bridge Config', () => {
  let config;

  it('file exists and parses as JSON', () => {
    config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-bridge-config-v1.0.0.jsonld');
    expect(config).toBeTruthy();
  });

  it('has @type l6s:BridgeConfiguration', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-bridge-config-v1.0.0.jsonld');
    expect(config['@type']).toBe('l6s:BridgeConfiguration');
  });

  it('has 5 entry points', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-bridge-config-v1.0.0.jsonld');
    expect(config['l6s:entryPoints'].bridges).toHaveLength(5);
  });

  it('has 4 exit points', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-bridge-config-v1.0.0.jsonld');
    expect(config['l6s:exitPoints'].bridges).toHaveLength(4);
  });

  it('all bridges have bridgeId, name, from, to, trigger fields', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-bridge-config-v1.0.0.jsonld');
    const allBridges = [
      ...config['l6s:entryPoints'].bridges,
      ...config['l6s:exitPoints'].bridges,
    ];
    for (const bridge of allBridges) {
      expect(bridge.bridgeId).toBeTruthy();
      expect(bridge.name).toBeTruthy();
      expect(bridge.from).toBeTruthy();
      expect(bridge.to).toBeTruthy();
      expect(bridge.trigger).toBeTruthy();
    }
  });

  it('entry points include VE and DELTA bridges', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-bridge-config-v1.0.0.jsonld');
    const entryIds = config['l6s:entryPoints'].bridges.map(b => b.bridgeId);
    const hasVE = entryIds.some(id => id.startsWith('VE-'));
    const hasDELTA = entryIds.some(id => id.startsWith('DELTA-'));
    expect(hasVE).toBe(true);
    expect(hasDELTA).toBe(true);
  });

  it('exit points include L6S-PPM bridge for Three Voices', () => {
    if (!config) config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-bridge-config-v1.0.0.jsonld');
    const ppmExit = config['l6s:exitPoints'].bridges.find(b => b.bridgeId === 'L6S-PPM-EXIT-001');
    expect(ppmExit).toBeTruthy();
    expect(ppmExit.to).toContain('VoiceOfProcess');
  });
});

// ── 6. W4M-WWG Worked Example ────────────────────────────────────────────────

describe('W4M-WWG Worked Example (Pipeline Summary)', () => {
  let pipeline;

  it('file exists and parses as JSON', () => {
    pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    expect(pipeline).toBeTruthy();
  });

  it('has @type l6s:PipelineSummary', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    expect(pipeline['@type']).toBe('l6s:PipelineSummary');
  });

  it('has pipelineId and instance', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    expect(pipeline['l6s:pipelineId']).toBeTruthy();
    expect(pipeline['l6s:instance']).toBe('pfi-wwg');
  });

  it('VoC summary has required metrics', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const voc = pipeline['l6s:vocSummary'];
    expect(voc).toBeTruthy();
    expect(voc['l6s:phase']).toBe(1);
    expect(voc['l6s:metrics'].vocRecords).toBeGreaterThan(0);
    expect(voc['l6s:metrics'].ctqSpecifications).toBeGreaterThan(0);
    expect(voc['l6s:topNeeds'].length).toBeGreaterThanOrEqual(3);
    expect(voc['l6s:ctqHighlights'].length).toBeGreaterThanOrEqual(3);
  });

  it('PROCMAP summary has SIPOC and handoffs', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const procmap = pipeline['l6s:procmapSummary'];
    expect(procmap).toBeTruthy();
    expect(procmap['l6s:phase']).toBe(2);
    expect(procmap['l6s:sipoc']).toBeTruthy();
    expect(procmap['l6s:sipoc'].suppliers.length).toBeGreaterThan(0);
    expect(procmap['l6s:sipoc'].customers.length).toBeGreaterThan(0);
    expect(procmap['l6s:metrics'].sipocComplete).toBe(true);
    expect(procmap['l6s:highRiskHandoffs'].length).toBeGreaterThanOrEqual(3);
  });

  it('VSM summary has timeline metrics', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const vsm = pipeline['l6s:vsmSummary'];
    expect(vsm).toBeTruthy();
    expect(vsm['l6s:phase']).toBe(3);
    expect(vsm['l6s:metrics'].valueAddedRatio).toBeGreaterThan(0);
    expect(vsm['l6s:metrics'].valueAddedRatio).toBeLessThan(1);
    expect(vsm['l6s:metrics'].bottleneckStep).toBeTruthy();
    expect(vsm['l6s:kaizenBursts'].length).toBeGreaterThanOrEqual(3);
  });

  it('VANA summary has VA/NVA/BNVA and COPQ', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const vana = pipeline['l6s:vanaSummary'];
    expect(vana).toBeTruthy();
    expect(vana['l6s:phase']).toBe(4);
    const m = vana['l6s:metrics'];
    // VA + NVA + BNVA percent by count should sum to ~100 (rounding tolerance ±2)
    const countSum = m.vaPercentByCount + m.nvaPercentByCount + m.bnvaPercentByCount;
    expect(countSum).toBeGreaterThanOrEqual(98);
    expect(countSum).toBeLessThanOrEqual(102);
    // VA + NVA + BNVA percent by time should sum to 100
    expect(m.vaPercentByTime + m.nvaPercentByTime + m.bnvaPercentByTime).toBe(100);
    expect(m.copqTotal).toBeGreaterThan(0);
    expect(vana['l6s:topWastes'].length).toBeGreaterThanOrEqual(3);
    expect(vana['l6s:copqBreakdown']).toBeTruthy();
    expect(vana['l6s:improvementOpportunities'].length).toBeGreaterThanOrEqual(3);
  });

  it('COPQ breakdown sums to total', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const vana = pipeline['l6s:vanaSummary'];
    const copq = vana['l6s:copqBreakdown'];
    const sum = copq.internalFailure + copq.externalFailure + copq.appraisal + copq.prevention;
    expect(sum).toBe(vana['l6s:metrics'].copqTotal);
  });

  it('Three Voices summary has ranked initiatives', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const tv = pipeline['l6s:threeVoicesSummary'];
    expect(tv).toBeTruthy();
    expect(tv['l6s:rankings'].length).toBeGreaterThanOrEqual(4);
    // Rankings should be in descending composite score order
    for (let i = 1; i < tv['l6s:rankings'].length; i++) {
      expect(tv['l6s:rankings'][i - 1].compositeScore)
        .toBeGreaterThanOrEqual(tv['l6s:rankings'][i].compositeScore);
    }
  });

  it('Three Voices weights sum to 1.0', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const tv = pipeline['l6s:threeVoicesSummary'];
    const m = tv['l6s:metrics'];
    expect(m.vocWeight + m.vopWeight + m.vobWeight).toBeCloseTo(1.0, 5);
  });

  it('overall results has key findings and next actions', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const results = pipeline['l6s:overallResults'];
    expect(results).toBeTruthy();
    expect(results.keyFindings.length).toBeGreaterThanOrEqual(5);
    expect(results.nextActions.length).toBeGreaterThanOrEqual(3);
    expect(results.pipelineStatus).toContain('COMPLETE');
  });

  it('improvement opportunities have valid quadrant values', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const opps = pipeline['l6s:vanaSummary']['l6s:improvementOpportunities'];
    const validQuadrants = ['quick-win', 'major-project', 'fill-in', 'thankless'];
    for (const opp of opps) {
      expect(validQuadrants).toContain(opp.quadrant);
    }
  });

  it('improvement opportunities have valid method values', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const opps = pipeline['l6s:vanaSummary']['l6s:improvementOpportunities'];
    const validMethods = ['kaizen', 'dmaic', 'just-do-it', 'deprioritise'];
    for (const opp of opps) {
      expect(validMethods).toContain(opp.method);
    }
  });

  it('VoC top needs have required fields', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const needs = pipeline['l6s:vocSummary']['l6s:topNeeds'];
    for (const need of needs) {
      expect(need.need).toBeTruthy();
      expect(need.priority).toBeTruthy();
      expect(typeof need.gapScore).toBe('number');
      expect(need.kanoCategory).toBeTruthy();
    }
  });

  it('CTQ highlights have target, current, and gap', () => {
    if (!pipeline) pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const ctqs = pipeline['l6s:vocSummary']['l6s:ctqHighlights'];
    for (const ctq of ctqs) {
      expect(typeof ctq.target).toBe('number');
      expect(typeof ctq.current).toBe('number');
      expect(typeof ctq.gap).toBe('number');
      expect(ctq.gap).toBe(Math.abs(ctq.current - ctq.target));
    }
  });
});

// ── 7. Cross-Reference Integrity ─────────────────────────────────────────────

describe('L6S Cross-Reference Integrity', () => {
  it('all skill output files referenced in pipeline summary exist as skill output patterns', () => {
    const pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const outputFiles = [
      pipeline['l6s:vocSummary']['l6s:output'],
      pipeline['l6s:procmapSummary']['l6s:output'],
      pipeline['l6s:vsmSummary']['l6s:output'],
      pipeline['l6s:vanaSummary']['l6s:output'],
    ];
    // Each should match the pattern from the corresponding skill
    expect(outputFiles[0]).toMatch(/^01-voc-/);
    expect(outputFiles[1]).toMatch(/^02-procmap-/);
    expect(outputFiles[2]).toMatch(/^03-vsm-/);
    expect(outputFiles[3]).toMatch(/^04-vana-/);
  });

  it('pipeline skill references match L6S skill names', () => {
    const pipeline = readJSON('PBS/PFI-WWG/l6s-output/00-pipeline-wwg-cycle1.jsonld');
    const skillNames = [
      pipeline['l6s:vocSummary']['l6s:skill'],
      pipeline['l6s:procmapSummary']['l6s:skill'],
      pipeline['l6s:vsmSummary']['l6s:skill'],
      pipeline['l6s:vanaSummary']['l6s:skill'],
    ];
    expect(skillNames).toEqual(['pfc-voc', 'pfc-procmap', 'pfc-vsm', 'pfc-vana']);
  });

  it('bridge config entry/exit skills match actual skill names', () => {
    const config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-bridge-config-v1.0.0.jsonld');
    const validSkills = new Set([
      'pfc-voc', 'pfc-procmap', 'pfc-vsm', 'pfc-vana',
      'pfc-dmaic', 'pfc-spc', 'pfc-l6s-pipeline', 'pfc-ppm-select',
      'pfc-vp', 'pfc-kano', 'pfc-kpi', 'pfc-delta-evaluate', 'pfc-delta-adapt',
      'pfc-delta-narrate',
    ]);
    const allBridges = [
      ...config['l6s:entryPoints'].bridges,
      ...config['l6s:exitPoints'].bridges,
    ];
    for (const bridge of allBridges) {
      if (bridge.toSkill) {
        // toSkill may have flags like "--mode update", just check the base name
        const base = bridge.toSkill.split(' ')[0];
        expect(validSkills.has(base)).toBe(true);
      }
      if (bridge.fromSkill) {
        const base = bridge.fromSkill.split(' ')[0];
        expect(validSkills.has(base)).toBe(true);
      }
    }
  });

  it('agent role skills match actual skill directory names', () => {
    const config = readJSON('PBS/ONTOLOGIES/ontology-library/PE-Series/L6S-CONFIG/l6s-agent-roles-v1.0.0.jsonld');
    for (const agent of config['l6s:agentRoles']) {
      for (const skill of agent['pe:skillsProvided']) {
        const skillPath = resolve(SKILLS_DIR, skill, 'SKILL.md');
        expect(existsSync(skillPath)).toBe(true);
      }
    }
  });
});
