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

      // Create official Shopify Cart
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

      if (!cartResponse.ok) {
        const errorText = await cartResponse.text();
        console.error('Shopify cartCreate HTTP error:', cartResponse.status, errorText);
        return res.status(502).json({
          success: false,
          error: `Shopify API returned HTTP ${cartResponse.status}. Please verify your SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.`,
        });
      }

      const cartJson = await cartResponse.json();

      if (cartJson?.data?.cartCreate?.userErrors?.length > 0) {
        const userErrors = cartJson.data.cartCreate.userErrors.map((e: any) => e.message).join(', ');
        return res.status(400).json({
          success: false,
          error: `Shopify Cart Error: ${userErrors}`,
        });
      }

      const checkoutUrl = cartJson?.data?.cartCreate?.cart?.checkoutUrl;
      const cartId = cartJson?.data?.cartCreate?.cart?.id;

      if (!checkoutUrl) {
        return res.status(502).json({
          success: false,
          error: 'Shopify did not return a checkout URL for this cart.',
        });
      }

      return res.status(200).json({
        success: true,
        checkoutUrl,
        cartId,
        isShopify: true,
      });
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
