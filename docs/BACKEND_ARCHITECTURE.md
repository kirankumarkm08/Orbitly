# Backend Architecture

Express.js + TypeScript backend with Supabase integration for the SaaS Page Builder.

---

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── config/
│   │   └── supabase.ts       # Supabase client
│   ├── routes/
│   │   ├── index.ts          # Route aggregator
│   │   ├── auth.routes.ts    # Authentication
│   │   ├── pages.routes.ts   # Page CRUD
│   │   ├── assets.routes.ts  # File uploads
│   │   ├── events.routes.ts  # Event management
│   │   ├── speakers.routes.ts
│   │   └── tenants.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── pages.controller.ts
│   │   ├── assets.controller.ts
│   │   ├── events.controller.ts
│   │   ├── speakers.controller.ts
│   │   └── tenants.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verification
│   │   ├── tenant.middleware.ts   # Tenant isolation
│   │   └── error.middleware.ts    # Error handling
│   ├── services/
│   │   ├── page.service.ts
│   │   ├── event.service.ts
│   │   ├── storage.service.ts
│   │   └── email.service.ts
│   └── types/
│       └── index.ts          # TypeScript definitions
├── .env
├── package.json
└── tsconfig.json
```

---

## Database Schema

### Core Tables
| Table | Purpose |
|-------|---------|
| `tenants` | Organizations/Workspaces |
| `users` | User profiles (linked to Supabase Auth) |
| `pages` | Page builder pages with HTML/CSS/JSON |
| `assets` | Uploaded images/files |
| `page_templates` | Reusable templates |

### Event System Tables
| Table | Purpose |
|-------|---------|
| `events` | Event details with registration settings |
| `speakers` | Speaker profiles |
| `event_speakers` | Links speakers to events with sessions |
| `event_registrations` | Attendee registrations |
| `event_schedule` | Detailed agenda/schedule |
| `custom_blocks` | Reusable page builder blocks |

---

## API Endpoints

### Authentication
```
POST   /api/auth/login         # Login with email/password
POST   /api/auth/register      # Register new user
POST   /api/auth/logout        # Logout user
GET    /api/auth/me            # Get current user
POST   /api/auth/refresh       # Refresh token
```

### Pages
```
GET    /api/pages              # List pages (tenant-scoped)
GET    /api/pages/:id          # Get page by ID
POST   /api/pages              # Create new page
PUT    /api/pages/:id          # Update page
DELETE /api/pages/:id          # Delete page
POST   /api/pages/:id/publish  # Publish page
GET    /api/pages/slug/:slug   # Get page by slug (public)
```

### Assets
```
GET    /api/assets             # List assets
POST   /api/assets/upload      # Upload file
DELETE /api/assets/:id         # Delete asset
```

### Events
```
GET    /api/events             # List events
GET    /api/events/:id         # Get event details
POST   /api/events             # Create event
PUT    /api/events/:id         # Update event
DELETE /api/events/:id         # Delete event
POST   /api/events/:id/publish # Publish event
```

### Speakers
```
GET    /api/speakers           # List speakers
GET    /api/speakers/:id       # Get speaker
POST   /api/speakers           # Create speaker
PUT    /api/speakers/:id       # Update speaker
DELETE /api/speakers/:id       # Delete speaker
```

### Registrations
```
GET    /api/events/:eventId/registrations   # List registrations
POST   /api/events/:eventId/register        # Register for event (public)
PUT    /api/registrations/:id/status        # Update registration status
```

### Templates
```
GET    /api/templates          # List templates
GET    /api/templates/:id      # Get template
POST   /api/templates          # Create template
```

### Tenants (Admin only)
```
GET    /api/tenants/:id        # Get tenant settings
PUT    /api/tenants/:id        # Update tenant settings
```

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
RESEND_API_KEY=your-resend-key
CORS_ORIGIN=http://localhost:3000
```

---

## Dependencies to Install

```bash
cd backend
npm install @supabase/supabase-js multer express-validator jsonwebtoken
npm install -D @types/multer @types/jsonwebtoken
```

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Supabase client |
| `multer` | File upload handling |
| `express-validator` | Request validation |
| `jsonwebtoken` | JWT handling |

---

## Implementation Order

### Phase 1: Foundation
1. [ ] Set up Supabase client config
2. [ ] Create auth middleware (JWT verification)
3. [ ] Create tenant middleware (isolation)
4. [ ] Create error handling middleware

### Phase 2: Core CRUD
5. [ ] Implement pages routes + controller
6. [ ] Implement assets routes (with file upload)
7. [ ] Implement templates routes

### Phase 3: Events System
8. [ ] Implement events routes + controller
9. [ ] Implement speakers routes
10. [ ] Implement registrations routes

### Phase 4: Advanced
11. [ ] Add email notifications (Resend)
12. [ ] Add caching for public pages
13. [ ] Add rate limiting

---

## Key Middleware

### Auth Middleware
Verifies Supabase JWT token and attaches user to request:
```typescript
// Validates Authorization: Bearer <token>
// Attaches req.user with user ID and tenant ID
```

### Tenant Middleware
Ensures all queries are scoped to user's tenant:
```typescript
// Reads tenant_id from authenticated user
// Attaches req.tenantId for use in controllers
```

---

## Multi-Tenancy

All database queries are automatically scoped by `tenant_id`:
- RLS policies enforce tenant isolation at database level
- Backend middleware adds extra layer of protection
- Service role key bypasses RLS for admin operations

---

## Running the Backend

```bash
cd backend
npm install
npm run dev    # Development with hot reload
npm run build  # Build for production
npm start      # Run production build
```

---

## Next Steps

1. Copy `backend/.env.example` → `backend/.env`
2. Add Supabase credentials
3. Install dependencies: `npm install`
4. Start implementing routes following the structure above

---

**See also:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database configuration
