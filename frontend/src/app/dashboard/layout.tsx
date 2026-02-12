import type { Metadata } from 'next';
import Sidebar from '@/components/dashboard/Sidebar';

export const metadata: Metadata = {
  title: 'Dashboard | Conceptzilla',
  description: 'Project dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 h-full">
        {children}
      </main>
    </div>
  );
}
