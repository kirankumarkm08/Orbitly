"use client";

import React, { useState, useEffect } from 'react';
import ChannelView from '@/components/dashboard/ChannelView';
import RightSidebar from '@/components/dashboard/RightSidebar';
import SearchModal from '@/components/dashboard/SearchModal';

export default function DashboardPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(true); // Open by default for demo

  // Effect to handle Cmd+K to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-full relative">
      <div className="flex-1 flex flex-col min-w-0">
        <ChannelView />
      </div>
      
      <div className="hidden xl:block">
        <RightSidebar />
      </div>

      {/* Modal Overlay */}
      {isSearchOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div className="animate-in fade-in zoom-in-95 duration-200">
             <SearchModal />
          </div>
          {/* Click outside to close (optional, minimal implementation) */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => setIsSearchOpen(false)}
          ></div>
        </div>
      )}
    </div>
  );
}
