import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Define the type for enrolled course data
type EnrolledCourse = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  thumbnail: string | null;
  progress: number;
  lastAccessedAt: string;
  currentLessonId: number | null;
  enrolledAt: string;
};

const EnrolledCourses: React.FC = () => {
  // Fetch enrolled courses data
  const { data: enrolledCourses, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/enrolled-courses'],
    retry: 1,
  });

  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <Card key={`skeleton-${index}`} className="overflow-hidden">
            <div className="aspect-video bg-muted animate-pulse"></div>
            <CardContent className="p-6">
              <div className="h-6 w-2/3 bg-muted rounded animate-pulse mb-3"></div>
              <div className="h-4 w-full bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-4 w-4/5 bg-muted rounded animate-pulse mb-4"></div>
              <div className="h-2 w-full bg-muted rounded animate-pulse mb-6"></div>
              <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Unable to load your courses</h3>
          <p className="text-muted-foreground mb-4">
            We encountered a problem while trying to fetch your enrolled courses.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Card>
    );
  }

  // If no enrolled courses, show empty state
  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">No Courses Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Browse our catalog to find
            courses that match your interests and skill level.
          </p>
          <Link href="/ai-courses/catalog">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Render the enrolled courses
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {enrolledCourses.map((course: EnrolledCourse) => (
        <Card 
          key={course.id} 
          className="overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-primary/50"
        >
          {course.thumbnail ? (
            <div 
              className="aspect-video bg-cover bg-center" 
              style={{ backgroundImage: `url(${course.thumbnail})` }}
            ></div>
          ) : (
            <div className="aspect-video bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No Preview</span>
            </div>
          )}

          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2 line-clamp-1">{course.title}</h3>
            
            {/* Progress bar */}
            <div className="w-full bg-muted h-2 rounded-full mb-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
              <span>{course.progress}% complete</span>
              
              {/* Last accessed date */}
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {course.lastAccessedAt 
                    ? formatDistanceToNow(new Date(course.lastAccessedAt), { addSuffix: true }) 
                    : 'Not started'}
                </span>
              </div>
            </div>

            {/* Description with clamp */}
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
            
            {/* Continue button */}
            <Link href={course.currentLessonId 
              ? `/ai-courses/${course.courseId}/lessons/${course.currentLessonId}` 
              : `/ai-courses/${course.courseId}`}
            >
              <Button className="w-full">
                {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnrolledCourses;