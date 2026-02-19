'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { X, Building2, Globe, Settings, Loader2, Package } from 'lucide-react';

// Module configuration by niche
const MODULES_BY_NICHE = {
  ecommerce: ['products', 'orders', 'customers', 'inventory'],
  events: ['events', 'tickets', 'attendees', 'speakers'],
  launchpad: ['pages', 'waitlist', 'campaigns'],
  static: ['pages', 'blog', 'media', 'forms'],
} as const;

type NicheType = keyof typeof MODULES_BY_NICHE;

interface CreateTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateTenantDialog({ isOpen, onClose, onSubmit }: CreateTenantDialogProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState(''); // Optional, if needed
  const [niche, setNiche] = useState<NicheType>('static');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const modules = MODULES_BY_NICHE[niche];
      await onSubmit({ 
        name, 
        slug, 
        domain,
        niche,
        modules 
      });
      onClose();
      // Reset form
      setName('');
      setSlug('');
      setDomain('');
      setNiche('static');
    } catch (err: any) {
      setError(err.message || 'Failed to create tenant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-enter">
      <Card className="w-full max-w-md glass-card border-white/10 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader>
          <CardTitle>Create New Tenant</CardTitle>
          <CardDescription>Add a new workspace to the system</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Tenant Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="e.g. Acme Corp"
                  className="pl-10 bg-white/5 border-white/10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Slug (URL Identifier)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="e.g. acme-corp"
                  className="pl-10 bg-white/5 border-white/10"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Custom Domain (Optional)</label>
                 <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="e.g. app.acme.com"
                  className="pl-10 bg-white/5 border-white/10"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            </div>

            {/* Niche Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                <Package className="inline h-4 w-4 mr-1" />
                Workspace Niche
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value as NicheType)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="static" className="bg-gray-800">Static Website (Pages, Blog, Media)</option>
                <option value="ecommerce" className="bg-gray-800">E-commerce (Products, Orders, Inventory)</option>
                <option value="events" className="bg-gray-800">Events (Events, Tickets, Attendees)</option>
                <option value="launchpad" className="bg-gray-800">Launchpad (Pages, Waitlist, Campaigns)</option>
              </select>
              <p className="text-xs text-gray-400">
                Modules: {MODULES_BY_NICHE[niche].join(', ')}
              </p>
            </div>
             
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                Create Tenant
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
