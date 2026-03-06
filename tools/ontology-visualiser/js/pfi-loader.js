/**
 * PFI Instance Data Loader — Epic 9D, Story 9D.4
 *
 * Loads PFI instance data files from the registry's pfiInstances[] entries.
 * Follows the loadDSInstanceData() pattern from ds-loader.js:
 * parallel fetch, parse, store in state.
 *
 * Pure async logic — no DOM access.
 */

import { state, REGISTRY_BASE_PATH } from './state.js';
import { parseOntology } from './ontology-parser.js';

// ========================================
// PFI INSTANCE DATA LOADING
// ========================================

/**
 * Load all PFI instance configurations from the registry index.
 * Populates state.pfiInstances from the registry's pfiInstances array
 * (if not already populated from emc-composer.js localStorage).
 *
 * @param {Object} registryIndex - Full registry index JSON
 * @returns {Array} Array of PFI instance config objects
 */
export function loadPFIInstanceConfigs(registryIndex) {
  const instances = registryIndex?.pfiInstances;
  if (!Array.isArray(instances) || instances.length === 0) return [];

  for (const inst of instances) {
    const id = inst['@id'] || inst.instanceId;
    if (id && !state.pfiInstances.has(id)) {
      state.pfiInstances.set(id, inst);
    }
  }

  return instances;
}

/**
 * Load instance data files for a specific PFI instance.
 * Fetches all instanceDataFiles[] in parallel, parses them with
 * parseOntology(), and stores the results in state.pfiInstanceData.
 *
 * @param {string} instanceId - e.g. 'PFI-BAIV'
 * @param {Object} [registryIndex] - Optional, uses state.registryIndex if not provided
 * @returns {Promise<{success: boolean, instanceId: string, files?: Array, orgContext?: Object, error?: string}>}
 */
export async function loadPFIInstanceData(instanceId, registryIndex) {
  const regIndex = registryIndex || state.registryIndex;
  if (!regIndex) {
    return { success: false, instanceId, error: 'No registry index available' };
  }

  // Find the instance config
  const instances = regIndex.pfiInstances || [];
  const instanceConfig = instances.find(i => (i['@id'] || i.instanceId) === instanceId);
  if (!instanceConfig) {
    return { success: false, instanceId, error: `Instance ${instanceId} not found in registry` };
  }

  const dataFiles = instanceConfig.instanceDataFiles || [];
  if (dataFiles.length === 0) {
    // No data files to load — still store the config
    const result = { files: [], orgContext: instanceConfig.orgContext || null, config: instanceConfig, parsed: [] };
    state.pfiInstanceData.set(instanceId, result);
    return { success: true, instanceId, ...result };
  }

  // Normalise file entries — W4M-WWG uses plain string paths, others use {ontologyRef, path}
  const normalisedFiles = dataFiles.map(entry => {
    if (typeof entry === 'string') {
      // Infer ontologyRef from path: "VE-Series/VP-ONT/..." → "VP-ONT"
      const ontMatch = entry.match(/\/([A-Z][A-Z0-9-]+-ONT)\//);
      return { ontologyRef: ontMatch ? ontMatch[1] : null, path: entry, type: 'instance-data', description: '' };
    }
    return entry;
  });

  // Load all data files in parallel
  const loadPromises = normalisedFiles.map(async (fileEntry) => {
    try {
      const resolvedPath = REGISTRY_BASE_PATH + fileEntry.path;
      const response = await fetch(resolvedPath);
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${resolvedPath}`);
      const jsonld = await response.json();

      // Parse using the standard ontology parser
      const parsed = parseOntology(jsonld);

      return {
        ontologyRef: fileEntry.ontologyRef,
        path: fileEntry.path,
        type: fileEntry.type || 'instance-data',
        description: fileEntry.description || '',
        rawData: jsonld,
        parsed,
        status: 'loaded',
      };
    } catch (err) {
      console.warn(`[PFI Loader] Failed to load ${fileEntry.path}:`, err.message);
      return {
        ontologyRef: fileEntry.ontologyRef,
        path: fileEntry.path,
        type: fileEntry.type || 'instance-data',
        description: fileEntry.description || '',
        rawData: null,
        parsed: null,
        status: 'load-failed',
        error: err.message,
      };
    }
  });

  const settled = await Promise.allSettled(loadPromises);
  const files = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      files.push(result.value);
    }
  }

  const instanceData = {
    files,
    orgContext: instanceConfig.orgContext || null,
    config: instanceConfig,
    parsed: files.filter(f => f.parsed).map(f => f.parsed),
    stats: {
      total: dataFiles.length,
      loaded: files.filter(f => f.status === 'loaded').length,
      failed: files.filter(f => f.status === 'load-failed').length,
    },
  };

  state.pfiInstanceData.set(instanceId, instanceData);
  return { success: true, instanceId, ...instanceData };
}

/**
 * Get the loaded data for a PFI instance.
 *
 * @param {string} instanceId
 * @returns {Object|null} Instance data or null
 */
export function getPFIInstanceData(instanceId) {
  return state.pfiInstanceData.get(instanceId) || null;
}

/**
 * List all available PFI instance IDs from the registry.
 *
 * @param {Object} [registryIndex] - Optional, uses state.registryIndex if not provided
 * @returns {Array<{id: string, name: string, products: string[], brands: string[]}>}
 */
export function listPFIInstances(registryIndex) {
  const regIndex = registryIndex || state.registryIndex;
  const instances = regIndex?.pfiInstances || [];

  return instances.map(inst => ({
    id: inst['@id'] || inst.instanceId,
    name: inst.name || inst['@id'],
    description: inst.description || '',
    products: inst.products || [],
    brands: inst.brands || [],
    requirementScopes: inst.requirementScopes || [],
    maturityLevel: inst.maturityLevel ?? 5,
    verticalMarket: inst.verticalMarket || null,
    jurisdictions: inst.jurisdictions || [],
  }));
}

/**
 * Clear loaded instance data for a specific instance or all instances.
 *
 * @param {string} [instanceId] - If omitted, clears all
 */
export function clearPFIInstanceData(instanceId) {
  if (instanceId) {
    state.pfiInstanceData.delete(instanceId);
  } else {
    state.pfiInstanceData.clear();
  }
}
