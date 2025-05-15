import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AccessibilityIcon, 
  ZoomIn, 
  ZoomOut,
  Type, 
  Sun, 
  Moon, 
  X, 
  Volume2, 
  MousePointerClick,
  Keyboard,
  PanelLeftClose
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface AccessibilityPanelProps {
  className?: string;
  position?: 'left' | 'right';
  showLanguageOptions?: boolean;
  supportedLanguages?: { code: string; name: string }[];
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  persistent?: boolean;
  onSave?: (settings: AccessibilitySettings) => void;
  defaultSettings?: Partial<AccessibilitySettings>;
}

export interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reduceMotion: boolean;
  grayscale: boolean;
  focusHighlight: boolean;
  textToSpeech: boolean;
  theme: 'light' | 'dark' | 'system';
  cursorSize: number;
  keyboardShortcuts: boolean;
}

const defaultAccessibilitySettings: AccessibilitySettings = {
  fontSize: 100, // percentage
  highContrast: false,
  reduceMotion: false,
  grayscale: false,
  focusHighlight: false,
  textToSpeech: false,
  theme: 'system',
  cursorSize: 1, // multiplier
  keyboardShortcuts: true
};

/**
 * Accessibility panel with user-configurable settings for inclusive design
 */
export function AccessibilityPanel({
  className = '',
  position = 'right',
  showLanguageOptions = false,
  supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ],
  currentLanguage = 'en',
  onLanguageChange,
  persistent = false,
  onSave,
  defaultSettings = {}
}: AccessibilityPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'display' | 'input' | 'language'>('display');
  const [settings, setSettings] = useState<AccessibilitySettings>({
    ...defaultAccessibilitySettings,
    ...defaultSettings
  });
  
  // Apply accessibility settings to document when they change
  useEffect(() => {
    // Font size
    document.documentElement.style.setProperty(
      '--accessibility-font-scale', 
      `${settings.fontSize / 100}`
    );
    
    // High contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Reduce motion
    if (settings.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Grayscale
    if (settings.grayscale) {
      document.documentElement.classList.add('grayscale');
    } else {
      document.documentElement.classList.remove('grayscale');
    }
    
    // Focus highlight
    if (settings.focusHighlight) {
      document.documentElement.classList.add('focus-visible');
    } else {
      document.documentElement.classList.remove('focus-visible');
    }
    
    // Cursor size
    document.documentElement.style.setProperty(
      '--accessibility-cursor-scale',
      `${settings.cursorSize}`
    );
    
    // Theme (handled by ThemeProvider, here we'd just dispatch a custom event)
    if (settings.theme !== 'system') {
      const themeEvent = new CustomEvent('accessibility-theme-change', { 
        detail: { theme: settings.theme } 
      });
      document.dispatchEvent(themeEvent);
    }
  }, [settings]);
  
  // Handle settings change
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Call onSave if provided
      if (onSave) {
        onSave(newSettings);
      }
      
      return newSettings;
    });
  };
  
  // Reset all settings to defaults
  const resetSettings = () => {
    setSettings(defaultAccessibilitySettings);
    
    if (onSave) {
      onSave(defaultAccessibilitySettings);
    }
  };
  
  // Render accessibility toggle button
  const renderToggleButton = () => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "fixed z-50 rounded-full h-10 w-10 shadow-md",
                position === 'left' ? 'left-4' : 'right-4',
                "bottom-24"
              )}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Accessibility options"
            >
              <AccessibilityIcon size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-sm">Accessibility options</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  // Render the panel content
  const renderPanelContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AccessibilityIcon size={18} />
            Accessibility
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
            aria-label="Close accessibility panel"
          >
            <X size={16} />
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={cn(
              "flex-1 py-2 text-sm font-medium",
              activeTab === 'display' 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('display')}
          >
            Display
          </button>
          <button
            className={cn(
              "flex-1 py-2 text-sm font-medium",
              activeTab === 'input' 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('input')}
          >
            Controls
          </button>
          {showLanguageOptions && (
            <button
              className={cn(
                "flex-1 py-2 text-sm font-medium",
                activeTab === 'language' 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('language')}
            >
              Language
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Display settings */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* Font size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="font-size" className="flex items-center gap-2">
                    <Type size={16} />
                    Font Size
                  </Label>
                  <span className="text-sm font-medium">
                    {settings.fontSize}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomOut size={16} className="text-muted-foreground" />
                  <Slider
                    id="font-size"
                    min={50}
                    max={200}
                    step={5}
                    value={[settings.fontSize]}
                    onValueChange={(value) => updateSetting('fontSize', value[0])}
                    className="flex-1"
                  />
                  <ZoomIn size={16} className="text-muted-foreground" />
                </div>
              </div>
              
              {/* Appearance */}
              <div className="space-y-3">
                <Label className="text-sm font-medium block">Appearance</Label>
                
                <div className="space-y-3 pl-1">
                  {/* Theme */}
                  <div className="flex justify-between items-center">
                    <Label htmlFor="theme-selector" className="flex items-center gap-2 cursor-pointer">
                      {settings.theme === 'light' && <Sun size={16} />}
                      {settings.theme === 'dark' && <Moon size={16} />}
                      {settings.theme === 'system' && (
                        <div className="relative w-4 h-4">
                          <Sun size={16} className="absolute opacity-50" />
                          <Moon size={16} className="absolute opacity-50" />
                        </div>
                      )}
                      Theme
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant={settings.theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => updateSetting('theme', 'light')}
                      >
                        Light
                      </Button>
                      <Button
                        variant={settings.theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => updateSetting('theme', 'dark')}
                      >
                        Dark
                      </Button>
                      <Button
                        variant={settings.theme === 'system' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => updateSetting('theme', 'system')}
                      >
                        Auto
                      </Button>
                    </div>
                  </div>
                  
                  {/* High contrast */}
                  <div className="flex justify-between items-center">
                    <Label htmlFor="high-contrast" className="flex items-center gap-2 cursor-pointer">
                      High Contrast
                    </Label>
                    <Switch
                      id="high-contrast"
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                    />
                  </div>
                  
                  {/* Grayscale */}
                  <div className="flex justify-between items-center">
                    <Label htmlFor="grayscale" className="flex items-center gap-2 cursor-pointer">
                      Grayscale
                    </Label>
                    <Switch
                      id="grayscale"
                      checked={settings.grayscale}
                      onCheckedChange={(checked) => updateSetting('grayscale', checked)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Animation */}
              <div className="space-y-3">
                <Label className="text-sm font-medium block">Animation</Label>
                
                <div className="flex justify-between items-center pl-1">
                  <Label htmlFor="reduce-motion" className="flex items-center gap-2 cursor-pointer">
                    Reduce Motion
                  </Label>
                  <Switch
                    id="reduce-motion"
                    checked={settings.reduceMotion}
                    onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Input settings */}
          {activeTab === 'input' && (
            <div className="space-y-6">
              {/* Focus */}
              <div className="space-y-3">
                <Label className="text-sm font-medium block">Focus & Navigation</Label>
                
                <div className="space-y-3 pl-1">
                  {/* Focus highlight */}
                  <div className="flex justify-between items-center">
                    <Label htmlFor="focus-highlight" className="flex items-center gap-2 cursor-pointer">
                      Enhanced Focus Indicators
                    </Label>
                    <Switch
                      id="focus-highlight"
                      checked={settings.focusHighlight}
                      onCheckedChange={(checked) => updateSetting('focusHighlight', checked)}
                    />
                  </div>
                  
                  {/* Keyboard shortcuts */}
                  <div className="flex justify-between items-center">
                    <Label htmlFor="keyboard-shortcuts" className="flex items-center gap-2 cursor-pointer">
                      <Keyboard size={16} />
                      Keyboard Shortcuts
                    </Label>
                    <Switch
                      id="keyboard-shortcuts"
                      checked={settings.keyboardShortcuts}
                      onCheckedChange={(checked) => updateSetting('keyboardShortcuts', checked)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Cursor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cursor-size" className="flex items-center gap-2">
                    <MousePointerClick size={16} />
                    Cursor Size
                  </Label>
                  <span className="text-sm font-medium">
                    {settings.cursorSize}x
                  </span>
                </div>
                <Slider
                  id="cursor-size"
                  min={1}
                  max={2}
                  step={0.1}
                  value={[settings.cursorSize]}
                  onValueChange={(value) => updateSetting('cursorSize', value[0])}
                />
              </div>
              
              {/* Audio */}
              <div className="space-y-3">
                <Label className="text-sm font-medium block">Audio & Speech</Label>
                
                <div className="flex justify-between items-center pl-1">
                  <Label htmlFor="text-to-speech" className="flex items-center gap-2 cursor-pointer">
                    <Volume2 size={16} />
                    Screen Reader Support
                  </Label>
                  <Switch
                    id="text-to-speech"
                    checked={settings.textToSpeech}
                    onCheckedChange={(checked) => updateSetting('textToSpeech', checked)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Language settings */}
          {activeTab === 'language' && showLanguageOptions && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium block">Select Language</Label>
                
                <div className="grid gap-2">
                  {supportedLanguages.map((language) => (
                    <button
                      key={language.code}
                      className={cn(
                        "flex justify-between items-center px-3 py-2 rounded-md text-left",
                        language.code === currentLanguage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                      onClick={() => onLanguageChange && onLanguageChange(language.code)}
                    >
                      <span>{language.name}</span>
                      {language.code === currentLanguage && (
                        <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetSettings}
            className="text-xs h-8"
          >
            Reset to Defaults
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-xs h-8"
          >
            Close
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {!persistent && renderToggleButton()}
      
      <AnimatePresence>
        {(isOpen || persistent) && (
          <motion.div
            initial={{ 
              x: position === 'left' ? '-100%' : '100%',
              opacity: 0
            }}
            animate={{ 
              x: 0,
              opacity: 1
            }}
            exit={{ 
              x: position === 'left' ? '-100%' : '100%',
              opacity: 0
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              "fixed top-0 bottom-0 z-50 w-80 bg-background border-l border-border shadow-xl flex flex-col",
              position === 'left' ? "left-0" : "right-0",
              className
            )}
          >
            {renderPanelContent()}
          </motion.div>
        )}
      </AnimatePresence>
      
      {(isOpen || persistent) && !persistent && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}