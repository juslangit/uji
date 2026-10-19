/**
 * Every route on the Pandu demo site (Lereng Outfitters), grouped the way the menu groups
 * them. `menuLink` is the href the menu should mark with aria-current="page" on that route;
 * `null` means the page is deliberately not in the menu (credits, the Pandu product pages).
 */
export interface Route {
  path: string;
  title: RegExp;
  menuLink: string | null;
}

const trips = [
  'gua-tempurung',
  'kinta-valley',
  'gunung-korbu',
  'royal-belum',
  'mossy-forest',
  'taman-negara',
  'kinabalu',
  'calendar',
  'grades',
  'private-groups',
];
const rent = ['shelter', 'packs', 'rain-and-cold', 'how-it-works'];
const about = ['guides', 'safety'];

const inMenu = (path: string): Route => ({ path, title: /Lereng|Pandu/, menuLink: path });
const notInMenu = (path: string): Route => ({ path, title: /Lereng|Pandu/, menuLink: null });

export const routes: readonly Route[] = [
  // The home page is marked through the brand link, which is also in `.pandu`.
  inMenu('/'),
  inMenu('/trips/'),
  ...trips.map((slug) => inMenu(`/trips/${slug}/`)),
  inMenu('/rent/'),
  ...rent.map((slug) => inMenu(`/rent/${slug}/`)),
  inMenu('/about/'),
  ...about.map((slug) => inMenu(`/about/${slug}/`)),
  inMenu('/journal/'),
  inMenu('/contact/'),
  inMenu('/book/'),
  notInMenu('/credits/'),
  notInMenu('/pandu/'),
  notInMenu('/pandu/before-after/'),
];

/** /pandu/example/ is a bare-bones demo of the component with its own minimal menu. */
export const examplePage = '/pandu/example/';

/** A handful of representative pages for the slower checks (axe, responsive). */
export const keyPages = [
  '/',
  '/trips/',
  '/trips/gua-tempurung/',
  '/rent/',
  '/about/safety/',
  '/book/',
];
