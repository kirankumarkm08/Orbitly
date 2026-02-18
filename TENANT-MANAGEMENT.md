# Tenant Management System

## Overview

Your SaaS now supports **dynamic tenant resolution** based on the logged-in user's session. No more hardcoded tenant IDs!

## How It Works

### 1. User Login Flow

```
1. User logs in at /login
2. Backend validates credentials
3. Backend fetches user's tenant_id from 'users' table
4. Backend includes tenant_id in JWT token metadata
5. Frontend receives token and stores tenant_id
6. All API calls automatically include X-Tenant-Id header
```

### 2. API Request Flow

**Authenticated Requests (Admin/Editor):**
```javascript
// Frontend automatically adds header:
GET /api/pages
Headers: {
  "Authorization": "Bearer <jwt-token>",
  "X-Tenant-Id": "53c58f44-42d4-45d9-b836-30724adfd0d6"  // From logged-in user
}

// Backend auth middleware:
1. Validates JWT token
2. Extracts tenant_id from header
3. Sets req.tenantId for the request
4. All queries filter by this tenant_id
```

**Public Requests (Visitor-facing pages):**
```javascript
// Still uses query param for public access:
GET /api/public/pages/about?tenant_id=53c58f44-42d4-45d9-b836-30724adfd0d6

// OR extract from subdomain:
demo.yourapp.com/about → tenant_id = demo's ID
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user',  -- 'super_admin', 'admin', 'user'
  tenant_id UUID REFERENCES tenants(id),
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Pages Table
```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NOT NULL,
  html TEXT,
  css TEXT,
  status TEXT DEFAULT 'draft',  -- 'draft', 'published'
  is_homepage BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, slug)
);
```

## Setting Up a New Tenant

### Step 1: Create Tenant
```sql
INSERT INTO tenants (name, slug, plan) 
VALUES ('Acme Corporation', 'acme', 'pro')
RETURNING id;
-- Returns: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Step 2: Create Admin User
```sql
-- First, sign up user in Supabase Auth (get user ID)
-- Then insert into users table:
INSERT INTO users (id, email, role, tenant_id, full_name)
VALUES (
  'user-uuid-from-auth',
  'admin@acme.com',
  'admin',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'John Doe'
);
```

### Step 3: User Logs In
```javascript
// User visits /login
// Enters: admin@acme.com / password
// Frontend calls: POST /api/auth/login

// Backend response includes:
{
  "user": {
    "id": "user-uuid",
    "email": "admin@acme.com",
    "user_metadata": {
      "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  },
  "session": {
    "access_token": "jwt-token-with-tenant-embedded"
  }
}
```

### Step 4: Create Pages
```javascript
// User goes to /admin/studio
// Frontend knows tenant_id from auth context
// Creates page with POST /api/pages

// Backend automatically:
// 1. Gets tenant_id from X-Tenant-Id header
// 2. Sets tenant_id on the page record
// 3. All queries filtered by this tenant_id
```

## Multi-Tenant Public Pages

For public visitors (not logged in), you have 2 options:

### Option A: Subdomain-based (Recommended)

```
demo.yourapp.com    → Demo tenant pages
acme.yourapp.com    → Acme tenant pages
client.yourapp.com  → Client tenant pages
```

**Implementation:**
```typescript
// frontend/src/app/[...slug]/page.tsx
const hostname = headers().get('host');
const subdomain = hostname.split('.')[0]; // 'demo'
const tenantId = await getTenantIdFromSubdomain(subdomain);
```

### Option B: Path-based

```
yourapp.com/demo/about    → Demo tenant about page
yourapp.com/acme/pricing  → Acme tenant pricing page
```

**Implementation:**
First path segment is the tenant slug.

## Production Deployment Checklist

### Backend Environment Variables
```bash
# .env.production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=production
```

### Frontend Environment Variables
```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://api.yourapp.com/api
NEXT_PUBLIC_TENANT_ID=  # Leave empty - comes from auth now!
```

### Database Migrations

```sql
-- Ensure tenant isolation
CREATE INDEX idx_pages_tenant ON pages(tenant_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- Enable RLS (Row Level Security) for true multi-tenancy
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY tenant_isolation_policy ON pages
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

### DNS Setup (for subdomains)

```
# Add to DNS provider
Type: A Record
Name: *.yourapp.com
Value: Your server IP

# Or CNAME for Vercel/Netlify
Type: CNAME
Name: *.yourapp.com
Value: cname.vercel-dns.com
```

## Security Best Practices

1. **Always verify tenant_id server-side**
   - Never trust client-side tenant_id
   - Extract from JWT token or session

2. **Use Row Level Security (RLS)**
   - Enable RLS on all tenant-scoped tables
   - Create policies that enforce tenant isolation

3. **Validate subdomain ownership**
   - Verify subdomain belongs to tenant
   - Prevent subdomain hijacking

4. **Rate limiting per tenant**
   - Prevent one tenant from overwhelming the system

## Debugging

### Check Current Tenant
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
console.log('Tenant ID:', user.user_metadata.tenant_id);
```

### Check API Headers
```javascript
// Add logging to api.ts
console.log('API Request Headers:', {
  'X-Tenant-Id': tenantId,
  'Authorization': 'Bearer ...'
});
```

### Database Queries
```sql
-- Check which tenant a user belongs to
SELECT u.email, u.tenant_id, t.name as tenant_name
FROM users u
JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = 'admin@acme.com';

-- List all pages for a tenant
SELECT name, slug, status, is_homepage
FROM pages
WHERE tenant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

## Migration from Hardcoded Tenant

If you previously used a hardcoded tenant ID:

1. **Update environment variables**
   - Remove NEXT_PUBLIC_TENANT_ID from frontend
   - Backend already supports dynamic tenant

2. **Update existing users**
   ```sql
   -- Assign all existing users to the default tenant
   UPDATE users 
   SET tenant_id = '53c58f44-42d4-45d9-b836-30724adfd0d6'
   WHERE tenant_id IS NULL;
   ```

3. **Test login flow**
   - Log out all users
   - Log in again
   - Verify tenant_id is in user metadata
   - Verify pages are created with correct tenant_id

4. **Test page rendering**
   - Create a test page
   - Publish it
   - Visit public URL
   - Verify correct tenant's page is shown

## Support

Common issues:
- **"No tenant associated"** → User doesn't have tenant_id in users table
- **"Page not found"** → Page belongs to different tenant
- **"Access denied"** → User trying to access another tenant's data

All fixed by ensuring proper tenant_id assignment during user creation!
