'use client';

import React, { useState } from 'react';
import { Bell, Search, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Block } from '@/components/ui/Block';

export default function AdminHeader() {
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState('');

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
        {/* MCE Editor Button */}
        <button 
          onClick={() => setShowEditor(true)}
          className="relative group rounded-lg p-2 hover:bg-accent transition-all"
        >
          <Edit2 className="h-5 w-5 text-secondary-foreground" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
        </button>

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

      {/* MCE Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold">MCE Editor</h2>
                <button 
                  onClick={() => setShowEditor(false)}
                  className="rounded-lg p-2 hover:bg-accent transition-all"
                >
                  <span className="h-5 w-5 text-secondary-foreground">×</span>
                </button>
              </div>
              <div className="p-6">
                <Block 
                  content={editorContent}
                  onChange={setEditorContent}
                  placeholder="Start typing..."
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
