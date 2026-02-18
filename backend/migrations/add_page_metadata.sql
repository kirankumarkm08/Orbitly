-- Migration: Add favicon_url to pages table
-- Run this in your Supabase SQL editor

-- Add favicon_url column to pages table
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- Add description column if it doesn't exist
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Ensure meta_title column exists
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS meta_title TEXT;

-- Ensure meta_description column exists
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Ensure status column exists with default
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Ensure is_homepage column exists
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS is_homepage BOOLEAN DEFAULT false;

-- Create index for better performance on published pages
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- Comment explaining the columns
COMMENT ON COLUMN pages.favicon_url IS 'URL to the page favicon (16x16 or 32x32 .ico or .png)';
COMMENT ON COLUMN pages.meta_title IS 'SEO meta title for the page (recommended 50-60 chars)';
COMMENT ON COLUMN pages.meta_description IS 'SEO meta description (recommended 150-160 chars)';
COMMENT ON COLUMN pages.status IS 'Page status: draft or published';
COMMENT ON COLUMN pages.is_homepage IS 'Whether this page is the tenant homepage';

-- Verify the structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pages'
ORDER BY ordinal_position;
