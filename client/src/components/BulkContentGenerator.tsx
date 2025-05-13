import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';

interface GenerationStatus {
  inProgress: boolean;
  completed: boolean;
  articlesGenerated: number;
  totalArticles: number;
  error: string | null;
}

const BulkContentGenerator: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    inProgress: false,
    completed: false,
    articlesGenerated: 0,
    totalArticles: 50,
    error: null
  });

  // Mutation for bulk article generation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/content-generation/ai-articles', {
        count: generationStatus.totalArticles
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setGenerationStatus({
          ...generationStatus,
          inProgress: true,
          error: null
        });
        
        toast({
          title: 'AI Article Generation Started',
          description: 'The system is now generating AI articles. This process may take several minutes to complete.',
        });
        
        // Close the dialog after starting the process
        setDialogOpen(false);
        
        // Invalidate content queries to refresh the list as articles are generated
        queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      } else {
        setGenerationStatus({
          ...generationStatus,
          error: data.message || 'Failed to start article generation'
        });
        
        toast({
          title: 'Failed to Start Generation',
          description: data.message || 'There was an error starting the article generation process.',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      setGenerationStatus({
        ...generationStatus,
        error: error.message || 'An unexpected error occurred'
      });
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to start article generation. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Helper function to check if user is an admin
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  // Function to start AI article generation
  const startGeneration = () => {
    setGenerationStatus({
      inProgress: false,
      completed: false,
      articlesGenerated: 0,
      totalArticles: 50,
      error: null
    });
    
    generateMutation.mutate();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Bulk AI Article Generation</CardTitle>
            <CardDescription>
              Generate a comprehensive set of AI-focused articles for your Content Hub
            </CardDescription>
          </div>
          <Badge variant={isAdmin() ? "outline" : "secondary"}>
            {isAdmin() ? "Admin Access" : "Admin Only"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              Use XAI's advanced capabilities to automatically generate 50 high-quality articles about trending AI topics.
              These articles will be published in your Content Hub and reflect ROLLINSX's professional voice and expertise.
            </p>
            <div className="flex flex-col space-y-2 mt-4">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>Professionally written with proper citations and structured formatting</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>SEO-optimized with meta descriptions and relevant keywords</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>Varied mix of technical, business, and ethical AI topics</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span>Automatically published to your content library</span>
              </div>
            </div>
          </div>
          
          {generationStatus.inProgress && (
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <Loader2 className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
                <span className="text-blue-600 font-medium">
                  Generating Articles...
                </span>
              </div>
              <p className="text-sm text-blue-600 mb-2">
                Article generation is in progress. This can take 10-15 minutes to complete.
                You can check the Content Hub to see articles as they're created.
              </p>
              <Progress value={20} className="h-2" />
            </div>
          )}
          
          {generationStatus.error && (
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-600 font-medium">
                  Generation Error
                </span>
              </div>
              <p className="text-sm text-red-600">
                {generationStatus.error}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full" 
              disabled={!isAdmin() || generateMutation.isPending || generationStatus.inProgress}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate 50 AI Articles
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate 50 AI Articles</DialogTitle>
              <DialogDescription>
                This process will use XAI to research trending AI topics and create 50 professional articles. 
                This will take approximately 10-15 minutes to complete and the articles will be published 
                to your Content Hub as they are generated.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-amber-50 p-3 rounded-md my-2">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>This will consume API usage credits</li>
                    <li>The generation process runs in the background</li>
                    <li>You can navigate away after starting</li>
                    <li>Articles will appear in the Content Hub gradually</li>
                  </ul>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={startGeneration}>
                Yes, Generate Articles
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default BulkContentGenerator;