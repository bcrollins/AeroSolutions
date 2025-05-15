import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, Activity, CircleCheckBig, Clock, Loader2, Cpu } from 'lucide-react';
import { useSoundEffects } from '@/hooks/use-sound-effects';

interface ArticleGenerationProgressProps {
  current: number;
  total: number;
  className?: string;
  currentArticleTitle?: string;
  estimatedTimeRemaining?: number;
  onComplete?: () => void;
}

/**
 * Enhanced component to display the progress of article generation in the News Hub
 * with animated stages, detailed metrics, and visual feedback
 */
const ArticleGenerationProgress: React.FC<ArticleGenerationProgressProps> = ({
  current,
  total,
  className = '',
  currentArticleTitle = '',
  estimatedTimeRemaining,
  onComplete
}) => {
  const { playSound } = useSoundEffects();
  const [showStages, setShowStages] = useState(false);
  const [simulateStage, setSimulateStage] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate percentage
  const percentage = Math.min(100, Math.round((current / total) * 100));
  
  // Auto-calculate estimated time if not provided
  const calculatedTimeRemaining = estimatedTimeRemaining || 
    Math.round((total - current) * 1.2); // Rough estimate: 1.2 min per article
    
  // Mock current article title if not provided
  const displayTitle = currentArticleTitle || 
    (current < total ? `AI Article #${current + 1}` : 'Complete!');
  
  // Simulate the different stages of AI generation for visual feedback
  useEffect(() => {
    if (current < total) {
      const interval = setInterval(() => {
        setSimulateStage((prev) => (prev % 4) + 1);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [current, total]);
  
  // Play sound when generation completes
  useEffect(() => {
    if (percentage === 100) {
      playSound('success');
      if (onComplete) onComplete();
    }
  }, [percentage, playSound, onComplete]);

  return (
    <div 
      className={`rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 
        bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <BrainCircuit className="w-5 h-5 mr-2 text-primary" />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              AI-Powered Content Generation
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
              {current} of {total} articles
            </span>
            <button 
              className="text-xs text-gray-500 hover:text-primary transition-colors"
              onClick={() => setShowStages(!showStages)}
            >
              {showStages ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>
        
        {/* Current article being generated */}
        <div className="mb-3 flex items-center">
          <div className="w-full">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              {current < total ? (
                <>
                  <Cpu className="w-3 h-3 mr-1.5" />
                  <span>Currently generating:</span>
                </>
              ) : (
                <>
                  <CircleCheckBig className="w-3 h-3 mr-1.5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Generation complete</span>
                </>
              )}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {current < total ? (
                <div className="flex items-center">
                  <span className="truncate max-w-[250px]">{displayTitle}</span>
                  <div className="ml-2 flex items-center">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  </div>
                </div>
              ) : (
                <span className="text-green-600 dark:text-green-400">All articles generated successfully!</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress bar with gradient and animation */}
        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out
              ${percentage < 100 
                ? 'bg-gradient-to-r from-blue-500 via-primary to-purple-500 animate-pulse' 
                : 'bg-green-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Progress details */}
        <div className="flex justify-between text-xs">
          <div className="text-gray-500 dark:text-gray-400">
            {percentage}% complete
          </div>
          {current < total && (
            <div className="text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              ~{calculatedTimeRemaining} min remaining
            </div>
          )}
        </div>
        
        {/* Detailed stages - collapsible */}
        {showStages && (
          <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Generation Process:</h5>
            
            <div className={`flex items-center text-xs ${simulateStage === 1 ? 'text-primary font-medium' : 'text-gray-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 
                ${simulateStage === 1 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <span className="text-[10px]">1</span>
              </div>
              <Activity className="w-3 h-3 mr-1.5" />
              <span>Analyzing trending topics</span>
            </div>
            
            <div className={`flex items-center text-xs ${simulateStage === 2 ? 'text-primary font-medium' : 'text-gray-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 
                ${simulateStage === 2 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <span className="text-[10px]">2</span>
              </div>
              <Sparkles className="w-3 h-3 mr-1.5" />
              <span>Generating content with AI models</span>
            </div>
            
            <div className={`flex items-center text-xs ${simulateStage === 3 ? 'text-primary font-medium' : 'text-gray-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 
                ${simulateStage === 3 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <span className="text-[10px]">3</span>
              </div>
              <Cpu className="w-3 h-3 mr-1.5" />
              <span>Optimizing for readability and accuracy</span>
            </div>
            
            <div className={`flex items-center text-xs ${simulateStage === 4 ? 'text-primary font-medium' : 'text-gray-500'}`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 
                ${simulateStage === 4 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <span className="text-[10px]">4</span>
              </div>
              <Loader2 className="w-3 h-3 mr-1.5" />
              <span>Saving to the knowledge base</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Animated border effect when active */}
      {current < total && isHovered && (
        <div className="absolute inset-0 border border-primary rounded-xl animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default ArticleGenerationProgress;