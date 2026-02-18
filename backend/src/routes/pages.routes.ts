import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = express.Router();

// Apply auth and tenant middleware to all routes
router.use(authMiddleware, tenantMiddleware);

// GET /api/pages - List all pages for tenant
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('pages')
    .select('*')
    .eq('tenant_id', req.tenantId)
    .order('created_at', { ascending: false });

  if (error) throw createError(error.message, 500);
  res.json(data);
}));

// GET /api/pages/:id - Get single page
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('pages')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (error) throw createError('Page not found', 404);
  res.json(data);
}));

// POST /api/pages - Create new page
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  console.log('[PagesAPI] POST /api/pages - Request received');
  console.log('[PagesAPI] Tenant ID:', req.tenantId);
  console.log('[PagesAPI] User:', req.user?.id);
  console.log('[PagesAPI] Request body:', req.body);
  
  const { name, slug, description, html, css, components, styles, status, meta_title, meta_description, favicon_url } = req.body;

  if (!name || !slug) {
    console.log('[PagesAPI] Validation failed: Name or slug missing');
    throw createError('Name and slug are required', 400);
  }

  console.log(`[PagesAPI] Creating page: ${name} (slug: ${slug}) for tenant: ${req.tenantId}`);

  const { data, error } = await supabaseAdmin
    .from('pages')
    .insert({
      tenant_id: req.tenantId,
      name,
      slug,
      description,
      html,
      css,
      components: components || [],
      styles: styles || [],
      status: status || 'draft',
      meta_title,
      meta_description,
      favicon_url,
      created_by: req.user?.id,
      updated_by: req.user?.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw createError('Page with this slug already exists', 409);
    }
    throw createError(error.message, 500);
  }

  res.status(201).json(data);
}));

// PUT /api/pages/:id - Update page
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  console.log('[PagesAPI] PUT /api/pages/:id - Request received');
  console.log('[PagesAPI] Page ID:', req.params.id);
  console.log('[PagesAPI] Tenant ID:', req.tenantId);
  console.log('[PagesAPI] Request body:', req.body);
  
  const { id } = req.params;
  const { name, slug, description, html, css, components, styles, status, meta_title, meta_description, favicon_url, is_homepage } = req.body;

  const { data, error } = await supabaseAdmin
    .from('pages')
    .update({
      name,
      slug,
      description,
      html,
      css,
      components,
      styles,
      status,
      meta_title,
      meta_description,
      favicon_url,
      is_homepage,
      updated_by: req.user?.id,
    })
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .select()
    .single();

  if (error) throw createError('Failed to update page', 500);
  res.json(data);
}));

// DELETE /api/pages/:id - Delete page
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('pages')
    .delete()
    .eq('id', id)
    .eq('tenant_id', req.tenantId);

  if (error) throw createError('Failed to delete page', 500);
  res.status(204).send();
}));

// POST /api/pages/:id/publish - Publish page
router.post('/:id/publish', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('pages')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_by: req.user?.id,
    })
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .select()
    .single();

  if (error) throw createError('Failed to publish page', 500);
  res.json(data);
}));

export default router;
