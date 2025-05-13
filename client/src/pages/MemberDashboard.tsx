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
        <TabsContent value="forum" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Community Discussions</h2>
              <p className="text-muted-foreground mt-1">Connect with other members and share insights</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700" asChild>
                <Link href="/forum" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Browse Forums
                </Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-slate-blue-600 to-electric-cyan-600 hover:from-slate-blue-700 hover:to-electric-cyan-700" asChild>
                <Link href="/forum/new" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Start Discussion
                </Link>
              </Button>
            </div>
          </div>
          
          {isLoadingForum ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-3/4">
                        <div className="h-6 bg-muted animate-pulse rounded w-full mb-2" />
                        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                      </div>
                      <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="h-4 bg-muted animate-pulse rounded w-full mb-2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  </CardContent>
                  <CardFooter className="pt-0 pb-4">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                    <div className="ml-auto h-8 w-24 bg-muted animate-pulse rounded" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : forumActivity?.threads?.length ? (
            <div className="space-y-6">
              {forumActivity.threads.slice(0, 3).map((thread) => (
                <Card key={thread.id} className="shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden">
                  <div className="border-l-4 border-electric-cyan-500" />
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <CardTitle className="line-clamp-1 text-lg font-bold text-slate-800 hover:text-electric-cyan-700 transition-colors">
                          <Link href={`/forum/threads/${thread.id}`}>{thread.title}</Link>
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <CardDescription className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span>{thread.views} views</span>
                          </CardDescription>
                          
                          <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                          
                          <CardDescription className="flex items-center gap-2 text-sm">
                            <MessageSquare className="h-4 w-4 text-slate-400" />
                            <span>{thread.replies?.length || 0} replies</span>
                          </CardDescription>
                          
                          <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                          
                          <CardDescription className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>{new Date(thread.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 self-start shrink-0">
                        {thread.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {thread.content}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-between pt-0 pb-4 border-t border-slate-100 mt-2 pt-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-slate-200">
                        <AvatarImage src={`https://avatar.vercel.sh/${thread.author || 'user'}?size=32`} />
                        <AvatarFallback className="bg-slate-blue-100 text-slate-blue-700 text-xs">
                          {(thread.author?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-600 font-medium">{thread.author || 'Anonymous'}</span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:text-electric-cyan-700 hover:border-electric-cyan-300">
                      <Link href={`/forum/threads/${thread.id}`}>View Thread</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <div className="flex justify-center mt-8">
                <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700">
                  <Link href="/forum" className="flex items-center gap-2">
                    View All Discussions
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-xl p-10 text-center bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="w-20 h-20 bg-electric-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-electric-cyan-600" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-slate-800">Join the Conversation</h3>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                You haven't participated in any discussions yet. Join our community of experts and enthusiasts to share insights, ask questions, and collaborate on solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-slate-blue-600 to-electric-cyan-600 hover:from-slate-blue-700 hover:to-electric-cyan-700">
                  <Link href="/forum/new">Start a Discussion</Link>
                </Button>
                <Button asChild variant="outline" className="bg-white">
                  <Link href="/forum">Browse Popular Topics</Link>
                </Button>
              </div>
            </div>
          )}
          
          <Separator className="my-12" />
          
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Popular Topics</h2>
                <p className="text-muted-foreground mt-1">Join these active discussions from our community</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 border-slate-300">
                <BarChart className="h-4 w-4" />
                View Trending Topics
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden group">
                <div className="bg-gradient-to-r from-slate-blue-50 to-slate-blue-100 px-4 py-3 border-b border-slate-200">
                  <Badge className="bg-slate-blue-500 text-white mb-2">High Engagement</Badge>
                  <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-slate-blue-700 transition-colors">
                    <Link href="/forum/threads/1" className="hover:underline">AI Ethics in Modern Applications</Link>
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">Ethics</Badge>
                    <Badge variant="outline" className="bg-white">AI Development</Badge>
                  </CardDescription>
                </div>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    Join the discussion on the ethical implications of AI in modern applications. How can we ensure responsible development and use of intelligent technologies?
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-blue-100 p-1 rounded-full">
                        <Users className="h-4 w-4 text-slate-blue-600" /> 
                      </div>
                      <span className="font-medium text-slate-700">42</span>
                      <span className="text-slate-500">participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-blue-100 p-1 rounded-full">
                        <MessageSquare className="h-4 w-4 text-slate-blue-600" /> 
                      </div>
                      <span className="font-medium text-slate-700">87</span>
                      <span className="text-slate-500">replies</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 flex-grow">
                    <Avatar className="h-6 w-6 border border-slate-200">
                      <AvatarImage src="https://avatar.vercel.sh/moderator?size=32" />
                      <AvatarFallback className="bg-slate-blue-100 text-slate-blue-700 text-xs">M</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-600">Moderated by <span className="font-medium">Ethics Team</span></span>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:text-slate-blue-700 hover:border-slate-blue-300" asChild>
                    <Link href="/forum/threads/1">Join Discussion</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden group">
                <div className="bg-gradient-to-r from-electric-cyan-50 to-electric-cyan-100 px-4 py-3 border-b border-slate-200">
                  <Badge className="bg-electric-cyan-500 text-white mb-2">Featured</Badge>
                  <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-electric-cyan-700 transition-colors">
                    <Link href="/forum/threads/2" className="hover:underline">Best Practices for Data Visualization</Link>
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">Data Science</Badge>
                    <Badge variant="outline" className="bg-white">UX Design</Badge>
                  </CardDescription>
                </div>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    Explore the latest trends and best practices for effective data visualization. Learn how to transform complex data into compelling visual stories.
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="bg-electric-cyan-100 p-1 rounded-full">
                        <Users className="h-4 w-4 text-electric-cyan-600" /> 
                      </div>
                      <span className="font-medium text-slate-700">36</span>
                      <span className="text-slate-500">participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-electric-cyan-100 p-1 rounded-full">
                        <MessageSquare className="h-4 w-4 text-electric-cyan-600" /> 
                      </div>
                      <span className="font-medium text-slate-700">64</span>
                      <span className="text-slate-500">replies</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 flex-grow">
                    <Avatar className="h-6 w-6 border border-slate-200">
                      <AvatarImage src="https://avatar.vercel.sh/dataviz?size=32" />
                      <AvatarFallback className="bg-electric-cyan-100 text-electric-cyan-700 text-xs">D</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-600">Moderated by <span className="font-medium">Data Viz Team</span></span>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:text-electric-cyan-700 hover:border-electric-cyan-300" asChild>
                    <Link href="/forum/threads/2">Join Discussion</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Media Library Tab */}
        <TabsContent value="media" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Premium Media Library</h2>
              <p className="text-muted-foreground mt-1">Access exclusive videos, tutorials, and other educational content</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700" asChild>
                <Link href="/media/library" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Browse All Media
                </Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-electric-cyan-600 to-slate-blue-600 hover:from-electric-cyan-700 hover:to-slate-blue-700">
                <Link href="/media/new" className="flex items-center gap-2">
                  Recent Additions
                </Link>
              </Button>
            </div>
          </div>
          
          {isLoadingMedia ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden shadow-md transition-all duration-300">
                  <div className="bg-muted h-48 animate-pulse" />
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mediaResources.slice(0, 6).map((resource) => (
                <Card key={resource.id} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 group">
                  <div className="relative h-48 bg-gradient-to-r from-electric-cyan-50 to-slate-blue-50 overflow-hidden">
                    {resource.thumbnailUrl ? (
                      <img 
                        src={resource.thumbnailUrl} 
                        alt={resource.title}
                        className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-blue-100 to-electric-cyan-100">
                        {resource.resourceType === 'video' ? (
                          <Video className="h-16 w-16 text-slate-blue-600/40" />
                        ) : resource.resourceType === 'podcast' ? (
                          <BarChart className="h-16 w-16 text-slate-blue-600/40" />
                        ) : (
                          <FileText className="h-16 w-16 text-slate-blue-600/40" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className={`${
                        resource.resourceType === 'video' 
                          ? 'bg-sunset-orange-600 hover:bg-sunset-orange-700' 
                          : resource.resourceType === 'podcast' 
                          ? 'bg-slate-blue-600 hover:bg-slate-blue-700' 
                          : 'bg-electric-cyan-600 hover:bg-electric-cyan-700'
                      } text-white px-3 py-1`}>
                        {resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="line-clamp-1 text-lg font-bold text-slate-800 group-hover:text-electric-cyan-700 transition-colors">
                        <Link href={`/media/resources/${resource.id}`} className="hover:underline">{resource.title}</Link>
                      </CardTitle>
                      {resource.premium && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 shrink-0">Premium</Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-1 text-slate-600">
                      {resource.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {`${Math.floor(resource.duration / 60)}:${String(resource.duration % 60).padStart(2, '0')}`}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px] mb-3">
                      {resource.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {resource.category && (
                        <Badge variant="outline" className="bg-slate-50 text-slate-700">{resource.category}</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0 border-t border-slate-100 mt-2 pt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-300 text-slate-700 hover:text-electric-cyan-700 hover:border-electric-cyan-300 flex items-center gap-1"
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
                    <Button asChild size="sm" className="bg-gradient-to-r from-electric-cyan-600 to-slate-blue-600 hover:from-electric-cyan-700 hover:to-slate-blue-700">
                      <Link href={`/media/resources/${resource.id}`} className="flex items-center gap-1">
                        {resource.resourceType === 'video' ? (
                          <>Watch Now <Video className="h-4 w-4 ml-1" /></>
                        ) : resource.resourceType === 'podcast' ? (
                          <>Listen Now <BarChart className="h-4 w-4 ml-1" /></>
                        ) : (
                          <>View Resource <FileText className="h-4 w-4 ml-1" /></>
                        )}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-xl p-10 text-center bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="w-20 h-20 bg-slate-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="h-10 w-10 text-slate-blue-600" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-slate-800">Premium Media Library</h3>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                Access our exclusive library of videos, podcasts, and presentations to enhance your learning experience with high-quality educational content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-slate-blue-600 to-electric-cyan-600 hover:from-slate-blue-700 hover:to-electric-cyan-700">
                  <Link href="/media/library">Browse Media</Link>
                </Button>
                <Button asChild variant="outline" className="bg-white">
                  <Link href="/media/featured">Featured Content</Link>
                </Button>
              </div>
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
        <TabsContent value="resources" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Downloadable Resources</h2>
              <p className="text-muted-foreground mt-1">Premium guides, templates, and tools to accelerate your projects</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700" asChild>
                <Link href="/resources" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Browse All Resources
                </Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-slate-blue-600 to-electric-cyan-600 hover:from-slate-blue-700 hover:to-electric-cyan-700">
                <Link href="/resources/popular" className="flex items-center gap-2">
                  Most Popular
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: 1,
                title: "Ultimate AI Prompt Engineering Guide",
                description: "Learn the principles of effective prompt engineering for better AI results. This comprehensive guide covers all aspects from basic to advanced techniques.",
                type: "PDF",
                icon: "FileText",
                size: "2.4 MB",
                downloads: 2589,
                category: "AI Development",
                color: "slate-blue"
              },
              {
                id: 2,
                title: "Data Visualization Cheat Sheet",
                description: "Quick reference for creating impactful data visualizations. Includes best practices, tool recommendations, and design principles.",
                type: "PDF",
                icon: "BarChart",
                size: "1.1 MB",
                downloads: 1832,
                category: "Data Science",
                color: "electric-cyan"
              },
              {
                id: 3,
                title: "Advanced ML Algorithm Templates",
                description: "Ready-to-use templates for common machine learning algorithms. Implement complex models quickly with these expert-designed frameworks.",
                type: "ZIP",
                icon: "FileCode",
                size: "5.7 MB",
                downloads: 967,
                category: "Machine Learning",
                color: "sunset-orange"
              }
            ].map((resource) => (
              <Card key={resource.id} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 group">
                <div className={`bg-gradient-to-r from-${resource.color}-50 to-${resource.color}-100 px-4 py-3 border-b border-slate-200`}>
                  <div className="flex justify-between items-center">
                    <Badge className={`bg-${resource.color}-600 text-white mb-0`}>
                      {resource.type}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText className="h-4 w-4" />
                      {resource.size}
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-lg font-bold text-slate-800 group-hover:text-slate-blue-700 transition-colors">
                    <Link href={`/resources/${resource.id}`} className="hover:underline">{resource.title}</Link>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-slate-50 text-slate-700">{resource.category}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px] mb-4">
                    {resource.description}
                  </p>
                  <div className="flex items-center text-sm text-slate-600">
                    <div className={`p-1 rounded-full mr-2 bg-${resource.color}-100`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-${resource.color}-600`}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </div>
                    <span className="font-medium">{resource.downloads.toLocaleString()}</span>
                    <span className="ml-1">downloads</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0 border-t border-slate-100 mt-2 pt-3">
                  <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:text-slate-blue-700 hover:border-slate-blue-300 flex-1 mr-2">
                    <Link href={`/resources/${resource.id}/preview`}>
                      Preview
                    </Link>
                  </Button>
                  <Button asChild size="sm" className={`bg-gradient-to-r from-${resource.color}-600 to-${resource.color}-700 hover:from-${resource.color}-700 hover:to-${resource.color}-800 flex-1 flex items-center justify-center gap-2`}>
                    <Link href={`/resources/${resource.id}`}>
                      Download
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </Link>
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