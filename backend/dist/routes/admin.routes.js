import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();
// Middleware to check if user is super admin
const superAdminMiddleware = asyncHandler(async (req, res, next) => {
    // If req.user already has the role (from authMiddleware fallback), use it
    if (req.user?.role === 'super_admin') {
        return next();
    }
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', req.user?.id)
        .single();
    if (error || !user || user.role !== 'super_admin') {
        throw createError('Unauthorized: Super admin access required', 403);
    }
    next();
});
router.use(authMiddleware, superAdminMiddleware);
// GET /api/admin/tenants - List all tenants
router.get('/tenants', asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
    if (error)
        throw createError(error.message, 500);
    res.json(data);
}));
// POST /api/admin/tenants - Create new tenant
router.post('/tenants', asyncHandler(async (req, res) => {
    const { name, slug, settings } = req.body;
    if (!name || !slug) {
        throw createError('Tenant name and slug are required', 400);
    }
    const { data, error } = await supabaseAdmin
        .from('tenants')
        .insert({
        name,
        slug,
        settings: settings || {},
    })
        .select()
        .single();
    if (error)
        throw createError(error.message, 500);
    res.status(201).json(data);
}));
// GET /api/admin/users - List all users
router.get('/users', asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, email, full_name, role, tenant_id, created_at')
        .order('created_at', { ascending: false });
    if (error)
        throw createError(error.message, 500);
    res.json(data);
}));
// POST /api/admin/users/:userId/assign-tenant - Assign user to tenant
router.post('/users/:userId/assign-tenant', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { tenant_id } = req.body;
    if (!tenant_id) {
        throw createError('Tenant ID is required', 400);
    }
    // Verify tenant exists
    const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('id', tenant_id)
        .single();
    if (!tenant) {
        throw createError('Tenant not found', 404);
    }
    const { data, error } = await supabaseAdmin
        .from('users')
        .update({ tenant_id })
        .eq('id', userId)
        .select()
        .single();
    if (error)
        throw createError('Failed to assign tenant', 500);
    res.json(data);
}));
// PATCH /api/admin/users/:userId/role - Update user role
router.patch('/users/:userId/role', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const validRoles = ['user', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
        throw createError('Invalid role', 400);
    }
    const { data, error } = await supabaseAdmin
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
    if (error)
        throw createError('Failed to update role', 500);
    res.json(data);
}));
// DELETE /api/admin/tenants/:tenantId - Delete tenant
router.delete('/tenants/:tenantId', asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const { error } = await supabaseAdmin
        .from('tenants')
        .delete()
        .eq('id', tenantId);
    if (error)
        throw createError('Failed to delete tenant', 500);
    res.status(204).send();
}));
export default router;
//# sourceMappingURL=admin.routes.js.map