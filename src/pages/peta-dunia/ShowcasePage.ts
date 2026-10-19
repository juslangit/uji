import { expect, type Locator, type Page } from '@playwright/test';
import { MapView } from './MapView';

/**
 * Peta Dunia's home page (index.html): the map in `iframe#map-frame`, the real/mock data
 * switch, the "Last click" read-out and the Malaysian state bar chart that opens a state on
 * the map.
 */
export class ShowcasePage {
  readonly mapFrame: Locator;
  readonly dataSwitch: Locator;
  readonly realData: Locator;
  readonly sampleData: Locator;
  readonly lastClick: Locator;
  readonly stateBars: Locator;

  constructor(readonly page: Page) {
    this.mapFrame = page.locator('iframe#map-frame');
    this.dataSwitch = page.getByRole('group', { name: 'Data shown on the map' });
    this.realData = this.dataSwitch.getByRole('button', { name: 'Real data' });
    this.sampleData = this.dataSwitch.getByRole('button', { name: 'Sample JSON (mock)' });
    this.lastClick = page.locator('#last-click');
    this.stateBars = page.getByRole('list', {
      name: /Population of Malaysia's states/,
    });
  }

  async goto(): Promise<MapView> {
    await this.page.goto('/');
    await expect(this.mapFrame).toBeVisible();
    return MapView.attach(this.page);
  }

  /**
   * Scrolls to the state bars and presses one. The bars grow in (scaleY 0 to 1) only once
   * the chart scrolls into view, so like a visitor the test scrolls there first.
   */
  async openFromStateBar(name: string): Promise<void> {
    await this.stateBars.scrollIntoViewIfNeeded();
    await this.stateBar(name).click();
  }

  /** The bar for a Malaysian state, e.g. "Selangor"; its button opens the state on the map. */
  stateBar(name: string): Locator {
    return this.stateBars.getByRole('button', { name: new RegExp(`^${name}:`) });
  }
}
