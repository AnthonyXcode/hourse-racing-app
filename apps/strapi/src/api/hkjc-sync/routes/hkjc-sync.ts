export default {
  routes: [
    {
      method: 'POST',
      path: '/hkjc-sync/trigger',
      handler: 'hkjc-sync.trigger',
      config: {
        auth: false,
      },
    },
  ],
};
