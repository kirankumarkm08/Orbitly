import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);

// GET /api/customers - List customers for tenant
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, search, limit = 50, offset = 0 } = req.query;

  let query = supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('tenant_id', req.tenantId)
    .range(Number(offset), Number(offset) + Number(limit) - 1)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw createError(error.message, 500);
  res.json({ data, count });
}));

// GET /api/customers/:id - Get single customer
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (error || !data) throw createError('Customer not found', 404);
  res.json(data);
}));

// POST /api/customers - Create new customer
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { email, full_name, phone, stripe_customer_id, status } = req.body;

  if (!email) {
    throw createError('Email is required', 400);
  }

  const { data, error } = await supabaseAdmin
    .from('customers')
    .insert({
      tenant_id: req.tenantId,
      email,
      full_name,
      phone,
      stripe_customer_id,
      status: status || 'lead',
    })
    .select()
    .single();

  if (error) throw createError(error.message, 500);
  res.status(201).json(data);
}));

// PUT /api/customers/:id - Update customer
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { full_name, phone, stripe_customer_id, status, metadata } = req.body;

  const { data, error } = await supabaseAdmin
    .from('customers')
    .update({
      full_name,
      phone,
      stripe_customer_id,
      status,
      metadata,
    })
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .select()
    .single();

  if (error) throw createError('Failed to update customer', 500);
  res.json(data);
}));

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('tenant_id', req.tenantId);

  if (error) throw createError('Failed to delete customer', 500);
  res.status(204).send();
}));

// POST /api/customers/sync - Sync customers from orders (aggregate from orders)
router.post('/sync', asyncHandler(async (req: Request, res: Response) => {
  // Get all unique customer emails from orders for this tenant
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('customer_email, amount_total, created_at')
    .eq('tenant_id', req.tenantId)
    .eq('payment_status', 'paid');

  if (ordersError) throw createError(ordersError.message, 500);

  // Group by email
  const customerMap = new Map();
  
  for (const order of orders || []) {
    const email = order.customer_email?.toLowerCase();
    if (!email) continue;

    if (!customerMap.has(email)) {
      customerMap.set(email, {
        tenant_id: req.tenantId,
        email,
        total_orders: 0,
        total_spent: 0,
        first_order_date: order.created_at,
        last_order_date: order.created_at,
      });
    }

    const customer = customerMap.get(email);
    customer.total_orders += 1;
    customer.total_spent += Number(order.amount_total || 0);
    if (new Date(order.created_at) > new Date(customer.last_order_date)) {
      customer.last_order_date = order.created_at;
    }
    if (new Date(order.created_at) < new Date(customer.first_order_date)) {
      customer.first_order_date = order.created_at;
    }
  }

  // Upsert customers
  const customersToUpsert = Array.from(customerMap.values());
  
  if (customersToUpsert.length > 0) {
    const { error: upsertError } = await supabaseAdmin
      .from('customers')
      .upsert(customersToUpsert, { onConflict: 'tenant_id,email' });

    if (upsertError) throw createError(upsertError.message, 500);
  }

  res.json({ message: `Synced ${customersToUpsert.length} customers` });
}));

export default router;
