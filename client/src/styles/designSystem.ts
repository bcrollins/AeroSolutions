/**
 * Design System for the AI Learning Platform
 * 
 * This file defines the core design tokens, spacing, typography, and color constants
 * that will create a consistent, professional look across the entire application.
 * 
 * Apple-inspired with careful attention to spacing, typography, and color harmony.
 */

// Color Palette
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eef4ff',  // Lightest - background, hover states
    100: '#dceafa', // Light - backgrounds, borders
    200: '#bcd8fa', // Card backgrounds, secondary buttons
    300: '#93bcf5', // Accents, decorative elements
    400: '#6b9de9', // Secondary text, icons
    500: '#487bd9', // Primary actions, focus states
    600: '#3b65cb', // Primary buttons, links
    700: '#3051b5', // Button hover states
    800: '#2a4294', // Dark accents
    900: '#273973', // Darkest variant - text on light backgrounds
    950: '#121d40'  // Near black - dark text
  },
  
  // Gray scale (neutral colors)
  gray: {
    50: '#f9fafb',  // Lightest - page backgrounds, cards
    100: '#f3f4f6', // Light - dividers, subtle backgrounds
    200: '#e5e7eb', // Borders, dividers
    300: '#d1d5db', // Disabled states, secondary borders
    400: '#9ca3af', // Disabled text
    500: '#6b7280', // Placeholder text, icons
    600: '#4b5563', // Secondary text
    700: '#374151', // Primary text
    800: '#1f2937', // Headings, dark mode secondary text
    900: '#111827', // Dark backgrounds
    950: '#030712'  // Dark mode backgrounds
  },
  
  // Semantic colors
  success: {
    light: '#d1fae5', // Success background
    main: '#10b981',  // Success text, icons
    dark: '#065f46'   // Success hover
  },
  
  error: {
    light: '#fee2e2', // Error background
    main: '#ef4444',  // Error text, icons
    dark: '#b91c1c'   // Error hover
  },
  
  warning: {
    light: '#fef3c7', // Warning background
    main: '#f59e0b',  // Warning text, icons
    dark: '#b45309'   // Warning hover
  },
  
  info: {
    light: '#dbeafe', // Info background
    main: '#3b82f6',  // Info text, icons
    dark: '#1d4ed8'   // Info hover
  }
};

// Font setup
export const typography = {
  // Font families
  fontFamily: {
    // Apple-inspired font stack
    sans: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    mono: 'SF Mono, SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace'
  },
  
  // Font sizes (using a modular scale with 1.25 ratio)
  fontSize: {
    xs: '0.75rem',    // 12px - Fine print, captions
    sm: '0.875rem',   // 14px - Secondary text
    base: '1rem',     // 16px - Body text
    lg: '1.125rem',   // 18px - Large body text
    xl: '1.25rem',    // 20px - Small headings (h4, h5)
    '2xl': '1.5rem',  // 24px - Medium headings (h3)
    '3xl': '1.875rem',// 30px - Large headings (h2)
    '4xl': '2.25rem', // 36px - Extra large headings (h1)
    '5xl': '3rem',    // 48px - Display headings
    '6xl': '3.75rem', // 60px - Largest display headings
  },
  
  // Font weights
  fontWeight: {
    light: 300,      // Light text
    normal: 400,     // Regular body text
    medium: 500,     // Emphasized text, buttons
    semibold: 600,   // Subheadings
    bold: 700,       // Headings
    extrabold: 800   // Extra attention (sparingly used)
  },
  
  // Line heights
  lineHeight: {
    none: 1,        // Headings, display text
    tight: 1.25,    // Tight text (headlines)
    snug: 1.375,    // Slightly tighter than normal
    normal: 1.5,    // Body text
    relaxed: 1.625, // Longer content
    loose: 2        // Very spaced content
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

// Spacing system (consistent 8px grid)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem'      // 384px
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',     // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px'      // Fully rounded (circles)
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none'
};

// Z-index
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto'
};

// Transitions
export const transitions = {
  // Durations
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms'
  },
  
  // Timing functions
  easing: {
    // Apple-inspired easings
    default: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.42, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.58, 1)',
    inOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    // Apple-specific spring animation for high quality motion
    spring: 'cubic-bezier(0.5, 1.8, 0.9, 0.8)'
  }
};

// Apply consistent opacity values
export const opacity = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  25: '0.25',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  75: '0.75',
  80: '0.8',
  90: '0.9',
  95: '0.95',
  100: '1'
};

// Common breakpoints for responsive design
export const breakpoints = {
  xs: '480px',   // Extra small devices (phones)
  sm: '640px',   // Small devices (large phones, small tablets)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops, laptops)
  xl: '1280px',  // Extra large devices (large desktops)
  '2xl': '1536px' // Ultra-wide monitors
};

// Full design system export
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  opacity,
  breakpoints
};

export default designSystem;