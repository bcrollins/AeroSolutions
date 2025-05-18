import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CourseCard from '@/components/course/CourseCard';
import { useAuth } from '@/hooks/useAuth';
import useRecommendationTracker from '@/hooks/useRecommendationTracker';

interface RecentlyViewedCoursesProps {
  limit?: number;
  className?: string;
}

const RecentlyViewedCourses = ({
  limit = 4,
  className = ''
}: RecentlyViewedCoursesProps) => {
  const { isAuthenticated } = useAuth();
  const { trackCourseClick } = useRecommendationTracker();
  const [localViewed, setLocalViewed] = useState<any[]>([]);
  
  // For authenticated users, fetch from API
  // For guests, read from localStorage
  const { 
    data: viewHistoryData, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['/api/recommendations/viewed'],
    queryFn: async () => {
      const response = await fetch('/api/recommendations/viewed');
      if (!response.ok) throw new Error('Failed to fetch view history');
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Load local storage view history for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const storedHistory = localStorage.getItem('course_view_history');
        if (storedHistory) {
          const parsed = JSON.parse(storedHistory);
          // Ensure it's an array and limit the number of items
          if (Array.isArray(parsed)) {
            setLocalViewed(parsed.slice(0, limit));
          }
        }
      } catch (err) {
        console.error('Error reading local storage:', err);
      }
    }
  }, [isAuthenticated, limit]);
  
  // Get the appropriate view history data
  const viewedCourses = isAuthenticated 
    ? (viewHistoryData?.courses || []).slice(0, limit)
    : localViewed;
  
  const isLoadingData = isAuthenticated ? isLoading : false;
  
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
  
  // If there's no view history, don't render anything
  if (!isLoadingData && viewedCourses.length === 0) {
    return null;
  }
  
  const handleCourseClick = (courseId: string) => {
    trackCourseClick(courseId);
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-xl">
            <History className="h-5 w-5 mr-2 text-blue-500" />
            Recently Viewed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-32 w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-full w-full">
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {viewedCourses.map((course: any, index: number) => (
                  <motion.div key={course.id || index} variants={itemVariants}>
                    <CourseCard 
                      course={course}
                      className="h-full"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </ScrollArea>
          )}
          
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700" onClick={() => window.location.href = '/ai-courses'}>
              View All Courses <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentlyViewedCourses;