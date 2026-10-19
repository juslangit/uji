# Uji

[![tests](https://github.com/juslangit/uji/actions/workflows/tests.yml/badge.svg)](https://github.com/juslangit/uji/actions/workflows/tests.yml)

_Uji_ is Malay for "test". This is a Playwright + TypeScript end-to-end suite for two live sites,
written the way a team inherits and extends a framework: conventions first, then user stories,
then specs that follow both. Every test runs in Chromium, Firefox and WebKit in parallel, and the
mobile stories also run on emulated Pixel 7 and iPhone 14.

- **Peta Dunia**, <https://peta-dunia.pages.dev>: one SVG world map with 257 countries and 4,602
  regions; click a region and a chart opens inside the map.
- **Pandu**, <https://pandu-nav.pages.dev>: an accessible navigation menu (disclosure dropdowns,
  a mega-menu and a mobile drawer), shown on a demo outfitter's site.

**Latest HTML report:** <https://uji-tests.pages.dev> (the default Playwright report, published
by `tools/publish-report.sh`). CI also attaches the report to every run as an artifact.

## The brief it answers

> Need support for writing Playwright + TypeScript test cases from existing framework. You pull
> the existing repo, review the conventions, and add well-structured specs that follow our naming
> pattern. Each test should assert core functional behaviour across Chrome, Firefox, and WebKit
> using Playwright's built-in parallel capabilities. Clear comments and reusable locators are
> essential so the rest of the team can extend the work later.
>
> Acceptance criteria: all agreed user stories are covered with passing, repeatable tests; code
> compiles via tsc with no lint errors and fits our prettier rules; tests execute headless with
> the standard `npx playwright test` command and generate the default HTML report.

| Requirement                                          | Where                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Existing framework and its conventions               | [`CONVENTIONS.md`](CONVENTIONS.md), [`playwright.config.ts`](playwright.config.ts), [`src/`](src) |
| Naming pattern                                       | `tests/<site>/<feature>.spec.ts`, `test.describe('<STORY-ID> <story>')`                           |
| Chrome, Firefox and WebKit, in parallel              | five projects, `fullyParallel: true`                                                              |
| Reusable locators, clear comments                    | page objects in [`src/pages/`](src/pages), role-first locators                                    |
| Agreed user stories                                  | [`STORIES.md`](STORIES.md): 26 stories, each with acceptance criteria                             |
| Passing, repeatable tests                            | no fixed sleeps (lint-enforced), web-first assertions, 3 clean full runs in a row                 |
| tsc, lint, prettier                                  | `npm run typecheck`, `npm run lint` (zero warnings), `npm run format:check`                       |
| `npx playwright test`, headless, default HTML report | yes: `playwright-report/index.html`                                                               |

## Run it

```bash
npm install
npx playwright install chromium firefox webkit   # once
npx playwright test                              # all 567 runs, headless
npx playwright show-report                       # open the HTML report
```

Other scripts:

| Script                                        | Does                                                             |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `npm test`                                    | `playwright test`                                                |
| `npm run test:chromium`                       | Chromium only, for a quick local loop                            |
| `npm run test:mobile`                         | the Pixel 7 and iPhone 14 projects                               |
| `npm run test:smoke`                          | the `@smoke` set: Peta Dunia's acceptance test and Pandu staging |
| `npm run typecheck` / `lint` / `format:check` | the three static checks (`npm run check` runs all three)         |

One story everywhere: `npx playwright test --grep NAV-10`. Another deploy:
`PANDU_URL=https://staging.pandu-nav.pages.dev npx playwright test tests/pandu`
(`PETA_DUNIA_URL` and `PANDU_STAGING_URL` work the same way; see `src/config/sites.ts`).

## How it is built

- **Projects.** `chromium`, `firefox` and `webkit` at 1440 × 900 run every spec except touch-only
  ones. `mobile-chrome` (Pixel 7) and `mobile-safari` (iPhone 14) run only specs tagged `@mobile`.
  Drawer specs set a phone viewport themselves, so the drawer is tested on all five.
- **Fixtures.** Each site has its own `test` (`src/fixtures/<site>.ts`) with its `baseURL` and page
  objects. Both build on `src/fixtures/base.ts`, whose automatic `consoleGuard` fails any test that
  logs a console error or throws, in any frame. `makeAxeBuilder()` gives an axe-core builder set
  to WCAG 2.2 A/AA.
- **Page objects.** `MapView` (the SVG map in its iframe or `<object>`), `ShowcasePage`,
  `BlankPage`, `NavMenu`, `MobileDrawer`. Locators are role-first; CSS only where the DOM is the
  contract (Peta Dunia's ISO region ids, state classes a story names).
- **No flaky waits.** `page.waitForTimeout` is a lint error. Timing behaviour (Pandu's 120 ms hover
  intent) is measured inside the page with `performance.now()`, not slept on.
- **Real input where it matters.** `MapView.clickRegion` samples the region's shape and clicks a
  point certainly inside it, because a bounding-box centre often lands on the sea or a neighbour
  (Kuala Lumpur sits inside Selangor). Set-up that is not the behaviour under test uses the map's
  public API.

## Add a test

1. Add or find the story in [`STORIES.md`](STORIES.md).
2. In `tests/<site>/<feature>.spec.ts`, import `test` from `src/fixtures/<site>` and wrap the
   tests in `test.describe('<ID> <story title>', ...)`.
3. Put any new locator or flow in the page object, not the spec.
4. `npx playwright test --grep <ID> --repeat-each=5`, then `npm run check`.
5. Add the row to the coverage table below.

[`CONVENTIONS.md`](CONVENTIONS.md) has the full rules, including what to do when the site is wrong.

## Coverage

177 test cases, 567 runs across the five projects. "Desktop" means Chromium, Firefox and WebKit;
"+ mobile" adds Pixel 7 (Chrome) and iPhone 14 (Safari).

| Story                                               | Spec                                     | Cases | Browsers                     |
| --------------------------------------------------- | ---------------------------------------- | ----: | ---------------------------- |
| PD-01 Acceptance test on a blank page               | `tests/peta-dunia/acceptance.spec.ts`    |    10 | desktop + mobile             |
| PD-02 Click a region to see its chart               | `tests/peta-dunia/select-region.spec.ts` |     3 | desktop                      |
| PD-03 Use the map with a keyboard                   | `tests/peta-dunia/keyboard.spec.ts`      |     3 | desktop                      |
| PD-04 Read the chart panel                          | `tests/peta-dunia/chart-panel.spec.ts`   |     4 | desktop                      |
| PD-05 Switch to the sample (mock) data              | `tests/peta-dunia/data-source.spec.ts`   |     3 | desktop                      |
| PD-06 See an honest no-data state                   | `tests/peta-dunia/data-source.spec.ts`   |     3 | desktop                      |
| PD-07 Open a state from the page's bar chart        | `tests/peta-dunia/select-region.spec.ts` |     4 | desktop                      |
| PD-08 Zoom and reset the map                        | `tests/peta-dunia/zoom.spec.ts`          |     4 | desktop                      |
| PD-09 Keep the map's data contract                  | `tests/peta-dunia/map-contract.spec.ts`  |     4 | desktop                      |
| PD-10 Pass an accessibility audit                   | `tests/peta-dunia/accessibility.spec.ts` |     4 | desktop                      |
| PD-11 Work on phones and wide screens               | `tests/peta-dunia/responsive.spec.ts`    |     4 | desktop at 320, 390, 1440    |
| NAV-01 Every page loads                             | `tests/pandu/routes.spec.ts`             |    27 | desktop                      |
| NAV-02 Disclosure semantics                         | `tests/pandu/disclosure.spec.ts`         |     4 | desktop                      |
| NAV-03 Open and close panels with the mouse         | `tests/pandu/disclosure.spec.ts`         |     4 | desktop                      |
| NAV-04 Operate triggers with the keyboard           | `tests/pandu/keyboard.spec.ts`           |     6 | desktop                      |
| NAV-05 Move through an open panel with the keyboard | `tests/pandu/keyboard.spec.ts`           |     3 | desktop                      |
| NAV-06 Move between top-level items with arrows     | `tests/pandu/keyboard.spec.ts`           |     3 | desktop                      |
| NAV-07 Hover intent                                 | `tests/pandu/hover.spec.ts`              |     3 | desktop                      |
| NAV-08 Mark the current page                        | `tests/pandu/current-page.spec.ts`       |    26 | desktop                      |
| NAV-09 Open the mobile drawer                       | `tests/pandu/mobile-drawer.spec.ts`      |     6 | desktop at 320, 390 + mobile |
| NAV-10 Close and move around the mobile drawer      | `tests/pandu/mobile-drawer.spec.ts`      |    11 | desktop at 320, 390 + mobile |
| NAV-11 Work without JavaScript                      | `tests/pandu/no-js.spec.ts`              |     4 | desktop + mobile             |
| NAV-12 Pass an accessibility audit                  | `tests/pandu/accessibility.spec.ts`      |     8 | desktop + mobile             |
| NAV-13 Fit phones and wide screens                  | `tests/pandu/responsive.spec.ts`         |    21 | desktop at 320, 390, 1440    |
| NAV-14 Staging smoke test                           | `tests/pandu/staging-smoke.spec.ts`      |     2 | desktop, against staging     |
| NAV-15 Friendly 404 page                            | `tests/pandu/not-found.spec.ts`          |     3 | desktop                      |

## Bugs found

The suite found five real bugs in the two sites. Each has a test that states the correct
behaviour and is marked `test.fail()` with the bug in a comment, so the run stays green while the
bug is open and Playwright flags the test the day it is fixed.

| Site       | Bug                                                                                                                                                                                                                                                                                                                      | Test                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Peta Dunia | The code sample `<pre>` in the "peta-dunia.svg" file sheet scrolls sideways but cannot be reached by keyboard (axe `scrollable-region-focusable`, WCAG 2.1.1 A).                                                                                                                                                         | PD-10 "the showcase page around the map"         |
| Peta Dunia | The labelled state bars show "7.45M Selangor" but are named "Selangor: 7.45M people in 2026. Open on the map": visible text not in the accessible name (axe `label-content-name-mismatch`, WCAG 2.5.3 A). Seen once the bars are visible, e.g. with reduced motion.                                                      | PD-10, same test                                 |
| Peta Dunia | A zoom step pressed during the 320 ms zoom animation is lost: `+` `+` quickly ends at about 2× instead of 4×, because `zoomBy()` multiplies the mid-animation zoom and cancels the running animation.                                                                                                                    | PD-08 "two quick presses of + zoom in two steps" |
| Pandu      | With reduced motion on, Down Arrow on a trigger opens the panel but focus stays on the trigger (first open of the page). The reduced-motion rule `transition-duration: 0.01ms !important` turns the instant `visibility 0s` switch into a transition, so the panel is still hidden when Pandu moves focus a frame later. | NAV-04 (reduced motion)                          |
| Pandu      | Same cause, worse effect: with reduced motion on, opening the mobile drawer drops focus to `<body>` while everything behind the drawer is `inert`.                                                                                                                                                                       | NAV-09 (reduced motion)                          |

## Licence

MIT. See [LICENSE](LICENSE).
