import { expect, test } from '../../src/fixtures/peta-dunia';

test.describe('PD-05 Switch to the sample (mock) data', () => {
  test('the sample JSON replaces the figures and is labelled as mock', async ({ showcase }) => {
    const map = await showcase.goto();
    await expect(showcase.realData).toHaveAttribute('aria-pressed', 'true');

    await showcase.sampleData.click();
    await expect(showcase.sampleData).toHaveAttribute('aria-pressed', 'true');
    await expect(showcase.realData).toHaveAttribute('aria-pressed', 'false');

    await map.selectViaApi('MY-10');
    await map.expectChartFor('Selangor');
    // The map loads the file asynchronously; web-first assertions wait for the re-render.
    await expect(map.chartTab('Online orders')).toBeVisible();
    await expect(map.chartTab('Orders by channel')).toBeVisible();
    await expect(map.panel).toContainText('Mock data, not real figures');
  });

  test('switching back to real data restores the official figures', async ({ showcase }) => {
    const map = await showcase.goto();
    await showcase.sampleData.click();
    await map.selectViaApi('MY-10');
    await expect(map.panel).toContainText('Mock data, not real figures');

    await showcase.realData.click();

    await expect(showcase.realData).toHaveAttribute('aria-pressed', 'true');
    await expect(map.panel).toContainText('Source: DOSM (OpenDOSM)');
    await expect(map.panel).not.toContainText('Mock data');
    await expect(map.chartTab('Population').first()).toBeVisible();
  });

  test('a region only in the sample (California) gets a chart from it', async ({ showcase }) => {
    const map = await showcase.goto();
    await showcase.sampleData.click();
    await expect(showcase.sampleData).toHaveAttribute('aria-pressed', 'true');

    await map.clickRegion('US-CA');

    await map.expectChartFor('California');
    await expect(map.panel).toContainText('Support tickets by topic');
  });
});

test.describe('PD-06 See an honest no-data state', () => {
  test('Antarctica has no data and says so', async ({ showcase }) => {
    const map = await showcase.goto();

    await map.selectViaApi('ATA-00');

    await expect(map.panel).toHaveClass(/\bpd-open\b/);
    await expect(map.noDataMessage).toBeVisible();
    await expect(map.noDataBars).toHaveCount(8);
    await expect(map.lineChart).toHaveCount(0);
    await expect(map.panel).toContainText('Add “ATA-00” to the JSON to chart it');
  });

  test('a region without its own figures shows no-data in region scope', async ({ showcase }) => {
    const map = await showcase.goto();
    // Paris has no figures of its own, so the panel opens on France's.
    await map.selectViaApi('FR-75');
    await map.expectChartFor('France');

    await map.scopeButton('region').click();

    await expect(map.noDataMessage).toBeVisible();
    await expect(map.panel).toHaveAttribute('aria-label', 'Chart for Paris');
  });

  test('the no-data placeholder is announced as an image with a label', async ({ showcase }) => {
    const map = await showcase.goto();
    await map.selectViaApi('ATA-00');

    await expect(map.panel.getByRole('img', { name: 'No data for this region' })).toBeAttached();
  });
});
