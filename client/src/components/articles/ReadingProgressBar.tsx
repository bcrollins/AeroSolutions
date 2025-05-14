import React, { useState, useEffect } from 'react';

interface ReadingProgressBarProps {
  target?: React.RefObject<HTMLElement>;
  color?: string;
  height?: number;
}

const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ 
  target,
  color = '#007bff',
  height = 4
}) => {
  const [readingProgress, setReadingProgress] = useState(0);
  
  useEffect(() => {
    const element = target?.current || document.documentElement;
    
    const calculateScrollProgress = () => {
      const totalHeight = element.scrollHeight - element.clientHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(progress);
      }
    };

    // Initial calculation
    calculateScrollProgress();
    
    // Add scroll event listener
    window.addEventListener('scroll', calculateScrollProgress, { passive: true });
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', calculateScrollProgress);
    };
  }, [target]);
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        backgroundColor: 'transparent',
        zIndex: 9999,
      }}
    >
      <div 
        style={{
          height: '100%',
          width: `${readingProgress}%`,
          backgroundColor: color,
          transition: 'width 0.2s ease',
        }}
      />
    </div>
  );
};

export default ReadingProgressBar;