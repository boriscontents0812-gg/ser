/**
 * Shopify Storefront API Client
 * Connects the Serein storefront directly to Shopify Storefront API
 * for live products, pricing, inventory, and official hosted checkout.
 */

export interface ShopifyConfig {
  domain: string;
  storefrontAccessToken: string;
  apiVersion: string;
  variantId?: string;
  productHandle?: string;
}

export const getShopifyConfig = (): ShopifyConfig => {
  const env: any = (import.meta as any).env || {};
  return {
    domain: (
      env.VITE_SHOPIFY_STORE_DOMAIN ||
      (typeof process !== 'undefined' ? process.env?.SHOPIFY_STORE_DOMAIN : '') ||
      ''
    )
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .trim(),
    storefrontAccessToken: (
      env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
      (typeof process !== 'undefined' ? process.env?.SHOPIFY_STOREFRONT_ACCESS_TOKEN : '') ||
      ''
    ).trim(),
    apiVersion: (
      env.VITE_SHOPIFY_API_VERSION ||
      (typeof process !== 'undefined' ? process.env?.SHOPIFY_API_VERSION : '') ||
      '2024-10'
    ).trim(),
    variantId: (
      env.VITE_SHOPIFY_VARIANT_ID ||
      (typeof process !== 'undefined' ? process.env?.SHOPIFY_VARIANT_ID : '') ||
      ''
    ).trim(),
    productHandle: (
      env.VITE_SHOPIFY_PRODUCT_HANDLE ||
      (typeof process !== 'undefined' ? process.env?.SHOPIFY_PRODUCT_HANDLE : '') ||
      'the-double-layer-travel-organizer'
    ).trim(),
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

/**
 * Format a raw variant ID (e.g. "51592955855122") into a valid Shopify Global ID
 */
export function formatShopifyVariantId(rawId: string): string {
  if (!rawId) return '';
  const trimmed = rawId.trim();
  if (trimmed.startsWith('gid://shopify/ProductVariant/')) return trimmed;
  // If pure numbers, convert to standard GID
  if (/^\d+$/.test(trimmed)) {
    return `gid://shopify/ProductVariant/${trimmed}`;
  }
  return trimmed;
}

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
export async function shopifyStorefrontQuery<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  const config = getShopifyConfig();

  if (!isShopifyConfigured()) {
    throw new Error(
      'Shopify Storefront API credentials are not configured. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.'
    );
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
 * Resolve a real product variant ID from explicit config or by querying the Shopify store
 * Never invents mock or placeholder IDs.
 */
export async function resolveShopifyVariantId(explicitVariantId?: string): Promise<string> {
  const config = getShopifyConfig();
  const candidate = explicitVariantId || config.variantId;

  if (candidate && !candidate.includes('placeholder')) {
    return formatShopifyVariantId(candidate);
  }

  // Auto-discover first available variant from real Shopify catalog
  const query = `
    query getCatalogVariants {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyStorefrontQuery(query);
  const products = data?.products?.edges || [];

  for (const p of products) {
    const variants = p.node?.variants?.edges || [];
    for (const v of variants) {
      if (v.node?.id) {
        return v.node.id;
      }
    }
  }

  throw new Error(
    'No product variant found in your Shopify store. Please ensure a product is published to the Storefront sales channel, or specify SHOPIFY_VARIANT_ID.'
  );
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
    console.warn('Could not fetch product from Shopify:', error);
    return null;
  }
}

/**
 * Create a real Shopify Cart and retrieve the official Shopify Checkout URL.
 * Automatically resolves merchandiseId if not provided.
 */
export async function createShopifyCheckout(
  lines: Array<{ merchandiseId?: string; quantity: number }>,
  buyerEmail?: string
): Promise<{ checkoutUrl: string; cartId: string }> {
  // Ensure lines have real merchandise IDs
  const resolvedLines = await Promise.all(
    lines.map(async (line) => {
      let merchId = line.merchandiseId;
      if (!merchId || merchId.includes('placeholder')) {
        merchId = await resolveShopifyVariantId();
      }
      return {
        merchandiseId: formatShopifyVariantId(merchId),
        quantity: Math.max(1, line.quantity),
      };
    })
  );

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
    lines: resolvedLines,
  };

  if (buyerEmail && buyerEmail.includes('@')) {
    input.buyerIdentity = {
      email: buyerEmail.trim(),
    };
  }

  const data = await shopifyStorefrontQuery(mutation, { input });

  if (data?.cartCreate?.userErrors?.length > 0) {
    const errorMsgs = data.cartCreate.userErrors.map((e: any) => e.message).join(', ');
    throw new Error(`Shopify Cart Error: ${errorMsgs}`);
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
