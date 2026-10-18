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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { sessionId } = req.query || {};

  if (!sessionId) {
    return res.status(400).json({ status: 'error', message: 'Missing sessionId parameter' });
  }

  // If Stripe session, retrieve payment verification directly from Stripe
  if (stripeClient && !sessionId.startsWith('test_session_') && !sessionId.startsWith('local_')) {
    try {
      const session = await stripeClient.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        return res.status(200).json({
          status: 'paid',
          order: {
            sessionId,
            orderId: session.metadata?.orderId || `SR-ORD-${sessionId.slice(-6).toUpperCase()}`,
            total: session.amount_total ? session.amount_total / 100 : 38.00,
            currency: (session.currency || 'usd').toUpperCase(),
            customerEmail: session.customer_details?.email || 'Customer',
            paidAt: new Date().toISOString(),
          },
        });
      } else {
        return res.status(200).json({
          status: 'processing',
          message: 'Payment is still settling with the gateway.',
        });
      }
    } catch (e: any) {
      console.warn('Stripe session query error:', e.message);
    }
  }

  // Do not fabricate fake order records for unverified sessions
  return res.status(404).json({
    status: 'not_found',
    message: 'No verified payment record found for this session.',
  });
}
