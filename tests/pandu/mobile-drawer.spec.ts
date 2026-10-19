import { expect, test } from '../../src/fixtures/pandu';
import { pressTab } from '../../src/support/keyboard';

/**
 * The drawer runs on every project: the desktop engines at a phone-sized window, and the
 * mobile projects (tagged @mobile) on emulated Pixel 7 and iPhone 14 with touch.
 */
for (const viewport of [
  { width: 390, height: 760 },
  { width: 320, height: 640 },
]) {
  test.describe(`at ${viewport.width}px`, { tag: '@mobile' }, () => {
    test.use({ viewport });

    test.describe('NAV-09 Open the mobile drawer', () => {
      test('Menu replaces the bar and controls the drawer', async ({ drawer, nav }) => {
        await drawer.goto('/');
        await expect(drawer.toggle).toBeVisible();
        await expect(drawer.toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(drawer.toggle).toHaveAttribute('aria-controls', 'site-menu');
        await expect(drawer.drawer).toBeHidden();
        await expect(nav.trigger('Trips')).toBeHidden();
      });

      test('opening locks the page and moves focus to Trips', async ({ page, drawer }) => {
        await drawer.goto('/');

        await drawer.open();

        await expect(drawer.section('Trips')).toBeFocused();
        await expect(drawer.main).toHaveAttribute('inert', '');
        await expect(drawer.footer).toHaveAttribute('inert', '');
        await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
        const box = await drawer.drawer.boundingBox();
        expect(box?.width ?? Infinity, 'drawer fits the screen').toBeLessThanOrEqual(
          viewport.width,
        );
      });
    });

    test.describe('NAV-09 Open the mobile drawer (reduced motion)', () => {
      test.use({ reducedMotion: 'reduce' });

      test('opening moves focus to Trips when motion is reduced', async ({ page, drawer }) => {
        // Known site bug, reported 2026-10-20 (same cause as the NAV-04 reduced-motion bug).
        // Pandu moves focus into the drawer one animation frame after opening it. With reduced
        // motion its `transition-duration: 0.01ms !important` rule turns the drawer's instant
        // visibility switch into a transition, so at that frame nothing in the drawer is
        // focusable and focus falls to <body>, while everything behind the drawer is inert.
        // Repro: phone width, reduce motion on, load /, press Menu: focus is on <body>.
        test.fail(true, 'Pandu bug: focus falls to <body> when the drawer opens, reduced motion');
        await drawer.goto('/');

        await drawer.toggle.click();

        await drawer.expectOpen();
        await expect(drawer.section('Trips')).toBeFocused({ timeout: 3000 });
        expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
      });
    });

    test.describe('NAV-10 Close and move around the mobile drawer', () => {
      test('Tab from Book a trip wraps to Close menu', async ({ page, drawer }) => {
        await drawer.goto('/');
        await drawer.open();
        await drawer.bookATrip.focus();

        await pressTab(page);
        await expect(drawer.closeButton).toBeFocused();

        await pressTab(page, { shift: true });
        await expect(drawer.bookATrip).toBeFocused();
      });

      test('Escape closes the drawer and returns focus to Menu', async ({ page, drawer }) => {
        await drawer.goto('/');
        await drawer.open();

        await page.keyboard.press('Escape');

        await drawer.expectClosedWithFocusOnToggle();
      });

      test('Close menu closes the drawer and returns focus to Menu', async ({ drawer }) => {
        await drawer.goto('/');
        await drawer.open();

        await drawer.closeButton.click();

        await drawer.expectClosedWithFocusOnToggle();
      });

      // At 360px and below the drawer is full width, so there is no scrim to tap.
      if (viewport.width > 360) {
        test('tapping the scrim closes the drawer', async ({ drawer }) => {
          await drawer.goto('/');
          await drawer.open();

          await drawer.tapScrim();

          await drawer.expectClosedWithFocusOnToggle();
        });
      }

      test('accordion sections open independently', async ({ drawer }) => {
        await drawer.goto('/');
        await drawer.open();

        await drawer.section('Trips').click();
        await expect(drawer.section('Trips')).toHaveAttribute('aria-expanded', 'true');
        await expect(drawer.link(/Gua Tempurung cave run/)).toBeVisible();

        await drawer.section('Rent gear').click();
        await expect(drawer.section('Rent gear')).toHaveAttribute('aria-expanded', 'true');
        await expect(drawer.section('Trips')).toHaveAttribute('aria-expanded', 'true');

        await drawer.section('Trips').click();
        await expect(drawer.section('Trips')).toHaveAttribute('aria-expanded', 'false');
        await expect(drawer.section('Rent gear')).toHaveAttribute('aria-expanded', 'true');
      });

      test('a link in the drawer navigates and leaves the drawer closed', async ({
        page,
        drawer,
      }) => {
        await drawer.goto('/');
        await drawer.open();

        await drawer.link('Journal').click();

        await expect(page).toHaveURL(/\/journal\/$/);
        await expect(drawer.toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(page.locator('html')).not.toHaveClass(/\bpandu-lock\b/);
      });
    });
  });
}
