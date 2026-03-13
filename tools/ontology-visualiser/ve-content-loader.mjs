#!/usr/bin/env node
/**
 * ve-content-loader.mjs — Load VE Skill Chain instance data for slide deck generation.
 *
 * Reads VSOM, VP, RRR, KPI/BSC, Kano JSONLD instance files for a given PFI brand
 * and returns a structured content object the slide builders consume.
 *
 * Supports partial chains — missing data gracefully results in empty arrays,
 * allowing decks to skip sections where data doesn't exist yet.
 *
 * @module ve-content-loader
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ONT_LIB = join(
  new URL('.', import.meta.url).pathname,
  '../../ONTOLOGIES/ontology-library'
);

/**
 * Instance data file locations by brand.
 * Each key maps to { vsom, vp, rrr, kpi, kano } paths relative to ONT_LIB.
 * null = not yet available for this brand.
 */
const BRAND_DATA = {
  baiv: {
    vsom: 'VE-Series/VSOM-ONT/instance-data/baiv/04-vsom-baiv.jsonld',
    vp:   null,
    rrr:  null,
    kpi:  null,
    kano: null
  },
  airl: {
    vsom: 'VE-Series/VSOM-ONT/instance-data/airl/04-vsom-airl.jsonld',
    vp:   'VE-Series/VP-ONT/instance-data/vp-airl-instance-v1.0.0.jsonld',
    rrr:  null,
    kpi:  null,
    kano: null
  },
  wwg: {
    vsom: 'VE-Series/VSOM-ONT/instance-data/wwg/04-vsom-wwg.jsonld',
    vp:   'VE-Series/VP-ONT/instance-data/vp-wwg-instance-v1.0.0.jsonld',
    rrr:  'VE-Series/RRR-ONT/instance-data/rrr-wwg-instance-v1.0.0.jsonld',
    kpi:  'VE-Series/KPI-ONT/instance-data/wwg/wwg-kpi-bsc-instance-v1.0.0.jsonld',
    kano: 'VE-Series/VSOM-SA/KANO-ONT/instance-data/kano-wwg-instance-v1.0.0.json'
  },
  rcs: {
    vsom: null,
    vp:   'VE-Series/VP-ONT/instance-data/vp-rcs-instance-v1.0.0.jsonld',
    rrr:  null,
    kpi:  null,
    kano: null
  },
  vhf: {
    vsom: null,
    vp:   'VE-Series/VP-ONT/instance-data/vhf/vhf-vp-instances-v1.0.0.jsonld',
    rrr:  'VE-Series/RRR-ONT/instance-data/vhf/vhf-rrr-instances-v1.0.0.jsonld',
    kpi:  null,
    kano: null
  },
  antq: {
    vsom: null,
    vp:   'VE-Series/VP-ONT/instance-data/vp-antq-instance-v1.0.0.jsonld',
    rrr:  null,
    kpi:  null,
    kano: null
  }
};

/** Safely read and parse a JSON file, return null if missing. */
function loadJSON(relPath) {
  if (!relPath) return null;
  const full = join(ONT_LIB, relPath);
  if (!existsSync(full)) return null;
  return JSON.parse(readFileSync(full, 'utf8'));
}

/** Get entities from @graph or entities array. */
function getEntities(data) {
  if (!data) return [];
  if (data['@graph']) return data['@graph'];
  if (data.entities) return data.entities;
  if (data.examples) return data.examples;
  return [];
}

// ========================================
// VSOM EXTRACTION
// ========================================

function extractVSOM(data) {
  if (!data) return null;
  const vision = data['vsom:vision'];
  const strategies = (data['vsom:strategies'] || []).map(s => ({
    name:        s['vsom:strategyName'],
    description: s['vsom:strategyDescription'],
    type:        s['vsom:strategyType'],
    focus:       s['vsom:strategicFocus'],
    horizon:     s['vsom:timeHorizon']
  }));
  const objectives = (data['vsom:objectives'] || []).map(o => ({
    name:        o['vsom:objectiveName'],
    description: o['vsom:objectiveDescription'],
    perspective: o['vsom:bscPerspective'],
    priority:    o['vsom:priority'],
    baseline:    o['vsom:baseline'],
    target:      o['vsom:target']
  }));
  return {
    visionStatement: vision?.['vsom:visionStatement'] || '',
    keyInsight:      vision?.['vsom:keyInsight'] || '',
    strategies,
    objectives
  };
}

// ========================================
// VP EXTRACTION
// ========================================

function extractVP(data) {
  if (!data) return null;
  const entities = getEntities(data);

  const vps = entities.filter(e => {
    const t = e['@type'] || '';
    return t.includes('ValueProposition');
  }).map(v => ({
    name:              v.name || v['vp:name'] || '',
    primaryStatement:  v.primaryStatement || v['vp:primaryStatement'] || '',
    keyBenefits:       Array.isArray(v.keyBenefits) ? v.keyBenefits : Array.isArray(v['vp:keyBenefits']) ? v['vp:keyBenefits'] : [],
    differentiators:   Array.isArray(v.uniqueDifferentiators) ? v.uniqueDifferentiators : Array.isArray(v['vp:uniqueDifferentiators']) ? v['vp:uniqueDifferentiators'] : []
  }));

  const problems = entities.filter(e => {
    const t = e['@type'] || '';
    return t.includes('Problem');
  }).map(p => ({
    statement: p.problemStatement || p['vp:problemStatement'] || '',
    type:      p.problemType || p['vp:problemType'] || '',
    severity:  p.severity || p['vp:severity'] || ''
  }));

  const pains = entities.filter(e => {
    const t = e['@type'] || '';
    return t.includes('PainPoint');
  }).map(p => ({
    description:     p.painDescription || p['vp:painDescription'] || '',
    dimension:       p.painDimension || p['vp:painDimension'] || '',
    quantifiedImpact: p.quantifiedImpact || p['vp:quantifiedImpact'] || ''
  }));

  const solutions = entities.filter(e => {
    const t = e['@type'] || '';
    return t.includes('Solution');
  }).map(s => ({
    name:          s.name || s['vp:name'] || '',
    functionality: s.coreFunctionality || s['vp:coreFunctionality'] || '',
    timeToValue:   s.timeToValue || s['vp:timeToValue'] || ''
  }));

  const benefits = entities.filter(e => {
    const t = e['@type'] || '';
    return t.includes('Benefit');
  }).map(b => ({
    description:   b.benefitDescription || b['vp:benefitDescription'] || '',
    category:      b.benefitCategory || b['vp:benefitCategory'] || '',
    quantified:    b.quantifiedValue || b['vp:quantifiedValue'] || ''
  }));

  const icps = entities.filter(e => {
    const t = e['@type'] || '';
    return t.includes('IdealCustomerProfile');
  }).map(i => ({
    name:        i.name || i['vp:name'] || '',
    industry:    i.industry || i['vp:industry'] || '',
    companySize: i.companySize || i['vp:companySize'] || '',
    keyNeeds:    i.keyNeeds || i['vp:keyNeeds'] || []
  }));

  return { vps, problems, pains, solutions, benefits, icps };
}

// ========================================
// KPI / BSC EXTRACTION
// ========================================

function extractKPI(data) {
  if (!data) return null;
  const entities = getEntities(data);

  const perspectives = entities.filter(e => {
    const t = e['@type'] || '';
    return t.includes('BSCPerspective');
  }).map(p => ({
    type:   p.perspectiveType || '',
    name:   p.name || '',
    weight: p.weight || 0
  }));

  const kpis = entities.filter(e => {
    const t = e['@type'] || '';
    return t.includes('KPI') && !t.includes('CausalLink');
  }).map(k => ({
    name:        k.name || k['kpi:kpiName'] || '',
    description: k.description || k['kpi:description'] || '',
    target:      k['kpi:target'] || k.target || '',
    unit:        k['kpi:unit'] || k.unit || '',
    perspective: k['kpi:bscPerspective'] || k.bscPerspective || ''
  }));

  return { perspectives, kpis };
}

// ========================================
// KANO EXTRACTION
// ========================================

function extractKano(data) {
  if (!data) return null;

  const features = (data['oaa:featureManifest']?.features || []).map(f => ({
    id:          f.featureId,
    name:        f.name,
    description: f.description
  }));

  const segments = (data['oaa:segmentManifest']?.segments || []).map(s => ({
    id:   s.segmentId,
    name: s.name
  }));

  const entities = getEntities(data);
  const classifications = entities.filter(e => {
    const t = e['@type'] || '';
    return t.includes('KanoClassification');
  }).map(c => ({
    featureRef: c['kano:featureRef'] || '',
    category:   c['kano:category'] || '',
    confidence: c['kano:confidence'] || 0,
    segment:    c['kano:segmentRef'] || ''
  }));

  return { features, segments, classifications };
}

// ========================================
// RRR EXTRACTION
// ========================================

function extractRRR(data) {
  if (!data) return null;
  const entities = getEntities(data);

  const roles = entities.filter(e => {
    const t = e['@type'] || '';
    return t.includes('FunctionalRole') || t.includes('Role');
  }).map(r => ({
    name:        r.name || r['rrr:roleName'] || '',
    description: r.description || r['rrr:roleDescription'] || '',
    type:        r.roleType || r['rrr:roleType'] || ''
  }));

  return { roles };
}

// ========================================
// PUBLIC API
// ========================================

/**
 * Load all available VE chain data for a PFI brand.
 *
 * @param {string} brand - Brand code (baiv, airl, wwg, rcs, vhf, antq)
 * @returns {{ brand, brandName, vsom, vp, rrr, kpi, kano, coverage }}
 */
export function loadVEChainContent(brand) {
  const paths = BRAND_DATA[brand];
  if (!paths) throw new Error(`Unknown brand: ${brand}. Available: ${Object.keys(BRAND_DATA).join(', ')}`);

  const vsomData = loadJSON(paths.vsom);
  const vpData   = loadJSON(paths.vp);
  const rrrData  = loadJSON(paths.rrr);
  const kpiData  = loadJSON(paths.kpi);
  const kanoData = loadJSON(paths.kano);

  const vsom = extractVSOM(vsomData);
  const vp   = extractVP(vpData);
  const rrr  = extractRRR(rrrData);
  const kpi  = extractKPI(kpiData);
  const kano = extractKano(kanoData);

  // Brand display name from VSOM or VP metadata
  const brandName = vsomData?.['vsom:organizationContextRef']?.replace('org:ctx-', '').toUpperCase()
    || vpData?.['oaa:brandFullName']
    || brand.toUpperCase();

  // Coverage report — which VE stages have data
  const coverage = {
    vsom:  !!vsom,
    vp:    !!vp,
    rrr:   !!rrr,
    kpi:   !!kpi,
    kano:  !!kano,
    stages: [vsom && 'VSOM', vp && 'VP', rrr && 'RRR', kpi && 'KPI/BSC', kano && 'Kano'].filter(Boolean)
  };

  return { brand, brandName, vsom, vp, rrr, kpi, kano, coverage };
}

/**
 * List all available brands and their VE chain coverage.
 *
 * @returns {Array<{ brand, stages }>}
 */
export function listAvailableBrands() {
  return Object.keys(BRAND_DATA).map(brand => {
    const paths = BRAND_DATA[brand];
    const stages = Object.entries(paths)
      .filter(([, p]) => p && existsSync(join(ONT_LIB, p)))
      .map(([k]) => k.toUpperCase());
    return { brand, stages };
  });
}
