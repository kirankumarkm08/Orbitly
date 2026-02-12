'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { 
  Search, Plus, Eye, Edit2, Trash2, Globe, Home, Copy,
  Loader2, AlertCircle, ExternalLink, ArrowUpDown, Check,
  LayoutTemplate, FileText, Sparkles, MoreHorizontal,
  ChevronRight, Clock, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { pagesApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Page {
  id: string;
  name: string;
  slug: string;
  status: 'published' | 'draft' | 'scheduled';
  is_homepage: boolean;
  html?: string;
  created_at: string;
  updated_at: string;
}

export default function PagesManagement() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPages();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (newPageName && !newPageSlug) {
      setNewPageSlug(newPageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [newPageName]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await pagesApi.list();
      setPages(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch pages:', err);
      setError('Failed to load pages. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!newPageName.trim()) return;
    setIsCreating(true);
    try {
      const slug = newPageSlug || newPageName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newPage = await pagesApi.create({ name: newPageName, slug });
      setShowCreateDialog(false);
      setNewPageName('');
      setNewPageSlug('');
      // Go directly to the studio editor
      router.push(`/admin/studio?id=${newPage.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create page');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page? This cannot be undone.')) return;
    try {
      await pagesApi.delete(id);
      setPages(pages.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete page');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await pagesApi.publish(id);
      setPages(pages.map(p => p.id === id ? { ...p, status: 'published' as const } : p));
    } catch (err: any) {
      alert(err.message || 'Failed to publish page');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await pagesApi.update(id, { status: 'draft' });
      setPages(pages.map(p => p.id === id ? { ...p, status: 'draft' as const } : p));
    } catch (err: any) {
      alert(err.message || 'Failed to unpublish page');
    }
  };

  const handleSetHomepage = async (id: string) => {
    try {
      const currentHomepage = pages.find(p => p.is_homepage);
      if (currentHomepage) {
        await pagesApi.update(currentHomepage.id, { is_homepage: false });
      }
      await pagesApi.update(id, { is_homepage: true, status: 'published' });
      setPages(pages.map(p => ({
        ...p,
        is_homepage: p.id === id,
        status: p.id === id ? 'published' as const : p.status,
      })));
    } catch (err: any) {
      alert(err.message || 'Failed to set homepage');
    }
  };

  const handleDuplicate = async (page: Page) => {
    try {
      const newPage = await pagesApi.create({
        name: `${page.name} (Copy)`,
        slug: `${page.slug}-copy`,
      });
      await fetchPages();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate page');
    }
  };

  const copySlugToClipboard = (slug: string) => {
    navigator.clipboard.writeText(`/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Split pages
  const homepage = pages.find(p => p.is_homepage);
  const filteredPages = pages.filter(page => {
    const matchesSearch =
      (page.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (page.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' || page.status === filter;
    return matchesSearch && matchesFilter;
  });

  const publishedCount = pages.filter(p => p.status === 'published').length;
  const draftCount = pages.filter(p => p.status === 'draft').length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pages</h1>
          <p className="text-muted-foreground mt-1">
            Manage your website pages • {pages.length} total
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/studio">
            <Button variant="outline" className="gap-2 border-border bg-muted hover:bg-accent">
              <Sparkles className="h-4 w-4" />
              Open Studio
            </Button>
          </Link>
          <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            New Page
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
            filter === 'all'
              ? "bg-primary/10 border-primary/30"
              : "bg-muted border-border hover:border-border"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
            <LayoutTemplate className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pages.length}</p>
            <p className="text-xs text-muted-foreground">All Pages</p>
          </div>
        </button>

        <button
          onClick={() => setFilter('published')}
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
            filter === 'published'
              ? "bg-success/10 border-green-500/30"
              : "bg-muted border-border hover:border-border"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
            <Globe className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{publishedCount}</p>
            <p className="text-xs text-muted-foreground">Published</p>
          </div>
        </button>

        <button
          onClick={() => setFilter('draft')}
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
            filter === 'draft'
              ? "bg-warning/10 border-yellow-500/30"
              : "bg-muted border-border hover:border-border"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
            <FileText className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{draftCount}</p>
            <p className="text-xs text-muted-foreground">Drafts</p>
          </div>
        </button>
      </div>

      {/* Homepage Card */}
      {homepage && (
        <Card variant="glass" className="border-purple-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                  <Home className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{homepage.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-400 uppercase tracking-wider">
                      Homepage
                    </span>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                      homepage.status === 'published' ? "bg-green-500/20 text-success" : "bg-yellow-500/20 text-warning"
                    )}>
                      {homepage.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">yoursite.com/</span>
                    <button
                      onClick={() => copySlugToClipboard('')}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {copiedSlug === '' ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5 border-border bg-muted text-xs">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                </a>
                <Link href={`/admin/studio?id=${homepage.id}`}>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <Card variant="glass" className="border-border">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              className="pl-10 bg-muted border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 border-border bg-muted" onClick={fetchPages}>
            <ArrowUpDown className="h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Pages List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your pages...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchPages}>Try Again</Button>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
          <p className="text-muted-foreground">
            {searchQuery ? 'No pages match your search.' : 'No pages yet. Create your first page!'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Page
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredPages.map((page) => (
            <Card
              key={page.id}
              variant="glass"
              className={cn(
                "border-border hover:border-border transition-all group",
                page.is_homepage && "border-purple-500/20"
              )}
            >
              <CardContent className="p-0">
                <div className="flex items-center">
                  {/* Page Icon */}
                  <div className="flex items-center justify-center w-16 border-r border-border">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      page.is_homepage
                        ? "bg-purple-500/15"
                        : page.status === 'published'
                          ? "bg-success/10"
                          : "bg-muted"
                    )}>
                      {page.is_homepage ? (
                        <Home className="h-5 w-5 text-purple-400" />
                      ) : (
                        <FileText className={cn(
                          "h-5 w-5",
                          page.status === 'published' ? "text-success" : "text-muted-foreground"
                        )} />
                      )}
                    </div>
                  </div>

                  {/* Page Info */}
                  <div className="flex-1 min-w-0 py-4 px-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{page.name}</h3>
                      {page.is_homepage && (
                        <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-400">
                          HOME
                        </span>
                      )}
                      <span className={cn(
                        "shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase",
                        page.status === 'published'
                          ? "bg-green-500/15 text-success"
                          : "bg-yellow-500/15 text-warning"
                      )}>
                        {page.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => copySlugToClipboard(page.slug)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-secondary-foreground transition-colors group/slug"
                      >
                        <span>/{page.slug}</span>
                        {copiedSlug === page.slug ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-0 group-hover/slug:opacity-100 transition-opacity" />
                        )}
                      </button>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(page.updated_at || page.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {page.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs text-muted-foreground hover:text-success gap-1.5"
                        onClick={() => handlePublish(page.id)}
                      >
                        <Globe className="h-3.5 w-3.5" /> Publish
                      </Button>
                    )}
                    {page.status === 'published' && !page.is_homepage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs text-muted-foreground hover:text-purple-400 gap-1.5"
                        onClick={() => handleSetHomepage(page.id)}
                      >
                        <Home className="h-3.5 w-3.5" /> Set Home
                      </Button>
                    )}
                    {page.status === 'published' && (
                      <a href={page.is_homepage ? '/' : `/${page.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-400" title="Preview">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Link href={`/admin/studio?id=${page.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Edit in Studio">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>

                    {/* More Menu */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setActiveMenu(activeMenu === page.id ? null : page.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>

                      {activeMenu === page.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg glass-card border border-border shadow-xl py-1">
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary-foreground hover:bg-muted hover:text-foreground transition-colors"
                              onClick={() => {
                                handleDuplicate(page);
                                setActiveMenu(null);
                              }}
                            >
                              <Copy className="h-4 w-4" /> Duplicate
                            </button>
                            {page.status === 'published' && (
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary-foreground hover:bg-muted hover:text-warning transition-colors"
                                onClick={() => {
                                  handleUnpublish(page.id);
                                  setActiveMenu(null);
                                }}
                              >
                                <FileText className="h-4 w-4" /> Unpublish
                              </button>
                            )}
                            <div className="border-t border-border my-1" />
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={() => {
                                handleDelete(page.id);
                                setActiveMenu(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Give your page a name and URL slug. You&apos;ll be taken to the Studio editor to design it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-foreground">Page Name</label>
              <Input
                placeholder="e.g. About Us, Contact, Pricing"
                value={newPageName}
                onChange={(e) => {
                  setNewPageName(e.target.value);
                  // Auto-generate slug when user types name
                  const autoSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  setNewPageSlug(autoSlug);
                }}
                className="bg-muted border-border"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-foreground">URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground shrink-0">yoursite.com /</span>
                <Input
                  placeholder="about-us"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                  className="bg-muted border-border"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be the URL path for your page
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewPageName('');
                setNewPageSlug('');
              }}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePage}
              disabled={!newPageName.trim() || isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Create & Open Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
