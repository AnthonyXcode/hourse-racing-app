import { runHkjcSyncOnce, isHkjcSyncRunning } from '../../../services/hkjc-sync-runner';
import { getAppStrapi } from '../../../services/strapi-instance';

export default {
  async trigger(ctx: any) {
    const secret = process.env.HKJC_SYNC_TRIGGER_SECRET;
    if (!secret || secret.length < 8) {
      ctx.status = 503;
      ctx.set('Content-Type', 'application/json');
      ctx.body = {
        error: 'Manual trigger disabled',
        hint: 'Set HKJC_SYNC_TRIGGER_SECRET (min 8 chars) in the Strapi app environment',
      };
      return;
    }

    const headerSecret =
      (ctx.request.headers['x-hkjc-sync-secret'] as string | undefined) ||
      (typeof ctx.query?.secret === 'string' ? ctx.query.secret : undefined);

    if (headerSecret !== secret) {
      ctx.status = 403;
      ctx.set('Content-Type', 'application/json');
      ctx.body = { error: 'Forbidden' };
      return;
    }

    if (isHkjcSyncRunning()) {
      ctx.status = 409;
      ctx.set('Content-Type', 'application/json');
      ctx.body = { error: 'Sync already running' };
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
      const { started } = await runHkjcSyncOnce(strapi);
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
  },
};
