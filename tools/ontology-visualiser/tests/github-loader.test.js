/**
 * Unit tests for github-loader.js — GitHub API helpers and PAT management (Epic 5).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state.js
vi.mock('../js/state.js', () => ({
  state: { registryIndex: null, currentRegistryEntry: null },
  REGISTRY_BASE_PATH: '../../ONTOLOGIES/ontology-library/',
}));

// Mock sessionStorage & localStorage
const sessionStore = {};
const localStore = {};

vi.stubGlobal('sessionStorage', {
  getItem: vi.fn(key => sessionStore[key] ?? null),
  setItem: vi.fn((key, val) => { sessionStore[key] = val; }),
  removeItem: vi.fn(key => { delete sessionStore[key]; }),
});

vi.stubGlobal('localStorage', {
  getItem: vi.fn(key => localStore[key] ?? null),
  setItem: vi.fn((key, val) => { localStore[key] = val; }),
  removeItem: vi.fn(key => { delete localStore[key]; }),
});

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());
vi.stubGlobal('atob', vi.fn(str => Buffer.from(str, 'base64').toString('utf-8')));

beforeEach(() => {
  Object.keys(sessionStore).forEach(k => delete sessionStore[k]);
  Object.keys(localStore).forEach(k => delete localStore[k]);
  vi.clearAllMocks();
});

import {
  listBranches, listTags, getRepoTree, fetchFileContent,
  getGitHubPAT, setGitHubPAT, clearGitHubPAT, validatePAT
} from '../js/github-loader.js';

// --- PAT Management ---

describe('getGitHubPAT', () => {
  it('returns null when no token set', () => {
    expect(getGitHubPAT()).toBeNull();
  });

  it('returns sessionStorage token first', () => {
    sessionStore['gh_pat'] = 'session-token';
    localStore['gh_pat'] = 'local-token';
    expect(getGitHubPAT()).toBe('session-token');
  });

  it('falls back to localStorage', () => {
    localStore['gh_pat'] = 'local-token';
    expect(getGitHubPAT()).toBe('local-token');
  });
});

describe('setGitHubPAT', () => {
  it('stores in sessionStorage', () => {
    setGitHubPAT('my-token');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('gh_pat', 'my-token');
  });

  it('stores in localStorage when persist=true', () => {
    setGitHubPAT('my-token', true);
    expect(localStorage.setItem).toHaveBeenCalledWith('gh_pat', 'my-token');
  });

  it('removes from localStorage when persist=false', () => {
    setGitHubPAT('my-token', false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('gh_pat');
  });
});

describe('clearGitHubPAT', () => {
  it('removes from both storages', () => {
    sessionStore['gh_pat'] = 'token';
    localStore['gh_pat'] = 'token';
    clearGitHubPAT();
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('gh_pat');
    expect(localStorage.removeItem).toHaveBeenCalledWith('gh_pat');
  });
});

// --- validatePAT ---

describe('validatePAT', () => {
  it('returns user info on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ login: 'testuser', name: 'Test User' }),
      headers: { get: () => 'repo, read:org' },
    });
    const result = await validatePAT('ghp_test');
    expect(result.valid).toBe(true);
    expect(result.login).toBe('testuser');
    expect(result.scopes).toBe('repo, read:org');
  });

  it('returns error on 401', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });
    const result = await validatePAT('bad-token');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('401');
  });

  it('handles network error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network down'));
    const result = await validatePAT('ghp_test');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Network down');
  });
});

// --- GitHub API Helpers ---

describe('listBranches', () => {
  it('returns branch names', async () => {
    sessionStore['gh_pat'] = 'token';
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ name: 'main' }, { name: 'develop' }]),
    });
    const branches = await listBranches('owner', 'repo');
    expect(branches).toEqual(['main', 'develop']);
  });

  it('throws on error response', async () => {
    sessionStore['gh_pat'] = 'token';
    fetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });
    await expect(listBranches('owner', 'repo')).rejects.toThrow('GitHub 404');
  });
});

describe('listTags', () => {
  it('returns tag names', async () => {
    sessionStore['gh_pat'] = 'token';
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ name: 'v1.0.0' }, { name: 'v2.0.0' }]),
    });
    const tags = await listTags('owner', 'repo');
    expect(tags).toEqual(['v1.0.0', 'v2.0.0']);
  });
});

describe('getRepoTree', () => {
  it('returns file listing', async () => {
    sessionStore['gh_pat'] = 'token';
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { name: 'src', type: 'dir', path: 'src', size: 0 },
        { name: 'README.md', type: 'file', path: 'README.md', size: 1024 },
      ]),
    });
    const tree = await getRepoTree('owner', 'repo', 'main');
    expect(tree).toHaveLength(2);
    expect(tree[0].type).toBe('dir');
    expect(tree[1].name).toBe('README.md');
  });
});

describe('fetchFileContent', () => {
  it('decodes base64 JSON', async () => {
    sessionStore['gh_pat'] = 'token';
    const jsonContent = JSON.stringify({ name: 'Test Ontology', version: '1.0.0' });
    const base64Content = Buffer.from(jsonContent).toString('base64');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ content: base64Content }),
    });
    const data = await fetchFileContent('owner', 'repo', 'main', 'ontology.json');
    expect(data.name).toBe('Test Ontology');
    expect(data.version).toBe('1.0.0');
  });
});
