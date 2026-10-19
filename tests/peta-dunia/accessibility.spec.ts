import { expect, test } from '../../src/fixtures/peta-dunia';
import { summarise } from '../../src/support/a11y';

test.describe('PD-10 Pass an accessibility audit', () => {
  // Audit the settled page: with motion on, axe can sample text half-way through a fade-in.
  test.use({ reducedMotion: 'reduce' });

  test('the map document has no WCAG 2.2 AA violations', async ({ showcase, makeAxeBuilder }) => {
    // 4,602 interactive paths: axe needs 15-40 s for the map frame depending on the engine.
    test.slow();
    await showcase.goto();

    const results = await makeAxeBuilder().include('#map-frame').analyze();

    expect(summarise(results.violations)).toEqual([]);
  });

  test('the map with a chart open has no violations', async ({ showcase, makeAxeBuilder }) => {
    test.slow();
    const map = await showcase.goto();
    await map.selectViaApi('MY-10');
    await map.expectChartFor('Selangor');

    const results = await makeAxeBuilder().include('#map-frame').analyze();

    expect(summarise(results.violations)).toEqual([]);
  });

  test('blank.html with a chart open has no violations', async ({ blank, makeAxeBuilder }) => {
    test.slow();
    const map = await blank.goto();
    await map.clickRegion('MY-13');
    await map.expectChartFor('Sarawak');

    const results = await makeAxeBuilder().analyze();

    expect(summarise(results.violations)).toEqual([]);
  });

  test('the showcase page around the map has no violations', async ({
    showcase,
    makeAxeBuilder,
  }) => {
    // Known site bugs, reported 2026-10-20. This test is expected to fail until they are fixed;
    // when they are, Playwright reports it as "expected to fail but passed" and the marker goes.
    //  1. scrollable-region-focusable (WCAG 2.1.1, level A): the code sample <pre> in the
    //     "peta-dunia.svg" file sheet scrolls sideways but cannot be reached with the keyboard.
    //  2. label-content-name-mismatch (WCAG 2.5.3, level A): the three labelled state bars
    //     (Selangor, Johor, Sabah) show "7.45M Selangor" but are named "Selangor: 7.45M people
    //     in 2026. Open on the map", so the visible text is not part of the accessible name.
    test.fail(true, 'Peta Dunia bugs: scrollable <pre> not focusable; bar label not in name');
    await showcase.goto();

    const results = await makeAxeBuilder().exclude('#map-frame').analyze();

    expect(summarise(results.violations)).toEqual([]);
  });
});
