# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## HKJC data: when Fixture, Meeting, History, and Healthcheck update

### Triggers

| When | What runs |
|------|-----------|
| **App bootstrap** | Optional **Fixture** upsert from `data/fixtures.seed.json` via `seedFixtureFromSeedFile` (skipped if `HKJC_FIXTURE_SYNC_ON_BOOT=false`). |
| **Cron** | `runHkjcSyncOnce` → `runHkjcDailyJob` on `HKJC_CRON_SCHEDULE` (disabled if `HKJC_CRON_ENABLED=false`). |
| **After listen (optional)** | Same sync job if `HKJC_CRON_RUN_ON_BOOT=true`. |
| **HTTP** | `POST /api/hkjc-sync/trigger` with `x-hkjc-sync-secret` (when `HKJC_SYNC_TRIGGER_SECRET` is set). |

The daily HKJC job is serialized: a second trigger while a run is active is ignored (`runHkjcSyncOnce` guard).

### Sequence diagram

```mermaid
sequenceDiagram
  autonumber
  participant Boot as App bootstrap
  participant Seed as fixture-seed
  participant Fx as Fixture
  participant Trig as Sync trigger
  participant Run as runHkjcSyncOnce
  participant Job as runHkjcDailyJob
  participant Hc as Healthcheck
  participant Web as HKJC site
  participant Mt as Meeting
  participant Hi as History

  rect rgb(245, 250, 255)
    Note over Boot, Fx: Once per process start (independent of cron)
    Boot->>Seed: seedFixtureFromSeedFile()
    alt seed not disabled
      Seed->>Fx: upsert from fixtures.seed.json
    end
  end

  Trig->>Run: cron / boot delay / POST trigger
  Run->>Job: runHkjcDailyJob (if lock free)
  Job->>Hc: create jobName, startedAt, status running

  alt fixture fetch enabled and succeeds
    Job->>Web: Playwright fixture scrape
    Web-->>Job: meeting rows
    Job->>Fx: upsert season, lastUpdated, meeting slots
  else no fetch or empty result
    Job->>Fx: read existing single-type Fixture (fallback list)
  end

  loop each date or venue slot in resolved list
    Job->>Mt: create if no row for key
  end

  opt historical sync enabled
    Note over Job, Hi: Past dates only; capped by HKJC_HISTORICAL_MAX_PER_RUN
    loop missing past Meeting with no History
      Job->>Web: scrape local results (Playwright)
      Job->>Hi: create linked History plus results components
      Job->>Mt: update scrapeStatus, lastScrapedAt
    end
  end

  Job->>Hc: update status, completedAt, metrics component
```

On **fatal errors** inside the job, **Healthcheck** is updated to `failure` with whatever **metrics** (phase list) were collected so far. **History** is only created when a past **Meeting** exists, has no **History** yet, and scraping succeeds (see `HKJC_HISTORICAL_SYNC_ENABLED` and related env vars in code).

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
