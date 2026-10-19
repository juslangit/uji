/**
 * Base URLs for the sites under test. Production is the default; point a run at a preview
 * or staging deploy by setting the matching variable, e.g.
 *
 *   PANDU_URL=https://staging.pandu-nav.pages.dev npx playwright test tests/pandu
 */
function fromEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return (value && value.length > 0 ? value : fallback).replace(/\/+$/, '');
}

export const sites = {
  petaDunia: fromEnv('PETA_DUNIA_URL', 'https://peta-dunia.pages.dev'),
  pandu: fromEnv('PANDU_URL', 'https://pandu-nav.pages.dev'),
  panduStaging: fromEnv('PANDU_STAGING_URL', 'https://staging.pandu-nav.pages.dev'),
} as const;

export type SiteName = keyof typeof sites;
