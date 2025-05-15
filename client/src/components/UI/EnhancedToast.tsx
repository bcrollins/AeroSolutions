import React from 'react';
import { toast as baseToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, InfoIcon, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Enhanced toast notification system with Apple-inspired animations and styling
 */
export const enhancedToast = {
  success: (message: string, title = 'Success') => {
    baseToast({
      title: title,
      description: message,
      variant: 'default',
      className: 'enhanced-toast success-toast',
      duration: 3000,
      action: (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <CheckCircle className="h-5 w-5 text-green-500" />
        </motion.div>
      )
    });
  },
  error: (message: string, title = 'Error') => {
    baseToast({
      title: title,
      description: message,
      variant: 'destructive',
      className: 'enhanced-toast error-toast',
      duration: 5000,
      action: (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <XCircle className="h-5 w-5 text-red-500" />
        </motion.div>
      )
    });
  },
  info: (message: string, title = 'Information') => {
    baseToast({
      title: title,
      description: message,
      variant: 'default',
      className: 'enhanced-toast info-toast',
      duration: 4000,
      action: (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <InfoIcon className="h-5 w-5 text-blue-500" />
        </motion.div>
      )
    });
  },
  warning: (message: string, title = 'Warning') => {
    baseToast({
      title: title,
      description: message,
      variant: 'default',
      className: 'enhanced-toast warning-toast',
      duration: 4500,
      action: (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <AlertCircle className="h-5 w-5 text-amber-500" />
        </motion.div>
      )
    });
  }
};

// Add CSS classes to index.css
const addToastStyles = `
/* Enhanced Toast Styles */
.enhanced-toast {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-width: 1px;
}

.enhanced-toast.success-toast {
  background: rgba(236, 253, 245, 0.9);
  border-color: rgba(16, 185, 129, 0.2);
}

.dark .enhanced-toast.success-toast {
  background: rgba(6, 78, 59, 0.9);
  border-color: rgba(16, 185, 129, 0.3);
}

.enhanced-toast.error-toast {
  background: rgba(254, 242, 242, 0.9);
  border-color: rgba(239, 68, 68, 0.2);
}

.dark .enhanced-toast.error-toast {
  background: rgba(127, 29, 29, 0.9);
  border-color: rgba(239, 68, 68, 0.3);
}

.enhanced-toast.info-toast {
  background: rgba(239, 246, 255, 0.9);
  border-color: rgba(59, 130, 246, 0.2);
}

.dark .enhanced-toast.info-toast {
  background: rgba(30, 58, 138, 0.9);
  border-color: rgba(59, 130, 246, 0.3);
}

.enhanced-toast.warning-toast {
  background: rgba(255, 251, 235, 0.9);
  border-color: rgba(245, 158, 11, 0.2);
}

.dark .enhanced-toast.warning-toast {
  background: rgba(120, 53, 15, 0.9);
  border-color: rgba(245, 158, 11, 0.3);
}

@keyframes toastSlideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
`;

// Append styles to index.css when module loads
try {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = addToastStyles;
    document.head.appendChild(styleElement);
  }
} catch (error) {
  console.error('Failed to append toast styles:', error);
}

export default enhancedToast;