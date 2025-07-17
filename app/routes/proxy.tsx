import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import crypto from 'crypto';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const { signature, shop, logged_in_customer_id } = params;

  if (!signature || !shop) {
    return json({ error: 'Missing signature or shop' }, { status: 400 });
  }

  // ✅ HMAC verification
  const sortedParams = Object.keys(params)
    .filter((key) => key !== 'signature')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('');

  const computedSignature = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
    .update(sortedParams)
    .digest('hex');

  if (computedSignature !== signature) {
    console.warn('⚠️ Signature mismatch', { computedSignature, signature });
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!logged_in_customer_id) {
    return json({ error: 'No logged-in customer' }, { status: 401 });
  }

  // ✅ All good — return secure response
  return json({
    message: `Hello ${logged_in_customer_id}, you are verified!`,
  });
};
