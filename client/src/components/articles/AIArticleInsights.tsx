import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Brain, TrendingUp, BookOpen, Zap, BarChart3 } from 'lucide-react';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useToast } from '@/hooks/use-toast';

// Types
interface AIInsightProps {
  articleId: number;
  articleTitle: string;
  articleContent: string;
  tags?: string[];
}

// Simulated responses while waiting for actual API data
const dummySummary = "This article explores key developments in artificial intelligence and its implications for business strategy, covering technological advancements, practical applications, and future trends.";

const dummyTopics = ["AI Ethics", "Machine Learning", "Business Strategy", "Digital Transformation"];

const dummyInsights = [
  "The article emphasizes a shift from traditional to AI-augmented decision making",
  "Companies integrating AI strategies are seeing 35% higher efficiency rates",
  "Ethical considerations remain a critical challenge for implementation"
];

const dummyRecommendations = [
  "Machine Learning Applications in Finance",
  "The Future of AI in Healthcare",
  "Ethical Considerations for AI Development",
  "Neural Networks Explained for Business Leaders",
  "How AI is Transforming Customer Experience"
];

/**
 * AI-powered component that provides article insights, summaries, and recommendations
 */
const AIArticleInsights: React.FC<AIInsightProps> = ({ 
  articleId, 
  articleTitle, 
  articleContent,
  tags = [] 
}) => {
  // State variables
  const [summary, setSummary] = useState<string>(dummySummary);
  const [topics, setTopics] = useState<string[]>(dummyTopics);
  const [insights, setInsights] = useState<string[]>(dummyInsights);
  const [recommendations, setRecommendations] = useState<string[]>(dummyRecommendations);
  const [activeTab, setActiveTab] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  
  // Hooks
  const { playSound } = useSoundEffects();
  const { toast } = useToast();
  
  // Generate AI insights on mount and when article changes
  useEffect(() => {
    // To be replaced with actual API calls to the OpenAI service
    const simulateApiCall = async () => {
      // In a real implementation, this would call our backend API
      // which would then use the OpenAI service we've created
      console.log(`Generating insights for article: ${articleId}`);
      
      // For now, we're using the dummy data defined above
      setTimeout(() => {
        setHasGeneratedContent(true);
      }, 500);
    };
    
    simulateApiCall();
  }, [articleId, articleTitle]);
  
  // Generate fresh AI insights on demand
  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    playSound('click');
    
    try {
      // This would be an actual API call in production
      // const response = await fetch(`/api/articles/${articleId}/insights`);
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refresh all insights with "new" data
      setHasGeneratedContent(true);
      
      toast({
        title: "Insights generated!",
        description: "Fresh AI-powered insights are now available.",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Generation failed",
        description: "Unable to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></span>
            </span>
            <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            disabled={isGenerating}
            className="h-8 gap-1 text-xs border-primary/20 hover:bg-primary/5 text-primary hover:text-primary/80"
            onClick={handleGenerateInsights}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin mr-1">⟳</span> 
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
                {hasGeneratedContent ? summary : (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">⟳</span> 
                    Generating summary...
                  </span>
                )}
              </p>
              
              {hasGeneratedContent && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {topics.map((topic, idx) => (
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
              {hasGeneratedContent ? (
                <ul className="text-sm space-y-2">
                  {insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <BarChart3 size={16} className="mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="animate-pulse">⟳</span> 
                  Analyzing article content...
                </span>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-0">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              {hasGeneratedContent ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Recommended articles based on your interests:
                  </p>
                  <ul className="text-sm space-y-2">
                    {recommendations.map((rec, idx) => (
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
                  <span className="animate-pulse">⟳</span> 
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