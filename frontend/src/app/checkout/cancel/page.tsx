'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { XCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-8 p-12 rounded-3xl bg-muted/30 border border-border"
      >
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Payment Cancelled</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your payment was not processed. No charges were made. If you had issues during checkout, please try again or contact support.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Button asChild className="w-full h-12 rounded-xl text-lg font-bold gap-2">
            <Link href="/store">
              <ArrowLeft className="h-5 w-5" /> Return to Store
            </Link>
          </Button>
        </div>

        <div className="pt-6 border-t border-border mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest">
          <ShoppingBag className="h-4 w-4" />
          Orbitly E-commerce
        </div>
      </motion.div>
    </div>
  );
}
