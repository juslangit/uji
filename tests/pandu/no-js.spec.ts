import { expect, test } from '../../src/fixtures/pandu';

/**
 * NAV-11: progressive enhancement. With JavaScript off, Pandu's markup must still be a working
 * menu of links: CSS :focus-within reveals panels and :target opens the drawer.
 */
test.describe('NAV-11 Work without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test.describe('on a wide screen', () => {
    test('top-level items are plain links to their section pages', async ({ page }) => {
      await page.goto('/');
      const menu = page.getByRole('navigation', { name: 'Main' });
      for (const [name, href] of [
        ['Trips', '/trips/'],
        ['Rent gear', '/rent/'],
        ['About', '/about/'],
      ] as const) {
        await expect(menu.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
      }
      // Nothing was enhanced: there are no disclosure buttons.
      await expect(menu.getByRole('button')).toHaveCount(0);
    });

    test('focusing Trips reveals its panel', async ({ page }) => {
      await page.goto('/');
      const trips = page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
        name: 'Trips',
        exact: true,
      });
      await expect(page.locator('#panel-trips')).toBeHidden();

      await trips.focus();

      await expect(page.locator('#panel-trips')).toBeVisible();
    });

    test('a section link works', async ({ page }) => {
      await page.goto('/');
      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Rent gear', exact: true })
        .click();
      await expect(page).toHaveURL(/\/rent\/$/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });

  test.describe('on a phone', { tag: '@mobile' }, () => {
    test.use({ viewport: { width: 390, height: 760 } });

    test('Menu is a link that opens the drawer with :target', async ({ page }) => {
      await page.goto('/');
      const menuLink = page.getByRole('link', { name: 'Menu', exact: true });
      await expect(menuLink).toHaveAttribute('href', '#site-menu');
      await expect(page.locator('#site-menu')).toBeHidden();

      await menuLink.click();

      await expect(page).toHaveURL(/#site-menu$/);
      await expect(page.locator('#site-menu')).toBeVisible();
      await expect(page.locator('#site-menu')).toBeInViewport();
    });
  });
});
