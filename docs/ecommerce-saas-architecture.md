# Orbitly: E-commerce SaaS Architecture

This document outlines the architectural vision for the E-commerce niche within the Orbitly platform, as part of our multi-niche strategy (Static, E-commerce, Event Management, Launchpad).

---

## Core Niches

| Niche | Status | Description |
|-------|--------|-------------|
| Static | ✅ Complete | Portfolio, Agency sites - optimized for speed |
| E-commerce | 🔄 Active | Product selling, inventory, checkout |
| Event Management | ⏳ Planned | RSVP, check-ins, agenda management |
| Launchpad | ⏳ Planned | Pre-launch waitlists, early-bird campaigns |

---

## 🎨 Product Card Engine

The "New Era" design focuses on high-fidelity, interactive, and conversion-optimized product cards.

### 1. Modern Glassmorphic (High-Tech/SaaS)
- **Visuals**: Translucent backgrounds, blurred backdrops, glowing borders on hover
- **Micro-animations**: Subtle scale-up and light-sweep effect on hover
- **Usage**: Digital products, software licenses, high-end tech

### 2. Minimalist Clean (Retail/Boutique)
- **Visuals**: High whitespace, serif typography, no borders, soft shadows
- **Focus**: Large, high-resolution product imagery
- **Usage**: Fashion, luxury goods, artisanal products

### 3. Feature-Rich Grid (Utility/Tools)
- **Visuals**: Structured badges (Sale, New, Low Stock), price comparisons
- **Interactivity**: Tabbed mini-previews for variants without leaving grid
- **Usage**: Electronics, industrial tools, large catalogs

### 4. Social-Style Card (Creator/Engagement)
- **Visuals**: Circular seller avatar, "Like" heart, comment count, review snippet
- **Vibe**: Instagram/Pinterest-style
- **Usage**: Creator commerce, digital art, marketplaces

---

## 🗄 Database Schema

### Core Tables

```sql
-- Products (main catalog)
products (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255),
  slug VARCHAR(255), -- unique within tenant
  description TEXT,
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2), -- strikethrough price
  cost_per_item DECIMAL(10,2), -- for profit calculation
  status VARCHAR(20), -- draft, active, archived
  category_id UUID REFERENCES categories(id),
  images JSONB, -- array of image URLs
  seo_meta JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Product Variants (sizes, colors, etc.)
product_variants (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  name VARCHAR(255), -- "Blue / Large"
  sku VARCHAR(100),
  barcode VARCHAR(100),
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  inventory_quantity INTEGER,
  inventory_policy VARCHAR(20), -- deny, continue
  weight DECIMAL(10,2),
  weight_unit VARCHAR(10), -- kg, lb, g
  options JSONB, -- {"color": "blue", "size": "large"}
  images JSONB,
  is_active BOOLEAN DEFAULT true
)

-- Categories
categories (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  slug VARCHAR(255),
  description TEXT,
  parent_id UUID REFERENCES categories(id), -- nested categories
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0
)

-- Collections (curated product groupings)
collections (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  slug VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  rules JSONB, -- automated collection rules
  sort_order INTEGER DEFAULT 0
)

-- Customers
customers (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  metadata JSONB,
  accepts_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

-- Orders
orders (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  order_number VARCHAR(50), -- readable order # like "ORD-001"
  customer_id UUID REFERENCES customers(id),
  email VARCHAR(255),
  status VARCHAR(30), -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
  currency VARCHAR(3), -- USD, EUR, etc.
  subtotal DECIMAL(10,2),
  tax_total DECIMAL(10,2),
  shipping_total DECIMAL(10,2),
  discount_total DECIMAL(10,2),
  total DECIMAL(10,2),
  shipping_address JSONB,
  billing_address JSONB,
  note TEXT,
  tags JSONB,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Order Line Items
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  title VARCHAR(255),
  variant_title VARCHAR(255),
  sku VARCHAR(100),
  quantity INTEGER,
  price DECIMAL(10,2),
  total DECIMAL(10,2),
  properties JSONB -- custom properties like engraving text
)

-- Inventory Tracking
inventory_levels (
  id UUID PRIMARY KEY,
  variant_id UUID REFERENCES product_variants(id),
  location_id UUID REFERENCES inventory_locations(id),
  quantity INTEGER,
  updated_at TIMESTAMP
)

-- Inventory Locations (warehouses)
inventory_locations (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  address JSONB,
  is_primary BOOLEAN DEFAULT false
)

-- Coupons/Discounts
discounts (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  code VARCHAR(50),
  type VARCHAR(20), -- percentage, fixed, shipping
  value DECIMAL(10,2),
  min_order_amount DECIMAL(10,2),
  usage_limit INTEGER, -- max uses total
  usage_limit_per_user INTEGER,
  usage_count INTEGER DEFAULT 0,
  starts_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  conditions JSONB -- product/collection restrictions
)

-- Shipping Zones & Rates
shipping_zones (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  countries JSONB, -- array of country codes
  regions JSONB, -- array of regions/states
  postcodes JSONB -- postal code patterns
)

shipping_rates (
  id UUID PRIMARY KEY,
  zone_id UUID REFERENCES shipping_zones(id),
  name VARCHAR(255), -- "Standard Shipping"
  price DECIMAL(10,2),
  free_shipping_threshold DECIMAL(10,2),
  estimated_days VARCHAR(50),
  carrier VARCHAR(50) -- "usps", "fedex", etc.
)

-- Taxes
tax_zones (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  country VARCHAR(2),
  region VARCHAR(100),
  postal_code VARCHAR(20),
  rate DECIMAL(5,4), -- 0.0825 for 8.25%
  is_active BOOLEAN DEFAULT true
)

-- Store Settings (tenant-level)
store_settings (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) UNIQUE,
  currency_code VARCHAR(3) DEFAULT 'USD',
  currency_symbol VARCHAR(5) DEFAULT '$',
  timezone VARCHAR(50) DEFAULT 'UTC',
  weight_unit VARCHAR(10) DEFAULT 'kg',
  dimension_unit VARCHAR(10) DEFAULT 'cm',
  default_tax_rate DECIMAL(5,4),
  address JSONB,
  contact_email VARCHAR(255),
  support_phone VARCHAR(50),
  logo_url VARCHAR(500),
  favicon_url VARCHAR(500)
)

-- Product Reviews
reviews (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  customer_id UUID REFERENCES customers(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  body TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

-- SEO & Redirects
seo_redirects (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  old_path VARCHAR(500),
  new_path VARCHAR(500),
  type INTEGER DEFAULT 301, -- 301 permanent, 302 temporary
  hits INTEGER DEFAULT 0
)
```

---

## 🔗 Product Slug Management

### 1. Generation Logic
- **Default**: Auto-slugify product name (`Organic Blue T-Shirt` → `organic-blue-t-shirt`)
- **Conflict Resolution**: Append unique hash if exists (`-2`, `-7a1z`)

### 2. Versioning & Redirects
- **Legacy Protection**: Slug changes create automatic 301 redirect to preserve SEO
- **Tenant Isolation**: Slugs unique within tenant (`store-a.com/product/logo` vs `store-b.com/product/logo`)

### 3. SEO Controls
- **Slug Overrides**: Manual edit for power-SEO
- **Metadata**: Slug changes update `seo_meta` JSONB

---

## 🛒 Checkout Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Cart      │───▶│ Information │───▶│  Shipping   │───▶│  Payment    │
│  Review     │    │   Address   │    │   Method    │    │   Review    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                    │
                                                                    ▼
                                                            ┌─────────────┐
                                                            │  Order      │
                                                            │  Confirmed  │
                                                            └─────────────┘
```

### Cart Features
- Persistent cart (stored in database, survives browser close)
- Guest cart (email capture)
- Cart attributes (engraving, gift message)
- Automatic tax calculation based on address

### Checkout Steps
1. **Cart Review**: Update quantities, remove items, apply coupon
2. **Information**: Email, shipping address, phone
3. **Shipping**: Select shipping rate based on address
4. **Payment**: Credit card, PayPal, etc.
5. **Confirmation**: Order number, email receipt

---

## 💳 Payment Integration

### Supported Providers
| Provider | Status | Features |
|----------|--------|----------|
| Stripe | 🔄 Planned | Cards, Apple Pay, Google Pay |
| PayPal | ⏳ Planned | PayPal, Venmo |
| Manual | ✅ Basic | Cash on delivery, bank transfer |

### Payment Flow
```
Customer enters card → Stripe Tokenize → 
Server creates PaymentIntent → 
Stripe confirms → Order created → Inventory decremented
```

### PCI Compliance
- Use Stripe Elements (PCI-compliant iframe)
- Never store card details on our servers
- Use Stripe webhooks for order confirmation

---

## 📦 Inventory Management

### Stock Tracking
- Track per-variant inventory
- Multiple warehouse locations
- Low stock alerts (configurable threshold)
- Backorder support (inventory_policy: "continue")

### Inventory Adjustments
- Manual adjustment reasons (received, damaged, lost, counted)
- Audit log of all changes
- Bulk import/export

---

## 🚚 Shipping Integration

### Supported Carriers
- **USPS**: Priority, First Class, Media Mail
- **UPS**: Ground, 2-Day, Next Day
- **FedEx**: Ground, Express, Home Delivery
- **Custom**: Flat rate, free shipping thresholds

### Shipping Calculations
- Weight-based rates
- Price-based rates (free over $X)
- Flat rate per order
- Local pickup option

---

## 🔧 Tenant Store Configuration

### Store Settings
```typescript
interface StoreSettings {
  // Business Info
  storeName: string;
  contactEmail: string;
  supportPhone: string;
  address: Address;
  
  // Localization
  currency: string; // USD, EUR, GBP
  timezone: string;
  weightUnit: 'kg' | 'lb' | 'g' | 'oz';
  dimensionUnit: 'cm' | 'in';
  
  // Checkout
  guestCheckout: boolean;
  requireEmail: boolean;
  defaultTaxRate: number;
  
  // Notifications
  orderEmailNotifications: boolean;
  lowStockAlerts: boolean;
  
  // Branding
  logoUrl: string;
  faviconUrl: string;
  accentColor: string;
}
```

### Payment Settings (per tenant)
- Connected Stripe account ID
- Enabled payment methods
- Transaction fee handling

### Shipping Settings (per tenant)
- Enabled carriers
- Handling fees
- Free shipping thresholds

---

## 🎨 Page Builder Integration

### E-commerce Blocks

| Block | Description |
|-------|-------------|
| Product Card | Single product with variant selector |
| Product Grid | Grid of products with filtering |
| Featured Products | Curated product selection |
| Product Detail | Full product page template |
| Cart Summary | Cart preview widget |
| Category Grid | Browse by category |
| Collection Banner | Promotional collection hero |

### Block Properties
```typescript
interface ProductGridBlock {
  source: 'all' | 'collection' | 'category' | 'featured' | 'manual';
  collectionId?: string;
  categoryId?: string;
  productIds?: string[];
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'best-selling';
  gridColumns: 1 | 2 | 3 | 4 | 5 | 6;
  cardStyle: 'glassmorphic' | 'minimal' | 'feature-rich' | 'social';
  showQuickAdd: boolean;
  showQuickView: boolean;
}
```

---

## 🏗 Component Architecture

### Frontend Structure
```
components/
├── ecommerce/
│   ├── ProductCard/
│   │   ├── ProductCard.tsx        # Main component
│   │   ├── GlassmorphicCard.tsx
│   │   ├── MinimalCard.tsx
│   │   ├── FeatureRichCard.tsx
│   │   └── SocialCard.tsx
│   ├── Cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── Checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── ShippingForm.tsx
│   │   ├── PaymentForm.tsx
│   │   └── OrderSummary.tsx
│   ├── ProductGrid/
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   └── SortSelect.tsx
│   └── ProductDetail/
│       ├── ProductGallery.tsx
│       ├── VariantSelector.tsx
│       ├── AddToCart.tsx
│       └── ReviewsList.tsx
```

### API Routes
```
/api/
├── products/
│   ├── GET    /api/products              # List products
│   ├── POST   /api/products              # Create product
│   ├── GET    /api/products/:id          # Get product
│   ├── PUT    /api/products/:id          # Update product
│   ├── DELETE /api/products/:id          # Delete product
│   └── GET    /api/products/:id/variants  # Get variants
├── cart/
│   ├── GET    /api/cart                  # Get cart
│   ├── POST   /api/cart/items            # Add item
│   ├── PUT    /api/cart/items/:id        # Update quantity
│   └── DELETE /api/cart/items/:id       # Remove item
├── checkout/
│   ├── POST   /api/checkout/shipping-rates  # Get rates
│   ├── POST   /api/checkout/complete        # Complete order
├── orders/
│   ├── GET    /api/orders                # List orders
│   ├── GET    /api/orders/:id            # Get order
│   └── PUT    /api/orders/:id/status     # Update status
├── customers/
│   └── (standard CRUD)
├── discounts/
│   ├── GET    /api/discounts/:code       # Validate coupon
│   └── (admin CRUD)
```

---

---

## 🛡 Security & Deployment (Cloudflare Era)
To ensure "New Era" security and reliability, Orbitly is designed to run on the **Cloudflare Edge**.

### 1. Cloudflare Pages (Frontend)
- **Deployment**: Next.js is deployed via Cloudflare Pages using the `@cloudflare/next-on-pages` adapter.
- **Performance**: Globally distributed edge caching ensures zero-latency page loads for public storefronts.

### 2. Multi-Tenant Custom Domains (SSL for SaaS)
- **Problem**: Manually managing SSL for hundreds of client domains (e.g., `client-a.com`) is complex.
- **Solution**: We use **Cloudflare for SaaS**.
    - **Automatic SSL**: Certificates are issued and renewed automatically as soon as a tenant points their DNS to our CNAME.
    - **Edge Routing**: A Cloudflare Worker inspects the `Host` header and resolves the correct `tenant_id` and `project_id` before the request even reaches our main server.

### 3. Enterprise Hardening
- **WAF (Web Application Firewall)**: Custom rules to block SQL injection, XSS, and credential stuffing at the network edge.
- **Bot Management**: Prevents malicious bots from scraping product prices or inventory data.
- **Zero Trust**: Admin access to the Orbitly internal dashboard is protected by Cloudflare Access (MFA/SSO).

---

## 🔒 Security Considerations

### Data Protection
- All payment data via Stripe (PCI-DSS compliant)
- Customer PII encrypted at rest
- GDPR-compliant data export/deletion

### Access Control
- Tenant Admin: Full store access
- Staff: Configurable (no financial)
- Customers: Own orders only

### Rate Limiting
- API: 100 req/min per tenant
- Checkout: 10 attempts/min per IP

---

## 📈 Performance

### Caching Strategy
- Product listings: 60s CDN cache
- Product detail: 30s cache
- Cart/Checkout: No cache (real-time)

### Optimizations
- Image optimization (WebP, lazy load)
- Variant images lazy loaded
- Infinite scroll for large catalogs
- Edge functions for shipping calculation

---

## 📋 Implementation Phases

### Phase 1: Core (MVP)
- [ ] Product CRUD
- [ ] Basic product variants
- [ ] Simple cart (no checkout)
- [ ] Product grid/list display

### Phase 2: Checkout
- [ ] Checkout flow
- [ ] Stripe integration
- [ ] Order management
- [ ] Customer accounts

### Phase 3: Advanced
- [ ] Inventory tracking
- [ ] Shipping calculators
- [ ] Taxes
- [ ] Discounts/coupons

### Phase 4: Scale
- [ ] Multi-location inventory
- [ ] POS integration
- [ ] Wholesale/b2b
- [ ] Subscriptions

---

## 📚 Related Docs

- [architecture.md](../architecture.md) - Multi-tenant RBAC
- [TESTING.md](./TESTING.md) - Testing guide
- [API Collection](../Orbitly-API-Collection.json) - Postman collection
