import { chromium } from 'playwright';

const BASE = 'http://localhost:8765/PBS/TOOLS/ontology-visualiser/browser-viewer.html';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });

  // Inject state access
  await page.addScriptTag({ type: 'module', content: "import { state } from './js/state.js'; window.__s = state;" });
  await page.waitForTimeout(500);

  // Load registry
  console.log('1. Loading registry...');
  await page.click('button:has-text("Load Registry")');
  await page.waitForTimeout(8000);

  // Check EA sub-series parent resolution
  const check = await page.evaluate(() => {
    const s = window.__s;
    if (!s.subSeriesData) return { error: 'no subSeriesData' };
    const ea = s.subSeriesData['PE-Series::EA'];
    if (!ea) return { error: 'no PE-Series::EA' };
    return {
      parentOntologyNs: ea.parentOntologyNs,
      parentOntologyShort: ea.parentOntologyShort,
      count: ea.count,
      name: ea.name
    };
  });
  console.log('2. EA sub-series data:', JSON.stringify(check, null, 2));

  // Drill to PE-Series
  console.log('3. Drilling to PE-Series...');
  await page.evaluate(() => window.drillToSeries('PE-Series'));
  await page.waitForTimeout(2000);

  // Check vis-network for EA group node and edges from ea-core:
  const graphCheck = await page.evaluate(() => {
    const s = window.__s;
    if (!s.network) return { error: 'no network' };
    const nodes = s.network.body.data.nodes.get();
    const edges = s.network.body.data.edges.get();
    const eaNode = nodes.find(n => n.id === 'PE-Series::EA');
    const eaCoreNode = nodes.find(n => n.id === 'ea-core:');
    const eaEdges = edges.filter(e =>
      (e.from === 'ea-core:' && e.to === 'PE-Series::EA') ||
      (e.from === 'PE-Series::EA' && e.to === 'ea-core:')
    );
    return {
      eaGroupNode: eaNode ? { id: eaNode.id, label: eaNode.label.replace(/\n/g, ' | ') } : null,
      eaCoreNode: eaCoreNode ? { id: eaCoreNode.id, label: eaCoreNode.label.replace(/\n/g, ' | ') } : null,
      edgesBetweenCoreAndEA: eaEdges.map(e => ({ from: e.from, to: e.to, label: e.label })),
      totalNodes: nodes.length,
      totalEdges: edges.length
    };
  });
  console.log('4. Graph state:', JSON.stringify(graphCheck, null, 2));

  // Screenshot PE drill-down
  await page.screenshot({ path: 'tests/screenshots/08-pe-drilldown-ea-fixed.png', fullPage: false });
  console.log('   Screenshot: 08-pe-drilldown-ea-fixed.png');

  // Drill into EA sub-series
  console.log('5. Drilling into EA sub-series...');
  await page.evaluate(() => window.drillToSubSeries('PE-Series', 'EA'));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/09-ea-subseries-fixed.png', fullPage: false });
  console.log('   Screenshot: 09-ea-subseries-fixed.png');

  await browser.close();
  console.log('Done.');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
