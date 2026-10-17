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
    const { items, returnUrl, customerEmail, testMode } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty. Please add an item.' });
    }

    const totalQty = items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
    const unitPriceCents = 3800;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost:3000';
    const baseUrl = returnUrl || `${protocol}://${host}`;

    // If Stripe is not configured or client requested test mode
    if (!isStripeConfigured || !stripeClient || testMode) {
      const orderId = `SR-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const testSessionId = `test_session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      return res.status(200).json({
        success: true,
        sessionId: testSessionId,
        checkoutUrl: `${baseUrl}/?order-confirmation=true&session_id=${testSessionId}`,
        orderId,
        isTestMode: true,
      });
    }

    // Stripe checkout session creation
    const orderId = `SR-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The Double-Layer Travel Organizer',
              description: 'Dual-tier travel organizer for undergarments, delicates, and travel essentials. Variant: Double Layer Black.',
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
  } catch (err: any) {
    console.error('Vercel serverless checkout error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
