import { expect, test } from '../../src/fixtures/pandu';
import { panelIds, type PanelName } from '../../src/pages/pandu/NavMenu';

const panels = Object.keys(panelIds) as PanelName[];

test.describe('NAV-02 Disclosure semantics', () => {
  test('each trigger is a collapsed button that controls its panel', async ({ nav }) => {
    await nav.goto('/');
    for (const name of panels) {
      const trigger = nav.trigger(name);
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger).toHaveAttribute('aria-controls', panelIds[name]);
      await expect(nav.panel(name)).toBeHidden();
    }
  });

  test('Trips is a mega-menu with headed columns; the others are dropdowns', async ({ nav }) => {
    await nav.goto('/');
    await expect(nav.panel('Trips')).toHaveClass(/\bpandu__panel--mega\b/);
    await expect(nav.panel('Rent gear')).not.toHaveClass(/\bpandu__panel--mega\b/);
    await expect(nav.panel('About')).not.toHaveClass(/\bpandu__panel--mega\b/);

    await nav.trigger('Trips').click();
    for (const heading of ['Perak, our home ground', 'Further afield', 'Plan your trip']) {
      await expect(nav.panel('Trips').getByRole('list', { name: heading })).toBeVisible();
    }
  });

  test('Journal and Contact are links; Book a trip is the call to action', async ({ nav }) => {
    await nav.goto('/');
    await expect(nav.link('Journal', { exact: true })).toHaveAttribute('href', '/journal/');
    await expect(nav.link('Contact', { exact: true })).toHaveAttribute('href', '/contact/');
    await expect(nav.bookATrip).toHaveAttribute('href', '/book/');
    await expect(nav.bookATrip).toHaveClass(/\bpandu__cta\b/);
  });

  test('the top-level items read in order', async ({ nav }) => {
    await nav.goto('/');
    const items = nav.nav.locator('.pandu__list > .pandu__item > :is(a, button)');
    await expect(items).toHaveText(['Trips', 'Rent gear', 'About', 'Journal', 'Contact']);
  });
});

test.describe('NAV-03 Open and close panels with the mouse', () => {
  test('a click opens a panel and a second click closes it', async ({ nav }) => {
    await nav.goto('/');

    await nav.trigger('Rent gear').click();
    await nav.expectOpen('Rent gear');

    await nav.trigger('Rent gear').click();
    await nav.expectClosed('Rent gear');
  });

  test('opening one panel closes the other', async ({ nav }) => {
    await nav.goto('/');
    await nav.trigger('Trips').click();
    await nav.expectOpen('Trips');

    await nav.trigger('About').click();

    await nav.expectOpen('About');
    await nav.expectClosed('Trips');
  });

  test('a click outside the menu closes the open panel', async ({ nav }) => {
    await nav.goto('/');
    await nav.trigger('Rent gear').click();
    await nav.expectOpen('Rent gear');

    await nav.clickOutside();

    await nav.expectAllClosed();
  });

  test('a link in a panel goes to its page', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('Trips').click();

    await nav.panelLink('Trips', /Gunung Korbu summit/).click();

    await expect(page).toHaveURL(/\/trips\/gunung-korbu\/$/);
    await expect(nav.current).toHaveAttribute('href', '/trips/gunung-korbu/');
  });
});
