import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);

// GET /api/orders - List orders for tenant
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, limit = 20, offset = 0 } = req.query;
  
  let query = supabaseAdmin
    .from('orders')
    .select('*, users(full_name, email)')
    .eq('tenant_id', req.tenantId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) throw error;

  res.json({ data, count });
}));

// GET /api/orders/:id - Get order details
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*, users(full_name, email)')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (orderError || !order) {
    throw createError('Order not found', 404);
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  if (itemsError) throw itemsError;

  res.json({ ...order, items });
}));

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .select()
    .single();

  if (error) throw error;

  res.json(data);
}));

export default router;
