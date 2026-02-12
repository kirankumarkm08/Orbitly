import { notFound } from 'next/navigation';
import PageRenderer from '@/components/PageRenderer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '';

// Known routes that should not be handled by this catch-all
const RESERVED_PATHS = ['admin', 'login', 'dashboard', 'demo', 'api', '_next'];

async function getPageBySlug(slug: string) {
  try {
    const res = await fetch(
      `${API_URL}/public/pages/${slug}?tenant_id=${TENANT_ID}`,
      { next: { revalidate: 60 } } // ISR: revalidate every 60 seconds
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  if (RESERVED_PATHS.includes(slug[0])) {
    return {};
  }

  const page = await getPageBySlug(slugPath);
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

  // Don't handle reserved paths
  if (RESERVED_PATHS.includes(slug[0])) {
    notFound();
  }

  const slugPath = slug.join('/');
  const page = await getPageBySlug(slugPath);

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
