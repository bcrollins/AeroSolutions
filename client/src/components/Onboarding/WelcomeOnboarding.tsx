import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ChevronRight, X } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useLocation } from 'wouter';

interface WelcomeOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: React.ReactNode;
  image?: string;
}

/**
 * WelcomeOnboarding - Initial onboarding flow for new users
 */
const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({
  onComplete,
  onSkip,
}) => {
  const { toast } = useToast();
  const { completeFlow } = useOnboarding();
  const [, navigate] = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'right' | 'left'>('right');
  
  // Define onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to RXAI',
      description: (
        <div className="space-y-4">
          <p>
            Welcome to the RXAI platform - your gateway to mastering AI technologies and integrating them into your professional workflow.
          </p>
          <p>
            We're excited to guide you through a personalized learning journey that will transform how you work and create with AI.
          </p>
        </div>
      ),
      image: '/images/welcome-onboarding.png',
    },
    {
      id: 'personalized-dashboard',
      title: 'Your Personalized Dashboard',
      description: (
        <div className="space-y-4">
          <p>
            Your dashboard is fully customizable with widgets that help you track your progress, access recent courses, and get personalized recommendations.
          </p>
          <p>
            You can add, remove, and rearrange widgets to create a dashboard that works best for you.
          </p>
        </div>
      ),
      image: '/images/dashboard-onboarding.png',
    },
    {
      id: 'courses-and-learning',
      title: 'Courses & Learning Paths',
      description: (
        <div className="space-y-4">
          <p>
            Explore our comprehensive library of AI courses, from beginner fundamentals to advanced specializations.
          </p>
          <p>
            Each course is designed with interactive elements, practical exercises, and real-world applications to ensure you gain applicable skills.
          </p>
        </div>
      ),
      image: '/images/courses-onboarding.png',
    },
    {
      id: 'ai-tools',
      title: 'AI Tools & Resources',
      description: (
        <div className="space-y-4">
          <p>
            Access a collection of cutting-edge AI tools designed to enhance your productivity and creativity.
          </p>
          <p>
            These tools integrate seamlessly with your learning journey, allowing you to apply new skills immediately.
          </p>
        </div>
      ),
      image: '/images/tools-onboarding.png',
    },
    {
      id: 'community',
      title: 'Join the Community',
      description: (
        <div className="space-y-4">
          <p>
            Connect with fellow learners, industry experts, and AI enthusiasts in our vibrant community.
          </p>
          <p>
            Participate in discussions, collaborate on projects, and stay updated on the latest trends and developments in AI.
          </p>
        </div>
      ),
      image: '/images/community-onboarding.png',
    },
    {
      id: 'ready',
      title: 'Ready to Begin Your Journey?',
      description: (
        <div className="space-y-4">
          <p>
            You're all set to start exploring RXAI and begin your AI learning journey.
          </p>
          <p>
            We recommend starting with the "AI Fundamentals" course to build a solid foundation, or dive right into the topics that interest you most.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <Button 
              className="w-full"
              onClick={() => {
                navigate('/courses/ai-fundamentals');
                handleComplete();
              }}
            >
              Start with AI Fundamentals
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                navigate('/courses');
                handleComplete();
              }}
            >
              Browse All Courses
            </Button>
          </div>
        </div>
      ),
      image: '/images/ready-onboarding.png',
    },
  ];
  
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  
  // Handle next step
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setAnimationDirection('right');
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setAnimationDirection('left');
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  // Handle complete
  const handleComplete = () => {
    completeFlow('welcome');
    toast({
      title: 'Welcome to RXAI!',
      description: 'Your onboarding is complete. Enjoy the platform!',
    });
    
    if (onComplete) {
      onComplete();
    }
  };
  
  // Handle skip
  const handleSkip = () => {
    toast({
      title: 'Onboarding skipped',
      description: 'You can access the onboarding guides later from your profile settings.',
    });
    
    if (onSkip) {
      onSkip();
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
            <CardDescription>
              Step {currentStepIndex + 1} of {steps.length}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Skip</span>
          </Button>
        </div>
        <Progress value={progress} className="h-1 mt-2" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <motion.div
            key={`text-${currentStep.id}`}
            initial={{ 
              opacity: 0, 
              x: animationDirection === 'right' ? 20 : -20 
            }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col justify-center"
          >
            <div className="text-muted-foreground">
              {currentStep.description}
            </div>
          </motion.div>
          
          {currentStep.image && (
            <motion.div
              key={`image-${currentStep.id}`}
              initial={{ 
                opacity: 0, 
                x: animationDirection === 'right' ? 20 : -20 
              }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex justify-center"
            >
              {/* Placeholder for image - would be an actual image in production */}
              <div className="bg-accent/50 rounded-lg h-64 w-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  [Illustration for {currentStep.title}]
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 flex justify-between">
        <Button
          variant="ghost"
          disabled={currentStepIndex === 0}
          onClick={handlePrevious}
        >
          Back
        </Button>
        <div className="flex items-center gap-1">
          {steps.map((step, index) => (
            <span
              key={step.id}
              className={`h-1.5 w-1.5 rounded-full ${
                index === currentStepIndex
                  ? 'bg-primary'
                  : index < currentStepIndex
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <Button
          onClick={handleNext}
          className="flex items-center"
        >
          {currentStepIndex === steps.length - 1 ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Complete
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1.5" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WelcomeOnboarding;