'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-white px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 bg-muted border-border"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 hover:bg-accent transition-all">
          <Bell className="h-5 w-5 text-secondary-foreground" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"></span>
        </button>

        {/* System Status */}
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5 border border-success/20">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-xs font-medium text-success">All Systems Operational</span>
        </div>
      </div>
    </header>
  );
}
