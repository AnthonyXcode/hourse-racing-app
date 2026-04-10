#!/usr/bin/env bash
# OS libraries required for Playwright Chromium / chrome-headless-shell on Debian/Ubuntu.
# Fixes: error while loading shared libraries: libgbm.so.1: cannot open shared object file
#
# Run on the server as a user with sudo (same machine/user that runs Strapi/PM2):
#   bash apps/strapi/scripts/install-playwright-linux-deps-apt.sh
# Or from apps/strapi:
#   pnpm run playwright:install-linux-deps
#
# If apt update fails (e.g. EOL release), fix /etc/apt/sources.list first, then rerun.

set -euo pipefail

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This script is for Debian/Ubuntu (apt-get). On other distros use: pnpm exec playwright install-deps chromium" >&2
  exit 1
fi

sudo apt-get update
sudo apt-get install -y \
  libgbm1 \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libdbus-1-3 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libasound2 \
  fonts-liberation

echo "Done. Restart Strapi/PM2 if it was already running."
