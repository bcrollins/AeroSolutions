import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Flame, Calendar, ArrowRight, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CourseCard from '@/components/course/CourseCard';
import useRecommendationTracker from '@/hooks/useRecommendationTracker';

interface TrendingRecommendationsProps {
  limit?: number;
  className?: string;
}

// Get the current season
const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

// Get current industry trends
const getCurrentTrends = () => {
  const currentYear = new Date().getFullYear();
  
  return [
    'Generative AI',
    'Large Language Models',
    'AI Ethics',
    'Computer Vision',
    'AI for Sustainability',
    'Multimodal AI',
    'Responsible AI',
    'AI in Healthcare'
  ];
};

const TrendingRecommendations = ({
  limit = 4,
  className = ''
}: TrendingRecommendationsProps) => {
  const { trackCourseClick } = useRecommendationTracker();
  const [activeTab, setActiveTab] = useState('trending');
  
  // Current season and year for seasonal recommendations
  const currentSeason = getCurrentSeason();
  const currentYear = new Date().getFullYear();
  const currentTrends = getCurrentTrends();
  
  // Fetch trending courses
  const { 
    data: trendingData, 
    isLoading: isLoadingTrending 
  } = useQuery({
    queryKey: ['/api/recommendations/trending'],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations/trending?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch trending courses');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch seasonal courses
  const { 
    data: seasonalData, 
    isLoading: isLoadingSeasonal 
  } = useQuery({
    queryKey: [`/api/recommendations/seasonal/${currentSeason}`],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations/seasonal/${currentSeason}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch seasonal courses');
      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  const getTrendingData = () => {
    if (isLoadingTrending) return [];
    return trendingData?.courses || [];
  };
  
  const getSeasonalData = () => {
    if (isLoadingSeasonal) return [];
    return seasonalData?.courses || [];
  };
  
  // Display seasonal name with correct capitalization
  const formatSeasonName = (season: string) => {
    return season.charAt(0).toUpperCase() + season.slice(1);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const trendingCourses = getTrendingData();
  const seasonalCourses = getSeasonalData();
  
  const renderContent = () => {
    if (activeTab === 'trending') {
      if (isLoadingTrending) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        );
      }
      
      if (trendingCourses.length > 0) {
        return (
          <ScrollArea className="h-full w-full">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {trendingCourses.map((course: any, index: number) => (
                <motion.div key={course.id || index} variants={itemVariants}>
                  <CourseCard 
                    course={course}
                    className="h-full"
                    showSimilarity={false}
                  />
                </motion.div>
              ))}
            </motion.div>
          </ScrollArea>
        );
      }
      
      return (
        <div className="text-center py-6">
          <div className="mb-4">
            <div className="bg-blue-50 rounded-full p-3 inline-block mb-2">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium">Trending Topics</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto mb-6">
            {currentTrends.map((trend, i) => (
              <div 
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 flex items-center"
              >
                <div className="mr-1.5 text-blue-500 text-xs font-bold">{i + 1}</div>
                {trend}
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/ai-courses'}>
            Explore All Courses
          </Button>
        </div>
      );
    }
    
    // Seasonal content
    if (isLoadingSeasonal) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
    }
    
    if (seasonalCourses.length > 0) {
      return (
        <ScrollArea className="h-full w-full">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {seasonalCourses.map((course: any, index: number) => (
              <motion.div key={course.id || index} variants={itemVariants}>
                <CourseCard 
                  course={course}
                  className="h-full"
                  showSimilarity={false}
                />
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      );
    }
    
    return (
      <div className="text-center py-6">
        <div className="mb-4">
          <div className="bg-blue-50 rounded-full p-3 inline-block mb-2">
            <Calendar className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium">{formatSeasonName(currentSeason)} Learning</h3>
          <p className="text-sm text-gray-500 mt-1">Perfect courses for this season</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/ai-courses'}>
          Browse Seasonal Courses
        </Button>
      </div>
    );
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              {activeTab === 'trending' ? 'Trending Now' : `${formatSeasonName(currentSeason)} ${currentYear} Picks`}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'trending' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleTabChange('trending')}
                className="text-xs px-3"
              >
                <Flame className="h-3.5 w-3.5 mr-1" />
                Trending
              </Button>
              <Button 
                variant={activeTab === 'seasonal' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleTabChange('seasonal')}
                className="text-xs px-3"
              >
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Seasonal
              </Button>
            </div>
          </div>
          <CardDescription>
            {activeTab === 'trending' 
              ? 'The most popular courses right now' 
              : `Courses perfect for ${currentSeason}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingRecommendations;