import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { asyncHandler, createError } from '../middleware/error.middleware';
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// POST /api/registrations - Public registration (no auth required)
router.post('/', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const {
    event_id, name, email, phone, company, job_title,
    ticket_type, custom_fields
  } = req.body;

  if (!event_id || !name || !email) {
    throw createError('Event ID, name, and email are required', 400);
  }

  // Check if event exists and is accepting registrations
  const { data: event, error: eventError } = await supabaseAdmin
    .from('events')
    .select('id, registration_enabled, max_attendees, status')
    .eq('id', event_id)
    .eq('status', 'published')
    .single();

  if (eventError || !event) {
    throw createError('Event not found or not published', 404);
  }

  if (!event.registration_enabled) {
    throw createError('Registration is not enabled for this event', 400);
  }

  // Check for existing registration
  const { data: existing } = await supabaseAdmin
    .from('event_registrations')
    .select('id')
    .eq('event_id', event_id)
    .eq('email', email)
    .single();

  if (existing) {
    throw createError('This email is already registered for this event', 409);
  }

  // Check max attendees
  if (event.max_attendees) {
    const { count } = await supabaseAdmin
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event_id)
      .neq('status', 'cancelled');

    if (count && count >= event.max_attendees) {
      throw createError('Event has reached maximum capacity', 400);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('event_registrations')
    .insert({
      event_id,
      user_id: req.user?.id || null,
      name,
      email,
      phone,
      company,
      job_title,
      ticket_type: ticket_type || 'general',
      custom_fields: custom_fields || {},
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw createError('Failed to create registration', 500);
  res.status(201).json(data);
}));

// Protected routes for managing registrations
router.use(authMiddleware, tenantMiddleware);

// GET /api/registrations/event/:eventId - List registrations for event
router.get('/event/:eventId', asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { status } = req.query;

  // Verify event belongs to tenant
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('tenant_id', req.tenantId)
    .single();

  if (!event) {
    throw createError('Event not found', 404);
  }

  let query = supabaseAdmin
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: false });

  if (status) {
    query = query.eq('status', status as string);
  }

  const { data, error } = await query;
  if (error) throw createError(error.message, 500);
  res.json(data);
}));

// PUT /api/registrations/:id/status - Update registration status
router.put('/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'cancelled', 'attended'];
  if (!validStatuses.includes(status)) {
    throw createError('Invalid status', 400);
  }

  const updateData: any = { status };
  if (status === 'confirmed') {
    updateData.confirmed_at = new Date().toISOString();
  } else if (status === 'attended') {
    updateData.checked_in_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('event_registrations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw createError('Failed to update registration', 500);
  res.json(data);
}));

// DELETE /api/registrations/:id - Cancel registration
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('event_registrations')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) throw createError('Failed to cancel registration', 500);
  res.status(204).send();
}));

export default router;
