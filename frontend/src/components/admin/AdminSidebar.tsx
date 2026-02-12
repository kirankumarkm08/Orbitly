'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings,
  LogOut,
  Shield,
  FileText,
  MessageSquare,
  Calendar,
  Sparkles,
  MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    name: 'General',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    name: 'Content',
    items: [
      { name: 'Studio', href: '/admin/studio', icon: Sparkles },
      { name: 'Pages', href: '/admin/pages', icon: FileText },
      { name: 'Forms', href: '/admin/forms', icon: MessageSquare },
      { name: 'Events', href: '/admin/events', icon: Calendar },
      { name: 'Blog', href: '/admin/blog', icon: FileText },
    ]
  },
  {
    name: 'Business',
    items: [
      { name: 'Customers', href: '/admin/customers', icon: Users },
      { name: 'Users', href: '/admin/users', icon: Shield },
    ]
  },
  {
    name: 'Settings',
    items: [
      { name: 'Payments', href: '/admin/payments', icon: Building2 },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary glow">
          <Shield className="h-6 w-6 text-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Rare Evo</h1>
          <p className="text-xs text-muted-foreground">Tenant Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.name} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {group.name}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-secondary-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-accent p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-foreground">SA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Super Admin</p>
            <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
          </div>
        </div>
        <button className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-secondary-foreground hover:bg-accent hover:text-foreground transition-all">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
