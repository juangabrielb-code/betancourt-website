
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, GlassCard, Button, Input, TextArea, Badge } from './UI';
import { RawService, ServiceType } from '../types';
import { ApiService } from '../services/api';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [services, setServices] = useState<RawService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<RawService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Tab state for the modal (English vs Spanish)
  const [langTab, setLangTab] = useState<'en' | 'es'>('en');

  const loadServices = async () => {
    const data = await ApiService.getRawServices();
    setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleEdit = (service: RawService) => {
    setEditingService({ ...service });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingService({
      id: `srv_${Date.now()}`,
      name: { en: '', es: '' },
      description: { en: '', es: '' },
      priceUsd: 0,
      priceCop: 0,
      type: ServiceType.MIXING,
      features: { en: [], es: [] },
      imageUrl: '',
      isPopular: false
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      await ApiService.deleteService(id);
      loadServices();
    }
  };

  const handleSave = async () => {
    if (editingService) {
      await ApiService.saveService(editingService);
      setIsModalOpen(false);
      setEditingService(null);
      loadServices();
    }
  };

  const updateField = (field: keyof RawService, value: any) => {
    if (editingService) {
      setEditingService({ ...editingService, [field]: value });
    }
  };

  const updateLocalized = (field: 'name' | 'description', value: string) => {
    if (editingService) {
      setEditingService({
        ...editingService,
        [field]: { ...editingService[field], [langTab]: value }
      });
    }
  };

  const updateFeatures = (value: string) => {
    if (editingService) {
      // Split by newline to get array
      const featuresArray = value.split('\n').filter(f => f.trim() !== '');
      setEditingService({
        ...editingService,
        features: { ...editingService.features, [langTab]: featuresArray }
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-serif font-bold text-j-light-text dark:text-white">Admin Console</h1>
             <p className="text-j-light-text/60 dark:text-white/60">Manage your services and prices</p>
          </div>
          <div className="flex gap-4">
             <Button variant="secondary" onClick={() => ApiService.resetServices()} className="text-xs">
                Reset Defaults
             </Button>
             <Button variant="primary" onClick={handleCreate}>
                + New Service
             </Button>
             <Button variant="glass" onClick={onLogout}>
                Logout
             </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6">
           {services.map(s => (
             <GlassCard key={s.id} className="relative group hover:border-warm-glow/30 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <h3 className="text-xl font-bold text-j-light-text dark:text-white">{s.name.en}</h3>
                         <Badge>{s.type}</Badge>
                         {s.isPopular && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Popular</span>}
                      </div>
                      <p className="text-sm text-j-light-text/60 dark:text-white/60 mb-2">{s.description.en}</p>
                      <div className="flex gap-4 text-xs font-mono text-j-light-text/40 dark:text-white/40">
                         <span>USD: ${s.priceUsd}</span>
                         <span>COP: ${s.priceCop.toLocaleString()}</span>
                      </div>
                   </div>
                   
                   <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" className="!py-2 !px-4 text-xs" onClick={() => handleEdit(s)}>Edit</Button>
                      <Button variant="glass" className="!py-2 !px-4 text-xs hover:bg-red-500/20 hover:text-red-500" onClick={() => handleDelete(s.id)}>Delete</Button>
                   </div>
                </div>
             </GlassCard>
           ))}
        </div>
      </Container>

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-j-dark-bg/80 dark:bg-black/90 backdrop-blur-sm"
               onClick={() => setIsModalOpen(false)}
             />
             <motion.div 
               initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
               className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
             >
                <GlassCard className="p-8">
                   <h2 className="text-2xl font-bold text-j-light-text dark:text-white mb-6">
                      {editingService.id.startsWith('srv_') ? 'Edit Service' : 'New Service'}
                   </h2>

                   <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                         <label className="text-xs text-white/50 uppercase ml-1">Type</label>
                         <select 
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                           value={editingService.type}
                           onChange={(e) => updateField('type', e.target.value)}
                         >
                            {Object.values(ServiceType).map(t => (
                               <option key={t} value={t}>{t}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs text-white/50 uppercase ml-1">Popular Flag</label>
                         <div className="flex items-center h-[50px] px-4 bg-white/5 border border-white/10 rounded-xl">
                            <label className="flex items-center gap-2 cursor-pointer w-full text-white">
                               <input 
                                 type="checkbox" 
                                 checked={editingService.isPopular || false}
                                 onChange={(e) => updateField('isPopular', e.target.checked)}
                                 className="w-5 h-5 rounded border-white/20 bg-black/20 text-warm-glow"
                               />
                               Mark as Popular
                            </label>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-6">
                      <Input 
                        label="Price USD" 
                        type="number"
                        value={editingService.priceUsd}
                        onChange={(e) => updateField('priceUsd', Number(e.target.value))}
                      />
                      <Input 
                        label="Price COP" 
                        type="number"
                        value={editingService.priceCop}
                        onChange={(e) => updateField('priceCop', Number(e.target.value))}
                      />
                   </div>

                   {/* Language Tabs */}
                   <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
                      <button 
                        onClick={() => setLangTab('en')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${langTab === 'en' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                      >
                         English (EN)
                      </button>
                      <button 
                        onClick={() => setLangTab('es')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${langTab === 'es' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                      >
                         Español (ES)
                      </button>
                   </div>

                   <div className="space-y-4">
                      <Input 
                         label={`Service Name (${langTab.toUpperCase()})`}
                         value={editingService.name[langTab]}
                         onChange={(e) => updateLocalized('name', e.target.value)}
                      />
                      <TextArea 
                         label={`Description (${langTab.toUpperCase()})`}
                         value={editingService.description[langTab]}
                         onChange={(e) => updateLocalized('description', e.target.value)}
                      />
                      <TextArea 
                         label={`Features (${langTab.toUpperCase()}) - One per line`}
                         value={editingService.features[langTab].join('\n')}
                         onChange={(e) => updateFeatures(e.target.value)}
                         className="font-mono text-sm"
                      />
                   </div>

                   <div className="flex justify-end gap-3 mt-8">
                      <Button variant="glass" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                   </div>
                </GlassCard>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
