import { shopifyAdminRequest } from '~/utils/shopifyAdminRequest';
import { updateEmailMarketingQuery, metafieldSetQuery } from '~/queries/customerQueries';
import { getCustomerQuery } from '~/queries/customerQueries';

const allowedNamespaces = ['custom'];

export async function getCustomerDetails(adminApiEndpoint: string, adminToken: string, customerId: string) {
    const res = await shopifyAdminRequest(adminApiEndpoint, adminToken, getCustomerQuery, {
        id: customerId,
    });

    return res.customer;
}

export async function updateCustomerDetails(adminApiEndpoint: string, adminToken: string, customerId: string, input: any) {
  const results: any[] = [];
  const userErrors: string[] = [];
  let updatedCount = 0;

  const { acceptsMarketing, metafields } = input;

  if (typeof acceptsMarketing !== 'undefined') {
    const res = await shopifyAdminRequest(adminApiEndpoint, adminToken, updateEmailMarketingQuery, {
      input: {
        customerId,
        emailMarketingConsent: {
          marketingState: acceptsMarketing ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
          marketingOptInLevel: 'SINGLE_OPT_IN',
          consentUpdatedAt: new Date().toISOString(),
        },
      },
    });

    const updateRes = res.customerEmailMarketingConsentUpdate;
    if (updateRes.userErrors.length > 0) {
      userErrors.push(...updateRes.userErrors.map((e: any) => e.message));
    } else {
      results.push({
        type: 'email_marketing_consent_update',
        customerId: updateRes.customer.id,
        marketingState: updateRes.customer.emailMarketingConsent.marketingState,
      });
      updatedCount++;
    }
  }

  if (Array.isArray(metafields) && metafields.length > 0) {
    for (const metafield of metafields) {
      if (!allowedNamespaces.includes(metafield.namespace)) {
        userErrors.push(`Namespace ${metafield.namespace} is not allowed`);
        continue;
      }

      const res = await shopifyAdminRequest(adminApiEndpoint, adminToken, metafieldSetQuery, {
        metafields: [{
          ownerId: customerId,
          namespace: metafield.namespace,
          key: metafield.key,
          value: metafield.value,
          type: metafield.type,
        }],
      });

      const metaRes = res.metafieldsSet;
      if (metaRes.userErrors.length > 0) {
        userErrors.push(...metaRes.userErrors.map((e: any) => e.message));
      } else {
        const updatedMeta = metaRes.metafields[0];
        results.push({
          type: 'metafield_upsert',
          metafieldId: updatedMeta.id,
          namespace: updatedMeta.namespace,
          key: updatedMeta.key,
          value: updatedMeta.value,
        });
        updatedCount++;
      }
    }
  }

  return { updatedCount, results, userErrors };
}
