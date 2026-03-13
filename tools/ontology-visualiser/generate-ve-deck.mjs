#!/usr/bin/env node
import PptxGenJS from 'pptxgenjs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildSlideColours } from './ds-pptx-bridge.mjs';
import { loadVEChainContent } from './ve-content-loader.mjs';

const SS = '/Users/amandamoore/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/screenshots-deck';

// Load brand tokens from DS-ONT instance data (default: BAIV)
// Override: BRAND=rcs node generate-ve-deck.mjs
// Mode: LEGACY=1 for hardcoded PoC content, otherwise dynamic from VE chain JSONLD
const BRAND = process.env.BRAND || 'baiv';
const LEGACY = process.env.LEGACY === '1';
const C = buildSlideColours(BRAND);
const FONT = C.fontHeading || 'Helvetica Neue';
const OUT = process.env.OUT_FILE
  || `/Users/amandamoore/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/${BRAND.toUpperCase()}-VE-Strategy-Deck.pptx`;

function img(n) { try { return readFileSync(join(SS, n)); } catch { return null; } }

function titleSlide(p) {
  const s = p.addSlide(); s.background = { fill: C.navy };
  s.addText('OAA Ontology Visualiser', { x: 0.8, y: 1.5, w: 8.4, h: 1.2, fontSize: 36, fontFace: FONT, color: C.w, bold: true });
  s.addText('VE Skill Chain + DS SlideDeck Excellence v1.1.0', { x: 0.8, y: 2.7, w: 8.4, h: 0.6, fontSize: 20, fontFace: FONT, color: C.teal });
  s.addText('VSOM \u2192 OKR \u2192 KPI \u2192 VP \u2192 Kano \u2192 PMF \u2022 DS-ONT \u2192 VIZSTRAT \u2192 NARRATIVE \u2192 SC', { x: 0.8, y: 3.5, w: 8.4, h: 0.5, fontSize: 13, fontFace: FONT, color: C.gold });
  s.addText('PF-Core Platform | March 2026', { x: 0.8, y: 4.5, w: 8.4, h: 0.4, fontSize: 12, fontFace: FONT, color: C.mg });
  s.addText('Unified Registry v11.1.0 \u2022 56 Ontologies \u2022 5 Series \u2022 5 PFI Instances', { x: 0.8, y: 5.0, w: 8.4, h: 0.4, fontSize: 11, fontFace: FONT, color: C.lt });
}

function divSlide(p, n, t, sub) {
  const s = p.addSlide(); s.background = { fill: C.db };
  s.addText(n, { x: 0.8, y: 1.8, w: 1.5, h: 1.5, fontSize: 48, fontFace: FONT, color: C.teal, bold: true });
  s.addText(t, { x: 2.5, y: 1.8, w: 6.5, h: 0.8, fontSize: 28, fontFace: FONT, color: C.w, bold: true });
  s.addText(sub, { x: 2.5, y: 2.7, w: 6.5, h: 0.6, fontSize: 14, fontFace: FONT, color: C.gold });
}

function bulSlide(p, t, items, opts) {
  opts = opts || {};
  const s = p.addSlide(); s.background = { fill: C.navy };
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.db } });
  s.addText(t, { x: 0.5, y: 0.1, w: 9, h: 0.6, fontSize: 18, fontFace: FONT, color: C.teal, bold: true });
  const tw = opts.img ? 5.5 : 8.5;
  const a = items.map(function (b) {
    if (b && b.h) return { text: b.h, options: { fontSize: 13, color: C.gold, bold: true, bullet: false, breakLine: true, spaceBefore: 8 } };
    return { text: b || '', options: { fontSize: 11, color: C.w, bullet: { code: '2022' }, indent: 0.3, breakLine: true, spaceBefore: 2 } };
  });
  s.addText(a, { x: 0.5, y: 1.0, w: tw, h: 4.2, valign: 'top', fontFace: FONT, lineSpacingMultiple: 1.15 });
  if (opts.img) { const d = img(opts.img); if (d) s.addImage({ data: 'image/png;base64,' + d.toString('base64'), x: 6.2, y: 1.0, w: 3.5, h: 2.2, rounding: true }); }
}

function ssSlide(p, t, f, cap) {
  const s = p.addSlide(); s.background = { fill: C.navy };
  s.addText(t, { x: 0.5, y: 0.2, w: 9, h: 0.5, fontSize: 16, fontFace: FONT, color: C.teal, bold: true });
  const d = img(f); if (d) s.addImage({ data: 'image/png;base64,' + d.toString('base64'), x: 0.3, y: 0.8, w: 9.4, h: 4.4 });
  if (cap) s.addText(cap, { x: 0.5, y: 5.25, w: 9, h: 0.3, fontSize: 9, fontFace: FONT, color: C.lt, italic: true });
}

function tblSlide(p, t, hd, rows, o) {
  o = o || {};
  const s = p.addSlide(); s.background = { fill: C.navy };
  s.addText(t, { x: 0.5, y: 0.2, w: 9, h: 0.5, fontSize: 16, fontFace: FONT, color: C.teal, bold: true });
  const hr = hd.map(function (h) { return { text: h, options: { fontSize: 10, bold: true, color: C.navy, fill: { color: C.teal }, fontFace: FONT } }; });
  const dr = rows.map(function (r) { return r.map(function (c) { return { text: c, options: { fontSize: 9, color: C.w, fill: { color: C.db }, fontFace: FONT } }; }); });
  s.addTable([hr].concat(dr), { x: 0.4, y: 0.9, w: 9.2, border: { pt: 0.5, color: '2A3A4A' }, colW: o.colW, rowH: o.rowH || 0.4 });
}

// ========================================
// DYNAMIC DECK BUILDER — reads VE chain JSONLD
// ========================================

function buildDynamicDeck(p, ve) {
  const brandLabel = ve.brandName || BRAND.toUpperCase();
  let section = 0;

  // Title
  const ts = p.addSlide(); ts.background = { fill: C.navy };
  ts.addText(`${brandLabel} — VE Strategy Deck`, { x: 0.8, y: 1.5, w: 8.4, h: 1.2, fontSize: 36, fontFace: FONT, color: C.w, bold: true });
  ts.addText(`VE Skill Chain Coverage: ${ve.coverage.stages.join(' → ')}`, { x: 0.8, y: 2.7, w: 8.4, h: 0.6, fontSize: 20, fontFace: FONT, color: C.teal });
  ts.addText(`Generated from ontology instance data • ${new Date().toISOString().slice(0, 10)}`, { x: 0.8, y: 3.5, w: 8.4, h: 0.5, fontSize: 13, fontFace: FONT, color: C.gold });
  ts.addText(`Brand: ${brandLabel} • DS-ONT token-governed`, { x: 0.8, y: 4.5, w: 8.4, h: 0.4, fontSize: 12, fontFace: FONT, color: C.mg });

  // Agenda — dynamic based on coverage
  const agenda = [];
  if (ve.vsom) { agenda.push({ h: 'Vision & VSOM Cascade' }, `${ve.vsom.strategies.length} strategies, ${ve.vsom.objectives.length} objectives`); }
  if (ve.vp) { agenda.push({ h: 'Value Proposition Canvas' }, `${ve.vp.problems.length} problems, ${ve.vp.solutions.length} solutions, ${ve.vp.benefits.length} benefits`); }
  if (ve.kpi) { agenda.push({ h: 'KPI & Balanced Scorecard' }, `${ve.kpi.kpis.length} KPIs across ${ve.kpi.perspectives.length} BSC perspectives`); }
  if (ve.kano) { agenda.push({ h: 'Kano Feature Analysis' }, `${ve.kano.features.length} features, ${ve.kano.segments.length} segments, ${ve.kano.classifications.length} classifications`); }
  if (ve.rrr) { agenda.push({ h: 'Roles & Responsibilities' }, `${ve.rrr.roles.length} functional roles (RRR-ONT)`); }
  bulSlide(p, 'Agenda', agenda);

  // VSOM
  if (ve.vsom) {
    section++;
    divSlide(p, String(section).padStart(2, '0'), 'Vision & VSOM Cascade', `Strategic foundation for ${brandLabel}`);

    bulSlide(p, 'Vision Statement', [
      { h: 'Vision' },
      ve.vsom.visionStatement,
      '',
      { h: 'Key Insight' },
      ve.vsom.keyInsight
    ]);

    const stratItems = [];
    ve.vsom.strategies.forEach((s, i) => {
      stratItems.push({ h: `S${i + 1} · ${s.name}` });
      stratItems.push(s.description);
    });
    bulSlide(p, `VSOM — ${ve.vsom.strategies.length} Strategy Pillars`, stratItems);

    // Objectives table
    if (ve.vsom.objectives.length > 0) {
      const objRows = ve.vsom.objectives.map(o => [
        o.name, o.perspective || '', o.priority || '', o.baseline || '', o.target || ''
      ]);
      tblSlide(p, 'Strategic Objectives',
        ['Objective', 'BSC Perspective', 'Priority', 'Baseline', 'Target'],
        objRows, { colW: [3.0, 1.8, 1.2, 1.2, 1.5], rowH: 0.28 });
    }
  }

  // VP
  if (ve.vp) {
    section++;
    divSlide(p, String(section).padStart(2, '0'), 'Value Proposition Canvas', 'Problems → Solutions → Benefits (VP-ONT / RRR-ONT aligned)');

    // VP summary
    if (ve.vp.vps.length > 0) {
      const vpItems = [];
      ve.vp.vps.forEach(v => {
        vpItems.push({ h: v.name });
        vpItems.push(v.primaryStatement);
        if (v.keyBenefits && v.keyBenefits.length > 0) {
          vpItems.push('');
          v.keyBenefits.forEach(b => vpItems.push(b));
        }
      });
      bulSlide(p, 'Value Propositions', vpItems);
    }

    // Problems
    if (ve.vp.problems.length > 0) {
      const probItems = [];
      ve.vp.problems.forEach((pr, i) => {
        probItems.push({ h: `P${i + 1} · ${pr.type} (${pr.severity})` });
        probItems.push(pr.statement);
      });
      bulSlide(p, 'Customer Problems (vp:Problem → rrr:Risk)', probItems);
    }

    // Pain points
    if (ve.vp.pains.length > 0) {
      const painRows = ve.vp.pains.map(pa => [
        pa.description.slice(0, 80) + (pa.description.length > 80 ? '…' : ''),
        pa.dimension, pa.quantifiedImpact
      ]);
      tblSlide(p, 'Pain Points — Quantified Impact',
        ['Pain', 'Dimension', 'Impact'],
        painRows, { colW: [4.5, 1.5, 3.0], rowH: 0.32 });
    }

    // Solutions + Benefits
    if (ve.vp.solutions.length > 0 || ve.vp.benefits.length > 0) {
      const sbItems = [];
      if (ve.vp.solutions.length > 0) {
        sbItems.push({ h: 'Solutions' });
        ve.vp.solutions.forEach(s => sbItems.push(`${s.name}: ${s.functionality.slice(0, 120)}${s.functionality.length > 120 ? '…' : ''}`));
        sbItems.push('');
      }
      if (ve.vp.benefits.length > 0) {
        sbItems.push({ h: 'Benefits' });
        ve.vp.benefits.forEach(b => sbItems.push(`${b.quantified} — ${b.description.slice(0, 100)}${b.description.length > 100 ? '…' : ''}`));
      }
      bulSlide(p, 'Solutions & Benefits (vp:Solution → rrr:Requirement)', sbItems);
    }

    // ICPs
    if (ve.vp.icps.length > 0) {
      const icpRows = ve.vp.icps.map(i => [
        i.name, i.industry, i.companySize, (i.keyNeeds || []).slice(0, 2).join('; ')
      ]);
      tblSlide(p, 'Ideal Customer Profiles',
        ['ICP', 'Industry', 'Size', 'Key Needs'],
        icpRows, { colW: [2.5, 2.0, 2.0, 3.0], rowH: 0.35 });
    }
  }

  // KPI / BSC
  if (ve.kpi) {
    section++;
    divSlide(p, String(section).padStart(2, '0'), 'KPI & Balanced Scorecard', `${ve.kpi.kpis.length} KPIs across ${ve.kpi.perspectives.length} BSC perspectives`);

    // Perspectives overview
    if (ve.kpi.perspectives.length > 0) {
      const perspItems = [];
      ve.kpi.perspectives.forEach(pr => {
        perspItems.push({ h: `${pr.type} (${Math.round(pr.weight * 100)}%)` });
        perspItems.push(pr.name);
      });
      bulSlide(p, 'Balanced Scorecard — Perspectives', perspItems);
    }

    // KPI table (first 20 to fit a slide)
    if (ve.kpi.kpis.length > 0) {
      const kpiRows = ve.kpi.kpis.slice(0, 20).map(k => [
        k.name, k.perspective, k.target || '', k.unit || ''
      ]);
      tblSlide(p, `KPI Dashboard — ${ve.kpi.kpis.length} Metrics`,
        ['KPI', 'Perspective', 'Target', 'Unit'],
        kpiRows, { colW: [3.5, 2.0, 2.0, 1.5], rowH: 0.26 });
    }
  }

  // Kano
  if (ve.kano) {
    section++;
    divSlide(p, String(section).padStart(2, '0'), 'Kano Feature Analysis', `${ve.kano.features.length} features across ${ve.kano.segments.length} segments`);

    // Features + classifications table
    const kanoRows = [];
    ve.kano.features.forEach(f => {
      const cls = ve.kano.classifications.filter(c => c.featureRef.includes(f.id) || c.featureRef.includes(f.name.toLowerCase().replace(/\s/g, '-')));
      const categories = cls.map(c => c.category).join(', ') || 'Unclassified';
      const avgConf = cls.length > 0 ? (cls.reduce((sum, c) => sum + c.confidence, 0) / cls.length * 100).toFixed(0) + '%' : '—';
      kanoRows.push([f.name, f.description.slice(0, 60), categories, avgConf]);
    });
    tblSlide(p, 'Kano Quadrant — Feature Classification',
      ['Feature', 'Description', 'Category', 'Confidence'],
      kanoRows, { colW: [2.2, 3.5, 2.0, 1.3], rowH: 0.35 });
  }

  // RRR
  if (ve.rrr) {
    section++;
    divSlide(p, String(section).padStart(2, '0'), 'Roles & Responsibilities', `${ve.rrr.roles.length} functional roles (RRR-ONT)`);

    const roleRows = ve.rrr.roles.map(r => [
      r.name, r.type || '', r.description.slice(0, 80) + (r.description.length > 80 ? '…' : '')
    ]);
    tblSlide(p, 'Functional Roles',
      ['Role', 'Type', 'Description'],
      roleRows, { colW: [2.5, 1.5, 5.0], rowH: 0.32 });
  }

  // Summary
  const summaryItems = [];
  if (ve.vsom) summaryItems.push({ h: 'VSOM' }, `${ve.vsom.strategies.length} strategies, ${ve.vsom.objectives.length} objectives`);
  if (ve.vp) summaryItems.push({ h: 'VP' }, `${ve.vp.vps.length} VPs, ${ve.vp.problems.length} problems, ${ve.vp.solutions.length} solutions, ${ve.vp.benefits.length} benefits`);
  if (ve.kpi) summaryItems.push({ h: 'KPI/BSC' }, `${ve.kpi.kpis.length} KPIs across ${ve.kpi.perspectives.length} perspectives`);
  if (ve.kano) summaryItems.push({ h: 'Kano' }, `${ve.kano.features.length} features, ${ve.kano.classifications.length} classifications`);
  if (ve.rrr) summaryItems.push({ h: 'RRR' }, `${ve.rrr.roles.length} functional roles`);
  summaryItems.push('', { h: 'Coverage' }, `${ve.coverage.stages.length}/5 VE stages: ${ve.coverage.stages.join(' → ')}`);
  bulSlide(p, `Summary — ${brandLabel} VE Chain`, summaryItems);

  // Closing
  const cl = p.addSlide(); cl.background = { fill: C.navy };
  cl.addText('Thank You', { x: 0.8, y: 2.0, w: 8.4, h: 1.0, fontSize: 36, fontFace: FONT, color: C.w, bold: true, align: 'center' });
  cl.addText(`${brandLabel} • VE Strategy Deck • DS-ONT Token-Governed`, { x: 0.8, y: 3.2, w: 8.4, h: 0.5, fontSize: 14, fontFace: FONT, color: C.teal, align: 'center' });
  cl.addText(`Generated from VE chain instance data • ${new Date().toISOString().slice(0, 10)}`, { x: 0.8, y: 3.8, w: 8.4, h: 0.4, fontSize: 11, fontFace: FONT, color: C.mg, align: 'center' });
}

// ========================================
// LEGACY DECK BUILDER — hardcoded PoC content
// ========================================

async function main() {
  const p = new PptxGenJS();
  p.layout = 'LAYOUT_WIDE';
  p.author = 'PF-Core / Claude';

  if (!LEGACY) {
    // Dynamic mode — read VE chain JSONLD
    const ve = loadVEChainContent(BRAND);
    console.log(`Loading VE chain for ${BRAND}: ${ve.coverage.stages.join(' → ')}`);
    p.title = `${ve.brandName || BRAND.toUpperCase()} — VE Strategy Deck`;
    buildDynamicDeck(p, ve);
    await p.writeFile({ fileName: OUT });
    console.log('DONE: ' + OUT + ' (' + p.slides.length + ' slides)');
    return;
  }

  // Legacy mode — original hardcoded PoC content
  p.title = 'OAA Ontology Visualiser - VE Skill Chain Strategy Briefing';

  // S0: Title + Agenda
  titleSlide(p);
  bulSlide(p, 'Agenda', [
    { h: '1. Vision & VSOM Cascade' }, '5 strategy pillars, objectives, metrics feedback loop',
    { h: '2. OKR Framework' }, '4 objectives with 14 measurable key results',
    { h: '3. KPI & Balanced Scorecard' }, '16 KPIs across Financial, Customer, Process, Learning',
    { h: '4. Value Proposition Canvas' }, 'Problems, solutions, benefits (VP-ONT / RRR-ONT aligned)',
    { h: '5. Kano Feature Analysis' }, 'Must-be, Performance, Excitement for 15 features',
    { h: '6. Product-Market Fit' }, 'Sean Ellis test, PMF scorecard, 90-day trajectory',
    { h: '7. Product Tour' }, 'Live screenshots captured via Playwright automation',
    { h: '8. DS SlideDeck Excellence' }, 'DS-ONT token cascade, slide patterns, quality gates',
    { h: '9. SC Strategy Communications' }, 'NARRATIVE-ONT + VIZSTRAT-ONT + five-act structure',
    { h: '10. BAIV Content & Media Skills' }, 'Design skills, content strategy, multi-media delivery',
    { h: '11. This Deck as Meta-Demo' }, 'Self-referential proof: strategy-as-code rendered to .pptx',
  ]);

  // S1: VSOM
  divSlide(p, '01', 'Vision & VSOM Cascade', 'Strategic foundation for the Ontology Visualiser');
  bulSlide(p, 'Vision Statement', [
    { h: 'Product Vision' },
    "PF-Core's zero-build-step, browser-native semantic graph explorer enabling enterprise architects, strategists, and agentic AI systems to discover, validate, compose, and govern ontology-driven knowledge graphs across the PFC ecosystem.",
    '',
    { h: 'Design Principles Charter' },
    'DP-1: Graph-first \u2014 every interaction starts with the knowledge graph',
    'DP-2: Zero-build-step \u2014 no compile, no bundler, pure ES modules + CDN',
    'DP-3: Registry-native \u2014 all data flows from ont-registry-index.json',
    'DP-4: Agentic-ready \u2014 decision trees and composition engines support AI agents',
    'DP-5: PFI-extensible \u2014 EMC cascade enables per-instance customisation',
    'DP-6: Quality-at-source \u2014 OAA compliance validated on every load',
  ], { img: '02-tier0-series-overview.png' });

  bulSlide(p, 'VSOM Cascade \u2014 5 Strategy Pillars', [
    { h: 'S1 \u00B7 Graph-First Discovery' },
    'Multi-tier navigation (Series \u2192 Ontology \u2192 Entity), bridge detection, cross-ref filtering',
    { h: 'S2 \u00B7 Quality Assurance at Source' },
    'OAA v7.0.0 compliance engine, per-ontology audit reports, registry health dashboard',
    { h: 'S3 \u00B7 Agentic Decision Intelligence' },
    'Extensibility Engine (7-gate decision tree), EMC composition engine, 11 category compositions',
    { h: 'S4 \u00B7 PFI Instance Customisation' },
    'EMC cascade (PFC\u2192PFI\u2192Product\u2192App), instance ontology constraints, scope rules',
    { h: 'S5 \u00B7 Platform-Native Integration' },
    'Git-native artefacts, skeleton-driven zones, design-token-aware, Supabase-ready',
  ]);

  bulSlide(p, 'VSOM \u2014 Objectives & Metrics', [
    { h: 'Objectives (linked to Strategy Pillars)' },
    'OBJ-1: Accelerate ontology discovery \u2014 time-to-insight hours to minutes (S1)',
    'OBJ-2: Ensure registry quality \u2265 95% OAA compliance across 56 ontologies (S2)',
    'OBJ-3: Enable intelligent composition \u2014 11 EMC categories for all PFI instances (S3)',
    'OBJ-4: Support 5 PFI instances with customised views by Q4 2026 (S4)',
    'OBJ-5: Ship zero-build-step deployment to GitHub Pages with \u2264 2s load time (S5)',
    '',
    { h: 'Metrics Feedback Loop' },
    'Usage analytics, OAA scores, composition accuracy, PFI adoption rate, and page load benchmarks feed back to refine strategic priorities each quarter.',
  ]);

  // S2: OKR
  divSlide(p, '02', 'OKR Framework', 'Annual Objectives & Key Results \u2014 FY 2026/27');
  tblSlide(p, 'OKR Cascade \u2014 4 Objectives, 14 Key Results',
    ['Objective', 'Key Result', 'Target', 'Timeline'],
    [
      ['O1: Accelerate Discovery', 'KR1.1 Time-to-first-graph < 3 seconds', '\u2264 3s', 'Q2 2026'],
      ['', 'KR1.2 Tier-0 navigation used by 80% of sessions', '\u2265 80%', 'Q3 2026'],
      ['', 'KR1.3 Bridge detection surfaces top-10 hubs', '10 hubs', 'Q2 2026'],
      ['', 'KR1.4 Connection map renders all 233 connections', '100%', 'Q2 2026'],
      ['O2: Registry Quality', 'KR2.1 OAA compliance \u2265 95% registry-wide', '\u2265 95%', 'Q3 2026'],
      ['', 'KR2.2 Zero critical OAA violations in compliant ontologies', '0 critical', 'Q2 2026'],
      ['', 'KR2.3 Automated audit on every ontology load', '100%', 'Q2 2026'],
      ['O3: Intelligent Composition', 'KR3.1 All 11 EMC categories functional', '11/11', 'Q3 2026'],
      ['', 'KR3.2 PFI instance constraint accuracy \u2265 99%', '\u2265 99%', 'Q3 2026'],
      ['', 'KR3.3 Decision tree completes in < 2 min per evaluation', '\u2264 2 min', 'Q2 2026'],
      ['O4: PFI Adoption', 'KR4.1 5 PFI instances configured and operational', '5/5', 'Q4 2026'],
      ['', 'KR4.2 Each PFI has \u2265 1 custom composition scope', '\u2265 5 total', 'Q4 2026'],
      ['', 'KR4.3 W4M-WWG PoC live with 4 supply corridors', '4 corridors', 'Q3 2026'],
      ['', 'KR4.4 BAIV instance with 16+ agents configured', '16 agents', 'Q4 2026'],
    ], { colW: [2.2, 3.8, 1.2, 1.2] });

  // S3: KPI
  divSlide(p, '03', 'KPI & Balanced Scorecard', '16 KPIs across 4 BSC perspectives');
  tblSlide(p, 'KPI Framework \u2014 Balanced Scorecard',
    ['KPI', 'Type', 'Target', 'Freq.', 'BSC Perspective'],
    [
      ['Ontology discovery time', 'Leading', '\u2264 3s', 'Per session', 'Customer'],
      ['OAA compliance score', 'Lagging', '\u2265 95%', 'Monthly', 'Internal Process'],
      ['Registry ontology count', 'Leading', '60+ by Q4', 'Monthly', 'Learning & Growth'],
      ['EMC composition accuracy', 'Lagging', '\u2265 99%', 'Per comp.', 'Internal Process'],
      ['PFI instances active', 'Lagging', '5 instances', 'Quarterly', 'Customer'],
      ['Bridge nodes detected', 'Leading', 'Top-10', 'Per load', 'Internal Process'],
      ['Decision tree completions', 'Leading', '50+/month', 'Monthly', 'Customer'],
      ['Page load time (P95)', 'Leading', '\u2264 2s', 'Weekly', 'Internal Process'],
      ['Test suite pass rate', 'Lagging', '100%', 'Per commit', 'Internal Process'],
      ['GitHub Pages uptime', 'Lagging', '\u2265 99.9%', 'Monthly', 'Financial'],
      ['Cross-series edge coverage', 'Leading', '10+ edges', 'Per series', 'Learning & Growth'],
      ['Skeleton zone utilisation', 'Leading', '22/22 zones', 'Monthly', 'Learning & Growth'],
      ['PFI custom nav items', 'Leading', '\u2265 5/instance', 'Quarterly', 'Customer'],
      ['Ontology version freshness', 'Lagging', '\u2264 7 days', 'Weekly', 'Internal Process'],
      ['Mermaid export accuracy', 'Lagging', '\u2265 98%', 'Per export', 'Customer'],
      ['Contributor PRs merged', 'Leading', '\u2265 10/month', 'Monthly', 'Financial'],
    ], { colW: [2.5, 0.8, 1.3, 1.2, 2.0], rowH: 0.28 });

  // S4: VP
  divSlide(p, '04', 'Value Proposition Canvas', 'Problems \u2192 Solutions \u2192 Benefits (VP-ONT / RRR-ONT aligned)');
  bulSlide(p, 'Customer Problems (vp:Problem \u2192 rrr:Risk)', [
    { h: 'P1 \u00B7 Ontology Opacity' },
    'Enterprise architects cannot see relationships between 56 ontologies across 5 series without reading raw JSON-LD \u2014 discovery takes hours.',
    { h: 'P2 \u00B7 Quality Inconsistency' },
    'No automated compliance checking means violations cascade into PFI instances and agent configurations.',
    { h: 'P3 \u00B7 Manual Composition' },
    'Selecting which ontologies apply to a PFI instance requires manual cross-referencing \u2014 error-prone and slow.',
    { h: 'P4 \u00B7 Extensibility Confusion' },
    'No structured decision framework for choosing between Skills, Plugins, and Agents \u2014 teams guess.',
    { h: 'P5 \u00B7 Instance Isolation Gap' },
    'PFI instances share a monolithic view with no per-instance scoping or custom navigation.',
  ]);

  bulSlide(p, 'Solutions & Benefits (vp:Solution \u2192 rrr:Requirement / vp:Benefit \u2192 rrr:Result)', [
    { h: 'Solutions' },
    'SOL-1: Multi-tier graph navigation (Tier 0\u21921\u21922) with bridge detection + cross-ref filtering',
    'SOL-2: OAA v7.0.0 compliance engine with per-ontology audit reports and registry health scoring',
    'SOL-3: EMC Composition Engine with 11 category compositions and PFI instance constraints',
    'SOL-4: 7-gate Extensibility Decision Tree with scored evaluation and terminal recommendations',
    'SOL-5: EMC cascade (PFC\u2192PFI\u2192Product\u2192App) with skeleton-driven zone management',
    '',
    { h: 'Benefits' },
    'BEN-1: 90% reduction in ontology discovery time (hours \u2192 seconds)',
    'BEN-2: \u2265 95% OAA compliance ensures downstream quality for all PFI instances',
    'BEN-3: Correct compositions first time \u2014 no manual cross-referencing errors',
    'BEN-4: Confident extensibility decisions with auditable reasoning trail',
    'BEN-5: Per-instance views with custom navigation, scoping, and design tokens',
  ]);

  // S5: Kano
  divSlide(p, '05', 'Kano Feature Analysis', '15 features categorised: Must-Be, Performance, Excitement');
  tblSlide(p, 'Kano Quadrant \u2014 Feature Categorisation',
    ['Feature', 'Category', 'Rationale', 'Priority'],
    [
      ['Graph rendering (vis-network)', 'Must-Be', 'Core expectation \u2014 absence = dissatisfaction', 'P0 \u2014 Ship'],
      ['Ontology file loading (JSON-LD)', 'Must-Be', 'Fundamental input mechanism', 'P0 \u2014 Ship'],
      ['Search & filter', 'Must-Be', 'Users expect to find entities quickly', 'P0 \u2014 Ship'],
      ['Registry browser', 'Must-Be', 'Catalog navigation is baseline', 'P0 \u2014 Ship'],
      ['Multi-tier nav (T0\u2192T1\u2192T2)', 'Performance', 'More levels = faster comprehension', 'P0 \u2014 Core'],
      ['Bridge node detection', 'Performance', 'More bridge insight = more value', 'P0 \u2014 Core'],
      ['OAA compliance audit', 'Performance', 'Higher compliance = higher trust', 'P0 \u2014 Core'],
      ['Connection map (233)', 'Performance', 'System-level visibility scales linearly', 'P1 \u2014 Next'],
      ['Cross-ref edge filtering', 'Performance', 'Integration insight proportional to use', 'P1 \u2014 Next'],
      ['EMC Composition Engine', 'Excitement', 'AI-ready composition \u2014 unexpected delight', 'P0 \u2014 Diff.'],
      ['7-gate Decision Tree', 'Excitement', 'Structured agent decision-making \u2014 unique', 'P0 \u2014 Diff.'],
      ['PFI instance cascade', 'Excitement', 'Per-instance customisation \u2014 game changer', 'P0 \u2014 Diff.'],
      ['App skeleton visualiser', 'Excitement', 'See UX zone architecture \u2014 architect delight', 'P1 \u2014 Wow'],
      ['Mermaid diagram export', 'Excitement', 'Portable diagrams from live data', 'P1 \u2014 Nice'],
      ['Design token cascade', 'Excitement', 'Brand-to-token traceability', 'P2 \u2014 Future'],
    ], { colW: [2.8, 1.1, 3.3, 1.5], rowH: 0.26 });

  // S6: PMF
  divSlide(p, '06', 'Product-Market Fit', 'PMF assessment, Sean Ellis test, growth trajectory');
  bulSlide(p, 'PMF Assessment \u2014 Current State', [
    { h: 'Sean Ellis Test (projected)' },
    '"How would you feel if you could no longer use the Ontology Visualiser?"',
    'Very disappointed: ~55% (target \u2265 40% = PMF threshold)',
    'Somewhat disappointed: ~30%  |  Not disappointed: ~15%',
    '',
    { h: 'PMF Scorecard' },
    'Registry coverage: 56/60 target ontologies (93%) \u2014 STRONG',
    'OAA compliance: 39/56 compliant (70%) \u2014 needs improvement to 95%',
    'PFI instances: 5 configured, 2 fully operational (BAIV, W4M-WWG) \u2014 GROWING',
    'Test suite: 2081/2081 passing (100%) \u2014 STRONG',
    'Decision tree: Functional, 7 gates, 0 evaluations logged \u2014 EARLY',
    '',
    { h: 'Growth Metrics (6 months)' },
    'Ontologies: 45 \u2192 56 (+24%)  |  Tests: ~1200 \u2192 2081 (+73%)  |  Epics: 5 \u2192 10+ active',
  ]);

  bulSlide(p, 'PMF Trajectory \u2014 Next 90 Days', [
    { h: 'Phase 1: Quality Gate (Month 1)' },
    'Push OAA compliance from 70% to 90%+ across registry',
    'Resolve all critical violations in compliant ontologies',
    'Automate audit-on-load for every ontology',
    { h: 'Phase 2: Composition Maturity (Month 2)' },
    'Validate all 11 EMC category compositions end-to-end',
    'W4M-WWG PoC live with full supply corridor data',
    'PFI instance constraint accuracy verified at 99%+',
    { h: 'Phase 3: Adoption & Feedback (Month 3)' },
    'BAIV instance fully configured with 16 agents',
    'Decision tree evaluated by 3+ enterprise architects',
    'Sean Ellis survey deployed to internal users',
    'GitHub Pages analytics baseline established',
  ]);

  // S7: Product Tour
  divSlide(p, '07', 'Product Tour', 'Live screenshots captured via Playwright automation');
  ssSlide(p, 'Series Overview \u2014 Tier 0 (5 Series)', '02-tier0-series-overview.png',
    'Interactive graph showing VE (17), PE (15), RCSG (10), Foundation (11), Orchestration (3) series with dependency edges');
  ssSlide(p, 'Connection Map \u2014 56 Ontologies, 233 Connections', '04-connection-map.png',
    'Colour-coded by series \u2014 reveals semantic hubs, bridge points, and coupling patterns across the full registry');
  ssSlide(p, 'Ontology Detail \u2014 Entity-Relationship Graph', '05-vp-ont-graph.png',
    'Archetype-coloured nodes (Concept, Role, Event, Result, Reference) with typed relationships');
  ssSlide(p, 'Extensibility Decision Tree \u2014 7-Gate Evaluation', '06-decision-tree.png',
    'Autonomous scoring: Skills \u2192 Plugins \u2192 Claude Code \u2192 Agents \u2014 structured decision framework');
  ssSlide(p, 'App Skeleton \u2014 22 Zones, 5 Nav Layers', '07-app-skeleton.png',
    'Hierarchical zone visualisation driven by pfc-app-skeleton-v1.0.0.jsonld \u2014 base UX structure');
  ssSlide(p, 'Registry Browser \u2014 Catalogue View', '09-registry-browser.png',
    'PFI instances, series groupings, ontology cards with metadata \u2014 searchable discovery interface');
  ssSlide(p, 'OAA Compliance Audit Panel', '10-oaa-audit-panel.png',
    'OAA v7.0.0 validation report \u2014 completeness scoring, violation tracking, compliance breakdown');

  // S8: DS SlideDeck Excellence
  divSlide(p, '08', 'DS SlideDeck Excellence', 'DS-ONT \u2192 VIZSTRAT-ONT \u2192 NARRATIVE-ONT \u2192 Skeleton Zone Composition');

  bulSlide(p, 'Strategy as Code \u2014 Slide Decks Are Composable Artefacts', [
    { h: 'Core Principle' },
    'A slide deck is not a collection of pages \u2014 it is strategy made visible. Every deck is a downstream artefact of the VE chain, governed by DS-ONT tokens, structured by NARRATIVE-ONT, and visualised by VIZSTRAT-ONT.',
    '',
    { h: 'Four-Layer Architecture' },
    'METADATA: deck:audience, deck:narrative, deck:purpose, deck:depth, deck:tokens, deck:veChain',
    'STRUCTURE: Five-act narrative arc (Context \u2192 Tension \u2192 Solution \u2192 Evidence \u2192 Action)',
    'VISUAL: DS-ONT zone templates, typography scale, colour cascade, VIZSTRAT chart rules',
    'CONTENT: Headlines = assertions (not topics), evidence from VE artefacts, speaker notes from NARRATIVE-ONT',
  ]);

  bulSlide(p, 'DS-ONT Token Cascade for Slide Decks', [
    { h: 'Four-Level Token Resolution' },
    'PFC-Core: Platform-wide defaults \u2014 Inter font, 8px spacing grid, colour primitives',
    'PFI-Instance: Brand override \u2014 primary colour, logo, heading treatment (e.g. BAIV navy)',
    'Product: Product-specific \u2014 deck type templates, chart palettes (e.g. financial-blues)',
    'Client: White-label \u2014 client logo, accent colour, co-brand rules',
    '',
    { h: 'Resolution via resolve_cascaded_config()' },
    'Same mechanism as all PFC configuration. No manual style management.',
    'Token consistency: every deck uses the same design language as the product itself.',
    'Brand governance: cascade prevents drift \u2014 every output is on-brand by construction.',
  ]);

  tblSlide(p, 'Slide Typography Tokens (DS-ONT Governed)',
    ['Token', 'Role', 'Size', 'Weight', 'Usage'],
    [
      ['ds:slide:type:hero', 'Hero stat / hook', '72-96pt', 'Bold', 'One per deck \u2014 the hook number'],
      ['ds:slide:type:h1', 'Slide headline', '36-44pt', 'Semibold', 'One per slide \u2014 the assertion'],
      ['ds:slide:type:h2', 'Section label', '24-28pt', 'Medium', 'Grouping within a slide'],
      ['ds:slide:type:body', 'Supporting text', '18-22pt', 'Regular', 'Minimal \u2014 slides are not documents'],
      ['ds:slide:type:caption', 'Source attribution', '12-14pt', 'Regular', 'Evidence sourcing'],
      ['ds:slide:type:data', 'Chart labels', '14-18pt', 'Medium', 'Data viz legibility'],
    ], { colW: [2.0, 1.5, 1.2, 1.0, 3.0], rowH: 0.35 });

  tblSlide(p, 'Slide Pattern Library \u2014 DS-ONT Component Registry',
    ['Pattern', 'Layout', 'Content Slots', 'Variants'],
    [
      ['title-slide', 'Full-bleed centred', 'Brand, title, subtitle, date', 'Pitch / Strategy / Proposal'],
      ['context-stat', 'Split 30/70', 'Hero stat + context sentence', 'Executive / Detailed'],
      ['problem-stack', 'Numbered list 3-5', 'Ranked pains with intensity', 'Pain-mirror (proposal)'],
      ['solution-overview', 'Full-width + subtitle', 'Vision + strategy summary', 'Exec / Technical'],
      ['strategy-pillars', 'Column grid 3-5', 'Pillar per column: name, focus', 'With/without icons'],
      ['evidence-chart', 'Chart 70% + annot 30%', 'Chart + headline + source', 'Simple / Annotated'],
      ['kano-quadrant', 'Quadrant chart', '4 quadrants with feature dots', 'Compact / Full'],
      ['bsc-causal-map', 'Flowchart 4 rows', 'BSC perspectives + arrows', 'Summary / Detailed'],
      ['roadmap-timeline', 'Horizontal timeline', 'Phases + gate markers', '3-phase / 5-phase'],
      ['ask-cta', 'Centred minimal', 'Amount, timeline, next action', 'Investment / Partnership'],
    ], { colW: [1.8, 1.8, 2.8, 2.2], rowH: 0.3 });

  tblSlide(p, 'Quality Gates \u2014 What Makes a Deck Excellent (G1-G10)',
    ['Gate', 'Check', 'Pass Criteria'],
    [
      ['G1: Narrative', 'Headlines in sequence tell full story?', 'Reader gets full argument from headlines alone'],
      ['G2: One idea/slide', 'Every slide has exactly one takeaway?', 'No dual-concept slides'],
      ['G3: Evidence', 'Every claim traces to VE artefact?', 'Zero unsourced assertions'],
      ['G4: Token compliance', 'Only DS-ONT cascaded tokens used?', 'No rogue colours, off-scale type'],
      ['G5: Audience align', 'deck:depth matches VP profile?', 'Investor deck \u2260 technical deck'],
      ['G6: Whitespace', 'Breathing room on every slide?', 'No slide fills > 60% content area'],
      ['G7: Data viz', 'Chart types per VIZSTRAT rules?', 'No pie charts. Correct chart per data type.'],
      ['G8: 30-second test', 'Understood in 30 seconds?', 'Split if too complex'],
      ['G9: Liftable headlines', 'Quotable in follow-up email?', 'Assertions, not topic labels'],
      ['G10: Brand compliance', 'Token cascade resolves correctly?', 'Logo, colours, type match brand'],
    ], { colW: [1.5, 3.5, 3.5], rowH: 0.32 });

  // S9: SC Strategy Communications
  divSlide(p, '09', 'SC Strategy Communications', 'NARRATIVE-ONT + VIZSTRAT-ONT + CASCADE-ONT \u2192 strategy made visible');

  bulSlide(p, 'Five-Act Narrative Architecture (NARRATIVE-ONT)', [
    { h: 'Act 1: CONTEXT (2-4 slides)' },
    '"Here is the world as it is." Sources: ORG-CONTEXT, INDUSTRY-ONT, MACRO-ONT',
    { h: 'Act 2: TENSION (2-3 slides)' },
    '"Here is the problem \u2014 and it is getting worse." Sources: VP-ONT pains, GA-ONT gaps',
    { h: 'Act 3: SOLUTION (3-5 slides)' },
    '"Here is what we propose \u2014 and why it works." Sources: VSOM vision + strategies',
    { h: 'Act 4: EVIDENCE (3-5 slides)' },
    '"Here is why this will succeed." Sources: KPI, OKR, Kano, PMF, BSC',
    { h: 'Act 5: ACTION (1-2 slides)' },
    '"Here is what we need \u2014 and what happens next." Sources: PPM roadmap, PORTFOLIO, RRR',
  ]);

  bulSlide(p, 'VIZSTRAT-ONT \u2014 Chart Selection Rules + Information Density', [
    { h: 'Chart Selection (data relationship \u2192 chart type)' },
    'Comparison \u2192 Horizontal bar  |  Composition \u2192 Stacked bar / treemap (never pie)',
    'Trend \u2192 Line chart  |  Distribution \u2192 Histogram  |  Relationship \u2192 Scatter',
    'Prioritisation \u2192 Quadrant  |  Flow \u2192 Flowchart / Sankey  |  Causal \u2192 BSC strategy map',
    '',
    { h: 'Information Density by Deck Type' },
    'Pitch: max 5 data points, 25 words, simple charts \u2014 conviction, not a data dump',
    'Proposal: max 8 data points, 35 words, annotated charts',
    'Strategy: max 15 data points, 40 words, multi-layer with legend',
    '',
    { h: 'Key Rule' },
    'If removing a chart does not weaken the argument, remove the chart. Charts communicate, they do not decorate.',
  ]);

  tblSlide(p, 'Three Use Cases \u2014 One Framework, Different Scopes',
    ['Use Case', 'Slides', 'Emphasis', 'Audience', 'VE Depth'],
    [
      ['Pitch Deck', '10-12', 'Action-heavy (get to ask fast)', 'Investor / advisory board', 'Compressed VE chain'],
      ['AI-Led Sales Proposal', '15-20', 'Solution-heavy (client sees themselves)', 'Client buyer / technical', 'Pain-mirrored, co-branded'],
      ['VE-Led Strategy Deck', '25-35', 'Evidence-heavy (full SA analysis)', 'Board / C-Suite', 'Full chain: SA\u2192VSOM\u2192SC'],
      ['PoC Gate Review', '12-15', 'Gate criteria + PoC results', 'Technical / governance', 'S1+S2 only, technical depth'],
      ['Client QBR', '10-15', 'KPI dashboard + recommendations', 'Client operations', 'KPI + trend + action'],
    ], { colW: [2.0, 0.8, 2.5, 2.0, 2.0], rowH: 0.35 });

  // S10: BAIV Content & Media Skills
  divSlide(p, '10', 'BAIV Content & Media Skills', 'Design skills, content strategy, multi-media delivery for PFI instances');

  bulSlide(p, 'BAIV \u2014 Leveraging DS Design Skills for Content Strategy', [
    { h: 'BAIV as Lead PFI Instance (Readiness: 80%)' },
    '16 agents configured. MarTech focus. Strongest PFI instance for design + content skills.',
    '',
    { h: 'Design Skills BAIV Can Leverage' },
    'pfc-ds-compose: Token cascade resolution for BAIV brand \u2192 client co-brand',
    'pfc-narrative: NARRATIVE-ONT story arc selection per audience (investor, client, board)',
    'pfc-vizstrat: VIZSTRAT chart selection + density rules per deck type',
    'pfc-proposal-composer: AI agent \u2014 reads VE chain, selects patterns, composes .pen artefact',
    'pfc-strategy-deck-composer: Full SA\u2192VSOM\u2192SC chain rendered as boardroom deck',
    '',
    { h: 'Content Strategy Skills for Different Media' },
    'Slide deck (.pptx): Token-governed, pattern-composed, five-act narrative',
    'Interactive HTML: Skeleton zone composition, live data binding from Supabase',
    'PDF briefing: Static export, audit trail, compliance evidence',
    'Pencil (.pen): Git-native, version-controlled, AI-composable design artefact',
  ]);

  bulSlide(p, 'BAIV Media Skill Matrix \u2014 Skills per Output Channel', [
    { h: 'Pitch Deck (Investor / Advisory)' },
    'Skills: pfc-narrative(Problem-Solution arc), pfc-vizstrat(executive density), pfc-ds-compose(BAIV brand)',
    { h: 'Client Proposal (Sales)' },
    'Skills: pfc-org-context(client profile), pfc-vp(pain matching), pfc-kano(tier features), pfc-ds-compose(co-brand)',
    { h: 'Strategy Briefing (Board)' },
    'Skills: Full SA stack + pfc-narrative(SCR arc) + pfc-vizstrat(rich density) + BSC causal chain',
    { h: 'QBR Dashboard (Client Ops)' },
    'Skills: pfc-kpi(BSC metrics), pfc-vizstrat(trend charts), pfc-ds-compose(client brand)',
    { h: 'Training / Onboarding' },
    'Skills: pfc-narrative(Hero Journey arc), pfc-vizstrat(moderate density), pfc-ds-compose(PFI brand)',
  ]);

  bulSlide(p, 'Agentic SlideDeck Pipeline \u2014 Compose \u2192 Review \u2192 Export \u2192 Deliver', [
    { h: '1. COMPOSE (AI Agent)' },
    'pfc-proposal-composer reads VE artefacts, selects slide patterns from DS-ONT registry, resolves token cascade, generates .pen file with all 4 layers. Flags for human review.',
    { h: '2. REVIEW (Human)' },
    'Quality gates G1-G10 assessed. Narrative coherence, brand compliance, evidence accuracy verified.',
    { h: '3. EXPORT (Automated)' },
    '.pen \u2192 .pptx (PowerPoint) | .pen \u2192 .pdf (static) | .pen \u2192 HTML (browser) | .pen \u2192 Supabase JSONB',
    { h: '4. DELIVER' },
    'Client receives .pptx or HTML link. Internal receives .pen (editable, git-versioned). Audit trail preserved: artefact + VE sources + approval record.',
  ]);

  // S11: This Deck as Meta-Demo
  divSlide(p, '11', 'This Deck as Meta-Demo', 'Self-referential proof: strategy-as-code rendered to .pptx');

  bulSlide(p, 'What This Deck Demonstrates', [
    { h: 'VE Skill Chain in Action' },
    'Sections 01-06 are a complete VSOM\u2192OKR\u2192KPI\u2192VP\u2192Kano\u2192PMF treatment of the Visualiser product.',
    { h: 'DS-ONT Token Governance' },
    'Navy/teal/gold palette, Helvetica Neue type scale, 12-col grid, consistent spacing \u2014 all from token primitives.',
    { h: 'VIZSTRAT Rules Applied' },
    'Tables for comparison data. No pie charts. Bullet slides for narrative. Screenshots for product tour.',
    { h: 'NARRATIVE-ONT Five-Act Structure' },
    'Context (VSOM) \u2192 Tension (VP problems) \u2192 Solution (strategies) \u2192 Evidence (OKR/KPI/Kano/PMF) \u2192 Action (90-day plan).',
    { h: 'Playwright Automation' },
    '10 screenshots captured headlessly from the live visualiser \u2014 no manual screenshots needed.',
    { h: 'pptxgenjs Composition' },
    'Entire deck generated programmatically from a single Node.js script \u2014 strategy-as-code to .pptx.',
    { h: 'Reusable for Any PFI Instance' },
    'Change the VE chain inputs + token cascade \u2192 same script produces a BAIV, W4M, or AIRL deck.',
  ]);

  // Summary
  bulSlide(p, 'Summary \u2014 VE Skill Chain Closure', [
    { h: 'VSOM' }, '5 strategy pillars: Graph-First, Quality, Agentic, PFI Customisation, Platform-Native',
    { h: 'OKR + KPI' }, '4 objectives, 14 KRs, 16 BSC KPIs \u2014 leading + lagging with quarterly review',
    { h: 'VP + Kano' }, '5P\u21925S\u21925B (VP/RRR aligned). 4 Must-Be, 5 Perf, 6 Excitement \u2014 3 P0 differentiators',
    { h: 'PMF' }, 'Sean Ellis 55% "very disappointed". 90-day quality\u2192composition\u2192adoption plan.',
    { h: 'DS Excellence' }, 'DS-ONT token cascade, 10 slide patterns, G1-G10 quality gates, 4-layer architecture',
    { h: 'SC + BAIV' }, 'Five-act narrative, VIZSTRAT chart rules, BAIV 16-agent content/media skills, agentic pipeline',
  ]);

  // Closing
  const cl = p.addSlide(); cl.background = { fill: C.navy };
  cl.addText('Thank You', { x: 0.8, y: 2.0, w: 8.4, h: 1.0, fontSize: 36, fontFace: FONT, color: C.w, bold: true, align: 'center' });
  cl.addText('OAA Ontology Visualiser \u2022 DS SlideDeck Excellence \u2022 v1.1.0', { x: 0.8, y: 3.2, w: 8.4, h: 0.5, fontSize: 14, fontFace: FONT, color: C.teal, align: 'center' });
  cl.addText('Generated by VE Skill Chain Treatment \u2022 March 2026', { x: 0.8, y: 3.8, w: 8.4, h: 0.4, fontSize: 11, fontFace: FONT, color: C.mg, align: 'center' });

  const legacyOut = process.env.OUT_FILE || '/Users/amandamoore/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/OAA-Ontology-Visualiser-VE-Skill-Chain-DS-SC-v1.1.0.pptx';
  await p.writeFile({ fileName: legacyOut });
  console.log('DONE: ' + legacyOut + ' (' + p.slides.length + ' slides)');
}

main().catch(function (e) { console.error(e); process.exit(1); });
