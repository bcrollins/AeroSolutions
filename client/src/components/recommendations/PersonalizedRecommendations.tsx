import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Star, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecommendationProps {
  courseId: string;
  title: string;
  description: string;
  matchScore: number;
  reasonForRecommendation: string;
  onSelect?: (courseId: string) => void;
  limit?: number;
  showMatchScore?: boolean;
  className?: string;
  withAnimation?: boolean;
}

interface Topic {
  id: string;
  name: string;
}

const popularTopics: Topic[] = [
  { id: 'ai-fundamentals', name: 'AI Fundamentals' },
  { id: 'machine-learning', name: 'Machine Learning' },
  { id: 'data-science', name: 'Data Science' },
  { id: 'natural-language-processing', name: 'NLP' },
  { id: 'computer-vision', name: 'Computer Vision' }
];

export default function PersonalizedRecommendations({
  limit = 3,
  showMatchScore = true,
  className = '',
  withAnimation = true,
  onSelect,
}: Partial<RecommendationProps>) {
  const { user, isAuthenticated } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch personalized recommendations
  const { 
    data: recommendationsData, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/recommendations/personalized', selectedTopic],
    queryFn: async () => {
      if (selectedTopic) {
        // If topic is selected, get topic-based recommendations
        const response = await fetch(`/api/recommendations/topic/${selectedTopic}?count=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch topic recommendations');
        return response.json();
      } else {
        // Otherwise get personalized recommendations based on user history
        const response = await fetch('/api/recommendations/personalized');
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        return response.json();
      }
    },
    enabled: isAuthenticated || !!selectedTopic,
    retry: 1
  });
  
  // Define the recommendations to display
  const recommendations = recommendationsData?.recommendations || [];
  
  // Handle when a user selects a topic
  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId === selectedTopic ? null : topicId);
  };
  
  // Handle error states
  useEffect(() => {
    if (error) {
      toast({
        title: "Couldn't load recommendations",
        description: "We're having trouble personalizing your experience. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Get fresh recommendations
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing recommendations",
      description: "Finding the best courses for you...",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedTopic 
            ? `Courses on ${popularTopics.find(t => t.id === selectedTopic)?.name}` 
            : isAuthenticated 
              ? "Recommended for You" 
              : "Popular Courses"}
        </h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Topic selection */}
      <div className="flex flex-wrap gap-2 pb-2">
        {popularTopics.map(topic => (
          <Badge 
            key={topic.id}
            variant={selectedTopic === topic.id ? "default" : "outline"} 
            className="cursor-pointer text-sm py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => handleTopicSelect(topic.id)}
          >
            {topic.name}
          </Badge>
        ))}
      </div>
      
      {/* Recommendations */}
      {isLoading ? (
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        // Recommendations grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {recommendations.slice(0, limit).map((recommendation, index) => (
              <motion.div
                key={recommendation.courseId}
                initial={withAnimation ? { opacity: 0, y: 20 } : false}
                animate={withAnimation ? { opacity: 1, y: 0 } : false}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <RecommendationCard 
                  recommendation={recommendation}
                  showMatchScore={showMatchScore}
                  onSelect={onSelect}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // No recommendations state
        <Card className="text-center p-6">
          <div className="flex flex-col items-center">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No recommendations available</h3>
            <p className="text-gray-500 mb-4">
              {isAuthenticated 
                ? "We don't have enough information to make personalized recommendations yet. Complete a course or engage with content to get started."
                : "Log in to get personalized course recommendations based on your interests and learning history."}
            </p>
            <Button 
              onClick={() => window.location.href = '/ai-courses'}
              className="mt-2"
            >
              Browse All Courses
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// Individual recommendation card component
function RecommendationCard({ 
  recommendation, 
  showMatchScore = true, 
  onSelect 
}: { 
  recommendation: any;
  showMatchScore?: boolean;
  onSelect?: (courseId: string) => void;
}) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(recommendation.courseId);
    } else {
      window.location.href = `/ai-courses/${recommendation.courseId}`;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          {showMatchScore && (
            <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{recommendation.matchScore}% Match</span>
            </div>
          )}
        </div>
        <CardDescription className="text-gray-500 text-sm flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1" />
          Estimated time: 2-4 weeks
        </CardDescription>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <p className="text-gray-700 text-sm line-clamp-3 mb-3">
          {recommendation.description}
        </p>
        
        <div className="bg-gray-50 p-3 rounded-lg mt-2">
          <div className="flex items-start space-x-2">
            <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600 italic">
              {recommendation.reasonForRecommendation}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button 
          onClick={handleSelect}
          className="w-full"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          View Course
        </Button>
      </CardFooter>
    </Card>
  );
}