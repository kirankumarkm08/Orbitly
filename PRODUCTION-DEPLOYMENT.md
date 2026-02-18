# Production Deployment Guide

## Multi-Tenant Architecture

Your app supports multiple tenants (customers), each with their own pages and content.

### Tenant Resolution Flow

```
User visits: demo.yourapp.com/about
                    ↓
Frontend extracts subdomain: "demo"
                    ↓
Maps to tenant_id: 53c58f44-42d4-45d9-b836-30724adfd0d6
                    ↓
Fetches page: /api/public/pages/about?tenant_id=xxx
```

## Setup Options

### Option A: Subdomain-based (Recommended)

**1. DNS Configuration**
```
# Add to your DNS provider
Type: A Record
Name: *.yourapp.com
Value: Your server IP or CNAME to Vercel/Netlify
```

**2. Vercel Configuration (vercel.json)**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/$1" }
  ]
}
```

**3. Environment Variables**
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourapp.com/api
NEXT_PUBLIC_TENANT_ID=default-tenant-for-localhost
```

### Option B: Database-Driven Domain Mapping

**Create domain mapping table:**
```sql
CREATE TABLE tenant_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  domain text NOT NULL,  -- e.g., "demo.yourapp.com" or "customdomain.com"
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  UNIQUE(domain)
);

-- Insert mappings
INSERT INTO tenant_domains (tenant_id, domain) VALUES 
  ('53c58f44-42d4-45d9-b836-30724adfd0d6', 'demo.yourapp.com'),
  ('53c58f44-42d4-45d9-b836-30724adfd0d6', 'www.customdomain.com');
```

## Deployment Steps

### 1. Backend (Render/Railway/AWS)

```bash
# Environment variables
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=your-secret
PORT=5000
```

### 2. Frontend (Vercel)

```bash
# Environment variables
NEXT_PUBLIC_API_URL=https://your-api.com/api
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_TENANT_ID=default-tenant
```

### 3. Database Migration

```sql
-- Ensure pages table has proper structure
ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_homepage BOOLEAN DEFAULT false;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pages_tenant_slug ON pages(tenant_id, slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_pages_tenant_homepage ON pages(tenant_id) WHERE is_homepage = true AND status = 'published';
```

## Onboarding New Tenants

### 1. Create Tenant
```sql
INSERT INTO tenants (id, name, slug, plan) 
VALUES (gen_random_uuid(), 'Acme Corp', 'acme', 'pro')
RETURNING id;
```

### 2. Configure Domain
```sql
INSERT INTO tenant_domains (tenant_id, domain) 
VALUES ('tenant-uuid-here', 'acme.yourapp.com');
```

### 3. Set Environment (if using manual mapping)
Update your frontend code to map the subdomain:
```typescript
const tenantMap: Record<string, string> = {
  'demo': 'demo-tenant-uuid',
  'acme': 'acme-tenant-uuid',
  // Add new tenant here
};
```

## Testing

### Local Testing
```bash
# Add to /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 demo.localhost
127.0.0.1 acme.localhost

# Access via
http://demo.localhost:3000/about
```

### Production Testing
```bash
# Test tenant resolution
curl https://api.yourapp.com/api/public/resolve-tenant?domain=demo.yourapp.com

# Test page retrieval
curl https://api.yourapp.com/api/public/pages/homepage?tenant_id=YOUR_TENANT_ID
```

## Troubleshooting

### Pages not loading
1. Check tenant ID is correct in URL/query param
2. Verify page status is "published" (not "draft")
3. Check browser console for API errors
4. Verify API URL is accessible

### CORS Issues
Add to backend:
```javascript
app.use(cors({
  origin: ['https://yourapp.com', 'https://*.yourapp.com'],
  credentials: true
}));
```

### SSL Issues
Ensure wildcard SSL certificate covers `*.yourapp.com`

## Monitoring

Track these metrics:
- Page views per tenant
- Most popular pages
- Average page load time
- Errors per tenant

## Scaling

As you grow:
1. Use CDN for static assets
2. Implement caching (Redis)
3. Use database connection pooling
4. Consider read replicas for analytics
