import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Bookmark, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/ThemeContext';

interface ArticleReactionBarProps {
  articleId: number | string;
  compact?: boolean;
  variant?: 'compact' | 'full';
  className?: string;
}

const ArticleReactionBar: React.FC<ArticleReactionBarProps> = ({ 
  articleId, 
  compact = false,
  variant = 'full',
  className = '' 
}) => {
  // If variant is compact, set compact to true for backward compatibility
  const isCompact = compact || variant === 'compact';
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
    playSound('click');
    
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
    playSound('click');
    
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
  const containerClasses = isCompact 
    ? `flex items-center space-x-2 ${className}`
    : `flex items-center justify-center space-x-4 px-4 py-2 ${className}`;
    
  const buttonSize = isCompact ? "sm" : "default";
  const iconSize = isCompact ? 16 : 20;
  
  // Apple-inspired animation variants
  const buttonVariants = {
    initial: { opacity: 0.8, y: 5 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };
  
  const iconVariants = {
    initial: { rotate: 0 },
    like: { rotate: [0, -15, 0], transition: { duration: 0.4 } },
    save: { scale: [1, 1.2, 1], transition: { duration: 0.4 } },
    share: { rotate: [0, 15, 0], transition: { duration: 0.4 } }
  };

  return (
    <TooltipProvider>
      <div className={containerClasses}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              whileTap={buttonVariants.tap}
              whileHover={buttonVariants.hover}
              initial={buttonVariants.initial}
              animate={buttonVariants.animate}
            >
              <Button 
                variant="ghost" 
                size={buttonSize}
                className={`rounded-full group ${liked ? 'text-blue-600 dark:text-blue-500' : ''} transition-colors duration-300`}
                onClick={handleLike}
                aria-label="Like article"
              >
                <motion.div
                  animate={liked ? "like" : "initial"}
                  variants={iconVariants}
                >
                  <ThumbsUp 
                    size={iconSize} 
                    className={`${liked ? 'fill-blue-600 dark:fill-blue-500' : 'group-hover:text-blue-600 dark:group-hover:text-blue-500'} transition-all duration-300`} 
                  />
                </motion.div>
                {!isCompact && <span className="ml-2 text-sm font-medium">Like</span>}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-gray-800 text-white dark:bg-gray-700 rounded-xl text-xs py-1 px-2 shadow-lg">
            <p>Like this article</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              whileTap={buttonVariants.tap}
              whileHover={buttonVariants.hover}
              initial={buttonVariants.initial}
              animate={buttonVariants.animate}
              transition={{ delay: 0.05 }}
            >
              <Button 
                variant="ghost" 
                size={buttonSize}
                className={`rounded-full group ${disliked ? 'text-red-600 dark:text-red-500' : ''} transition-colors duration-300`}
                onClick={handleDislike}
                aria-label="Dislike article"
              >
                <motion.div
                  animate={disliked ? "like" : "initial"}
                  variants={iconVariants}
                >
                  <ThumbsDown 
                    size={iconSize} 
                    className={`${disliked ? 'fill-red-600 dark:fill-red-500' : 'group-hover:text-red-600 dark:group-hover:text-red-500'} transition-all duration-300`} 
                  />
                </motion.div>
                {!isCompact && <span className="ml-2 text-sm font-medium">Dislike</span>}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-gray-800 text-white dark:bg-gray-700 rounded-xl text-xs py-1 px-2 shadow-lg">
            <p>Dislike this article</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              whileTap={buttonVariants.tap}
              whileHover={buttonVariants.hover}
              initial={buttonVariants.initial}
              animate={buttonVariants.animate}
              transition={{ delay: 0.1 }}
            >
              <Button 
                variant="ghost" 
                size={buttonSize}
                className={`rounded-full group ${saved ? 'text-amber-600 dark:text-amber-500' : ''} transition-colors duration-300`}
                onClick={handleSave}
                aria-label={saved ? "Unsave article" : "Save article"}
              >
                <AnimatePresence mode="wait">
                  {saved ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check size={iconSize} className="text-amber-600 dark:text-amber-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="bookmark"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      variants={iconVariants}
                      whileHover="save"
                    >
                      <Bookmark size={iconSize} className="group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors duration-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {!isCompact && <span className="ml-2 text-sm font-medium">{saved ? "Saved" : "Save"}</span>}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-gray-800 text-white dark:bg-gray-700 rounded-xl text-xs py-1 px-2 shadow-lg">
            <p>{saved ? "Remove from saved" : "Save for later"}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              whileTap={buttonVariants.tap}
              whileHover={buttonVariants.hover}
              initial={buttonVariants.initial}
              animate={buttonVariants.animate}
              transition={{ delay: 0.15 }}
            >
              <Button 
                variant="ghost" 
                size={buttonSize}
                className="rounded-full group transition-colors duration-300"
                onClick={handleShare}
                aria-label="Share article"
              >
                <motion.div
                  variants={iconVariants}
                  whileHover="share"
                >
                  <Share2 
                    size={iconSize} 
                    className="group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors duration-300" 
                  />
                </motion.div>
                {!isCompact && <span className="ml-2 text-sm font-medium">Share</span>}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-gray-800 text-white dark:bg-gray-700 rounded-xl text-xs py-1 px-2 shadow-lg">
            <p>Share this article</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ArticleReactionBar;