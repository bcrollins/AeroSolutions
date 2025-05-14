import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

type CourseRecommendation = {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  duration: string | null;
  difficulty: string;
  reasonForRecommendation: string;
};

export const CourseRecommendations = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/recommendations'],
    retry: false,
  });

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide">
          {[...Array(3)].map((_, i) => (
            <Card 
              key={i} 
              className="flex-shrink-0 w-[300px] bg-card/50 animate-pulse"
            >
              <CardContent className="p-0">
                <div className="h-[160px] bg-muted rounded-t-md"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-muted rounded"></div>
                  <div className="h-3 w-full bg-muted rounded"></div>
                  <div className="h-3 w-1/2 bg-muted rounded"></div>
                  <div className="h-8 w-full bg-muted rounded"></div>
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
        <p>Error loading course recommendations. Please try again later.</p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
        <p className="text-muted-foreground mb-4">
          We'll suggest courses for you as you continue learning.
        </p>
        <Link href="/ai-courses">
          <Button>Browse All Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={carouselRef}
        className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {recommendations.map((course: CourseRecommendation) => (
          <Card 
            key={course.id} 
            className="flex-shrink-0 w-[300px] transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-lg"
          >
            <CardContent className="p-0">
              <div className="relative h-[160px] bg-muted overflow-hidden">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900">
                    <span className="text-white text-lg font-bold">{course.title.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {course.difficulty}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {course.duration && <span>{course.duration}</span>}
                  <span className="text-blue-500 italic">
                    {course.reasonForRecommendation}
                  </span>
                </div>
                <Link href={`/courses/${course.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Course
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {recommendations.length > 3 && (
        <div className="flex justify-center mt-4 space-x-2">
          <Button 
            onClick={scrollLeft} 
            size="icon" 
            variant="outline"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            onClick={scrollRight}
            size="icon"
            variant="outline"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <style jsx global>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default CourseRecommendations;