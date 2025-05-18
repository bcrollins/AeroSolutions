import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, BookmarkPlus, History, ArrowRight, Sparkles, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import CourseCard from '@/components/course/CourseCard';
import RecommendationExplanation from './RecommendationExplanation';

interface PersonalizedRecommendationsProps {
  limit?: number;
  showExplanations?: boolean;
  className?: string;
}

const PersonalizedRecommendations = ({
  limit = 3,
  showExplanations = true,
  className = ''
}: PersonalizedRecommendationsProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('for-you');
  
  // Fetch personalized recommendations based on the user's interests and history
  const { 
    data: personalizedData,
    isLoading: isLoadingPersonalized,
    error: personalizedError
  } = useQuery({
    queryKey: [`/api/recommendations/personalized`],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations/personalized?count=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch personalized recommendations');
      return response.json();
    },
    enabled: isAuthenticated,
    retry: 1
  });
  
  // Fetch user's learning history for history-based recommendations
  const { 
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError
  } = useQuery({
    queryKey: [`/api/recommendations/history`],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations/history`);
      if (!response.ok) throw new Error('Failed to fetch learning history');
      return response.json();
    },
    enabled: isAuthenticated,
    retry: 1
  });
  
  // Extract recommendations and history
  const personalizedRecommendations = personalizedData?.recommendations || [];
  const userHistory = historyData?.history || [];
  
  // Calculate if we can show the history tab
  const showHistoryTab = userHistory.length > 0;
  
  // Functions to handle expanding/collapsing explanations
  const toggleExplanation = (courseId: string) => {
    if (expandedExplanation === courseId) {
      setExpandedExplanation(null);
    } else {
      setExpandedExplanation(courseId);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  // Handle errors
  if (!isAuthenticated) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
            Personalized Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <BookmarkPlus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium mb-2">Sign in to get personalized recommendations</h3>
            <p className="text-gray-500 mb-4">We'll suggest courses based on your interests and learning history</p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (personalizedError && historyError) {
    console.error('Error fetching recommendations:', personalizedError);
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle>Your Recommended Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500">We're having trouble loading your recommendations right now. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const isLoading = isLoadingPersonalized || isLoadingHistory;
  
  return (
    <div className={`${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
            Personalized for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="for-you" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="for-you">For You</TabsTrigger>
              {showHistoryTab && <TabsTrigger value="history">Based on History</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="for-you">
              {isLoadingPersonalized ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(limit)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-40 w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : personalizedRecommendations.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {personalizedRecommendations.map((recommendation: any) => (
                    <motion.div key={recommendation.courseId} variants={itemVariants}>
                      <CourseCard 
                        course={{
                          id: recommendation.courseId,
                          title: recommendation.title,
                          description: recommendation.description,
                          category: recommendation.category,
                          difficulty: recommendation.difficulty,
                          price: 49.99,
                          regularPrice: 199.99
                        }}
                        showSimilarity={true}
                        similarityScore={recommendation.matchScore}
                        reasonForRecommendation={recommendation.reasonForRecommendation}
                      />
                      
                      {showExplanations && (
                        <div className="mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => toggleExplanation(recommendation.courseId)}
                          >
                            {expandedExplanation === recommendation.courseId ? 'Hide Explanation' : 'Why This Course?'}
                            <ArrowRight className={`h-3.5 w-3.5 ml-1 transition-transform duration-200 ${expandedExplanation === recommendation.courseId ? 'rotate-90' : ''}`} />
                          </Button>
                          
                          {expandedExplanation === recommendation.courseId && (
                            <RecommendationExplanation
                              matchScore={recommendation.matchScore}
                              reasonForRecommendation={recommendation.reasonForRecommendation}
                              courseTitle={recommendation.title}
                            />
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <BookmarkPlus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                  <p className="text-gray-500 mb-4">Complete courses or update your preferences to get personalized recommendations</p>
                  <Button>
                    Explore Popular Courses
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {isLoadingHistory ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-20 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              ) : userHistory.length > 0 ? (
                <motion.div 
                  className="space-y-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {userHistory.map((historyItem: any) => (
                    <motion.div key={historyItem.id} variants={itemVariants} className="border rounded-lg p-4">
                      <div className="flex items-start mb-3">
                        <History className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <h3 className="font-medium">{historyItem.title || 'Course Interaction'}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(historyItem.timestamp).toLocaleDateString()} • 
                            {historyItem.interactionType === 'view' ? ' Viewed' : 
                             historyItem.interactionType === 'click' ? ' Clicked' : 
                             historyItem.interactionType === 'complete' ? ' Completed' : ' Interacted with'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {historyItem.recommendations?.slice(0, 2).map((rec: any) => (
                          <CourseCard 
                            key={rec.courseId}
                            course={{
                              id: rec.courseId,
                              title: rec.title,
                              description: rec.description,
                              category: rec.category,
                              difficulty: rec.difficulty,
                            }}
                            showSimilarity={true}
                            similarityScore={rec.matchScore}
                            reasonForRecommendation={rec.reasonForRecommendation}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium mb-2">No learning history yet</h3>
                  <p className="text-gray-500 mb-4">Start exploring courses to build your learning history</p>
                  <Button>
                    Browse Courses <BookOpen className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedRecommendations;