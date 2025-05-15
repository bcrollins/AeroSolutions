import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Accessibility,
  Sun,
  Moon,
  SunMoon,
  Maximize,
  Minimize,
  ArrowRight,
  Type,
  EyeOff,
  Eye,
  RotateCcw,
  X
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useDevice } from '@/hooks/use-device';

interface AccessibilityPanelProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showIcon?: boolean;
  autoPersist?: boolean;
  className?: string;
  hideOnMobile?: boolean;
  defaultOpen?: boolean;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ContrastMode = 'normal' | 'high' | 'low';
export type FontSize = 'normal' | 'large' | 'larger' | 'largest';

interface AccessibilitySettings {
  theme: ThemeMode;
  contrast: ContrastMode;
  fontSize: FontSize;
  motionReduced: boolean;
  grayscaleEnabled: boolean;
}

// Font size multipliers
const fontSizeMultipliers = {
  normal: 1,
  large: 1.15,
  larger: 1.3,
  largest: 1.5
};

// Contrast modes
const contrastModes = {
  normal: { bg: '', text: '' },
  high: { bg: 'contrast-high', text: 'contrast-high' },
  low: { bg: 'contrast-low', text: 'contrast-low' }
};

/**
 * AccessibilityPanel - A panel for users to adjust accessibility settings
 * 
 * @example
 * <AccessibilityPanel 
 *   position="bottom-right" 
 *   autoPersist={true}
 *   hideOnMobile={false}
 * />
 */
export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  position = 'bottom-right',
  showIcon = true,
  autoPersist = true,
  className = '',
  hideOnMobile = false,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    theme: 'system',
    contrast: 'normal',
    fontSize: 'normal',
    motionReduced: false,
    grayscaleEnabled: false,
  });
  const { isMobile } = useDevice();

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && autoPersist) {
      const savedSettings = localStorage.getItem('accessibility-settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          applySettings(parsedSettings);
        } catch (e) {
          console.error('Failed to parse accessibility settings:', e);
        }
      } else {
        // If no saved settings, detect system theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          updateSetting('theme', 'dark');
        } else {
          updateSetting('theme', 'light');
        }
      }
    }
  }, [autoPersist]);

  // Apply the settings to the document
  const applySettings = (currentSettings: AccessibilitySettings) => {
    // Apply theme
    const root = document.documentElement;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    root.classList.remove('light-theme', 'dark-theme');
    if (currentSettings.theme === 'system') {
      root.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      root.classList.add(`${currentSettings.theme}-theme`);
    }

    // Apply font size
    const fontSize = fontSizeMultipliers[currentSettings.fontSize];
    root.style.setProperty('--accessibility-font-scale', fontSize.toString());

    // Apply contrast
    root.classList.remove('contrast-high', 'contrast-low');
    if (currentSettings.contrast !== 'normal') {
      root.classList.add(contrastModes[currentSettings.contrast].bg);
    }

    // Apply motion preference
    root.style.setProperty('--reduce-motion', currentSettings.motionReduced ? '1' : '0');

    // Apply grayscale
    root.style.setProperty('--grayscale-filter', currentSettings.grayscaleEnabled ? '1' : '0');
  };

  // Update a single setting
  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    
    if (autoPersist) {
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    }
  };

  // Reset all settings to default
  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      theme: 'system',
      contrast: 'normal',
      fontSize: 'normal',
      motionReduced: false,
      grayscaleEnabled: false,
    };
    
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    
    if (autoPersist) {
      localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
    }
  };

  // Don't render on mobile if specified
  if (hideOnMobile && isMobile) {
    return null;
  }

  // Position utility
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div 
      className={cn(
        "fixed z-50 flex",
        getPositionClasses(),
        className
      )}
    >
      {showIcon && (
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full shadow-md border-border/50 bg-background/80 backdrop-blur-sm hover:bg-background",
            isOpen && "bg-primary/10 border-primary/20"
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Accessibility Options"
        >
          <Accessibility className="h-5 w-5" />
        </Button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-50 p-4 rounded-lg shadow-lg border border-border/50 bg-card w-72",
              position.includes('top') ? 'top-12' : 'bottom-12',
              position.includes('left') ? 'left-0' : 'right-0'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium">Accessibility Options</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Theme Mode */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateSetting('theme', 'light')}
                  >
                    <Sun className="h-4 w-4 mr-1" />
                    Light
                  </Button>
                  <Button
                    variant={settings.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateSetting('theme', 'dark')}
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    Dark
                  </Button>
                  <Button
                    variant={settings.theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateSetting('theme', 'system')}
                  >
                    <SunMoon className="h-4 w-4 mr-1" />
                    Auto
                  </Button>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Font Size</label>
                  <span className="text-xs text-muted-foreground">
                    {settings.fontSize === 'normal' ? 'Default' : settings.fontSize}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <Slider
                    value={[
                      settings.fontSize === 'normal' ? 0 : 
                      settings.fontSize === 'large' ? 33 : 
                      settings.fontSize === 'larger' ? 66 : 100
                    ]}
                    min={0}
                    max={100}
                    step={33}
                    onValueChange={(value) => {
                      const fontSize = 
                        value[0] <= 0 ? 'normal' :
                        value[0] <= 33 ? 'large' :
                        value[0] <= 66 ? 'larger' : 'largest';
                      updateSetting('fontSize', fontSize);
                    }}
                    className="flex-1"
                  />
                  <Type className="h-5 w-5" />
                </div>
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Contrast</label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.contrast === 'normal' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateSetting('contrast', 'normal')}
                  >
                    Normal
                  </Button>
                  <Button
                    variant={settings.contrast === 'high' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateSetting('contrast', 'high')}
                  >
                    High
                  </Button>
                  <Button
                    variant={settings.contrast === 'low' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateSetting('contrast', 'low')}
                  >
                    Low
                  </Button>
                </div>
              </div>

              {/* Motion */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Minimize className="h-4 w-4" />
                  Reduce Motion
                </label>
                <Button
                  variant={settings.motionReduced ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('motionReduced', !settings.motionReduced)}
                >
                  {settings.motionReduced ? 'On' : 'Off'}
                </Button>
              </div>

              {/* Grayscale */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <EyeOff className="h-4 w-4" />
                  Color Filter (Grayscale)
                </label>
                <Button
                  variant={settings.grayscaleEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('grayscaleEnabled', !settings.grayscaleEnabled)}
                >
                  {settings.grayscaleEnabled ? 'On' : 'Off'}
                </Button>
              </div>

              {/* Reset Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={resetSettings}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessibilityPanel;