#!/usr/bin/env bash
# Publish the latest Playwright HTML report to Cloudflare Pages: https://uji-tests.pages.dev
#
#   npx playwright test            # writes playwright-report/
#   ./tools/publish-report.sh      # uploads it as-is
#
# Uses the Cloudflare login already stored by wrangler (`npx wrangler login` if it expires).
# The default Playwright report is what gets served, unchanged: no wrapper page.
set -euo pipefail

PROJECT="uji-tests"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT="$ROOT/playwright-report"
export CLOUDFLARE_ACCOUNT_ID="863c8569b09cb26bbcb75f90f23a26e5"

if [[ ! -f "$REPORT/index.html" ]]; then
  echo "No report at $REPORT. Run 'npx playwright test' first." >&2
  exit 1
fi

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
rsync -a --exclude '.DS_Store' "$REPORT/" "$STAGE/"

cd "$STAGE"
if ! npx --yes wrangler@latest pages project list 2>/dev/null | grep -qw "$PROJECT"; then
  npx --yes wrangler@latest pages project create "$PROJECT" --production-branch main
fi
echo "Uploading $(du -sh "$STAGE" | cut -f1) report…"
npx --yes wrangler@latest pages deploy "$STAGE" --project-name "$PROJECT" --branch main --commit-dirty=true
echo "Live: https://$PROJECT.pages.dev"
