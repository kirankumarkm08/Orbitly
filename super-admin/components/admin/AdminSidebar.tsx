'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  UserPlus,
  Activity,
  Settings,
  LogOut,
  Shield,
  FileText,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard, description: 'Platform pulse' },
  { name: 'Tenants', href: '/tenants', icon: Building2, description: 'Workspace directory' },
  { name: 'Onboarding', href: '/onboarding', icon: UserPlus, description: 'Queue & funnel' },
  { name: 'Operations', href: '/operations', icon: Activity, description: 'Tasks, queue health' },
  { name: 'System', href: '/system', icon: Settings, description: 'Config, logs, security' },
];

const secondaryNav = [
  { name: 'Docs', href: '/docs', icon: FileText },
  { name: 'API', href: '/api-docs', icon: Code },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col glass-card border-r border-white/5">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 glow">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Super Admin</h1>
          <p className="text-xs text-gray-400">System Control</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              <div className="flex-1">
                <div>{item.name}</div>
                {item.description && (
                  <div className="text-[10px] text-gray-500">{item.description}</div>
                )}
              </div>
            </Link>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-white/5">
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-white/5 text-white'
                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <span className="text-sm font-bold text-white">SA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Super Admin</p>
            <p className="text-xs text-gray-400 truncate">admin@example.com</p>
          </div>
        </div>
        <button className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
