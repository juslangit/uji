# User stories

The agreed stories this suite covers. Every story has an id; every spec names the id in its
`test.describe` title, so a story can be traced to its tests with `npx playwright test --grep PD-03`.
The [README](README.md#coverage) maps each story to its spec file and the browsers it runs on.

Two sites are under test:

- **Peta Dunia** (`PD-`), <https://peta-dunia.pages.dev>: one SVG world map, 257 countries and 4,602
  first-level regions. Click a region and a chart panel opens inside the SVG.
- **Pandu** (`NAV-`), <https://pandu-nav.pages.dev>: an accessible navigation menu (WAI-ARIA disclosure
  pattern) shown on a demo outfitter's site, Lereng.

Unless a story says otherwise, its acceptance criteria hold in Chromium, Firefox and WebKit, and every
test also fails if the browser logs a console error or throws an uncaught exception.

---

## Peta Dunia

### PD-01 Acceptance test on a blank page

As a buyer, I want to drop the SVG into an empty HTML page and have it work, so I know it has no
hidden dependencies.

- `blank.html` holds nothing but an `<object>` embedding `peta-dunia.svg`.
- A real mouse click (a tap on phones) on a region opens the chart panel for that region.
- The panel draws a chart (a line or bars).
- The console stays free of errors from page load to chart.

### PD-02 Click a region to see its chart

As a visitor on the showcase page, I want to click any region and see its figures.

- Clicking a region opens `#pd-panel` (role `dialog`) with class `pd-open` and the accessible name
  "Chart for {name}".
- The panel shows a line or bar chart and the source line.
- The page's "Last click" read-out names the region, its country and its id.
- Clicking a different region moves the panel to that region.

### PD-03 Use the map with a keyboard

As a keyboard user, I want to reach every region without a mouse.

- Tab moves focus into the map and lands on a region (not on the SVG root).
- Arrow keys move focus to the nearest region in that direction.
- Enter opens the chart for the focused region and marks it `aria-expanded="true"`.
- Escape closes the chart and returns focus to the region that opened it.

### PD-04 Read the chart panel

As a visitor, I want to switch between a region's charts and between the region and its country.

- When a region has more than one chart, tabs show one per chart; the active one is
  `aria-pressed="true"` and switching draws the other chart.
- When a region belongs to a country with its own figures, a scope switch offers both; picking the
  country retitles the panel to the country.
- "Close chart" (button) closes the panel.

### PD-05 Switch to the sample (mock) data

As a buyer checking the JSON format, I want to load the sample file and see its charts.

- Pressing "Sample JSON (mock)" marks it pressed and "Real data" not pressed.
- Selangor then shows the sample's charts ("Online orders", "Orders by channel") labelled
  "Mock data, not real figures".
- Pressing "Real data" brings back the official figures (OpenDOSM source line).

### PD-06 See an honest no-data state

As a visitor, I want a clear message when a region has no figures, rather than an empty box.

- Opening a region with no data and no country data (Antarctica) shows the placeholder bars
  (`.pd-ghost`) and the text "No data for this region".
- Switching a region's scope to a region without its own data shows the same state.

### PD-07 Open a state from the page's bar chart

As a visitor reading the Malaysian population bars, I want a bar to open that state on the map.

- Every state bar is a button with an accessible name like "Selangor: 7.45M people in 2026. Open on the map".
- Pressing a bar opens the chart for that state and updates "Last click".

### PD-08 Zoom and reset the map

As a visitor, I want to zoom in on small regions and get back to the whole world.

- "Zoom in" doubles the zoom; "Zoom out" halves it; "Reset view" returns to 1×.
- The keyboard shortcuts `+`, `-` and `0` do the same.

### PD-09 Keep the map's data contract

As a developer keying my own JSON by region id, I need the ids and labels to be stable.

- The map has 257 country groups and 4,602 region paths.
- Every region path has a unique id and an `aria-label`; every country group has an `aria-label`.
- Malaysia (`MYS`) has its 16 states and federal territories, `MY-01` to `MY-16`.

### PD-10 Pass an accessibility audit

As a user of assistive technology, I want the showcase page and the map to meet WCAG 2.2 AA.

- axe-core finds no WCAG 2.2 A/AA violations on the showcase page.
- axe-core finds no violations on `blank.html` with a chart open.

### PD-11 Work on phones and wide screens

As a visitor on any screen, I want the page and map to fit.

- At 320, 390 and 1440 px wide the page has no horizontal scroll and the map is visible.
- On a phone-width map the chart panel docks to the full width and its close button is at least
  44 × 44 px.

---

## Pandu

### NAV-01 Every page loads

As a visitor, I want every page on the site to load with the menu on it.

- All 27 routes respond 200, have a title and a level-one heading, and show the "Main" navigation.

### NAV-02 Disclosure semantics

As a screen-reader user, I want the menu to announce what opens and what it controls.

- "Trips", "Rent gear" and "About" are buttons with `aria-expanded="false"` and `aria-controls`
  pointing at `#panel-trips`, `#panel-rent` and `#panel-about`.
- Trips is a mega-menu (`.pandu__panel--mega`) with headed columns; the others are plain dropdowns.
- "Journal" and "Contact" are links; "Book a trip" is a link to `/book/`.

### NAV-03 Open and close panels with the mouse

As a mouse user, I want panels to behave predictably.

- Clicking a trigger opens its panel; clicking it again closes it.
- Opening one panel closes any other.
- Clicking outside the menu closes the open panel.
- Following a link in a panel goes to that page.

### NAV-04 Operate triggers with the keyboard

As a keyboard user, I want the standard disclosure keys on each trigger.

- Enter and Space toggle `aria-expanded`.
- Down Arrow opens the panel and focuses its first link; Up Arrow opens it and focuses its last link.
- Escape closes the panel and returns focus to its trigger.

### NAV-05 Move through an open panel with the keyboard

As a keyboard user, I want to move inside a panel without leaving it by accident.

- Down / Up Arrow move to the next / previous link.
- Home / End move to the first / last link.
- Tab moves through the panel's links in order; tabbing past the last one closes the panel and
  continues to the next top-level item (no focus trap).

### NAV-06 Move between top-level items with arrows

As a keyboard user, I want arrow keys along the menu bar.

- Right / Left Arrow move focus to the next / previous top-level item and wrap at the ends.
- Home / End move to the first / last top-level item.

### NAV-07 Hover intent

As a mouse user, I want panels to open on hover without flickering as I cross the menu.

- Hovering a trigger opens its panel only after the intent delay (about 120 ms), not instantly.
- Moving the pointer away closes a panel that hover opened.

### NAV-08 Mark the current page

As a visitor, I want the menu to show where I am.

- On every route in the menu, exactly one link inside `.pandu` has `aria-current="page"` and it
  points at the current path.
- Pages outside the menu (credits, the Pandu product pages) mark nothing.

### NAV-09 Open the mobile drawer

As a phone user, I want a drawer that behaves like a modal dialog.

- On narrow screens a "Menu" button (`aria-controls="site-menu"`, `aria-expanded="false"`) replaces
  the menu bar.
- Pressing it opens the drawer, sets `aria-expanded="true"`, adds `.pandu--open` to the header and
  `.pandu-lock` to `<html>`, and moves focus to "Trips".
- While open, `main` and the footer are `inert`, and the drawer fits the screen.

### NAV-10 Close and move around the mobile drawer

As a phone user, I want to get out of the drawer every expected way and not get lost in it.

- Tab from "Book a trip" wraps to "Close menu" (focus is contained while the drawer is modal).
- Escape, "Close menu" and (on screens wider than 360 px) tapping the scrim each close the drawer,
  remove `inert` and the scroll lock, and return focus to "Menu".
- Accordion sections open independently: Trips and Rent gear can be open together.
- Following a link in the drawer navigates to that page.

### NAV-11 Work without JavaScript

As a visitor whose JavaScript failed or is off, I want the menu to still work.

- Top-level items are plain links to their section pages ("Trips" goes to `/trips/`).
- Focusing "Trips" reveals its panel (CSS `:focus-within`).
- On narrow screens "Menu" is a link to `#site-menu` that opens the drawer with CSS `:target`.

### NAV-12 Pass an accessibility audit

As a user of assistive technology, I want the site to meet WCAG 2.2 AA in every menu state.

- axe-core finds no WCAG 2.2 A/AA violations on the key pages.
- None with the Trips mega-menu open on desktop, and none with the drawer open on a phone.

### NAV-13 Fit phones and wide screens

As a visitor on any screen, I want the right menu for my width and no sideways scrolling.

- At 320 and 390 px the "Menu" button shows and the menu bar does not; at 1440 px the reverse.
- No horizontal overflow at 320, 390 or 1440 px on the key pages.

### NAV-14 Staging smoke test

As the team, we want a quick check that a staging deploy is alive before it is promoted.

- On `staging.pandu-nav.pages.dev`, the home page loads, the menu enhances, Trips opens and
  "Book a trip" reaches `/book/`.

### NAV-15 Friendly 404 page

As a visitor who followed a broken link, I want a page that helps me back.

- An unknown path responds 404 and shows the site's own "This trail does not go anywhere" page.
- The menu works on it, "See every trip" leads to `/trips/` and the brand link leads home.
