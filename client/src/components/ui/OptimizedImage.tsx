import React, { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl, getImagePlaceholder } from '@/utils/imageOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  lazy?: boolean;
  placeholderColor?: string;
  blur?: boolean;
  fadeIn?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component with performance optimizations
 * 
 * Features:
 * - Responsive image sizing
 * - Lazy loading with IntersectionObserver
 * - Image format optimization
 * - Blur-up image loading
 * - Fallback image support
 * - Error handling
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  lazy = true,
  placeholderColor,
  blur = true,
  fadeIn = true,
  objectFit = 'cover',
  fallbackSrc = '/img/placeholders/image-placeholder.svg',
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [placeholderSrc, setPlaceholderSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Generate optimized image URL and placeholder
  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setIsError(false);
    
    // Generate a placeholder image while the main image loads
    const generatePlaceholder = async () => {
      try {
        // If we have a placeholderColor, use it to create a simple colored div background
        if (placeholderColor) {
          setPlaceholderSrc(`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width || 100} ${height || 100}'%3E%3Crect width='100%25' height='100%25' fill='${placeholderColor.replace('#', '%23')}' /%3E%3C/svg%3E`);
        } else {
          // Otherwise generate a blurred placeholder
          const placeholder = await getImagePlaceholder(src);
          setPlaceholderSrc(placeholder);
        }
      } catch (error) {
        console.error('Error generating placeholder:', error);
        // Fallback to a simple gray placeholder
        setPlaceholderSrc(`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width || 100} ${height || 100}'%3E%3Crect width='100%25' height='100%25' fill='%23f1f1f1' /%3E%3C/svg%3E`);
      }
    };
    
    // Optimize the image URL
    try {
      const optimized = optimizeImageUrl(src, { width, height, quality });
      setImageSrc(optimized);
    } catch (error) {
      console.error('Error optimizing image:', error);
      setImageSrc(src); // Fallback to the original source
    }
    
    // Generate placeholder if blur is enabled
    if (blur) {
      generatePlaceholder();
    }
  }, [src, width, height, quality, blur, placeholderColor]);
  
  // Set up lazy loading with IntersectionObserver
  useEffect(() => {
    if (!lazy || !imgRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            // Only set the src if it's not already set
            if (!img.src || img.src === placeholderSrc) {
              img.src = imageSrc;
            }
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading when image is 100px from viewport
        threshold: 0.01 // Trigger when at least 1% of the image is visible
      }
    );
    
    observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [lazy, imageSrc, placeholderSrc]);
  
  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  // Handle image error event
  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setIsError(true);
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
    if (onError) onError();
  };
  
  // Determine styles based on state and props
  const getStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      objectFit,
    };
    
    // Add fade-in effect
    if (fadeIn) {
      styles.opacity = isLoaded ? 1 : 0;
      styles.transition = 'opacity 0.3s ease-in-out';
    }
    
    return styles;
  };
  
  // Apply a blur-up effect for progressive loading
  const getPlaceholderStyles = (): React.CSSProperties => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit,
      filter: 'blur(10px)',
      transform: 'scale(1.05)', // Slightly larger to avoid blur edges
      opacity: isLoaded ? 0 : 1,
      transition: 'opacity 0.3s ease-in-out',
    };
  };
  
  return (
    <div className="relative overflow-hidden" style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}>
      {/* Show placeholder while the main image loads */}
      {blur && placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          style={getPlaceholderStyles()}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={lazy ? (blur ? undefined : imageSrc) : imageSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        style={getStyles()}
        className={className}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;