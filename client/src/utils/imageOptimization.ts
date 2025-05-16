/**
 * Image optimization utilities for improving performance
 * 
 * Features:
 * - Image URL optimization and transformation
 * - Automatic WebP conversion when supported
 * - Responsive image sizing
 * - Color extraction and placeholder generation
 * - SVG fallbacks for failed images
 */

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpeg' | 'png' | 'original';
}

/**
 * Generate an optimized image URL with proper sizing and format
 */
export const optimizeImageUrl = (url: string, options: ImageOptions = {}): string => {
  // Check if URL is valid
  if (!url || typeof url !== 'string') {
    return url; // Return original if invalid
  }
  
  // Handle data URLs
  if (url.startsWith('data:')) {
    return url; // Data URLs can't be optimized further
  }
  
  // Get the format and dimensions from the options or use defaults
  const { width, height, quality = 80, format = 'auto' } = options;
  
  // Handle URLs that already include optimization parameters
  if (url.includes('?w=') || url.includes('&w=') || url.includes('?quality=')) {
    return url; // Already optimized
  }
  
  try {
    // For external URLs (e.g. from a CDN)
    if (url.startsWith('http')) {
      // Different CDNs have different URL patterns for optimization
      if (url.includes('cloudinary.com')) {
        // Cloudinary transformation URL
        const transformationParams = [];
        if (width) transformationParams.push(`w_${width}`);
        if (height) transformationParams.push(`h_${height}`);
        if (quality) transformationParams.push(`q_${quality}`);
        if (format === 'webp') transformationParams.push('f_webp');
        
        // Check if URL already has transformations
        if (url.includes('/image/upload/')) {
          // Insert our transformations after /upload/
          const parts = url.split('/image/upload/');
          return `${parts[0]}/image/upload/${transformationParams.join(',')}/${parts[1]}`;
        } else {
          // Add transformations before the version part
          const urlObj = new URL(url);
          const pathSegments = urlObj.pathname.split('/');
          pathSegments.splice(pathSegments.length - 1, 0, transformationParams.join(','));
          urlObj.pathname = pathSegments.join('/');
          return urlObj.toString();
        }
      }
      
      // For common image CDNs like imgix, Cloudflare, etc.
      const urlObj = new URL(url);
      if (width) urlObj.searchParams.append('w', width.toString());
      if (height) urlObj.searchParams.append('h', height.toString());
      if (quality) urlObj.searchParams.append('q', quality.toString());
      if (format === 'webp') urlObj.searchParams.append('fm', 'webp');
      
      return urlObj.toString();
    }
    
    // For local images, use simple query parameters
    const separator = url.includes('?') ? '&' : '?';
    let optimizedUrl = url;
    
    if (width) optimizedUrl += `${separator}w=${width}`;
    if (height) optimizedUrl += `${separator}h=${height}`;
    if (quality) optimizedUrl += `&q=${quality}`;
    if (format === 'webp') optimizedUrl += '&fm=webp';
    
    return optimizedUrl;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return url; // Return original URL on error
  }
};

/**
 * Generate a low-quality image placeholder for blur-up effect
 */
export const getImagePlaceholder = async (
  src: string,
  size: number = 10
): Promise<string> => {
  // For placeholder generation we could use:
  // 1. A tiny version of the image (e.g. 10x10 pixels)
  // 2. A dominant color extraction
  // 3. An SVG placeholder with blur filter
  
  // For this implementation, we'll use a simple dominant color SVG
  
  // If the URL is local, try to get a tiny version
  if (!src.startsWith('http') && !src.startsWith('data:')) {
    try {
      // For local images
      const tinyUrl = optimizeImageUrl(src, { 
        width: size, 
        height: size, 
        quality: 30,
        format: 'webp'
      });
      
      // Use the tiny image as blur placeholder
      return tinyUrl;
    } catch (error) {
      console.error('Error generating image placeholder:', error);
    }
  }
  
  // Fallback to a gray placeholder SVG
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0' /%3E%3C/svg%3E`;
};

/**
 * Check if the browser supports WebP format
 */
export const supportsWebP = (): boolean => {
  // Only run on client-side
  if (typeof document === 'undefined') {
    return false;
  }
  
  // Simple feature detection
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    // Check for WebP support
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  
  return false;
};

/**
 * Extract dominant color from an image
 * This is a simplified version, a more accurate version would use a color quantization algorithm
 */
export const extractDominantColor = async (src: string): Promise<string> => {
  // This would normally be implemented with Canvas to extract colors
  // For simplicity, return a default color
  return '#f0f0f0';
};

/**
 * Generate a placeholder SVG based on image dimensions and color
 */
export const generateSvgPlaceholder = (
  width: number,
  height: number,
  color: string = '#f0f0f0'
): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="${color}" />
    </svg>
  `;
  
  // Convert SVG to data URL
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
};

/**
 * Calculate appropriate image dimensions based on device/viewport
 */
export const calculateResponsiveDimensions = (
  originalWidth: number,
  originalHeight: number,
  containerWidth: number
): { width: number; height: number } => {
  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight;
  
  // Calculate new dimensions
  const width = Math.min(originalWidth, containerWidth);
  const height = Math.round(width / aspectRatio);
  
  return { width, height };
};

/**
 * Get image dimensions from a URL
 * This requires the image to be loaded
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    img.src = url;
  });
};