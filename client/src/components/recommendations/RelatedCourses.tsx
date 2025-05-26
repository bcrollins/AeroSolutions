import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Award, 
  Star, 
  ChevronRight, 
  Users, 
  BookOpen,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import useRecommendationTracker from '@/hooks/useRecommendationTracker';
import { aiCourseStructure } from '@/data/courseStructure';

interface RelatedCoursesProps {
  courseId: string;
  limit?: number;
  title?: string;
  showReasonForRecommendation?: boolean;
}

const coursesData = [
  {
    id: 'master-ai',
    title: 'Master AI: From Fundamentals to Advanced Applications',
    description: 'A comprehensive program covering the full spectrum of artificial intelligence concepts, technologies, and applications.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rating: 4.8,
    students: 12500,
    duration: '71 hours',
    level: 'All Levels',
    similarity: {
      contentOverlap: 0.85,
      skillComplementarity: 0.92,
      learningPath: 0.78
    }
  },
  {
    id: 'advanced-nlp',
    title: 'Advanced Natural Language Processing',
    description: 'Master cutting-edge NLP techniques and build powerful text understanding applications with state-of-the-art models.',
    image: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rating: 4.7,
    students: 8200,
    duration: '42 hours',
    level: 'Advanced',
    similarity: {
      contentOverlap: 0.75,
      skillComplementarity: 0.88,
      learningPath: 0.82
    }
  },
  {
    id: 'ml-ops',
    title: 'MLOps: Deploying AI in Production',
    description: 'Learn to build, deploy and monitor machine learning models in production environments at scale.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rating: 4.9,
    students: 6300,
    duration: '38 hours',
    level: 'Intermediate',
    similarity: {
      contentOverlap: 0.65,
      skillComplementarity: 0.95,
      learningPath: 0.78
    }
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision Masterclass',
    description: 'Build advanced computer vision applications using modern deep learning architectures.',
    image: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rating: 4.6,
    students: 7800,
    duration: '45 hours',
    level: 'Intermediate',
    similarity: {
      contentOverlap: 0.60,
      skillComplementarity: 0.85,
      learningPath: 0.70
    }
  },
  {
    id: 'generative-ai',
    title: 'Generative AI and Creative Applications',
    description: 'Explore the cutting-edge of generative models and build AI systems that create art, music, text, and more.',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rating: 4.9,
    students: 9400,
    duration: '36 hours',
    level: 'Intermediate',
    similarity: {
      contentOverlap: 0.72,
      skillComplementarity: 0.90,
      learningPath: 0.85
    }
  },
  {
    id: 'ai-ethics',
    title: 'AI Ethics and Responsible Development',
    description: 'Learn to build AI systems that are fair, transparent, accountable, and aligned with human values.',
    image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rating: 4.8,
    students: 5200,
    duration: '28 hours',
    level: 'All Levels',
    similarity: {
      contentOverlap: 0.58,
      skillComplementarity: 0.80,
      learningPath: 0.75
    }
  }
];

const RelatedCourses: React.FC<RelatedCoursesProps> = ({ 
  courseId, 
  limit = 4, 
  title = "Related Courses", 
  showReasonForRecommendation = false 
}) => {
  const { trackRecommendationClick } = useRecommendationTracker();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  // Get related courses, excluding the current one
  const relatedCourses = coursesData
    .filter(course => course.id !== courseId)
    .slice(0, limit);

  // Function to calculate overall similarity score (weighted average)
  const calculateOverallSimilarity = (similarity: any) => {
    const weights = {
      contentOverlap: 0.4,
      skillComplementarity: 0.4,
      learningPath: 0.2
    };
    
    return (
      similarity.contentOverlap * weights.contentOverlap +
      similarity.skillComplementarity * weights.skillComplementarity +
      similarity.learningPath * weights.learningPath
    ).toFixed(2);
  };
  
  // Function to get a descriptive reason for the recommendation
  const getRecommendationReason = (course: any) => {
    const { similarity } = course;
    const highestFactor = Object.entries(similarity).reduce((a, b) => (a[1] > b[1] ? a : b));
    
    switch (highestFactor[0]) {
      case 'contentOverlap':
        return "This course covers complementary topics that will enhance your understanding.";
      case 'skillComplementarity':
        return "The skills taught in this course perfectly complement what you're currently learning.";
      case 'learningPath':
        return "This course is a natural next step in your learning journey.";
      default:
        return "This course is highly relevant to your interests.";
    }
  };
  
  // Handle course click and track recommendation engagement
  const handleCourseClick = (recommendedCourse: any) => {
    trackRecommendationClick(recommendedCourse.id, courseId, "related");
  };
  
  // Handle explanation dialog
  const openExplanationDialog = (course: any) => {
    setSelectedCourse(course);
  };

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href="/courses">
          <Button variant="link" className="text-blue-600">
            See all courses <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedCourses.map((course) => (
          <motion.div 
            key={course.id}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="font-medium text-xs">
                    {course.level}
                  </Badge>
                </div>
                
                {showReasonForRecommendation && (
                  <div className="absolute bottom-3 right-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-90 hover:opacity-100"
                          onClick={() => openExplanationDialog(course)}
                        >
                          <Info className="h-4 w-4 mr-1" />
                          Why recommended?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Why We Recommended This Course</DialogTitle>
                          <DialogDescription>
                            Based on your learning patterns and course content analysis
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedCourse && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 pb-4">
                              <img 
                                src={selectedCourse.image} 
                                alt={selectedCourse.title} 
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <div>
                                <h3 className="font-medium">{selectedCourse.title}</h3>
                                <p className="text-sm text-gray-500">{selectedCourse.level} • {selectedCourse.duration}</p>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h4 className="font-medium mb-2">Recommendation Strength</h4>
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${Number(calculateOverallSimilarity(selectedCourse.similarity)) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="ml-3 font-medium">
                                  {Math.round(Number(calculateOverallSimilarity(selectedCourse.similarity)) * 100)}%
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Similarity Factors</h4>
                              <div className="space-y-3">
                                {Object.entries(selectedCourse.similarity).map(([key, value]: [string, any]) => (
                                  <div key={key}>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                      <span className="text-sm font-medium">{Math.round(value * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-blue-600 h-1.5 rounded-full" 
                                        style={{ width: `${Math.round(value * 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h4 className="font-medium mb-2">Recommendation Reason</h4>
                              <p className="text-gray-600">{getRecommendationReason(selectedCourse)}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex flex-col h-full">
                  <div className="mb-2 flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(course.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium ml-2">{course.rating}</span>
                    <span className="text-xs text-gray-500 ml-2">({Math.floor(course.students / 100) * 100}+ students)</span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="mt-auto">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="mr-3">{course.duration}</span>
                      <Users className="h-4 w-4 mr-1" />
                      <span>{formatNumber(course.students)} students</span>
                    </div>
                    
                    <Link href={`/courses/${course.id}`}>
                      <Button 
                        className="w-full" 
                        onClick={() => handleCourseClick(course)}
                      >
                        View Course
                      </Button>
                    </Link>
                    
                    {showReasonForRecommendation && (
                      <p className="text-xs text-gray-500 mt-2 italic text-center">
                        {Math.round(Number(calculateOverallSimilarity(course.similarity)) * 100)}% match for your learning profile
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Helper function to format numbers (e.g., 1200 -> 1.2k)
const formatNumber = (num: number): string => {
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
};

export default RelatedCourses;