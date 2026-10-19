import { expect, test } from '../../src/fixtures/pandu';

test.describe('NAV-15 Friendly 404 page', () => {
  // Browsers log the document's own 404 response as a console error ("Failed to load
  // resource: ... 404"). That one error is what this story expects; anything else still fails.
  test.use({ allowedConsoleError: /404/ });

  test('an unknown path responds 404 with the site own page', async ({ page }) => {
    const response = await page.goto('/trips/no-such-trail/');

    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle('Page not found · Lereng Outfitters');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'This trail does not go anywhere',
    );
  });

  test('the menu still works on the 404 page', async ({ page, nav }) => {
    await page.goto('/no-such-page/');
    await expect(nav.trigger('Trips')).toHaveAttribute('aria-expanded', 'false');

    await nav.trigger('Trips').click();

    await nav.expectOpen('Trips');
  });

  test('links lead back into the site', async ({ page, nav }) => {
    await page.goto('/no-such-page/');

    await page.getByRole('main').getByRole('link', { name: 'See every trip' }).click();
    await expect(page).toHaveURL(/\/trips\/$/);

    await page.goto('/no-such-page/');
    await nav.brand.click();
    await expect(page).toHaveURL(/\.dev\/$|:\d+\/$/);
    await expect(nav.brand).toHaveAttribute('aria-current', 'page');
  });
});
