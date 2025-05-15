/**
 * RXAI Design System
 * 
 * This file defines the core design tokens and specifications
 * for maintaining consistent styling across the RXAI platform.
 */

/**
 * Color system
 */
export const colors = {
  // Primary brand colors
  primary: {
    main: '#0066cc',
    light: '#4d94ff',
    dark: '#0055b3',
    hover: '#0055b3',
    active: '#00449f',
  },
  
  // Neutrals
  neutrals: {
    black: '#000000',
    white: '#ffffff',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
  },
  
  // Feedback colors
  feedback: {
    success: '#10b981', // Green
    error: '#ef4444',   // Red
    warning: '#f59e0b', // Amber
    info: '#3b82f6',    // Blue
  },
  
  // Dark mode overrides
  dark: {
    background: '#121e2f',
    card: '#1e293b',
    border: 'rgba(255, 255, 255, 0.1)',
  }
};

/**
 * Typography system
 */
export const typography = {
  fonts: {
    base: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
    display: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  lineHeights: {
    none: 1,
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
};

/**
 * Spacing system
 */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
  40: '10rem',     // 160px
  48: '12rem',     // 192px
  56: '14rem',     // 224px
  64: '16rem',     // 256px
};

/**
 * Border radius system
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',    // Circle/Pill
};

/**
 * Shadow system
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  outline: '0 0 0 3px rgba(0, 102, 204, 0.2)',
  none: 'none',
};

/**
 * Animation system
 */
export const animations = {
  easings: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)', // Apple-like ease-out
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  durations: {
    fastest: '75ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },
};

/**
 * Glassmorphism effect system
 */
export const glassMorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    border: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.75)',
    border: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
  },
  nav: {
    light: {
      background: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(0, 0, 0, 0.05)',
      backdropFilter: 'blur(20px)',
    },
    dark: {
      background: 'rgba(15, 23, 42, 0.8)',
      border: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
    },
  },
};

/**
 * Content width system
 */
export const contentWidths = {
  xs: '20rem',      // 320px
  sm: '24rem',      // 384px
  md: '28rem',      // 448px
  lg: '32rem',      // 512px
  xl: '36rem',      // 576px
  '2xl': '42rem',   // 672px
  '3xl': '48rem',   // 768px
  '4xl': '56rem',   // 896px
  '5xl': '64rem',   // 1024px
  '6xl': '72rem',   // 1152px
  '7xl': '80rem',   // 1280px
  full: '100%',
};

/**
 * Z-index system
 */
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

/**
 * Button styles
 */
export const buttonStyles = {
  base: {
    borderRadius: borderRadius.lg,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.tight,
    transition: `all ${animations.durations.normal} ${animations.easings.default}`,
  },
  
  sizes: {
    xs: {
      padding: `${spacing[1.5]} ${spacing[3]}`,
      fontSize: typography.sizes.xs,
    },
    sm: {
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.sizes.sm,
    },
    md: {
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.sizes.base,
    },
    lg: {
      padding: `${spacing[4]} ${spacing[6]}`,
      fontSize: typography.sizes.lg,
    },
    xl: {
      padding: `${spacing[5]} ${spacing[8]}`,
      fontSize: typography.sizes.xl,
    },
  },
  
  variants: {
    primary: {
      background: colors.primary.main,
      color: colors.neutrals.white,
      hover: {
        background: colors.primary.hover,
        transform: 'translateY(-2px)',
      },
      active: {
        background: colors.primary.active,
        transform: 'translateY(1px)',
      },
    },
    secondary: {
      background: 'rgba(0, 102, 204, 0.08)',
      color: colors.primary.main,
      border: `1px solid rgba(0, 102, 204, 0.3)`,
      hover: {
        background: 'rgba(0, 102, 204, 0.12)',
        borderColor: 'rgba(0, 102, 204, 0.5)',
        transform: 'translateY(-2px)',
      },
      active: {
        background: 'rgba(0, 102, 204, 0.16)',
        transform: 'translateY(0)',
      },
    },
    outline: {
      background: 'transparent',
      color: colors.primary.main,
      border: `1px solid rgba(0, 102, 204, 0.3)`,
      hover: {
        borderColor: colors.primary.main,
        background: 'rgba(0, 102, 204, 0.05)',
        transform: 'translateY(-2px)',
      },
      active: {
        background: 'rgba(0, 102, 204, 0.08)',
        transform: 'translateY(0)',
      },
    },
  },
};

/**
 * Form styles
 */
export const formStyles = {
  input: {
    base: {
      background: colors.neutrals.white,
      border: `1px solid ${colors.neutrals.gray300}`,
      borderRadius: borderRadius.lg,
      padding: `${spacing[3]} ${spacing[4]}`,
      color: colors.neutrals.gray800,
      transition: `all ${animations.durations.fast} ${animations.easings.default}`,
      width: '100%',
      fontFamily: typography.fonts.base,
      fontSize: typography.sizes.base,
    },
    hover: {
      borderColor: colors.neutrals.gray400,
    },
    focus: {
      borderColor: colors.primary.main,
      boxShadow: `0 0 0 3px rgba(0, 102, 204, 0.15)`,
    },
    dark: {
      background: 'rgba(30, 41, 59, 0.8)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: colors.neutrals.white,
    },
  },
  
  label: {
    display: 'block',
    marginBottom: spacing[2],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutrals.gray700,
  },
};

/**
 * Card styles
 */
export const cardStyles = {
  base: {
    borderRadius: borderRadius.xl,
    transition: `all ${animations.durations.normal} ${animations.easings.default}`,
  },
  
  variants: {
    default: {
      background: colors.neutrals.white,
      border: `1px solid ${colors.neutrals.gray200}`,
      padding: spacing[6],
      boxShadow: shadows.md,
      hover: {
        transform: 'translateY(-4px)',
        boxShadow: shadows.lg,
        borderColor: colors.neutrals.gray300,
      },
    },
    minimal: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0, 0, 0, 0.03)',
      boxShadow: shadows.sm,
      padding: spacing[6],
      hover: {
        borderColor: 'rgba(0, 102, 204, 0.2)',
        boxShadow: shadows.md,
        transform: 'translateY(-2px)',
      },
    },
    floating: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: `${shadows.lg}, ${shadows.sm}`,
      padding: spacing[8],
      hover: {
        transform: 'translateY(-6px) scale(1.01)',
        boxShadow: `${shadows.xl}, ${shadows.sm}`,
      },
    },
    feature: {
      background: colors.neutrals.white,
      border: `1px solid ${colors.neutrals.gray200}`,
      boxShadow: shadows.md,
      padding: spacing[8],
      position: 'relative',
      overflow: 'hidden',
      hover: {
        borderColor: colors.primary.light,
        boxShadow: '0 8px 30px rgba(0, 102, 204, 0.15)',
        transform: 'translateY(-4px)',
      },
    },
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  glassMorphism,
  contentWidths,
  zIndex,
  buttonStyles,
  formStyles,
  cardStyles,
};