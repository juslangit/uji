import { expect, test } from '../../src/fixtures/peta-dunia';

/**
 * PD-01: the brief's own acceptance test, run word for word. blank.html is an empty page
 * with the SVG in an <object>; a real click on a region must open its chart with a clean
 * console. The console part is enforced by the `consoleGuard` fixture on every test.
 *
 * The clicks are real pointer events from Playwright's mouse (or touch on phones), aimed at a
 * point that is certainly inside the region: see MapView.interiorPoint.
 */
const desktopRegions = [
  { id: 'MY-13', chartFor: 'Sarawak' },
  { id: 'MY-12', chartFor: 'Sabah' },
  { id: 'AU-WA', chartFor: 'Australia' }, // no state data: falls back to the country
  { id: 'US-CO', chartFor: 'United States' },
] as const;

// On a phone the whole world is ~400 px wide and a Malaysian state is a few pixels across, too
// small for a finger. Phones get regions that are a real tap target at 1x.
const phoneRegions = [
  { id: 'AU-WA', chartFor: 'Australia' },
  { id: 'BR-AM', chartFor: 'Brazil' },
  { id: 'RU-SA', chartFor: 'Russian Federation' },
] as const;

test.describe('PD-01 Acceptance test on a blank page', { tag: '@smoke' }, () => {
  test('blank.html embeds only the map', { tag: '@mobile' }, async ({ page, blank }) => {
    await blank.goto();
    await expect(blank.embed).toHaveAttribute('data', 'peta-dunia.svg');
    // Nothing else on the page: the <object> is the only element in <body>.
    await expect(page.locator('body > *')).toHaveCount(1);
  });

  for (const { id, chartFor } of desktopRegions) {
    test(`clicking ${id} opens a chart for ${chartFor}`, async ({ blank }) => {
      const map = await blank.goto();
      await map.expectPanelClosed();

      await map.clickRegion(id);

      await map.expectChartFor(chartFor);
      await expect(map.region(id)).toHaveAttribute('aria-expanded', 'true');
      await expect(map.region(id)).toHaveClass(/\bpd-sel\b/);
    });
  }

  for (const { id, chartFor } of phoneRegions) {
    test(
      `tapping ${id} opens a chart for ${chartFor}`,
      { tag: '@mobile-only' },
      async ({ blank }) => {
        const map = await blank.goto();
        await map.expectPanelClosed();

        await map.tapRegion(id);

        await map.expectChartFor(chartFor);
        await expect(map.region(id)).toHaveAttribute('aria-expanded', 'true');
      },
    );
  }

  test('a second click replaces the first region', async ({ blank }) => {
    const map = await blank.goto();

    await map.clickRegion('MY-13');
    await map.expectChartFor('Sarawak');
    await map.clickRegion('MY-12');

    await map.expectChartFor('Sabah');
    // Only one region is ever selected.
    await expect(map.frame.locator('#pd-map path.pd-sel')).toHaveCount(1);
    await expect(map.region('MY-13')).not.toHaveAttribute('aria-expanded', 'true');
  });

  test('a second tap replaces the first region', { tag: '@mobile-only' }, async ({ blank }) => {
    const map = await blank.goto();

    await map.tapRegion('AU-WA');
    await map.expectChartFor('Australia');
    // The docked panel covers the lower map, so close it first, as a person would.
    await map.closeButton.tap();
    await map.expectPanelClosed();
    await map.tapRegion('BR-AM');

    await map.expectChartFor('Brazil');
    await expect(map.frame.locator('#pd-map path.pd-sel')).toHaveCount(1);
    await expect(map.region('AU-WA')).not.toHaveAttribute('aria-expanded', 'true');
  });
});
