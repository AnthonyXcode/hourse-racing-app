import path from 'node:path';

const DIR_NAME = '.playwright-browsers';

/**
 * When `PLAYWRIGHT_BROWSERS_PATH` is unset, use `apps/strapi/.playwright-browsers`.
 * Avoids missing Chromium when the default cache dir is unavailable (e.g. sandbox).
 * Set `PLAYWRIGHT_BROWSERS_PATH` yourself to override.
 */
export function ensurePlaywrightBrowsersPath(): void {
  const existing = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (existing != null && String(existing).trim() !== '') {
    return;
  }
  process.env.PLAYWRIGHT_BROWSERS_PATH = path.resolve(process.cwd(), DIR_NAME);
}
