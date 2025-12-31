'use client';

import { useAuth } from '@/contexts/AuthContext';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { ActiveProjectsWidget } from '@/components/dashboard/ActiveProjectsWidget';
import { PendingTasksWidget } from '@/components/dashboard/PendingTasksWidget';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { mockDashboardStats, mockProjects } from '@/types/dashboard';

export default function DashboardPage() {
  const { session, isLoading } = useAuth();

  // Mock data - will be replaced with real data from backend
  const dashboardStats = {
    ...mockDashboardStats,
    userName: session?.user?.name || 'Usuario',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-12 w-12 text-warm-glow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-j-light-text dark:text-j-dark-text text-sm">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Personalized Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-2">
          Hola, {dashboardStats.userName} 🎧
        </h1>
        <p className="text-j-light-text/60 dark:text-j-dark-text/60">
          Bienvenido a tu estudio virtual
        </p>
      </div>

      {/* Widgets Grid - Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Wallet Card */}
          <WalletCard balance={dashboardStats.walletBalance} />

          {/* Quick Actions */}
          <QuickActionsCard />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Projects */}
          <ActiveProjectsWidget projects={mockProjects} maxDisplay={3} />

          {/* Pending Tasks */}
          <PendingTasksWidget tasks={dashboardStats.pendingTasks} />
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {mockProjects.length === 0 && (
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-warm-glow/10 to-warm-dim/10 border border-warm-glow/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warm-glow/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">👋</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-j-light-text dark:text-j-dark-text mb-1">
                ¿Primera vez aquí?
              </h3>
              <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60">
                Explora nuestros servicios de mixing, mastering, y producción Dolby Atmos.
                Estamos listos para llevar tu música al siguiente nivel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
