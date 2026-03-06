/**
 * Ontology Library — IndexedDB CRUD operations.
 * Pure data layer; no UI rendering or graph dependencies.
 */

import { state, DB_NAME, DB_VERSION, DEFAULT_CATEGORIES } from './state.js';
import { parseOntology } from './ontology-parser.js';
import { validateOAAv5 } from './audit-engine.js';

export function initLibraryDB() {
  return new Promise((resolve, reject) => {
    if (state.libraryDB) { resolve(state.libraryDB); return; }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      state.libraryDB = request.result;
      resolve(state.libraryDB);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('ontologies')) {
        const ontologyStore = db.createObjectStore('ontologies', { keyPath: 'id', autoIncrement: true });
        ontologyStore.createIndex('name', 'name', { unique: false });
        ontologyStore.createIndex('category', 'category', { unique: false });
        ontologyStore.createIndex('updated', 'updated', { unique: false });
      }

      if (!db.objectStoreNames.contains('versions')) {
        const versionStore = db.createObjectStore('versions', { keyPath: 'id', autoIncrement: true });
        versionStore.createIndex('ontologyId', 'ontologyId', { unique: false });
        versionStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // v3: Backlog Manager stores (Epic 8C — PE-Ontology-Management-Functions)
      if (!db.objectStoreNames.contains('backlog-features')) {
        const featureStore = db.createObjectStore('backlog-features', { keyPath: 'id', autoIncrement: true });
        featureStore.createIndex('epicId', 'epicId', { unique: false });
        featureStore.createIndex('status', 'status', { unique: false });
        featureStore.createIndex('category', 'category', { unique: false });
        featureStore.createIndex('computedPriority', 'computedPriority', { unique: false });
        featureStore.createIndex('updated', 'updated', { unique: false });
      }

      if (!db.objectStoreNames.contains('backlog-epics')) {
        const epicStore = db.createObjectStore('backlog-epics', { keyPath: 'id', autoIncrement: true });
        epicStore.createIndex('status', 'status', { unique: false });
        epicStore.createIndex('sortOrder', 'sortOrder', { unique: false });
      }

      // v4: Mindmap workspace store (F9F.8)
      if (!db.objectStoreNames.contains('mindmap-workspaces')) {
        const mmStore = db.createObjectStore('mindmap-workspaces', { keyPath: 'id', autoIncrement: true });
        mmStore.createIndex('name', 'name', { unique: false });
        mmStore.createIndex('updated', 'updated', { unique: false });
      }
    };
  });
}

export async function saveOntologyToLibrary(ontologyData, name, category, version, notes = '') {
  const db = await initLibraryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['ontologies', 'versions'], 'readwrite');
    const ontologyStore = transaction.objectStore('ontologies');
    const versionStore = transaction.objectStore('versions');

    const now = new Date().toISOString();

    const index = ontologyStore.index('name');
    const getRequest = index.getAll(name);

    getRequest.onsuccess = () => {
      const existing = getRequest.result.find(o => o.category === category);

      if (existing) {
        const oldVersion = existing.version;
        const newVersion = incrementVersion(oldVersion);

        versionStore.add({
          ontologyId: existing.id,
          version: oldVersion,
          data: existing.data,
          timestamp: existing.updated,
          notes: `Auto-saved before upgrade to ${newVersion}`
        });

        existing.data = ontologyData;
        existing.version = version || newVersion;
        existing.updated = now;
        existing.compliance = validateOAAv5(ontologyData, parseOntology(ontologyData, name)).overall;

        ontologyStore.put(existing);

        transaction.oncomplete = () => resolve({
          id: existing.id,
          version: existing.version,
          isUpdate: true,
          previousVersion: oldVersion
        });
      } else {
        const newOntology = {
          name: name,
          category: category,
          version: version || '1.0.0',
          data: ontologyData,
          created: now,
          updated: now,
          compliance: validateOAAv5(ontologyData, parseOntology(ontologyData, name)).overall
        };

        const addRequest = ontologyStore.add(newOntology);
        addRequest.onsuccess = () => {
          resolve({
            id: addRequest.result,
            version: newOntology.version,
            isUpdate: false
          });
        };
      }
    };

    transaction.onerror = () => reject(transaction.error);
  });
}

export function incrementVersion(version, bumpType) {
  const parts = version.split('.').map(Number);
  if (parts.length === 3) {
    if (bumpType === 'major') { parts[0]++; parts[1] = 0; parts[2] = 0; }
    else if (bumpType === 'minor') { parts[1]++; parts[2] = 0; }
    else { parts[2]++; }
    return parts.join('.');
  }
  return version + '.1';
}

export async function loadOntologyFromLibrary(id) {
  const db = await initLibraryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['ontologies'], 'readonly');
    const store = transaction.objectStore('ontologies');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOntologies() {
  const db = await initLibraryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['ontologies'], 'readonly');
    const store = transaction.objectStore('ontologies');
    const request = store.getAll();

    request.onsuccess = () => {
      const ontologies = request.result;
      const grouped = {};
      DEFAULT_CATEGORIES.forEach(cat => grouped[cat] = []);

      ontologies.forEach(ont => {
        const cat = ont.category || 'custom';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(ont);
      });

      Object.keys(grouped).forEach(cat => {
        grouped[cat].sort((a, b) => new Date(b.updated) - new Date(a.updated));
      });

      resolve(grouped);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getVersionHistory(ontologyId) {
  const db = await initLibraryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['versions'], 'readonly');
    const store = transaction.objectStore('versions');
    const index = store.index('ontologyId');
    const request = index.getAll(ontologyId);

    request.onsuccess = () => {
      const versions = request.result;
      versions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      resolve(versions);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFromLibrary(id) {
  const db = await initLibraryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['ontologies', 'versions'], 'readwrite');
    const ontologyStore = transaction.objectStore('ontologies');
    const versionStore = transaction.objectStore('versions');

    const versionIndex = versionStore.index('ontologyId');
    const getVersions = versionIndex.getAll(id);

    getVersions.onsuccess = () => {
      getVersions.result.forEach(v => versionStore.delete(v.id));
      ontologyStore.delete(id);
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getVersionById(versionId) {
  const db = await initLibraryDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['versions'], 'readonly');
    const store = transaction.objectStore('versions');
    const request = store.get(versionId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function exportLibraryData() {
  const db = await initLibraryDB();

  const ontologies = await new Promise((resolve, reject) => {
    const tx = db.transaction(['ontologies'], 'readonly');
    const req = tx.objectStore('ontologies').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  const versions = await new Promise((resolve, reject) => {
    const tx = db.transaction(['versions'], 'readonly');
    const req = tx.objectStore('versions').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    ontologies,
    versions
  };
}

export async function importLibraryData(importData) {
  if (!importData.ontologies || !Array.isArray(importData.ontologies)) {
    throw new Error('Invalid library export format');
  }

  const db = await initLibraryDB();

  const tx = db.transaction(['ontologies', 'versions'], 'readwrite');
  const ontStore = tx.objectStore('ontologies');
  const verStore = tx.objectStore('versions');

  let imported = 0;
  for (const ont of importData.ontologies) {
    const newOnt = { ...ont };
    delete newOnt.id;
    ontStore.add(newOnt);
    imported++;
  }

  if (importData.versions) {
    for (const ver of importData.versions) {
      const newVer = { ...ver };
      delete newVer.id;
      verStore.add(newVer);
    }
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(imported);
    tx.onerror = () => reject(tx.error);
  });
}

// ========================================
// RECENT FILES (Epic 5 — Story 5.3.1)
// ========================================

const RECENT_KEY = 'oaa-viz-recent-files';
const MAX_RECENT = 20;

export function addRecentFile(entry) {
  const recent = getRecentFiles();
  const key = entry.url || entry.path || entry.name;
  const filtered = recent.filter(r => (r.url || r.path || r.name) !== key);
  filtered.unshift({ ...entry, timestamp: new Date().toISOString() });
  localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
}

export function getRecentFiles() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
}

export function clearRecentFiles() {
  localStorage.removeItem(RECENT_KEY);
}

// ========================================
// BOOKMARKS / FAVORITES (Epic 5 — Story 5.3.3)
// ========================================

const BOOKMARKS_KEY = 'oaa-viz-bookmarks';

export function addBookmark(entry) {
  const bookmarks = getBookmarks();
  const key = entry.url || entry.path || entry.name;
  if (bookmarks.some(b => (b.url || b.path || b.name) === key)) return;
  bookmarks.push({ ...entry, bookmarkedAt: new Date().toISOString() });
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function removeBookmark(key) {
  const bookmarks = getBookmarks().filter(b => (b.url || b.path || b.name) !== key);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); }
  catch { return []; }
}

export function isBookmarked(key) {
  return getBookmarks().some(b => (b.url || b.path || b.name) === key);
}
