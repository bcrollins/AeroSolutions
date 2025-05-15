import { useState, useEffect } from 'react';

export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  LARGE_DESKTOP = 'large-desktop'
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  deviceType: DeviceType;
  orientation: 'portrait' | 'landscape';
  touchCapable: boolean;
  width: number;
  height: number;
  isClient: boolean;
}

/**
 * Hook for detecting device type and characteristics
 * 
 * @returns DeviceInfo object containing various device properties
 * 
 * @example
 * const { isMobile, isTablet, deviceType, orientation } = useDevice();
 * 
 * if (isMobile) {
 *   return <MobileView />;
 * }
 */
export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    deviceType: DeviceType.DESKTOP,
    orientation: 'landscape',
    touchCapable: false,
    width: 0,
    height: 0,
    isClient: false,
  });
  
  useEffect(() => {
    // Return early if not in a browser environment
    if (typeof window === 'undefined') return;
    
    // Initialize with accurate values
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = height > width ? 'portrait' : 'landscape';
      const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Determine device type based on screen width
      let deviceType = DeviceType.DESKTOP;
      let isMobile = false;
      let isTablet = false;
      let isDesktop = false;
      let isLargeDesktop = false;
      
      if (width < 640) {
        deviceType = DeviceType.MOBILE;
        isMobile = true;
      } else if (width < 1024) {
        deviceType = DeviceType.TABLET;
        isTablet = true;
      } else if (width < 1536) {
        deviceType = DeviceType.DESKTOP;
        isDesktop = true;
      } else {
        deviceType = DeviceType.LARGE_DESKTOP;
        isLargeDesktop = true;
      }
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        deviceType,
        orientation,
        touchCapable,
        width,
        height,
        isClient: true,
      });
    };
    
    // Set initial values
    updateDeviceInfo();
    
    // Add event listener for resize
    window.addEventListener('resize', updateDeviceInfo);
    
    // Add event listener for orientation change (mobile)
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);
  
  return deviceInfo;
}

export default useDevice;