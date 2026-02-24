# 📋 Orbitly — Pending Tasks & Roadmap

> **Last Updated**: Feb 24, 2026  
> This document tracks all frontend pages and features that still need backend wiring, database tables, or API integration.

---

## 🔴 Critical: Admin Pages Using Mock/Static Data

These pages have polished UI but are **hardcoded with fake data** — they need database tables, backend API routes, and frontend API client integration.

### 1. Customers (`/admin/customers`)
- **Current**: 166-line page with mock customers array
- **Needs**:
  - [ ] `customers` DB table + migration
  - [ ] Backend CRUD routes (`customers.routes.ts`)
  - [ ] Frontend `customersApi` in `api.ts`
  - [ ] Wire page to real data with `useEffect` fetch

### 2. Payments (`/admin/payments`)
- **Current**: 423-line dashboard with hardcoded transactions, revenue bars, balance
- **Needs**:
  - [ ] Wire to real Stripe API (balance, transactions, payouts)
  - [ ] Pull revenue data from `orders` table aggregation
  - [ ] Backend endpoint: `GET /api/payments/summary`
  - [ ] Replace mock `transactions[]` with real order data

### 3. Users / Team (`/admin/users`)
- **Current**: 146-line page with 4 hardcoded users
- **Needs**:
  - [ ] Backend route to list tenant users via Supabase Admin API
  - [ ] Invite user flow (send invite email, assign role)
  - [ ] Role update + user removal endpoints
  - [ ] Frontend `usersApi` in `api.ts`

### 4. Forms (`/admin/forms`)
- **Current**: 178-line page with mock forms and submission counts
- **Needs**:
  - [ ] `forms` + `form_submissions` DB tables + migration
  - [ ] Backend CRUD routes (`forms.routes.ts`)
  - [ ] Public submission endpoint (no auth)
  - [ ] Frontend `formsApi` in `api.ts`
  - [ ] Form builder UI (drag-and-drop field creation)

### 5. Modules (`/admin/modules`)
- **Current**: 280-line page with hardcoded module blocks
- **Needs**:
  - [ ] Decide: is this page-builder blocks or tenant feature toggles?
  - [ ] If blocks → wire to `tenant_modules` table
  - [ ] If features → add enable/disable API per tenant
  - [ ] Frontend API integration

---

## 🟡 Partially Done: UI Exists, Missing Key Features

### 6. Admin Dashboard (`/admin`)
- [ ] Replace hardcoded analytics with real data
- [ ] Backend endpoint: `GET /api/dashboard/stats` (orders count, revenue, users, page views)
- [ ] Revenue chart pulling from `orders` table by date

### 7. Blog (`/admin/blog`)
- [ ] Verify blog post create/edit flow works end-to-end
- [ ] Wire publish/unpublish toggle
- [ ] Public blog listing page (`/blog`)
- [ ] Public blog post page (`/blog/[slug]`)

### 8. Events (`/admin/events`)
- [ ] Verify event create/edit forms are fully wired
- [ ] Public events listing page (`/events`)
- [ ] Public event detail page (`/events/[slug]`)
- [ ] Registration form on public event page

### 9. Order Detail (`/admin/orders/:id`)
- [ ] Create order detail page (line items, customer info, timeline)
- [ ] Wire "View" button in orders table to navigate to detail
- [ ] Status update actions (mark as shipped, delivered, etc.)

### 10. Product Management
- [ ] `FilePickerModal` integration for product image uploads
- [ ] Variant image assignment
- [ ] Bulk product actions (delete, publish, unpublish)

---

## 🟢 Missing: New Public-Facing Pages

### 11. Shopping Cart
- [ ] Cart state management (Zustand or Context)
- [ ] Cart drawer/slide-over component
- [ ] Add-to-cart from product grid and detail pages
- [ ] Cart → Stripe Checkout flow (multi-item)

### 12. User Account Area
- [ ] Post-login customer dashboard
- [ ] Order history page (`/account/orders`)
- [ ] Profile settings (`/account/settings`)

### 13. Public Blog
- [ ] Blog listing page with pagination (`/blog`)
- [ ] Individual blog post rendering (`/blog/[slug]`)
- [ ] SEO metadata for blog posts

### 14. Public Events
- [ ] Events listing page (`/events`)
- [ ] Event detail with registration (`/events/[slug]`)
- [ ] Registration confirmation page

---

## 🔧 Infrastructure / Backend Gaps

| Item | Type | Priority |
|------|------|----------|
| `customers` table + RLS | Migration | High |
| `forms` + `form_submissions` tables | Migration | Medium |
| `GET /api/dashboard/stats` | Endpoint | High |
| `GET /api/payments/summary` | Endpoint | Medium |
| User management via Supabase Admin | Endpoint | High |
| `FilePickerModal` component | Component | Medium |
| Cart state persistence | Feature | Medium |

---

## ✅ Completed (For Reference)

- [x] Product CRUD (list, create, edit, delete, variants)
- [x] Category CRUD
- [x] Stripe Connect onboarding (Settings → Payments tab)
- [x] Stripe Checkout sessions + BuyNowButton
- [x] Webhook → order + order_items creation
- [x] Orders admin table with status badges
- [x] Public storefront (`/store`)
- [x] Product detail page (`/products/[slug]`)
- [x] Checkout success/cancel pages
- [x] Page builder (TinyMCE + GrapesJS)
- [x] Asset/file manager
- [x] Multi-tenant resolution
- [x] Auth (login, Google OAuth, JWT)
