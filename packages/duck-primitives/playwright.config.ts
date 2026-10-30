// From Radix UI primitives, playwright.config.ts. MIT, see src/__tests__/radix/LICENSE.

import { defineConfig } from '@playwright/test'

const PORT = 9009
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  expect: {
    timeout: 20_000,
  },
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  outputDir: '.e2e-results',
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  reporter: process.env.CI ? [['github']] : 'list',
  retries: process.env.CI ? 2 : 0,
  testDir: './src',
  testMatch: '**/__tests__/*.e2e.ts',
  timeout: 30_000,
  use: {
    // An action whose target never appears fails here rather than timing the test out, which test.fail cannot expect.
    actionTimeout: 20_000,
    baseURL,
    hasTouch: true,
    trace: 'on-first-retry',
    viewport: { height: 768, width: 1024 },
  },
  webServer: {
    command: 'bun run stories',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    url: `${baseURL}/iframe.html`,
  },
  workers: process.env.CI ? 2 : undefined,
})
