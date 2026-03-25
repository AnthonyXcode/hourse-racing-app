import cron from 'node-cron';
import type { Core } from '@strapi/strapi';
import { runHkjcDailyJob } from './services/hkjc-daily-job';

let hkjcJobRunning = false;

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.HKJC_CRON_ENABLED === 'false') {
      strapi.log.info('HKJC cron disabled (HKJC_CRON_ENABLED=false)');
      return;
    }

    const schedule = process.env.HKJC_CRON_SCHEDULE || '0 6 * * *';
    const tz = process.env.HKJC_CRON_TZ || 'Asia/Hong_Kong';

    cron.schedule(
      schedule,
      async () => {
        if (hkjcJobRunning) {
          strapi.log.warn('hkjc-daily-job: skipped (previous run still marked running)');
          return;
        }
        hkjcJobRunning = true;
        try {
          strapi.log.info('hkjc-daily-job: cron tick');
          await runHkjcDailyJob(strapi);
        } catch (e) {
          strapi.log.error(`hkjc-daily-job: fatal ${e instanceof Error ? e.message : e}`);
        } finally {
          hkjcJobRunning = false;
        }
      },
      { timezone: tz }
    );

    strapi.log.info(`HKJC daily job scheduled: "${schedule}" (${tz})`);

    if (process.env.HKJC_CRON_RUN_ON_BOOT === 'true') {
      const runBoot = () => {
        void (async () => {
          if (hkjcJobRunning) return;
          hkjcJobRunning = true;
          try {
            strapi.log.info('hkjc-daily-job: running on boot (HKJC_CRON_RUN_ON_BOOT=true)');
            await runHkjcDailyJob(strapi);
          } catch (e) {
            strapi.log.error(`hkjc-daily-job: boot run failed ${e instanceof Error ? e.message : e}`);
          } finally {
            hkjcJobRunning = false;
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
