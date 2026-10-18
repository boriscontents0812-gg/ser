export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawShopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.VITE_SHOPIFY_STORE_DOMAIN || '';
  const rawShopifyAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
  const shopifyDomain = rawShopifyDomain.replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
  const shopifyAccessToken = rawShopifyAccessToken.trim();

  const isShopifyConfigured = Boolean(
    shopifyDomain &&
    !shopifyDomain.includes('placeholder') &&
    shopifyAccessToken &&
    !shopifyAccessToken.includes('placeholder')
  );

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  const isStripeConfigured = Boolean(stripeSecretKey && !stripeSecretKey.includes('placeholder'));

  return res.status(200).json({
    status: 'online',
    commerceEngine: isShopifyConfigured ? 'shopify' : isStripeConfigured ? 'stripe' : 'unconfigured',
    isShopifyConfigured,
    shopifyDomain: isShopifyConfigured ? shopifyDomain : null,
    isStripeConfigured,
    product: {
      id: 'serein-organizer-01',
      title: 'The Double-Layer Travel Organizer',
      isPriceConfigured: true,
      price: 38.0,
      currency: 'USD',
      inStock: true,
      inventoryCount: 45,
    },
  });
}
