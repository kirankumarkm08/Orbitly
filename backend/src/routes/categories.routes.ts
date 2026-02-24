import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';
import { generateSlug, ensureUniqueSlug } from '../utils/slug.js';

const router = express.Router();

// Apply auth and tenant middleware to all routes
router.use(authMiddleware, tenantMiddleware);

// GET /api/categories - List all categories for tenant
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('tenant_id', req.tenantId)
    .order('sort_order', { ascending: true });

  if (error) throw createError(error.message, 500);
  res.json(data);
}));

// POST /api/categories - Create new category
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { name, slug: providedSlug, description, parent_id, image_url, sort_order } = req.body;

  if (!name) {
    throw createError('Name is required', 400);
  }

  const baseSlug = providedSlug ? generateSlug(providedSlug) : generateSlug(name);
  const finalSlug = await ensureUniqueSlug('categories', baseSlug, req.tenantId!);

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      tenant_id: req.tenantId,
      name,
      slug: finalSlug,
      description,
      parent_id,
      image_url,
      sort_order: sort_order || 0,
    })
    .select()
    .single();

  if (error) throw createError(error.message, 500);
  res.status(201).json(data);
}));

// GET /api/categories/:id - Get single category
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (error) throw createError('Category not found', 404);
  res.json(data);
}));

// PUT /api/categories/:id - Update category
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug: providedSlug, description, parent_id, image_url, sort_order } = req.body;

  const updateData: any = {
    name,
    description,
    parent_id,
    image_url,
    sort_order,
  };

  if (providedSlug) {
    const baseSlug = generateSlug(providedSlug);
    // Only check uniqueness if the slug has changed
    const { data: current } = await supabaseAdmin
      .from('categories')
      .select('slug')
      .eq('id', id)
      .single();

    if (current && current.slug !== baseSlug) {
      updateData.slug = await ensureUniqueSlug('categories', baseSlug, req.tenantId!);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .select()
    .single();

  if (error) throw createError('Failed to update category', 500);
  res.json(data);
}));

// DELETE /api/categories/:id - Delete category
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if there are children
  const { count, error: countError } = await supabaseAdmin
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('parent_id', id);

  if (count && count > 0) {
    throw createError('Cannot delete category with subcategories', 400);
  }

  // Check if there are products
  const { count: productCount, error: productError } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  if (productCount && productCount > 0) {
    throw createError('Cannot delete category with linked products', 400);
  }

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('tenant_id', req.tenantId);

  if (error) throw createError('Failed to delete category', 500);
  res.status(204).send();
}));

export default router;
