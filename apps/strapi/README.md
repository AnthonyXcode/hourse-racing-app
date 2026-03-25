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
| **App bootstrap** | Optional **Fixture** row creation from `data/fixtures.seed.json` via `seedFixtureFromSeedFile` (skipped if `HKJC_FIXTURE_SYNC_ON_BOOT=false`). |
| **Cron** | Three jobs (disabled if `HKJC_CRON_ENABLED=false`): fixture `HKJC_CRON_FIXTURE_SCHEDULE` (default `0 6 * * *`), meetings `HKJC_CRON_MEETINGS_SCHEDULE` (default `30 6 * * *`), history `HKJC_CRON_HISTORY_SCHEDULE` (default `45 6 * * *`). Time zone: `HKJC_CRON_TZ` (default `Asia/Hong_Kong`). |
| **After listen (optional)** | Fixture job only if `HKJC_CRON_RUN_ON_BOOT=true` (meetings/history still follow cron). |
| **HTTP** | `POST /api/hkjc-sync/trigger/fixture`, `.../meetings`, `.../history` with `x-hkjc-sync-secret` (when `HKJC_SYNC_TRIGGER_SECRET` is set). Legacy `POST /api/hkjc-sync/trigger` is the same as fixture. |

Each job type is serialized separately: a second trigger for the same job while it is running returns 409; the other two jobs can still run.

### Sequence diagram

```mermaid
sequenceDiagram
  autonumber
  participant Boot as App bootstrap
  participant Seed as fixture-seed
  participant Fx as Fixture
  participant Trig as Triggers (cron / boot / HTTP)
  participant Fj as Fixture job
  participant Mj as Meetings job
  participant Hj as History job
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

  Trig->>Fj: 6:00 cron / boot / POST .../trigger/fixture
  Fj->>Hc: jobName hkjc_fixture
  alt fixture fetch enabled and succeeds
    Fj->>Web: Playwright fixture scrape
    Web-->>Fj: meeting rows
    Fj->>Fx: create missing Fixture rows (key, raceDate, venue)
  end
  Fj->>Hc: update status, metrics

  Trig->>Mj: 6:30 cron / POST .../trigger/meetings
  Mj->>Hc: jobName hkjc_meetings
  Mj->>Fx: load fixture list
  loop each date or venue slot
    Mj->>Mt: create if no row for key
  end
  Mj->>Hc: update status, metrics

  Trig->>Hj: 6:45 cron / POST .../trigger/history
  Hj->>Hc: jobName hkjc_history
  Hj->>Fx: load fixture list
  opt historical sync enabled
    Note over Hj, Hi: Past dates only; capped by HKJC_HISTORICAL_MAX_PER_RUN
    loop missing past Meeting with no History
      Hj->>Web: scrape local results (Playwright)
      Hj->>Hi: create linked History plus results components
      Hj->>Mt: update scrapeStatus, lastScrapedAt
    end
  end
  Hj->>Hc: update status, metrics
```

On **fatal errors** inside the job, **Healthcheck** is updated to `failure` with whatever **metrics** (phase list) were collected so far. **History** is only created when a past **Meeting** exists, has no **History** yet, and scraping succeeds (see `HKJC_HISTORICAL_SYNC_ENABLED` and related env vars in code).

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
