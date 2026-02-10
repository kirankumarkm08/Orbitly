import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = express.Router();

// Apply auth and tenant middleware
router.use(authMiddleware, tenantMiddleware);

// GET /api/templates - List templates (own + public)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.query;

  let query = supabaseAdmin
    .from('page_templates')
    .select('*')
    .or(`tenant_id.eq.${req.tenantId},is_public.eq.true`)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category as string);
  }

  const { data, error } = await query;
  if (error) throw createError(error.message, 500);
  res.json(data);
}));

// GET /api/templates/:id - Get single template
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('page_templates')
    .select('*')
    .eq('id', id)
    .or(`tenant_id.eq.${req.tenantId},is_public.eq.true`)
    .single();

  if (error) throw createError('Template not found', 404);
  res.json(data);
}));

// POST /api/templates - Create new template
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const {
    name, description, thumbnail_url, html, css,
    components, styles, category
  } = req.body;

  if (!name) {
    throw createError('Name is required', 400);
  }

  const { data, error } = await supabaseAdmin
    .from('page_templates')
    .insert({
      tenant_id: req.tenantId,
      name,
      description,
      thumbnail_url,
      html,
      css,
      components: components || [],
      styles: styles || [],
      category,
      is_public: false,
    })
    .select()
    .single();

  if (error) throw createError(error.message, 500);
  res.status(201).json(data);
}));

// POST /api/templates/:id/duplicate - Duplicate a template to own tenant
router.post('/:id/duplicate', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  // Get original template
  const { data: original, error: findError } = await supabaseAdmin
    .from('page_templates')
    .select('*')
    .eq('id', id)
    .or(`tenant_id.eq.${req.tenantId},is_public.eq.true`)
    .single();

  if (findError || !original) throw createError('Template not found', 404);

  // Create duplicate
  const { data, error } = await supabaseAdmin
    .from('page_templates')
    .insert({
      tenant_id: req.tenantId,
      name: name || `${original.name} (Copy)`,
      description: original.description,
      thumbnail_url: original.thumbnail_url,
      html: original.html,
      css: original.css,
      components: original.components,
      styles: original.styles,
      category: original.category,
      is_public: false,
    })
    .select()
    .single();

  if (error) throw createError('Failed to duplicate template', 500);
  res.status(201).json(data);
}));

// DELETE /api/templates/:id - Delete own template
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('page_templates')
    .delete()
    .eq('id', id)
    .eq('tenant_id', req.tenantId);

  if (error) throw createError('Failed to delete template', 500);
  res.status(204).send();
}));

export default router;
