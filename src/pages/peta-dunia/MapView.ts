import { expect, type Frame, type Locator, type Page } from '@playwright/test';

/** What the map script exposes on `window.PetaDunia` inside the SVG document. */
interface PetaDuniaApi {
  select(id: string): boolean;
  close(): void;
  zoomTo(id: string, fill?: number): void;
  reset(): void;
  load(src: string | object): Promise<unknown>;
  regions(): { id: string; name: string; countryId: string; country: string }[];
}
type MapWindow = Window & { PetaDunia?: PetaDuniaApi };

/**
 * The interactive map itself: the SVG document inside an <iframe> (index.html) or an
 * <object> (blank.html). Everything here is scoped to that frame.
 *
 * Locator policy: inside the SVG the element ids ARE the public contract (ISO 3166 codes are
 * what a customer keys their JSON by), so regions and countries are found by id. Controls
 * the map draws itself are found by role and accessible name, like any other button.
 */
export class MapView {
  readonly root: Locator;
  readonly regions: Locator;
  readonly panel: Locator;
  readonly panelTitle: Locator;
  readonly closeButton: Locator;
  readonly chartTabs: Locator;
  readonly scopeButtons: Locator;
  readonly lineChart: Locator;
  readonly bars: Locator;
  readonly noDataBars: Locator;
  readonly noDataMessage: Locator;
  readonly zoomControls: Locator;
  readonly zoomIn: Locator;
  readonly zoomOut: Locator;
  readonly resetView: Locator;
  readonly viewport: Locator;

  constructor(
    readonly page: Page,
    readonly frame: Frame,
  ) {
    this.root = frame.locator('svg#peta-dunia');
    this.regions = frame.locator('#pd-map path');
    this.panel = frame.locator('#pd-panel');
    this.panelTitle = this.panel.locator('#pd-ptitle');
    this.closeButton = this.panel.getByRole('button', { name: 'Close chart' });
    // Tabs and scope switches are drawn as role=button + aria-pressed inside labelled groups.
    this.chartTabs = this.panel.locator('[data-act^="tab:"]');
    this.scopeButtons = this.panel.locator('[data-act^="scope:"]');
    this.lineChart = this.panel.locator('.pd-line');
    this.bars = this.panel.locator('.pd-bar');
    this.noDataBars = this.panel.locator('.pd-ghost');
    this.noDataMessage = this.panel.getByText('No data for this region');
    this.zoomControls = frame.locator('#pd-ui .pd-ctl');
    this.zoomIn = this.zoomControls.getByRole('button', { name: 'Zoom in' });
    this.zoomOut = this.zoomControls.getByRole('button', { name: 'Zoom out' });
    this.resetView = this.zoomControls.getByRole('button', { name: 'Reset view' });
    this.viewport = frame.locator('#pd-viewport');
  }

  /**
   * Finds the frame that holds the map. Browsers report an <object>'s document differently
   * (Firefox gives it an empty URL, and none of them expose it as an element's content frame),
   * so this waits for whichever child frame contains the map's root element.
   */
  static async attach(page: Page): Promise<MapView> {
    let found: Frame | undefined;
    await expect
      .poll(
        async () => {
          for (const child of page.mainFrame().childFrames()) {
            const count = await child
              .locator('#pd-map')
              .count()
              .catch(() => 0);
            if (count > 0) {
              found = child;
              return true;
            }
          }
          return false;
        },
        { message: 'the map frame should load and contain #pd-map', timeout: 20_000 },
      )
      .toBe(true);
    if (!found) throw new Error('map frame not found');
    const view = new MapView(page, found);
    // The script has run once it has given every region a keyboard role.
    await expect(view.region('MY-10')).toHaveAttribute('role', 'button');
    return view;
  }

  /** A first-level region (state, province) by its ISO 3166-2 id, e.g. "MY-10". */
  region(id: string): Locator {
    return this.frame.locator(`#pd-map path[id="${id}"]`);
  }

  /** A country group by its ISO 3166-1 alpha-3 id, e.g. "MYS". */
  country(id: string): Locator {
    return this.frame.locator(`#pd-map > g[id="${id}"]`);
  }

  /** A chart tab by its visible label, e.g. "Population". */
  chartTab(label: string): Locator {
    return this.chartTabs.filter({ hasText: label });
  }

  /** The "show figures for" switch: `region` or `country`. */
  scopeButton(scope: 'region' | 'country'): Locator {
    return this.panel.locator(`[data-act="scope:${scope}"]`);
  }

  /**
   * A point well inside the region's visible shape, relative to its bounding box.
   *
   * The centre of a region's bounding box is often not on the region: coastlines are
   * concave and Kuala Lumpur sits inside Selangor. This samples a grid over the box and keeps
   * the point nearest the centre where the region is the top element at that point AND three
   * pixels around it, so sub-pixel rounding between engines cannot tip the click onto the sea
   * or a neighbour. Returns null when nothing of the region is exposed (e.g. under the panel).
   */
  async interiorPoint(id: string): Promise<{ x: number; y: number } | null> {
    return this.region(id).evaluate((el) => {
      const box = el.getBoundingClientRect();
      const doc = el.ownerDocument;
      const on = (x: number, y: number) => doc.elementFromPoint(x, y) === el;
      const solid = (x: number, y: number) =>
        on(x, y) && on(x - 3, y) && on(x + 3, y) && on(x, y - 3) && on(x, y + 3);
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const step = Math.max(1, Math.min(box.width, box.height) / 16);
      let best: { x: number; y: number } | null = null;
      let bestDistance = Infinity;
      for (let x = box.left + step / 2; x < box.right; x += step) {
        for (let y = box.top + step / 2; y < box.bottom; y += step) {
          const distance = Math.hypot(x - cx, y - cy);
          if (distance < bestDistance && solid(x, y)) {
            best = { x: x - box.left, y: y - box.top };
            bestDistance = distance;
          }
        }
      }
      return best;
    });
  }

  /** A real mouse click on a point that is certainly on the region (see interiorPoint). */
  async clickRegion(id: string): Promise<void> {
    const position = await this.interiorPoint(id);
    expect(position, `${id} should have an exposed area to click`).not.toBeNull();
    await this.region(id).click(position ? { position } : {});
  }

  /** A real tap (touch) on the region, for the mobile projects. */
  async tapRegion(id: string): Promise<void> {
    const position = await this.interiorPoint(id);
    expect(position, `${id} should have an exposed area to tap`).not.toBeNull();
    await this.region(id).tap(position ? { position } : {});
  }

  /**
   * Opens a region through the map's public API. For setting up state when the click itself
   * is not what the test is about (small or enclosed regions, where the bbox centre can land
   * on a neighbour: Kuala Lumpur sits inside Selangor).
   */
  async selectViaApi(id: string): Promise<void> {
    const ok = await this.frame.evaluate(
      (regionId) => (window as MapWindow).PetaDunia?.select(regionId) ?? false,
      id,
    );
    expect(ok, `PetaDunia.select("${id}") should find the region`).toBe(true);
  }

  /** Loads a data file into the running map, as the host page's data switch does. */
  async loadData(src: string): Promise<void> {
    await this.frame.evaluate(async (url) => {
      await (window as MapWindow).PetaDunia?.load(url);
    }, src);
  }

  /**
   * Presses Tab from the element before the map until focus lands on a region. Chromium and
   * WebKit go straight to the first region; Firefox first stops on the <iframe> document
   * itself (its standard behaviour for focusable frames), so it can take one extra press.
   */
  async tabIntoMap(): Promise<string> {
    const { pressTab } = await import('../../support/keyboard');
    for (let press = 0; press < 2; press++) {
      await pressTab(this.page);
      const id = await this.focusedRegionId();
      if (id) return id;
    }
    return this.focusedRegionId();
  }

  /** Id of the region that holds keyboard focus inside the map, or "" if none does. */
  async focusedRegionId(): Promise<string> {
    return this.frame.evaluate(() => {
      const el = document.activeElement;
      return el instanceof SVGPathElement ? el.id : '';
    });
  }

  /** The panel is open, titled for `name`, and has drawn a line or bar chart. */
  async expectChartFor(name: string | RegExp): Promise<void> {
    await expect(this.panel).toHaveClass(/\bpd-open\b/);
    await expect(this.panel).toBeVisible();
    const label = typeof name === 'string' ? `Chart for ${name}` : name;
    await expect(this.panel).toHaveAttribute('aria-label', label);
    await expect(this.lineChart.or(this.bars).first()).toBeVisible();
  }

  async expectPanelClosed(): Promise<void> {
    await expect(this.panel).not.toHaveClass(/\bpd-open\b/);
    await expect(this.panel).toBeHidden();
  }

  /** Current zoom factor, read from the viewport transform the map writes. */
  async zoomLevel(): Promise<number> {
    const transform = (await this.viewport.getAttribute('transform')) ?? '';
    const match = /scale\(([\d.]+)\)/.exec(transform);
    return match?.[1] ? Number(match[1]) : 1;
  }
}
