import { sites } from '../config/sites';
import { MobileDrawer } from '../pages/pandu/MobileDrawer';
import { NavMenu } from '../pages/pandu/NavMenu';
import { test as base } from './base';

/** Fixtures for every spec under tests/pandu/. */
export const test = base.extend<{ nav: NavMenu; drawer: MobileDrawer }>({
  // This site's address; a spec can still point at another deploy with test.use({ baseURL }).
  baseURL: sites.pandu,
  nav: async ({ page }, use) => {
    await use(new NavMenu(page));
  },
  drawer: async ({ page }, use) => {
    await use(new MobileDrawer(page));
  },
});

export { expect } from './base';
