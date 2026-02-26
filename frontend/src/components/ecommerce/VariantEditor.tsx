'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Plus, GripVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductVariant } from '@/types';

interface Option {
  id: string;
  name: string;
  values: string[];
}

interface VariantEditorProps {
  variants: Partial<ProductVariant>[];
  onChange: (variants: Partial<ProductVariant>[]) => void;
  basePrice: number;
}

export default function VariantEditor({ variants, onChange, basePrice }: VariantEditorProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [useVariants, setUseVariants] = useState(variants.length > 0);

  // Sync internal state if needed
  useEffect(() => {
    if (variants.length > 0 && options.length === 0) {
      // Logic to infer options from existing variants could be added here
      // For now, assume a fresh state or external management
    }
  }, [variants]);

  const addOption = () => {
    setOptions([...options, { id: Math.random().toString(36).substr(2, 9), name: '', values: [] }]);
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(o => o.id !== id));
    generateVariants(options.filter(o => o.id !== id));
  };

  const updateOptionName = (id: string, name: string) => {
    const newOptions = options.map(o => o.id === id ? { ...o, name } : o);
    setOptions(newOptions);
  };

  const addOptionValue = (id: string, value: string) => {
    if (!value.trim()) return;
    const newOptions = options.map(o => {
      if (o.id === id) {
        if (o.values.includes(value.trim())) return o;
        return { ...o, values: [...o.values, value.trim()] };
      }
      return o;
    });
    setOptions(newOptions);
    generateVariants(newOptions);
  };

  const removeOptionValue = (optionId: string, value: string) => {
    const newOptions = options.map(o => o.id === optionId ? { ...o, values: o.values.filter(v => v !== value) } : o);
    setOptions(newOptions);
    generateVariants(newOptions);
  };

  const generateVariants = (currentOptions: Option[]) => {
    if (currentOptions.length === 0 || currentOptions.every(o => o.values.length === 0)) {
      onChange([]);
      return;
    }

    // Cartesian product of option values
    const cartesian = (...args: any[][]) => args.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
    
    const validOptions = currentOptions.filter(o => o.values.length > 0);
    if (validOptions.length === 0) return;

    const combinations = validOptions.length === 1 
      ? validOptions[0].values.map(v => [v])
      : cartesian(...validOptions.map(o => o.values));

    const newVariants = combinations.map((combo: string[]) => {
      const name = combo.join(' / ');
      const optionMap: Record<string, string> = {};
      validOptions.forEach((opt, idx) => {
        optionMap[opt.name.toLowerCase()] = combo[idx];
      });

      // Try to preserve existing variant data (like SKU or price) if name matches
      const existing = variants.find(v => v.name === name);

      return {
        name,
        options: optionMap,
        price: existing?.price ?? null,
        sku: existing?.sku ?? '',
        inventory_quantity: existing?.inventory_quantity ?? 0,
        is_active: existing?.is_active ?? true,
      };
    });

    onChange(newVariants);
  };

  const updateVariant = (index: number, data: Partial<ProductVariant>) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], ...data };
    onChange(newVariants);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-foreground">Product Variants</h3>
          <p className="text-xs text-muted-foreground">Does this product come in different sizes, colors, etc.?</p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
            variant={useVariants ? "default" : "outline"} 
            size="sm" 
            onClick={() => {
              setUseVariants(!useVariants);
              if (useVariants) onChange([]);
            }}
          >
            {useVariants ? 'Disable' : 'Enable'} Variants
          </Button>
        </div>
      </div>

      {useVariants && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Options Section */}
          <div className="space-y-3">
            {options.map((option) => (
              <div key={option.id} className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Input 
                    placeholder="Option Name (e.g. Color, Size)" 
                    className="flex-1 bg-background"
                    value={option.name}
                    onChange={(e) => updateOptionName(option.id, e.target.value)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeOption(option.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pl-7">
                  {option.values.map(val => (
                    <Badge key={val} variant="secondary" className="gap-1 py-1">
                      {val}
                      <button onClick={() => removeOptionValue(option.id, val)}>
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </Badge>
                  ))}
                  <Input 
                    placeholder="Add value..." 
                    className="w-32 h-7 text-xs bg-background"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOptionValue(option.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOption} className="w-full dashed border-2">
              <Plus className="h-4 w-4 mr-2" /> Add Option
            </Button>
          </div>

          {/* Variants Table Section */}
          {variants.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden bg-muted/10">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-1/3">Variant</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price Override</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">SKU</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {variants.map((variant, idx) => (
                    <tr key={variant.name} className={cn("hover:bg-muted/20 transition-colors", !variant.is_active && "opacity-50 grayscale")}>
                      <td className="px-4 py-3 font-medium">{variant.name}</td>
                      <td className="px-4 py-3">
                        <Input 
                          type="number" 
                          placeholder={`$${basePrice}`} 
                          className="h-8 text-xs bg-background" 
                          value={variant.price || ''}
                          onChange={(e) => updateVariant(idx, { price: e.target.value ? Number(e.target.value) : null })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          placeholder="SKU-123" 
                          className="h-8 text-xs bg-background"
                          value={variant.sku || ''}
                          onChange={(e) => updateVariant(idx, { sku: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          type="number" 
                          placeholder="0" 
                          className="h-8 text-xs bg-background"
                          value={variant.inventory_quantity}
                          onChange={(e) => updateVariant(idx, { inventory_quantity: Number(e.target.value) })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          className={cn("h-6 w-6 rounded flex items-center justify-center border transition-colors", 
                            variant.is_active ? "bg-primary border-primary text-white" : "border-border text-transparent")}
                          onClick={() => updateVariant(idx, { is_active: !variant.is_active })}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
