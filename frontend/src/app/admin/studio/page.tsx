'use client';

import { StudioEditor, type PageData } from '@/components/page-builder';
import { pagesApi } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ArrowLeft, Loader2, Globe, Eye } from 'lucide-react';
import Link from 'next/link';

function StudioEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageId = searchParams.get('id');

  const [initialData, setInitialData] = useState<PageData | undefined>(undefined);
  const [pageMeta, setPageMeta] = useState<{ name: string; slug: string; status: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load page data if ID exists
  useEffect(() => {
    if (pageId) {
      setIsLoading(true);
      pagesApi.get(pageId)
        .then(page => {
          setPageMeta({ name: page.name, slug: page.slug, status: page.status });
          if (page.html) {
            setInitialData({
              html: page.html,
              css: page.css || '',
              components: typeof page.components === 'string'
                ? page.components
                : JSON.stringify(page.components),
              styles: typeof page.styles === 'string'
                ? page.styles
                : JSON.stringify(page.styles),
            });
          }
        })
        .catch(err => {
          console.error('Failed to load page:', err);
          alert('Failed to load page');
        })
        .finally(() => setIsLoading(false));
    }
  }, [pageId]);

  const handleSave = async (data: PageData) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const components = JSON.parse(data.components);
      const styles = JSON.parse(data.styles);

      if (pageId) {
        await pagesApi.update(pageId, {
          html: data.html,
          css: data.css,
          components,
          styles,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        // For new pages, redirect to pages manager — should not normally hit this
        // since create flow happens in /admin/pages
        const name = prompt('Enter page name:', 'New Page');
        if (!name) { setIsSaving(false); return; }
        const slug = prompt('Enter URL slug:', name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        if (!slug) { setIsSaving(false); return; }
        const newPage = await pagesApi.create({
          name, slug,
          html: data.html, css: data.css,
          components, styles,
        });
        setSaveSuccess(true);
        router.push(`/admin/studio?id=${newPage.id}`);
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      alert(error.message || 'Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          <p className="text-sm text-gray-500">Loading page editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Top Info Bar */}
      {pageMeta && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          padding: '8px 16px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <Link
            href="/admin/pages"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '13px',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            Pages
          </Link>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{pageMeta.name}</span>
          <span style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 600,
            textTransform: 'uppercase',
            background: pageMeta.status === 'published' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
            color: pageMeta.status === 'published' ? '#4ade80' : '#fbbf24',
          }}>
            {pageMeta.status}
          </span>
          <span style={{ color: '#64748b', fontSize: '12px' }}>/{pageMeta.slug}</span>

          {pageMeta.status === 'published' && (
            <>
              <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
              <a
                href={`/${pageMeta.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#60a5fa',
                  textDecoration: 'none',
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                <Eye style={{ width: '13px', height: '13px' }} />
                View Live
              </a>
            </>
          )}

          {saveSuccess && (
            <>
              <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ color: '#4ade80', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ✓ Saved
              </span>
            </>
          )}
        </div>
      )}

      <StudioEditor
        initialContent={initialData}
        onSave={handleSave}
        isSaving={isSaving}
        onLoad={() => console.log('Studio SDK Editor loaded!')}
      />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          <p className="text-sm text-gray-500">Loading editor...</p>
        </div>
      </div>
    }>
      <StudioEditorContent />
    </Suspense>
  );
}
