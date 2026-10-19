import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/**
 * The accessibility bar for every audit in this suite: WCAG 2.0, 2.1 and 2.2 at levels A and
 * AA. axe-core tags each rule with the success criteria it checks; these are the tags that
 * together cover "WCAG 2.2 AA".
 */
export const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] as const;

/** A fresh axe builder for the page, already limited to the WCAG 2.2 AA rules. */
export function axeFor(page: Page): AxeBuilder {
  return new AxeBuilder({ page }).withTags([...WCAG_22_AA]);
}

/** Violations reduced to one line each, so a failing report reads at a glance. */
export function summarise(
  violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'],
): string[] {
  return violations.map(
    (v) =>
      `${v.id} [${v.impact ?? 'n/a'}] ${v.help} — ${v.nodes.length} node(s), first: ${v.nodes[0]?.target.join(' ') ?? '?'}`,
  );
}
