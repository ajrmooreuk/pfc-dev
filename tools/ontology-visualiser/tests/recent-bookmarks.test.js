/**
 * Unit tests for recent files and bookmarks (localStorage-based, Epic 5).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: {},
}));

// Mock localStorage
const store = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn(key => store[key] ?? null),
  setItem: vi.fn((key, val) => { store[key] = val; }),
  removeItem: vi.fn(key => { delete store[key]; }),
});

// Clear store before each test
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.clearAllMocks();
});

import {
  addRecentFile, getRecentFiles, clearRecentFiles,
  addBookmark, removeBookmark, getBookmarks, isBookmarked
} from '../js/library-manager.js';

// --- Recent Files ---

describe('addRecentFile', () => {
  it('adds entry to recent list', () => {
    addRecentFile({ name: 'Test', source: 'file', path: 'test.json' });
    const recent = getRecentFiles();
    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe('Test');
  });

  it('deduplicates by path', () => {
    addRecentFile({ name: 'Test', source: 'file', path: 'test.json' });
    addRecentFile({ name: 'Test Updated', source: 'file', path: 'test.json' });
    const recent = getRecentFiles();
    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe('Test Updated');
  });

  it('deduplicates by URL', () => {
    addRecentFile({ name: 'URL1', source: 'url', url: 'https://example.com/a.json' });
    addRecentFile({ name: 'URL1 Updated', source: 'url', url: 'https://example.com/a.json' });
    const recent = getRecentFiles();
    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe('URL1 Updated');
  });

  it('caps at MAX_RECENT (20)', () => {
    for (let i = 0; i < 25; i++) {
      addRecentFile({ name: `Item ${i}`, source: 'file', path: `file-${i}.json` });
    }
    const recent = getRecentFiles();
    expect(recent).toHaveLength(20);
    // Most recent should be first
    expect(recent[0].name).toBe('Item 24');
  });

  it('most recent appears first', () => {
    addRecentFile({ name: 'First', source: 'file', path: 'a.json' });
    addRecentFile({ name: 'Second', source: 'file', path: 'b.json' });
    const recent = getRecentFiles();
    expect(recent[0].name).toBe('Second');
    expect(recent[1].name).toBe('First');
  });

  it('adds timestamp to entries', () => {
    addRecentFile({ name: 'Test', source: 'file', path: 'test.json' });
    const recent = getRecentFiles();
    expect(recent[0].timestamp).toBeDefined();
    expect(new Date(recent[0].timestamp).getTime()).toBeGreaterThan(0);
  });
});

describe('getRecentFiles', () => {
  it('returns empty array when nothing stored', () => {
    expect(getRecentFiles()).toEqual([]);
  });

  it('returns empty array for corrupt JSON', () => {
    store['oaa-viz-recent-files'] = 'not-json';
    expect(getRecentFiles()).toEqual([]);
  });
});

describe('clearRecentFiles', () => {
  it('removes all recent files', () => {
    addRecentFile({ name: 'Test', source: 'file', path: 'test.json' });
    clearRecentFiles();
    expect(getRecentFiles()).toEqual([]);
  });
});

// --- Bookmarks ---

describe('addBookmark', () => {
  it('adds entry to bookmarks', () => {
    addBookmark({ name: 'BM', source: 'file', path: 'bm.json' });
    const bm = getBookmarks();
    expect(bm).toHaveLength(1);
    expect(bm[0].name).toBe('BM');
  });

  it('prevents duplicates by path', () => {
    addBookmark({ name: 'BM', source: 'file', path: 'bm.json' });
    addBookmark({ name: 'BM Again', source: 'file', path: 'bm.json' });
    expect(getBookmarks()).toHaveLength(1);
  });

  it('prevents duplicates by URL', () => {
    addBookmark({ name: 'BM', source: 'url', url: 'https://example.com/a.json' });
    addBookmark({ name: 'BM Again', source: 'url', url: 'https://example.com/a.json' });
    expect(getBookmarks()).toHaveLength(1);
  });

  it('adds bookmarkedAt timestamp', () => {
    addBookmark({ name: 'BM', source: 'file', path: 'bm.json' });
    expect(getBookmarks()[0].bookmarkedAt).toBeDefined();
  });
});

describe('removeBookmark', () => {
  it('removes bookmark by key', () => {
    addBookmark({ name: 'BM', source: 'file', path: 'bm.json' });
    removeBookmark('bm.json');
    expect(getBookmarks()).toHaveLength(0);
  });

  it('no-ops when key not found', () => {
    addBookmark({ name: 'BM', source: 'file', path: 'bm.json' });
    removeBookmark('not-found.json');
    expect(getBookmarks()).toHaveLength(1);
  });
});

describe('isBookmarked', () => {
  it('returns true for bookmarked item', () => {
    addBookmark({ name: 'BM', source: 'file', path: 'bm.json' });
    expect(isBookmarked('bm.json')).toBe(true);
  });

  it('returns false for non-bookmarked item', () => {
    expect(isBookmarked('not-found.json')).toBe(false);
  });
});

describe('getBookmarks', () => {
  it('returns empty array when nothing stored', () => {
    expect(getBookmarks()).toEqual([]);
  });

  it('returns empty array for corrupt JSON', () => {
    store['oaa-viz-bookmarks'] = '{invalid}';
    expect(getBookmarks()).toEqual([]);
  });
});
