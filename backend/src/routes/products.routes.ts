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

// GET /api/products - List all products for tenant
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, category_id, limit = 50, offset = 0 } = req.query;

  let query = supabaseAdmin
    .from('products')
    .select('*, categories(name)', { count: 'exact' })
    .eq('tenant_id', req.tenantId)
    .range(Number(offset), Number(offset) + Number(limit) - 1)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (category_id) {
    query = query.eq('category_id', category_id);
  }

  const { data, error, count } = await query;

  if (error) throw createError(error.message, 500);
  res.json({ data, count });
}));

// POST /api/products - Create new product
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { 
    name, slug: providedSlug, description, price, compare_at_price, 
    cost_per_item, status, category_id, images, seo_meta, tags, variants 
  } = req.body;

  if (!name) {
    throw createError('Name is required', 400);
  }

  const baseSlug = providedSlug ? generateSlug(providedSlug) : generateSlug(name);
  const finalSlug = await ensureUniqueSlug('products', baseSlug, req.tenantId!);

  // Use a transaction-like approach (manual rollback if variants fail since Supabase JS doesn't support transactions directly in the same way)
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .insert({
      tenant_id: req.tenantId,
      name,
      slug: finalSlug,
      description,
      price: price || 0,
      compare_at_price,
      cost_per_item,
      status: status || 'draft',
      category_id,
      images: images || [],
      seo_meta: seo_meta || {},
      tags: tags || [],
    })
    .select()
    .single();

  if (productError) throw createError(productError.message, 500);

  // If variants provided, insert them
  if (variants && Array.isArray(variants) && variants.length > 0) {
    const variantsWithProductId = variants.map(v => ({
      ...v,
      product_id: product.id,
    }));

    const { error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .insert(variantsWithProductId);

    if (variantsError) {
      // Cleanup product if variants fail
      await supabaseAdmin.from('products').delete().eq('id', product.id);
      throw createError(`Failed to create variants: ${variantsError.message}`, 500);
    }
  }

  res.status(201).json(product);
}));

// GET /api/products/:id - Get single product with variants
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*)')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (productError) throw createError('Product not found', 404);
  res.json(product);
}));

// PUT /api/products/:id - Update product
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    name, slug: providedSlug, description, price, compare_at_price, 
    cost_per_item, status, category_id, images, seo_meta, tags 
  } = req.body;

  const updateData: any = {
    name,
    description,
    price,
    compare_at_price,
    cost_per_item,
    status,
    category_id,
    images,
    seo_meta,
    tags,
  };

  if (providedSlug) {
    const baseSlug = generateSlug(providedSlug);
    const { data: current } = await supabaseAdmin
      .from('products')
      .select('slug')
      .eq('id', id)
      .single();

    if (current && current.slug !== baseSlug) {
      updateData.slug = await ensureUniqueSlug('products', baseSlug, req.tenantId!);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updateData)
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .select()
    .single();

  if (error) throw createError('Failed to update product', 500);
  res.json(data);
}));

// DELETE /api/products/:id - Archive product (soft delete)
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .select()
    .single();

  if (error) throw createError('Failed to archive product', 500);
  res.json({ message: 'Product archived successfully', data });
}));

// --- Variant specific routes ---

// GET /api/products/:id/variants - List variants
router.get('/:id/variants', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verify product ownership
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (!product) throw createError('Product not found or unauthorized', 404);

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .select('*')
    .eq('product_id', id);

  if (error) throw createError(error.message, 500);
  res.json(data);
}));

// POST /api/products/:id/variants - Add variant
router.post('/:id/variants', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const variantData = req.body;

  // Verify product ownership
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (!product) throw createError('Product not found or unauthorized', 404);

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .insert({
      ...variantData,
      product_id: id,
    })
    .select()
    .single();

  if (error) throw createError(error.message, 500);
  res.status(201).json(data);
}));

// PUT /api/products/:id/variants/:variantId - Update variant
router.put('/:id/variants/:variantId', asyncHandler(async (req: Request, res: Response) => {
  const { id, variantId } = req.params;
  const variantData = req.body;

  // Verify product ownership
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (!product) throw createError('Product not found or unauthorized', 404);

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .update(variantData)
    .eq('id', variantId)
    .eq('product_id', id)
    .select()
    .single();

  if (error) throw createError('Failed to update variant', 500);
  res.json(data);
}));

// DELETE /api/products/:id/variants/:variantId - Delete variant
router.delete('/:id/variants/:variantId', asyncHandler(async (req: Request, res: Response) => {
  const { id, variantId } = req.params;

  // Verify product ownership
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (!product) throw createError('Product not found or unauthorized', 404);

  const { error } = await supabaseAdmin
    .from('product_variants')
    .delete()
    .eq('id', variantId)
    .eq('product_id', id);

  if (error) throw createError('Failed to delete variant', 500);
  res.status(204).send();
}));

export default router;
