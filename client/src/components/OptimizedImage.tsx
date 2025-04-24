import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  preload?: boolean;
  blurhash?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/images/image-placeholder.png',
  aspectRatio = '16/9',
  preload = false,
  blurhash,
  objectFit = 'cover',
  width,
  height,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  
  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!preload && imgRef.current && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      }, {
        rootMargin: '200px', // Load images when they are 200px from viewport
      });
      
      observer.observe(imgRef.current);
      
      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    } else {
      // If preload is true or IntersectionObserver is not supported
      setImageSrc(src);
    }
  }, [src, preload]);
  
  const handleLoad = () => {
    setLoading(false);
  };
  
  const handleError = () => {
    setError(true);
    setLoading(false);
    // Use fallback if main image fails to load
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };
  
  // Generate responsive sizes attribute
  const sizes = "100vw";
  
  // Define srcSet for responsive images
  // We're not generating this dynamically since we don't have access to the actual 
  // different image sizes - in a real app you would generate these based on your image service
  
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        className
      )}
      style={{ aspectRatio }}
      ref={placeholderRef}
    >
      {loading && (
        <Skeleton 
          className="absolute inset-0 w-full h-full"
        />
      )}
      
      {imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            loading ? 'opacity-0' : 'opacity-100',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down',
          )}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;