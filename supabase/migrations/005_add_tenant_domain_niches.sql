-- ================================================
-- Add domain and niches columns to tenants
-- ================================================

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS domain VARCHAR(255),
ADD COLUMN IF NOT EXISTS niches TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

COMMENT ON COLUMN tenants.domain IS 'Primary domain for the tenant workspace';
COMMENT ON COLUMN tenants.niches IS 'Array of niche categories for the tenant';
