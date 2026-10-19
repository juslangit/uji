import type { Page } from '@playwright/test';

/**
 * Safari (and Playwright's WebKit) only moves Tab focus between form controls unless the user
 * turns on "Press Tab to highlight each item". Alt+Tab is WebKit's built-in way to tab
 * through every focusable element, which is the behaviour a keyboard user relies on.
 */
export async function pressTab(page: Page, options: { shift?: boolean } = {}): Promise<void> {
  const isWebKit = page.context().browser()?.browserType().name() === 'webkit';
  const parts = [isWebKit ? 'Alt' : '', options.shift ? 'Shift' : '', 'Tab'].filter(Boolean);
  await page.keyboard.press(parts.join('+'));
}
