#!/usr/bin/env node
/**
 * Playwright script to capture key Ontology Visualiser views for slide deck.
 * Usage: npx playwright test --config=playwright.config.mjs capture-screenshots.mjs
 *   OR:  node capture-screenshots.mjs  (standalone)
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../../..');  // Azlan-EA-AAA root

const SCREENSHOTS_DIR = join(__dirname, 'screenshots-deck');
const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json', '.jsonld': 'application/ld+json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

// Simple static file server
function startServer(port = 8321) {
  const server = createServer(async (req, res) => {
    let filePath = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (filePath.endsWith('/')) filePath += 'index.html';
    try {
      const data = await readFile(filePath);
      const ext = extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  return new Promise(r => server.listen(port, () => r(server)));
}

const BASE = 'http://localhost:8321/PBS/TOOLS/ontology-visualiser/browser-viewer.html';

async function waitForStable(page, ms = 2000) {
  await page.waitForTimeout(ms);
}

async function captureView(page, name, setupFn, waitMs = 3000) {
  try {
    console.log(`  Capturing: ${name}...`);
    if (setupFn) await setupFn(page);
    await waitForStable(page, waitMs);
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, `${name}.png`),
      fullPage: false,
    });
    console.log(`  ✓ ${name}.png`);
  } catch (err) {
    console.warn(`  ✗ ${name} failed: ${err.message.split('\n')[0]}`);
    // Still try to capture whatever is on screen
    try {
      await page.screenshot({ path: join(SCREENSHOTS_DIR, `${name}-partial.png`), fullPage: false });
      console.log(`  ~ ${name}-partial.png (captured current state)`);
    } catch {}
  }
}

async function main() {
  await mkdir(SCREENSHOTS_DIR, { recursive: true });
  const server = await startServer();
  console.log('Server started on port 8321');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    // 1. Load visualiser
    console.log('Loading visualiser...');
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForStable(page, 4000);

    // Screenshot 1: Landing / default view
    await captureView(page, '01-landing-view', null, 2000);

    // Screenshot 2: Tier 0 - Series Overview
    await captureView(page, '02-tier0-series-overview', async (p) => {
      await p.evaluate(() => {
        if (typeof navigateToTier0 === 'function') navigateToTier0();
        else if (typeof setViewMode === 'function') setViewMode('graph');
      });
    }, 4000);

    // Screenshot 3: All Ontologies view
    await captureView(page, '03-all-ontologies', async (p) => {
      await p.evaluate(() => {
        if (typeof showAllOntologies === 'function') showAllOntologies();
      });
    }, 3000);

    // Screenshot 4: Connection Map
    await captureView(page, '04-connection-map', async (p) => {
      await p.evaluate(() => {
        if (typeof showConnectionMap === 'function') showConnectionMap();
      });
    }, 4000);

    // Screenshot 5: Single ontology (VP-ONT) - need to load it first
    await captureView(page, '05-vp-ont-graph', async (p) => {
      await p.evaluate(() => {
        if (typeof setViewMode === 'function') setViewMode('graph');
        // Try to load VP-ONT from registry
        const select = document.querySelector('#ontology-select, select[name="ontology"]');
        if (select) {
          const opt = [...select.options].find(o => o.text?.includes('VP') || o.value?.includes('VP'));
          if (opt) { select.value = opt.value; select.dispatchEvent(new Event('change')); }
        }
      });
    }, 4000);

    // Screenshot 6: Decision Tree
    await captureView(page, '06-decision-tree', async (p) => {
      await p.evaluate(() => {
        if (typeof switchToDecisionTreeTab === 'function') switchToDecisionTreeTab();
      });
    }, 3000);

    // Screenshot 7: App Skeleton
    await captureView(page, '07-app-skeleton', async (p) => {
      await p.evaluate(() => {
        if (typeof switchToSkeletonTab === 'function') switchToSkeletonTab();
      });
    }, 3000);

    // Screenshot 8: Mermaid view
    await captureView(page, '08-mermaid-view', async (p) => {
      await p.evaluate(() => {
        if (typeof switchToMermaidTab === 'function') switchToMermaidTab();
      });
    }, 3000);

    // Screenshot 9: Registry Browser
    await captureView(page, '09-registry-browser', async (p) => {
      await p.evaluate(() => {
        if (typeof switchToRegistryBrowserTab === 'function') switchToRegistryBrowserTab();
      });
    }, 3000);

    // Screenshot 10: OAA Audit Panel (toggle it on)
    await captureView(page, '10-oaa-audit-panel', async (p) => {
      // Go back to graph view first
      await p.evaluate(() => {
        if (typeof setViewMode === 'function') setViewMode('graph');
      });
      await p.waitForTimeout(2000);
      await p.evaluate(() => {
        if (typeof toggleAudit === 'function') toggleAudit();
      });
    }, 3000);

    console.log(`\nAll screenshots saved to: ${SCREENSHOTS_DIR}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(console.error);
