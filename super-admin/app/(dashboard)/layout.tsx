'use client';

import { AuthProvider } from '@/context/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AuthProvider>
  );
}
