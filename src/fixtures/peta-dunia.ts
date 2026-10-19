import { sites } from '../config/sites';
import { BlankPage } from '../pages/peta-dunia/BlankPage';
import { ShowcasePage } from '../pages/peta-dunia/ShowcasePage';
import { test as base } from './base';

/** Fixtures for every spec under tests/peta-dunia/. */
export const test = base.extend<{ showcase: ShowcasePage; blank: BlankPage }>({
  // This site's address; a spec can still point at another deploy with test.use({ baseURL }).
  baseURL: sites.petaDunia,
  showcase: async ({ page }, use) => {
    await use(new ShowcasePage(page));
  },
  blank: async ({ page }, use) => {
    await use(new BlankPage(page));
  },
});

export { expect } from './base';
