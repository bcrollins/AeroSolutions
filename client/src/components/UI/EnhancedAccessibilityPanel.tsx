import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Accessibility,
  Sun,
  Moon,
  SunMoon,
  Minimize,
  Type,
  Eye,
  EyeOff,
  RotateCcw,
  X,
  ChevronsUpDown,
  BrainCircuit,
  MousePointer,
  Layout,
  MonitorSmartphone,
  VideoOff,
  Music,
  VolumeX,
  Cog,
  BadgeCheck,
  Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDevice } from '@/hooks/use-device';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ContrastMode = 'normal' | 'high' | 'highest' | 'low';
export type FontSize = 'normal' | 'large' | 'larger' | 'largest';
export type FontFamily = 'default' | 'dyslexic' | 'readable' | 'mono';
export type AnimationSpeed = 'normal' | 'reduced' | 'minimal' | 'none';
export type ColorBlindness = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

interface AccessibilitySettings {
  // Appearance
  theme: ThemeMode;
  contrast: ContrastMode;
  fontFamily: FontFamily;
  fontSize: FontSize; 
  letterSpacing: number;
  lineSpacing: number;
  
  // Motion & Animation
  motionReduced: boolean;
  animationSpeed: AnimationSpeed;
  autoplayVideos: boolean;
  
  // Visual Aids
  colorBlindnessMode: ColorBlindness;
  grayscaleEnabled: boolean;
  highlightFocus: boolean;
  cursorSize: number;
  
  // Audio
  muteAudio: boolean;
  
  // Cognitive
  simplifiedMode: boolean;
  readingGuide: boolean;
}

interface EnhancedAccessibilityPanelProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showIcon?: boolean;
  autoPersist?: boolean;
  className?: string;
  hideOnMobile?: boolean;
  defaultOpen?: boolean;
  mode?: 'simple' | 'expanded' | 'fullscreen';
  logo?: React.ReactNode;
  complianceStatement?: string;
}

// Font size multipliers
const fontSizeMultipliers = {
  normal: 1,
  large: 1.15, 
  larger: 1.3,
  largest: 1.5
};

// Font families
const fontFamilies = {
  default: 'var(--font-sans)',
  dyslexic: "'OpenDyslexic', var(--font-sans)",
  readable: "'Atkinson Hyperlegible', var(--font-sans)",
  mono: "var(--font-mono)"
};

// Color filters
const colorFilters = {
  none: '',
  protanopia: 'protanopia',
  deuteranopia: 'deuteranopia',
  tritanopia: 'tritanopia',
  achromatopsia: 'grayscale(100%)'
};

/**
 * EnhancedAccessibilityPanel - A comprehensive panel for accessibility settings
 * 
 * @example
 * <EnhancedAccessibilityPanel 
 *   position="bottom-right" 
 *   mode="expanded"
 *   autoPersist={true}
 *   complianceStatement="RXAI is committed to WCAG 2.1 AA compliance"
 * />
 */
export const EnhancedAccessibilityPanel: React.FC<EnhancedAccessibilityPanelProps> = ({
  position = 'bottom-right',
  showIcon = true,
  autoPersist = true,
  className = '',
  hideOnMobile = false,
  defaultOpen = false,
  mode = 'expanded',
  logo,
  complianceStatement
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState<AccessibilitySettings>({
    // Appearance
    theme: 'system',
    contrast: 'normal',
    fontFamily: 'default',
    fontSize: 'normal',
    letterSpacing: 0,
    lineSpacing: 0,
    
    // Motion & Animation
    motionReduced: false,
    animationSpeed: 'normal',
    autoplayVideos: true,
    
    // Visual Aids
    colorBlindnessMode: 'none',
    grayscaleEnabled: false,
    highlightFocus: false,
    cursorSize: 0,
    
    // Audio
    muteAudio: false,
    
    // Cognitive
    simplifiedMode: false,
    readingGuide: false
  });
  
  const { isMobile } = useDevice();

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && autoPersist) {
      const savedSettings = localStorage.getItem('accessibility-settings-v2');
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

  // Apply settings to the document
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
    
    // Apply font family
    root.style.setProperty('--accessibility-font-family', fontFamilies[currentSettings.fontFamily]);
    
    // Apply letter spacing
    root.style.setProperty('--accessibility-letter-spacing', `${currentSettings.letterSpacing}px`);
    
    // Apply line spacing
    root.style.setProperty('--accessibility-line-spacing', `${currentSettings.lineSpacing + 1}`);

    // Apply contrast
    root.classList.remove('contrast-high', 'contrast-highest', 'contrast-low');
    if (currentSettings.contrast !== 'normal') {
      root.classList.add(`contrast-${currentSettings.contrast}`);
    }

    // Apply motion preference
    root.style.setProperty('--reduce-motion', currentSettings.motionReduced ? '1' : '0');
    
    // Apply animation speed
    root.style.setProperty('--animation-speed-multiplier', 
      currentSettings.animationSpeed === 'normal' ? '1' : 
      currentSettings.animationSpeed === 'reduced' ? '1.5' : 
      currentSettings.animationSpeed === 'minimal' ? '3' : '100'
    );
    
    // Apply grayscale
    root.style.setProperty('--grayscale-filter', currentSettings.grayscaleEnabled ? '1' : '0');
    
    // Apply colorblindness filters
    root.style.setProperty('--color-filter', colorFilters[currentSettings.colorBlindnessMode]);
    
    // Apply focus highlighting
    root.classList.toggle('highlight-focus', currentSettings.highlightFocus);
    
    // Apply cursor size
    root.style.setProperty('--cursor-size-modifier', `${1 + (currentSettings.cursorSize * 0.5)}`);
    
    // Apply simplified mode
    root.classList.toggle('simplified-mode', currentSettings.simplifiedMode);
    
    // Apply reading guide
    root.classList.toggle('reading-guide-active', currentSettings.readingGuide);
    
    // Apply video autoplay preferences
    if (!currentSettings.autoplayVideos) {
      // Find and pause all videos that might be set to autoplay
      document.querySelectorAll('video[autoplay]').forEach((video) => {
        (video as HTMLVideoElement).pause();
        (video as HTMLVideoElement).autoplay = false;
      });
    }
    
    // Apply audio preferences
    if (currentSettings.muteAudio) {
      // Mute all audio and video elements
      document.querySelectorAll('audio, video').forEach((media) => {
        (media as HTMLMediaElement).muted = true;
      });
    }
    
    // Additional initialization for reading guide if active
    if (currentSettings.readingGuide) {
      initReadingGuide();
    } else {
      removeReadingGuide();
    }
  };
  
  // Initialize reading guide functionality
  const initReadingGuide = () => {
    // Remove any existing guide first
    removeReadingGuide();
    
    // Create the reading guide element
    const guide = document.createElement('div');
    guide.id = 'accessibility-reading-guide';
    guide.style.cssText = `
      position: fixed;
      height: 30px;
      background-color: rgba(255, 255, 0, 0.2);
      border: 1px solid rgba(255, 255, 0, 0.3);
      pointer-events: none;
      z-index: 9999;
      left: 0;
      right: 0;
      top: 100px;
      display: none;
    `;
    document.body.appendChild(guide);
    
    // Add mouse move event listener
    const handleMouseMove = (e: MouseEvent) => {
      if (guide) {
        guide.style.display = 'block';
        guide.style.top = `${e.clientY}px`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Store the event listener for cleanup
    (window as any).__accessibilityReadingGuideListener = handleMouseMove;
  };
  
  // Remove reading guide
  const removeReadingGuide = () => {
    const existingGuide = document.getElementById('accessibility-reading-guide');
    if (existingGuide) {
      document.body.removeChild(existingGuide);
    }
    
    if ((window as any).__accessibilityReadingGuideListener) {
      document.removeEventListener('mousemove', (window as any).__accessibilityReadingGuideListener);
      (window as any).__accessibilityReadingGuideListener = null;
    }
  };

  // Update a single setting
  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    
    if (autoPersist) {
      localStorage.setItem('accessibility-settings-v2', JSON.stringify(newSettings));
    }
  };

  // Reset all settings to default
  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      // Appearance
      theme: 'system',
      contrast: 'normal',
      fontFamily: 'default',
      fontSize: 'normal',
      letterSpacing: 0,
      lineSpacing: 0,
      
      // Motion & Animation
      motionReduced: false,
      animationSpeed: 'normal',
      autoplayVideos: true,
      
      // Visual Aids
      colorBlindnessMode: 'none',
      grayscaleEnabled: false,
      highlightFocus: false,
      cursorSize: 0,
      
      // Audio
      muteAudio: false,
      
      // Cognitive
      simplifiedMode: false,
      readingGuide: false
    };
    
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    
    if (autoPersist) {
      localStorage.setItem('accessibility-settings-v2', JSON.stringify(defaultSettings));
    }
  };

  // Cleanup reading guide on unmount
  useEffect(() => {
    return () => {
      if (settings.readingGuide) {
        removeReadingGuide();
      }
    };
  }, []);

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
  
  // Get panel sizing based on mode
  const getPanelClasses = () => {
    switch (mode) {
      case 'simple':
        return 'w-72';
      case 'expanded':
        return 'w-[340px] md:w-[400px]';
      case 'fullscreen':
        return 'w-[340px] md:w-[720px] lg:w-[1000px] max-h-[80vh] overflow-y-auto';
      default:
        return 'w-[340px]';
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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-50 p-4 rounded-lg shadow-lg border border-border/50 bg-card",
              getPanelClasses(),
              position.includes('top') ? 'top-12' : 'bottom-12',
              position.includes('left') ? 'left-0' : 'right-0'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {logo && <div className="flex-shrink-0">{logo}</div>}
                <h3 className="text-base font-medium">Accessibility Options</h3>
              </div>
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

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4 grid-cols-5">
                <TabsTrigger value="appearance" className="flex flex-col items-center text-[10px] sm:text-xs p-1 h-auto">
                  <Sun className="h-4 w-4 mb-1" />
                  <span className="hidden sm:inline">Appearance</span>
                </TabsTrigger>
                <TabsTrigger value="motion" className="flex flex-col items-center text-[10px] sm:text-xs p-1 h-auto">
                  <Minimize className="h-4 w-4 mb-1" />
                  <span className="hidden sm:inline">Motion</span>
                </TabsTrigger>
                <TabsTrigger value="vision" className="flex flex-col items-center text-[10px] sm:text-xs p-1 h-auto">
                  <Eye className="h-4 w-4 mb-1" />
                  <span className="hidden sm:inline">Vision</span>
                </TabsTrigger>
                <TabsTrigger value="cognitive" className="flex flex-col items-center text-[10px] sm:text-xs p-1 h-auto">
                  <BrainCircuit className="h-4 w-4 mb-1" />
                  <span className="hidden sm:inline">Cognitive</span>
                </TabsTrigger>
                <TabsTrigger value="other" className="flex flex-col items-center text-[10px] sm:text-xs p-1 h-auto">
                  <Cog className="h-4 w-4 mb-1" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-4">
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
                
                {/* Font Family */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={settings.fontFamily === 'default' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('fontFamily', 'default')}
                    >
                      Default
                    </Button>
                    <Button
                      variant={settings.fontFamily === 'dyslexic' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('fontFamily', 'dyslexic')}
                    >
                      Dyslexic
                    </Button>
                    <Button
                      variant={settings.fontFamily === 'readable' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('fontFamily', 'readable')}
                    >
                      Readable
                    </Button>
                    <Button
                      variant={settings.fontFamily === 'mono' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('fontFamily', 'mono')}
                    >
                      Monospace
                    </Button>
                  </div>
                </div>

                {/* Letter Spacing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Letter Spacing</label>
                    <span className="text-xs text-muted-foreground">
                      {settings.letterSpacing === 0 ? 'Default' : `+${settings.letterSpacing}px`}
                    </span>
                  </div>
                  <Slider
                    value={[settings.letterSpacing]}
                    min={0}
                    max={5}
                    step={0.5}
                    onValueChange={(value) => {
                      updateSetting('letterSpacing', value[0]);
                    }}
                  />
                </div>
                
                {/* Line Spacing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Line Spacing</label>
                    <span className="text-xs text-muted-foreground">
                      {settings.lineSpacing === 0 ? 'Default' : `+${settings.lineSpacing * 100}%`}
                    </span>
                  </div>
                  <Slider
                    value={[settings.lineSpacing]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => {
                      updateSetting('lineSpacing', value[0]);
                    }}
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contrast</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={settings.contrast === 'normal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('contrast', 'normal')}
                    >
                      Normal
                    </Button>
                    <Button
                      variant={settings.contrast === 'high' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('contrast', 'high')}
                    >
                      High
                    </Button>
                    <Button
                      variant={settings.contrast === 'highest' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('contrast', 'highest')}
                    >
                      Highest
                    </Button>
                    <Button
                      variant={settings.contrast === 'low' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('contrast', 'low')}
                    >
                      Low
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="motion" className="space-y-4">
                {/* Reduce Motion */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium cursor-pointer">Reduce Motion</Label>
                    <p className="text-xs text-muted-foreground">Minimize animations</p>
                  </div>
                  <Switch
                    checked={settings.motionReduced}
                    onCheckedChange={(value) => updateSetting('motionReduced', value)}
                  />
                </div>
                
                {/* Animation Speed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Animation Speed</label>
                    <span className="text-xs text-muted-foreground">
                      {settings.animationSpeed}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={settings.animationSpeed === 'normal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('animationSpeed', 'normal')}
                    >
                      Normal
                    </Button>
                    <Button
                      variant={settings.animationSpeed === 'reduced' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('animationSpeed', 'reduced')}
                    >
                      Reduced
                    </Button>
                    <Button
                      variant={settings.animationSpeed === 'minimal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('animationSpeed', 'minimal')}
                    >
                      Minimal
                    </Button>
                    <Button
                      variant={settings.animationSpeed === 'none' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('animationSpeed', 'none')}
                    >
                      None
                    </Button>
                  </div>
                </div>
                
                {/* Disable Autoplay */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium cursor-pointer">Autoplay Videos</Label>
                    <p className="text-xs text-muted-foreground">Allow videos to play automatically</p>
                  </div>
                  <Switch
                    checked={settings.autoplayVideos}
                    onCheckedChange={(value) => updateSetting('autoplayVideos', value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="vision" className="space-y-4">
                {/* Color Blindness */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color Blindness Support</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={settings.colorBlindnessMode === 'none' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('colorBlindnessMode', 'none')}
                    >
                      None
                    </Button>
                    <Button
                      variant={settings.colorBlindnessMode === 'protanopia' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('colorBlindnessMode', 'protanopia')}
                    >
                      Protanopia
                    </Button>
                    <Button
                      variant={settings.colorBlindnessMode === 'deuteranopia' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('colorBlindnessMode', 'deuteranopia')}
                    >
                      Deuteranopia
                    </Button>
                    <Button
                      variant={settings.colorBlindnessMode === 'tritanopia' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('colorBlindnessMode', 'tritanopia')}
                    >
                      Tritanopia
                    </Button>
                  </div>
                </div>
                
                {/* Grayscale */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium cursor-pointer">Grayscale</Label>
                    <p className="text-xs text-muted-foreground">Display in black and white</p>
                  </div>
                  <Switch
                    checked={settings.grayscaleEnabled}
                    onCheckedChange={(value) => updateSetting('grayscaleEnabled', value)}
                  />
                </div>
                
                {/* Focus Highlighting */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium cursor-pointer">Focus Highlighting</Label>
                    <p className="text-xs text-muted-foreground">Enhanced highlighting of focused elements</p>
                  </div>
                  <Switch
                    checked={settings.highlightFocus}
                    onCheckedChange={(value) => updateSetting('highlightFocus', value)}
                  />
                </div>
                
                {/* Cursor Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Cursor Size</label>
                    <span className="text-xs text-muted-foreground">
                      {settings.cursorSize === 0 ? 'Normal' : 
                       settings.cursorSize === 1 ? 'Large' : 'Largest'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MousePointer className="h-4 w-4" />
                    <Slider
                      value={[settings.cursorSize]}
                      min={0}
                      max={2}
                      step={1}
                      onValueChange={(value) => {
                        updateSetting('cursorSize', value[0]);
                      }}
                      className="flex-1"
                    />
                    <MousePointer className="h-5 w-5" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cognitive" className="space-y-4">
                {/* Simplified Mode */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium cursor-pointer">Simplified Mode</Label>
                    <p className="text-xs text-muted-foreground">Reduce visual complexity</p>
                  </div>
                  <Switch
                    checked={settings.simplifiedMode}
                    onCheckedChange={(value) => updateSetting('simplifiedMode', value)}
                  />
                </div>
                
                {/* Reading Guide */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium cursor-pointer">Reading Guide</Label>
                    <p className="text-xs text-muted-foreground">Highlight text at cursor position</p>
                  </div>
                  <Switch
                    checked={settings.readingGuide}
                    onCheckedChange={(value) => updateSetting('readingGuide', value)}
                  />
                </div>
                
                {/* Audio Mute */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium cursor-pointer">Mute All Audio</Label>
                    <p className="text-xs text-muted-foreground">Silence videos and audio</p>
                  </div>
                  <Switch
                    checked={settings.muteAudio}
                    onCheckedChange={(value) => updateSetting('muteAudio', value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="other" className="space-y-4">
                {/* Reset Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={resetSettings}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
                
                {/* Device Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <MonitorSmartphone className="h-3.5 w-3.5" />
                    <span>Device type: {isMobile ? 'Mobile' : 'Desktop'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layout className="h-3.5 w-3.5" />
                    <span>Screen size: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown'}</span>
                  </div>
                </div>
                
                {/* Compliance Statement */}
                {complianceStatement && (
                  <div className="mt-4 pt-2 border-t border-border/50 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <p>{complianceStatement}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedAccessibilityPanel;