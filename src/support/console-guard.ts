import type { ConsoleMessage, Page } from '@playwright/test';

/** One problem the browser reported while a test was running. */
export interface ConsoleProblem {
  kind: 'console.error' | 'pageerror';
  text: string;
  /** URL of the frame or script that produced it, when the browser says. */
  where: string;
}

/**
 * Records every console error and uncaught exception on a page, in every frame (the map in
 * Peta Dunia lives in an iframe or <object>, and those frames log through the same page).
 * Warnings and info messages are ignored: the briefs ask for "no console errors".
 */
export class ConsoleGuard {
  private readonly problems: ConsoleProblem[] = [];

  constructor(
    page: Page,
    private readonly allowed: RegExp | null = null,
  ) {
    page.on('console', (message: ConsoleMessage) => {
      if (message.type() !== 'error') return;
      this.record({ kind: 'console.error', text: message.text(), where: message.location().url });
    });
    page.on('pageerror', (error: Error) => {
      this.record({
        kind: 'pageerror',
        text: `${error.name}: ${error.message}`,
        where: page.url(),
      });
    });
  }

  private record(problem: ConsoleProblem): void {
    if (this.allowed?.test(problem.text)) return;
    this.problems.push(problem);
  }

  /** Problems seen so far, as readable one-line strings for an assertion message. */
  get report(): string[] {
    return this.problems.map((p) => `${p.kind}: ${p.text}${p.where ? ` (${p.where})` : ''}`);
  }
}
