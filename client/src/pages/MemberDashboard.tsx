import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, BookOpen, FileText, MessageSquare, Video, Clock, Award, Users, Bookmark 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/ui/loader';

const MemberDashboard = () => {
  const [location, setLocation] = useLocation();
  const { user, isLoading: isLoadingAuth, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // If not authenticated, redirect to login
  if (!isLoadingAuth && !isAuthenticated) {
    toast({
      title: "Authentication Required",
      description: "Please log in to access the member dashboard",
      variant: "destructive",
    });
    setLocation('/');
    return null;
  }
  
  // Fetch user enrollments
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['/api/courses/user/enrollments'],
    enabled: isAuthenticated,
  });
  
  // Fetch forum activity
  const { data: forumActivity, isLoading: isLoadingForum } = useQuery({
    queryKey: ['/api/forum/user/activity'],
    enabled: isAuthenticated,
  });
  
  // Fetch media resources
  const { data: mediaResources, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['/api/media/resources'],
    enabled: isAuthenticated,
  });
  
  // Fetch featured courses
  const { data: featuredCourses, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['/api/courses', { featured: true }],
  });
  
  if (isLoadingAuth) {
    return <Loader />;
  }
  
  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Member Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-medium text-primary">{user?.firstName || user?.username}</span>
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-slate-blue-600 to-electric-cyan-600 hover:from-slate-blue-700 hover:to-electric-cyan-700 transition-all duration-300 hover:shadow-lg self-center md:self-auto">
          <Link href="/courses">Browse All Courses</Link>
        </Button>
      </div>
      
      {/* Dashboard Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <div className="h-8 w-8 rounded-full bg-slate-blue-100 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-slate-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingEnrollments ? (
                <span className="animate-pulse bg-muted rounded h-8 w-12 inline-block" />
              ) : (
                enrollments?.length || 0
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              {enrollments?.filter(e => e.completedAt).length || 0} completed
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forum Activity</CardTitle>
            <div className="h-8 w-8 rounded-full bg-electric-cyan-100 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-electric-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingForum ? (
                <span className="animate-pulse bg-muted rounded h-8 w-12 inline-block" />
              ) : (
                ((forumActivity?.threads.length || 0) + (forumActivity?.replies.length || 0))
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              {forumActivity?.threads.length || 0} threads, {forumActivity?.replies.length || 0} replies
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <div className="h-8 w-8 rounded-full bg-sunset-orange-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-sunset-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingEnrollments ? (
                <span className="animate-pulse bg-muted rounded h-8 w-12 inline-block" />
              ) : (
                "23.5"
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-sunset-orange-500 mr-2"></span>
              +2.5 hrs this week
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Award className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              5
            </div>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
              2 new achievements available
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="courses" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
            <TabsTrigger value="courses" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-slate-blue-600 data-[state=active]:to-electric-cyan-600 data-[state=active]:text-white transition-all duration-300">
              <BookOpen className="h-4 w-4" />
              <span>My Courses</span>
            </TabsTrigger>
            <TabsTrigger value="forum" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-slate-blue-600 data-[state=active]:to-electric-cyan-600 data-[state=active]:text-white transition-all duration-300">
              <MessageSquare className="h-4 w-4" />
              <span>Community</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-slate-blue-600 data-[state=active]:to-electric-cyan-600 data-[state=active]:text-white transition-all duration-300">
              <Video className="h-4 w-4" />
              <span>Media</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-slate-blue-600 data-[state=active]:to-electric-cyan-600 data-[state=active]:text-white transition-all duration-300">
              <FileText className="h-4 w-4" />
              <span>Resources</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">My Learning Path</h2>
              <p className="text-muted-foreground mt-1">Continue your educational journey with these courses</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" />
                View All Courses
              </Button>
            </Link>
          </div>
          
          {isLoadingEnrollments ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardHeader>
                    <div className="h-6 bg-muted animate-pulse rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted animate-pulse rounded w-full mb-2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : enrollments?.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {enrollments.slice(0, 4).map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200">
                  <div className="relative h-48 bg-gradient-to-r from-slate-blue-50 to-electric-cyan-50">
                    {enrollment.course?.coverImage ? (
                      <img 
                        src={enrollment.course.coverImage} 
                        alt={enrollment.course.title}
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-blue-100 to-electric-cyan-100">
                        <BookOpen className="h-16 w-16 text-slate-blue-600/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 right-3">
                      <Badge variant={enrollment.progress === 100 ? "success" : "secondary"} 
                             className={`${enrollment.progress === 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-blue-600 hover:bg-slate-blue-700'} text-white px-3 py-1`}>
                        {enrollment.progress}% Complete
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold text-slate-800">{enrollment.course?.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-500" />
                      {enrollment.course?.durationMinutes 
                        ? `${Math.round(enrollment.course.durationMinutes / 60)} hours` 
                        : 'Self-paced'}
                      
                      <span className="inline-block w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                      
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-500" />
                        {Math.floor(Math.random() * 900) + 100} enrolled
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 font-medium">Progress</span>
                        <span className="text-slate-800 font-semibold">{enrollment.progress}%</span>
                      </div>
                      <Progress 
                        value={enrollment.progress} 
                        className="h-2 bg-slate-100" 
                        indicatorClassName={enrollment.progress === 100 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-slate-blue-500 to-electric-cyan-500"} 
                      />
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {enrollment.course?.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:text-slate-blue-700 hover:border-slate-blue-300">
                      <Link href={`/courses/${enrollment.courseId}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-gradient-to-r from-slate-blue-600 to-electric-cyan-600 hover:from-slate-blue-700 hover:to-electric-cyan-700">
                      <Link href={`/courses/${enrollment.courseId}/learn`}>
                        {enrollment.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-xl p-10 text-center bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="w-20 h-20 bg-slate-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-slate-blue-600" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-slate-800">No Courses Yet</h3>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                You haven't enrolled in any courses yet. Browse our catalog and start your learning journey today with our expert-led premium courses.
              </p>
              <Button asChild className="bg-gradient-to-r from-slate-blue-600 to-electric-cyan-600 hover:from-slate-blue-700 hover:to-electric-cyan-700 px-6 py-2">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
          
          <Separator className="my-12" />
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Recommended For You</h2>
                <p className="text-muted-foreground mt-1">Personalized course suggestions based on your interests</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart className="h-4 w-4" />
                View All Recommendations
              </Button>
            </div>
            
            {isLoadingFeatured ? (
              <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="h-40 bg-muted animate-pulse" />
                    <CardHeader>
                      <div className="h-6 bg-muted animate-pulse rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted animate-pulse rounded w-full mb-2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredCourses?.length ? (
              <div className="grid gap-6 md:grid-cols-3">
                {featuredCourses.slice(0, 3).map((course) => (
                  <Card key={course.id} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 group">
                    <div className="relative h-40 bg-gradient-to-r from-electric-cyan-50 to-slate-blue-50 overflow-hidden">
                      {course.coverImage ? (
                        <img 
                          src={course.coverImage} 
                          alt={course.title}
                          className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-blue-100 to-electric-cyan-100">
                          <BookOpen className="h-16 w-16 text-slate-blue-600/40" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-electric-cyan-600 hover:bg-electric-cyan-700 text-white">
                          {course.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="line-clamp-1 text-lg font-bold text-slate-800">{course.title}</CardTitle>
                        <Badge variant="outline" className="ml-2 shrink-0 bg-slate-50">{course.category}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Avatar className="h-6 w-6 border border-slate-200">
                          <AvatarImage src={`https://avatar.vercel.sh/${course.instructor}?size=32`} />
                          <AvatarFallback className="bg-slate-blue-100 text-slate-blue-700 text-xs font-medium">{course.instructor.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-600">{course.instructor}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4 min-h-[40px]">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>{course.durationMinutes ? `${Math.round(course.durationMinutes / 60)} hours` : 'Self-paced'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array(5).fill(0).map((_, i) => (
                            <span key={i} className={`h-4 w-4 ${i < (course.rating || 4.5) ? 'text-amber-500' : 'text-slate-200'}`}>★</span>
                          ))}
                          <span className="text-slate-600 ml-1">({course.reviewCount || Math.floor(Math.random() * 100) + 50})</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-4">
                      <Button asChild className="w-full bg-gradient-to-r from-electric-cyan-600 to-slate-blue-600 hover:from-electric-cyan-700 hover:to-slate-blue-700 transition-all duration-300">
                        <Link href={`/courses/${course.id}`}>
                          <span className="flex items-center justify-center gap-2">
                            View Course <Bookmark className="h-4 w-4 ml-1" />
                          </span>
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border rounded-xl p-8 text-center bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="w-16 h-16 bg-slate-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-slate-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-slate-800">No Recommendations Yet</h3>
                <p className="text-slate-600 mb-4 max-w-md mx-auto">
                  Complete your profile or interact with more content to receive personalized recommendations.
                </p>
                <Button variant="outline" className="bg-white">Explore Popular Courses</Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Community Forum Tab */}
        <TabsContent value="forum" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Community Discussions</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/forum">View All Topics</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/forum/new">Start Discussion</Link>
              </Button>
            </div>
          </div>
          
          {isLoadingForum ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted animate-pulse rounded w-full mb-2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : forumActivity?.threads?.length ? (
            <div className="space-y-4">
              {forumActivity.threads.slice(0, 3).map((thread) => (
                <Card key={thread.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle className="line-clamp-1">{thread.title}</CardTitle>
                      <Badge variant="outline">{thread.category}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {thread.views} views
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {thread.content}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <div className="text-sm text-muted-foreground">
                      Posted {new Date(thread.createdAt).toLocaleDateString()}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/forum/threads/${thread.id}`}>View Thread</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Join the Conversation</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't participated in any forum discussions yet. Share your thoughts or questions with our community.
              </p>
              <Button asChild>
                <Link href="/forum/new">Start a Discussion</Link>
              </Button>
            </div>
          )}
          
          <Separator className="my-8" />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Ethics in Modern Applications</CardTitle>
                  <CardDescription>High engagement discussion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" /> 
                    <span>42 participants</span>
                    <MessageSquare className="h-4 w-4 ml-4" /> 
                    <span>87 replies</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/forum/threads/1">Join Discussion</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Best Practices for Data Visualization</CardTitle>
                  <CardDescription>Featured discussion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" /> 
                    <span>36 participants</span>
                    <MessageSquare className="h-4 w-4 ml-4" /> 
                    <span>64 replies</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/forum/threads/2">Join Discussion</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Media Library Tab */}
        <TabsContent value="media" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Premium Media Library</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/media/library">View All Media</Link>
            </Button>
          </div>
          
          {isLoadingMedia ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="bg-muted h-40 animate-pulse" />
                  <CardHeader>
                    <div className="h-6 bg-muted animate-pulse rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted animate-pulse rounded w-full mb-2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mediaResources?.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mediaResources.slice(0, 6).map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-r from-primary/20 to-primary/10">
                    {resource.thumbnailUrl ? (
                      <img 
                        src={resource.thumbnailUrl} 
                        alt={resource.title}
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        {resource.resourceType === 'video' ? (
                          <Video className="h-12 w-12 text-primary/40" />
                        ) : resource.resourceType === 'podcast' ? (
                          <BarChart className="h-12 w-12 text-primary/40" />
                        ) : (
                          <FileText className="h-12 w-12 text-primary/40" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge>
                        {resource.resourceType}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{resource.title}</CardTitle>
                    <CardDescription>
                      {resource.duration
                        ? `${Math.floor(resource.duration / 60)}:${String(resource.duration % 60).padStart(2, '0')}`
                        : 'Variable length'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {resource.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{resource.category}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => {
                        toast({
                          title: "Resource saved",
                          description: "Media resource saved to your bookmarks",
                        });
                      }}
                    >
                      <Bookmark className="h-4 w-4" />
                      Save
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/media/resources/${resource.id}`}>View Resource</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Premium Media Library</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Access our exclusive library of videos, podcasts, and presentations to enhance your learning experience.
              </p>
              <Button asChild>
                <Link href="/media/library">Browse Media</Link>
              </Button>
            </div>
          )}
          
          <Separator className="my-8" />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Featured Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['AI Research', 'Data Science', 'Design Principles', 'Programming'].map((category) => (
                <Card key={category} className="overflow-hidden group hover:border-primary/50 transition-colors">
                  <Link href={`/media/library?category=${encodeURIComponent(category)}`} className="block">
                    <CardHeader>
                      <CardTitle className="text-base text-center">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-24 rounded bg-gradient-to-r from-primary/10 to-primary/30 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/40 transition-colors">
                        {category === 'AI Research' ? (
                          <BarChart className="h-8 w-8 text-primary/60" />
                        ) : category === 'Data Science' ? (
                          <BarChart className="h-8 w-8 text-primary/60" />
                        ) : category === 'Design Principles' ? (
                          <FileText className="h-8 w-8 text-primary/60" />
                        ) : (
                          <Video className="h-8 w-8 text-primary/60" />
                        )}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Downloadable Resources</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/resources">View All Resources</Link>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: 1,
                title: "Ultimate AI Prompt Engineering Guide",
                description: "Learn the principles of effective prompt engineering for better AI results.",
                type: "PDF",
                size: "2.4 MB",
                downloads: 2589
              },
              {
                id: 2,
                title: "Data Visualization Cheat Sheet",
                description: "Quick reference for creating impactful data visualizations.",
                type: "PDF",
                size: "1.1 MB",
                downloads: 1832
              },
              {
                id: 3,
                title: "Advanced ML Algorithm Templates",
                description: "Ready-to-use templates for common machine learning algorithms.",
                type: "ZIP",
                size: "5.7 MB",
                downloads: 967
              }
            ].map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{resource.title}</CardTitle>
                  <CardDescription>
                    {resource.type} • {resource.size}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {resource.description}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {resource.downloads.toLocaleString()} downloads
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/resources/${resource.id}`}>Download</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberDashboard;