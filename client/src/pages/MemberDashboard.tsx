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
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.firstName || user?.username}
          </p>
        </div>
        <Button asChild>
          <Link href="/courses">Browse All Courses</Link>
        </Button>
      </div>
      
      {/* Dashboard Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingEnrollments ? (
                <span className="animate-pulse bg-muted rounded h-8 w-12 inline-block" />
              ) : (
                enrollments?.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {enrollments?.filter(e => e.completedAt).length || 0} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forum Activity</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingForum ? (
                <span className="animate-pulse bg-muted rounded h-8 w-12 inline-block" />
              ) : (
                ((forumActivity?.threads.length || 0) + (forumActivity?.replies.length || 0))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {forumActivity?.threads.length || 0} threads, {forumActivity?.replies.length || 0} replies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingEnrollments ? (
                <span className="animate-pulse bg-muted rounded h-8 w-12 inline-block" />
              ) : (
                "23.5"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              +2.5 hrs this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              5
            </div>
            <p className="text-xs text-muted-foreground">
              2 new achievements available
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="forum">Community Forum</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Learning Path</h2>
            <Link href="/courses">
              <Button variant="outline" size="sm">
                View All Courses
              </Button>
            </Link>
          </div>
          
          {isLoadingEnrollments ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
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
          ) : enrollments?.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {enrollments.slice(0, 4).map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-r from-primary/20 to-primary/10">
                    {enrollment.course?.coverImage && (
                      <img 
                        src={enrollment.course.coverImage} 
                        alt={enrollment.course.title}
                        className="object-cover h-full w-full"
                      />
                    )}
                    <div className="absolute bottom-2 right-2">
                      <Badge variant={enrollment.progress === 100 ? "success" : "secondary"}>
                        {enrollment.progress}% Complete
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{enrollment.course?.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {enrollment.course?.durationMinutes 
                        ? `${Math.round(enrollment.course.durationMinutes / 60)} hours` 
                        : 'Self-paced'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={enrollment.progress} className="h-2 mb-4" />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {enrollment.course?.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/courses/${enrollment.courseId}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/courses/${enrollment.courseId}/learn`}>
                        {enrollment.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Courses Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't enrolled in any courses yet. Browse our catalog and start your learning journey today.
              </p>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
          
          <Separator className="my-8" />
          
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-4">Recommended For You</h2>
            
            {isLoadingFeatured ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
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
              <div className="grid gap-4 md:grid-cols-3">
                {featuredCourses.slice(0, 3).map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://avatar.vercel.sh/${course.instructor}?size=32`} />
                            <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{course.instructor}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline">{course.category}</Badge>
                        <Badge variant="outline">{course.difficulty}</Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/courses/${course.id}`}>View Course</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No featured courses available
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