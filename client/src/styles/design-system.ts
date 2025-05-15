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
    50: 'hsl(210, 100%, 95%)',
    100: 'hsl(210, 100%, 90%)',
    200: 'hsl(210, 100%, 85%)',
    300: 'hsl(210, 100%, 75%)',
    400: 'hsl(210, 100%, 65%)',
    500: 'hsl(210, 100%, 55%)', // Primary blue: #0066cc
    600: 'hsl(210, 100%, 45%)',
    700: 'hsl(210, 100%, 35%)',
    800: 'hsl(210, 100%, 25%)',
    900: 'hsl(210, 100%, 15%)',
  },
  
  // Neutrals
  gray: {
    50: 'hsl(210, 20%, 98%)',
    100: 'hsl(210, 16%, 95%)',
    200: 'hsl(210, 14%, 90%)',
    300: 'hsl(210, 12%, 83%)',
    400: 'hsl(210, 10%, 62%)',
    500: 'hsl(210, 8%, 45%)',
    600: 'hsl(210, 10%, 35%)',
    700: 'hsl(210, 12%, 25%)',
    800: 'hsl(210, 14%, 18%)',
    900: 'hsl(210, 16%, 12%)',
  },
  
  // Semantic colors
  success: {
    light: 'hsl(145, 85%, 40%)',
    DEFAULT: 'hsl(145, 80%, 35%)',
    dark: 'hsl(145, 80%, 30%)',
  },
  warning: {
    light: 'hsl(40, 100%, 60%)',
    DEFAULT: 'hsl(40, 95%, 55%)',
    dark: 'hsl(40, 90%, 50%)',
  },
  error: {
    light: 'hsl(358, 90%, 60%)',
    DEFAULT: 'hsl(358, 85%, 55%)',
    dark: 'hsl(358, 80%, 50%)',
  },
  info: {
    light: 'hsl(210, 90%, 60%)',
    DEFAULT: 'hsl(210, 90%, 55%)',
    dark: 'hsl(210, 90%, 50%)',
  },
  
  // Special colors
  electric: {
    cyan: {
      400: 'hsl(189, 94%, 43%)', // #05c2df
      500: 'hsl(189, 85%, 40%)', // #0badca
    },
    blue: {
      400: 'hsl(210, 100%, 55%)', // #0a84ff
      500: 'hsl(211, 100%, 50%)', // #0077ff
    }
  }
};

/**
 * Typography system
 */
export const typography = {
  fontFamily: {
    sans: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    display: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "'SF Mono', SFMono-Regular, ui-monospace, 'Cascadia Mono', Menlo, Monaco, 'Segoe UI Mono', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

/**
 * Spacing system
 */
export const spacing = {
  px: '1px',
  0: '0',
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
  96: '24rem',     // 384px
};

/**
 * Border radius system
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

/**
 * Shadow system
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
  },
  // Apple-inspired shadows
  apple: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.12), 0 6px 12px rgba(0, 0, 0, 0.1)',
  },
  // For glass-morphism effects
  glass: {
    sm: '0 1px 3px rgba(255, 255, 255, 0.05), 0 10px 15px -5px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(255, 255, 255, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    lg: '0 12px 28px rgba(255, 255, 255, 0.05), 0 25px 50px rgba(0, 0, 0, 0.15)',
  },
  none: 'none',
};

/**
 * Animation system
 */
export const animations = {
  durations: {
    fast: '150ms',
    default: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },
  easings: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)', // Apple-like
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    bounce: 'cubic-bezier(0.87, 0, 0.13, 1)',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    slideUp: {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideDown: {
      '0%': { transform: 'translateY(-20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
  },
};

/**
 * Glassmorphism effect system
 */
export const glassMorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  subtle: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(8px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  strong: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px) saturate(200%)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  },
};

/**
 * Content width system
 */
export const contentWidths = {
  xs: '20rem',     // 320px
  sm: '24rem',     // 384px
  md: '28rem',     // 448px
  lg: '32rem',     // 512px
  xl: '36rem',     // 576px
  '2xl': '42rem',  // 672px
  '3xl': '48rem',  // 768px
  '4xl': '56rem',  // 896px
  '5xl': '64rem',  // 1024px
  '6xl': '72rem',  // 1152px
  '7xl': '80rem',  // 1280px
  full: '100%',
};

/**
 * Z-index system
 */
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  drawerOverlay: '1040',
  drawer: '1050',
  modalOverlay: '1060',
  modal: '1070',
  popover: '1080',
  tooltip: '1090',
};

/**
 * Button styles
 */
export const buttonStyles = {
  variants: {
    primary: {
      bg: colors.primary[500],
      text: 'white',
      hoverBg: colors.primary[600],
      activeBg: colors.primary[700],
    },
    secondary: {
      bg: colors.gray[200],
      text: colors.gray[900],
      hoverBg: colors.gray[300],
      activeBg: colors.gray[400],
    },
    outline: {
      bg: 'transparent',
      text: colors.primary[500],
      border: `1px solid ${colors.primary[500]}`,
      hoverBg: colors.primary[50],
      activeBg: colors.primary[100],
    },
    ghost: {
      bg: 'transparent',
      text: colors.primary[500],
      hoverBg: colors.primary[50],
      activeBg: colors.primary[100],
    },
    link: {
      bg: 'transparent',
      text: colors.primary[500],
      hoverDecoration: 'underline',
    },
  },
  sizes: {
    xs: {
      fontSize: typography.fontSize.xs,
      padding: `${spacing[1.5]} ${spacing[2.5]}`,
      height: spacing[7],
    },
    sm: {
      fontSize: typography.fontSize.sm,
      padding: `${spacing[2]} ${spacing[3]}`,
      height: spacing[8],
    },
    md: {
      fontSize: typography.fontSize.base,
      padding: `${spacing[2.5]} ${spacing[4]}`,
      height: spacing[10],
    },
    lg: {
      fontSize: typography.fontSize.lg,
      padding: `${spacing[3]} ${spacing[5]}`,
      height: spacing[12],
    },
    xl: {
      fontSize: typography.fontSize.xl,
      padding: `${spacing[3.5]} ${spacing[6]}`,
      height: spacing[14],
    },
  },
};

/**
 * Form styles
 */
export const formStyles = {
  input: {
    base: {
      borderRadius: borderRadius.lg,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      padding: `${spacing[2]} ${spacing[3]}`,
      transition: `all ${animations.durations.fast} ${animations.easings.default}`,
    },
    states: {
      default: {
        border: `1px solid ${colors.gray[300]}`,
        bg: 'white',
        color: colors.gray[900],
      },
      focus: {
        border: `1px solid ${colors.primary[500]}`,
        boxShadow: `0 0 0 1px ${colors.primary[500]}`,
      },
      error: {
        border: `1px solid ${colors.error.DEFAULT}`,
        boxShadow: `0 0 0 1px ${colors.error.DEFAULT}`,
      },
      disabled: {
        bg: colors.gray[100],
        color: colors.gray[500],
        cursor: 'not-allowed',
      },
    },
  },
};

/**
 * Card styles
 */
export const cardStyles = {
  base: {
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    transition: `all ${animations.durations.default} ${animations.easings.default}`,
  },
  variants: {
    default: {
      bg: 'white',
      border: `1px solid ${colors.gray[200]}`,
      boxShadow: shadows.md,
    },
    glass: {
      ...glassMorphism.light,
      boxShadow: shadows.glass.md,
    },
    elevated: {
      bg: 'white',
      border: `1px solid ${colors.gray[100]}`,
      boxShadow: shadows.lg,
    },
    outline: {
      bg: 'transparent',
      border: `1px solid ${colors.gray[200]}`,
    },
  },
};

// Export the complete design system
const designSystem = {
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

export default designSystem;