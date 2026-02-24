// Database types matching Supabase schema

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  html: string | null;
  css: string | null;
  components: any[];
  styles: any[];
  status: 'draft' | 'published' | 'archived';
  is_homepage: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface Asset {
  id: string;
  tenant_id: string;
  name: string;
  file_name: string;
  url: string;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface PageTemplate {
  id: string;
  tenant_id: string | null;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  html: string | null;
  css: string | null;
  components: any[];
  styles: any[];
  category: string | null;
  is_public: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  cover_image: string | null;
  start_date: string;
  end_date: string | null;
  timezone: string;
  location_type: 'in_person' | 'virtual' | 'hybrid';
  venue_name: string | null;
  venue_address: string | null;
  virtual_url: string | null;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registration_enabled: boolean;
  max_attendees: number | null;
  registration_deadline: string | null;
  ticket_price: number;
  currency: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Speaker {
  id: string;
  tenant_id: string;
  name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  short_bio: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  social_links: Record<string, string>;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventSpeaker {
  id: string;
  event_id: string;
  speaker_id: string;
  role: 'keynote' | 'speaker' | 'panelist' | 'moderator' | 'host';
  session_title: string | null;
  session_description: string | null;
  session_start: string | null;
  session_end: string | null;
  session_room: string | null;
  display_order: number;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  ticket_type: 'general' | 'vip' | 'student' | 'early_bird';
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  payment_status: 'pending' | 'paid' | 'refunded';
  amount_paid: number;
  custom_fields: Record<string, any>;
  confirmation_code: string;
  registered_at: string;
  confirmed_at: string | null;
  checked_in_at: string | null;
}

export interface CustomBlock {
  id: string;
  tenant_id: string;
  name: string;
  label: string;
  category: string;
  content: string;
  css: string | null;
  preview_image: string | null;
  icon: string;
  attributes: Record<string, any>;
  is_global: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_per_item: number | null;
  status: 'draft' | 'active' | 'archived';
  category_id: string | null;
  images: Array<{
    url: string;
    alt: string;
    position: number;
  }>;
  seo_meta: {
    title?: string;
    description?: string;
    og_image?: string;
  };
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  inventory_quantity: number;
  inventory_policy: 'deny' | 'continue';
  weight: number | null;
  weight_unit: string;
  options: Record<string, any>;
  images: Array<{
    url: string;
    alt: string;
    position: number;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionProduct {
  collection_id: string;
  product_id: string;
  sort_order: number;
}

// Request extensions
declare global {
  namespace Express {
    interface Request {
      user?: User;
      tenantId?: string;
      supabase?: any;
    }
  }
}
