import { expect, test } from '../../src/fixtures/pandu';
import { routes } from '../../src/pages/pandu/routes';

const inMenu = routes.filter((route) => route.menuLink !== null);
const notInMenu = routes.filter((route) => route.menuLink === null);

test.describe('NAV-08 Mark the current page', () => {
  for (const route of inMenu) {
    test(`${route.path} marks ${String(route.menuLink)} as the current page`, async ({ nav }) => {
      await nav.goto(route.path);

      await expect(nav.current).toHaveCount(1);
      await expect(nav.current).toHaveAttribute('href', String(route.menuLink));
    });
  }

  for (const route of notInMenu) {
    test(`${route.path} is not in the menu and marks nothing`, async ({ nav }) => {
      await nav.goto(route.path);

      await expect(nav.current).toHaveCount(0);
    });
  }
});
