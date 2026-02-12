import { getSupabaseClient } from '@/lib/supabase/client';

export interface Speaker {
  id: string;
  tenant_id: string;
  name: string;
  title?: string;
  company?: string;
  bio?: string;
  short_bio?: string;
  photo_url?: string;
  email?: string;
  phone?: string;
  website?: string;
  social_links: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpeakerInput {
  name: string;
  title?: string;
  company?: string;
  bio?: string;
  short_bio?: string;
  photo_url?: string;
  email?: string;
  phone?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  is_featured?: boolean;
}

export interface EventSpeaker {
  id: string;
  event_id: string;
  speaker_id: string;
  role: string;
  session_title?: string;
  session_description?: string;
  session_start?: string;
  session_end?: string;
  session_room?: string;
  speaker?: Speaker;
}

class SpeakerService {
  private supabase = getSupabaseClient();

  // ==================== SPEAKERS ====================

  async getSpeakers(): Promise<Speaker[]> {
    const { data, error } = await this.supabase
      .from('speakers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getSpeakerById(id: string): Promise<Speaker | null> {
    const { data, error } = await this.supabase
      .from('speakers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getFeaturedSpeakers(): Promise<Speaker[]> {
    const { data, error } = await this.supabase
      .from('speakers')
      .select('*')
      .eq('is_featured', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createSpeaker(input: SpeakerInput): Promise<Speaker> {
    const { data, error } = await this.supabase
      .from('speakers')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSpeaker(id: string, input: Partial<SpeakerInput>): Promise<Speaker> {
    const { data, error } = await this.supabase
      .from('speakers')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSpeaker(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('speakers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ==================== EVENT SPEAKERS ====================

  async getEventSpeakers(eventId: string): Promise<EventSpeaker[]> {
    const { data, error } = await this.supabase
      .from('event_speakers')
      .select(`
        *,
        speaker:speakers(*)
      `)
      .eq('event_id', eventId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addSpeakerToEvent(
    eventId: string,
    speakerId: string,
    session?: {
      role?: string;
      session_title?: string;
      session_description?: string;
      session_start?: string;
      session_end?: string;
      session_room?: string;
    }
  ): Promise<EventSpeaker> {
    const { data, error } = await this.supabase
      .from('event_speakers')
      .insert({
        event_id: eventId,
        speaker_id: speakerId,
        ...session,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEventSpeaker(
    id: string,
    session: Partial<{
      role: string;
      session_title: string;
      session_description: string;
      session_start: string;
      session_end: string;
      session_room: string;
      display_order: number;
    }>
  ): Promise<EventSpeaker> {
    const { data, error } = await this.supabase
      .from('event_speakers')
      .update(session)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeSpeakerFromEvent(eventId: string, speakerId: string): Promise<void> {
    const { error } = await this.supabase
      .from('event_speakers')
      .delete()
      .eq('event_id', eventId)
      .eq('speaker_id', speakerId);

    if (error) throw error;
  }
}

export const speakerService = new SpeakerService();
