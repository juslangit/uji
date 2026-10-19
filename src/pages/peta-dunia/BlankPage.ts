import { expect, type Locator, type Page } from '@playwright/test';
import { MapView } from './MapView';

/**
 * blank.html: the brief's acceptance test page. A blank document that embeds
 * peta-dunia.svg through <object> and nothing else.
 */
export class BlankPage {
  readonly embed: Locator;

  constructor(readonly page: Page) {
    this.embed = page.locator('object[type="image/svg+xml"]');
  }

  async goto(): Promise<MapView> {
    await this.page.goto('/blank.html');
    await expect(this.embed).toBeVisible();
    return MapView.attach(this.page);
  }
}
