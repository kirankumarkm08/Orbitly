'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { 
  Search, Plus, Edit2, Trash2, FolderTree, 
  Loader2, AlertCircle, Check, Copy, ChevronRight,
  MoreHorizontal, ArrowUpDown, Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/types';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list();
      setCategories(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      parent_id: null,
      sort_order: 0
    });
    setShowEditDialog(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!editingCategory?.name) return;
    setIsSaving(true);
    try {
      if (editingCategory.id) {
        await categoriesApi.update(editingCategory.id, editingCategory);
      } else {
        await categoriesApi.create(editingCategory);
      }
      setShowEditDialog(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to get category name by ID
  const getCategoryName = (id: string | null) => {
    if (!id) return 'None';
    return categories.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your products into categories • {categories.length} total
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card variant="glass" className="border-border">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-10 bg-muted border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 border-border bg-muted" onClick={fetchCategories}>
            <ArrowUpDown className="h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchCategories}>Try Again</Button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <FolderTree className="h-8 w-8 text-gray-600" />
          </div>
          <p className="text-muted-foreground">
            {searchQuery ? 'No categories match your search.' : 'No categories yet.'}
          </p>
          {!searchQuery && (
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Create Category
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} variant="glass" className="border-border hover:border-gray-500/30 transition-all group">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-16 border-r border-border py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Folder className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 px-4 py-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{category.name}</h3>
                      {category.parent_id && (
                        <Badge variant="outline" className="text-[10px] uppercase">
                          Subcategory of {getCategoryName(category.parent_id)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      /{category.slug} • {category.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(category)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory?.id ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              Organization helps customers find products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-foreground">Name</label>
              <Input
                placeholder="e.g. Electronics, Clothing"
                value={editingCategory?.name || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-foreground">Slug (Optional)</label>
              <Input
                placeholder="electronics"
                value={editingCategory?.slug || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-foreground">Description</label>
              <Input
                placeholder="Short description..."
                value={editingCategory?.description || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-foreground">Parent Category</label>
              <select
                className="w-full h-10 px-3 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={editingCategory?.parent_id || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, parent_id: e.target.value || null })}
              >
                <option value="">None (Top Level)</option>
                {categories
                  .filter(c => c.id !== editingCategory?.id) // Prevent self-parenting
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!editingCategory?.name || isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingCategory?.id ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
