import { expect, test } from '../../src/fixtures/pandu';
import { keyPages } from '../../src/pages/pandu/routes';

const phones = [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
];
const desktop = { width: 1440, height: 900 };

test.describe('NAV-13 Fit phones and wide screens', () => {
  for (const viewport of phones) {
    test.describe(`at ${viewport.width}px`, () => {
      test.use({ viewport });

      test('shows the Menu button instead of the menu bar', async ({ page, nav, drawer }) => {
        await page.goto('/');
        await expect(drawer.toggle).toBeVisible();
        await expect(nav.trigger('Trips')).toBeHidden();
      });
    });
  }

  test.describe(`at ${desktop.width}px`, () => {
    test.use({ viewport: desktop });

    test('shows the menu bar instead of the Menu button', async ({ page, nav, drawer }) => {
      await page.goto('/');
      await expect(nav.trigger('Trips')).toBeVisible();
      await expect(drawer.toggle).toBeHidden();
    });
  });

  for (const viewport of [...phones, desktop]) {
    test.describe(`no overflow at ${viewport.width}px`, () => {
      test.use({ viewport });

      for (const path of keyPages) {
        test(`${path} has no horizontal overflow`, async ({ page }) => {
          await page.goto(path);
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          );
          expect(overflow, 'page wider than the window').toBeLessThanOrEqual(0);
        });
      }
    });
  }
});
