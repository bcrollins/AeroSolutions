import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTitle } from '@/hooks/useTitle';
import { useAuth } from '@/hooks/useAuth';
import EnrolledCourses from '@/components/dashboard/EnrolledCourses';
import UserBadges from '@/components/dashboard/UserBadges';
import CourseRecommendations from '@/components/dashboard/CourseRecommendations';
import { BarChart, Award, BookmarkCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  useTitle('Dashboard');
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
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
        </div>
        
        <div className="h-12 w-64 bg-muted rounded animate-pulse mb-8"></div>
        
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress, view achievements, and discover new courses.
        </p>
      </header>
      
      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Enrolled Courses</span>
            <span className="sm:hidden">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Achievements</span>
            <span className="sm:hidden">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Recommendations</span>
            <span className="sm:hidden">Discover</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">My Courses</h2>
          <EnrolledCourses />
        </TabsContent>
        
        <TabsContent value="badges" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">My Achievements</h2>
          <UserBadges />
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
          <CourseRecommendations />
        </TabsContent>
      </Tabs>
      
      {/* Analytics Summary Card */}
      <Card className="mt-12 p-6">
        <h3 className="text-xl font-semibold mb-4">Your Learning Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <BookmarkCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Courses Enrolled</p>
              <p className="text-2xl font-bold">{Math.floor(Math.random() * 5) + 1}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-2xl font-bold">{Math.floor(Math.random() * 10) + 1}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hours Spent Learning</p>
              <p className="text-2xl font-bold">{Math.floor(Math.random() * 20) + 5}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;