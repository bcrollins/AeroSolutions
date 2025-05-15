import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { SlideIn, FadeIn } from './MicroInteractions';

type FeedbackType = 'success' | 'error' | 'info' | 'warning' | 'help';

interface FormFeedbackProps {
  message: string;
  type?: FeedbackType;
  show?: boolean;
  icon?: boolean;
  animate?: boolean;
  className?: string;
  iconClassName?: string;
  messageClassName?: string;
  onAnimationComplete?: () => void;
}

/**
 * FormFeedback - Enhanced form feedback component with animations and icons
 * 
 * @example
 * <FormFeedback 
 *   message="Username is available" 
 *   type="success" 
 *   show={true} 
 * />
 */
export const FormFeedback: React.FC<FormFeedbackProps> = ({
  message,
  type = 'info',
  show = true,
  icon = true,
  animate = true,
  className = '',
  iconClassName = '',
  messageClassName = '',
  onAnimationComplete
}) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    }
  }, [show]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'help':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getIcon = () => {
    if (!icon) return null;

    switch (type) {
      case 'success':
        return <CheckCircle className={cn('h-4 w-4', iconClassName)} />;
      case 'error':
      case 'warning':
        return <AlertCircle className={cn('h-4 w-4', iconClassName)} />;
      case 'help':
        return <HelpCircle className={cn('h-4 w-4', iconClassName)} />;
      default:
        return <HelpCircle className={cn('h-4 w-4', iconClassName)} />;
    }
  };

  if (!shouldRender) return null;

  const content = (
    <div 
      className={cn(
        'flex items-start gap-1.5 text-sm transition-colors',
        getTypeStyles(),
        className
      )}
    >
      {icon && getIcon()}
      <span className={cn('pt-0.5', messageClassName)}>
        {message}
      </span>
    </div>
  );

  if (!animate) {
    return content;
  }

  return (
    <AnimatePresence onExitComplete={() => !show && setShouldRender(false)}>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="origin-top"
          onAnimationComplete={onAnimationComplete}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface FieldStrengthIndicatorProps {
  value: string;
  criteria?: {
    label: string;
    check: (value: string) => boolean;
  }[];
  strengthLabels?: string[];
  className?: string;
}

/**
 * FieldStrengthIndicator - Visual indicator for field strength (like password)
 * 
 * @example
 * <FieldStrengthIndicator
 *   value={password}
 *   criteria={[
 *     { label: "Minimum 8 characters", check: (value) => value.length >= 8 },
 *     { label: "Contains uppercase letter", check: (value) => /[A-Z]/.test(value) },
 *     { label: "Contains number", check: (value) => /[0-9]/.test(value) },
 *   ]}
 * />
 */
export const FieldStrengthIndicator: React.FC<FieldStrengthIndicatorProps> = ({
  value,
  criteria = [],
  strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'],
  className = '',
}) => {
  const getStrengthScore = (): number => {
    if (!value) return 0;
    if (!criteria.length) {
      // Default password strength logic
      const hasLength = value.length >= 8;
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[^A-Za-z0-9]/.test(value);
      
      const passedChecks = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
      return passedChecks;
    } else {
      // Custom criteria logic
      return criteria.filter(criterion => criterion.check(value)).length;
    }
  };

  const getColor = (score: number, max: number): string => {
    const percentage = Math.max(0, Math.min(1, score / max));
    
    if (percentage < 0.25) return 'bg-red-500';
    if (percentage < 0.5) return 'bg-orange-500';
    if (percentage < 0.75) return 'bg-yellow-500';
    if (percentage < 1) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  const strengthScore = getStrengthScore();
  const maxScore = criteria.length || 5;
  const color = getColor(strengthScore, maxScore);
  const percentage = Math.max(5, Math.min(100, (strengthScore / maxScore) * 100));
  
  // Map score to label
  const labelIndex = Math.floor((strengthScore / maxScore) * (strengthLabels.length - 1));
  const label = value ? strengthLabels[Math.max(0, Math.min(labelIndex, strengthLabels.length - 1))] : '';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-xs">
        <AnimatePresence mode="wait">
          {value && (
            <SlideIn direction="right" className="font-medium">
              {label}
            </SlideIn>
          )}
        </AnimatePresence>
      </div>
      
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            type: 'spring', 
            stiffness: 120, 
            damping: 20 
          }}
        />
      </div>
      
      {criteria.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs">
          {criteria.map((criterion, index) => {
            const passed = criterion.check(value);
            return (
              <li 
                key={index} 
                className={cn(
                  'flex items-center gap-1.5',
                  passed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <div className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  passed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                )} />
                {criterion.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default { FormFeedback, FieldStrengthIndicator };