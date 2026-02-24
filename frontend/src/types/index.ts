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
  status: 'published' | 'draft' | 'archived';
  is_homepage: boolean;
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
  product_variants?: ProductVariant[];
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
