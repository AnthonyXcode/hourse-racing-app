export default {
  routes: [
    {
      method: 'POST',
      path: '/stripe-webhook',
      handler: 'stripe-webhook.handleWebhook',
      config: {
        auth: false,
      },
    },
  ],
};
