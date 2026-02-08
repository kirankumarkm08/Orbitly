# Supabase Setup Guide

Complete guide to set up Supabase for your SaaS Page Builder.

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project** (free)
3. Sign up with GitHub or email

## Step 2: Create New Project

1. Click **New Project**
2. Fill in:
   - **Name**: `page-builder-saas` (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
3. Click **Create new project**
4. Wait 2-3 minutes for setup

## Step 3: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open your project file: `supabase/migrations/001_initial_schema.sql`
4. Copy the entire SQL content
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

## Step 4: Get API Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** section
3. Copy these values:

| Setting | Location | Save As |
|---------|----------|---------|
| **Project URL** | Under "Project URL" | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | Under "Project API keys" | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** | Under "Project API keys" (click reveal) | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ **Never expose `service_role` key in client code!**

## Step 5: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```

2. Edit `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

3. Restart your dev server:
   ```bash
   # Ctrl+C to stop, then:
   npm run dev
   ```

## Step 6: Enable Authentication (Optional)

### Email/Password Auth
1. Go to **Authentication** > **Providers**
2. Email is enabled by default ✓

### Google Auth
1. Go to **Authentication** > **Providers** > **Google**
2. Toggle **Enable**
3. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
4. Add Client ID and Secret

### GitHub Auth
1. Go to **Authentication** > **Providers** > **GitHub**
2. Toggle **Enable**
3. Create OAuth App at GitHub Settings > Developer Settings
4. Add Client ID and Secret

## Step 7: Set Up Storage (For Image Uploads)

1. Go to **Storage** in sidebar
2. Click **New Bucket**
3. Name: `assets`
4. Check **Public bucket** (for public images)
5. Click **Create bucket**

## Step 8: Verify Setup

Test your connection in browser console:

```javascript
// Open browser DevTools (F12) and run:
const { data, error } = await window.supabase.from('tenants').select('*');
console.log(data, error);
```

## Troubleshooting

### "relation does not exist" error
→ Run the migration SQL again (Step 3)

### "Invalid API key" error
→ Check your `.env.local` values match Supabase dashboard

### Connection refused
→ Check your Supabase project is active (not paused)

### CORS errors
→ Add your domain to Supabase dashboard > Settings > API > CORS

## Database Tables Created

| Table | Purpose |
|-------|---------|
| `tenants` | Workspaces/Organizations |
| `users` | User profiles (linked to auth) |
| `pages` | Page builder pages |
| `assets` | Uploaded images/files |
| `page_templates` | Reusable templates |

## Row Level Security (RLS)

All tables have RLS enabled:
- Users can only access data from their own tenant
- Policies automatically filter queries by `tenant_id`

## Useful Supabase Dashboard Links

- **Table Editor**: View/edit data directly
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users
- **Storage**: Manage file uploads
- **Logs**: Debug API calls

---

## Quick Reference

```bash
# Your .env.local should look like:
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Next Steps

After setup is complete:
1. Create your first user via Auth dashboard or sign-up form
2. Assign user to the demo tenant
3. Start building pages!

---

**Need help?** Check [Supabase Docs](https://supabase.com/docs)
