#!/usr/bin/env node
/**
 * deck-content-ve-skill-chain.mjs — Content-driven deck: VE Skill Chain explained.
 *
 * This script demonstrates the "I am the content engine" pattern:
 * LLM-quality narrative content + PPTX layout engine + DS-ONT tokens.
 *
 * Theme: Why Value Engineering and the VE Skill Chain translate idea to execution,
 * and how they tee up with PE ontology for PRD → Programme → PoC.
 */
import PptxGenJS from 'pptxgenjs';
import { buildSlideColours } from './ds-pptx-bridge.mjs';

const BRAND = process.env.BRAND || 'baiv';
const C = buildSlideColours(BRAND);
const FONT = C.fontHeading || 'Helvetica Neue';
const OUT = process.env.OUT_FILE
  || `/Users/amandamoore/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/${BRAND.toUpperCase()}-VE-Skill-Chain-Explained.pptx`;

// ========================================
// SLIDE HELPERS (same as generate-ve-deck.mjs)
// ========================================

function bulSlide(p, t, items, opts) {
  opts = opts || {};
  const s = p.addSlide(); s.background = { fill: C.navy };
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.db } });
  s.addText(t, { x: 0.5, y: 0.1, w: 9, h: 0.6, fontSize: 18, fontFace: FONT, color: C.teal, bold: true });
  const a = items.map(function (b) {
    if (b && b.h) return { text: b.h, options: { fontSize: 13, color: C.gold, bold: true, bullet: false, breakLine: true, spaceBefore: 8 } };
    return { text: b || '', options: { fontSize: 11, color: C.w, bullet: { code: '2022' }, indent: 0.3, breakLine: true, spaceBefore: 2 } };
  });
  s.addText(a, { x: 0.5, y: 1.0, w: 8.5, h: 4.2, valign: 'top', fontFace: FONT, lineSpacingMultiple: 1.15 });
}

function divSlide(p, n, t, sub) {
  const s = p.addSlide(); s.background = { fill: C.db };
  s.addText(n, { x: 0.8, y: 1.8, w: 1.5, h: 1.5, fontSize: 48, fontFace: FONT, color: C.teal, bold: true });
  s.addText(t, { x: 2.5, y: 1.8, w: 6.5, h: 0.8, fontSize: 28, fontFace: FONT, color: C.w, bold: true });
  s.addText(sub, { x: 2.5, y: 2.7, w: 6.5, h: 0.6, fontSize: 14, fontFace: FONT, color: C.gold });
}

function tblSlide(p, t, hd, rows, o) {
  o = o || {};
  const s = p.addSlide(); s.background = { fill: C.navy };
  s.addText(t, { x: 0.5, y: 0.2, w: 9, h: 0.5, fontSize: 16, fontFace: FONT, color: C.teal, bold: true });
  const hr = hd.map(h => ({ text: h, options: { fontSize: 10, bold: true, color: C.navy, fill: { color: C.teal }, fontFace: FONT } }));
  const dr = rows.map(r => r.map(c => ({ text: c, options: { fontSize: 9, color: C.w, fill: { color: C.db }, fontFace: FONT } })));
  s.addTable([hr].concat(dr), { x: 0.4, y: 0.9, w: 9.2, border: { pt: 0.5, color: '2A3A4A' }, colW: o.colW, rowH: o.rowH || 0.4 });
}

// ========================================
// DECK CONTENT — LLM-generated narrative
// ========================================

async function main() {
  const p = new PptxGenJS();
  p.layout = 'LAYOUT_WIDE';
  p.author = 'PF-Core / Claude';
  p.title = 'Value Engineering — From Idea to Execution via the VE Skill Chain';

  // ── TITLE ──
  const ts = p.addSlide(); ts.background = { fill: C.navy };
  ts.addText('Value Engineering', { x: 0.8, y: 1.2, w: 8.4, h: 1.0, fontSize: 42, fontFace: FONT, color: C.w, bold: true });
  ts.addText('From Idea to Execution via the VE Skill Chain', { x: 0.8, y: 2.3, w: 8.4, h: 0.7, fontSize: 22, fontFace: FONT, color: C.teal });
  ts.addText('How structured strategic thinking translates vision into validated products — and why the Strategic Neural Graph makes it repeatable', { x: 0.8, y: 3.2, w: 8.4, h: 0.6, fontSize: 13, fontFace: FONT, color: C.gold });
  ts.addText('PF-Core Platform Foundation • March 2026', { x: 0.8, y: 4.5, w: 8.4, h: 0.4, fontSize: 12, fontFace: FONT, color: C.mg });

  // ── AGENDA ──
  bulSlide(p, 'What This Deck Covers', [
    { h: '1. The Problem — Why Most Ideas Never Become Products' },
    'The gap between strategic intent and validated execution is where most organisations lose value',
    { h: '2. Value Engineering — The Discipline, Not the Buzzword' },
    'A structured methodology for translating aspirational vision into measurable, testable propositions',
    { h: '3. The VE Skill Chain — Six Ontologies, One Unbroken Thread' },
    'VSOM → OKR → KPI → VP → Kano → PMF — each stage builds on the last, nothing is left implicit',
    { h: '4. The Bridge to Execution — VE Meets PE' },
    'How the VE chain produces the PRD that the PE (Process Engineering) ontology needs to build',
    { h: '5. Programme to PoC — The Builder Phase' },
    'From validated proposition to working proof-of-concept via PPM, EFS, and the PE skill chain',
    { h: '6. The Strategic Neural Graph — Why This Works at Scale' },
    'The Unified Registry Graph as the connective tissue that makes idea-to-PoC repeatable across instances',
  ]);

  // ── SECTION 1: THE PROBLEM ──
  divSlide(p, '01', 'The Problem', 'Why most ideas never become products');

  bulSlide(p, 'The Idea-to-Execution Gap Is Where Value Dies', [
    { h: 'The Pattern We All Recognise' },
    'A compelling vision is articulated. Strategy pillars are defined. Objectives are set. Then silence. Months later, the team has built something — but nobody can trace it back to the original strategic intent. The PRD was written in isolation. The features were prioritised by gut feel. The MVP was scoped by who shouted loudest.',
    '',
    { h: 'Why This Happens' },
    'There is no structured, traceable path from "what we believe" to "what we build." Strategy lives in slide decks. OKRs live in spreadsheets. Value propositions live in someone\'s head. KPIs are retrofitted after launch. Kano analysis — if it happens at all — is disconnected from the VP. Product-market fit is declared, never measured.',
    '',
    { h: 'The Cost' },
    'Teams build products that solve problems nobody validated. Features are shipped that satisfy nobody\'s priority model. PoCs are launched without clear success criteria. The gap between strategy and execution is not a process failure — it is a structural one. The information exists, but it is not connected.',
  ]);

  // ── SECTION 2: VALUE ENGINEERING ──
  divSlide(p, '02', 'Value Engineering', 'The discipline that closes the gap');

  bulSlide(p, 'Value Engineering Is Strategic Rigour Applied to Product Thinking', [
    { h: 'Definition' },
    'Value Engineering (VE) is the discipline of systematically translating strategic vision into validated, measurable value propositions that can be tested against real market conditions before a single line of code is written.',
    '',
    { h: 'What VE Is Not' },
    'It is not business analysis. It is not requirements gathering. It is not another framework to learn and forget. VE is the connective tissue between "why we exist" (Vision) and "what we should build next" (PRD). Every stage produces structured, machine-readable artefacts that the next stage consumes.',
    '',
    { h: 'The Core Principle' },
    'Nothing proceeds to execution without validation. The vision must decompose into measurable objectives. The objectives must decompose into testable propositions. The propositions must be validated against customer needs. The customer needs must be prioritised. The priorities must survive a product-market fit assessment. Only then does the PE chain receive a validated brief.',
  ]);

  bulSlide(p, 'Why Ontologies — Not Documents — Are the Key', [
    { h: 'The Document Problem' },
    'Strategy documents are write-once, read-never artefacts. They cannot be queried, composed, or validated by machines. An AI agent cannot traverse a PowerPoint deck to find which KPI traces to which strategic objective. A programme manager cannot ask "show me every feature that maps to our highest-severity customer pain."',
    '',
    { h: 'The Ontology Solution' },
    'Each VE stage is modelled as a formal ontology — a structured, typed, relationship-rich knowledge graph. VSOM-ONT captures vision and strategy. VP-ONT captures problems, solutions, and benefits. KPI-ONT captures metrics with BSC perspectives. Every entity has typed relationships to entities in other ontologies. The result is a single, traversable graph from vision to validated proposition.',
    '',
    { h: 'The Practical Benefit' },
    'An AI agent — or a human with the right tooling — can ask: "Which customer pain points are addressed by Strategy Pillar 3, measured by which KPIs, and validated at what Kano category?" The answer is a graph traversal, not a document search.',
  ]);

  // ── SECTION 3: THE VE SKILL CHAIN ──
  divSlide(p, '03', 'The VE Skill Chain', 'Six ontologies, one unbroken thread from vision to validation');

  tblSlide(p, 'The Chain — Each Stage Builds on the Last',
    ['Stage', 'Ontology', 'What It Produces', 'Key Question Answered'],
    [
      ['1. Vision & Strategy', 'VSOM-ONT v2.1', 'Vision statement, strategy pillars, objectives, metrics cascade', 'Where are we going and how will we get there?'],
      ['2. Objectives & Results', 'OKR-ONT v1.0', 'Measurable objectives with time-bound key results', 'How will we know we are succeeding?'],
      ['3. Performance Metrics', 'KPI-ONT v1.0', 'KPIs mapped to BSC perspectives (Financial, Customer, Process, Learning)', 'What exactly do we measure, and from whose perspective?'],
      ['4. Value Proposition', 'VP-ONT v1.2', 'ICPs, problems, pains, solutions, benefits — all traced to strategy', 'Who are we serving, what pains do they have, and what value do we deliver?'],
      ['5. Feature Priority', 'Kano-ONT', 'Features classified as Must-Be, Performance, or Excitement per segment', 'Which features matter most to which customers, and why?'],
      ['6. Market Validation', 'PMF-ONT v1.0', 'Sean Ellis score, willingness-to-pay, competitive positioning, launch readiness', 'Is there a real market for this, and are we ready to enter it?'],
    ], { colW: [1.5, 1.2, 3.0, 3.0], rowH: 0.42 });

  bulSlide(p, 'VSOM — The Strategic Spine Everything Hangs From', [
    { h: 'Vision → Strategy → Objectives → Metrics' },
    'VSOM-ONT is not just another strategy framework — it is the structural spine of the entire VE chain. Every downstream ontology imports from VSOM. When a VP-ONT value proposition references a strategic pillar, it does so through a typed VSOM relationship. When a KPI maps to a BSC perspective, the objective it measures is a VSOM entity.',
    '',
    { h: 'VSOM-SA: The Strategy Analysis Sub-Series' },
    'Five additional ontologies extend VSOM into full strategic analysis: MACRO-ONT (PESTEL, scenario planning), INDUSTRY-ONT (Porter\'s Five Forces, SWOT/TOWS), BSC-ONT (Balanced Scorecard strategy maps), REASON-ONT (MECE, hypothesis-driven logic), PORTFOLIO-ONT (BCG, three horizons). Together they form a five-layer concentric model from macro environment scanning down to portfolio execution — all feeding the VSOM spine.',
    '',
    { h: 'Why This Matters for Execution' },
    'By the time a product team receives a brief, every strategic assumption has been stress-tested through scenario analysis, competitive positioning, balanced scorecard alignment, and logical reasoning. The brief is not an opinion — it is a conclusion supported by structured evidence in a traversable graph.',
  ]);

  bulSlide(p, 'VP → Kano → PMF — The Validation Gauntlet', [
    { h: 'VP-ONT: Who Are We Serving and What Do They Need?' },
    'Value Proposition Ontology captures Ideal Customer Profiles, their pain points (quantified), the solutions we propose, and the benefits we claim. Every VP entity traces back to VSOM objectives. The VP-RRR alignment convention ensures problems map to risks, solutions to requirements, and benefits to measurable results.',
    '',
    { h: 'Kano Analysis: Not All Features Are Equal' },
    'Kano classification sorts features into Must-Be (expected — absence causes dissatisfaction), Performance (more is better — linear satisfaction), and Excitement (unexpected delight — differentiation). This prevents the classic trap of investing in excitement features before must-be features are solid.',
    '',
    { h: 'PMF-ONT: The Reality Check Before Build' },
    'Product-Market Fit is not a feeling — it is a structured assessment. Sean Ellis test ("how would you feel if you could no longer use this?"), willingness-to-pay analysis, competitive positioning, and launch readiness scoring. PMF-ONT imports from VP-ONT and OKR-ONT to ground every assessment in validated data. Only propositions that survive this gauntlet proceed to the PE chain.',
  ]);

  // ── SECTION 4: VE → PE BRIDGE ──
  divSlide(p, '04', 'The Bridge to Execution', 'Where Value Engineering hands off to Process Engineering');

  bulSlide(p, 'The VE Chain Produces What the PE Chain Consumes', [
    { h: 'The Handoff Artefact: The Validated Product Brief' },
    'The output of the VE skill chain is not a requirements document — it is a validated, graph-connected product brief. It contains: a vision traced to strategy (VSOM), measurable success criteria (OKR/KPI), validated customer needs (VP), prioritised features (Kano), and confirmed market fit (PMF). This is what the Product Requirements Document is built from.',
    '',
    { h: 'PE-Series: How to Build What VE Validated' },
    'The Process Engineering series — PE-ONT, PPM-ONT, EFS-ONT, LSC-ONT, OFM-ONT — takes the validated brief and structures the execution. EFS-ONT (Epic-Feature-Story) decomposes VP solutions into buildable work items. PPM-ONT manages the programme portfolio. PE-ONT governs the engineering processes. LSC-ONT maps supply chains. OFM-ONT models operational fulfilment.',
    '',
    { h: 'The Critical Insight' },
    'The PRD is not written from scratch — it is composed from validated VE artefacts. Every epic traces to a VP solution. Every feature traces to a Kano-prioritised capability. Every acceptance criterion traces to a KPI target. The PE chain does not guess what to build — it executes what has been proven to matter.',
  ]);

  tblSlide(p, 'VE → PE Mapping — What Flows Across the Bridge',
    ['VE Artefact', 'Becomes', 'PE Artefact', 'Traceability'],
    [
      ['VSOM Strategy Pillar', '→', 'Programme Theme', 'Strategic alignment maintained'],
      ['OKR Key Result', '→', 'Programme Milestone', 'Success criteria preserved'],
      ['KPI Target', '→', 'Acceptance Criterion', 'Measurability preserved'],
      ['VP Solution', '→', 'EFS Epic', 'Customer value preserved'],
      ['VP Benefit (quantified)', '→', 'EFS Feature', 'Benefit decomposition'],
      ['Kano Must-Be Feature', '→', 'P0 Story (mandatory)', 'Priority preserved'],
      ['Kano Excitement Feature', '→', 'P2 Story (differentiator)', 'Priority preserved'],
      ['PMF Launch Readiness', '→', 'Release Gate Criteria', 'Market validation preserved'],
    ], { colW: [2.5, 0.4, 2.5, 3.2], rowH: 0.3 });

  // ── SECTION 5: PROGRAMME TO POC ──
  divSlide(p, '05', 'Programme to PoC', 'The builder phase — from validated brief to working proof');

  bulSlide(p, 'The Programme Manager Takes the Baton', [
    { h: 'Phase 1: PRD Composition (EFS-ONT)' },
    'The Programme Manager/Builder receives the validated product brief and decomposes it using EFS-ONT: Epics → Features → User Stories → Acceptance Criteria. Each decomposition step maintains traceability to the originating VP solution, Kano priority, and KPI target. Nothing is added that cannot be traced back to validated need.',
    '',
    { h: 'Phase 2: Programme Planning (PPM-ONT)' },
    'PPM-ONT structures the programme: phases, sprints, dependencies, resource allocation, risk management. The portfolio lens (PORTFOLIO-ONT from VSOM-SA) ensures this programme is positioned correctly against other initiatives — BCG matrix placement, three-horizon alignment, investment justification all carried forward from the VE analysis.',
    '',
    { h: 'Phase 3: PoC Execution' },
    'The PoC is not a demo — it is a structured test of the PMF hypothesis. Success criteria come directly from PMF-ONT launch readiness gates. KPI targets from KPI-ONT define what "working" means. The PoC either validates the proposition or generates structured feedback that loops back to the VE chain for iteration. This is not waterfall — it is a validated learning loop.',
  ]);

  bulSlide(p, 'The Complete Journey — Idea to PoC in One Traversable Graph', [
    { h: 'The Flow' },
    'Vision (VSOM) → Strategy Pillars → Objectives (OKR) → Measurable Results → KPIs (BSC-aligned) → Value Propositions (VP) → Customer Pains & Solutions → Feature Priorities (Kano) → Market Validation (PMF) → Product Brief → PRD (EFS) → Programme Plan (PPM) → PoC Execution → Validation Loop',
    '',
    { h: 'What Makes This Different' },
    'Every arrow in that flow is a typed, traversable relationship in a knowledge graph. Not a document reference. Not a hyperlink. Not an implicit assumption. A formal ontological relationship that can be queried, validated, composed, and governed — by humans or by AI agents.',
    '',
    { h: 'The Implication for Agentic AI' },
    'An AI agent with access to this graph can generate a strategy deck, compose a PRD, recommend feature priorities, assess market fit, and produce a programme plan — all grounded in the same connected knowledge. The VE skill chain is not just a methodology for humans. It is the instruction set for intelligent systems.',
  ]);

  // ── SECTION 6: STRATEGIC NEURAL GRAPH ──
  divSlide(p, '06', 'The Strategic Neural Graph', 'Why this works at scale — the Unified Registry as connective tissue');

  bulSlide(p, 'The Unified Registry Graph Makes This Repeatable', [
    { h: 'The Registry: 52+ Ontologies, 5 Series, One Connected Graph' },
    'The Unified Registry (ont-registry-index.json) is not a catalogue — it is a live index of every ontology in the platform. VE-Series (17 ontologies), PE-Series (15), RCSG-Series (10), Foundation (11), Orchestration (3). Each ontology declares its imports, cross-references, and join patterns. The registry is the schema of the Strategic Neural Graph.',
    '',
    { h: 'What Is the Strategic Neural Graph?' },
    'It is the emergent knowledge graph formed when all ontology instances are loaded and their cross-references resolved. Vision connects to strategy connects to objectives connects to KPIs connects to value propositions connects to features connects to acceptance criteria connects to test results. The "neural" metaphor is apt: each ontology is a specialised region, and the cross-ontology relationships are the synapses.',
    '',
    { h: 'Why "Neural" — Not Just "Knowledge Graph"' },
    'Because the graph is not static. EMC-ONT (Enterprise Model Composition) orchestrates which subgraphs are active for a given context. Scope rules determine what each PFI instance sees. The graph adapts to context — just as neural pathways strengthen with use. When a BAIV agent composes a strategy deck, it traverses a different subgraph than when a W4M-WWG agent plans a supply corridor. Same neural graph, different activation patterns.',
  ]);

  bulSlide(p, 'Five PFI Instances, One Platform, Infinite Configurations', [
    { h: 'The PFI Instance Model' },
    'Each Platform Foundation Instance (PFI) — BAIV, W4M-WWG, W4M-EOMS, AIRL-CAF-AZA, VHF — declares its own subset of the graph via instanceOntologies. BAIV uses 16 ontologies across PRODUCT, COMPETITIVE, and STRATEGIC compositions. W4M-WWG uses 7 across PRODUCT, FULFILMENT, and COMPETITIVE. Each sees the platform through its own lens.',
    '',
    { h: 'The Cascade: PFC → PFI → Product → Client' },
    'Configuration cascades from PF-Core (platform defaults) → PFI Instance (brand + ontology selection) → Product (specific application) → Client (white-label customisation). The VE skill chain runs at every level. A PFI instance has its own VSOM. Its own VP. Its own KPIs. The methodology is universal; the content is instance-specific.',
    '',
    { h: 'Scale Without Repetition' },
    'When a new PFI instance is onboarded, it does not start from scratch. It inherits the VE skill chain methodology, the PE execution framework, the GRC compliance layer, and the DS design tokens — all from PFC Core. It adds its own VSOM vision, VP customer profiles, and Kano feature priorities. The idea-to-PoC pipeline is ready on day one.',
  ]);

  // ── SUMMARY ──
  bulSlide(p, 'Summary — The VE Skill Chain Closes the Strategy-Execution Gap', [
    { h: 'The Chain' },
    'VSOM → OKR → KPI → VP → Kano → PMF. Six ontologies. Each stage validates and enriches the last. The output is not a document — it is a connected, traversable, machine-readable knowledge graph.',
    { h: 'The Bridge' },
    'VE produces validated product briefs. PE consumes them. Every epic, feature, and story traces back to a validated customer need, a strategic objective, and a measurable KPI.',
    { h: 'The Builder' },
    'Programme Manager decomposes the PRD via EFS-ONT, plans via PPM-ONT, and executes the PoC against PMF-validated success criteria. The loop closes when PoC results feed back to VE.',
    { h: 'The Neural Graph' },
    'The Strategic Neural Graph — powered by the Unified Registry — makes this repeatable across PFI instances. Same methodology, instance-specific content, infinite configurations.',
    { h: 'The Bottom Line' },
    'Ideas die in the gap between strategy and execution. The VE skill chain eliminates that gap — not with process, but with structure. Every decision is traceable. Every assumption is testable. Every artefact is connected.',
  ]);

  // ── CLOSING ──
  const cl = p.addSlide(); cl.background = { fill: C.navy };
  cl.addText('Strategy Is Only as Good as Its Structure', { x: 0.8, y: 2.0, w: 8.4, h: 1.0, fontSize: 32, fontFace: FONT, color: C.w, bold: true, align: 'center' });
  cl.addText('VE Skill Chain • Strategic Neural Graph • Unified Registry', { x: 0.8, y: 3.2, w: 8.4, h: 0.5, fontSize: 14, fontFace: FONT, color: C.teal, align: 'center' });
  cl.addText('PF-Core Platform Foundation • Generated March 2026', { x: 0.8, y: 3.8, w: 8.4, h: 0.4, fontSize: 11, fontFace: FONT, color: C.mg, align: 'center' });

  await p.writeFile({ fileName: OUT });
  console.log(`DONE: ${OUT} (${p.slides.length} slides)`);
}

main().catch(e => { console.error(e); process.exit(1); });
