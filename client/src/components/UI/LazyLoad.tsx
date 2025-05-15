import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyLoadProps {
  children: React.ReactNode;
  className?: string;
  height?: string | number;
  width?: string | number;
  threshold?: number;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  onVisible?: () => void;
}

/**
 * LazyLoad - Component that lazily renders its children when they enter the viewport
 * 
 * @example
 * <LazyLoad height={200} placeholder={<Skeleton />}>
 *   <Image src="/large-image.jpg" alt="Large image" />
 * </LazyLoad>
 */
export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  className,
  height,
  width,
  threshold = 0.1,
  placeholder,
  rootMargin = '200px 0px',
  onVisible
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (onVisible) onVisible();
          // Unobserve once visible
          observer.unobserve(ref.current!);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(ref.current);
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, onVisible]);

  // Set a delay to ensure smooth transition
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setHasLoaded(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div 
      ref={ref}
      className={cn(
        'transition-opacity duration-500',
        !hasLoaded && 'opacity-0',
        hasLoaded && 'opacity-100',
        className
      )}
      style={{
        height: !isVisible ? height : undefined,
        width: !isVisible ? width : undefined,
        minHeight: !isVisible ? height : undefined,
        minWidth: !isVisible ? width : undefined
      }}
    >
      {isVisible ? children : placeholder}
    </div>
  );
};

export default LazyLoad;