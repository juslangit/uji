import { expect, test } from '../../src/fixtures/pandu';

/**
 * NAV-07 is about timing, which is where flaky tests come from. Rather than sleep and hope,
 * the page itself timestamps the pointer entering the item and the moment aria-expanded flips,
 * and the test asserts on the difference.
 */
test.describe('NAV-07 Hover intent', () => {
  test('hovering opens the panel only after the intent delay', async ({ page, nav }) => {
    await nav.goto('/');
    // Record, in page time, when the pointer enters the About item and when it opens.
    await nav.trigger('About').evaluate((trigger) => {
      const marks = { enter: -1, open: -1 };
      Object.assign(window, { hoverMarks: marks });
      trigger.closest('li')?.addEventListener('pointerenter', () => {
        if (marks.enter < 0) marks.enter = performance.now();
      });
      new MutationObserver(() => {
        if (marks.open < 0 && trigger.getAttribute('aria-expanded') === 'true') {
          marks.open = performance.now();
        }
      }).observe(trigger, { attributes: true, attributeFilter: ['aria-expanded'] });
    });

    await nav.trigger('About').hover();
    await nav.expectOpen('About');

    const marks = await page.evaluate(
      () => (window as unknown as { hoverMarks: { enter: number; open: number } }).hoverMarks,
    );
    expect(marks.enter, 'pointerenter seen').toBeGreaterThan(0);
    expect(marks.open, 'panel opened').toBeGreaterThan(0);
    // Pandu's default hover delay is 120 ms; allow a few ms for timer rounding.
    expect(marks.open - marks.enter).toBeGreaterThanOrEqual(110);
  });

  test('moving the pointer away closes a panel opened by hover', async ({ nav }) => {
    await nav.goto('/');
    await nav.trigger('About').hover();
    await nav.expectOpen('About');

    await nav.pointAway();

    await nav.expectClosed('About');
  });

  test('a click pins a hover-opened panel instead of closing it', async ({ nav }) => {
    await nav.goto('/');
    await nav.trigger('Rent gear').hover();
    await nav.expectOpen('Rent gear');

    await nav.trigger('Rent gear').click();

    await nav.expectOpen('Rent gear');
  });
});
