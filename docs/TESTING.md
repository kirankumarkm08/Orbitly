# Testing Guide

## Quick Start

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## User Testing Checklist

### Authentication

- [ ] Super Admin can login with credentials
- [ ] Tenant Admin can login
- [ ] Regular user can login
- [ ] Invalid credentials show error
- [ ] Logout clears session

### Tenant Management (Super Admin)

- [ ] Can view all tenants
- [ ] Can create new tenant
- [ ] Can edit tenant settings
- [ ] Can suspend/activate tenant
- [ ] Can delete tenant

### Page Builder

- [ ] Can access page builder at `/admin/pages/builder`
- [ ] Can drag blocks from palette to canvas
- [ ] Can select and edit block settings
- [ ] Can save page layout
- [ ] Can preview page
- [ ] Can publish page
- [ ] Blocks render correctly: Hero, Text, Image

### Content Management

- [ ] Can create new page
- [ ] Can edit existing page
- [ ] Can delete page
- [ ] Can reorder pages
- [ ] Draft pages not visible to public
- [ ] Published pages visible to public

### Multi-Tenancy

- [ ] Tenant A cannot see Tenant B data
- [ ] Super Admin can access all tenants via `X-Tenant-Id` header
- [ ] User role restrictions enforced
- [ ] Tenant branding (colors, logo) applied correctly

### Public Site

- [ ] Landing page loads
- [ ] Demo sites work: `/demo/launchpad`, `/demo/real-estate`
- [ ] Custom domain routing works
- [ ] Published pages accessible without login

---

## API Testing (Postman)

Import the collection:
```
Orbitly-API-Collection.json
```

### Environment Setup

1. Import `Orbitly-Environment.json`
2. Set `base_url` to `http://localhost:5000/api`
3. Run login requests to auto-save tokens

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login user |
| POST | `/auth/register` | Register user |
| GET | `/admin/tenants` | List tenants (Super Admin) |
| POST | `/admin/tenants` | Create tenant |
| GET | `/pages` | List pages |
| POST | `/pages` | Create page |
| PUT | `/pages/:id` | Update page |
| DELETE | `/pages/:id` | Delete page |

### Testing Auth Flow

```bash
# 1. Login as Super Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# 2. Use token for protected endpoints
curl http://localhost:5000/api/admin/tenants \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Browser Testing

### Supported Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Test Each Page

1. **Landing Page** - http://localhost:3000
2. **Page Builder** - http://localhost:3000/admin/pages/builder
3. **Demo Launchpad** - http://localhost:3000/demo/launchpad
4. **Demo Real Estate** - http://localhost:3000/demo/real-estate

### Check:
- [ ] Page loads without console errors
- [ ] All images render
- [ ] Navigation works
- [ ] Forms submit correctly
- [ ] Responsive on mobile (375px)
- [ ] Responsive on tablet (768px)
- [ ] Responsive on desktop (1440px)

---

## Test Accounts

See [TEST-CREDENTIALS.md](./TEST-CREDENTIALS.md) for complete test credentials.

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@orbitly.com | OrbitlyAdmin2024! |
| Static Admin | static-admin@orbitly.test | StaticPass2024! |
| Ecom Admin | ecom-admin@orbitly.test | EcomPass2024! |
| Events Admin | events-admin@orbitly.test | EventsPass2024! |
| LaunchPad Admin | launchpad-admin@orbitly.test | LaunchPad2024! |

### Setup Test Data

```bash
cd backend
npm run seed
```

---

## Known Issues

- Page builder may lag with many blocks
- Large images may take time to load
- Some IE features not supported

---

## Report Bugs

Include:
1. Steps to reproduce
2. Expected vs actual
3. Screenshot
4. Browser/OS info
