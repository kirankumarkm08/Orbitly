-- ================================================
-- SaaS Page Builder - Database Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TENANTS (Organizations/Workspaces)
-- ================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- USERS (Linked to Supabase Auth)
-- ================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'editor', -- 'owner', 'admin', 'editor', 'viewer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- PAGES (Website pages built with page builder)
-- ================================================
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    html TEXT,
    css TEXT,
    components JSONB DEFAULT '[]',
    styles JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
    is_homepage BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(tenant_id, slug)
);

-- ================================================
-- ASSETS (Images, files uploaded by users)
-- ================================================
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT,
    mime_type VARCHAR(100),
    size_bytes INTEGER,
    width INTEGER,
    height INTEGER,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- PAGE TEMPLATES (Reusable templates)
-- ================================================
CREATE TABLE page_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    html TEXT,
    css TEXT,
    components JSONB DEFAULT '[]',
    styles JSONB DEFAULT '[]',
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES for better query performance
-- ================================================
CREATE INDEX idx_pages_tenant_id ON pages(tenant_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_assets_tenant_id ON assets(tenant_id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;

-- Tenants: Users can only see their own tenant
CREATE POLICY "Users can view own tenant" ON tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

-- Users: Can view users in same tenant
CREATE POLICY "Users can view same tenant users" ON users
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Pages: Full access for tenant members
CREATE POLICY "Users can view tenant pages" ON pages
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert tenant pages" ON pages
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update tenant pages" ON pages
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can delete tenant pages" ON pages
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

-- Assets: Full access for tenant members
CREATE POLICY "Users can view tenant assets" ON assets
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert tenant assets" ON assets
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can delete tenant assets" ON assets
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

-- Templates: View public or own tenant templates
CREATE POLICY "Users can view templates" ON page_templates
    FOR SELECT USING (
        is_public = TRUE OR
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- SEED DATA (Optional - for testing)
-- ================================================

-- Create a default tenant
INSERT INTO tenants (id, name, slug) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Demo Workspace', 'demo');

-- Note: Users will be created automatically when they sign up via Supabase Auth
-- You'll need to set up a trigger or use Supabase edge functions to:
-- 1. Create a user record in the users table when auth.users is created
-- 2. Optionally create/assign a tenant

-- ================================================
-- OPTIONAL: Function to handle new user signups
-- ================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user record on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
