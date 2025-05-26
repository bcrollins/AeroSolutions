import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Video, FileText, Clock, Award, Check, Play, Lock, Star, Users, BarChart, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'exercise' | 'project';
  duration: number; // in minutes
  url: string;
  locked?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  completed?: boolean;
  duration: number; // in minutes
  locked?: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  progress?: number; // 0-100
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorTitle: string;
  instructorImage?: string;
  duration: number; // total hours
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  rating: number; // out of 5
  enrollments: number;
  tags: string[];
  modules: Module[];
  learningOutcomes: string[];
  prerequisites: string[];
  completionCertificate: boolean;
  lastUpdated: string; // date string
}

interface ComprehensiveCourseViewProps {
  course: Course;
  activeModuleId?: string;
  activeLessonId?: string;
}

const ComprehensiveCourseView: React.FC<ComprehensiveCourseViewProps> = ({
  course,
  activeModuleId,
  activeLessonId
}) => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Calculate overall course progress
  const calculateOverallProgress = (): number => {
    if (!course.modules || course.modules.length === 0) return 0;
    
    const moduleProgressSum = course.modules.reduce((sum, module) => 
      sum + (module.progress || 0), 0);
      
    return Math.round(moduleProgressSum / course.modules.length);
  };
  
  // Handle enrollment
  const handleEnroll = () => {
    if (!isAuthenticated) {
      // Redirect to login
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in this course.",
        variant: "default",
      });
      
      // Store intended action in session/local storage for redirect after login
      localStorage.setItem('post_auth_action', JSON.stringify({
        type: 'course_enroll',
        courseId: course.id
      }));
      
      window.location.href = '/api/login';
      return;
    }
    
    // Handle enrollment API call here
    toast({
      title: "Enrollment Successful",
      description: "You've been enrolled in the course. Let's start learning!",
      variant: "default",
    });
    
    // Redirect to first lesson
    if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      const firstModule = course.modules[0];
      const firstLesson = firstModule.lessons[0];
      setLocation(`/courses/${course.id}/modules/${firstModule.id}/lessons/${firstLesson.id}`);
    }
  };
  
  // Handle continue learning
  const handleContinueLearning = () => {
    // This would typically find the last accessed lesson from user progress data
    // For now, we'll just go to the first incomplete lesson
    
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.completed && !lesson.locked) {
          setLocation(`/courses/${course.id}/modules/${module.id}/lessons/${lesson.id}`);
          return;
        }
      }
    }
    
    // If all lessons are complete or there are no lessons, go to the first lesson
    if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      const firstModule = course.modules[0];
      const firstLesson = firstModule.lessons[0];
      setLocation(`/courses/${course.id}/modules/${firstModule.id}/lessons/${firstLesson.id}`);
    }
  };
  
  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };
  
  // Get resource icon based on type
  const getResourceIcon = (type: Resource['type']) => {
    switch(type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'quiz': return <FileText className="h-4 w-4" />;
      case 'exercise': return <Play className="h-4 w-4" />;
      case 'project': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="mt-2 text-gray-600 max-w-3xl">{course.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {course.level}
              </Badge>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-1 h-4 w-4" />
                <span>{formatDuration(course.duration * 60)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="mr-1 h-4 w-4" />
                <span>{course.enrollments.toLocaleString()} students</span>
              </div>
              
              <div className="flex items-center text-sm text-amber-600">
                <Star className="mr-1 h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Last updated: {course.lastUpdated}
              </div>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            {isAuthenticated ? (
              <>
                <Button onClick={handleContinueLearning} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Continue Learning
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Saved
                </Button>
              </>
            ) : (
              <Button onClick={handleEnroll} className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Enroll in Course
              </Button>
            )}
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm text-gray-600">{calculateOverallProgress()}%</span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-2" />
          </div>
        )}
      </div>
      
      {/* Course Content */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              {course.prerequisites.length === 0 ? (
                <p>No specific prerequisites for this course.</p>
              ) : (
                <ul className="space-y-2">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 mr-2" />
                      <span>{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          
          {course.completionCertificate && (
            <Card>
              <CardHeader>
                <CardTitle>Certification</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <Award className="h-12 w-12 text-purple-500" />
                <div>
                  <h3 className="font-medium">Certificate of Completion</h3>
                  <p className="text-gray-600">Earn a certificate upon successful completion of the course</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Course Content</h2>
            <div className="text-sm text-gray-600">
              {course.modules.length} modules • {course.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons • 
              {formatDuration(course.duration * 60)} total
            </div>
          </div>
          
          <Accordion type="multiple" className="space-y-4">
            {course.modules.map((module, moduleIndex) => (
              <AccordionItem
                key={module.id}
                value={module.id}
                className="border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-4 hover:bg-gray-50">
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between text-left">
                    <div>
                      <span className="font-medium">Module {moduleIndex + 1}: {module.title}</span>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    </div>
                    <div className="flex items-center mt-2 sm:mt-0">
                      {module.progress !== undefined && (
                        <div className="flex items-center mr-4">
                          <Progress value={module.progress} className="h-2 w-20 mr-2" />
                          <span className="text-xs">{module.progress}%</span>
                        </div>
                      )}
                      <span className="text-sm text-gray-600">
                        {module.lessons.length} lessons
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pt-1 pb-0">
                  <ul className="divide-y">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <li key={lesson.id} className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <Link href={`/courses/${course.id}/modules/${module.id}/lessons/${lesson.id}`}>
                            <a className="flex flex-1 items-start">
                              <div className="flex-shrink-0 mr-3 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs">
                                {lesson.completed ? (
                                  <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  lessonIndex + 1
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">{lesson.title}</span>
                                  {lesson.locked && <Lock className="h-3.5 w-3.5 text-gray-400" />}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>

                                {lesson.resources.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {lesson.resources.map((resource, resourceIndex) => (
                                      <div key={resource.id} className="flex items-center text-xs text-gray-500">
                                        {getResourceIcon(resource.type)}
                                        <span className="ml-1">
                                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                          {resource.duration > 0 && ` · ${resource.duration} min`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </a>
                          </Link>
                          <div className="flex-shrink-0 flex items-center text-sm text-gray-500 ml-2">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {formatDuration(lesson.duration)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        
        {/* Instructor Tab */}
        <TabsContent value="instructor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-shrink-0">
                  {course.instructorImage ? (
                    <img 
                      src={course.instructorImage} 
                      alt={course.instructor} 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-3xl font-medium text-gray-500">
                        {course.instructor.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{course.instructor}</h3>
                  <p className="text-gray-600">{course.instructorTitle}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-gray-500 mr-1" />
                      <span>15 Courses</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-500 mr-1" />
                      <span>10.5k Students</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-amber-500 mr-1" />
                      <span>4.8 Rating</span>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">
                    Expert AI instructor with over 15 years of experience in the field of artificial intelligence, 
                    machine learning, and data science. Passionate about making complex topics accessible and 
                    enjoyable for learners of all levels.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Student Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center flex-col">
                    <div className="text-5xl font-bold">{course.rating.toFixed(1)}</div>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-5 w-5 ${star <= Math.round(course.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Based on {course.enrollments / 10} reviews
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      // Mock data for rating distribution
                      const percentage = star === 5 ? 68 : 
                                        star === 4 ? 24 : 
                                        star === 3 ? 6 : 
                                        star === 2 ? 1 : 1;
                      
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <div className="flex items-center w-12">
                            <span>{star}</span>
                            <Star className="h-3.5 w-3.5 ml-1 text-amber-500 fill-amber-500" />
                          </div>
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="w-8 text-right text-sm text-gray-600">
                            {percentage}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Student Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-center text-gray-500">
                      Student reviews will appear here once the course has received feedback.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Related Courses */}
      {activeTab === 'overview' && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* This would show related courses - mock data for now */}
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-blue-100 to-indigo-100"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Advanced NLP Techniques</CardTitle>
                  <CardDescription>Master the latest in natural language processing</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>12 hr</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="mr-1 h-4 w-4" />
                      <span>15 lessons</span>
                    </div>
                    <div className="flex items-center text-amber-600">
                      <Star className="mr-1 h-4 w-4 fill-amber-500 text-amber-500" />
                      <span>4.9</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Course</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveCourseView;