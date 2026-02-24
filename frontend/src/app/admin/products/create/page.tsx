'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/ecommerce/ProductForm';
import { productsApi } from '@/lib/api';

export default function CreateProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await productsApi.create(data);
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    }
  };

  return (
    <div className="container py-6">
      <ProductForm 
        title="Create New Product"
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/products')}
      />
    </div>
  );
}
