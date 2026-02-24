-- Migration: Create audit_log table
-- Run this in your Supabase SQL editor

-- Create audit_log table to track user actions
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Row Level Security (RLS) policies
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own actions and tenant admins to see all actions in their tenant
CREATE POLICY "Users can see their own audit log entries" 
  ON audit_log FOR SELECT 
  USING (auth.uid() = user_id OR auth.role() = 'tenant_admin');

CREATE POLICY "Tenant admins can see all audit log entries in their tenant" 
  ON audit_log FOR SELECT 
  USING (auth.role() = 'tenant_admin' AND tenant_id = auth.jwt() >>> 'tenant_id');

-- Allow inserts from authenticated users
CREATE POLICY "Users can insert their own audit log entries" 
  ON audit_log FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE audit_log IS 'Tracks user actions and changes for audit purposes';
COMMENT ON COLUMN audit_log.action IS 'The action performed (e.g., create, update, delete, publish)';
COMMENT ON COLUMN audit_log.table_name IS 'The database table affected by the action';
COMMENT ON COLUMN audit_log.record_id IS 'The ID of the record that was affected';
COMMENT ON COLUMN audit_log.old_values IS 'JSONB of the old values before the change';
COMMENT ON COLUMN audit_log.new_values IS 'JSONB of the new values after the change';
COMMENT ON COLUMN audit_log.ip_address IS 'IP address of the user who performed the action';
COMMENT ON COLUMN audit_log.user_agent IS 'User agent string of the user's browser';

-- Test query to verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_log'
ORDER BY ordinal_position;

-- Example insert (this would be done by the application, not manually)
-- INSERT INTO audit_log (tenant_id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
-- VALUES (
--   'tenant-uuid',
--   'user-uuid',
--   'create',
--   'pages',
--   'page-uuid',
--   null,
--   '{"title": "New Page", "slug": "new-page"}'::jsonb,
--   '192.168.1.1',
--   'Mozilla/5.0...'
-- );