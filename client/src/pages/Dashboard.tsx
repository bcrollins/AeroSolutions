import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useTitle } from '@/hooks/useTitle';
import EnrolledCourses from '@/components/dashboard/EnrolledCourses';
import UserBadges from '@/components/dashboard/UserBadges';
import CourseRecommendations from '@/components/dashboard/CourseRecommendations';
import { BarChart3, Trophy, BookOpen, BookMarked } from 'lucide-react';

const Dashboard = () => {
  useTitle('Dashboard | RollinsX');
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 animate-pulse">
        <div className="h-8 w-1/4 bg-muted rounded mb-6"></div>
        <div className="h-12 w-full bg-muted rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-muted rounded"></div>
          <div className="h-40 bg-muted rounded"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view your personal dashboard and track your learning progress.
        </p>
        <a href="/api/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Log In
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-muted-foreground">
          Track your course progress, achievements and get personalized recommendations.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 md:grid-cols-4 md:w-[500px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">My Courses</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden md:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            <span className="hidden md:inline">For You</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  Enrolled Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {/* This would be dynamic in the real app */}
                  3
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Continue your learning journey
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {/* This would be dynamic in the real app */}
                  5
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Badges and certificates earned
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {/* This would be dynamic in the real app */}
                  42%
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Average completion across courses
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Continue Learning</h2>
            </div>
            <EnrolledCourses />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recommended for You</h2>
            </div>
            <CourseRecommendations />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Achievements</h2>
            </div>
            <UserBadges />
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Enrolled Courses</h2>
            <EnrolledCourses />
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Achievements</h2>
            <UserBadges />
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div>
            <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
            <p className="text-muted-foreground mb-6">
              Based on your learning patterns and interests, we think you might enjoy these courses:
            </p>
            <CourseRecommendations />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;