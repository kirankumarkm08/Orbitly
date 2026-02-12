import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio | Admin',
  description: 'Premium visual design studio for your website',
};

import AdminLayout from '@/components/admin/AdminLayout';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <div className="studio-layout h-full">
        {children}
      </div>
    
  );
}
