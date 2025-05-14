import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Define the steps of the onboarding process
type OnboardingStep = 'welcome' | 'interests' | 'goals' | 'experience' | 'complete';

interface OnboardingData {
  interests: string[];
  goals: string;
  experience: string;
}

const PersonalizedOnboarding: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    interests: [],
    goals: '',
    experience: 'beginner'
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if this is a new user (first visit)
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    
    // Only show for authenticated users who haven't completed onboarding
    if (user && !hasCompletedOnboarding) {
      // Small delay to ensure the main page loads first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleInterestToggle = (interest: string) => {
    if (onboardingData.interests.includes(interest)) {
      setOnboardingData({
        ...onboardingData,
        interests: onboardingData.interests.filter(i => i !== interest)
      });
    } else {
      setOnboardingData({
        ...onboardingData,
        interests: [...onboardingData.interests, interest]
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Store that the user has seen onboarding
    localStorage.setItem('onboardingCompleted', 'true');
  };

  const nextStep = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('interests');
        break;
      case 'interests':
        if (onboardingData.interests.length === 0) {
          toast({
            title: "Please select at least one interest",
            variant: "destructive"
          });
          return;
        }
        setCurrentStep('goals');
        break;
      case 'goals':
        if (!onboardingData.goals) {
          toast({
            title: "Please tell us your goals",
            variant: "destructive"
          });
          return;
        }
        setCurrentStep('experience');
        break;
      case 'experience':
        setCurrentStep('complete');
        // Save user preferences
        saveUserPreferences();
        localStorage.setItem('onboardingCompleted', 'true');
        break;
      case 'complete':
        handleClose();
        break;
    }
  };

  const saveUserPreferences = async () => {
    try {
      // Save preferences to backend (mock implementation)
      // In a real implementation, this would be an API call
      console.log('Saving preferences:', onboardingData);
      
      toast({
        title: "Preferences saved!",
        description: "Your experience has been personalized.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  // Interest options for AI-related fields
  const interestOptions = [
    'AI Course Learning',
    'Web Development',
    'Digital Tools',
    'Content Creation',
    'Data Analytics',
    'AI Integration',
    'Business Applications'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card className="bg-gray-900 border-gray-800 shadow-lg">
              <CardHeader className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={handleClose}
                >
                  <X size={18} />
                  <span className="sr-only">Close</span>
                </Button>
                <CardTitle className="text-xl text-white">
                  {currentStep === 'welcome' && 'Welcome to RXAI!'}
                  {currentStep === 'interests' && 'What are you interested in?'}
                  {currentStep === 'goals' && 'What are your goals?'}
                  {currentStep === 'experience' && 'What is your experience level?'}
                  {currentStep === 'complete' && 'All Set!'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 'welcome' && (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Let's personalize your experience to help you get the most out of our platform.
                    </p>
                    <p className="text-gray-300">
                      This will only take a minute and will help us recommend the right courses and tools for you.
                    </p>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-1/5 bg-blue-500"></div>
                    </div>
                  </div>
                )}

                {currentStep === 'interests' && (
                  <div className="space-y-4">
                    <p className="text-gray-300 mb-4">
                      Select all that apply to you:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {interestOptions.map((interest) => (
                        <Button
                          key={interest}
                          variant={onboardingData.interests.includes(interest) ? "default" : "outline"}
                          className={onboardingData.interests.includes(interest) 
                            ? "border-blue-500 bg-blue-500/20 text-white" 
                            : "border-gray-700 text-gray-300 hover:border-blue-500/50"}
                          onClick={() => handleInterestToggle(interest)}
                        >
                          {interest}
                        </Button>
                      ))}
                    </div>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-2/5 bg-blue-500"></div>
                    </div>
                  </div>
                )}

                {currentStep === 'goals' && (
                  <div className="space-y-4">
                    <p className="text-gray-300 mb-2">
                      What do you want to achieve with RXAI?
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="goals" className="sr-only">Your goals</Label>
                      <textarea
                        id="goals"
                        rows={4}
                        className="w-full rounded-md border-gray-700 bg-gray-800 text-white p-3 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="I want to learn how to build AI applications..."
                        value={onboardingData.goals}
                        onChange={(e) => setOnboardingData({...onboardingData, goals: e.target.value})}
                      />
                    </div>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-3/5 bg-blue-500"></div>
                    </div>
                  </div>
                )}

                {currentStep === 'experience' && (
                  <div className="space-y-4">
                    <p className="text-gray-300 mb-4">
                      How would you describe your experience with AI technologies?
                    </p>
                    <RadioGroup
                      value={onboardingData.experience}
                      onValueChange={(value) => setOnboardingData({...onboardingData, experience: value})}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="beginner" id="beginner" />
                        <Label htmlFor="beginner" className="cursor-pointer text-gray-300">Beginner</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="intermediate" id="intermediate" />
                        <Label htmlFor="intermediate" className="cursor-pointer text-gray-300">Intermediate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advanced" id="advanced" />
                        <Label htmlFor="advanced" className="cursor-pointer text-gray-300">Advanced</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expert" id="expert" />
                        <Label htmlFor="expert" className="cursor-pointer text-gray-300">Expert</Label>
                      </div>
                    </RadioGroup>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-blue-500"></div>
                    </div>
                  </div>
                )}

                {currentStep === 'complete' && (
                  <div className="text-center space-y-4">
                    <div className="inline-block p-3 bg-green-500/20 rounded-full text-green-500">
                      <CheckCircle size={48} />
                    </div>
                    <h3 className="text-xl font-medium text-white">Your personalized experience is ready!</h3>
                    <p className="text-gray-300">
                      We've customized your dashboard based on your preferences. 
                      Explore your recommended courses and tools to get started!
                    </p>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-blue-500"></div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentStep === 'complete' ? 'Get Started' : 'Continue'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PersonalizedOnboarding;