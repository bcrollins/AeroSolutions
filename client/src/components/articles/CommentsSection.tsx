import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, Flag, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Comment {
  id: number;
  content: string;
  authorName: string;
  authorImage?: string;
  createdAt: Date;
  likes: number;
  replies: Comment[];
}

interface CommentsSectionProps {
  postId: number;
  comments?: Comment[];
}

const CommentCard: React.FC<{ comment: Comment, level?: number, postId: number }> = ({ 
  comment, 
  level = 0,
  postId,
}) => {
  const { toast } = useToast();
  const [showReplies, setShowReplies] = useState(level === 0);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { user, isAuthenticated } = useAuth();
  const maxLevel = 3;
  
  const handleLike = async () => {
    // This would typically make an API call to like the comment
    toast({
      title: "Comment liked",
      description: "Thanks for your feedback!",
    });
  };
  
  const handleReport = async () => {
    toast({
      title: "Comment reported",
      description: "Thanks for helping keep our community safe.",
    });
  };
  
  const submitReply = async () => {
    if (!replyContent.trim()) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment.",
        variant: "destructive",
      });
      return;
    }
    
    // This would typically make an API call to submit the reply
    toast({
      title: "Reply submitted",
      description: "Your reply will be reviewed before publishing.",
    });
    
    setReplyContent('');
    setIsReplying(false);
  };

  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  
  return (
    <Card className={`mb-4 ${level > 0 ? 'ml-6' : ''}`}>
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-start space-x-4">
        <Avatar className="h-8 w-8">
          {comment.authorImage ? (
            <AvatarImage src={comment.authorImage} alt={comment.authorName} />
          ) : (
            <AvatarFallback>{comment.authorName.charAt(0).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">{comment.authorName}</div>
          <div className="text-xs text-muted-foreground">{formattedDate}</div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-2">
        <p>{comment.content}</p>
      </CardContent>
      
      <CardFooter className="px-4 py-2 flex justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleLike} className="h-8 text-muted-foreground hover:text-blue-600">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span className="text-xs">{comment.likes}</span>
          </Button>
          
          {level < maxLevel && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsReplying(!isReplying)}
              className="h-8 text-muted-foreground hover:text-blue-600"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-xs">Reply</span>
            </Button>
          )}
        </div>
        
        <Button variant="ghost" size="sm" onClick={handleReport} className="h-8 text-muted-foreground hover:text-red-600">
          <Flag className="h-4 w-4" />
          <span className="sr-only">Report</span>
        </Button>
      </CardFooter>
      
      {isReplying && (
        <div className="p-4 pt-0">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[80px] mb-2"
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsReplying(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={submitReply}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reply
            </Button>
          </div>
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <>
          <div 
            className="px-4 py-2 text-sm text-blue-600 cursor-pointer hover:underline flex items-center"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                <span>Hide replies ({comment.replies.length})</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                <span>Show replies ({comment.replies.length})</span>
              </>
            )}
          </div>
          
          {showReplies && (
            <div className="px-4 pb-4">
              {comment.replies.map((reply, index) => (
                <CommentCard 
                  key={index} 
                  comment={reply} 
                  level={level + 1}
                  postId={postId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  postId, 
  comments = [] 
}) => {
  const [commentContent, setCommentContent] = useState('');
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const submitComment = async () => {
    if (!commentContent.trim()) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment.",
        variant: "destructive",
      });
      return;
    }
    
    // This would typically make an API call to submit the comment
    toast({
      title: "Comment submitted",
      description: "Your comment will be reviewed before publishing.",
    });
    
    setCommentContent('');
  };
  
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Textarea
            placeholder="Join the discussion..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            className="min-h-[100px] mb-2"
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            All comments are moderated before appearing
          </p>
          <Button 
            onClick={submitComment}
            disabled={!commentContent.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Post Comment
          </Button>
        </CardFooter>
      </Card>
      
      {comments.length > 0 ? (
        <div>
          {comments.map((comment, index) => (
            <CommentCard key={index} comment={comment} postId={postId} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-semibold mb-1">No comments yet</h3>
          <p className="text-muted-foreground">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;