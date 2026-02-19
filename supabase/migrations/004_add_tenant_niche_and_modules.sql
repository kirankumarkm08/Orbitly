-- ================================================
-- Add niche column and modules support to tenants
-- ================================================

-- Add niche column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS niche VARCHAR(50) DEFAULT 'static';

-- Add comment explaining valid values
COMMENT ON COLUMN tenants.niche IS 'Workspace niche: ecommerce, events, launchpad, or static';

-- Create index for niche queries
CREATE INDEX IF NOT EXISTS idx_tenants_niche ON tenants(niche);

-- Update existing tenants to have 'static' niche if not set
UPDATE tenants SET niche = 'static' WHERE niche IS NULL;

-- ================================================
-- Create tenant_modules table for tracking enabled modules
-- ================================================
CREATE TABLE IF NOT EXISTS tenant_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, module_name)
);

-- Enable RLS on tenant_modules
ALTER TABLE tenant_modules ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant access
CREATE POLICY tenant_modules_policy ON tenant_modules
    FOR ALL
    USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- Create index for tenant module lookups
CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant ON tenant_modules(tenant_id);
