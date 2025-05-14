import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CourseSidebar } from "@/components/courses/CourseSidebar";
import { LessonContent } from "@/components/courses/LessonContent";

export default function AiCourseLesson() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/ai-courses/:courseId/lessons/:lessonId");
  
  const courseId = params?.courseId ? parseInt(params.courseId) : null;
  const lessonId = params?.lessonId ? parseInt(params.lessonId) : null;
  
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  // Fetch course details
  const { 
    data: course, 
    isLoading: isLoadingCourse,
    error: courseError
  } = useQuery({
    queryKey: [`/api/ai-courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch course progress
  const { 
    data: progress,
    isLoading: isLoadingProgress 
  } = useQuery({
    queryKey: [`/api/ai-courses/${courseId}/progress`],
    enabled: !!courseId && isAuthenticated,
  });

  // Fetch current lesson
  const {
    data: currentLesson,
    isLoading: isLoadingLesson
  } = useQuery({
    queryKey: [`/api/ai-courses/lessons/${lessonId}`],
    enabled: !!lessonId,
  });

  // Find the current module and lesson in the course structure
  useEffect(() => {
    if (!course?.modules || !lessonId) return;
    
    for (const module of course.modules) {
      const lessonIndex = module.lessons.findIndex((l: any) => l.id === lessonId);
      if (lessonIndex !== -1) {
        setCurrentModuleId(module.id);
        break;
      }
    }
  }, [course, lessonId]);

  // Set completed lessons from progress data
  useEffect(() => {
    if (!progress?.lessonProgress) return;
    
    const completed = new Set<number>();
    for (const item of progress.lessonProgress) {
      if (item.status === 'completed') {
        completed.add(item.lessonId);
      }
    }
    setCompletedLessons(completed);
  }, [progress]);

  // Find the next lesson for navigation
  const findNextLesson = (): { moduleId: number; lessonId: number } | undefined => {
    if (!course?.modules || !currentModuleId || !lessonId) return undefined;
    
    let foundCurrent = false;
    
    // Look in the current module first
    const currentModule = course.modules.find((m: any) => m.id === currentModuleId);
    if (currentModule) {
      for (let i = 0; i < currentModule.lessons.length; i++) {
        if (foundCurrent) {
          return { moduleId: currentModuleId, lessonId: currentModule.lessons[i].id };
        }
        if (currentModule.lessons[i].id === lessonId) {
          foundCurrent = true;
        }
      }
    }
    
    // Look in subsequent modules
    const moduleIndex = course.modules.findIndex((m: any) => m.id === currentModuleId);
    if (moduleIndex !== -1 && moduleIndex < course.modules.length - 1) {
      for (let j = moduleIndex + 1; j < course.modules.length; j++) {
        if (course.modules[j].lessons.length > 0) {
          return { 
            moduleId: course.modules[j].id, 
            lessonId: course.modules[j].lessons[0].id 
          };
        }
      }
    }
    
    return undefined;
  };

  // Handle lesson selection from sidebar
  const handleLessonSelect = (moduleId: number, lessonId: number) => {
    setLocation(`/ai-courses/${courseId}/lessons/${lessonId}`);
  };

  // Handle lesson completion
  const handleLessonComplete = (lessonId: number) => {
    setCompletedLessons(prev => {
      const updated = new Set(prev);
      updated.add(lessonId);
      return updated;
    });
  };

  // Check if authentication error or course not found
  if (!isAuthenticated) {
    return (
      <div className="container max-w-6xl py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="mb-6">You need to be logged in to access this course.</p>
          <Button asChild>
            <Link href="/api/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="container max-w-6xl py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="mb-6">The course you're looking for does not exist or you don't have access to it.</p>
          <Button asChild>
            <Link href="/ai-courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingCourse || isLoadingLesson) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 shrink-0">
            <Skeleton className="h-[calc(100vh-8rem)] w-full" />
          </div>
          <div className="flex-1 space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const nextLesson = findNextLesson();
  const isCompleted = completedLessons.has(lessonId);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Course Sidebar */}
        <CourseSidebar
          courseId={courseId}
          modules={course?.modules || []}
          currentModuleId={currentModuleId}
          currentLessonId={lessonId}
          onSelectLesson={handleLessonSelect}
          completedLessons={completedLessons}
        />

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Course Navigation */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="mb-2"
              >
                <Link href={`/ai-courses/${courseId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Course Overview
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">{course?.title}</h1>
            </div>

            {/* Lesson Content */}
            {currentLesson ? (
              <LessonContent
                courseId={courseId}
                lesson={currentLesson}
                nextLesson={nextLesson}
                onComplete={handleLessonComplete}
                onNavigate={handleLessonSelect}
                isCompleted={isCompleted}
              />
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">Lesson Not Found</h2>
                <p className="mb-6">The requested lesson could not be found.</p>
                <Button asChild>
                  <Link href={`/ai-courses/${courseId}`}>Return to Course</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}