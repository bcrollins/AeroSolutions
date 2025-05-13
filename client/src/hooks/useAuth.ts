import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  subscriptionLevel: 'free' | 'basic' | 'professional' | 'enterprise';
  profileImageUrl?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  // Query for fetching the authenticated user
  const { 
    data: user, 
    isLoading,
    error,
    refetch 
  } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/auth/user');
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAuthenticated = !!user;

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      await refetch(); // Refresh user data after login
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const response = await apiRequest('POST', '/api/auth/logout');
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      await refetch(); // Refresh user data after logout
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    refetch,
  };
}

export default useAuth;