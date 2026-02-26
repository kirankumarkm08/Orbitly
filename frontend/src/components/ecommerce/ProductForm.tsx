'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Save, X, Plus, Package, 
  Trash2, Image as ImageIcon, 
  Settings, Globe, Tag, 
  ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { categoriesApi } from '@/lib/api';
import { Product, Category, ProductVariant } from '@/types';
import VariantEditor from './VariantEditor';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  title: string;
}

export default function ProductForm({ initialData, onSubmit, onCancel, title }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    compare_at_price: null,
    cost_per_item: null,
    status: 'draft',
    category_id: null,
    images: [],
    tags: [],
    seo_meta: {
      title: '',
      description: '',
    },
    ...initialData
  });

  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(initialData?.product_variants || []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'seo'>('basic');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug if name changes and it's a new product
    if (field === 'name' && !initialData?.id && !formData.slug) {
       setFormData(prev => ({ 
         ...prev, 
         name: value,
         slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') 
       }));
    }
  };

  const handleSeoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seo_meta: { ...prev.seo_meta, [field]: value }
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const newImage = { url, alt: formData.name || 'Product Image', position: (formData.images?.length || 0) + 1 };
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), newImage] }));
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    // Re-index positions
    const reindexed = newImages.map((img, i) => ({ ...img, position: i + 1 }));
    setFormData(prev => ({ ...prev, images: reindexed }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalData = { ...formData, variants };
      await onSubmit(finalData);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between py-4 bg-background/80 backdrop-blur-md border-b border-border mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} type="button">
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} type="button">Cancel</Button>
          <Button className="gap-2" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
            <Button 
              variant={activeTab === 'basic' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('basic')}
              type="button"
            >
              Basic Info
            </Button>
            <Button 
              variant={activeTab === 'variants' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('variants')}
              type="button"
            >
              Variants
            </Button>
            <Button 
              variant={activeTab === 'seo' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('seo')}
              type="button"
            >
              SEO & Social
            </Button>
          </div>

          {activeTab === 'basic' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> General Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Product Name</label>
                    <Input 
                      placeholder="e.g. Premium Wireless Headphones" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Description</label>
                    <textarea 
                      className="w-full min-h-[150px] p-3 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                      placeholder="Describe your product in detail..."
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-400" /> Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {formData.images?.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg border border-border bg-muted overflow-hidden group">
                        <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => removeImage(idx)} type="button">
                            <Trash2 className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={addImage}
                      className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="h-6 w-6" />
                      <span className="text-xs">Add Image</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-400" /> Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Price ($)</label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Compare-at Price ($)</label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.compare_at_price || ''}
                      onChange={(e) => handleInputChange('compare_at_price', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="animate-in fade-in duration-300">
               <Card variant="glass">
                  <CardContent className="pt-6">
                    <VariantEditor 
                      variants={variants} 
                      onChange={setVariants} 
                      basePrice={formData.price || 0}
                    />
                  </CardContent>
               </Card>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyan-400" /> Search Engine Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Meta Title</label>
                    <Input 
                      placeholder="Product SEO Title" 
                      value={formData.seo_meta?.title || ''}
                      onChange={(e) => handleSeoChange('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Meta Description</label>
                    <textarea 
                      className="w-full min-h-[100px] p-3 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                      placeholder="Product SEO Description..."
                      value={formData.seo_meta?.description || ''}
                      onChange={(e) => handleSeoChange('description', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">URL Handle (Slug)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">/product/</span>
                      <Input 
                        placeholder="slug" 
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select 
                className="w-full h-10 px-3 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="active">Active (Visible)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Note</p>
                <p className="text-xs text-muted-foreground mt-1">Archived products are hidden from your store and search engines.</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Category</label>
                <select 
                  className="w-full h-10 px-3 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.category_id || ''}
                  onChange={(e) => handleInputChange('category_id', e.target.value || null)}
                >
                  <option value="">Uncategorized</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.tags?.map(tag => (
                    <Badge key={tag} className="gap-1 pr-1 bg-muted text-foreground border-border">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add tags..." 
                    className="h-8 text-xs"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" className="h-8" onClick={addTag}>Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
             <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Statistics</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Variants</span>
                      <span className="font-bold text-foreground">{variants.length}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Images</span>
                      <span className="font-bold text-foreground">{formData.images?.length || 0}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Profit Potential</span>
                      <span className="font-bold text-success">High</span>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

// Missing Lucide icons I used
function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
