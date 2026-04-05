const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    strapi.log.warn('RECAPTCHA_SECRET_KEY not set — skipping reCAPTCHA verification');
    return true;
  }

  const params = new URLSearchParams({ secret, response: token });
  const res = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();
  return data.success === true;
}
