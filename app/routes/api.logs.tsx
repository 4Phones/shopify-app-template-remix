// app/routes/api.logs.tsx

import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { getLogs } from '~/utils/logCache';

export const loader: LoaderFunction = async () => {
  return json({ logs: getLogs() });
};
