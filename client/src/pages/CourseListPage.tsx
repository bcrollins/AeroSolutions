import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Clock, BookOpen, Users, Tag } from 'lucide-react';

import type { Course } from '@/types/course';

// Sample course data
const sampleCourses: Course[] = [
  {
    id: 1,
    title: "Mastering AI Prompt Engineering",
    description: "Learn the art and science of designing effective prompts for large language models.",
    shortDescription: "Learn to effectively communicate with AI systems",
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
    instructor: {
      id: 1,
      name: "Dr. Sarah Chen",
      bio: "AI Research Scientist",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    price: "$149",
    duration: "6 weeks",
    modules: [],
    progress: 0,
    level: "intermediate",
    studentsCount: 2456,
    tags: ["AI", "Prompt Engineering", "NLP"],
    featured: true
  },
  {
    id: 2,
    title: "AI for Business Intelligence",
    description: "Discover how AI can transform your business decision-making processes.",
    shortDescription: "Harness AI for business insights",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    instructor: {
      id: 2,
      name: "Michael Rodriguez",
      bio: "Former Chief Data Officer",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    price: "$199",
    duration: "8 weeks",
    modules: [],
    progress: 0,
    level: "beginner",
    studentsCount: 1892,
    tags: ["Business Intelligence", "AI Applications"],
    featured: false
  },
  {
    id: 3,
    title: "Deep Learning Fundamentals",
    description: "Build a strong foundation in deep learning theory and practice.",
    shortDescription: "Master neural networks concepts",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    instructor: {
      id: 3,
      name: "Prof. James Liu",
      bio: "Computer Science professor",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg"
    },
    price: "$249",
    duration: "10 weeks",
    modules: [],
    progress: 0,
    level: "advanced",
    studentsCount: 1245,
    tags: ["Deep Learning", "Neural Networks"],
    featured: true
  }
];

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

const CourseListPage = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  // Use sample data for demo purposes
  const courses = sampleCourses;
  const isLoadingCourses = false;

  // Mock user enrollments for demo
  const [enrollments, setEnrollments] = useState<{userId: string; courseId: number; progress: number}[]>([]);
  const isLoadingEnrollments = false;

  // Mock enrollment mutation
  const enrollMutation = {
    mutate: (courseId: number) => {
      // Add the course to enrollments
      setEnrollments(prev => [
        ...prev,
        { userId: 'user123', courseId, progress: 0 }
      ]);
      
      // Show success toast
      toast({
        title: "Success!",
        description: "You've successfully enrolled in the course.",
      });
    },
    isPending: false
  };

  // Filter courses based on active tab
  const filteredCourses = courses.filter(course => {
    if (activeTab === 'all') return true;
    if (activeTab === 'enrolled' && isEnrolled(course.id)) return true;
    if (activeTab === 'featured' && course.featured) return true;
    return false;
  });

  // Check if user is enrolled in a course
  const isEnrolled = (courseId: number) => {
    return enrollments.some(enrollment => enrollment.courseId === courseId);
  };

  // Get course progress if enrolled
  const getCourseProgress = (courseId: number) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.progress || 0;
  };

  // Handle enrollment
  const handleEnroll = (courseId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in courses.",
        variant: "destructive",
      });
      return;
    }
    
    enrollMutation.mutate(courseId);
  };

  // Handle course click
  const handleCourseClick = (courseId: number) => {
    if (isEnrolled(courseId)) {
      navigate(`/learning/${courseId}`);
    }
  };

  if (isLoadingAuth || isLoadingCourses || (isAuthenticated && isLoadingEnrollments)) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
          <p className="text-muted-foreground">
            Browse our selection of courses and start your learning journey today
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 sm:w-[400px]">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="enrolled" disabled={!isAuthenticated}>My Courses</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredCourses.length === 0 ? (
              <Alert>
                <AlertDescription>
                  {activeTab === 'enrolled' 
                    ? "You're not enrolled in any courses yet. Browse the catalog and start learning!"
                    : "No courses found. Check back soon for new content."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card 
                    key={course.id} 
                    className={`overflow-hidden transition-all duration-200 ${
                      isEnrolled(course.id) ? 'hover:shadow-md cursor-pointer' : ''
                    }`}
                    onClick={() => isEnrolled(course.id) && handleCourseClick(course.id)}
                  >
                    {course.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={course.imageUrl} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        {course.featured && (
                          <Badge className="ml-2">Featured</Badge>
                        )}
                      </div>
                      <CardDescription>{course.shortDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {course.level && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {course.level}
                            </Badge>
                          )}
                          {course.duration && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.duration}
                            </Badge>
                          )}
                          {course.studentsCount && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {course.studentsCount} students
                            </Badge>
                          )}
                        </div>
                        {course.tags && course.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {course.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {isEnrolled(course.id) && (
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{getCourseProgress(course.id)}%</span>
                            </div>
                            <Progress value={getCourseProgress(course.id)} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {isEnrolled(course.id) ? (
                        <Button 
                          variant="default" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/learning/${course.id}`);
                          }}
                        >
                          Continue Learning
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnroll(course.id);
                          }}
                          disabled={enrollMutation.isPending}
                        >
                          {enrollMutation.isPending ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Enrolling...
                            </>
                          ) : (
                            'Enroll Now'
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseListPage;