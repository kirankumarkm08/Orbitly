-- ================================================
-- Forms & Form Submissions Tables
-- ================================================

-- Forms (form definitions)
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  fields JSONB DEFAULT '[]', -- Array of field definitions
  settings JSONB DEFAULT '{}', -- {submit_url, redirect_url, notifications, etc.}
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'active' | 'archived'
  submissions_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form Submissions
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}', -- Form field values
  ip_address VARCHAR(50),
  user_agent TEXT,
  referrer TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_forms_tenant_id ON forms(tenant_id);
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_tenant_id ON form_submissions(tenant_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Forms Policy
CREATE POLICY "Users can view tenant forms" ON forms
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert tenant forms" ON forms
    FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update tenant forms" ON forms
    FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete tenant forms" ON forms
    FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Form Submissions Policy (admin only can view)
CREATE POLICY "Users can view tenant form submissions" ON form_submissions
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert tenant form submissions" ON form_submissions
    FOR INSERT WITH CHECK (true); -- Public submissions allowed
CREATE POLICY "Users can delete tenant form submissions" ON form_submissions
    FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- ================================================
-- TRIGGERS
-- ================================================
CREATE TRIGGER trigger_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
