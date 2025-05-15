/**
 * RXAI Design System
 * 
 * This file defines the core design tokens and specifications
 * for maintaining consistent styling across the RXAI platform.
 */

export const colors = {
  // Primary colors
  primary: {
    main: '#0066cc',
    light: '#4d94ff',
    dark: '#0055b3',
    hover: '#0055b3',
    active: '#00449f',
  },
  // Secondary colors
  secondary: {
    main: '#f0f6ff',
    light: '#f8fbff',
    dark: '#e3f0ff',
  },
  // Neutral colors
  neutral: {
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
    black: '#000000',
  },
  // Feedback colors
  feedback: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  // Special effect colors
  effects: {
    glassLight: 'rgba(255, 255, 255, 0.8)',
    glassDark: 'rgba(17, 25, 40, 0.75)',
    glassBlue: 'rgba(0, 102, 204, 0.08)',
    glow: 'rgba(77, 148, 255, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  }
};

export const typography = {
  fontFamily: {
    heading: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    body: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'SF Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  fontWeight: {
    light: 300,
    normal: 400,
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
    '6xl': '3.75rem',  // 60px
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  }
};

export const spacing = {
  0: '0',
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
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
  // Apple-inspired shadows
  apple: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.05)',
    elevated: '0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
    subtle: '0 1px 2px rgba(0, 0, 0, 0.04)',
  }
};

export const animations = {
  timing: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    verySlow: '800ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
    easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    appleEaseOut: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    appleSpring: 'cubic-bezier(0.5, 1.25, 0.75, 1.25)',
  }
};

export const glassMorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  dark: {
    background: 'rgba(17, 25, 40, 0.75)',
    backdropFilter: 'blur(12px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  blue: {
    background: 'rgba(0, 102, 204, 0.08)',
    backdropFilter: 'blur(8px) saturate(150%)',
    border: '1px solid rgba(77, 148, 255, 0.2)',
  }
};

export const contentWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  reading: '720px', // Optimal reading width
};

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  drawer: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
};

// Button styles
export const buttonStyles = {
  primary: {
    default: {
      background: colors.primary.main,
      color: colors.neutral.white,
      border: 'none',
      shadow: shadows.apple.sm,
    },
    hover: {
      background: colors.primary.hover,
      transform: 'translateY(-1px)',
      shadow: shadows.apple.md,
    },
    active: {
      background: colors.primary.active,
      transform: 'translateY(0)',
      shadow: shadows.apple.sm,
    },
    disabled: {
      background: colors.neutral.gray300,
      color: colors.neutral.gray500,
      shadow: 'none',
    }
  },
  secondary: {
    default: {
      background: colors.secondary.main,
      color: colors.primary.main,
      border: `1px solid ${colors.primary.main}`,
      shadow: shadows.apple.subtle,
    },
    hover: {
      background: colors.secondary.light,
      color: colors.primary.hover,
      transform: 'translateY(-1px)',
      shadow: shadows.apple.sm,
    },
    active: {
      background: colors.secondary.dark,
      transform: 'translateY(0)',
      shadow: shadows.apple.subtle,
    },
    disabled: {
      background: colors.neutral.gray100,
      color: colors.neutral.gray400,
      border: `1px solid ${colors.neutral.gray300}`,
      shadow: 'none',
    }
  },
  tertiary: {
    default: {
      background: 'transparent',
      color: colors.primary.main,
      border: 'none',
    },
    hover: {
      background: colors.effects.glassBlue,
      color: colors.primary.hover,
    },
    active: {
      background: colors.secondary.dark,
      color: colors.primary.active,
    },
    disabled: {
      color: colors.neutral.gray400,
    }
  }
};

// Form field styles
export const formStyles = {
  input: {
    default: {
      background: colors.neutral.white,
      border: `1px solid ${colors.neutral.gray300}`,
      shadow: shadows.apple.subtle,
      borderRadius: borderRadius.lg,
      padding: `${spacing[3]} ${spacing[4]}`,
    },
    focus: {
      border: `1px solid ${colors.primary.main}`,
      shadow: `0 0 0 2px ${colors.effects.glassBlue}`,
    },
    error: {
      border: `1px solid ${colors.feedback.error}`,
      shadow: `0 0 0 2px rgba(239, 68, 68, 0.2)`,
    }
  },
  label: {
    default: {
      color: colors.neutral.gray700,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }
  },
  helper: {
    default: {
      color: colors.neutral.gray500,
      fontSize: typography.fontSize.xs,
      marginTop: spacing[1],
    },
    error: {
      color: colors.feedback.error,
    }
  }
};

// Card styles
export const cardStyles = {
  default: {
    background: colors.neutral.white,
    borderRadius: borderRadius.xl,
    shadow: shadows.apple.sm,
    padding: spacing[6],
  },
  elevated: {
    background: colors.neutral.white,
    borderRadius: borderRadius.xl,
    shadow: shadows.apple.md,
    padding: spacing[6],
  },
  glass: {
    ...glassMorphism.light,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
  }
};