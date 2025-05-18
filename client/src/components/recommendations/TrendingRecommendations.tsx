import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Star, 
  ChevronRight, 
  Users,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import useRecommendationTracker from '@/hooks/useRecommendationTracker';

interface TrendingRecommendationsProps {
  limit?: number;
}

// Sample trending courses data
const trendingCoursesData = [
  {
    id: 'generative-ai',
    title: 'Generative AI and Creative Applications',
    description: 'Explore the cutting-edge of generative models and build AI systems that create art, music, text, and more.',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rating: 4.9,
    students: 9400,
    duration: '36 hours',
    level: 'Intermediate',
    growthPercentage: 342
  },
  {
    id: 'master-ai',
    title: 'Master AI: From Fundamentals to Advanced Applications',
    description: 'A comprehensive program covering the full spectrum of artificial intelligence concepts, technologies, and applications.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    rating: 4.8,
    students: 12500,
    duration: '71 hours',
    level: 'All Levels',
    growthPercentage: 278
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
    growthPercentage: 256
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
    growthPercentage: 195
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
    growthPercentage: 168
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
    growthPercentage: 154
  }
];

const TrendingRecommendations: React.FC<TrendingRecommendationsProps> = ({ limit = 4 }) => {
  const { trackRecommendationClick } = useRecommendationTracker();
  
  // Get trending courses up to the limit
  const trendingCourses = trendingCoursesData.slice(0, limit);
  
  // Handle course click
  const handleCourseClick = (courseId: string) => {
    trackRecommendationClick(courseId, "homepage", "trending");
  };

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <TrendingUp className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-2xl font-bold">Trending Now</h2>
        </div>
        <Link href="/courses">
          <Button variant="link" className="text-blue-600">
            See all courses <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingCourses.map((course) => (
          <motion.div 
            key={course.id}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-red-500 hover:bg-red-600 font-medium text-xs flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{course.growthPercentage}% Enrollment
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="font-medium text-xs">
                    {course.level}
                  </Badge>
                </div>
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
                  </div>
                  
                  <h3 className="font-bold text-sm mb-2 line-clamp-2">{course.title}</h3>
                  
                  <div className="mt-auto">
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="mr-3">{course.duration}</span>
                      <Users className="h-3 w-3 mr-1" />
                      <span>{formatNumber(course.students)} students</span>
                    </div>
                    
                    <Link href={`/courses/${course.id}`}>
                      <Button 
                        size="sm"
                        className="w-full" 
                        onClick={() => handleCourseClick(course.id)}
                      >
                        View Course
                      </Button>
                    </Link>
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

export default TrendingRecommendations;