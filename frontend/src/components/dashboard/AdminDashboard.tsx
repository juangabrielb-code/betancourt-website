"use client";

import React, { useState, useEffect } from 'react';
import { Container, GlassCard, Button, Input, TextArea } from '../ui/UI';
import { RawService, ServiceType } from '@/types';

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
    try {
      const response = await fetch('/api/admin/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services', error);
    } finally {
      setLoading(false);
    }
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
      try {
        await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
        loadServices();
      } catch (error) {
        console.error('Failed to delete service', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingService) {
      try {
        await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingService),
        });
        setIsModalOpen(false);
        setEditingService(null);
        loadServices();
      } catch (error) {
        console.error('Failed to save service', error);
      }
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
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleCreate}>+ Add Service</Button>
            <Button variant="glass" onClick={onLogout}>Logout</Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-warm-glow">Loading services...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <GlassCard key={service.id} className="relative">
                {service.isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-warm-glow text-j-dark-bg text-xs font-bold rounded">POPULAR</span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-j-light-text dark:text-white">
                    {service.name.en}
                  </h3>
                  <p className="text-xs text-warm-glow">{service.type}</p>
                </div>
                <div className="mb-4 text-sm text-j-light-text/70 dark:text-j-dark-text/70">
                  <p>USD: ${service.priceUsd}</p>
                  <p>COP: ${service.priceCop.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(service)} variant="glass" className="flex-1 !text-xs !py-2">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(service.id)} variant="glass" className="!text-xs !py-2 text-red-500">
                    Delete
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Edit/Create Modal */}
        {isModalOpen && editingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-j-dark-bg/90 dark:bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />

            <GlassCard className="w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold text-j-light-text dark:text-white">
                  {editingService.id.startsWith('srv_') && editingService.name.en === '' ? 'New Service' : 'Edit Service'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-j-light-text/50 dark:text-white/50 hover:text-warm-glow">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Language Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setLangTab('en')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    langTab === 'en'
                      ? 'bg-warm-glow text-j-dark-bg'
                      : 'bg-j-light-surface/50 dark:bg-white/5 text-j-light-text dark:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLangTab('es')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    langTab === 'es'
                      ? 'bg-warm-glow text-j-dark-bg'
                      : 'bg-j-light-surface/50 dark:bg-white/5 text-j-light-text dark:text-white'
                  }`}
                >
                  Español
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label={`Name (${langTab.toUpperCase()})`}
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
                />

                {langTab === 'en' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Price USD"
                        type="number"
                        value={editingService.priceUsd}
                        onChange={(e) => updateField('priceUsd', parseFloat(e.target.value))}
                      />
                      <Input
                        label="Price COP"
                        type="number"
                        value={editingService.priceCop}
                        onChange={(e) => updateField('priceCop', parseFloat(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-j-light-text/60 dark:text-white/60 uppercase tracking-wider ml-1 block mb-2">
                        Service Type
                      </label>
                      <select
                        value={editingService.type}
                        onChange={(e) => updateField('type', e.target.value as ServiceType)}
                        className="w-full bg-j-light-surface/50 dark:bg-black/20 border border-j-light-text/10 dark:border-white/10 rounded-xl px-4 py-3 text-j-light-text dark:text-j-dark-text"
                      >
                        {Object.values(ServiceType).map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editingService.isPopular}
                        onChange={(e) => updateField('isPopular', e.target.checked)}
                        className="w-5 h-5 rounded border-j-light-text/20 dark:border-white/20 bg-j-light-text/10 dark:bg-black/20 text-warm-glow"
                      />
                      <span className="text-sm text-j-light-text dark:text-white">Mark as Popular</span>
                    </label>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-j-light-text/10 dark:border-white/10">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Save Service
                </Button>
              </div>
            </GlassCard>
          </div>
        )}
      </Container>
    </div>
  );
};
