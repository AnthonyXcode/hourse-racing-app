export default {
  routes: [
    {
      method: 'POST',
      path: '/hkjc-sync/trigger/fixture',
      handler: 'hkjc-sync.triggerFixture',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/hkjc-sync/trigger/meetings',
      handler: 'hkjc-sync.triggerMeetings',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/hkjc-sync/trigger/history',
      handler: 'hkjc-sync.triggerHistory',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/hkjc-sync/trigger',
      handler: 'hkjc-sync.trigger',
      config: { auth: false },
    },
  ],
};
