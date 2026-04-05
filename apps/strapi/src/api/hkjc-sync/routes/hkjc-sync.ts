export default {
  routes: [
    {
      method: 'POST',
      path: '/hkjc-sync/trigger/all',
      handler: 'hkjc-sync.triggerAll',
      config: { auth: false },
    },
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
      path: '/hkjc-sync/trigger/analysis',
      handler: 'hkjc-sync.triggerAnalysis',
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
