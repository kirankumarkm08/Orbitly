# Bizzabo — Admin Architecture & UI Reference

> **Source:** [bizzabo.com](https://www.bizzabo.com/) · 2025 Gartner Magic Quadrant™ Leader  
> **Category:** Enterprise Event Management SaaS (Event Experience Operating System)  
> **Use case:** B2B conferences, hybrid/virtual events, trade shows, corporate events

---

## 1. Platform Overview

Bizzabo brands itself as the **"Event Experience Operating System (OS)"** — an all-in-one, multi-tenant, cloud-based platform for planning, marketing, executing, and analyzing B2B events. It replaces fragmented point solutions (registration tools, email marketers, networking apps, badge printers) with a single unified platform.

### Core Philosophy

| Principle | Description |
|---|---|
| **Unified OS** | One platform replaces 5–10 point solutions |
| **Multi-tenant** | Each customer (organization) is an isolated tenant |
| **Event-centric** | Everything revolves around an "Event" as the core entity |
| **Data-first** | Centralized event data powers real-time analytics and AI |
| **Enterprise-grade** | SSO, RBAC, 99.99% uptime, SOC 2, GDPR compliance |

---

## 2. Admin Architecture — Three-Layer Hierarchy

Bizzabo's admin architecture follows a **three-tiered access model**, each with distinct scopes and permissions:

```
┌─────────────────────────────────────────────────────────┐
│                    BIZZABO INTERNAL                      │
│   ┌─────────────────────────────────────────────────┐   │
│   │           PLATFORM SUPER ADMIN                  │   │
│   │   • Tenant provisioning & billing               │   │
│   │   • Feature flags & plan enforcement            │   │
│   │   • Global infrastructure & monitoring          │   │
│   │   • Cross-tenant user management                │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐
│   ORGANIZATION A    │       │   ORGANIZATION B    │
│  ┌───────────────┐  │       │  ┌───────────────┐  │
│  │  ORG ADMIN    │  │       │  │  ORG ADMIN    │  │
│  │  (Account)    │  │       │  │  (Account)    │  │
│  └───────┬───────┘  │       │  └───────┬───────┘  │
│          │          │       │          │          │
│  ┌───────▼───────┐  │       │  ┌───────▼───────┐  │
│  │ EVENT ADMIN   │  │       │  │ EVENT ADMIN   │  │
│  │ (Per Event)   │  │       │  │ (Per Event)   │  │
│  └───────┬───────┘  │       │  └───────┬───────┘  │
│          │          │       │          │          │
│  ┌───────▼───────┐  │       │  ┌───────▼───────┐  │
│  │  TEAM MEMBERS │  │       │  │  TEAM MEMBERS │  │
│  │  (Granular)   │  │       │  │  (Granular)   │  │
│  └───────────────┘  │       │  └───────────────┘  │
└─────────────────────┘       └─────────────────────┘
```

### Layer 1 — Platform Super Admin (Bizzabo Internal)

> Internal dashboard used by Bizzabo's operations team.

| Capability | Details |
|---|---|
| **Tenant provisioning** | Create, suspend, delete customer accounts |
| **Billing & plans** | Manage subscription tiers, usage quotas, feature entitlements |
| **Feature flags** | Enable/disable features per tenant (A/B testing, beta rollouts) |
| **Global monitoring** | Platform health, uptime, cross-tenant metrics |
| **Support tooling** | Impersonate tenant admins for debugging |
| **Infrastructure** | Database management, CDN configuration, SSL certificates |

### Layer 2 — Organization Admin (Customer Account Level)

> The primary admin dashboard that Bizzabo's customers use.

| Capability | Details |
|---|---|
| **Team management** | Invite members, assign roles (Admin, Editor, Viewer) |
| **Account settings** | Billing info, SSO/SAML config, API keys |
| **Event portfolio** | View and manage all events across the organization |
| **Brand settings** | Global brand colors, logos, email domains, white-labeling |
| **Integrations hub** | Connect CRMs (Salesforce, HubSpot), MAPs (Marketo, Eloqua), Zapier |
| **Cross-event analytics** | Portfolio-level dashboards and reporting |
| **Templates** | Create reusable event templates for faster event creation |
| **Contact management** | Centralized attendee/contact database across events |

### Layer 3 — Event Admin (Per-Event Level)

> Each event gets its own dedicated admin dashboard with full event lifecycle management.

| Capability | Details |
|---|---|
| **Event setup** | Name, dates, venue, format (in-person / virtual / hybrid) |
| **Registration & ticketing** | Ticket types, pricing, promo codes, waitlists |
| **Website builder** | Drag-and-drop event website with custom CSS/JS |
| **Agenda builder** | Multi-track session scheduling with speaker assignments |
| **Marketing** | Email campaigns, automated workflows, retargeting |
| **Networking** | AI matchmaking rules, meeting scheduler, chat |
| **Sponsor management** | Sponsor tiers, dedicated portals, lead capture |
| **Onsite management** | Badge printing, check-in kiosks, session scanning |
| **Mobile app config** | Push notifications, app branding, live agenda |
| **Analytics** | Real-time registration, engagement, and revenue dashboards |

---

## 3. Admin UI — Layout & Navigation Patterns

### 3.1 Global Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR                                                     │
│  ┌────────┐  ┌─────────────┐           ┌──┐ ┌──┐ ┌───────┐ │
│  │  Logo  │  │ Event Switch │           │🔍│ │🔔│ │Profile│ │
│  └────────┘  └─────────────┘           └──┘ └──┘ └───────┘ │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  SIDEBAR     │           MAIN CONTENT AREA                  │
│              │                                              │
│  • Dashboard │  ┌────────────────────────────────────────┐  │
│  • Regist.   │  │                                        │  │
│  • Website   │  │   Dynamic content based on             │  │
│  • Agenda    │  │   selected sidebar item                │  │
│  • Marketing │  │                                        │  │
│  • Networking│  │   - Cards / Tables / Forms             │  │
│  • Sponsors  │  │   - Wizards / Builders                 │  │
│  • Onsite    │  │   - Charts / Analytics                 │  │
│  • App       │  │                                        │  │
│  • Analytics │  │                                        │  │
│  • Settings  │  └────────────────────────────────────────┘  │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 3.2 Key UI Patterns

| Pattern | Description |
|---|---|
| **Collapsible sidebar** | Left sidebar with icon + text labels, collapsible to icon-only mode |
| **Event switcher** | Dropdown in the top bar to switch between events without leaving the admin |
| **Breadcrumb navigation** | Contextual breadcrumbs showing Org → Event → Module → Sub-page |
| **Dashboard-first** | Landing on a KPI overview dashboard with key metrics |
| **Card-based listings** | Events displayed as cards with thumbnail, date, status badges |
| **Wizard flows** | Step-by-step wizards for event creation (4–6 steps) |
| **Inline editing** | Click-to-edit for names, descriptions, settings |
| **Split-pane editors** | Website/email builders use sidebar panels + live preview |
| **Drag-and-drop** | Agenda builder, website builder, form builder all use DnD |
| **Status badges** | Color-coded chips: Draft, Published, Live, Completed, Archived |
| **Real-time counters** | Live registration count, check-in numbers, session attendance |
| **Command palette** | Quick-search across events, contacts, settings |
| **Contextual actions** | Three-dot menus on cards/rows for Edit, Duplicate, Archive, Delete |

### 3.3 Design System Characteristics

| Aspect | Details |
|---|---|
| **Color palette** | Soft blues and purples as primary, clean whites for backgrounds, vibrant accents for CTAs |
| **Typography** | Clean sans-serif system (likely Inter or similar) |
| **Illustrations** | Custom playful vector illustrations for empty states and onboarding |
| **Iconography** | Outline-style icons with rounded corners |
| **Spacing** | Generous whitespace, 8px grid system |
| **Shadows** | Subtle elevation shadows for cards and modals |
| **Animations** | Smooth micro-transitions for state changes, slide-in panels |
| **Dark mode** | Not available (light mode only as of current) |

---

## 4. Feature Modules — Deep Dive

### 4.1 Event Registration & Ticketing

```
┌─────────────────────────────────────────────┐
│              REGISTRATION MODULE             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Ticket Types │  │ Registration Form    │ │
│  │  • General   │  │  Builder (Drag &     │ │
│  │  • VIP       │  │  Drop fields)        │ │
│  │  • Speaker   │  │                      │ │
│  │  • Sponsor   │  │  • Name, Email       │ │
│  └──────────────┘  │  • Company, Title    │ │
│                    │  • Custom fields     │ │
│  ┌──────────────┐  │  • Conditional logic │ │
│  │ Pricing &    │  └──────────────────────┘ │
│  │ Promo Codes  │                           │
│  │  • Early bird│  ┌──────────────────────┐ │
│  │  • Group disc│  │ Payment Gateway      │ │
│  │  • Coupons   │  │  • Stripe            │ │
│  └──────────────┘  │  • PayPal            │ │
│                    │  • Invoice            │ │
│  ┌──────────────┐  └──────────────────────┘ │
│  │ Waitlist &   │                           │
│  │ Capacity     │  ┌──────────────────────┐ │
│  │  Management  │  │ Confirmation &       │ │
│  └──────────────┘  │ Automated Emails     │ │
│                    └──────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Key features:**
- Conversion-optimized registration flows
- Abandoned registration retargeting
- Multi-currency & multi-language support
- GDPR-compliant consent management
- Attendee segmentation by ticket type
- Waitlist with automatic promotion

---

### 4.2 Event Website Builder

**Architecture:** No-code drag-and-drop visual editor with live preview

| Component | Description |
|---|---|
| **Page templates** | Pre-built layouts (landing, agenda, speakers, sponsors, venue) |
| **Block library** | Reusable content blocks (hero, speakers grid, agenda, countdown, map, FAQ) |
| **Widget embedding** | Registration widget, agenda widget, speaker profiles |
| **Custom code** | Support for custom CSS, JavaScript, and HTML injection |
| **Responsive** | Auto-responsive across desktop, tablet, mobile |
| **SEO** | Meta tags, Open Graph, structured data |
| **Custom domains** | Map to customer's branded domain with SSL |
| **A/B variants** | Test different landing page versions |

---

### 4.3 Agenda & Session Management

```
┌──────────────────────────────────────────────────┐
│               AGENDA BUILDER                      │
├──────────────────────────────────────────────────┤
│                                                  │
│  Timeline View (Drag & Drop)                     │
│                                                  │
│  09:00  ┌──────────────────────────────────┐     │
│         │ Keynote — Main Stage             │     │
│         │ Speaker: Jane Doe                │     │
│  10:00  └──────────────────────────────────┘     │
│                                                  │
│  10:00  ┌──────────────┐ ┌──────────────┐        │
│         │ Track A      │ │ Track B      │        │
│         │ Workshop     │ │ Panel Disc.  │        │
│  11:00  └──────────────┘ └──────────────┘        │
│                                                  │
│  11:00  ┌──────────────────────────────────┐     │
│         │ Networking Break                 │     │
│  11:30  └──────────────────────────────────┘     │
│                                                  │
│  Filters: [Track ▾] [Day ▾] [Room ▾] [Type ▾]   │
└──────────────────────────────────────────────────┘
```

**Key features:**
- Multi-track timeline with visual drag-and-drop
- Speaker assignment per session
- Session types: Keynote, Workshop, Panel, Breakout, Networking
- Attendee-facing personalized agenda builder
- Session capacity limits and RSVP
- Embeddable agenda widget

---

### 4.4 Marketing & Email Automation

| Feature | Description |
|---|---|
| **Email builder** | Drag-and-drop email designer with brand templates |
| **Automation workflows** | Pre-event reminders, post-event follow-ups, drip campaigns |
| **Segmentation** | Target by ticket type, registration date, engagement score |
| **Personalization** | Dynamic merge tags (name, company, ticket type, session) |
| **A/B testing** | Subject line and content variant testing |
| **Analytics** | Open rates, click rates, conversion tracking |
| **Custom domains** | Branded sender email addresses |
| **Retargeting** | Abandoned registration follow-up |

---

### 4.5 Networking & Engagement

| Feature | Description |
|---|---|
| **AI matchmaking** | Algorithm-based attendee matching by interests, industry, goals |
| **Meeting scheduler** | 1:1 and group meeting booking with calendar integration |
| **Live chat** | In-app messaging between attendees |
| **Polls & Q&A** | Real-time audience interaction during sessions |
| **Gamification** | Points, leaderboards, scavenger hunts |
| **Social wall** | Aggregated social media feed with event hashtag |
| **Klik SmartBadges™** | NFC wearable badges for contactless networking |

---

### 4.6 Sponsor & Exhibitor Management

```
┌──────────────────────────────────────┐
│        SPONSOR ADMIN PORTAL          │
├──────────────────────────────────────┤
│                                      │
│  Sponsor Tiers                       │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ Gold │ │Silver│ │Bronze│         │
│  └──────┘ └──────┘ └──────┘         │
│                                      │
│  Per-Sponsor Features:               │
│  • Branded booth/profile page        │
│  • Lead capture & badge scanning     │
│  • Content uploads (docs, videos)    │
│  • Real-time lead analytics          │
│  • Dedicated sponsor portal login    │
│  • Visibility controls (logo, ads)   │
│                                      │
│  Organizer Controls:                 │
│  • Assign tier & entitlements        │
│  • Monitor sponsor engagement        │
│  • Generate sponsor ROI reports      │
│  • Manage booth assignments          │
│                                      │
└──────────────────────────────────────┘
```

---

### 4.7 Onsite Management

| Feature | Description |
|---|---|
| **Check-in kiosk** | Self-service and staffed check-in with QR code / name lookup |
| **Badge printing** | On-demand badge printing integrated with check-in |
| **Klik SmartBadges™** | Pre-loaded NFC badges with attendee data |
| **Session scanning** | Track which sessions each attendee visited |
| **Capacity management** | Real-time room occupancy tracking |
| **Command app** | Onsite staff mobile app for rapid operations |
| **Lead capture app** | Exhibitors scan badges to capture leads |

---

### 4.8 Analytics & Reporting

```
┌─────────────────────────────────────────────────────────┐
│                  ANALYTICS DASHBOARD                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ Registered  │ │ Checked In  │ │  Revenue    │       │
│  │   1,247     │ │    892      │ │  $124,500   │       │
│  │   ↑12%      │ │   71.5%     │ │   ↑8%       │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Registration Trend (Line Chart)                 │   │
│  │  ▁▂▃▅▆▇█▇▆▅▄▃                                   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────┐ ┌─────────────────────────┐   │
│  │ Ticket Breakdown     │ │ Top Sessions            │   │
│  │ (Donut Chart)        │ │ (Horizontal Bar)        │   │
│  │  ● General  62%      │ │ Keynote ████████ 892    │   │
│  │  ● VIP      25%      │ │ Panel A █████   512     │   │
│  │  ● Speaker  13%      │ │ Workshop██████  645     │   │
│  └──────────────────────┘ └─────────────────────────┘   │
│                                                         │
│  Reports: [Registration] [Engagement] [Revenue] [ROI]   │
│  Export:  [CSV] [PDF] [API]                             │
└─────────────────────────────────────────────────────────┘
```

**Key features:**
- Real-time dashboards with auto-refresh
- Custom report builder with filters
- Cross-event portfolio analytics
- AI-powered anomaly detection and recommendations
- CRM sync for post-event attribution
- Exportable to CSV, PDF, or via API

---

### 4.9 Mobile Event App

| Feature | Description |
|---|---|
| **Branded app** | Custom colors, logo, splash screen per event |
| **Live agenda** | Personalized schedule with session reminders |
| **Push notifications** | Targeted notifications by segment |
| **Venue maps** | Interactive floor plans with wayfinding |
| **Meeting scheduler** | In-app meeting booking |
| **Content library** | Session recordings, slides, documents |
| **Social feed** | In-event activity feed |
| **Offline mode** | Core features available without internet |

---

### 4.10 Integrations Hub

```
┌─────────────────────────────────────────────────────────┐
│                 INTEGRATIONS HUB                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CRM                    Marketing Automation            │
│  ┌──────────┐           ┌──────────┐                    │
│  │Salesforce│           │ Marketo  │                    │
│  │ HubSpot  │           │ Eloqua   │                    │
│  │ Dynamics │           │ Pardot   │                    │
│  └──────────┘           └──────────┘                    │
│                                                         │
│  Communication          Analytics                       │
│  ┌──────────┐           ┌──────────┐                    │
│  │  Slack   │           │ Google   │                    │
│  │  Teams   │           │Analytics │                    │
│  │  Zoom    │           │ Segment  │                    │
│  └──────────┘           └──────────┘                    │
│                                                         │
│  Automation             Identity                        │
│  ┌──────────┐           ┌──────────┐                    │
│  │  Zapier  │           │  Okta    │                    │
│  │  Workato │           │OneLogin  │                    │
│  │  Custom  │           │  SAML    │                    │
│  └──────────┘           └──────────┘                    │
│                                                         │
│  Total: 2,500+ integrations via native + Zapier + API   │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Technical Architecture

### 5.1 Multi-Tenant Infrastructure

| Aspect | Details |
|---|---|
| **Architecture** | Cloud-based, multi-tenant SaaS |
| **Hosting** | Cloud infrastructure (likely AWS/GCP) |
| **Uptime** | 99.99% SLA |
| **Data isolation** | Tenant-level data isolation with shared infrastructure |
| **Scalability** | Supports events from 50 to 100,000+ attendees |
| **CDN** | Global CDN for static assets (event websites, media) |
| **Database** | Per-tenant logical isolation with shared physical infrastructure |

### 5.2 API Architecture

| Aspect | Details |
|---|---|
| **API version** | v2.0+ (RESTful) |
| **Authentication** | OAuth 2.0 (Client Credentials) + API Key tokens |
| **Credentials** | Client ID + Client Secret + Account ID |
| **Documentation** | OpenAPI/Swagger specs on Stoplight |
| **Rate limiting** | Per-account rate limits |
| **Webhooks** | Event-driven notifications for registration, check-in, etc. |
| **SDKs** | JavaScript, Python (community) |

### 5.3 Security & Compliance

| Feature | Details |
|---|---|
| **SSO/SAML** | Enterprise SSO with Okta, OneLogin, Azure AD |
| **MFA** | Multi-factor authentication for admins |
| **SOC 2** | Type II certified |
| **GDPR** | Compliant with data residency options |
| **Encryption** | TLS 1.3 in-transit, AES-256 at rest |
| **Audit logs** | Full admin action audit trail |
| **Gated events** | Password-protected or invite-only event access |
| **PCI DSS** | Compliant payment processing |

---

## 6. Mapping to Orbitly — Feature Comparison

| Bizzabo Feature | Orbitly Status | Orbitly File / Module |
|---|---|---|
| **Super Admin** | ✅ Implemented | `super-admin/` (separate app) |
| **Multi-tenant middleware** | ✅ Implemented | `backend/src/middleware/tenant.middleware.ts` |
| **Tenant Admin panel** | ✅ Implemented | `frontend/src/app/admin/` |
| **Admin sidebar navigation** | ✅ Implemented | `frontend/src/components/admin/AdminSidebar.tsx` |
| **Admin layout** | ✅ Implemented | `frontend/src/components/admin/AdminLayout.tsx` |
| **RBAC architecture** | ✅ Implemented | `architecture.md` |
| **Event CRUD** | ✅ Implemented | Event create/edit pages |
| **Event website builder** | ✅ Implemented | GrapesJS integration (`admin/studio/`) |
| **File manager** | ✅ Implemented | File manager with API |
| **Branding/white-label** | ✅ Implemented | Design settings (logo, favicon, OG image) |
| **Blog/CMS** | ✅ Implemented | `/admin/blog` |
| **Forms builder** | ✅ Implemented | `/admin/forms` with DynamicFormRenderer |
| **Customer management** | ✅ Implemented | `/admin/customers` |
| **Page builder** | ✅ Implemented | `/admin/pages` with API integration |
| **Map viewer** | ✅ Implemented | CustomerMapViewer with PDF export |
| **Auth routes** | ✅ Implemented | `backend/src/routes/auth.routes.ts` |
| **Registration & ticketing** | 🔲 Not yet | — |
| **Agenda/session builder** | 🔲 Not yet | — |
| **Email/marketing automation** | 🔲 Not yet | — |
| **AI networking/matchmaking** | 🔲 Not yet | — |
| **Sponsor/exhibitor portals** | 🔲 Not yet | — |
| **Onsite check-in/badge** | 🔲 Not yet | — |
| **Mobile event app** | 🔲 Not yet | — |
| **Real-time analytics dashboard** | 🔲 Not yet | — |
| **Integrations hub (CRM etc.)** | 🔲 Not yet | — |
| **Webhook system** | 🔲 Not yet | — |

---

## 7. UI Inspiration — What to Adopt

### High-Impact, Low-Effort Wins

1. **Event Switcher in Top Bar** — Dropdown to switch between events without navigating away
2. **Dashboard with KPI Cards** — Show registration count, revenue, check-in rate at a glance
3. **Status Badges System** — Consistent color-coded badges: `Draft` `Live` `Completed` `Archived`
4. **Empty State Illustrations** — Custom illustrations when no events/data exist
5. **Command Palette** (`Ctrl+K`) — Quick search across all admin modules

### Medium-Effort Improvements

6. **Wizard-Style Event Creation** — Replace single-page form with guided 4–6 step wizard
7. **Split-Pane Builder** — Side panel + live preview for website/email builders
8. **Real-time Counters** — WebSocket-powered live metrics on dashboards
9. **Notification Center** — Bell icon with activity feed (new registrations, form submissions)
10. **Template System** — Save and reuse event configurations

### Long-Term Aspirations

11. **Portfolio Analytics** — Cross-event comparison dashboards
12. **Marketing Automation** — Drip campaigns triggered by registration events
13. **AI Copilot** — Chat-based assistant for admin operations
14. **Integrations Marketplace** — Plug-and-play connectors for popular tools
15. **Mobile Admin App** — Lightweight admin features on mobile

---

## 8. Data Model Inspiration

```
Organization (Tenant)
├── Settings (branding, domain, SSO)
├── Team Members (roles: Admin, Editor, Viewer)
├── Contacts (centralized attendee DB)
│
├── Events[]
│   ├── Event Settings (name, dates, venue, format)
│   ├── Registration
│   │   ├── Ticket Types[]
│   │   ├── Promo Codes[]
│   │   ├── Registration Form (dynamic fields)
│   │   └── Attendees[] (registrations)
│   │
│   ├── Website
│   │   ├── Pages[] (landing, agenda, speakers)
│   │   └── Theme (colors, fonts, CSS)
│   │
│   ├── Agenda
│   │   ├── Tracks[]
│   │   ├── Sessions[]
│   │   └── Speakers[]
│   │
│   ├── Marketing
│   │   ├── Email Templates[]
│   │   ├── Campaigns[]
│   │   └── Automation Rules[]
│   │
│   ├── Sponsors[]
│   │   ├── Tier
│   │   ├── Leads Captured[]
│   │   └── Content/Assets[]
│   │
│   ├── Onsite
│   │   ├── Check-ins[]
│   │   ├── Badge Designs[]
│   │   └── Session Scans[]
│   │
│   └── Analytics
│       ├── Registration Metrics
│       ├── Engagement Metrics
│       └── Revenue Metrics
│
└── Integrations[]
    ├── CRM Connections
    ├── Marketing Automations
    └── Webhooks
```

---

---

## 9. Public-Facing Event Website — UI Reference

Bizzabo generates **branded, responsive event websites** for each event. These are the public pages attendees see.

### 9.1 Website Page Types

| Page | Purpose | Key Elements |
|---|---|---|
| **Landing / Home** | First impression, drive registrations | Hero banner, event name/date/venue, CTA button, countdown timer |
| **Agenda** | Show schedule | Multi-track timeline, filters by day/track/type, session cards |
| **Speakers** | Showcase speakers | Grid of speaker cards with photo, name, title, company, bio modal |
| **Sponsors** | Display brand partners | Tiered logo grid (Gold/Silver/Bronze), sponsor profile modals |
| **Venue** | Location details | Embedded map, venue photos, travel/hotel info |
| **Registration** | Capture attendees | Embedded registration form widget |
| **FAQ** | Answer common questions | Accordion-style Q&A |
| **Gallery** | Past event photos | Masonry or grid photo gallery with lightbox |

### 9.2 Event Website Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                         │
│  ┌──────┐  ┌──────┐ ┌────────┐ ┌────────┐ ┌─────┐ ┌─────────┐ │
│  │ Logo │  │ Home │ │Agenda  │ │Speakers│ │ FAQ │ │Register │ │
│  └──────┘  └──────┘ └────────┘ └────────┘ └─────┘ │  (CTA)  │ │
│                                                    └─────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    HERO SECTION                          │   │
│  │                                                         │   │
│  │     EVENT NAME 2025                                     │   │
│  │     ━━━━━━━━━━━━━━━━                                    │   │
│  │     March 15-17, 2025 · San Francisco, CA               │   │
│  │                                                         │   │
│  │     ┌───────────────────────┐                           │   │
│  │     │  REGISTER NOW  →     │  (Primary CTA)            │   │
│  │     └───────────────────────┘                           │   │
│  │                                                         │   │
│  │     ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │   │
│  │     │ 12 │ │ 05 │ │ 23 │ │ 47 │  Countdown Timer      │   │
│  │     │days│ │ hrs│ │mins│ │secs│                        │   │
│  │     └────┘ └────┘ └────┘ └────┘                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  EVENT HIGHLIGHTS                        │   │
│  │                                                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ 📊 50+   │  │ 🎤 30+   │  │ 🤝 1000+ │              │   │
│  │  │ Sessions │  │ Speakers │  │ Attendees│              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 FEATURED SPEAKERS                        │   │
│  │                                                         │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │ ┌─────┐ │  │ ┌─────┐ │  │ ┌─────┐ │  │ ┌─────┐ │   │   │
│  │  │ │photo│ │  │ │photo│ │  │ │photo│ │  │ │photo│ │   │   │
│  │  │ └─────┘ │  │ └─────┘ │  │ └─────┘ │  │ └─────┘ │   │   │
│  │  │  Name   │  │  Name   │  │  Name   │  │  Name   │   │   │
│  │  │  Title  │  │  Title  │  │  Title  │  │  Title  │   │   │
│  │  │ Company │  │ Company │  │ Company │  │ Company │   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│  │                                                         │   │
│  │              [View All Speakers →]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   SPONSOR LOGOS                          │   │
│  │                                                         │   │
│  │  Gold:    [Logo1]  [Logo2]  [Logo3]                     │   │
│  │  Silver:  [Logo4]  [Logo5]  [Logo6]  [Logo7]            │   │
│  │  Bronze:  [Logo8]  [Logo9]  [Logo10] [Logo11] [Logo12]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  FOOTER                                                  │   │
│  │  Event Name · Privacy Policy · Terms · Contact           │   │
│  │  Powered by Bizzabo                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Website Builder Editor (Admin Side)

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────┐                    ┌──────┐ ┌──────┐ ┌────────┐  │
│  │ ← Back   │  Page: Home ▾     │ Undo │ │ Redo │ │Publish │  │
│  └──────────┘                    └──────┘ └──────┘ └────────┘  │
├────────────────┬────────────────────────────────────────────────┤
│                │                                                │
│  LEFT PANEL    │              LIVE PREVIEW CANVAS               │
│                │                                                │
│  Pages         │  ┌────────────────────────────────────────┐    │
│  ┌──────────┐  │  │                                        │    │
│  │ ● Home   │  │  │    (Real-time preview of the page)     │    │
│  │ ○ Agenda │  │  │                                        │    │
│  │ ○ Speakers│ │  │    Click any element to edit            │    │
│  │ ○ Sponsors│ │  │                                        │    │
│  │ ○ FAQ    │  │  │    Drag blocks from left to add        │    │
│  │ + Add Page│ │  │                                        │    │
│  └──────────┘  │  │    Blue outline = selected element     │    │
│                │  │                                        │    │
│  Blocks        │  │    Drag handles = resize               │    │
│  ┌──────────┐  │  │                                        │    │
│  │ 📄 Hero  │  │  └────────────────────────────────────────┘    │
│  │ 📝 Text  │  │                                                │
│  │ 🖼 Image │  │  ┌────────────────────────────────────────┐    │
│  │ 📊 Agenda│  │  │  Responsive Preview Toggles:           │    │
│  │ 🎤 Spkrs │  │  │  [Desktop] [Tablet] [Mobile]           │    │
│  │ 📋 Form  │  │  └────────────────────────────────────────┘    │
│  │ ⏱ Timer │  │                                                │
│  │ 📍 Map   │  │                                                │
│  │ ❓ FAQ   │  │                                                │
│  └──────────┘  │                                                │
│                │  ┌─────────── RIGHT PANEL ──────────────┐      │
│  Theme         │  │  (Appears when element selected)     │      │
│  ┌──────────┐  │  │                                      │      │
│  │ Colors   │  │  │  Content:                            │      │
│  │ Fonts    │  │  │  ┌──────────────────────────────┐    │      │
│  │ Spacing  │  │  │  │ Edit text, images, links     │    │      │
│  │ CSS      │  │  │  └──────────────────────────────┘    │      │
│  │ JS       │  │  │                                      │      │
│  └──────────┘  │  │  Style:                              │      │
│                │  │  ┌──────────────────────────────┐    │      │
│                │  │  │ Colors, fonts, spacing,      │    │      │
│                │  │  │ borders, shadows, animation  │    │      │
│                │  │  └──────────────────────────────┘    │      │
│                │  └──────────────────────────────────────┘      │
└────────────────┴────────────────────────────────────────────────┘
```

---

## 10. UI Component Library — Complete Reference

### 10.1 Buttons

| Variant | Usage | Style |
|---|---|---|
| **Primary** | Main actions (Save, Create, Publish) | Solid fill, brand color (purple/blue), white text, rounded-md, shadow |
| **Secondary** | Alternative actions (Cancel, Back) | Outlined border, transparent bg, dark text |
| **Ghost** | Tertiary actions (Learn more, Skip) | No border/bg, text only, hover underline |
| **Danger** | Destructive actions (Delete, Remove) | Solid red fill, white text |
| **Icon button** | Compact actions (Edit, Copy, Refresh) | Circle/square, icon only, tooltip on hover |
| **FAB** | Floating primary action | Circle, shadow, fixed position bottom-right |
| **Button group** | Toggle between views | Connected buttons, one active with fill |
| **Loading** | Action in progress | Spinner replaces text, disabled state |

```
┌─────────────────────────────────────────────────────────┐
│  Button States:                                          │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  Default   │  │   Hover    │  │  Pressed   │        │
│  │ bg: #6B4CE6│  │ bg: #5A3BD5│  │ bg: #4A2BC4│        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                         │
│  ┌────────────┐  ┌────────────┐                         │
│  │  Disabled  │  │  Loading   │                         │
│  │ opacity:0.5│  │ ⟳ Saving..│                         │
│  └────────────┘  └────────────┘                         │
│                                                         │
│  Sizes: [ sm: 32px ] [ md: 40px ] [ lg: 48px ]         │
└─────────────────────────────────────────────────────────┘
```

### 10.2 Form Controls

| Component | Specification |
|---|---|
| **Text input** | Height: 40px, border: 1px solid #D1D5DB, radius: 8px, focus: ring-2 brand color |
| **Textarea** | Min-height: 120px, resizable vertically, character counter |
| **Select / Dropdown** | Custom styled, searchable with filter, multi-select variant |
| **Checkbox** | 18×18px, rounded-sm, brand color when checked, indeterminate state |
| **Radio** | 18×18px, circle, dot indicator, group with labels |
| **Toggle / Switch** | 44×24px, animated slider, on/off colors |
| **Date picker** | Calendar popover, range selection, preset ranges |
| **Time picker** | 12h/24h format, 15-min intervals, timezone selector |
| **File upload** | Drag-and-drop zone, progress bar, file preview thumbnail |
| **Rich text editor** | Toolbar: Bold/Italic/Link/Lists/Headings, source mode |
| **Color picker** | Swatch presets + custom hex/rgb input, recent colors |
| **Tags input** | Pill-style tags, autocomplete, max count |
| **Slider / Range** | Track + thumb, value tooltip, min/max labels |
| **Search input** | Magnifying glass icon, clear button, debounced filtering |

```
┌──────────────────────────────────────────────────────┐
│  Form Field Anatomy:                                  │
│                                                      │
│  Label *              ← Label (required indicator)   │
│  ┌──────────────────────────────────────────┐        │
│  │ Placeholder text...                      │ ← Input│
│  └──────────────────────────────────────────┘        │
│  Helper text or validation error               ← Hint│
│                                                      │
│  Validation States:                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │  ✓ Success   │ │  ⚠ Warning   │ │  ✗ Error     │ │
│  │ border:green │ │ border:amber │ │ border:red   │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 10.3 Tables / Data Grids

```
┌──────────────────────────────────────────────────────────────────┐
│  Data Table Layout:                                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ [Search...🔍]   [Filter ▾]  [Columns ▾]   [Export ⬇]   │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │ ☐ │ Name ↕     │ Email        │ Status   │ Date    │ ⋯ │    │
│  ├───┼────────────┼──────────────┼──────────┼─────────┼───┤    │
│  │ ☐ │ John Doe   │ j@acme.com   │ ● Active │ Jan 15  │ ⋮ │    │
│  │ ☐ │ Jane Smith │ j@beta.io    │ ○ Pending│ Jan 14  │ ⋮ │    │
│  │ ☑ │ Bob Lee    │ b@gamma.com  │ ● Active │ Jan 13  │ ⋮ │    │
│  ├───┴────────────┴──────────────┴──────────┴─────────┴───┤    │
│  │ ← 1 2 3 ... 12 →       Showing 1-25 of 289            │    │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Features:                                                        │
│  • Sortable columns (click header)                                │
│  • Bulk select with checkbox column                               │
│  • Row hover highlight                                            │
│  • Inline status badges (colored dots)                            │
│  • Three-dot (⋮) row action menu                                 │
│  • Column visibility toggle                                       │
│  • Sticky header on scroll                                        │
│  • Pagination or infinite scroll                                  │
│  • Empty state with illustration                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 10.4 Cards

```
┌──────────────────────────────────────────────────────────┐
│  Card Variants:                                           │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │ EVENT CARD           │  │ STAT CARD (KPI)     │        │
│  │ ┌───────────────────┐│  │                     │        │
│  │ │   Cover Image     ││  │  Total Registrants  │        │
│  │ │   (16:9 ratio)    ││  │  ┌───────────────┐  │        │
│  │ └───────────────────┘│  │  │  1,247         │  │        │
│  │ Event Name           │  │  │  ↑ 12.5%       │  │        │
│  │ 📅 Mar 15-17         │  │  └───────────────┘  │        │
│  │ 📍 San Francisco     │  │  vs. last event     │        │
│  │ ┌──────┐ ┌─────────┐│  │  ▁▂▃▅▆▇█ sparkline  │        │
│  │ │ Live │ │  245 reg ││  └─────────────────────┘        │
│  │ └──────┘ └─────────┘│                                  │
│  │           ┌───┐     │  ┌─────────────────────┐        │
│  │           │ ⋮ │     │  │ SPEAKER CARD        │        │
│  │           └───┘     │  │ ┌─────┐             │        │
│  └─────────────────────┘  │ │photo│  Jane Doe   │        │
│                            │ │round│  VP of Eng  │        │
│  ┌─────────────────────┐  │ └─────┘  Acme Corp  │        │
│  │ NOTIFICATION CARD    │  │  🔗 LinkedIn         │        │
│  │ 🔔 New registration  │  └─────────────────────┘        │
│  │ John Doe registered  │                                  │
│  │ for Tech Summit 2025 │  ┌─────────────────────┐        │
│  │ 2 minutes ago        │  │ SESSION CARD        │        │
│  └─────────────────────┘  │ 10:00 AM – 11:00 AM │        │
│                            │ ━━━━━━━━━━━━━━━━━━━ │        │
│                            │ Building APIs       │        │
│                            │ 🎤 Jane Doe          │        │
│                            │ 📍 Room A            │        │
│                            │ 🏷 Workshop │ Track 1│        │
│                            │ [23/50 seats]  [RSVP]│        │
│                            └─────────────────────┘        │
└──────────────────────────────────────────────────────────┘
```

### 10.5 Navigation Components

| Component | Description |
|---|---|
| **Top navbar** | Fixed, logo + event/org switcher + search + notifications + profile avatar |
| **Sidebar** | Fixed left, 240px expanded / 64px collapsed, icon + label, active highlight, section dividers |
| **Breadcrumbs** | Org → Event → Module → Sub-page, clickable history |
| **Tabs** | Horizontal tab bar, underline active indicator, badge count on tab |
| **Stepper / Wizard** | Horizontal numbered steps, completed/active/upcoming states, clickable to jump |
| **Pagination** | Page numbers + prev/next arrows, per-page selector, total count |
| **Dropdown menu** | Shadow card, grouped items with dividers, icons, keyboard navigable |
| **Command palette** | `Ctrl+K` overlay, search input + categorized results, recent items |

### 10.6 Feedback & Status Components

| Component | Description |
|---|---|
| **Toast / Snackbar** | Bottom-right, auto-dismiss 5s, success/error/warning/info variants, action button |
| **Alert / Banner** | Full-width strip, dismissible, icon + message + optional action link |
| **Progress bar** | Horizontal, determinate (%) or indeterminate (animated), color-coded |
| **Skeleton loader** | Animated placeholder shapes matching content layout during loading |
| **Empty state** | Centered illustration + heading + description + CTA button |
| **Badge / Chip** | Small pill, color-coded: Green=Active, Yellow=Pending, Red=Cancelled, Gray=Draft |
| **Spinner** | Circular, 3 sizes (sm/md/lg), used inside buttons or as page loader |
| **Tooltip** | Dark on hover, max 200px, arrow pointing to trigger, 300ms delay |

---

## 11. Modal & Dialog Patterns

### 11.1 Modal Types

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  TYPE 1: CONFIRMATION MODAL (Centered, Small)                  │
│  ┌────────────────────────────────────────────┐                │
│  │                                        [✕] │                │
│  │  ⚠️  Delete Event?                         │                │
│  │                                            │                │
│  │  Are you sure you want to delete           │                │
│  │  "Tech Summit 2025"? This action           │                │
│  │  cannot be undone.                         │                │
│  │                                            │                │
│  │  ┌──────────┐     ┌──────────────────────┐ │                │
│  │  │  Cancel  │     │  Delete Event  🗑    │ │                │
│  │  │(outline) │     │   (danger red)       │ │                │
│  │  └──────────┘     └──────────────────────┘ │                │
│  └────────────────────────────────────────────┘                │
│                                                                │
│  • Width: 400-480px                                            │
│  • Overlay: rgba(0,0,0,0.5) with backdrop-blur                 │
│  • Close: ✕ button, ESC key, overlay click                     │
│  • Focus trap: Tab cycles within modal                         │
│  • Animation: scale(0.95) → scale(1) + fade-in                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  TYPE 2: FORM MODAL (Centered, Medium)                         │
│  ┌────────────────────────────────────────────────────┐        │
│  │  Create New Event                              [✕] │        │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │        │
│  │                                                    │        │
│  │  Event Name *                                      │        │
│  │  ┌──────────────────────────────────────────┐      │        │
│  │  │                                          │      │        │
│  │  └──────────────────────────────────────────┘      │        │
│  │                                                    │        │
│  │  Event Type *              Format *                │        │
│  │  ┌──────────────────┐     ┌──────────────────┐     │        │
│  │  │ Conference    ▾  │     │ In-Person     ▾  │     │        │
│  │  └──────────────────┘     └──────────────────┘     │        │
│  │                                                    │        │
│  │  Start Date *              End Date *              │        │
│  │  ┌──────────────────┐     ┌──────────────────┐     │        │
│  │  │ 📅 Mar 15, 2025  │     │ 📅 Mar 17, 2025  │     │        │
│  │  └──────────────────┘     └──────────────────┘     │        │
│  │                                                    │        │
│  │  Description                                       │        │
│  │  ┌──────────────────────────────────────────┐      │        │
│  │  │                                          │      │        │
│  │  │                                          │      │        │
│  │  └──────────────────────────────────────────┘      │        │
│  │                                                    │        │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │        │
│  │  ┌──────────┐              ┌──────────────────┐    │        │
│  │  │  Cancel  │              │  Create Event  → │    │        │
│  │  └──────────┘              └──────────────────┘    │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                │
│  • Width: 560-640px                                            │
│  • Scrollable content area if overflow                         │
│  • Sticky header and footer                                    │
│  • Form validation on submit and on blur                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  TYPE 3: DETAIL / PREVIEW MODAL (Centered, Large)              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Speaker Profile                                    [✕] │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │                                                         │   │
│  │  ┌──────┐  Jane Doe                                     │   │
│  │  │      │  VP of Engineering, Acme Corp                 │   │
│  │  │ photo│  🔗 LinkedIn  🐦 Twitter                      │   │
│  │  │      │                                               │   │
│  │  └──────┘  Bio:                                         │   │
│  │  Jane is a veteran engineering leader with 15+ years    │   │
│  │  of experience building scalable distributed systems... │   │
│  │                                                         │   │
│  │  Sessions:                                              │   │
│  │  ┌───────────────────────────────────────────────┐      │   │
│  │  │ 📅 Mar 15 · 10:00 AM · Building APIs at Scale│      │   │
│  │  └───────────────────────────────────────────────┘      │   │
│  │  ┌───────────────────────────────────────────────┐      │   │
│  │  │ 📅 Mar 16 · 2:00 PM · Panel: Future of AI    │      │   │
│  │  └───────────────────────────────────────────────┘      │   │
│  │                                                         │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │                           ┌──────────┐  ┌────────────┐  │   │
│  │                           │   Edit   │  │   Close    │  │   │
│  │                           └──────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  • Width: 720-800px, max-height: 80vh                          │
│  • Scrollable body                                             │
│  • Used for: speaker profiles, session details, attendee info  │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  TYPE 4: SLIDE-OVER PANEL (Right Side Drawer)                  │
│                                                                │
│  ┌─────────────────────────┐┌──────────────────────────────┐   │
│  │                         ││  Edit Ticket Type        [✕] │   │
│  │    Main Content          ││  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │    (Dimmed with          ││                              │   │
│  │     overlay)             ││  Name *                      │   │
│  │                         ││  ┌────────────────────────┐  │   │
│  │                         ││  │ VIP Pass               │  │   │
│  │                         ││  └────────────────────────┘  │   │
│  │                         ││                              │   │
│  │                         ││  Price *                     │   │
│  │                         ││  ┌────────────────────────┐  │   │
│  │                         ││  │ $ 299.00               │  │   │
│  │                         ││  └────────────────────────┘  │   │
│  │                         ││                              │   │
│  │                         ││  Capacity                    │   │
│  │                         ││  ┌────────────────────────┐  │   │
│  │                         ││  │ 100                    │  │   │
│  │                         ││  └────────────────────────┘  │   │
│  │                         ││                              │   │
│  │                         ││  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │                         ││  [Cancel]     [Save Changes] │   │
│  └─────────────────────────┘└──────────────────────────────┘   │
│                                                                │
│  • Width: 400-520px, full height                               │
│  • Slide-in from right with 300ms ease-out                     │
│  • Used for: editing items, settings, quick forms              │
│  • Body scroll locked                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  TYPE 5: FULL-SCREEN MODAL / TAKEOVER                          │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ← Back to Event          Email Builder        [Preview] │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ┌────────────┐  ┌────────────────────────────────────┐   │  │
│  │ │            │  │                                    │   │  │
│  │ │  Block     │  │     Full-screen editor canvas      │   │  │
│  │ │  Library   │  │                                    │   │  │
│  │ │            │  │     (Website builder, Email         │   │  │
│  │ │  • Header  │  │      builder, Form builder)        │   │  │
│  │ │  • Text    │  │                                    │   │  │
│  │ │  • Image   │  │                                    │   │  │
│  │ │  • Button  │  │                                    │   │  │
│  │ │  • Divider │  │                                    │   │  │
│  │ │  • Social  │  │                                    │   │  │
│  │ │            │  │                                    │   │  │
│  │ └────────────┘  └────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  • Width: 100vw, Height: 100vh                                 │
│  • Custom top bar replaces main nav                            │
│  • Used for: builders, complex editors, import wizards         │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  TYPE 6: LIGHTBOX / IMAGE GALLERY MODAL                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                      [✕] │  │
│  │                                                          │  │
│  │  ◀  ┌──────────────────────────────────────────┐  ▶     │  │
│  │     │                                          │         │  │
│  │     │         Full-size image view              │         │  │
│  │     │                                          │         │  │
│  │     │                                          │         │  │
│  │     └──────────────────────────────────────────┘         │  │
│  │                                                          │  │
│  │     Image title or caption                                │  │
│  │     3 / 24                                                │  │
│  │                                                          │  │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐  (thumbnails)     │  │
│  │  │ 1 │ │ 2 │ │●3●│ │ 4 │ │ 5 │ │ 6 │                   │  │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  • Dark overlay (rgba(0,0,0,0.85))                             │
│  • Keyboard: ← → arrows, ESC close                            │
│  • Swipe on mobile                                             │
│  • Used for: gallery images, badge previews, venue photos      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 11.2 Modal Alert Patterns (Inline)

| Alert Type | Trigger | Behavior |
|---|---|---|
| **Session conflict** | Attendee adds overlapping sessions | Inline modal warning with option to replace or keep both |
| **Unsaved changes** | Navigate away from editor with unsaved work | Confirmation: "Discard changes?" with Save/Discard/Cancel |
| **Capacity reached** | Session/ticket at max capacity | Info modal with waitlist option |
| **Payment failure** | Credit card declined | Error modal with retry and alternate payment option |
| **Publish confirmation** | Publishing event website or email | Preview + "Are you sure?" with audience count |
| **Import results** | After CSV/data import | Success/error summary modal with row-by-row details |
| **Feature gate** | Accessing premium feature on free plan | Upgrade prompt modal with plan comparison |

### 11.3 Modal Design Rules

1. **One modal at a time** — Never stack modals. Use slide-over panels for secondary context
2. **Clear title and purpose** — Title matches the action that triggered the modal
3. **Primary action on right** — Destructive actions use danger color, positioned right
4. **Escape hatches** — Always: ✕ button, ESC key, and overlay click to close
5. **Focus management** — Trap focus inside modal, return focus to trigger on close
6. **Body scroll lock** — Prevent background scrolling when modal is open
7. **Responsive** — Full-screen on mobile, centered on desktop
8. **Animation** — 200ms ease-out for open, 150ms ease-in for close
9. **Max height** — `max-height: 80vh` with scrollable body, sticky header/footer
10. **Keyboard accessible** — Tab through fields, Enter to submit, ESC to close

---

## 12. Registration Page — UI Deep Dive

### 12.1 Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
│                                                             │
│  Step 1              Step 2              Step 3              │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐      │
│  │  Select    │     │  Personal  │     │  Payment   │      │
│  │  Ticket    │ ──→ │  Details   │ ──→ │  & Confirm │      │
│  │  Type      │     │  Form      │     │            │      │
│  └────────────┘     └────────────┘     └────────────┘      │
│       │                   │                   │              │
│       ▼                   ▼                   ▼              │
│  • General $99       • Name *            • Card number      │
│  • VIP $299          • Email *           • Expiry           │
│  • Speaker Free      • Company           • CVC              │
│  • Group 10+         • Job Title         • Promo code       │
│                      • Dietary           • Order summary     │
│                      • T-shirt size      • Total + tax       │
│                      (conditional)                           │
│                                                             │
│  Step 4 (Post-registration)                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  ✅ Registration Confirmed!                        │     │
│  │                                                    │     │
│  │  Order #12345                                      │     │
│  │  Tech Summit 2025 · VIP Pass                       │     │
│  │                                                    │     │
│  │  📧 Confirmation email sent to john@acme.com       │     │
│  │                                                    │     │
│  │  ┌────────────────┐  ┌────────────────────────┐    │     │
│  │  │ Add to Calendar│  │ Download Ticket (PDF) │    │     │
│  │  └────────────────┘  └────────────────────────┘    │     │
│  │                                                    │     │
│  │  Share: [Twitter] [LinkedIn] [Email]               │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Registration Form Best Practices (Bizzabo)

| Practice | Details |
|---|---|
| **Minimal fields** | Only ask essentials (name, email + 1-2 qualifiers). Shorter = higher conversion |
| **Conditional logic** | Show/hide fields based on ticket type (reduces visible fields by 20-40%) |
| **Social sign-in** | Google/LinkedIn login to auto-fill name, email, company |
| **Progress indicator** | Step counter at top showing current position |
| **Mobile-first** | 90%+ of forms render well on mobile |
| **GDPR consent** | Inline checkbox with privacy policy link |
| **Promo code field** | Collapsible "Have a code?" link (hidden by default) |
| **Live validation** | Validate on field blur, not on submit |
| **Abandoned cart** | Auto-save partial registration, send retargeting email after 30 min |
| **Confirmation** | Immediate on-page confirmation + email with PDF ticket |

---

## 13. Attendee Portal — UI Reference

### 13.1 Attendee Dashboard (Post-Registration)

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────┐                                      ┌─────────────┐ │
│  │ Logo │  Tech Summit 2025                     │ John Doe ▾  │ │
│  └──────┘                                      └─────────────┘ │
├────────────────┬────────────────────────────────────────────────┤
│                │                                                │
│  SIDEBAR       │  Welcome, John! 👋                             │
│                │                                                │
│  • My Agenda   │  ┌─────────────────────────────────────────┐   │
│  • Speakers    │  │  YOUR TICKET                            │   │
│  • Networking  │  │  VIP Pass · Order #12345                │   │
│  • Sponsors    │  │  📅 Mar 15-17 · 📍 Moscone Center       │   │
│  • Venue Map   │  │  [Download Ticket]  [Add to Calendar]   │   │
│  • Messages    │  └─────────────────────────────────────────┘   │
│  • My Profile  │                                                │
│  • Content     │  ┌─────────────────────────────────────────┐   │
│                │  │  UPCOMING SESSIONS                      │   │
│                │  │                                         │   │
│                │  │  ┌───────────────────────────────────┐  │   │
│                │  │  │ 10:00 AM  Keynote: Future of AI   │  │   │
│                │  │  │ 🎤 Jane Doe · 📍 Main Stage        │  │   │
│                │  │  └───────────────────────────────────┘  │   │
│                │  │  ┌───────────────────────────────────┐  │   │
│                │  │  │ 11:30 AM  Workshop: API Design    │  │   │
│                │  │  │ 🎤 Bob Lee · 📍 Room B             │  │   │
│                │  │  └───────────────────────────────────┘  │   │
│                │  └─────────────────────────────────────────┘   │
│                │                                                │
│                │  ┌─────────────────────────────────────────┐   │
│                │  │  SUGGESTED CONNECTIONS                  │   │
│                │  │                                         │   │
│                │  │  ┌─────┐ Sarah Kim · CTO, Beta Inc     │   │
│                │  │  │photo│ 🏷 AI, Cloud   [Connect]       │   │
│                │  │  └─────┘                                │   │
│                │  │  ┌─────┐ Mike Chen · Dir Eng, Gamma    │   │
│                │  │  │photo│ 🏷 DevOps     [Connect]       │   │
│                │  │  └─────┘                                │   │
│                │  └─────────────────────────────────────────┘   │
│                │                                                │
└────────────────┴────────────────────────────────────────────────┘
```

### 13.2 Attendee Portal Features

| Feature | Description |
|---|---|
| **Personal agenda** | Drag sessions from master agenda to build personal schedule |
| **Session RSVP** | Reserve seat in limited-capacity sessions |
| **AI networking** | Suggested connections based on interests, title, industry |
| **1:1 meeting booking** | Calendar-based scheduling with other attendees |
| **In-app messaging** | Direct messages and group chats |
| **Content access** | Session recordings, slides, sponsor materials (post-event) |
| **Profile editing** | Photo, bio, interests, social links |
| **Notifications** | Session reminders, new messages, schedule changes |
| **QR code ticket** | Digital ticket with QR for onsite check-in |

---

## 14. Onsite Kiosk & Badge — UI Reference

### 14.1 Check-in Kiosk Screen

```
┌───────────────────────────────────────────────────┐
│                                                   │
│               TECH SUMMIT 2025                    │
│              ━━━━━━━━━━━━━━━━━━                   │
│                                                   │
│           Welcome! Check in below.                │
│                                                   │
│                                                   │
│         ┌───────────────────────────┐             │
│         │                           │             │
│         │   SCAN YOUR QR CODE       │             │
│         │       📱 ▢▢▢▢            │             │
│         │                           │             │
│         └───────────────────────────┘             │
│                                                   │
│               ─── OR ───                          │
│                                                   │
│         ┌───────────────────────────┐             │
│         │  Search by name...  🔍   │             │
│         └───────────────────────────┘             │
│                                                   │
│                                                   │
│                                                   │
│  ┌─────┐                              ┌─────┐    │
│  │ 🌐  │ Language                      │  ?  │    │
│  └─────┘                              └─────┘    │
│                                                   │
└───────────────────────────────────────────────────┘

Kiosk Screen → After Scan/Search:
┌───────────────────────────────────────────────────┐
│                                                   │
│               ✅ Welcome, John!                   │
│                                                   │
│         ┌──────────────────────────┐              │
│         │  John Doe                │              │
│         │  VP of Engineering       │              │
│         │  Acme Corporation        │              │
│         │  VIP Pass                │              │
│         └──────────────────────────┘              │
│                                                   │
│           🖨 Printing your badge...               │
│           ████████████░░░░  75%                   │
│                                                   │
│                                                   │
│           Please collect your badge               │
│           from the printer below.                 │
│                                                   │
└───────────────────────────────────────────────────┘
```

### 14.2 Badge Design Template

```
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │      EVENT LOGO              │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────┐                            │
│  │      │    JOHN DOE                │
│  │ photo│    ━━━━━━━━━━              │
│  │      │    VP of Engineering       │
│  └──────┘    Acme Corporation        │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ ██ VIP ██████████████████████│    │  ← Color band = role
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │        QR Code               │    │
│  │        ┌─────┐               │    │
│  │        │▪▫▪▫▪│               │    │
│  │        │▫▪▫▪▫│               │    │
│  │        │▪▫▪▫▪│               │    │
│  │        └─────┘               │    │
│  └──────────────────────────────┘    │
│                                      │
│  Attendee ID: ATT-2025-00123        │
└──────────────────────────────────────┘

Badge Design Best Practices:
• Name: 72pt+ font, high contrast
• QR/barcode: bottom-right, away from clip
• Color bands for role cues (VIP=gold, Speaker=blue, Staff=red)
• Quiet zone around QR for reliable scanning
• Avoid thin script fonts
```

---

## 15. Sponsor / Exhibitor Portal — UI Reference

### 15.1 Sponsor Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Sponsor Portal ─ Acme Corp (Gold Sponsor)              [Logout]│
├────────────────┬────────────────────────────────────────────────┤
│                │                                                │
│  SIDEBAR       │  Welcome, Acme Corp! 🏆 Gold Sponsor          │
│                │                                                │
│  • Dashboard   │  ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  • Leads       │  │  Leads     │ │ Booth      │ │ Content    │ │
│  • Booth Setup │  │  Captured  │ │ Views      │ │ Downloads  │ │
│  • Content     │  │  127       │ │  894       │ │  342       │ │
│  • Team        │  │  ↑ 23%     │ │  ↑ 15%     │ │  ↑ 8%      │ │
│  • Analytics   │  └────────────┘ └────────────┘ └────────────┘ │
│  • Settings    │                                                │
│                │  ┌─────────────────────────────────────────┐   │
│                │  │  RECENT LEADS                           │   │
│                │  ├─────────────────────────────────────────┤   │
│                │  │ Name          Company       Score  Time │   │
│                │  │ Sarah Kim     Beta Inc      ⭐⭐⭐  2m   │   │
│                │  │ Mike Chen     Gamma LLC     ⭐⭐   15m  │   │
│                │  │ Lisa Wang     Delta Co      ⭐⭐⭐  1h   │   │
│                │  │                [View All Leads →]       │   │
│                │  └─────────────────────────────────────────┘   │
│                │                                                │
│                │  ┌─────────────────────────────────────────┐   │
│                │  │  UPCOMING TASKS                         │   │
│                │  │  ☐ Upload booth banner (due: Mar 10)    │   │
│                │  │  ☑ Register team members (done)         │   │
│                │  │  ☐ Upload product brochure (due: Mar 12)│   │
│                │  └─────────────────────────────────────────┘   │
│                │                                                │
└────────────────┴────────────────────────────────────────────────┘
```

### 15.2 Sponsor Portal Features

| Feature | Description |
|---|---|
| **Lead capture** | Badge scanning via app, QR tap, NFC SmartBadge. Leads include name, email, company, notes, rating |
| **Lead export** | CSV/Salesforce/HubSpot sync of captured leads |
| **Booth setup** | Upload banner, logo, description, team photos, product videos |
| **Content uploads** | Share documents, whitepapers, case studies with attendees |
| **Team management** | Register booth staff, assign roles (scanner, demo, manager) |
| **Analytics dashboard** | Real-time metrics: booth visits, lead count, content downloads |
| **ROI reporting** | Cost-per-lead, engagement score, conversion funnel |
| **Automated reminders** | Email notifications for pending deliverables |
| **Meeting scheduling** | Pre-event meeting booking with qualified attendees |
| **Virtual booth** | For virtual/hybrid events: videos, live chat, downloadable assets |

---

## 16. Email Builder — UI Reference

### 16.1 Email Editor Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back     Email: "Registration Confirmation"    [Test] [Send] │
├────────────────┬────────────────────────────────────────────────┤
│                │                                                │
│  BLOCKS        │              EMAIL PREVIEW                     │
│                │                                                │
│  ┌──────────┐  │  ┌────────────────────────────────────────┐   │
│  │ 📄 Header│  │  │  ┌──────────────────────────────────┐ │   │
│  │ 📝 Text  │  │  │  │         EVENT LOGO               │ │   │
│  │ 🖼 Image │  │  │  └──────────────────────────────────┘ │   │
│  │ 🔘 Button│  │  │                                      │   │
│  │ ━━ Divider│ │  │  Hi {{first_name}},                  │   │
│  │ 📊 Columns│ │  │                                      │   │
│  │ 🔗 Social│  │  │  You're registered for               │   │
│  │ 👤 Spkr  │  │  │  Tech Summit 2025! 🎉               │   │
│  │ 📋 Agenda│  │  │                                      │   │
│  │ 📍 Venue │  │  │  ┌────────────────────────────┐      │   │
│  │ 🎫 Ticket│  │  │  │  {{event_name}}            │      │   │
│  └──────────┘  │  │  │  📅 {{event_date}}          │      │   │
│                │  │  │  📍 {{event_venue}}          │      │   │
│  SETTINGS      │  │  │  🎫 {{ticket_type}}         │      │   │
│  ┌──────────┐  │  │  └────────────────────────────┘      │   │
│  │ From     │  │  │                                      │   │
│  │ Subject  │  │  │  ┌──────────────────────────┐        │   │
│  │ Preheader│  │  │  │  Add to Calendar  📅     │        │   │
│  │ Reply-to │  │  │  └──────────────────────────┘        │   │
│  │ Schedule │  │  │                                      │   │
│  └──────────┘  │  │  See you there!                      │   │
│                │  │  The Tech Summit Team                 │   │
│                │  │                                      │   │
│  RECIPIENTS    │  │  ┌──────────────────────────────────┐ │   │
│  ┌──────────┐  │  │  │  [Twitter] [LinkedIn] [Website]  │ │   │
│  │ All (892)│  │  │  │  Unsubscribe · Privacy Policy    │ │   │
│  │ VIP (225)│  │  │  └──────────────────────────────────┘ │   │
│  │ Custom ▾ │  │  └────────────────────────────────────────┘   │
│  └──────────┘  │                                                │
│                │  Preview: [Desktop] [Mobile]                   │
└────────────────┴────────────────────────────────────────────────┘
```

### 16.2 Email Types & Templates

| Email Type | Trigger | Key Content |
|---|---|---|
| **Registration confirmation** | Immediately on registration | Ticket details, calendar link, QR code |
| **Payment receipt** | On successful payment | Invoice, amount, payment method |
| **Event reminder (7 day)** | 7 days before event | Event details, agenda highlight, prep tips |
| **Event reminder (1 day)** | 1 day before event | Venue directions, what to bring, app download |
| **Session reminder** | 15 min before RSVP'd session | Session name, room, speaker |
| **Welcome onsite** | On check-in | Wi-Fi details, venue map, emergency contacts |
| **Post-event thank you** | 1 day after event | Feedback survey, session recordings, photos |
| **Post-event content** | 3 days after event | Slides, recordings, sponsor offers |
| **Abandoned registration** | 30 min after abandonment | Reminder with direct link to continue |
| **Waitlist promotion** | When spot opens | Congratulations + complete registration CTA |

### 16.3 Dynamic Merge Tags

| Tag | Resolves To |
|---|---|
| `{{first_name}}` | Attendee's first name |
| `{{last_name}}` | Attendee's last name |
| `{{email}}` | Attendee's email |
| `{{company}}` | Attendee's company |
| `{{ticket_type}}` | Ticket type name (e.g., VIP) |
| `{{event_name}}` | Event name |
| `{{event_date}}` | Formatted event date range |
| `{{event_venue}}` | Venue name and address |
| `{{registration_link}}` | Unique registration URL |
| `{{calendar_link}}` | Add-to-calendar link |
| `{{qr_code}}` | Inline QR code image |
| `{{unsubscribe}}` | Unsubscribe link (required) |

---

> **This document serves as a reference for building Orbitly's admin architecture.  
> Not all Bizzabo features need to be replicated — focus on the patterns and UX principles that align with Orbitly's roadmap.**
