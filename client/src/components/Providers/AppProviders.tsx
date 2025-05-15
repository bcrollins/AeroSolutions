import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingController from '@/components/Onboarding/OnboardingController';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorHandling/ErrorFallback';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders - Wraps the app with all necessary providers
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ReactErrorBoundary 
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="p-8 flex justify-center">
          <ErrorFallback 
            error={error} 
            resetErrorBoundary={resetErrorBoundary}
          />
        </div>
      )}
      onError={(error, info) => {
        console.error("Error caught by AppProviders:", error);
        console.error("Component stack:", info.componentStack);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <OnboardingProvider>
            {children}
            <OnboardingController />
            <Toaster />
          </OnboardingProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReactErrorBoundary>
  );
};

export default AppProviders;