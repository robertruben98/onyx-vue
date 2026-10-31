import { fileURLToPath } from 'node:url';
import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '*.browser.mjs',
  timeout: 30_000,
  globalTimeout: 240_000,
  retries: 0,
  workers: 1,
  reporter: 'list',
  outputDir: '../test-results',
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm exec --prefix docs -- vite build docs --base / && npm exec --prefix docs -- vite preview docs --host 127.0.0.1 --port 4173 --strictPort',
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
