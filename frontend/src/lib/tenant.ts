// utils/tenant.ts
const TENANT_MAP: Record<string, string> = {
  'demo': '53c58f44-42d4-45d9-b836-30724adfd0d6',
  'acme': 'another-tenant-uuid',
  // Add more tenants here or fetch from database
};

export function getTenantIdFromHostname(hostname: string): string | null {
  // In production: tenant.yourapp.com
  // In dev: localhost (fallback to env)
  
  if (hostname === 'localhost' || hostname.includes('ngrok')) {
    return process.env.NEXT_PUBLIC_TENANT_ID || null;
  }
  
  // Extract subdomain from hostname
  // e.g., "demo.yourapp.com" -> "demo"
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const subdomain = parts[0];
    return TENANT_MAP[subdomain] || null;
  }
  
  return null;
}

// Alternative: Fetch tenant from API based on domain
export async function getTenantByDomain(domain: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/tenant-by-domain?domain=${domain}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
