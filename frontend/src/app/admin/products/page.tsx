'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Search, Plus, Edit2, Trash2, Package, 
  Loader2, AlertCircle, ArrowUpDown, Filter,
  MoreHorizontal, Image as ImageIcon, ExternalLink,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/types';

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, categoryFilter, currentPage]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        category_id: categoryFilter === 'all' ? undefined : categoryFilter,
        limit,
        offset: (currentPage - 1) * limit
      };
      const { data, count } = await productsApi.list(params);
      setProducts(data);
      setTotalCount(count);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;
    try {
      await productsApi.delete(id);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to archive product');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/15 text-success border-success/20';
      case 'draft': return 'bg-yellow-500/15 text-warning border-warning/20';
      case 'archived': return 'bg-gray-500/15 text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your store inventory • {totalCount} total
          </p>
        </div>
        <Link href="/admin/products/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card variant="glass" className="border-border">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or slug..."
              className="pl-10 bg-muted border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-10 px-3 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              className="h-10 px-3 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 truncate max-w-[150px]"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Button variant="outline" className="gap-2 border-border bg-muted" onClick={fetchProducts}>
              <ArrowUpDown className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchProducts}>Try Again</Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-600" />
          </div>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' 
              ? 'No products match your filters.' 
              : 'No products yet. Show the world what you have!'}
          </p>
          {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && (
            <Link href="/admin/products/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} variant="glass" className="border-border hover:border-gray-500/30 transition-all group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 bg-muted flex-shrink-0 border-r border-border overflow-hidden">
                      {product.images?.[0]?.url ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
                          <Badge className={cn("text-[10px] px-1.5 py-0 uppercase border", getStatusColor(product.status))}>
                            {product.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          /{product.slug} • {product.category_id ? (categories.find(c => c.id === product.category_id)?.name || 'Category') : 'Uncategorized'}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="font-medium text-foreground">${product.price.toFixed(2)}</p>
                        </div>
                        {/* Note: Inventory would usually come from variants, but let's show a placeholder if variants are implemented */}
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Stock</p>
                          <p className="font-medium text-foreground">--</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleArchive(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalCount > limit && (
            <div className="flex items-center justify-between px-2 py-4">
              <p className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} products
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(totalCount / limit) }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / limit), p + 1))}
                  disabled={currentPage === Math.ceil(totalCount / limit)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
