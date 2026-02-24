"use client";

import React, { useState, useEffect } from 'react';
import ChannelView from '@/components/dashboard/ChannelView';
import RightSidebar from '@/components/dashboard/RightSidebar';
import SearchModal from '@/components/dashboard/SearchModal';
import { Block } from '@/components/ui/Block';

export default function DashboardPage() {
  const [blockContent, setBlockContent] = useState('');

  return (
    <div className="flex h-full relative">
      <div className="flex-1 flex flex-col min-w-0">
        <ChannelView />
        
        {/* Block Editor Section */}
        <div className="p-8 bg-white/5 backdrop-blur-sm border-t border-border">
          <h2 className="text-lg font-semibold mb-4">Block Editor</h2>
          <Block
            content={blockContent}
            onChange={setBlockContent}
            placeholder="Create your block content here..."
            height={400}
            className="border border-border rounded-lg"
          />
          
          <div className="mt-4 text-sm text-muted-foreground">
            Block content preview:
          </div>
          <div className="mt-2 p-4 bg-muted/50 rounded-lg border border-muted/20">
            <div dangerouslySetInnerHTML={{ __html: blockContent }} />
          </div>
        </div>
      </div>
      
      <div className="hidden xl:block">
        <RightSidebar />
      </div>

      {/* Modal Overlay */}
      {false && ( // Keep existing search functionality
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div className="animate-in fade-in zoom-in-95 duration-200">
             <SearchModal />
          </div>
          {/* Click outside to close (optional, minimal implementation) */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => {}}
          ></div>
        </div>
      )}
    </div>
  );
}
