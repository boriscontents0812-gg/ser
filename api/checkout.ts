import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const isStripeConfigured = Boolean(stripeSecretKey && !stripeSecretKey.includes('placeholder'));

let stripeClient: Stripe | null = null;
if (isStripeConfigured) {
  try {
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia' as any,
    });
  } catch (e) {
    console.error('Stripe client initialization failed:', e);
  }
}

function formatVariantGid(rawId: string): string {
  if (!rawId) return '';
  const trimmed = rawId.trim();
  if (trimmed.startsWith('gid://shopify/ProductVariant/')) return trimmed;
  if (/^\d+$/.test(trimmed)) {
    return `gid://shopify/ProductVariant/${trimmed}`;
  }
  return trimmed;
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { items, returnUrl, customerEmail, variantId: requestedVariantId } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty. Please add an item.' });
    }

    const totalQty = items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost:3000';
    const baseUrl = returnUrl || `${protocol}://${host}`;

    // 1. Shopify Storefront API Integration (Primary Commerce Engine)
    const rawShopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.VITE_SHOPIFY_STORE_DOMAIN || '';
    const rawShopifyAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
    const shopifyDomain = rawShopifyDomain.replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
    const shopifyAccessToken = rawShopifyAccessToken.trim();
    const shopifyApiVersion = process.env.SHOPIFY_API_VERSION || '2024-10';

    const isShopifyConfigured = Boolean(
      shopifyDomain &&
      !shopifyDomain.includes('placeholder') &&
      shopifyAccessToken &&
      !shopifyAccessToken.includes('placeholder')
    );

    if (isShopifyConfigured) {
      let resolvedVariantId = requestedVariantId || process.env.SHOPIFY_VARIANT_ID || process.env.VITE_SHOPIFY_VARIANT_ID;

      // Auto-discover product variant ID from Shopify Storefront API if not explicitly supplied
      if (!resolvedVariantId || resolvedVariantId.includes('placeholder')) {
        try {
          const catalogResponse = await fetch(`https://${shopifyDomain}/api/${shopifyApiVersion}/graphql.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': shopifyAccessToken,
            },
            body: JSON.stringify({
              query: `{
                products(first: 5) {
                  edges {
                    node {
                      id
                      title
                      variants(first: 1) {
                        edges {
                          node {
                            id
                            availableForSale
                          }
                        }
                      }
                    }
                  }
                }
              }`,
            }),
          });

          if (catalogResponse.ok) {
            const catalogJson = await catalogResponse.json();
            const edges = catalogJson?.data?.products?.edges || [];
            for (const edge of edges) {
              const variant = edge?.node?.variants?.edges?.[0]?.node;
              if (variant?.id) {
                resolvedVariantId = variant.id;
                break;
              }
            }
          }
        } catch (autoErr) {
          console.warn('Could not auto-fetch variant from Shopify:', autoErr);
        }
      }

      // If still missing, return a clear, honest error - NEVER invent fake IDs
      if (!resolvedVariantId || resolvedVariantId.includes('placeholder')) {
        return res.status(400).json({
          success: false,
          error: 'No product variant found in your Shopify store. Please set SHOPIFY_VARIANT_ID in Vercel environment variables or ensure products are published.',
        });
      }

      const formattedVariantGid = formatVariantGid(resolvedVariantId);

      // Create official Shopify Cart via GraphQL
      let checkoutUrl: string | null = null;
      let cartId: string | null = null;

      try {
        const cartResponse = await fetch(`https://${shopifyDomain}/api/${shopifyApiVersion}/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': shopifyAccessToken,
          },
          body: JSON.stringify({
            query: `
              mutation cartCreate($input: CartInput!) {
                cartCreate(input: $input) {
                  cart {
                    id
                    checkoutUrl
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
            `,
            variables: {
              input: {
                lines: items.map((i: any) => ({
                  merchandiseId: formattedVariantGid,
                  quantity: Math.max(1, i.quantity || 1),
                })),
                buyerIdentity: customerEmail && customerEmail.includes('@') ? { email: customerEmail.trim() } : undefined,
              },
            },
          }),
        });

        if (cartResponse.ok) {
          const cartJson = await cartResponse.json();
          if (cartJson?.data?.cartCreate?.cart?.checkoutUrl) {
            checkoutUrl = cartJson.data.cartCreate.cart.checkoutUrl;
            cartId = cartJson.data.cartCreate.cart.id;
          }
        }
      } catch (gqlErr) {
        console.warn('Shopify Storefront GraphQL cartCreate failed, checking permalink:', gqlErr);
      }

      // If GraphQL cart was created, return it
      if (checkoutUrl) {
        return res.status(200).json({
          success: true,
          checkoutUrl,
          cartId,
          isShopify: true,
        });
      }

      // Otherwise, construct the official Shopify Cart checkout permalink
      const rawNumericId = formattedVariantGid.replace(/^gid:\/\/shopify\/ProductVariant\//, '').trim();
      if (rawNumericId && /^\d+$/.test(rawNumericId)) {
        const queryParams = new URLSearchParams();
        if (customerEmail && customerEmail.includes('@')) {
          queryParams.set('checkout[email]', customerEmail.trim());
        }
        if (req.body.shippingDetails) {
          const s = req.body.shippingDetails;
          if (s.fullName) {
            const parts = s.fullName.trim().split(' ');
            queryParams.set('checkout[shipping_address][first_name]', parts[0] || '');
            queryParams.set('checkout[shipping_address][last_name]', parts.slice(1).join(' ') || '');
          }
          if (s.address) queryParams.set('checkout[shipping_address][address1]', s.address);
          if (s.city) queryParams.set('checkout[shipping_address][city]', s.city);
          if (s.state) queryParams.set('checkout[shipping_address][province]', s.state);
          if (s.postalCode) queryParams.set('checkout[shipping_address][zip]', s.postalCode);
          if (s.country) queryParams.set('checkout[shipping_address][country]', s.country);
        }

        const permalink = `https://${shopifyDomain}/cart/${rawNumericId}:${totalQty}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return res.status(200).json({
          success: true,
          checkoutUrl: permalink,
          isShopify: true,
        });
      }
    }

    // Direct fallback if SHOPIFY_STORE_DOMAIN is set and variant ID is provided
    if (shopifyDomain && !shopifyDomain.includes('placeholder')) {
      const explicitVariant = requestedVariantId || process.env.SHOPIFY_VARIANT_ID || process.env.VITE_SHOPIFY_VARIANT_ID;
      const rawNumericId = (explicitVariant || '').replace(/^gid:\/\/shopify\/ProductVariant\//, '').trim();
      if (rawNumericId && /^\d+$/.test(rawNumericId)) {
        const queryParams = new URLSearchParams();
        if (customerEmail && customerEmail.includes('@')) {
          queryParams.set('checkout[email]', customerEmail.trim());
        }
        const permalink = `https://${shopifyDomain}/cart/${rawNumericId}:${totalQty}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return res.status(200).json({
          success: true,
          checkoutUrl: permalink,
          isShopify: true,
        });
      }
    }

    // 2. Stripe Checkout (Secondary provider if explicitly configured)
    if (isStripeConfigured && stripeClient) {
      const unitPriceCents = Math.round(parseFloat(process.env.STORE_RETAIL_PRICE || '38.00') * 100);
      const orderId = `SR-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'The Double-Layer Travel Organizer',
                description: 'Dual-tier travel organizer for undergarments, delicates, and travel essentials.',
                images: [`${baseUrl}/images/product-organizer-black.png`],
              },
              unit_amount: unitPriceCents,
            },
            quantity: totalQty,
          },
        ],
        mode: 'payment',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR'],
        },
        success_url: `${baseUrl}/?order-confirmation=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/?canceled=true`,
        customer_email: customerEmail || undefined,
        metadata: {
          orderId,
          quantity: totalQty.toString(),
        },
      });

      return res.status(200).json({
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url,
        orderId,
      });
    }

    // 3. Neither Shopify nor Stripe is configured: Return honest configuration error
    // (Never invent mock orders, fake sessions, or fake payments)
    return res.status(503).json({
      success: false,
      error:
        'Shopify checkout is not yet configured. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in Vercel Project Settings > Environment Variables.',
    });
  } catch (err: any) {
    console.error('Checkout API error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
