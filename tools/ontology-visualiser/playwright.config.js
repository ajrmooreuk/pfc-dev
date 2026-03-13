// @ts-check
import { defineConfig, devices } from '@playwright/test';

const GITHUB_PAGES_URL =
  'https://ajrmooreuk.github.io/Azlan-EA-AAA/PBS/TOOLS/ontology-visualiser/browser-viewer.html';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: GITHUB_PAGES_URL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: './tests/e2e/screenshots',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'tests/e2e/report' }]],
});
