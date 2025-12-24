
import { Service, Order, Currency, CreateOrderResponse, ServiceType, Language, User, Project, ProjectStatus, ProjectFile, ProjectWizardState, UserProfile, RawService } from '../types';

// Default Data (Fallback)
const DEFAULT_RAW_SERVICES: RawService[] = [
  {
    id: '1',
    name: { en: 'Stem Mixing', es: 'Mezcla por Stems' },
    description: { 
      en: 'Professional mixing service for up to 20 stems. Analog warmth meets digital precision.',
      es: 'Servicio profesional de mezcla hasta 20 stems. Calidez analógica con precisión digital.'
    },
    priceUsd: 150,
    priceCop: 600000,
    type: ServiceType.MIXING,
    features: {
      en: ['Analog Summing', 'Vocal Tuning', '3 Revisions', 'High-Res Delivery'],
      es: ['Sumador Analógico', 'Afinación Vocal', '3 Revisiones', 'Entrega en Alta Resolución']
    },
    isPopular: true
  },
  {
    id: '2',
    name: { en: 'Stereo Mastering', es: 'Masterización Estéreo' },
    description: {
      en: 'The final polish your track needs to compete on streaming platforms.',
      es: 'El pulido final que tu track necesita para competir en plataformas de streaming.'
    },
    priceUsd: 60,
    priceCop: 240000,
    type: ServiceType.MASTERING,
    features: {
      en: ['Loudness Optimization', 'EQ & Compression', 'Metadata Tagging', 'Apple Digital Master'],
      es: ['Optimización de Loudness', 'EQ y Compresión', 'Metadatos', 'Apple Digital Master']
    },
    imageUrl: 'https://picsum.photos/400/300'
  },
  {
    id: '3',
    name: { en: 'Full Production', es: 'Producción Completa' },
    description: {
      en: 'From a simple demo to a radio-ready hit. Full instrumental production.',
      es: 'De un simple demo a un éxito radial. Producción instrumental completa.'
    },
    priceUsd: 500,
    priceCop: 2000000,
    type: ServiceType.PRODUCTION,
    features: {
      en: ['Custom Composition', 'Session Musicians', 'Arrangement', 'Mixing Included'],
      es: ['Composición Personalizada', 'Músicos de Sesión', 'Arreglos', 'Mezcla Incluida']
    }
  },
  {
    id: '4',
    name: { en: 'Career Consultation', es: 'Consultoría de Carrera' },
    description: {
      en: '1-on-1 strategy session to plan your next release or career move.',
      es: 'Sesión estratégica 1 a 1 para planear tu próximo lanzamiento o paso profesional.'
    },
    priceUsd: 100,
    priceCop: 400000,
    type: ServiceType.CONSULTATION,
    features: {
      en: ['1 Hour Video Call', 'Release Strategy', 'Playlist Pitching Guide'],
      es: ['Videollamada de 1 Hora', 'Estrategia de Lanzamiento', 'Guía de Pitching']
    }
  }
];

// Helper to get data from LocalStorage
const getStoredServices = (): RawService[] => {
  const stored = localStorage.getItem('ba_services');
  if (stored) {
    return JSON.parse(stored);
  }
  return DEFAULT_RAW_SERVICES;
};

// Mock Projects Data
const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ-001',
    title: 'Neon Horizon - Single',
    service: getStoredServices()[0] as any, // Cast for mock
    status: 'IN_PROGRESS',
    progress: 65,
    createdAt: '2023-10-15',
    dueDate: '2023-10-25',
    price: 150,
    currency: Currency.USD,
    isPaid: true,
    paymentType: 'FULL',
    files: [
      { id: 'f1', name: 'Vocals_Dry.wav', size: '45MB', uploadDate: '2023-10-15', type: 'STEM' },
      { id: 'f2', name: 'Beat_Stem.wav', size: '120MB', uploadDate: '2023-10-15', type: 'STEM' },
      { id: 'f3', name: 'Reference.mp3', size: '5MB', uploadDate: '2023-10-15', type: 'REFERENCE' },
    ]
  },
  {
    id: 'PRJ-002',
    title: 'Acoustic Sessions EP',
    service: getStoredServices()[1] as any,
    status: 'PENDING_PAYMENT',
    progress: 0,
    createdAt: '2023-10-20',
    dueDate: '2023-11-01',
    price: 240000,
    currency: Currency.COP,
    isPaid: false,
    files: []
  },
  {
    id: 'PRJ-003',
    title: 'Summer Vibes',
    service: getStoredServices()[0] as any,
    status: 'COMPLETED',
    progress: 100,
    createdAt: '2023-09-01',
    dueDate: '2023-09-10',
    price: 150,
    currency: Currency.USD,
    isPaid: true,
    paymentType: 'FULL',
    files: [
      { id: 'f4', name: 'Summer_Vibes_Final_Master.wav', size: '55MB', uploadDate: '2023-09-10', type: 'MASTER' }
    ]
  }
];

// Default Mock Profile
const MOCK_PROFILE: UserProfile = {
  artistName: 'Client Artist',
  whatsapp: '+57 300 123 4567',
  bio: 'Indie pop artist based in Bogota.',
  docType: 'CC',
  docNumber: '1020304050',
  billingAddress: 'Calle 123 # 45-67',
  city: 'Bogotá',
  country: 'Colombia',
  taxRegime: 'PERSONA_NATURAL',
  preferredSampleRate: '48',
  preferredBitDepth: '24',
  mainDaw: 'Ableton Live',
  notifyWhatsapp: true,
  notifyEmail: true,
  newsletterOptIn: false
};

// Simulating API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ApiService = {
  // --- PUBLIC ENDPOINTS ---
  getServices: async (lang: Language = 'en'): Promise<Service[]> => {
    await delay(300);
    const services = getStoredServices(); 
    return services.map(s => ({
      id: s.id,
      name: s.name[lang],
      description: s.description[lang],
      priceUsd: s.priceUsd,
      priceCop: s.priceCop,
      type: s.type,
      features: s.features[lang],
      imageUrl: s.imageUrl,
      isPopular: s.isPopular
    }));
  },

  // --- ADMIN ENDPOINTS ---
  getRawServices: async (): Promise<RawService[]> => {
    await delay(200);
    return getStoredServices();
  },

  saveService: async (service: RawService): Promise<void> => {
    await delay(500);
    const services = getStoredServices();
    const index = services.findIndex(s => s.id === service.id);
    
    if (index >= 0) {
      services[index] = service;
    } else {
      services.push(service);
    }
    
    localStorage.setItem('ba_services', JSON.stringify(services));
  },

  deleteService: async (id: string): Promise<void> => {
    await delay(500);
    const services = getStoredServices().filter(s => s.id !== id);
    localStorage.setItem('ba_services', JSON.stringify(services));
  },

  resetServices: async (): Promise<void> => {
    localStorage.removeItem('ba_services');
    window.location.reload();
  },

  // --- AUTH ENDPOINTS (Django Auth) ---
  login: async (email: string, password: string): Promise<User> => {
    await delay(1000);
    // In production: POST /api/auth/login/
    if (email.includes('error')) throw new Error('Invalid credentials');
    
    // ADMIN LOGIN MOCK
    if (email === 'admin@betancourtaudio.com') {
      return {
        id: 'admin_001',
        name: 'Sebastian Betancourt',
        email: email,
        role: 'ADMIN',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
        profile: MOCK_PROFILE
      };
    }

    return {
      id: 'u_123',
      name: 'Client User',
      email: email,
      role: 'CLIENT',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      profile: MOCK_PROFILE
    };
  },

  register: async (data: any): Promise<User> => {
    await delay(1500);
    // In production: POST /api/auth/register/
    return {
      id: 'u_new',
      name: data.name,
      email: data.email,
      role: 'CLIENT',
      profile: MOCK_PROFILE
    };
  },

  // --- PROFILE ENDPOINTS ---
  updateProfile: async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    await delay(1000);
    console.log("Updating profile for", userId, data);
    // Merge updates
    const updated = { ...MOCK_PROFILE, ...data };
    return updated;
  },

  // --- PROJECT ENDPOINTS (Django Models) ---
  getUserProjects: async (userId: string): Promise<Project[]> => {
    await delay(800);
    // In production: GET /api/projects/?user=userId
    return MOCK_PROJECTS;
  },

  submitProjectRequest: async (wizardData: ProjectWizardState): Promise<Project> => {
    await delay(1500);
    const services = getStoredServices();
    // Simple mock logic for project creation
    const project: Project = {
      id: `PRJ-${Math.floor(Math.random() * 10000)}`,
      title: wizardData.context?.substring(0, 20) || 'New Project',
      service: services[0] as any, // Placeholder
      status: 'PENDING_PAYMENT',
      progress: 0,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      price: wizardData.estimatedPrice,
      currency: Currency.USD, // Should be passed from context
      isPaid: false,
      files: []
    };

    MOCK_PROJECTS.push(project);
    return project;
  },

  calculateEstimate: (state: ProjectWizardState): number => {
    let base = 0;
    // Music
    if (state.category === 'MUSIC') {
      if (state.serviceType === 'stereo_mix') base = 150;
      if (state.serviceType === 'dolby_atmos') base = 300;
      if (state.serviceType === 'editing') base = 50;
      if (state.answers['duration'] === 'gt_11') base *= 1.5;
      if (state.answers['tracks'] === '64_128') base += 100;
    }
    // Media
    if (state.category === 'MEDIA') {
      if (state.serviceType === 'media_mix') base = 200;
      if (state.serviceType === 'sound_design') base = 300;
      if (state.answers['content_type'] === 'feature_film') base *= 3;
      if (state.answers['format'] === '5.1') base += 150;
    }
    // Podcast
    if (state.category === 'PODCAST') {
      if (state.serviceType === 'podcast_edit') base = 50;
      if (state.serviceType === 'podcast_production') base = 200;
      if (state.answers['raw_duration'] === 'gt_60') base += 40;
    }
    // Timeframe
    if (state.timeframe === '24-48H') base *= 1.5; 
    if (state.timeframe === 'NO_RUSH') base *= 0.9;

    return Math.round(base);
  },

  updateProjectPayment: async (projectId: string, paymentType: 'FULL' | 'SPLIT'): Promise<void> => {
      await delay(500);
      const project = MOCK_PROJECTS.find(p => p.id === projectId);
      if (project) {
          project.status = paymentType === 'FULL' ? 'FILES_UPLOADED' : 'PARTIALLY_PAID'; // Wait for files
          project.isPaid = true;
          project.paymentType = paymentType;
          project.amountPaid = paymentType === 'FULL' ? project.price : project.price / 2;
      }
  },

  // --- UPLOAD ENDPOINTS (MyAirBridge Integration Simulation) ---

  getUploadToken: async (projectId: string, fileName: string, fileSize: number) => {
    await delay(500);
    // In production: Returns token from Django -> MyAirBridge
    return {
      uploadUrl: `https://mock-upload.myairbridge.com/${projectId}`,
      token: "mock_jwt_token_123"
    };
  },

  uploadChunk: async (url: string, chunk: Blob, chunkIndex: number, retries = 3): Promise<void> => {
    // Simulate chunk upload with failure chance
    const time = chunk.size / 100000; // Simulate speed based on size
    await delay(time > 1000 ? 1000 : time);
    
    // Simulate network error 5% of time to test retry logic
    if (Math.random() < 0.05 && retries > 0) {
      throw new Error("Network interruption");
    }
    return;
  },

  notifyUploadComplete: async (projectId: string, fileId: string) => {
    await delay(800);
    const project = MOCK_PROJECTS.find(p => p.id === projectId);
    if(project) {
        project.status = 'FILES_UPLOADED';
    }
    console.log(`✅ Backend verified file ${fileId} for project ${projectId}`);
  },

  // --- PAYMENT ENDPOINTS ---
  createOrder: async (serviceId: string, currency: Currency): Promise<CreateOrderResponse> => {
    await delay(1000);
    const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;

    if (currency === Currency.USD) {
      return {
        orderId,
        clientSecret: 'pi_mock_secret_12345_stripe_intent' 
      };
    } else {
      return {
        orderId,
        checkoutUrl: 'https://checkout.bold.co/mock-payment-link'
      };
    }
  },

  sendConfirmationEmail: async (email: string, orderId: string, serviceName: string, amount: string): Promise<boolean> => {
    await delay(800);
    console.log(`📧 Email sent to ${email} for order ${orderId}`);
    return true;
  },

  detectUserCountry: async (): Promise<'CO' | 'ROW'> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error("GeoIP failed");
      const data = await response.json();
      return data.country_code === 'CO' ? 'CO' : 'ROW';
    } catch (error) {
      return 'ROW';
    }
  },

  formatCurrency: (amount: number, currency: Currency): string => {
    return new Intl.NumberFormat(currency === Currency.USD ? 'en-US' : 'es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
};
