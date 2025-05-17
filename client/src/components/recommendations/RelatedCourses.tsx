import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Clock, Sparkles, Star, Info, BarChart } from 'lucide-react';
import useRecommendationTracker from '@/hooks/useRecommendationTracker';
import CourseSimilarityExplanation from './CourseSimilarityExplanation';

interface RelatedCoursesProps {
  courseId: string | number;
  limit?: number;
  title?: string;
  showReasonForRecommendation?: boolean;
}

export default function RelatedCourses({
  courseId,
  limit = 3,
  title = "You might also like",
  showReasonForRecommendation = true
}: RelatedCoursesProps) {
  const { toast } = useToast();
  const { trackCourseClick } = useRecommendationTracker();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showSimilarityDialog, setShowSimilarityDialog] = useState(false);
  
  // Fetch related courses based on the current course
  const { 
    data: relatedCoursesData,
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/recommendations/related/${courseId}`],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations/related/${courseId}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch related courses');
      return response.json();
    },
    retry: 1
  });
  
  // Fetch the source course data for comparison
  const { data: sourceCourse } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch source course');
      return response.json();
    },
    retry: 1
  });
  
  // Extract the related courses from the response
  const relatedCourses = relatedCoursesData?.recommendations || [];
  
  if (error) {
    // Log the error but don't disrupt the UI
    console.error('Error fetching related courses:', error);
  }
  
  const handleCourseClick = (relatedCourseId: string) => {
    // Track this click for improving future recommendations
    trackCourseClick(relatedCourseId);
    // Navigate to the course page
    window.location.href = `/ai-courses/${relatedCourseId}`;
  };
  
  const handleShowSimilarity = (course: any) => {
    setSelectedCourse(course);
    setShowSimilarityDialog(true);
  };
  
  // If there are no related courses, don't render anything
  if (!isLoading && relatedCourses.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8 mb-10">
      <h2 className="text-2xl font-bold mb-5 text-gray-900">{title}</h2>
      
      {isLoading ? (
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-2/3 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-3" />
                <div className="flex space-x-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {relatedCourses.map((course: any) => (
            <Card key={course.courseId} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{course.matchScore}%</span>
                  </div>
                </div>
                <div className="text-gray-500 text-sm flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>2-4 weeks</span>
                </div>
              </CardHeader>
              
              <CardContent className="py-2">
                <p className="text-gray-700 text-sm line-clamp-3 mb-3">
                  {course.description}
                </p>
                
                {showReasonForRecommendation && course.reasonForRecommendation && (
                  <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 italic flex items-start mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500 mt-0.5 mr-1.5 flex-shrink-0" />
                    <span>{course.reasonForRecommendation}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowSimilarity(course);
                      }}
                      className="ml-auto text-blue-500 hover:text-blue-700"
                      title="See why this is recommended"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1 mt-3">
                  <Badge variant="outline" className="text-xs">
                    {course.category || 'AI Learning'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.difficulty || 'Intermediate'}
                  </Badge>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button 
                  onClick={() => handleCourseClick(course.courseId)}
                  className="w-full"
                  variant="secondary"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Course
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Similarity Explanation Dialog */}
      <Dialog open={showSimilarityDialog} onOpenChange={setShowSimilarityDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Why We Recommended This Course</DialogTitle>
          </DialogHeader>
          
          {selectedCourse && sourceCourse && (
            <CourseSimilarityExplanation
              sourceCourse={sourceCourse}
              recommendedCourse={selectedCourse}
              similarityScore={selectedCourse.matchScore}
            />
          )}
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setShowSimilarityDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}