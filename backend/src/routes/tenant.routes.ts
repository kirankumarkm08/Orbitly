import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';

const router = express.Router();

// GET /api/public/resolve-tenant?domain=demo.yourapp.com
router.get('/resolve-tenant', asyncHandler(async (req: Request, res: Response) => {
  const { domain } = req.query;

  if (!domain) {
    throw createError('Domain is required', 400);
  }

  // Look up tenant by domain
  const { data, error } = await supabaseAdmin
    .from('tenant_domains')
    .select('tenant_id, tenant:tenant_id(*)')
    .eq('domain', domain as string)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw createError('Tenant not found', 404);
  }

  res.json({
    tenant_id: data.tenant_id,
    tenant: data.tenant,
  });
}));

export default router;
