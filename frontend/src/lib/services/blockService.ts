import { getSupabaseClient } from '@/lib/supabase/client';

export interface CustomBlock {
  id: string;
  tenant_id: string;
  name: string;
  label: string;
  category: string;
  content: string;
  css?: string;
  preview_image?: string;
  icon: string;
  attributes: Record<string, unknown>;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomBlockInput {
  name: string;
  label: string;
  category?: string;
  content: string;
  css?: string;
  preview_image?: string;
  icon?: string;
  attributes?: Record<string, unknown>;
  is_global?: boolean;
}

class BlockService {
  private supabase = getSupabaseClient();

  async getBlocks(): Promise<CustomBlock[]> {
    const { data, error } = await this.supabase
      .from('custom_blocks')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getBlockById(id: string): Promise<CustomBlock | null> {
    const { data, error } = await this.supabase
      .from('custom_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getBlocksByCategory(category: string): Promise<CustomBlock[]> {
    const { data, error } = await this.supabase
      .from('custom_blocks')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createBlock(input: CustomBlockInput): Promise<CustomBlock> {
    const { data, error } = await this.supabase
      .from('custom_blocks')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBlock(id: string, input: Partial<CustomBlockInput>): Promise<CustomBlock> {
    const { data, error } = await this.supabase
      .from('custom_blocks')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBlock(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('custom_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get blocks formatted for GrapesJS Block Manager
  async getGrapesBlocks(): Promise<Array<{
    id: string;
    label: string;
    category: string;
    content: string;
    attributes: Record<string, unknown>;
  }>> {
    const blocks = await this.getBlocks();
    return blocks.map(block => ({
      id: block.name,
      label: block.label,
      category: block.category,
      content: block.content,
      attributes: block.attributes,
    }));
  }
}

export const blockService = new BlockService();
