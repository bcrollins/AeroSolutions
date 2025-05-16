/**
 * Design System for AI Learning Platform
 * 
 * A comprehensive design system with Apple-inspired aesthetics
 * to ensure visual consistency across the application.
 */

// Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    '50': '#f0f7ff',
    '100': '#e0effe',
    '200': '#bae0fd',
    '300': '#7cc8fc',
    '400': '#3aabf7',
    '500': '#108ee8',
    '600': '#0070c9', // Main Brand Color - Apple Blue
    '700': '#035aa0',
    '800': '#074d85',
    '900': '#0a406e',
    '950': '#062a4a',
  },
  
  // Secondary Accent Colors
  secondary: {
    '50': '#f0fcf9',
    '100': '#d0f4ed',
    '200': '#a3e9dd',
    '300': '#6dd6c8',
    '400': '#41bfb0',
    '500': '#27a497',
    '600': '#1e857b',
    '700': '#1d6b65',
    '800': '#1c5652',
    '900': '#1a4744',
    '950': '#0a2928',
  },
  
  // Neutral Grays - Apple's System Gray Colors
  gray: {
    '50': '#f9fafb',
    '100': '#f3f4f6',
    '200': '#e5e7eb',
    '300': '#d1d5db',
    '400': '#9ca3af',
    '500': '#6b7280',
    '600': '#4b5563',
    '700': '#374151',
    '800': '#1f2937',
    '900': '#111827',
    '950': '#030712',
  },
  
  // Feedback Colors
  success: {
    light: '#34c759', // Apple System Green
    main: '#28a745',
    dark: '#1e7e34',
  },
  error: {
    light: '#ff3b30', // Apple System Red
    main: '#dc3545',
    dark: '#c82333',
  },
  warning: {
    light: '#ff9500', // Apple System Orange
    main: '#ffc107',
    dark: '#e0a800',
  },
  info: {
    light: '#5ac8fa', // Apple System Light Blue
    main: '#0275d8',
    dark: '#025aa5',
  },
  
  // Black & White
  black: '#000000',
  white: '#ffffff',
};

// Typography
export const typography = {
  fontFamily: {
    heading: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    body: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    monospace: 'SF Mono, SFMono-Regular, ui-monospace, monospace',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // The largest size
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};

// Spacing (in pixels)
export const spacing = {
  '0': '0', 
  '0.5': '0.125rem',   // 2px
  '1': '0.25rem',      // 4px
  '2': '0.5rem',       // 8px
  '3': '0.75rem',      // 12px
  '4': '1rem',         // 16px
  '5': '1.25rem',      // 20px
  '6': '1.5rem',       // 24px
  '8': '2rem',         // 32px
  '10': '2.5rem',      // 40px
  '12': '3rem',        // 48px
  '16': '4rem',        // 64px
  '20': '5rem',        // 80px
  '24': '6rem',        // 96px
  '32': '8rem',        // 128px
  '40': '10rem',       // 160px
  '48': '12rem',       // 192px
  '56': '14rem',       // 224px
  '64': '16rem',       // 256px
  '72': '18rem',       // 288px
  '80': '20rem',       // 320px
  '96': '24rem',       // 384px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',      // 2px
  md: '0.375rem',      // 6px
  lg: '0.5rem',        // 8px
  xl: '0.75rem',       // 12px
  '2xl': '1rem',       // 16px
  '3xl': '1.5rem',     // 24px
  full: '9999px',      // Circle/Pill
};

// Shadows - Apple-inspired with subtle depth
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  // Apple-specific shadows
  apple: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    dialog: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.07)',
    dropdown: '0 2px 5px -1px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.08)',
    button: '0 1px 3px rgba(0, 0, 0, 0.05)',
    active: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
  },
};

// Transitions
export const transitions = {
  default: 'all 0.2s ease',
  fast: 'all 0.1s ease',
  slow: 'all 0.3s ease',
  // Apple-specific timing functions
  easeOut: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOut: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
};

// Z-index
export const zIndex = {
  '0': 0,
  '10': 10,
  '20': 20,
  '30': 30,
  '40': 40,
  '50': 50,
  auto: 'auto',
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
  commandPalette: 1800,
};

// Opacity
export const opacity = {
  '0': '0',
  '5': '0.05',
  '10': '0.1',
  '20': '0.2',
  '25': '0.25',
  '30': '0.3',
  '40': '0.4',
  '50': '0.5',
  '60': '0.6',
  '70': '0.7',
  '75': '0.75',
  '80': '0.8',
  '90': '0.9',
  '95': '0.95',
  '100': '1',
};

// Breakpoints (in pixels)
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Component-specific sizes
export const sizes = {
  button: {
    sm: {
      height: '2rem',
      padding: '0 0.75rem',
      fontSize: typography.fontSize.sm,
    },
    md: {
      height: '2.5rem',
      padding: '0 1rem',
      fontSize: typography.fontSize.base,
    },
    lg: {
      height: '3rem',
      padding: '0 1.5rem',
      fontSize: typography.fontSize.lg,
    },
  },
  input: {
    sm: {
      height: '2rem',
      padding: '0 0.75rem',
      fontSize: typography.fontSize.sm,
    },
    md: {
      height: '2.5rem',
      padding: '0 1rem',
      fontSize: typography.fontSize.base,
    },
    lg: {
      height: '3rem',
      padding: '0 1.5rem',
      fontSize: typography.fontSize.lg,
    },
  },
  card: {
    padding: {
      sm: spacing['3'],
      md: spacing['4'],
      lg: spacing['6'],
    },
    borderRadius: borderRadius.lg,
  },
  container: {
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
};

// Glass morphism effect styles
export const glass = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  dark: {
    background: 'rgba(30, 30, 30, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(50, 50, 50, 0.2)',
  },
};

// Combined Design System export
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  opacity,
  breakpoints,
  sizes,
  glass,
};

export default designSystem;