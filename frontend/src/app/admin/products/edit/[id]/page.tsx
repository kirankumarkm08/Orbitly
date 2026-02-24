'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductForm from '@/components/ecommerce/ProductForm';
import { productsApi } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
       fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await productsApi.get(id as string);
      setProduct(data);
    } catch (err: any) {
      console.error('Failed to fetch product:', err);
      setError('Product not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await productsApi.update(id as string, data);
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update product');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p>{error}</p>
        <Button onClick={() => router.push('/admin/products')}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <ProductForm 
        title={`Edit Product: ${product.name}`}
        initialData={product}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/products')}
      />
    </div>
  );
}
