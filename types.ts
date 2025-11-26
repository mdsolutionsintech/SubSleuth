export interface Subscription {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  category: string;
  renewalDate: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface AlternativeService {
  name: string;
  priceDescription: string;
  savingsDescription: string;
  keyFeatures: string[];
  affiliateLink?: string; // Placeholder for monetization
}

export interface SearchState {
  query: string;
  loading: boolean;
  results: AlternativeService[] | null;
  error: string | null;
}

export interface GuideState {
  serviceName: string;
  loading: boolean;
  content: string | null;
  isOpen: boolean;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  DEAL_FINDER = 'DEAL_FINDER',
  ADD_SUB = 'ADD_SUB',
  PROFILE = 'PROFILE'
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}