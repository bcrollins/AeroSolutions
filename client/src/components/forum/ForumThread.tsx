import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  ThumbsUp, 
  Calendar, 
  Eye, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ChevronLeft,
  Lock,
  Pin,
  BookMarked
} from "lucide-react";
import ForumReplyForm from "./ForumReplyForm";
import ForumReplies from "./ForumReplies";
import { formatDistanceToNow } from "date-fns";

export function ThreadSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
        <Skeleton className="h-8 w-full mt-2" />
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full" />
      </CardContent>
      <CardFooter>
        <div className="flex gap-4 w-full">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardFooter>
    </Card>
  );
}

interface ForumThreadProps {
  threadId: number;
}

export default function ForumThread({ threadId }: ForumThreadProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModerationView, setIsModerationView] = useState(false);

  const { 
    data: threadData, 
    isLoading,
    isError,
    refetch
  } = useQuery({ 
    queryKey: ['/api/forum/threads', threadId],
    enabled: !!threadId,
  });

  const isAdmin = user?.role === 'admin';
  const isThreadAuthor = user?.id === threadData?.author?.id;
  const canModerate = isAdmin || isThreadAuthor;

  useEffect(() => {
    // Reset to page 1 when thread changes
    setCurrentPage(1);
  }, [threadId]);

  const handleLikeThread = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/forum/like', {
        threadId: threadId
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like thread",
        variant: "destructive",
      });
    }
  };

  const handleModerateThread = async (isApproved: boolean) => {
    try {
      await apiRequest('POST', `/api/forum/moderation/threads/${threadId}`, {
        isApproved,
        isRejected: !isApproved
      });
      refetch();
      
      toast({
        title: isApproved ? "Thread Approved" : "Thread Rejected",
        description: isApproved 
          ? "The thread is now visible to all users" 
          : "The thread has been rejected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to moderate thread",
        variant: "destructive",
      });
    }
  };

  const handleReplyAdded = () => {
    refetch();
  };

  if (isLoading) return <ThreadSkeleton />;

  if (isError) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Thread</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was a problem loading this thread. It may have been deleted or you may not have permission to view it.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setLocation('/forum')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const { thread, author, replies, total } = threadData;
  const isLocked = thread.isLocked;
  const isPending = !thread.isApproved && !thread.isRejected;
  const isRejected = thread.isRejected;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Avatar className="h-12 w-12">
                <AvatarImage src={author.profileImageUrl} alt={author.username} />
                <AvatarFallback>{author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{author.username}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageSquare className="mr-1 h-3 w-3" />
                  <span>Posts: {author.threadCount || 0}</span>
                  <span className="mx-2">•</span>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  <span>Answers: {author.acceptedAnswers || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Thread status indicators */}
            <div className="flex gap-2">
              {thread.isPinned && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500 flex items-center gap-1">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This thread has been pinned by moderators</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {isLocked && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="border-orange-500 text-orange-500 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Locked
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This thread is locked and cannot receive new replies</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {isPending && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="border-blue-500 text-blue-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This thread is awaiting moderation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {isRejected && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="border-red-500 text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Rejected
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This thread has been rejected by moderators</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {thread.courseId && (
                <Link to={`/courses/${thread.courseId}`}>
                  <Badge variant="outline" className="border-green-500 text-green-500 flex items-center gap-1">
                    <BookMarked className="h-3 w-3" />
                    Course Thread
                  </Badge>
                </Link>
              )}
            </div>
          </div>
          
          <CardTitle className="text-xl md:text-2xl">{thread.title}</CardTitle>
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {thread.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="mr-1 h-3 w-3" /> {tag}
                </Badge>
              ))}
            </div>
          )}
          <CardDescription className="flex items-center gap-2 mt-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
            <span className="mx-1">•</span>
            <Eye className="h-4 w-4" />
            <span>{thread.views} views</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="prose dark:prose-invert max-w-full" dangerouslySetInnerHTML={{ __html: thread.content }} />
        </CardContent>
        
        <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleLikeThread}
              disabled={!isAuthenticated}
            >
              <ThumbsUp className={`h-4 w-4 ${thread.isLikedByUser ? 'fill-current text-blue-500' : ''}`} />
              <span>{thread.likesCount || 0}</span>
            </Button>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>{total} replies</span>
            </div>
          </div>
          
          {/* Moderation buttons for admins */}
          {isAdmin && isPending && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                onClick={() => handleModerateThread(true)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={() => handleModerateThread(false)}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* Tabs for replies and moderation */}
      {(canModerate || thread.isApproved) && (
        <Tabs defaultValue="replies" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="replies">Replies</TabsTrigger>
            {canModerate && <TabsTrigger value="moderation" onClick={() => setIsModerationView(true)}>Moderation</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="replies">
            <ForumReplies 
              threadId={threadId} 
              page={currentPage} 
              setPage={setCurrentPage} 
              showUnapproved={isAdmin || isThreadAuthor}
              onReplyAccepted={() => refetch()}
            />
            
            {!isLocked && thread.isApproved && (
              <ForumReplyForm threadId={threadId} onReplyAdded={handleReplyAdded} />
            )}
          </TabsContent>
          
          {canModerate && (
            <TabsContent value="moderation">
              <Card>
                <CardHeader>
                  <CardTitle>Thread Moderation</CardTitle>
                  <CardDescription>Manage this thread's status and visibility</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Thread Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium w-24">Created:</span>
                          <span>{new Date(thread.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium w-24">Status:</span>
                          <span>
                            {isPending && "Pending Approval"}
                            {thread.isApproved && "Approved"}
                            {isRejected && "Rejected"}
                          </span>
                        </div>
                        {thread.moderatedAt && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium w-24">Moderated:</span>
                            <span>{new Date(thread.moderatedAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Moderation Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {!thread.isApproved && (
                          <Button
                            variant="outline"
                            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            onClick={() => handleModerateThread(true)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve Thread
                          </Button>
                        )}
                        
                        {!isRejected && (
                          <Button
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleModerateThread(false)}
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Reject Thread
                          </Button>
                        )}
                        
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              className={thread.isPinned ? 'border-yellow-500 text-yellow-500' : ''}
                              onClick={async () => {
                                try {
                                  await apiRequest('POST', `/api/forum/threads/${threadId}/toggle-pin`);
                                  refetch();
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to toggle pin status",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <Pin className="mr-2 h-4 w-4" />
                              {thread.isPinned ? 'Unpin Thread' : 'Pin Thread'}
                            </Button>
                            
                            <Button
                              variant="outline"
                              className={isLocked ? 'border-orange-500 text-orange-500' : ''}
                              onClick={async () => {
                                try {
                                  await apiRequest('POST', `/api/forum/threads/${threadId}/toggle-lock`);
                                  refetch();
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to toggle lock status",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <Lock className="mr-2 h-4 w-4" />
                              {isLocked ? 'Unlock Thread' : 'Lock Thread'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}