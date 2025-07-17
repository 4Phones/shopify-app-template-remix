import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { verifyHmac } from '~/utils/verifyHmac';
import { respondWithError } from '~/utils/respondWithError';
import { updateCustomerDetails } from '~/controllers/customerController';
import { addLog } from '~/utils/logCache';

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const { signature, shop, logged_in_customer_id } = params;

  if (!signature || !shop) return respondWithError('Missing signature or shop', 400);
  if (!verifyHmac(params, process.env.SHOPIFY_API_SECRET!)) return respondWithError('Unauthorized', 401);
  if (!logged_in_customer_id) return respondWithError('Unauthorized: missing logged_in_customer_id', 401);

  const adminApiEndpoint = `https://${shop}/admin/api/2024-07/graphql.json`;
  const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN!;
  const globalCustomerId = `gid://shopify/Customer/${logged_in_customer_id}`;

  const body = await request.json();

  try {
    addLog(`Incoming update request for customer ${logged_in_customer_id}`);

    const { updatedCount, results, userErrors } = await updateCustomerDetails(
      adminApiEndpoint, adminToken, globalCustomerId, body
    );

    if (updatedCount > 0) {
      results.forEach((res) => {
        addLog(`Updated: [${res.type}] ${res.key || ''} ${res.value || ''}`);
    });
    }

    if (userErrors.length > 0) {
      userErrors.forEach((err) => {
        addLog(`UserError: ${err}`);
      });
    }

    const summaryMsg = `Update completed for customer ${logged_in_customer_id}: ${updatedCount} updates${userErrors.length > 0 ? `, ${userErrors.length} warnings` : ''}`;
    addLog(`${summaryMsg}`);

    return json({
      success: true,
      updatedCount,
      updates: results,
      userErrors,
      message: summaryMsg,
    });
  } catch (err: any) {
    addLog(`Error in /customer/update for ${logged_in_customer_id}: ${err.message}`);
    console.error('Error in /customer/update:', err.message);
    return respondWithError('Internal server error', 500);
  }
};
