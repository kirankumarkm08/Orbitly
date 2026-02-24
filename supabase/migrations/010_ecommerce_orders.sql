-- ================================================
-- E-commerce Orders & Stripe Integration
-- ================================================

-- 1. Add Stripe Account ID to Tenants (for Connect)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);

-- 2. Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  customer_email VARCHAR(255),
  amount_total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'shipped' | 'delivered' | 'cancelled'
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid' | 'paid' | 'refunded'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Orders Policy
CREATE POLICY "Users can view tenant orders" ON orders
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert tenant orders" ON orders
    FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update tenant orders" ON orders
    FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Order Items Policy (via order_id join)
CREATE POLICY "Users can view tenant order items" ON order_items
    FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())));

-- ================================================
-- TRIGGERS
-- ================================================
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
