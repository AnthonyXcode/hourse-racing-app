import { runHkjcDailyJob } from './hkjc-daily-job';

let running = false;

export function isHkjcSyncRunning(): boolean {
  return running;
}

/**
 * Runs the same work as the cron job, with a re-entrancy guard.
 * @returns whether the job actually started (false if already running)
 */
export async function runHkjcSyncOnce(strapi: any): Promise<{ started: boolean }> {
  if (running) return { started: false };
  running = true;
  try {
    await runHkjcDailyJob(strapi);
    return { started: true };
  } finally {
    running = false;
  }
}
