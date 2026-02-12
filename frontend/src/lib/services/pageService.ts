import { getSupabaseClient } from '@/lib/supabase/client';

export interface Page {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  html?: string;
  css?: string;
  components?: unknown[];
  styles?: unknown[];
  status: 'draft' | 'published' | 'archived';
  is_homepage: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface PageInput {
  name: string;
  slug?: string;
  html?: string;
  css?: string;
  components?: unknown[];
  styles?: unknown[];
  status?: 'draft' | 'published' | 'archived';
  is_homepage?: boolean;
  meta_title?: string;
  meta_description?: string;
}

class PageService {
  private supabase = getSupabaseClient();

  /**
   * Get all pages for the current tenant
   */
  async getPages(): Promise<Page[]> {
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single page by ID
   */
  async getPageById(id: string): Promise<Page | null> {
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching page:', error);
      return null;
    }

    return data;
  }

  /**
   * Get a page by slug
   */
  async getPageBySlug(slug: string): Promise<Page | null> {
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching page by slug:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a new page
   */
  async createPage(input: PageInput): Promise<Page> {
    const slug = input.slug || this.generateSlug(input.name);
    
    const { data, error } = await this.supabase
      .from('pages')
      .insert({
        ...input,
        slug,
        status: input.status || 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating page:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing page
   */
  async updatePage(id: string, input: Partial<PageInput>): Promise<Page> {
    const { data, error } = await this.supabase
      .from('pages')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating page:', error);
      throw error;
    }

    return data;
  }

  /**
   * Save page content from the page builder
   */
  async savePageContent(
    id: string,
    content: { html: string; css: string; components?: unknown[]; styles?: unknown[] }
  ): Promise<Page> {
    return this.updatePage(id, {
      html: content.html,
      css: content.css,
      components: content.components,
      styles: content.styles,
    });
  }

  /**
   * Publish a page
   */
  async publishPage(id: string): Promise<Page> {
    const { data, error } = await this.supabase
      .from('pages')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error publishing page:', error);
      throw error;
    }

    return data;
  }

  /**
   * Unpublish a page (set to draft)
   */
  async unpublishPage(id: string): Promise<Page> {
    return this.updatePage(id, { status: 'draft' });
  }

  /**
   * Delete a page
   */
  async deletePage(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  }

  /**
   * Generate a URL-friendly slug from a name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

// Export singleton instance
export const pageService = new PageService();
