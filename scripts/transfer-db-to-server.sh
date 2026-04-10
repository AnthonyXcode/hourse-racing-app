#!/usr/bin/env bash
# Copy local Strapi SQLite DB to an Ubuntu server over SSH.
#
# Prerequisites: ssh access to the server; Strapi stopped there before overwrite (PM2 stop).
#
# Usage:
#   TRANSFER_SSH=user@your.server TRANSFER_REMOTE_STRAPI_ROOT=/path/to/hourse-racing-app/apps/strapi pnpm transfer:db
#
# Optional:
#   TRANSFER_LOCAL_DB     — local SQLite file (default: repo/apps/strapi/.tmp/data.db)
#   TRANSFER_DRY_RUN=1    — pass --dry-run to rsync
#   TRANSFER_USE_SCP=1    — use scp instead of rsync
#   TRANSFER_YES=1        — skip confirmation (automation only)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

LOCAL_DB="${TRANSFER_LOCAL_DB:-$REPO_ROOT/apps/strapi/.tmp/data.db}"
SSH_TARGET="${TRANSFER_SSH:-}"
REMOTE_STRAPI_ROOT="${TRANSFER_REMOTE_STRAPI_ROOT:-}"

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
  echo
  echo "Required environment variables:"
  echo "  TRANSFER_SSH                  SSH login, e.g. deploy@203.0.113.10"
  echo "  TRANSFER_REMOTE_STRAPI_ROOT   Absolute path to apps/strapi on the server"
  echo "                                (same machine layout as this repo), e.g."
  echo "                                /home/deploy/hourse-racing-app/apps/strapi"
  echo
  echo "Example:"
  echo "  TRANSFER_SSH=deploy@api.example.com \\"
  echo "  TRANSFER_REMOTE_STRAPI_ROOT=/var/www/hourse-racing-app/apps/strapi \\"
  echo "  pnpm transfer:db"
  exit 1
}

if [[ -z "$SSH_TARGET" || -z "$REMOTE_STRAPI_ROOT" ]]; then
  usage
fi

if [[ ! -f "$LOCAL_DB" ]]; then
  echo "error: local database not found: $LOCAL_DB"
  echo "hint: start Strapi locally once or set TRANSFER_LOCAL_DB to your .db path."
  exit 1
fi

REMOTE_DB="${REMOTE_STRAPI_ROOT%/}/.tmp/data.db"
REMOTE_TMP="${REMOTE_STRAPI_ROOT%/}/.tmp"

echo "Local DB:     $LOCAL_DB"
echo "Remote:       $SSH_TARGET:$REMOTE_DB"
echo
echo "Stop Strapi on the server before continuing, e.g.:"
echo "  ssh $SSH_TARGET 'pm2 stop horse-racing-strapi horse-racing-strapi-dev || true'"
echo
if [[ -z "${TRANSFER_YES:-}" ]]; then
  read -r -p "Continue? [y/N] " ok
  ok_lower=$(printf '%s' "$ok" | tr '[:upper:]' '[:lower:]')
  if [[ "$ok_lower" != "y" && "$ok_lower" != "yes" ]]; then
    echo "Aborted."
    exit 1
  fi
fi

ssh "$SSH_TARGET" "mkdir -p '$REMOTE_TMP'"

RSYNC_OPTS=(-avz --progress)
if [[ -n "${TRANSFER_DRY_RUN:-}" ]]; then
  RSYNC_OPTS+=(--dry-run)
fi

if [[ -n "${TRANSFER_USE_SCP:-}" ]]; then
  scp "$LOCAL_DB" "$SSH_TARGET:$REMOTE_DB"
else
  if ! command -v rsync &>/dev/null; then
    echo "rsync not found; set TRANSFER_USE_SCP=1 to use scp instead."
    exit 1
  fi
  rsync "${RSYNC_OPTS[@]}" "$LOCAL_DB" "$SSH_TARGET:$REMOTE_DB"
fi

echo
echo "Done. On the server, fix ownership if needed, then from the repo root:"
echo "  ssh $SSH_TARGET 'cd /path/to/hourse-racing-app && pm2 start ecosystem.prod.config.cjs'"
