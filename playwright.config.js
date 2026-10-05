import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: { baseURL: 'http://localhost:5173', trace: 'retain-on-failure', ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) },
  webServer: [
    { command: 'node ../DevTinder/scripts/startBrowserTestServer.js', url: 'http://localhost:7778/health', reuseExistingServer: false, timeout: 120000 },
    { command: 'npm run dev -- --host localhost --port 5173 --strictPort', url: 'http://localhost:5173', reuseExistingServer: false, env: { VITE_API_BASE_URL: 'http://localhost:7778' } },
  ],
});
