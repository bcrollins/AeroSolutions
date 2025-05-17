import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import {
  Bookmark,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  List,
  MessageSquare,
  Settings,
  Volume2,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

import EnhancedCourseDetail from '@/components/course/EnhancedCourseDetail';
import InteractiveLessonPlayer from '@/components/course/InteractiveLessonPlayer';
import LearningPathVisualizer from '@/components/course/LearningPathVisualizer';
import CourseResources from '@/components/course/CourseResources';
import VideoPlayer from '@/components/course/VideoPlayer';
import { ProgressTracker, BadgesDisplay, StreakDisplay, LeaderboardDisplay } from '@/components/course/GamificationElements';
import PremiumContentGate from '@/components/course/PremiumContentGate';

// Import course types from our type definitions
import { Course, CourseModule, CourseLesson } from '@/types/course';

const CourseLearningPage: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { playSound } = useSoundEffects();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(lessonId ? parseInt(lessonId) : null);
  const [activeTab, setActiveTab] = useState<string>('content');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Sample course data until our API is connected
  const mockCourseData: Course = {
    id: 1,
    title: "Advanced AI Development with GPT-4o",
    description: "Learn how to build sophisticated AI applications using OpenAI's GPT-4o model",
    coverImage: "/images/courses/ai-development.jpg",
    instructor: {
      id: 101,
      name: "Dr. Sarah Chen",
      bio: "AI researcher with 10+ years of experience",
      avatar: "/images/instructors/sarah-chen.jpg"
    },
    isPremium: true,
    requiredSubscription: "pro"
    },
    price: "$129.99",
    duration: 2400, // 40 hours in minutes
    modules: [
      {
        id: 1,
        title: "Introduction to GPT-4o",
        description: "Understanding the capabilities and limitations of GPT-4o",
        position: 1,
        lessons: [
          {
            id: 101,
            moduleId: 1,
            title: "What is GPT-4o?",
            type: "video",
            duration: 15,
            position: 1,
            isCompleted: true,
            isLocked: false
          },
          {
            id: 102,
            moduleId: 1,
            title: "Key differences from previous models",
            type: "text",
            duration: 10,
            position: 2,
            isCompleted: false,
            isLocked: false
          }
        ]
      },
      {
        id: 2,
        title: "Prompt Engineering for GPT-4o",
        description: "Learn advanced prompt techniques specific to GPT-4o",
        position: 2,
        lessons: [
          {
            id: 201,
            moduleId: 2,
            title: "Basics of Prompt Engineering",
            type: "video",
            duration: 20,
            position: 1,
            isCompleted: false,
            isLocked: false
          },
          {
            id: 202,
            moduleId: 2,
            title: "Advanced Context Setting",
            type: "interactive",
            duration: 25,
            position: 2,
            isCompleted: false,
            isLocked: true
          }
        ]
      }
    ],
    progress: 15,
    enrollmentDate: "2025-01-15",
    lastAccessedDate: "2025-05-17"
  };

  // Fetch course data
  const { data: course = mockCourseData, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/learning/courses/${courseId}`],
    // In a real app, this would fetch from the API instead of using the mock data
  });
  
  // Fetch lesson data if lessonId is provided
  const { data: lessonData, isLoading: isLoadingLesson } = useQuery<CourseLesson>({
    queryKey: [`/api/learning/lessons/${lessonId}`],
    enabled: !!lessonId,
  });
  
  // Set current module based on lesson
  useEffect(() => {
    if (course?.modules && lessonId) {
      // Find the module containing the current lesson
      for (const module of course.modules) {
        const lessonExists = module.lessons.some(
          (lesson: CourseLesson) => lesson.id === parseInt(lessonId)
        );
        
        if (lessonExists) {
          setCurrentModuleId(module.id);
          break;
        }
      }
    } else if (course?.modules && course.modules.length > 0) {
      // If no lesson ID, set to first module
      setCurrentModuleId(course.modules[0].id);
      
      // Also set first lesson ID if not set
      if (!currentLessonId && course.modules[0].lessons.length > 0) {
        setCurrentLessonId(course.modules[0].lessons[0].id);
      }
    }
  }, [course, lessonId, currentLessonId]);
  
  const getCurrentLesson = () => {
    if (!course?.modules || !currentLessonId) return null;
    
    for (const module of course.modules) {
      const lesson = module.lessons.find(lesson => lesson.id === currentLessonId);
      if (lesson) return lesson;
    }
    
    return null;
  };
  
  const getCurrentModule = () => {
    if (!course?.modules || !currentModuleId) return null;
    return course.modules.find(module => module.id === currentModuleId) || null;
  };
  
  const handleLessonClick = (lessonId: number) => {
    playSound('click');
    setCurrentLessonId(lessonId);
    setLocation(`/courses/${courseId}/learn/${lessonId}`);
  };
  
  const handleModuleClick = (moduleId: number) => {
    playSound('click');
    setCurrentModuleId(moduleId);
    
    // If the current module changes and no lesson is selected from that module,
    // select the first lesson from the new module
    const newModule = course?.modules.find(m => m.id === moduleId);
    if (newModule) {
      const currentModuleLessons = newModule.lessons || [];
      if (currentModuleLessons.length > 0) {
        const isCurrentLessonInModule = currentModuleLessons.some(
          lesson => lesson.id === currentLessonId
        );
        
        if (!isCurrentLessonInModule) {
          const firstLesson = currentModuleLessons[0];
          setCurrentLessonId(firstLesson.id);
          setLocation(`/courses/${courseId}/learn/${firstLesson.id}`);
        }
      }
    }
  };
  
  const handleLessonComplete = (score: number, timeSpent: number) => {
    playSound('success');
    
    toast({
      title: "Lesson Completed!",
      description: `You earned ${score} points. Keep up the good work!`,
      variant: "default",
    });
    
    // In a real app, you'd update the course progress via API
    // For now, we'll just navigate to the next lesson if available
    const currentModule = getCurrentModule();
    const currentLesson = getCurrentLesson();
    
    if (currentModule && currentLesson) {
      const lessons = currentModule.lessons;
      const currentIndex = lessons.findIndex(lesson => lesson.id === currentLesson.id);
      
      if (currentIndex < lessons.length - 1) {
        // Go to next lesson in current module
        const nextLesson = lessons[currentIndex + 1];
        handleLessonClick(nextLesson.id);
      } else {
        // Current lesson is the last in its module
        const moduleIndex = course?.modules.findIndex(m => m.id === currentModule.id) || 0;
        
        if (moduleIndex < (course?.modules.length || 0) - 1) {
          // Go to first lesson of next module
          const nextModule = course?.modules[moduleIndex + 1];
          if (nextModule && nextModule.lessons.length > 0) {
            setCurrentModuleId(nextModule.id);
            handleLessonClick(nextModule.lessons[0].id);
          }
        } else {
          // This was the last lesson of the last module - course completed!
          toast({
            title: "Course Completed!",
            description: "Congratulations! You've completed the entire course.",
            variant: "default",
          });
        }
      }
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  const nextLesson = () => {
    const currentModule = getCurrentModule();
    const currentLesson = getCurrentLesson();
    
    if (currentModule && currentLesson) {
      const lessons = currentModule.lessons;
      const currentIndex = lessons.findIndex(lesson => lesson.id === currentLesson.id);
      
      if (currentIndex < lessons.length - 1) {
        // Go to next lesson in current module
        handleLessonClick(lessons[currentIndex + 1].id);
      } else {
        // Current lesson is the last in its module
        const moduleIndex = course?.modules.findIndex(m => m.id === currentModule.id) || 0;
        
        if (moduleIndex < (course?.modules.length || 0) - 1) {
          // Go to first lesson of next module
          const nextModule = course?.modules[moduleIndex + 1];
          if (nextModule && nextModule.lessons.length > 0) {
            setCurrentModuleId(nextModule.id);
            handleLessonClick(nextModule.lessons[0].id);
          }
        }
      }
    }
  };
  
  const previousLesson = () => {
    const currentModule = getCurrentModule();
    const currentLesson = getCurrentLesson();
    
    if (currentModule && currentLesson) {
      const lessons = currentModule.lessons;
      const currentIndex = lessons.findIndex(lesson => lesson.id === currentLesson.id);
      
      if (currentIndex > 0) {
        // Go to previous lesson in current module
        handleLessonClick(lessons[currentIndex - 1].id);
      } else {
        // Current lesson is the first in its module
        const moduleIndex = course?.modules.findIndex(m => m.id === currentModule.id) || 0;
        
        if (moduleIndex > 0) {
          // Go to last lesson of previous module
          const prevModule = course?.modules[moduleIndex - 1];
          if (prevModule && prevModule.lessons.length > 0) {
            setCurrentModuleId(prevModule.id);
            handleLessonClick(prevModule.lessons[prevModule.lessons.length - 1].id);
          }
        }
      }
    }
  };
  
  // Mock course data for demonstration
  const mockCourse: Course = {
    id: parseInt(courseId || "1"),
    title: "Advanced AI Development",
    description: "Learn how to build and deploy sophisticated AI systems using cutting-edge techniques and frameworks.",
    coverImage: "/images/courses/ai-development.jpg",
    instructor: {
      id: 1,
      name: "Dr. Sarah Chen",
      bio: "AI Research Scientist with 15+ years of experience in deep learning and neural networks.",
      avatar: "/images/instructors/sarah-chen.jpg"
    },
    price: "149.99",
    duration: 1800, // 30 hours
    progress: 35,
    enrollmentDate: "2025-04-15T10:30:00",
    lastAccessedDate: "2025-05-16T14:20:00",
    modules: [
      {
        id: 1,
        title: "Foundations of Modern AI",
        description: "Understanding the core concepts that drive modern AI systems",
        position: 1,
        lessons: [
          {
            id: 101,
            moduleId: 1,
            title: "Evolution of AI: From Rule-Based Systems to Deep Learning",
            type: "video",
            duration: 45,
            position: 1,
            isCompleted: true,
            isLocked: false
          },
          {
            id: 102,
            moduleId: 1,
            title: "Neural Networks Fundamentals",
            type: "video",
            duration: 55,
            position: 2,
            isCompleted: true,
            isLocked: false
          },
          {
            id: 103,
            moduleId: 1,
            title: "Knowledge Check: AI Foundations",
            type: "quiz",
            duration: 20,
            position: 3,
            isCompleted: false,
            isLocked: false
          }
        ]
      },
      {
        id: 2,
        title: "Deep Learning Architectures",
        description: "Explore various deep learning models and their applications",
        position: 2,
        lessons: [
          {
            id: 201,
            moduleId: 2,
            title: "Convolutional Neural Networks (CNNs)",
            type: "video",
            duration: 60,
            position: 1,
            isCompleted: false,
            isLocked: false
          },
          {
            id: 202,
            moduleId: 2,
            title: "Recurrent Neural Networks (RNNs)",
            type: "video",
            duration: 55,
            position: 2,
            isCompleted: false,
            isLocked: false
          },
          {
            id: 203,
            moduleId: 2,
            title: "Hands-on: Build Your First CNN",
            type: "assignment",
            duration: 90,
            position: 3,
            isCompleted: false,
            isLocked: false
          }
        ]
      },
      {
        id: 3,
        title: "Natural Language Processing",
        description: "Understand and implement NLP techniques for language understanding",
        position: 3,
        lessons: [
          {
            id: 301,
            moduleId: 3,
            title: "Introduction to NLP",
            type: "video",
            duration: 50,
            position: 1,
            isCompleted: false,
            isLocked: true
          },
          {
            id: 302,
            moduleId: 3,
            title: "Word Embeddings and Language Models",
            type: "video",
            duration: 60,
            position: 2,
            isCompleted: false,
            isLocked: true
          },
          {
            id: 303,
            moduleId: 3,
            title: "Transformer Architectures",
            type: "interactive",
            duration: 70,
            position: 3,
            isCompleted: false,
            isLocked: true
          }
        ]
      }
    ]
  };
  
  const currentLessonData = getCurrentLesson();
  const currentModuleData = getCurrentModule();
  const courseData = course || mockCourse;
  
  if (!courseId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="mb-6">Sorry, the course you're looking for could not be found.</p>
        <Button onClick={() => setLocation('/courses')}>
          Return to Courses
        </Button>
      </div>
    );
  }
  
  if (isLoadingCourse) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Loading Course...</h1>
        <Progress value={30} className="w-full h-2" />
      </div>
    );
  }
  
  // When viewing course details without a specific lesson
  if (!currentLessonData) {
    return <EnhancedCourseDetail />;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top navbar */}
      <div className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-4 z-10">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => setLocation(`/courses/${courseId}`)}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Course
          </Button>
          
          <h1 className="font-medium truncate">
            {courseData.title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={!soundEnabled ? 'text-gray-400' : ''}
                  onClick={toggleSound}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab('discussion')}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Discussion</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab('resources')}
                >
                  <FileText className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Resources</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab('notes')}
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notes</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleSidebar}
                >
                  <List className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (course modules/lessons) */}
        {sidebarOpen && (
          <div className="w-80 border-r bg-gray-50 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-gray-900">Course Content</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleSidebar}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                {courseData?.modules?.length || 0} modules • {
                  courseData?.modules?.reduce((total, module) => total + module.lessons.length, 0) || 0
                } lessons
              </div>
              
              <div className="flex items-center">
                <Progress 
                  value={courseData.progress} 
                  className="h-2 flex-1" 
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {courseData.progress}%
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {courseData.modules.map((module) => (
                <div key={module.id} className="border-b">
                  <button
                    className={`w-full text-left p-4 hover:bg-gray-100 flex justify-between items-center ${
                      currentModuleId === module.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleModuleClick(module.id)}
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{module.title}</h3>
                      <p className="text-xs text-gray-500">
                        {module.lessons.length} lessons • {
                          Math.round(module.lessons.reduce((total, lesson) => total + lesson.duration, 0) / 60)
                        } hrs
                      </p>
                    </div>
                    <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                      currentModuleId === module.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                  
                  {currentModuleId === module.id && (
                    <div className="bg-blue-50/50">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          className={`w-full text-left py-3 px-4 pl-8 hover:bg-blue-100/50 flex items-start ${
                            currentLessonId === lesson.id ? 'bg-blue-100' : ''
                          } ${lesson.isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => !lesson.isLocked && handleLessonClick(lesson.id)}
                          disabled={lesson.isLocked}
                        >
                          <div className={`mr-3 mt-0.5 ${
                            lesson.isCompleted ? 'text-green-500' : lesson.isLocked ? 'text-gray-400' : 'text-blue-500'
                          }`}>
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : lesson.isLocked ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              getLessonIcon(lesson.type)
                            )}
                          </div>
                          
                          <div className="flex-1 text-sm">
                            <p className={`${
                              lesson.isCompleted ? 'text-green-800' : lesson.isLocked ? 'text-gray-500' : 'text-gray-900'
                            }`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{lesson.duration} min</span>
                              <span className="mx-1.5">•</span>
                              <span>{getLessonTypeLabel(lesson.type)}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Sidebar footer */}
            <div className="p-4 border-t bg-white">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveTab('achievements')}
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Achievements
              </Button>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Lesson content */}
          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
              <TabsContent value="content" className="mt-0 p-0 h-full">
                <div className="h-full">
                  <InteractiveLessonPlayer 
                    lessonId={currentLessonId?.toString() || ""} 
                    courseId={courseId}
                    onComplete={handleLessonComplete}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="discussion" className="mt-0 p-6 h-full">
                <h2 className="text-2xl font-bold mb-4">Lesson Discussion</h2>
                <p className="text-gray-600">
                  This is where students can discuss the lesson, ask questions, and share insights.
                </p>
                {/* Discussion forum would go here */}
                <div className="bg-gray-100 rounded-lg p-8 mt-4 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Join the Conversation</h3>
                  <p className="text-gray-600 mb-4">
                    Discuss this lesson with your fellow students and instructors.
                  </p>
                  <Button>Start a Discussion</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="resources" className="mt-0 p-6 h-full">
                <h2 className="text-2xl font-bold mb-4">Lesson Resources</h2>
                <CourseResources 
                  courseId={parseInt(courseId)} 
                  isEnrolled={true} 
                />
              </TabsContent>
              
              <TabsContent value="notes" className="mt-0 p-6 h-full">
                <h2 className="text-2xl font-bold mb-4">Your Notes</h2>
                <p className="text-gray-600 mb-4">
                  Take notes for this lesson to review later.
                </p>
                <div className="border rounded-lg p-4">
                  <textarea 
                    className="w-full h-64 p-4 rounded-md border"
                    placeholder="Type your notes here..."
                  />
                  <div className="flex justify-end mt-4">
                    <Button>Save Notes</Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="achievements" className="mt-0 p-6 h-full">
                <h2 className="text-2xl font-bold mb-4">Your Achievements</h2>
                <GamificationElements 
                  userId={1} 
                  courseId={parseInt(courseId)}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Bottom navigation bar */}
          <div className="h-16 border-t bg-white flex items-center justify-between px-6">
            <Button 
              variant="outline" 
              onClick={previousLesson}
              disabled={
                currentModuleData?.lessons[0]?.id === currentLessonId && 
                courseData.modules[0].id === currentModuleData?.id
              }
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Lesson
            </Button>
            
            <div className="text-sm text-gray-600">
              {currentModuleData && (
                <span>
                  Module {courseData.modules.findIndex(m => m.id === currentModuleData.id) + 1} / {courseData.modules.length}, 
                  Lesson {currentModuleData.lessons.findIndex(l => l.id === currentLessonId) + 1} / {currentModuleData.lessons.length}
                </span>
              )}
            </div>
            
            <Button 
              onClick={nextLesson}
              disabled={
                currentModuleData?.lessons[currentModuleData.lessons.length - 1]?.id === currentLessonId && 
                courseData.modules[courseData.modules.length - 1].id === currentModuleData?.id
              }
            >
              Next Lesson
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getLessonIcon(type: string) {
  switch (type) {
    case 'video':
      return <PlayCircle className="h-4 w-4" />;
    case 'quiz':
      return <HelpCircle className="h-4 w-4" />;
    case 'assignment':
      return <FileText className="h-4 w-4" />;
    case 'interactive':
      return <Zap className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

function getLessonTypeLabel(type: string) {
  switch (type) {
    case 'video':
      return 'Video';
    case 'quiz':
      return 'Quiz';
    case 'assignment':
      return 'Assignment';
    case 'interactive':
      return 'Interactive';
    default:
      return 'Text';
  }
}

// Import missing icons
import { 
  Trophy, 
  Lock, 
  HelpCircle,
  PlayCircle,
  Zap,
  CheckCircle as CheckCircleIcon // Renamed to avoid conflict
} from 'lucide-react';

export default CourseLearningPage;