import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Brain, TrendingUp, BookOpen, Zap, BarChart3, CheckCircle2 } from 'lucide-react';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Types
interface AIInsightProps {
  articleId: number;
  articleTitle: string;
  articleContent: string;
  tags?: string[];
}

interface ArticleAnalysis {
  summary: string;
  keyPoints: string[];
  readingLevel: string;
  audienceMatch: string;
  recommendations: string[];
  contentQuality: number;
  relevanceScore: number;
}

/**
 * AI-powered component that provides article insights, summaries, and recommendations
 */
const AIArticleInsights: React.FC<AIInsightProps> = ({ 
  articleId, 
  articleTitle, 
  articleContent,
  tags = [] 
}) => {
  // QueryClient for cache management
  const queryClient = useQueryClient();
  
  // State variables
  const [activeTab, setActiveTab] = useState('summary');
  const [loadingState, setLoadingState] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  
  // Hooks
  const { playSound } = useSoundEffects();
  const { toast } = useToast();
  
  // Fetch insights data
  const { 
    data: analysis,
    isLoading,
    isError,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['/api/articles/insights', articleId],
    queryFn: async () => {
      // In a real implementation, this would use the API
      // const response = await apiRequest(`/api/articles/${articleId}/insights`);
      
      // For now, we'll simulate an API response with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return simulated data
      return {
        summary: `This article titled "${articleTitle}" explores the latest developments in AI technology and its applications in various industries. It discusses key concepts, practical implementations, and future trends.`,
        keyPoints: [
          "AI technologies are transforming multiple sectors including healthcare, finance, and manufacturing",
          "Implementation challenges include data quality, algorithm bias, and integration with existing systems",
          "Organizations adopting AI solutions are seeing significant improvements in efficiency and decision-making"
        ],
        readingLevel: "Intermediate",
        audienceMatch: "Business professionals and technology enthusiasts",
        recommendations: [
          "Advanced AI Implementation Strategies",
          "Data Privacy in the Age of AI",
          "Machine Learning for Business Leaders",
          "Ethical Considerations in AI Development",
          "The Future of Human-AI Collaboration"
        ],
        contentQuality: 8,
        relevanceScore: 9
      } as ArticleAnalysis;
    },
    enabled: !!articleId && !!articleContent,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1
  });
  
  // When data is loaded or changes, set the loading state
  useEffect(() => {
    if (isLoading || isFetching) {
      setLoadingState('loading');
    } else if (isError) {
      setLoadingState('error');
    } else if (analysis) {
      setLoadingState('success');
      playSound('success');
    }
  }, [isLoading, isFetching, isError, analysis, playSound]);
  
  // Helper functions to safely access analysis data
  const getSummary = () => analysis?.summary || 'Summary not available.';
  const getKeyPoints = () => analysis?.keyPoints || [];
  const getRecommendations = () => analysis?.recommendations || [];
  
  // Extract topics from tags with fallback
  const getTopics = () => {
    if (tags && tags.length > 0) {
      return tags;
    }
    return ['AI', 'Technology', 'Education'];
  };
  
  // Generate fresh AI insights on demand
  const handleGenerateInsights = async () => {
    setLoadingState('loading');
    playSound('click');
    
    try {
      // Force a fresh fetch from the API
      await refetch();
      
      // Invalidate the cache for this article's insights to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/articles/insights', articleId] });
      
      toast({
        title: "Insights generated!",
        description: "Fresh AI-powered insights are now available.",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      setLoadingState('error');
      toast({
        title: "Generation failed",
        description: "Unable to generate insights. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Render component
  return (
    <Card className="w-full border border-primary/10 bg-gradient-to-br from-white to-primary/5 dark:from-gray-900 dark:to-primary/10 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-primary/10 p-1">
              <Sparkles className="h-full w-full text-primary" />
              <span className="absolute inset-0 rounded-full bg-primary opacity-20"></span>
            </span>
            <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            disabled={loadingState === 'loading'}
            className="h-8 gap-1 text-xs border-primary/20 hover:bg-primary/5 text-primary hover:text-primary/80"
            onClick={handleGenerateInsights}
          >
            {loadingState === 'loading' ? (
              <>
                <span className="mr-1">⟳</span> 
                Generating...
              </>
            ) : (
              <>
                <Zap size={14} className="text-primary" />
                Refresh Insights
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          AI-generated analysis and recommendations based on this article
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-2 pb-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger 
              value="summary" 
              onClick={() => {
                setActiveTab('summary');
                playSound('navigation');
              }}
              className="flex items-center gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <BookOpen size={14} />
              <span>Summary</span>
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              onClick={() => {
                setActiveTab('insights');
                playSound('navigation');
              }}
              className="flex items-center gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Brain size={14} />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger 
              value="recommendations" 
              onClick={() => {
                setActiveTab('recommendations');
                playSound('navigation');
              }}
              className="flex items-center gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <TrendingUp size={14} />
              <span>For You</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {loadingState === 'success' ? getSummary() : (
                  <span className="flex items-center gap-2">
                    <span>⟳</span> 
                    Generating summary...
                  </span>
                )}
              </p>
              
              {loadingState === 'success' && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {getTopics().map((topic: string, idx: number) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="bg-transparent hover:bg-primary/5 text-primary/80 hover:text-primary"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="mt-0">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              {loadingState === 'success' ? (
                <ul className="text-sm space-y-2">
                  {getKeyPoints().map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <BarChart3 size={16} className="mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span>⟳</span> 
                  Analyzing article content...
                </span>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-0">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              {loadingState === 'success' ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Recommended articles based on your interests:
                  </p>
                  <ul className="text-sm space-y-2">
                    {getRecommendations().map((rec: string, idx: number) => (
                      <li key={idx} className="group transition-all">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-auto py-1.5 px-2 text-left text-gray-700 dark:text-gray-300
                            hover:bg-primary/5 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                          onClick={() => {
                            playSound('click');
                            toast({
                              title: "Coming Soon!",
                              description: "Article recommendations will be clickable in a future update.",
                            });
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-2 text-primary/70 group-hover:text-primary" />
                          {rec}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span>⟳</span> 
                  Generating personalized recommendations...
                </span>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="px-3 py-2 mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>Powered by GPT-4o</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs hover:bg-primary/5 hover:text-primary/80"
          onClick={() => {
            playSound('click');
            toast({
              title: "Feedback Recorded",
              description: "Thank you for helping improve our AI insights.",
            });
          }}
        >
          Provide Feedback
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIArticleInsights;