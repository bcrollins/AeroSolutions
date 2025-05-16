import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Backdrop from './Backdrop';

interface EnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom' | 'right' | 'left';
  animationType?: 'fade' | 'scale' | 'slide' | 'flip';
  blur?: 'none' | 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
}

/**
 * Enhanced modal component with beautiful animations and positioning options
 */
const EnhancedModal: React.FC<EnhancedModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  showCloseButton = true,
  closeOnBackdropClick = true,
  size = 'md',
  position = 'center',
  animationType = 'fade',
  blur = 'md',
  footer
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Update shouldRender state when isOpen changes
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  // Size classes based on the size prop
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[90vw] w-[90vw] h-[90vh]',
  };

  // Position variants based on the position prop
  const getPositionVariants = () => {
    switch (position) {
      case 'top':
        return {
          hidden: { y: '-100%', opacity: 0 },
          visible: { y: 0, opacity: 1 },
          exit: { y: '-100%', opacity: 0 }
        };
      case 'bottom':
        return {
          hidden: { y: '100%', opacity: 0 },
          visible: { y: 0, opacity: 1 },
          exit: { y: '100%', opacity: 0 }
        };
      case 'right':
        return {
          hidden: { x: '100%', opacity: 0 },
          visible: { x: 0, opacity: 1 },
          exit: { x: '100%', opacity: 0 }
        };
      case 'left':
        return {
          hidden: { x: '-100%', opacity: 0 },
          visible: { x: 0, opacity: 1 },
          exit: { x: '-100%', opacity: 0 }
        };
      case 'center':
      default:
        switch (animationType) {
          case 'scale':
            return {
              hidden: { scale: 0.8, opacity: 0 },
              visible: { scale: 1, opacity: 1 },
              exit: { scale: 0.8, opacity: 0 }
            };
          case 'slide':
            return {
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
              exit: { y: 20, opacity: 0 }
            };
          case 'flip':
            return {
              hidden: { rotateX: 90, opacity: 0 },
              visible: { rotateX: 0, opacity: 1 },
              exit: { rotateX: 90, opacity: 0 }
            };
          case 'fade':
          default:
            return {
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 }
            };
        }
    }
  };

  // Position classes based on the position prop
  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16',
    right: 'items-center justify-end pr-16',
    left: 'items-center justify-start pl-16',
  };

  // Handle the animation complete event
  const handleAnimationComplete = (definition: string) => {
    if (definition === 'exit' && !isOpen) {
      setShouldRender(false);
    }
  };

  // If shouldn't render, don't render anything
  if (!shouldRender) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <Backdrop
            onClick={closeOnBackdropClick ? onClose : undefined}
            blur={blur}
            animated={true}
          />

          <div className={cn(
            "fixed inset-0 z-50 flex overflow-auto py-4",
            positionClasses[position]
          )}>
            <motion.div
              className={cn(
                "relative bg-card text-card-foreground border border-border shadow-lg rounded-lg overflow-hidden",
                sizeClasses[size],
                position === 'full' ? 'flex flex-col h-full' : '',
                className
              )}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={getPositionVariants()}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onAnimationComplete={(definition) => 
                handleAnimationComplete(definition as string)
              }
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
                  <div>
                    {title && <h2 className="text-lg font-semibold">{title}</h2>}
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted"
                      aria-label="Close modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className={cn(
                "p-4 sm:p-6", 
                size === 'full' ? 'flex-grow overflow-auto' : '',
                !title && !showCloseButton && 'pt-6'
              )}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="p-4 sm:p-6 border-t border-border bg-muted/50">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EnhancedModal;