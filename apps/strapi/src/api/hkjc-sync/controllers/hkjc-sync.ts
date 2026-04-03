import {
  runHkjcFixtureJobOnce,
  runHkjcMeetingsJobOnce,
  runHkjcHistoryJobOnce,
  isHkjcFixtureJobRunning,
  isHkjcMeetingsJobRunning,
  isHkjcHistoryJobRunning,
} from '../../../services/hkjc-sync-runner';
import { getAppStrapi } from '../../../services/strapi-instance';

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
  /** Legacy path: same as `triggerFixture`. */
  async trigger(ctx: any) {
    await runTrigger(ctx, isHkjcFixtureJobRunning, runHkjcFixtureJobOnce);
  },

  async triggerFixture(ctx: any) {
    await runTrigger(ctx, isHkjcFixtureJobRunning, runHkjcFixtureJobOnce);
  },

  async triggerMeetings(ctx: any) {
    await runTrigger(ctx, isHkjcMeetingsJobRunning, runHkjcMeetingsJobOnce);
  },

  async triggerHistory(ctx: any) {
    await runTrigger(ctx, isHkjcHistoryJobRunning, runHkjcHistoryJobOnce);
  },
};
