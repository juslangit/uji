import { expect, type Locator, type Page } from '@playwright/test';

export type PanelName = 'Trips' | 'Rent gear' | 'About';

/** Which panel each disclosure button controls. Checked by NAV-02 against aria-controls. */
export const panelIds: Record<PanelName, string> = {
  Trips: 'panel-trips',
  'Rent gear': 'panel-rent',
  About: 'panel-about',
};

/**
 * Pandu's desktop navigation (wide screens): three disclosure buttons with dropdown panels
 * (Trips is a mega-menu), two plain links and a call-to-action link, all inside
 * `nav#site-menu`, the "Main" landmark.
 *
 * Every locator is role-first and scoped to the landmark: "All trips" and "Trips" both exist
 * on the page, so top-level names are matched exactly.
 */
export class NavMenu {
  readonly header: Locator;
  readonly nav: Locator;
  readonly brand: Locator;
  readonly bookATrip: Locator;
  readonly current: Locator;

  constructor(readonly page: Page) {
    this.header = page.locator('header.pandu');
    this.nav = page.getByRole('navigation', { name: 'Main' });
    this.brand = this.header.getByRole('link', { name: 'Lereng' });
    this.bookATrip = this.nav.getByRole('link', { name: 'Book a trip' });
    this.current = page.locator('.pandu [aria-current="page"]');
  }

  /** A top-level disclosure button: "Trips", "Rent gear" or "About". */
  trigger(name: PanelName): Locator {
    return this.nav.getByRole('button', { name, exact: true });
  }

  /** The dropdown panel a trigger controls. */
  panel(name: PanelName): Locator {
    return this.page.locator(`#${panelIds[name]}`);
  }

  /** A link anywhere in the menu, by its accessible name (descriptions are part of the name). */
  link(name: string | RegExp, options: { exact?: boolean } = {}): Locator {
    return this.nav.getByRole('link', { name, ...options });
  }

  /** A link inside one panel. */
  panelLink(panel: PanelName, name: string | RegExp): Locator {
    return this.panel(panel).getByRole('link', { name });
  }

  /**
   * A real click on the page away from the menu: the top-left corner of the page heading,
   * which no panel covers (panels drop down from the menu bar on the right).
   */
  async clickOutside(): Promise<void> {
    await this.page.getByRole('heading', { level: 1 }).click({ position: { x: 4, y: 4 } });
  }

  /** Moves the mouse off the menu, to the same spot clickOutside() uses. */
  async pointAway(): Promise<void> {
    await this.page.getByRole('heading', { level: 1 }).hover({ position: { x: 4, y: 4 } });
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
    // Pandu has enhanced the menu once the triggers are buttons with aria-expanded.
    await expect(this.trigger('Trips')).toHaveAttribute('aria-expanded', 'false');
  }

  async expectOpen(name: PanelName): Promise<void> {
    await expect(this.trigger(name)).toHaveAttribute('aria-expanded', 'true');
    await expect(this.panel(name)).toBeVisible();
  }

  async expectClosed(name: PanelName): Promise<void> {
    await expect(this.trigger(name)).toHaveAttribute('aria-expanded', 'false');
    await expect(this.panel(name)).toBeHidden();
  }

  /** Every panel is closed. */
  async expectAllClosed(): Promise<void> {
    for (const name of Object.keys(panelIds) as PanelName[]) await this.expectClosed(name);
  }
}
