'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';

interface AdminHeaderProps {
  onOpenCommandPalette?: () => void;
}

export default function AdminHeader({ onOpenCommandPalette }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/5 glass px-6">
      {/* Search / Command Palette Trigger */}
      <div className="flex-1 max-w-md">
        <button 
          onClick={onOpenCommandPalette}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all text-sm text-left"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1">Search or type a command...</span>
          <kbd className="px-2 py-0.5 text-xs bg-white/10 rounded text-gray-500">⌘K</kbd>
        </button>
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
