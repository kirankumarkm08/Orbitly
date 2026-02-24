'use client';

import { useState, useCallback, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2, Save, Eye, Settings, Image as ImageIcon, Globe, FileText, Bug, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { pagesApi, authApi } from '@/lib/api';
import { toast } from 'sonner';
import AIBlockGenerator from '@/components/page-builder/AIBlockGenerator';
import type { GrapesEditorHandle } from '@/components/page-builder/GrapesEditor';

const GrapesEditor = dynamic(
  () => import('@/components/page-builder/GrapesEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

function StudioLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">Loading studio...</p>
      </div>
    </div>
  );
}

interface PageData {
  html: string;
  css: string;
}

interface PageMetadata {
  name: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  favicon_url: string;
  status: 'draft' | 'published';
}

function StudioPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageId = searchParams.get('id');
  const isEditing = Boolean(pageId);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [showSettings, setShowSettings] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [editorData, setEditorData] = useState<PageData>({ html: '', css: '' });
  const [initialContent, setInitialContent] = useState<PageData | undefined>(undefined);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const editorComponentRef = useRef<GrapesEditorHandle>(null);
  
  // Page metadata state
  const [metadata, setMetadata] = useState<PageMetadata>({
    name: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    favicon_url: '',
    status: 'draft',
  });

  // Load existing page data if editing
  useEffect(() => {
    if (isEditing && pageId) {
      loadPageData();
    }
  }, [isEditing, pageId]);

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading page data for ID:', pageId);
      const page = await pagesApi.get(pageId!);
      console.log('Loaded page:', page);
      
      // Set metadata
      setMetadata({
        name: page.name || '',
        slug: page.slug || '',
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        favicon_url: page.favicon_url || '',
        status: page.status || 'draft',
      });
      
      // Set initial content for editor
      const content = {
        html: page.html || '',
        css: page.css || '',
      };
      
      setInitialContent(content);
      setEditorData(content);
    } catch (error: any) {
      console.error('Failed to load page:', error);
      toast.error('Failed to load page data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const newMetadata = { ...metadata, name };
    
    // Only auto-generate slug if it's empty or matches previous auto-generated slug
    if (!metadata.slug || metadata.slug === generateSlug(metadata.name)) {
      newMetadata.slug = generateSlug(name);
    }
    
    // Auto-fill meta title if empty
    if (!metadata.meta_title) {
      newMetadata.meta_title = name;
    }
    
    setMetadata(newMetadata);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSave = async () => {
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('Current metadata:', metadata);
    console.log('Current editor data:', editorData);
    
    // Check if user is authenticated
    try {
      const user = await authApi.getCurrentUser();
      if (!user) {
        toast.error('You must be logged in to save pages');
        return;
      }
      console.log('User authenticated:', user.id);
      console.log('User tenant:', user.user_metadata?.tenant_id);
    } catch (authError) {
      console.error('Auth check failed:', authError);
      toast.error('Authentication error. Please log in again.');
      return;
    }
    
    // Validation
    if (!metadata.name.trim()) {
      toast.error('Page name is required');
      return;
    }
    if (!metadata.slug.trim()) {
      toast.error('Page slug is required');
      return;
    }

    setIsSaving(true);
    
    try {
      const pageData = {
        name: metadata.name.trim(),
        slug: metadata.slug.trim(),
        html: editorData.html,
        css: editorData.css,
        meta_title: metadata.meta_title.trim(),
        meta_description: metadata.meta_description.trim(),
        favicon_url: metadata.favicon_url.trim(),
        status: metadata.status,
      };

      console.log('Sending page data:', pageData);
      console.log('Is editing:', isEditing);
      console.log('Page ID:', pageId);

      if (isEditing && pageId) {
        // Update existing page
        console.log('Updating existing page...');
        const result = await pagesApi.update(pageId, pageData);
        console.log('Update result:', result);
        toast.success('Page updated successfully');
      } else {
        // Create new page
        console.log('Creating new page...');
        const newPage = await pagesApi.create(pageData);
        console.log('New page created:', newPage);
        toast.success('Page created successfully');
        // Redirect to edit mode with the new page ID
        router.replace(`/admin/studio?id=${newPage.id}`);
      }
    } catch (error: any) {
      console.error('Failed to save page:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      toast.error(error.message || 'Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = useCallback(() => {
    const html = editorData.html;
    const css = editorData.css;
    
    if (!html && !css) {
      toast.info('Nothing to preview yet. Add some content first!');
      return;
    }
    
    const previewWindow = window.open('', '_blank');
    
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${metadata.meta_title ? `<title>${metadata.meta_title}</title>` : ''}
            ${metadata.meta_description ? `<meta name="description" content="${metadata.meta_description}">` : ''}
            ${metadata.favicon_url ? `<link rel="icon" type="image/x-icon" href="${metadata.favicon_url}">` : ''}
            <style>${css}</style>
          </head>
          <body>${html}</body>
        </html>
      `);
      previewWindow.document.close();
    }
  }, [editorData, metadata]);

  const handleEditorChange = useCallback((data: PageData) => {
    console.log('Editor data changed:', data);
    setEditorData(data);
  }, []);

  // Debug function to check auth status
  const checkAuthStatus = async () => {
    try {
      const user = await authApi.getCurrentUser();
      const debugData = {
        userId: user?.id,
        email: user?.email,
        tenantId: user?.user_metadata?.tenant_id,
        hasAuth: !!user,
        currentPageData: {
          metadata,
          editorData,
          pageId,
          isEditing
        }
      };
      setDebugInfo(debugData);
      console.log('Debug Info:', debugData);
      alert('Auth check complete! See console for details.');
    } catch (error: any) {
      console.error('Auth check failed:', error);
      setDebugInfo({ error: error.message });
      alert('Auth check failed: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          {/* Page Name Input */}
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Page Name"
              value={metadata.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-64 h-8 text-sm"
            />
          </div>
          
          {/* Status Badge */}
          <Badge 
            variant={metadata.status === 'published' ? 'success' : 'secondary'}
            className="cursor-pointer"
            onClick={() => setMetadata({ ...metadata, status: metadata.status === 'draft' ? 'published' : 'draft' })}
          >
            {metadata.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
          
          {isSaving && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Debug Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={checkAuthStatus}
            title="Check Auth Status"
          >
            <Bug className="h-4 w-4" />
          </Button>
          
          {/* AI Generate */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIGenerator(true)}
            className="gap-1 bg-gradient-to-r from-purple-500/10 to-primary/10 border-purple-500/30 hover:from-purple-500/20 hover:to-primary/20"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-purple-600 dark:text-purple-400">AI Generate</span>
          </Button>
          
          {/* Settings Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className={showSettings ? 'bg-gray-100' : ''}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className={`flex-1 transition-all ${showSettings || showDebug ? 'mr-80' : ''}`}>
          <GrapesEditor 
            ref={editorComponentRef}
            initialContent={initialContent}
            onSave={handleEditorChange}
          />
        </div>

        {/* Debug Sidebar */}
        {showDebug && debugInfo && (
          <div className="w-80 bg-yellow-50 border-l border-yellow-200 overflow-y-auto">
            <div className="p-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Debug Info</h2>
              <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowDebug(false)}
                className="w-full"
              >
                Close Debug
              </Button>
            </div>
          </div>
        )}

        {/* Settings Sidebar */}
        {showSettings && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Page Settings</h2>
              
              {/* Page Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                  URL Slug
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">/</span>
                  <Input
                    id="slug"
                    placeholder="page-url"
                    value={metadata.slug}
                    onChange={(e) => setMetadata({ ...metadata, slug: e.target.value })}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This will be the URL: yoursite.com/{metadata.slug || 'page-url'}
                </p>
              </div>

              {/* Meta Title */}
              <div className="space-y-2">
                <Label htmlFor="meta_title" className="text-sm font-medium text-gray-700">
                  <Globe className="h-3 w-3 inline mr-1" />
                  Meta Title
                </Label>
                <Input
                  id="meta_title"
                  placeholder="Page title for SEO"
                  value={metadata.meta_title}
                  onChange={(e) => setMetadata({ ...metadata, meta_title: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  {metadata.meta_title.length}/60 characters (recommended for SEO)
                </p>
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <Label htmlFor="meta_description" className="text-sm font-medium text-gray-700">
                  Meta Description
                </Label>
                <textarea
                  id="meta_description"
                  placeholder="Brief description for search engines"
                  value={metadata.meta_description}
                  onChange={(e) => setMetadata({ ...metadata, meta_description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500">
                  {metadata.meta_description.length}/160 characters (recommended for SEO)
                </p>
              </div>

              {/* Favicon URL */}
              <div className="space-y-2">
                <Label htmlFor="favicon" className="text-sm font-medium text-gray-700">
                  <ImageIcon className="h-3 w-3 inline mr-1" />
                  Favicon URL
                </Label>
                <Input
                  id="favicon"
                  placeholder="https://example.com/favicon.ico"
                  value={metadata.favicon_url}
                  onChange={(e) => setMetadata({ ...metadata, favicon_url: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  URL to your favicon (16x16 or 32x32 .ico or .png)
                </p>
              </div>

              {/* Status Toggle */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={metadata.status === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMetadata({ ...metadata, status: 'draft' })}
                    className="flex-1"
                  >
                    Draft
                  </Button>
                  <Button
                    type="button"
                    variant={metadata.status === 'published' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMetadata({ ...metadata, status: 'published' })}
                    className="flex-1"
                  >
                    Published
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {metadata.status === 'published' 
                    ? 'Page is visible to the public' 
                    : 'Page is only visible to you'}
                </p>
              </div>

              {/* Quick Info */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Page Info</h3>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>ID: {pageId || 'New page'}</p>
                  <p>Status: {metadata.status}</p>
                  <p>URL: /{metadata.slug || 'page-url'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Block Generator Modal */}
      <AIBlockGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onInsert={(block) => {
          editorComponentRef.current?.insertBlock(block.html, block.css);
        }}
      />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<StudioLoading />}>
      <StudioPageContent />
    </Suspense>
  );
}
