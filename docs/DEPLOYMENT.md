# Deployment Guide

This guide outlines the steps to deploy the Minimal SaaS application.

## 1. Frontend & Super Admin (Vercel)

The `frontend` and `super-admin` applications are built with Next.js and are best deployed on [Vercel](https://vercel.com).

### Steps:
1.  Push your code to a GitHub repository.
2.  Log in to Vercel and import the project.
3.  Configure two separate Vercel projects: one for `frontend` and one for `super-admin`.
4.  **Frontend Configuration:**
    -   **Root Directory:** `frontend`
    -   **Build Command:** `npm run build` (default)
    -   **Output Directory:** `.next` (default)
    -   **Environment Variables:**
        -   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
        -   `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://api.yourdomain.com/api`)
        -   `NEXT_PUBLIC_TENANT_ID`: Test tenant ID (optional)
5.  **Super Admin Configuration:**
    -   **Root Directory:** `super-admin`
    -   **Environment Variables:** similar to frontend, pointing to the same backend.

## 2. Backend (Docker / Railway / Render)

The backend is a Node.js Express app and includes a `Dockerfile` for containerized deployment.

### Option A: Railway (Recommended)
1.  Log in to [Railway](https://railway.app).
2.  Create a new project from your GitHub repository.
3.  Select the `backend` directory as the root.
4.  Railway will automatically detect the `Dockerfile`.
5.  **Environment Variables:**
    -   `PORT`: `5000` (or allow Railway to set it)
    -   `NODE_ENV`: `production`
    -   `CORS_ORIGIN`: Comma-separated list of your frontend URLs (e.g., `https://your-frontend.vercel.app,https://your-admin.vercel.app`)
    -   `SUPABASE_URL`: Your Supabase URL
    -   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (Keep this secret!)

### Option B: Docker
You can build and run the container manually on any server with Docker installed.

```bash
cd backend
docker build -t minimal-saas-backend .
docker run -d -p 5000:5000 --env-file .env minimal-saas-backend
```

## 3. Database (Supabase)

The database is hosted on Supabase and requires no additional deployment steps. Ensure your RLS policies are correctly set up to secure data access.

## 4. Verification

After deployment:
1.  Visit your frontend URL.
2.  Check the browser console for any CORS errors.
3.  Verify that API requests are reaching the backend.
