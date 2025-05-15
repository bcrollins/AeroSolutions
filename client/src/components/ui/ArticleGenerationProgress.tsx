import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface ArticleGenerationStats {
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
  lastArticleTitle: string;
  estimatedTimeRemaining: number; // in seconds
  status: 'idle' | 'running' | 'completed' | 'error';
}

interface ArticleGenerationProgressProps {
  onComplete?: () => void;
  className?: string;
}

const ArticleGenerationProgress: React.FC<ArticleGenerationProgressProps> = ({ 
  onComplete,
  className = ''
}) => {
  const { toast } = useToast();
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Fetch generation status
  const { 
    data: stats, 
    isLoading, 
    isError,
    refetch,
    dataUpdatedAt,
    isRefetching,
  } = useQuery({
    queryKey: ['article-generation-status'],
    queryFn: async () => {
      try {
        // In a real implementation, fetch from the API
        // return await apiRequest('/api/admin/articles/generation/status');
        
        // For demo purposes, simulate a response
        // This would normally come from the server
        const mockData: ArticleGenerationStats = {
          total: 50,
          completed: Math.min(50, Math.floor(new Date().getSeconds() / 1.2) + 5),
          inProgress: 1,
          failed: 0,
          lastArticleTitle: "Revolutionizing Business Intelligence with GPT-4",
          estimatedTimeRemaining: 720, // 12 minutes
          status: 'running'
        };
        
        // Set status based on completion
        if (mockData.completed >= mockData.total) {
          mockData.status = 'completed';
          mockData.inProgress = 0;
          
          // Only call onComplete once when generation finishes
          if (onComplete) {
            onComplete();
          }
        }
        
        return mockData;
      } catch (error) {
        console.error("Failed to fetch article generation status:", error);
        throw error;
      }
    },
    refetchInterval: autoRefresh ? 5000 : false,
    refetchOnWindowFocus: autoRefresh,
    staleTime: 2000
  });
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec remaining`;
    if (seconds < 3600) {
      const minutes = Math.ceil(seconds / 60);
      return `${minutes} min remaining`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.ceil((seconds % 3600) / 60);
    return `${hours}h ${minutes}m remaining`;
  };
  
  // Calculate completion percentage
  const getCompletionPercentage = (): number => {
    if (!stats) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };
  
  // Get status badge
  const getStatusBadge = () => {
    if (!stats) return <Badge variant="outline">Unknown</Badge>;
    
    switch(stats.status) {
      case 'idle':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Idle</Badge>;
      case 'running':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Render component
  return (
    <Card className={`bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-medium">Article Generation</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        {isLoading && !stats ? (
          <div className="h-16 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-primary/70" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading status...</span>
          </div>
        ) : isError ? (
          <div className="h-16 flex flex-col items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Failed to load status</span>
          </div>
        ) : stats ? (
          <>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stats.status === 'completed' 
                    ? 'All articles generated' 
                    : `Generating ${stats.total} articles...`}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getCompletionPercentage()}%
                </span>
              </div>
              
              <Progress 
                value={getCompletionPercentage()} 
                max={100}
                className="h-2 bg-gray-100 dark:bg-gray-800"
              />
            </div>
            
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Generated</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {stats.completed} / {stats.total}
                </span>
              </div>
              
              {stats.status !== 'completed' && stats.status !== 'error' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Time remaining</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {formatTimeRemaining(stats.estimatedTimeRemaining)}
                  </span>
                </div>
              )}
              
              {stats.lastArticleTitle && stats.status !== 'completed' && (
                <div className="mt-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Latest article:</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                    {stats.lastArticleTitle}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
      
      <CardFooter className="pt-1 pb-3 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 text-xs"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`mr-1 h-3 w-3 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 text-xs"
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? 'Pause Auto-Refresh' : 'Enable Auto-Refresh'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ArticleGenerationProgress;