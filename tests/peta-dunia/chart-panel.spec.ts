import { expect, test } from '../../src/fixtures/peta-dunia';

test.describe('PD-04 Read the chart panel', () => {
  test('chart tabs switch between a region charts', async ({ showcase }) => {
    const map = await showcase.goto();
    await map.selectViaApi('MY-10');
    await map.expectChartFor('Selangor');

    // Selangor carries two OpenDOSM series: a population line and a bar chart by group.
    await expect(map.chartTabs).toHaveCount(2);
    await expect(map.chartTab('Population').first()).toHaveAttribute('aria-pressed', 'true');
    await expect(map.lineChart).toBeVisible();

    await map.chartTabs.nth(1).click();

    await expect(map.chartTabs.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(map.chartTabs.nth(0)).toHaveAttribute('aria-pressed', 'false');
    await expect(map.lineChart).toHaveCount(0);
    await expect(map.bars.first()).toBeVisible();
    await expect(map.panel).toContainText('Malay');
  });

  test('the scope switch shows the country figures and retitles the panel', async ({
    showcase,
  }) => {
    const map = await showcase.goto();
    await map.selectViaApi('MY-10');
    await expect(map.scopeButton('region')).toHaveAttribute('aria-pressed', 'true');

    await map.scopeButton('country').click();

    await map.expectChartFor('Malaysia');
    await expect(map.scopeButton('country')).toHaveAttribute('aria-pressed', 'true');
    await expect(map.panel).toContainText('Country · MYS');
    // Malaysia has three World Bank series: population, GDP per capita, life expectancy.
    await expect(map.chartTabs).toHaveCount(3);
    await expect(map.panel).toContainText('World Bank');
  });

  test('chart tabs work from the keyboard', async ({ page, showcase }) => {
    const map = await showcase.goto();
    await map.selectViaApi('MY-10');
    await map.expectChartFor('Selangor');

    await map.chartTabs.nth(1).focus();
    await page.keyboard.press('Enter');

    await expect(map.chartTabs.nth(1)).toHaveAttribute('aria-pressed', 'true');
    // The panel re-renders but keeps focus on the tab that was pressed.
    await expect(map.chartTabs.nth(1)).toBeFocused();
  });

  test('"Close chart" closes the panel', async ({ showcase }) => {
    const map = await showcase.goto();
    await map.clickRegion('MY-13');
    await map.expectChartFor('Sarawak');

    await map.closeButton.click();

    await map.expectPanelClosed();
    await expect(map.region('MY-13')).not.toHaveClass(/\bpd-sel\b/);
  });
});
