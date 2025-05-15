import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
}

/**
 * Hook to detect device type, viewport dimensions, and orientation
 * 
 * @returns DeviceInfo object containing device details
 * 
 * @example
 * const { type, isMobile, isTablet, isDesktop, orientation } = useDevice();
 * 
 * if (isMobile) {
 *   // Mobile specific logic
 * }
 */
export function useDevice(): DeviceInfo {
  const getWindowDimensions = (): DeviceInfo => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Determine device type based on width
    let type: DeviceType = 'desktop';
    if (width < 768) type = 'mobile';
    else if (width < 1024) type = 'tablet';
    
    const orientation = height > width ? 'portrait' as const : 'landscape' as const;
    
    return {
      type,
      isMobile: type === 'mobile',
      isTablet: type === 'tablet',
      isDesktop: type === 'desktop',
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation,
      width,
      height
    };
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Default to desktop until window is available (avoids SSR issues)
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        orientation: 'landscape' as const,
        width: 1200,
        height: 800
      };
    }
    
    return getWindowDimensions();
  });

  useEffect(() => {
    // Update dimensions on window resize
    const handleResize = () => {
      setDeviceInfo(getWindowDimensions());
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Run once on mount to ensure accuracy
    handleResize();
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
}

export default useDevice;