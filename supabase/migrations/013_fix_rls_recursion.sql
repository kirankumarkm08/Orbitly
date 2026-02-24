-- Fix infinite recursion in users table RLS policy
-- The original policy does: SELECT tenant_id FROM users WHERE id = auth.uid()
-- This is a self-referencing query on the same users table which triggers the same RLS policy, causing infinite recursion.
-- 
-- Solution: Create a SECURITY DEFINER function that bypasses RLS to get the user's tenant_id.

-- Create helper function (SECURITY DEFINER runs with table owner privileges, bypassing RLS)
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid()
$$;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view same tenant users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recreate policies using the safe helper function
CREATE POLICY "Users can view same tenant users" ON users
    FOR SELECT USING (
        tenant_id = get_user_tenant_id()
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Also fix the tenants table policy which has the same self-referencing issue
DROP POLICY IF EXISTS "Users can view own tenant" ON tenants;

CREATE POLICY "Users can view own tenant" ON tenants
    FOR SELECT USING (
        id = get_user_tenant_id()
    );

-- Fix all other tables that reference users for tenant_id lookup
-- Pages
DROP POLICY IF EXISTS "Users can view tenant pages" ON pages;
DROP POLICY IF EXISTS "Users can insert tenant pages" ON pages;
DROP POLICY IF EXISTS "Users can update tenant pages" ON pages;
DROP POLICY IF EXISTS "Users can delete tenant pages" ON pages;

CREATE POLICY "Users can view tenant pages" ON pages
    FOR SELECT USING (tenant_id = get_user_tenant_id());
    
CREATE POLICY "Users can insert tenant pages" ON pages
    FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
    
CREATE POLICY "Users can update tenant pages" ON pages
    FOR UPDATE USING (tenant_id = get_user_tenant_id());
    
CREATE POLICY "Users can delete tenant pages" ON pages
    FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Assets
DROP POLICY IF EXISTS "Users can view tenant assets" ON assets;
DROP POLICY IF EXISTS "Users can insert tenant assets" ON assets;
DROP POLICY IF EXISTS "Users can update tenant assets" ON assets;
DROP POLICY IF EXISTS "Users can delete tenant assets" ON assets;

CREATE POLICY "Users can view tenant assets" ON assets
    FOR SELECT USING (tenant_id = get_user_tenant_id());
    
CREATE POLICY "Users can insert tenant assets" ON assets
    FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
    
CREATE POLICY "Users can update tenant assets" ON assets
    FOR UPDATE USING (tenant_id = get_user_tenant_id());
    
CREATE POLICY "Users can delete tenant assets" ON assets
    FOR DELETE USING (tenant_id = get_user_tenant_id());
