/**
 * Image optimization utility for improving loading performance
 * This helps reduce bandwidth usage and improves page load times
 */

/**
 * Configuration for image optimization
 */
interface ImageOptimizationConfig {
  // Maximum width of the image in pixels
  maxWidth?: number;
  // Maximum height of the image in pixels
  maxHeight?: number;
  // Quality of the compressed image (0-1)
  quality?: number;
  // Output format (webp is recommended for best compression)
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Default configuration values for image optimization
 */
const defaultConfig: ImageOptimizationConfig = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: 'webp'
};

/**
 * Get appropriate image size based on screen width and device pixel ratio
 * 
 * @returns Optimal width for responsive images
 */
export function getOptimalImageWidth(): number {
  if (typeof window === 'undefined') return 1200;
  
  const screenWidth = window.innerWidth;
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Calculate optimal width based on screen size and device pixel ratio
  if (screenWidth < 640) {
    return Math.min(640 * pixelRatio, 1200);
  } else if (screenWidth < 768) {
    return Math.min(768 * pixelRatio, 1200);
  } else if (screenWidth < 1024) {
    return Math.min(1024 * pixelRatio, 1200);
  } else if (screenWidth < 1280) {
    return Math.min(1280 * pixelRatio, 1600);
  }
  
  return Math.min(1920 * pixelRatio, 1920);
}

/**
 * Transform a URL to use optimized image service parameters
 * 
 * @param url Original image URL
 * @param config Optimization configuration
 * @returns Optimized image URL with appropriate query parameters
 */
export function getOptimizedImageUrl(
  url: string, 
  config: Partial<ImageOptimizationConfig> = {}
): string {
  // Skip optimization for data URLs or SVGs
  if (url.startsWith('data:') || url.endsWith('.svg')) {
    return url;
  }
  
  // Merge with default config
  const { maxWidth, maxHeight, quality, format } = {
    ...defaultConfig,
    ...config
  };
  
  // For demo purposes, we're just adding query parameters
  // In a real app, you'd use an image CDN or optimization service
  // like Cloudinary, Imgix, or a custom API endpoint
  
  const separator = url.includes('?') ? '&' : '?';
  
  return `${url}${separator}w=${maxWidth}&h=${maxHeight}&q=${Math.round(quality * 100)}&fm=${format}`;
}

/**
 * Generate responsive image srcSet based on different viewport sizes
 * 
 * @param url Base image URL
 * @param config Optimization configuration
 * @returns SrcSet string for responsive images
 */
export function generateSrcSet(
  url: string,
  config: Partial<ImageOptimizationConfig> = {}
): string {
  // Skip for data URLs or SVGs
  if (url.startsWith('data:') || url.endsWith('.svg')) {
    return url;
  }
  
  // Generate image variants for different screen sizes
  const widths = [320, 640, 768, 1024, 1280, 1536, 1920];
  const srcSet = widths
    .map(width => {
      const optimizedUrl = getOptimizedImageUrl(url, { 
        ...config, 
        maxWidth: width 
      });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
  
  return srcSet;
}

/**
 * Generate sizes attribute for responsive images
 * 
 * @returns Sizes attribute string
 */
export function generateSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 768px) 85vw, (max-width: 1024px) 75vw, 50vw';
}

/**
 * Format and compression options for different image types
 */
export const imageFormats = {
  // Best compression and quality
  webp: {
    quality: 0.8,
    description: 'Modern format with excellent compression and quality'
  },
  // Good for photos
  jpeg: {
    quality: 0.85,
    description: 'Good for photographs and complex images'
  },
  // Good for transparency
  png: {
    quality: 0.9,
    description: 'Good for images with transparency'
  }
};

export default {
  getOptimalImageWidth,
  getOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  imageFormats
};