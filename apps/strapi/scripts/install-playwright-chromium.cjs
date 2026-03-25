/**
 * Install Chromium into apps/strapi/.playwright-browsers (or PLAYWRIGHT_BROWSERS_PATH).
 * Postinstall: exits 0 on failure (offline CI). With `--strict`, propagate exit code.
 */
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const strict = process.argv.includes('--strict');
const root = path.join(__dirname, '..');
if (!process.env.PLAYWRIGHT_BROWSERS_PATH?.trim()) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, '.playwright-browsers');
}

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const r = spawnSync(cmd, ['playwright', 'install', 'chromium'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

if (r.status !== 0) {
  console.warn(
    strict ? '[playwright:install] failed' : '[api postinstall] playwright install chromium failed',
    '- run: cd apps/strapi && pnpm run playwright:install'
  );
}

process.exit(strict ? (r.status === 0 ? 0 : r.status ?? 1) : 0);
