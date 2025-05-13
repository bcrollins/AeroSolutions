/**
 * Utility for checking and improving color contrast for accessibility
 * Implements WCAG 2.1 Guidelines for contrast ratios
 */

// WCAG 2.1 Contrast Ratio Guidelines
// Level AA:
// - Normal text (< 18pt or < 14pt bold): 4.5:1
// - Large text (≥ 18pt or ≥ 14pt bold): 3:1
// Level AAA:
// - Normal text (< 18pt or < 14pt bold): 7:1
// - Large text (≥ 18pt or ≥ 14pt bold): 4.5:1

interface ContrastResult {
  ratio: number;
  AA: {
    normalText: boolean;
    largeText: boolean;
  };
  AAA: {
    normalText: boolean;
    largeText: boolean;
  };
  passesMinimumAA: boolean;
  passesEnhancedAAA: boolean;
  suggestedColors?: string[];
}

type RGB = {
  r: number;
  g: number;
  b: number;
};

// Convert hex color to RGB
export function hexToRgb(hex: string): RGB | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => Math.round(x))
    .map(x => Math.max(0, Math.min(255, x)))
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

// Calculate relative luminance (per WCAG 2.1)
export function getLuminance(color: RGB): number {
  // Normalize RGB values to 0-1
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  
  // Convert to sRGB
  const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

// Calculate contrast ratio between two luminance values
export function getContrastRatio(luminance1: number, luminance2: number): number {
  const lighterLum = Math.max(luminance1, luminance2);
  const darkerLum = Math.min(luminance1, luminance2);
  
  return (lighterLum + 0.05) / (darkerLum + 0.05);
}

// Get contrast between two hex colors
export function getContrastBetweenColors(color1: string, color2: string): ContrastResult {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex format like #RRGGBB or #RGB');
  }
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const ratio = getContrastRatio(lum1, lum2);
  
  // Check against WCAG 2.1 guidelines
  return {
    ratio: parseFloat(ratio.toFixed(2)),
    AA: {
      normalText: ratio >= 4.5,
      largeText: ratio >= 3
    },
    AAA: {
      normalText: ratio >= 7,
      largeText: ratio >= 4.5
    },
    passesMinimumAA: ratio >= 4.5, // Meets AA for normal text
    passesEnhancedAAA: ratio >= 7  // Meets AAA for normal text
  };
}

// Get contrast between a color and white or black (auto-selecting the one with better contrast)
export function getTextContrastColor(bgColor: string): {
  textColor: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  const black = '#000000';
  const white = '#FFFFFF';
  
  const contrastWithBlack = getContrastBetweenColors(bgColor, black);
  const contrastWithWhite = getContrastBetweenColors(bgColor, white);
  
  const useBlack = contrastWithBlack.ratio > contrastWithWhite.ratio;
  
  return {
    textColor: useBlack ? black : white,
    ratio: useBlack ? contrastWithBlack.ratio : contrastWithWhite.ratio,
    passesAA: useBlack ? contrastWithBlack.AA.normalText : contrastWithWhite.AA.normalText,
    passesAAA: useBlack ? contrastWithBlack.AAA.normalText : contrastWithWhite.AAA.normalText
  };
}

// Increase or decrease color to meet minimum contrast ratio
export function adjustColorForMinimumContrast(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) {
    throw new Error('Invalid color format');
  }
  
  const fgLum = getLuminance(fgRgb);
  const bgLum = getLuminance(bgRgb);
  
  // Check if we need to lighten or darken the foreground
  const shouldLighten = fgLum <= bgLum;
  
  // Initial contrast
  let currentRatio = getContrastRatio(fgLum, bgLum);
  
  // If we already meet the target ratio, return the original color
  if (currentRatio >= targetRatio) {
    return foreground;
  }
  
  // Binary search for optimal color adjustment
  const increment = shouldLighten ? 1 : -1;
  let low = 0;
  let high = 255;
  let r = fgRgb.r;
  let g = fgRgb.g;
  let b = fgRgb.b;
  
  while (currentRatio < targetRatio && (low <= high)) {
    const midFactor = Math.floor((low + high) / 2);
    
    // Adjust color using the mid factor
    r = Math.max(0, Math.min(255, fgRgb.r + midFactor * increment));
    g = Math.max(0, Math.min(255, fgRgb.g + midFactor * increment));
    b = Math.max(0, Math.min(255, fgRgb.b + midFactor * increment));
    
    const adjustedLum = getLuminance({ r, g, b });
    currentRatio = getContrastRatio(adjustedLum, bgLum);
    
    if (currentRatio < targetRatio) {
      low = midFactor + 1;
    } else {
      high = midFactor - 1;
    }
  }
  
  return rgbToHex(r, g, b);
}

// Generate a list of suggested colors with good contrast
export function suggestContrastColors(
  baseColor: string,
  count: number = 5
): {
  light: string[];
  dark: string[];
} {
  const rgb = hexToRgb(baseColor);
  if (!rgb) {
    throw new Error('Invalid color format');
  }
  
  const baseLum = getLuminance(rgb);
  const lightColors: string[] = [];
  const darkColors: string[] = [];
  
  // Generate lighter variations with good contrast
  for (let i = 1; i <= count; i++) {
    const factor = i * 30; // Adjust for desired contrast spacing
    
    // Lighter variation
    const lighter = {
      r: Math.min(255, rgb.r + factor),
      g: Math.min(255, rgb.g + factor),
      b: Math.min(255, rgb.b + factor)
    };
    const lighterLum = getLuminance(lighter);
    const lighterContrast = getContrastRatio(lighterLum, baseLum);
    
    if (lighterContrast >= 4.5) {
      lightColors.push(rgbToHex(lighter.r, lighter.g, lighter.b));
    }
    
    // Darker variation
    const darker = {
      r: Math.max(0, rgb.r - factor),
      g: Math.max(0, rgb.g - factor),
      b: Math.max(0, rgb.b - factor)
    };
    const darkerLum = getLuminance(darker);
    const darkerContrast = getContrastRatio(darkerLum, baseLum);
    
    if (darkerContrast >= 4.5) {
      darkColors.push(rgbToHex(darker.r, darker.g, darker.b));
    }
  }
  
  return {
    light: lightColors,
    dark: darkColors
  };
}

// Check contrast compliance for an entire color scheme
export function checkColorSchemeContrast(
  colors: Record<string, string>,
  backgrounds: string[] = ['#FFFFFF', '#000000']
): Record<string, ContrastResult[]> {
  const results: Record<string, ContrastResult[]> = {};
  
  for (const [name, color] of Object.entries(colors)) {
    results[name] = [];
    for (const bg of backgrounds) {
      const contrast = getContrastBetweenColors(color, bg);
      const suggestions = suggestContrastColors(color, 3);
      
      // If contrast is insufficient, add suggestions
      if (!contrast.passesMinimumAA) {
        contrast.suggestedColors = [
          ...suggestions.light.slice(0, 2),
          ...suggestions.dark.slice(0, 2),
          adjustColorForMinimumContrast(color, bg)
        ];
      }
      
      results[name].push(contrast);
    }
  }
  
  return results;
}

// Generate accessible text color for a background
export function getAccessibleTextColor(backgroundColor: string): string {
  const bgRgb = hexToRgb(backgroundColor);
  if (!bgRgb) return '#000000';
  
  const bgLum = getLuminance(bgRgb);
  return bgLum > 0.5 ? '#000000' : '#FFFFFF';
}

// Calculate perceptual brightness (non-linear and more perceptually accurate than luminance)
export function getPerceptualBrightness(color: RGB): number {
  // Using the formula: sqrt(0.299*R² + 0.587*G² + 0.114*B²)
  return Math.sqrt(
    0.299 * Math.pow(color.r, 2) +
    0.587 * Math.pow(color.g, 2) +
    0.114 * Math.pow(color.b, 2)
  ) / 255;
}

// HSL conversion utilities for generating harmonious color schemes
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): RGB {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// Generate an accessible color palette based on a primary color
export function generateAccessibleColorPalette(
  primaryColor: string
): Record<string, Record<string, string>> {
  const primary = hexToRgb(primaryColor);
  if (!primary) throw new Error('Invalid color format');
  
  const [h, s, l] = rgbToHsl(primary.r, primary.g, primary.b);
  
  // Create shades and tints
  const palette: Record<string, Record<string, string>> = {
    primary: {},
    secondary: {},
    accent: {},
    neutral: {},
    success: {},
    warning: {},
    error: {}
  };
  
  // Generate primary shades (50-900)
  for (let i = 1; i <= 9; i++) {
    const lightness = 0.95 - (i - 1) * 0.1;
    const rgb = hslToRgb(h, s, lightness);
    palette.primary[i * 100] = rgbToHex(rgb.r, rgb.g, rgb.b);
  }
  palette.primary[50] = rgbToHex(...Object.values(hslToRgb(h, s * 0.7, 0.97)) as [number, number, number]);
  
  // Generate complementary color (hue + 180°)
  const complementaryHue = (h + 0.5) % 1;
  palette.secondary[500] = rgbToHex(...Object.values(hslToRgb(complementaryHue, s, l)) as [number, number, number]);
  
  // Generate accent color (hue + 120°)
  const accentHue = (h + 0.33) % 1;
  palette.accent[500] = rgbToHex(...Object.values(hslToRgb(accentHue, s, l)) as [number, number, number]);
  
  // Generate neutral grays
  for (let i = 1; i <= 9; i++) {
    const lightness = 0.95 - (i - 1) * 0.1;
    const rgb = hslToRgb(h, 0.1, lightness);
    palette.neutral[i * 100] = rgbToHex(rgb.r, rgb.g, rgb.b);
  }
  palette.neutral[50] = rgbToHex(...Object.values(hslToRgb(h, 0.05, 0.97)) as [number, number, number]);
  
  // Semantic colors with good contrast
  palette.success[500] = rgbToHex(...Object.values(hslToRgb(0.33, 0.7, 0.5)) as [number, number, number]); // Green
  palette.warning[500] = rgbToHex(...Object.values(hslToRgb(0.1, 0.7, 0.5)) as [number, number, number]);  // Orange
  palette.error[500] = rgbToHex(...Object.values(hslToRgb(0, 0.7, 0.5)) as [number, number, number]);      // Red
  
  // Ensure all colors have good contrast with white
  Object.keys(palette).forEach(group => {
    Object.keys(palette[group]).forEach(shade => {
      const color = palette[group][shade];
      const contrast = getContrastBetweenColors(color, '#FFFFFF');
      
      if (!contrast.AA.normalText && shade >= 400) {
        // Adjust color to meet AA contrast
        palette[group][shade] = adjustColorForMinimumContrast(color, '#FFFFFF');
      }
    });
  });
  
  return palette;
}

// Check if a color is light or dark
export function isLightColor(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) return true;
  
  return getPerceptualBrightness(rgb) > 0.5;
}