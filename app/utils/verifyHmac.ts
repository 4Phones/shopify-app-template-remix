import crypto from 'crypto';

export function verifyHmac(params: Record<string, string>, secret: string) {
  const { signature, ...rest } = params;

  const sortedParams = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join('');

  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(sortedParams)
    .digest('hex');

  return computedSignature === signature;
}
