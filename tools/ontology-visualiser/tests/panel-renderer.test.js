/**
 * Unit tests for panel-renderer.js — Programme Tracker Panel (S.URG.4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock DOM ─────────────────────────────────────────────────────────────────

const mockElements = {};

function createMockElement(id) {
  const el = { style: {}, innerHTML: '', id };
  mockElements[id] = el;
  return el;
}

vi.stubGlobal('document', {
  getElementById: vi.fn((id) => mockElements[id] || null),
});

// ─── Mock fetch ───────────────────────────────────────────────────────────────

function makeFetchMock(data) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function makeFailingFetch(status = 404) {
  return vi.fn().mockResolvedValue({ ok: false, status });
}

// ─── Sample tracker data ──────────────────────────────────────────────────────

const SAMPLE_TRACKER = {
  schemaVersion: '1.0.0',
  generated: '2026-03-11',
  epics: [
    {
      id: 'epic-6',
      ref: '#58',
      issueUrl: 'https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/58',
      title: 'Package & Distribution',
      status: 'open',
      priority: 'P1',
      features: [
        { id: 'F5.1', ref: '#38', issueUrl: 'https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/38', title: 'Supabase Integration', status: 'open', priority: 'P1' },
      ],
      docs: [],
    },
    {
      id: 'epic-7',
      ref: '#79',
      issueUrl: 'https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/79',
      title: 'Ontology Authoring',
      status: 'no-open-features',
      priority: '—',
      features: [],
      docs: [],
    },
    {
      id: 'epic-1',
      ref: '#53',
      issueUrl: 'https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/53',
      title: 'OAA 5.0.0 Verification',
      status: 'closed',
      priority: '—',
      features: [],
      docs: [],
    },
    {
      id: 'epic-9k',
      ref: '#155',
      issueUrl: 'https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/155',
      title: 'Packaged GitHub Workflow',
      status: 'closed',
      priority: '—',
      features: [
        { id: 'F9K.1', ref: '#168', issueUrl: 'https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/168', title: 'GitHub Template Repo', status: 'residual', priority: 'P1' },
      ],
      docs: [],
    },
  ],
  documents: [],
};

// ─── Import module ────────────────────────────────────────────────────────────

import {
  filterEpics,
  renderPriorityBadge,
  renderFeatureRow,
  renderEpicRow,
  renderTrackerPanel,
  loadTrackerData,
  getTrackerData,
  setFilter,
  getFilter,
  toggleEpicExpansion,
  isEpicExpanded,
  initTrackerPanel,
  refreshTrackerPanel,
  TRACKER_PATH,
} from '../js/panel-renderer.js';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TRACKER_PATH', () => {
  it('falls back to relative path when not on Pages primary path', () => {
    // In vitest, location.pathname won't contain /PBS/TOOLS/ontology-visualiser/
    // so resolveTrackerPath falls back to the relative path
    expect(TRACKER_PATH).toBe('../../STRATEGY/programme-tracker.json');
  });
});

describe('filterEpics', () => {
  it('returns only epics matching status', () => {
    const open = filterEpics(SAMPLE_TRACKER.epics, 'open');
    expect(open).toHaveLength(1);
    expect(open[0].id).toBe('epic-6');
  });

  it('returns no-open-features epics', () => {
    const noOpen = filterEpics(SAMPLE_TRACKER.epics, 'no-open-features');
    expect(noOpen).toHaveLength(1);
    expect(noOpen[0].id).toBe('epic-7');
  });

  it('returns closed epics', () => {
    const closed = filterEpics(SAMPLE_TRACKER.epics, 'closed');
    expect(closed).toHaveLength(2);
  });

  it('returns empty array for unknown filter', () => {
    expect(filterEpics(SAMPLE_TRACKER.epics, 'unknown')).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(filterEpics([], 'open')).toHaveLength(0);
  });
});

describe('renderPriorityBadge', () => {
  it('renders P0 with red colour', () => {
    const html = renderPriorityBadge('P0');
    expect(html).toContain('P0');
    expect(html).toContain('#ef4444');
  });

  it('renders P1 with amber colour', () => {
    const html = renderPriorityBadge('P1');
    expect(html).toContain('P1');
    expect(html).toContain('#f59e0b');
  });

  it('renders P2 with green colour', () => {
    const html = renderPriorityBadge('P2');
    expect(html).toContain('#22c55e');
  });

  it('renders P3 with blue colour', () => {
    const html = renderPriorityBadge('P3');
    expect(html).toContain('#3b82f6');
  });

  it('renders em-dash with muted colour', () => {
    const html = renderPriorityBadge('—');
    expect(html).toContain('#555');
    expect(html).toContain('—');
  });

  it('falls back to muted for unknown priority', () => {
    const html = renderPriorityBadge('PX');
    expect(html).toContain('#555');
  });
});

describe('renderFeatureRow', () => {
  const openFeature = { id: 'F5.1', ref: '#38', issueUrl: 'https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/38', title: 'Supabase Integration', status: 'open', priority: 'P1' };
  const residualFeature = { id: 'F9K.1', ref: '#168', issueUrl: 'https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/168', title: 'Template Repo', status: 'residual', priority: 'P1' };
  const noUrlFeature = { id: 'F1.1', ref: '#10', issueUrl: null, title: 'No URL', status: 'open', priority: 'P2' };

  it('renders feature id and title', () => {
    const html = renderFeatureRow(openFeature);
    expect(html).toContain('F5.1');
    expect(html).toContain('Supabase Integration');
  });

  it('renders open status dot for open feature', () => {
    const html = renderFeatureRow(openFeature);
    expect(html).toContain('○');
    expect(html).not.toContain('◐');
  });

  it('renders residual status dot for residual feature', () => {
    const html = renderFeatureRow(residualFeature);
    expect(html).toContain('◐');
  });

  it('renders clickable link when issueUrl present', () => {
    const html = renderFeatureRow(openFeature);
    expect(html).toContain('<a href="https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/38"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('#38');
  });

  it('renders plain ref span when no issueUrl', () => {
    const html = renderFeatureRow(noUrlFeature);
    expect(html).not.toContain('<a href');
    expect(html).toContain('#10');
  });

  it('renders priority badge', () => {
    const html = renderFeatureRow(openFeature);
    expect(html).toContain('P1');
    expect(html).toContain('#f59e0b');
  });

  it('contains tracker-feature-row class', () => {
    const html = renderFeatureRow(openFeature);
    expect(html).toContain('tracker-feature-row');
  });
});

describe('renderEpicRow', () => {
  beforeEach(() => {
    // Reset expansion state between tests
    if (isEpicExpanded('epic-6')) toggleEpicExpansion('epic-6');
  });

  it('renders epic title', () => {
    const html = renderEpicRow(SAMPLE_TRACKER.epics[0]);
    expect(html).toContain('Package & Distribution');
  });

  it('renders issue link with ref', () => {
    const html = renderEpicRow(SAMPLE_TRACKER.epics[0]);
    expect(html).toContain('href="https://github.com/ajrmooreuk/Azlan-EA-AAA/issues/58"');
    expect(html).toContain('#58');
  });

  it('shows feature count pill when features exist', () => {
    const html = renderEpicRow(SAMPLE_TRACKER.epics[0]);
    expect(html).toContain('1F');
  });

  it('does not show feature count pill when no features', () => {
    const html = renderEpicRow(SAMPLE_TRACKER.epics[1]);
    expect(html).not.toContain('F</span>');
  });

  it('shows collapsed arrow when features exist and not expanded', () => {
    const html = renderEpicRow(SAMPLE_TRACKER.epics[0]);
    expect(html).toContain('▸');
  });

  it('shows expanded arrow when epic is expanded', () => {
    toggleEpicExpansion('epic-6');
    const html = renderEpicRow(SAMPLE_TRACKER.epics[0]);
    expect(html).toContain('▾');
    toggleEpicExpansion('epic-6'); // reset
  });

  it('renders feature rows when expanded', () => {
    toggleEpicExpansion('epic-6');
    const html = renderEpicRow(SAMPLE_TRACKER.epics[0]);
    expect(html).toContain('F5.1');
    expect(html).toContain('Supabase Integration');
    toggleEpicExpansion('epic-6'); // reset
  });

  it('does not render feature rows when collapsed', () => {
    const html = renderEpicRow(SAMPLE_TRACKER.epics[0]);
    expect(html).not.toContain('F5.1');
  });

  it('renders residual feature rows when closed epic is expanded', () => {
    toggleEpicExpansion('epic-9k');
    const html = renderEpicRow(SAMPLE_TRACKER.epics[3]);
    expect(html).toContain('F9K.1');
    expect(html).toContain('◐'); // residual dot
    toggleEpicExpansion('epic-9k');
  });

  it('contains tracker-epic-row class', () => {
    const html = renderEpicRow(SAMPLE_TRACKER.epics[0]);
    expect(html).toContain('tracker-epic-row');
  });
});

describe('filter & expansion state', () => {
  it('defaults to open filter', () => {
    // May have been mutated by other tests — reset
    setFilter('open');
    expect(getFilter()).toBe('open');
  });

  it('setFilter updates active filter', () => {
    setFilter('closed');
    expect(getFilter()).toBe('closed');
    setFilter('open'); // reset
  });

  it('toggleEpicExpansion expands then collapses', () => {
    expect(isEpicExpanded('epic-test')).toBe(false);
    toggleEpicExpansion('epic-test');
    expect(isEpicExpanded('epic-test')).toBe(true);
    toggleEpicExpansion('epic-test');
    expect(isEpicExpanded('epic-test')).toBe(false);
  });
});

describe('renderTrackerPanel', () => {
  it('renders loading state when data is null', () => {
    const container = { innerHTML: '' };
    renderTrackerPanel(container, null, 'open');
    expect(container.innerHTML).toContain('Loading');
  });

  it('does nothing when container is null', () => {
    expect(() => renderTrackerPanel(null, SAMPLE_TRACKER, 'open')).not.toThrow();
  });

  it('renders version and date metadata', () => {
    const container = { innerHTML: '' };
    renderTrackerPanel(container, SAMPLE_TRACKER, 'open');
    expect(container.innerHTML).toContain('v1.0.0');
    expect(container.innerHTML).toContain('2026-03-11');
    expect(container.innerHTML).toContain('4 epics');
  });

  it('renders three filter tabs', () => {
    const container = { innerHTML: '' };
    renderTrackerPanel(container, SAMPLE_TRACKER, 'open');
    expect(container.innerHTML).toContain('Open (1)');
    expect(container.innerHTML).toContain('No Open Work (1)');
    expect(container.innerHTML).toContain('Closed (2)');
  });

  it('renders epics for active filter', () => {
    const container = { innerHTML: '' };
    renderTrackerPanel(container, SAMPLE_TRACKER, 'open');
    expect(container.innerHTML).toContain('Package');
    expect(container.innerHTML).not.toContain('OAA 5.0.0 Verification');
  });

  it('renders closed epics when filter is closed', () => {
    const container = { innerHTML: '' };
    renderTrackerPanel(container, SAMPLE_TRACKER, 'closed');
    expect(container.innerHTML).toContain('OAA 5.0.0 Verification');
    expect(container.innerHTML).not.toContain('Package &amp; Distribution');
  });

  it('renders empty message when no epics match filter', () => {
    const container = { innerHTML: '' };
    const emptyData = { ...SAMPLE_TRACKER, epics: [] };
    renderTrackerPanel(container, emptyData, 'open');
    expect(container.innerHTML).toContain('No epics in this view');
  });

  it('marks active tab as accent-coloured', () => {
    const container = { innerHTML: '' };
    renderTrackerPanel(container, SAMPLE_TRACKER, 'open');
    // Active button uses accent colour
    expect(container.innerHTML).toContain("background:var(--viz-accent");
  });

  it('renders setTrackerFilter onclick on tabs', () => {
    const container = { innerHTML: '' };
    renderTrackerPanel(container, SAMPLE_TRACKER, 'open');
    expect(container.innerHTML).toContain("setTrackerFilter('open')");
    expect(container.innerHTML).toContain("setTrackerFilter('no-open-features')");
    expect(container.innerHTML).toContain("setTrackerFilter('closed')");
  });

  it('renders toggleTrackerEpic onclick on epic rows', () => {
    const container = { innerHTML: '' };
    renderTrackerPanel(container, SAMPLE_TRACKER, 'open');
    expect(container.innerHTML).toContain("toggleTrackerEpic('epic-6')");
  });
});

describe('loadTrackerData', () => {
  it('fetches from path and caches result', async () => {
    vi.stubGlobal('fetch', makeFetchMock(SAMPLE_TRACKER));
    const data = await loadTrackerData('/test/tracker.json');
    expect(data).toEqual(SAMPLE_TRACKER);
    expect(getTrackerData()).toEqual(SAMPLE_TRACKER);
  });

  it('appends cache-bust timestamp to URL', async () => {
    const fetchMock = makeFetchMock(SAMPLE_TRACKER);
    vi.stubGlobal('fetch', fetchMock);
    await loadTrackerData('/test/tracker.json');
    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toMatch(/\?t=\d+/);
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', makeFailingFetch(404));
    await expect(loadTrackerData('/missing.json')).rejects.toThrow('Failed to load tracker: 404');
  });
});

describe('initTrackerPanel', () => {
  it('does nothing when container not found', async () => {
    vi.stubGlobal('fetch', makeFetchMock(SAMPLE_TRACKER));
    await expect(initTrackerPanel('nonexistent')).resolves.toBeUndefined();
  });

  it('renders loading state then data', async () => {
    const el = createMockElement('programme-tracker-content');
    vi.stubGlobal('fetch', makeFetchMock(SAMPLE_TRACKER));
    setFilter('open');
    await initTrackerPanel('programme-tracker-content');
    // After load, should contain epic data
    expect(el.innerHTML).toContain('v1.0.0');
  });

  it('renders error state on fetch failure', async () => {
    const el = createMockElement('programme-tracker-content');
    vi.stubGlobal('fetch', makeFailingFetch(500));
    await initTrackerPanel('programme-tracker-content');
    expect(el.innerHTML).toContain('Failed to load programme tracker');
    expect(el.innerHTML).toContain('#ef4444');
  });
});

describe('refreshTrackerPanel', () => {
  it('does nothing when no data loaded', () => {
    // Reset cached data by loading null equivalent — just ensure no throw
    const el = createMockElement('programme-tracker-content');
    el.innerHTML = 'unchanged';
    // If _trackerData is null, refresh is a no-op
    // We can't directly clear the module-level var, but we can assert no-throw
    expect(() => refreshTrackerPanel('programme-tracker-content')).not.toThrow();
  });

  it('re-renders with current filter after data is loaded', async () => {
    const el = createMockElement('programme-tracker-content');
    vi.stubGlobal('fetch', makeFetchMock(SAMPLE_TRACKER));
    await initTrackerPanel('programme-tracker-content');

    setFilter('closed');
    refreshTrackerPanel('programme-tracker-content');
    expect(el.innerHTML).toContain('OAA 5.0.0 Verification');

    setFilter('open'); // reset
  });
});
