import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, BookOpen, Play, CheckCircle, Star, Users, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RelatedCourses from '@/components/recommendations/RelatedCourses';
import useRecommendationTracker from '@/hooks/useRecommendationTracker';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { toast } = useToast();
  const { trackCourseView } = useRecommendationTracker();

  const { data: course, isLoading, error } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course details');
      return response.json();
    },
  });

  useEffect(() => {
    if (course && !isLoading) {
      // Track that the user viewed this course (for recommendation improvements)
      trackCourseView(courseId);
    }
  }, [course, courseId, isLoading, trackCourseView]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <div className="mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the course you're looking for. It may have been removed or the URL might be incorrect.</p>
          <Button onClick={() => window.location.href = '/courses'}>
            Browse Courses
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{isLoading ? 'Loading Course...' : `${course.title} | AI Learning Platform`}</title>
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <div className="flex items-center space-x-1 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.round(course.rating || 0) ? 'fill-current' : ''}`} />
                  ))}
                  <span className="text-gray-700 ml-2">({course.ratingCount || 0} ratings)</span>
                </div>
                <p className="text-gray-600">{course.description}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-3">What you'll learn</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(course.objectives || []).map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Tabs defaultValue="content" className="mb-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="content">Course Content</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div className="text-sm text-gray-500 mb-2">
                    {course.moduleCount || 5} modules • {course.lessonCount || 15} lessons • {course.durationMinutes || 120} min total length
                  </div>

                  {(course.modules || Array(3).fill({})).map((module, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="py-3 px-4 bg-gray-50">
                        <CardTitle className="text-lg">{module.title || `Module ${index + 1}: Introduction`}</CardTitle>
                        <CardDescription className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {module.durationMinutes || 20} min
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="space-y-2">
                          {(module.lessons || Array(3).fill({})).map((lesson, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div className="flex items-center">
                                <Play className="h-4 w-4 mr-2 text-blue-500" />
                                <span>{lesson.title || `Lesson ${idx + 1}: Understanding the Basics`}</span>
                              </div>
                              <span className="text-sm text-gray-500">{lesson.durationMinutes || 7} min</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="requirements">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3">Prerequisites</h3>
                      <ul className="space-y-2">
                        {(course.prerequisites || [
                          "Basic understanding of programming concepts",
                          "Familiarity with Python is recommended but not required",
                          "No advanced math is needed - we'll cover the necessary concepts"
                        ]).map((prereq, idx) => (
                          <li key={idx} className="flex items-start">
                            <ArrowRight className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="instructor">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-16 w-16 mr-4">
                          <AvatarImage src={course.instructorAvatar || "https://github.com/shadcn.png"} />
                          <AvatarFallback>{course.instructor?.charAt(0) || "AI"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-bold">{course.instructor || "AI Learning Expert"}</h3>
                          <div className="text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {course.instructorStudents || 1240} Students
                            </span>
                            <span className="flex items-center mt-1">
                              <BookOpen className="h-4 w-4 mr-1" />
                              {course.instructorCourses || 5} Courses
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{course.instructorBio || "Experienced instructor with years of industry experience in AI and machine learning. Passionate about making complex topics accessible to learners of all levels."}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Related Courses - "You might also like" section */}
          {!isLoading && courseId && (
            <>
              <div className="mb-12">
                <RelatedCourses courseId={courseId} limit={3} title="You might also like" showReasonForRecommendation={true} />
              </div>
              
              {/* Show seasonal recommendations as additional discovery option */}
              <div className="mb-6">
                <TrendingRecommendations limit={4} />
              </div>
            </>
          )}
        </div>

        {/* Sidebar - 1/3 width on desktop, full width on mobile */}
        <div>
          <Card className="sticky top-4">
            {isLoading ? (
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-10 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            ) : (
              <>
                <div className="relative">
                  <img 
                    src={course.coverImage || "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&q=80&w=1074"} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all duration-300">
                      <Play className="h-8 w-8 text-blue-600" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-3xl font-bold mb-1">${course.price || 49.99}</div>
                    <div className="flex items-center mb-4">
                      <span className="text-gray-500 line-through mr-2">${course.regularPrice || 199.99}</span>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        {course.discount || 75}% off
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Sale ends in 2 days</span>
                    </div>
                  </div>

                  <Button className="w-full mb-3 py-6 text-lg">Enroll Now</Button>
                  <Button variant="outline" className="w-full mb-6">Add to Wishlist</Button>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full lifetime access</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Access on mobile and desktop</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificate of completion</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Difficulty:</span>
                      <span>{course.difficulty || "Intermediate"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span>
                      <span>{course.category || "AI & Machine Learning"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Last Updated:</span>
                      <span>{course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "May 12, 2025"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Language:</span>
                      <span>{course.language || "English"}</span>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;