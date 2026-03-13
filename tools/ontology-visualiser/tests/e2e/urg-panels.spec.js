// @ts-nocheck
/**
 * URG Programme Management Panel — Playwright e2e tests
 *
 * Covers SOP-URG-04 (Programme Review Export) and panel interaction patterns from
 * OPERATING-GUIDE-PFC-URG-v1.0.0.md. Runs against the live GitHub Pages URL.
 *
 * URL: https://ajrmooreuk.github.io/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/browser-viewer.html
 * Epic: 46 (#683) F46.3 (#686) — URG Programme Management Skills
 */

import { test, expect } from '@playwright/test';

const PAGES_URL =
  'https://ajrmooreuk.github.io/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/browser-viewer.html';

const SCREENSHOTS = 'tests/e2e/screenshots';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Wait for a panel to become visible and its content to finish loading. */
async function waitForPanel(page, panelSelector, contentSelector) {
  await expect(page.locator(panelSelector)).toBeVisible({ timeout: 15_000 });
  await page.waitForFunction(
    (sel) => document.querySelector(sel)?.children.length > 0,
    contentSelector,
    { timeout: 15_000 }
  );
}

// ─── Programme Tracker Panel ─────────────────────────────────────────────────

test.describe('Programme Tracker Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES_URL);
    await page.waitForFunction(() => typeof window.toggleProgrammeTrackerPanel === 'function', {
      timeout: 20_000,
    });
  });

  test('01 — panel opens and displays epics', async ({ page }) => {
    await page.evaluate(() => window.toggleProgrammeTrackerPanel());
    await waitForPanel(page, '#programme-tracker-panel', '#programme-tracker-content');

    await expect(page.locator('#programme-tracker-panel')).toContainText('Programme Tracker');

    const epicRows = page.locator('#programme-tracker-content .tracker-epic-row');
    await expect(epicRows.first()).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: `${SCREENSHOTS}/01-tracker-panel-open.png`, fullPage: false });
  });

  test('02 — filter: open epics', async ({ page }) => {
    await page.evaluate(() => window.toggleProgrammeTrackerPanel());
    await waitForPanel(page, '#programme-tracker-panel', '#programme-tracker-content');

    await page.evaluate(() => window.setTrackerFilter('open'));
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${SCREENSHOTS}/02-tracker-filter-open.png`, fullPage: false });

    const closedBadges = page.locator('#programme-tracker-content [data-status="closed"]');
    await expect(closedBadges).toHaveCount(0);
  });

  test('03 — filter: no-open-features epics', async ({ page }) => {
    await page.evaluate(() => window.toggleProgrammeTrackerPanel());
    await waitForPanel(page, '#programme-tracker-panel', '#programme-tracker-content');

    await page.evaluate(() => window.setTrackerFilter('no-open-features'));
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${SCREENSHOTS}/03-tracker-filter-no-open-features.png`, fullPage: false });
  });

  test('04 — filter: closed epics', async ({ page }) => {
    await page.evaluate(() => window.toggleProgrammeTrackerPanel());
    await waitForPanel(page, '#programme-tracker-panel', '#programme-tracker-content');

    await page.evaluate(() => window.setTrackerFilter('closed'));
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${SCREENSHOTS}/04-tracker-filter-closed.png`, fullPage: false });
  });

  test('05 — epic expand / collapse reveals feature rows', async ({ page }) => {
    await page.evaluate(() => window.toggleProgrammeTrackerPanel());
    await waitForPanel(page, '#programme-tracker-panel', '#programme-tracker-content');

    await page.evaluate(() => window.setTrackerFilter('open'));
    await page.waitForTimeout(300);

    const firstEpicId = await page.evaluate(() => {
      const el = document.querySelector('#programme-tracker-content [data-epic-id]');
      return el?.getAttribute('data-epic-id') ?? null;
    });

    expect(firstEpicId).not.toBeNull();

    // Expand
    await page.evaluate((id) => window.toggleTrackerEpic(id), firstEpicId);
    await page.waitForTimeout(400);

    await page.screenshot({ path: `${SCREENSHOTS}/05a-tracker-epic-expanded.png`, fullPage: false });

    // Content should have grown with feature rows
    const contentAfterExpand = await page.locator('#programme-tracker-content').textContent();
    expect(contentAfterExpand?.length).toBeGreaterThan(100);

    // Collapse
    await page.evaluate((id) => window.toggleTrackerEpic(id), firstEpicId);
    await page.waitForTimeout(400);

    await page.screenshot({ path: `${SCREENSHOTS}/05b-tracker-epic-collapsed.png`, fullPage: false });
  });

  test('06 — panel closes', async ({ page }) => {
    await page.evaluate(() => window.toggleProgrammeTrackerPanel());
    await waitForPanel(page, '#programme-tracker-panel', '#programme-tracker-content');

    await page.evaluate(() => window.toggleProgrammeTrackerPanel());
    await expect(page.locator('#programme-tracker-panel')).toBeHidden({ timeout: 5_000 });

    await page.screenshot({ path: `${SCREENSHOTS}/06-tracker-panel-closed.png`, fullPage: false });
  });
});

// ─── Document Register Panel ─────────────────────────────────────────────────

test.describe('Document Register Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES_URL);
    await page.waitForFunction(() => typeof window.toggleDocumentRegisterPanel === 'function', {
      timeout: 20_000,
    });
  });

  test('07 — panel opens and displays document groups', async ({ page }) => {
    await page.evaluate(() => window.toggleDocumentRegisterPanel());
    await waitForPanel(page, '#document-register-panel', '#document-register-content');

    await expect(page.locator('#document-register-panel')).toContainText('Document Register');

    // Groups render as .doc-group-header elements (one per productCode)
    const groups = page.locator('#document-register-content .doc-group-header');
    await expect(groups.first()).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: `${SCREENSHOTS}/07-docregister-panel-open.png`, fullPage: false });
  });

  test('08 — type filter chip narrows visible documents', async ({ page }) => {
    await page.evaluate(() => window.toggleDocumentRegisterPanel());
    await waitForPanel(page, '#document-register-panel', '#document-register-content');

    await page.evaluate(() => window.setDocRegTypeFilter('BRIEF'));
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${SCREENSHOTS}/08-docregister-filter-BRIEF.png`, fullPage: false });

    const content = await page.locator('#document-register-content').textContent();
    expect(content?.length).toBeGreaterThan(50);
  });

  test('09 — status filter: Active documents', async ({ page }) => {
    await page.evaluate(() => window.toggleDocumentRegisterPanel());
    await waitForPanel(page, '#document-register-panel', '#document-register-content');

    await page.evaluate(() => window.setDocRegStatusFilter('Active'));
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${SCREENSHOTS}/09-docregister-filter-active.png`, fullPage: false });
  });

  test('10 — product code group expand / collapse', async ({ page }) => {
    await page.evaluate(() => window.toggleDocumentRegisterPanel());
    await waitForPanel(page, '#document-register-panel', '#document-register-content');

    // Extract product code from the onclick attribute: onclick="toggleDocGroup('PBS')"
    const firstCode = await page.evaluate(() => {
      const el = document.querySelector('#document-register-content .doc-group-header');
      const match = el?.getAttribute('onclick')?.match(/toggleDocGroup\('([^']+)'\)/);
      return match?.[1] ?? null;
    });

    if (firstCode) {
      // Expand (groups start collapsed)
      await page.evaluate((code) => window.toggleDocGroup(code), firstCode);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${SCREENSHOTS}/10a-docregister-group-expanded.png`, fullPage: false });

      // Collapse
      await page.evaluate((code) => window.toggleDocGroup(code), firstCode);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${SCREENSHOTS}/10b-docregister-group-collapsed.png`, fullPage: false });
    } else {
      await page.screenshot({ path: `${SCREENSHOTS}/10-docregister-groups.png`, fullPage: false });
    }
  });

  test('11 — document links are rendered correctly', async ({ page }) => {
    await page.evaluate(() => window.toggleDocumentRegisterPanel());
    await waitForPanel(page, '#document-register-panel', '#document-register-content');

    // Groups start collapsed — expand the first one to render document rows
    const firstCode = await page.evaluate(() => {
      const el = document.querySelector('#document-register-content .doc-group-header');
      const match = el?.getAttribute('onclick')?.match(/toggleDocGroup\('([^']+)'\)/);
      return match?.[1] ?? null;
    });

    expect(firstCode).not.toBeNull();
    await page.evaluate((code) => window.toggleDocGroup(code), firstCode);
    await page.waitForTimeout(500);

    // Links should now be in the DOM pointing to GitHub
    const links = page.locator('#document-register-content a[href*="github.com/ajrmooreuk"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    const firstHref = await links.first().getAttribute('href');
    expect(firstHref).toContain('ajrmooreuk/Azlan-EA-AAA');

    await page.screenshot({ path: `${SCREENSHOTS}/11-docregister-document-links.png`, fullPage: false });
  });

  test('12 — panel closes', async ({ page }) => {
    await page.evaluate(() => window.toggleDocumentRegisterPanel());
    await waitForPanel(page, '#document-register-panel', '#document-register-content');

    await page.evaluate(() => window.toggleDocumentRegisterPanel());
    await expect(page.locator('#document-register-panel')).toBeHidden({ timeout: 5_000 });

    await page.screenshot({ path: `${SCREENSHOTS}/12-docregister-panel-closed.png`, fullPage: false });
  });
});

// ─── Both panels simultaneously ──────────────────────────────────────────────

test.describe('Both panels — programme review layout', () => {
  test('13 — tracker and doc register open simultaneously (SOP-URG-06)', async ({ page }) => {
    await page.goto(PAGES_URL);
    await page.waitForFunction(
      () =>
        typeof window.toggleProgrammeTrackerPanel === 'function' &&
        typeof window.toggleDocumentRegisterPanel === 'function',
      { timeout: 20_000 }
    );

    await page.evaluate(() => window.toggleProgrammeTrackerPanel());
    await waitForPanel(page, '#programme-tracker-panel', '#programme-tracker-content');

    await page.evaluate(() => window.toggleDocumentRegisterPanel());
    await waitForPanel(page, '#document-register-panel', '#document-register-content');

    await expect(page.locator('#programme-tracker-panel')).toBeVisible();
    await expect(page.locator('#document-register-panel')).toBeVisible();

    await page.screenshot({ path: `${SCREENSHOTS}/13-both-panels-open-programme-review.png`, fullPage: true });
  });
});
