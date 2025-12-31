'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/UI';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { ActiveProjectsWidget } from '@/components/dashboard/ActiveProjectsWidget';
import { PendingTasksWidget } from '@/components/dashboard/PendingTasksWidget';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { NewProjectWizard } from '@/components/dashboard/NewProjectWizard';
import { mockDashboardStats, mockProjects } from '@/types/dashboard';
import { Project, Currency } from '@/types';

export default function DashboardPage() {
  const { session, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'settings'>('overview');
  const [showWizard, setShowWizard] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Mock data - will be replaced with real data from backend
  const dashboardStats = {
    ...mockDashboardStats,
    userName: session?.user?.name || 'Usuario',
  };

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // TODO: Replace with real API call when backend is ready
        // const response = await fetch(`/api/projects?userId=${session?.user?.id}`);
        // const data = await response.json();
        // setProjects(data);

        // For now, use mock data
        setProjects([]);
      } catch (error) {
        console.error('Failed to load projects', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    if (session?.user) {
      loadProjects();
    }
  }, [session?.user]);

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

  const pendingProjects = projects.filter(p => !p.isPaid);
  const activeProjects = projects.filter(p => p.isPaid && p.status !== 'COMPLETED');
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');

  const handleProjectCreated = () => {
    setShowWizard(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Tabs */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-2">
              Hola, {dashboardStats.userName} 🎧
            </h1>
            <p className="text-j-light-text/60 dark:text-j-dark-text/60">
              Bienvenido a tu estudio virtual
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowWizard(true)}
            className="px-6 py-3 rounded-xl bg-warm-glow text-white font-medium shadow-lg shadow-warm-glow/20 hover:opacity-90 transition-opacity"
          >
            ✨ Nuevo Proyecto
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-j-light-text/10 dark:border-white/10 overflow-x-auto">
          {[
            { id: 'overview', label: 'Resumen' },
            { id: 'projects', label: 'Proyectos' },
            { id: 'settings', label: 'Configuración' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-warm-glow text-warm-glow'
                  : 'border-transparent text-j-light-text/60 dark:text-j-dark-text/60 hover:text-warm-glow'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard>
                  <div className="text-j-light-text/60 dark:text-j-dark-text/60 text-sm mb-1">
                    Proyectos Activos
                  </div>
                  <div className="text-3xl font-bold text-j-light-text dark:text-j-dark-text">
                    {activeProjects.length}
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="text-j-light-text/60 dark:text-j-dark-text/60 text-sm mb-1">
                    Pago Pendiente
                  </div>
                  <div className="text-3xl font-bold text-j-light-text dark:text-j-dark-text">
                    {pendingProjects.length}
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="text-j-light-text/60 dark:text-j-dark-text/60 text-sm mb-1">
                    Completados
                  </div>
                  <div className="text-3xl font-bold text-j-light-text dark:text-j-dark-text">
                    {completedProjects.length}
                  </div>
                </GlassCard>
              </div>

              {/* Widgets Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <WalletCard balance={dashboardStats.walletBalance} />
                  <QuickActionsCard />
                </div>
                <div className="space-y-6">
                  <ActiveProjectsWidget projects={mockProjects} maxDisplay={3} />
                  <PendingTasksWidget tasks={dashboardStats.pendingTasks} />
                </div>
              </div>

              {/* Welcome Message */}
              {projects.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-warm-glow/10 to-warm-dim/10 border border-warm-glow/20"
                >
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
                      </p>
                    </div>
                    <button
                      onClick={() => setShowWizard(true)}
                      className="px-6 py-3 rounded-xl bg-warm-glow text-white font-medium shadow-lg shadow-warm-glow/20 hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      Empezar Ahora
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div>
              {loadingProjects ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-warm-glow">Cargando proyectos...</div>
                </div>
              ) : projects.length === 0 ? (
                <GlassCard className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-warm-glow/10 flex items-center justify-center">
                    <span className="text-4xl">🎵</span>
                  </div>
                  <h3 className="text-xl font-semibold text-j-light-text dark:text-j-dark-text mb-2">
                    No tienes proyectos aún
                  </h3>
                  <p className="text-j-light-text/60 dark:text-j-dark-text/60 mb-6">
                    Crea tu primer proyecto y comienza tu producción
                  </p>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="px-6 py-3 rounded-xl bg-warm-glow text-white font-medium shadow-lg shadow-warm-glow/20"
                  >
                    Crear Primer Proyecto
                  </button>
                </GlassCard>
              ) : (
                <div>
                  <h2 className="text-xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-4">
                    Todos los Proyectos
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <GlassCard key={project.id} className="hover:border-warm-glow/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg text-j-light-text dark:text-j-dark-text">
                              {project.title}
                            </h4>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <GlassCard>
              <h2 className="text-xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-4">
                Configuración
              </h2>
              <p className="text-j-light-text/60 dark:text-j-dark-text/60 mb-6">
                Panel de configuración - perfil, facturación, preferencias, etc.
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-j-light-text/5 dark:bg-white/5 border border-j-light-text/10 dark:border-white/10">
                  <h3 className="font-semibold text-j-light-text dark:text-j-dark-text mb-2">
                    Perfil de Usuario
                  </h3>
                  <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60">
                    Próximamente: Editar nombre, bio, facturación
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* New Project Wizard Modal */}
      {showWizard && (
        <NewProjectWizard
          onClose={() => setShowWizard(false)}
          onProjectCreated={handleProjectCreated}
          currency={Currency.COP}
          t={(key: string) => key}
        />
      )}
    </div>
  );
}
