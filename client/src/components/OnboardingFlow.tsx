import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { X, ArrowRight, CheckCircle, BookOpen, Palette, Code } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { trackEvent } from '@/lib/analytics';

interface OnboardingFlowProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  planName?: string;
}

type OnboardingStep = 'welcome' | 'preferences' | 'complete';
type PreferenceOption = 'ai-courses' | 'digital-tools' | 'web-development';

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ 
  open, 
  onClose,
  userId,
  planName = 'Pro'
}) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedPreference, setSelectedPreference] = useState<PreferenceOption | null>(null);
  
  // Track the onboarding flow views
  React.useEffect(() => {
    if (open) {
      trackEvent('view_onboarding_flow', 'onboarding', planName);
    }
  }, [open, planName]);
  
  // Handle preference selection
  const handleSelectPreference = (preference: PreferenceOption) => {
    setSelectedPreference(preference);
    trackEvent('select_onboarding_preference', 'onboarding', preference);
  };
  
  // Handle completing onboarding
  const handleCompleteOnboarding = async () => {
    try {
      if (!selectedPreference) {
        toast({
          title: "Please select a preference",
          description: "Select at least one option to continue.",
          variant: "destructive"
        });
        return;
      }
      
      trackEvent('complete_onboarding', 'onboarding', selectedPreference);
      
      // Save user preference
      await apiRequest('POST', '/api/user/onboarding', {
        userId,
        preference: selectedPreference
      });
      
      // Invalidate user query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Move to completion step
      setCurrentStep('complete');
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Navigate to appropriate page based on preference
  const handleNavigateToPreference = () => {
    onClose();
    
    if (selectedPreference === 'ai-courses') {
      navigate('/ai-courses');
    } else if (selectedPreference === 'digital-tools') {
      navigate('/tools');
    } else if (selectedPreference === 'web-development') {
      navigate('/web-development');
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">Welcome to Rollins X {planName}!</DialogTitle>
                <DialogDescription className="text-center pt-2">
                  Congratulations on your subscription! Let's customize your experience.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="bg-blue-50 dark:bg-blue-950/40 rounded-lg p-4 mb-4 text-blue-800 dark:text-blue-200">
                  <p className="text-sm">
                    Your 7-day free trial has been activated. You won't be charged until your trial ends, and you can cancel anytime.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Account activated</h4>
                      <p className="text-sm text-muted-foreground">Your {planName} subscription is now active.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Full access granted</h4>
                      <p className="text-sm text-muted-foreground">You now have access to all {planName} features.</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  className="w-full"
                  onClick={() => {
                    setCurrentStep('preferences');
                    trackEvent('next_onboarding_step', 'onboarding', 'welcome_to_preferences');
                  }}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </motion.div>
          )}
          
          {currentStep === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">Choose Your Interest</DialogTitle>
                <DialogDescription className="text-center pt-2">
                  What would you like to explore first?
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="grid gap-4">
                  <button
                    onClick={() => handleSelectPreference('ai-courses')}
                    className={`p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 flex items-center ${
                      selectedPreference === 'ai-courses' ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40' : ''
                    }`}
                  >
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mr-4">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">AI Courses</h3>
                      <p className="text-sm text-muted-foreground">Browse our collection of AI training courses</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleSelectPreference('digital-tools')}
                    className={`p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 flex items-center ${
                      selectedPreference === 'digital-tools' ? 'border-purple-500 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/40' : ''
                    }`}
                  >
                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mr-4">
                      <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">Digital Tools</h3>
                      <p className="text-sm text-muted-foreground">Explore our AI-powered design and development tools</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleSelectPreference('web-development')}
                    className={`p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-teal-500 dark:hover:border-teal-500 flex items-center ${
                      selectedPreference === 'web-development' ? 'border-teal-500 dark:border-teal-500 bg-teal-50 dark:bg-teal-950/40' : ''
                    }`}
                  >
                    <div className="h-10 w-10 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center mr-4">
                      <Code className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">Web Development</h3>
                      <p className="text-sm text-muted-foreground">Access web development projects and resources</p>
                    </div>
                  </button>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentStep('welcome');
                    trackEvent('prev_onboarding_step', 'onboarding', 'preferences_to_welcome');
                  }}
                >
                  Back
                </Button>
                <Button onClick={handleCompleteOnboarding}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </motion.div>
          )}
          
          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">You're All Set!</DialogTitle>
                <DialogDescription className="text-center pt-2">
                  Your account is ready and customized to your preferences.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <p className="mb-6">
                  Let's start exploring {selectedPreference === 'ai-courses' 
                    ? 'our AI courses' 
                    : selectedPreference === 'digital-tools' 
                      ? 'our digital tools' 
                      : 'our web development resources'
                  }.
                </p>
              </div>
              <DialogFooter>
                <Button 
                  className="w-full" 
                  onClick={handleNavigateToPreference}
                >
                  Get Started
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow;