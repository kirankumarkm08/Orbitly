'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-8 p-12 rounded-3xl bg-muted/30 border border-border shadow-2xl backdrop-blur-sm"
      >
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="h-24 w-24 rounded-full bg-success/20 flex items-center justify-center"
            >
              <CheckCircle2 className="h-12 w-12 text-success" />
            </motion.div>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-success/20 -z-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-foreground tracking-tight">Payment Successful!</h1>
          <p className="text-muted-foreground leading-relaxed">
            Thank you for your purchase. Your order has been confirmed and we're getting it ready for you.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Button asChild className="w-full h-12 rounded-xl text-lg font-bold gap-2">
            <Link href="/store">
              Continue Shopping <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full h-12 rounded-xl text-muted-foreground">
            <Link href="/dashboard/orders">
              View Order History
            </Link>
          </Button>
        </div>

        <div className="pt-6 border-t border-border mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest">
          <ShoppingBag className="h-4 w-4" />
          Securely Processed by Orbitly
        </div>
      </motion.div>
    </div>
  );
}
