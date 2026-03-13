/**
 * Unit tests for Document Register panel functions — URG Phase 2 (S.URG.5)
 * Tests the document register portion of panel-renderer.js.
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

// ─── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE_DOCS = [
  { filename: 'PFC-PBS-BRIEF-Document-Control-v1.0.0.md',       type: 'BRIEF', productCode: 'PBS',  epicRefs: [], status: 'Active' },
  { filename: 'PFC-PBS-IDX-Epic-and-Feature-Tracker.md',         type: 'IDX',   productCode: 'PBS',  epicRefs: [], status: 'Active' },
  { filename: 'PFC-STRAT-BRIEF-PF-Core-VSOM-v1.0.0.md',         type: 'BRIEF', productCode: 'STRAT', epicRefs: [], status: 'Active' },
  { filename: 'PFC-STRAT-PLAN-VSOM-Toolkit-v1.0.1.md',           type: 'PLAN',  productCode: 'STRAT', epicRefs: [], status: 'Active' },
  { filename: 'PFC-DSY-BRIEF-TypeScript-React-v1.0.0.md',        type: 'BRIEF', productCode: 'DSY',  epicRefs: [], status: 'Draft' },
  { filename: 'PFC-PPM-BRIEF-GitHub-Projects-v1.0.0.md',         type: 'BRIEF', productCode: 'PPM',  epicRefs: [], status: 'Superseded' },
  { filename: 'programme-tracker.schema.json',                    type: 'OTHER', productCode: 'PBS',  epicRefs: [], status: 'Active' },
  { filename: 'PFI-AIRL/PFI-AIRL-VE-BRIEF-01-v2.0.0.md',        type: 'BRIEF', productCode: 'VE',   epicRefs: [], status: 'Active' },
  { filename: 'PBS/PFI-WWG/STRATEGY/PFI-W4M-WWG-PLAN-v3.0.0.md', type: 'PLAN', productCode: 'VE',   epicRefs: [], status: 'Active' },
  { filename: 'pfi-w4m-eoms-dev/PBS/STRATEGY/PFI-EOMS-PLAN.md',  type: 'PLAN',  productCode: 'VE',   epicRefs: [], status: 'Active' },
];

const SAMPLE_TRACKER = {
  schemaVersion: '1.0.0',
  generated: '2026-03-11',
  epics: [],
  documents: SAMPLE_DOCS,
};

// ─── Import ───────────────────────────────────────────────────────────────────

import {
  buildDocumentUrl,
  groupDocumentsByProductCode,
  getAvailableTypes,
  getAvailableStatuses,
  filterDocuments,
  renderStatusBadge,
  renderTypeBadge,
  renderDocumentRow,
  renderDocumentGroup,
  renderDocumentRegisterPanel,
  setDocTypeFilter,
  getDocTypeFilter,
  setDocStatusFilter,
  getDocStatusFilter,
  toggleDocGroupExpansion,
  isDocGroupExpanded,
  initDocumentRegisterPanel,
  refreshDocumentRegisterPanel,
} from '../js/panel-renderer.js';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('buildDocumentUrl', () => {
  it('builds a GitHub URL for a strategy document', () => {
    const url = buildDocumentUrl('PFC-PBS-BRIEF-Document-Control-v1.0.0.md');
    expect(url).toBe('https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/STRATEGY/PFC-PBS-BRIEF-Document-Control-v1.0.0.md');
  });

  it('builds URL for PFI-AIRL subdir document', () => {
    const url = buildDocumentUrl('PFI-AIRL/PFI-AIRL-VE-BRIEF-01-v2.0.0.md');
    expect(url).toBe('https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/STRATEGY/PFI-AIRL/PFI-AIRL-VE-BRIEF-01-v2.0.0.md');
  });

  it('builds URL for PBS/-prefixed paths', () => {
    const url = buildDocumentUrl('PBS/PFI-WWG/STRATEGY/PFI-W4M-WWG-PLAN-v3.0.0.md');
    expect(url).toBe('https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/PBS/PFI-WWG/STRATEGY/PFI-W4M-WWG-PLAN-v3.0.0.md');
  });

  it('returns null for cross-repo paths', () => {
    expect(buildDocumentUrl('pfi-w4m-eoms-dev/PBS/STRATEGY/PFI-EOMS-PLAN.md')).toBeNull();
  });

  it('returns null for null/empty filename', () => {
    expect(buildDocumentUrl(null)).toBeNull();
    expect(buildDocumentUrl('')).toBeNull();
  });

  it('builds URL for azlan-github-workflow skill paths', () => {
    const url = buildDocumentUrl('azlan-github-workflow/skills/ARCH-PFC-DELTA-v1.0.0.md');
    expect(url).toBe('https://github.com/ajrmooreuk/Azlan-EA-AAA/blob/main/azlan-github-workflow/skills/ARCH-PFC-DELTA-v1.0.0.md');
  });
});

describe('groupDocumentsByProductCode', () => {
  it('groups by productCode', () => {
    const groups = groupDocumentsByProductCode(SAMPLE_DOCS);
    expect(groups.get('PBS')).toHaveLength(3);
    expect(groups.get('STRAT')).toHaveLength(2);
    expect(groups.get('VE')).toHaveLength(3);
  });

  it('returns a Map', () => {
    expect(groupDocumentsByProductCode(SAMPLE_DOCS)).toBeInstanceOf(Map);
  });

  it('returns empty Map for empty input', () => {
    expect(groupDocumentsByProductCode([])).toEqual(new Map());
  });

  it('uses OTHER as fallback for missing productCode', () => {
    const doc = { filename: 'foo.md', type: 'BRIEF', status: 'Active', epicRefs: [] };
    const groups = groupDocumentsByProductCode([doc]);
    expect(groups.has('OTHER')).toBe(true);
  });
});

describe('getAvailableTypes', () => {
  it('returns sorted unique types', () => {
    const types = getAvailableTypes(SAMPLE_DOCS);
    expect(types).toContain('BRIEF');
    expect(types).toContain('IDX');
    expect(types).toContain('PLAN');
    expect(types).toContain('OTHER');
    // No duplicates
    expect(types.length).toBe(new Set(types).size);
    // Sorted
    expect([...types]).toEqual([...types].sort());
  });

  it('returns empty array for empty input', () => {
    expect(getAvailableTypes([])).toHaveLength(0);
  });
});

describe('getAvailableStatuses', () => {
  it('returns sorted unique statuses', () => {
    const statuses = getAvailableStatuses(SAMPLE_DOCS);
    expect(statuses).toContain('Active');
    expect(statuses).toContain('Draft');
    expect(statuses).toContain('Superseded');
    expect(statuses.length).toBe(new Set(statuses).size);
  });
});

describe('filterDocuments', () => {
  it('returns all when both filters are null', () => {
    expect(filterDocuments(SAMPLE_DOCS, null, null)).toHaveLength(SAMPLE_DOCS.length);
  });

  it('filters by type', () => {
    const result = filterDocuments(SAMPLE_DOCS, 'BRIEF', null);
    expect(result.every(d => d.type === 'BRIEF')).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('filters by status', () => {
    const result = filterDocuments(SAMPLE_DOCS, null, 'Draft');
    expect(result.every(d => d.status === 'Draft')).toBe(true);
    expect(result).toHaveLength(1);
  });

  it('filters by both type and status', () => {
    const result = filterDocuments(SAMPLE_DOCS, 'BRIEF', 'Active');
    expect(result.every(d => d.type === 'BRIEF' && d.status === 'Active')).toBe(true);
  });

  it('returns empty when no match', () => {
    expect(filterDocuments(SAMPLE_DOCS, 'TEST', null)).toHaveLength(0);
  });
});

describe('renderStatusBadge', () => {
  it('renders Active in green', () => {
    const html = renderStatusBadge('Active');
    expect(html).toContain('Active');
    expect(html).toContain('#22c55e');
  });

  it('renders Draft in amber', () => {
    const html = renderStatusBadge('Draft');
    expect(html).toContain('#f59e0b');
  });

  it('renders Superseded in muted', () => {
    const html = renderStatusBadge('Superseded');
    expect(html).toContain('#555');
  });

  it('renders Proposal in blue', () => {
    const html = renderStatusBadge('Proposal');
    expect(html).toContain('#3b82f6');
  });

  it('renders Open in purple', () => {
    const html = renderStatusBadge('Open');
    expect(html).toContain('#818cf8');
  });
});

describe('renderTypeBadge', () => {
  it('renders the type text', () => {
    expect(renderTypeBadge('BRIEF')).toContain('BRIEF');
    expect(renderTypeBadge('ARCH')).toContain('ARCH');
  });
});

describe('renderDocumentRow', () => {
  const doc = SAMPLE_DOCS[0]; // PBS BRIEF Active

  it('renders the basename of filename', () => {
    const html = renderDocumentRow(doc);
    expect(html).toContain('PFC-PBS-BRIEF-Document-Control-v1.0.0.md');
  });

  it('renders a clickable link for standard strategy docs', () => {
    const html = renderDocumentRow(doc);
    expect(html).toContain('<a href=');
    expect(html).toContain('target="_blank"');
  });

  it('renders a plain span for cross-repo docs', () => {
    const crossRepo = SAMPLE_DOCS[9]; // eoms
    const html = renderDocumentRow(crossRepo);
    expect(html).not.toContain('<a href=');
    expect(html).toContain('PFI-EOMS-PLAN.md');
  });

  it('renders status badge', () => {
    const html = renderDocumentRow(doc);
    expect(html).toContain('Active');
  });

  it('renders type badge', () => {
    const html = renderDocumentRow(doc);
    expect(html).toContain('BRIEF');
  });

  it('contains doc-register-row class', () => {
    const html = renderDocumentRow(doc);
    expect(html).toContain('doc-register-row');
  });
});

describe('renderDocumentGroup', () => {
  beforeEach(() => {
    if (isDocGroupExpanded('PBS')) toggleDocGroupExpansion('PBS');
  });

  const pbsDocs = SAMPLE_DOCS.filter(d => d.productCode === 'PBS');

  it('renders product code as heading', () => {
    const html = renderDocumentGroup('PBS', pbsDocs, null, null);
    expect(html).toContain('PBS');
  });

  it('shows collapsed arrow when not expanded', () => {
    const html = renderDocumentGroup('PBS', pbsDocs, null, null);
    expect(html).toContain('▸');
  });

  it('shows expanded arrow when expanded', () => {
    toggleDocGroupExpansion('PBS');
    const html = renderDocumentGroup('PBS', pbsDocs, null, null);
    expect(html).toContain('▾');
    toggleDocGroupExpansion('PBS');
  });

  it('shows doc count pill', () => {
    const html = renderDocumentGroup('PBS', pbsDocs, null, null);
    expect(html).toContain('3');
  });

  it('renders document rows when expanded', () => {
    toggleDocGroupExpansion('PBS');
    const html = renderDocumentGroup('PBS', pbsDocs, null, null);
    expect(html).toContain('PFC-PBS-BRIEF-Document-Control-v1.0.0.md');
    toggleDocGroupExpansion('PBS');
  });

  it('does not render document rows when collapsed', () => {
    const html = renderDocumentGroup('PBS', pbsDocs, null, null);
    expect(html).not.toContain('PFC-PBS-BRIEF-Document-Control-v1.0.0.md');
  });

  it('shows filtered/total count when filter active', () => {
    const html = renderDocumentGroup('PBS', pbsDocs, 'BRIEF', null);
    expect(html).toContain('1/3');
  });

  it('shows empty message when expanded but no docs match filter', () => {
    toggleDocGroupExpansion('PBS');
    const html = renderDocumentGroup('PBS', pbsDocs, 'TEST', null);
    expect(html).toContain('No documents match');
    toggleDocGroupExpansion('PBS');
  });

  it('wires toggleDocGroup onclick', () => {
    const html = renderDocumentGroup('PBS', pbsDocs, null, null);
    expect(html).toContain("toggleDocGroup('PBS')");
  });
});

describe('doc filter state', () => {
  it('type filter defaults to null (all)', () => {
    setDocTypeFilter(null);
    expect(getDocTypeFilter()).toBeNull();
  });

  it('setDocTypeFilter stores value', () => {
    setDocTypeFilter('BRIEF');
    expect(getDocTypeFilter()).toBe('BRIEF');
    setDocTypeFilter(null);
  });

  it('setDocStatusFilter stores value', () => {
    setDocStatusFilter('Active');
    expect(getDocStatusFilter()).toBe('Active');
    setDocStatusFilter(null);
  });

  it('toggleDocGroupExpansion expands and collapses', () => {
    expect(isDocGroupExpanded('DSY')).toBe(false);
    toggleDocGroupExpansion('DSY');
    expect(isDocGroupExpanded('DSY')).toBe(true);
    toggleDocGroupExpansion('DSY');
    expect(isDocGroupExpanded('DSY')).toBe(false);
  });
});

describe('renderDocumentRegisterPanel', () => {
  it('renders loading state when data is null', () => {
    const container = { innerHTML: '' };
    renderDocumentRegisterPanel(container, null, null, null);
    expect(container.innerHTML).toContain('Loading');
  });

  it('does nothing when container is null', () => {
    expect(() => renderDocumentRegisterPanel(null, SAMPLE_TRACKER, null, null)).not.toThrow();
  });

  it('renders document count', () => {
    const container = { innerHTML: '' };
    renderDocumentRegisterPanel(container, SAMPLE_TRACKER, null, null);
    expect(container.innerHTML).toContain(`${SAMPLE_DOCS.length} documents`);
  });

  it('renders type filter chips', () => {
    const container = { innerHTML: '' };
    renderDocumentRegisterPanel(container, SAMPLE_TRACKER, null, null);
    expect(container.innerHTML).toContain("setDocRegTypeFilter('BRIEF')");
    expect(container.innerHTML).toContain("setDocRegTypeFilter('PLAN')");
  });

  it('renders status filter chips', () => {
    const container = { innerHTML: '' };
    renderDocumentRegisterPanel(container, SAMPLE_TRACKER, null, null);
    expect(container.innerHTML).toContain("setDocRegStatusFilter('Active')");
    expect(container.innerHTML).toContain("setDocRegStatusFilter('Draft')");
  });

  it('renders product code group headers', () => {
    const container = { innerHTML: '' };
    renderDocumentRegisterPanel(container, SAMPLE_TRACKER, null, null);
    expect(container.innerHTML).toContain('PBS');
    expect(container.innerHTML).toContain('STRAT');
    expect(container.innerHTML).toContain('VE');
  });

  it('marks active type filter with accent background', () => {
    const container = { innerHTML: '' };
    renderDocumentRegisterPanel(container, SAMPLE_TRACKER, 'BRIEF', null);
    expect(container.innerHTML).toContain("background:var(--viz-accent");
  });

  it('shows empty message when no groups after filtering', () => {
    const container = { innerHTML: '' };
    renderDocumentRegisterPanel(container, SAMPLE_TRACKER, 'TEST', null);
    expect(container.innerHTML).toContain('No documents match');
  });

  it('renders All button for type filter', () => {
    const container = { innerHTML: '' };
    renderDocumentRegisterPanel(container, SAMPLE_TRACKER, null, null);
    expect(container.innerHTML).toContain("setDocRegTypeFilter(null)");
  });
});

describe('initDocumentRegisterPanel', () => {
  it('does nothing when container not found', async () => {
    vi.stubGlobal('fetch', makeFetchMock(SAMPLE_TRACKER));
    await expect(initDocumentRegisterPanel('nonexistent')).resolves.toBeUndefined();
  });

  it('renders error state on fetch failure', async () => {
    const el = createMockElement('document-register-content');
    vi.stubGlobal('fetch', makeFailingFetch(500));
    // Need to clear cached _trackerData first — use a path no other test uses
    await initDocumentRegisterPanel('document-register-content', '/force-fail-register.json');
    expect(el.innerHTML).toContain('Failed to load document register');
    expect(el.innerHTML).toContain('#ef4444');
  });
});

describe('refreshDocumentRegisterPanel', () => {
  it('does not throw when container not found', () => {
    expect(() => refreshDocumentRegisterPanel('nonexistent')).not.toThrow();
  });

  it('re-renders with current filters after data loaded', async () => {
    const el = createMockElement('document-register-content');
    vi.stubGlobal('fetch', makeFetchMock(SAMPLE_TRACKER));
    await initDocumentRegisterPanel('document-register-content');
    setDocTypeFilter('BRIEF');
    refreshDocumentRegisterPanel('document-register-content');
    // Filtered view — type filter chips should show BRIEF as active
    expect(el.innerHTML).toContain('BRIEF');
    setDocTypeFilter(null);
  });
});
