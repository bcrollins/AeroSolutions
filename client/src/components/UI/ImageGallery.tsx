import React, { useState } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GalleryImage {
  id: string | number;
  src: string;
  alt: string;
  thumbnail?: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: number;
  gap?: number;
  aspectRatio?: string;
  className?: string;
  lightboxEnabled?: boolean;
  masonry?: boolean;
  thumbnailClassName?: string;
  imageClassName?: string;
  enableDownload?: boolean;
  enableZoom?: boolean;
  rounded?: string;
  withCaptions?: boolean;
  captionClassName?: string;
  animated?: boolean;
}

/**
 * Responsive image gallery with lightbox functionality
 */
export default function ImageGallery({
  images,
  columns = 3,
  gap = 4,
  aspectRatio = '1/1',
  className = '',
  lightboxEnabled = true,
  masonry = false,
  thumbnailClassName = '',
  imageClassName = '',
  enableDownload = true,
  enableZoom = true,
  rounded = 'rounded-lg',
  withCaptions = false,
  captionClassName = '',
  animated = true
}: ImageGalleryProps) {
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Handle image click
  const openLightbox = (index: number) => {
    if (lightboxEnabled) {
      setCurrentImageIndex(index);
      setLightboxOpen(true);
      setZoomLevel(1); // Reset zoom when opening lightbox
    }
  };
  
  // Navigation
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setZoomLevel(1); // Reset zoom when changing images
  };
  
  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    setZoomLevel(1); // Reset zoom when changing images
  };
  
  // Handle zoom
  const zoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.5, 3));
  };
  
  const zoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.5, 1));
  };
  
  // Handle download
  const downloadImage = (src: string, alt: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt.replace(/\\s+/g, '-').toLowerCase() || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };
  
  return (
    <div className={className}>
      {/* Gallery grid */}
      <motion.div 
        className={`grid gap-${gap} ${
          masonry 
            ? `columns-${columns} space-y-${gap}` 
            : `grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns}`
        }`}
        variants={animated ? containerVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
      >
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className={`${masonry ? 'break-inside-avoid mb-4' : ''} overflow-hidden ${rounded} ${thumbnailClassName}`}
            onClick={() => openLightbox(index)}
            style={{ cursor: lightboxEnabled ? 'pointer' : 'default' }}
            variants={animated ? imageVariants : undefined}
          >
            <div className={`relative overflow-hidden ${rounded}`}>
              <img
                src={image.thumbnail || image.src}
                alt={image.alt}
                className={`w-full transition-transform duration-300 hover:scale-105 object-cover ${imageClassName}`}
                style={{ aspectRatio: masonry ? undefined : aspectRatio }}
                loading="lazy"
              />
              
              {withCaptions && image.caption && (
                <div className={`absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm ${captionClassName}`}>
                  {image.caption}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-screen-lg w-[95vw] p-0 bg-black/90 border-none h-[90vh]">
          <div className="h-full flex flex-col relative">
            {/* Close button */}
            <DialogClose className="absolute right-2 top-2 z-50">
              <div className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </div>
            </DialogClose>
            
            {/* Main image container */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <div
                className="h-full w-full flex items-center justify-center"
                style={{ 
                  overflow: 'auto', 
                  cursor: zoomLevel > 1 ? 'move' : 'default'
                }}
              >
                <img
                  src={images[currentImageIndex].src}
                  alt={images[currentImageIndex].alt}
                  className="max-h-full object-contain transition-transform duration-300"
                  style={{ 
                    transform: `scale(${zoomLevel})`,
                    maxWidth: zoomLevel === 1 ? '100%' : 'none',
                    maxHeight: zoomLevel === 1 ? '100%' : 'none'
                  }}
                />
              </div>
            </div>
            
            {/* Caption */}
            {images[currentImageIndex].caption && (
              <div className="absolute bottom-14 left-0 right-0 text-center p-2 bg-black/50 text-white">
                {images[currentImageIndex].caption}
              </div>
            )}
            
            {/* Controls */}
            <div className="p-4 bg-black/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Left pagination */}
                <button
                  onClick={goToPrevious}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Right pagination */}
                <button
                  onClick={goToNext}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                {/* Image counter */}
                <span className="text-white text-sm ml-2">
                  {currentImageIndex + 1} / {images.length}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                {enableZoom && (
                  <>
                    <button
                      onClick={zoomOut}
                      disabled={zoomLevel <= 1}
                      className={`p-2 rounded-full ${
                        zoomLevel <= 1 
                          ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={zoomIn}
                      disabled={zoomLevel >= 3}
                      className={`p-2 rounded-full ${
                        zoomLevel >= 3 
                          ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                {/* Download button */}
                {enableDownload && (
                  <button
                    onClick={() => downloadImage(
                      images[currentImageIndex].src, 
                      images[currentImageIndex].alt
                    )}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    aria-label="Download image"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}