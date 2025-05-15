import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, RefreshCw, Link, ArrowRight, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type ErrorSeverity = 'critical' | 'major' | 'minor' | 'warning' | 'info';

export interface ErrorDetails {
  title: string;
  message: string;
  timestamp: Date;
  code?: string | number;
  severity?: ErrorSeverity;
  source?: 'api' | 'client' | 'network' | 'unknown';
  retry?: () => void;
  recoveryTips?: string[];
  technicalDetails?: string;
  documentationUrl?: string;
}

interface ErrorHandlerProps {
  error?: ErrorDetails;
  onClose?: () => void;
  onSubmitReport?: (details: ErrorDetails & { userDescription?: string }) => void;
  className?: string;
  variant?: 'toast' | 'fullpage' | 'inline' | 'panel';
  icon?: boolean;
  supportEmail?: string;
  showRecoveryTips?: boolean;
  allowUserReport?: boolean;
  allowRetry?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number; // in milliseconds
}

/**
 * Enhanced error handling component with user-friendly messages
 * and recovery actions
 */
export function ErrorHandler({
  error,
  onClose,
  onSubmitReport,
  className = '',
  variant = 'inline',
  icon = true,
  supportEmail = 'support@rxai.io',
  showRecoveryTips = true,
  allowUserReport = true,
  allowRetry = true,
  autoClose = false,
  autoCloseDelay = 8000
}: ErrorHandlerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [userDescription, setUserDescription] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  
  // Auto-close for non-critical errors if enabled
  useEffect(() => {
    if (
      autoClose && 
      error && 
      onClose && 
      error.severity !== 'critical' && 
      error.severity !== 'major'
    ) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, error, onClose, autoCloseDelay]);
  
  // If no error, don't render
  if (!error) return null;
  
  // Get appropriate colors based on severity
  const getSeverityStyles = (severity: ErrorSeverity = 'info') => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/15 text-destructive border-destructive/30';
      case 'major':
        return 'bg-destructive/10 text-destructive/90 border-destructive/20';
      case 'minor':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    }
  };
  
  // Get severity icon
  const getSeverityIcon = (severity: ErrorSeverity = 'info') => {
    return <AlertCircle className="h-5 w-5" />;
  };
  
  // Formats technical code in user-friendly way
  const getFormattedCode = (code?: string | number) => {
    if (!code) return '';
    return typeof code === 'number' 
      ? `Error ${code}` 
      : code.startsWith('ERR_') 
        ? code.replace('ERR_', 'Error: ').replace(/_/g, ' ').toLowerCase()
        : code;
  };
  
  // Get user-friendly message based on the source
  const getUserFriendlyMessage = () => {
    if (error.message) return error.message;
    
    switch (error.source) {
      case 'api':
        return 'The server encountered a problem processing your request.';
      case 'network':
        return 'Unable to connect. Please check your internet connection.';
      case 'client':
        return 'Something went wrong on this page.';
      default:
        return 'Something unexpected happened.';
    }
  };
  
  // Get container styles based on variant
  const getContainerStyles = () => {
    const severityStyles = getSeverityStyles(error.severity);
    const baseStyles = 'relative overflow-hidden border rounded-lg shadow-sm';
    
    switch (variant) {
      case 'toast':
        return cn(baseStyles, severityStyles, 'p-4 max-w-md w-full', className);
      case 'fullpage':
        return cn('fixed inset-0 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm z-50', className);
      case 'panel':
        return cn(baseStyles, severityStyles, 'p-6', className);
      case 'inline':
      default:
        return cn(baseStyles, severityStyles, 'p-4', className);
    }
  };
  
  // Handle form submission
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmitReport) {
      onSubmitReport({
        ...error,
        userDescription
      });
    }
    
    setShowReportForm(false);
    setUserDescription('');
  };
  
  // Render full page error variant
  if (variant === 'fullpage') {
    return (
      <div className={getContainerStyles()}>
        <div className="bg-card/90 border border-border rounded-xl p-6 max-w-lg w-full shadow-lg">
          <div className="flex items-start">
            {icon && (
              <div className="mr-4 mt-1">
                {getSeverityIcon(error.severity)}
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">{error.title || 'Error'}</h3>
              <p className="text-foreground/80 mb-4">{getUserFriendlyMessage()}</p>
              
              {error.code && (
                <div className="text-sm text-muted-foreground mb-4">
                  {getFormattedCode(error.code)}
                </div>
              )}
              
              {showRecoveryTips && error.recoveryTips && error.recoveryTips.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Try these steps:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {error.recoveryTips.map((tip, index) => (
                      <li key={index} className="text-sm text-foreground/80">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mt-6">
                {allowRetry && error.retry && (
                  <Button 
                    variant="default" 
                    onClick={error.retry}
                    className="gap-1.5"
                  >
                    <RefreshCw size={14} />
                    Try again
                  </Button>
                )}
                
                {error.documentationUrl && (
                  <Button 
                    variant="outline" 
                    className="gap-1.5"
                    onClick={() => window.open(error.documentationUrl, '_blank')}
                  >
                    <Link size={14} />
                    View help
                  </Button>
                )}
                
                {allowUserReport && (
                  <Button
                    variant="outline" 
                    className="gap-1.5"
                    onClick={() => setShowReportForm(!showReportForm)}
                  >
                    <Ticket size={14} />
                    Report issue
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide' : 'Show'} details
                </Button>
              </div>
              
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-muted/50 border border-border rounded-md p-3 text-xs font-mono whitespace-pre-wrap">
                      {error.technicalDetails || JSON.stringify({
                        title: error.title,
                        message: error.message,
                        code: error.code,
                        severity: error.severity,
                        source: error.source,
                        timestamp: error.timestamp.toISOString()
                      }, null, 2)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {showReportForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 overflow-hidden"
                  >
                    <form onSubmit={handleReportSubmit} className="space-y-3">
                      <div>
                        <label 
                          htmlFor="userDescription" 
                          className="block text-sm font-medium mb-1"
                        >
                          What were you trying to do?
                        </label>
                        <textarea
                          id="userDescription"
                          value={userDescription}
                          onChange={(e) => setUserDescription(e.target.value)}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-24 resize-none"
                          placeholder="I was trying to..."
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowReportForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                        >
                          Submit report
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {supportEmail && (
                <p className="text-xs text-muted-foreground mt-4">
                  Need help? Contact <a 
                    href={`mailto:${supportEmail}`}
                    className="text-primary hover:underline"
                  >
                    {supportEmail}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render inline/toast/panel variants
  return (
    <div className={getContainerStyles()}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-foreground/60 hover:text-foreground p-1 rounded-full"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      )}
      
      <div className="flex">
        {icon && (
          <div className="mr-3 flex-shrink-0 mt-1">
            {getSeverityIcon(error.severity)}
          </div>
        )}
        
        <div className="flex-1 pr-6">
          <h3 className="text-sm font-semibold">{error.title || 'Error'}</h3>
          <p className="text-sm mt-1">{getUserFriendlyMessage()}</p>
          
          {error.code && (
            <div className="text-xs text-muted-foreground mt-1">
              {getFormattedCode(error.code)}
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {allowRetry && error.retry && (
              <Button
                variant="outline"
                size="sm"
                onClick={error.retry}
                className="h-8 px-2 text-xs gap-1"
              >
                <RefreshCw size={12} />
                Retry
              </Button>
            )}
            
            {error.documentationUrl && (
              <a
                href={error.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-primary hover:underline"
              >
                View help <ArrowRight size={10} className="ml-1" />
              </a>
            )}
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showDetails ? 'Hide' : 'Show'} details
            </button>
          </div>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 overflow-hidden"
              >
                <div className="bg-background/50 border border-border rounded-md p-2 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto">
                  {error.technicalDetails || JSON.stringify({
                    title: error.title,
                    message: error.message,
                    code: error.code,
                    severity: error.severity,
                    source: error.source,
                    timestamp: error.timestamp.toISOString()
                  }, null, 2)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}