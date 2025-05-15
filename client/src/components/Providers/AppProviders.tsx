import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingController from '@/components/Onboarding/OnboardingController';
import ErrorBoundary from '@/components/ErrorHandling/ErrorBoundary';
import ErrorFallback from '@/components/ErrorHandling/ErrorFallback';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders - Wraps the app with all necessary providers
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <OnboardingProvider>
            {children}
            <OnboardingController />
            <Toaster />
          </OnboardingProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;