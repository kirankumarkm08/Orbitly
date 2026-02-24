'use client';

import React from 'react';
import { Category } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  className?: string;
}

export default function CategoryNav({ 
  categories, 
  activeCategoryId, 
  onSelectCategory,
  className 
}: CategoryNavProps) {
  
  return (
    <div className={cn("relative group", className)}>
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border",
            activeCategoryId === null
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
              : "bg-muted text-muted-foreground border-border hover:border-primary/30"
          )}
        >
          All Products
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border",
              activeCategoryId === category.id
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                : "bg-muted text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Scroll Indicators (Fade) */}
      <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none group-hover:opacity-0 transition-opacity" />
    </div>
  );
}
