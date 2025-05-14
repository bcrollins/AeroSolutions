import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { AlertCircle, BookOpen, ChevronLeft, ChevronRight, Clock, BarChart } from 'lucide-react';

type CourseRecommendation = {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  duration: string | null;
  difficulty: string;
  reasonForRecommendation: string;
};

const CourseRecommendations = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: recommendations = [], isLoading, error } = useQuery<CourseRecommendation[]>({
    queryKey: ['/api/dashboard/course-recommendations'],
    retry: false,
  });

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex-shrink-0 w-[300px] animate-pulse">
              <CardContent className="p-0">
                <div className="h-[160px] bg-muted rounded-t-md"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                  <div className="h-10 w-1/2 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <AlertCircle className="h-10 w-10 mx-auto mb-4" />
        <p className="font-medium">Error loading course recommendations.</p>
        <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-10">
        <BookOpen className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
        <p className="text-muted-foreground mb-4">
          Complete more courses to receive personalized recommendations.
        </p>
        <Link href="/ai-courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel navigation buttons */}
      <button 
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-primary text-white rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      <button 
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-primary text-white rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Course carousel */}
      <div 
        ref={scrollRef} 
        className="flex space-x-4 overflow-x-auto pb-4 px-2 no-scrollbar snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.map((course) => (
          <Card 
            key={course.id} 
            className="flex-shrink-0 w-[300px] transition-all duration-300 hover:shadow-md hover:border-blue-400 snap-start"
          >
            <CardContent className="p-0">
              <div className="relative h-[160px] overflow-hidden bg-gradient-to-r from-blue-800 to-indigo-900">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Difficulty badge */}
                <div className={`
                  absolute top-3 right-3 text-xs px-2 py-1 rounded-full
                  ${course.difficulty === 'Beginner' ? 'bg-green-500' : 
                    course.difficulty === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'} 
                  text-white
                `}>
                  {course.difficulty}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  {course.duration && (
                    <div className="flex items-center mr-3">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <BarChart className="h-3 w-3 mr-1" />
                    <span>{course.difficulty}</span>
                  </div>
                </div>
                
                <div className="text-xs text-primary-foreground bg-primary/10 p-2 rounded mb-3">
                  <strong>Why we recommend this:</strong> {course.reasonForRecommendation}
                </div>
                
                <Link href={`/ai-courses/${course.id}`}>
                  <Button className="w-full">View Course</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Custom styling for hiding scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CourseRecommendations;