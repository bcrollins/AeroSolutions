import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { 
  Settings, 
  History, 
  BookOpen, 
  TrendingUp, 
  Sparkles,
  UserPlus,
  RefreshCw,
  CirclePlus
} from 'lucide-react';

import PersonalizedRecommendations from '@/components/recommendations/PersonalizedRecommendations';
import RecentlyViewedCourses from '@/components/recommendations/RecentlyViewedCourses';
import TrendingRecommendations from '@/components/recommendations/TrendingRecommendations';
import RecommendationPreferences from '@/components/recommendations/RecommendationPreferences';
import useRecommendationSync from '@/hooks/useRecommendationSync';

const RecommendationsDashboard = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { syncStatus, forceSync } = useRecommendationSync();
  
  // Handle sync button click
  const handleSyncClick = () => {
    forceSync();
    toast({
      title: "Syncing recommendations",
      description: "Your recommendations will be synced across all your devices",
      duration: 3000,
    });
  };
  
  useEffect(() => {
    // This could be used for analytics tracking
    document.title = "Your Recommendations | AI Learning Platform";
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Your Recommendations | AI Learning Platform</title>
      </Helmet>
      
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Your Learning Recommendations</h1>
        
        {isAuthenticated && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleSyncClick} disabled={syncStatus.syncInProgress}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
              {syncStatus.syncInProgress ? 'Syncing...' : 'Sync Recommendations'}
            </Button>
            <Link href="/settings/recommendations">
              <Button variant="ghost" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content - 3/4 width */}
        <div className="lg:col-span-3 space-y-8">
          {/* Personalized recommendations */}
          <PersonalizedRecommendations limit={6} />
          
          {/* Recently viewed */}
          <RecentlyViewedCourses limit={4} />
          
          {/* Trending and seasonal */}
          <TrendingRecommendations limit={4} />
          
          {/* Getting started cards for non-authenticated users */}
          {!isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-blue-500" />
                    Sign Up for Personalized Recommendations
                  </CardTitle>
                  <CardDescription>
                    Create an account to get recommendations tailored to your interests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    When you sign up, we'll create personalized recommendations based on:
                  </p>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start">
                      <span className="bg-blue-100 p-1 rounded-full mr-2 text-blue-600 flex-shrink-0">✓</span>
                      Your interests and learning goals
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 p-1 rounded-full mr-2 text-blue-600 flex-shrink-0">✓</span>
                      Courses you've viewed and completed
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 p-1 rounded-full mr-2 text-blue-600 flex-shrink-0">✓</span>
                      Your learning style and preferences
                    </li>
                  </ul>
                  <Button className="w-full" onClick={() => window.location.href = '/api/login'}>
                    Sign Up Now
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                    Explore Popular Courses
                  </CardTitle>
                  <CardDescription>
                    Discover our most popular AI and machine learning courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Not sure where to start? Explore these categories:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button variant="outline" className="justify-start">
                      <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                      AI Fundamentals
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                      Machine Learning
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Sparkles className="h-4 w-4 mr-2 text-green-500" />
                      Deep Learning
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                      NLP
                    </Button>
                  </div>
                  <Link href="/ai-courses">
                    <Button variant="default" className="w-full">
                      Browse All Courses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        {/* Sidebar - 1/4 width */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recommendations preferences panel */}
          <RecommendationPreferences />
          
          {/* Quick access learning paths */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Learning Paths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                  Machine Learning Engineer
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4 text-green-500" />
                  Data Scientist
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4 text-purple-500" />
                  AI Developer
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4 text-orange-500" />
                  NLP Specialist
                </Button>
              </div>
              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm" className="text-blue-500">
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Create Custom Path
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Learning Stats */}
          {isAuthenticated && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <History className="h-5 w-5 mr-2 text-blue-500" />
                  Learning Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Hours this week</p>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>6.5 hours</span>
                      <span>Goal: 10 hours</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Course completion</p>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>2 completed</span>
                      <span>3 in progress</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Learning streak</p>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>8 days</span>
                      <span>Best: 10 days</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Button variant="ghost" size="sm" className="w-full text-sm">
                    View Complete Learning Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsDashboard;