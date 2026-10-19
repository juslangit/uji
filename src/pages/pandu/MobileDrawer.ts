import { expect, type Locator, type Page } from '@playwright/test';
import type { PanelName } from './NavMenu';

/**
 * Pandu's narrow-screen drawer: the "Menu" toggle opens `nav#site-menu` as a modal drawer
 * with a scrim; sections become accordions. While open, the page behind is inert and the
 * document is scroll-locked (`html.pandu-lock`).
 */
export class MobileDrawer {
  readonly header: Locator;
  readonly toggle: Locator;
  readonly drawer: Locator;
  readonly closeButton: Locator;
  readonly bookATrip: Locator;
  readonly main: Locator;
  readonly footer: Locator;

  constructor(readonly page: Page) {
    this.header = page.locator('header.pandu');
    this.toggle = page.getByRole('button', { name: 'Menu', exact: true });
    this.drawer = page.locator('nav#site-menu');
    this.closeButton = page.getByRole('button', { name: 'Close menu' });
    this.bookATrip = this.drawer.getByRole('link', { name: 'Book a trip' });
    this.main = page.locator('main');
    this.footer = page.locator('footer.site-footer');
  }

  /** An accordion button inside the drawer. */
  section(name: PanelName): Locator {
    return this.drawer.getByRole('button', { name, exact: true });
  }

  link(name: string | RegExp): Locator {
    return this.drawer.getByRole('link', { name });
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
    await expect(this.toggle).toHaveAttribute('aria-expanded', 'false');
  }

  /**
   * Opens the drawer and waits until it has settled: slid fully on screen and focus moved
   * to the first section (Pandu does that one animation frame after opening). Tests act on
   * the drawer the way a person would, after it has arrived.
   */
  async open(): Promise<void> {
    await this.toggle.click();
    await this.expectOpen();
    await expect(this.section('Trips')).toBeFocused();
    await expect(this.drawer).toBeInViewport({ ratio: 1 });
  }

  async expectOpen(): Promise<void> {
    await expect(this.toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(this.header).toHaveClass(/\bpandu--open\b/);
    await expect(this.drawer).toBeVisible();
    await expect(this.page.locator('html')).toHaveClass(/\bpandu-lock\b/);
  }

  /** Closed, page unlocked, nothing left inert, and focus back on the Menu toggle. */
  async expectClosedWithFocusOnToggle(): Promise<void> {
    await expect(this.toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(this.header).not.toHaveClass(/\bpandu--open\b/);
    await expect(this.drawer).toBeHidden();
    await expect(this.page.locator('html')).not.toHaveClass(/\bpandu-lock\b/);
    await expect(this.page.locator('[inert]')).toHaveCount(0);
    await expect(this.toggle).toBeFocused();
  }

  /**
   * Taps the dimmed page beside the drawer. The drawer leaves at least 3rem of scrim on its
   * left on screens wider than 360px; at 360px and below it is full width and there is none.
   */
  async tapScrim(): Promise<void> {
    await this.page.locator('.pandu__scrim').click({ position: { x: 16, y: 300 } });
  }
}
