import { createCustomer, createCheckoutSession, createPortalSession } from '../../../services/stripe-service';

async function getOrCreateSubscription(userId: number): Promise<any> {
  const existing = await strapi.db.query('api::subscription.subscription').findOne({
    where: { user: userId },
  });
  return existing;
}

export default {
  async checkout(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    let sub = await getOrCreateSubscription(user.id);
    let customerId = sub?.stripeCustomerId;

    if (!customerId) {
      customerId = await createCustomer(user.email || `${user.phone}@phone.local`, {
        userId: String(user.id),
      });

      if (sub) {
        await strapi.db.query('api::subscription.subscription').update({
          where: { id: sub.id },
          data: { stripeCustomerId: customerId },
        });
      } else {
        sub = await strapi.db.query('api::subscription.subscription').create({
          data: {
            user: user.id,
            stripeCustomerId: customerId,
            status: 'expired',
            plan: 'monthly',
          },
        });
      }
    }

    const appUrl = process.env.APP_URL || 'http://localhost:8081';
    const { url, sessionId } = await createCheckoutSession(
      customerId,
      `${appUrl}/subscribe?success=true`,
      `${appUrl}/subscribe?cancelled=true`,
    );

    ctx.body = { url, sessionId };
  },

  async status(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const sub = await getOrCreateSubscription(user.id);
    ctx.body = {
      subscriptionStatus: user.subscriptionStatus ?? 'free',
      subscription: sub
        ? {
            plan: sub.plan,
            status: sub.status,
            currentPeriodEnd: sub.currentPeriodEnd,
          }
        : null,
    };
  },

  async portal(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const sub = await getOrCreateSubscription(user.id);
    if (!sub?.stripeCustomerId) return ctx.badRequest('No subscription found');

    const appUrl = process.env.APP_URL || 'http://localhost:8081';
    const url = await createPortalSession(sub.stripeCustomerId, `${appUrl}/profile`);
    ctx.body = { url };
  },
};
