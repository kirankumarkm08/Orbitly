import express from 'express';
import type { Request, Response } from 'express';
import { stripe } from '../config/stripe.js';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = express.Router();

// Public webhook route (MUST be before any middleware that consumes raw body or auth)
router.post('/webhook', asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    throw createError('Missing Stripe signature or webhook secret', 400);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    throw createError(`Webhook Error: ${err.message}`, 400);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      
      // Update order status or create order in DB
      const { tenant_id, user_id } = session.metadata;
      
      console.log(`Payment confirmed for session ${session.id}, tenant ${tenant_id}`);
      
      const { error: orderError, data: order } = await supabaseAdmin
        .from('orders')
        .insert({
          tenant_id,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent,
          amount_total: session.amount_total / 100, // Stripe uses cents
          currency: session.currency,
          customer_email: session.customer_details?.email,
          payment_status: session.payment_status === 'paid' ? 'paid' : 'unpaid',
          status: session.payment_status === 'paid' ? 'paid' : 'pending',
          user_id: user_id || null,
          metadata: session.metadata
        })
        .select()
        .single();

      if (orderError) {
        console.error('Failed to create order record:', orderError);
        break;
      }

      // 2. Fetch line items from Stripe
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      // 3. Create order items
      const orderItems = lineItems.data.map((item: any) => ({
        order_id: order.id,
        product_id: item.price?.product as string, // This might need mapping if you store our product ID in Stripe metadata or similar
        quantity: item.quantity,
        price_at_purchase: item.amount_total / 100,
        product_name: item.description,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Failed to create order items:', itemsError);
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}));

// Protected routes
router.use(authMiddleware, tenantMiddleware);

// POST /api/stripe/checkout - Create checkout session
router.post('/checkout', asyncHandler(async (req: Request, res: Response) => {
  const { line_items, success_url, cancel_url, metadata } = req.body;

  if (!line_items || line_items.length === 0) {
    throw createError('Line items are required', 400);
  }

  // Fetch tenant's Stripe account ID if using Connect
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('stripe_account_id')
    .eq('id', req.tenantId)
    .single();

  const stripeAccountId = tenant?.stripe_account_id;

  const sessionParams: any = {
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: success_url || `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancel_url || `${process.env.CLIENT_URL}/checkout/cancel`,
    metadata: {
      ...metadata,
      tenant_id: req.tenantId,
      user_id: req.user?.id,
    },
  };

  // If tenant has a connected account, use destination charges
  if (stripeAccountId) {
    sessionParams.payment_intent_data = {
      application_fee_amount: Math.round(line_items.reduce((acc: number, item: any) => acc + (item.price_data.unit_amount * item.quantity), 0) * 0.05), // 5% fee example
      transfer_data: {
        destination: stripeAccountId,
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  res.json({ url: session.url, id: session.id });
}));

// POST /api/stripe/connect/onboarding - Start Stripe Connect onboarding
router.post('/connect/onboarding', asyncHandler(async (req: Request, res: Response) => {
  // 1. Create or get Stripe account ID for tenant
  let { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('stripe_account_id, name, email')
    .eq('id', req.tenantId)
    .single();

  let stripeAccountId = tenant?.stripe_account_id;

  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: 'standard',
      email: tenant?.email || req.user?.email,
      business_type: 'individual',
      metadata: { tenant_id: req.tenantId! },
    });
    stripeAccountId = account.id;

    // Save to tenant
    await supabaseAdmin
      .from('tenants')
      .update({ stripe_account_id: stripeAccountId })
      .eq('id', req.tenantId);
  }

  // 2. Create account link
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.CLIENT_URL}/admin/settings/payments?refresh=true`,
    return_url: `${process.env.CLIENT_URL}/admin/settings/payments?success=true`,
    type: 'account_onboarding',
  });

  res.json({ url: accountLink.url });
}));

// GET /api/stripe/connect/status - Check onboarding status
router.get('/connect/status', asyncHandler(async (req: Request, res: Response) => {
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('stripe_account_id')
    .eq('id', req.tenantId)
    .single();

  if (!tenant?.stripe_account_id) {
    return res.json({ connected: false });
  }

  const account = await stripe.accounts.retrieve(tenant.stripe_account_id);
  res.json({ 
    connected: account.details_submitted,
    id: account.id,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
  });
}));

// GET /api/stripe/summary - Get payment summary
router.get('/summary', asyncHandler(async (req: Request, res: Response) => {
  // Get tenant's Stripe Connect account
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('stripe_account_id')
    .eq('id', req.tenantId)
    .single();

  let stripeBalance = null;
  let stripePayouts = [];

  // If connected to Stripe, get real balance
  if (tenant?.stripe_account_id) {
    try {
      const balance = await stripe.balance.retrieve({
        stripeAccount: tenant.stripe_account_id,
      });
      stripeBalance = {
        available: balance.available.reduce((acc, b) => acc + b.amount, 0) / 100,
        pending: balance.pending.reduce((acc, b) => acc + b.amount, 0) / 100,
      };

      // Get recent payouts
      const payouts = await stripe.payouts.list(
        { limit: 10 },
        { stripeAccount: tenant.stripe_account_id }
      );
      stripePayouts = payouts.data.map(p => ({
        id: p.id,
        amount: p.amount / 100,
        status: p.status,
        created: p.created,
      }));
    } catch (e) {
      console.error('Failed to fetch Stripe data:', e);
    }
  }

  // Get orders summary from database
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('amount_total, payment_status, status, created_at')
    .eq('tenant_id', req.tenantId);

  const totalRevenue = orders
    ?.filter(o => o.payment_status === 'paid')
    .reduce((acc, o) => acc + Number(o.amount_total || 0), 0) || 0;

  const totalOrders = orders?.filter(o => o.payment_status === 'paid').length || 0;

  const successRate = orders?.length 
    ? ((orders.filter(o => o.payment_status === 'paid').length / orders.length) * 100).toFixed(1)
    : '0';

  // Get monthly revenue (last 12 months)
  const now = new Date();
  const monthlyRevenue = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthOrders = orders?.filter(o => {
      const orderDate = new Date(o.created_at);
      return o.payment_status === 'paid' && 
             orderDate >= monthStart && 
             orderDate <= monthEnd;
    }) || [];

    monthlyRevenue.push({
      month: monthStart.toLocaleString('default', { month: 'short' }),
      revenue: monthOrders.reduce((acc, o) => acc + Number(o.amount_total || 0), 0),
    });
  }

  // Get recent transactions
  const { data: recentOrders } = await supabaseAdmin
    .from('orders')
    .select('id, customer_email, amount_total, payment_status, status, created_at')
    .eq('tenant_id', req.tenantId)
    .order('created_at', { ascending: false })
    .limit(10);

  const transactions = (recentOrders || []).map(o => ({
    id: o.id,
    name: o.customer_email?.split('@')[0] || 'Unknown',
    avatar: o.customer_email?.[0]?.toUpperCase() || 'U',
    amount: Number(o.amount_total || 0),
    type: o.payment_status === 'paid' ? 'incoming' : 'outgoing',
    status: o.payment_status === 'paid' ? 'succeeded' : o.payment_status,
    method: 'Stripe',
    time: getRelativeTime(o.created_at),
  }));

  res.json({
    balance: stripeBalance || { available: totalRevenue, pending: 0 },
    totalRevenue,
    totalOrders,
    successRate: parseFloat(successRate),
    monthlyRevenue,
    transactions,
    stripePayouts,
    connected: !!tenant?.stripe_account_id,
  });
}));

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${diffDays} days ago`;
}

export default router;
