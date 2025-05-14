import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  ThumbsUp, 
  MessageCircle, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Clock 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ForumReplyForm from "./ForumReplyForm";

// Skeleton for loading state
function ReplySkeleton() {
  return (
    <div className="mb-4 pl-0">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-4 mt-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ForumRepliesProps {
  threadId: number;
  page: number;
  setPage: (page: number) => void;
  showUnapproved?: boolean;
  onReplyAccepted?: () => void;
}

export default function ForumReplies({ 
  threadId, 
  page, 
  setPage, 
  showUnapproved = false,
  onReplyAccepted 
}: ForumRepliesProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const { 
    data, 
    isLoading,
    isError,
    refetch
  } = useQuery({ 
    queryKey: ['/api/forum/threads', threadId, 'replies', page, showUnapproved],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      const response = await fetch(`/api/forum/threads/${threadId}/replies?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch replies');
      }
      return response.json();
    }
  });

  const handleLikeReply = async (replyId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like replies",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/forum/like', {
        replyId
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like reply",
        variant: "destructive",
      });
    }
  };

  const handleAcceptAnswer = async (replyId: number) => {
    try {
      await apiRequest('POST', `/api/forum/threads/${threadId}/replies/${replyId}/accept`);
      refetch();
      
      if (onReplyAccepted) {
        onReplyAccepted();
      }
      
      toast({
        title: "Answer Accepted",
        description: "This reply has been marked as the accepted answer",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept answer",
        variant: "destructive",
      });
    }
  };

  const handleModerateReply = async (replyId: number, isApproved: boolean) => {
    try {
      await apiRequest('POST', `/api/forum/moderation/replies/${replyId}`, {
        isApproved,
        isRejected: !isApproved
      });
      refetch();
      
      toast({
        title: isApproved ? "Reply Approved" : "Reply Rejected",
        description: isApproved 
          ? "The reply is now visible to all users" 
          : "The reply has been rejected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to moderate reply",
        variant: "destructive",
      });
    }
  };

  const renderReplyStatus = (reply: any) => {
    const isPending = !reply.isApproved && !reply.isRejected;
    const isRejected = reply.isRejected;
    
    if (isPending) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="border-blue-500 text-blue-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pending
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This reply is awaiting moderation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (isRejected) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="border-red-500 text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Rejected
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This reply has been rejected by moderators</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (reply.isAcceptedAnswer) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="border-green-500 text-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Accepted Answer
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This reply has been marked as the accepted answer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return null;
  };

  const isAdmin = user?.role === 'admin';
  const isThreadAuthor = user?.id === data?.thread?.userId;
  
  if (isLoading) {
    return (
      <div className="space-y-4 mb-6">
        <ReplySkeleton />
        <ReplySkeleton />
        <ReplySkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center text-red-500 gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>Failed to load replies. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { replies, total } = data;
  const totalPages = Math.ceil(total / 20);

  if (replies.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {replies.map((reply: any, index: number) => {
        const author = data.replyAuthors[reply.userId];
        const showModeration = showUnapproved && (isAdmin || (isThreadAuthor && !reply.isApproved));
        const canAcceptAnswer = (isThreadAuthor || isAdmin) && !reply.isAcceptedAnswer && reply.isApproved;
        const indentClass = reply.parentReplyId ? "ml-8 mt-4" : "";
        
        return (
          <div key={reply.id} className={`${indentClass}`}>
            <Card className={`${reply.isAcceptedAnswer ? "border-green-500" : ""}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={author?.profileImageUrl} alt={author?.username} />
                    <AvatarFallback>{author?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{author?.username}</span>
                          {renderReplyStatus(reply)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      
                      {/* Moderation controls */}
                      {showModeration && !reply.isApproved && !reply.isRejected && (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-7 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            onClick={() => handleModerateReply(reply.id, true)}
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-7 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleModerateReply(reply.id, false)}
                          >
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="prose dark:prose-invert max-w-full text-sm" dangerouslySetInnerHTML={{ __html: reply.content }} />
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleLikeReply(reply.id)}
                        disabled={!isAuthenticated}
                      >
                        <ThumbsUp className={`h-3 w-3 mr-1 ${reply.isLikedByUser ? 'fill-current text-blue-500' : ''}`} />
                        Like ({reply.likesCount || 0})
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                        disabled={!isAuthenticated}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                      
                      {canAcceptAnswer && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 px-2 text-xs text-green-500"
                          onClick={() => handleAcceptAnswer(reply.id)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Accept as Answer
                        </Button>
                      )}
                    </div>
                    
                    {/* Nested reply form */}
                    {replyingTo === reply.id && (
                      <ForumReplyForm 
                        threadId={threadId} 
                        parentReplyId={reply.id}
                        onReplyAdded={() => {
                          setReplyingTo(null);
                          refetch();
                        }}
                        onCancel={() => setReplyingTo(null)}
                        isNested={true}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {index < replies.length - 1 && !replies[index + 1].parentReplyId && (
              <Separator className="my-6" />
            )}
          </div>
        );
      })}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around the current page
              let pageToShow = i + 1;
              if (totalPages > 5) {
                if (page > 3 && page < totalPages - 1) {
                  pageToShow = [page - 2, page - 1, page, page + 1, page + 2][i];
                } else if (page >= totalPages - 1) {
                  pageToShow = totalPages - 4 + i;
                }
              }
              
              return (
                <PaginationItem key={pageToShow}>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageToShow);
                    }}
                    isActive={page === pageToShow}
                  >
                    {pageToShow}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                aria-disabled={page === totalPages}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}