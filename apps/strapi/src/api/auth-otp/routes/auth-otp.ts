export default {
  routes: [
    {
      method: 'POST',
      path: '/auth-otp/send',
      handler: 'auth-otp.send',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth-otp/verify',
      handler: 'auth-otp.verify',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth-otp/register',
      handler: 'auth-otp.register',
      config: { auth: false },
    },
  ],
};
