import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  getContrastBetweenColors, 
  getAccessibleTextColor,
  suggestContrastColors,
  adjustColorForMinimumContrast,
  isLightColor
} from '@/utils/colorContrastChecker';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle, Eyedropper, RefreshCw } from 'lucide-react';

interface ColorContrastCheckerProps {
  /**
   * Initial foreground color
   * @default "#000000"
   */
  initialForeground?: string;
  
  /**
   * Initial background color
   * @default "#FFFFFF"
   */
  initialBackground?: string;
  
  /**
   * Callback when colors change
   */
  onColorsChange?: (foreground: string, background: string, contrastRatio: number) => void;
  
  /**
   * Class name for styling
   */
  className?: string;
  
  /**
   * Title for the component
   * @default "Color Contrast Checker"
   */
  title?: string;
  
  /**
   * Description for the component
   * @default "Check WCAG 2.1 color contrast compliance"
   */
  description?: string;
  
  /**
   * Show detailed WCAG information
   * @default true
   */
  showWCAGDetails?: boolean;
  
  /**
   * Show color suggestions
   * @default true
   */
  showSuggestions?: boolean;
  
  /**
   * Show sample text preview
   * @default true
   */
  showTextPreview?: boolean;
  
  /**
   * Sample text for preview
   * @default "The quick brown fox jumps over the lazy dog."
   */
  sampleText?: string;
  
  /**
   * Show eyedropper tool (if browser supports it)
   * @default true
   */
  showEyedropper?: boolean;
  
  /**
   * Show color swap button
   * @default true
   */
  showSwapButton?: boolean;
  
  /**
   * Show auto-fix option for insufficient contrast
   * @default true
   */
  showAutoFix?: boolean;
}

/**
 * Color Contrast Checker Component
 * Tests color combinations for accessibility, provides suggestions,
 * and checks against WCAG 2.1 guidelines
 */
export function ColorContrastChecker({
  initialForeground = '#000000',
  initialBackground = '#FFFFFF',
  onColorsChange,
  className,
  title = 'Color Contrast Checker',
  description = 'Check WCAG 2.1 color contrast compliance',
  showWCAGDetails = true,
  showSuggestions = true,
  showTextPreview = true,
  sampleText = 'The quick brown fox jumps over the lazy dog.',
  showEyedropper = true,
  showSwapButton = true,
  showAutoFix = true,
}: ColorContrastCheckerProps) {
  // States for foreground and background colors
  const [foreground, setForeground] = useState(initialForeground);
  const [background, setBackground] = useState(initialBackground);
  const [foregroundValid, setForegroundValid] = useState(true);
  const [backgroundValid, setBackgroundValid] = useState(true);
  const [eyedropperActive, setEyedropperActive] = useState<'fg' | 'bg' | null>(null);
  
  // Check if EyeDropper API is supported
  const supportsEyeDropper = useMemo(() => {
    return typeof window !== 'undefined' && 'EyeDropper' in window;
  }, []);
  
  // Calculate contrast ratio
  const contrastResult = useMemo(() => {
    if (foregroundValid && backgroundValid) {
      try {
        return getContrastBetweenColors(foreground, background);
      } catch (e) {
        return { ratio: 0, AA: { normalText: false, largeText: false }, AAA: { normalText: false, largeText: false } };
      }
    }
    return { ratio: 0, AA: { normalText: false, largeText: false }, AAA: { normalText: false, largeText: false } };
  }, [foreground, background, foregroundValid, backgroundValid]);
  
  // Generate suggested colors with better contrast
  const suggestions = useMemo(() => {
    if (foregroundValid && backgroundValid && contrastResult.ratio < 4.5) {
      // Calculate an improved foreground color
      const improvedColor = adjustColorForMinimumContrast(foreground, background, 4.5);
      
      // Get additional options
      const options = suggestContrastColors(foreground);
      const validOptions = [...options.light, ...options.dark].filter(color => {
        const contrast = getContrastBetweenColors(color, background);
        return contrast.ratio >= 4.5;
      });
      
      return [improvedColor, ...validOptions.slice(0, 3)];
    }
    return [];
  }, [foreground, background, contrastResult.ratio, foregroundValid, backgroundValid]);
  
  // Handle color input changes
  const handleForegroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setForeground(newColor);
    // Validate hex color
    setForegroundValid(/^#[0-9A-Fa-f]{6}$/i.test(newColor));
  };
  
  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setBackground(newColor);
    // Validate hex color
    setBackgroundValid(/^#[0-9A-Fa-f]{6}$/i.test(newColor));
  };
  
  // Swap foreground and background colors
  const handleSwapColors = () => {
    setForeground(background);
    setBackground(foreground);
  };
  
  // Auto-fix contrast
  const handleAutoFix = () => {
    if (foregroundValid && backgroundValid) {
      const improvedColor = adjustColorForMinimumContrast(foreground, background, 4.5);
      setForeground(improvedColor);
    }
  };
  
  // Eyedropper functionality
  const handleEyedropper = async (target: 'fg' | 'bg') => {
    if (!supportsEyeDropper) return;
    
    try {
      setEyedropperActive(target);
      // TypeScript doesn't have EyeDropper in lib.dom
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (target === 'fg') {
        setForeground(result.sRGBHex);
        setForegroundValid(true);
      } else {
        setBackground(result.sRGBHex);
        setBackgroundValid(true);
      }
    } catch (e) {
      // User cancelled or unsupported
      console.log('Eyedropper canceled or errored:', e);
    } finally {
      setEyedropperActive(null);
    }
  };
  
  // Apply a suggested color
  const applySuggestion = (color: string) => {
    setForeground(color);
    setForegroundValid(true);
  };
  
  // Trigger callback when colors change
  useEffect(() => {
    if (foregroundValid && backgroundValid && onColorsChange) {
      onColorsChange(foreground, background, contrastResult.ratio);
    }
  }, [foreground, background, contrastResult.ratio, foregroundValid, backgroundValid, onColorsChange]);
  
  // Get contrast rating information
  const getContrastRating = () => {
    const { ratio, AA, AAA } = contrastResult;
    
    if (ratio >= 7) {
      return {
        level: 'AAA',
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        text: 'Excellent contrast',
        explanation: 'Meets AAA requirements for all text sizes',
        color: 'text-green-500',
      };
    } else if (ratio >= 4.5) {
      return {
        level: 'AA',
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        text: 'Good contrast',
        explanation: 'Meets AA requirements for all text sizes and AAA for large text',
        color: 'text-green-500',
      };
    } else if (ratio >= 3) {
      return {
        level: 'AA Large',
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        text: 'Moderate contrast',
        explanation: 'Meets AA requirements for large text only',
        color: 'text-amber-500',
      };
    } else {
      return {
        level: 'Fail',
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        text: 'Poor contrast',
        explanation: 'Does not meet WCAG requirements',
        color: 'text-red-500',
      };
    }
  };
  
  const rating = getContrastRating();
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Color inputs */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Foreground color */}
          <div className="space-y-2">
            <Label htmlFor="foreground-color">Foreground (Text) Color</Label>
            <div className="flex gap-2">
              <div
                className="h-10 w-10 rounded-md border flex-shrink-0"
                style={{ backgroundColor: foregroundValid ? foreground : '#FF0000' }}
              />
              <div className="flex-grow flex gap-2">
                <Input
                  id="foreground-color"
                  type="text"
                  value={foreground}
                  onChange={handleForegroundChange}
                  className={cn(!foregroundValid && "border-red-500")}
                  placeholder="#000000"
                />
                <input
                  type="color"
                  value={foregroundValid ? foreground : '#000000'}
                  onChange={(e) => {
                    setForeground(e.target.value);
                    setForegroundValid(true);
                  }}
                  className="h-10 w-10 p-1 rounded-md border"
                />
                {showEyedropper && supportsEyeDropper && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEyedropper('fg')}
                    disabled={eyedropperActive !== null}
                  >
                    <Eyedropper className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {!foregroundValid && (
              <p className="text-xs text-red-500">Please enter a valid hex color (e.g., #000000)</p>
            )}
          </div>
          
          {/* Background color */}
          <div className="space-y-2">
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex gap-2">
              <div
                className="h-10 w-10 rounded-md border flex-shrink-0"
                style={{ backgroundColor: backgroundValid ? background : '#FF0000' }}
              />
              <div className="flex-grow flex gap-2">
                <Input
                  id="background-color"
                  type="text"
                  value={background}
                  onChange={handleBackgroundChange}
                  className={cn(!backgroundValid && "border-red-500")}
                  placeholder="#FFFFFF"
                />
                <input
                  type="color"
                  value={backgroundValid ? background : '#FFFFFF'}
                  onChange={(e) => {
                    setBackground(e.target.value);
                    setBackgroundValid(true);
                  }}
                  className="h-10 w-10 p-1 rounded-md border"
                />
                {showEyedropper && supportsEyeDropper && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEyedropper('bg')}
                    disabled={eyedropperActive !== null}
                  >
                    <Eyedropper className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {!backgroundValid && (
              <p className="text-xs text-red-500">Please enter a valid hex color (e.g., #FFFFFF)</p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {showSwapButton && (
            <Button 
              variant="outline" 
              onClick={handleSwapColors}
              disabled={!foregroundValid || !backgroundValid}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Swap Colors
            </Button>
          )}
          
          {showAutoFix && contrastResult.ratio < 4.5 && (
            <Button 
              variant="secondary" 
              onClick={handleAutoFix}
              disabled={!foregroundValid || !backgroundValid}
            >
              Auto-Fix Contrast
            </Button>
          )}
        </div>
        
        {/* Contrast Results */}
        {foregroundValid && backgroundValid && (
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              {rating.icon}
              <div>
                <div className="font-medium flex items-center gap-2">
                  {rating.text}
                  <span className={cn("text-sm font-bold rounded-md px-2 py-0.5", 
                    rating.level === 'AAA' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                    rating.level === 'AA' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                    rating.level === 'AA Large' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" :
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  )}>
                    {rating.level}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{rating.explanation}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="font-bold text-2xl">
                {contrastResult.ratio.toFixed(2)}:1
              </div>
              <div className="text-sm text-muted-foreground">Contrast Ratio</div>
            </div>
            
            {showWCAGDetails && (
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div>
                  <div className="font-medium">WCAG AA (minimum)</div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-block w-4 h-4 rounded-full",
                      contrastResult.AA.normalText ? "bg-green-500" : "bg-red-500"
                    )} />
                    <span>Normal text (4.5:1) - {contrastResult.AA.normalText ? 'Pass' : 'Fail'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-block w-4 h-4 rounded-full",
                      contrastResult.AA.largeText ? "bg-green-500" : "bg-red-500"
                    )} />
                    <span>Large text (3:1) - {contrastResult.AA.largeText ? 'Pass' : 'Fail'}</span>
                  </div>
                </div>
                
                <div>
                  <div className="font-medium">WCAG AAA (enhanced)</div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-block w-4 h-4 rounded-full",
                      contrastResult.AAA.normalText ? "bg-green-500" : "bg-red-500"
                    )} />
                    <span>Normal text (7:1) - {contrastResult.AAA.normalText ? 'Pass' : 'Fail'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-block w-4 h-4 rounded-full",
                      contrastResult.AAA.largeText ? "bg-green-500" : "bg-red-500"
                    )} />
                    <span>Large text (4.5:1) - {contrastResult.AAA.largeText ? 'Pass' : 'Fail'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Text Preview */}
        {showTextPreview && foregroundValid && backgroundValid && (
          <div>
            <Label className="mb-2 block">Text Preview</Label>
            <div className="space-y-4 p-4 rounded-lg border" style={{ backgroundColor: background }}>
              <p className="text-xs" style={{ color: foreground }}>Small text (12px)</p>
              <p className="text-sm" style={{ color: foreground }}>Body text (14px)</p>
              <p className="text-base" style={{ color: foreground }}>{sampleText}</p>
              <p className="text-lg font-medium" style={{ color: foreground }}>Large text (18px)</p>
              <p className="text-xl font-bold" style={{ color: foreground }}>Large bold text (20px)</p>
              <p className="text-2xl" style={{ color: foreground }}>Heading text (24px)</p>
            </div>
          </div>
        )}
        
        {/* Color Suggestions */}
        {showSuggestions && foregroundValid && backgroundValid && contrastResult.ratio < 4.5 && (
          <div>
            <Label className="mb-2 block">Suggested Foreground Colors with Better Contrast</Label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((color, i) => {
                const suggestionContrast = getContrastBetweenColors(color, background);
                return (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-col h-auto p-2"
                          onClick={() => applySuggestion(color)}
                        >
                          <div 
                            className="w-full h-8 rounded mb-1"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-mono">{color}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div>Contrast: {suggestionContrast.ratio.toFixed(2)}:1</div>
                          <div>
                            {suggestionContrast.ratio >= 7 
                              ? 'AAA - Excellent contrast' 
                              : 'AA - Good contrast'}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start">
        <p className="text-xs text-muted-foreground">
          WCAG 2.1 guidelines: Normal text needs 4.5:1 contrast ratio for AA and 7:1 for AAA. 
          Large text (18pt+ or 14pt+ bold) needs 3:1 for AA and 4.5:1 for AAA.
        </p>
      </CardFooter>
    </Card>
  );
}