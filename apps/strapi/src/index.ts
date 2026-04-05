import cron from 'node-cron';
import type { Core } from '@strapi/strapi';
import { seedFixtureFromSeedFile } from './services/fixture-seed';
import {
  runHkjcFixtureJobOnce,
  runHkjcMeetingsJobOnce,
  runHkjcHistoryJobOnce,
  runAnalysisCronJobOnce,
} from './services/hkjc-sync-runner';
import { setAppStrapi } from './services/strapi-instance';

const hkjcSyncTriggerParameters = [
  {
    name: 'x-hkjc-sync-secret',
    in: 'header' as const,
    required: false,
    schema: { type: 'string' },
    description: 'Must match `HKJC_SYNC_TRIGGER_SECRET`.',
  },
  {
    name: 'secret',
    in: 'query' as const,
    required: false,
    schema: { type: 'string' },
    description: 'Alternative to `x-hkjc-sync-secret`; same value as `HKJC_SYNC_TRIGGER_SECRET`.',
  },
];

const hkjcSyncTriggerResponses = {
  '200': {
    description: 'Job finished or was skipped because this job type is already running.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            started: {
              type: 'boolean',
              description: 'False when a lock prevented starting a new run.',
            },
          },
          required: ['ok', 'started'],
        },
      },
    },
  },
  '403': {
    description: 'Secret missing or wrong.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: { error: { type: 'string', example: 'Forbidden' } },
          required: ['error'],
        },
      },
    },
  },
  '409': {
    description: 'This job type is already running.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: { error: { type: 'string', example: 'This job is already running' } },
          required: ['error'],
        },
      },
    },
  },
  '500': {
    description: 'Internal error while running the job or Strapi instance unavailable.',
    content: {
      'application/json': {
        schema: {
          oneOf: [
            {
              type: 'object',
              properties: { error: { type: 'string' } },
              required: ['error'],
            },
            {
              type: 'object',
              properties: {
                ok: { type: 'boolean', example: false },
                error: { type: 'string' },
              },
              required: ['ok', 'error'],
            },
          ],
        },
      },
    },
  },
  '503': {
    description: '`HKJC_SYNC_TRIGGER_SECRET` unset or shorter than 8 characters.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Manual trigger disabled' },
            hint: { type: 'string' },
          },
          required: ['error'],
        },
      },
    },
  },
};

function hkjcTriggerPost(
  summary: string,
  description: string,
  operationId: string,
  extraParameters?: Record<string, unknown>[]
) {
  return {
    tags: ['HKJC'],
    summary,
    description,
    operationId,
    parameters: [...hkjcSyncTriggerParameters, ...(extraParameters ?? [])],
    responses: hkjcSyncTriggerResponses,
  };
}

const hkjcSyncOpenApiOverride = {
  tags: [{ name: 'HKJC', description: 'HKJC fixture / meeting / history sync' }],
  paths: {
    '/hkjc-sync/trigger/fixture': {
      post: hkjcTriggerPost(
        'Trigger HKJC fixture job',
        'Fetches HKJC fixture page(s) and creates missing Fixture rows. Requires `HKJC_SYNC_TRIGGER_SECRET` (min 8 characters). Send the same value in header `x-hkjc-sync-secret` or query `secret`. Returns 503 if the secret is not configured.',
        'postHkjcSyncTriggerFixture'
      ),
    },
    '/hkjc-sync/trigger/meetings': {
      post: hkjcTriggerPost(
        'Trigger HKJC meetings job',
        'Scrapes HKJC racecard / results pages and upserts Meeting rows. Without parameters it processes all fixture dates; with parameters it targets a specific race. Requires `HKJC_SYNC_TRIGGER_SECRET`.',
        'postHkjcSyncTriggerMeetings',
        [
          {
            name: 'date',
            in: 'query',
            required: false,
            schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2026-04-06' },
            description: 'Target race date in `yyyy-MM-dd` format.',
          },
          {
            name: 'venue',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['ST', 'HV'] },
            description: 'Venue code (`ST` = Sha Tin, `HV` = Happy Valley).',
          },
          {
            name: 'raceNo',
            in: 'query',
            required: false,
            schema: { type: 'string', example: '1' },
            description: 'Race number(s). Supports single (`1`), range (`1-5`), or comma-separated (`1,3,7`).',
          },
        ]
      ),
    },
    '/hkjc-sync/trigger/history': {
      post: hkjcTriggerPost(
        'Trigger HKJC history job',
        'For past fixture dates, scrapes HKJC results and creates History when missing (subject to `HKJC_HISTORICAL_SYNC_ENABLED` and caps). Requires `HKJC_SYNC_TRIGGER_SECRET` (min 8 characters). Send the same value in header `x-hkjc-sync-secret` or query `secret`. Returns 503 if the secret is not configured.',
        'postHkjcSyncTriggerHistory'
      ),
    },
    '/hkjc-sync/trigger/analysis': {
      post: hkjcTriggerPost(
        'Trigger race analysis (Monte Carlo)',
        'Runs Monte Carlo simulation. Provide `date`, `venue`, and `raceNo` to target a specific race; omit all three to analyse every upcoming race that lacks an Analysis record. Requires `HKJC_SYNC_TRIGGER_SECRET`.',
        'postHkjcSyncTriggerAnalysis',
        [
          {
            name: 'date',
            in: 'query',
            required: false,
            schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2026-04-06' },
            description: 'Target race date in `yyyy-MM-dd` format.',
          },
          {
            name: 'venue',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['ST', 'HV'] },
            description: 'Venue code (`ST` = Sha Tin, `HV` = Happy Valley).',
          },
          {
            name: 'raceNo',
            in: 'query',
            required: false,
            schema: { type: 'string', example: '1' },
            description: 'Single race number (e.g. `1`). All three params are required to target a specific race.',
          },
        ]
      ),
    },
    '/hkjc-sync/trigger/all': {
      post: hkjcTriggerPost(
        'Trigger all HKJC sync jobs',
        'Runs fixture → meetings → history → analysis sequentially. Requires `HKJC_SYNC_TRIGGER_SECRET`.',
        'postHkjcSyncTriggerAll'
      ),
    },
    '/hkjc-sync/trigger': {
      post: hkjcTriggerPost(
        'Trigger all HKJC sync jobs (legacy path)',
        'Same as `POST /hkjc-sync/trigger/all`. Runs fixture → meetings → history → analysis sequentially. Requires `HKJC_SYNC_TRIGGER_SECRET`.',
        'postHkjcSyncTrigger'
      ),
    },
  },
};

function scheduleHkjcCron(
  strapi: Core.Strapi,
  label: string,
  cronExpr: string,
  tz: string,
  run: (s: Core.Strapi) => Promise<{ started: boolean }>
) {
  cron.schedule(
    cronExpr,
    async () => {
      strapi.log.info(`hkjc-cron: ${label} tick`);
      const { started } = await run(strapi);
      if (!started) {
        strapi.log.warn(`hkjc-cron: ${label} skipped (previous run still marked running)`);
      }
    },
    { timezone: tz }
  );
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.plugin('documentation')?.service('override')?.registerOverride(hkjcSyncOpenApiOverride);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    setAppStrapi(strapi);

    try {
      await seedFixtureFromSeedFile(strapi);
    } catch (e) {
      strapi.log.error(
        `fixture-seed failed: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    if (process.env.HKJC_CRON_ENABLED === 'false') {
      strapi.log.info('HKJC cron disabled (HKJC_CRON_ENABLED=false)');
      return;
    }

    const tz = process.env.HKJC_CRON_TZ || 'Asia/Hong_Kong';
    const scheduleFixture = process.env.HKJC_CRON_FIXTURE_SCHEDULE || '0 0 * * *';
    const scheduleMeetings = process.env.HKJC_CRON_MEETINGS_SCHEDULE || '0 6 * * *';
    const scheduleHistoryRaw = process.env.HKJC_CRON_HISTORY_SCHEDULE || '0 19 * * *,0 23 * * *';
    const scheduleAnalysis = process.env.HKJC_CRON_ANALYSIS_SCHEDULE || '0 8 * * *';

    scheduleHkjcCron(strapi, 'fixture', scheduleFixture, tz, runHkjcFixtureJobOnce);
    scheduleHkjcCron(strapi, 'meetings', scheduleMeetings, tz, runHkjcMeetingsJobOnce);

    const historyExprs = scheduleHistoryRaw.split(',').map((s) => s.trim()).filter(Boolean);
    for (const expr of historyExprs) {
      scheduleHkjcCron(strapi, 'history', expr, tz, runHkjcHistoryJobOnce);
    }

    scheduleHkjcCron(strapi, 'analysis', scheduleAnalysis, tz, runAnalysisCronJobOnce);

    strapi.log.info(
      `HKJC crons: fixture "${scheduleFixture}", meetings "${scheduleMeetings}", history "${scheduleHistoryRaw}", analysis "${scheduleAnalysis}" (${tz})`
    );

    if (process.env.HKJC_CRON_RUN_ON_BOOT === 'true') {
      const runBoot = () => {
        void (async () => {
          strapi.log.info(
            'hkjc-cron: fixture on boot (HKJC_CRON_RUN_ON_BOOT=true); meetings/history follow via cron'
          );
          const { started } = await runHkjcFixtureJobOnce(strapi);
          if (!started) {
            strapi.log.warn('hkjc-cron: boot fixture run skipped (already running)');
          }
        })();
      };
      if (strapi.server.httpServer) {
        strapi.server.httpServer.once('listening', () => setTimeout(runBoot, 3000));
      } else {
        setTimeout(runBoot, 8000);
      }
    }
  },
};
