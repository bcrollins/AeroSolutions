import React, { useEffect } from 'react';
import OnboardingTooltip from './OnboardingTooltip';
import { useLocation } from 'wouter';
import { useOnboarding, OnboardingFlowType } from '@/contexts/OnboardingContext';

// Map of paths to their relevant onboarding flows
const PATH_FLOW_MAP: Record<string, OnboardingFlowType> = {
  '/': 'welcome',
  '/dashboard': 'dashboard',
  '/courses': 'courses',
  '/tools': 'tools',
  '/community': 'community',
  '/profile': 'profile',
  '/subscription': 'subscription',
};

/**
 * OnboardingController - Manages the onboarding experience throughout the app
 * This component monitors user navigation and triggers appropriate onboarding flows
 */
const OnboardingController: React.FC = () => {
  const [location] = useLocation();
  const { 
    preferences, 
    isOnboardingActive, 
    activeFlow, 
    startFlow, 
    getNextRecommendedFlow,
    isFlowCompleted 
  } = useOnboarding();
  
  // Auto-start onboarding flows based on the current path
  useEffect(() => {
    // Skip if onboarding is already active
    if (isOnboardingActive) return;
    
    // Skip if onboarding is disabled
    if (!preferences.showOnboarding) return;
    
    // Check if there's a flow mapped to this path
    const flowId = PATH_FLOW_MAP[location];
    
    if (flowId && !isFlowCompleted(flowId)) {
      // Wait a moment to let the page load
      const timer = setTimeout(() => {
        startFlow(flowId);
      }, 800);
      
      return () => clearTimeout(timer);
    }
    
    // If no path-specific flow, check if there's another recommended flow
    const nextFlow = getNextRecommendedFlow();
    if (nextFlow?.startAutomatically) {
      // Wait a moment to let the page load
      const timer = setTimeout(() => {
        startFlow(nextFlow.id);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [location, isOnboardingActive, preferences.showOnboarding]);
  
  // Hook to listen for specific keyboard shortcuts to trigger feature onboarding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if onboarding is already active
      if (isOnboardingActive) return;
      
      // Command Palette onboarding (⌘K or Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !isFlowCompleted('feature:commandPalette')) {
        e.preventDefault();
        startFlow('feature:commandPalette');
      }
      
      // Dark Mode onboarding (⌘D or Ctrl+D)
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && !isFlowCompleted('feature:darkMode')) {
        e.preventDefault();
        startFlow('feature:darkMode');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOnboardingActive, startFlow, isFlowCompleted]);
  
  return (
    <>
      <OnboardingTooltip />
      
      {/* Add CSS for highlighting elements during onboarding */}
      {isOnboardingActive && (
        <style dangerouslySetInnerHTML={{ 
          __html: `
          .onboarding-highlight {
            position: relative;
            z-index: 60;
            box-shadow: 0 0 0 4px rgba(var(--primary), 0.6), 0 0 0 2000px rgba(0, 0, 0, 0.5);
            border-radius: 4px;
          }
        `}} />
      )}
    </>
  );
};

export default OnboardingController;