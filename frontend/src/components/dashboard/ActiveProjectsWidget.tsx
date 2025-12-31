'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/UI';
import { Project, ProjectStatus } from '@/types/dashboard';
import { motion } from 'framer-motion';

interface ActiveProjectsWidgetProps {
  projects: Project[];
  maxDisplay?: number;
}

const statusConfig: Record<ProjectStatus, { label: string; color: string; emoji: string }> = {
  DRAFT: { label: 'Borrador', color: 'text-gray-500 dark:text-gray-400', emoji: '📝' },
  IN_PROGRESS: { label: 'En Progreso', color: 'text-blue-500 dark:text-blue-400', emoji: '🎵' },
  REVIEW: { label: 'En Revisión', color: 'text-yellow-500 dark:text-yellow-400', emoji: '🔍' },
  COMPLETED: { label: 'Completado', color: 'text-green-500 dark:text-green-400', emoji: '✅' },
};

export const ActiveProjectsWidget: React.FC<ActiveProjectsWidgetProps> = ({
  projects,
  maxDisplay = 3,
}) => {
  const displayProjects = projects.slice(0, maxDisplay);
  const hasProjects = projects.length > 0;

  return (
    <GlassCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-warm-glow/20 flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-j-light-text dark:text-j-dark-text">
            Proyectos Activos
          </h3>
        </div>
        {hasProjects && (
          <Link href="/dashboard/proyectos">
            <span className="text-xs font-medium text-warm-glow hover:text-warm-dim transition-colors cursor-pointer">
              Ver Todos →
            </span>
          </Link>
        )}
      </div>

      {/* Empty State */}
      {!hasProjects && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-warm-glow/10 flex items-center justify-center">
            <span className="text-4xl">🎤</span>
          </div>
          <h4 className="text-lg font-semibold text-j-light-text dark:text-j-dark-text mb-2">
            Empieza tu primer proyecto aquí
          </h4>
          <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60 mb-6 max-w-sm mx-auto">
            Selecciona un servicio y sube tus referencias para comenzar
          </p>
          <Link href="/dashboard/proyectos">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl bg-warm-glow text-white font-medium text-sm shadow-lg shadow-warm-glow/20 hover:opacity-90 transition-opacity"
            >
              <span className="flex items-center gap-2">
                <span>✨</span>
                <span>Crear Primer Proyecto</span>
              </span>
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* Projects List */}
      {hasProjects && (
        <div className="space-y-4">
          {displayProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-j-light-surface/50 dark:bg-black/20 border border-j-light-text/5 dark:border-white/5 hover:border-warm-glow/30 transition-all cursor-pointer"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-j-light-text dark:text-j-dark-text truncate mb-1">
                    {project.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {statusConfig[project.status].emoji}
                    </span>
                    <span className={`text-xs font-medium ${statusConfig[project.status].color}`}>
                      {statusConfig[project.status].label}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-j-light-text/40 dark:text-j-dark-text/40 ml-2">
                  {new Date(project.createdAt).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-j-light-text/60 dark:text-j-dark-text/60">Progreso</span>
                  <span className="font-medium text-warm-glow">{project.progress}%</span>
                </div>
                <div className="h-2 bg-j-light-text/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                    className="h-full bg-gradient-to-r from-warm-glow to-warm-dim rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}

          {projects.length > maxDisplay && (
            <div className="text-center pt-2">
              <Link href="/dashboard/proyectos">
                <span className="text-sm text-j-light-text/60 dark:text-j-dark-text/60 hover:text-warm-glow transition-colors cursor-pointer">
                  +{projects.length - maxDisplay} proyectos más
                </span>
              </Link>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};
