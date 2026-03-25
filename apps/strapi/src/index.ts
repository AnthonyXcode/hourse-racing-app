import cron from 'node-cron';
import type { Core } from '@strapi/strapi';
import { seedFixtureFromSeedFile } from './services/fixture-seed';
import { runHkjcSyncOnce } from './services/hkjc-sync-runner';
import { setAppStrapi } from './services/strapi-instance';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

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
