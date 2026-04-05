import Stripe from 'stripe';

let stripeInstance: ReturnType<typeof Stripe> | null = null;

function getStripe(): ReturnType<typeof Stripe> {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
    stripeInstance = Stripe(key, { apiVersion: '2025-03-31.basil' as any });
  }
  return stripeInstance;
}

export async function createCustomer(email: string, metadata?: Record<string, string>): Promise<string> {
  const stripe = getStripe();
  const customer = await stripe.customers.create({ email, metadata });
  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error('STRIPE_PRICE_ID not configured');

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { url: session.url!, sessionId: session.id };
}

export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
