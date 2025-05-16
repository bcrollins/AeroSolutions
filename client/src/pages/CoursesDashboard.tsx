import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card'; 
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { BadgesDisplay, LeaderboardDisplay } from '@/components/course/GamificationElements';
import CodeEnvironment from '@/components/course/CodeEnvironment';
import LearningPathSelector from '@/components/course/LearningPathSelector';
import LearningAnalytics from '@/components/course/LearningAnalytics';
import CollaborationTools from '@/components/course/CollaborationTools';
import InteractiveProgressChart from '@/components/course/InteractiveProgressChart';
import PersonalizedLearningPath from '@/components/course/PersonalizedLearningPath';
import LearningStreakTracker from '@/components/course/LearningStreakTracker';
import { 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  BookOpen, 
  Award, 
  BarChart3,
  FileText,
  Bookmark,
  MessageCircle,
  Calendar,
  Users,
  Eye,
  MessageSquare,
  Code,
  Terminal,
  Play,
  Download,
  Share2,
  Brain,
  Sparkles,
  Target,
  Zap,
  Star
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

// Mock data for course modules and lessons
const courseModules = [
  {
    id: 1,
    title: "Introduction to AI",
    description: "Fundamental concepts and history of artificial intelligence",
    progress: 100,
    totalLessons: 5,
    completedLessons: 5,
    estimatedHours: 3,
    lessons: [
      { id: 101, title: "What is Artificial Intelligence?", completed: true, duration: "10:25", type: "video" },
      { id: 102, title: "The History of AI", completed: true, duration: "12:42", type: "video" },
      { id: 103, title: "AI Terminology and Concepts", completed: true, duration: "15:18", type: "video" },
      { id: 104, title: "Types of AI Systems", completed: true, duration: "11:50", type: "video" },
      { id: 105, title: "Introduction Quiz", completed: true, duration: "15 mins", type: "quiz" }
    ]
  },
  {
    id: 2,
    title: "Machine Learning Basics",
    description: "Core principles and applications of machine learning",
    progress: 60,
    totalLessons: 6,
    completedLessons: 3,
    estimatedHours: 5,
    lessons: [
      { id: 201, title: "Machine Learning vs AI", completed: true, duration: "13:40", type: "video" },
      { id: 202, title: "Supervised Learning", completed: true, duration: "18:22", type: "video" },
      { id: 203, title: "Unsupervised Learning", completed: true, duration: "15:55", type: "video" },
      { id: 204, title: "Reinforcement Learning", completed: false, duration: "17:30", type: "video" },
      { id: 205, title: "Practical Lab: Your First ML Model", completed: false, duration: "45 mins", type: "lab" },
      { id: 206, title: "Machine Learning Quiz", completed: false, duration: "20 mins", type: "quiz" }
    ]
  },
  {
    id: 3,
    title: "Deep Learning Fundamentals",
    description: "Neural networks and deep learning architectures",
    progress: 0,
    totalLessons: 7,
    completedLessons: 0,
    estimatedHours: 8,
    lessons: [
      { id: 301, title: "Introduction to Neural Networks", completed: false, duration: "20:15", type: "video" },
      { id: 302, title: "Deep Learning Architecture", completed: false, duration: "22:38", type: "video" },
      { id: 303, title: "Convolutional Neural Networks", completed: false, duration: "19:42", type: "video" },
      { id: 304, title: "Recurrent Neural Networks", completed: false, duration: "18:30", type: "video" },
      { id: 305, title: "Transfer Learning", completed: false, duration: "14:45", type: "video" },
      { id: 306, title: "Lab: Building a CNN Image Classifier", completed: false, duration: "60 mins", type: "lab" },
      { id: 307, title: "Deep Learning Assessment", completed: false, duration: "30 mins", type: "quiz" }
    ]
  },
  {
    id: 4,
    title: "Natural Language Processing",
    description: "Understanding and processing human language with AI",
    progress: 0,
    totalLessons: 6,
    completedLessons: 0,
    estimatedHours: 7,
    lessons: [
      { id: 401, title: "Introduction to NLP", completed: false, duration: "16:20", type: "video" },
      { id: 402, title: "Text Processing Fundamentals", completed: false, duration: "19:45", type: "video" },
      { id: 403, title: "Sentiment Analysis", completed: false, duration: "17:30", type: "video" },
      { id: 404, title: "Language Models and Transformers", completed: false, duration: "25:15", type: "video" },
      { id: 405, title: "Lab: Building a Sentiment Analyzer", completed: false, duration: "45 mins", type: "lab" },
      { id: 406, title: "NLP Assessment", completed: false, duration: "25 mins", type: "quiz" }
    ]
  },
  {
    id: 5,
    title: "AI Ethics and Responsible Implementation",
    description: "Ethical considerations and best practices in AI",
    progress: 0,
    totalLessons: 5,
    completedLessons: 0,
    estimatedHours: 4,
    lessons: [
      { id: 501, title: "Ethical Challenges in AI", completed: false, duration: "18:10", type: "video" },
      { id: 502, title: "Bias and Fairness in AI Systems", completed: false, duration: "22:30", type: "video" },
      { id: 503, title: "AI Governance and Regulation", completed: false, duration: "20:45", type: "video" },
      { id: 504, title: "Case Studies in AI Ethics", completed: false, duration: "23:15", type: "video" },
      { id: 505, title: "Ethics and Responsible AI Quiz", completed: false, duration: "20 mins", type: "quiz" }
    ]
  }
];

// Upcoming events data
const upcomingEvents = [
  { 
    id: 1, 
    title: "Live Q&A Session with Dr. James Chen", 
    date: "May 18, 2025", 
    time: "7:00 PM EST",
    type: "webinar"
  },
  { 
    id: 2, 
    title: "Machine Learning Project Workshop", 
    date: "May 22, 2025", 
    time: "6:30 PM EST",
    type: "workshop"
  },
  { 
    id: 3, 
    title: "Deep Learning Career Paths", 
    date: "May 29, 2025", 
    time: "7:30 PM EST",
    type: "panel"
  }
];

// Recent announcements
const announcements = [
  {
    id: 1,
    title: "New Deep Learning Module Released",
    date: "May 12, 2025",
    content: "We've just released our updated Deep Learning module with new exercises and projects. Check it out!",
    read: false
  },
  {
    id: 2,
    title: "Upcoming Maintenance Window",
    date: "May 10, 2025",
    content: "The platform will be undergoing maintenance on May 17th from 2-4 AM EST. Some features may be unavailable during this time.",
    read: true
  },
  {
    id: 3,
    title: "June Workshop Schedule Posted",
    date: "May 9, 2025",
    content: "The schedule for our June expert workshops has been posted. Registration is now open with limited spots available.",
    read: true
  }
];

const LessonTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'video':
      return <PlayCircle className="w-4 h-4 text-electric-cyan-400" />;
    case 'quiz':
      return <FileText className="w-4 h-4 text-purple-400" />;
    case 'lab':
      return <BookOpen className="w-4 h-4 text-amber-400" />;
    default:
      return <FileText className="w-4 h-4 text-gray-400" />;
  }
};

const CoursesDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [expandedModule, setExpandedModule] = useState<number | null>(2); // Start with the in-progress module expanded
  const [overallProgress, setOverallProgress] = useState(0);
  const [totalHoursCompleted, setTotalHoursCompleted] = useState(0);

  // Sample mock data for our enhanced components
  const [streakCount, setStreakCount] = useState(5);
  const [learningMetrics, setLearningMetrics] = useState([
    { 
      label: 'Focus Time', 
      value: 42, 
      previousValue: 35, 
      icon: <Target className="w-4 h-4 text-white" />, 
      color: 'bg-electric-cyan-500/30' 
    },
    { 
      label: 'Completion Rate', 
      value: 85, 
      previousValue: 75, 
      icon: <CheckCircle2 className="w-4 h-4 text-white" />, 
      color: 'bg-green-500/30' 
    },
    { 
      label: 'Daily Streak', 
      value: 5, 
      previousValue: 3, 
      icon: <Zap className="w-4 h-4 text-white" />, 
      color: 'bg-orange-500/30' 
    },
    { 
      label: 'Knowledge Points', 
      value: 425, 
      previousValue: 380, 
      icon: <Brain className="w-4 h-4 text-white" />, 
      color: 'bg-purple-500/30' 
    }
  ]);
  
  const [weeklyData, setWeeklyData] = useState([
    { day: '2025-05-09', minutes: 25, lessons: 1, streak: true },
    { day: '2025-05-10', minutes: 40, lessons: 2, streak: true },
    { day: '2025-05-11', minutes: 0, lessons: 0, streak: false },
    { day: '2025-05-12', minutes: 35, lessons: 1, streak: true },
    { day: '2025-05-13', minutes: 45, lessons: 2, streak: true },
    { day: '2025-05-14', minutes: 20, lessons: 1, streak: true },
    { day: '2025-05-15', minutes: 30, lessons: 1, streak: true }
  ]);
  
  const [lastWeekStreak, setLastWeekStreak] = useState([
    { date: '2025-05-09', isCompleted: true, minutesLearned: 25 },
    { date: '2025-05-10', isCompleted: true, minutesLearned: 40 },
    { date: '2025-05-11', isCompleted: false, minutesLearned: 0 },
    { date: '2025-05-12', isCompleted: true, minutesLearned: 35 },
    { date: '2025-05-13', isCompleted: true, minutesLearned: 45 },
    { date: '2025-05-14', isCompleted: true, minutesLearned: 20 },
    { date: '2025-05-15', isCompleted: true, minutesLearned: 30 }
  ]);
  
  const [userPreferences, setUserPreferences] = useState({
    interests: ['Machine Learning', 'Computer Vision', 'Neural Networks'],
    goals: ['Build AI Products', 'Career Advancement'],
    currentSkillLevel: 'Intermediate',
    timeCommitment: '5-10 hours/week'
  });
  
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(true);
  const { playSound } = useSoundEffects();

  // Calculate overall course progress
  useEffect(() => {
    const totalLessons = courseModules.reduce((acc, module) => acc + module.totalLessons, 0);
    const completedLessons = courseModules.reduce((acc, module) => acc + module.completedLessons, 0);
    const progress = Math.round((completedLessons / totalLessons) * 100);
    setOverallProgress(progress);

    // Calculate completed hours (simplified calculation for demo)
    const completedModulesHours = courseModules
      .filter(module => module.progress === 100)
      .reduce((acc, module) => acc + module.estimatedHours, 0);
    
    const partialModulesHours = courseModules
      .filter(module => module.progress > 0 && module.progress < 100)
      .reduce((acc, module) => {
        const hoursPortion = (module.progress / 100) * module.estimatedHours;
        return acc + hoursPortion;
      }, 0);
    
    setTotalHoursCompleted(Math.round(completedModulesHours + partialModulesHours));

    // Track dashboard view for analytics
    trackEvent('course_dashboard_view', 'engagement', 'course_dashboard');
  }, []);
  
  // Handle claiming a reward
  const handleClaimReward = (rewardId: string) => {
    playSuccess();
    toast({
      title: "Reward Claimed!",
      description: `You've successfully claimed your ${rewardId === 'badge3' ? 'Bronze' : rewardId === 'badge7' ? 'Silver' : rewardId === 'badge14' ? 'Gold' : 'Special'} learning badge!`,
      variant: "default",
    });
    
    trackEvent('reward_claimed', 'engagement', rewardId);
  };
  
  // Handle sharing streak
  const handleShareStreak = () => {
    playClick();
    toast({
      title: "Streak Shared!",
      description: "Your learning streak has been shared to your connected social accounts.",
      variant: "default",
    });
    
    trackEvent('streak_shared', 'social', `streak_${streakCount}`);
  };
  
  // Handle assessment start
  const handleStartAssessment = () => {
    playClick();
    setLocation('/assessment');
    trackEvent('assessment_started', 'engagement', 'learning_path_assessment');
  };
  
  // Handle learning path selection
  const handleSelectPath = (pathId: string) => {
    playClick();
    toast({
      title: "Learning Path Selected",
      description: `You've selected the ${pathId} learning path. Your dashboard and recommendations will be updated accordingly.`,
      variant: "default",
    });
    
    trackEvent('path_selected', 'engagement', `path_${pathId}`);
  };

  // Handle module expansion
  const toggleModule = (moduleId: number) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
      // Track which modules users are interested in
      trackEvent('module_expanded', 'engagement', `module_${moduleId}`);
    }
  };

  // Handle lesson click
  const handleLessonClick = (moduleId: number, lessonId: number, completed: boolean) => {
    // In a real app, this would navigate to the lesson page
    // For now, we'll just track the event
    trackEvent('lesson_selected', 'engagement', `lesson_${lessonId}`);
    setLocation(`/courses/lesson/${lessonId}`);
  };

  // If loading, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-cyan-400"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    // In real app, could use a useEffect to redirect
    // For now, let's just render a message with login link
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-6">Course Access Required</h1>
        <p className="text-gray-300 text-lg mb-8 max-w-md text-center">
          Please log in or subscribe to access the AI course dashboard.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={() => setLocation("/login")}
            className="bg-electric-cyan-600 hover:bg-electric-cyan-700"
          >
            Log In
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = "https://buy.stripe.com/28o9AN95oczIb724gj"}
            className="border-electric-cyan-400 text-white hover:bg-electric-cyan-400/20"
          >
            Claim Free Trial
          </Button>
          <Button 
            variant="ghost"
            onClick={() => setLocation("/learnai")}
            className="text-gray-300 hover:text-white"
          >
            Learn More
          </Button>
        </div>
      </div>
    );
  }

  // Generate a welcome message based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get next recommended lesson
  const getNextLesson = () => {
    for (const module of courseModules) {
      if (module.progress < 100) {
        const nextLesson = module.lessons.find(lesson => !lesson.completed);
        if (nextLesson) {
          return {
            moduleId: module.id,
            moduleTitle: module.title,
            lesson: nextLesson
          };
        }
      }
    }
    return null;
  };

  const nextLesson = getNextLesson();

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white pb-16">
      <Helmet>
        <title>Course Dashboard | RXAI Learning Platform</title>
        <meta name="description" content="Track your progress and continue learning in the RXAI AI Course." />
      </Helmet>

      <div className="container mx-auto px-4 pt-8">
        {/* Welcome and Overview Section */}
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold">{getWelcomeMessage()}, {user?.firstName || 'Student'}</h1>
              <p className="text-gray-400 mt-1">Continue your AI learning journey</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <div className="bg-gray-800 px-4 py-2 rounded-md flex items-center">
                <Clock className="w-5 h-5 text-electric-cyan-400 mr-2" />
                <span><strong>{totalHoursCompleted}</strong> hours completed</span>
              </div>
              <Button
                onClick={() => setLocation('/member-dashboard')}
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                Member Dashboard
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Progress Overview Card */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Course Progress</h3>
                <span className="text-xl font-bold text-electric-cyan-400">{overallProgress}%</span>
              </div>
              <Progress 
                value={overallProgress} 
                className="h-2 mb-4"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>{courseModules.reduce((acc, module) => acc + module.completedLessons, 0)} completed</span>
                <span>{courseModules.reduce((acc, module) => acc + module.totalLessons, 0)} total lessons</span>
              </div>
            </Card>

            {/* Next Up Card */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="font-bold text-lg mb-4">Next Up</h3>
              {nextLesson ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <LessonTypeIcon type={nextLesson.lesson.type} />
                    <span className="text-sm text-gray-400">{nextLesson.moduleTitle}</span>
                  </div>
                  <h4 className="font-medium mb-3">{nextLesson.lesson.title}</h4>
                  <Button 
                    onClick={() => handleLessonClick(nextLesson.moduleId, nextLesson.lesson.id, nextLesson.lesson.completed)}
                    className="w-full bg-electric-cyan-600 hover:bg-electric-cyan-700"
                  >
                    Continue Learning
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="mb-3">You've completed all current lessons!</p>
                  <Button
                    variant="outline"
                    className="border-electric-cyan-400 text-white hover:bg-electric-cyan-400/20"
                  >
                    Explore More Courses
                  </Button>
                </div>
              )}
            </Card>

            {/* Next Event Card */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Upcoming Event</h3>
                <Button variant="link" className="text-electric-cyan-400 p-0" onClick={() => setLocation('/courses/events')}>
                  View All
                </Button>
              </div>
              {upcomingEvents[0] && (
                <div>
                  <h4 className="font-medium mb-2">{upcomingEvents[0].title}</h4>
                  <div className="flex gap-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{upcomingEvents[0].date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{upcomingEvents[0].time}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full border-electric-cyan-400 text-white hover:bg-electric-cyan-400/20"
                    onClick={() => trackEvent('event_signup', 'conversion', `event_${upcomingEvents[0].id}`)}
                  >
                    Add to Calendar
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="modules" className="w-full">
            <TabsList className="bg-gray-800 border-b border-gray-700 w-full justify-start rounded-none mb-6 px-2">
              <TabsTrigger 
                value="modules" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-electric-cyan-400 data-[state=active]:text-white rounded-none"
              >
                Course Modules
              </TabsTrigger>
              <TabsTrigger 
                value="resources" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-electric-cyan-400 data-[state=active]:text-white rounded-none"
              >
                Resources & Materials
              </TabsTrigger>
              <TabsTrigger 
                value="community" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-electric-cyan-400 data-[state=active]:text-white rounded-none"
              >
                Community & Support
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-electric-cyan-400 data-[state=active]:text-white rounded-none"
              >
                Achievements
              </TabsTrigger>
              <TabsTrigger 
                value="learning-path" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-electric-cyan-400 data-[state=active]:text-white rounded-none"
              >
                Learning Path
              </TabsTrigger>
              <TabsTrigger 
                value="code-practice" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-electric-cyan-400 data-[state=active]:text-white rounded-none"
              >
                Code Practice
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-electric-cyan-400 data-[state=active]:text-white rounded-none"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="collaboration" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-electric-cyan-400 data-[state=active]:text-white rounded-none"
              >
                Collaboration
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="modules" className="space-y-6">
              {/* Announcements */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Announcements</h2>
                  <Button variant="link" className="text-electric-cyan-400">View All</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {announcements.map((announcement) => (
                    <Card key={announcement.id} className={`bg-gray-800 border-gray-700 p-4 ${!announcement.read ? 'border-l-4 border-l-electric-cyan-400' : ''}`}>
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold">{announcement.title}</h4>
                        {!announcement.read && <div className="bg-electric-cyan-400 h-2 w-2 rounded-full"></div>}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{announcement.date}</p>
                      <p className="text-sm">{announcement.content}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Course Modules List */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Course Modules</h2>
                <div className="space-y-4">
                  {courseModules.map((module) => (
                    <Card 
                      key={module.id} 
                      className={`bg-gray-800 border-gray-700 overflow-hidden transition-all duration-300 ${
                        expandedModule === module.id ? 'ring-1 ring-electric-cyan-400' : ''
                      }`}
                    >
                      {/* Module Header */}
                      <div 
                        className="p-4 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleModule(module.id)}
                      >
                        <div className="flex items-center">
                          <div className="mr-4 relative">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                              {module.progress === 100 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <span className="text-sm font-bold">{module.progress}%</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold">{module.title}</h3>
                            <p className="text-sm text-gray-400">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right text-sm hidden md:block">
                            <div className="text-gray-400">{module.completedLessons} of {module.totalLessons} lessons</div>
                            <div>{module.estimatedHours} hours</div>
                          </div>
                          <ChevronRight className={`w-5 h-5 transition-transform ${expandedModule === module.id ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Module Lessons (Expanded) */}
                      {expandedModule === module.id && (
                        <div className="border-t border-gray-700 px-4 py-2 bg-gray-850">
                          <ScrollArea className="h-auto max-h-96">
                            <div className="space-y-2 p-2">
                              {module.lessons.map((lesson) => (
                                <div 
                                  key={lesson.id}
                                  onClick={() => handleLessonClick(module.id, lesson.id, lesson.completed)}
                                  className={`flex items-center p-3 rounded-md cursor-pointer ${
                                    lesson.completed 
                                      ? 'bg-gray-700/30 hover:bg-gray-700/50' 
                                      : 'bg-gray-700/50 hover:bg-gray-700/70'
                                  }`}
                                >
                                  <div className="mr-3">
                                    {lesson.completed ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    ) : (
                                      <LessonTypeIcon type={lesson.type} />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className={`${lesson.completed ? 'text-gray-400' : 'text-white'}`}>
                                      {lesson.title}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                      <span>{lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}</span>
                                      <span>•</span>
                                      <span>{lesson.duration}</span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 text-electric-cyan-400 hover:text-electric-cyan-300 hover:bg-gray-700"
                                  >
                                    {lesson.completed ? 'Review' : 'Start'}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}

                      {/* Module Progress Bar */}
                      <div className="h-1 w-full bg-gray-700">
                        <div 
                          className="h-full bg-electric-cyan-400 transition-all duration-300"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Course Materials */}
                <Card className="bg-gray-800 border-gray-700 p-6 md:col-span-2">
                  <h3 className="text-xl font-bold mb-4">Course Materials</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-750 rounded-md flex items-center">
                      <FileText className="w-10 h-10 text-blue-400 mr-4" />
                      <div className="flex-1">
                        <h4 className="font-medium">AI Course Textbook (PDF)</h4>
                        <p className="text-sm text-gray-400">Complete reference guide for all course modules</p>
                      </div>
                      <Button variant="outline" size="sm" className="ml-2">Download</Button>
                    </div>
                    <div className="p-4 bg-gray-750 rounded-md flex items-center">
                      <FileText className="w-10 h-10 text-green-400 mr-4" />
                      <div className="flex-1">
                        <h4 className="font-medium">Code Examples & Notebooks</h4>
                        <p className="text-sm text-gray-400">Jupyter notebooks with example code for all exercises</p>
                      </div>
                      <Button variant="outline" size="sm" className="ml-2">Access</Button>
                    </div>
                    <div className="p-4 bg-gray-750 rounded-md flex items-center">
                      <FileText className="w-10 h-10 text-amber-400 mr-4" />
                      <div className="flex-1">
                        <h4 className="font-medium">Cheat Sheets Bundle</h4>
                        <p className="text-sm text-gray-400">Quick reference guides for key concepts</p>
                      </div>
                      <Button variant="outline" size="sm" className="ml-2">Download</Button>
                    </div>
                  </div>
                </Card>

                {/* Additional Resources */}
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <h3 className="text-xl font-bold mb-4">Additional Resources</h3>
                  <div className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <BookOpen className="w-5 h-5" />
                      <span>Recommended Reading</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <PlayCircle className="w-5 h-5" />
                      <span>Supplemental Videos</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <Bookmark className="w-5 h-5" />
                      <span>Useful Links</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <FileText className="w-5 h-5" />
                      <span>Practice Exercises</span>
                    </Button>
                    <Separator className="my-2" />
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <Award className="w-5 h-5" />
                      <span>Certificate Requirements</span>
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="community" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Forum */}
                <Card className="bg-gray-800 border-gray-700 p-6 md:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Discussion Forum</h3>
                    <Button 
                      className="bg-electric-cyan-600 hover:bg-electric-cyan-700"
                      onClick={() => setLocation('/forum')}
                    >
                      Visit Forum
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Card className="bg-gray-750 border-gray-700 p-4">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold">Help with CNN architecture</h4>
                        <span className="text-xs bg-blue-500/20 text-blue-400 py-1 px-2 rounded-full">Module 3</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Started by Alex Chen • 5 replies • 2 hours ago</p>
                      <p className="text-sm line-clamp-2">I'm having trouble understanding how to structure the layers in my CNN. Could someone explain why we're using a 3x3 kernel in the first layer instead of...</p>
                    </Card>
                    <Card className="bg-gray-750 border-gray-700 p-4">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold">Project ideas for NLP assignment</h4>
                        <span className="text-xs bg-blue-500/20 text-blue-400 py-1 px-2 rounded-full">Module 4</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Started by Maria Lopez • 12 replies • 1 day ago</p>
                      <p className="text-sm line-clamp-2">I'm looking for some creative project ideas for the upcoming NLP assignment. Has anyone started thinking about this yet?</p>
                    </Card>
                    <Card className="bg-gray-750 border-gray-700 p-4">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold">Weekly study group - Thursday 8PM EST</h4>
                        <span className="text-xs bg-green-500/20 text-green-400 py-1 px-2 rounded-full">Announcement</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Posted by Moderator • 3 replies • 3 days ago</p>
                      <p className="text-sm line-clamp-2">We'll be hosting our weekly study group this Thursday at 8PM EST. This week's focus will be on reinforcement learning concepts from Module 2.</p>
                    </Card>
                  </div>
                </Card>

                {/* Support and Mentorship */}
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <h3 className="text-xl font-bold mb-4">Support & Mentorship</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-750 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-electric-cyan-400" />
                        Direct Support
                      </h4>
                      <p className="text-sm text-gray-400 mb-3">Get help from our teaching assistants</p>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-electric-cyan-400 text-white hover:bg-electric-cyan-400/20 w-full"
                      >
                        Contact Support
                      </Button>
                    </div>
                    <div className="p-4 bg-gray-750 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                        Office Hours
                      </h4>
                      <p className="text-sm text-gray-400 mb-3">Book a 20-min session with an instructor</p>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-purple-400 text-white hover:bg-purple-400/20 w-full"
                      >
                        Schedule Session
                      </Button>
                    </div>
                    <div className="p-4 bg-gray-750 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
                        Career Guidance
                      </h4>
                      <p className="text-sm text-gray-400 mb-3">Get advice on AI career paths</p>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-amber-400 text-white hover:bg-amber-400/20 w-full"
                      >
                        Explore Options
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <BadgesDisplay />
                </div>
                <div>
                  <LeaderboardDisplay />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="learning-path" className="space-y-6">
              <LearningPathSelector 
                initialAssessmentCompleted={false} 
                onPathSelect={(pathId) => console.log(`Selected path: ${pathId}`)} 
              />
            </TabsContent>
            
            <TabsContent value="code-practice" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <CodeEnvironment 
                  initialLanguage="python"
                  instructions="Create a Python function that implements a simple neural network prediction using NumPy. The function should take an input array and return the predicted output using the provided weights and activation function."
                />
                
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <h3 className="text-xl font-bold mb-4">Coding Challenges</h3>
                  <p className="text-gray-400 mb-6">Test your skills with these AI-related coding challenges.</p>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-750 rounded-lg border-l-4 border-green-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold mb-1">Beginner: Image Classification</h4>
                          <p className="text-sm text-gray-300">Build a simple image classifier using a pre-trained model.</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full">Python</span>
                            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full">TensorFlow</span>
                            <span className="bg-green-900/60 text-green-400 text-xs px-2 py-1 rounded-full">Beginner</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs h-8 px-3 py-1">Start Challenge</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-750 rounded-lg border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold mb-1">Intermediate: Sentiment Analysis</h4>
                          <p className="text-sm text-gray-300">Build a sentiment analysis model for product reviews.</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full">Python</span>
                            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full">NLP</span>
                            <span className="bg-blue-900/60 text-blue-400 text-xs px-2 py-1 rounded-full">Intermediate</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs h-8 px-3 py-1">Start Challenge</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-750 rounded-lg border-l-4 border-purple-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold mb-1">Advanced: Reinforcement Learning</h4>
                          <p className="text-sm text-gray-300">Implement a reinforcement learning agent for a custom environment.</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full">Python</span>
                            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full">OpenAI Gym</span>
                            <span className="bg-purple-900/60 text-purple-400 text-xs px-2 py-1 rounded-full">Advanced</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs h-8 px-3 py-1">Start Challenge</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <Button className="bg-electric-cyan-600 hover:bg-electric-cyan-700">
                      Browse All Challenges
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <LearningAnalytics />
            </TabsContent>
            
            <TabsContent value="collaboration" className="space-y-6">
              <CollaborationTools />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default CoursesDashboard;