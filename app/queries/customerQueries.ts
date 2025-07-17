export const updateEmailMarketingQuery = `
  mutation customerEmailMarketingConsentUpdate($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer { id email emailMarketingConsent { marketingState } }
      userErrors { field message }
    }
  }
`;

export const metafieldSetQuery = `
  mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id namespace key value type }
      userErrors { field message }
    }
  }
`;

export const getCustomerQuery = `
  query getCustomer($id: ID!) {
    customer(id: $id) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        company
      }
    }
  }
`;