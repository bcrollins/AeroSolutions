import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics';
import { 
  Play, 
  Zap, 
  Star, 
  Users, 
  Award, 
  DollarSign, 
  Check, 
  ChevronRight, 
  Clock, 
  BarChart3,
  Share2,
  CalendarClock,
  Sparkles,
  Briefcase,
  Building,
  Calculator,
  Trophy,
  Lock
} from 'lucide-react';

// Lazy loaded components for better performance
const PersonalizedContent = lazy(() => import('@/components/PersonalizedContent'));
const ExitIntentPopup = lazy(() => import('@/components/ExitIntentPopup'));

// Quiz questions type
interface QuizQuestion {
  id: number;
  question: string;
  options: { id: string; text: string; points: number }[];
}

// Quiz questions
const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Do you have basic programming knowledge?",
    options: [
      { id: "q1-a", text: "Yes, I'm experienced with Python or another language", points: 10 },
      { id: "q1-b", text: "I know some programming basics", points: 7 },
      { id: "q1-c", text: "I've done some HTML/CSS but not much else", points: 4 },
      { id: "q1-d", text: "No programming experience at all", points: 1 }
    ]
  },
  {
    id: 2,
    question: "Are you interested in a career in AI?",
    options: [
      { id: "q2-a", text: "Yes, I'm planning to transition into AI full-time", points: 10 },
      { id: "q2-b", text: "I want to add AI skills to my current role", points: 8 },
      { id: "q2-c", text: "I'm exploring options and still deciding", points: 5 },
      { id: "q2-d", text: "I'm just curious about AI", points: 3 }
    ]
  },
  {
    id: 3,
    question: "How much time can you commit to learning each week?",
    options: [
      { id: "q3-a", text: "10+ hours per week", points: 10 },
      { id: "q3-b", text: "5-10 hours per week", points: 7 },
      { id: "q3-c", text: "2-5 hours per week", points: 4 },
      { id: "q3-d", text: "Less than 2 hours per week", points: 1 }
    ]
  },
  {
    id: 4,
    question: "Do you have experience with statistics or data analysis?",
    options: [
      { id: "q4-a", text: "Yes, advanced knowledge", points: 10 },
      { id: "q4-b", text: "Yes, intermediate knowledge", points: 7 },
      { id: "q4-c", text: "Some basic understanding", points: 4 },
      { id: "q4-d", text: "No experience", points: 1 }
    ]
  },
  {
    id: 5,
    question: "Have you used AI tools or platforms before?",
    options: [
      { id: "q5-a", text: "Yes, I've built or trained AI models", points: 10 },
      { id: "q5-b", text: "I've used AI tools like ChatGPT extensively", points: 7 },
      { id: "q5-c", text: "I've tried some AI tools casually", points: 4 },
      { id: "q5-d", text: "No experience with AI tools", points: 1 }
    ]
  }
];

// Results based on score
const getQuizResult = (score: number) => {
  if (score >= 40) {
    return {
      title: "Advanced Ready!",
      description: "You're well-prepared for our advanced AI courses. With your background, you'll be able to quickly grasp complex AI concepts and implement sophisticated models.",
      recommendation: "Consider starting with our 'Deep Learning Specialization' or 'Advanced NLP with Transformers'.",
      cta: "Enroll in Advanced Courses"
    };
  } else if (score >= 30) {
    return {
      title: "Intermediate Ready!",
      description: "You have a solid foundation to build upon. You're ready for our intermediate courses that will enhance your AI skills and knowledge.",
      recommendation: "We recommend starting with 'Machine Learning Foundations' or 'Python for AI Development'.",
      cta: "Explore Intermediate Courses"
    };
  } else if (score >= 20) {
    return {
      title: "Beginner Ready!",
      description: "You have the right attitude and some basic knowledge to start your AI journey. Our beginner courses will help you build a strong foundation.",
      recommendation: "Start with our 'Introduction to AI' and 'Programming Fundamentals for AI' courses.",
      cta: "Start with Beginner Courses"
    };
  } else {
    return {
      title: "Preparation Needed",
      description: "It looks like you might need some preparation before diving into our AI courses. Don't worry - we've got resources to help you get ready!",
      recommendation: "Try our free 'AI Readiness' prep course and 'Programming Basics' module first.",
      cta: "Get Prepared with Free Resources"
    };
  }
};

// Testimonial component
const Testimonial: React.FC<{
  name: string;
  role: string;
  text: string;
  imageUrl: string;
}> = ({ name, role, text, imageUrl }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-gray-100 shadow-sm">
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
      <p className="text-gray-600 italic">"{text}"</p>
    </div>
  );
};

// Career data for salary calculator
interface CareerData {
  role: string;
  salaryRange: {
    before: { min: number, max: number },
    after: { min: number, max: number }
  };
  demandGrowth: number; // Percentage growth YoY
  companies: string[];
}

const aiCareers: Record<string, CareerData> = {
  'data-scientist': {
    role: 'Data Scientist',
    salaryRange: {
      before: { min: 85000, max: 120000 },
      after: { min: 110000, max: 165000 }
    },
    demandGrowth: 32,
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple']
  },
  'ml-engineer': {
    role: 'Machine Learning Engineer',
    salaryRange: {
      before: { min: 95000, max: 140000 },
      after: { min: 125000, max: 185000 }
    },
    demandGrowth: 38,
    companies: ['Tesla', 'NVIDIA', 'OpenAI', 'IBM', 'Microsoft']
  },
  'ai-researcher': {
    role: 'AI Research Scientist',
    salaryRange: {
      before: { min: 110000, max: 160000 },
      after: { min: 140000, max: 210000 }
    },
    demandGrowth: 26,
    companies: ['DeepMind', 'Google Brain', 'OpenAI', 'Microsoft Research', 'Stanford AI Lab']
  },
  'ai-product-manager': {
    role: 'AI Product Manager',
    salaryRange: {
      before: { min: 90000, max: 135000 },
      after: { min: 115000, max: 170000 }
    },
    demandGrowth: 29,
    companies: ['Adobe', 'Salesforce', 'Amazon', 'Spotify', 'Netflix']
  },
  'computer-vision-engineer': {
    role: 'Computer Vision Engineer',
    salaryRange: {
      before: { min: 95000, max: 145000 },
      after: { min: 120000, max: 180000 }
    },
    demandGrowth: 31,
    companies: ['Meta', 'Waymo', 'Tesla', 'Cruise', 'Apple']
  }
};

// ROI Calculator data
const courseCost = 999; // Annual course subscription
const avgSalaryIncrease = 25000;
const avgTimeToPromotion = 9; // months
const jobPlacementRate = 0.87; // 87% placement rate

// Curriculum modules for preview
const curriculumModules = [
  {
    id: 'fundamentals',
    title: 'AI Fundamentals',
    lessons: [
      { id: 'intro', title: 'Introduction to AI', duration: '15 min', free: true },
      { id: 'history', title: 'History and Evolution of AI', duration: '25 min', free: true },
      { id: 'types', title: 'Types of AI Systems', duration: '30 min', free: true },
      { id: 'ethics', title: 'Ethical Considerations in AI', duration: '45 min', free: false },
      { id: 'future', title: 'The Future of AI', duration: '35 min', free: false },
    ]
  },
  {
    id: 'ml-basics',
    title: 'Machine Learning Basics',
    lessons: [
      { id: 'intro-ml', title: 'Introduction to Machine Learning', duration: '20 min', free: true },
      { id: 'supervised', title: 'Supervised Learning', duration: '40 min', free: false },
      { id: 'unsupervised', title: 'Unsupervised Learning', duration: '35 min', free: false },
      { id: 'reinforcement', title: 'Reinforcement Learning', duration: '45 min', free: false },
      { id: 'evaluation', title: 'Model Evaluation & Validation', duration: '50 min', free: false },
    ]
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning',
    lessons: [
      { id: 'intro-dl', title: 'Introduction to Neural Networks', duration: '30 min', free: false },
      { id: 'cnn', title: 'Convolutional Neural Networks', duration: '55 min', free: false },
      { id: 'rnn', title: 'Recurrent Neural Networks', duration: '50 min', free: false },
      { id: 'transformers', title: 'Transformers & Attention', duration: '60 min', free: false },
      { id: 'gans', title: 'Generative Adversarial Networks', duration: '45 min', free: false },
    ]
  }
];

// Pricing tiers
const pricingPlans = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    description: 'Sample our curriculum with limited access',
    features: [
      'Access to 5 beginner lessons',
      'Community forum read access',
      'AI basics eBook',
      'Course syllabus preview'
    ],
    popular: false,
    cta: 'Start Free Trial'
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 19,
    annualPrice: 190,
    description: 'Perfect for AI enthusiasts getting started',
    features: [
      'Access to all beginner courses',
      'Basic AI project templates',
      'Community forum access',
      'Monthly live Q&A sessions',
      'Course completion certificate'
    ],
    popular: false,
    cta: 'Get Started'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 49,
    annualPrice: 490,
    description: 'Comprehensive AI education for serious learners',
    features: [
      'Access to all courses and workshops',
      'Advanced project portfolio building',
      '1:1 mentoring session (monthly)',
      'Professional certification',
      'Career path guidance',
      'Job placement assistance'
    ],
    popular: true,
    cta: 'Go Professional'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    annualPrice: 1990,
    description: 'Complete solution for teams and companies',
    features: [
      'Everything in Professional plan',
      'Team-based learning paths',
      'Custom workshops for your company',
      'Dedicated account manager',
      'Private AI consulting (10hrs)',
      'Custom certification program',
      'Enterprise analytics dashboard'
    ],
    popular: false,
    cta: 'Contact Sales'
  }
];

// Social proof companies
const trustedCompanies = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'IBM', 'Apple', 'NVIDIA', 'Tesla', 'Salesforce', 'Adobe'
];

// Enrollment stats for live counter
const enrollmentStats = {
  totalStudents: 54289,
  activeToday: 3762,
  newThisWeek: 842,
  avgRating: 4.8,
  completionRate: 0.91
};

// Format for displaying large numbers with visual separator
const formatLargeNumber = (num: number): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// Expert endorsements
const expertEndorsements = [
  {
    name: 'Dr. Michael Chen',
    title: 'AI Research Director, Stanford University',
    quote: 'RXAI provides the most comprehensive AI curriculum I\'ve seen. Their teaching methodology bridges theory and practice exceptionally well.',
    image: 'https://placehold.co/150x150/2a2a2a/007bff?text=MC'
  },
  {
    name: 'Sarah Johnson, PhD',
    title: 'Chief AI Officer, TechVision Corp',
    quote: 'I\'ve hired multiple RXAI graduates and they consistently demonstrate superior practical knowledge compared to other candidates.',
    image: 'https://placehold.co/150x150/2a2a2a/007bff?text=SJ'
  },
  {
    name: 'James Wilson',
    title: 'Senior ML Engineer, NVIDIA',
    quote: 'The hands-on projects in RXAI\'s curriculum directly translate to real-world applications. This is what the industry needs.',
    image: 'https://placehold.co/150x150/2a2a2a/007bff?text=JW'
  }
];

// Course success metrics for before/after comparison
const successMetrics = [
  { 
    metric: 'Average Salary', 
    before: '$85,000', 
    after: '$110,000', 
    increase: '29%',
    icon: <DollarSign className="w-5 h-5 text-[#0066cc]" />
  },
  { 
    metric: 'Job Interviews', 
    before: '2-3 per month', 
    after: '8-10 per month', 
    increase: '300%',
    icon: <Briefcase className="w-5 h-5 text-[#0066cc]" />
  },
  { 
    metric: 'Project Portfolio', 
    before: '1-2 projects', 
    after: '10+ advanced projects', 
    increase: '500%',
    icon: <Award className="w-5 h-5 text-[#0066cc]" />
  },
  { 
    metric: 'Technical Skills', 
    before: 'Basic/Intermediate', 
    after: 'Advanced/Expert', 
    increase: '85%',
    icon: <BarChart3 className="w-5 h-5 text-[#0066cc]" />
  }
];

// Video testimonials
const videoTestimonials = [
  {
    id: 'video1',
    name: 'Jamie Cho',
    role: 'Senior Data Scientist at Acme Inc.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://placehold.co/400x225/f5f5f7/0066cc?text=Jamie+Cho+Video',
    quote: 'After completing the AI program, I received three job offers within two weeks.'
  },
  {
    id: 'video2',
    name: 'Robert Martinez',
    role: 'AI Engineer at TechCorp',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://placehold.co/400x225/2a2a2a/007bff?text=Robert+Martinez+Video',
    quote: 'The hands-on projects helped me build a portfolio that impressed employers.'
  },
  {
    id: 'video3',
    name: 'Lisa Johnson',
    role: 'ML Team Lead at InnovateTech',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://placehold.co/400x225/2a2a2a/007bff?text=Lisa+Johnson+Video',
    quote: 'I transitioned from a non-technical role to ML Team Lead within 9 months.'
  }
];

// Calculate time until next cohort start
const getTimeUntilNextCohort = () => {
  const now = new Date();
  const nextCohortStart = new Date();
  
  // Next cohort starts on the 1st of next month
  nextCohortStart.setMonth(nextCohortStart.getMonth() + 1);
  nextCohortStart.setDate(1);
  nextCohortStart.setHours(0, 0, 0, 0);
  
  const timeRemaining = nextCohortStart.getTime() - now.getTime();
  
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
};

const LearnAI: React.FC = () => {
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  
  // UI state
  const [showTestimonials, setShowTestimonials] = useState<boolean>(false);
  const [pageLoadTime] = useState<number>(Date.now());
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  const [showExitIntent, setShowExitIntent] = useState<boolean>(true);
  const [activePricingTab, setActivePricingTab] = useState<string>('monthly');
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [showVideoDialog, setShowVideoDialog] = useState<boolean>(false);
  const [countdownTime, setCountdownTime] = useState(getTimeUntilNextCohort());
  const [currentEnrollmentCount, setCurrentEnrollmentCount] = useState(enrollmentStats.totalStudents);
  const [activeCurriculumModule, setActiveCurriculumModule] = useState('fundamentals');
  
  // Salary calculator state
  const [selectedCareer, setSelectedCareer] = useState<string>('data-scientist');
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [location, setLocation] = useState<string>('us-average');
  const locationMultiplier = location === 'us-coast' ? 1.25 : location === 'us-midwest' ? 0.85 : 1;
  const currentCareer = aiCareers[selectedCareer];
  const calculatedSalaryBefore = Math.round((currentCareer.salaryRange.before.min + (currentCareer.salaryRange.before.max - currentCareer.salaryRange.before.min) * (Math.min(experienceYears, 10) / 10)) * locationMultiplier);
  const calculatedSalaryAfter = Math.round((currentCareer.salaryRange.after.min + (currentCareer.salaryRange.after.max - currentCareer.salaryRange.after.min) * (Math.min(experienceYears, 10) / 10)) * locationMultiplier);
  
  // ROI calculator state
  const [currentSalary, setCurrentSalary] = useState<number>(85000);
  const [careerGoals, setCareerGoals] = useState<string>('promotion');
  const roiMultiplier = careerGoals === 'promotion' ? 1.0 : careerGoals === 'new-career' ? 1.2 : 0.8;
  const calculatedRoi = Math.round((avgSalaryIncrease * roiMultiplier) / courseCost);
  const projectedSalaryIncrease = Math.round(avgSalaryIncrease * roiMultiplier);
  const projectedFirstYearReturn = projectedSalaryIncrease - courseCost;
  
  // Multi-step enrollment form state
  const [enrollmentStep, setEnrollmentStep] = useState<number>(1);
  const [enrollmentForm, setEnrollmentForm] = useState({
    name: '',
    email: '',
    goal: '',
    experience: '',
    referral: ''
  });
  
  // Interactive elements refs
  const aiDemoRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  
  // Chatbot state
  const [chatbotOpen, setChatbotOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'bot', text: string}>>([
    {type: 'bot', text: 'Hi there! 👋 I\'m your AI learning assistant. How can I help you today?'}
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  
  // Update countdown timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTime(getTimeUntilNextCohort());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Simulate enrollment counter updates for social proof
  useEffect(() => {
    // Randomly increment enrollment numbers periodically
    const interval = setInterval(() => {
      const randomIncrement = Math.floor(Math.random() * 3) + 1;
      setCurrentEnrollmentCount(prev => prev + randomIncrement);
    }, 45000); // Every 45 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle chatbot interactions
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatInput.trim()) return;
    
    // Add user message
    const userMessage = {type: 'user' as const, text: chatInput};
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Track chat engagement
    trackEvent('chatbot_message_sent', 'engagement', 'learn_ai_landing');
    
    // Simulate response generation
    setTimeout(() => {
      let botResponse = '';
      
      // Simple rule-based responses
      const lowerInput = chatInput.toLowerCase();
      
      if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('expensive')) {
        botResponse = 'Our courses start at just $19/month for the Basic plan. The Professional plan at $49/month offers the best value with mentorship and career assistance. Would you like to see the full pricing details?';
      } else if (lowerInput.includes('free') || lowerInput.includes('trial')) {
        botResponse = 'Yes! We offer a free trial that gives you access to 5 introductory lessons. You can sign up without a credit card and explore the basics of AI to see if our program is right for you.';
      } else if (lowerInput.includes('job') || lowerInput.includes('career') || lowerInput.includes('salary')) {
        botResponse = 'Our graduates see an average salary increase of $25,000 after completing our program. We also offer job placement assistance with our Professional plan, which has an 87% placement rate within 6 months of graduation.';
      } else if (lowerInput.includes('time') || lowerInput.includes('duration') || lowerInput.includes('long')) {
        botResponse = 'Most students complete our core curriculum in 3-6 months with 5-10 hours of study per week. However, you will have lifetime access to all course materials, so you can learn at your own pace.';
      } else if (lowerInput.includes('certificate') || lowerInput.includes('certification')) {
        botResponse = 'Yes, all paid plans include course completion certificates. Our Professional plan includes industry-recognized professional certification that employers value highly.';
      } else {
        botResponse = 'Thanks for your question! Our AI courses are designed to take you from beginner to professional with practical, hands-on training. Would you like to see our curriculum or discuss specific plans that might fit your goals?';
      }
      
      setChatMessages(prev => [...prev, {type: 'bot', text: botResponse}]);
    }, 1000);
  };
  
  // Handle enrollment form updates
  const updateEnrollmentForm = (field: string, value: string) => {
    setEnrollmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Proceed to next enrollment step
  const nextEnrollmentStep = () => {
    setEnrollmentStep(prev => prev + 1);
    trackEvent('enrollment_step_completed', 'conversion', `step_${enrollmentStep}`);
  };
  
  // Handle demo registration
  const handleQuickDemoSignup = (email: string) => {
    if (!email || !email.includes('@')) return;
    
    // Track conversion
    trackEvent('demo_registration', 'conversion', 'quick_signup');
    
    // Navigate to demo
    window.location.href = `/ai-courses/demo?email=${encodeURIComponent(email)}`;
  };
  
  // Scroll to section
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Track page view and engagement metrics
  useEffect(() => {
    // Track page view with custom dimensions
    trackEvent('page_view', 'pages', 'learn_ai_landing');
    
    // Track time spent on page when user leaves
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - pageLoadTime;
      trackEvent('time_on_page', 'engagement', 'learn_ai_landing', Math.floor(timeSpent / 1000));
    };
    
    // Track scroll depth
    const handleScroll = () => {
      if (!hasScrolled) {
        setHasScrolled(true);
        trackEvent('user_scrolled', 'engagement', 'learn_ai_landing');
      }
      
      // Calculate scroll depth as percentage
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      
      // Track at specific thresholds (25%, 50%, 75%, 100%)
      if (scrollPercentage >= 25 && scrollPercentage < 50) {
        trackEvent('scroll_depth_25', 'engagement', 'learn_ai_landing');
      } else if (scrollPercentage >= 50 && scrollPercentage < 75) {
        trackEvent('scroll_depth_50', 'engagement', 'learn_ai_landing');
      } else if (scrollPercentage >= 75 && scrollPercentage < 90) {
        trackEvent('scroll_depth_75', 'engagement', 'learn_ai_landing');
      } else if (scrollPercentage >= 90) {
        trackEvent('scroll_depth_100', 'engagement', 'learn_ai_landing');
      }
    };
    
    // Setup event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll);
    
    // Optimization: Preload critical images for better performance
    const preloadImages = () => {
      const imageUrls = [
        '/images/ai-learning-dashboard.webp',
        '/images/ai-course-hero.jpg'
      ];
      
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };
    
    // Run preload after a short delay to prioritize page render
    const preloadTimeout = setTimeout(preloadImages, 1000);
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(preloadTimeout);
    };
  }, [pageLoadTime, hasScrolled]);

  // Handle option selection
  const handleOptionSelect = (questionId: number, optionId: string, points: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
    
    // Update score
    const currentQuestionData = quizQuestions.find(q => q.id === questionId);
    if (currentQuestionData) {
      const previousOptionId = answers[questionId];
      let scoreChange = points;
      
      if (previousOptionId) {
        const previousOption = currentQuestionData.options.find(o => o.id === previousOptionId);
        if (previousOption) {
          scoreChange -= previousOption.points;
        }
      }
      
      setScore(prevScore => prevScore + scoreChange);
    }
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    setQuizCompleted(false);
  };

  // Calculate progress percentage
  const progressPercentage = (currentQuestion / quizQuestions.length) * 100;

  // Get current question data
  const currentQuestionData = quizQuestions[currentQuestion];

  // Get result based on score
  const result = getQuizResult(score);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Helmet>
        <title>Learn AI with RXAI - The World Leader in AI Education</title>
        <meta name="description" content="Start your AI learning journey with RXAI's comprehensive courses. From beginners to advanced practitioners, our expert-led curriculum will transform your career." />
        <meta property="og:title" content="Learn AI with RXAI" />
        <meta property="og:description" content="Master AI with our comprehensive courses. Join thousands of successful students." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rxai.com/learnai" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Learn AI with RXAI" />
        <meta name="twitter:description" content="Master AI with our comprehensive courses. Join thousands of successful students." />
        {/* Preload critical resources */}
        <link rel="preload" as="image" href="/images/ai-learning-dashboard.webp" />
        {/* Add structured data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "RXAI Comprehensive AI Course",
            "description": "Master artificial intelligence with our industry-leading curriculum",
            "provider": {
              "@type": "Organization",
              "name": "RXAI",
              "sameAs": "https://rxai.com"
            },
            "offers": {
              "@type": "Offer",
              "price": "49.00",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "2547"
            }
          })}
        </script>
      </Helmet>
      
      {/* Show exit intent popup - Enhancement #18: Exit-Intent Popup */}
      {showExitIntent && (
        <Suspense fallback={null}>
          <ExitIntentPopup 
            minTimeOnPage={15000} // Show after 15 seconds on page
            delay={300}
            cookieDuration={3} // Show again after 3 days
          />
        </Suspense>
      )}
      
      {/* Enhancement #12: Automated Chatbot Assistance */}
      <div className={`fixed bottom-5 right-5 z-50 transition-all ${chatbotOpen ? 'scale-100' : 'scale-0'}`}>
        <Card className="w-80 max-h-96 flex flex-col bg-white border border-gray-200 overflow-hidden shadow-md">
          <div className="bg-[#0066cc] p-3 flex justify-between items-center">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-white mr-2" />
              <h3 className="font-bold text-white">AI Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setChatbotOpen(false)}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 bg-gray-50">
            {chatMessages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg p-3 max-w-[85%] ${
                  message.type === 'user' 
                    ? 'bg-[#0066cc] text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="border-t border-gray-200 p-3 flex">
            <Input 
              type="text" 
              placeholder="Ask a question..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-white border border-gray-200 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] text-gray-800 rounded-md"
            />
            <Button type="submit" size="sm" className="ml-2 bg-[#0066cc] hover:bg-[#0055aa] transition-colors duration-200">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.20308 1.04312C1.00328 0.954998 0.772341 0.989939 0.601954 1.13468C0.431567 1.27942 0.341824 1.51485 0.364101 1.75111L0.997601 7.00111C1.01507 7.1897 1.11449 7.36175 1.26737 7.47371L8.20094 12.4435C8.36139 12.5634 8.57361 12.5982 8.76487 12.5367C8.95613 12.4752 9.10333 12.3244 9.15484 12.1332L9.84939 9.93616L13.9526 5.83255C14.2086 5.57653 14.2086 5.17026 13.9526 4.91424C13.6965 4.65821 13.2903 4.65821 13.0342 4.91424L9.3902 8.55832L7.27668 7.00111L13.1669 2.9511C13.3777 2.80513 13.4593 2.54176 13.3678 2.31127C13.2763 2.08078 13.0299 1.94559 12.7822 1.9881L1.28216 3.68918C1.03261 3.73168 0.843343 3.91259 0.800111 4.16324L0.0646143 7.94386C0.0210442 8.19658 0.137134 8.44699 0.356968 8.58695L1.26737 9.20042C1.48721 9.34038 1.76655 9.32375 1.96886 9.15479L5.99698 5.83253C6.253 5.57651 6.253 5.17024 5.99698 4.91421C5.74096 4.65819 5.33469 4.65819 5.07867 4.91421L1.65808 7.70979L1.34833 7.48349L1.89337 4.69293L12.0724 3.18138L6.95483 6.70017C6.72676 6.85906 6.60673 7.13452 6.64855 7.40957L7.56534 13.4098C7.6154 13.7397 7.91573 13.9754 8.25102 13.9754H8.35159C8.70971 13.9582 8.9991 13.6748 9.02276 13.3159L9.6381 9.67175L12.3703 7.0009C12.6263 6.74487 12.6263 6.33861 12.3703 6.08258C12.1142 5.82656 11.708 5.82656 11.4519 6.08258L8.93856 8.59587L8.52803 11.237L7.84718 7.00553L1.20308 1.04312Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </Button>
          </form>
        </Card>
      </div>
      
      {!chatbotOpen && (
        <Button 
          onClick={() => setChatbotOpen(true)}
          className="fixed bottom-5 right-5 z-50 rounded-full w-14 h-14 bg-[#007bff] hover:bg-blue-600 flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </Button>
      )}
      
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center">
          {/* Enhancement #1: Dynamic Hero Section */}
          <div className="w-full max-w-6xl mb-16">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="relative rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/50 z-10"></div>
              <div className="relative z-20 p-8 md:p-12 flex flex-col md:max-w-[60%]">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-6xl font-bold mb-4 text-gray-900"
                >
                  Master AI and <span className="text-[#007bff]">Transform Your Future</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg md:text-xl mb-6 text-gray-700"
                >
                  Join {currentEnrollmentCount.toLocaleString()}+ students mastering AI through hands-on projects, 
                  expert mentorship, and a curriculum built by industry leaders.
                </motion.p>
                
                {/* Enhancement #5: Countdown Timer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6 inline-block shadow-sm"
                >
                  <p className="text-sm text-[#007bff] font-medium mb-2">Next cohort starts in:</p>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{countdownTime.days}</div>
                      <div className="text-xs text-gray-600">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{countdownTime.hours}</div>
                      <div className="text-xs text-gray-600">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{countdownTime.minutes}</div>
                      <div className="text-xs text-gray-600">Mins</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Enhancement #15: One-Click Demo Registration */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex-1">
                    <Input 
                      type="email" 
                      placeholder="Enter your email"
                      id="quick-demo-email"
                      className="bg-white border border-gray-200 focus:ring-[#007bff] focus:border-[#007bff] text-gray-900 h-12 shadow-sm"
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      const email = (document.getElementById('quick-demo-email') as HTMLInputElement).value;
                      handleQuickDemoSignup(email);
                    }}
                    className="bg-[#007bff] hover:bg-blue-600 h-12 px-6 text-base text-white shadow-sm"
                  >
                    <Play className="w-4 h-4 mr-2" /> Start AI Training Free
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mt-4 text-sm text-gray-400"
                >
                  No credit card required. Get instant access to 5 free lessons.
                </motion.div>
              </div>
              
              {/* Enhancement #1: Dynamic Interactive AI Demo */}
              <div 
                ref={aiDemoRef}
                className="absolute right-0 bottom-0 top-0 w-full md:w-[45%] bg-white rounded-l-xl hidden md:block shadow-md border border-gray-200"
              >
                <div className="h-full flex flex-col justify-center items-center p-6 relative">
                  <div className="bg-gray-50 rounded-lg p-4 w-full max-w-sm mx-auto shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#007bff] flex items-center justify-center mr-3">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">RXAI Image Classifier</h3>
                    </div>
                    <div className="bg-white rounded-lg p-4 mb-4 h-48 flex items-center justify-center border border-gray-200">
                      <div className="text-center">
                        <p className="text-gray-600 mb-2">Try our live AI demo</p>
                        <Button 
                          variant="outline" 
                          className="border-[#007bff] text-[#007bff] hover:bg-[#007bff] hover:text-white"
                          onClick={() => window.location.href = '/ai-courses/demo'}
                        >
                          Test AI Model Now
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-[#333] h-3 w-full rounded-full overflow-hidden">
                        <div className="bg-[#007bff] h-full w-[75%]"></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Building your skills</span>
                        <span>75%</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-1 top-6 bottom-6 w-2 bg-[#007bff] rounded-l-full"></div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Enhancement #10: Live Enrollment Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-6xl mb-16"
          >
            <div className="bg-white rounded-lg p-6 flex flex-wrap justify-around shadow-sm border border-gray-200">
              <div className="text-center px-5 py-3">
                <div className="text-3xl font-bold text-[#0066cc] drop-shadow-sm tracking-tight">
                  <span className="tabular-nums">{formatLargeNumber(currentEnrollmentCount)}</span>
                </div>
                <div className="text-sm font-medium text-gray-700 mt-1">Total Students</div>
              </div>
              <div className="text-center px-5 py-3">
                <div className="text-3xl font-bold text-[#0066cc] drop-shadow-sm tracking-tight">
                  <span className="tabular-nums">{formatLargeNumber(enrollmentStats.activeToday)}</span>
                </div>
                <div className="text-sm font-medium text-gray-700 mt-1">Learning Today</div>
              </div>
              <div className="text-center px-5 py-3">
                <div className="text-3xl font-bold text-[#0066cc] drop-shadow-sm tracking-tight">
                  <span className="tabular-nums">{enrollmentStats.avgRating}</span>
                </div>
                <div className="text-sm font-medium text-gray-700 mt-1">Student Rating</div>
              </div>
              <div className="text-center px-5 py-3">
                <div className="text-3xl font-bold text-[#0066cc] drop-shadow-sm tracking-tight">
                  <span className="tabular-nums">{Math.round(enrollmentStats.completionRate * 100)}%</span>
                </div>
                <div className="text-sm font-medium text-gray-700 mt-1">Completion Rate</div>
              </div>
            </div>
          </motion.div>
          
          {/* Enhancement #3: Social Proof Wall */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full max-w-6xl mb-16"
          >
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Trusted by Industry Leaders</h2>
            <p className="text-center text-gray-600 mb-8">Our graduates work at top technology companies worldwide</p>
            
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {trustedCompanies.map((company, index) => (
                <div key={index} className="text-gray-700 text-lg font-semibold">{company}</div>
              ))}
            </div>
          </motion.div>
          
          {/* Enhancement #19: Before/After Skills Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full max-w-6xl mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Your Transformation with RXAI</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {successMetrics.map((metric, index) => (
                <Card key={index} className="bg-[#2a2a2a] border-none overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#007bff]/20 flex items-center justify-center mr-3">
                        {metric.icon}
                      </div>
                      <h3 className="font-semibold">{metric.metric}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#333] p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Before</div>
                        <div className="text-lg font-semibold">{metric.before}</div>
                      </div>
                      <div className="bg-[#007bff]/20 p-3 rounded-lg">
                        <div className="text-sm text-[#007bff] mb-1">After</div>
                        <div className="text-lg font-semibold">{metric.after}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <span className="inline-block bg-[#007bff]/20 text-[#007bff] px-2 py-1 rounded-full text-sm">
                        +{metric.increase}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
          
          {/* Enhancement #4: AI Career Salary Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full max-w-6xl mb-16"
          >
            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <Calculator className="w-6 h-6 text-[#0066cc] mr-2" />
                  <h2 className="text-2xl font-bold text-gray-800">AI Career Salary Calculator</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block text-gray-700 font-medium">Select AI Career Path</Label>
                      <select 
                        value={selectedCareer}
                        onChange={(e) => setSelectedCareer(e.target.value)}
                        className="w-full bg-white text-gray-800 border-gray-200 rounded-md px-3 py-2 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] shadow-sm"
                      >
                        {Object.keys(aiCareers).map((career) => (
                          <option key={career} value={career}>
                            {aiCareers[career].role}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block text-gray-700 font-medium">Years of Experience</Label>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={experienceYears} 
                        onChange={(e) => setExperienceYears(parseInt(e.target.value))}
                        className="w-full accent-[#0066cc]"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Entry Level</span>
                        <span className="font-medium">{experienceYears} Years</span>
                        <span>Senior</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block text-gray-700 font-medium">Location</Label>
                      <select 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-white text-gray-800 border-gray-200 rounded-md px-3 py-2 focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] shadow-sm"
                      >
                        <option value="us-average">US Average</option>
                        <option value="us-coast">US Coastal Cities</option>
                        <option value="us-midwest">US Midwest</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="mb-6">
                      <div className="text-sm text-gray-500 mb-1">Selected Career Path</div>
                      <h3 className="text-xl font-semibold text-[#0066cc]">{currentCareer.role}</h3>
                      <div className="text-sm text-gray-600 mt-2">Top Companies: {currentCareer.companies.join(', ')}</div>
                      <div className="text-sm text-gray-600">Year-over-Year Demand Growth: <span className="text-green-600 font-medium">+{currentCareer.demandGrowth}%</span></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Current Average Salary</div>
                        <div className="text-3xl font-bold text-gray-800 tracking-tight">
                          <span className="tabular-nums">${formatLargeNumber(calculatedSalaryBefore)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[#0066cc] mb-2">Expected Salary After RXAI</div>
                        <div className="text-3xl font-bold text-[#0066cc] tracking-tight drop-shadow-sm">
                          <span className="tabular-nums">${formatLargeNumber(calculatedSalaryAfter)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-sm text-gray-700 font-medium mb-2">Potential Salary Increase</div>
                        <div className="text-2xl font-bold text-green-600 tracking-tight">
                          <span className="tabular-nums">+${formatLargeNumber(calculatedSalaryAfter - calculatedSalaryBefore)}</span> per year
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          That's a <span className="font-medium">{Math.round((calculatedSalaryAfter - calculatedSalaryBefore) / calculatedSalaryBefore * 100)}%</span> increase!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button 
                    onClick={() => window.location.href = '/ai-courses/catalog'}
                    className="bg-[#0066cc] hover:bg-blue-700 shadow-sm text-base font-medium px-6 py-2"
                  >
                    Start Your Career Transformation
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Enhancement #2: Tiered Pricing Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="w-full max-w-6xl mb-16"
            ref={pricingRef}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Choose the plan that fits your learning goals. All plans include lifetime access to course materials.
              </p>
              
              <div className="flex justify-center mt-6">
                <div className="bg-[#2a2a2a] p-1 rounded-full inline-flex">
                  <Button 
                    variant={activePricingTab === 'monthly' ? 'default' : 'ghost'}
                    className={activePricingTab === 'monthly' ? 'bg-[#007bff] text-white' : 'text-gray-400'}
                    onClick={() => setActivePricingTab('monthly')}
                  >
                    Monthly
                  </Button>
                  <Button 
                    variant={activePricingTab === 'annual' ? 'default' : 'ghost'}
                    className={activePricingTab === 'annual' ? 'bg-[#007bff] text-white' : 'text-gray-400'}
                    onClick={() => setActivePricingTab('annual')}
                  >
                    Annual <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">SAVE 20%</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className="relative">
                  {plan.popular && (
                    <div className="absolute -top-4 inset-x-0 flex justify-center">
                      <span className="bg-[#007bff] text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <Card className={`h-full flex flex-col ${plan.popular ? 'border-[#007bff]/50 shadow-lg shadow-[#007bff]/10' : 'border-[#444]'} bg-[#2a2a2a]`}>
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                      <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                      
                      <div className="mb-6">
                        <div className="text-3xl font-bold">
                          ${activePricingTab === 'monthly' ? plan.price : plan.annualPrice ? Math.round(plan.annualPrice / 12) : 0}
                          <span className="text-sm font-normal text-gray-400">/mo</span>
                        </div>
                        {activePricingTab === 'annual' && plan.annualPrice && (
                          <div className="text-sm text-gray-400">
                            ${plan.annualPrice} billed annually
                          </div>
                        )}
                      </div>
                      
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="w-5 h-5 text-[#007bff] mr-2 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-6 pt-0">
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-[#007bff] hover:bg-blue-600' : 'bg-[#444] hover:bg-[#555]'}`}
                        onClick={() => window.location.href = `/subscriptions/checkout?plan=${plan.id}&billing=${activePricingTab}`}
                      >
                        {plan.cta}
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-400">
              Need a custom plan for your organization? <a href="/enterprise" className="text-[#007bff] hover:underline">Contact our enterprise team</a>.
            </div>
          </motion.div>
          
          {/* Enhancement #8: Course Curriculum Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full max-w-6xl mb-16"
            ref={curriculumRef}
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Preview Our Curriculum</h2>
            
            <Tabs defaultValue="fundamentals">
              <TabsList className="w-full justify-center mb-8">
                {curriculumModules.map(module => (
                  <TabsTrigger 
                    key={module.id} 
                    value={module.id}
                    onClick={() => setActiveCurriculumModule(module.id)}
                  >
                    {module.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {curriculumModules.map(module => (
                <TabsContent key={module.id} value={module.id} className="mt-0">
                  <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-4 text-gray-800">{module.title}</h3>
                      
                      <ul className="space-y-3">
                        {module.lessons.map(lesson => (
                          <li key={lesson.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start">
                                <div className={`mr-3 px-2 py-1 text-xs rounded font-medium ${lesson.free ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-[#0066cc]'}`}>
                                  {lesson.free ? 'FREE' : 'PREMIUM'}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-800">{lesson.title}</h4>
                                  <p className="text-sm text-gray-500 mt-1">{lesson.duration}</p>
                                </div>
                              </div>
                              
                              {lesson.free ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-[#0066cc] hover:bg-blue-50 border border-transparent hover:border-blue-100 font-medium"
                                  onClick={() => window.location.href = `/ai-courses/preview/${module.id}/${lesson.id}`}
                                >
                                  <Play className="w-4 h-4 mr-1" /> Watch Free
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-transparent hover:border-gray-200 font-medium"
                                  onClick={() => window.location.href = '/subscriptions'}
                                >
                                  <Lock className="w-4 h-4 mr-1" /> Unlock
                                </Button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-6 text-center">
                        <Button 
                          className="bg-[#0066cc] hover:bg-blue-700 shadow-sm font-medium px-6 py-2"
                          onClick={() => window.location.href = `/ai-courses/module/${module.id}`}
                        >
                          View Full Curriculum
                        </Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
          
          {/* Enhancement #7: Video Testimonial Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="w-full max-w-6xl mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Student Success Stories</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videoTestimonials.map((video, index) => (
                <Card key={video.id} className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                  <div 
                    className="relative cursor-pointer group" 
                    onClick={() => {
                      setSelectedVideoIndex(index);
                      setShowVideoDialog(true);
                    }}
                  >
                    <img 
                      src={video.thumbnailUrl} 
                      alt={`Testimonial by ${video.name}`} 
                      className="w-full h-48 object-cover rounded-t-md"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-[#0066cc]/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{video.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{video.role}</p>
                    <p className="text-sm italic text-gray-700 leading-relaxed">"{video.quote}"</p>
                  </div>
                </Card>
              ))}
            </div>
            
            <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
              <DialogContent className="bg-white border-gray-200 max-w-3xl shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-gray-800 font-semibold">
                    {videoTestimonials[selectedVideoIndex]?.name} - Success Story
                  </DialogTitle>
                </DialogHeader>
                
                <div className="aspect-video">
                  <iframe 
                    src={videoTestimonials[selectedVideoIndex]?.videoUrl} 
                    className="w-full h-full rounded-md"
                    title={`Testimonial by ${videoTestimonials[selectedVideoIndex]?.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
          
          {/* Enhancement #9: Expert Endorsements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="w-full max-w-6xl mb-16"
          >
            <h2 className="text-2xl font-semibold mb-8 text-center tracking-tight text-gray-800">Endorsed by Industry Experts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {expertEndorsements.map((expert, index) => (
                <Card key={index} className="bg-white border border-gray-200 shadow-sm overflow-hidden hover:border-gray-300 transition-colors duration-300">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border border-gray-200 shadow-sm">
                        <img 
                          src={expert.image} 
                          alt={expert.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{expert.name}</h3>
                        <p className="text-sm text-gray-500">{expert.title}</p>
                      </div>
                    </div>
                    
                    <p className="italic text-gray-700 leading-relaxed">"{expert.quote}"</p>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
          
          {/* Enhancement #22: ROI Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="w-full max-w-6xl mb-16"
          >
            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <DollarSign className="w-6 h-6 text-[#0066cc] mr-2" />
                  <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">Calculate Your ROI</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-2 block text-gray-700 font-medium">Your Current Annual Salary</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input 
                          type="number" 
                          value={currentSalary}
                          onChange={(e) => setCurrentSalary(Math.max(0, parseInt(e.target.value) || 0))}
                          className="pl-7 bg-white text-gray-800 border-gray-300 focus:border-[#0066cc] focus:ring-[#0066cc]/20 rounded-md shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block text-gray-700 font-medium">Your Career Goals</Label>
                      <select 
                        value={careerGoals}
                        onChange={(e) => setCareerGoals(e.target.value)}
                        className="w-full bg-white text-gray-800 border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-[#0066cc] focus:ring-[#0066cc]/20 transition-colors duration-200"
                      >
                        <option value="promotion">Promotion in Current Role</option>
                        <option value="new-career">Complete Career Change</option>
                        <option value="freelance">Freelance/Consulting Work</option>
                      </select>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-2">Your Investment</h3>
                      <div className="flex justify-between text-gray-700">
                        <span>RXAI Professional Plan</span>
                        <span className="font-medium">${courseCost}/year</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        One-time investment giving you lifetime access to course materials and 1 year of community access.
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-semibold mb-6 text-center text-gray-800">Your Return on Investment</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-gray-700">
                        <span>Average Salary Increase</span>
                        <span className="text-xl font-bold text-green-600">+${projectedSalaryIncrease.toLocaleString()}/year</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-gray-700">
                        <span>Typical Time to Achievement</span>
                        <span className="font-semibold">{avgTimeToPromotion} months</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-gray-700">
                        <span>Job Placement Rate</span>
                        <span className="font-semibold">{Math.round(jobPlacementRate * 100)}%</span>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-gray-700">
                          <span>First Year Return</span>
                          <span className="text-xl font-bold text-green-600">+${projectedFirstYearReturn.toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          After subtracting the course cost
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200 text-center">
                        <div className="text-3xl font-bold text-[#0066cc] mb-2">{calculatedRoi}x ROI</div>
                        <div className="text-sm text-gray-600">
                          For every $1 you invest, you get approximately ${calculatedRoi} back
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button 
                    onClick={() => window.location.href = '/subscriptions'}
                    className="bg-[#0066cc] hover:bg-blue-700 px-8 py-2.5 shadow-sm font-medium text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                  >
                    Invest in Your Future
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Enhancement #20: AI Job Market Trend Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="w-full max-w-6xl mb-16"
          >
            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 tracking-tight">AI Job Market Insights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-center mb-4">
                      <Briefcase className="w-8 h-8 text-[#0066cc]" />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-2 text-gray-800 tabular-nums tracking-tight">35%</h3>
                    <p className="text-center text-gray-600">
                      Increase in AI job postings in the last year
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-center mb-4">
                      <DollarSign className="w-8 h-8 text-[#0066cc]" />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-2 text-gray-800 tabular-nums tracking-tight">$138,500</h3>
                    <p className="text-center text-gray-600">
                      Average salary for AI professionals
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-center mb-4">
                      <Building className="w-8 h-8 text-[#0066cc]" />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-2 text-gray-800 tabular-nums tracking-tight">79%</h3>
                    <p className="text-center text-gray-600">
                      Of companies plan to increase AI hiring
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 text-center text-gray-600">
                  <p className="text-sm">AI skills are among the most in-demand in today's job market, with growth projected to continue accelerating over the next decade.</p>
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Enhancement #21: Employer Recognition Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="w-full max-w-6xl mb-16"
          >
            <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800 tracking-tight">Recognized by Leading Employers</h2>
            
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">RXAI Certification is Industry-Recognized</h3>
                  <p className="text-gray-600 mb-6">
                    Our certification is recognized by leading technology companies worldwide as a mark of excellence
                    in AI education. Graduates of our programs are actively sought out by hiring managers at top companies.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Trophy className="w-5 h-5 text-[#0066cc] mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Preferred Hiring Status</h4>
                        <p className="text-sm text-gray-600">
                          RXAI graduates receive preferred hiring status at over 120 partner companies.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Star className="w-5 h-5 text-[#0066cc] mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800">87% Placement Rate</h4>
                        <p className="text-sm text-gray-600">
                          87% of our graduates find relevant employment within 6 months of program completion.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-[#0066cc] mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Alumni Network</h4>
                        <p className="text-sm text-gray-600">
                          Access to our 50,000+ alumni network for job referrals and career opportunities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">What Employers Say</h3>
                  
                  <div className="space-y-4">
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <div className="p-4">
                        <p className="text-sm italic text-gray-700 mb-3">"RXAI graduates consistently demonstrate strong practical skills and theoretical knowledge. They're able to contribute immediately to our AI projects."</p>
                        <div className="flex items-center">
                          <div className="text-sm">
                            <div className="font-semibold text-gray-900">Mark Johnson</div>
                            <div className="text-gray-500">AI Hiring Manager, Google</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <div className="p-4">
                        <p className="text-sm italic text-gray-700 mb-3">"The quality of RXAI's curriculum is evident in their graduates. They have a deep understanding of real-world AI applications that sets them apart."</p>
                        <div className="flex items-center">
                          <div className="text-sm">
                            <div className="font-semibold text-gray-900">Sarah Chen</div>
                            <div className="text-gray-500">Technical Recruiter, Microsoft</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Enhancement #6: Personalized Learning Path Quiz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-lg p-6 md:p-8 mb-16 border border-gray-200 shadow-sm"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">Is this course for you?</h2>
            <p className="text-center mb-8 text-gray-600">
              Take our quick readiness quiz to see if you're prepared for our AI courses and get personalized recommendations.
            </p>
            
            {!quizCompleted ? (
              <Card className="bg-white border border-gray-200 shadow-sm p-6">
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1 text-gray-700">
                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    <span>{Math.round(progressPercentage)}% Complete</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-gray-100" />
                </div>
                
                <h3 className="text-xl font-medium mb-6 text-gray-800">{currentQuestionData.question}</h3>
                
                <RadioGroup 
                  value={answers[currentQuestionData.id] || ""} 
                  onValueChange={(value) => {
                    const option = currentQuestionData.options.find(o => o.id === value);
                    if (option) {
                      handleOptionSelect(currentQuestionData.id, value, option.points);
                    }
                  }}
                  className="space-y-4 mb-8"
                >
                  {currentQuestionData.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-100 transition-colors border border-gray-200">
                      <RadioGroupItem value={option.id} id={option.id} className="text-[#0066cc]" />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer text-gray-700">{option.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={handleNextQuestion}
                    disabled={!answers[currentQuestionData.id]}
                    className="bg-[#0066cc] hover:bg-[#004c99] text-white shadow-sm"
                  >
                    {currentQuestion === quizQuestions.length - 1 ? "See Results" : "Next"}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-white border border-gray-200 shadow-sm p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#0066cc]">{result.title}</h3>
                  <div className="flex justify-center my-4">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-full shadow-inner">
                      <span className="text-2xl font-bold text-gray-900 tabular-nums">{score}/{quizQuestions.length * 10}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{result.description}</p>
                  <p className="font-medium text-gray-800 mb-6">{result.recommendation}</p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      className="bg-[#0066cc] hover:bg-[#004c99] text-white shadow-sm"
                      onClick={() => window.location.href = '/ai-courses/catalog'}
                    >
                      {result.cta}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleResetQuiz}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Retake Quiz
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
          
          {/* Enhancement #23: Course Community Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="w-full max-w-6xl mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Join a Thriving Community</h2>
            
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Connect with 50,000+ AI Learners</h3>
                  <p className="text-gray-600 mb-6">
                    Learning is better together. Join our active community of AI practitioners, from beginners to experts,
                    all working together to master artificial intelligence.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 flex items-center justify-center mr-3 shadow-sm border border-gray-100">
                        <Users className="w-5 h-5 text-[#0066cc]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Peer Learning Groups</h4>
                        <p className="text-sm text-gray-500">Connect with peers at your skill level for collaborative learning</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 flex items-center justify-center mr-3 shadow-sm border border-gray-100">
                        <CalendarClock className="w-5 h-5 text-[#0066cc]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Weekly Live Events</h4>
                        <p className="text-sm text-gray-500">Attend workshops, Q&A sessions, and expert talks each week</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 flex items-center justify-center mr-3 shadow-sm border border-gray-100">
                        <Share2 className="w-5 h-5 text-[#0066cc]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Project Showcases</h4>
                        <p className="text-sm text-gray-500">Share your work and get feedback from the community</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-[#0066cc] hover:bg-[#004c99] text-white shadow-sm w-full"
                    onClick={() => window.location.href = '/community'}
                  >
                    Preview Community
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-6 flex flex-col border-l border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Community Discussions</h3>
                  
                  <div className="space-y-4 flex-1">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-gray-800">Best approach for fine-tuning LLMs?</div>
                        <div className="text-xs text-gray-500">2h ago</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">What's your preferred approach for fine-tuning large language models with limited data?</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#0066cc] font-medium">24 replies</span>
                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Advanced ML Module</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-gray-800">Project collaboration: Vision transformer</div>
                        <div className="text-xs text-gray-500">6h ago</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Looking for 2-3 people to collaborate on an image classification project using ViT.</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#0066cc] font-medium">9 replies</span>
                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Project Collaboration</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-gray-800">Weekly challenge: Sentiment analysis</div>
                        <div className="text-xs text-gray-500">1d ago</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">This week's coding challenge is to build a sentiment analysis model with over 90% accuracy.</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#0066cc] font-medium">32 submissions</span>
                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Weekly Challenges</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                    Full community access available with paid subscriptions
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Enhancement #17: Multi-step Enrollment Process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="w-full max-w-6xl mb-16"
          >
            <Card className="bg-[#2a2a2a] border-[#444] overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Start Your AI Journey Today</h2>
                
                <div className="max-w-xl mx-auto">
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      {[1, 2, 3].map(step => (
                        <div key={step} className="flex flex-col items-center">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                              enrollmentStep === step 
                                ? 'bg-[#007bff] text-white' 
                                : enrollmentStep > step 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-[#333] text-gray-400'
                            }`}
                          >
                            {enrollmentStep > step ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              step
                            )}
                          </div>
                          <div className="text-sm text-center">
                            {step === 1 ? 'Your Info' : step === 2 ? 'Goals' : 'Get Started'}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="relative h-1 bg-[#333] rounded-full mt-2">
                      <div 
                        className="absolute h-full bg-[#007bff] rounded-full transition-all"
                        style={{ width: `${((enrollmentStep - 1) / 2) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {enrollmentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold mb-4">Tell us about yourself</h3>
                      
                      <div>
                        <Label htmlFor="enrollment-name">Your Name</Label>
                        <Input 
                          id="enrollment-name"
                          value={enrollmentForm.name}
                          onChange={(e) => updateEnrollmentForm('name', e.target.value)}
                          className="bg-white text-gray-800 border-gray-200 focus:border-[#007bff] focus:ring-[#007bff]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="enrollment-email">Your Email</Label>
                        <Input 
                          id="enrollment-email"
                          type="email"
                          value={enrollmentForm.email}
                          onChange={(e) => updateEnrollmentForm('email', e.target.value)}
                          className="bg-white text-gray-800 border-gray-200 focus:border-[#007bff] focus:ring-[#007bff]"
                        />
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Button 
                          onClick={nextEnrollmentStep}
                          disabled={!enrollmentForm.name || !enrollmentForm.email}
                          className="bg-[#007bff] hover:bg-blue-600"
                        >
                          Continue <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {enrollmentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold mb-4">What are your goals?</h3>
                      
                      <div>
                        <Label htmlFor="enrollment-goal">Primary Goal</Label>
                        <select 
                          id="enrollment-goal"
                          value={enrollmentForm.goal}
                          onChange={(e) => updateEnrollmentForm('goal', e.target.value)}
                          className="w-full bg-white text-gray-800 border-gray-200 rounded-md px-3 py-2 focus:border-[#007bff] focus:ring-[#007bff]"
                        >
                          <option value="">Select your primary goal</option>
                          <option value="career-change">Career Change into AI</option>
                          <option value="skill-improvement">Improve Current Skills</option>
                          <option value="salary-increase">Increase Salary</option>
                          <option value="business">Apply AI to My Business</option>
                          <option value="hobby">Personal Interest/Hobby</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="enrollment-experience">Your Experience Level</Label>
                        <select 
                          id="enrollment-experience"
                          value={enrollmentForm.experience}
                          onChange={(e) => updateEnrollmentForm('experience', e.target.value)}
                          className="w-full bg-white text-gray-800 border-gray-200 rounded-md px-3 py-2 focus:border-[#007bff] focus:ring-[#007bff]"
                        >
                          <option value="">Select your experience level</option>
                          <option value="beginner">Beginner (No Programming Experience)</option>
                          <option value="intermediate">Intermediate (Some Programming)</option>
                          <option value="advanced">Advanced (Experienced Developer)</option>
                        </select>
                      </div>
                      
                      <div className="pt-4 flex justify-between">
                        <Button 
                          variant="outline"
                          onClick={() => setEnrollmentStep(1)}
                        >
                          Back
                        </Button>
                        
                        <Button 
                          onClick={nextEnrollmentStep}
                          disabled={!enrollmentForm.goal || !enrollmentForm.experience}
                          className="bg-[#007bff] hover:bg-blue-600"
                        >
                          Continue <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {enrollmentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold mb-4">You're all set!</h3>
                      
                      <Card className="bg-[#333] border-none p-6">
                        <div className="space-y-4">
                          <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Check className="w-8 h-8 text-green-500" />
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <h4 className="text-lg font-semibold mb-2">Personalized Learning Plan Ready</h4>
                            <p className="text-gray-400 mb-4">
                              Based on your goals and experience, we've created a customized learning path for you.
                            </p>
                          </div>
                          
                          <div className="bg-[#2a2a2a] p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Star className="w-4 h-4 text-[#007bff] mr-2" />
                              <span className="font-medium">Recommended Path:</span>
                            </div>
                            <div className="pl-6">
                              {enrollmentForm.experience === 'beginner' ? (
                                <span>AI Foundations → Python for AI → Machine Learning Essentials</span>
                              ) : enrollmentForm.experience === 'intermediate' ? (
                                <span>Intermediate ML → Advanced Neural Networks → Specialization</span>
                              ) : (
                                <span>Advanced ML Engineering → Deep Learning → AI Research Methods</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                      
                      <div className="flex flex-col gap-3">
                        <Button 
                          onClick={() => window.location.href = `/ai-courses/plan?goal=${enrollmentForm.goal}&experience=${enrollmentForm.experience}`}
                          className="bg-[#007bff] hover:bg-blue-600"
                        >
                          View My Learning Plan
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => setEnrollmentStep(1)}
                        >
                          Start Over
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Enhancement #24: AI Certification Path */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
            className="w-full max-w-6xl mb-16"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Your Path to AI Certification</h2>
            
            <Card className="bg-[#2a2a2a] border-[#444] overflow-hidden">
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Industry-Recognized Certification</h3>
                    <p className="text-gray-400 mb-6">
                      Our certification program is designed to verify your AI expertise to potential employers
                      and demonstrate your ability to apply AI concepts in real-world scenarios.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-[#007bff]/20 flex items-center justify-center mr-3 mt-1">
                          <span className="text-[#007bff] font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Complete Core Curriculum</h4>
                          <p className="text-sm text-gray-400">Master the essential AI concepts and techniques</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-[#007bff]/20 flex items-center justify-center mr-3 mt-1">
                          <span className="text-[#007bff] font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Build Practical Projects</h4>
                          <p className="text-sm text-gray-400">Apply your knowledge by creating real-world AI projects</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-[#007bff]/20 flex items-center justify-center mr-3 mt-1">
                          <span className="text-[#007bff] font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Pass Certification Exam</h4>
                          <p className="text-sm text-gray-400">Demonstrate your expertise through a rigorous evaluation</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-[#007bff]/20 flex items-center justify-center mr-3 mt-1">
                          <span className="text-[#007bff] font-bold">4</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Showcase Digital Certificate</h4>
                          <p className="text-sm text-gray-400">Add your verified credential to LinkedIn and your resume</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="bg-[#007bff] hover:bg-blue-600 w-full"
                      onClick={() => window.location.href = '/certification'}
                    >
                      Learn More About Certification
                    </Button>
                  </div>
                  
                  <div className="bg-[#333] p-6 rounded-lg">
                    <div className="flex justify-center mb-6">
                      <div className="w-32 h-32 rounded-full bg-[#2a2a2a] flex items-center justify-center border-4 border-[#007bff]">
                        <Award className="w-16 h-16 text-[#007bff]" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-center mb-4">RXAI Professional Certification</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span>Recognition:</span>
                        <span className="font-medium">Industry-wide</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">3-6 months</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Projects Required:</span>
                        <span className="font-medium">5 practical projects</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-medium">92% with our curriculum</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#2a2a2a] p-4 rounded-lg text-center">
                      <div className="text-sm text-gray-400 mb-1">Included with:</div>
                      <div className="font-semibold">Professional & Enterprise Plans</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Enhancement #25: Streamlined Checkout Flow */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.7 }}
            className="bg-[#2a2a2a] rounded-lg p-8 text-center mb-16"
          >
            <h2 className="text-2xl font-bold mb-6">Ready to Transform Your Career?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join over 50,000 students who have mastered AI and advanced their careers through RXAI's industry-leading curriculum.
            </p>
            
            <div className="bg-[#333] max-w-md mx-auto p-6 rounded-lg mb-8">
              <h3 className="font-semibold mb-4">Most Popular Choice</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-3xl font-bold">$49</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">Professional Plan - Cancel Anytime</p>
              
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Full access to all courses & content</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Monthly 1:1 mentoring sessions</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Professional certification</span>
                </div>
              </div>
              
              <Button 
                className="bg-[#007bff] hover:bg-blue-600 w-full"
                onClick={() => window.location.href = '/subscriptions/checkout?plan=pro&billing=monthly'}
              >
                Start Learning Now
              </Button>
              
              <div className="text-xs text-gray-400 mt-3">
                30-day money-back guarantee. No questions asked.
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline"
                className="border-[#007bff] text-[#007bff]"
                onClick={() => scrollToSection(pricingRef)}
              >
                Compare All Plans
              </Button>
              
              <Button 
                variant="ghost"
                className="text-gray-400"
                onClick={() => window.location.href = '/ai-courses/demo'}
              >
                Try Free Demo
              </Button>
            </div>
          </motion.div>
          
          {/* Traditional testimonials section kept from original */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Hear from our students</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Testimonial 
                name="Sarah Johnson"
                role="Data Scientist at TechCorp"
                text="The RXAI courses completely transformed my career. I went from a data analyst to a senior data scientist within months of completing their Advanced ML specialization."
                imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=SJ"
              />
              <Testimonial 
                name="Michael Chen"
                role="AI Engineer"
                text="What sets RXAI apart is the practical, hands-on approach. I built a portfolio of real-world projects that impressed employers and landed my dream job."
                imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=MC"
              />
              <Testimonial 
                name="Priya Sharma"
                role="ML Team Lead"
                text="As someone with no prior programming experience, I was amazed at how accessible RXAI made complex AI concepts. Their beginner track gave me the foundation I needed."
                imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=PS"
              />
            </div>
            {!showTestimonials && (
              <div className="text-center mt-6">
                <Button 
                  variant="link"
                  onClick={() => setShowTestimonials(true)}
                  className="text-[#007bff]"
                >
                  View more testimonials
                </Button>
              </div>
            )}
            {showTestimonials && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <Testimonial 
                  name="James Wilson"
                  role="Startup Founder"
                  text="The knowledge I gained from RXAI courses enabled me to implement AI solutions in my startup, reducing costs by 40% and improving customer satisfaction."
                  imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=JW"
                />
                <Testimonial 
                  name="Sophia Rodriguez"
                  role="Healthcare AI Specialist"
                  text="RXAI's specialized healthcare AI course gave me the unique skills to develop models that are now helping diagnose diseases earlier and more accurately."
                  imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=SR"
                />
                <Testimonial 
                  name="David Kim"
                  role="NLP Research Scientist"
                  text="The advanced NLP course contained cutting-edge information that I wasn't finding anywhere else. The instructors are clearly active practitioners in the field."
                  imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=DK"
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LearnAI;