'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, ArrowRight, Building2, User, Settings, Activity, FileText } from 'lucide-react';

interface Command {
  id: string;
  title: string;
  category: string;
  icon: any;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  tenants: any[];
}

export function CommandPalette({ isOpen, onClose, onNavigate, tenants }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    { id: 'overview', title: 'Go to Overview', category: 'Navigation', icon: Activity, action: () => onNavigate('/') },
    { id: 'tenants', title: 'Go to Tenants', category: 'Navigation', icon: Building2, action: () => onNavigate('/tenants') },
    { id: 'onboarding', title: 'Go to Onboarding', category: 'Navigation', icon: User, action: () => onNavigate('/onboarding') },
    { id: 'operations', title: 'Go to Operations', category: 'Navigation', icon: Activity, action: () => onNavigate('/operations') },
    { id: 'system', title: 'Go to System', category: 'Navigation', icon: Settings, action: () => onNavigate('/system') },
    { id: 'docs', title: 'Open Documentation', category: 'Help', icon: FileText, action: () => window.open('/docs', '_blank') },
    ...tenants.slice(0, 5).map((t: any) => ({
      id: `tenant-${t.id}`,
      title: `Go to tenant "${t.name}"`,
      category: 'Tenants',
      icon: Building2,
      action: () => onNavigate(`/tenants?id=${t.id}`)
    })),
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (isOpen) {
        onClose();
      } else {
        document.dispatchEvent(new CustomEvent('open-command-palette'));
      }
    }
    
    if (!isOpen) return;

    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
      onClose();
    }
  }, [isOpen, onClose, filteredCommands, selectedIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50">
        <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-white/10 rounded text-gray-400">ESC</kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No commands found
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    idx === selectedIndex 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <cmd.icon className="h-4 w-4" />
                  <span className="flex-1 text-sm">{cmd.title}</span>
                  <span className="text-xs text-gray-600">{cmd.category}</span>
                  {idx === selectedIndex && (
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-white/10 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1 py-0.5 bg-white/10 rounded">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1 py-0.5 bg-white/10 rounded">↵</kbd> Select</span>
            </div>
            <span>⌘K to toggle</span>
          </div>
        </div>
      </div>
    </>
  );
}
