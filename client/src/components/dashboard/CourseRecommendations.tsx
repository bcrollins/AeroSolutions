import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';

// Course recommendation type
type CourseRecommendation = {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  duration: number; // in minutes
  difficulty: string;
  category: string;
  rating: number;
  enrolledCount: number;
  matchPercentage: number;
};

const CourseRecommendations: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Fetch recommended courses
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/course-recommendations'],
    retry: 1,
  });

  // Function to scroll left
  const scrollLeft = () => {
    if (carouselRef.current) {
      const newPosition = Math.max(0, scrollPosition - carouselRef.current.offsetWidth);
      carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  // Function to scroll right
  const scrollRight = () => {
    if (carouselRef.current) {
      const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.offsetWidth;
      const newPosition = Math.min(maxScroll, scrollPosition + carouselRef.current.offsetWidth);
      carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  // Handle scroll events to update position state
  const handleScroll = () => {
    if (carouselRef.current) {
      setScrollPosition(carouselRef.current.scrollLeft);
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-4">
          {[...Array(4)].map((_, i) => (
            <Card key={`skeleton-${i}`} className="min-w-[300px] flex-shrink-0">
              <div className="aspect-video bg-muted animate-pulse"></div>
              <CardContent className="p-6">
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-3"></div>
                <div className="h-3 w-full bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 w-5/6 bg-muted rounded animate-pulse mb-4"></div>
                <div className="flex justify-between mb-4">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="h-9 w-full bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Unable to load recommendations</h3>
          <p className="text-muted-foreground mb-4">
            We encountered a problem while trying to fetch course recommendations.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Card>
    );
  }

  // Show empty state
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="mb-4 w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Recommendations Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We'll generate personalized course recommendations as you complete 
            more courses and earn badges.
          </p>
          <Link href="/ai-courses/catalog">
            <Button>Browse All Courses</Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Format duration for display (e.g., "2h 30m")
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0
      ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
      : `${mins}m`;
  };

  // Convert difficulty to badge variant
  const difficultyVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'secondary';
      case 'intermediate':
        return 'default';
      case 'advanced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Carousel with navigation buttons
  return (
    <div className="relative">
      {/* Left navigation button */}
      <button
        onClick={scrollLeft}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-primary/90 text-white p-2 rounded-full shadow-md hidden md:flex items-center justify-center ${
          scrollPosition <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 transition-transform'
        }`}
        disabled={scrollPosition <= 0}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Course recommendations carousel */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto hide-scrollbar gap-6 pb-4 snap-x"
        onScroll={handleScroll}
      >
        {recommendations.map((course: CourseRecommendation) => (
          <Card
            key={course.id}
            className="min-w-[300px] flex-shrink-0 hover:shadow-md transition-all duration-300 snap-start hover:scale-[1.02] hover:border-primary/50"
          >
            {course.thumbnail ? (
              <div
                className="aspect-video bg-cover bg-center relative"
                style={{ backgroundImage: `url(${course.thumbnail})` }}
              >
                {/* Match percentage badge */}
                <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                  {course.matchPercentage}% match
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                <span className="text-muted-foreground">No Preview</span>
                {/* Match percentage badge */}
                <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                  {course.matchPercentage}% match
                </div>
              </div>
            )}

            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2 line-clamp-1">{course.title}</h3>
              
              {/* Description with truncation */}
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {course.description}
              </p>
              
              {/* Course details */}
              <div className="flex justify-between items-center mb-4">
                <Badge variant={difficultyVariant(course.difficulty)}>
                  {course.difficulty}
                </Badge>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(course.duration)}
                </div>
              </div>
              
              {/* View details button */}
              <Link href={`/ai-courses/${course.id}`}>
                <Button className="w-full">View Course</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Right navigation button */}
      <button
        onClick={scrollRight}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-primary/90 text-white p-2 rounded-full shadow-md hidden md:flex items-center justify-center ${
          carouselRef.current && 
          scrollPosition >= carouselRef.current.scrollWidth - carouselRef.current.offsetWidth - 10
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-110 transition-transform'
        }`}
        disabled={
          carouselRef.current &&
          scrollPosition >= carouselRef.current.scrollWidth - carouselRef.current.offsetWidth - 10
        }
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Custom scrollbar styling */}
      <style jsx global>
        {`
          .hide-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default CourseRecommendations;