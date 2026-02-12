// Database Types for Supabase

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          tenant_id: string | null;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'owner' | 'admin' | 'editor' | 'viewer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id?: string | null;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'owner' | 'admin' | 'editor' | 'viewer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tenant_id?: string | null;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'owner' | 'admin' | 'editor' | 'viewer';
          updated_at?: string;
        };
      };
      pages: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          description: string | null;
          html: string | null;
          css: string | null;
          components: unknown[];
          styles: unknown[];
          status: 'draft' | 'published' | 'archived';
          is_homepage: boolean;
          meta_title: string | null;
          meta_description: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          description?: string | null;
          html?: string | null;
          css?: string | null;
          components?: unknown[];
          styles?: unknown[];
          status?: 'draft' | 'published' | 'archived';
          is_homepage?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          html?: string | null;
          css?: string | null;
          components?: unknown[];
          styles?: unknown[];
          status?: 'draft' | 'published' | 'archived';
          is_homepage?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      assets: {
        Row: {
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
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          file_name: string;
          url: string;
          storage_path?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          file_name?: string;
          url?: string;
          storage_path?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
        };
      };
      page_templates: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          description: string | null;
          thumbnail_url: string | null;
          html: string | null;
          css: string | null;
          components: unknown[];
          styles: unknown[];
          category: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          name: string;
          description?: string | null;
          thumbnail_url?: string | null;
          html?: string | null;
          css?: string | null;
          components?: unknown[];
          styles?: unknown[];
          category?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          html?: string | null;
          css?: string | null;
          components?: unknown[];
          styles?: unknown[];
          category?: string | null;
          is_public?: boolean;
        };
      };
    };
  };
}
