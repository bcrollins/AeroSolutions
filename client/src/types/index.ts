export interface AiProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  detailedDescription?: string;
  shortDescription?: string;
  category: string;
  features?: string[];
  useCases?: string[];
  imageUrl?: string;
  pricing?: string;
  apiCredits?: number;
  usageLimit?: number;
  requiredPlan?: 'starter' | 'professional' | 'enterprise';
  relatedProducts?: Array<{
    id: number;
    slug: string;
    name: string;
    imageUrl?: string;
  }>;
  technicalSpecs?: Record<string, string>;
  isPopular?: boolean;
  isNew?: boolean;
  tags?: string[];
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  compareFeatures?: {
    [key: string]: boolean | string;
  };
  monthlyPrice?: number;
  yearlyPrice?: number;
  discountPercentage?: number;
}

export interface UserSubscription {
  id?: number;
  userId?: number;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'trial' | 'expired';
  startDate?: string;
  expiresAt?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  paymentMethod?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'guest';
  subscription?: UserSubscription;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}