import { expect, test } from '../../src/fixtures/peta-dunia';

/**
 * PD-09: the SVG's ids and labels are a public API: customers key their JSON by them. These
 * checks read the DOM directly, because here the DOM is the contract.
 */
test.describe("PD-09 Keep the map's data contract", () => {
  test('257 countries and 4,602 regions', async ({ blank }) => {
    const map = await blank.goto();
    await expect(map.frame.locator('#pd-map > g')).toHaveCount(257);
    await expect(map.regions).toHaveCount(4602);
  });

  test('every region has a unique id and a label, every country a label', async ({ blank }) => {
    const map = await blank.goto();
    const report = await map.frame.evaluate(() => {
      const paths = [...document.querySelectorAll('#pd-map path')];
      const ids = paths.map((p) => p.id);
      return {
        missingId: ids.filter((id) => !id).length,
        duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
        unlabelledRegions: paths.filter((p) => !p.getAttribute('aria-label')).map((p) => p.id),
        unlabelledCountries: [...document.querySelectorAll('#pd-map > g')]
          .filter((g) => !g.getAttribute('aria-label'))
          .map((g) => g.id),
      };
    });
    expect(report).toEqual({
      missingId: 0,
      duplicateIds: [],
      unlabelledRegions: [],
      unlabelledCountries: [],
    });
  });

  test('Malaysia has its 16 states and federal territories', async ({ blank }) => {
    const map = await blank.goto();
    const malaysia = map.country('MYS');
    await expect(malaysia).toHaveAttribute('aria-label', 'Malaysia');
    await expect(malaysia).toHaveAttribute('role', 'group');
    const ids = await malaysia
      .locator('path')
      .evaluateAll((paths) => paths.map((p) => p.id).sort());
    expect(ids).toEqual(
      Array.from({ length: 16 }, (_, i) => `MY-${String(i + 1).padStart(2, '0')}`),
    );
    await expect(map.region('MY-10')).toHaveAttribute('aria-label', 'Selangor');
    await expect(map.region('MY-14')).toHaveAttribute('aria-label', 'Kuala Lumpur');
  });

  test('regions are keyboard buttons with a single roving tab stop', async ({ blank }) => {
    const map = await blank.goto();
    await expect(map.frame.locator('#pd-map path[role="button"]')).toHaveCount(4602);
    await expect(map.frame.locator('#pd-map path[tabindex="0"]')).toHaveCount(1);
    await expect(map.root).toHaveAttribute('tabindex', '-1');
  });
});
