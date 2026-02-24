-- ================================================
-- E-commerce Module Schema
-- ================================================

-- 1. Product Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- 2. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2),
  cost_per_item DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'draft',   -- 'draft' | 'active' | 'archived'
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]',            -- Array of {url, alt, position}
  seo_meta JSONB DEFAULT '{}',          -- {title, description, og_image}
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- 3. Product Variants (sizes, colors, etc.)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- e.g., "Blue / Large"
  sku VARCHAR(100),
  price DECIMAL(10,2),                  -- NULL means use parent product price
  compare_at_price DECIMAL(10,2),
  inventory_quantity INTEGER DEFAULT 0,
  inventory_policy VARCHAR(20) DEFAULT 'deny',  -- 'deny' | 'continue' (backorder)
  weight DECIMAL(10,2),
  weight_unit VARCHAR(10) DEFAULT 'kg',
  options JSONB DEFAULT '{}',           -- e.g., {"color": "blue", "size": "L"}
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Collections (Best Sellers, Summer Sale, etc.)
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- 5. Collection Products (Many-to-Many)
CREATE TABLE collection_products (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX idx_collections_tenant_id ON collections(tenant_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

-- Categories Policy
CREATE POLICY "Users can view tenant categories" ON categories
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert tenant categories" ON categories
    FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update tenant categories" ON categories
    FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete tenant categories" ON categories
    FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Products Policy
CREATE POLICY "Users can view tenant products" ON products
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert tenant products" ON products
    FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update tenant products" ON products
    FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete tenant products" ON products
    FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Variants Policy (via product_id join)
CREATE POLICY "Users can view tenant product variants" ON product_variants
    FOR SELECT USING (product_id IN (SELECT id FROM products WHERE tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Users can insert tenant product variants" ON product_variants
    FOR INSERT WITH CHECK (product_id IN (SELECT id FROM products WHERE tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Users can update tenant product variants" ON product_variants
    FOR UPDATE USING (product_id IN (SELECT id FROM products WHERE tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Users can delete tenant product variants" ON product_variants
    FOR DELETE USING (product_id IN (SELECT id FROM products WHERE tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())));

-- Collections Policy
CREATE POLICY "Users can view tenant collections" ON collections
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert tenant collections" ON collections
    FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update tenant collections" ON collections
    FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete tenant collections" ON collections
    FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Collection Products Policy (via collection_id join)
CREATE POLICY "Users can manage collection products" ON collection_products
    FOR ALL USING (collection_id IN (SELECT id FROM collections WHERE tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())));

-- ================================================
-- TRIGGERS
-- ================================================

CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
