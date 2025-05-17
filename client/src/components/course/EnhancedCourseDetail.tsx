import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, BookOpen, Users, Award, Star, 
  Brain, CheckCircle2, PlayCircle, Download, MessageSquare
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/use-sound-effects';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import VideoPlayer from './VideoPlayer';
import UserReviews from './UserReviews';
import CourseResources from './CourseResources';
import RelatedCourses from './RelatedCourses';
import LearningPathVisualizer from './LearningPathVisualizer';

// Interactive element types
interface CoursePrerequisite {
  id: number;
  title: string;
  description: string;
  completed?: boolean;
  courseUrl?: string;
}

interface CourseOutcome {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface ModuleLesson {
  id: number;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'interactive' | 'quiz' | 'assignment' | 'reading';
  completed?: boolean;
  locked?: boolean;
  previewAvailable?: boolean;
}

interface CourseModule {
  id: number;
  title: string;
  description: string;
  lessons: ModuleLesson[];
  duration: number;
  progress?: number;
}

interface Instructor {
  id: number;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  expertise: string[];
  courses: number;
  students: number;
  rating: number;
}

// Main component
const EnhancedCourseDetail = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { playSound } = useSoundEffects();
  
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewLesson, setPreviewLesson] = useState<ModuleLesson | null>(null);
  
  // Fetch course data
  const { data: course, isLoading, error } = useQuery({
    queryKey: [`/api/courses/${id}`],
  });
  
  // Fetch user enrollment and progress data
  const { data: enrollment, isLoading: isLoadingEnrollment } = useQuery({
    queryKey: [`/api/enrollments/course/${id}`],
    enabled: !!id,
  });
  
  useEffect(() => {
    if (enrollment) {
      setIsEnrolled(true);
      
      // Set the first module as active if there's progress
      if (course?.modules && course.modules.length > 0) {
        setActiveModuleId(course.modules[0].id);
      }
    }
  }, [enrollment, course]);
  
  const handleEnroll = () => {
    playSound('success');
    
    // API call to enroll user in course
    // ...
    
    toast({
      title: "Successfully enrolled!",
      description: "You have been enrolled in this course. Let's start learning!",
      variant: "default",
    });
    
    setIsEnrolled(true);
    setLocation(`/courses/${id}/learn`);
  };
  
  const handleContinueLearning = () => {
    playSound('click');
    
    // Navigate to last accessed lesson or first lesson if new
    const lastLessonId = enrollment?.currentLessonId || 
      (course?.modules[0]?.lessons[0]?.id);
      
    if (lastLessonId) {
      setLocation(`/courses/${id}/learn/${lastLessonId}`);
    } else {
      setLocation(`/courses/${id}/learn`);
    }
  };
  
  const handlePreviewLesson = (lesson: ModuleLesson) => {
    playSound('click');
    setPreviewLesson(lesson);
    setShowPreview(true);
  };
  
  const closePreview = () => {
    setShowPreview(false);
    setPreviewLesson(null);
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Course</CardTitle>
            <CardDescription>
              We encountered a problem while loading the course details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try again later or contact support if the issue persists.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation('/courses')}>
              Return to Courses
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Mock data for demonstration (in a real app, this would come from the API)
  const courseData = {
    id: id,
    title: course?.title || "Advanced AI Development",
    description: course?.description || "Learn the fundamentals and advanced concepts of artificial intelligence development.",
    coverImage: course?.coverImage || "/images/courses/ai-development.jpg",
    rating: course?.rating || 4.8,
    ratingCount: course?.ratingCount || 324,
    price: course?.price || "149.99",
    duration: course?.durationMinutes || 1800, // 30 hours
    enrollmentCount: course?.enrollmentCount || 1245,
    level: course?.difficulty || "Intermediate",
    updatedAt: course?.updatedAt || new Date("2023-11-15"),
    instructor: {
      id: 1,
      name: course?.instructor || "Dr. Sarah Chen",
      role: "AI Research Scientist",
      bio: "Dr. Chen has over 15 years of experience in AI research and development at leading tech companies and universities.",
      avatar: "/images/instructors/sarah-chen.jpg",
      expertise: ["Deep Learning", "Neural Networks", "Computer Vision"],
      courses: 7,
      students: 12450,
      rating: 4.9
    },
    modules: course?.modules || [
      {
        id: 1,
        title: "Foundations of Modern AI",
        description: "Understanding the core concepts that drive modern AI systems",
        lessons: [
          {
            id: 101,
            title: "Evolution of AI: From Rule-Based Systems to Deep Learning",
            description: "A historical perspective on AI development and key milestones",
            duration: 45,
            type: "video",
            completed: enrollment?.progress > 0,
            previewAvailable: true
          },
          {
            id: 102,
            title: "Neural Networks Fundamentals",
            description: "Core principles of neural networks and how they mimic human brain function",
            duration: 55,
            type: "video",
            completed: enrollment?.progress > 10,
            previewAvailable: false
          },
          {
            id: 103,
            title: "Knowledge Check: AI Foundations",
            description: "Test your understanding of fundamental concepts",
            duration: 20,
            type: "quiz",
            completed: enrollment?.progress > 15,
            locked: !isEnrolled
          }
        ],
        duration: 120,
        progress: enrollment?.progress > 15 ? 100 : enrollment?.progress > 10 ? 66 : enrollment?.progress > 0 ? 33 : 0
      },
      {
        id: 2,
        title: "Deep Learning Architectures",
        description: "Explore various deep learning models and their applications",
        lessons: [
          {
            id: 201,
            title: "Convolutional Neural Networks (CNNs)",
            description: "Understanding CNNs and their applications in computer vision",
            duration: 60,
            type: "video",
            completed: enrollment?.progress > 20,
            locked: !isEnrolled
          },
          {
            id: 202,
            title: "Recurrent Neural Networks (RNNs)",
            description: "Working with sequential data using RNNs",
            duration: 55,
            type: "video",
            completed: enrollment?.progress > 25,
            locked: !isEnrolled
          },
          {
            id: 203,
            title: "Hands-on: Build Your First CNN",
            description: "Practical exercise to implement and train a CNN model",
            duration: 90,
            type: "assignment",
            completed: enrollment?.progress > 30,
            locked: !isEnrolled
          }
        ],
        duration: 205,
        progress: enrollment?.progress > 30 ? 100 : enrollment?.progress > 25 ? 66 : enrollment?.progress > 20 ? 33 : 0
      }
    ],
    prerequisites: [
      {
        id: 1,
        title: "Python Programming",
        description: "Intermediate Python skills including libraries like NumPy and Pandas",
        completed: true
      },
      {
        id: 2,
        title: "Basic Machine Learning",
        description: "Understanding of ML fundamentals like regression, classification, and model evaluation",
        completed: false,
        courseUrl: "/courses/ml-fundamentals"
      },
      {
        id: 3,
        title: "Mathematics",
        description: "Linear algebra, calculus, and probability at a college level",
        completed: true
      }
    ],
    outcomes: [
      {
        id: 1,
        title: "Build Deep Learning Models",
        description: "Construct and train custom neural networks for diverse applications",
        icon: <Brain className="h-5 w-5" />
      },
      {
        id: 2,
        title: "Deploy AI Systems",
        description: "Deploy optimized models to production environments",
        icon: <CheckCircle2 className="h-5 w-5" />
      },
      {
        id: 3,
        title: "Master Advanced Techniques",
        description: "Implement cutting-edge AI techniques like transfer learning and GANs",
        icon: <Star className="h-5 w-5" />
      }
    ]
  };
  
  const totalLessons = courseData.modules.reduce(
    (sum, module) => sum + module.lessons.length, 0
  );
  
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Course preview modal */}
      <AnimatePresence>
        {showPreview && previewLesson && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">{previewLesson.title}</h3>
                <Button variant="ghost" size="sm" onClick={closePreview}>
                  Close Preview
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {previewLesson.type === 'video' && (
                  <div className="aspect-video">
                    <VideoPlayer 
                      src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
                      thumbnail="/images/courses/video-thumbnail.jpg"
                      title={previewLesson.title}
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h4 className="text-lg font-medium mb-2">About this lesson</h4>
                  <p className="text-gray-700 mb-6">{previewLesson.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{previewLesson.duration} minutes</span>
                    </div>
                    
                    {!isEnrolled && (
                      <Button onClick={handleEnroll}>
                        Enroll to Access Full Course
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column (2/3 width) */}
          <div className="md:col-span-2 space-y-8">
            {/* Course header */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-blue-600 mb-2">
                <Link href="/courses" className="hover:underline">Courses</Link>
                <span>›</span>
                <span className="text-gray-600">Advanced AI</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {courseData.title}
              </h1>
              
              <p className="text-xl text-gray-700 mb-4">
                {courseData.description}
              </p>
              
              <div className="flex flex-wrap items-center text-sm text-gray-700 gap-4 md:gap-6">
                <div className="flex items-center">
                  <div className="flex text-amber-400 mr-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(courseData.rating)
                            ? "fill-current"
                            : "fill-none"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{courseData.rating}</span>
                  <span className="text-gray-500 ml-1">({courseData.ratingCount} ratings)</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{courseData.enrollmentCount} students</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{Math.round(courseData.duration / 60)} hours</span>
                </div>
                
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{totalLessons} lessons</span>
                </div>
                
                <Badge 
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {courseData.level}
                </Badge>
                
                <div className="text-sm text-gray-500">
                  Updated {new Date(courseData.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* Course cover image */}
            <div className="rounded-xl overflow-hidden border shadow-sm bg-white">
              <img 
                src={courseData.coverImage} 
                alt={courseData.title}
                className="w-full h-auto object-cover aspect-video"
              />
            </div>
            
            {/* Course content tabs */}
            <Tabs defaultValue="curriculum" className="space-y-6">
              <TabsList className="bg-white border">
                <TabsTrigger value="curriculum">Course Content</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
              
              {/* Course Content tab */}
              <TabsContent value="curriculum" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <CardDescription>
                      {courseData.modules.length} modules • {totalLessons} lessons • {Math.round(courseData.duration / 60)} hours total length
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue={activeModuleId?.toString()}
                      className="space-y-4"
                    >
                      {courseData.modules.map((module) => (
                        <AccordionItem 
                          key={module.id} 
                          value={module.id.toString()}
                          className="border rounded-lg overflow-hidden"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full text-left">
                              <div>
                                <h3 className="font-medium text-gray-900">{module.title}</h3>
                                <p className="text-sm text-gray-500">{module.lessons.length} lessons • {Math.round(module.duration / 60)} hours</p>
                              </div>
                              
                              {isEnrolled && module.progress !== undefined && (
                                <div className="mt-2 md:mt-0 w-full md:w-32">
                                  <div className="flex items-center space-x-2">
                                    <Progress value={module.progress} className="h-2" />
                                    <span className="text-xs text-gray-500">{module.progress}%</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="border-t">
                            <ul className="divide-y">
                              {module.lessons.map((lesson) => (
                                <li key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div className="flex items-start">
                                      {/* Lesson icon based on type */}
                                      <div className="mt-0.5 mr-3">
                                        {lesson.type === 'video' && <PlayCircle className="h-5 w-5 text-blue-500" />}
                                        {lesson.type === 'quiz' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                        {lesson.type === 'assignment' && <BookOpen className="h-5 w-5 text-amber-500" />}
                                        {lesson.type === 'interactive' && <Brain className="h-5 w-5 text-purple-500" />}
                                        {lesson.type === 'reading' && <BookOpen className="h-5 w-5 text-gray-500" />}
                                      </div>
                                      
                                      <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">
                                          {lesson.title}
                                          {lesson.locked && (
                                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                              Locked
                                            </span>
                                          )}
                                          {lesson.completed && (
                                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                              Completed
                                            </span>
                                          )}
                                        </h4>
                                        <p className="text-sm text-gray-600">{lesson.description}</p>
                                        <div className="flex items-center mt-1 text-xs text-gray-500">
                                          <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" /> 
                                            {lesson.duration} min
                                          </span>
                                          
                                          {lesson.type && (
                                            <span className="ml-3 first-letter:uppercase">
                                              {lesson.type}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="ml-8 md:ml-0">
                                      {!lesson.locked && isEnrolled ? (
                                        <Button 
                                          size="sm" 
                                          variant={lesson.completed ? "outline" : "default"}
                                          className={lesson.completed ? "text-green-600" : ""}
                                          onClick={() => setLocation(`/courses/${id}/learn/${lesson.id}`)}
                                        >
                                          {lesson.completed ? "Review" : "Start"}
                                        </Button>
                                      ) : lesson.previewAvailable ? (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handlePreviewLesson(lesson)}
                                        >
                                          Preview
                                        </Button>
                                      ) : null}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Overview tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Prerequisites */}
                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                    <CardDescription>
                      Skills and knowledge required before taking this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {courseData.prerequisites.map((prerequisite) => (
                        <li key={prerequisite.id} className="flex items-start">
                          <div className={`mt-1 mr-3 h-5 w-5 rounded-full flex items-center justify-center ${
                            prerequisite.completed 
                              ? "bg-green-100 text-green-600" 
                              : "bg-amber-100 text-amber-600"
                          }`}>
                            {prerequisite.completed ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-bold">!</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{prerequisite.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{prerequisite.description}</p>
                            
                            {!prerequisite.completed && prerequisite.courseUrl && (
                              <Button 
                                variant="link" 
                                className="px-0 h-auto text-blue-600"
                                asChild
                              >
                                <Link href={prerequisite.courseUrl}>
                                  Take prerequisite course
                                </Link>
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Learning outcomes */}
                <Card>
                  <CardHeader>
                    <CardTitle>What You'll Learn</CardTitle>
                    <CardDescription>
                      Key skills and knowledge you'll gain from this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courseData.outcomes.map((outcome) => (
                        <Card key={outcome.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                {outcome.icon || <CheckCircle2 className="h-5 w-5" />}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{outcome.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{outcome.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Learning path visualization */}
                <Card>
                  <CardHeader>
                    <CardTitle>Course Learning Path</CardTitle>
                    <CardDescription>
                      Visualized progression through course modules and skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <LearningPathVisualizer 
                      courseId={parseInt(id || "0")}
                      modules={courseData.modules}
                      currentProgress={enrollment?.progress || 0}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Instructor tab */}
              <TabsContent value="instructor" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Meet Your Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="flex-shrink-0">
                        <Avatar className="h-24 w-24 border">
                          <AvatarImage src={courseData.instructor.avatar} alt={courseData.instructor.name} />
                          <AvatarFallback className="text-2xl">
                            {courseData.instructor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold">{courseData.instructor.name}</h3>
                          <p className="text-gray-600">{courseData.instructor.role}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center">
                            <div className="flex text-amber-400 mr-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(courseData.instructor.rating)
                                      ? "fill-current"
                                      : "fill-none"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{courseData.instructor.rating} Instructor Rating</span>
                          </div>
                          
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{courseData.instructor.courses} Courses</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-500" />
                            <span>{courseData.instructor.students.toLocaleString()} Students</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700">{courseData.instructor.bio}</p>
                        
                        <div className="pt-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Expertise</h4>
                          <div className="flex flex-wrap gap-2">
                            {courseData.instructor.expertise.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Reviews tab */}
              <TabsContent value="reviews">
                <UserReviews 
                  courseId={parseInt(id || "0")}
                  rating={courseData.rating}
                  ratingCount={courseData.ratingCount}
                />
              </TabsContent>
              
              {/* Resources tab */}
              <TabsContent value="resources">
                <CourseResources courseId={parseInt(id || "0")} isEnrolled={isEnrolled} />
              </TabsContent>
            </Tabs>
            
            {/* Related courses */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Courses</h2>
              <RelatedCourses 
                courseId={parseInt(id || "0")}
                category="AI & Machine Learning"
              />
            </section>
          </div>
          
          {/* Right column (1/3 width) - Course details card */}
          <div>
            <div className="sticky top-24">
              <Card className="overflow-hidden shadow-md">
                {courseData.coverImage && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={courseData.coverImage} 
                      alt={courseData.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                    />
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-bold text-gray-900">
                        {courseData.price === "0" || courseData.price === "0.00" 
                          ? "Free" 
                          : `$${parseFloat(courseData.price).toFixed(2)}`
                        }
                      </div>
                      
                      {parseFloat(courseData.price) > 0 && (
                        <div className="text-sm text-gray-500">
                          <span className="line-through">
                            ${(parseFloat(courseData.price) * 1.3).toFixed(2)}
                          </span>
                          <span className="ml-1 text-green-600 font-medium">
                            30% off
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {parseFloat(courseData.price) > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        30-day money-back guarantee
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {isEnrolled ? (
                      <Button 
                        className="w-full h-12"
                        onClick={handleContinueLearning}
                      >
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Continue Learning
                      </Button>
                    ) : (
                      <Button 
                        className="w-full h-12"
                        onClick={handleEnroll}
                      >
                        <BookOpen className="mr-2 h-5 w-5" />
                        Enroll Now
                      </Button>
                    )}
                    
                    {!isEnrolled && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          if (courseData.modules[0]?.lessons[0]?.previewAvailable) {
                            handlePreviewLesson(courseData.modules[0].lessons[0]);
                          }
                        }}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Preview Course
                      </Button>
                    )}
                  </div>
                </CardContent>
                
                <div className="px-6 pb-6">
                  <h3 className="font-medium text-gray-900 mb-3">This course includes:</h3>
                  
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <PlayCircle className="h-4 w-4 mr-3 text-gray-500" />
                      <span>{Math.round(courseData.duration / 60)} hours on-demand video</span>
                    </li>
                    <li className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-3 text-gray-500" />
                      <span>{totalLessons} lessons</span>
                    </li>
                    <li className="flex items-center">
                      <Download className="h-4 w-4 mr-3 text-gray-500" />
                      <span>12 downloadable resources</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-3 text-gray-500" />
                      <span>8 practical exercises</span>
                    </li>
                    <li className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-3 text-gray-500" />
                      <span>Full access to discussion forums</span>
                    </li>
                    <li className="flex items-center">
                      <Award className="h-4 w-4 mr-3 text-gray-500" />
                      <span>Certificate of completion</span>
                    </li>
                  </ul>
                </div>
                
                <CardFooter className="flex justify-center border-t px-6 py-4">
                  <Button variant="link" className="text-sm text-gray-600">
                    Share this course
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCourseDetail;