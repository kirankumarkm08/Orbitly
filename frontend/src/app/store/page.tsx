import { headers } from 'next/headers';
import { resolveTenantFromHost } from '@/lib/resolve-tenant';
import { publicPagesApi, categoriesApi } from '@/lib/api';
import ProductGrid from '@/components/ecommerce/ProductGrid';
import CategoryNav from '@/components/ecommerce/CategoryNav';
import { ShoppingBag } from 'lucide-react';

export async function generateMetadata() {
  return {
    title: 'Store - Browse Products',
    description: 'Explore our latest products and collections.',
  };
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryId } = await searchParams;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const tenantId = await resolveTenantFromHost(host);

  if (!tenantId) {
    return <div className="p-20 text-center text-muted-foreground">Invalid Store Configuration</div>;
  }

  // Parallel fetch for products and categories
  const [products, categories] = await Promise.all([
    publicPagesApi.listPublicProducts(tenantId, categoryId),
    categoriesApi.list(), // Note: In a real multi-tenant scenario, categoriesApi.list() should also handle tenant context
  ]);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Header */}
      <div className="bg-muted px-4 py-16 md:py-24">
        <div className="container mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <ShoppingBag className="h-4 w-4" />
            Official Store
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
            Our Catalog
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Discover a curated selection of premium products designed for quality and style.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-8">
          
          {/* Controls: Category Nav */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
            <div className="flex-1 overflow-hidden">
               <CategoryNav 
                categories={categories} 
                activeCategoryId={categoryId || null}
                onSelectCategory={(id) => {
                  // This is a server component, so we use a link-based approach
                  // For client-side nav, we'd use a separate client wrapper
                  const url = new URL(window.location.href);
                  if (id) url.searchParams.set('category', id);
                  else url.searchParams.delete('category');
                  window.location.href = url.pathname + url.search;
                }}
              />
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid 
            products={products} 
            columns={4}
            variant="standard"
          />

        </div>
      </div>
    </div>
  );
}
