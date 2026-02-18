import { notFound } from 'next/navigation';
import PageRenderer from '@/components/PageRenderer';
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Known routes that should not be handled by this catch-all
const RESERVED_PATHS = ['admin', 'login', 'dashboard', 'demo', 'api', '_next', 'favicon.ico'];

async function getPageBySlug(slug: string, tenantId: string) {
  try {
    const url = `${API_URL}/public/pages/${encodeURIComponent(slug)}?tenant_id=${tenantId}`;
    
    const res = await fetch(url, { 
      next: { revalidate: 0 },
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getTenantFromRequest() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // In production, extract tenant from subdomain
  // e.g., demo.yourapp.com -> demo
  const parts = host.split('.');
  
  // For localhost or simple hostnames, use env variable
  if (host === 'localhost' || parts.length < 3) {
    return process.env.NEXT_PUBLIC_TENANT_ID || '';
  }
  
  // Extract subdomain
  const subdomain = parts[0];
  
  // Map subdomain to tenant ID
  // You can replace this with a database lookup
  const tenantMap: Record<string, string> = {
    'demo': process.env.NEXT_PUBLIC_TENANT_ID || '',
    // Add more subdomains here
  };
  
  return tenantMap[subdomain] || process.env.NEXT_PUBLIC_TENANT_ID || '';
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  if (RESERVED_PATHS.includes(slug[0])) {
    return {};
  }

  const tenantId = await getTenantFromRequest();
  if (!tenantId) {
    return { title: 'Invalid Tenant' };
  }

  const page = await getPageBySlug(slugPath, tenantId);
  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: page.meta_title || page.name,
    description: page.meta_description || page.description || '',
  };
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;

  if (RESERVED_PATHS.includes(slug[0])) {
    notFound();
  }

  const tenantId = await getTenantFromRequest();
  if (!tenantId) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h1>Invalid Tenant</h1>
        <p>No tenant configured for this domain.</p>
      </div>
    );
  }

  const slugPath = slug.join('/');
  const page = await getPageBySlug(slugPath, tenantId);

  if (!page) {
    notFound();
  }

  return (
    <PageRenderer
      html={page.html || ''}
      css={page.css || ''}
      meta_title={page.meta_title}
      meta_description={page.meta_description}
    />
  );
}
