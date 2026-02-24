# Orbitly — Pending Work Tracker

> Last updated: 2026-02-22

---

## 🟢 What's Done

### Infrastructure & Auth
- [x] Multi-tenant architecture with Supabase (RLS, tenant isolation)
- [x] JWT auth middleware + super admin role enforcement
- [x] Dynamic tenant resolution via hostname (`resolve-tenant.ts`, `tenant_domains`)
- [x] Admin setup script (`setup-admin.ts`)
- [x] Supabase migrations (7 migration files)
- [x] Backend Docker containerization + deployment config

### Super-Admin Panel (Separate App)
- [x] Auth (login/logout)
- [x] Tenant CRUD (create, list, delete)
- [x] User management (list, assign tenant, change role)

### Backend API Routes
- [x] `auth.routes.ts` — Login, register, JWT tokens
- [x] `admin.routes.ts` — Tenant CRUD, user management, module toggle
- [x] `tenant.routes.ts` — Tenant settings, design/branding, domain management
- [x] `pages.routes.ts` — Page CRUD (save/publish content)
- [x] `events.routes.ts` — Event CRUD with image uploads
- [x] `registrations.routes.ts` — Event attendee registrations
- [x] `speakers.routes.ts` — Speaker management
- [x] `assets.routes.ts` — File/media management
- [x] `templates.routes.ts` — Page templates
- [x] `public.routes.ts` — Public resolve-tenant endpoint

### Frontend Admin Panel
- [x] Admin layout (sidebar, header)
- [x] Admin dashboard page (hardcoded stats)
- [x] Studio / Page Builder (`/admin/studio`) — TinyMCE block manager
- [x] Pages management (`/admin/pages`) — Page list + create-block
- [x] Events management (`/admin/events`) — Event list with image uploads
- [x] Blog page (`/admin/blog`) — List view
- [x] Customers page (`/admin/customers`) — List view
- [x] Payments/Orders page (`/admin/payments`) — Order table
- [x] Settings page (`/admin/settings`)
- [x] Modules toggle page (`/admin/modules`)
- [x] Tenant management (`/admin/tenants`)
- [x] User management (`/admin/users`)
- [x] Public site renderer (`[...slug]/page.tsx`)

---

## 🔴 Critical — Not Started

### 1. E-commerce Module
> Architecture defined in `docs/ecommerce-saas-architecture.md` but zero code exists.

- [ ] **Database tables**: `products`, `product_variants`, `categories`, `collections`, `cart`, `order_items`, `inventory_levels`, `inventory_locations`, `discounts`, `shipping_zones`, `shipping_rates`, `tax_zones`, `store_settings`, `reviews`, `seo_redirects`
- [ ] **Backend routes**: Product CRUD, cart API, checkout flow, order management, inventory, discounts
- [ ] **Frontend — Product Management**: Create/edit product page, variant editor, image gallery, category/collection management
- [ ] **Frontend — Storefront Components**: Product cards (glassmorphic, minimal, feature-rich, social), product grid, product detail page, variant selector
- [ ] **Frontend — Cart & Checkout**: Cart drawer, checkout form (info → shipping → payment → confirmation)
- [ ] **Stripe Integration**: Payment intents, webhooks, Stripe Elements, PCI compliance
- [ ] **Inventory Management**: Multi-location stock tracking, low stock alerts, adjustment history

### 2. Launchpad Niche
> Defined as "Pre-launch waitlists, early-bird campaigns" but nothing built.

- [ ] **Database tables**: `waitlists`, `campaigns`, `subscribers`
- [ ] **Backend routes**: Waitlist CRUD, campaign management, subscriber sign-up
- [ ] **Frontend pages**: Waitlist builder, campaign dashboard, subscriber management

### 3. Email Notifications
- [ ] Resend (or similar) integration
- [ ] Order confirmation emails
- [ ] Event registration confirmation emails
- [ ] Password reset emails
- [ ] Low stock alert notifications
- [ ] Welcome email on user sign-up

### 4. Custom Domain Automation
- [ ] Cloudflare for SaaS integration (SSL for SaaS)
- [ ] Auto SSL certificate provisioning when tenant adds custom domain
- [ ] Edge worker for `Host` header → tenant resolution

---

## 🟡 Partially Done — Needs Completion

### 5. Dashboard Stats — Hardcoded
> `frontend/src/app/admin/page.tsx` shows fake numbers (`25 pages`, `2,350 customers`).

- [ ] Create backend `/api/dashboard/stats` endpoint (count pages, customers, events, forms)
- [ ] Wire frontend dashboard to call the real API
- [ ] Add real "Recent Activity" feed (audit log table + API)

### 6. Blog Module — List Only, No CRUD
> Blog list page exists at `/admin/blog` but cannot create or edit posts.

- [ ] Create/Edit blog post page with rich text editor
- [ ] Blog post API calls wired to backend
- [ ] Blog post detail page for public site
- [ ] Blog post SEO metadata (title, description, og:image)

### 7. Forms Module — Shell Only
> Forms admin page exists at `/admin/forms` but has no builder or submission handling.

- [ ] Form builder UI (add/remove fields, field types, validation rules)
- [ ] Form submission API (`POST /api/forms/:id/submit`)
- [ ] Form responses viewer in admin panel
- [ ] Public-facing form embed/render for tenant sites

### 8. Page Builder — Pipeline Not Fully Connected
- [ ] End-to-end test: Studio save → API persist → public page render
- [ ] Verify `/admin/pages/builder` is functional or remove orphaned code
- [ ] Live preview of public-facing page from within the Studio

### 9. Authentication Flow — Gaps
- [ ] Password reset flow (forgot password → email → reset page)
- [ ] Email verification on registration
- [ ] Onboarding page (`/onboarding`) — currently just a placeholder
- [ ] Session refresh / token renewal

### 10. Event Management — Polish Needed
- [ ] Event edit page — image removal flags (`remove_event_logo`, `remove_event_banner`) tested end-to-end
- [ ] Event detail/preview on the public site
- [ ] Registration confirmation page for attendees

### 11. Super Admin Panel — Analytics Missing
- [ ] System-wide analytics dashboard (total tenants, total users, storage usage)
- [ ] Real system health monitoring (not just hardcoded "99.9%")
- [ ] Audit log viewer (who did what, when)

### 12. Design/Branding — Verification Needed
- [ ] Confirm logo/favicon/og_image changes actually appear on tenant's public site
- [ ] Test branding changes propagate to all tenant pages (not just admin)

---

## ⏳ Long-term / Nice-to-Have

- [ ] Multi-user collaboration (real-time editing)
- [ ] Page templates marketplace
- [ ] A/B testing framework
- [ ] White-label options for the admin panel
- [ ] POS integration (for e-commerce niche)
- [ ] Wholesale / B2B pricing
- [ ] Subscription products
- [ ] Cloudflare WAF + Bot Management rules
- [ ] Analytics dashboard (Google Analytics integration or built-in)
- [ ] Bulk import/export (products, customers, blog posts)
- [ ] Webhook system for third-party integrations

---

## 🟢 Recommended Priority Order

| Priority | Task | Effort |
|----------|------|--------|
| 1 | Wire dashboard stats to real API | ~2 hours |
| 2 | Complete Blog CRUD (create/edit pages) | ~4 hours |
| 3 | Form builder + submission handling | ~1 day |
| 4 | Auth flow (password reset, email verify) | ~4 hours |
| 5 | Page Builder end-to-end pipeline | ~4 hours |
| 6 | E-commerce Phase 1 — Product CRUD | ~3-4 days |
| 7 | Stripe checkout integration | ~2 days |
| 8 | Email notifications (Resend) | ~4 hours |
| 9 | Custom domain automation (Cloudflare) | ~2 days |
| 10 | Launchpad niche | ~3 days |

---

## Related Docs

- [Architecture](../architecture.md)
- [E-commerce Architecture](./ecommerce-saas-architecture.md)
- [Tenant Management](../TENANT-MANAGEMENT.md)
- [Tenant ID Setup](./TENANT-ID-SETUP.md)
- [Production Deployment](../PRODUCTION-DEPLOYMENT.md)
- [Project Summary](../PROJECT-SUMMARY.md)
