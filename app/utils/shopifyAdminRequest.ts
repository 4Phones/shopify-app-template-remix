export async function shopifyAdminRequest(endpoint: string, token: string, query: string, variables: any) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    });
  
    const jsonRes = await res.json();
    if (jsonRes.errors) throw new Error(JSON.stringify(jsonRes.errors));
    return jsonRes.data;
  }
  