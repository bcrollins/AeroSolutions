import React from 'react';

interface ArticleGenerationProgressProps {
  current: number;
  total: number;
  className?: string;
}

/**
 * Component to display the progress of article generation in the News Hub
 */
const ArticleGenerationProgress: React.FC<ArticleGenerationProgressProps> = ({
  current,
  total,
  className = ''
}) => {
  // Calculate percentage
  const percentage = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm ${className}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200">
            AI-Powered Content Generation
          </h4>
          <span className="text-xs font-medium text-primary">
            {current} of {total} articles
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {percentage < 100 ? (
            <div className="flex items-center">
              <div className="mr-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Generating {total - current} more articles...</span>
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>All articles generated successfully</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleGenerationProgress;