import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to check if user is super admin
const superAdminMiddleware = asyncHandler(async (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== 'super_admin') {
    throw createError('Unauthorized: Super admin access required', 403);
  }
  next();
});

router.use(authMiddleware, superAdminMiddleware);

// GET /api/admin/tenants - List all tenants
router.get('/tenants', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw createError(error.message, 500);
  res.json(data);
}));

// POST /api/admin/tenants - Create new tenant
router.post('/tenants', asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, settings, niche, niches, domain, modules } = req.body;

  if (!name || !slug) {
    throw createError('Tenant name and slug are required', 400);
  }

  // Validate niche if provided
  const validNiches = ['ecommerce', 'events', 'launchpad', 'static'];
  if (niche && !validNiches.includes(niche)) {
    throw createError('Invalid niche type', 400);
  }

  // Default modules based on niche if not provided
  const defaultModules: Record<string, string[]> = {
    ecommerce: ['products', 'orders', 'customers', 'inventory'],
    events: ['events', 'tickets', 'attendees', 'speakers'],
    launchpad: ['pages', 'waitlist', 'campaigns'],
    static: ['pages', 'blog', 'media', 'forms'],
  };

  const tenantModules = modules || (niche ? defaultModules[niche] : defaultModules.static);

  // Create tenant
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .insert({
      name,
      slug,
      domain: domain || null,
      niche: niche || 'static',
      niches: niches || [],
      settings: {
        ...settings,
        modules: tenantModules,
        features: {
          ...settings?.features,
          enabledModules: tenantModules,
        }
      },
    })
    .select()
    .single();

  if (error) throw createError(error.message, 500);

  // Create tenant_modules entries for each module
  const moduleInserts = tenantModules.map((moduleName: string) => ({
    tenant_id: data.id,
    module_name: moduleName,
    is_enabled: true,
    settings: {},
  }));

  const { error: modulesError } = await supabaseAdmin
    .from('tenant_modules')
    .insert(moduleInserts);

  if (modulesError) {
    console.error('Failed to create tenant modules:', modulesError);
    // Don't fail the tenant creation if modules insertion fails
  }

  res.status(201).json({
    ...data,
    modules: tenantModules,
  });
}));

// GET /api/admin/users - List all users
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, tenant_id, created_at')
    .order('created_at', { ascending: false });

  if (error) throw createError(error.message, 500);
  res.json(data);
}));

// POST /api/admin/users/:userId/assign-tenant - Assign user to tenant
router.post('/users/:userId/assign-tenant', asyncHandler(async (req: Request, res: Response) => {
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

  if (error) throw createError('Failed to assign tenant', 500);
  res.json(data);
}));

// PATCH /api/admin/users/:userId/role - Update user role
router.patch('/users/:userId/role', asyncHandler(async (req: Request, res: Response) => {
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

  if (error) throw createError('Failed to update role', 500);
  res.json(data);
}));

// DELETE /api/admin/tenants/:tenantId - Delete tenant
router.delete('/tenants/:tenantId', asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = req.params;

  const { error } = await supabaseAdmin
    .from('tenants')
    .delete()
    .eq('id', tenantId);

  if (error) throw createError('Failed to delete tenant', 500);
  res.status(204).send();
}));

// GET /api/admin/tenants/:tenantId/modules - Get modules for a tenant
router.get('/tenants/:tenantId/modules', asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('tenant_modules')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_enabled', true)
    .order('module_name');

  if (error) throw createError(error.message, 500);
  res.json(data);
}));

// PATCH /api/admin/tenants/:tenantId/modules/:moduleName - Toggle module
router.patch('/tenants/:tenantId/modules/:moduleName', asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, moduleName } = req.params;
  const { is_enabled, settings } = req.body;

  const updateData: any = {};
  if (typeof is_enabled === 'boolean') updateData.is_enabled = is_enabled;
  if (settings) updateData.settings = settings;

  const { data, error } = await supabaseAdmin
    .from('tenant_modules')
    .update(updateData)
    .eq('tenant_id', tenantId)
    .eq('module_name', moduleName)
    .select()
    .single();

  if (error) throw createError(error.message, 500);
  res.json(data);
}));

export default router;
