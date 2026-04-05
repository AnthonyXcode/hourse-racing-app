import {
  runHkjcFixtureJobOnce,
  runHkjcMeetingsJobOnce,
  runHkjcHistoryJobOnce,
  runAnalysisJobOnce,
  runAllJobsOnce,
  isHkjcFixtureJobRunning,
  isHkjcMeetingsJobRunning,
  isHkjcHistoryJobRunning,
  isAnalysisJobRunning,
  isAllJobsRunning,
} from '../../../services/hkjc-sync-runner';
import { getAppStrapi } from '../../../services/strapi-instance';
import type { MeetingsJobOptions } from '../../../services/hkjc-daily-job';

function readTriggerSecret(ctx: any): string | undefined {
  return (
    (ctx.request.headers['x-hkjc-sync-secret'] as string | undefined) ||
    (typeof ctx.query?.secret === 'string' ? ctx.query.secret : undefined)
  );
}

function rejectUnlessSecretOk(ctx: any): boolean {
  const secret = process.env.HKJC_SYNC_TRIGGER_SECRET;
  if (!secret || secret.length < 8) {
    ctx.status = 503;
    ctx.set('Content-Type', 'application/json');
    ctx.body = {
      error: 'Manual trigger disabled',
      hint: 'Set HKJC_SYNC_TRIGGER_SECRET (min 8 chars) in the Strapi app environment',
    };
    return false;
  }
  if (readTriggerSecret(ctx) !== secret) {
    ctx.status = 403;
    ctx.set('Content-Type', 'application/json');
    ctx.body = { error: 'Forbidden' };
    return false;
  }
  return true;
}

/**
 * Parse a raceNo query param into an array of race numbers.
 * Supports: "1", "1-5", "1,3,7", "1-3,7,9-11"
 */
function parseRaceNumbers(raw: string): number[] {
  const nums = new Set<number>();
  for (const part of raw.split(',')) {
    const trimmed = part.trim();
    const rangeParts = trimmed.split('-');
    if (rangeParts.length === 2) {
      const lo = Number(rangeParts[0]);
      const hi = Number(rangeParts[1]);
      if (Number.isInteger(lo) && Number.isInteger(hi) && lo >= 1 && hi >= lo && hi <= 14) {
        for (let i = lo; i <= hi; i++) nums.add(i);
      }
    } else {
      const n = Number(trimmed);
      if (Number.isInteger(n) && n >= 1 && n <= 14) nums.add(n);
    }
  }
  return Array.from(nums).sort((a, b) => a - b);
}

function parseMeetingsQueryParams(ctx: any): MeetingsJobOptions {
  const opts: MeetingsJobOptions = {};
  const q = ctx.query ?? {};
  if (typeof q.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q.date)) {
    opts.date = q.date;
  }
  if (typeof q.venue === 'string' && (q.venue === 'ST' || q.venue === 'HV')) {
    opts.venue = q.venue;
  }
  if (typeof q.raceNo === 'string' && q.raceNo.length > 0) {
    const nums = parseRaceNumbers(q.raceNo);
    if (nums.length > 0) opts.raceNumbers = nums;
  }
  return opts;
}

const SYNC_TIMEOUT_MS = 3 * 60 * 1000;

async function runTrigger(
  ctx: any,
  isRunning: () => boolean,
  runOnce: (strapi: any) => Promise<{ started: boolean }>
): Promise<void> {
  if (!rejectUnlessSecretOk(ctx)) return;

  if (ctx.req?.socket) {
    ctx.req.socket.setTimeout(SYNC_TIMEOUT_MS);
  }

  if (isRunning()) {
    ctx.status = 409;
    ctx.set('Content-Type', 'application/json');
    ctx.body = { error: 'This job is already running' };
    return;
  }

  const strapi = getAppStrapi();
  if (!strapi) {
    ctx.status = 500;
    ctx.set('Content-Type', 'application/json');
    ctx.body = { error: 'Strapi instance unavailable' };
    return;
  }

  try {
    const { started } = await runOnce(strapi);
    ctx.status = 200;
    ctx.set('Content-Type', 'application/json');
    ctx.body = { ok: true, started };
  } catch (e) {
    ctx.status = 500;
    ctx.set('Content-Type', 'application/json');
    ctx.body = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export default {
  async triggerAll(ctx: any) {
    await runTrigger(ctx, isAllJobsRunning, runAllJobsOnce);
  },

  /** Legacy path: now runs all jobs (fixture → meetings → history → analysis). */
  async trigger(ctx: any) {
    await runTrigger(ctx, isAllJobsRunning, runAllJobsOnce);
  },

  async triggerFixture(ctx: any) {
    await runTrigger(ctx, isHkjcFixtureJobRunning, runHkjcFixtureJobOnce);
  },

  async triggerMeetings(ctx: any) {
    const opts = parseMeetingsQueryParams(ctx);
    await runTrigger(ctx, isHkjcMeetingsJobRunning, (strapi) =>
      runHkjcMeetingsJobOnce(strapi, opts)
    );
  },

  async triggerHistory(ctx: any) {
    await runTrigger(ctx, isHkjcHistoryJobRunning, runHkjcHistoryJobOnce);
  },

  async triggerAnalysis(ctx: any) {
    const q = ctx.query ?? {};
    let meetingKey: string | undefined;
    if (
      typeof q.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q.date) &&
      typeof q.venue === 'string' && (q.venue === 'ST' || q.venue === 'HV') &&
      typeof q.raceNo === 'string' && /^\d{1,2}$/.test(q.raceNo)
    ) {
      meetingKey = `${q.date}_${q.venue}_R${q.raceNo}`;
    }
    await runTrigger(ctx, isAnalysisJobRunning, (strapi) =>
      runAnalysisJobOnce(strapi, meetingKey),
    );
  },
};
