import { defineConfig, devices } from '@playwright/test';
import { sites } from './src/config/sites';

/**
 * Uji: one suite, two sites, five browser projects.
 *
 * - Desktop projects (chromium, firefox, webkit) run every spec except the ones tagged
 *   `@mobile-only`. Specs that need a phone-sized window set their own viewport, so the
 *   mobile drawer is still exercised on all three engines.
 * - Mobile projects (mobile-chrome, mobile-safari) emulate real devices (touch, isMobile,
 *   device pixel ratio) and run only the specs tagged `@mobile`.
 *
 * Each site's base URL comes from the environment with the production URL as default, so
 * the same specs run against a preview or staging build: see src/config/sites.ts.
 */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Both sites are live on a CDN; cap workers so a laptop run stays polite to the origin.
  workers: isCI ? 4 : '50%',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never', title: 'Uji: Peta Dunia and Pandu' }]],
  metadata: { sites },

  use: {
    // No baseURL here on purpose: each site's fixture (src/fixtures/<site>.ts) sets its own,
    // and a value here would override theirs.
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Default motion, as most visitors have it. Reduced motion is tested on purpose, per story.
    locale: 'en-GB',
    timezoneId: 'Asia/Kuala_Lumpur',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      grepInvert: /@mobile-only/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
      grepInvert: /@mobile-only/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
      grepInvert: /@mobile-only/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      grep: /@mobile/,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
      grep: /@mobile/,
    },
  ],
});
