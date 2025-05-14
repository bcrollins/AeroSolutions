import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BookOpenCheck, Clock, AlertCircle } from 'lucide-react';

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

const EnrolledCourses = () => {
  const { data: enrolledCourses = [], isLoading, error } = useQuery<EnrolledCourse[]>({
    queryKey: ['/api/dashboard/enrolled-courses'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="h-[160px] bg-muted rounded-t-md"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-2 w-full bg-muted rounded-full"></div>
                <div className="h-10 w-1/2 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <AlertCircle className="h-10 w-10 mx-auto mb-4" />
        <p className="font-medium">Error loading your enrolled courses.</p>
        <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="text-center py-10">
        <BookOpenCheck className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Enrolled Courses</h3>
        <p className="text-muted-foreground mb-4">
          You haven't enrolled in any courses yet. Browse our catalog to get started.
        </p>
        <Link href="/ai-courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {enrolledCourses.map((course) => (
        <Card key={course.id} className="overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-400">
          <CardContent className="p-0">
            <div className="relative h-[160px] overflow-hidden bg-gradient-to-r from-blue-800 to-indigo-900">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpenCheck className="h-10 w-10 text-white opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-full">
                {course.progress}% Complete
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{course.description}</p>
              
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div 
                  className="bg-primary rounded-full h-2" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground mb-4">
                <Clock className="h-3 w-3 mr-1" />
                <span>Last accessed: {new Date(course.lastAccessedAt).toLocaleDateString()}</span>
              </div>
              
              <Link href={course.currentLessonId ? `/courses/${course.courseId}/lessons/${course.currentLessonId}` : `/courses/${course.courseId}`}>
                <Button className="w-full">Continue Learning</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnrolledCourses;