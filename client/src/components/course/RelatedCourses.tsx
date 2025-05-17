import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Users, Clock, ArrowRight, Tag } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  instructor: string;
  rating: number;
  ratingCount: number;
  enrollmentCount: number;
  price: string;
  durationMinutes: number;
  category: string;
  tags: string[];
  level: string;
}

interface RelatedCoursesProps {
  courseId: number;
  category?: string;
  limit?: number;
}

const RelatedCourses: React.FC<RelatedCoursesProps> = ({
  courseId,
  category,
  limit = 3
}) => {
  // In a real app, this would fetch from API with proper filters
  const { data: courses, isLoading } = useQuery({
    queryKey: [`/api/courses/related`, courseId, category],
    placeholderData: mockCourses,
  });
  
  // Filter courses to exclude the current one and limit to the specified count
  const filteredCourses = courses
    ?.filter(course => course.id !== courseId)
    .slice(0, limit);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video">
              <Skeleton className="h-full w-full" />
            </div>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!filteredCourses?.length) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border">
        <Tag className="h-10 w-10 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No related courses found</h3>
        <p className="text-gray-500 mb-4 max-w-md mx-auto">
          We couldn't find any related courses in this category. Explore our course catalog to discover more learning opportunities.
        </p>
        <Button asChild>
          <Link href="/courses">Browse All Courses</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filteredCourses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200">
            <div className="relative aspect-video overflow-hidden">
              {course.coverImage ? (
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <span className="text-blue-500 font-medium">{course.title.slice(0, 2)}</span>
                </div>
              )}
              
              <div className="absolute top-2 right-2">
                <Badge 
                  variant="secondary"
                  className="bg-white/90 text-blue-800 hover:bg-white shadow-sm"
                >
                  {course.level}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-5 flex-1 flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {course.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                {course.description}
              </p>
              
              <div className="text-xs text-gray-500 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= Math.round(course.rating)
                              ? "fill-current"
                              : "fill-none"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-700">
                      {course.rating} ({course.ratingCount})
                    </span>
                  </div>
                  
                  <div className="text-right font-medium text-gray-900">
                    {course.price === "0" || course.price === "0.00"
                      ? "Free"
                      : `$${parseFloat(course.price).toFixed(2)}`}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{course.enrollmentCount} students</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{Math.round(course.durationMinutes / 60)} hours</span>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-5 pt-0">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/courses/${course.id}`}>
                  View Course <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Mock data for demo purposes
const mockCourses: Course[] = [
  {
    id: 101,
    title: "Machine Learning Fundamentals",
    description: "A comprehensive introduction to machine learning concepts, algorithms, and practical applications.",
    coverImage: "/images/courses/ml-fundamentals.jpg",
    instructor: "Dr. Emily Chen",
    rating: 4.7,
    ratingCount: 325,
    enrollmentCount: 1823,
    price: "89.99",
    durationMinutes: 1440, // 24 hours
    category: "AI & Machine Learning",
    tags: ["machine learning", "beginners", "python", "data science"],
    level: "Beginner"
  },
  {
    id: 102,
    title: "Deep Learning for Computer Vision",
    description: "Master cutting-edge computer vision techniques using deep learning frameworks like TensorFlow and PyTorch.",
    coverImage: "/images/courses/deep-learning-cv.jpg",
    instructor: "Prof. Michael Wong",
    rating: 4.9,
    ratingCount: 218,
    enrollmentCount: 1246,
    price: "129.99",
    durationMinutes: 1800, // 30 hours
    category: "AI & Machine Learning",
    tags: ["deep learning", "computer vision", "neural networks", "TensorFlow"],
    level: "Intermediate"
  },
  {
    id: 103,
    title: "Natural Language Processing in Practice",
    description: "Learn how to build and deploy practical NLP applications for text classification, sentiment analysis, and more.",
    coverImage: "/images/courses/nlp-practical.jpg",
    instructor: "Dr. Sarah Johnson",
    rating: 4.8,
    ratingCount: 165,
    enrollmentCount: 982,
    price: "119.99",
    durationMinutes: 1560, // 26 hours
    category: "AI & Machine Learning",
    tags: ["NLP", "language models", "text analysis", "BERT", "transformers"],
    level: "Intermediate"
  },
  {
    id: 104,
    title: "Reinforcement Learning: Theory to Practice",
    description: "A deep dive into reinforcement learning techniques, from foundational algorithms to cutting-edge applications.",
    coverImage: "/images/courses/reinforcement-learning.jpg",
    instructor: "Prof. Alex Martinez",
    rating: 4.6,
    ratingCount: 132,
    enrollmentCount: 745,
    price: "149.99",
    durationMinutes: 1920, // 32 hours
    category: "AI & Machine Learning",
    tags: ["reinforcement learning", "AI", "advanced", "algorithms"],
    level: "Advanced"
  },
  {
    id: 105,
    title: "AI Ethics and Responsible Development",
    description: "Explore the ethical considerations and best practices for developing AI systems that are fair, transparent, and accountable.",
    coverImage: "/images/courses/ai-ethics.jpg",
    instructor: "Dr. Maya Patel",
    rating: 4.9,
    ratingCount: 98,
    enrollmentCount: 623,
    price: "79.99",
    durationMinutes: 900, // 15 hours
    category: "AI & Machine Learning",
    tags: ["AI ethics", "fairness", "transparency", "responsible AI"],
    level: "All Levels"
  }
];

export default RelatedCourses;