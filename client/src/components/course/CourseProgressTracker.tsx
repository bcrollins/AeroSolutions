import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { BarChart, BookOpen, Calendar, CheckCircle, Clock, LucideClock, Medal, Star, Trophy, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiCourseStructure, CourseModule, Lesson } from '@/data/courseStructure';
import { useAuth } from '@/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';

interface CourseProgressData {
  completedLessons: string[];
  quizScores: Record<string, { score: number; totalPossible: number; completedAt: string }>;
  projectSubmissions: Record<string, { status: 'submitted' | 'approved' | 'needs_revision'; submittedAt: string; feedback?: string }>;
  lastAccessedLesson?: string;
  certificates: string[];
  startDate: string;
  totalTimeSpent: number; // in minutes
  streakDays: number;
  currentStreak: number;
}

interface BadgeAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
  totalRequired?: number;
  earnedAt?: string;
}

const CourseProgressTracker: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [progressData, setProgressData] = useState<CourseProgressData | null>(null);
  const [achievements, setAchievements] = useState<BadgeAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  
  // Retrieve progress data (in a real app, this would come from your backend)
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // In a real implementation, this would be an API call
        // For demo purposes, we'll use localStorage with some generated data
        let storedProgress = localStorage.getItem('course_progress');
        
        if (!storedProgress) {
          // Generate sample progress data for demo
          const sampleProgress: CourseProgressData = {
            completedLessons: [
              'lesson-1-1', 'lesson-1-2', 'lesson-1-3', 'lesson-1-4', 'lesson-1-5', 'lesson-1-6',
              'lesson-2-1', 'lesson-2-2', 'lesson-2-3'
            ],
            quizScores: {
              'lesson-1-6': { score: 85, totalPossible: 100, completedAt: new Date().toISOString() },
            },
            projectSubmissions: {
              'lesson-2-8': { 
                status: 'approved', 
                submittedAt: new Date().toISOString(),
                feedback: 'Great work on your classifier implementation! Your code is well-structured and efficient.'
              }
            },
            lastAccessedLesson: 'lesson-2-3',
            certificates: [],
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
            totalTimeSpent: 840, // 14 hours
            streakDays: 10,
            currentStreak: 3,
          };
          
          localStorage.setItem('course_progress', JSON.stringify(sampleProgress));
          storedProgress = JSON.stringify(sampleProgress);
        }
        
        const progressData = JSON.parse(storedProgress) as CourseProgressData;
        setProgressData(progressData);
        
        // Generate achievements based on progress
        const achievementsData = generateAchievements(progressData);
        setAchievements(achievementsData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setIsLoading(false);
        
        toast({
          title: 'Failed to load progress data',
          description: 'There was an error loading your course progress. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    fetchProgressData();
  }, [isAuthenticated, toast]);
  
  const generateAchievements = (progressData: CourseProgressData): BadgeAchievement[] => {
    return [
      {
        id: 'first_lesson_completed',
        title: 'First Steps',
        description: 'Completed your first lesson',
        icon: <BookOpen className="h-8 w-8 text-blue-500" />,
        earned: progressData.completedLessons.length > 0,
        earnedAt: progressData.completedLessons.length > 0 ? new Date().toISOString() : undefined,
      },
      {
        id: 'module_completed',
        title: 'Module Master',
        description: 'Completed an entire module',
        icon: <Medal className="h-8 w-8 text-yellow-500" />,
        earned: isModuleCompleted(aiCourseStructure[0], progressData.completedLessons),
        earnedAt: isModuleCompleted(aiCourseStructure[0], progressData.completedLessons) ? new Date().toISOString() : undefined,
      },
      {
        id: 'perfect_quiz',
        title: 'Perfect Score',
        description: 'Achieved 100% on a quiz',
        icon: <Star className="h-8 w-8 text-amber-500" />,
        earned: Object.values(progressData.quizScores).some(q => q.score === q.totalPossible),
        earnedAt: Object.values(progressData.quizScores).some(q => q.score === q.totalPossible) ? new Date().toISOString() : undefined,
      },
      {
        id: 'project_completed',
        title: 'Project Pro',
        description: 'Successfully completed a project',
        icon: <CheckCircle className="h-8 w-8 text-green-500" />,
        earned: Object.values(progressData.projectSubmissions).some(p => p.status === 'approved'),
        earnedAt: Object.values(progressData.projectSubmissions).some(p => p.status === 'approved') ? new Date().toISOString() : undefined,
      },
      {
        id: 'streak_master',
        title: 'Consistency Champion',
        description: 'Maintained a 7-day learning streak',
        icon: <Calendar className="h-8 w-8 text-indigo-500" />,
        earned: progressData.streakDays >= 7,
        progress: Math.min(progressData.streakDays, 7),
        totalRequired: 7,
        earnedAt: progressData.streakDays >= 7 ? new Date().toISOString() : undefined,
      },
      {
        id: 'time_dedication',
        title: 'Dedicated Learner',
        description: 'Spent over 10 hours learning',
        icon: <Clock className="h-8 w-8 text-purple-500" />,
        earned: progressData.totalTimeSpent >= 600, // 10 hours in minutes
        progress: Math.min(progressData.totalTimeSpent, 600),
        totalRequired: 600,
        earnedAt: progressData.totalTimeSpent >= 600 ? new Date().toISOString() : undefined,
      },
    ];
  };
  
  // Check if a module is fully completed
  const isModuleCompleted = (module: CourseModule, completedLessons: string[]): boolean => {
    return module.lessons.every(lesson => completedLessons.includes(lesson.id));
  };
  
  // Calculate overall course progress
  const calculateOverallProgress = (): number => {
    if (!progressData) return 0;
    
    const totalLessons = aiCourseStructure.reduce((total, module) => total + module.lessons.length, 0);
    return Math.round((progressData.completedLessons.length / totalLessons) * 100);
  };
  
  // Calculate module progress
  const calculateModuleProgress = (module: CourseModule): number => {
    if (!progressData) return 0;
    
    const completedInModule = module.lessons.filter(lesson => 
      progressData.completedLessons.includes(lesson.id)
    ).length;
    
    return Math.round((completedInModule / module.lessons.length) * 100);
  };
  
  // Format minutes into hours and minutes
  const formatLearningTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };
  
  // Calculate estimated completion date based on current progress and pace
  const calculateEstimatedCompletion = (): string => {
    if (!progressData) return 'Not available';
    
    const totalLessons = aiCourseStructure.reduce((total, module) => total + module.lessons.length, 0);
    const completedLessons = progressData.completedLessons.length;
    const remainingLessons = totalLessons - completedLessons;
    
    // Calculate daily average progress
    const startDate = new Date(progressData.startDate);
    const today = new Date();
    const daysSinceStart = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const lessonsPerDay = completedLessons / daysSinceStart;
    
    if (lessonsPerDay <= 0) return 'Unable to estimate';
    
    // Calculate days remaining
    const daysRemaining = Math.ceil(remainingLessons / lessonsPerDay);
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(today.getDate() + daysRemaining);
    
    // Format date to Month Day, Year
    return estimatedCompletionDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get next lesson to complete
  const getNextLesson = (): { moduleTitle: string; lesson: Lesson } | null => {
    if (!progressData) return null;
    
    // Loop through modules and lessons to find the first incomplete lesson
    for (const module of aiCourseStructure) {
      for (const lesson of module.lessons) {
        if (!progressData.completedLessons.includes(lesson.id)) {
          return { moduleTitle: module.title, lesson };
        }
      }
    }
    
    return null;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Loading Your Progress</CardTitle>
          <CardDescription className="text-center">Please wait while we fetch your course data...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="animate-pulse flex flex-col w-full items-center space-y-6">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3 w-full">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Track Your Progress</CardTitle>
          <CardDescription className="text-center">
            Sign in to track your course progress and earn achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <BookOpen className="h-16 w-16 text-blue-500 mb-2" />
          <p className="text-center text-gray-600">
            As you progress through the course, you'll be able to see your completion status,
            track your achievements, and monitor your learning journey.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="mt-4"
          >
            Sign In to Track Progress
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Next lesson to complete
  const nextLesson = getNextLesson();
  
  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Course Progress</span>
            <Badge className="text-lg px-3 py-1">
              {calculateOverallProgress()}%
            </Badge>
          </CardTitle>
          <CardDescription>
            Your journey through "Master AI: From Fundamentals to Advanced Applications"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span>{progressData?.completedLessons.length || 0} of {aiCourseStructure.reduce((total, module) => total + module.lessons.length, 0)} lessons</span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-2" />
          </div>
          
          {/* Progress stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
              <Clock className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm text-gray-500">Total Learning Time</p>
              <p className="text-xl font-bold">{formatLearningTime(progressData?.totalTimeSpent || 0)}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
              <Calendar className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm text-gray-500">Current Streak</p>
              <p className="text-xl font-bold">{progressData?.currentStreak || 0} days</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
              <BarChart className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-sm text-gray-500">Estimated Completion</p>
              <p className="text-xl font-bold">{calculateEstimatedCompletion()}</p>
            </div>
          </div>
          
          {/* Next up section */}
          {nextLesson && (
            <div className="mt-6 border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Next Up</h3>
              <p className="text-gray-600 mb-2">{nextLesson.moduleTitle}</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{nextLesson.lesson.title}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{nextLesson.lesson.durationMinutes} minutes</span>
                  </div>
                </div>
                <Button>Continue Learning</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Module Progress Cards */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Module Breakdown</CardTitle>
          <CardDescription>Track your progress through each course module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {aiCourseStructure.map((module, index) => {
              const progress = calculateModuleProgress(module);
              const isCompleted = progress === 100;
              
              return (
                <div key={module.id} className="border rounded-lg overflow-hidden">
                  <div 
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedModuleIndex === index ? 'bg-gray-50' : ''}`}
                    onClick={() => setSelectedModuleIndex(index)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 rounded-full w-10 h-10 flex items-center justify-center mr-3 ${
                          isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{module.title}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <BookOpen className="h-3 w-3 mr-1" />
                            <span>{module.lessons.length} lessons</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{module.durationHours} hours</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm mr-3">{progress}%</span>
                        <Badge className={`${
                          progress === 0 ? 'bg-gray-100 text-gray-800' : 
                          progress < 50 ? 'bg-blue-100 text-blue-800' : 
                          progress < 100 ? 'bg-orange-100 text-orange-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {progress === 0 ? 'Not Started' : 
                           progress < 50 ? 'In Progress' : 
                           progress < 100 ? 'Almost Done' : 
                           'Completed'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                  
                  {/* Expanded Lesson List */}
                  <AnimatePresence>
                    {selectedModuleIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t bg-gray-50"
                      >
                        <div className="p-4">
                          <h4 className="font-medium mb-3">Lessons</h4>
                          <div className="space-y-2">
                            {module.lessons.map((lesson) => {
                              const isLessonCompleted = progressData?.completedLessons.includes(lesson.id) || false;
                              
                              return (
                                <div 
                                  key={lesson.id} 
                                  className={`flex items-center justify-between p-2 rounded-md ${
                                    isLessonCompleted ? 'bg-green-50' : 'bg-white border'
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <div className={`flex-shrink-0 mr-3 h-6 w-6 rounded-full flex items-center justify-center ${
                                      isLessonCompleted ? 'bg-green-500 text-white' : 'bg-gray-200'
                                    }`}>
                                      {isLessonCompleted ? (
                                        <CheckCircle className="h-4 w-4" />
                                      ) : (
                                        <span className="text-xs">{module.lessons.indexOf(lesson) + 1}</span>
                                      )}
                                    </div>
                                    <p className="font-medium text-sm">{lesson.title}</p>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 text-gray-500 mr-1" />
                                    <span className="text-xs text-gray-500">{lesson.durationMinutes} min</span>
                                    
                                    {/* Quiz score if available */}
                                    {progressData?.quizScores[lesson.id] && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Badge className="ml-2 bg-blue-100 text-blue-800">
                                              Quiz: {progressData.quizScores[lesson.id].score}%
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>You scored {progressData.quizScores[lesson.id].score} out of {progressData.quizScores[lesson.id].totalPossible}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    
                                    {/* Project submission status if available */}
                                    {progressData?.projectSubmissions[lesson.id] && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Badge 
                                              className={`ml-2 ${
                                                progressData.projectSubmissions[lesson.id].status === 'approved' ? 
                                                'bg-green-100 text-green-800' : 
                                                'bg-orange-100 text-orange-800'
                                              }`}
                                            >
                                              {progressData.projectSubmissions[lesson.id].status === 'approved' ? 
                                                'Project Approved' : 
                                                'Revision Needed'}
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{progressData.projectSubmissions[lesson.id].feedback || 'No feedback available'}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Achievements Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>Badges and milestones you've earned on your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`border rounded-lg p-4 ${
                  achievement.earned ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full mb-3 ${
                    achievement.earned ? 'bg-amber-100' : 'bg-gray-200'
                  }`}>
                    {achievement.icon}
                  </div>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  
                  {achievement.progress !== undefined && achievement.totalRequired !== undefined && (
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{achievement.progress} / {achievement.totalRequired}</span>
                        <span>{Math.round((achievement.progress / achievement.totalRequired) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.totalRequired) * 100} 
                        className="h-1.5" 
                      />
                    </div>
                  )}
                  
                  {achievement.earned ? (
                    <Badge className="mt-3 bg-green-100 text-green-800">Earned</Badge>
                  ) : (
                    <Badge variant="outline" className="mt-3">In Progress</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline">View All Achievements</Button>
        </CardFooter>
      </Card>
      
      {/* Learning Statistics Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Learning Statistics</CardTitle>
          <CardDescription>Your activity and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
              <div className="text-3xl font-bold text-blue-600">{progressData?.completedLessons.length || 0}</div>
              <p className="text-sm text-gray-600">Lessons Completed</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
              <div className="text-3xl font-bold text-green-600">
                {Object.values(progressData?.quizScores || {}).length}
              </div>
              <p className="text-sm text-gray-600">Quizzes Taken</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
              <div className="text-3xl font-bold text-purple-600">
                {Object.values(progressData?.projectSubmissions || {})
                  .filter(p => p.status === 'approved').length}
              </div>
              <p className="text-sm text-gray-600">Projects Completed</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
              <div className="text-3xl font-bold text-amber-600">
                {progressData?.streakDays || 0}
              </div>
              <p className="text-sm text-gray-600">Longest Streak</p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="font-semibold mb-3">Performance Summary</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Quiz Average</span>
                  <span className="text-sm font-medium">
                    {Object.values(progressData?.quizScores || {}).length > 0
                      ? Math.round(
                          Object.values(progressData?.quizScores || {})
                            .reduce((sum, quiz) => sum + (quiz.score / quiz.totalPossible) * 100, 0) /
                          Object.values(progressData?.quizScores || {}).length
                        )
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={
                    Object.values(progressData?.quizScores || {}).length > 0
                      ? Math.round(
                          Object.values(progressData?.quizScores || {})
                            .reduce((sum, quiz) => sum + (quiz.score / quiz.totalPossible) * 100, 0) /
                          Object.values(progressData?.quizScores || {}).length
                        )
                      : 0
                  } 
                  className="h-2" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Project Success Rate</span>
                  <span className="text-sm font-medium">
                    {Object.values(progressData?.projectSubmissions || {}).length > 0
                      ? Math.round(
                          (Object.values(progressData?.projectSubmissions || {})
                            .filter(p => p.status === 'approved').length /
                          Object.values(progressData?.projectSubmissions || {}).length) * 100
                        )
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={
                    Object.values(progressData?.projectSubmissions || {}).length > 0
                      ? Math.round(
                          (Object.values(progressData?.projectSubmissions || {})
                            .filter(p => p.status === 'approved').length /
                          Object.values(progressData?.projectSubmissions || {}).length) * 100
                        )
                      : 0
                  } 
                  className="h-2" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Learning Consistency</span>
                  <span className="text-sm font-medium">
                    {progressData?.currentStreak || 0} day streak
                  </span>
                </div>
                <Progress 
                  value={Math.min(((progressData?.currentStreak || 0) / 7) * 100, 100)} 
                  className="h-2" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseProgressTracker;