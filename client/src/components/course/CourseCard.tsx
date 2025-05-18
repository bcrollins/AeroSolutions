import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  Calendar, 
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import useRecommendationTracker from '@/hooks/useRecommendationTracker';
import CourseSimilarityExplanation from '@/components/recommendations/CourseSimilarityExplanation';

interface CourseCardProps {
  course: any;
  featured?: boolean;
  currentCourse?: any;
  showSimilarity?: boolean;
  similarityScore?: number;
  reasonForRecommendation?: string;
  className?: string;
}

const CourseCard = ({
  course,
  featured = false,
  currentCourse = null,
  showSimilarity = false,
  similarityScore = 0,
  reasonForRecommendation = '',
  className = ''
}: CourseCardProps) => {
  const { trackCourseView, trackCourseClick } = useRecommendationTracker();
  const [showSimilarityDialog, setShowSimilarityDialog] = useState(false);
  
  // Animation variants for hover effect
  const cardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };
  
  const handleCourseClick = () => {
    if (course?.id) {
      trackCourseClick(course.id.toString());
    }
  };
  
  return (
    <motion.div
      className={className}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
    >
      <Card className={`h-full overflow-hidden ${featured ? 'border-blue-300 shadow-lg' : ''}`}>
        {/* Card image */}
        <div className="relative">
          <img 
            src={course?.coverImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
            alt={course?.title || "Course title"}
            className="h-40 w-full object-cover"
          />
          {featured && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
          {course?.discount && (
            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {course.discount}% OFF
            </div>
          )}
        </div>
      
        {/* Card header */}
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle className="text-lg line-clamp-1">{course?.title || "Course Title"}</CardTitle>
            {showSimilarity && similarityScore > 0 && (
              <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                <Star className="h-3 w-3 fill-current" />
                <span>{similarityScore}%</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{course?.duration || course?.durationMinutes ? `${course.durationMinutes || course.duration} min` : '4-6 weeks'}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 fill-yellow-400 mr-1" />
              <span>{course?.rating || 4.7} ({course?.ratingCount || 42})</span>
            </div>
          </div>
        </CardHeader>
        
        {/* Card content */}
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700 line-clamp-2 mb-3">
            {course?.description || "This course will teach you everything you need to know about this subject."}
          </p>
          
          <div className="flex items-center mb-3">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={course?.instructorAvatar || "https://github.com/shadcn.png"} />
              <AvatarFallback>{course?.instructor?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">{course?.instructor || "AI Learning Expert"}</span>
            <div className="ml-auto flex items-center text-xs text-gray-500">
              <Users className="h-3.5 w-3.5 mr-1" />
              <span>{course?.studentsCount || course?.enrolled || 1240}</span>
            </div>
          </div>
          
          {showSimilarity && reasonForRecommendation && (
            <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 italic flex items-start mb-3">
              <Sparkles className="h-3.5 w-3.5 text-blue-500 mt-0.5 mr-1.5 flex-shrink-0" />
              <span className="line-clamp-2">{reasonForRecommendation}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowSimilarityDialog(true);
                      }}
                      className="ml-auto text-blue-500 hover:text-blue-700"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>See why this was recommended</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {course?.category || 'AI Learning'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {course?.difficulty || 'Intermediate'}
            </Badge>
          </div>
        </CardContent>
        
        {/* Card footer */}
        <CardFooter className="pt-0">
          <div className="w-full">
            <div className="flex justify-between items-center mb-3">
              <div className="font-bold text-lg">${course?.price || 49.99}</div>
              {course?.regularPrice && (
                <span className="text-gray-500 line-through text-sm">${course.regularPrice}</span>
              )}
            </div>
            
            <Link href={`/ai-courses/${course?.id || 1}`} onClick={handleCourseClick}>
              <Button className="w-full" size="sm">
                {featured ? 'Enroll Now' : 'View Course'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      {/* Similarity Explanation Dialog */}
      {showSimilarity && currentCourse && (
        <Dialog open={showSimilarityDialog} onOpenChange={setShowSimilarityDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Why We Recommended This Course</DialogTitle>
            </DialogHeader>
            
            <CourseSimilarityExplanation
              sourceCourse={currentCourse}
              recommendedCourse={course}
              similarityScore={similarityScore}
            />
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowSimilarityDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};

export default CourseCard;