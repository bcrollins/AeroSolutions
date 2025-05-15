import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Widget } from '@/contexts/DashboardContext';
import DashboardWidget from '../DashboardWidget';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Play, Clock, Award } from 'lucide-react';
import { useLocation } from 'wouter';
import APIErrorBoundary from '@/components/ErrorHandling/APIErrorBoundary';

interface Course {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
  duration: string;
  thumbnailUrl: string;
}

interface RecentCoursesWidgetProps {
  widget: Widget;
}

/**
 * RecentCoursesWidget - Displays recently accessed courses
 */
const RecentCoursesWidget: React.FC<RecentCoursesWidgetProps> = ({ widget }) => {
  const [, navigate] = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch recent courses data
  const { data: coursesData, refetch } = useQuery({
    queryKey: ['/api/user/recent-courses'],
    queryFn: async () => {
      // Simulate API call
      // In a real app, this would be fetched from the server
      return [
        {
          id: 'course-1',
          title: 'Introduction to AI and Machine Learning',
          progress: 68,
          lastAccessed: '2 days ago',
          duration: '2h 30m',
          thumbnailUrl: '/path/to/thumbnail1.jpg',
        },
        {
          id: 'course-2',
          title: 'Advanced Natural Language Processing',
          progress: 42,
          lastAccessed: '5 days ago',
          duration: '3h 15m',
          thumbnailUrl: '/path/to/thumbnail2.jpg',
        },
        {
          id: 'course-3',
          title: 'Data Science Foundations',
          progress: 95,
          lastAccessed: '1 week ago',
          duration: '4h 45m',
          thumbnailUrl: '/path/to/thumbnail3.jpg',
        },
      ] as Course[];
    },
  });
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };
  
  // Handle course click
  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };
  
  // Compute the number of courses to display based on widget size
  const getCoursesToDisplay = () => {
    switch (widget.size) {
      case 'small':
        return 1;
      case 'medium':
        return 3;
      case 'large':
      case 'full':
        return 5;
      default:
        return 3;
    }
  };
  
  const displayCourses = coursesData?.slice(0, getCoursesToDisplay()) || [];
  
  return (
    <DashboardWidget 
      widget={widget} 
      isLoading={isRefreshing}
      onRefresh={handleRefresh}
    >
      <APIErrorBoundary query={{ 
        data: coursesData, 
        isLoading: isRefreshing,
        isError: false,
        error: null,
        refetch,
      }}>
        {(courses: Course[]) => (
          <div className="space-y-4">
            {courses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  You haven't accessed any courses yet.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/courses')}
                  className="mt-2"
                >
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div 
                    key={course.id}
                    className="bg-accent/40 rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium line-clamp-1">{course.title}</h3>
                    </div>
                    <Progress 
                      value={course.progress} 
                      className="h-2 mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{course.lastAccessed}</span>
                      </div>
                      <div className="flex items-center">
                        {course.progress === 100 ? (
                          <>
                            <Award className="h-3 w-3 mr-1 text-green-500" />
                            <span className="text-green-500">Completed</span>
                          </>
                        ) : (
                          <>
                            <span>{course.progress}% complete</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="ghost"
                  className="w-full text-xs h-8 mt-2"
                  onClick={() => navigate('/courses/recent')}
                >
                  View All Recent Courses
                </Button>
              </div>
            )}
          </div>
        )}
      </APIErrorBoundary>
    </DashboardWidget>
  );
};

export default RecentCoursesWidget;