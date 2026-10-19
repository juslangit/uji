import { sites } from '../../src/config/sites';
import { expect, test } from '../../src/fixtures/pandu';

/**
 * NAV-14: a short smoke run against the staging deploy, for a go/no-go before promoting it.
 * Run just this with `npm run test:smoke`, or point it elsewhere with PANDU_STAGING_URL.
 */
test.describe('NAV-14 Staging smoke test', { tag: '@smoke' }, () => {
  test.use({ baseURL: sites.panduStaging });

  test('staging home loads and the menu enhances', async ({ page, nav }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    expect(page.url()).toContain(new URL(sites.panduStaging).host);
    await expect(nav.trigger('Trips')).toHaveAttribute('aria-expanded', 'false');
  });

  test('Trips opens and Book a trip reaches the booking page', async ({ page, nav }) => {
    await nav.goto('/');

    await nav.trigger('Trips').click();
    await nav.expectOpen('Trips');
    await nav.bookATrip.click();

    await expect(page).toHaveURL(/\/book\/$/);
    await expect(nav.current).toHaveAttribute('href', '/book/');
  });
});
