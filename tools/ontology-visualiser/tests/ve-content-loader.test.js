/**
 * Unit tests for ve-content-loader.mjs — VE Skill Chain content extraction.
 *
 * Feature F63.2: Slide Deck Production Line — dynamic content input
 * Tests: VSOM, VP, KPI/BSC, Kano, RRR extraction across brands.
 */

import { describe, it, expect } from 'vitest';
import { loadVEChainContent, listAvailableBrands } from '../ve-content-loader.mjs';

// ========================================
// BRAND LISTING
// ========================================

describe('listAvailableBrands', () => {
  const brands = listAvailableBrands();

  it('should list at least 5 brands', () => {
    expect(brands.length).toBeGreaterThanOrEqual(5);
  });

  it('should include baiv, wwg, rcs', () => {
    const names = brands.map(b => b.brand);
    expect(names).toContain('baiv');
    expect(names).toContain('wwg');
    expect(names).toContain('rcs');
  });

  it('should show stages for each brand', () => {
    const wwg = brands.find(b => b.brand === 'wwg');
    expect(wwg.stages.length).toBeGreaterThanOrEqual(4);
  });
});

// ========================================
// WWG — MOST COMPLETE CHAIN
// ========================================

describe('loadVEChainContent — wwg (full chain)', () => {
  const ve = loadVEChainContent('wwg');

  it('should have 5 VE stages', () => {
    expect(ve.coverage.stages).toContain('VSOM');
    expect(ve.coverage.stages).toContain('VP');
    expect(ve.coverage.stages).toContain('RRR');
    expect(ve.coverage.stages).toContain('KPI/BSC');
    expect(ve.coverage.stages).toContain('Kano');
  });

  describe('VSOM', () => {
    it('should extract vision statement', () => {
      expect(ve.vsom.visionStatement).toBeTruthy();
      expect(ve.vsom.visionStatement.length).toBeGreaterThan(20);
    });

    it('should extract strategies', () => {
      expect(ve.vsom.strategies.length).toBeGreaterThanOrEqual(2);
      expect(ve.vsom.strategies[0].name).toBeTruthy();
      expect(ve.vsom.strategies[0].description).toBeTruthy();
    });

    it('should extract objectives', () => {
      expect(ve.vsom.objectives.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('VP', () => {
    it('should extract value propositions', () => {
      expect(ve.vp.vps.length).toBeGreaterThanOrEqual(1);
      expect(ve.vp.vps[0].primaryStatement).toBeTruthy();
    });

    it('should extract problems', () => {
      expect(ve.vp.problems.length).toBeGreaterThanOrEqual(2);
      expect(ve.vp.problems[0].statement).toBeTruthy();
      expect(ve.vp.problems[0].severity).toBeTruthy();
    });

    it('should extract pain points', () => {
      expect(ve.vp.pains.length).toBeGreaterThanOrEqual(3);
    });

    it('should extract solutions', () => {
      expect(ve.vp.solutions.length).toBeGreaterThanOrEqual(1);
    });

    it('should extract benefits', () => {
      expect(ve.vp.benefits.length).toBeGreaterThanOrEqual(3);
      expect(ve.vp.benefits[0].quantified).toBeTruthy();
    });

    it('should extract ICPs', () => {
      expect(ve.vp.icps.length).toBeGreaterThanOrEqual(3);
      expect(ve.vp.icps[0].industry).toBeTruthy();
    });

    it('should return keyBenefits as array', () => {
      ve.vp.vps.forEach(v => {
        expect(Array.isArray(v.keyBenefits)).toBe(true);
      });
    });
  });

  describe('KPI/BSC', () => {
    it('should extract 4 BSC perspectives', () => {
      expect(ve.kpi.perspectives.length).toBe(4);
    });

    it('should extract 20+ KPIs', () => {
      expect(ve.kpi.kpis.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Kano', () => {
    it('should extract features', () => {
      expect(ve.kano.features.length).toBeGreaterThanOrEqual(3);
    });

    it('should extract segments', () => {
      expect(ve.kano.segments.length).toBeGreaterThanOrEqual(2);
    });

    it('should extract classifications', () => {
      expect(ve.kano.classifications.length).toBeGreaterThanOrEqual(8);
      expect(ve.kano.classifications[0].category).toBeTruthy();
    });
  });

  describe('RRR', () => {
    it('should extract roles', () => {
      expect(ve.rrr.roles.length).toBeGreaterThanOrEqual(5);
    });
  });
});

// ========================================
// BAIV — VSOM ONLY
// ========================================

describe('loadVEChainContent — baiv (VSOM only)', () => {
  const ve = loadVEChainContent('baiv');

  it('should have VSOM coverage only', () => {
    expect(ve.coverage.vsom).toBe(true);
    expect(ve.coverage.vp).toBe(false);
  });

  it('should extract BAIV vision', () => {
    expect(ve.vsom.visionStatement).toContain('AI Visible');
  });

  it('should extract BAIV strategies', () => {
    expect(ve.vsom.strategies.length).toBeGreaterThanOrEqual(3);
  });

  it('should extract BAIV objectives with BSC perspectives', () => {
    expect(ve.vsom.objectives.length).toBeGreaterThanOrEqual(5);
    const perspectives = new Set(ve.vsom.objectives.map(o => o.perspective));
    expect(perspectives.size).toBeGreaterThanOrEqual(3);
  });

  it('should have null for missing VE stages', () => {
    expect(ve.vp).toBeNull();
    expect(ve.rrr).toBeNull();
    expect(ve.kpi).toBeNull();
    expect(ve.kano).toBeNull();
  });
});

// ========================================
// RCS — VP ONLY
// ========================================

describe('loadVEChainContent — rcs (VP only)', () => {
  const ve = loadVEChainContent('rcs');

  it('should have VP coverage only', () => {
    expect(ve.coverage.vp).toBe(true);
    expect(ve.coverage.vsom).toBe(false);
  });

  it('should extract RCS value proposition', () => {
    expect(ve.vp.vps.length).toBeGreaterThanOrEqual(1);
  });

  it('should ensure keyBenefits is always an array', () => {
    ve.vp.vps.forEach(v => {
      expect(Array.isArray(v.keyBenefits)).toBe(true);
    });
  });
});

// ========================================
// EDGE CASES
// ========================================

describe('edge cases', () => {
  it('should throw on unknown brand', () => {
    expect(() => loadVEChainContent('nonexistent')).toThrow();
  });

  it('should handle partial chains gracefully', () => {
    const ve = loadVEChainContent('rcs');
    expect(ve.vsom).toBeNull();
    expect(ve.vp).not.toBeNull();
    expect(ve.coverage.stages.length).toBe(1);
  });
});
