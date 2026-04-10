# Horse racing app

Monorepo with a Strapi backend (`apps/strapi`), an Expo **frontend** (`apps/frontend`) for web, iOS, and Android, and shared packages.

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io/) 9 (`corepack enable && corepack prepare pnpm@9.15.4 --activate`)

## Local development

```bash
pnpm install
pnpm dev
```

Strapi-only:

```bash
pnpm dev:strapi
```

Frontend (Expo, all platforms):

```bash
pnpm dev:frontend
```

Web only (local):

```bash
pnpm exec --dir apps/frontend expo start --web
```

## Ubuntu server deployment with PM2

PM2 runs **Strapi** and the **frontend web** stack on Ubuntu: API + either Expo’s dev web server (staging) or a static **web export** served with [`serve`](https://github.com/vercel/serve) (production). Native iOS/Android builds use **EAS**; see [Frontend: native apps (EAS)](#frontend-native-apps-eas) below.

### 1. Server prerequisites

```bash
# Node 20+ (example via NodeSource — use your preferred method)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm (matches repo packageManager)
sudo corepack enable
sudo corepack prepare pnpm@9.15.4 --activate

# PM2 process manager
sudo npm install -g pm2
```

### 2. Clone and install

```bash
git clone <your-repo-url> horse-racing-app
cd horse-racing-app
pnpm install --frozen-lockfile
```

### 3. Environment files

**Strapi:** create `apps/strapi/.env` (see [Strapi environment variables](https://docs.strapi.io/dev-docs/configurations/environment) and `apps/strapi/config`). Typical values include `APP_KEYS`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, and database settings.

**Frontend:** create `apps/frontend/.env` for public client variables (see `apps/frontend/.env.example`), especially `EXPO_PUBLIC_STRAPI_URL` pointing at your HTTPS API (e.g. `https://api.example.com/api`).

Optional Strapi overrides in `.env`:

| Variable | Purpose |
|----------|---------|
| `HOST` | Bind address (default `0.0.0.0`) |
| `NODE_ENV` | Set by PM2 per app (`development` vs `production`); you usually omit this from `.env` |

Strapi loads `apps/strapi/.env` when PM2 sets `cwd` to that directory. Expo loads `apps/frontend/.env` from the frontend app root.

#### Same server: ports per process

Each PM2 process listens on its own port. Strapi uses `PORT` in the ecosystem `env` block (wins over `.env`). Frontend web ports are set in `apps/frontend/package.json` (`dev:web` and `start:web`).

| Process | Config | Default port |
|---------|--------|----------------|
| Strapi production | `ecosystem.prod.config.cjs` | `1337` |
| Strapi dev / staging | `ecosystem.dev.config.cjs` | `1338` |
| Frontend web production (static `dist`) | same prod config | `3001` (`start:web`) |
| Frontend web dev (Expo) | same dev config | `3000` (`dev:web`) |

Adjust Strapi ports via `DEV_STRAPI_PORT` / `PROD_STRAPI_PORT` at the top of the ecosystem files. Adjust frontend ports by editing the `dev:web` / `start:web` scripts in `apps/frontend/package.json`.

Point your reverse proxy at the matching upstreams (for example `127.0.0.1:1337` for the API and `127.0.0.1:3001` for the public site).

**Database:** Two Strapi instances should not share one SQLite file. Use separate databases (e.g. different `DATABASE_NAME` / `DATABASE_FILENAME`) or accept shared DB only if intentional.

### 4. Development / staging (PM2)

Starts Strapi **develop** and Expo **web** dev server. From the **repository root**:

```bash
pnpm pm2:dev:start      # or: pm2 start ecosystem.dev.config.cjs
pm2 logs
```

Useful commands:

```bash
pm2 restart horse-racing-strapi-dev
pm2 restart horse-racing-frontend-dev
pm2 stop horse-racing-strapi-dev horse-racing-frontend-dev
```

### 5. Production (PM2)

Build the API and the static web bundle, then start PM2:

```bash
pnpm build:strapi
pnpm build:frontend    # expo export --platform web → apps/frontend/dist
pnpm pm2:prod:start    # or: pm2 start ecosystem.prod.config.cjs
```

After code or dependency updates:

```bash
git pull
pnpm install --frozen-lockfile
pnpm build:strapi
pnpm build:frontend
pm2 reload ecosystem.prod.config.cjs --update-env
```

If you change only Strapi or only the frontend, rebuild the affected app before `pm2 reload`.

### 6. Persist PM2 across reboots

Run the command PM2 prints (once per machine, as the deploy user):

```bash
pm2 save
pm2 startup
```

### 7. Reverse proxy and TLS

Terminate TLS on Nginx or Caddy and proxy to localhost, for example:

- Production API: `http://127.0.0.1:1337`
- Staging API: `http://127.0.0.1:1338`
- Production web: `http://127.0.0.1:3001`
- Staging web: `http://127.0.0.1:3000`

Restrict direct access to those ports with a firewall so only the proxy can reach them.

### PM2 app names

| Environment | Config file | Process | Role |
|-------------|-------------|---------|------|
| Dev / staging | `ecosystem.dev.config.cjs` | `horse-racing-strapi-dev` | Strapi develop |
| Dev / staging | `ecosystem.dev.config.cjs` | `horse-racing-frontend-dev` | Expo web dev |
| Production | `ecosystem.prod.config.cjs` | `horse-racing-strapi` | Strapi start |
| Production | `ecosystem.prod.config.cjs` | `horse-racing-frontend` | `serve` static web |

Logs are under `logs/pm2/` at the repo root (`mkdir -p logs/pm2` on first deploy if needed).

## Frontend: native apps (EAS)

The app in `apps/frontend` is an **Expo** project. **iOS** and **Android** ship as store or internal binaries via [EAS Build](https://docs.expo.dev/build/introduction/). Configure `EXPO_PUBLIC_STRAPI_URL` (and reCAPTCHA keys if needed) per profile in `apps/frontend/eas.json` or with [EAS environment variables](https://docs.expo.dev/eas/environment-variables/).

### One-time setup

1. Install the CLI: `npm install -g eas-cli` (or `npx eas-cli`).
2. `cd apps/frontend && eas login && eas init`
3. Edit `apps/frontend/eas.json`: replace placeholder `EXPO_PUBLIC_STRAPI_URL` values for `preview` / `production` with your real HTTPS API URLs.

### Build on EAS (monorepo)

`eas.json` uses `installCommand` to run `pnpm install` from the repo root. `eas-build-post-install` in `apps/frontend/package.json` runs `turbo run build` for `@horse-racing/api-client` so Metro can bundle the workspace client (web export is **not** run on EAS; that is only for server/PM2).

```bash
cd apps/frontend
eas build --profile preview --platform android
eas build --profile production --platform all
```

### Submit and updates

- **Stores:** `eas submit --profile production --platform ios` (and/or `android`). See [Submit to app stores](https://docs.expo.dev/submit/introduction/).
- **OTA JS updates:** optional [EAS Update](https://docs.expo.dev/eas-update/introduction/).
