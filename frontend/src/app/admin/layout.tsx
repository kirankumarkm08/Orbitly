'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { AuthProvider } from '@/context/AuthContext';

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AuthProvider>
  );
}
