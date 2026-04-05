export default {
  routes: [
    {
      method: 'POST',
      path: '/subscriptions/checkout',
      handler: 'subscription.checkout',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/subscriptions/status',
      handler: 'subscription.status',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/subscriptions/portal',
      handler: 'subscription.portal',
      config: {
        policies: [],
      },
    },
  ],
};
