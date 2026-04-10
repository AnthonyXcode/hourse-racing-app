#!/usr/bin/env bash
# OS libraries required for Playwright Chromium / chrome-headless-shell on Debian/Ubuntu.
# Fixes: error while loading shared libraries: libgbm.so.1: cannot open shared object file
#
# Run on the server as a user with sudo (same machine/user that runs Strapi/PM2):
#   bash apps/strapi/scripts/install-playwright-linux-deps-apt.sh
# Or from apps/strapi:
#   pnpm run playwright:install-linux-deps
#
# EOL Ubuntu: if security.ubuntu.com returns 404, repoint that pocket to old-releases (see message below).

set -uo pipefail

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This script is for Debian/Ubuntu (apt-get). On other distros use: pnpm exec playwright install-deps chromium" >&2
  exit 1
fi

if ! sudo apt-get update; then
  cat >&2 <<'APT_FIX'

apt-get update failed (often because security.ubuntu.com no longer serves an EOL release).

Fix sources, then rerun this script. Point the security pocket at old-releases:

  sudo cp -a /etc/apt/sources.list /etc/apt/sources.list.bak.$(date +%Y%m%d)
  for f in /etc/apt/sources.list /etc/apt/sources.list.d/*.list; do
    [ -f "$f" ] || continue
    sudo sed -i.bak 's|http://security.ubuntu.com/ubuntu|http://old-releases.ubuntu.com/ubuntu|g' "$f"
    sudo sed -i.bak 's|https://security.ubuntu.com/ubuntu|http://old-releases.ubuntu.com/ubuntu|g' "$f"
  done
  sudo apt-get update

Continuing with package install in case indexes from other mirrors are already usable…
APT_FIX
fi

set -e
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
