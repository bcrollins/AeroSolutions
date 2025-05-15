import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types of onboarding flows available in the app
export type OnboardingFlowType = 
  | 'welcome' 
  | 'dashboard' 
  | 'courses' 
  | 'tools' 
  | 'community' 
  | 'profile' 
  | 'subscription'
  | 'feature:commandPalette'
  | 'feature:darkMode'
  | 'feature:filters';

// Step structure for onboarding flows
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  elementSelector?: string; // CSS selector for the element to highlight
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  action?: {
    label: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
  order: number;
}

// Flow structure containing multiple steps
export interface OnboardingFlow {
  id: OnboardingFlowType;
  title: string;
  description?: string;
  steps: OnboardingStep[];
  completed: boolean;
  startAutomatically?: boolean;
  required?: boolean;
  available?: boolean;
}

// User onboarding preferences
export interface OnboardingPreferences {
  showOnboarding: boolean;
  showHints: boolean;
  showKeyboardShortcuts: boolean;
  enableTooltips: boolean;
  completedFlows: Record<OnboardingFlowType, boolean>;
  dismissedFlows: OnboardingFlowType[];
  lastStep?: {
    flowId: OnboardingFlowType;
    stepId: string;
  };
}

// Default onboarding preferences
const defaultPreferences: OnboardingPreferences = {
  showOnboarding: true,
  showHints: true,
  showKeyboardShortcuts: true,
  enableTooltips: true,
  completedFlows: {
    welcome: false,
    dashboard: false,
    courses: false,
    tools: false,
    community: false,
    profile: false,
    subscription: false,
    'feature:commandPalette': false,
    'feature:darkMode': false,
    'feature:filters': false,
  },
  dismissedFlows: [],
};

// Type definitions for the context
interface OnboardingContextType {
  // State
  preferences: OnboardingPreferences;
  allFlows: OnboardingFlow[];
  activeFlow: OnboardingFlow | null;
  currentStep: OnboardingStep | null;
  isOnboardingActive: boolean;
  
  // Actions
  startFlow: (flowId: OnboardingFlowType) => void;
  skipFlow: (flowId: OnboardingFlowType) => void;
  completeFlow: (flowId: OnboardingFlowType) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepId: string) => void;
  dismissStep: () => void;
  endOnboarding: () => void;
  resetOnboarding: () => void;
  updatePreferences: (newPrefs: Partial<OnboardingPreferences>) => void;
  
  // Helpers
  isFlowCompleted: (flowId: OnboardingFlowType) => boolean;
  isFlowDismissed: (flowId: OnboardingFlowType) => boolean;
  getAvailableFlows: () => OnboardingFlow[];
  getNextRecommendedFlow: () => OnboardingFlow | null;
}

// Create the context with default values
const OnboardingContext = createContext<OnboardingContextType>({
  // State
  preferences: defaultPreferences,
  allFlows: [],
  activeFlow: null,
  currentStep: null,
  isOnboardingActive: false,
  
  // Actions
  startFlow: () => {},
  skipFlow: () => {},
  completeFlow: () => {},
  nextStep: () => {},
  prevStep: () => {},
  goToStep: () => {},
  dismissStep: () => {},
  endOnboarding: () => {},
  resetOnboarding: () => {},
  updatePreferences: () => {},
  
  // Helpers
  isFlowCompleted: () => false,
  isFlowDismissed: () => false,
  getAvailableFlows: () => [],
  getNextRecommendedFlow: () => null,
});

// Storage key for persisting onboarding state
const STORAGE_KEY = 'rxai_onboarding_preferences';

// Provider component for the onboarding context
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Onboarding state
  const [preferences, setPreferences] = useState<OnboardingPreferences>(defaultPreferences);
  const [activeFlowId, setActiveFlowId] = useState<OnboardingFlowType | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  
  // Define available onboarding flows
  const allFlows: OnboardingFlow[] = [
    {
      id: 'welcome',
      title: 'Welcome to RXAI',
      description: 'Let\'s get you started with a quick tour of the platform',
      steps: [
        {
          id: 'welcome-1',
          title: 'Welcome to RXAI',
          description: 'Your journey into the world of AI starts here. We\'ll guide you through the platform to help you get the most out of your experience.',
          placement: 'center',
          action: {
            label: 'Let\'s get started',
          },
          order: 0,
        },
        {
          id: 'welcome-2',
          title: 'Personalized Dashboard',
          description: 'This is your personalized dashboard. Here you can keep track of your courses, progress, and get personalized recommendations.',
          placement: 'top',
          elementSelector: '.dashboard-container',
          action: {
            label: 'Next',
          },
          order: 1,
        },
        {
          id: 'welcome-3',
          title: 'Navigation',
          description: 'Use the navigation bar to access different areas of the platform including courses, tools, community, and your profile.',
          placement: 'bottom',
          elementSelector: 'nav',
          action: {
            label: 'Next',
          },
          order: 2,
        },
        {
          id: 'welcome-4',
          title: 'Ready to explore?',
          description: 'You\'re all set to start exploring RXAI. We\'ll guide you through specific features as you use them.',
          placement: 'center',
          action: {
            label: 'Start exploring',
          },
          order: 3,
        },
      ],
      completed: false,
      startAutomatically: true,
      required: true,
      available: true,
    },
    {
      id: 'dashboard',
      title: 'Dashboard Features',
      description: 'Learn how to customize your dashboard and use its features',
      steps: [
        {
          id: 'dashboard-1',
          title: 'Your Dashboard',
          description: 'This is your personalized dashboard. You can customize it to show the information that\'s most important to you.',
          placement: 'top',
          elementSelector: '.dashboard-container',
          action: {
            label: 'Next',
          },
          order: 0,
        },
        {
          id: 'dashboard-2',
          title: 'Widgets',
          description: 'Widgets show different types of information. You can add, remove, and rearrange them.',
          placement: 'top',
          elementSelector: '.dashboard-widget',
          action: {
            label: 'Next',
          },
          order: 1,
        },
        {
          id: 'dashboard-3',
          title: 'Customize Your Dashboard',
          description: 'Click here to add, remove, or rearrange widgets on your dashboard.',
          placement: 'bottom',
          elementSelector: '.dashboard-customize-button',
          action: {
            label: 'Next',
          },
          order: 2,
        },
        {
          id: 'dashboard-4',
          title: 'Dashboard Customization Complete',
          description: 'Now you know how to customize your dashboard! Make it yours by adding the widgets that matter to you.',
          placement: 'center',
          action: {
            label: 'Got it',
          },
          order: 3,
        },
      ],
      completed: false,
      startAutomatically: false,
      required: false,
      available: true,
    },
    {
      id: 'feature:commandPalette',
      title: 'Command Palette',
      description: 'Learn how to use the command palette for quick navigation',
      steps: [
        {
          id: 'command-palette-1',
          title: 'Command Palette',
          description: 'The Command Palette lets you quickly access features and navigate the platform using your keyboard.',
          placement: 'center',
          action: {
            label: 'Next',
          },
          order: 0,
        },
        {
          id: 'command-palette-2',
          title: 'Open Command Palette',
          description: 'Press ⌘K (Mac) or Ctrl+K (Windows) to open the command palette at any time.',
          placement: 'center',
          action: {
            label: 'Next',
          },
          order: 1,
        },
        {
          id: 'command-palette-3',
          title: 'Search Commands',
          description: 'Type to search for commands, navigation options, and actions.',
          placement: 'top',
          elementSelector: '.command-input',
          action: {
            label: 'Next',
          },
          order: 2,
        },
        {
          id: 'command-palette-4',
          title: 'Ready to Use',
          description: 'Try opening the command palette now with ⌘K or Ctrl+K and exploring available commands.',
          placement: 'center',
          action: {
            label: 'Got it',
          },
          order: 3,
        },
      ],
      completed: false,
      startAutomatically: false,
      required: false,
      available: true,
    },
  ];
  
  // Get active flow
  const activeFlow = activeFlowId 
    ? allFlows.find(flow => flow.id === activeFlowId) || null 
    : null;
  
  // Get current step
  const currentStep = activeFlow && currentStepId
    ? activeFlow.steps.find(step => step.id === currentStepId) || null
    : null;
  
  // Calculate if onboarding is active
  const isOnboardingActive = !!activeFlow && !!currentStep;
  
  // Load onboarding preferences from localStorage on initial render
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(STORAGE_KEY);
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(prevPrefs => ({
          ...prevPrefs,
          ...parsedPreferences,
        }));
      }
      
      // Check if there's a last step to resume
      if (preferences.lastStep) {
        const { flowId, stepId } = preferences.lastStep;
        setActiveFlowId(flowId);
        setCurrentStepId(stepId);
      }
      
      // Check for auto-start flows
      if (!activeFlowId) {
        const nextFlow = getNextRecommendedFlow();
        if (nextFlow?.startAutomatically) {
          startFlow(nextFlow.id);
        }
      }
    } catch (error) {
      console.error('Error loading onboarding preferences:', error);
    }
  }, []);
  
  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving onboarding preferences:', error);
    }
  }, [preferences]);
  
  // Helper function to check if a flow is completed
  const isFlowCompleted = (flowId: OnboardingFlowType): boolean => {
    return !!preferences.completedFlows[flowId];
  };
  
  // Helper function to check if a flow is dismissed
  const isFlowDismissed = (flowId: OnboardingFlowType): boolean => {
    return preferences.dismissedFlows.includes(flowId);
  };
  
  // Helper function to get available flows
  const getAvailableFlows = (): OnboardingFlow[] => {
    return allFlows.filter(flow => 
      flow.available && 
      !isFlowCompleted(flow.id) && 
      !isFlowDismissed(flow.id)
    );
  };
  
  // Helper function to get the next recommended flow
  const getNextRecommendedFlow = (): OnboardingFlow | null => {
    const availableFlows = getAvailableFlows();
    
    // First check for required flows
    const requiredFlow = availableFlows.find(flow => flow.required);
    if (requiredFlow) return requiredFlow;
    
    // Then check for regular flows
    return availableFlows[0] || null;
  };
  
  // Start a flow
  const startFlow = (flowId: OnboardingFlowType) => {
    const flow = allFlows.find(f => f.id === flowId);
    if (!flow) return;
    
    // Set active flow and start with the first step
    setActiveFlowId(flowId);
    const firstStep = flow.steps.sort((a, b) => a.order - b.order)[0];
    if (firstStep) {
      setCurrentStepId(firstStep.id);
      
      // Save last step
      updatePreferences({
        lastStep: {
          flowId,
          stepId: firstStep.id,
        }
      });
    }
  };
  
  // Skip a flow
  const skipFlow = (flowId: OnboardingFlowType) => {
    // Add to dismissed flows
    updatePreferences({
      dismissedFlows: [...preferences.dismissedFlows, flowId],
      lastStep: undefined,
    });
    
    // If this was the active flow, end onboarding
    if (activeFlowId === flowId) {
      endOnboarding();
    }
    
    toast({
      title: 'Onboarding skipped',
      description: 'You can access this guide later from the Help menu',
    });
  };
  
  // Complete a flow
  const completeFlow = (flowId: OnboardingFlowType) => {
    // Mark flow as completed
    updatePreferences({
      completedFlows: {
        ...preferences.completedFlows,
        [flowId]: true,
      },
      lastStep: undefined,
    });
    
    // If this was the active flow, end onboarding
    if (activeFlowId === flowId) {
      endOnboarding();
    }
    
    toast({
      title: 'Onboarding completed',
      description: 'You can access this guide again from the Help menu',
    });
  };
  
  // Move to the next step
  const nextStep = () => {
    if (!activeFlow || !currentStep) return;
    
    const currentIndex = activeFlow.steps.findIndex(step => step.id === currentStep.id);
    const nextIndex = currentIndex + 1;
    
    // Check if this is the last step
    if (nextIndex >= activeFlow.steps.length) {
      // Complete the flow if we've reached the end
      completeFlow(activeFlow.id);
    } else {
      // Move to the next step
      const nextStep = activeFlow.steps[nextIndex];
      setCurrentStepId(nextStep.id);
      
      // Save last step
      updatePreferences({
        lastStep: {
          flowId: activeFlow.id,
          stepId: nextStep.id,
        }
      });
    }
  };
  
  // Move to the previous step
  const prevStep = () => {
    if (!activeFlow || !currentStep) return;
    
    const currentIndex = activeFlow.steps.findIndex(step => step.id === currentStep.id);
    const prevIndex = currentIndex - 1;
    
    // Check if there is a previous step
    if (prevIndex >= 0) {
      const prevStep = activeFlow.steps[prevIndex];
      setCurrentStepId(prevStep.id);
      
      // Save last step
      updatePreferences({
        lastStep: {
          flowId: activeFlow.id,
          stepId: prevStep.id,
        }
      });
    }
  };
  
  // Go to a specific step
  const goToStep = (stepId: string) => {
    if (!activeFlow) return;
    
    const step = activeFlow.steps.find(s => s.id === stepId);
    if (step) {
      setCurrentStepId(stepId);
      
      // Save last step
      updatePreferences({
        lastStep: {
          flowId: activeFlow.id,
          stepId,
        }
      });
    }
  };
  
  // Dismiss the current step
  const dismissStep = () => {
    if (!activeFlow || !currentStep) return;
    
    // Check if this step is dismissible
    if (currentStep.dismissible) {
      nextStep();
    }
  };
  
  // End the current onboarding flow
  const endOnboarding = () => {
    setActiveFlowId(null);
    setCurrentStepId(null);
    
    // Clear last step
    updatePreferences({
      lastStep: undefined,
    });
  };
  
  // Reset all onboarding progress
  const resetOnboarding = () => {
    setPreferences(defaultPreferences);
    setActiveFlowId(null);
    setCurrentStepId(null);
    
    toast({
      title: 'Onboarding reset',
      description: 'All onboarding progress has been reset',
    });
  };
  
  // Update preferences
  const updatePreferences = (newPrefs: Partial<OnboardingPreferences>) => {
    setPreferences(prevPrefs => ({
      ...prevPrefs,
      ...newPrefs,
    }));
  };
  
  // Context value
  const contextValue: OnboardingContextType = {
    // State
    preferences,
    allFlows,
    activeFlow,
    currentStep,
    isOnboardingActive,
    
    // Actions
    startFlow,
    skipFlow,
    completeFlow,
    nextStep,
    prevStep,
    goToStep,
    dismissStep,
    endOnboarding,
    resetOnboarding,
    updatePreferences,
    
    // Helpers
    isFlowCompleted,
    isFlowDismissed,
    getAvailableFlows,
    getNextRecommendedFlow,
  };
  
  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook for using the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;