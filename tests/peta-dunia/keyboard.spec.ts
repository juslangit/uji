import { expect, test } from '../../src/fixtures/peta-dunia';
import { pressTab } from '../../src/support/keyboard';

test.describe('PD-03 Use the map with a keyboard', () => {
  test('Tab lands on a region, arrows move, Enter opens, Escape closes', async ({
    page,
    showcase,
  }) => {
    const map = await showcase.goto();

    // Start just before the map: the last button of the data switch.
    await showcase.sampleData.focus();
    // Focus lands on the first region (roving tabindex), not on the <svg> itself.
    expect(await map.tabIntoMap()).toBe('AF-BDS');

    await page.keyboard.press('ArrowRight');
    const moved = await map.focusedRegionId();
    expect(moved, 'ArrowRight should move to a neighbouring region').not.toBe('AF-BDS');
    expect(moved).not.toBe('');
    await expect(map.region(moved)).toHaveAttribute('tabindex', '0');
    await expect(map.region('AF-BDS')).toHaveAttribute('tabindex', '-1');

    await page.keyboard.press('Enter');
    await expect(map.panel).toHaveClass(/\bpd-open\b/);
    await expect(map.region(moved)).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await map.expectPanelClosed();
    await expect.poll(() => map.focusedRegionId()).toBe(moved);
  });

  test('typing a letter jumps to a region with that initial, Space opens it', async ({
    page,
    showcase,
  }) => {
    const map = await showcase.goto();
    await showcase.sampleData.focus();
    expect(await map.tabIntoMap()).toBe('AF-BDS');

    // Type-ahead matches the start of a region or country name. A single key keeps the test
    // independent of typing speed (the map resets its buffer after 700 ms, which a slow CI
    // runner can exceed between keystrokes).
    await page.keyboard.press('z');
    await expect.poll(() => map.focusedRegionId()).not.toBe('AF-BDS');
    const id = await map.focusedRegionId();
    const names = await map
      .region(id)
      .evaluate((p) => [
        p.getAttribute('aria-label') ?? '',
        p.parentElement?.getAttribute('aria-label') ?? '',
      ]);
    expect(
      names.some((name) => /^z/i.test(name)),
      `${id} (${names.join(', ')}) should start with Z`,
    ).toBe(true);

    await page.keyboard.press('Space');
    await expect(map.region(id)).toHaveAttribute('aria-expanded', 'true');
    await expect(map.panel).toHaveClass(/\bpd-open\b/);
  });

  test('Tab from an open region reaches the chart controls before the zoom buttons', async ({
    page,
    showcase,
  }) => {
    const map = await showcase.goto();
    await map.selectViaApi('MY-10');
    await map.expectChartFor('Selangor');

    await pressTab(page);
    await expect(map.closeButton).toBeFocused();
    await page.keyboard.press('Enter');
    await map.expectPanelClosed();
    await expect.poll(() => map.focusedRegionId()).toBe('MY-10');
  });
});
