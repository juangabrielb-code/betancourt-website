
export type Language = 'en' | 'es';

export enum Currency {
  USD = 'USD',
  COP = 'COP',
}

export enum ServiceType {
  MIXING = 'MIXING',
  MASTERING = 'MASTERING',
  PRODUCTION = 'PRODUCTION',
  CONSULTATION = 'CONSULTATION',
  // New Types
  MEDIA_AUDIO = 'MEDIA_AUDIO',
  PODCAST = 'PODCAST'
}

export interface Service {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  priceCop: number; 
  type: ServiceType;
  features: string[];
  imageUrl?: string;
  isPopular?: boolean;
}

// --- Admin Types ---
export interface LocalizedText {
  en: string;
  es: string;
}

export interface LocalizedArray {
  en: string[];
  es: string[];
}

export interface RawService {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  priceUsd: number;
  priceCop: number;
  type: ServiceType;
  features: LocalizedArray;
  imageUrl?: string;
  isPopular?: boolean;
}

// --- User & Profile Types ---

export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

export interface UserProfile {
  // Personal
  artistName: string;
  whatsapp: string;
  bio: string;
  
  // Billing (DIAN Colombia)
  docType: 'CC' | 'NIT' | 'CE' | 'PASSPORT';
  docNumber: string;
  billingAddress: string;
  city: string;
  country: string;
  taxRegime: 'PERSONA_NATURAL' | 'PERSONA_JURIDICA';
  companyName?: string; // For Juridica
  
  // Tech
  preferredSampleRate: '44.1' | '48' | '88.2' | '96';
  preferredBitDepth: '16' | '24' | '32';
  mainDaw: string;
  
  // Notifications
  notifyWhatsapp: boolean;
  notifyEmail: boolean;
  newsletterOptIn: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  profile?: UserProfile; // Optional until set
}

export type ProjectStatus = 'PENDING_PAYMENT' | 'PARTIALLY_PAID' | 'FILES_UPLOADED' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export interface ProjectFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: 'STEM' | 'REFERENCE' | 'MIX' | 'MASTER';
}

export interface Project {
  id: string;
  title: string;
  service: Service;
  status: ProjectStatus;
  progress: number; // 0 to 100
  createdAt: string;
  dueDate: string;
  price: number;
  currency: Currency;
  isPaid: boolean;
  paymentType?: 'FULL' | 'SPLIT';
  amountPaid?: number;
  files: ProjectFile[];
}

export interface Order {
  id: string;
  items: Service[];
  totalUsd: number;
  totalCop: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  currency: Currency;
  createdAt: string;
}

export interface CreateOrderResponse {
  orderId: string;
  clientSecret?: string; // For Stripe
  checkoutUrl?: string; // For Bold
}

// --- Dynamic Form Types ---

export type ProjectCategory = 'MUSIC' | 'MEDIA' | 'PODCAST';

export type TimeframeOption = '24-48H' | '1_WEEK' | '2_WEEKS' | '1_MONTH' | 'NO_RUSH';

export interface ProjectWizardState {
  category: ProjectCategory | null;
  serviceType: string | null;
  answers: Record<string, any>;
  timeframe: TimeframeOption | null;
  context?: string;
  acceptedTerms: boolean;
  estimatedPrice: number;
}
