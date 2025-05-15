import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  EyeOff,
  ZoomIn,
  Baseline,
  PanelLeft,
  Type,
  Contrast,
  PlayCircle,
  Volume2
} from 'lucide-react';

// Define the settings types
interface AccessibilityPreferences {
  contrastMode: 'normal' | 'high' | 'very-high';
  fontScale: number;
  reduceAnimations: boolean;
  readableFont: boolean;
  focusIndicators: boolean;
  soundEffects: boolean;
  soundVolume: number;
  reducedMotion: boolean;
}

const AccessibilitySettings: React.FC = () => {
  // Initialize state with default settings
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    contrastMode: 'normal',
    fontScale: 1.0,
    reduceAnimations: false,
    readableFont: false,
    focusIndicators: true,
    soundEffects: true,
    soundVolume: 0.5,
    reducedMotion: false,
  });
  
  const { toast } = useToast();
  
  // Load saved preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('accessibilityPreferences');
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
        
        // Apply the saved settings
        applySettingsToDOM(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error);
    }
  }, []);
  
  // Apply the accessibility settings to the DOM
  const applySettingsToDOM = (settings: AccessibilityPreferences) => {
    const htmlElement = document.documentElement;
    
    // Apply font scale
    htmlElement.style.setProperty('--font-scale', String(settings.fontScale));
    
    // Apply contrast mode
    htmlElement.classList.remove('contrast-high', 'contrast-very-high');
    if (settings.contrastMode === 'high') {
      htmlElement.classList.add('contrast-high');
    } else if (settings.contrastMode === 'very-high') {
      htmlElement.classList.add('contrast-very-high');
    }
    
    // Apply reduced animations
    if (settings.reduceAnimations || settings.reducedMotion) {
      htmlElement.classList.add('reduce-motion');
    } else {
      htmlElement.classList.remove('reduce-motion');
    }
    
    // Apply readable font
    if (settings.readableFont) {
      htmlElement.classList.add('readable-font');
    } else {
      htmlElement.classList.remove('readable-font');
    }
    
    // Apply focus indicators
    if (settings.focusIndicators) {
      htmlElement.classList.add('focus-visible-enabled');
    } else {
      htmlElement.classList.remove('focus-visible-enabled');
    }
    
    // Store the sound preferences in a global variable that the sound hook can access
    window.soundEffectsEnabled = settings.soundEffects;
    window.soundEffectsVolume = settings.soundVolume;
  };
  
  // Handle changes to the settings
  const handleSettingChange = <K extends keyof AccessibilityPreferences>(
    key: K, 
    value: AccessibilityPreferences[K]
  ) => {
    const newPreferences = {
      ...preferences,
      [key]: value
    };
    
    setPreferences(newPreferences);
    localStorage.setItem('accessibilityPreferences', JSON.stringify(newPreferences));
    applySettingsToDOM(newPreferences);
  };
  
  // Reset all settings to defaults
  const handleResetToDefaults = () => {
    const defaultPreferences: AccessibilityPreferences = {
      contrastMode: 'normal',
      fontScale: 1.0,
      reduceAnimations: false,
      readableFont: false,
      focusIndicators: true,
      soundEffects: true,
      soundVolume: 0.5,
      reducedMotion: false,
    };
    
    setPreferences(defaultPreferences);
    localStorage.setItem('accessibilityPreferences', JSON.stringify(defaultPreferences));
    applySettingsToDOM(defaultPreferences);
    
    toast({
      title: "Settings Reset",
      description: "Accessibility settings have been reset to defaults.",
    });
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EyeOff className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
        <CardDescription>
          Customize your experience to meet your accessibility needs
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="visual">
          <TabsList className="mb-4 grid grid-cols-2">
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="interaction">Interaction & Sound</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="space-y-6">
            {/* Contrast Mode */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Contrast className="h-4 w-4" />
                  Contrast Mode
                </Label>
              </div>
              <RadioGroup 
                value={preferences.contrastMode} 
                onValueChange={(value) => handleSettingChange('contrastMode', value as 'normal' | 'high' | 'very-high')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="r1" />
                  <Label htmlFor="r1">Normal contrast</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="r2" />
                  <Label htmlFor="r2">High contrast</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-high" id="r3" />
                  <Label htmlFor="r3">Very high contrast</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Font Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  Text Size
                </Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(preferences.fontScale * 100)}%
                </span>
              </div>
              <Slider 
                value={[preferences.fontScale * 100]} 
                min={80} 
                max={150} 
                step={5}
                onValueChange={(value) => handleSettingChange('fontScale', value[0] / 100)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Small</span>
                <span>Medium</span>
                <span>Large</span>
              </div>
            </div>
            
            {/* Readable Font */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="readable-font" className="flex items-center gap-2 cursor-pointer">
                <Type className="h-4 w-4" />
                Use more readable font
              </Label>
              <Switch 
                id="readable-font" 
                checked={preferences.readableFont} 
                onCheckedChange={(checked) => handleSettingChange('readableFont', checked)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="interaction" className="space-y-6">
            {/* Reduce Animations */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="reduce-animations" className="flex items-center gap-2 cursor-pointer">
                <Baseline className="h-4 w-4" />
                Reduce animations
              </Label>
              <Switch 
                id="reduce-animations" 
                checked={preferences.reduceAnimations} 
                onCheckedChange={(checked) => handleSettingChange('reduceAnimations', checked)}
              />
            </div>
            
            {/* Reduced Motion */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="reduced-motion" className="flex items-center gap-2 cursor-pointer">
                <PanelLeft className="h-4 w-4" />
                Respect reduced motion preferences
              </Label>
              <Switch 
                id="reduced-motion" 
                checked={preferences.reducedMotion} 
                onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
              />
            </div>
            
            {/* Focus Indicators */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="focus-indicators" className="flex items-center gap-2 cursor-pointer">
                <PlayCircle className="h-4 w-4" />
                Show focus indicators
              </Label>
              <Switch 
                id="focus-indicators" 
                checked={preferences.focusIndicators} 
                onCheckedChange={(checked) => handleSettingChange('focusIndicators', checked)}
              />
            </div>
            
            {/* Sound Effects */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="sound-effects" className="flex items-center gap-2 cursor-pointer">
                <Volume2 className="h-4 w-4" />
                Enable sound effects
              </Label>
              <Switch 
                id="sound-effects" 
                checked={preferences.soundEffects} 
                onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
              />
            </div>
            
            {/* Sound Volume */}
            {preferences.soundEffects && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Sound Volume</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(preferences.soundVolume * 100)}%
                  </span>
                </div>
                <Slider 
                  value={[preferences.soundVolume * 100]} 
                  min={0} 
                  max={100} 
                  step={5}
                  onValueChange={(value) => handleSettingChange('soundVolume', value[0] / 100)}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleResetToDefaults}
        >
          Reset to Defaults
        </Button>
        <Button 
          onClick={() => {
            toast({
              title: "Settings Saved",
              description: "Your accessibility preferences have been saved.",
            });
          }}
        >
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

// Declare the window interface to add our global variables
declare global {
  interface Window {
    soundEffectsEnabled?: boolean;
    soundEffectsVolume?: number;
  }
}

export default AccessibilitySettings;