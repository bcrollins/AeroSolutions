import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Moon, 
  Sun, 
  Monitor, 
  Type, 
  Minimize, 
  Maximize, 
  Eye, 
  Sparkles, 
  MousePointer, 
  AlignLeft,
  BookOpen,
  PanelLeft,
  Ruler,
  ZoomIn
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { ButtonPress } from './MicroInteractions';

interface AccessibilitySettings {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  contrastMode: 'normal' | 'high' | 'inverted';
  motionReduced: boolean;
  dyslexiaFont: boolean;
  focusIndicators: boolean;
  highlightLinks: boolean;
  paragraphSpacing: number;
  cursorSize: 'normal' | 'large' | 'x-large';
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  wordSpacing: 0,
  contrastMode: 'normal',
  motionReduced: false,
  dyslexiaFont: false,
  focusIndicators: true,
  highlightLinks: false,
  paragraphSpacing: 1,
  cursorSize: 'normal'
};

interface EnhancedAccessibilityPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedAccessibilityPanel({ open, onOpenChange }: EnhancedAccessibilityPanelProps) {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<string>('text');

  // Load stored settings on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('accessibility-settings');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (error) {
        console.error('Failed to parse accessibility settings', error);
      }
    }
  }, []);

  // Apply settings to document when they change
  useEffect(() => {
    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));

    // Apply settings to document
    const root = document.documentElement;
    
    // Font size and spacing
    root.style.setProperty('--a11y-font-size', `${settings.fontSize}px`);
    root.style.setProperty('--a11y-line-height', settings.lineHeight.toString());
    root.style.setProperty('--a11y-letter-spacing', `${settings.letterSpacing}px`);
    root.style.setProperty('--a11y-word-spacing', `${settings.wordSpacing}px`);
    root.style.setProperty('--a11y-paragraph-spacing', `${settings.paragraphSpacing}em`);
    
    // Contrast modes
    document.body.classList.remove('contrast-high', 'contrast-inverted');
    if (settings.contrastMode === 'high') document.body.classList.add('contrast-high');
    if (settings.contrastMode === 'inverted') document.body.classList.add('contrast-inverted');
    
    // Reduced motion
    if (settings.motionReduced) {
      document.body.classList.add('motion-reduced');
    } else {
      document.body.classList.remove('motion-reduced');
    }
    
    // Dyslexia-friendly font
    if (settings.dyslexiaFont) {
      document.body.classList.add('font-dyslexia');
    } else {
      document.body.classList.remove('font-dyslexia');
    }
    
    // Focus indicators
    if (settings.focusIndicators) {
      document.body.classList.add('focus-visible');
    } else {
      document.body.classList.remove('focus-visible');
    }
    
    // Link highlighting
    if (settings.highlightLinks) {
      document.body.classList.add('highlight-links');
    } else {
      document.body.classList.remove('highlight-links');
    }
    
    // Cursor size
    document.body.classList.remove('cursor-large', 'cursor-x-large');
    if (settings.cursorSize === 'large') document.body.classList.add('cursor-large');
    if (settings.cursorSize === 'x-large') document.body.classList.add('cursor-x-large');
    
  }, [settings]);
  
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Accessibility Settings</DialogTitle>
          <DialogDescription>
            Customize your experience to make the site more accessible for your needs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="text" className="flex gap-2 items-center">
                <Type className="h-4 w-4" />
                <span>Text</span>
              </TabsTrigger>
              <TabsTrigger value="display" className="flex gap-2 items-center">
                <Eye className="h-4 w-4" />
                <span>Display</span>
              </TabsTrigger>
              <TabsTrigger value="motion" className="flex gap-2 items-center">
                <Sparkles className="h-4 w-4" />
                <span>Motion</span>
              </TabsTrigger>
              <TabsTrigger value="navigation" className="flex gap-2 items-center">
                <MousePointer className="h-4 w-4" />
                <span>Navigation</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Font Size ({settings.fontSize}px)</Label>
                  </div>
                  <Slider 
                    min={12} 
                    max={24} 
                    step={1}
                    value={[settings.fontSize]} 
                    onValueChange={(value) => setSettings({...settings, fontSize: value[0]})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Line Height ({settings.lineHeight.toFixed(1)})</Label>
                  </div>
                  <Slider 
                    min={1} 
                    max={2.5} 
                    step={0.1}
                    value={[settings.lineHeight]} 
                    onValueChange={(value) => setSettings({...settings, lineHeight: value[0]})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Letter Spacing ({settings.letterSpacing}px)</Label>
                  </div>
                  <Slider 
                    min={0} 
                    max={5} 
                    step={0.5}
                    value={[settings.letterSpacing]} 
                    onValueChange={(value) => setSettings({...settings, letterSpacing: value[0]})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Word Spacing ({settings.wordSpacing}px)</Label>
                  </div>
                  <Slider 
                    min={0} 
                    max={10} 
                    step={1}
                    value={[settings.wordSpacing]} 
                    onValueChange={(value) => setSettings({...settings, wordSpacing: value[0]})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Paragraph Spacing ({settings.paragraphSpacing}em)</Label>
                  </div>
                  <Slider 
                    min={0.5} 
                    max={3} 
                    step={0.25}
                    value={[settings.paragraphSpacing]} 
                    onValueChange={(value) => setSettings({...settings, paragraphSpacing: value[0]})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <Label>Dyslexia-Friendly Font</Label>
                  </div>
                  <Switch 
                    checked={settings.dyslexiaFont} 
                    onCheckedChange={(checked) => setSettings({...settings, dyslexiaFont: checked})}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="display" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={settings.contrastMode === 'normal' ? 'default' : 'outline'}
                    onClick={() => setSettings({...settings, contrastMode: 'normal'})}
                    className="flex flex-col gap-2 h-auto py-4"
                  >
                    <Eye className="h-5 w-5" />
                    <span>Normal Contrast</span>
                  </Button>
                  
                  <Button 
                    variant={settings.contrastMode === 'high' ? 'default' : 'outline'}
                    onClick={() => setSettings({...settings, contrastMode: 'high'})}
                    className="flex flex-col gap-2 h-auto py-4"
                  >
                    <ZoomIn className="h-5 w-5" />
                    <span>High Contrast</span>
                  </Button>
                  
                  <Button 
                    variant={settings.contrastMode === 'inverted' ? 'default' : 'outline'}
                    onClick={() => setSettings({...settings, contrastMode: 'inverted'})}
                    className="flex flex-col gap-2 h-auto py-4"
                  >
                    <Moon className="h-5 w-5" />
                    <span>Inverted Colors</span>
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-base font-medium">Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                      className="flex flex-col gap-2 h-auto py-4"
                    >
                      <Sun className="h-5 w-5" />
                      <span>Light</span>
                    </Button>
                    
                    <Button 
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                      className="flex flex-col gap-2 h-auto py-4"
                    >
                      <Moon className="h-5 w-5" />
                      <span>Dark</span>
                    </Button>
                    
                    <Button 
                      variant={theme === 'system' ? 'default' : 'outline'}
                      onClick={() => setTheme('system')}
                      className="flex flex-col gap-2 h-auto py-4"
                    >
                      <Monitor className="h-5 w-5" />
                      <span>System</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4" />
                    <Label>Highlight Links</Label>
                  </div>
                  <Switch 
                    checked={settings.highlightLinks} 
                    onCheckedChange={(checked) => setSettings({...settings, highlightLinks: checked})}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="motion" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Minimize className="h-4 w-4" />
                    <Label>Reduce Motion</Label>
                  </div>
                  <Switch 
                    checked={settings.motionReduced} 
                    onCheckedChange={(checked) => setSettings({...settings, motionReduced: checked})}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Turning on Reduce Motion will minimize animations and transitions throughout the site.
                </p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Motion Examples</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className={cn(
                      "p-3 bg-primary text-primary-foreground rounded transition-transform",
                      !settings.motionReduced && "hover:scale-105"
                    )}>
                      Hover Scale
                    </div>
                    
                    <div className={cn(
                      "p-3 bg-secondary rounded relative overflow-hidden",
                    )}>
                      {!settings.motionReduced && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                      )}
                      Shimmer Effect
                    </div>
                    
                    <div className={cn(
                      "p-3 bg-accent text-accent-foreground rounded",
                      !settings.motionReduced && "animate-pulse"
                    )}>
                      Pulse Animation
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="navigation" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    <Label>Enhanced Focus Indicators</Label>
                  </div>
                  <Switch 
                    checked={settings.focusIndicators} 
                    onCheckedChange={(checked) => setSettings({...settings, focusIndicators: checked})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Cursor Size</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={settings.cursorSize === 'normal' ? 'default' : 'outline'}
                      onClick={() => setSettings({...settings, cursorSize: 'normal'})}
                      className="flex flex-col gap-2 h-auto py-3"
                    >
                      <MousePointer className="h-4 w-4" />
                      <span className="text-xs">Normal</span>
                    </Button>
                    
                    <Button 
                      variant={settings.cursorSize === 'large' ? 'default' : 'outline'}
                      onClick={() => setSettings({...settings, cursorSize: 'large'})}
                      className="flex flex-col gap-2 h-auto py-3"
                    >
                      <MousePointer className="h-5 w-5" />
                      <span className="text-xs">Large</span>
                    </Button>
                    
                    <Button 
                      variant={settings.cursorSize === 'x-large' ? 'default' : 'outline'}
                      onClick={() => setSettings({...settings, cursorSize: 'x-large'})}
                      className="flex flex-col gap-2 h-auto py-3"
                    >
                      <MousePointer className="h-6 w-6" />
                      <span className="text-xs">X-Large</span>
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Navigation Tips</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Press <kbd className="px-1 bg-background border rounded text-xs">Tab</kbd> to navigate through interactive elements</li>
                    <li>Use <kbd className="px-1 bg-background border rounded text-xs">Shift+Tab</kbd> to navigate backward</li>
                    <li>Press <kbd className="px-1 bg-background border rounded text-xs">Enter</kbd> or <kbd className="px-1 bg-background border rounded text-xs">Space</kbd> to activate buttons</li>
                    <li>Press <kbd className="px-1 bg-background border rounded text-xs">Esc</kbd> to close popups and dialogs</li>
                    <li>Press <kbd className="px-1 bg-background border rounded text-xs">Cmd/Ctrl+K</kbd> to open the command palette</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="flex items-center justify-between mt-4 gap-4 flex-wrap sm:flex-nowrap">
          <ButtonPress>
            <Button variant="destructive" onClick={resetSettings}>
              Reset All Settings
            </Button>
          </ButtonPress>
          <ButtonPress>
            <Button onClick={() => onOpenChange(false)}>
              Save & Close
            </Button>
          </ButtonPress>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EnhancedAccessibilityPanel;