import Twilio from 'twilio';

let client: ReturnType<typeof Twilio> | null = null;

function getClient() {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) throw new Error('Twilio credentials not configured');
    client = Twilio(sid, token);
  }
  return client;
}

function getVerifyServiceSid(): string {
  const sid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!sid) throw new Error('TWILIO_VERIFY_SERVICE_SID not configured');
  return sid;
}

export async function sendOtp(phone: string): Promise<void> {
  const tw = getClient();
  await tw.verify.v2.services(getVerifyServiceSid()).verifications.create({
    to: phone,
    channel: 'sms',
  });
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const tw = getClient();
  const check = await tw.verify.v2.services(getVerifyServiceSid()).verificationChecks.create({
    to: phone,
    code,
  });
  return check.status === 'approved';
}
