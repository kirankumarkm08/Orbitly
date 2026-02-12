import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';

const router = express.Router();

// No auth middleware — these are public endpoints

// GET /api/public/pages/homepage — Get the published homepage for a tenant
router.get('/pages/homepage', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string || req.query.tenant_id as string;

  if (!tenantId) {
    throw createError('Tenant ID is required (x-tenant-id header or tenant_id query param)', 400);
  }

  const { data, error } = await supabaseAdmin
    .from('pages')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'published')
    .eq('is_homepage', true)
    .single();

  if (error || !data) {
    throw createError('No published homepage found', 404);
  }

  res.json(data);
}));

// GET /api/public/pages/:slug — Get a published page by slug
router.get('/pages/:slug', asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const tenantId = req.headers['x-tenant-id'] as string || req.query.tenant_id as string;

  if (!tenantId) {
    throw createError('Tenant ID is required (x-tenant-id header or tenant_id query param)', 400);
  }

  const { data, error } = await supabaseAdmin
    .from('pages')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    throw createError('Page not found', 404);
  }

  res.json(data);
}));

export default router;
