import express from 'express';
import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = express.Router();

// Public: Submit form (no auth required)
router.post('/:id/submit', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, ip_address, user_agent, referrer } = req.body;

  // Get form to verify it exists and is active
  const { data: form, error: formError } = await supabaseAdmin
    .from('forms')
    .select('id, status, tenant_id')
    .eq('id', id)
    .single();

  if (formError || !form) {
    throw createError('Form not found', 404);
  }

  if (form.status !== 'active') {
    throw createError('Form is not accepting submissions', 400);
  }

  // Insert submission
  const { data: submission, error: submitError } = await supabaseAdmin
    .from('form_submissions')
    .insert({
      form_id: id,
      tenant_id: form.tenant_id,
      data,
      ip_address,
      user_agent,
      referrer,
    })
    .select()
    .single();

  if (submitError) throw createError(submitError.message, 500);

  // Increment submissions count
  await supabaseAdmin
    .from('forms')
    .update({ submissions_count: form.submissions_count + 1 })
    .eq('id', id);

  res.status(201).json({ message: 'Submission received', submission });
}));

// Protected routes (require auth)
router.use(authMiddleware, tenantMiddleware);

// GET /api/forms - List forms for tenant
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, search, limit = 50, offset = 0 } = req.query;

  let query = supabaseAdmin
    .from('forms')
    .select('*', { count: 'exact' })
    .eq('tenant_id', req.tenantId)
    .range(Number(offset), Number(offset) + Number(limit) - 1)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw createError(error.message, 500);
  res.json({ data, count });
}));

// GET /api/forms/:id - Get single form with submissions
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: form, error } = await supabaseAdmin
    .from('forms')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (error || !form) throw createError('Form not found', 404);
  res.json(form);
}));

// GET /api/forms/:id/submissions - Get form submissions
router.get('/:id/submissions', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  // Verify form belongs to tenant
  const { data: form } = await supabaseAdmin
    .from('forms')
    .select('id, tenant_id')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (!form) throw createError('Form not found', 404);

  const { data: submissions, error } = await supabaseAdmin
    .from('form_submissions')
    .select('*')
    .eq('form_id', id)
    .order('submitted_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) throw createError(error.message, 500);
  res.json(submissions || []);
}));

// POST /api/forms - Create new form
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { name, description, fields, settings, status } = req.body;

  if (!name) {
    throw createError('Name is required', 400);
  }

  const { data, error } = await supabaseAdmin
    .from('forms')
    .insert({
      tenant_id: req.tenantId,
      name,
      description,
      fields: fields || [],
      settings: settings || {},
      status: status || 'draft',
      created_by: req.user?.id,
    })
    .select()
    .single();

  if (error) throw createError(error.message, 500);
  res.status(201).json(data);
}));

// PUT /api/forms/:id - Update form
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, fields, settings, status } = req.body;

  const { data, error } = await supabaseAdmin
    .from('forms')
    .update({
      name,
      description,
      fields,
      settings,
      status,
    })
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .select()
    .single();

  if (error) throw createError('Failed to update form', 500);
  res.json(data);
}));

// DELETE /api/forms/:id - Delete form
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Delete submissions first
  await supabaseAdmin
    .from('form_submissions')
    .delete()
    .eq('form_id', id);

  const { error } = await supabaseAdmin
    .from('forms')
    .delete()
    .eq('id', id)
    .eq('tenant_id', req.tenantId);

  if (error) throw createError('Failed to delete form', 500);
  res.status(204).send();
}));

export default router;
