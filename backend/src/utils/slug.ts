import { supabaseAdmin } from '../config/supabase.js';

/**
 * Generates a URL-friendly slug from a string.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
}

/**
 * Ensures a slug is unique within a specific table and tenant.
 * If a conflict exists, it appends a counter (e.g., "-2", "-3").
 */
export async function ensureUniqueSlug(
  table: string,
  baseSlug: string,
  tenantId: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error(`Error checking slug existence in ${table}:`, error);
      break; 
    }

    if (!data) {
      exists = false;
    } else {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  return slug;
}
