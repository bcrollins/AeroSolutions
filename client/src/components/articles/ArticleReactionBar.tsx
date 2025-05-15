import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Bookmark, Share2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface ArticleReactionBarProps {
  articleId: number;
  className?: string;
  variant?: 'compact' | 'full';
}

const ArticleReactionBar: React.FC<ArticleReactionBarProps> = ({ 
  articleId, 
  className = '',
  variant = 'full'
}) => {
  // State for tracking user reactions
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 5);
  
  // Sound effects
  const { playSound } = useSoundEffects();
  const { toast } = useToast();
  
  // Handle like click with debounce
  const handleLike = () => {
    if (disliked) {
      setDisliked(false);
    }
    
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    playSound('click');
    
    // Here we would also call the API to update the reaction in the database
    // apiRequest('POST', `/api/articles/${articleId}/react`, { reaction: liked ? 'none' : 'like' });
  };
  
  const handleDislike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    }
    
    setDisliked(prev => !prev);
    playSound('click');
    
    // Here we would also call the API to update the reaction in the database
    // apiRequest('POST', `/api/articles/${articleId}/react`, { reaction: disliked ? 'none' : 'dislike' });
  };
  
  const handleSave = () => {
    setSaved(prev => !prev);
    playSound('click');
    
    toast({
      title: saved ? 'Article removed from bookmarks' : 'Article saved to bookmarks',
      description: saved ? 'You can add it again anytime.' : 'You can find it in your saved articles.',
      variant: saved ? 'default' : 'default',
    });
    
    // Here we would also call the API to update the bookmark in the database
    // apiRequest('POST', `/api/articles/${articleId}/bookmark`, { bookmarked: !saved });
  };
  
  const handleShare = () => {
    playSound('click');
    
    // Copy article URL to clipboard
    const articleUrl = `${window.location.origin}/articles/${articleId}`;
    navigator.clipboard.writeText(articleUrl);
    
    toast({
      title: 'Link copied to clipboard',
      description: 'You can now share this article with others.',
    });
  };
  
  const handleComment = () => {
    playSound('click');
    
    // This would typically open a comment form or navigate to comments section
    toast({
      title: 'Comments feature',
      description: 'Comments will be available in the next update!',
      variant: 'default',
    });
  };
  
  // For compact variant, show only the essentials
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <button 
          onClick={handleLike}
          className={`p-1 rounded-full transition-colors ${liked ? 'text-blue-500' : 'hover:text-gray-600'}`}
          aria-label="Like article"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        
        <span className="text-xs font-medium text-gray-500">{likeCount}</span>
        
        <button 
          onClick={handleSave}
          className={`p-1 rounded-full transition-colors ${saved ? 'text-blue-500' : 'hover:text-gray-600'}`}
          aria-label="Save article"
        >
          <Bookmark className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }
  
  // Full variant with all reaction options
  return (
    <TooltipProvider delayDuration={300}>
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button 
                onClick={handleLike}
                className={`p-1.5 rounded-full transition-colors ${liked ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
                whileTap={{ scale: 0.9 }}
                aria-label="Like article"
              >
                <ThumbsUp className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-gray-800 text-white">
              {liked ? 'Unlike' : 'Like'}
            </TooltipContent>
          </Tooltip>
          
          <span className="text-xs font-medium text-gray-500 mr-2">{likeCount}</span>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button 
                onClick={handleDislike}
                className={`p-1.5 rounded-full transition-colors ${disliked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                whileTap={{ scale: 0.9 }}
                aria-label="Dislike article"
              >
                <ThumbsDown className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-gray-800 text-white">
              {disliked ? 'Remove dislike' : 'Dislike'}
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button 
                onClick={handleComment}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Comment on article"
              >
                <MessageSquare className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-gray-800 text-white">
              Comment
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button 
                onClick={handleSave}
                className={`p-1.5 rounded-full transition-colors ${saved ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
                whileTap={{ scale: 0.9 }}
                aria-label="Save article"
              >
                <Bookmark className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-gray-800 text-white">
              {saved ? 'Unsave' : 'Save'}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button 
                onClick={handleShare}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Share article"
              >
                <Share2 className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-gray-800 text-white">
              Share
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ArticleReactionBar;