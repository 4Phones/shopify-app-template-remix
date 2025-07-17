import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { verifyHmac } from '~/utils/verifyHmac';
import { respondWithError } from '~/utils/respondWithError';
import { getCustomerDetails } from '~/controllers/customerController';
import { addLog } from '~/utils/logCache'; // <-- Add this

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const { signature, shop, logged_in_customer_id } = params;

  if (!signature || !shop) return respondWithError('Missing signature or shop', 400);
  if (!verifyHmac(params, process.env.SHOPIFY_API_SECRET!)) return respondWithError('Unauthorized', 401);
  if (!logged_in_customer_id) return respondWithError('No logged-in customer', 401);

  const adminApiEndpoint = `https://${shop}/admin/api/2024-07/graphql.json`;
  const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN!;
  const globalCustomerId = `gid://shopify/Customer/${logged_in_customer_id}`;

  try {
    addLog(`Incoming request: fetch details for ${logged_in_customer_id}`);

    const customer = await getCustomerDetails(adminApiEndpoint, adminToken, globalCustomerId);

    if (!customer) {
      addLog(`Customer ${logged_in_customer_id} not found`);
      return respondWithError('Customer not found', 404);
    }

    addLog(`Successfully fetched customer ${logged_in_customer_id}`);

    return json({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      company: customer.defaultAddress?.company,
    });
  } catch (err: any) {
    addLog(`Error fetching customer ${logged_in_customer_id}: ${err.message}`);
    console.error('❌ Error fetching customer data:', err.message);
    return respondWithError('Internal server error', 500);
  }
};
