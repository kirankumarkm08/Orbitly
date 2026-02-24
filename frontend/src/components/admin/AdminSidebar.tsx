'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Box
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authApi } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

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
      { name: 'Blocks', href: '/admin/blocks', icon: Box },
      { name: 'Forms', href: '/admin/forms', icon: MessageSquare },
      { name: 'Events', href: '/admin/events', icon: Calendar },
      { name: 'Blog', href: '/admin/blog', icon: FileText },
      { name: 'Modules', href: '/admin/modules', icon: FileText },
    ]
  },
  {
    name: 'Store',
    items: [
      { name: 'Products', href: '/admin/products', icon: Box },
      { name: 'Categories', href: '/admin/categories', icon: Building2 },
      { name: 'Orders', href: '/admin/orders', icon: MessageSquare },
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

function getInitials(user: User | null): string {
  if (!user) return '?';
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email;
  if (!name) return user.email?.slice(0, 2).toUpperCase() || '?';
  if (typeof name === 'string' && name.includes(' ')) {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  }
  return String(name).slice(0, 2).toUpperCase();
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/login');
    router.refresh();
  };

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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-bold">{getInitials(user)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Admin'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || '—'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-secondary-foreground hover:bg-accent hover:text-foreground transition-all"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
