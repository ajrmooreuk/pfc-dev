/**
 * URG Panel e2e Slide Deck Generator
 * Builds a PPTX from the Playwright screenshot artefacts.
 * Output: PBS/STRATEGY/exports/PFC-PBS-SLIDEDECK-URG-Panel-e2e-Tests-v1.0.0.pptx
 *
 * Usage: node tests/e2e/build-slidedeck.mjs
 */

import pptxgen from 'pptxgenjs';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT   = resolve(__dirname, '../../../../../');
const SHOTS_DIR   = resolve(__dirname, 'screenshots');
const OUTPUT_PATH = resolve(REPO_ROOT, 'PBS/STRATEGY/exports/PFC-PBS-SLIDEDECK-URG-Panel-e2e-Tests-v1.0.0.pptx');
const GITHUB_BLOB = 'https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/TOOLS/ontology-visualiser/tests/e2e/screenshots/';
const TODAY       = new Date().toISOString().slice(0, 10);

// ─── Slide metadata per screenshot ──────────────────────────────────────────

const SLIDES = [
  {
    file: '01-tracker-panel-open.png',
    section: 'Programme Tracker Panel',
    title: '01 — Panel Opens: Epics Displayed',
    note: 'toggleProgrammeTrackerPanel() → waitForPanel → .tracker-epic-row visible. TC-01.',
  },
  {
    file: '02-tracker-filter-open.png',
    section: 'Programme Tracker Panel',
    title: '02 — Filter: Open Epics',
    note: 'setTrackerFilter("open") → no closed badges. TC-02.',
  },
  {
    file: '03-tracker-filter-no-open-features.png',
    section: 'Programme Tracker Panel',
    title: '03 — Filter: No-Open-Features Epics',
    note: 'setTrackerFilter("no-open-features"). TC-03.',
  },
  {
    file: '04-tracker-filter-closed.png',
    section: 'Programme Tracker Panel',
    title: '04 — Filter: Closed Epics',
    note: 'setTrackerFilter("closed"). TC-04.',
  },
  {
    file: '05a-tracker-epic-expanded.png',
    section: 'Programme Tracker Panel',
    title: '05a — Epic Expanded: Feature Rows Visible',
    note: 'toggleTrackerEpic(firstEpicId) → feature rows in DOM. TC-05.',
  },
  {
    file: '05b-tracker-epic-collapsed.png',
    section: 'Programme Tracker Panel',
    title: '05b — Epic Collapsed: Feature Rows Hidden',
    note: 'toggleTrackerEpic(firstEpicId) (second call) → collapsed. TC-05.',
  },
  {
    file: '06-tracker-panel-closed.png',
    section: 'Programme Tracker Panel',
    title: '06 — Panel Closed',
    note: 'toggleProgrammeTrackerPanel() → #programme-tracker-panel hidden. TC-06.',
  },
  {
    file: '07-docregister-panel-open.png',
    section: 'Document Register Panel',
    title: '07 — Panel Opens: Document Groups Displayed',
    note: 'toggleDocumentRegisterPanel() → .doc-group-header visible. TC-07.',
  },
  {
    file: '08-docregister-filter-BRIEF.png',
    section: 'Document Register Panel',
    title: '08 — Type Filter: BRIEF Documents',
    note: 'setDocRegTypeFilter("BRIEF") → BRIEF docs only. TC-08.',
  },
  {
    file: '09-docregister-filter-active.png',
    section: 'Document Register Panel',
    title: '09 — Status Filter: Active Documents',
    note: 'setDocRegStatusFilter("Active") → Active docs only. TC-09.',
  },
  {
    file: '10a-docregister-group-expanded.png',
    section: 'Document Register Panel',
    title: '10a — Group Expanded: Document Rows Visible',
    note: 'toggleDocGroup(firstCode) → doc-register-row elements visible. TC-10.',
  },
  {
    file: '10b-docregister-group-collapsed.png',
    section: 'Document Register Panel',
    title: '10b — Group Collapsed',
    note: 'toggleDocGroup(firstCode) (second call) → rows removed from DOM. TC-10.',
  },
  {
    file: '11-docregister-document-links.png',
    section: 'Document Register Panel',
    title: '11 — Document Links: GitHub URLs Verified',
    note: 'a[href*="github.com/ajrmooreuk"] count > 0. href contains ajrmooreuk/Azlan-EA-AAA. TC-11.',
  },
  {
    file: '12-docregister-panel-closed.png',
    section: 'Document Register Panel',
    title: '12 — Panel Closed',
    note: 'toggleDocumentRegisterPanel() → #document-register-panel hidden. TC-12.',
  },
  {
    file: '13-both-panels-open-programme-review.png',
    section: 'Both Panels — Programme Review Layout (SOP-URG-06)',
    title: '13 — Both Panels Open: Programme Review Layout',
    note: 'toggleProgrammeTrackerPanel() + toggleDocumentRegisterPanel() → both visible. TC-13 / SOP-URG-06.',
  },
];

// ─── Colour palette ──────────────────────────────────────────────────────────

const C = {
  bg:        '0F1117',
  surface:   '1A1D27',
  accent:    '818CF8',
  text:      'E2E8F0',
  subtext:   '94A3B8',
  border:    '2A2D37',
  sectionBg: '1E213A',
  white:     'FFFFFF',
  pass:      '34D399',
};

// ─── Build deck ──────────────────────────────────────────────────────────────

const prs = new pptxgen();
prs.layout = 'LAYOUT_WIDE'; // 13.33" × 7.5"
prs.author = 'PFC Platform Foundation Core';
prs.company = 'Azlan-EA-AAA';
prs.subject = 'URG Panel e2e Test Evidence';
prs.title   = 'PFC-PBS-SLIDEDECK-URG-Panel-e2e-Tests-v1.0.0';

// ── Cover slide ──────────────────────────────────────────────────────────────

const cover = prs.addSlide();
cover.background = { color: C.bg };

// Accent bar left
cover.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.08, h: 7.5, fill: { color: C.accent } });

// Title
cover.addText('URG Programme Management Panels', {
  x: 0.35, y: 1.6, w: 12.5, h: 0.9,
  fontSize: 32, bold: true, color: C.white, fontFace: 'Segoe UI',
});

// Subtitle
cover.addText('Playwright e2e Test Evidence — 13/13 Passing', {
  x: 0.35, y: 2.6, w: 12.5, h: 0.5,
  fontSize: 18, color: C.accent, fontFace: 'Segoe UI',
});

// Metadata block
const meta = [
  `Date: ${TODAY}`,
  'Epic: 46 (#683)  ·  F46.3 (#686)  ·  S.URG.6/7/8',
  'Target: https://ajrmooreuk.github.io/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/browser-viewer.html',
  `Screenshots: ${GITHUB_BLOB}`,
].join('\n');
cover.addText(meta, {
  x: 0.35, y: 3.4, w: 12.5, h: 1.6,
  fontSize: 11, color: C.subtext, fontFace: 'Courier New',
  valign: 'top',
});

// Pass badge
cover.addShape(prs.ShapeType.roundRect, {
  x: 0.35, y: 5.4, w: 2.4, h: 0.55,
  fill: { color: C.pass }, rectRadius: 0.08,
});
cover.addText('✓  13 / 13  PASS', {
  x: 0.35, y: 5.4, w: 2.4, h: 0.55,
  fontSize: 14, bold: true, color: C.bg, align: 'center', valign: 'middle',
  fontFace: 'Segoe UI',
});

// Footer
cover.addText(`PFC Platform Foundation Core  ·  ${TODAY}  ·  v1.0.0`, {
  x: 0.35, y: 7.1, w: 12.6, h: 0.3,
  fontSize: 9, color: C.border, fontFace: 'Segoe UI',
});

// ── Section + screenshot slides ───────────────────────────────────────────────

let currentSection = '';

for (let i = 0; i < SLIDES.length; i++) {
  const s = SLIDES[i];
  const imgPath = resolve(SHOTS_DIR, s.file);
  const imgData = readFileSync(imgPath);
  const imgBase64 = imgData.toString('base64');

  // ── Section divider when section changes ──
  if (s.section !== currentSection) {
    currentSection = s.section;
    const sec = prs.addSlide();
    sec.background = { color: C.sectionBg };
    sec.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.08, h: 7.5, fill: { color: C.accent } });
    sec.addText(currentSection, {
      x: 0.5, y: 2.8, w: 12.3, h: 1.0,
      fontSize: 28, bold: true, color: C.white, fontFace: 'Segoe UI',
    });
    sec.addText(`${SLIDES.filter(x => x.section === currentSection).length} test scenarios`, {
      x: 0.5, y: 3.9, w: 12.3, h: 0.5,
      fontSize: 15, color: C.accent, fontFace: 'Segoe UI',
    });
    sec.addText(`PFC Platform Foundation Core  ·  ${TODAY}`, {
      x: 0.35, y: 7.1, w: 12.6, h: 0.3,
      fontSize: 9, color: C.border,
    });
  }

  // ── Screenshot slide ──
  const slide = prs.addSlide();
  slide.background = { color: C.bg };

  // Top header bar
  slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.55, fill: { color: C.surface } });
  slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.08, h: 0.55, fill: { color: C.accent } });

  // Slide number badge
  const numStr = String(i + 1).padStart(2, '0');
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.15, y: 0.08, w: 0.38, h: 0.38,
    fill: { color: C.accent }, rectRadius: 0.04,
  });
  slide.addText(numStr, {
    x: 0.15, y: 0.08, w: 0.38, h: 0.38,
    fontSize: 11, bold: true, color: C.bg, align: 'center', valign: 'middle',
    fontFace: 'Segoe UI',
  });

  // Title in header
  slide.addText(s.title, {
    x: 0.65, y: 0.08, w: 9.8, h: 0.38,
    fontSize: 13, bold: true, color: C.white, valign: 'middle',
    fontFace: 'Segoe UI',
  });

  // GitHub link in header (right)
  slide.addText(s.file, {
    x: 10.55, y: 0.08, w: 2.65, h: 0.38,
    fontSize: 8, color: C.accent, valign: 'middle', align: 'right',
    fontFace: 'Courier New',
    hyperlink: { url: `${GITHUB_BLOB}${s.file}` },
  });

  // Screenshot image — centred in remaining space
  slide.addImage({
    data: `image/png;base64,${imgBase64}`,
    x: 0.2, y: 0.65, w: 12.93, h: 6.35,
    sizing: { type: 'contain', w: 12.93, h: 6.35 },
  });

  // Footer bar
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: 7.18, w: 13.33, h: 0.32, fill: { color: C.surface },
  });
  slide.addText(s.note, {
    x: 0.15, y: 7.19, w: 10.5, h: 0.28,
    fontSize: 8, color: C.subtext, valign: 'middle',
    fontFace: 'Courier New',
  });
  slide.addText(`${i + 1} / ${SLIDES.length}`, {
    x: 12.8, y: 7.19, w: 0.45, h: 0.28,
    fontSize: 8, color: C.border, align: 'right', valign: 'middle',
  });
}

// ── Summary slide ─────────────────────────────────────────────────────────────

const summary = prs.addSlide();
summary.background = { color: C.bg };
summary.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.08, h: 7.5, fill: { color: C.pass } });

summary.addText('Test Summary', {
  x: 0.35, y: 0.5, w: 12.5, h: 0.7,
  fontSize: 24, bold: true, color: C.white, fontFace: 'Segoe UI',
});

const rows = [
  ['', 'Test', 'Panel', 'Result'],
  ['01', 'Panel opens, epics render',                        'Tracker',       '✓ PASS'],
  ['02', 'Filter: open',                                     'Tracker',       '✓ PASS'],
  ['03', 'Filter: no-open-features',                         'Tracker',       '✓ PASS'],
  ['04', 'Filter: closed',                                   'Tracker',       '✓ PASS'],
  ['05', 'Epic expand → features visible → collapse',        'Tracker',       '✓ PASS'],
  ['06', 'Panel closes',                                     'Tracker',       '✓ PASS'],
  ['07', 'Panel opens, doc groups render (.doc-group-header)','Doc Register',  '✓ PASS'],
  ['08', 'Type filter: BRIEF',                               'Doc Register',  '✓ PASS'],
  ['09', 'Status filter: Active',                            'Doc Register',  '✓ PASS'],
  ['10', 'Group expand / collapse',                          'Doc Register',  '✓ PASS'],
  ['11', 'Document links → GitHub URLs verified',            'Doc Register',  '✓ PASS'],
  ['12', 'Panel closes',                                     'Doc Register',  '✓ PASS'],
  ['13', 'Both panels open (SOP-URG-06 programme review)',   'Both',          '✓ PASS'],
];

const colW = [0.55, 6.5, 2.8, 1.5];
const colX = [0.35, 0.95, 7.5, 10.35];
const rowH  = 0.35;
const startY = 1.35;

rows.forEach((row, ri) => {
  const isHeader = ri === 0;
  const bgColor  = isHeader ? C.sectionBg : (ri % 2 === 0 ? C.surface : C.bg);

  row.forEach((cell, ci) => {
    const y = startY + ri * rowH;
    summary.addShape(prs.ShapeType.rect, {
      x: colX[ci], y, w: colW[ci], h: rowH,
      fill: { color: bgColor },
    });
    summary.addText(cell, {
      x: colX[ci] + 0.05, y, w: colW[ci] - 0.08, h: rowH,
      fontSize: isHeader ? 10 : 9,
      bold: isHeader,
      color: isHeader ? C.accent : (ci === 3 ? C.pass : C.text),
      valign: 'middle',
      fontFace: ci === 0 ? 'Courier New' : 'Segoe UI',
    });
  });
});

summary.addText(`13 / 13 tests passing  ·  Chromium  ·  ${TODAY}  ·  Epic 46 (#683) F46.3 (#686)`, {
  x: 0.35, y: 7.1, w: 12.6, h: 0.3,
  fontSize: 9, color: C.subtext,
});

// ── Write file ────────────────────────────────────────────────────────────────

await prs.writeFile({ fileName: OUTPUT_PATH });
console.log(`✓ Written: ${OUTPUT_PATH}`);
console.log(`  Slides: 1 cover + ${SLIDES.length + [...new Set(SLIDES.map(s => s.section))].length} content + 1 summary = ${1 + SLIDES.length + [...new Set(SLIDES.map(s => s.section))].length + 1} total`);
