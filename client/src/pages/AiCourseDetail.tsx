import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, Users, Clock, Award, BookOpen, 
  CheckCircle2, PlayCircle, MessageSquare, FileText, 
  ChevronRight, Calendar, Download
} from "lucide-react";

export default function AiCourseDetail() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/ai-courses/:id");
  const courseId = params?.id ? parseInt(params.id) : null;

  // Fetch course details
  const { 
    data: course, 
    isLoading: isLoadingCourse,
    error: courseError
  } = useQuery({
    queryKey: [`/api/ai-courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch course progress (if authenticated)
  const { 
    data: progress, 
    isLoading: isLoadingProgress 
  } = useQuery({
    queryKey: [`/api/course/${courseId}/progress`],
    enabled: !!courseId && isAuthenticated,
  });

  // Fetch user enrollments
  const { 
    data: enrollments,
    isLoading: isLoadingEnrollments,
  } = useQuery({
    queryKey: ["/api/user/enrollments"],
    enabled: isAuthenticated,
  });

  // Determine if user is enrolled in this course
  const isEnrolled = enrollments?.some((enrollment: any) => 
    enrollment.courseId === courseId
  );

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/ai-courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in this course.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
      queryClient.invalidateQueries({ queryKey: [`/api/course/${courseId}/progress`] });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in this course. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update lesson progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, data }: { lessonId: number, data: any }) => {
      return apiRequest("POST", `/api/lessons/${lessonId}/progress`, data);
    },
    onSuccess: () => {
      // Invalidate progress query
      queryClient.invalidateQueries({ queryKey: [`/api/course/${courseId}/progress`] });
    },
    onError: (error: any) => {
      toast({
        title: "Progress Update Failed",
        description: error.message || "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in this course.",
        variant: "destructive",
      });
      return;
    }

    enrollMutation.mutate();
  };

  const markLessonComplete = (lessonId: number) => {
    updateProgressMutation.mutate({
      lessonId,
      data: { completed: true, progressPercentage: 100 }
    });
  };

  if (!match) {
    return <div>Course not found</div>;
  }

  if (isLoadingCourse) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          <div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 space-y-4">
          <h2 className="text-2xl font-bold">Failed to load course</h2>
          <p className="text-muted-foreground">
            We encountered an error while loading this course. Please try again later.
          </p>
          <Button asChild>
            <Link href="/ai-courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Default thumbnail image if none provided
  const defaultThumbnail = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80";

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Back button and breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Link href="/ai-courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/ai-courses" className="hover:underline">AI Courses</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-medium text-foreground truncate max-w-[200px]">
            {course.title}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Image */}
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={course.thumbnail || defaultThumbnail} 
              alt={course.title}
              className="w-full h-64 object-cover"
            />
            <Badge className="absolute top-4 right-4 bg-primary">
              {course.difficulty}
            </Badge>
          </div>
          
          {/* Course Title and Info */}
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              {course.instructorName && (
                <div className="flex items-center text-muted-foreground">
                  <span className="font-medium">Instructor:</span>
                  <span className="ml-1">{course.instructorName}</span>
                </div>
              )}
              
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{course.duration || "Self-paced"}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>{course.enrollmentCount} enrolled</span>
              </div>
              
              {isEnrolled && progress && (
                <div className="flex items-center text-muted-foreground">
                  <Award className="h-4 w-4 mr-1" />
                  <span>{progress.overallProgress.progressPercentage}% complete</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Tabs for Course Content */}
          <Tabs defaultValue="curriculum" className="space-y-6">
            <TabsList>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="space-y-4">
              <h2 className="text-2xl font-bold">Course Curriculum</h2>
              
              {!isEnrolled ? (
                <div className="rounded-lg border bg-card p-6 text-center space-y-4">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-medium">Enroll to Access Curriculum</h3>
                  <p className="text-muted-foreground">
                    Enroll in this course to access the full curriculum and learning materials.
                  </p>
                  <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>
                    {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                  </Button>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {course.modules?.map((module: any, moduleIndex: number) => (
                    <AccordionItem key={module.id} value={`module-${module.id}`}>
                      <AccordionTrigger className="hover:bg-secondary/50 px-4 rounded-md">
                        <div className="flex justify-between items-center w-full pr-4">
                          <span>
                            Module {moduleIndex + 1}: {module.title}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {module.lessons?.length || 0} lessons
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 px-4">
                        {module.lessons?.map((lesson: any, lessonIndex: number) => {
                          // Find progress for this lesson
                          const lessonProgress = isLoadingProgress 
                            ? null 
                            : progress?.modules
                                .find((m: any) => m.id === module.id)?.lessons
                                .find((l: any) => l.id === lesson.id)?.progress;
                          
                          const isCompleted = lessonProgress?.completed || false;
                          
                          return (
                            <div 
                              key={lesson.id} 
                              className="flex items-center justify-between p-3 rounded-md hover:bg-secondary/30"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <span>{moduleIndex + 1}.{lessonIndex + 1}</span>
                                  )}
                                </div>
                                <span>{lesson.title}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {lesson.duration && (
                                  <span className="text-xs text-muted-foreground">
                                    {Math.floor(lesson.duration / 60)}m
                                  </span>
                                )}
                                
                                {isCompleted ? (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                    Completed
                                  </Badge>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => markLessonComplete(lesson.id)}
                                    disabled={updateProgressMutation.isPending}
                                  >
                                    <PlayCircle className="h-4 w-4 mr-1" />
                                    Start
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Course Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{course.description}</p>
                  
                  {course.instructorName && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">About the Instructor</h3>
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                          {course.instructorName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{course.instructorName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {course.instructorBio || "Experienced instructor in this field"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Discussions Tab */}
            <TabsContent value="discussions">
              {!isEnrolled ? (
                <div className="rounded-lg border bg-card p-6 text-center space-y-4">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-medium">Enroll to Join Discussions</h3>
                  <p className="text-muted-foreground">
                    Enroll in this course to participate in discussions with instructors and fellow students.
                  </p>
                  <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>
                    {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                  </Button>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Discussions</CardTitle>
                    <CardDescription>
                      Engage with instructors and other students
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium mt-4">No discussions yet</h3>
                    <p className="text-muted-foreground mt-2">
                      Be the first to start a discussion in this course
                    </p>
                    <Button className="mt-4">Start a Discussion</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Resources Tab */}
            <TabsContent value="resources">
              {!isEnrolled ? (
                <div className="rounded-lg border bg-card p-6 text-center space-y-4">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-medium">Enroll to Access Resources</h3>
                  <p className="text-muted-foreground">
                    Enroll in this course to access downloadable materials and resources.
                  </p>
                  <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>
                    {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                  </Button>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Resources</CardTitle>
                    <CardDescription>
                      Download materials and additional resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium mt-4">No resources available</h3>
                    <p className="text-muted-foreground mt-2">
                      Resources will be added as you progress through the course
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Card */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-2xl font-bold">
                {course.price === "0" || course.price === "0.00" 
                  ? "Free" 
                  : `$${parseFloat(course.price).toFixed(2)}`
                }
              </div>
              
              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="bg-secondary p-4 rounded-md">
                    <h3 className="font-medium mb-2">Your Progress</h3>
                    {isLoadingProgress ? (
                      <Skeleton className="h-4 w-full" />
                    ) : progress ? (
                      <div className="space-y-2">
                        <Progress value={progress.overallProgress.progressPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {progress.overallProgress.completedLessons} of {progress.overallProgress.totalLessons} lessons
                          </span>
                          <span>{progress.overallProgress.progressPercentage}% complete</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Start a lesson to track your progress
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full" asChild>
                    <Link href="#curriculum">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending || !isAuthenticated}
                >
                  {enrollMutation.isPending 
                    ? "Enrolling..." 
                    : !isAuthenticated 
                      ? "Sign In to Enroll"
                      : "Enroll Now"
                  }
                </Button>
              )}
              
              {!isAuthenticated && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/api/login">Sign In</Link>
                </Button>
              )}
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{course.duration || "Self-paced learning"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{course.modules?.length || 0} modules, {course.modules?.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0) || 0} lessons</span>
                </div>
                <div className="flex items-center text-sm">
                  <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center text-sm">
                  <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Downloadable resources</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Related Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Related Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                No related courses available
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}