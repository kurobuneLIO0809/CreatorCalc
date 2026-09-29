import { defineConfig, devices } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';

/** Uses the pre-installed Chromium in cloud sessions; set PW_CHROMIUM_PATH to override (unset = Playwright default). */
function findChromium(): string | undefined {
  if (process.env.PW_CHROMIUM_PATH) return process.env.PW_CHROMIUM_PATH;
  const root = '/opt/pw-browsers';
  if (!existsSync(root)) return undefined;
  const shell = readdirSync(root).find((d) => d.startsWith('chromium_headless_shell-'));
  if (shell && existsSync(`${root}/${shell}/chrome-linux/headless_shell`)) return `${root}/${shell}/chrome-linux/headless_shell`;
  return existsSync(`${root}/chromium`) ? `${root}/chromium` : undefined;
}
const executablePath = findChromium();
// A UTF-8 locale is required for Chromium to keep non-ASCII download file names.
const launchOptions = { executablePath, env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' } };

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: [['list']],
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:4321',
    acceptDownloads: true,
    launchOptions,
  },
  webServer: {
    command: 'node scripts/serve.mjs',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], launchOptions } },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions },
      testMatch: /mobile\.spec\.ts|smoke\.spec\.ts/,
    },
  ],
});
