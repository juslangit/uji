# Conventions

How this suite is laid out and how to add to it. A new spec that follows these rules should
pass review without comments; `npm run check` enforces the mechanical ones.

## Layout

```
playwright.config.ts        projects, reporters, retries, timeouts
src/
  config/sites.ts           base URL per site (env var, production default)
  fixtures/
    base.ts                 the base `test`: console guard + axe builder
    peta-dunia.ts           `test` for tests/peta-dunia (baseURL + page objects)
    pandu.ts                `test` for tests/pandu      (baseURL + page objects)
  pages/<site>/             page objects, one class per page or component
  support/                  helpers with no site knowledge (keyboard, a11y, console guard)
tests/<site>/<feature>.spec.ts
STORIES.md                  user stories with ids and acceptance criteria
```

## Naming

| Thing                 | Pattern                                                        | Example                                                        |
| --------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| Spec file             | `tests/<site>/<feature>.spec.ts`, kebab-case feature           | `tests/pandu/mobile-drawer.spec.ts`                            |
| Top-level describe    | `'<STORY-ID> <story title>'`, exactly as in STORIES.md         | `'NAV-10 Close and move around the mobile drawer'`             |
| Variant describe      | `'<STORY-ID> <title> (<variant>)'`, or a wrapping `'at <n>px'` | `'NAV-04 Operate triggers with the keyboard (reduced motion)'` |
| Test title            | the behaviour in plain words, present tense, no "should"       | `'Escape closes the drawer and returns focus to Menu'`         |
| Page object           | PascalCase noun for what the user sees                         | `MapView`, `NavMenu`, `MobileDrawer`                           |
| Page object assertion | `expect<State>()`                                              | `expectOpen('Trips')`, `expectChartFor('Selangor')`            |

Every spec names its story id, so `npx playwright test --grep NAV-10` runs one story everywhere.
A story can span several files and a file can hold several stories, but every describe holds one.

## Which `test` to import

Always the site's fixture, never `@playwright/test` directly:

```ts
import { expect, test } from '../../src/fixtures/pandu';
```

That gives the site's `baseURL`, its page objects as fixtures (`nav`, `drawer`, `showcase`,
`blank`), and the base fixtures below.

### Base fixtures

- **`consoleGuard`** (automatic): records every `console.error` and uncaught exception in every
  frame and fails the test afterwards if there were any. Both briefs require a clean console,
  so no test can opt out by forgetting. If a story genuinely expects an error, allow that one
  pattern and say why:

  ```ts
  // The browser logs the document's own 404 response. That is the error this story expects.
  test.use({ allowedConsoleError: /404/ });
  ```

- **`makeAxeBuilder()`**: an `@axe-core/playwright` builder already limited to WCAG 2.2 A/AA
  (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`). Get the page into the state you want
  audited, then `expect(summarise((await makeAxeBuilder().analyze()).violations)).toEqual([])`
  so a failure lists each rule on one line.

## Locators

1. **Role first.** `getByRole` with the accessible name, then `getByLabel`, then `getByText`.
   If a control cannot be found by role and name, that is usually an accessibility bug: report it.
2. **Scope to a landmark or component.** `nav.nav.getByRole('link', { name: 'Journal' })`, not
   `page.getByRole(...)`. Use `exact: true` where names overlap ("Trips" and "All trips").
3. **CSS only where the DOM is the contract.** Peta Dunia's region and country ids are ISO codes
   that customers key their JSON by, so `#pd-map path[id="MY-10"]` is the right locator there.
   The same goes for state classes a story is about (`.pd-open`, `.pandu--open`, `html.pandu-lock`).
   No positional selectors (`nth-child`, XPath) and no styling classes.
4. **Locators live in page objects** as `readonly` fields built in the constructor, or as small
   methods for parameterised ones (`trigger(name)`, `region(id)`). Specs read like the story.

## Waiting

- **No fixed sleeps.** `page.waitForTimeout` is a lint error. Use web-first assertions
  (`toBeVisible`, `toHaveAttribute`, `toBeFocused`) which retry, or `expect.poll` for values read
  from the page.
- **Wait for the state a person would wait for.** When a component moves focus a frame after
  opening, assert that focus before pressing the next key (`MobileDrawer.open()` does this).
- **Measure timing in the page, not in the test.** NAV-07 timestamps `pointerenter` and the
  `aria-expanded` change with `performance.now()` and asserts the difference, instead of sleeping
  for 40 ms and hoping.
- **Real input for the behaviour under test, the API for set-up.** If the story is "click a
  region", click it (`MapView.clickRegion` aims at a point certainly inside the shape). If the
  click is only how you get to the state you are testing, `MapView.selectViaApi` is fine.

## Browsers and tags

| Project                          | Runs                              | Device                               |
| -------------------------------- | --------------------------------- | ------------------------------------ |
| `chromium`, `firefox`, `webkit`  | everything except `@mobile-only`  | desktop, 1440 × 900                  |
| `mobile-chrome`, `mobile-safari` | only `@mobile` and `@mobile-only` | Pixel 7, iPhone 14 (touch, isMobile) |

- Tag a describe or test **`@mobile`** when it should also run on the phone projects. Set its own
  `viewport` with `test.use` so it runs at phone width on the desktop engines too.
- **`@mobile-only`** for touch-specific tests (taps).
- **`@smoke`** for the short go/no-go set (`npm run test:smoke`).
- WebKit tabs to links only with Alt+Tab (Safari's default). Use `pressTab(page)` from
  `src/support/keyboard.ts`, never `keyboard.press('Tab')`.

## When the site is wrong

Do not weaken the assertion. Keep the test as the story says it should behave, mark it

```ts
// Known site bug, reported YYYY-MM-DD. <what is wrong, why, and a one-line repro>
test.fail(true, '<Site> bug: <short name>');
```

and add it to the "Bugs found" table in the README. When the bug is fixed, Playwright reports
the test as "expected to fail but passed"; delete the marker and the row.

## Style

- TypeScript strict, `npm run typecheck` clean.
- ESLint (`typescript-eslint` strict type-checked + `eslint-plugin-playwright` recommended) with
  zero warnings: no conditionals or conditional `expect` in tests (split the test instead), no
  skipped or focused tests, no `force: true`.
- Prettier: `.prettierrc.json` (100 columns, single quotes, trailing commas). `npm run format`.
- Comments say why, not what: why this locator, why this wait, which bug a `test.fail` is.

## Adding a test, step by step

1. Find or add the story in `STORIES.md` (next free id, acceptance criteria as bullets).
2. Pick the spec file `tests/<site>/<feature>.spec.ts`, or create one.
3. Add `test.describe('<ID> <title>', () => { ... })` and import `test` from the site's fixture.
4. Add any missing locators or flows to the page object, not to the spec.
5. Run it on all engines a few times: `npx playwright test --grep <ID> --repeat-each=5`.
6. `npm run check`, then add the row to the README coverage table.
