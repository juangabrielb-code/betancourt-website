"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Project, ProjectStatus, Currency } from '@/types';
import { Container, GlassCard, Button, Badge } from '../ui/UI';
import { NewProjectWizard } from './NewProjectWizard';
import { FileUploader } from './FileUploader';
import { formatCurrency } from '@/utils/currency';

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
  t: any;
  defaultCurrency: Currency;
}

// --- Helper Components ---

const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const colors = {
    'PENDING_PAYMENT': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    'PARTIALLY_PAID': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    'FILES_UPLOADED': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'IN_PROGRESS': 'bg-warm-glow/10 text-warm-dim dark:text-warm-glow border-warm-glow/20',
    'REVIEW': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'COMPLETED': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${colors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

interface ProjectCardProps {
  project: Project;
  onPay: () => void;
  onUpload: () => void;
}

const ProjectCard = ({ project, onPay, onUpload }: ProjectCardProps) => (
  <GlassCard className="group hover:border-warm-glow/30 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div>
         <h4 className="font-bold text-lg text-j-light-text dark:text-j-dark-text">{project.title}</h4>
         <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
           {typeof project.service.name === 'string' ? project.service.name : project.service.name['en'] || 'Service'}
         </p>
      </div>
      <StatusBadge status={project.status} />
    </div>

    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1 text-j-light-text/70 dark:text-j-dark-text/70">
        <span>Progress</span>
        <span>{project.progress}%</span>
      </div>
      <div className="w-full bg-j-light-text/10 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${project.progress}%` }}
          className="bg-warm-glow h-full rounded-full"
        />
      </div>
    </div>

    <div className="flex justify-between items-center pt-4 border-t border-j-light-text/5 dark:border-white/5">
      <div className="text-xs text-j-light-text/50 dark:text-j-dark-text/50">
         Due: {new Date(project.dueDate).toLocaleDateString()}
      </div>
      {!project.isPaid ? (
         <Button onClick={onPay} variant="primary" className="!py-1.5 !px-3 !text-xs">
           Pay {formatCurrency(project.price, project.currency)}
         </Button>
      ) : project.status === 'PENDING_PAYMENT' || project.status === 'PARTIALLY_PAID' ? (
         <Button onClick={onUpload} variant="glass" className="!py-1.5 !px-3 !text-xs group-hover:bg-warm-glow/20">
           Upload Files
         </Button>
      ) : (
         <Button variant="glass" className="!py-1.5 !px-3 !text-xs group-hover:bg-warm-glow/20">
           View Details
         </Button>
      )}
    </div>
  </GlassCard>
);

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  user: initialUser,
  onLogout,
  t,
  defaultCurrency
}) => {
  const [user, setUser] = useState<User>(initialUser);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'settings'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Flow State
  const [showWizard, setShowWizard] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  const loadData = async () => {
    try {
      const response = await fetch(`/api/projects?userId=${user.id}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const pendingProjects = projects.filter(p => !p.isPaid);
  const activeProjects = projects.filter(p => p.isPaid && p.status !== 'COMPLETED');

  const handleProjectCreated = async () => {
    await loadData();
  };

  const handlePayProject = (project: Project) => {
    // Open payment modal - this would integrate with CheckoutModal
    console.log('Pay project:', project);
  };

  const handleUploadFiles = (project: Project) => {
    setSelectedProject(project);
    setShowUploader(true);
  };

  const handleUploadComplete = async () => {
    setShowUploader(false);
    setSelectedProject(null);
    await loadData();
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <Container>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-j-light-text dark:text-white">
              Welcome back, {user.name}
            </h1>
            <p className="text-j-light-text/60 dark:text-white/60">Manage your audio projects</p>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => setShowWizard(true)}>
              + New Project
            </Button>
            <Button variant="glass" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-j-light-text/10 dark:border-white/10">
          {['overview', 'projects', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-2 text-sm font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-warm-glow text-warm-glow'
                  : 'border-transparent text-j-light-text/60 dark:text-white/60 hover:text-warm-glow'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard>
                <div className="text-j-light-text/60 dark:text-white/60 text-sm mb-1">Active Projects</div>
                <div className="text-3xl font-bold text-j-light-text dark:text-white">{activeProjects.length}</div>
              </GlassCard>
              <GlassCard>
                <div className="text-j-light-text/60 dark:text-white/60 text-sm mb-1">Pending Payment</div>
                <div className="text-3xl font-bold text-j-light-text dark:text-white">{pendingProjects.length}</div>
              </GlassCard>
              <GlassCard>
                <div className="text-j-light-text/60 dark:text-white/60 text-sm mb-1">Completed</div>
                <div className="text-3xl font-bold text-j-light-text dark:text-white">
                  {projects.filter(p => p.status === 'COMPLETED').length}
                </div>
              </GlassCard>
            </div>

            {/* Recent Projects */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-warm-glow">Loading projects...</div>
              </div>
            ) : projects.length === 0 ? (
              <GlassCard className="text-center py-12">
                <p className="text-j-light-text/60 dark:text-white/60 mb-4">No projects yet</p>
                <Button onClick={() => setShowWizard(true)} variant="primary">
                  Create Your First Project
                </Button>
              </GlassCard>
            ) : (
              <div>
                <h2 className="text-xl font-serif font-bold text-j-light-text dark:text-white mb-4">
                  Recent Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.slice(0, 4).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onPay={() => handlePayProject(project)}
                      onUpload={() => handleUploadFiles(project)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <h2 className="text-xl font-serif font-bold text-j-light-text dark:text-white mb-4">
              All Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onPay={() => handlePayProject(project)}
                  onUpload={() => handleUploadFiles(project)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <GlassCard>
            <h2 className="text-xl font-serif font-bold text-j-light-text dark:text-white mb-4">
              Settings
            </h2>
            <p className="text-j-light-text/60 dark:text-white/60">
              Settings panel - profile, billing, preferences, etc.
            </p>
          </GlassCard>
        )}
      </Container>

      {/* Modals */}
      {showWizard && (
        <NewProjectWizard
          onClose={() => setShowWizard(false)}
          onProjectCreated={handleProjectCreated}
          currency={defaultCurrency}
          t={t}
        />
      )}

      {showUploader && selectedProject && (
        <FileUploader
          project={selectedProject}
          onClose={() => setShowUploader(false)}
          onComplete={handleUploadComplete}
        />
      )}
    </div>
  );
};
