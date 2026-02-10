'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/5 glass px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 hover:bg-white/5 transition-all">
          <Bell className="h-5 w-5 text-gray-400" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* System Status */}
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-1.5 border border-green-500/20">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-green-400">All Systems Operational</span>
        </div>
      </div>
    </header>
  );
}
