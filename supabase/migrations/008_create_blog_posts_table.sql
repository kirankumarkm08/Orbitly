-- Migration: Create blog_posts table
-- Run this in your Supabase SQL editor

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image_url TEXT,
  og_title TEXT,
  og_description TEXT,
  twitter_card_type VARCHAR(20) DEFAULT 'summary_large_image',
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  category VARCHAR(50),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant_id ON blog_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured) WHERE is_featured = true;

-- Row Level Security (RLS) policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow users to create blog posts for their tenant
CREATE POLICY "Users can create blog posts in their tenant" 
  ON blog_posts FOR INSERT 
  WITH CHECK (tenant_id = auth.jwt() >>> 'tenant_id');

-- Allow users to view blog posts in their tenant
CREATE POLICY "Users can view blog posts in their tenant" 
  ON blog_posts FOR SELECT 
  USING (tenant_id = auth.jwt() >>> 'tenant_id');

-- Allow users to update their own blog posts
CREATE POLICY "Users can update their own blog posts" 
  ON blog_posts FOR UPDATE 
  USING (tenant_id = auth.jwt() >>> 'tenant_id' AND (author_id = auth.uid() OR auth.role() = 'tenant_admin'));

-- Allow users to delete their own blog posts
CREATE POLICY "Users can delete their own blog posts" 
  ON blog_posts FOR DELETE 
  USING (tenant_id = auth.jwt() >>> 'tenant_id' AND (author_id = auth.uid() OR auth.role() = 'tenant_admin'));

-- Allow super admins to manage all blog posts
CREATE POLICY "Super admins can manage all blog posts" 
  ON blog_posts FOR ALL 
  USING (auth.role() = 'super_admin');

-- Add comments for documentation
COMMENT ON TABLE blog_posts IS 'Stores blog posts and articles for each tenant';
COMMENT ON COLUMN blog_posts.title IS 'Title of the blog post';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly slug for the blog post';
COMMENT ON COLUMN blog_posts.content IS 'Full HTML content of the blog post';
COMMENT ON COLUMN blog_posts.excerpt IS 'Short summary for previews and listings';
COMMENT ON COLUMN blog_posts.featured_image_url IS 'URL to the featured image';
COMMENT ON COLUMN blog_posts.status IS 'Publication status of the post';
COMMENT ON COLUMN blog_posts.published_at IS 'Date and time when the post was published';
COMMENT ON COLUMN blog_posts.meta_title IS 'SEO meta title for the post';
COMMENT ON COLUMN blog_posts.meta_description IS 'SEO meta description';
COMMENT ON COLUMN blog_posts.meta_keywords IS 'SEO meta keywords array';
COMMENT ON COLUMN blog_posts.og_image_url IS 'Open Graph image URL';
COMMENT ON COLUMN blog_posts.og_title IS 'Open Graph title';
COMMENT ON COLUMN blog_posts.og_description IS 'Open Graph description';
COMMENT ON COLUMN blog_posts.twitter_card_type IS 'Twitter card type (summary, summary_large_image, etc.)';
COMMENT ON COLUMN blog_posts.is_featured IS 'Whether the post is featured/highlighted';
COMMENT ON COLUMN blog_posts.view_count IS 'Number of times the post has been viewed';
COMMENT ON COLUMN blog_posts.like_count IS 'Number of likes the post has received';
COMMENT ON COLUMN blog_posts.comment_count IS 'Number of comments on the post';
COMMENT ON COLUMN blog_posts.category IS 'Category or topic of the post';
COMMENT ON COLUMN blog_posts.tags IS 'Array of tags for categorization';

-- Create a function to generate unique slugs
CREATE OR REPLACE FUNCTION generate_unique_slug(
  base_slug TEXT,
  tenant_id UUID,
  existing_id UUID DEFAULT NULL
) 
RETURNS TEXT AS $$
DECLARE
  slug TEXT := base_slug;
  counter INTEGER := 1;
  existing_slug TEXT;
BEGIN
  -- Remove special characters and convert to lowercase
  slug := regexp_replace(lower(slug), '[^a-z0-9]+\u0027, '-', 'g');
  slug := regexp_replace(slug, '^-+|-+$\u0027, '', 'g');
  
  -- Check if slug already exists
  SELECT slug INTO existing_slug
  FROM blog_posts
  WHERE slug = slug 
    AND tenant_id = generate_unique_slug.tenant_id 
    AND id != generate_unique_slug.existing_id;
  
  -- If slug exists, append counter
  WHILE existing_slug IS NOT NULL LOOP
    counter := counter + 1;
    slug := base_slug || '-' || counter;
    slug := regexp_replace(lower(slug), '[^a-z0-9]+\u0027, '-', 'g');
    slug := regexp_replace(slug, '^-+|-+$\u0027, '', 'g');
    
    SELECT slug INTO existing_slug
    FROM blog_posts
    WHERE slug = slug 
      AND tenant_id = generate_unique_slug.tenant_id 
      AND id != generate_unique_slug.existing_id;
  END LOOP;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-generate slugs on insert/update
CREATE OR REPLACE FUNCTION set_blog_post_slug() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(
      regexp_replace(lower(NEW.title), '[^a-z0-9]+\u0027, '-', 'g'),
      NEW.tenant_id,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for slug generation
CREATE TRIGGER set_blog_post_slug_trigger
  BEFORE INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_post_slug();

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_blog_post_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Test query to verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;

-- Example insert (this would be done by the application, not manually)
-- INSERT INTO blog_posts (tenant_id, author_id, title, content, status, category, tags)
-- VALUES (
--   'tenant-uuid',
--   'user-uuid',
--   'Welcome to Our Blog',
--   '<p>This is our first blog post!</p>',
--   'published',
--   'General',
--   '{'Welcome', 'Announcement'}'
-- );