import { ReactNode } from 'react';

// Dashboard statistics and data
export interface DashboardStats {
  userName: string;
  walletBalance: {
    amount: number;
    currency: 'COP' | 'USD';
  };
  activeProjectsCount: number;
  pendingTasks: Array<PendingTask>;
}

// Pending task types
export type TaskType = 'PAYMENT' | 'UPLOAD' | 'REVIEW';

export interface PendingTask {
  id: string;
  label: string;
  type: TaskType;
}

// Project status and data
export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number; // 0-100
  createdAt: string;
}

// Navigation item
export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  badge?: number;
}

// Wallet/Balance
export interface WalletBalance {
  amount: number;
  currency: 'COP' | 'USD';
}

// Mock data for development
export const mockDashboardStats: DashboardStats = {
  userName: 'Usuario',
  walletBalance: {
    amount: 0,
    currency: 'COP',
  },
  activeProjectsCount: 0,
  pendingTasks: [],
};

export const mockProjects: Project[] = [];
