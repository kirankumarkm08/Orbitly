import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';
const router = express.Router();
// GET /api/events/public/:slug - Public event page (no auth required)
router.get('/public/:slug', optionalAuth, asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { data, error } = await supabaseAdmin
        .from('events')
        .select(`
      *,
      event_speakers (
        *,
        speaker:speakers (*)
      ),
      event_schedule (*)
    `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
    if (error)
        throw createError('Event not found', 404);
    res.json(data);
}));
// Protected routes
router.use(authMiddleware, tenantMiddleware);
// GET /api/events - List all events for tenant
router.get('/', asyncHandler(async (req, res) => {
    const { status } = req.query;
    let query = supabaseAdmin
        .from('events')
        .select('*')
        .eq('tenant_id', req.tenantId)
        .order('start_date', { ascending: false });
    if (status) {
        query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error)
        throw createError(error.message, 500);
    res.json(data);
}));
// GET /api/events/:id - Get single event with speakers and schedule
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
        .from('events')
        .select(`
      *,
      event_speakers (
        *,
        speaker:speakers (*)
      ),
      event_schedule (*)
    `)
        .eq('id', id)
        .eq('tenant_id', req.tenantId)
        .single();
    if (error)
        throw createError('Event not found', 404);
    res.json(data);
}));
// POST /api/events - Create new event
router.post('/', asyncHandler(async (req, res) => {
    const { name, slug, description, short_description, cover_image, start_date, end_date, timezone, location_type, venue_name, venue_address, virtual_url, registration_enabled, max_attendees, registration_deadline, ticket_price, currency } = req.body;
    if (!name || !slug || !start_date) {
        throw createError('Name, slug, and start_date are required', 400);
    }
    const { data, error } = await supabaseAdmin
        .from('events')
        .insert({
        tenant_id: req.tenantId,
        name,
        slug,
        description,
        short_description,
        cover_image,
        start_date,
        end_date,
        timezone: timezone || 'UTC',
        location_type: location_type || 'in_person',
        venue_name,
        venue_address,
        virtual_url,
        registration_enabled: registration_enabled ?? true,
        max_attendees,
        registration_deadline,
        ticket_price: ticket_price || 0,
        currency: currency || 'USD',
        created_by: req.user?.id,
    })
        .select()
        .single();
    if (error) {
        if (error.code === '23505') {
            throw createError('Event with this slug already exists', 409);
        }
        throw createError(error.message, 500);
    }
    res.status(201).json(data);
}));
// PUT /api/events/:id - Update event
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.tenant_id;
    delete updateData.created_by;
    delete updateData.created_at;
    const { data, error } = await supabaseAdmin
        .from('events')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', req.tenantId)
        .select()
        .single();
    if (error)
        throw createError('Failed to update event', 500);
    res.json(data);
}));
// DELETE /api/events/:id - Delete event
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin
        .from('events')
        .delete()
        .eq('id', id)
        .eq('tenant_id', req.tenantId);
    if (error)
        throw createError('Failed to delete event', 500);
    res.status(204).send();
}));
// POST /api/events/:id/publish - Publish event
router.post('/:id/publish', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
        .from('events')
        .update({ status: 'published' })
        .eq('id', id)
        .eq('tenant_id', req.tenantId)
        .select()
        .single();
    if (error)
        throw createError('Failed to publish event', 500);
    res.json(data);
}));
// ============ EVENT SPEAKERS ============
// POST /api/events/:eventId/speakers - Add speaker to event
router.post('/:eventId/speakers', asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { speaker_id, role, session_title, session_description, session_start, session_end, session_room, display_order } = req.body;
    const { data, error } = await supabaseAdmin
        .from('event_speakers')
        .insert({
        event_id: eventId,
        speaker_id,
        role: role || 'speaker',
        session_title,
        session_description,
        session_start,
        session_end,
        session_room,
        display_order: display_order || 0,
    })
        .select(`
      *,
      speaker:speakers (*)
    `)
        .single();
    if (error)
        throw createError('Failed to add speaker to event', 500);
    res.status(201).json(data);
}));
// DELETE /api/events/:eventId/speakers/:speakerId - Remove speaker from event
router.delete('/:eventId/speakers/:speakerId', asyncHandler(async (req, res) => {
    const { eventId, speakerId } = req.params;
    const { error } = await supabaseAdmin
        .from('event_speakers')
        .delete()
        .eq('event_id', eventId)
        .eq('speaker_id', speakerId);
    if (error)
        throw createError('Failed to remove speaker from event', 500);
    res.status(204).send();
}));
export default router;
//# sourceMappingURL=events.routes.js.map