/**
 * Unit tests for kano-chart.js — F49.11 Kano Analysis Visualisation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock DOM ────────────────────────────────────────────────────────────────

const mockElements = {};

function createMockElement(tag, overrides = {}) {
  const el = {
    tagName: tag,
    style: {},
    cssText: '',
    innerHTML: '',
    textContent: '',
    className: '',
    children: [],
    childNodes: [],
    appendChild: vi.fn(function (child) { this.children.push(child); return child; }),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(() => null),
    ...overrides,
  };
  return el;
}

vi.stubGlobal('document', {
  getElementById: vi.fn((id) => mockElements[id] || null),
  createElement: vi.fn((tag) => createMockElement(tag)),
  createElementNS: vi.fn((ns, tag) => createMockElement(tag)),
  documentElement: { style: {} },
  querySelectorAll: vi.fn(() => []),
});

vi.stubGlobal('getComputedStyle', vi.fn(() => ({
  getPropertyValue: vi.fn(() => ''),
})));

// ─── Mock state ──────────────────────────────────────────────────────────────

vi.mock('../js/state.js', () => ({
  state: {},
}));

// ─── Import ──────────────────────────────────────────────────────────────────

import {
  KANO_CATEGORIES,
  KANO_CATEGORY_LABELS,
  getKanoCategoryColor,
  extractKanoData,
  renderKanoCurves,
  renderPriorityMatrix,
  renderSegmentHeatmap,
  renderDecayTimeline,
  exportKanoMermaid,
  exportKanoJSON,
  renderKanoTab,
} from '../js/kano-chart.js';

// ─── Test fixtures ───────────────────────────────────────────────────────────

function buildTestKanoData() {
  return {
    classifications: [
      { '@type': 'kano:KanoClassification', 'kano:featureRef': 'Disruption Notif', 'kano:category': 'MustBe', 'kano:confidence': 0.9, 'kano:segmentRef': 'Restaurant', 'kano:implementationLevel': 0.8 },
      { '@type': 'kano:KanoClassification', 'kano:featureRef': 'Disruption Notif', 'kano:category': 'Performance', 'kano:segmentRef': 'Wholesaler' },
      { '@type': 'kano:KanoClassification', 'kano:featureRef': 'Cross-corridor', 'kano:category': 'Attractive', 'kano:confidence': 0.85, 'kano:segmentRef': 'Restaurant', 'kano:implementationLevel': 0.3 },
      { '@type': 'kano:KanoClassification', 'kano:featureRef': 'Margin Dashboard', 'kano:category': 'Performance', 'kano:segmentRef': 'Wholesaler' },
    ],
    curves: [
      { '@type': 'kano:SatisfactionCurve', 'kano:categoryType': 'MustBe', 'kano:curveFunction': 'Asymptotic' },
    ],
    decays: [
      { '@type': 'kano:KanoDecay', 'kano:featureRef': 'Cross-corridor', 'kano:fromCategory': 'Attractive', 'kano:toCategory': 'Performance', 'kano:decayPeriodMonths': 12, 'kano:competitivePressure': 'High' },
      { '@type': 'kano:KanoDecay', 'kano:featureRef': 'Margin Dashboard', 'kano:fromCategory': 'Performance', 'kano:toCategory': 'MustBe', 'kano:decayPeriodMonths': 18, 'kano:competitivePressure': 'Medium' },
    ],
    priorities: [
      { '@type': 'kano:FeaturePriority', 'kano:featureRef': 'Cross-corridor', 'kano:priorityRank': 1, 'kano:investmentRecommendation': 'Invest', 'kano:wtpElasticity': 0.7 },
      { '@type': 'kano:FeaturePriority', 'kano:featureRef': 'Disruption Notif', 'kano:priorityRank': 2, 'kano:investmentRecommendation': 'Maintain', 'kano:wtpElasticity': 0.4 },
      { '@type': 'kano:FeaturePriority', 'kano:featureRef': 'Old Widget', 'kano:priorityRank': 3, 'kano:investmentRecommendation': 'Eliminate', 'kano:wtpElasticity': 0.1 },
    ],
    surveys: [],
    questions: [],
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('kano-chart', () => {

  describe('constants', () => {
    it('defines 5 Kano categories', () => {
      expect(KANO_CATEGORIES).toHaveLength(5);
      expect(KANO_CATEGORIES).toContain('MustBe');
      expect(KANO_CATEGORIES).toContain('Attractive');
      expect(KANO_CATEGORIES).toContain('Reverse');
    });

    it('has labels for all categories', () => {
      for (const cat of KANO_CATEGORIES) {
        expect(KANO_CATEGORY_LABELS[cat]).toBeTruthy();
      }
    });
  });

  describe('getKanoCategoryColor', () => {
    it('returns fallback colours for known categories', () => {
      expect(getKanoCategoryColor('MustBe')).toBe('#E53935');
      expect(getKanoCategoryColor('Attractive')).toBe('#43A047');
      expect(getKanoCategoryColor('Performance')).toBe('#1E88E5');
      expect(getKanoCategoryColor('Indifferent')).toBe('#757575');
      expect(getKanoCategoryColor('Reverse')).toBe('#FB8C00');
    });

    it('returns grey for unknown category', () => {
      expect(getKanoCategoryColor('Unknown')).toBe('#757575');
    });
  });

  describe('extractKanoData', () => {
    it('returns null for null input', () => {
      expect(extractKanoData(null)).toBeNull();
    });

    it('extracts entities from @graph array', () => {
      const graph = {
        '@graph': [
          { '@type': 'kano:KanoClassification', 'kano:featureRef': 'F1' },
          { '@type': 'kano:SatisfactionCurve', 'kano:categoryType': 'MustBe' },
          { '@type': 'kano:KanoDecay', 'kano:featureRef': 'F1' },
          { '@type': 'kano:FeaturePriority', 'kano:featureRef': 'F1' },
          { '@type': 'kano:KanoSurvey', 'kano:surveyId': 'S1' },
          { '@type': 'kano:KanoQuestion', 'kano:questionId': 'Q1' },
          { '@type': 'vp:Problem', 'vp:name': 'Not Kano' },
        ],
      };
      const result = extractKanoData(graph);
      expect(result.classifications).toHaveLength(1);
      expect(result.curves).toHaveLength(1);
      expect(result.decays).toHaveLength(1);
      expect(result.priorities).toHaveLength(1);
      expect(result.surveys).toHaveLength(1);
      expect(result.questions).toHaveLength(1);
    });

    it('handles nodes array format', () => {
      const data = { nodes: [{ '@type': 'KanoClassification' }] };
      const result = extractKanoData(data);
      expect(result.classifications).toHaveLength(1);
    });
  });

  describe('renderKanoCurves', () => {
    it('returns an SVG element', () => {
      const data = buildTestKanoData();
      const svg = renderKanoCurves(data);
      expect(svg.tagName).toBe('svg');
    });

    it('sets viewBox from options', () => {
      const svg = renderKanoCurves(buildTestKanoData(), { width: 600, height: 500 });
      expect(svg.setAttribute).toHaveBeenCalledWith('viewBox', '0 0 600 500');
    });

    it('renders with empty classification data', () => {
      const svg = renderKanoCurves({ classifications: [], curves: [], decays: [], priorities: [], surveys: [], questions: [] });
      expect(svg.tagName).toBe('svg');
      expect(svg.children.length).toBeGreaterThan(0); // at least axes + curves
    });

    it('plots feature dots when showFeatures is true', () => {
      const data = buildTestKanoData();
      const svg = renderKanoCurves(data, { showFeatures: true });
      // Should have circle elements for classifications with implementationLevel
      const circles = svg.children.filter(c => c.tagName === 'circle');
      expect(circles.length).toBeGreaterThan(0);
    });
  });

  describe('renderPriorityMatrix', () => {
    it('returns a DOM container', () => {
      const matrix = renderPriorityMatrix(buildTestKanoData());
      expect(matrix.className).toBe('kano-priority-matrix');
    });

    it('creates 4 quadrant cells plus header and footer', () => {
      const matrix = renderPriorityMatrix(buildTestKanoData());
      // header + 4 quadrants + footer = 6 children
      expect(matrix.children).toHaveLength(6);
    });

    it('handles empty priorities', () => {
      const data = { ...buildTestKanoData(), priorities: [] };
      const matrix = renderPriorityMatrix(data);
      expect(matrix.className).toBe('kano-priority-matrix');
    });
  });

  describe('renderSegmentHeatmap', () => {
    it('renders a table with segments as columns', () => {
      const heatmap = renderSegmentHeatmap(buildTestKanoData());
      expect(heatmap.className).toBe('kano-segment-heatmap');
      // Should have a table child
      expect(heatmap.children.length).toBeGreaterThan(0);
    });

    it('shows message for empty data', () => {
      const heatmap = renderSegmentHeatmap({ classifications: [] });
      expect(heatmap.textContent).toMatch(/No Kano classification data/);
    });
  });

  describe('renderDecayTimeline', () => {
    it('returns an SVG element', () => {
      const svg = renderDecayTimeline(buildTestKanoData());
      expect(svg.tagName).toBe('svg');
    });

    it('shows message for empty decays', () => {
      const svg = renderDecayTimeline({ decays: [] });
      expect(svg.tagName).toBe('svg');
      // Should have a text element with "No decay data"
      const textNodes = svg.children.filter(c => c.tagName === 'text');
      const noDataText = textNodes.find(t => t.textContent.includes('No decay data'));
      expect(noDataText).toBeTruthy();
    });

    it('renders gradient bars for each decay', () => {
      const data = buildTestKanoData();
      const svg = renderDecayTimeline(data);
      // Should have defs elements with gradients
      const defs = svg.children.filter(c => c.tagName === 'defs');
      expect(defs.length).toBe(data.decays.length);
    });
  });

  describe('exportKanoMermaid', () => {
    it('produces valid Mermaid quadrant syntax', () => {
      const mermaid = exportKanoMermaid(buildTestKanoData());
      expect(mermaid).toContain('quadrantChart');
      expect(mermaid).toContain('title Feature Priority (Kano)');
      expect(mermaid).toContain('x-axis');
      expect(mermaid).toContain('y-axis');
    });

    it('includes features from priorities', () => {
      const mermaid = exportKanoMermaid(buildTestKanoData());
      expect(mermaid).toContain('Cross-corridor');
      expect(mermaid).toContain('Disruption Notif');
    });

    it('handles empty data', () => {
      const mermaid = exportKanoMermaid({ priorities: [] });
      expect(mermaid).toContain('quadrantChart');
    });
  });

  describe('exportKanoJSON', () => {
    it('returns structured export with all sections', () => {
      const json = exportKanoJSON(buildTestKanoData());
      expect(json.schemaVersion).toBe('1.0.0');
      expect(json.generator).toBe('kano-chart.js');
      expect(json.categories).toHaveLength(5);
      expect(json.classifications).toHaveLength(4);
      expect(json.priorities).toHaveLength(3);
      expect(json.decays).toHaveLength(2);
    });

    it('maps classification fields correctly', () => {
      const json = exportKanoJSON(buildTestKanoData());
      const first = json.classifications[0];
      expect(first.feature).toBe('Disruption Notif');
      expect(first.category).toBe('MustBe');
      expect(first.confidence).toBe(0.9);
      expect(first.segment).toBe('Restaurant');
    });

    it('maps priority fields correctly', () => {
      const json = exportKanoJSON(buildTestKanoData());
      const invest = json.priorities.find(p => p.recommendation === 'Invest');
      expect(invest.feature).toBe('Cross-corridor');
      expect(invest.rank).toBe(1);
      expect(invest.wtpElasticity).toBe(0.7);
    });

    it('handles null input gracefully', () => {
      const json = exportKanoJSON(null);
      expect(json.classifications).toHaveLength(0);
      expect(json.priorities).toHaveLength(0);
      expect(json.decays).toHaveLength(0);
    });
  });

  describe('renderKanoTab', () => {
    it('shows empty message when no data', () => {
      const container = createMockElement('div');
      renderKanoTab(null, container);
      expect(container.innerHTML).toContain('No Kano data');
    });

    it('shows empty message for empty collections', () => {
      const container = createMockElement('div');
      renderKanoTab({ classifications: [], curves: [], decays: [], priorities: [], surveys: [], questions: [] }, container);
      expect(container.innerHTML).toContain('No Kano data');
    });

    it('renders sections when data present', () => {
      const container = createMockElement('div');
      renderKanoTab(buildTestKanoData(), container);
      // Should have appended children (sections + charts)
      expect(container.children.length).toBeGreaterThan(0);
    });
  });

});
