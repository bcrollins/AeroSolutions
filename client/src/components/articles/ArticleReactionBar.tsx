import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Bookmark, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/ThemeContext';

interface ArticleReactionBarProps {
  articleId: number | string;
  compact?: boolean;
  className?: string;
}

const ArticleReactionBar: React.FC<ArticleReactionBarProps> = ({ 
  articleId, 
  compact = false,
  className = '' 
}) => {
  const { toast } = useToast();
  const { playSound } = useSoundEffects();
  const { getCurrentTheme } = useTheme();
  const isDarkMode = getCurrentTheme() === 'dark';
  
  // Local state for reactions
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Handle like action
  const handleLike = () => {
    if (disliked) setDisliked(false);
    setLiked(!liked);
    playSound('tap');
    
    // API call would go here
    // fetch('/api/articles/like', { method: 'POST', body: JSON.stringify({ articleId, like: !liked }) })
    
    if (!liked) {
      toast({
        title: "Article liked",
        description: "Thank you for your feedback!",
        variant: "default",
      });
    }
  };
  
  // Handle dislike action
  const handleDislike = () => {
    if (liked) setLiked(false);
    setDisliked(!disliked);
    playSound('tap');
    
    // API call would go here
    // fetch('/api/articles/dislike', { method: 'POST', body: JSON.stringify({ articleId, dislike: !disliked }) })
    
    if (!disliked) {
      toast({
        title: "Article disliked",
        description: "Thank you for your feedback!",
        variant: "default",
      });
    }
  };
  
  // Handle save action
  const handleSave = () => {
    setSaved(!saved);
    playSound(saved ? 'click' : 'success');
    
    // API call would go here
    // fetch('/api/articles/save', { method: 'POST', body: JSON.stringify({ articleId, save: !saved }) })
    
    toast({
      title: saved ? "Article removed from saved items" : "Article saved",
      description: saved ? "The article has been removed from your saved items." : "You can find this article in your saved items.",
      variant: "default",
    });
  };
  
  // Handle share action
  const handleShare = () => {
    playSound('notification');
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).then(() => {
        console.log('Thanks for sharing!');
      }).catch(console.error);
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard",
          variant: "default",
        });
      }).catch(err => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Sharing failed",
          description: "Could not copy link to clipboard",
          variant: "destructive",
        });
      });
    }
  };

  // Apply different styles based on compact mode
  const containerClasses = compact 
    ? `flex items-center space-x-2 ${className}`
    : `flex items-center justify-center space-x-4 px-4 py-2 ${className}`;
    
  const buttonSize = compact ? "sm" : "default";
  const iconSize = compact ? 16 : 20;
  
  return (
    <TooltipProvider>
      <div className={containerClasses}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size={buttonSize}
                className={`rounded-full group ${liked ? 'text-blue-500 dark:text-blue-400' : ''}`}
                onClick={handleLike}
                aria-label="Like article"
              >
                <ThumbsUp size={iconSize} className={`${liked ? 'fill-blue-500 dark:fill-blue-400' : 'group-hover:text-blue-500 dark:group-hover:text-blue-400'}`} />
                {!compact && <span className="ml-2">Like</span>}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-gray-800 text-white dark:bg-gray-700">
            <p>Like this article</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size={buttonSize}
                className={`rounded-full group ${disliked ? 'text-red-500 dark:text-red-400' : ''}`}
                onClick={handleDislike}
                aria-label="Dislike article"
              >
                <ThumbsDown size={iconSize} className={`${disliked ? 'fill-red-500 dark:fill-red-400' : 'group-hover:text-red-500 dark:group-hover:text-red-400'}`} />
                {!compact && <span className="ml-2">Dislike</span>}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-gray-800 text-white dark:bg-gray-700">
            <p>Dislike this article</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size={buttonSize}
                className={`rounded-full group ${saved ? 'text-amber-500 dark:text-amber-400' : ''}`}
                onClick={handleSave}
                aria-label={saved ? "Unsave article" : "Save article"}
              >
                {saved ? (
                  <Check size={iconSize} className="text-amber-500 dark:text-amber-400" />
                ) : (
                  <Bookmark size={iconSize} className="group-hover:text-amber-500 dark:group-hover:text-amber-400" />
                )}
                {!compact && <span className="ml-2">{saved ? "Saved" : "Save"}</span>}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-gray-800 text-white dark:bg-gray-700">
            <p>{saved ? "Remove from saved" : "Save for later"}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size={buttonSize}
                className="rounded-full group"
                onClick={handleShare}
                aria-label="Share article"
              >
                <Share2 size={iconSize} className="group-hover:text-green-500 dark:group-hover:text-green-400" />
                {!compact && <span className="ml-2">Share</span>}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-gray-800 text-white dark:bg-gray-700">
            <p>Share this article</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ArticleReactionBar;