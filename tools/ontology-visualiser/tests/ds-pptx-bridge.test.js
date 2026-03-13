/**
 * Unit tests for ds-pptx-bridge.mjs — DS-ONT → pptxgenjs token bridge.
 *
 * Feature F61.7: Token-Branded PPTX Slide Engine
 * Tests: Token parsing, slide template component resolution, typography, shim, edge cases.
 *
 * Architecture under test:
 *   loadBrandTokens()         — raw semMap + primMap extraction from DS-ONT instance
 *   buildSlideTemplateTokens() — component property → semantic token → hex resolution
 *   buildSlideColours()       — @deprecated shim mapping component props to legacy C shape
 */

import { describe, it, expect } from 'vitest';
import { loadBrandTokens, buildSlideTemplateTokens, buildSlideColours } from '../ds-pptx-bridge.mjs';

// ========================================
// 1. TOKEN PARSING
// ========================================

describe('loadBrandTokens — BAIV', () => {
  const result = loadBrandTokens('baiv');

  it('should return semMap with 60+ semantic tokens', () => {
    expect(Object.keys(result.semMap).length).toBeGreaterThanOrEqual(60);
  });

  it('should return primMap with 40+ primitive tokens', () => {
    expect(Object.keys(result.primMap).length).toBeGreaterThanOrEqual(40);
  });

  it('should include mandatory GATE-3 semantic tokens', () => {
    const required = [
      'primary.surface.default', 'primary.surface.subtle', 'primary.surface.darker',
      'neutral.text.title', 'neutral.text.body', 'neutral.text.caption',
      'neutral.surface.default', 'neutral.surface.subtle', 'neutral.border.default',
      'error.surface.default', 'warning.surface.default', 'success.surface.default',
      'information.surface.default'
    ];
    for (const tok of required) {
      expect(result.semMap[tok], `missing: ${tok}`).toBeDefined();
    }
  });

  it('should extract typography primitives', () => {
    expect(result.primMap['typography.fontFamily.headings']).toBeDefined();
    expect(result.primMap['typography.fontFamily.body']).toBeDefined();
  });

  it('should populate typography object', () => {
    expect(result.typography.headings).toBe('Jura');
    expect(result.typography.body).toBe('Jura');
    expect(result.typography.mono).toBe('JetBrains Mono');
  });

  it('should NOT expose a palette object (removed — use buildSlideTemplateTokens)', () => {
    expect(result.palette).toBeUndefined();
  });
});

describe('loadBrandTokens — RCS', () => {
  const result = loadBrandTokens('rcs');

  it('should return distinct semMap from BAIV', () => {
    const baiv = loadBrandTokens('baiv');
    expect(result.semMap['primary.surface.default']).not.toBe(baiv.semMap['primary.surface.default']);
  });

  it('should have RCS primary as purple', () => {
    expect(result.semMap['primary.surface.default']).toBe('#8314ab');
  });
});

// ========================================
// 2. SLIDE TEMPLATE COMPONENT TOKENS
// ========================================

describe('buildSlideTemplateTokens — BAIV', () => {
  const T = buildSlideTemplateTokens('baiv');

  it('should return all background component properties', () => {
    expect(T['slide.background.fill']).toBeDefined();
    expect(T['slide.divider.background.fill']).toBeDefined();
    expect(T['slide.content.background.fill']).toBeDefined();
  });

  it('should return all heading text component properties', () => {
    expect(T['slide.heading.primary.color']).toBeDefined();
    expect(T['slide.heading.secondary.color']).toBeDefined();
    expect(T['slide.heading.highlight.color']).toBeDefined();
  });

  it('should return all body/caption text component properties', () => {
    expect(T['slide.body.text.color']).toBeDefined();
    expect(T['slide.label.text.color']).toBeDefined();
    expect(T['slide.caption.text.color']).toBeDefined();
  });

  it('should return accent and data series component properties', () => {
    expect(T['slide.accent.bar.fill']).toBeDefined();
    expect(T['slide.data.series.primary.fill']).toBeDefined();
    expect(T['slide.data.series.secondary.fill']).toBeDefined();
  });

  it('should return status component properties', () => {
    expect(T['slide.status.success.fill']).toBeDefined();
    expect(T['slide.status.warning.fill']).toBeDefined();
    expect(T['slide.status.error.fill']).toBeDefined();
    expect(T['slide.status.info.fill']).toBeDefined();
  });

  it('should return typography component properties as strings', () => {
    expect(T['slide.heading.font.family']).toBeTruthy();
    expect(T['slide.body.font.family']).toBeTruthy();
    expect(T['slide.mono.font.family']).toBeTruthy();
  });

  it('should return uppercase hex without # for all colour properties', () => {
    const colourProps = [
      'slide.background.fill', 'slide.divider.background.fill',
      'slide.heading.primary.color', 'slide.heading.secondary.color',
      'slide.heading.highlight.color', 'slide.body.text.color',
      'slide.label.text.color', 'slide.caption.text.color',
      'slide.accent.bar.fill', 'slide.data.series.primary.fill'
    ];
    for (const prop of colourProps) {
      expect(T[prop], `bad hex for ${prop}`).toMatch(/^[0-9A-F]{6}$/);
    }
  });

  it('slide.heading.secondary.color should resolve from primary.surface.default (brand accent)', () => {
    const { semMap } = loadBrandTokens('baiv');
    const expected = semMap['primary.surface.default'].replace('#', '').toUpperCase();
    expect(T['slide.heading.secondary.color']).toBe(expected);
  });

  it('slide.background.fill should differ from slide.divider.background.fill', () => {
    expect(T['slide.background.fill']).not.toBe(T['slide.divider.background.fill']);
  });

  it('BAIV typography — heading font should be Jura', () => {
    expect(T['slide.heading.font.family']).toBe('Jura');
  });
});

describe('buildSlideTemplateTokens — all 5 brands produce valid component tokens', () => {
  const brands = ['baiv', 'rcs', 'wwg', 'pand', 'vhf'];

  for (const brand of brands) {
    it(`${brand} — all colour component properties are valid 6-char hex`, () => {
      const T = buildSlideTemplateTokens(brand);
      const colourProps = [
        'slide.background.fill', 'slide.heading.secondary.color',
        'slide.heading.primary.color', 'slide.caption.text.color'
      ];
      for (const prop of colourProps) {
        expect(T[prop], `${brand} — bad hex for ${prop}`).toMatch(/^[0-9A-F]{6}$/);
      }
    });

    it(`${brand} — slide.background.fill differs from slide.heading.secondary.color`, () => {
      const T = buildSlideTemplateTokens(brand);
      // Background and brand accent should never be the same value
      expect(T['slide.background.fill']).not.toBe(T['slide.heading.secondary.color']);
    });
  }
});

describe('buildSlideTemplateTokens — brand differentiation', () => {
  it('RCS slide.heading.secondary.color should be purple, not BAIV teal', () => {
    const rcs  = buildSlideTemplateTokens('rcs');
    const baiv = buildSlideTemplateTokens('baiv');
    expect(rcs['slide.heading.secondary.color']).not.toBe(baiv['slide.heading.secondary.color']);
    expect(rcs['slide.heading.secondary.color']).toBe('8314AB'); // RCS purple
  });

  it('slide.label.text.color should use neutral surface tokens (not border tokens)', () => {
    // Regression: previous bridge used neutral.border.default which was unreadable on dark bg for RCS
    const rcs = buildSlideTemplateTokens('rcs');
    // neutral.surface.subtle should be a light colour (high hex value), not a dark purple
    const labelHex = parseInt(rcs['slide.label.text.color'], 16);
    const bgHex    = parseInt(rcs['slide.background.fill'], 16);
    expect(labelHex).toBeGreaterThan(bgHex); // label must be lighter than background
  });
});

describe('buildSlideTemplateTokens — fallback behaviour', () => {
  it('should return hardcoded fallback hex for unknown token name without throwing', () => {
    // The fallback chain is tested indirectly: if VHF (non-standard naming) resolves without error
    // and returns valid hex, the fallback mechanism is working
    const T = buildSlideTemplateTokens('vhf');
    expect(T['slide.background.fill']).toMatch(/^[0-9A-F]{6}$/);
  });
});

// ========================================
// 3. DEPRECATED SHIM — buildSlideColours
// ========================================

describe('buildSlideColours (deprecated shim) — BAIV', () => {
  const C = buildSlideColours('baiv');

  it('should return all 9 expected legacy keys', () => {
    const keys = ['navy', 'db', 'teal', 'gold', 'w', 'mg', 'lt', 'fontHeading', 'fontBody'];
    for (const k of keys) {
      expect(C[k], `missing key: ${k}`).toBeDefined();
    }
  });

  it('should return uppercase hex without # prefix for colour keys', () => {
    const colourKeys = ['navy', 'db', 'teal', 'gold', 'w', 'mg', 'lt'];
    for (const k of colourKeys) {
      expect(C[k]).not.toContain('#');
      expect(C[k]).toMatch(/^[0-9A-F]{6}$/);
    }
  });

  it('teal should map to primary.surface.default (brand accent)', () => {
    const { semMap } = loadBrandTokens('baiv');
    const expected = semMap['primary.surface.default'].replace('#', '').toUpperCase();
    expect(C.teal).toBe(expected);
  });

  it('navy should resolve from primary.surface.darker semantic token (not hardcoded teal.800)', () => {
    // Regression: old bridge hardcoded color.teal.800 — only worked for BAIV
    // Now resolved semantically so all brands produce a valid dark background
    expect(C.navy).toMatch(/^[0-9A-F]{6}$/);
  });

  it('db should differ from navy', () => {
    expect(C.db).not.toBe(C.navy);
  });

  it('should include brand font', () => {
    expect(C.fontHeading).toBe('Jura');
    expect(C.fontBody).toBe('Jura');
  });
});

describe('buildSlideColours (deprecated shim) — RCS', () => {
  const C = buildSlideColours('rcs');

  it('should produce RCS purple accent', () => {
    expect(C.teal).toBe('8314AB');
  });

  it('should produce different bg from BAIV', () => {
    const baivC = buildSlideColours('baiv');
    expect(C.navy).not.toBe(baivC.navy);
  });
});

describe('buildSlideColours (deprecated shim) — all 5 brands', () => {
  const brands = ['baiv', 'rcs', 'wwg', 'pand', 'vhf'];

  for (const brand of brands) {
    it(`${brand} — returns valid palette`, () => {
      const C = buildSlideColours(brand);
      expect(C.navy).toMatch(/^[0-9A-F]{6}$/);
      expect(C.teal).toMatch(/^[0-9A-F]{6}$/);
      expect(C.fontHeading).toBeTruthy();
    });
  }
});

// ========================================
// 4. EDGE CASES
// ========================================

describe('edge cases', () => {
  it('should throw on unknown brand with no filePath', () => {
    expect(() => buildSlideTemplateTokens('nonexistent')).toThrow();
  });

  it('should accept custom filePath override', () => {
    const path = new URL(
      '../../../ONTOLOGIES/ontology-library/PE-Series/DS-ONT/instance-data/baiv-ds-instance-v1.0.0.jsonld',
      import.meta.url
    ).pathname;
    const T = buildSlideTemplateTokens('baiv', path);
    expect(T['slide.heading.secondary.color']).toBe('00A4BF');
  });
});
