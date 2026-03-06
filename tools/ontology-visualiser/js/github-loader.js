/**
 * Unified Registry integration — loads registry index and resolves ontology entries.
 * GitHub API loading (loadFromGitHub) is in app.js to avoid circular dependencies.
 */

import { state, REGISTRY_BASE_PATH } from './state.js';

export async function loadRegistryIndex() {
  try {
    const cacheBust = '?t=' + Date.now();
    const response = await fetch(REGISTRY_BASE_PATH + 'ont-registry-index.json' + cacheBust);
    if (!response.ok) throw new Error(`Failed to load registry: ${response.status}`);
    state.registryIndex = await response.json();
    console.log('Registry index loaded:', state.registryIndex.entries?.length, 'entries');
    return state.registryIndex;
  } catch (err) {
    console.warn('Registry index not loaded:', err.message);
    return null;
  }
}

export function extractOntologyPrefix(ontologyData) {
  const id = ontologyData['@id'] || ontologyData.id;
  if (id) {
    const prefixMatch = id.match(/^([a-z-]+):/i) || id.match(/\/([a-z-]+)\/(?:schema|ontology)?$/i);
    if (prefixMatch) return prefixMatch[1].toLowerCase() + ':';
  }

  const altName = ontologyData.alternateName;
  if (altName) {
    const match = altName.match(/^([A-Z-]+)-ONT$/i);
    if (match) return match[1].toLowerCase() + ':';
  }

  return null;
}

export function findRegistryEntry(prefix) {
  if (!state.registryIndex || !state.registryIndex.entries) return null;

  const normalizedPrefix = prefix.toLowerCase().replace(/:$/, '') + ':';
  return state.registryIndex.entries.find(e => e.namespace?.toLowerCase() === normalizedPrefix);
}

export async function loadRegistryEntry(entryPath) {
  try {
    const relativePath = entryPath.replace('./', '');
    const response = await fetch(REGISTRY_BASE_PATH + relativePath);
    if (!response.ok) throw new Error(`Failed to load entry: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Failed to load registry entry:', err.message);
    return null;
  }
}

// ========================================
// GITHUB BROWSER API (Epic 5 — Stories 5.1.1, 5.1.2)
// ========================================

function ghFetch(url) {
  const pat = sessionStorage.getItem('gh_pat') || localStorage.getItem('gh_pat');
  if (!pat) throw new Error('No GitHub token configured. Use the gear icon to add a Personal Access Token.');
  return fetch(url, {
    headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/vnd.github.v3+json' }
  });
}

export async function listBranches(owner, repo) {
  const res = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=30`);
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`);
  return (await res.json()).map(b => b.name);
}

export async function listTags(owner, repo) {
  const res = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=30`);
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`);
  return (await res.json()).map(t => t.name);
}

export async function getRepoTree(owner, repo, ref, path = '') {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
  const res = await ghFetch(url);
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`);
  return (await res.json()).map(item => ({
    name: item.name, type: item.type, path: item.path, size: item.size
  }));
}

export async function fetchFileContent(owner, repo, ref, filePath) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${ref}`;
  const res = await ghFetch(url);
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return JSON.parse(atob(data.content));
}

// ========================================
// PAT MANAGEMENT (Epic 5 — Story 5.1.3)
// ========================================

export function getGitHubPAT() {
  return sessionStorage.getItem('gh_pat') || localStorage.getItem('gh_pat') || null;
}

export function setGitHubPAT(pat, persist = false) {
  sessionStorage.setItem('gh_pat', pat);
  if (persist) localStorage.setItem('gh_pat', pat);
  else localStorage.removeItem('gh_pat');
}

export function clearGitHubPAT() {
  sessionStorage.removeItem('gh_pat');
  localStorage.removeItem('gh_pat');
}

export async function validatePAT(pat) {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${pat}` }
    });
    if (!res.ok) return { valid: false, error: `HTTP ${res.status}` };
    const user = await res.json();
    return { valid: true, login: user.login, name: user.name, scopes: res.headers.get('x-oauth-scopes') };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

export async function lookupRegistry() {
  if (!state.currentData) return null;

  if (!state.registryIndex) await loadRegistryIndex();
  if (!state.registryIndex) {
    state.currentRegistryEntry = null;
    return null;
  }

  const prefix = extractOntologyPrefix(state.currentData);
  if (!prefix) {
    console.log('Could not extract prefix from ontology');
    state.currentRegistryEntry = null;
    return null;
  }

  console.log('Looking up registry entry for prefix:', prefix);
  const entrySummary = findRegistryEntry(prefix);

  if (entrySummary) {
    const fullEntry = await loadRegistryEntry(entrySummary.path);
    if (fullEntry) {
      state.currentRegistryEntry = {
        entryId: entrySummary['@id'],
        name: entrySummary.name,
        namespace: entrySummary.namespace,
        status: entrySummary.status,
        gatesPassed: entrySummary.gatesPassed,
        gatesFailed: entrySummary.gatesFailed,
        validatedDate: entrySummary.validatedDate,
        version: fullEntry.version,
        complianceStatus: fullEntry.complianceStatus,
        dependencies: fullEntry.dependencies || [],
        dependents: fullEntry.dependents || [],
        versionHistory: fullEntry.versionHistory || []
      };
      return state.currentRegistryEntry;
    }
  }

  state.currentRegistryEntry = null;
  return null;
}
