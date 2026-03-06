/**
 * Playwright debug — drill into EA sub-series group node
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

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  CONSOLE ERROR:', msg.text().substring(0, 200));
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.addScriptTag({ type: 'module', content: `import { state } from './js/state.js'; window.__debugState = state;` });
  await page.waitForTimeout(500);

  // Load registry
  console.log('1. Loading registry...');
  await page.click('button:has-text("Load Registry")');
  await page.waitForTimeout(8000);

  // Drill into PE-Series
  console.log('2. Drilling into PE-Series...');
  await page.evaluate(() => {
    const s = window.__debugState;
    s.network.body.emitter.emit('doubleClick', {
      nodes: ['PE-Series'], edges: [], event: { srcEvent: {} },
      pointer: { DOM: { x: 0, y: 0 }, canvas: { x: 0, y: 0 } }
    });
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/05-pe-drilldown.png` });

  // Check what's visible — find the EA sub-series group node
  const peView = await page.evaluate(() => {
    const s = window.__debugState;
    const nodeIds = s.network.body.data.nodes.getIds();
    const nodes = nodeIds.map(id => {
      const n = s.network.body.data.nodes.get(id);
      return { id, label: n?.label?.replace(/\n/g, ' '), group: n?.group };
    });
    return { count: nodes.length, nodes };
  });
  console.log('   PE view nodes:', JSON.stringify(peView, null, 2));

  // Now drill into the EA sub-series group
  console.log('3. Drilling into EA sub-series group...');
  const eaGroupId = peView.nodes.find(n => n.label?.includes('EA') && n.label?.includes('ontologies'))?.id;
  if (eaGroupId) {
    console.log(`   Found EA group node: ${eaGroupId}`);
    await page.evaluate((nodeId) => {
      const s = window.__debugState;
      s.network.body.emitter.emit('doubleClick', {
        nodes: [nodeId], edges: [], event: { srcEvent: {} },
        pointer: { DOM: { x: 0, y: 0 }, canvas: { x: 0, y: 0 } }
      });
    }, eaGroupId);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-ea-subseries-drilldown.png` });

    // Check what's now visible
    const eaView = await page.evaluate(() => {
      const s = window.__debugState;
      const nodeIds = s.network.body.data.nodes.getIds();
      const nodes = nodeIds.map(id => {
        const n = s.network.body.data.nodes.get(id);
        return { id, label: n?.label?.replace(/\n/g, ' ') };
      });
      return { count: nodes.length, nodes };
    });
    console.log('   EA drilldown nodes:', JSON.stringify(eaView, null, 2));
  } else {
    console.log('   EA group node NOT FOUND in PE view!');
    console.log('   Available nodes:', peView.nodes.map(n => `${n.id}: ${n.label}`));
  }

  // Step 4: Try clicking directly on an EA ontology from the Library panel
  console.log('4. Testing Library drill-to-ontology...');
  await page.evaluate(() => {
    if (window.drillToOntology) {
      window.drillToOntology('ea-core:');
    }
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/07-ea-core-direct.png` });

  const eaCoreView = await page.evaluate(() => {
    const s = window.__debugState;
    if (!s?.network) return { error: 'no network' };
    const nodeIds = s.network.body.data.nodes.getIds();
    return {
      viewMode: s.viewMode,
      totalNodes: nodeIds.length,
      sampleNodes: nodeIds.slice(0, 15)
    };
  });
  console.log('   EA-CORE direct view:', JSON.stringify(eaCoreView, null, 2));

  // Step 5: Now test "Ontologies (flat)" view - click the Ontologies breadcrumb
  console.log('5. Loading flat ontologies view...');
  // First go back to registry
  await page.evaluate(() => {
    const s = window.__debugState;
    // Re-render tier 0
    s.network.body.emitter.emit('doubleClick', {
      nodes: [], edges: [], event: { srcEvent: {} },
      pointer: { DOM: { x: 0, y: 0 }, canvas: { x: 0, y: 0 } }
    });
  });
  await page.waitForTimeout(1000);

  // Click "Ontologies (28)" button
  const ontBtn = page.locator('button:has-text("Ontologies")');
  if (await ontBtn.count() > 0) {
    await ontBtn.first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-flat-ontologies.png` });

    const flatView = await page.evaluate(() => {
      const s = window.__debugState;
      const nodeIds = s.network.body.data.nodes.getIds();
      const eaIds = nodeIds.filter(id => typeof id === 'string' && (
        id.includes('ea-core') || id.includes('ea-togaf') || id.includes('ea-msft') || id.includes('ea-ai') || id === 'ea:'
      ));
      return { totalNodes: nodeIds.length, eaNodes: eaIds.length, eaIds, allIds: nodeIds };
    });
    console.log('   Flat ontologies view:', JSON.stringify(flatView, null, 2));
  }

  await browser.close();
}

run().catch(err => { console.error('FATAL:', err); process.exit(1); });
