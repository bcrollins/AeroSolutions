import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ChevronRight, Play } from 'lucide-react';

type Course = {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  progress: number;
  lastViewedLessonId: number | null;
};

export const EnrolledCourses = () => {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/enrolled-courses'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-0">
              <div className="h-[160px] bg-muted rounded-t-md"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-muted rounded"></div>
                <div className="h-3 w-full bg-muted rounded"></div>
                <div className="h-2 w-full bg-muted rounded mt-4"></div>
                <div className="h-9 w-full bg-muted rounded mt-4"></div>
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
        <p>Error loading enrolled courses. Please try again later.</p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-semibold mb-2">No Enrolled Courses</h3>
        <p className="text-muted-foreground mb-4">
          You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.
        </p>
        <Link href="/ai-courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course: Course) => (
        <Card 
          key={course.id} 
          className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-500"
        >
          <CardContent className="p-0">
            <div className="h-[160px] relative">
              {course.thumbnail ? (
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900">
                  <span className="text-white text-2xl font-bold">{course.title.charAt(0)}</span>
                </div>
              )}
              
              {/* Progress Circle */}
              <div className="absolute top-3 right-3 flex items-center justify-center bg-black bg-opacity-75 rounded-full w-12 h-12 border-2 border-primary">
                <div className="relative w-full h-full">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle 
                      cx="18" cy="18" r="15" 
                      fill="none" 
                      stroke="rgba(255,255,255,0.2)" 
                      strokeWidth="3"
                    />
                    <circle 
                      cx="18" cy="18" r="15" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeDasharray={`${15 * 2 * Math.PI}`} 
                      strokeDashoffset={`${15 * 2 * Math.PI * (1 - course.progress / 100)}`} 
                      className="text-primary transform -rotate-90 origin-center"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {course.progress}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {course.description}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-muted rounded-full mb-4">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              
              <Link href={course.lastViewedLessonId ? `/lessons/${course.lastViewedLessonId}` : `/courses/${course.id}`}>
                <Button 
                  className="w-full font-bold text-base flex items-center justify-between"
                  variant={course.progress > 0 ? "default" : "outline"}
                >
                  {course.progress > 0 ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </>
                  ) : (
                    <>
                      Start Course
                    </>
                  )}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnrolledCourses;