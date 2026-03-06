/**
 * Backlog Manager — IndexedDB CRUD, prioritisation logic, import/export.
 * Pure data layer; no DOM access.
 * Epic 8C — PE-Ontology-Management-Functions
 */

import { state, FEATURE_STATUSES, PRIORITY_BANDS } from './state.js';
import { initLibraryDB } from './library-manager.js';

// ========================================
// HELPERS
// ========================================

async function getDB() {
  if (!state.libraryDB) await initLibraryDB();
  return state.libraryDB;
}

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbTransaction(storeName, mode, fn) {
  return getDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], mode);
    const store = tx.objectStore(storeName);
    const result = fn(store);
    tx.oncomplete = () => resolve(result._value !== undefined ? result._value : undefined);
    tx.onerror = () => reject(tx.error);
  }));
}

// ========================================
// PRIORITY COMPUTATION
// ========================================

export function computePriority(valueScore, significanceScore) {
  return Math.max(1, Math.min(25, (valueScore || 1) * (significanceScore || 1)));
}

export function getPriorityBand(score) {
  return PRIORITY_BANDS.find(b => score >= b.min && score <= b.max) || PRIORITY_BANDS[0];
}

export function sortFeaturesByPriority(features) {
  return [...features].sort((a, b) => {
    if (a.priorityRank !== null && b.priorityRank !== null) return a.priorityRank - b.priorityRank;
    if (a.priorityRank !== null) return -1;
    if (b.priorityRank !== null) return 1;
    const diff = b.computedPriority - a.computedPriority;
    if (diff !== 0) return diff;
    return new Date(b.updated) - new Date(a.updated);
  });
}

export function buildPriorityMatrix(features) {
  // 5x5 grid: matrix[value-1][significance-1] = [features]
  const matrix = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []));
  for (const f of features) {
    const v = Math.max(1, Math.min(5, f.valueScore || 1)) - 1;
    const s = Math.max(1, Math.min(5, f.significanceScore || 1)) - 1;
    matrix[v][s].push(f);
  }
  return matrix;
}

// ========================================
// FEATURE CRUD
// ========================================

export async function createFeature(data) {
  const db = await getDB();
  const now = new Date().toISOString();
  const feature = {
    title: data.title || '',
    description: data.description || '',
    category: data.category || 'visualiser',
    userStory: data.userStory || '',
    acceptanceCriteria: data.acceptanceCriteria || [],
    epicId: data.epicId ?? null,
    valueScore: Math.max(1, Math.min(5, data.valueScore || 3)),
    significanceScore: Math.max(1, Math.min(5, data.significanceScore || 3)),
    computedPriority: computePriority(data.valueScore || 3, data.significanceScore || 3),
    priorityRank: data.priorityRank ?? null,
    status: data.status || 'draft',
    blockerReason: data.blockerReason || null,
    dailyFocus: data.dailyFocus || false,
    tags: data.tags || [],
    created: now,
    updated: now,
    notes: data.notes || '',
    backlogRef: data.backlogRef || null,
    // AI Capture metadata
    generatedBy: data.generatedBy || null,       // 'claude-cli' | 'manual' | null
    captureInput: data.captureInput || null,      // original brief text
    // Review / HITL fields
    reviewerName: data.reviewerName || null,
    reviewComment: data.reviewComment || null,
    reviewedAt: data.reviewedAt || null,
    rejectionHistory: data.rejectionHistory || [],
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['backlog-features'], 'readwrite');
    const store = tx.objectStore('backlog-features');
    const req = store.add(feature);
    req.onsuccess = () => resolve({ ...feature, id: req.result });
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateFeature(id, updates) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['backlog-features'], 'readwrite');
    const store = tx.objectStore('backlog-features');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) { reject(new Error(`Feature ${id} not found`)); return; }
      const merged = { ...existing, ...updates, id, updated: new Date().toISOString() };
      if (updates.valueScore !== undefined || updates.significanceScore !== undefined) {
        merged.computedPriority = computePriority(merged.valueScore, merged.significanceScore);
      }
      store.put(merged);
      tx.oncomplete = () => resolve(merged);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteFeature(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['backlog-features'], 'readwrite');
    tx.objectStore('backlog-features').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFeature(id) {
  const db = await getDB();
  return idbRequest(db.transaction(['backlog-features'], 'readonly').objectStore('backlog-features').get(id));
}

export async function getAllFeatures() {
  const db = await getDB();
  return idbRequest(db.transaction(['backlog-features'], 'readonly').objectStore('backlog-features').getAll());
}

export async function getFeaturesByEpic(epicId) {
  const db = await getDB();
  const store = db.transaction(['backlog-features'], 'readonly').objectStore('backlog-features');
  const index = store.index('epicId');
  return idbRequest(index.getAll(epicId));
}

export async function getFeaturesByStatus(status) {
  const db = await getDB();
  const store = db.transaction(['backlog-features'], 'readonly').objectStore('backlog-features');
  const index = store.index('status');
  return idbRequest(index.getAll(status));
}

// ========================================
// EPIC CRUD
// ========================================

export async function createEpic(data) {
  const db = await getDB();
  const now = new Date().toISOString();
  const allEpics = await getAllEpics();
  const epic = {
    title: data.title || '',
    description: data.description || '',
    category: data.category || 'visualiser',
    status: data.status || 'planning',
    sortOrder: data.sortOrder ?? allEpics.length,
    created: now,
    updated: now,
    backlogRef: data.backlogRef || null,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['backlog-epics'], 'readwrite');
    const store = tx.objectStore('backlog-epics');
    const req = store.add(epic);
    req.onsuccess = () => resolve({ ...epic, id: req.result });
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateEpic(id, updates) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['backlog-epics'], 'readwrite');
    const store = tx.objectStore('backlog-epics');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) { reject(new Error(`Epic ${id} not found`)); return; }
      const merged = { ...existing, ...updates, id, updated: new Date().toISOString() };
      store.put(merged);
      tx.oncomplete = () => resolve(merged);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteEpic(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['backlog-epics', 'backlog-features'], 'readwrite');
    tx.objectStore('backlog-epics').delete(id);
    // Unassign features from this epic
    const featureStore = tx.objectStore('backlog-features');
    const index = featureStore.index('epicId');
    const req = index.getAll(id);
    req.onsuccess = () => {
      for (const f of req.result) {
        f.epicId = null;
        f.updated = new Date().toISOString();
        featureStore.put(f);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getEpic(id) {
  const db = await getDB();
  return idbRequest(db.transaction(['backlog-epics'], 'readonly').objectStore('backlog-epics').get(id));
}

export async function getAllEpics() {
  const db = await getDB();
  const epics = await idbRequest(db.transaction(['backlog-epics'], 'readonly').objectStore('backlog-epics').getAll());
  return epics.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

// ========================================
// REVIEW STATE (localStorage)
// ========================================

const REVIEW_KEY = 'oaa-viz-backlog-review';

export function saveReviewState(data) {
  const existing = loadReviewState();
  const merged = { ...existing, ...data };
  localStorage.setItem(REVIEW_KEY, JSON.stringify(merged));
}

export function loadReviewState() {
  try { return JSON.parse(localStorage.getItem(REVIEW_KEY) || '{}'); }
  catch { return {}; }
}

export function clearReviewState() {
  localStorage.removeItem(REVIEW_KEY);
}

// ========================================
// EXPORT
// ========================================

export async function exportBacklogAsJSON() {
  const features = await getAllFeatures();
  const epics = await getAllEpics();
  const reviewState = loadReviewState();
  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    epics,
    features,
    reviewState,
  };
}

export async function exportBacklogAsMarkdown() {
  const epics = await getAllEpics();
  const features = await getAllFeatures();

  const statusEmoji = {
    'draft': '',
    'proposed': '',
    'prioritised': '',
    'in-progress': '(In Progress)',
    'done': '(Done)',
    'archived': '(Archived)',
  };

  let md = '# Feature Backlog\n\n';
  md += `> Exported ${new Date().toISOString()}\n\n`;

  // Group features by epicId
  const byEpic = new Map();
  byEpic.set(null, []);
  for (const e of epics) byEpic.set(e.id, []);
  for (const f of features) {
    const key = f.epicId ?? null;
    if (!byEpic.has(key)) byEpic.set(key, []);
    byEpic.get(key).push(f);
  }

  for (const epic of epics) {
    const epicFeatures = sortFeaturesByPriority(byEpic.get(epic.id) || []);
    const doneCount = epicFeatures.filter(f => f.status === 'done').length;
    md += `## EPIC: ${epic.title}\n\n`;
    md += `**Status:** ${epic.status} | **Progress:** ${doneCount}/${epicFeatures.length}\n\n`;
    if (epic.description) md += `**Goal:** ${epic.description}\n\n`;

    if (epicFeatures.length > 0) {
      md += '| # | Feature | Priority | Status | Category |\n';
      md += '|---|---------|----------|--------|----------|\n';
      epicFeatures.forEach((f, i) => {
        const check = f.status === 'done' ? '[x]' : '[ ]';
        const band = getPriorityBand(f.computedPriority);
        md += `| ${i + 1} | ${check} ${f.title} | ${f.computedPriority} (${band.label}) | ${f.status} ${statusEmoji[f.status] || ''} | ${f.category} |\n`;
      });
      md += '\n';
    }
  }

  // Unassigned features
  const unassigned = sortFeaturesByPriority(byEpic.get(null) || []);
  if (unassigned.length > 0) {
    md += '## Unassigned Features\n\n';
    md += '| # | Feature | Priority | Status | Category |\n';
    md += '|---|---------|----------|--------|----------|\n';
    unassigned.forEach((f, i) => {
      const band = getPriorityBand(f.computedPriority);
      md += `| ${i + 1} | ${f.title} | ${f.computedPriority} (${band.label}) | ${f.status} | ${f.category} |\n`;
    });
    md += '\n';
  }

  return md;
}

// ========================================
// IMPORT
// ========================================

export async function importBacklogFromJSON(data) {
  if (!data || (!data.features && !data.epics)) {
    throw new Error('Invalid backlog export format');
  }

  const epicIdMap = new Map(); // old id → new id
  let epicCount = 0;
  let featureCount = 0;

  if (data.epics) {
    for (const epic of data.epics) {
      const oldId = epic.id;
      const newEpic = { ...epic };
      delete newEpic.id;
      const created = await createEpic(newEpic);
      epicIdMap.set(oldId, created.id);
      epicCount++;
    }
  }

  if (data.features) {
    for (const feature of data.features) {
      const newFeature = { ...feature };
      delete newFeature.id;
      if (newFeature.epicId && epicIdMap.has(newFeature.epicId)) {
        newFeature.epicId = epicIdMap.get(newFeature.epicId);
      } else if (newFeature.epicId && !epicIdMap.has(newFeature.epicId)) {
        newFeature.epicId = null;
      }
      await createFeature(newFeature);
      featureCount++;
    }
  }

  if (data.reviewState) {
    saveReviewState(data.reviewState);
  }

  return { epicCount, featureCount };
}

export async function importFromBacklogMD(markdownText) {
  const lines = markdownText.split('\n');
  const epics = [];
  const features = [];
  let currentEpic = null;
  let featureIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match epic headers: ## EPIC N: Title  or  ## EPIC: Title
    const epicMatch = line.match(/^##\s+EPIC\s*(?:\d+)?:?\s*(.+)$/i);
    if (epicMatch) {
      const epic = await createEpic({
        title: epicMatch[1].trim(),
        description: '',
        status: 'planning',
        backlogRef: epicMatch[0],
      });
      currentEpic = epic;
      epics.push(epic);
      continue;
    }

    // Match table rows: | N | [x] Title | ... |  or  | N | Title | ... |
    const tableMatch = line.match(/^\|\s*\d+\s*\|\s*(?:\[[ x]\]\s*)?(.+?)\s*\|/);
    if (tableMatch && !line.includes('---') && !line.toLowerCase().includes('feature')) {
      const title = tableMatch[1].trim();
      if (!title) continue;
      featureIndex++;
      const feature = await createFeature({
        title,
        epicId: currentEpic ? currentEpic.id : null,
        valueScore: 3,
        significanceScore: 3,
        status: line.includes('[x]') ? 'done' : 'draft',
        backlogRef: currentEpic ? `${epics.length}.${featureIndex}` : null,
      });
      features.push(feature);
    }

    // Reset feature counter on new section
    if (line.startsWith('## ') && !epicMatch) {
      featureIndex = 0;
      currentEpic = null;
    }
  }

  return { epicCount: epics.length, featureCount: features.length };
}

// ========================================
// AI QUICK CAPTURE — PROMPT BUILDER
// ========================================

export function buildFeaturePrompt(briefText) {
  return `You are a product manager for the OAA Ontology Visualiser toolkit — an enterprise ontology management platform with visualisation, authoring, compliance auditing, and design-system integration.

Given this brief feature idea, generate a structured feature entry as JSON.

Brief idea: "${briefText.replace(/"/g, '\\"')}"

Output ONLY valid JSON (no markdown, no explanation) matching this exact schema:
{
  "title": "concise feature title (5-10 words)",
  "description": "detailed description (2-3 sentences explaining what the feature does and why)",
  "category": "one of: ontology, visualiser, toolkit, workbench",
  "userStory": "As a [role], I want [capability] so that [benefit]",
  "acceptanceCriteria": [
    "Given [context] When [action] Then [outcome]",
    "Given [context] When [action] Then [outcome]"
  ],
  "valueScore": <1-5 integer: 1=nice-to-have, 3=moderate benefit, 5=critical business value>,
  "significanceScore": <1-5 integer: 1=trivial change, 3=moderate effort, 5=major undertaking>,
  "tags": ["relevant", "tags"],
  "notes": "implementation considerations, dependencies, or risks"
}

Rules:
- valueScore and significanceScore MUST be integers 1-5
- acceptanceCriteria MUST have at least 2 items using Given/When/Then format
- category MUST be exactly one of: ontology, visualiser, toolkit, workbench
- userStory MUST follow "As a... I want... so that..." format
- Output ONLY the JSON object, nothing else`;
}

// ========================================
// HITL REVIEW — APPROVE / REJECT
// ========================================

export async function submitForReview(featureId) {
  return updateFeature(featureId, { status: 'pending-review' });
}

export async function approveFeature(featureId, reviewerName, comment) {
  return updateFeature(featureId, {
    status: 'approved',
    reviewerName: reviewerName || 'anonymous',
    reviewComment: comment || '',
    reviewedAt: new Date().toISOString(),
  });
}

export async function rejectFeature(featureId, reviewerName, reason) {
  const feature = await getFeature(featureId);
  if (!feature) throw new Error(`Feature ${featureId} not found`);

  const history = feature.rejectionHistory || [];
  history.push({
    reviewer: reviewerName || 'anonymous',
    comment: reason || '',
    timestamp: new Date().toISOString(),
  });

  return updateFeature(featureId, {
    status: 'draft',
    reviewerName: null,
    reviewComment: null,
    reviewedAt: null,
    rejectionHistory: history,
  });
}
