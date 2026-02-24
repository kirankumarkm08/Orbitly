# Tenant ID Setup Guide

## ⚠️ The Problem

Setting a static `NEXT_PUBLIC_TENANT_ID` in Vercel makes **every visitor see the same tenant's content** — breaking multi-tenancy entirely.

```
# ❌ DON'T do this in production
NEXT_PUBLIC_TENANT_ID=53c58f44-42d4-45d9-b836-30724adfd0d6
```

## ✅ The Fix: Dynamic Tenant Resolution

Orbitly now resolves tenants **dynamically** from the incoming domain by querying the `tenant_domains` table in Supabase.

### How It Works

```
Visitor hits demo.yourapp.com
        ↓
Frontend reads Host header → "demo"
        ↓
Calls GET /api/public/resolve-tenant?domain=demo
        ↓
Backend queries: SELECT tenant_id FROM tenant_domains WHERE domain = 'demo'
        ↓
Returns tenant_id → renders that tenant's content
```

### Files Changed

| File | What Changed |
|------|-------------|
| `frontend/src/lib/resolve-tenant.ts` | **New** — centralized resolver with 5-min cache |
| `frontend/src/app/page.tsx` | Uses dynamic resolver instead of env var |
| `frontend/src/app/[...slug]/page.tsx` | Uses dynamic resolver instead of env var |
| `frontend/src/lib/api.ts` | Removed env var fallback for authenticated routes |
| `frontend/src/lib/tenant.ts` | Replaced hardcoded tenant map |

---

## 🔧 Setup Steps

### Step 1: Add Your Domain to `tenant_domains` Table

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Check if your tenant already has a domain entry
SELECT * FROM tenant_domains WHERE tenant_id = '53c58f44-42d4-45d9-b836-30724adfd0d6';

-- If empty, insert one:
INSERT INTO tenant_domains (tenant_id, domain, is_primary, is_active)
VALUES (
  '53c58f44-42d4-45d9-b836-30724adfd0d6',
  'your-subdomain-here',   -- e.g. 'demo', 'acme', or a full custom domain
  true,
  true
);
```

> **Note:** If you onboarded via `/api/public/onboarding`, this row was created automatically.

### Step 2: Local Development (No Changes Needed)

For `localhost`, the resolver falls back to `NEXT_PUBLIC_TENANT_ID` from `.env.local`. Your local dev flow works exactly as before.

```env
# frontend/.env.local
NEXT_PUBLIC_TENANT_ID=53c58f44-42d4-45d9-b836-30724adfd0d6   # Dev fallback only
```

### Step 3: Production (Vercel)

1. **Remove** `NEXT_PUBLIC_TENANT_ID` from Vercel environment variables
2. **Keep** `NEXT_PUBLIC_API_URL` pointing to your backend
3. **Add a wildcard domain** `*.yourapp.com` in Vercel → Project → Settings → Domains
4. **Add wildcard DNS** at your domain registrar:
   - Type: `CNAME`
   - Name: `*`
   - Value: `cname.vercel-dns.com`

### Step 4: Verify It Works

Test the resolve-tenant endpoint directly:

```bash
curl https://your-backend.onrender.com/api/public/resolve-tenant?domain=your-subdomain
```

Expected response:
```json
{
  "tenant_id": "53c58f44-42d4-45d9-b836-30724adfd0d6",
  "tenant": { "id": "...", "name": "...", "slug": "..." }
}
```

---

## 📋 Quick Checklist

- [ ] `tenant_domains` row exists for your tenant's domain
- [ ] `NEXT_PUBLIC_TENANT_ID` kept in `.env.local` for local dev
- [ ] `NEXT_PUBLIC_TENANT_ID` **removed** from Vercel env vars
- [ ] `NEXT_PUBLIC_API_URL` set correctly in Vercel
- [ ] Wildcard domain configured in Vercel (for subdomain-based tenancy)
- [ ] `resolve-tenant` API returns correct tenant for your domain

---

## 🔍 Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Invalid Tenant" on public page | No `tenant_domains` row for this domain | Insert a row in `tenant_domains` |
| Works locally but not in prod | `NEXT_PUBLIC_TENANT_ID` missing + no domain row | Add domain to `tenant_domains` table |
| Admin panel shows no data | User's `tenant_id` is null in `users` table | Check user profile in Supabase |
| `resolve-tenant` returns 404 | Domain not found or `is_active = false` | Check `tenant_domains` table |
