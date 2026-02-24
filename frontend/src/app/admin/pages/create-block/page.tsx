'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Settings, 
  FileText, 
  Globe, 
  Sparkles,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TinyMCEBlockManager, Block } from '@/components/page-builder';
import { pagesApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CreateBlockPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([{ id: 'initial', content: '' }]);
  const [metadata, setMetadata] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'draft' as 'draft' | 'published'
  });

  // Auto-generate slug
  useEffect(() => {
    if (metadata.name && !metadata.slug) {
      setMetadata(prev => ({
        ...prev,
        slug: metadata.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      }));
    }
  }, [metadata.name]);

  const handleSave = async () => {
    if (!metadata.name.trim()) {
      toast.error('Please enter a page name');
      return;
    }

    setIsSaving(true);
    try {
      // Serialize blocks into div sections
      const htmlContent = blocks.map(block => 
        `<div class="page-section" data-block-id="${block.id}">${block.content}</div>`
      ).join('\n');

      const pageData = {
        name: metadata.name,
        slug: metadata.slug || metadata.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        html: htmlContent,
        status: metadata.status,
        meta_title: metadata.name,
        meta_description: metadata.description
      };

      await pagesApi.create(pageData);
      toast.success('Page created successfully!');
      router.push('/admin/pages');
    } catch (error: any) {
      console.error('Save failed:', error);
      toast.error(error.message || 'Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4]"> {/* Clean green background */}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="hover:bg-green-50 text-green-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Block-based Page Creator</h1>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by TinyMCE Blocks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-green-200 hover:bg-green-50 text-green-700"
              onClick={() => toast.info('Preview coming soon!')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Page
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Settings */}
        <aside className="lg:col-span-1 space-y-6">
          <Card className="border-green-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="text-sm font-semibold text-green-800 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Page Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Page Name
                </Label>
                <Input 
                  id="name"
                  placeholder="e.g. Services Overview"
                  value={metadata.name}
                  onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  URL Slug
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                  <Input 
                    id="slug"
                    placeholder="services"
                    value={metadata.slug}
                    onChange={(e) => setMetadata(prev => ({ ...prev, slug: e.target.value }))}
                    className="pl-6 bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </Label>
                <select
                  id="status"
                  value={metadata.status}
                  onChange={(e) => setMetadata(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                  className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-green-100/50 rounded-xl border border-green-200">
            <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Pro Tip
            </h4>
            <p className="text-xs text-green-700 leading-relaxed">
              Use reorder controls to perfectly sequence your content blocks. Each block becomes a section on your live site.
            </p>
          </div>
        </aside>

        {/* Right Column: Block Builder */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Content Sections
            </h2>
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              {blocks.length} {blocks.length === 1 ? 'Section' : 'Sections'}
            </div>
          </div>

          <TinyMCEBlockManager 
            initialBlocks={blocks}
            onChange={setBlocks}
            className="pb-20"
          />
        </div>
      </main>
    </div>
  );
}
