import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTitle } from '@/hooks/useTitle';
import { useAuth } from '@/hooks/useAuth';
import EnrolledCourses from '@/components/dashboard/EnrolledCourses';
import UserBadges from '@/components/dashboard/UserBadges';
import CourseRecommendations from '@/components/dashboard/CourseRecommendations';
import { BarChart, Award, BookmarkCheck, Clock, Calendar, Lightning, Star, ArrowRight, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { FadeIn, SlideIn, StaggerChildren } from '@/components/UI/MicroInteractions';

const Dashboard = () => {
  useTitle('Dashboard | RXAI');
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <h1 className="text-2xl font-bold mb-2">Access Required</h1>
        <p className="text-muted-foreground mb-6 text-center">
          You need to log in to view your dashboard.
        </p>
        <Link href="/api/login">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-muted rounded-md animate-pulse"></div>
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="h-32 bg-muted rounded-md animate-pulse"></div>
          <div className="h-32 bg-muted rounded-md animate-pulse"></div>
          <div className="h-32 bg-muted rounded-md animate-pulse"></div>
          <div className="h-32 bg-muted rounded-md animate-pulse"></div>
        </div>
        
        <div className="h-12 w-64 bg-muted rounded-md animate-pulse mb-8"></div>
        
        <div className="h-96 bg-muted rounded-md animate-pulse"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <SlideIn direction="down" duration={0.5}>
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || 'RXAI Member'}</h1>
            <p className="text-muted-foreground">
              Track your progress, view achievements, and discover new courses.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/courses">
              <Button className="flex items-center gap-2">
                Browse All Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>
      </SlideIn>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <FadeIn delay={0.1}>
          <Card className="border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>Courses In Progress</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>{Math.floor(Math.random() * 3) + 1}</span>
                <BookmarkCheck className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="w-full h-1 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '45%' }}></div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <p className="text-xs text-muted-foreground">45% completion rate</p>
            </CardFooter>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>Total Learning Hours</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>{Math.floor(Math.random() * 20) + 5}</span>
                <Clock className="h-5 w-5 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <p className="text-sm text-muted-foreground">+2.5 hours this week</p>
            </CardContent>
            <CardFooter className="pt-2">
              <p className="text-xs text-muted-foreground">Top 15% of learners</p>
            </CardFooter>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card className="border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>Achievements Earned</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>{Math.floor(Math.random() * 8) + 2}</span>
                <Award className="h-5 w-5 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <p className="text-sm text-muted-foreground">Next: Complete Quiz Master</p>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs text-muted-foreground">4 badges to unlock</p>
              </div>
            </CardFooter>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card className="border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>Learning Streak</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>{Math.floor(Math.random() * 7) + 3} days</span>
                <Lightning className="h-5 w-5 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 flex-1 rounded-full ${
                      i < 5 ? 'bg-purple-500' : 'bg-purple-500/20'
                    }`}
                  ></div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <p className="text-xs text-muted-foreground">Keep going! 2 more days for a reward</p>
            </CardFooter>
          </Card>
        </FadeIn>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-3 max-w-md">
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookmarkCheck className="h-4 w-4" />
                <span className="hidden sm:inline">My Courses</span>
                <span className="sm:hidden">Courses</span>
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Achievements</span>
                <span className="sm:hidden">Badges</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">For You</span>
                <span className="sm:hidden">For You</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses" className="space-y-6">
              <SlideIn direction="up">
                <h2 className="text-2xl font-semibold mb-4">My Courses</h2>
                <EnrolledCourses />
              </SlideIn>
            </TabsContent>
            
            <TabsContent value="badges" className="space-y-6">
              <SlideIn direction="up">
                <h2 className="text-2xl font-semibold mb-4">My Achievements</h2>
                <UserBadges />
              </SlideIn>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-6">
              <SlideIn direction="up">
                <h2 className="text-2xl font-semibold mb-4">Recommended For You</h2>
                <CourseRecommendations />
              </SlideIn>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <SlideIn direction="left">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Learning Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StaggerChildren staggerDelay={0.1}>
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="flex items-start gap-3 py-2">
                        <div className={`w-2 h-2 mt-2 rounded-full ${
                          ['bg-primary', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'][index % 4]
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium">
                            {[
                              'Completed Module 3 in AI Fundamentals',
                              'Earned "Quick Learner" badge',
                              'Answered 10 quiz questions correctly',
                              'Reached day 5 of learning streak'
                            ][index % 4]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[
                              '2 hours ago',
                              'Yesterday',
                              '3 days ago',
                              'This week'
                            ][index % 4]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </StaggerChildren>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/history">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Activity
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </SlideIn>
          
          <SlideIn direction="left" delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Upcoming Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(2)].map((_, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">
                          {[
                            'Live Q&A: AI Fundamentals',
                            'Advanced Neural Networks Workshop'
                          ][index % 2]}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground">
                            {[
                              'Tomorrow, 3:00 PM',
                              'Friday, 2:00 PM'
                            ][index % 2]}
                          </p>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                            Add to Calendar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/calendar">
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Schedule
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </SlideIn>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;