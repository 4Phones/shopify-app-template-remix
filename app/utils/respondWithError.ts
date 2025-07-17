import { json } from '@remix-run/node';

export function respondWithError(message: string, status = 400) {
  return json({ success: false, error: message }, { status });
}
