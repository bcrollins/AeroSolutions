import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, ThumbsDown, X, Send, Smile, Frown, Meh } from 'lucide-react';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { cn } from '@/lib/utils';

interface FeedbackWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  onSubmit?: (data: FeedbackData) => void;
  className?: string;
  compact?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export interface FeedbackData {
  type: 'suggestion' | 'issue' | 'praise';
  rating?: 1 | 2 | 3 | 4 | 5;
  message: string;
  emoji?: '😀' | '😐' | '😞';
}

/**
 * An interactive feedback widget with animations and ratings
 */
const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  position = 'bottom-right',
  primaryColor = 'bg-primary',
  onSubmit,
  className,
  compact = false,
  autoClose = true,
  autoCloseDelay = 5000
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'issue' | 'praise' | null>(null);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState<'😀' | '😐' | '😞' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { playSound, settings } = useSoundEffects();
  const soundEnabled = settings?.enabled || false;

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Toggle widget open/closed
  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (soundEnabled) playSound(isOpen ? 'click' : 'navigation');
    
    // Reset form when closing
    if (isOpen) {
      resetForm();
    }
  };

  // Select feedback type
  const selectFeedbackType = (type: 'suggestion' | 'issue' | 'praise') => {
    setFeedbackType(type);
    if (soundEnabled) playSound('click');
  };

  // Select emoji
  const selectEmoji = (selected: '😀' | '😐' | '😞') => {
    setEmoji(selected);
    
    // Set a default rating based on emoji
    if (selected === '😀') setRating(5);
    else if (selected === '😐') setRating(3);
    else if (selected === '😞') setRating(1);
    
    if (soundEnabled) playSound('click');
  };

  // Set star rating
  const selectRating = (value: 1 | 2 | 3 | 4 | 5) => {
    setRating(value);
    
    // Update emoji based on rating
    if (value >= 4) setEmoji('😀');
    else if (value >= 2) setEmoji('😐');
    else setEmoji('😞');
    
    if (soundEnabled) playSound('click');
  };

  // Reset form
  const resetForm = () => {
    setFeedbackType(null);
    setRating(null);
    setMessage('');
    setEmoji(null);
    setIsSuccess(false);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!feedbackType || !message) return;
    
    setIsSubmitting(true);
    
    try {
      // Create feedback data object
      const feedbackData: FeedbackData = {
        type: feedbackType,
        message,
        ...(rating && { rating }),
        ...(emoji && { emoji })
      };
      
      // Call onSubmit handler if provided
      if (onSubmit) {
        await onSubmit(feedbackData);
      }
      
      // Show success state
      setIsSuccess(true);
      if (soundEnabled) playSound('success');
      
      // Auto close after delay
      if (autoClose) {
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(resetForm, 300); // Reset after close animation
        }, autoCloseDelay);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (soundEnabled) playSound('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const buttonVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };
  
  const panelVariants = {
    initial: { opacity: 0, scale: 0.9, y: 10 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: 10,
      transition: { 
        duration: 0.2,
        ease: [0.32, 0, 0.67, 0]
      }
    }
  };

  return (
    <div 
      className={cn(
        "fixed z-50", 
        positionClasses[position],
        className
      )}
    >
      {/* Feedback Button */}
      <motion.button
        className={cn(
          "flex items-center justify-center rounded-full shadow-lg text-white",
          primaryColor,
          compact ? "w-10 h-10" : "py-3 px-4"
        )}
        onClick={toggleWidget}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
        aria-label="Give feedback"
      >
        {isOpen ? (
          <X size={compact ? 18 : 20} />
        ) : (
          <>
            {compact ? (
              <MessageSquare size={18} />
            ) : (
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <span className="text-sm font-medium">Feedback</span>
              </div>
            )}
          </>
        )}
      </motion.button>

      {/* Feedback Panel */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="absolute bottom-14 right-0 w-80 bg-card rounded-lg border border-border shadow-xl overflow-hidden"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={panelVariants}
          >
            {/* Panel Header */}
            <div className="bg-muted p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Share your feedback</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Help us improve your experience
              </p>
            </div>

            {/* Success Message */}
            {isSuccess ? (
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
                >
                  <ThumbsUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </motion.div>
                <h4 className="text-lg font-semibold text-foreground">Thank you!</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your feedback has been submitted successfully.
                </p>
                <button
                  className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    resetForm();
                    if (soundEnabled) playSound('click');
                  }}
                >
                  Send another feedback
                </button>
              </div>
            ) : (
              <div className="p-4">
                {/* Step 1: Select Feedback Type */}
                {!feedbackType && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      What type of feedback would you like to share?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <FeedbackTypeButton
                        type="suggestion"
                        onClick={() => selectFeedbackType('suggestion')}
                        icon={<MessageSquare size={18} />}
                        soundEnabled={soundEnabled}
                        playSound={playSound}
                      />
                      <FeedbackTypeButton
                        type="issue"
                        onClick={() => selectFeedbackType('issue')}
                        icon={<Frown size={18} />}
                        soundEnabled={soundEnabled}
                        playSound={playSound}
                      />
                      <FeedbackTypeButton
                        type="praise"
                        onClick={() => selectFeedbackType('praise')}
                        icon={<ThumbsUp size={18} />}
                        soundEnabled={soundEnabled}
                        playSound={playSound}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Feedback Form */}
                {feedbackType && (
                  <div className="space-y-4">
                    {/* Header based on type */}
                    <div className="flex items-center gap-2">
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setFeedbackType(null);
                          if (soundEnabled) playSound('click');
                        }}
                      >
                        <X size={18} />
                      </button>
                      <h4 className="text-sm font-medium">
                        {feedbackType === 'suggestion' && 'Share a suggestion'}
                        {feedbackType === 'issue' && 'Report an issue'}
                        {feedbackType === 'praise' && 'Tell us what you like'}
                      </h4>
                    </div>

                    {/* Emoji Selector */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        How do you feel about this?
                      </label>
                      <div className="flex justify-center gap-4">
                        <button
                          className={cn(
                            "text-2xl transition-transform hover:scale-125",
                            emoji === '😀' && "scale-125"
                          )}
                          onClick={() => selectEmoji('😀')}
                        >
                          😀
                        </button>
                        <button
                          className={cn(
                            "text-2xl transition-transform hover:scale-125",
                            emoji === '😐' && "scale-125"
                          )}
                          onClick={() => selectEmoji('😐')}
                        >
                          😐
                        </button>
                        <button
                          className={cn(
                            "text-2xl transition-transform hover:scale-125",
                            emoji === '😞' && "scale-125"
                          )}
                          onClick={() => selectEmoji('😞')}
                        >
                          😞
                        </button>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Rate your experience
                      </label>
                      <div className="flex justify-center">
                        <StarRating 
                          value={rating || 0} 
                          onChange={selectRating} 
                        />
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Tell us more (required)
                      </label>
                      <textarea
                        className="w-full min-h-[80px] rounded-md border border-input bg-background p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Share your thoughts..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        className={cn(
                          "flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
                          (!message || isSubmitting) ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
                        )}
                        onClick={handleSubmit}
                        disabled={!message || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin h-4 w-4 border-2 border-primary-foreground/50 border-t-primary-foreground rounded-full" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Submit</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Feedback type button component
const FeedbackTypeButton = ({ 
  type, 
  onClick, 
  icon,
  soundEnabled,
  playSound
}: { 
  type: 'suggestion' | 'issue' | 'praise'; 
  onClick: () => void;
  icon: React.ReactNode;
  soundEnabled: boolean;
  playSound: (type: any) => void;
}) => {
  const labels = {
    suggestion: 'Suggestion',
    issue: 'Issue',
    praise: 'Praise'
  };

  return (
    <motion.button
      className="flex flex-col items-center justify-center p-3 border border-border rounded-md bg-background hover:bg-accent/20 transition-colors"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="mb-1">{icon}</span>
      <span className="text-xs font-medium">{labels[type]}</span>
    </motion.button>
  );
};

// Star rating component
const StarRating = ({ 
  value, 
  onChange 
}: { 
  value: number; 
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          className={cn(
            "p-1",
            star <= value ? "text-yellow-400" : "text-muted-foreground"
          )}
          onClick={() => onChange(star as 1 | 2 | 3 | 4 | 5)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              fill={star <= value ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      ))}
    </div>
  );
};

export default FeedbackWidget;