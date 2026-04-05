import { constructWebhookEvent } from '../../../services/stripe-service';

async function updateSubscriptionFromStripe(stripeCustomerId: string, data: Record<string, any>) {
  const sub = await strapi.db.query('api::subscription.subscription').findOne({
    where: { stripeCustomerId },
    populate: ['user'],
  });
  if (!sub) {
    strapi.log.warn(`Stripe webhook: no subscription found for customer ${stripeCustomerId}`);
    return;
  }

  await strapi.db.query('api::subscription.subscription').update({
    where: { id: sub.id },
    data,
  });

  const statusMap: Record<string, string> = {
    active: 'active',
    canceled: 'cancelled',
    cancelled: 'cancelled',
    past_due: 'active',
    expired: 'expired',
  };
  const newUserStatus = statusMap[data.status] ?? 'free';

  if (sub.user?.id) {
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: sub.user.id },
      data: { subscriptionStatus: newUserStatus },
    });
  }
}

export default {
  async handleWebhook(ctx: any) {
    const sig = ctx.request.headers['stripe-signature'];
    if (!sig) return ctx.badRequest('Missing stripe-signature header');

    let event;
    try {
      event = constructWebhookEvent(ctx.request.body[Symbol.for('unparsedBody')] ?? ctx.request.body, sig);
    } catch (err: any) {
      strapi.log.error('Stripe webhook signature verification failed:', err.message);
      return ctx.badRequest('Webhook signature verification failed');
    }

    const obj = event.data.object as any;

    switch (event.type) {
      case 'checkout.session.completed': {
        if (obj.mode === 'subscription') {
          const customerId = obj.customer as string;
          const subscriptionId = obj.subscription as string;

          const sub = await strapi.db.query('api::subscription.subscription').findOne({
            where: { stripeCustomerId: customerId },
          });
          if (sub) {
            await strapi.db.query('api::subscription.subscription').update({
              where: { id: sub.id },
              data: {
                stripeSubscriptionId: subscriptionId,
                status: 'active',
              },
            });
          }
        }
        break;
      }

      case 'invoice.paid': {
        const customerId = obj.customer as string;
        const periodStart = obj.period_start
          ? new Date(obj.period_start * 1000).toISOString()
          : undefined;
        const periodEnd = obj.period_end
          ? new Date(obj.period_end * 1000).toISOString()
          : undefined;

        await updateSubscriptionFromStripe(customerId, {
          status: 'active',
          ...(periodStart ? { currentPeriodStart: periodStart } : {}),
          ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
        });
        break;
      }

      case 'customer.subscription.updated': {
        const customerId = obj.customer as string;
        const status = obj.cancel_at_period_end ? 'cancelled' : obj.status === 'past_due' ? 'past_due' : 'active';
        await updateSubscriptionFromStripe(customerId, {
          status,
          stripeSubscriptionId: obj.id,
          currentPeriodStart: new Date(obj.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(obj.current_period_end * 1000).toISOString(),
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const customerId = obj.customer as string;
        await updateSubscriptionFromStripe(customerId, { status: 'expired' });
        break;
      }

      default:
        strapi.log.info(`Stripe webhook: unhandled event type ${event.type}`);
    }

    ctx.body = { received: true };
  },
};
