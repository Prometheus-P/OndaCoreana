import { defineConfig, devices } from '@playwright/test';

const previewPort = Number(process.env.PLAYWRIGHT_PORT ?? '4321');
const previewHost = process.env.PLAYWRIGHT_HOST ?? '127.0.0.1';
const previewURL = `http://${previewHost}:${previewPort}`;
const previewCommand =
  process.env.PLAYWRIGHT_WEBSERVER_COMMAND ??
  `pnpm preview:e2e --port ${previewPort} --host ${previewHost}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: previewURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command: previewCommand,
    url: previewURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Increased timeout for CI
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
