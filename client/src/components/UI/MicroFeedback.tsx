import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown, X, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface MicroFeedbackProps {
  elementId: string;
  type?: 'inline' | 'floating' | 'modal';
  position?: 'top' | 'bottom' | 'left' | 'right';
  question?: string;
  onFeedbackSubmit?: (feedback: { helpful: boolean; comment?: string; elementId: string }) => void;
  className?: string;
  autoShowDelay?: number; // milliseconds
  autoHide?: boolean;
  autoHideDelay?: number; // milliseconds
  persistInStorage?: boolean;
  allowComment?: boolean;
  compact?: boolean;
  labels?: {
    helpful: string;
    notHelpful: string;
    comment: string;
    submit: string;
    thanks: string;
  };
}

/**
 * MicroFeedback component for collecting contextual user feedback
 * Provides multiple presentation options and customizable behavior
 */
export function MicroFeedback({
  elementId,
  type = 'inline',
  position = 'bottom',
  question = 'Was this helpful?',
  onFeedbackSubmit,
  className = '',
  autoShowDelay = 0, // Default to immediate display
  autoHide = false,
  autoHideDelay = 5000, // 5 seconds
  persistInStorage = true,
  allowComment = true,
  compact = false,
  labels = {
    helpful: 'Yes',
    notHelpful: 'No',
    comment: 'Tell us why',
    submit: 'Submit',
    thanks: 'Thanks for your feedback!'
  }
}: MicroFeedbackProps) {
  // If this feedback was previously submitted and we need to persist that
  const storageKey = `feedback-${elementId}`;
  const [isVisible, setIsVisible] = useState(!autoShowDelay);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  // Check if feedback was already submitted
  useEffect(() => {
    if (persistInStorage) {
      const storedFeedback = localStorage.getItem(storageKey);
      if (storedFeedback) {
        setIsSubmitted(true);
      }
    }
  }, [persistInStorage, storageKey]);

  // Handle auto-show delay
  useEffect(() => {
    if (autoShowDelay > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, autoShowDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoShowDelay, isSubmitted]);

  // Handle auto-hide
  useEffect(() => {
    if (autoHide && isVisible && isSubmitted) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, isVisible, isSubmitted, autoHideDelay]);

  // Handle feedback submission
  const handleFeedback = (helpful: boolean) => {
    setIsHelpful(helpful);
    
    if (!allowComment) {
      submitFeedback(helpful);
    } else {
      setShowComment(true);
    }
  };

  const submitFeedback = (helpful: boolean, userComment?: string) => {
    // Store in localStorage if needed
    if (persistInStorage) {
      localStorage.setItem(storageKey, JSON.stringify({ 
        helpful, 
        comment: userComment || comment,
        timestamp: new Date().toISOString() 
      }));
    }
    
    // Trigger callback if provided
    if (onFeedbackSubmit) {
      onFeedbackSubmit({
        helpful,
        comment: userComment || comment,
        elementId
      });
    }
    
    // Update UI state
    setIsSubmitted(true);
    setShowComment(false);
    
    // Show toast confirmation
    toast({
      title: "Feedback Received",
      description: labels.thanks,
      duration: 3000,
    });
    
    // Auto hide if configured
    if (autoHide) {
      setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = () => {
    submitFeedback(isHelpful || false, comment);
  };

  // Dismiss the feedback component
  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Get appropriate styles based on type and position
  const getContainerStyles = () => {
    const baseStyles = 'rounded-lg p-3 shadow-sm bg-background border border-border';
    
    if (type === 'inline') {
      return cn(baseStyles, 'w-full', className);
    }
    
    if (type === 'floating') {
      const positionStyles = {
        top: 'top-4 left-1/2 transform -translate-x-1/2',
        bottom: 'bottom-4 left-1/2 transform -translate-x-1/2',
        left: 'left-4 top-1/2 transform -translate-y-1/2',
        right: 'right-4 top-1/2 transform -translate-y-1/2'
      };
      
      return cn(
        baseStyles,
        'fixed z-50 max-w-sm',
        positionStyles[position],
        className
      );
    }
    
    if (type === 'modal') {
      return cn(
        baseStyles,
        'fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        'max-w-md w-full backdrop-blur-sm',
        className
      );
    }
    
    return baseStyles;
  };

  // Animations for each type
  const getAnimationVariants = () => {
    if (type === 'inline') {
      return {
        hidden: { opacity: 0, height: 0, overflow: 'hidden' },
        visible: { opacity: 1, height: 'auto', overflow: 'visible' },
        exit: { opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.2 } }
      };
    }
    
    if (type === 'floating') {
      const positionAnimations = {
        top: { hidden: { y: -20, opacity: 0 }, visible: { y: 0, opacity: 1 }, exit: { y: -20, opacity: 0 } },
        bottom: { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }, exit: { y: 20, opacity: 0 } },
        left: { hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } },
        right: { hidden: { x: 20, opacity: 0 }, visible: { x: 0, opacity: 1 }, exit: { x: 20, opacity: 0 } }
      };
      
      return positionAnimations[position];
    }
    
    if (type === 'modal') {
      return {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
      };
    }
    
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    };
  };

  // If should not be visible, don't render anything
  if (!isVisible || (isSubmitted && !autoHideDelay)) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="feedback"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={getAnimationVariants()}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={getContainerStyles()}
      >
        {/* Display backdrop for modal type */}
        {type === 'modal' && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />
        )}
        
        {/* Close button for floating and modal */}
        {(type === 'floating' || type === 'modal') && (
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            aria-label="Close feedback"
          >
            <X size={16} />
          </button>
        )}
        
        {/* Content */}
        <div className="space-y-3">
          {/* Already submitted state */}
          {isSubmitted ? (
            <div className="flex items-center justify-center text-center py-2">
              <p className="text-sm font-medium text-primary">{labels.thanks}</p>
            </div>
          ) : (
            <>
              {/* Feedback question */}
              {!showComment && (
                <>
                  <p className={cn("text-sm font-medium", compact ? "text-xs" : "text-sm")}>
                    {question}
                  </p>
                  
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size={compact ? "sm" : "default"}
                      className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleFeedback(true)}
                    >
                      <ThumbsUp size={compact ? 14 : 16} />
                      {!compact && <span>{labels.helpful}</span>}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size={compact ? "sm" : "default"}
                      className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleFeedback(false)}
                    >
                      <ThumbsDown size={compact ? 14 : 16} />
                      {!compact && <span>{labels.notHelpful}</span>}
                    </Button>
                  </div>
                </>
              )}
              
              {/* Comment section */}
              {showComment && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} className="text-muted-foreground" />
                      <p className="text-sm font-medium">{labels.comment}</p>
                    </div>
                    
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Your feedback helps us improve"
                      className="resize-none min-h-[80px]"
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowComment(false)}
                      >
                        Back
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={handleCommentSubmit}
                        className="gap-1"
                      >
                        <Send size={14} />
                        {labels.submit}
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}