import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
  noPadding = false,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div className="flex h-screen bg-surface">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {!noPadding && <AdminHeader />}
        <main className={cn(
          "flex-1 overflow-y-auto",
          !noPadding ? "p-6" : "p-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
