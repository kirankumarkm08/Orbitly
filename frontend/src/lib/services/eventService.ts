import { getSupabaseClient } from '@/lib/supabase/client';

export interface Event {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  cover_image?: string;
  start_date: string;
  end_date?: string;
  timezone: string;
  location_type: 'in_person' | 'virtual' | 'hybrid';
  venue_name?: string;
  venue_address?: string;
  virtual_url?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registration_enabled: boolean;
  max_attendees?: number;
  registration_deadline?: string;
  ticket_price: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface EventInput {
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  cover_image?: string;
  start_date: string;
  end_date?: string;
  timezone?: string;
  location_type?: 'in_person' | 'virtual' | 'hybrid';
  venue_name?: string;
  venue_address?: string;
  virtual_url?: string;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  registration_enabled?: boolean;
  max_attendees?: number;
  registration_deadline?: string;
  ticket_price?: number;
  currency?: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  ticket_type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  confirmation_code: string;
  registered_at: string;
}

class EventService {
  private supabase = getSupabaseClient();

  // ==================== EVENTS ====================

  async getEvents(): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }

  async getUpcomingEvents(limit = 10): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async createEvent(input: EventInput): Promise<Event> {
    const slug = input.slug || this.generateSlug(input.name);
    
    const { data, error } = await this.supabase
      .from('events')
      .insert({ ...input, slug })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEvent(id: string, input: Partial<EventInput>): Promise<Event> {
    const { data, error } = await this.supabase
      .from('events')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async publishEvent(id: string): Promise<Event> {
    return this.updateEvent(id, { status: 'published' });
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ==================== REGISTRATIONS ====================

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    const { data, error } = await this.supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async registerForEvent(
    eventId: string,
    registration: { name: string; email: string; phone?: string; company?: string; job_title?: string; ticket_type?: string }
  ): Promise<EventRegistration> {
    const { data, error } = await this.supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        ...registration,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async confirmRegistration(id: string): Promise<EventRegistration> {
    const { data, error } = await this.supabase
      .from('event_registrations')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async cancelRegistration(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  }

  async getRegistrationCount(eventId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .neq('status', 'cancelled');

    if (error) throw error;
    return count || 0;
  }

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}

export const eventService = new EventService();
