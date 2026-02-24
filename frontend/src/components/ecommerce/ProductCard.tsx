'use client';

import React from 'react';
import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Eye, Heart, Star, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  variant?: 'minimal' | 'standard' | 'featured';
  className?: string;
  onAddToCart?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  variant = 'standard', 
  className,
  onAddToCart,
  onViewProduct 
}: ProductCardProps) {
  const mainImage = product.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image';
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  if (variant === 'minimal') {
    return (
      <motion.div 
        whileHover={{ y: -5 }}
        className={cn("group cursor-pointer", className)}
        onClick={() => onViewProduct?.(product)}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          <img 
            src={mainImage} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {hasDiscount && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-foreground text-[10px] font-bold">-{discountPercentage}%</Badge>
            </div>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">${product.compare_at_price?.toFixed(2)}</span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={cn("relative group overflow-hidden rounded-3xl bg-gradient-to-br from-muted/50 to-muted border border-border flex flex-col md:flex-row h-full", className)}>
        <div className="md:w-1/2 aspect-square md:aspect-auto overflow-hidden">
          <img 
            src={mainImage} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-center gap-4">
          <div className="space-y-2">
            <Badge variant="outline" className="border-primary/30 text-primary uppercase tracking-widest text-[10px]">Featured Product</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{product.name}</h2>
            <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">${product.compare_at_price?.toFixed(2)}</span>
              )}
            </div>
            <Button size="lg" className="rounded-full px-8 gap-2 group/btn" onClick={() => onAddToCart?.(product)}>
              <ShoppingCart className="h-5 w-5 transition-transform group-hover/btn:-translate-y-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Standard Variant (Default)
  return (
    <Card variant="glass" className={cn("group overflow-hidden border-border hover:border-primary/30 transition-all flex flex-col h-full", className)}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img 
          src={mainImage} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Rapid Action Buttons */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
           <Button 
            variant="glass" 
            size="icon" 
            className="rounded-full bg-background/80 hover:bg-white text-foreground"
            onClick={() => onViewProduct?.(product)}
           >
            <Eye className="h-4 w-4" />
           </Button>
           <Button 
            variant="glass" 
            size="icon" 
            className="rounded-full bg-background/80 hover:bg-white text-foreground"
            onClick={() => onAddToCart?.(product)}
           >
            <ShoppingCart className="h-4 w-4" />
           </Button>
        </div>

        {hasDiscount && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-red-500 text-white border-none shadow-lg shadow-red-500/20">SALE</Badge>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">
              {product.tags?.[0] || 'New Arrival'}
            </p>
            <div className="flex items-center gap-0.5 text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-[10px] font-bold">4.9</span>
            </div>
          </div>
          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">${product.compare_at_price?.toFixed(2)}</span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-4 rounded-full border-border bg-muted hover:bg-primary hover:text-white hover:border-primary transition-all gap-2"
            onClick={() => onAddToCart?.(product)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
