import cron from 'node-cron';
import type { Core } from '@strapi/strapi';
import { seedFixtureFromSeedFile } from './services/fixture-seed';
import { runHkjcSyncOnce } from './services/hkjc-sync-runner';
import { setAppStrapi } from './services/strapi-instance';

const hkjcSyncOpenApiOverride = {
  tags: [{ name: 'HKJC', description: 'HKJC fixture sync' }],
  paths: {
    '/hkjc-sync/trigger': {
      post: {
        tags: ['HKJC'],
        summary: 'Trigger HKJC sync',
        description:
          'Runs the HKJC fixture / meeting sync once. Requires `HKJC_SYNC_TRIGGER_SECRET` (min 8 characters) in the server environment. Send the same value in header `x-hkjc-sync-secret` or query `secret`. Returns 503 if the secret is not configured.',
        operationId: 'postHkjcSyncTrigger',
        parameters: [
          {
            name: 'x-hkjc-sync-secret',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Must match `HKJC_SYNC_TRIGGER_SECRET`.',
          },
          {
            name: 'secret',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Alternative to `x-hkjc-sync-secret`; same value as `HKJC_SYNC_TRIGGER_SECRET`.',
          },
        ],
        responses: {
          '200': {
            description: 'Sync finished or was skipped because another run is in progress.',
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
            description: 'Another sync run is already in progress.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string', example: 'Sync already running' } },
                  required: ['error'],
                },
              },
            },
          },
          '500': {
            description: 'Internal error while running sync or Strapi instance unavailable.',
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
        },
      },
    },
  },
};

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

    const schedule = process.env.HKJC_CRON_SCHEDULE || '0 6 * * *';
    const tz = process.env.HKJC_CRON_TZ || 'Asia/Hong_Kong';

    cron.schedule(
      schedule,
      async () => {
        strapi.log.info('hkjc-daily-job: cron tick');
        const { started } = await runHkjcSyncOnce(strapi);
        if (!started) {
          strapi.log.warn('hkjc-daily-job: skipped (previous run still marked running)');
        }
      },
      { timezone: tz }
    );

    strapi.log.info(`HKJC daily job scheduled: "${schedule}" (${tz})`);

    if (process.env.HKJC_CRON_RUN_ON_BOOT === 'true') {
      const runBoot = () => {
        void (async () => {
          strapi.log.info('hkjc-daily-job: running on boot (HKJC_CRON_RUN_ON_BOOT=true)');
          const { started } = await runHkjcSyncOnce(strapi);
          if (!started) {
            strapi.log.warn('hkjc-daily-job: boot run skipped (already running)');
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
