-- ================================================
-- Onboarding Queue Table
-- ================================================

CREATE TABLE IF NOT EXISTS onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    niche VARCHAR(50) DEFAULT 'static',
    domain VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_tenant ON onboarding(tenant_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_email ON onboarding(email);

ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY onboarding_select_policy ON onboarding
    FOR SELECT
    USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE TRIGGER trigger_onboarding_updated_at
    BEFORE UPDATE ON onboarding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
