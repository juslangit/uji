import { expect, test } from '../../src/fixtures/peta-dunia';

/**
 * Each zoom step animates for about 320 ms. The tests wait for one step to settle (polling the
 * transform the map writes) before taking the next, as a visitor watching the map would.
 */
test.describe('PD-08 Zoom and reset the map', () => {
  test('the zoom buttons double, halve and reset the zoom', async ({ showcase }) => {
    const map = await showcase.goto();
    expect(await map.zoomLevel()).toBe(1);

    await map.zoomIn.click();
    await expect.poll(() => map.zoomLevel()).toBe(2);
    await map.zoomIn.click();
    await expect.poll(() => map.zoomLevel()).toBe(4);
    await map.zoomOut.click();
    await expect.poll(() => map.zoomLevel()).toBe(2);
    await map.resetView.click();
    await expect.poll(() => map.zoomLevel()).toBe(1);
  });

  test('+, - and 0 zoom from the keyboard', async ({ page, showcase }) => {
    const map = await showcase.goto();
    await showcase.sampleData.focus();
    expect(await map.tabIntoMap()).not.toBe('');

    await page.keyboard.press('+');
    await expect.poll(() => map.zoomLevel()).toBe(2);
    await page.keyboard.press('+');
    await expect.poll(() => map.zoomLevel()).toBe(4);
    await page.keyboard.press('-');
    await expect.poll(() => map.zoomLevel()).toBe(2);
    await page.keyboard.press('0');
    await expect.poll(() => map.zoomLevel()).toBe(1);
  });

  test('zoom never goes below 1x or above 32x', async ({ showcase }) => {
    const map = await showcase.goto();
    await map.zoomOut.click();
    await expect.poll(() => map.zoomLevel()).toBe(1);

    for (const level of [2, 4, 8, 16, 32, 32]) {
      await map.zoomIn.click();
      await expect.poll(() => map.zoomLevel()).toBe(level);
    }
  });

  test('two quick presses of + zoom in two steps', async ({ page, showcase }) => {
    // Known site bug, reported 2026-10-20. zoomBy() multiplies the zoom the map is showing
    // at that instant, and a new zoom cancels the running animation. A second press inside
    // the 320 ms animation therefore starts from ~1x again and one step is lost: + + ends at
    // about 2x instead of 4x. Repro: open the map, Tab into it, press + twice quickly.
    // With reduced motion there is no animation and both steps count.
    test.fail(true, 'Peta Dunia bug: a zoom step pressed during the animation is lost');
    const map = await showcase.goto();
    await showcase.sampleData.focus();
    expect(await map.tabIntoMap()).not.toBe('');

    await page.keyboard.press('+');
    await page.keyboard.press('+');

    await expect.poll(() => map.zoomLevel(), { timeout: 3000 }).toBe(4);
  });
});
