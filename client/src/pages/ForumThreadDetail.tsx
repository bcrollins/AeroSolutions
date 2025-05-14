import { useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ChevronLeft, Home, MessageSquare } from "lucide-react";
import ForumThread from "@/components/forum/ForumThread";
import WebSocketListener from "@/components/forum/WebSocketListener";

export default function ForumThreadDetail() {
  const { threadId } = useParams<{ threadId: string }>();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Get thread category for breadcrumb
  const {
    data: threadInfo,
    isLoading: isCategoryLoading,
    isError: isCategoryError
  } = useQuery({
    queryKey: ['/api/forum/threads', threadId, 'basic'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/forum/threads/${threadId}/basic`);
        if (!response.ok) {
          throw new Error('Failed to fetch thread info');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching thread info:', error);
        return { category: 'General' };
      }
    },
    retry: false,
  });
  
  const parsedThreadId = parseInt(threadId);
  
  // Validate threadId
  useEffect(() => {
    if (isNaN(parsedThreadId) || parsedThreadId <= 0) {
      setLocation('/forum');
    }
  }, [parsedThreadId, setLocation]);
  
  if (isNaN(parsedThreadId) || parsedThreadId <= 0) {
    return null;
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      {/* WebSocket listener for real-time notifications */}
      {isAuthenticated && <WebSocketListener />}
      
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/forum">Forum</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {!isCategoryLoading && threadInfo?.category && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/forum?category=${threadInfo.category}`}>{threadInfo.category}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbLink>Thread</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      {/* Back button */}
      <div>
        <Button variant="ghost" onClick={() => setLocation('/forum')} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Forum
        </Button>
      </div>
      
      {/* Main thread content */}
      <ForumThread threadId={parsedThreadId} />
      
      {/* If we couldn't find a category */}
      {isCategoryError && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load thread metadata. Some information may be missing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}