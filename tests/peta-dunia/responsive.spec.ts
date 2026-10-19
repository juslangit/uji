import { expect, test } from '../../src/fixtures/peta-dunia';

const widths = [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];

test.describe('PD-11 Work on phones and wide screens', () => {
  for (const viewport of widths) {
    test.describe(`at ${viewport.width}px`, () => {
      test.use({ viewport });

      test('no horizontal scroll and the map is visible', async ({ page, showcase }) => {
        await showcase.goto();
        await expect(showcase.mapFrame).toBeInViewport({ ratio: 0.1 });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, 'page wider than the window').toBeLessThanOrEqual(0);
      });
    });
  }

  test.describe('on a phone-width map', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('the chart panel docks full width with a 44px close button', async ({ blank }) => {
      const map = await blank.goto();
      await map.selectViaApi('MY-10');
      await map.expectChartFor('Selangor');

      const panel = await map.panel.boundingBox();
      const close = await map.closeButton.boundingBox();
      expect(panel?.width ?? 0, 'docked panel spans the map, 8px gutters').toBeGreaterThanOrEqual(
        390 - 16 - 1,
      );
      // Rounded: WebKit reports 43.99997 for a 44px box.
      expect(Math.round(close?.width ?? 0)).toBeGreaterThanOrEqual(44);
      expect(Math.round(close?.height ?? 0)).toBeGreaterThanOrEqual(44);
      // The zoom buttons step aside while the docked panel is open.
      await expect(map.zoomControls).toBeHidden();
    });
  });
});
