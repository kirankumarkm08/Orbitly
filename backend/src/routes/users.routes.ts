import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);

// GET /api/users - List all users for tenant
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { role, search, limit = 50, offset = 0 } = req.query;

  let query = supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .eq('tenant_id', req.tenantId)
    .range(Number(offset), Number(offset) + Number(limit) - 1)
    .order('created_at', { ascending: false });

  if (role && role !== 'all') {
    query = query.eq('role', role);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw createError(error.message, 500);
  res.json({ data, count });
}));

// GET /api/users/:id - Get single user
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (error || !data) throw createError('User not found', 404);
  res.json(data);
}));

// POST /api/users - Invite a new user (creates auth user and profile)
router.post('/invite', asyncHandler(async (req: Request, res: Response) => {
  const { email, full_name, role } = req.body;

  if (!email) {
    throw createError('Email is required', 400);
  }

  // Check if user already exists
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('email', email.toLowerCase())
    .eq('tenant_id', req.tenantId)
    .single();

  if (existingUser) {
    throw createError('User with this email already exists in this workspace', 400);
  }

  // Create auth user with invite
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    emailRedirectTo: `${process.env.CLIENT_URL}/auth/callback`,
    data: {
      full_name,
      tenant_id: req.tenantId,
      role: role || 'viewer',
    },
  });

  if (authError) {
    // If invite fails (user already exists in auth), try to create profile only
    if (authError.message.includes('already been registered')) {
      // Find the user in auth
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuthUser = authUsers?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (existingAuthUser) {
        // Create user profile linking to existing auth user
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('users')
          .insert({
            id: existingAuthUser.id,
            tenant_id: req.tenantId,
            email: email.toLowerCase(),
            full_name,
            role: role || 'viewer',
          })
          .select()
          .single();

        if (profileError) throw createError(profileError.message, 500);
        return res.status(201).json({ ...profile, invited: true });
      }
    }
    throw createError(authError.message, 500);
  }

  // Create user profile
  if (authUser?.user) {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        tenant_id: req.tenantId,
        email: email.toLowerCase(),
        full_name,
        role: role || 'viewer',
      })
      .select()
      .single();

    if (profileError) throw createError(profileError.message, 500);
    res.status(201).json({ ...profile, invited: true });
  } else {
    throw createError('Failed to create user', 500);
  }
}));

// PUT /api/users/:id - Update user
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { full_name, role, avatar_url } = req.body;

  // Check if user belongs to same tenant
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id, tenant_id')
    .eq('id', id)
    .single();

  if (!existingUser || existingUser.tenant_id !== req.tenantId) {
    throw createError('User not found', 404);
  }

  // Prevent removing own admin role
  if (req.user?.id === id && existingUser.role === 'owner') {
    throw createError('Cannot modify owner role', 400);
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      full_name,
      role,
      avatar_url,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw createError('Failed to update user', 500);
  res.json(data);
}));

// DELETE /api/users/:id - Remove user from tenant
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if user belongs to same tenant
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id, tenant_id, role')
    .eq('id', id)
    .single();

  if (!existingUser || existingUser.tenant_id !== req.tenantId) {
    throw createError('User not found', 404);
  }

  // Prevent removing owner
  if (existingUser.role === 'owner') {
    throw createError('Cannot remove the owner', 400);
  }

  // Prevent self-removal
  if (req.user?.id === id) {
    throw createError('Cannot remove yourself', 400);
  }

  // Remove from users table (soft delete - just remove tenant association)
  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', id)
    .eq('tenant_id', req.tenantId);

  if (error) throw createError('Failed to remove user', 500);
  res.status(204).send();
}));

export default router;
