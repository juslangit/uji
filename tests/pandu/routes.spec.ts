import { expect, test } from '../../src/fixtures/pandu';
import { examplePage, routes } from '../../src/pages/pandu/routes';

test.describe('NAV-01 Every page loads', () => {
  for (const route of routes) {
    test(`${route.path} responds 200 with a title, a heading and the menu`, async ({
      page,
      nav,
    }) => {
      const response = await page.goto(route.path);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(route.title);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(nav.nav).toBeAttached();
      await expect(nav.trigger('Trips')).toHaveAttribute('aria-expanded', 'false');
    });
  }

  test(`${examplePage} (the bare component demo) loads with its own menu`, async ({ page }) => {
    const response = await page.goto(examplePage);
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-pandu]').first()).toBeVisible();
  });
});
