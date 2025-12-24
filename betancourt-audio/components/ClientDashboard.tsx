import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Project, ProjectStatus, Currency, UserProfile } from '../types';
import { ApiService } from '../services/api';
import { Container, GlassCard, Button, Badge, Reveal, Input, TextArea } from './UI';
import { NewProjectWizard } from './NewProjectWizard';
import { CheckoutModal } from './CheckoutModal';
import { FileUploader } from './FileUploader';
import { compressImage } from '../utils/imageHelpers';

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
  t: any;
  defaultCurrency: Currency;
  onPayProject: (project: Project) => void;
}

// Pre-defined avatars for the user to choose from
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=200&q=80'
];

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
  onPay: (project: Project) => void;
}

const ProjectCard = ({ project, onPay }: ProjectCardProps) => (
  <GlassCard className="group hover:border-warm-glow/30 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div>
         <h4 className="font-bold text-lg text-j-light-text dark:text-j-dark-text">{project.title}</h4>
         <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">{project.service.name['en'] || project.service.name}</p>
      </div>
      <StatusBadge status={project.status} />
    </div>

    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1 text-j-light-text/70 dark:text-j-dark-text/70">
        <span>Progress</span>
        <span>{project.progress}%</span>
      </div>
      <div className="w-full bg-black/10 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
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
         <Button onClick={() => onPay(project)} variant="primary" className="!py-1.5 !px-3 !text-xs">
           Pay {ApiService.formatCurrency(project.price, project.currency)}
         </Button>
      ) : (
         <Button variant="glass" className="!py-1.5 !px-3 !text-xs group-hover:bg-warm-glow/20">
           View Details
         </Button>
      )}
    </div>
  </GlassCard>
);

const ToggleSwitch = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-j-light-surface/50 dark:bg-white/5 border border-j-light-text/10 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
      <span className="text-sm font-medium text-j-light-text dark:text-white">{label}</span>
      <button 
          onClick={() => onChange(!checked)}
          className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${checked ? 'bg-warm-glow' : 'bg-j-light-text/20 dark:bg-black/40'}`}
      >
          <motion.div 
              layout
              className="w-4 h-4 bg-white rounded-full shadow-sm"
              animate={{ x: checked ? 24 : 0 }}
          />
      </button>
  </div>
);

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user: initialUser, onLogout, t, defaultCurrency, onPayProject }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'files' | 'settings'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Flow State
  const [showWizard, setShowWizard] = useState(false);
  const [justCreatedProject, setJustCreatedProject] = useState<Project | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  // Settings State
  const [settingsTab, setSettingsTab] = useState<'profile' | 'billing' | 'audio' | 'notifications'>('profile');
  const [profileData, setProfileData] = useState<Partial<UserProfile>>(user.profile || {});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || '');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const data = await ApiService.getUserProjects(user.id);
    setProjects(data);
    setLoading(false);
    if(user.profile) setProfileData(user.profile);
    setAvatarPreview(user.avatar || '');
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const pendingProjects = projects.filter(p => !p.isPaid);
  const activeProjects = projects.filter(p => p.isPaid && p.status !== 'COMPLETED');

  // --- Handlers ---
  
  const handleProjectCreated = async () => {
      await loadData();
      const newProject = ApiService.getUserProjects(user.id).then(list => list[list.length -1]);
      const p = await newProject;
      setJustCreatedProject(p);
      setShowWizard(false);
      setShowCheckout(true);
  };

  const handlePaymentSuccess = (project: Project) => {
      setShowCheckout(false);
      setJustCreatedProject(project);
      setShowUploader(true);
      loadData();
  };

  const handleUploadComplete = () => {
      setShowUploader(false);
      setJustCreatedProject(null);
      loadData();
      alert("Project files received successfully! Work will begin shortly.");
  };

  const updateProfileField = (key: keyof UserProfile, value: any) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
        await ApiService.updateProfile(user.id, profileData);
        alert("Profile updated successfully");
    } catch (e) {
        alert("Failed to update profile");
    } finally {
        setIsSavingProfile(false);
    }
  };

  const handlePayClick = (project: Project) => {
    setJustCreatedProject(project);
    setShowCheckout(true);
  };

  // --- Avatar Logic ---

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsCompressing(true);
      try {
        // Compress image to max 400px width and 0.7 quality
        const compressedDataUrl = await compressImage(e.target.files[0], 400, 0.7);
        setAvatarPreview(compressedDataUrl);
      } catch (err) {
        console.error("Image compression failed", err);
        alert("Failed to process image. Please try another one.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const saveAvatar = () => {
    // In a real app, we would upload this DataURL to a bucket/server here.
    // For now, we update the local user object and persist to localStorage
    const updatedUser = { ...user, avatar: avatarPreview };
    setUser(updatedUser);
    localStorage.setItem('ba_user', JSON.stringify(updatedUser));
    setShowAvatarModal(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-warm-glow/20 overflow-hidden border border-warm-glow/30">
                  <img src={user.avatar || "https://ui-avatars.com/api/?name=" + user.name} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-j-light-text dark:text-white">{user.name}</h3>
                  <p className="text-xs text-j-light-text/50 dark:text-white/50">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Dashboard Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                  { id: 'projects', label: 'My Projects', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                  { id: 'files', label: 'File Manager', icon: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1l-5 5v5a2 2 0 01-2 2H5z' },
                  { id: 'settings', label: 'Account Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === item.id 
                        ? 'bg-warm-glow/10 text-warm-dim dark:text-warm-glow border border-warm-glow/20' 
                        : 'text-j-light-text/60 dark:text-j-dark-text/60 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-j-light-text/5 dark:border-white/5">
                <Button onClick={onLogout} variant="secondary" className="w-full text-xs">
                  Sign Out
                </Button>
              </div>
            </GlassCard>
            
            {/* Quick Stats */}
            <GlassCard className="p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-j-light-text/50 dark:text-j-dark-text/50 mb-4">Storage Used</h4>
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-j-light-text dark:text-white">4.2 GB</span>
                    <span className="text-sm text-j-light-text/50 dark:text-white/50 mb-1">/ 10 GB</span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/5 rounded-full h-1.5">
                   <div className="bg-blue-500 h-full rounded-full w-[42%]" />
                </div>
            </GlassCard>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
             <Reveal>
               {activeTab === 'overview' && (
                 <div className="space-y-8">
                   <div className="flex justify-between items-center">
                     <h2 className="text-3xl font-serif font-bold text-j-light-text dark:text-white">Welcome, {user.name.split(' ')[0]}</h2>
                     <Button 
                        variant="primary" 
                        className="!rounded-full"
                        onClick={() => setShowWizard(true)}
                     >
                       + New Project
                     </Button>
                   </div>
                   
                   {/* Pending Payments Alert */}
                   {pendingProjects.length > 0 && (
                     <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                           </svg>
                         </div>
                         <div>
                           <h4 className="font-bold text-j-light-text dark:text-white">Action Required</h4>
                           <p className="text-sm text-j-light-text/70 dark:text-white/70">You have {pendingProjects.length} unpaid projects. Work will begin once payment is confirmed.</p>
                         </div>
                       </div>
                     </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-j-light-text/80 dark:text-white/80">Active Projects</h3>
                        {activeProjects.length > 0 ? (
                            activeProjects.map(p => <ProjectCard key={p.id} project={p} onPay={handlePayClick} />)
                        ) : (
                            <div className="text-center py-10 border border-dashed border-j-light-text/10 dark:border-white/10 rounded-xl">
                                <p className="text-j-light-text/50 dark:text-white/30">No active projects running.</p>
                            </div>
                        )}
                      </div>

                      <div className="space-y-4">
                         <h3 className="text-lg font-medium text-j-light-text/80 dark:text-white/80">Pending Payment</h3>
                         {pendingProjects.length > 0 ? (
                            pendingProjects.map(p => <ProjectCard key={p.id} project={p} onPay={handlePayClick} />)
                        ) : (
                            <div className="text-center py-10 border border-dashed border-j-light-text/10 dark:border-white/10 rounded-xl">
                                <p className="text-j-light-text/50 dark:text-white/30">You're all caught up!</p>
                            </div>
                        )}
                      </div>
                   </div>
                 </div>
               )}

               {/* PROJECTS TAB (New Detailed View) */}
               {activeTab === 'projects' && (
                  <div className="space-y-8">
                      <div className="flex justify-between items-center">
                          <h2 className="text-3xl font-serif font-bold text-j-light-text dark:text-white">My Projects History</h2>
                          <Button 
                              variant="primary" 
                              className="!rounded-full"
                              onClick={() => setShowWizard(true)}
                          >
                              + New Project
                          </Button>
                      </div>

                      {projects.length === 0 && (
                          <div className="text-center py-12 text-j-light-text/50 dark:text-white/50 border-2 border-dashed border-j-light-text/10 dark:border-white/5 rounded-xl">
                              No projects found. Start a new one!
                          </div>
                      )}

                      {projects.map((project) => (
                          <GlassCard key={project.id} className="relative overflow-hidden">
                              {/* Project Header */}
                              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                                  <div>
                                      <div className="flex items-center gap-3 mb-1">
                                          <h3 className="text-xl font-bold text-j-light-text dark:text-white">{project.title}</h3>
                                          <StatusBadge status={project.status} />
                                      </div>
                                      <p className="text-sm text-j-light-text/60 dark:text-white/60">
                                          {project.service.name['en'] || project.service.name} • Started {new Date(project.createdAt).toLocaleDateString()}
                                      </p>
                                  </div>
                                  <div className="text-left md:text-right">
                                      <p className="text-lg font-bold text-j-light-text dark:text-white">{ApiService.formatCurrency(project.price, project.currency)}</p>
                                      <p className="text-xs text-j-light-text/50 dark:text-white/50">{project.paymentType === 'SPLIT' ? 'Split Payment' : 'Full Payment'}</p>
                                  </div>
                              </div>

                              {/* Progress Bar (Mini) */}
                              <div className="mb-6">
                                  <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1 text-j-light-text/50 dark:text-white/50">
                                      <span>Completion</span>
                                      <span>{project.progress}%</span>
                                  </div>
                                  <div className="w-full bg-black/10 dark:bg-white/5 rounded-full h-1">
                                      <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${project.progress}%` }}
                                          className="bg-warm-glow h-full rounded-full"
                                      />
                                  </div>
                              </div>

                              {/* Files Section */}
                              <div className="bg-j-light-bg/50 dark:bg-black/20 rounded-xl p-4 border border-j-light-text/5 dark:border-white/5">
                                  <h4 className="text-sm font-bold text-j-light-text dark:text-white mb-3 flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                      </svg>
                                      Uploaded Files
                                  </h4>
                                  
                                  {project.files.length > 0 ? (
                                      <div className="overflow-x-auto">
                                          <table className="w-full text-sm text-left">
                                              <thead className="text-xs text-j-light-text/40 dark:text-white/40 uppercase tracking-wider border-b border-j-light-text/5 dark:border-white/5">
                                                  <tr>
                                                      <th className="pb-2 font-medium">File Name</th>
                                                      <th className="pb-2 font-medium">Type</th>
                                                      <th className="pb-2 font-medium">Date</th>
                                                      <th className="pb-2 font-medium text-right">Size</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="divide-y divide-j-light-text/5 dark:divide-white/5">
                                                  {project.files.map((file) => (
                                                      <tr key={file.id} className="group hover:bg-white/5 transition-colors">
                                                          <td className="py-2 pr-4 text-j-light-text/80 dark:text-white/80 font-medium">
                                                              {file.name}
                                                          </td>
                                                          <td className="py-2 pr-4">
                                                              <Badge>{file.type}</Badge>
                                                          </td>
                                                          <td className="py-2 pr-4 text-j-light-text/50 dark:text-white/50 text-xs">
                                                              {new Date(file.uploadDate).toLocaleDateString()}
                                                          </td>
                                                          <td className="py-2 text-right text-j-light-text/50 dark:text-white/50 font-mono text-xs">
                                                              {file.size}
                                                          </td>
                                                      </tr>
                                                  ))}
                                              </tbody>
                                          </table>
                                      </div>
                                  ) : (
                                      <div className="text-center py-4 text-sm text-j-light-text/40 dark:text-white/40 italic">
                                          No files uploaded yet.
                                          {project.isPaid && (
                                              <button 
                                                  onClick={() => { setJustCreatedProject(project); setShowUploader(true); }}
                                                  className="ml-2 text-warm-glow hover:underline"
                                              >
                                                  Upload now
                                              </button>
                                          )}
                                      </div>
                                  )}
                              </div>
                          </GlassCard>
                      ))}
                  </div>
               )}

               {/* ACCOUNT SETTINGS (New Module) */}
               {activeTab === 'settings' && (
                  <GlassCard className="overflow-hidden p-0">
                      <div className="flex flex-col md:flex-row min-h-[500px]">
                          {/* Sidebar Tabs */}
                          <div className="w-full md:w-64 bg-j-light-surface/30 dark:bg-black/10 border-r border-j-light-text/5 dark:border-white/5 p-4 flex md:flex-col gap-2 overflow-x-auto">
                              {[
                                  { id: 'profile', label: 'Artist Profile' },
                                  { id: 'billing', label: 'Billing & Legal' },
                                  { id: 'audio', label: 'Audio Pro' },
                                  { id: 'notifications', label: 'Notifications' },
                              ].map(tab => (
                                  <button
                                      key={tab.id}
                                      onClick={() => setSettingsTab(tab.id as any)}
                                      className={`px-4 py-3 rounded-lg text-sm text-left font-medium transition-all whitespace-nowrap ${
                                          settingsTab === tab.id
                                          ? 'bg-warm-glow/10 text-warm-dim dark:text-warm-glow border border-warm-glow/20'
                                          : 'text-j-light-text/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                                      }`}
                                  >
                                      {tab.label}
                                  </button>
                              ))}
                          </div>

                          {/* Content Area */}
                          <div className="flex-1 p-8">
                              <h3 className="text-xl font-serif font-bold text-j-light-text dark:text-white mb-6 capitalize">
                                  {settingsTab.replace('-', ' ')} Settings
                              </h3>
                              
                              <div className="max-w-xl space-y-6">
                                  {/* PROFILE TAB */}
                                  {settingsTab === 'profile' && (
                                      <>
                                          <div className="flex items-center gap-6 mb-6">
                                              <div className="w-20 h-20 rounded-full bg-white/10 overflow-hidden border border-j-light-text/10 dark:border-white/20">
                                                  <img src={user.avatar} className="w-full h-full object-cover" />
                                              </div>
                                              <Button 
                                                variant="glass" 
                                                className="text-xs"
                                                onClick={() => {
                                                  setAvatarPreview(user.avatar || '');
                                                  setShowAvatarModal(true);
                                                }}
                                              >
                                                Change Avatar
                                              </Button>
                                          </div>
                                          <Input 
                                              label="Artist / Stage Name" 
                                              value={profileData.artistName || ''} 
                                              onChange={(e) => updateProfileField('artistName', e.target.value)}
                                          />
                                          <Input 
                                              label="WhatsApp Number" 
                                              placeholder="+57 300 ..." 
                                              value={profileData.whatsapp || ''} 
                                              onChange={(e) => updateProfileField('whatsapp', e.target.value)}
                                          />
                                          <TextArea 
                                              label="Artist Bio" 
                                              placeholder="Tell us about your genre and style..."
                                              value={profileData.bio || ''} 
                                              onChange={(e) => updateProfileField('bio', e.target.value)}
                                          />
                                      </>
                                  )}

                                  {/* BILLING TAB */}
                                  {settingsTab === 'billing' && (
                                      <>
                                          <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-1">
                                                  <label className="text-xs font-medium text-j-light-text/60 dark:text-white/60 uppercase ml-1">Regime Type</label>
                                                  <select 
                                                      className="w-full bg-j-light-surface/50 dark:bg-black/20 border border-j-light-text/10 dark:border-white/10 rounded-xl px-4 py-3 text-j-light-text dark:text-white focus:outline-none focus:border-warm-glow transition-colors"
                                                      value={profileData.taxRegime}
                                                      onChange={(e) => updateProfileField('taxRegime', e.target.value)}
                                                  >
                                                      <option value="PERSONA_NATURAL">Persona Natural</option>
                                                      <option value="PERSONA_JURIDICA">Persona Jurídica</option>
                                                  </select>
                                              </div>
                                              <div className="space-y-1">
                                                  <label className="text-xs font-medium text-j-light-text/60 dark:text-white/60 uppercase ml-1">Document Type</label>
                                                  <select 
                                                      className="w-full bg-j-light-surface/50 dark:bg-black/20 border border-j-light-text/10 dark:border-white/10 rounded-xl px-4 py-3 text-j-light-text dark:text-white focus:outline-none focus:border-warm-glow transition-colors"
                                                      value={profileData.docType}
                                                      onChange={(e) => updateProfileField('docType', e.target.value)}
                                                  >
                                                      <option value="CC">Cédula de Ciudadanía</option>
                                                      <option value="NIT">NIT</option>
                                                      <option value="CE">Cédula de Extranjería</option>
                                                      <option value="PASSPORT">Passport</option>
                                                  </select>
                                              </div>
                                          </div>

                                          {profileData.taxRegime === 'PERSONA_JURIDICA' && (
                                              <Input 
                                                  label="Razón Social (Company Name)" 
                                                  value={profileData.companyName || ''} 
                                                  onChange={(e) => updateProfileField('companyName', e.target.value)}
                                              />
                                          )}

                                          <Input 
                                              label="Document Number" 
                                              value={profileData.docNumber || ''} 
                                              onChange={(e) => updateProfileField('docNumber', e.target.value)}
                                          />
                                          <Input 
                                              label="Billing Address" 
                                              value={profileData.billingAddress || ''} 
                                              onChange={(e) => updateProfileField('billingAddress', e.target.value)}
                                          />
                                          <div className="grid grid-cols-2 gap-4">
                                              <Input 
                                                  label="City" 
                                                  value={profileData.city || ''} 
                                                  onChange={(e) => updateProfileField('city', e.target.value)}
                                              />
                                              <Input 
                                                  label="Country" 
                                                  value={profileData.country || ''} 
                                                  onChange={(e) => updateProfileField('country', e.target.value)}
                                              />
                                          </div>
                                      </>
                                  )}

                                  {/* AUDIO PRO TAB */}
                                  {settingsTab === 'audio' && (
                                      <>
                                          <div className="grid grid-cols-2 gap-6">
                                              <div className="space-y-1">
                                                  <label className="text-xs font-medium text-j-light-text/60 dark:text-white/60 uppercase ml-1">Preferred Sample Rate</label>
                                                  <select 
                                                      className="w-full bg-j-light-surface/50 dark:bg-black/20 border border-j-light-text/10 dark:border-white/10 rounded-xl px-4 py-3 text-j-light-text dark:text-white font-mono text-sm transition-colors"
                                                      value={profileData.preferredSampleRate}
                                                      onChange={(e) => updateProfileField('preferredSampleRate', e.target.value)}
                                                  >
                                                      <option value="44.1">44.1 kHz</option>
                                                      <option value="48">48 kHz</option>
                                                      <option value="88.2">88.2 kHz</option>
                                                      <option value="96">96 kHz</option>
                                                  </select>
                                              </div>
                                              <div className="space-y-1">
                                                  <label className="text-xs font-medium text-j-light-text/60 dark:text-white/60 uppercase ml-1">Bit Depth</label>
                                                  <select 
                                                      className="w-full bg-j-light-surface/50 dark:bg-black/20 border border-j-light-text/10 dark:border-white/10 rounded-xl px-4 py-3 text-j-light-text dark:text-white font-mono text-sm transition-colors"
                                                      value={profileData.preferredBitDepth}
                                                      onChange={(e) => updateProfileField('preferredBitDepth', e.target.value)}
                                                  >
                                                      <option value="16">16-bit</option>
                                                      <option value="24">24-bit</option>
                                                      <option value="32">32-bit float</option>
                                                  </select>
                                              </div>
                                          </div>
                                          <Input 
                                              label="Main DAW" 
                                              placeholder="e.g. Pro Tools, Ableton, Logic Pro..." 
                                              value={profileData.mainDaw || ''} 
                                              onChange={(e) => updateProfileField('mainDaw', e.target.value)}
                                          />
                                      </>
                                  )}

                                  {/* NOTIFICATIONS TAB */}
                                  {settingsTab === 'notifications' && (
                                      <div className="space-y-4">
                                          <ToggleSwitch 
                                              label="Receive updates via WhatsApp" 
                                              checked={profileData.notifyWhatsapp || false}
                                              onChange={(v) => updateProfileField('notifyWhatsapp', v)}
                                          />
                                          <ToggleSwitch 
                                              label="Receive project alerts via Email" 
                                              checked={profileData.notifyEmail || false}
                                              onChange={(v) => updateProfileField('notifyEmail', v)}
                                          />
                                          <ToggleSwitch 
                                              label="Subscribe to Studio Newsletter" 
                                              checked={profileData.newsletterOptIn || false}
                                              onChange={(v) => updateProfileField('newsletterOptIn', v)}
                                          />
                                      </div>
                                  )}

                                  <div className="pt-6 border-t border-j-light-text/5 dark:border-white/5">
                                      <Button onClick={saveProfile} isLoading={isSavingProfile} className="w-full">
                                          Save Changes
                                      </Button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </GlassCard>
               )}

               {/* File Manager (Global) */}
               {activeTab === 'files' && (
                   <div className="space-y-6">
                       <div className="flex justify-between items-center">
                           <h2 className="text-2xl font-serif font-bold text-j-light-text dark:text-white">File Manager</h2>
                       </div>
                       
                       <div className="bg-j-light-surface/50 dark:bg-white/5 rounded-xl overflow-hidden">
                           <table className="w-full text-left text-sm">
                               <thead className="bg-black/5 dark:bg-white/5 text-j-light-text/60 dark:text-white/60">
                                   <tr>
                                       <th className="p-4 font-medium">Name</th>
                                       <th className="p-4 font-medium">Date</th>
                                       <th className="p-4 font-medium">Type</th>
                                       <th className="p-4 font-medium text-right">Size</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-j-light-text/5 dark:divide-white/5">
                                   {[1,2,3].map((_, i) => (
                                       <tr key={i} className="text-j-light-text dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5">
                                           <td className="p-4 flex items-center gap-3">
                                               <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                   <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                               </svg>
                                               Project_Stem_Bass_{i}.wav
                                           </td>
                                           <td className="p-4 text-j-light-text/50 dark:text-white/50">Oct 24, 2023</td>
                                           <td className="p-4"><Badge>STEM</Badge></td>
                                           <td className="p-4 text-right font-mono text-xs">45 MB</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   </div>
               )}
             </Reveal>
          </div>
        </div>
      </Container>
      
      {/* 1. WIZARD */}
      {showWizard && (
        <NewProjectWizard 
          onClose={() => setShowWizard(false)}
          onProjectCreated={handleProjectCreated}
          currency={defaultCurrency}
          t={t}
        />
      )}

      {/* 2. PAYMENT */}
      <CheckoutModal 
        project={justCreatedProject}
        service={justCreatedProject?.service || null}
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        defaultCurrency={defaultCurrency}
        t={t}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 3. UPLOADER */}
      {showUploader && justCreatedProject && (
          <FileUploader 
              project={justCreatedProject}
              onClose={() => setShowUploader(false)}
              onComplete={handleUploadComplete}
          />
      )}

      {/* 4. AVATAR MODAL */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarModal(false)}
              className="absolute inset-0 bg-j-dark-bg/80 dark:bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-j-light-text dark:text-white">Choose Avatar</h3>
                   <button onClick={() => setShowAvatarModal(false)} className="text-j-light-text/50 dark:text-white/50 hover:text-warm-glow">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                   </button>
                </div>
                
                <div className="flex flex-col items-center gap-6">
                    {/* Preview */}
                    <div className="w-32 h-32 rounded-full border-4 border-warm-glow/20 overflow-hidden relative group">
                        <img src={avatarPreview || `https://ui-avatars.com/api/?name=${user.name}`} className="w-full h-full object-cover" />
                        {isCompressing && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                             <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          </div>
                        )}
                    </div>

                    {/* Presets Grid */}
                    <div className="w-full">
                       <p className="text-sm font-medium text-j-light-text/60 dark:text-white/60 mb-3 uppercase tracking-wider">Presets</p>
                       <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                           {AVATAR_PRESETS.map((src, i) => (
                             <button 
                                key={i}
                                onClick={() => setAvatarPreview(src)}
                                className={`aspect-square rounded-full overflow-hidden border-2 transition-all ${avatarPreview === src ? 'border-warm-glow scale-110' : 'border-transparent hover:border-warm-glow/50'}`}
                             >
                                <img src={src} className="w-full h-full object-cover" />
                             </button>
                           ))}
                       </div>
                    </div>

                    <div className="w-full h-px bg-j-light-text/10 dark:bg-white/10 my-2"></div>

                    {/* Upload */}
                    <div className="w-full text-center">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleAvatarFileSelect}
                        />
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full mb-2">
                           Upload Custom Image
                        </Button>
                        <p className="text-[10px] text-j-light-text/50 dark:text-white/50">Images are compressed to save space (Max 400px).</p>
                    </div>

                    <Button variant="primary" onClick={saveAvatar} className="w-full">
                       Apply Changes
                    </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};