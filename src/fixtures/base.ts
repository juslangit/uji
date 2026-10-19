import { test as base, expect } from '@playwright/test';
import type AxeBuilder from '@axe-core/playwright';
import { axeFor } from '../support/a11y';
import { ConsoleGuard } from '../support/console-guard';

export interface BaseOptions {
  /**
   * A console error a spec expects and accepts, matched against the message text. Keep it
   * narrow and say why at the call site, e.g. the 404 page logs the 404 it was served.
   * (One pattern rather than a list: Playwright reads an array passed to test.use() as a
   * [value, options] fixture tuple. Combine cases with `|` instead.)
   */
  allowedConsoleError: RegExp | null;
}

export interface BaseFixtures {
  /** Fails the test after it runs if any console error or uncaught exception was seen. */
  consoleGuard: ConsoleGuard;
  /** axe-core builder pre-set to WCAG 2.2 AA; call `.analyze()` once the page is in state. */
  makeAxeBuilder: () => AxeBuilder;
}

/**
 * The base test every spec builds on. `consoleGuard` is an automatic fixture: it is set up for
 * every test without being asked for, so no spec can forget the "no console errors" rule.
 */
export const test = base.extend<BaseOptions & BaseFixtures>({
  allowedConsoleError: [null, { option: true }],

  consoleGuard: [
    async ({ page, allowedConsoleError }, use) => {
      const guard = new ConsoleGuard(page, allowedConsoleError);
      await use(guard);
      expect(guard.report, 'the browser console must stay free of errors').toEqual([]);
    },
    { auto: true },
  ],

  makeAxeBuilder: async ({ page }, use) => {
    await use(() => axeFor(page));
  },
});

export { expect };
