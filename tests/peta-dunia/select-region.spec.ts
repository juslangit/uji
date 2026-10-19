import { expect, test } from '../../src/fixtures/peta-dunia';

test.describe('PD-02 Click a region to see its chart', () => {
  test('a click on Sarawak opens its chart and updates "Last click"', async ({ showcase }) => {
    const map = await showcase.goto();

    await map.clickRegion('MY-13');

    await map.expectChartFor('Sarawak');
    await expect(map.panel).toHaveAttribute('role', 'dialog');
    await expect(map.panel).toContainText('Source: DOSM (OpenDOSM)');
    await expect(showcase.lastClick).toHaveText('Sarawak, Malaysia · MY-13');
  });

  test('a region without its own data shows its country, and says so', async ({ showcase }) => {
    const map = await showcase.goto();

    await map.clickRegion('US-CO');

    await map.expectChartFor('United States');
    // The scope switch offers both and marks the country as the one shown.
    await expect(map.scopeButton('country')).toHaveAttribute('aria-pressed', 'true');
    await expect(map.scopeButton('region')).toHaveAttribute('aria-label', 'Colorado (no data)');
    await expect(showcase.lastClick).toHaveText('Colorado, United States · US-CO');
  });

  test('clicking the sea closes the open chart', async ({ showcase }) => {
    const map = await showcase.goto();
    await map.clickRegion('MY-13');
    await map.expectChartFor('Sarawak');

    // Top-left of the map, mid-Pacific: no region there.
    await map.root.click({ position: { x: 30, y: 300 } });

    await map.expectPanelClosed();
    await expect(map.region('MY-13')).not.toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe("PD-07 Open a state from the page's bar chart", () => {
  test('every state bar has a descriptive accessible name', async ({ showcase }) => {
    await showcase.goto();
    await expect(showcase.stateBars.getByRole('button')).toHaveCount(16);
    await expect(showcase.stateBar('Selangor')).toHaveAccessibleName(
      'Selangor: 7.45M people in 2026. Open on the map',
    );
  });

  for (const { state, id } of [
    { state: 'Selangor', id: 'MY-10' },
    { state: 'Kuala Lumpur', id: 'MY-14' },
    { state: 'Labuan', id: 'MY-15' },
  ]) {
    test(`the ${state} bar opens ${state} on the map`, async ({ showcase }) => {
      const map = await showcase.goto();

      await showcase.openFromStateBar(state);

      await map.expectChartFor(state);
      await expect(map.region(id)).toHaveAttribute('aria-expanded', 'true');
      await expect(showcase.lastClick).toHaveText(`${state}, Malaysia · ${id}`);
    });
  }
});
