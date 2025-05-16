import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, Download, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/use-sound-effects';

interface ImageGalleryProps {
  images: GalleryImage[];
  className?: string;
  aspectRatio?: 'auto' | 'square' | 'video' | 'portrait' | 'wide';
  lightbox?: boolean;
  masonry?: boolean;
  columns?: number;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  withThumbnails?: boolean;
  initialIndex?: number;
  withGestures?: boolean;
  thumbnailPosition?: 'bottom' | 'top' | 'left' | 'right';
  onImageChange?: (index: number) => void;
}

export interface GalleryImage {
  src: string;
  alt: string;
  thumb?: string;
  caption?: string;
  width?: number;
  height?: number;
}

/**
 * A beautiful, responsive image gallery with lightbox support and animations
 */
const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className,
  aspectRatio = 'auto',
  lightbox = true,
  masonry = false,
  columns = 3,
  gap = 'md',
  rounded = 'md',
  withThumbnails = true,
  initialIndex = 0,
  withGestures = true,
  thumbnailPosition = 'bottom',
  onImageChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { playSound, settings } = useSoundEffects();
  const soundEnabled = settings?.enabled || false;

  // Update image when currentIndex changes
  useEffect(() => {
    if (onImageChange) {
      onImageChange(currentIndex);
    }
  }, [currentIndex, onImageChange]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        if (soundEnabled) playSound('click');
      } else if (e.key === 'ArrowLeft') {
        navigatePrev();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      } else if (e.key === 'i') {
        setIsInfoVisible(!isInfoVisible);
        if (soundEnabled) playSound('click');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentIndex, isInfoVisible]);

  // Navigate to the next image
  const navigateNext = () => {
    if (images.length <= 1) return;
    
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    if (soundEnabled) playSound('navigation');
  };

  // Navigate to the previous image
  const navigatePrev = () => {
    if (images.length <= 1) return;
    
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    if (soundEnabled) playSound('navigation');
  };

  // Open the lightbox
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    if (soundEnabled) playSound('click');
  };

  // Close the lightbox
  const closeLightbox = () => {
    setIsLightboxOpen(false);
    if (soundEnabled) playSound('click');
  };

  // Toggle image info
  const toggleInfo = () => {
    setIsInfoVisible(!isInfoVisible);
    if (soundEnabled) playSound('click');
  };

  // Download the current image
  const downloadImage = () => {
    const image = images[currentIndex];
    const link = document.createElement('a');
    link.href = image.src;
    link.download = image.alt.replace(/\s+/g, '-').toLowerCase() || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (soundEnabled) playSound('success');
  };

  // Handle touch events for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !withGestures) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50;
    
    if (isSwipe) {
      if (distance > 0) {
        navigateNext();
      } else {
        navigatePrev();
      }
    }
  };

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'wide':
        return 'aspect-[16/9]';
      case 'auto':
      default:
        return '';
    }
  };

  // Get gap classes
  const getGapClass = () => {
    switch (gap) {
      case 'none':
        return 'gap-0';
      case 'sm':
        return 'gap-1';
      case 'md':
        return 'gap-2';
      case 'lg':
        return 'gap-4';
      default:
        return 'gap-2';
    }
  };

  // Get rounded classes
  const getRoundedClass = () => {
    switch (rounded) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-md';
    }
  };

  // Render a grid of images
  const renderGrid = () => {
    if (masonry) {
      return (
        <div 
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
            getGapClass(),
            className
          )}
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {images.map((image, index) => (
            <div 
              key={index} 
              className="overflow-hidden group relative"
              style={{ 
                gridRow: `span ${Math.ceil((image.height || 1) / (image.width || 1))}` 
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={cn(
                  "w-full h-auto object-cover transition-all duration-300 group-hover:scale-105",
                  getRoundedClass(),
                  lightbox && "cursor-pointer"
                )}
                onClick={() => lightbox && openLightbox(index)}
                loading="lazy"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div 
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
          getGapClass(),
          className
        )}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {images.map((image, index) => (
          <div key={index} className="group relative overflow-hidden">
            <div className={cn(getAspectRatioClass())}>
              <img
                src={image.src}
                alt={image.alt}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                  getRoundedClass(),
                  lightbox && "cursor-pointer"
                )}
                onClick={() => lightbox && openLightbox(index)}
                loading="lazy"
              />
            </div>
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render main gallery view
  const renderMainView = () => (
    <div className={cn("w-full", className)}>
      {/* If not a grid, show the main image */}
      {!masonry && columns === 1 && (
        <div 
          ref={imageContainerRef}
          className="relative overflow-hidden mb-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={cn(getAspectRatioClass())}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                className={cn(
                  "w-full h-full object-cover",
                  getRoundedClass(),
                  lightbox && "cursor-pointer"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => lightbox && openLightbox(currentIndex)}
                loading="lazy"
              />
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePrev();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateNext();
                }}
                aria-label="Next image"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          
          {/* Image caption */}
          {images[currentIndex].caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
              {images[currentIndex].caption}
            </div>
          )}
        </div>
      )}

      {/* If showing thumbnails and more than one image */}
      {withThumbnails && images.length > 1 && !masonry && (
        <div className={cn(
          "flex overflow-x-auto scrollbar-thin gap-2",
          thumbnailPosition === 'left' || thumbnailPosition === 'right' 
            ? "flex-col max-h-[400px] overflow-y-auto" 
            : "flex-row"
        )}>
          {images.map((image, index) => (
            <motion.div
              key={index}
              className={cn(
                "flex-shrink-0 cursor-pointer overflow-hidden",
                thumbnailPosition === 'left' || thumbnailPosition === 'right' ? "w-20" : "w-24",
                getRoundedClass(),
                currentIndex === index ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentIndex(index);
                if (soundEnabled) playSound('click');
              }}
            >
              <img
                src={image.thumb || image.src}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover aspect-square"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* If it's a grid layout */}
      {(masonry || columns > 1) && renderGrid()}
    </div>
  );

  // Render lightbox
  const renderLightbox = () => (
    <AnimatePresence>
      {isLightboxOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 p-2 text-white bg-black/30 rounded-full hover:bg-black/50 transition-colors"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* Info button */}
          <button
            className="absolute top-4 left-4 z-10 p-2 text-white bg-black/30 rounded-full hover:bg-black/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleInfo();
            }}
            aria-label="Image information"
          >
            <Info size={24} />
          </button>

          {/* Download button */}
          <button
            className="absolute top-4 left-16 z-10 p-2 text-white bg-black/30 rounded-full hover:bg-black/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              downloadImage();
            }}
            aria-label="Download image"
          >
            <Download size={24} />
          </button>

          {/* Main image container */}
          <div 
            className="relative w-full max-w-6xl h-full max-h-screen p-8 flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="relative max-w-full max-h-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={images[currentIndex].src}
                  alt={images[currentIndex].alt}
                  className="max-w-full max-h-[80vh] object-contain mx-auto"
                />
                
                {/* Image caption or info */}
                <AnimatePresence>
                  {isInfoVisible && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 backdrop-blur-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-lg font-semibold mb-1">{images[currentIndex].alt}</h3>
                      {images[currentIndex].caption && (
                        <p className="text-sm opacity-90">{images[currentIndex].caption}</p>
                      )}
                      <div className="text-xs opacity-70 mt-2">
                        {images[currentIndex].width && images[currentIndex].height && (
                          <span className="mr-4">
                            Dimensions: {images[currentIndex].width} x {images[currentIndex].height}px
                          </span>
                        )}
                        <span>Image {currentIndex + 1} of {images.length}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePrev();
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateNext();
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails at the bottom */}
          {withThumbnails && images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-screen-lg p-2">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    "w-16 h-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-md",
                    currentIndex === index ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                    if (soundEnabled) playSound('click');
                  }}
                >
                  <img
                    src={image.thumb || image.src}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {renderMainView()}
      {renderLightbox()}
    </>
  );
};

export default ImageGallery;