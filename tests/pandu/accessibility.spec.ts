import { expect, test } from '../../src/fixtures/pandu';
import { keyPages } from '../../src/pages/pandu/routes';
import { summarise } from '../../src/support/a11y';

test.describe('NAV-12 Pass an accessibility audit', () => {
  // Audit the settled page: with motion on, axe can sample text half-way through a fade-in
  // and report a contrast failure that no reader ever sees.
  test.use({ reducedMotion: 'reduce' });

  for (const path of keyPages) {
    test(`${path} has no WCAG 2.2 AA violations`, async ({ nav, makeAxeBuilder }) => {
      await nav.goto(path);
      const results = await makeAxeBuilder().analyze();
      expect(summarise(results.violations)).toEqual([]);
    });
  }

  test('no violations with the Trips mega-menu open', async ({ nav, makeAxeBuilder }) => {
    await nav.goto('/');
    await nav.trigger('Trips').click();
    await nav.expectOpen('Trips');

    const results = await makeAxeBuilder().analyze();

    expect(summarise(results.violations)).toEqual([]);
  });

  test.describe('on a phone', { tag: '@mobile' }, () => {
    // Default motion here: with reduced motion the drawer drops focus to <body> (see the
    // NAV-09 reduced-motion test), and drawer.open() waits for it to settle anyway.
    test.use({ viewport: { width: 390, height: 760 }, reducedMotion: 'no-preference' });

    test('no violations with the drawer and an accordion open', async ({
      drawer,
      makeAxeBuilder,
    }) => {
      await drawer.goto('/');
      await drawer.open();
      await drawer.section('Trips').click();
      await expect(drawer.section('Trips')).toHaveAttribute('aria-expanded', 'true');

      const results = await makeAxeBuilder().analyze();

      expect(summarise(results.violations)).toEqual([]);
    });
  });
});
