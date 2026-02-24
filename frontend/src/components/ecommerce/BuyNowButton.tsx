'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { stripeApi } from '@/lib/api';
import { Product } from '@/types';

interface BuyNowButtonProps {
  product: Product;
  className?: string;
}

export default function BuyNowButton({ product, className }: BuyNowButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      const line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.images?.[0]?.url ? [product.images[0].url] : [],
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: 1,
        },
      ];

      const { url } = await stripeApi.createCheckoutSession({
        line_items,
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: window.location.href,
        metadata: {
          product_id: product.id,
        },
      });

      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error('Checkout failed:', err);
      alert(err.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size="lg" 
      className={className}
      onClick={handleBuyNow}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          Buy Now
        </>
      )}
    </Button>
  );
}
