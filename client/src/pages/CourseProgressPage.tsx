import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { ProgressTracker, BadgesDisplay, StreakDisplay, LeaderboardDisplay } from '@/components/course/GamificationElements';
import PremiumContentGate from '@/components/course/PremiumContentGate';
import { Clock, BookOpen, Award, CheckCircle2, LockIcon, PlayCircle } from 'lucide-react';

// Simple loading spinner component
const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  return (
    <div className={`animate-spin ${sizeClass} ${className}`} role="status">
      <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Sample badges data
const sampleBadges = [
  {
    id: 1,
    name: 'First Lesson',
    description: 'Completed your first lesson',
    icon: 'star',
    dateEarned: '2025-05-01T00:00:00Z',
  },
  {
    id: 2,
    name: '5-Day Streak',
    description: 'Maintained a 5-day learning streak',
    icon: 'zap',
    dateEarned: '2025-05-10T00:00:00Z',
  },
  {
    id: 3,
    name: 'Module Master',
    description: 'Completed all lessons in a module',
    icon: 'award',
    isLocked: true,
  },
  {
    id: 4,
    name: 'Quiz Genius',
    description: 'Scored 100% on a module quiz',
    icon: 'trophy',
    isLocked: true,
  }
];

const CourseProgressPage = () => {
  const params = useParams();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('modules');
  const { courseId } = params;

  // Sample course data
  const sampleCourse = {
    id: parseInt(courseId || '1'),
    title: "Mastering AI Prompt Engineering",
    description: "Learn the art and science of designing effective prompts for large language models (LLMs). This comprehensive course covers prompt crafting techniques, optimization strategies, and best practices for getting the most out of AI models.",
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    instructor: {
      id: 1,
      name: "Dr. Sarah Chen",
      bio: "AI Research Scientist with over 10 years of experience in natural language processing and prompt engineering.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    price: "$149",
    duration: "6 weeks",
    modules: [
      {
        id: 101,
        title: "Fundamentals of Prompt Engineering",
        description: "Master the basic concepts and principles of effective prompt design.",
        position: 1,
        progress: 65,
        lessons: [
          {
            id: 1001,
            moduleId: 101,
            title: "Introduction to Prompt Engineering",
            type: "video",
            duration: 15,
            position: 1,
            isCompleted: true,
            isLocked: false
          },
          {
            id: 1002,
            moduleId: 101,
            title: "Understanding Language Model Behavior",
            type: "text",
            duration: 20,
            position: 2,
            isCompleted: true,
            isLocked: false
          },
          {
            id: 1003,
            moduleId: 101,
            title: "Core Principles of Effective Prompts",
            type: "video",
            duration: 25,
            position: 3,
            isCompleted: false,
            isLocked: false
          },
          {
            id: 1004,
            moduleId: 101,
            title: "Module Quiz",
            type: "quiz",
            duration: 15,
            position: 4,
            isCompleted: false,
            isLocked: true
          }
        ]
      },
      {
        id: 102,
        title: "Advanced Prompt Techniques",
        description: "Learn sophisticated methods to enhance prompt effectiveness and model responses.",
        position: 2,
        progress: 0,
        lessons: [
          {
            id: 1005,
            moduleId: 102,
            title: "Chain-of-Thought Prompting",
            type: "video",
            duration: 22,
            position: 1,
            isCompleted: false,
            isLocked: true
          },
          {
            id: 1006,
            moduleId: 102,
            title: "Few-Shot Learning with Examples",
            type: "interactive",
            duration: 30,
            position: 2,
            isCompleted: false,
            isLocked: true
          }
        ]
      }
    ],
    progress: 27,
    enrollmentDate: "2025-05-10T00:00:00Z",
    lastAccessedDate: "2025-05-17T00:00:00Z",
    createdAt: "2025-04-15T00:00:00Z",
    level: "intermediate",
    studentsCount: 2456,
    streak: {
      current: 7,
      longest: 7
    }
  };

  // Fetch course data
  const { data: course = sampleCourse, isLoading: isLoadingCourse } = useQuery({
    queryKey: [`/api/learning/courses/${courseId}`],
    enabled: !!courseId && isAuthenticated,
  });

  // Mark lesson as completed mutation
  const completeLessonMutation = useMutation({
    mutationFn: async ({ lessonId, progress }: { lessonId: number, progress: { completed: boolean, timeSpentMinutes?: number } }) => {
      // In a real app, this would be an API call
      return { success: true, lessonId, completed: progress.completed };
    },
    onSuccess: (data) => {
      // Update course progress in the cache
      toast({
        title: "Progress Saved",
        description: "Your lesson progress has been updated.",
      });
      
      // Invalidate course query to refresh
      queryClient.invalidateQueries({ queryKey: [`/api/learning/courses/${courseId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update your progress. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handler for marking a lesson as completed
  const handleCompleteLesson = (lessonId: number) => {
    completeLessonMutation.mutate({
      lessonId,
      progress: { completed: true, timeSpentMinutes: 10 }
    });
  };

  // Handler for starting a lesson
  const handleStartLesson = (lessonId: number) => {
    navigate(`/courses/${courseId}/learn/${lessonId}`);
  };

  if (isLoadingAuth || isLoadingCourse) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access your course progress.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/api/login')}>Sign In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Calculate total lessons and completed lessons
  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length, 0
  );
  
  const completedLessons = course.modules.reduce(
    (total, module) => total + module.lessons.filter(lesson => lesson.isCompleted).length, 0
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-8">
        {/* Course Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              <p className="text-muted-foreground mt-1">
                {course.description}
              </p>
            </div>
            <Button onClick={() => navigate('/courses')}>
              Back to Courses
            </Button>
          </div>
          
          {/* Course Progress Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Course Progress</h3>
                  <ProgressTracker 
                    progress={course.progress} 
                    label="Overall Completion" 
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span>{completedLessons} of {totalLessons} lessons completed</span>
                    <span>{course.progress}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Learning Streak</h3>
                  <StreakDisplay 
                    currentStreak={course.streak.current} 
                    longestStreak={course.streak.longest} 
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Course Info</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{course.level}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>Enrolled on {new Date(course.enrollmentDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Course Content Tabs */}
        <Tabs defaultValue="modules" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 sm:w-[400px]">
            <TabsTrigger value="modules">Modules & Lessons</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="mt-6 space-y-6">
            {course.modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <ProgressTracker progress={module.progress} />
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {module.lessons.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        className={`p-4 border rounded-md ${lesson.isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-start gap-3">
                            {lesson.isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                            ) : lesson.isLocked ? (
                              <LockIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                            ) : (
                              <PlayCircle className="h-5 w-5 text-primary mt-0.5" />
                            )}
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h4 className="font-medium">{lesson.title}</h4>
                                <Badge variant="outline" className="w-fit">
                                  {lesson.type === 'video' && 'Video'}
                                  {lesson.type === 'text' && 'Reading'}
                                  {lesson.type === 'quiz' && 'Quiz'}
                                  {lesson.type === 'interactive' && 'Interactive'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {lesson.duration} minutes
                              </p>
                            </div>
                          </div>
                          <div>
                            {lesson.isCompleted ? (
                              <Button 
                                variant="outline" 
                                onClick={() => handleStartLesson(lesson.id)}
                              >
                                Review
                              </Button>
                            ) : lesson.isLocked ? (
                              <Button variant="outline" disabled>
                                <LockIcon className="h-4 w-4 mr-2" />
                                Locked
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                <Button 
                                  variant="default" 
                                  onClick={() => handleStartLesson(lesson.id)}
                                >
                                  Continue
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleCompleteLesson(lesson.id)}
                                >
                                  Mark Complete
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>
                  Track your progress and collect badges as you complete course milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Earned Badges</h3>
                    <BadgesDisplay badges={sampleBadges} />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-3">Learning Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">{completedLessons}</CardTitle>
                          <CardDescription>Lessons Completed</CardDescription>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">{course.streak.current}</CardTitle>
                          <CardDescription>Day Streak</CardDescription>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">
                            {new Date().getDate() - new Date(course.enrollmentDate).getDate()}
                          </CardTitle>
                          <CardDescription>Days Enrolled</CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseProgressPage;