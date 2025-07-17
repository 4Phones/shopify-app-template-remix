// app/routes/api.logs.clear.tsx

import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { clearLogs } from '~/utils/logCache';

export const action: ActionFunction = async () => {
  clearLogs();
  return json({ success: true });
};
