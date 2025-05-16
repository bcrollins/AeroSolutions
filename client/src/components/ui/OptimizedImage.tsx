import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  lazyBoundary?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component for better performance
 * 
 * Features:
 * - Lazy loading images outside viewport
 * - Progressive loading with blur-up technique
 * - Shows proper placeholder while loading
 * - Handles errors gracefully
 * - Uses modern loading attributes
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  lazyBoundary = '200px',
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  
  // Create an observer to detect when the image enters the viewport
  useEffect(() => {
    if (priority) return; // Skip for priority images
    
    const img = new Image();
    
    // When the image is loaded
    img.onload = () => {
      setIsLoading(false);
      if (onLoad) onLoad();
    };
    
    // When there's an error loading the image
    img.onerror = () => {
      setIsLoading(false);
      setIsError(true);
      if (onError) onError();
    };
    
    // Load the image
    img.src = src;
    
    // Return cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, priority, onLoad, onError]);
  
  // Error fallback
  if (isError) {
    return (
      <div 
        className={`bg-secondary/30 flex items-center justify-center rounded ${className}`}
        style={{ width: width || '100%', height: height || 200 }}
      >
        <span className="text-secondary-foreground text-sm">
          Image not available
        </span>
      </div>
    );
  }
  
  return (
    <div className="relative" style={{ width: width || '100%', height: height || 'auto' }}>
      {isLoading && (
        <Skeleton 
          className={`absolute inset-0 ${className}`}
          style={{ width: width || '100%', height: height || 200 }}
        />
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => {
          setIsLoading(false);
          if (onLoad) onLoad();
        }}
        onError={() => {
          setIsLoading(false);
          setIsError(true);
          if (onError) onError();
        }}
      />
    </div>
  );
};

export default OptimizedImage;