# Orbitly — E-commerce Implementation Guide

> **Goal:** Add a full e-commerce module to the existing Orbitly multi-tenant SaaS platform.  
> **Current state:** Architecture doc exists (`docs/ecommerce-saas-architecture.md`) but zero code has been written.  
> **Stack:** Next.js 14 (frontend) · Express + Supabase (backend) · Stripe (payments)

---

## Phase 1: Product Catalog (MVP) — ~3-4 days

> Get products into the database and onto the screen.

### 1.1 Database — New Tables

Run via Supabase SQL Editor or add to `supabase/migrations/`.

```sql
-- Product Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2),       -- strikethrough price
  cost_per_item DECIMAL(10,2),          -- for profit tracking
  status VARCHAR(20) DEFAULT 'draft',   -- draft | active | archived
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]',            -- [{url, alt, position}]
  seo_meta JSONB DEFAULT '{}',          -- {title, description, og_image}
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Product Variants (sizes, colors, etc.)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- "Blue / Large"
  sku VARCHAR(100),
  price DECIMAL(10,2),                  -- NULL = use parent product price
  compare_at_price DECIMAL(10,2),
  inventory_quantity INTEGER DEFAULT 0,
  inventory_policy VARCHAR(20) DEFAULT 'deny',  -- deny | continue (backorder)
  weight DECIMAL(10,2),
  weight_unit VARCHAR(10) DEFAULT 'kg',
  options JSONB DEFAULT '{}',           -- {"color": "blue", "size": "L"}
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Collections (curated product groups — "Summer Sale", "Best Sellers")
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Many-to-many: products <-> collections
CREATE TABLE collection_products (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

-- RLS Policies (tenant isolation)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON products
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY "Tenant isolation" ON categories
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY "Tenant isolation" ON collections
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### 1.2 Backend — Product API Routes

Create: `backend/src/routes/products.routes.ts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/products` | List products (paginated, filterable by status/category) |
| `POST` | `/api/products` | Create product + auto-generate slug |
| `GET` | `/api/products/:id` | Get product with variants |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Soft-delete → set status = `archived` |
| `POST` | `/api/products/:id/variants` | Add variant |
| `PUT` | `/api/products/:id/variants/:variantId` | Update variant |
| `DELETE` | `/api/products/:id/variants/:variantId` | Delete variant |

Create: `backend/src/routes/categories.routes.ts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/categories` | List categories (tree structure) |
| `POST` | `/api/categories` | Create category |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE` | `/api/categories/:id` | Delete category |

**Slug generation logic:**
```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// On conflict: append -2, -3, etc.
async function uniqueSlug(base: string, tenantId: string): Promise<string> {
  let slug = base;
  let counter = 1;
  while (await slugExists(slug, tenantId)) {
    slug = `${base}-${++counter}`;
  }
  return slug;
}
```

### 1.3 Frontend — Admin Product Pages

```
frontend/src/app/admin/products/
├── page.tsx                    # Product list (table with search, filter, bulk actions)
├── create/
│   └── page.tsx                # Create product form
└── edit/
    └── [id]/
        └── page.tsx            # Edit product form (same as create, pre-filled)

frontend/src/app/admin/categories/
└── page.tsx                    # Category manager (tree view + CRUD)
```

#### Product List Page — Key Features
- Table with columns: Image thumbnail, Name, Status badge, Price, Inventory, Category
- Search by name/SKU
- Filter by: Status (Draft/Active/Archived), Category
- Bulk actions: Archive, Delete, Change Status
- "Create Product" CTA button top-right

#### Product Create/Edit Form — Fields

| Section | Fields |
|---------|--------|
| **Basic Info** | Name, Description (rich text), Status dropdown |
| **Media** | Image upload (drag-and-drop, reorderable, use existing `FilePickerModal`) |
| **Pricing** | Price, Compare-at price, Cost per item |
| **Organization** | Category (select), Tags (multi-input), Collections (multi-select) |
| **Variants** | Dynamic variant editor (add options like Color/Size, generates variant grid) |
| **SEO** | Meta title, Meta description, URL slug (editable) |

#### Variant Editor Component

```
frontend/src/components/ecommerce/
├── VariantEditor.tsx           # Add options (Color, Size), auto-generate combos
├── VariantTable.tsx            # Editable table of all variant combos
├── ProductForm.tsx             # Main create/edit form component
└── ProductImageUploader.tsx    # Drag-drop, reorder, set primary image
```

**Variant Editor UX:**
1. User clicks "Add option" → gets Option Name (e.g., "Color") + Values (e.g., "Red, Blue, Green")
2. When multiple options exist, auto-generate all combinations
3. Each combo row shows: Name, SKU, Price override, Inventory quantity
4. User can toggle individual variants active/inactive

---

## Phase 2: Storefront Components — ~2-3 days

> What the tenant's customers see on the public-facing site.

### 2.1 Product Card Styles

Create: `frontend/src/components/ecommerce/cards/`

| Card Style | Use Case | Key Visual Elements |
|------------|----------|---------------------|
| **Minimal** | Fashion, boutique | Large image, minimal text, hover-to-reveal price |
| **Standard** | General e-commerce | Image + name + price + rating + "Add to Cart" |
| **Feature-Rich** | Electronics, tools | Badges (Sale, New), compare price strikethrough, specs preview |

Each card component receives:
```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price?: number;
    images: { url: string; alt: string }[];
    status: string;
    category?: { name: string };
  };
  cardStyle?: 'minimal' | 'standard' | 'feature-rich';
  showQuickAdd?: boolean;
}
```

### 2.2 Product Grid & Listing

```
frontend/src/components/ecommerce/
├── ProductGrid.tsx             # Responsive grid with configurable columns
├── ProductFilters.tsx          # Sidebar: categories, price range, tags
├── ProductSort.tsx             # Sort dropdown: Price ↑↓, Newest, Best Selling
└── ProductSearch.tsx           # Search bar with debounced API calls
```

### 2.3 Product Detail Page

Route: `frontend/src/app/[...slug]/` — extend existing slug router to detect product pages.

```
Product Detail Layout:
┌──────────────────────────────────────────────────────┐
│  Breadcrumb: Home > Category > Product Name          │
├─────────────────────┬────────────────────────────────┤
│                     │                                │
│  ┌───────────────┐  │  Product Name                  │
│  │               │  │  ★★★★☆ (24 reviews)           │
│  │  Main Image   │  │                                │
│  │  (zoomable)   │  │  $99.00  $129.00 (strikethrough)│
│  │               │  │                                │
│  └───────────────┘  │  Color: [Red] [Blue] [Green]   │
│  ┌──┐ ┌──┐ ┌──┐    │  Size:  [S] [M] [L] [XL]      │
│  │t1│ │t2│ │t3│    │                                │
│  └──┘ └──┘ └──┘    │  Quantity: [- 1 +]             │
│  (thumbnails)       │                                │
│                     │  ┌──────────────────────────┐  │
│                     │  │     ADD TO CART  🛒       │  │
│                     │  └──────────────────────────┘  │
│                     │                                │
│                     │  ✓ Free shipping over $50      │
│                     │  ✓ 30-day returns              │
├─────────────────────┴────────────────────────────────┤
│  [Description] [Reviews] [Shipping]   (Tabs)         │
│  ─────────────────────────────────────────────────── │
│  Full product description with rich text...          │
├──────────────────────────────────────────────────────┤
│  RELATED PRODUCTS                                    │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │prod1│ │prod2│ │prod3│ │prod4│                   │
│  └─────┘ └─────┘ └─────┘ └─────┘                   │
└──────────────────────────────────────────────────────┘
```

Components needed:
```
frontend/src/components/ecommerce/
├── ProductGallery.tsx          # Main image + thumbnails, zoom on hover
├── VariantSelector.tsx         # Color/size swatches, updates price & image
├── QuantitySelector.tsx        # -/+ quantity input
├── AddToCartButton.tsx         # Add to cart with loading state
├── ProductTabs.tsx             # Description / Reviews / Shipping info tabs
└── RelatedProducts.tsx         # Grid of 4 related products (same category)
```

---

## Phase 3: Cart & Checkout — ~3-4 days

> Let customers buy things.

### 3.1 Database — Cart & Orders

```sql
-- Shopping Cart (persistent, survives browser close)
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id VARCHAR(255),              -- for guest carts
  email VARCHAR(255),                   -- guest email capture
  currency VARCHAR(3) DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  properties JSONB DEFAULT '{}',        -- custom props like engraving text
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_number VARCHAR(50) NOT NULL,    -- "ORD-001"
  customer_id UUID REFERENCES customers(id),
  email VARCHAR(255) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending', -- pending | confirmed | processing | shipped | delivered | cancelled | refunded
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid | paid | refunded | partially_refunded
  currency VARCHAR(3) DEFAULT 'USD',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_total DECIMAL(10,2) DEFAULT 0,
  shipping_total DECIMAL(10,2) DEFAULT 0,
  discount_total DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  note TEXT,
  stripe_payment_intent_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, order_number)
);

-- Order Line Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  title VARCHAR(255) NOT NULL,          -- snapshot of product name at time of order
  variant_title VARCHAR(255),
  sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  properties JSONB DEFAULT '{}'
);

-- Order number sequence (per tenant)
CREATE OR REPLACE FUNCTION generate_order_number(p_tenant_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(REPLACE(order_number, 'ORD-', '') AS INTEGER)
  ), 0) + 1 INTO next_num
  FROM orders WHERE tenant_id = p_tenant_id;
  
  RETURN 'ORD-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
```

### 3.2 Backend — Cart API

Create: `backend/src/routes/cart.routes.ts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/cart` | Get current cart (by session or customer ID) |
| `POST` | `/api/cart/items` | Add item to cart |
| `PUT` | `/api/cart/items/:id` | Update quantity |
| `DELETE` | `/api/cart/items/:id` | Remove item |
| `DELETE` | `/api/cart` | Clear entire cart |
| `POST` | `/api/cart/apply-coupon` | Validate & apply discount code |

### 3.3 Backend — Checkout & Order API

Create: `backend/src/routes/checkout.routes.ts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/checkout/create-payment-intent` | Create Stripe PaymentIntent from cart |
| `POST` | `/api/checkout/complete` | Finalize order after payment confirmation |
| `POST` | `/api/checkout/webhook` | Stripe webhook handler (payment_intent.succeeded, etc.) |

Create: `backend/src/routes/orders.routes.ts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/orders` | List orders (admin, paginated) |
| `GET` | `/api/orders/:id` | Get order details |
| `PATCH` | `/api/orders/:id/status` | Update order status (admin) |
| `POST` | `/api/orders/:id/refund` | Process refund via Stripe |

### 3.4 Frontend — Cart Drawer

```
Cart Drawer (Slide-over from right):
┌──────────────────────────────┐
│  Your Cart (3 items)    [✕]  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                              │
│  ┌────┐ Blue T-Shirt         │
│  │img │ Size: M              │
│  └────┘ $29.00  [- 2 +] [🗑] │
│                              │
│  ┌────┐ Running Shoes        │
│  │img │ Color: Black         │
│  └────┘ $89.00  [- 1 +] [🗑] │
│                              │
│  ┌────┐ Leather Wallet       │
│  │img │                      │
│  └────┘ $49.00  [- 1 +] [🗑] │
│                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Subtotal          $196.00   │
│  Shipping          Calculated│
│                    at checkout│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                              │
│  ┌──────────────────────────┐│
│  │     CHECKOUT  →          ││
│  └──────────────────────────┘│
│                              │
│  [Continue Shopping]         │
└──────────────────────────────┘
```

Components:
```
frontend/src/components/ecommerce/cart/
├── CartDrawer.tsx              # Slide-over panel
├── CartItem.tsx                # Individual item row
├── CartSummary.tsx             # Subtotal, shipping, total
├── CartContext.tsx             # React context for cart state (item count, add/remove)
└── CartIcon.tsx                # Header icon with badge count
```

### 3.5 Frontend — Checkout Flow

```
frontend/src/app/checkout/
├── page.tsx                    # Main checkout page (multi-step)
└── confirmation/
    └── page.tsx                # Order confirmed + summary
```

```
Checkout Steps:
┌──────────────────────────────────────────────────────────┐
│  Step 1               Step 2               Step 3        │
│  ● Information        ○ Shipping           ○ Payment     │
├──────────────────────────────┬───────────────────────────┤
│                              │                           │
│  Contact                     │  ORDER SUMMARY            │
│  ┌──────────────────────┐    │                           │
│  │ Email *              │    │  ┌────┐ Blue T-Shirt × 2  │
│  └──────────────────────┘    │  │img │ $58.00            │
│                              │  └────┘                   │
│  Shipping Address            │  ┌────┐ Shoes × 1        │
│  ┌───────────┐┌────────────┐ │  │img │ $89.00            │
│  │First Name ││ Last Name  │ │  └────┘                   │
│  └───────────┘└────────────┘ │                           │
│  ┌──────────────────────┐    │  ━━━━━━━━━━━━━━━━━━━━━━  │
│  │ Address line 1       │    │  Subtotal     $147.00     │
│  └──────────────────────┘    │  Shipping     $5.99       │
│  ┌──────────────────────┐    │  Tax          $12.49      │
│  │ City                 │    │  ━━━━━━━━━━━━━━━━━━━━━━  │
│  └──────────────────────┘    │  Total        $165.48     │
│  ┌──────────┐┌───────┐      │                           │
│  │ State    ││ ZIP   │      │  ┌──────────────────────┐ │
│  └──────────┘└───────┘      │  │Have a code? ▾        │ │
│                              │  └──────────────────────┘ │
│  ┌──────────────────────────┐│                           │
│  │   Continue to Shipping → ││                           │
│  └──────────────────────────┘│                           │
└──────────────────────────────┴───────────────────────────┘
```

### 3.6 Stripe Integration

Install: `npm install stripe @stripe/stripe-js @stripe/react-stripe-js`

**Backend setup** — `backend/src/services/stripe.service.ts`:
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export async function processRefund(paymentIntentId: string, amount?: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined, // full refund if no amount
  });
}
```

**Webhook handler** — `backend/src/routes/checkout.routes.ts`:
```typescript
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Mark order as paid, decrement inventory, send confirmation email
      break;
    case 'payment_intent.payment_failed':
      // Mark order as failed, notify customer
      break;
  }
  res.json({ received: true });
});
```

**Frontend payment form** — use Stripe Elements (PCI-compliant iframe):
```typescript
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

**Environment variables needed:**
```env
# Backend
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Phase 4: Order Management (Admin) — ~2 days

> Admin panel for managing orders.

### 4.1 Frontend — Admin Order Pages

```
frontend/src/app/admin/orders/
├── page.tsx                    # Order list (table with status filters)
└── [id]/
    └── page.tsx                # Order detail view
```

#### Order List Page

| Column | Details |
|--------|---------|
| Order # | `ORD-0001` — clickable link to detail |
| Customer | Name + email |
| Status | Badge: `Pending` `Confirmed` `Shipped` `Delivered` `Cancelled` |
| Payment | Badge: `Paid` `Unpaid` `Refunded` |
| Total | Formatted currency |
| Date | Relative time ("2 hours ago") |
| Actions | `⋮` menu → View, Update Status, Refund |

#### Order Detail Page

```
┌───────────────────────────────────────────────────────┐
│  ← Orders    ORD-0042              Status: Confirmed  │
│              Jan 15, 2025          Payment: Paid ✓     │
├───────────────────────────────┬───────────────────────┤
│                               │                       │
│  ORDER ITEMS                  │  CUSTOMER              │
│  ┌────────────────────────┐   │  John Doe              │
│  │ Blue T-Shirt × 2       │   │  john@example.com     │
│  │ Size: M · $29.00 each  │   │                       │
│  │ Subtotal: $58.00       │   │  SHIPPING ADDRESS     │
│  └────────────────────────┘   │  123 Main St          │
│  ┌────────────────────────┐   │  San Francisco, CA    │
│  │ Running Shoes × 1      │   │  94102, US            │
│  │ Color: Black · $89.00  │   │                       │
│  └────────────────────────┘   │  BILLING ADDRESS      │
│                               │  Same as shipping     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━  │                       │
│  Subtotal        $147.00      │                       │
│  Shipping        $5.99        │                       │
│  Tax             $12.49       │                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ACTIONS              │
│  Total           $165.48      │  [Update Status ▾]    │
│                               │  [Issue Refund]       │
│  Stripe ID: pi_3N...         │  [Print Invoice]      │
│                               │                       │
├───────────────────────────────┴───────────────────────┤
│  ORDER TIMELINE                                       │
│  ● Jan 15 10:32 — Order placed                        │
│  ● Jan 15 10:32 — Payment received ($165.48)          │
│  ● Jan 15 14:15 — Status changed to Confirmed         │
│  ○ Awaiting shipment...                               │
└───────────────────────────────────────────────────────┘
```

### 4.2 Wire into Existing Admin Sidebar

Update `AdminSidebar.tsx` to add:
```typescript
{ name: 'Products', href: '/admin/products', icon: Package },
{ name: 'Categories', href: '/admin/categories', icon: FolderTree },
{ name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
```

---

## Phase 5: Discounts & Coupons — ~1 day

### 5.1 Database

```sql
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,            -- percentage | fixed_amount | free_shipping
  value DECIMAL(10,2) NOT NULL,         -- 10 for 10% or $10
  min_order_amount DECIMAL(10,2),       -- minimum order to use code
  usage_limit INTEGER,                  -- max total uses
  usage_limit_per_customer INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  applies_to JSONB DEFAULT '{}',        -- {product_ids: [], category_ids: [], collection_ids: []}
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, code)
);
```

### 5.2 Backend

Create: `backend/src/routes/discounts.routes.ts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/discounts` | List all discount codes (admin) |
| `POST` | `/api/discounts` | Create discount code |
| `PUT` | `/api/discounts/:id` | Update discount |
| `DELETE` | `/api/discounts/:id` | Delete discount |
| `POST` | `/api/discounts/validate` | Validate code at checkout (public) |

### 5.3 Frontend

```
frontend/src/app/admin/discounts/
├── page.tsx                    # Discount list
└── create/
    └── page.tsx                # Create/edit discount form
```

---

## Phase 6: Inventory & Shipping — ~2 days

### 6.1 Inventory Tracking

- Track `inventory_quantity` on `product_variants` table
- On order confirmed: decrement inventory
- On refund/cancel: increment inventory
- Admin alert when stock < configurable threshold (default: 5)

### 6.2 Shipping

```sql
CREATE TABLE shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- "United States"
  countries JSONB NOT NULL,             -- ["US", "CA"]
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- "Standard Shipping"
  type VARCHAR(20) DEFAULT 'flat',      -- flat | weight_based | price_based
  price DECIMAL(10,2) NOT NULL,
  free_above DECIMAL(10,2),             -- free shipping threshold
  min_weight DECIMAL(10,2),
  max_weight DECIMAL(10,2),
  estimated_days VARCHAR(50),           -- "3-5 business days"
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 6.3 Store Settings (Per Tenant)

```sql
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  currency_code VARCHAR(3) DEFAULT 'USD',
  currency_symbol VARCHAR(5) DEFAULT '$',
  weight_unit VARCHAR(10) DEFAULT 'kg',
  default_tax_rate DECIMAL(5,4) DEFAULT 0,  -- 0.0825 = 8.25%
  enable_guest_checkout BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## File Structure Summary

After all phases, the new files created:

```
backend/src/routes/
├── products.routes.ts          [NEW]
├── categories.routes.ts        [NEW]
├── cart.routes.ts               [NEW]
├── checkout.routes.ts           [NEW]
├── orders.routes.ts             [NEW]
├── discounts.routes.ts          [NEW]
└── shipping.routes.ts           [NEW]

backend/src/services/
└── stripe.service.ts            [NEW]

frontend/src/app/admin/
├── products/
│   ├── page.tsx                 [NEW]
│   ├── create/page.tsx          [NEW]
│   └── edit/[id]/page.tsx       [NEW]
├── categories/page.tsx          [NEW]
├── orders/
│   ├── page.tsx                 [NEW]
│   └── [id]/page.tsx            [NEW]
├── discounts/
│   ├── page.tsx                 [NEW]
│   └── create/page.tsx          [NEW]
└── shipping/page.tsx            [NEW]

frontend/src/app/checkout/
├── page.tsx                     [NEW]
└── confirmation/page.tsx        [NEW]

frontend/src/components/ecommerce/
├── cards/
│   ├── MinimalCard.tsx          [NEW]
│   ├── StandardCard.tsx         [NEW]
│   └── FeatureRichCard.tsx      [NEW]
├── ProductGrid.tsx              [NEW]
├── ProductFilters.tsx           [NEW]
├── ProductSort.tsx              [NEW]
├── ProductGallery.tsx           [NEW]
├── VariantSelector.tsx          [NEW]
├── VariantEditor.tsx            [NEW]
├── QuantitySelector.tsx         [NEW]
├── AddToCartButton.tsx          [NEW]
├── ProductTabs.tsx              [NEW]
├── RelatedProducts.tsx          [NEW]
├── ProductForm.tsx              [NEW]
├── ProductImageUploader.tsx     [NEW]
└── cart/
    ├── CartDrawer.tsx           [NEW]
    ├── CartItem.tsx             [NEW]
    ├── CartSummary.tsx          [NEW]
    ├── CartContext.tsx           [NEW]
    └── CartIcon.tsx             [NEW]

supabase/migrations/
└── 00X_ecommerce_tables.sql     [NEW]
```

**Total new files: ~40 files**

---

## Quick Start Checklist

```
Phase 1: Product Catalog         ☐ Migration → ☐ Routes → ☐ Admin pages → ☐ Test
Phase 2: Storefront Components   ☐ Cards → ☐ Grid → ☐ Detail page → ☐ Test
Phase 3: Cart & Checkout         ☐ Cart DB → ☐ Cart API → ☐ CartDrawer → ☐ Stripe → ☐ Checkout page → ☐ Test
Phase 4: Order Management        ☐ Order list → ☐ Order detail → ☐ Status updates → ☐ Test
Phase 5: Discounts               ☐ Migration → ☐ Routes → ☐ Admin page → ☐ Checkout integration → ☐ Test
Phase 6: Inventory & Shipping    ☐ Stock tracking → ☐ Shipping zones → ☐ Store settings → ☐ Test
```

---

## Related Docs

- [Architecture](../architecture.md) — Multi-tenant RBAC
- [E-commerce Architecture](./ecommerce-saas-architecture.md) — Original vision doc
- [Pending Work](./PENDING-WORK.md) — Full project status tracker
- [Bizzabo Reference](./bizzabo-architecture-reference.md) — UI/UX patterns inspiration
