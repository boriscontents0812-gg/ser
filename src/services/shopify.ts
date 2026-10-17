/**
 * Shopify Storefront API Client
 * Enables connecting the Serein storefront directly to a live Shopify store
 * using Shopify as the single source of truth for pricing, inventory, and native checkout.
 */

export interface ShopifyConfig {
  domain: string;
  storefrontAccessToken: string;
  apiVersion?: string;
  productHandle?: string;
}

export const getShopifyConfig = (): ShopifyConfig => {
  const env: any = (import.meta as any).env || {};
  return {
    domain: (env.VITE_SHOPIFY_STORE_DOMAIN || (typeof process !== 'undefined' ? process.env?.SHOPIFY_STORE_DOMAIN : '') || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
    storefrontAccessToken: env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || (typeof process !== 'undefined' ? process.env?.SHOPIFY_STOREFRONT_ACCESS_TOKEN : '') || '',
    apiVersion: env.VITE_SHOPIFY_API_VERSION || (typeof process !== 'undefined' ? process.env?.SHOPIFY_API_VERSION : '') || '2024-10',
    productHandle: env.VITE_SHOPIFY_PRODUCT_HANDLE || (typeof process !== 'undefined' ? process.env?.SHOPIFY_PRODUCT_HANDLE : '') || 'the-double-layer-travel-organizer',
  };
};

export const isShopifyConfigured = (): boolean => {
  const config = getShopifyConfig();
  return Boolean(
    config.domain && 
    !config.domain.includes('placeholder') && 
    config.storefrontAccessToken && 
    !config.storefrontAccessToken.includes('placeholder')
  );
};

export interface ShopifyProductData {
  id: string;
  title: string;
  description: string;
  availableForSale: boolean;
  price: number;
  currencyCode: string;
  variantId: string;
  variantTitle: string;
  quantityAvailable?: number;
}

/**
 * Execute GraphQL queries against Shopify Storefront API
 */
export async function shopifyStorefrontQuery<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const config = getShopifyConfig();

  if (!isShopifyConfigured()) {
    throw new Error('Shopify Storefront API credentials are not configured in environment variables.');
  }

  const endpoint = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: HTTP ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e: any) => e.message).join(', '));
  }

  return json.data;
}

/**
 * Fetch product details from Shopify Storefront API
 */
export async function fetchShopifyProduct(handle?: string): Promise<ShopifyProductData | null> {
  const config = getShopifyConfig();
  const productHandle = handle || config.productHandle;

  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        description
        availableForSale
        variants(first: 5) {
          edges {
            node {
              id
              title
              availableForSale
              quantityAvailable
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyStorefrontQuery(query, { handle: productHandle });
    if (!data?.product) return null;

    const variant = data.product.variants.edges[0]?.node;
    if (!variant) return null;

    return {
      id: data.product.id,
      title: data.product.title,
      description: data.product.description,
      availableForSale: variant.availableForSale,
      price: parseFloat(variant.price.amount),
      currencyCode: variant.price.currencyCode,
      variantId: variant.id,
      variantTitle: variant.title,
      quantityAvailable: variant.quantityAvailable,
    };
  } catch (error) {
    console.error('Error fetching product from Shopify:', error);
    return null;
  }
}

/**
 * Create a Shopify Cart and retrieve the official Shopify Checkout URL
 */
export async function createShopifyCheckout(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  buyerEmail?: string
): Promise<{ checkoutUrl: string; cartId: string }> {
  const mutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input: any = {
    lines,
  };

  if (buyerEmail) {
    input.buyerIdentity = {
      email: buyerEmail,
    };
  }

  const data = await shopifyStorefrontQuery(mutation, { input });

  if (data?.cartCreate?.userErrors?.length > 0) {
    throw new Error(data.cartCreate.userErrors.map((e: any) => e.message).join(', '));
  }

  const cart = data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) {
    throw new Error('Shopify did not return a checkout URL for this cart.');
  }

  return {
    checkoutUrl: cart.checkoutUrl,
    cartId: cart.id,
  };
}
