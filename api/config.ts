export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  const isStripeConfigured = Boolean(stripeSecretKey && !stripeSecretKey.includes('placeholder'));

  return res.status(200).json({
    status: 'online',
    isPaymentProviderConfigured: isStripeConfigured,
    paymentMode: stripeSecretKey.startsWith('sk_test_') ? 'test' : stripeSecretKey.startsWith('sk_live_') ? 'live' : 'test_ready',
    product: {
      id: 'serein-organizer-01',
      title: 'The Double-Layer Travel Organizer',
      isPriceConfigured: true,
      price: 38.00,
      currency: 'usd',
      inStock: true,
      inventoryCount: 45,
    },
  });
}
