# Multi-Niche Website Builder – Product & Architecture Spec

## 🌐 What Are We Building?

We are creating a **Multi‑Niche Website Builder SaaS** that will be used by different clients like:

- Solo SaaS founders (launch pages, SaaS marketing sites)
- Indie e‑commerce brands (single or small catalog stores)
- Event organizers (event landing + RSVP)
- Real‑estate agents (property listing sites)
- Freelancers / agencies (static/portfolio sites)

Each client will:

- Use their **own domain** (like `indieanalytics.com`, `mybrand.store`)
- Have their **own public website(s)** (multiple projects per tenant)
- Have their own **admin dashboard + visual page builder**
- Store assets (logos, images, docs) in their own isolated space
- Optionally connect **email sending** (transactional + contact form) from their domain
- Optionally accept **payments** (Stripe / Paddle / external checkout) depending on niche

All of this runs on **one shared multi‑tenant system** with strong tenant isolation.

---

## ⚖️ Tech Stack We’re Using

### Frontend: Next.js (React, App Router)

- Public‑facing sites (SEO‑optimized, SSR/SSG)
- Admin dashboard at `/app` (or `/app/[tenantSlug]/...`)
- Multi‑tenant routing via Edge Middleware (domain → tenant + project)

### Builder Engine & UI

- Page Builder Core: **Craft.js** (headless, React‑based editor)
- Drag & Drop: **dnd‑kit** (for fine‑grained dragging, sorting, reordering)
- Forms & Settings: `react-hook-form` + `zod` + `@hookform/resolvers`
- Rich Content: Slate.js or TipTap for rich text blocks
- Styling: Tailwind CSS, tailwind‑merge, clsx, CSS variables for themes
- Animations: Framer Motion (page transitions, in‑builder animations)

### Backend / Platform: Supabase

- Auth: Supabase Auth (email, magic link, OAuth)
- Database: Postgres with **Row‑Level Security** for multi‑tenant isolation
- Storage: Supabase Storage for images, assets, templates
- Edge Functions:
  - Publish pages, handle domain mapping, webhooks
  - Validate layout JSON before saving/publishing

### State & Data Layer

- TanStack Query – server state & caching (projects, pages, analytics)
- Zustand + immer – local editor state (selected block, hover, history UI)

### Email

- SMTP (per tenant) or transactional provider (Resend / Mailgun / Postmark)
- Per‑tenant sender identities (e.g. `no-reply@indieanalytics.com`)

### Payments (later phase)

- Stripe or Paddle for subscriptions (your SaaS billing)
- For client sites:
  - E‑com: Stripe Checkout / Payment Links / Gumroad
  - Launch pad: simple checkout or link‑out to other providers

### SEO

- Dynamic meta tags per page
- OpenGraph tags
- Sitemaps per project/domain

---

## 🧑‍💼 Client Onboarding (Self‑Serve + Internal Admin)

### `/` – Public Marketing Site

- Explains product, niches, pricing
- CTA: “Start for free”

### Self‑Serve Signup Flow (Client Side)

1. **Signup / Login**
   - Supabase Auth (email/magic link/OAuth)

2. **Create Workspace (Tenant)**
   - Form fields:
     - Brand / Company Name
     - Subdomain (e.g. `indieanalytics`)
     - Primary goal / niche: Launch / E‑com / Events / Real Estate / Portfolio

3. **Create First Project**
   - Project Name (e.g. “IndieAnalytics Launch Site”)
   - Project Type (`launch`, `ecom`, `event`, `real_estate`, `static`)
   - Pre‑select starter template

4. **Seed Data**

   On submit:

   - Create `tenant` row
   - Create initial `project` linked to tenant
   - Seed one or more `pages` with base layout JSON (home page, maybe about/contact)
   - Optionally create basic collections depending on type:
     - `products` for e‑com
     - `events` for event type
     - `properties` for real estate
     - `launch_campaigns` + `launch_waitlist` for launch pad

5. **Redirect**

   - Redirect to `/app/[tenantSlug]/projects/[projectId]/onboarding`

---

## 🧑‍💻 Internal Super‑Admin Onboarding (Manual Controlled)

Route: `/super-admin` – **Internal Admin Panel** (for platform team only)

- Accessible only to internal staff via a separate auth mechanism (e.g. Supabase “staff” role or separate user pool).

### Feature: “Add New Client” form

Form Fields:

- Client / Brand Name: `Rare Evo`
- Tenant Slug: `rareevo`
- Domain (optional at start): `rareevo.io`
- Admin Email + Name
- Upload Logo
- Select Plan: Free / Pro / Agency / Custom
- Primary Use Case: Launch / E‑com / Event / Real Estate / Portfolio

On submit:

- Create `tenant`
- Create default `project` (e.g. `Rare Evo Main Site`)
- Seed base layout JSON for core pages depending on chosen niche
- Create admin user (membership: `admin`)
- Optionally pre‑attach custom domain mapping
- Send welcome email with login link + quickstart guide
- Redirect internal admin to new tenant overview page

### Welcome Email Sample

Subject: `Welcome to [YourProduct] – Your site builder is ready!`

Body:

> Hello [Admin Name],
>
> Your website workspace is ready at:
> 🔗 https://[tenantSlug].yourbuilder.com/app
>
> You can log in using this email: [admin@example.com].
>
> Start by choosing a template, editing your home page, and hitting publish.
>
> Need help? Just reply to this email.
>
> – The [YourProduct] Team

---

## 🎯 First Login Onboarding (Client Side)

Path: `/app/[tenantSlug]/projects/[projectId]/onboarding`

Steps:

1. **Brand Basics**
   - Upload logo and favicon
   - Choose brand colors + fonts (stored as tenant‑level design tokens)

2. **Select Niche Options**
   - Confirm primary niche (Launch / E‑com / Events / Real Estate / Portfolio)
   - Toggle secondary modules:
     - Blog
     - Forms (contact, waitlist, lead capture)
     - Simple Analytics

3. **Content Kickstart**
   - Auto‑generate a home page structure
   - Quick checklist:
     - Update headline & subheadline
     - Add a primary CTA
     - Fill basic about section

4. **Domain & Publish**
   - Step 1: preview on subdomain `projectSlug.sites.yourproduct.com`
   - Step 2: optionally connect custom domain later via `/settings/domains`

After finishing:

- Redirect to full admin dashboard: `/app/[tenantSlug]/projects/[projectId]/overview`

---

## 🪑 Tenants, Projects, and Niche Types

- Each **Client** is a **Tenant**.
- Each tenant can have multiple **Projects**:
  - Example:
    - Project 1: “Main SaaS Launch Site” (`type = 'launch'`)
    - Project 2: “Docs & Changelog” (`type = 'static'`)
    - Project 3: “Event Landing 2025” (`type = 'event'`)

**Linking content:**

- `tenants` → top‑level account
- `projects` → per‑site instance with a `type` (launch/ecom/event/real_estate/static)
- Niche‑specific tables link via `project_id`:
  - `products`, `events`, `properties`, `launch_campaigns`, etc.
- `pages` + `page_versions` → store layout JSON for each page

---

## 🌐 Frontend Overview (Next.js)

- **One Next.js codebase** for all tenants and projects.
- Each **domain** points to the same deployment:
  - `indieanalytics.com`
  - `mybrand.store`
  - `coolconf2025.com`
- Edge Middleware / server logic resolves the tenant & project:

```ts
const hostname = request.headers.get('host'); // e.g., indieanalytics.com
// Lookup in `domains` or infer from subdomain
// Resolve: tenant_id, project_id, project_type
```

Based on this, the app:

- Shows the right **theme**, logo, and navigation
- Renders pages from **page layouts** JSON per project
- Enables or hides features depending on project `type` (e.g. E‑com pages vs Event pages)

Public routes (examples depending on niche):

- `/` – Home
- `/products`, `/product/[slug]` – E‑com
- `/events`, `/event/[slug]` – Events
- `/properties`, `/property/[slug]` – Real estate
- `/blog`, `/blog/[slug]` – Blog
- `/contact`, `/about`, `/pricing` – Static pages

---

## 📘 Backend Overview (Supabase)

- Only **one Supabase project** used for all tenants.
- It handles:
  - Auth (Supabase Auth) for users across tenants
  - All Postgres queries with **RLS** for tenant isolation
  - Storage for assets (segmented by `tenant_id`)
  - Edge Functions for:
    - Publish workflows
    - Domain verification
    - Analytics logging (page views, events)

Every request from the frontend includes:

- Supabase JWT (with `user_id`)
- Tenant + project context resolved from domain and/or path

Supabase policies ensure:

- Data is scoped by `tenant_id` via `memberships` and `projects` relations.

---

## 📊 Key Tables in the Database

Core multi‑tenant:

- `tenants` → each client account
- `memberships` → link between `users` and `tenants` (role: admin/editor/viewer)
- `projects` → individual sites per tenant with `type` (`launch`, `ecom`, `event`, `real_estate`, `static`)
- `pages` → per‑project pages (slug, name, status, `layout_json`)
- `page_versions` → version history for each page

Niche‑specific:

- **Launch / SaaS**
  - `launch_campaigns` → launch date, status, etc.
  - `launch_waitlist` → captured emails for campaign

- **E‑com**
  - `products` → simple products (name, price, description, image_url, status)
  - (Later) `product_categories`, `product_reviews`

- **Events**
  - `events` → event data for project (title, date, time, location, status)
  - `event_registrations` → name, email, ticket type, status

- **Real estate**
  - `properties` → title, price, address, attributes (bedrooms, baths), image_url

Shared / system:

- `assets` → uploaded files (path, tenant_id, project_id, type)
- `forms` → form definitions (contact, waitlist, lead, RSVP)
- `form_submissions` → submissions tied to form + project
- `domains` → custom domains per project
- `seo_meta` → per‑page SEO (title, description, OG tags, index/follow flags)
- `page_views` → basic analytics events
- `tenant_settings`, `tenant_branding` → per‑tenant configuration

---

## 🔑 Admin Dashboard Features (Next.js)

Accessible at:

- `tenantSlug.yourproduct.com/app`
- or custom domain: `indieanalytics.com/app` (depending on mapping)

### ✏️ Project Setup

- Create new project (site) under a tenant:
  - Project name
  - Type: Launch / E‑com / Event / Real Estate / Static
  - Choose starter template
- Manage project metadata:
  - Default language, time zone
  - Published / draft switches

### 🌍 Drag‑and‑Drop Page Builder

- Visual builder for all key pages:
  - Home, Pricing, Features, Checkout (for launch/e‑com)
  - Event pages (for event type)
  - Listings and detail pages (for properties)
- Drag blocks like:
  - Hero sections, CTA bars
  - Feature / Benefit cards (multiple styles)
  - Product grids and product cards
  - Event hero, schedule, speaker grid
  - Property grid, property details
  - Testimonials, FAQs, logos, maps, forms
- Page preview & responsive preview (desktop/tablet/mobile)
- Layout saved as **JSON** in `pages.layout_json`
- Pages rendered dynamically from JSON at runtime

### 📃 Page SEO Settings

Each page supports:

- Meta Title
- Meta Description
- OG Title / Description / Image
- Canonical URL
- Index / NoIndex toggle
- Follow / NoFollow toggle

Stored in `seo_meta` table and injected into `<head>` via server components.

### 🧾 Forms & Leads

- Define forms (contact, waitlist, custom lead forms)
- Configure:
  - Thank‑you message
  - Optional redirect URL
  - Email notifications (to site owner)
- View submissions per project (with export to CSV)

### 🛒 E‑commerce (if project type = `ecom`)

- Product management:
  - Create/edit products (name, price, description, images)
  - Toggle visibility (draft/published)
- Set checkout mode:
  - Stripe Checkout / Payment Link URL
  - External checkout link (Gumroad, Lemon Squeezy, etc.)
- View product analytics (views, clicks on “Buy” / “Add to cart”)

### 🎟 Events (if project type = `event`)

- Create and manage events (for that site)
- Configure:
  - Event date/time/location
  - Registration form fields
- View registrations (name, email, status)
- Export attendees list

### 🏡 Real Estate (if project type = `real_estate`)

- Manage properties:
  - Basic details: title, description, price, address, attributes
  - Upload images (stored in Supabase Storage)
- View leads (form submissions per property)

### 📊 Analytics

- Per project:
  - Page views per page
  - Top referrers
  - Conversion events (form submissions, signups, clicks on key CTAs)
- Visualized via Chart.js in the dashboard.

### 🎨 Branding

- Upload logo, favicon, background images
- Set primary/secondary colors
- Configure fonts (pre‑defined font pairs for simplicity)
- All saved as design tokens applied across that project or tenant.

### 📑 Blog (optional module)

- Create/edit blog posts (title, slug, content, image, SEO meta)
- Blog index at `/blog`
- Post detail pages at `/blog/[slug]`

---

## 📱 Public Site Behavior

Same frontend codebase handles all sites:

- Domain + path → determine:
  - Tenant
  - Project
  - Page (by slug)

Public routes:

- `/` – resolved to project’s home page (`pages.slug = 'home'`)
- `/:slug` – generic page (about, pricing, etc.)
- Niche routes (if modules enabled):
  - `/products`, `/product/[slug]`
  - `/events`, `/event/[slug]`
  - `/properties`, `/property/[slug]`
  - `/blog`, `/blog/[slug]`

SEO meta is loaded from the `seo_meta` table and attached server‑side. OpenGraph images are served from Supabase Storage URLs.

---

## 🚗 Deploying for Clients

- Deploy **Next.js app** once (e.g. on Vercel)
- Use **Supabase** as a shared backend (single project)

Each client:

- Points their domain (e.g. `indieanalytics.com`) to the Vercel app
- Adds domain entry in platform (`domains` table)
- Middleware resolves domain → tenant + default project

Result:

- No duplication of code or app per client
- All clients run on a single, well‑secured multi‑tenant system.

---

## 📧 Sending Emails from Client’s Own Domain

We support sending emails like:

- `contact@indieanalytics.com`
- `hello@mybrand.store`

Two main patterns:

### Option 1: Per‑tenant SMTP

- Client provides:
  - SMTP host, port, username, password
  - From address & name
- Stored securely (encrypted) in DB
- Edge Functions / backend send emails **through their SMTP**
- Pros: full control for client, branding perfect
- Cons: more setup for client

### Option 2: Central Provider (Resend / Mailgun / Postmark / SES)

- You maintain a single or few email provider accounts
- Each tenant’s domain is configured once with SPF/DKIM (DNS records)
- Emails are sent:
  - `From: Brand Name <no-reply@branddomain.com>` (via your provider)
- Pros:
  - Better deliverability
  - Fewer config errors
  - Central control & monitoring
- Cons:
  - You manage domain verification process
