'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { CommandPalette } from '@/components/admin/CommandPalette';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    const handleOpen = () => setIsCommandOpen(true);
    document.addEventListener('open-command-palette', handleOpen);
    return () => document.removeEventListener('open-command-palette', handleOpen);
  }, []);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onOpenCommandPalette={() => setIsCommandOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 text-foreground">
          {children}
        </main>
      </div>
      <CommandPalette 
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={handleNavigate}
        tenants={tenants}
      />
    </div>
  );
}
