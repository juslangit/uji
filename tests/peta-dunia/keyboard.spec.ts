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

  test('typing a name jumps to that region, Space opens it', async ({ page, showcase }) => {
    const map = await showcase.goto();
    await showcase.sampleData.focus();
    expect(await map.tabIntoMap()).toBe('AF-BDS');

    // Type-ahead matches region or country names; "sarawak" is unique.
    await page.keyboard.type('sarawak');
    await expect.poll(() => map.focusedRegionId()).toBe('MY-13');

    await page.keyboard.press('Space');
    await map.expectChartFor('Sarawak');
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
