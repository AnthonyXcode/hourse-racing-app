import bcrypt from 'bcryptjs';
import { sendOtp, verifyOtp } from '../../../services/twilio-otp';
import { verifyRecaptcha } from '../../../middlewares/recaptcha';

function issueJwt(user: any): string {
  return strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });
}

async function findUserByPhone(phone: string) {
  const users = await strapi.db.query('plugin::users-permissions.user').findMany({
    where: { phone },
    limit: 1,
  });
  return users[0] ?? null;
}

async function getAuthenticatedRole() {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });
  return role;
}

export default {
  async send(ctx: any) {
    const { phone, recaptchaToken } = ctx.request.body ?? {};
    if (!phone || typeof phone !== 'string') {
      return ctx.badRequest('phone is required');
    }

    if (recaptchaToken) {
      const valid = await verifyRecaptcha(recaptchaToken);
      if (!valid) return ctx.badRequest('reCAPTCHA verification failed');
    }

    try {
      await sendOtp(phone);
      ctx.body = { ok: true };
    } catch (err: any) {
      strapi.log.error('OTP send error:', err);
      return ctx.badRequest('Failed to send OTP');
    }
  },

  async verify(ctx: any) {
    const { phone, otp } = ctx.request.body ?? {};
    if (!phone || !otp) return ctx.badRequest('phone and otp are required');

    const valid = await verifyOtp(phone, otp);
    if (!valid) return ctx.badRequest('Invalid or expired OTP');

    const user = await findUserByPhone(phone);
    if (!user) return ctx.badRequest('No account found with this phone number');

    const jwt = issueJwt(user);
    ctx.body = {
      jwt,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        subscriptionStatus: user.subscriptionStatus ?? 'free',
      },
    };
  },

  async register(ctx: any) {
    const { phone, username, otp, recaptchaToken } = ctx.request.body ?? {};
    if (!phone || !username || !otp) {
      return ctx.badRequest('phone, username, and otp are required');
    }

    if (recaptchaToken) {
      const valid = await verifyRecaptcha(recaptchaToken);
      if (!valid) return ctx.badRequest('reCAPTCHA verification failed');
    }

    const otpValid = await verifyOtp(phone, otp);
    if (!otpValid) return ctx.badRequest('Invalid or expired OTP');

    const existingPhone = await findUserByPhone(phone);
    if (existingPhone) return ctx.badRequest('Phone number already registered');

    const existingUsername = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { username },
    });
    if (existingUsername) return ctx.badRequest('Username already taken');

    const role = await getAuthenticatedRole();
    const randomPassword = require('crypto').randomBytes(32).toString('hex');

    const user = await strapi.db.query('plugin::users-permissions.user').create({
      data: {
        username,
        phone,
        email: `${phone.replace(/\+/g, '')}@phone.local`,
        password: await bcrypt.hash(randomPassword, 10),
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: role.id,
        subscriptionStatus: 'free',
      },
    });

    const jwt = issueJwt(user);
    ctx.body = {
      jwt,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        subscriptionStatus: user.subscriptionStatus ?? 'free',
      },
    };
  },
};
