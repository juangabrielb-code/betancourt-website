'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/UI';
import { PendingTask, TaskType } from '@/types/dashboard';
import { motion } from 'framer-motion';

interface PendingTasksWidgetProps {
  tasks: PendingTask[];
}

const taskTypeConfig: Record<TaskType, { label: string; color: string; bgColor: string; emoji: string }> = {
  PAYMENT: {
    label: 'Pago Pendiente',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
    emoji: '💳',
  },
  UPLOAD: {
    label: 'Subir Archivo',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    emoji: '📤',
  },
  REVIEW: {
    label: 'Revisión Necesaria',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    emoji: '🔍',
  },
};

export const PendingTasksWidget: React.FC<PendingTasksWidgetProps> = ({ tasks }) => {
  const hasTasks = tasks.length > 0;

  // Group tasks by type for summary
  const tasksByType = tasks.reduce((acc, task) => {
    acc[task.type] = (acc[task.type] || 0) + 1;
    return acc;
  }, {} as Record<TaskType, number>);

  return (
    <GlassCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-warm-glow/20 flex items-center justify-center">
            <span className="text-xl">📌</span>
          </div>
          <h3 className="text-lg font-semibold text-j-light-text dark:text-j-dark-text">
            Tareas Pendientes
          </h3>
        </div>
        {hasTasks && (
          <span className="px-3 py-1 rounded-full bg-warm-glow/20 text-warm-glow text-xs font-bold">
            {tasks.length}
          </span>
        )}
      </div>

      {/* Empty State */}
      {!hasTasks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
            <span className="text-3xl">✨</span>
          </div>
          <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60">
            ¡Todo al día! No tienes tareas pendientes
          </p>
        </motion.div>
      )}

      {/* Tasks List */}
      {hasTasks && (
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const config = taskTypeConfig[task.type];
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-j-light-surface/30 dark:bg-black/10 border border-j-light-text/5 dark:border-white/5 hover:border-warm-glow/30 transition-all cursor-pointer"
              >
                {/* Task Icon */}
                <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className="text-sm">{config.emoji}</span>
                </div>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-j-light-text dark:text-j-dark-text mb-1">
                    {task.label}
                  </h4>
                  <span className={`text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                {/* Arrow */}
                <span className="text-j-light-text/30 dark:text-j-dark-text/30 flex-shrink-0">
                  →
                </span>
              </motion.div>
            );
          })}

          {/* Task Type Summary */}
          {Object.keys(tasksByType).length > 1 && (
            <div className="pt-3 mt-3 border-t border-j-light-text/10 dark:border-white/10">
              <div className="flex flex-wrap gap-2">
                {Object.entries(tasksByType).map(([type, count]) => {
                  const config = taskTypeConfig[type as TaskType];
                  return (
                    <div
                      key={type}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.bgColor}`}
                    >
                      <span className="text-xs">{config.emoji}</span>
                      <span className={`text-xs font-medium ${config.color}`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};
