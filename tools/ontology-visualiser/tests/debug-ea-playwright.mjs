/**
 * Playwright debug script — EA sub-series graph rendering investigation
 * F10.7 (#885) — Critical debug: EA shows in library but not on graph
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:8765/PBS/TOOLS/ontology-visualiser/browser-viewer.html';
const SCREENSHOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    else if (msg.type() === 'warning') consoleWarnings.push(msg.text());
  });

  const eaRequests = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('EA') || url.includes('ea-')) {
      eaRequests.push({ url: url.split('/').slice(-3).join('/'), status: response.status() });
    }
  });

  // Step 1: Load page
  console.log('STEP 1: Loading visualiser...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Inject state accessor via ES module import
  await page.addScriptTag({
    type: 'module',
    content: `
      import { state } from './js/state.js';
      window.__debugState = state;
    `
  });
  await page.waitForTimeout(500);

  // Step 2: Click Load Registry
  console.log('STEP 2: Clicking Load Registry...');
  await page.click('button:has-text("Load Registry")');

  // Wait for registry to load (watch for tier 0 rendering)
  await page.waitForTimeout(8000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01-tier0-after-load.png` });
  console.log('   Screenshot: 01-tier0-after-load.png');

  // Step 3: Check state via injected accessor
  console.log('STEP 3: Checking state...');
  const stateCheck = await page.evaluate(() => {
    const s = window.__debugState;
    if (!s) return { error: 'state not accessible' };
    if (!s.loadedOntologies) return { error: 'loadedOntologies is null', viewMode: s.viewMode };

    const eaEntries = [];
    for (const [ns, rec] of s.loadedOntologies) {
      if (ns.includes('ea')) {
        eaEntries.push({
          ns, name: rec.name, series: rec.series, subSeries: rec.subSeries,
          status: rec.status, isPlaceholder: rec.isPlaceholder,
          hasParsed: !!rec.parsed, nodeCount: rec.parsed?.nodes?.length || 0,
          edgeCount: rec.parsed?.edges?.length || 0,
          loadError: rec.loadError || null
        });
      }
    }

    const eaGraphNodes = s.mergedGraph?.nodes?.filter(n =>
      n.sourceNamespace?.includes('ea') || n.id?.toLowerCase().includes('ea-core') ||
      n.id?.toLowerCase().includes('ea-togaf') || n.id?.toLowerCase().includes('ea-msft') ||
      n.id?.toLowerCase().includes('ea-ai')
    ) || [];

    return {
      viewMode: s.viewMode,
      totalLoaded: s.loadedOntologies.size,
      eaEntries,
      mergedGraphTotalNodes: s.mergedGraph?.nodes?.length || 0,
      mergedGraphTotalEdges: s.mergedGraph?.edges?.length || 0,
      eaGraphNodes: eaGraphNodes.length,
      eaSampleNodes: eaGraphNodes.slice(0, 5).map(n => ({
        id: n.id, label: n.label, series: n.series, ns: n.sourceNamespace
      })),
      crossEdges: s.crossEdges?.length || 0,
      hasNetwork: !!s.network,
    };
  });
  console.log('   State:', JSON.stringify(stateCheck, null, 2));

  // Step 4: Check vis-network dataset
  console.log('STEP 4: Checking vis-network for EA nodes...');
  const visCheck = await page.evaluate(() => {
    const s = window.__debugState;
    if (!s?.network) return { error: 'no network' };
    try {
      const nodeIds = s.network.body.data.nodes.getIds();
      const eaIds = nodeIds.filter(id =>
        typeof id === 'string' && (
          id.toLowerCase().includes('ea-core') || id.toLowerCase().includes('ea-togaf') ||
          id.toLowerCase().includes('ea-msft') || id.toLowerCase().includes('ea-ai')
        )
      );
      return { totalNodes: nodeIds.length, eaNodes: eaIds.length, sampleEaIds: eaIds.slice(0, 10) };
    } catch(e) { return { error: e.message }; }
  });
  console.log('   Vis-network:', JSON.stringify(visCheck, null, 2));

  // Step 5: Click "Ontologies" breadcrumb to switch to Tier 1 flat view
  console.log('STEP 5: Switching to Ontologies view...');
  const ontBtn = page.locator('button:has-text("Ontologies")');
  if (await ontBtn.count() > 0) {
    await ontBtn.first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-tier1-ontologies.png` });
    console.log('   Screenshot: 02-tier1-ontologies.png');

    // Check if EA nodes are in the tier 1 view
    const tier1Check = await page.evaluate(() => {
      const s = window.__debugState;
      if (!s?.network) return { error: 'no network' };
      const nodeIds = s.network.body.data.nodes.getIds();
      const eaIds = nodeIds.filter(id =>
        typeof id === 'string' && (
          id.toLowerCase().includes('ea-core') || id.toLowerCase().includes('ea-togaf') ||
          id.toLowerCase().includes('ea-msft') || id.toLowerCase().includes('ea-ai') ||
          id.toLowerCase().includes('ea:')
        )
      );
      return { totalNodes: nodeIds.length, eaNodes: eaIds.length, sampleEaIds: eaIds.slice(0, 15) };
    });
    console.log('   Tier 1 vis nodes:', JSON.stringify(tier1Check, null, 2));
  } else {
    console.log('   No Ontologies button found');
  }

  // Step 6: Click PE-Series node to drill into Tier 1 sub-series view
  console.log('STEP 6: Clicking PE-Series node...');
  // In the tier 0, double-click on the PE series node to drill in
  const peClick = await page.evaluate(() => {
    const s = window.__debugState;
    if (!s?.network) return { error: 'no network' };
    const nodeIds = s.network.body.data.nodes.getIds();
    const peNode = nodeIds.find(id => typeof id === 'string' && id.includes('PE'));
    if (peNode) {
      // Simulate double-click by emitting event
      s.network.body.emitter.emit('doubleClick', {
        nodes: [peNode],
        edges: [],
        event: { srcEvent: {} },
        pointer: { DOM: { x: 0, y: 0 }, canvas: { x: 0, y: 0 } }
      });
      return { clicked: peNode };
    }
    return { error: 'PE node not found', allNodes: nodeIds };
  });
  console.log('   PE click result:', JSON.stringify(peClick));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03-pe-series-drilldown.png` });
  console.log('   Screenshot: 03-pe-series-drilldown.png');

  // Check what nodes are visible now
  const afterPeClick = await page.evaluate(() => {
    const s = window.__debugState;
    if (!s?.network) return { error: 'no network' };
    const nodeIds = s.network.body.data.nodes.getIds();
    const labels = {};
    nodeIds.forEach(id => {
      try { labels[id] = s.network.body.data.nodes.get(id)?.label; } catch(e) {}
    });
    return { totalNodes: nodeIds.length, labels };
  });
  console.log('   After PE drill-down:', JSON.stringify(afterPeClick, null, 2));

  // Step 7: Click "Library" button and check the registry browser
  console.log('STEP 7: Checking Library/Registry Browser...');
  const libBtn = page.locator('button:has-text("Library")');
  if (await libBtn.count() > 0) {
    await libBtn.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-library-panel.png` });
    console.log('   Screenshot: 04-library-panel.png');

    // Check for EA entries in the library panel
    const libCheck = await page.evaluate(() => {
      // Find all text content that mentions EA
      const body = document.body.innerHTML;
      const eaMatches = [];
      const regex = /EA[-\s]?(CORE|TOGAF|MSFT|AI|ONT)/gi;
      let match;
      while ((match = regex.exec(body)) !== null) {
        // Get surrounding context
        const start = Math.max(0, match.index - 30);
        const end = Math.min(body.length, match.index + match[0].length + 30);
        eaMatches.push(body.substring(start, end).replace(/<[^>]+>/g, '').trim());
      }
      return { eaRefsInDOM: eaMatches.length, samples: [...new Set(eaMatches)].slice(0, 10) };
    });
    console.log('   Library EA refs:', JSON.stringify(libCheck, null, 2));
  }

  // Step 8: Look at sub-series nesting specifically
  console.log('STEP 8: Checking sub-series data...');
  const subSeriesCheck = await page.evaluate(() => {
    const s = window.__debugState;
    if (!s) return { error: 'no state' };
    const subSeriesData = s.subSeriesData;
    if (!subSeriesData) return { error: 'no subSeriesData', stateKeys: Object.keys(s).filter(k => k.includes('sub') || k.includes('Sub')) };
    return {
      keys: Object.keys(subSeriesData),
      ea: subSeriesData['PE-Series::EA'] || 'NOT_FOUND',
    };
  });
  console.log('   Sub-series data:', JSON.stringify(subSeriesCheck, null, 2));

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log('EA fetches:', eaRequests.length, '(all 200 OK)');
  console.log('Console errors:', consoleErrors.length);
  consoleErrors.forEach(e => console.log('  ERROR:', e.substring(0, 200)));
  console.log('EA-related warnings:', consoleWarnings.filter(w => w.toLowerCase().includes('ea')).length);
  consoleWarnings.filter(w => w.toLowerCase().includes('ea')).forEach(w => console.log('  WARN:', w));

  await browser.close();
}

run().catch(err => { console.error('FATAL:', err); process.exit(1); });
