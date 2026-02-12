import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';
const router = express.Router();
// Apply auth and tenant middleware
router.use(authMiddleware, tenantMiddleware);
// GET /api/speakers - List all speakers for tenant
router.get('/', asyncHandler(async (req, res) => {
    const { featured } = req.query;
    let query = supabaseAdmin
        .from('speakers')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('name');
    if (featured === 'true') {
        query = query.eq('is_featured', true);
    }
    const { data, error } = await query;
    if (error)
        throw createError(error.message, 500);
    res.json(data);
}));
// GET /api/speakers/:id - Get single speaker
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
        .from('speakers')
        .select(`
      *,
      event_speakers (
        *,
        event:events (id, name, slug, start_date)
      )
    `)
        .eq('id', id)
        .eq('tenant_id', req.tenantId)
        .single();
    if (error)
        throw createError('Speaker not found', 404);
    res.json(data);
}));
// POST /api/speakers - Create new speaker
router.post('/', asyncHandler(async (req, res) => {
    const { name, title, company, bio, short_bio, photo_url, email, phone, website, social_links, is_featured } = req.body;
    if (!name) {
        throw createError('Name is required', 400);
    }
    const { data, error } = await supabaseAdmin
        .from('speakers')
        .insert({
        tenant_id: req.tenantId,
        name,
        title,
        company,
        bio,
        short_bio,
        photo_url,
        email,
        phone,
        website,
        social_links: social_links || {},
        is_featured: is_featured || false,
    })
        .select()
        .single();
    if (error)
        throw createError(error.message, 500);
    res.status(201).json(data);
}));
// PUT /api/speakers/:id - Update speaker
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.tenant_id;
    delete updateData.created_at;
    const { data, error } = await supabaseAdmin
        .from('speakers')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', req.tenantId)
        .select()
        .single();
    if (error)
        throw createError('Failed to update speaker', 500);
    res.json(data);
}));
// DELETE /api/speakers/:id - Delete speaker
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin
        .from('speakers')
        .delete()
        .eq('id', id)
        .eq('tenant_id', req.tenantId);
    if (error)
        throw createError('Failed to delete speaker', 500);
    res.status(204).send();
}));
export default router;
//# sourceMappingURL=speakers.routes.js.map