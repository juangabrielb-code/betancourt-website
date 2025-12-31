import { Sidebar } from '@/components/dashboard/Sidebar';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { MobileHeader } from '@/components/dashboard/MobileHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-j-light-bg dark:bg-j-dark-bg">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      <main className="md:ml-64 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
