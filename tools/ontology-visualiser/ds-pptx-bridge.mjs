#!/usr/bin/env node
/**
 * ds-pptx-bridge.mjs — Bridge from DS-ONT instance JSONLD to pptxgenjs slide token palette.
 *
 * Architecture (3-layer cascade):
 *
 *   Slide template component property   →   Semantic token   →   Primitive (hex)
 *   (anatomical, colour-agnostic)           (brand intent)        (actual value)
 *
 * Component properties name the STRUCTURAL PART of the slide template — e.g.
 * `slide.background.fill`, `slide.heading.primary.color`. They carry no colour
 * implication. The semantic token cascade (per DS-ONT instance) determines what
 * colour that component gets for a given brand.
 *
 * The SLIDE_COMPONENT_TOKENS map below is an INTERIM configuration — once DS-ONT
 * v4.0.0 adds SlideDeckTemplate + SlideTemplateComponent entities, this mapping
 * will live in the ontology instance itself and be read dynamically.
 * See GitHub issue: F61.9 — DS-ONT SlideDeck Component Extension.
 *
 * @module ds-pptx-bridge
 */
import { readFileSync } from 'fs';

/**
 * Known DS-ONT instance files by brand short-code.
 * Paths relative to the ontology-library root.
 */
const BRAND_INSTANCES = {
  baiv: 'PE-Series/DS-ONT/instance-data/baiv-ds-instance-v1.0.0.jsonld',
  rcs:  'PE-Series/DS-ONT/instance-data/rcs-ds-instance-v1.0.0.jsonld',
  wwg:  'PE-Series/DS-ONT/instance-data/wwg-ds-instance-v1.0.0.jsonld',
  pand: 'PE-Series/DS-ONT/instance-data/pand-ds-instance-v1.0.0.jsonld',
  vhf:  'PE-Series/DS-ONT/instance-data/vhf-viridian-ds-instance-v1.0.0.jsonld'
};

const ONTOLOGY_LIB = new URL('../../ONTOLOGIES/ontology-library/', import.meta.url).pathname;

/**
 * Strip '#' prefix and return uppercase hex (pptxgenjs format).
 */
function toHex(cssColor) {
  if (!cssColor) return null;
  return cssColor.replace(/^#/, '').toUpperCase();
}

/**
 * Convert a CSS font-size value to points (pt) for pptxgenjs.
 *
 * Unit handling (Option A interim — see DS-ONT v3.2.0 proposal):
 *   rem string  → multiply by 12  (1rem = 16px = 12pt at 96dpi)
 *   px string   → multiply by 0.75 (1px = 0.75pt)
 *   plain number → treat as px, multiply by 0.75
 *                  (VHF uses px integers: 16→12pt, 24→18pt, 32→24pt)
 *
 * Returns a number (pt) rounded to 1 decimal place, or null if unparseable.
 * When DS-ONT v4.0.0 SlideRendererBinding is implemented, the SlideValueTransform
 * enum ('remToPt' | 'pxToPt') replaces this function.
 */
function toPt(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (str.endsWith('rem')) return Math.round(parseFloat(str) * 12 * 10) / 10;
  if (str.endsWith('px'))  return Math.round(parseFloat(str) * 0.75 * 10) / 10;
  const n = parseFloat(str);
  if (!isNaN(n)) return Math.round(n * 0.75 * 10) / 10;
  return null;
}

/**
 * Normalise a DS-ONT fontWeight primitive to a CSS-compatible numeric string.
 *
 * VHF uses string names ("Regular", "Bold") while BAIV/RCS/WWG use numerics (400/700).
 * Returns a numeric string always — pptxgenjs bold flag is set by caller comparing to 600.
 */
function toNumericWeight(value) {
  if (!value) return '400';
  const v = String(value).toLowerCase().trim();
  const MAP = { thin: '100', extralight: '200', light: '300', regular: '400',
                medium: '500', semibold: '600', bold: '700', extrabold: '800', black: '900' };
  return MAP[v] || (isNaN(Number(v)) ? '400' : v);
}

/**
 * Try each token name in order against semMap. Return first resolved hex, or null.
 */
function resolveSemanticToken(semMap, tokenNames) {
  for (const name of tokenNames) {
    const val = semMap[name];
    if (val) return toHex(val);
  }
  return null;
}

/**
 * Try each token name in order against primMap.
 * Applies optional transform: 'toPt' | 'toNumericWeight' | null (identity).
 * Returns transformed value, or null if not found.
 */
function resolvePrimitiveToken(primMap, tokenNames, transform) {
  for (const name of tokenNames) {
    const val = primMap[name];
    if (val !== undefined && val !== '') {
      if (transform === 'toPt') return toPt(val);
      if (transform === 'toNumericWeight') return toNumericWeight(val);
      return val;
    }
  }
  return null;
}

/**
 * SLIDE_COMPONENT_TOKENS
 *
 * Maps each slide template component property to:
 *   tokens:   ordered list of semantic token names to try (first hit wins)
 *   fallback: hardcoded hex used when all token lookups fail
 *
 * Property naming convention: <component>.<sub-component>.<css-property>
 * All names are anatomical (structural) — no colour terms.
 *
 * D1 DECIDED (2026-03-09): Light backgrounds — primary.surface.subtle with
 * neutral.surface.subtle fallback. This inverts the text token cascade:
 * dark brand tones and neutral.text.caption replace the former near-white
 * neutral.text.negative tokens. See F61.11 (#981) for contrast validation.
 *
 * DS-ONT v3.1.0 DATA NOTE: VHF primary.surface.subtle (#9dfff5) is oversaturated
 * for a background role. The neutral.surface.subtle fallback (#f2f1f1) applies
 * automatically and is the correct value for VHF until the DS-ONT instance is
 * corrected in a future DS-ONT data update.
 *
 * INTERIM: Once DS-ONT v4.0.0 SlideDeckTemplate entities are in place, this map
 * is replaced by dynamic resolution from the ontology instance.
 */
const SLIDE_COMPONENT_TOKENS = {

  // ── Slide backgrounds ───────────────────────────────────────────────────────
  // D1: Light slides — brand-tinted subtle surface, neutral fallback.
  // VHF: primary.surface.subtle is oversaturated; neutral.surface.subtle applies.
  'slide.background.fill': {
    tokens: ['primary.surface.subtle', 'neutral.surface.subtle'],
    fallback: 'F5F5F5'
  },
  // Divider slide: brand dark as a contrast reversal anchor on light theme.
  'slide.divider.background.fill': {
    tokens: ['primary.surface.darker', 'primary.surface.default'],
    fallback: '1A1A2E'
  },
  'slide.content.background.fill': {
    tokens: ['neutral.surface.subtle', 'neutral.surface.default'],
    fallback: 'F4F6F8'
  },

  // ── Heading text ────────────────────────────────────────────────────────────
  // D1 inversion: dark brand heading on light bg. primary.surface.darker gives
  // ~6-7:1 contrast on primary.surface.subtle across all brands (AA pass).
  // H1 vs H2 hierarchy is achieved via font size/weight, not colour.
  // DS-ONT v3.1.0 lacks neutral.text.default/label — neutral.text.caption is
  // the best available dark text token as fallback.
  'slide.heading.primary.color': {
    tokens: ['primary.surface.darker', 'neutral.text.caption'],
    fallback: '1A1A2E'
  },
  'slide.heading.secondary.color': {
    tokens: ['primary.surface.darker', 'neutral.text.caption'],
    fallback: '1A1A2E'
  },
  // D5 PENDING (#983): DD must confirm correct semantic token for highlight/gold role.
  // No hardcoded hex fallback permitted — all values must resolve from DS-ONT cascade.
  // Current: secondary.surface.default resolves for all 4 known brands (no fallback hit).
  // warning.surface.default is the interim semantic fallback; FFB703 placeholder only —
  // must be replaced with a guaranteed GATE-3 semantic token before F61.11 can close.
  'slide.heading.highlight.color': {
    tokens: ['secondary.surface.default', 'warning.surface.default'],
    fallback: 'FFB703' // TODO #983: replace with semantic token — no hardcoded colours
  },

  // ── Body and supporting text ────────────────────────────────────────────────
  // D1 inversion: neutral.text.caption (dark grey) is now correct context.
  // This token was the D4 failure on dark slides — it is the right token here.
  'slide.body.text.color': {
    tokens: ['neutral.text.caption'],
    fallback: '3D3D3D'
  },
  'slide.label.text.color': {
    tokens: ['neutral.text.caption'],
    fallback: '636E6E'
  },
  'slide.caption.text.color': {
    tokens: ['neutral.text.caption'],
    fallback: '636E6E'
  },

  // ── Accent and brand marks ──────────────────────────────────────────────────
  'slide.accent.bar.fill': {
    tokens: ['primary.surface.default'],
    fallback: '00B4D8'
  },

  // ── Data visualisation series ────────────────────────────────────────────────
  'slide.data.series.primary.fill': {
    tokens: ['primary.surface.default'],
    fallback: '00B4D8'
  },
  'slide.data.series.secondary.fill': {
    tokens: ['secondary.surface.default', 'warning.surface.default'],
    fallback: 'FFB703'
  },
  'slide.data.series.tertiary.fill': {
    tokens: ['tertiary.surface.default', 'information.surface.default'],
    fallback: '6C63FF'
  },

  // ── Status indicators ────────────────────────────────────────────────────────
  'slide.status.success.fill': {
    tokens: ['success.surface.default'],
    fallback: '2ECC71'
  },
  'slide.status.warning.fill': {
    tokens: ['warning.surface.default'],
    fallback: 'F39C12'
  },
  'slide.status.error.fill': {
    tokens: ['error.surface.default'],
    fallback: 'E74C3C'
  },
  'slide.status.info.fill': {
    tokens: ['information.surface.default'],
    fallback: '3498DB'
  }
};

/**
 * Slide typography component properties — resolved from DS-ONT primitives.
 *
 * Option A implementation (2026-03-09): expand beyond font-family to include
 * size (converted to pt), weight (normalised to numeric), and line-height.
 *
 * Each entry has:
 *   tokens:    ordered primitive token names to try (first hit wins)
 *   fallback:  value used when all tokens absent (already in correct output format)
 *   transform: 'toPt' | 'toNumericWeight' | undefined (identity)
 *
 * Slide-role → token-tier mapping (INTERIM — will move to DS-ONT v4.0.0
 * SlideTemplateComponent entities once F61.9 is implemented):
 *
 *   slide.heading.primary  → title/display text (H1): fontSize.3xl, bold
 *   slide.heading.secondary → sub-heading (H2): fontSize.2xl, bold
 *   slide.body             → body paragraph: fontSize.base, regular
 *   slide.label            → label / caption above data: fontSize.sm, semibold
 *   slide.caption          → footnote / attribution: fontSize.xs, regular
 *
 * Unit note: BAIV/RCS/WWG primitives are rem strings (1rem=12pt at 96dpi).
 *            VHF primitives are px integers (16→12pt, 24→18pt etc).
 *            toPt() handles both automatically.
 *
 * Weight note: VHF uses string names ("Regular"/"Bold"); others use numerics.
 *              toNumericWeight() normalises to CSS numeric string.
 *              Caller determines bold flag: weight >= 600 → bold: true.
 */
const SLIDE_TYPOGRAPHY_TOKENS = {

  // ── Font families ────────────────────────────────────────────────────────────
  'slide.heading.font.family': {
    tokens: ['typography.fontFamily.headings'],
    fallback: 'Helvetica Neue'
  },
  'slide.body.font.family': {
    tokens: ['typography.fontFamily.body'],
    fallback: 'Helvetica Neue'
  },
  // VHF uniquely defines typography.fontFamily.captions (Open Sans).
  // Other brands fall back to body family — correct default.
  'slide.caption.font.family': {
    tokens: ['typography.fontFamily.captions', 'typography.fontFamily.body'],
    fallback: 'Helvetica Neue'
  },
  'slide.mono.font.family': {
    tokens: ['typography.fontFamily.mono'],
    fallback: 'Courier New'
  },

  // ── Font sizes (converted to pt) ─────────────────────────────────────────────
  // Slide title / H1 display text
  'slide.heading.primary.font.size': {
    tokens: ['typography.fontSize.3xl'],
    fallback: 22.5,
    transform: 'toPt'
  },
  // Sub-heading / H2
  'slide.heading.secondary.font.size': {
    tokens: ['typography.fontSize.2xl'],
    fallback: 18,
    transform: 'toPt'
  },
  // Body paragraph
  'slide.body.font.size': {
    tokens: ['typography.fontSize.base'],
    fallback: 12,
    transform: 'toPt'
  },
  // Label / data caption above chart or table
  'slide.label.font.size': {
    tokens: ['typography.fontSize.sm'],
    fallback: 10.5,
    transform: 'toPt'
  },
  // Footnote / attribution / smallest tier
  'slide.caption.font.size': {
    tokens: ['typography.fontSize.xs'],
    fallback: 9,
    transform: 'toPt'
  },

  // ── Font weights (normalised to numeric CSS string) ──────────────────────────
  // Headings always bold across all brands
  'slide.heading.font.weight': {
    tokens: ['typography.fontWeight.bold'],
    fallback: '700',
    transform: 'toNumericWeight'
  },
  // Label: semibold if available (BAIV only), else medium, else bold
  'slide.label.font.weight': {
    tokens: ['typography.fontWeight.semibold', 'typography.fontWeight.medium', 'typography.fontWeight.bold'],
    fallback: '600',
    transform: 'toNumericWeight'
  },
  // Body and caption: regular weight
  'slide.body.font.weight': {
    tokens: ['typography.fontWeight.regular'],
    fallback: '400',
    transform: 'toNumericWeight'
  },
  'slide.caption.font.weight': {
    tokens: ['typography.fontWeight.regular'],
    fallback: '400',
    transform: 'toNumericWeight'
  },

  // ── Line heights (multiplier — pptxgenjs lineSpacingMultiple) ────────────────
  // VHF has no lineHeight tokens — fallback applies (tight for headings, normal for body)
  'slide.heading.line.height': {
    tokens: ['typography.lineHeight.tight'],
    fallback: 1.25
  },
  'slide.body.line.height': {
    tokens: ['typography.lineHeight.normal'],
    fallback: 1.5
  },
  'slide.caption.line.height': {
    tokens: ['typography.lineHeight.relaxed'],
    fallback: 1.75
  }
};

/**
 * DOCUMENT_TYPOGRAPHY_STYLES
 *
 * Relative heading level hierarchy — shared semantic layer for ALL document types.
 * Maps heading.1–heading.6, body.default, label.default, caption.default,
 * toc.heading, and mono.default to their full style definition:
 * font-family, font-size (pt), font-weight, line-height, and colour.
 *
 * This is the renderer-agnostic component typography class. Renderer bindings
 * (SlideRendererBinding, DocumentRendererBinding) translate these to:
 *   PPTX:        fontSize (pt), bold boolean, lineSpacingMultiple
 *   HTML:        <hN> element, rem values via identity transform
 *   Word (OOXML): Heading N / Normal styles, half-point /w:sz values
 *   Google Slides: textStyle.fontSize.magnitude, namedStyleType
 *   GDocs:       paragraphStyle.namedStyleType + textStyle
 *
 * Slide role → heading level mapping (INTERIM — moves to DS-ONT v4.0.0
 * SlideTemplateComponent once F61.9 is implemented):
 *   slide.heading.primary   → heading.1  (slide title / display)
 *   slide.heading.secondary → heading.2  (slide sub-title / section)
 *   slide.body              → body.default
 *   slide.label             → label.default
 *   slide.caption           → caption.default
 *   slide.mono              → mono.default
 *
 * Colour hierarchy (light-background context, D1 decided):
 *   heading.1–3: primary.surface.darker  (brand dark — AAA on subtle bg)
 *   heading.4–6: neutral.text.caption    (neutral grey — AA on subtle bg)
 *   body/label/caption: neutral.text.caption
 *   toc.heading: primary.surface.darker
 *
 * Each property spec:
 *   tokens:    ordered DS-ONT token names (first resolved wins)
 *   source:    'sem' (semMap/semantic) | 'prim' (primMap/primitive)
 *   fallback:  used when all tokens absent; already in correct output format
 *   transform: 'toPt' | 'toNumericWeight' | undefined (identity)
 */
const DOCUMENT_TYPOGRAPHY_STYLES = {

  'heading.1': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.headings'], fallback: 'Helvetica Neue' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.3xl'],        fallback: 22.5,  transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.bold'],     fallback: '700', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.tight'],    fallback: 1.25 },
    'color':       { source: 'sem',  tokens: ['primary.surface.darker', 'neutral.text.caption'], fallback: '1A1A2E' }
  },

  'heading.2': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.headings'], fallback: 'Helvetica Neue' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.2xl'],        fallback: 18,    transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.bold'],     fallback: '700', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.tight'],    fallback: 1.25 },
    'color':       { source: 'sem',  tokens: ['primary.surface.darker', 'neutral.text.caption'], fallback: '1A1A2E' }
  },

  'heading.3': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.headings'], fallback: 'Helvetica Neue' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.xl'],         fallback: 15,    transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.semibold', 'typography.fontWeight.bold'], fallback: '600', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.tight'],    fallback: 1.25 },
    'color':       { source: 'sem',  tokens: ['primary.surface.darker', 'neutral.text.caption'], fallback: '1A1A2E' }
  },

  'heading.4': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.headings'], fallback: 'Helvetica Neue' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.lg'],         fallback: 13.5,  transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.semibold', 'typography.fontWeight.medium', 'typography.fontWeight.bold'], fallback: '600', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.normal'],   fallback: 1.5 },
    'color':       { source: 'sem',  tokens: ['neutral.text.caption'],           fallback: '636E6E' }
  },

  'heading.5': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.headings'], fallback: 'Helvetica Neue' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.base'],       fallback: 12,    transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.semibold', 'typography.fontWeight.medium', 'typography.fontWeight.bold'], fallback: '600', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.normal'],   fallback: 1.5 },
    'color':       { source: 'sem',  tokens: ['neutral.text.caption'],           fallback: '636E6E' }
  },

  'heading.6': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.body'],     fallback: 'Helvetica Neue' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.sm'],         fallback: 10.5,  transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.semibold', 'typography.fontWeight.medium', 'typography.fontWeight.bold'], fallback: '600', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.normal'],   fallback: 1.5 },
    'color':       { source: 'sem',  tokens: ['neutral.text.caption'],           fallback: '636E6E' }
  },

  'body.default': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.body'],     fallback: 'Helvetica Neue' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.base'],       fallback: 12,    transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.regular'],  fallback: '400', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.normal'],   fallback: 1.5 },
    'color':       { source: 'sem',  tokens: ['neutral.text.caption'],           fallback: '636E6E' }
  },

  'label.default': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.body'],     fallback: 'Helvetica Neue' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.sm'],         fallback: 10.5,  transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.semibold', 'typography.fontWeight.medium', 'typography.fontWeight.bold'], fallback: '600', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.tight'],    fallback: 1.25 },
    'color':       { source: 'sem',  tokens: ['neutral.text.caption'],           fallback: '636E6E' }
  },

  // VHF: typography.fontFamily.captions = Open Sans (unique — others fall back to body)
  'caption.default': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.captions', 'typography.fontFamily.body'], fallback: 'Helvetica Neue' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.xs'],         fallback: 9,     transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.regular'],  fallback: '400', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.relaxed'],  fallback: 1.75 },
    'color':       { source: 'sem',  tokens: ['neutral.text.caption'],           fallback: '636E6E' }
  },

  // Document table-of-contents heading — Word TOC Heading style / HTML nav title
  'toc.heading': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.headings'], fallback: 'Helvetica Neue' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.lg'],         fallback: 13.5,  transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.bold'],     fallback: '700', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.normal'],   fallback: 1.5 },
    'color':       { source: 'sem',  tokens: ['primary.surface.darker', 'neutral.text.caption'], fallback: '1A1A2E' }
  },

  // Monospace — code blocks, data tables, technical slide content
  'mono.default': {
    'font.family': { source: 'prim', tokens: ['typography.fontFamily.mono'],     fallback: 'Courier New' },
    'font.size':   { source: 'prim', tokens: ['typography.fontSize.sm'],         fallback: 10.5,  transform: 'toPt' },
    'font.weight': { source: 'prim', tokens: ['typography.fontWeight.regular'],  fallback: '400', transform: 'toNumericWeight' },
    'line.height': { source: 'prim', tokens: ['typography.lineHeight.normal'],   fallback: 1.5 },
    'color':       { source: 'sem',  tokens: ['neutral.text.caption'],           fallback: '636E6E' }
  }
};

/**
 * Slide role → document heading style alias map.
 *
 * Establishes the link between slide-specific component roles and the shared
 * document heading level hierarchy. Allows slide generators to address either
 * the slide role ('slide.heading.primary.font.size') or the heading level
 * ('heading.1.font.size') and get the same resolved value.
 *
 * INTERIM until DS-ONT v4.0.0 SlideTemplateComponent entities (F61.9 #978).
 * At that point this map moves into the ontology instance as explicit
 * ds:ComponentToken → ds:TypographyStyle references.
 */
const SLIDE_ROLE_HEADING_MAP = {
  'slide.heading.primary':   'heading.1',
  'slide.heading.secondary': 'heading.2',
  'slide.body':              'body.default',
  'slide.label':             'label.default',
  'slide.caption':           'caption.default',
  'slide.mono':              'mono.default'
};

/**
 * Load and parse a DS-ONT instance JSONLD file.
 * Returns raw token maps for downstream resolution.
 *
 * @param {string} brand    - Brand short-code (baiv, rcs, wwg, pand, vhf)
 * @param {string} [filePath] - Override: absolute path to JSONLD file
 * @returns {{ semMap: Object, primMap: Object, typography: Object }}
 */
export function loadBrandTokens(brand, filePath) {
  const path = filePath || (ONTOLOGY_LIB + BRAND_INSTANCES[brand]);
  const jsonld = JSON.parse(readFileSync(path, 'utf8'));
  const graph = jsonld['@graph'] || [];

  // Semantic token map: tokenName → lightModeValue
  const semMap = {};
  for (const node of graph) {
    if (node['@type'] === 'ds:SemanticToken') {
      const name  = node['ds:tokenName'] || '';
      const value = node['ds:lightModeValue'] || '';
      if (name && value) semMap[name] = value;
    }
  }

  // Primitive token map: tokenName → value
  const primMap = {};
  for (const node of graph) {
    if (node['@type'] === 'ds:PrimitiveToken') {
      const name  = node['ds:tokenName'] || '';
      const value = node['ds:value'] || '';
      if (name && value) primMap[name] = value;
    }
  }

  // Typography convenience object — kept for loadBrandTokens consumers
  const typography = {
    headings: primMap['typography.fontFamily.headings'] || 'Helvetica Neue',
    body:     primMap['typography.fontFamily.body']     || 'Helvetica Neue',
    mono:     primMap['typography.fontFamily.mono']     || 'Courier New'
  };

  return { semMap, primMap, typography };
}

/**
 * Build the slide template token object — primary export.
 *
 * Returns a flat object keyed by slide template component property names.
 * All colour values are uppercase hex without '#' prefix (pptxgenjs format).
 * All lookups use the semantic token cascade with hardcoded fallbacks.
 *
 * @param {string} brand    - Brand short-code
 * @param {string} [filePath] - Override path
 * @returns {Object} Flat map of component property → resolved value
 */
export function buildSlideTemplateTokens(brand, filePath) {
  const { semMap, primMap } = loadBrandTokens(brand, filePath);
  const resolved = {};

  for (const [prop, spec] of Object.entries(SLIDE_COMPONENT_TOKENS)) {
    resolved[prop] = resolveSemanticToken(semMap, spec.tokens) || spec.fallback;
  }

  for (const [prop, spec] of Object.entries(SLIDE_TYPOGRAPHY_TOKENS)) {
    resolved[prop] = resolvePrimitiveToken(primMap, spec.tokens, spec.transform) ?? spec.fallback;
  }

  // Resolve document heading level styles (heading.1–6, body/label/caption/toc/mono).
  // Each style includes font-family, font-size (pt), font-weight, line-height, and colour.
  // Colour properties use semMap; all others use primMap with optional transform.
  for (const [styleName, styleSpec] of Object.entries(DOCUMENT_TYPOGRAPHY_STYLES)) {
    for (const [prop, spec] of Object.entries(styleSpec)) {
      const key = `${styleName}.${prop}`;
      if (spec.source === 'sem') {
        resolved[key] = resolveSemanticToken(semMap, spec.tokens) || spec.fallback;
      } else {
        resolved[key] = resolvePrimitiveToken(primMap, spec.tokens, spec.transform) ?? spec.fallback;
      }
    }
  }

  // Add slide-role aliases pointing to the resolved heading level style properties.
  // Only sets keys not already populated by SLIDE_COMPONENT_TOKENS or SLIDE_TYPOGRAPHY_TOKENS,
  // giving the existing resolution priority while adding the unified heading-level path.
  const STYLE_PROPS = ['font.family', 'font.size', 'font.weight', 'line.height', 'color'];
  for (const [slideRole, headingLevel] of Object.entries(SLIDE_ROLE_HEADING_MAP)) {
    for (const prop of STYLE_PROPS) {
      const aliasKey = `${slideRole}.${prop}`;
      if (resolved[aliasKey] === undefined) {
        resolved[aliasKey] = resolved[`${headingLevel}.${prop}`];
      }
    }
  }

  return resolved;
}

/**
 * @deprecated Use buildSlideTemplateTokens() instead.
 *
 * Backwards-compatibility shim — maps new component property names back to the
 * legacy C object shape expected by generate-ve-deck.mjs until that module is
 * updated to consume buildSlideTemplateTokens() directly (F61.7 story S61.7.2).
 *
 * Mapping:
 *   navy        ← slide.background.fill
 *   db          ← slide.divider.background.fill
 *   teal        ← slide.heading.secondary.color  (brand accent)
 *   gold        ← slide.heading.highlight.color
 *   w           ← slide.heading.primary.color    (light text)
 *   mg          ← slide.label.text.color
 *   lt          ← slide.caption.text.color
 *   fontHeading ← slide.heading.font.family
 *   fontBody    ← slide.body.font.family
 */
export function buildSlideColours(brand, filePath) {
  const t = buildSlideTemplateTokens(brand, filePath);
  return {
    navy:        t['slide.background.fill'],
    db:          t['slide.divider.background.fill'],
    teal:        t['slide.heading.secondary.color'],
    gold:        t['slide.heading.highlight.color'],
    w:           t['slide.heading.primary.color'],
    mg:          t['slide.label.text.color'],
    lt:          t['slide.caption.text.color'],
    fontHeading: t['slide.heading.font.family'],
    fontBody:    t['slide.body.font.family']
  };
}
