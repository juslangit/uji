import { expect, test } from '../../src/fixtures/pandu';
import { pressTab } from '../../src/support/keyboard';

test.describe('NAV-04 Operate triggers with the keyboard', () => {
  test('Enter and Space toggle the panel', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('Trips').focus();

    await page.keyboard.press('Enter');
    await nav.expectOpen('Trips');
    await page.keyboard.press('Space');
    await nav.expectClosed('Trips');
    await page.keyboard.press('Space');
    await nav.expectOpen('Trips');
  });

  test('Down Arrow opens the panel on its first link', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('Trips').focus();

    await page.keyboard.press('ArrowDown');

    await nav.expectOpen('Trips');
    await expect(nav.panelLink('Trips', /Gua Tempurung cave run/)).toBeFocused();
  });

  test('Up Arrow opens the panel on its last link', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('Rent gear').focus();

    await page.keyboard.press('ArrowUp');

    await nav.expectOpen('Rent gear');
    await expect(nav.panelLink('Rent gear', 'How renting works')).toBeFocused();
  });

  test('Escape closes the panel and returns focus to its trigger', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('About').focus();
    await page.keyboard.press('ArrowDown');
    await expect(nav.panelLink('About', 'Our story')).toBeFocused();

    await page.keyboard.press('Escape');

    await nav.expectClosed('About');
    await expect(nav.trigger('About')).toBeFocused();
  });
});

test.describe('NAV-04 Operate triggers with the keyboard (reduced motion)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('Down Arrow focuses the first link when motion is reduced', async ({ page, nav }) => {
    // Known site bug, reported 2026-10-20. Pandu's reduced-motion rule forces
    // `transition-duration: 0.01ms !important` on everything in `.pandu`, which turns the
    // panel's instant `visibility 0s` switch into a (very short) transition. Down Arrow moves
    // focus one animation frame after opening; on the first open of a page the panel is still
    // `visibility: hidden` at that frame, so no link is focusable and focus stays on the
    // trigger. Repro: Chrome/Firefox/Safari with "reduce motion" on, load any page, focus
    // "Trips", press Down Arrow: the panel opens but focus does not move into it.
    test.fail(true, 'Pandu bug: first Down Arrow does not move focus when motion is reduced');
    await nav.goto('/');
    await nav.trigger('Trips').focus();

    await page.keyboard.press('ArrowDown');

    await nav.expectOpen('Trips');
    await expect(nav.panelLink('Trips', /Gua Tempurung cave run/)).toBeFocused({ timeout: 3000 });
  });

  test('Enter, Space and Escape still work when motion is reduced', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('Rent gear').focus();

    await page.keyboard.press('Enter');
    await nav.expectOpen('Rent gear');
    await page.keyboard.press('Escape');
    await nav.expectClosed('Rent gear');
    await expect(nav.trigger('Rent gear')).toBeFocused();
  });
});

test.describe('NAV-05 Move through an open panel with the keyboard', () => {
  test('Down and Up Arrow move between links', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('Trips').focus();
    await page.keyboard.press('ArrowDown');
    // Pandu moves focus one animation frame after opening; wait for it before the next key.
    await expect(nav.panelLink('Trips', /Gua Tempurung cave run/)).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(nav.panelLink('Trips', /Kinta Valley limestone loop/)).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(nav.panelLink('Trips', /Gua Tempurung cave run/)).toBeFocused();
  });

  test('Home and End jump to the first and last link', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('Trips').focus();
    await page.keyboard.press('ArrowDown');
    await expect(nav.panelLink('Trips', /Gua Tempurung cave run/)).toBeFocused();

    await page.keyboard.press('End');
    // The last link in the mega-menu is the featured trip card (its name starts with the
    // photo's alt text, then "Kinta Valley loop").
    await expect(nav.panelLink('Trips', /Kinta Valley loop/)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(nav.panelLink('Trips', /Gua Tempurung cave run/)).toBeFocused();
  });

  test('Tab walks the links in order and leaving the panel closes it', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('About').focus();
    await page.keyboard.press('Enter');
    await nav.expectOpen('About');

    for (const name of ['Our story', 'Guides', 'Safety and permits']) {
      await pressTab(page);
      await expect(nav.panelLink('About', name)).toBeFocused();
    }
    await pressTab(page);

    // No focus trap: the panel closes and focus continues along the menu bar.
    await nav.expectClosed('About');
    await expect(nav.link('Journal', { exact: true })).toBeFocused();
  });
});

test.describe('NAV-06 Move between top-level items with arrows', () => {
  test('Right and Left Arrow move along the bar and wrap', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('Trips').focus();

    await page.keyboard.press('ArrowRight');
    await expect(nav.trigger('Rent gear')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(nav.trigger('Trips')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(nav.link('Contact', { exact: true })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(nav.trigger('Trips')).toBeFocused();
  });

  test('Home and End move to the first and last item', async ({ page, nav }) => {
    await nav.goto('/');
    await nav.trigger('Rent gear').focus();

    await page.keyboard.press('End');
    await expect(nav.link('Contact', { exact: true })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(nav.trigger('Trips')).toBeFocused();
  });

  test('the whole bar is reachable with Tab in reading order', async ({ page, nav }) => {
    await nav.goto('/trips/gua-tempurung/');
    await nav.brand.focus();

    for (const target of [
      nav.trigger('Trips'),
      nav.trigger('Rent gear'),
      nav.trigger('About'),
      nav.link('Journal', { exact: true }),
      nav.link('Contact', { exact: true }),
      nav.bookATrip,
    ]) {
      await pressTab(page);
      await expect(target).toBeFocused();
    }
  });
});
