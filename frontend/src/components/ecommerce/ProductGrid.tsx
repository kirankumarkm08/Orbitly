'use client';

import React from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { cn } from '@/lib/utils';
import { ShoppingBag, Loader2 } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4 | 5;
  variant?: 'minimal' | 'standard';
  onAddToCart?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  emptyMessage?: string;
}

export default function ProductGrid({ 
  products, 
  loading = false, 
  columns = 4, 
  variant = 'standard',
  onAddToCart,
  onViewProduct,
  emptyMessage = "No products found in this category."
}: ProductGridProps) {
  
  const gridConfig = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  };

  if (loading) {
    return (
      <div className={cn("grid gap-6 md:gap-8", gridConfig[columns])}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4 animate-pulse">
            <div className="aspect-square bg-muted rounded-2xl" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border text-center">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Nothing to show yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 md:gap-8", gridConfig[columns])}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          variant={variant}
          onAddToCart={onAddToCart}
          onViewProduct={onViewProduct}
        />
      ))}
    </div>
  );
}
