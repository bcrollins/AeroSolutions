import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/loading-spinner';

import { Clock, BookOpen, Award, Users, Tag, Star } from 'lucide-react';

import type { Course } from '@/types/course';

const CourseCatalogPage = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch all courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/learning/courses'],
  });

  // Fetch user enrollments if authenticated
  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<any[]>({
    queryKey: ['/api/learning/enrollments'],
    enabled: isAuthenticated,
  });

  // Create enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/learning/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to enroll in course');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate enrollments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/learning/enrollments'] });
      toast({
        title: "Success!",
        description: "You've successfully enrolled in the course.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter courses based on active tab
  const filteredCourses = courses.filter(course => {
    if (activeTab === 'all') return true;
    if (activeTab === 'enrolled' && enrollments.some(e => e.courseId === course.id)) return true;
    if (activeTab === 'featured' && course.featured) return true;
    if (activeTab === 'new' && isNewCourse(course)) return true;
    return false;
  });

  // Check if a course is new (less than 30 days old)
  const isNewCourse = (course: Course) => {
    const courseDate = new Date(course.createdAt || Date.now());
    const daysAgo = Math.floor((Date.now() - courseDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo < 30;
  };

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
          <TabsList className="grid grid-cols-4 sm:w-[400px]">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="enrolled" disabled={!isAuthenticated}>My Courses</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
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
                        {isNewCourse(course) && (
                          <Badge variant="outline" className="ml-2">New</Badge>
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

export default CourseCatalogPage;