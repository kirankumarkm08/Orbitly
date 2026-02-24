/**
 * Dynamic Tenant Resolution
 * 
 * Resolves tenant_id from the request hostname by calling the
 * backend's /api/public/resolve-tenant endpoint, which queries
 * the tenant_domains table.
 * 
 * Usage (Server Components only):
 *   import { resolveTenantFromHost } from '@/lib/resolve-tenant';
 *   const headersList = await headers();
 *   const host = headersList.get('host') || '';
 *   const tenantId = await resolveTenantFromHost(host);
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Simple in-memory cache for server-side tenant resolution
// Avoids calling the API on every single page render
const tenantCache = new Map<string, { tenantId: string; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Resolves a tenant ID from the incoming host header.
 * 
 * Resolution order:
 * 1. Localhost → uses NEXT_PUBLIC_TENANT_ID env var (dev only)
 * 2. Subdomain (demo.yourapp.com) → queries resolve-tenant API with "demo"
 * 3. Custom domain (www.acme.com) → queries resolve-tenant API with full domain
 */
export async function resolveTenantFromHost(host: string): Promise<string | null> {
  // Development fallback: localhost uses env var
  if (!host || host.startsWith('localhost') || host.includes('127.0.0.1')) {
    return process.env.NEXT_PUBLIC_TENANT_ID || null;
  }

  // Extract the domain key to look up
  const domainKey = extractDomainKey(host);
  if (!domainKey) return null;

  // Check cache first
  const cached = tenantCache.get(domainKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.tenantId;
  }

  // Call the resolve-tenant API
  try {
    const res = await fetch(
      `${API_URL}/public/resolve-tenant?domain=${encodeURIComponent(domainKey)}`,
      { cache: 'no-store' }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const tenantId = data.tenant_id;

    if (tenantId) {
      tenantCache.set(domainKey, {
        tenantId,
        expiresAt: Date.now() + CACHE_TTL,
      });
    }

    return tenantId || null;
  } catch {
    console.error(`[resolve-tenant] Failed to resolve tenant for domain: ${domainKey}`);
    return null;
  }
}

/**
 * Extracts the domain key from a full host string.
 * 
 * Examples:
 *   "demo.yourapp.com"   → "demo"        (subdomain)
 *   "demo.yourapp.com:3000" → "demo"     (subdomain with port)
 *   "www.acme.com"        → "www.acme.com" (custom domain, use full host)
 *   "yourapp.com"         → "yourapp.com"  (bare domain)
 */
function extractDomainKey(host: string): string | null {
  // Remove port number
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');

  // Subdomain-based: demo.yourapp.com → "demo"
  // (3+ parts means there's a subdomain before the main domain)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Skip "www" — treat as the bare domain
    if (subdomain === 'www') {
      return hostname; // Use full hostname for custom domain lookup
    }
    return subdomain;
  }

  // 2 parts (yourapp.com) or 1 part — use the full hostname
  // This handles custom domain mapping
  if (parts.length >= 1) {
    return hostname;
  }

  return null;
}
