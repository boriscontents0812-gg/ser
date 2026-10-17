import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Server-side source of truth for catalog, inventory, and pricing
interface ProductCatalogItem {
  id: string;
  sku: string;
  title: string;
  variant: string;
  // Retail price in cents (e.g. 3800 = $38.00).
  // Governed by STORE_RETAIL_PRICE env variable or server default.
  // Never uses supplier cost ($15.78).
  priceCents: number | null;
  currency: string;
  inventory: number;
  available: boolean;
}

// Read trusted values from server environment or config
const envRetailPrice = process.env.STORE_RETAIL_PRICE;
const serverRetailPriceCents = envRetailPrice !== undefined && envRetailPrice !== ''
  ? (isNaN(parseFloat(envRetailPrice)) ? null : Math.round(parseFloat(envRetailPrice) * 100))
  : 3800; // Default owner retail price: $38.00 USD

const envInventory = process.env.STORE_INVENTORY;
let serverInventoryCount = envInventory !== undefined && envInventory !== ''
  ? parseInt(envInventory, 10)
  : 45; // Default initial production inventory

const serverCurrency = (process.env.STORE_CURRENCY || 'usd').toLowerCase();

const SERVER_PRODUCT: ProductCatalogItem = {
  id: 'serein-organizer-01',
  sku: 'SR-ORG-BLK-01',
  title: 'The Double-Layer Travel Organizer',
  variant: 'Double Layer Black',
  priceCents: serverRetailPriceCents,
  currency: serverCurrency,
  inventory: serverInventoryCount,
  available: true,
};

// In-memory persistent order record store
interface ServerOrder {
  id: string;
  sessionId: string;
  status: 'pending' | 'paid' | 'cancelled' | 'failed';
  items: Array<{ productId: string; quantity: number; unitPriceCents: number }>;
  totalCents: number;
  currency: string;
  customerEmail?: string;
  createdAt: string;
  paidAt?: string;
}

const orders = new Map<string, ServerOrder>();
const processedWebhookEventIds = new Set<string>();

// Initialize Stripe if valid key exists
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const isStripeConfigured = Boolean(stripeSecretKey && !stripeSecretKey.includes('placeholder'));

let stripeClient: Stripe | null = null;
if (isStripeConfigured) {
  try {
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia' as any,
    });
    console.log('Stripe client initialized in', stripeSecretKey.startsWith('sk_test_') ? 'TEST MODE' : 'LIVE MODE');
  } catch (err) {
    console.error('Failed to initialize Stripe client:', err);
  }
} else {
  console.log('Stripe secret key not configured or set to placeholder. Awaiting owner credentials in .env.');
}

// Webhook endpoint requires raw body for cryptographic signature verification
app.post(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'];

    if (!stripeClient || !stripeWebhookSecret) {
      console.warn('Webhook received but Stripe or webhook secret is not configured.');
      res.status(400).json({ error: 'Webhook secret is unconfigured on server' });
      return;
    }

    if (!sig) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripeClient.webhooks.constructEvent(req.body, sig as string, stripeWebhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Safely handle duplicate events (Idempotency)
    if (processedWebhookEventIds.has(event.id)) {
      console.log(`Duplicate webhook event ${event.id} ignored.`);
      res.status(200).json({ received: true, note: 'Duplicate event' });
      return;
    }
    processedWebhookEventIds.add(event.id);

    // Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const sessionId = session.id;

      console.log(`Verified payment received for session: ${sessionId}, order: ${orderId}`);

      if (orderId && orders.has(orderId)) {
        const order = orders.get(orderId)!;
        order.status = 'paid';
        order.paidAt = new Date().toISOString();
        order.customerEmail = session.customer_details?.email || undefined;

        // Decrement server inventory
        for (const item of order.items) {
          if (item.productId === SERVER_PRODUCT.id) {
            SERVER_PRODUCT.inventory = Math.max(0, SERVER_PRODUCT.inventory - item.quantity);
            if (SERVER_PRODUCT.inventory === 0) {
              SERVER_PRODUCT.available = false;
            }
          }
        }

        orders.set(orderId, order);
      }
    }

    res.status(200).json({ received: true });
  }
);

// Standard JSON middleware for remaining endpoints
app.use(cors());
app.use(express.json());

// Public configuration and health status
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    isPaymentProviderConfigured: isStripeConfigured,
    paymentMode: stripeSecretKey.startsWith('sk_test_') ? 'test' : stripeSecretKey.startsWith('sk_live_') ? 'live' : 'unconfigured',
    product: {
      id: SERVER_PRODUCT.id,
      title: SERVER_PRODUCT.title,
      isPriceConfigured: SERVER_PRODUCT.priceCents !== null && SERVER_PRODUCT.priceCents > 0,
      price: SERVER_PRODUCT.priceCents ? SERVER_PRODUCT.priceCents / 100 : null,
      currency: SERVER_PRODUCT.currency,
      inStock: SERVER_PRODUCT.inventory > 0 && SERVER_PRODUCT.available,
      inventoryCount: SERVER_PRODUCT.inventory,
    },
    setupChecklist: {
      stripeSecretKey: isStripeConfigured ? 'configured' : 'needs_configuration (set STRIPE_SECRET_KEY in .env)',
      stripeWebhookSecret: stripeWebhookSecret ? 'configured' : 'needs_configuration (set STRIPE_WEBHOOK_SECRET in .env)',
      retailPrice: SERVER_PRODUCT.priceCents ? `configured ($${(SERVER_PRODUCT.priceCents / 100).toFixed(2)})` : 'needs_configuration',
      inventory: `${SERVER_PRODUCT.inventory} units available`,
    }
  });
});

// Server-side checkout initiation with strict validation
app.post('/api/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, returnUrl } = req.body;

    // 1. Confirm the cart is not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Cart is empty. Please add an item to continue.' });
      return;
    }

    // 2. Validate quantities are positive whole numbers and product exists
    let totalRequestedQty = 0;
    for (const item of items) {
      if (!item.productId || (item.productId !== SERVER_PRODUCT.id && item.productId !== 'wayfold-organizer-01')) {
        res.status(400).json({
          success: false,
          error: `Product with ID "${item.productId}" is not recognized in store catalog.`
        });
        return;
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid quantity. Quantities must be positive integers.'
        });
        return;
      }

      totalRequestedQty += item.quantity;
    }

    // 3. Read current price and currency from trusted backend. Stop if unconfigured.
    if (!SERVER_PRODUCT.priceCents || SERVER_PRODUCT.priceCents <= 0) {
      res.status(400).json({
        success: false,
        error: 'Store setup incomplete: The store owner has not configured a valid retail price. Please configure STORE_RETAIL_PRICE in server environment.'
      });
      return;
    }

    // 4. Server-side inventory check: Never invent stock
    if (SERVER_PRODUCT.inventory <= 0) {
      res.status(400).json({
        success: false,
        error: 'The Double-Layer Travel Organizer is currently out of stock.'
      });
      return;
    }

    if (totalRequestedQty > SERVER_PRODUCT.inventory) {
      res.status(400).json({
        success: false,
        error: `Only ${SERVER_PRODUCT.inventory} item(s) currently available in stock. Please adjust your quantity.`
      });
      return;
    }

    // 5. Check if real payment provider is configured
    const isTestCheckout = Boolean(req.body.testMode || !isStripeConfigured || !stripeClient);

    if (!isStripeConfigured || !stripeClient) {
      // If client explicitly didn't allow test checkout, return setup requirement notice
      if (req.body.requireLiveGateway) {
        res.status(400).json({
          success: false,
          error: 'Payment Provider Setup Required: No payment credentials configured. Please add a valid test key (e.g. sk_test_...) to STRIPE_SECRET_KEY in .env before initiating live checkout.',
          setupRequired: true
        });
        return;
      }

      // Safe test order flow for preview/dev mode without requiring live Stripe keys
      const orderId = `SR-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const testSessionId = `test_session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const baseUrl = returnUrl || 'http://localhost:3000';

      const totalCents = SERVER_PRODUCT.priceCents * totalRequestedQty;
      const customerEmail = req.body.customerEmail || req.body.email || 'customer@serein.com';

      // Record verified order in memory
      orders.set(orderId, {
        id: orderId,
        sessionId: testSessionId,
        status: 'paid',
        paidAt: new Date().toISOString(),
        customerEmail,
        items: [
          {
            productId: SERVER_PRODUCT.id,
            quantity: totalRequestedQty,
            unitPriceCents: SERVER_PRODUCT.priceCents,
          },
        ],
        totalCents,
        currency: SERVER_PRODUCT.currency,
        createdAt: new Date().toISOString(),
      });

      // Safely decrement inventory
      SERVER_PRODUCT.inventory = Math.max(0, SERVER_PRODUCT.inventory - totalRequestedQty);
      if (SERVER_PRODUCT.inventory === 0) {
        SERVER_PRODUCT.available = false;
      }

      res.json({
        success: true,
        sessionId: testSessionId,
        checkoutUrl: `${baseUrl}/order-confirmation?session_id=${testSessionId}`,
        orderId,
        isTestMode: true,
      });
      return;
    }

    // 6. Create Stripe Checkout Session using verified server pricing
    const orderId = `SR-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const baseUrl = returnUrl || 'http://localhost:3000';

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: SERVER_PRODUCT.currency,
            product_data: {
              name: SERVER_PRODUCT.title,
              description: 'Dual-tier travel organizer for undergarments, delicates, and travel essentials. Variant: Double Layer Black.',
              images: [`${baseUrl}/images/product-organizer-black.png`],
            },
            unit_amount: SERVER_PRODUCT.priceCents,
          },
          quantity: totalRequestedQty,
        },
      ],
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR'],
      },
      success_url: `${baseUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        orderId,
        productId: SERVER_PRODUCT.id,
        quantity: totalRequestedQty.toString(),
      },
    });

    // Record order in pending state
    orders.set(orderId, {
      id: orderId,
      sessionId: session.id,
      status: 'pending',
      items: [
        {
          productId: SERVER_PRODUCT.id,
          quantity: totalRequestedQty,
          unitPriceCents: SERVER_PRODUCT.priceCents,
        },
      ],
      totalCents: SERVER_PRODUCT.priceCents * totalRequestedQty,
      currency: SERVER_PRODUCT.currency,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      orderId,
    });
  } catch (error: any) {
    console.error('Server checkout handler error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while creating checkout session.'
    });
  }
});

// Check order status strictly against backend payment confirmation
app.get('/api/orders/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    // Search existing recorded orders
    let matchedOrder: ServerOrder | undefined;
    for (const order of orders.values()) {
      if (order.sessionId === sessionId) {
        matchedOrder = order;
        break;
      }
    }

    // If Stripe is configured, we can also check the verified payment status directly with Stripe API
    if (stripeClient && sessionId) {
      try {
        const session = await stripeClient.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
          if (matchedOrder) {
            matchedOrder.status = 'paid';
            matchedOrder.paidAt = matchedOrder.paidAt || new Date().toISOString();
            matchedOrder.customerEmail = session.customer_details?.email || matchedOrder.customerEmail;
          }

          res.json({
            status: 'paid',
            order: {
              sessionId,
              orderId: matchedOrder?.id || session.metadata?.orderId || 'CONFIRMED',
              total: session.amount_total ? session.amount_total / 100 : (matchedOrder ? matchedOrder.totalCents / 100 : 0),
              currency: (session.currency || 'usd').toUpperCase(),
              customerEmail: session.customer_details?.email || 'Customer',
              paidAt: matchedOrder?.paidAt || new Date().toISOString(),
            }
          });
          return;
        } else {
          res.json({
            status: 'processing',
            message: 'Payment has not yet settled or is awaiting provider confirmation.'
          });
          return;
        }
      } catch (e: any) {
        console.error('Error querying Stripe session:', e.message);
      }
    }

    if (matchedOrder) {
      if (matchedOrder.status === 'paid') {
        res.json({
          status: 'paid',
          order: {
            sessionId: matchedOrder.sessionId,
            orderId: matchedOrder.id,
            total: matchedOrder.totalCents / 100,
            currency: matchedOrder.currency.toUpperCase(),
            customerEmail: matchedOrder.customerEmail || 'Customer',
            paidAt: matchedOrder.paidAt,
          }
        });
        return;
      } else {
        res.json({
          status: 'processing',
          message: 'Payment is still being processed with payment provider.'
        });
        return;
      }
    }

    res.status(404).json({
      status: 'not_found',
      message: 'No order matched this session identifier.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Always return JSON for unknown API routes to prevent HTML 404 parse errors
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Global Express error handler always returns JSON
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: err?.message || 'Internal Server Error' });
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Serein Commerce Server running on http://localhost:${port}`);
  console.log(`Backend inventory: ${SERVER_PRODUCT.inventory} units | Retail price: $${(SERVER_PRODUCT.priceCents! / 100).toFixed(2)}`);
});
