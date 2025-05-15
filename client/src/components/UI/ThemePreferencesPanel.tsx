import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Laptop,
  Moon,
  Sun,
  Paintbrush,
  Type,
  Eye,
  Square,
  SquareAsterisk,
  RotateCcw,
  SquareCode,
  ZoomIn
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn, ScaleIn } from './MicroInteractions';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * ThemePreferencesPanel - A customizable theme preferences panel
 * that allows users to customize their experience.
 */
export const ThemePreferencesPanel: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { 
    preferences, 
    setTheme, 
    setAccent, 
    setFontSize, 
    setReduceMotion, 
    setHighContrast,
    setCornerRadius,
    resetPreferences
  } = useTheme();

  // Theme selection options
  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun size={18} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={18} /> },
    { value: 'system', label: 'System', icon: <Laptop size={18} /> }
  ];

  // Accent color options
  const accentOptions = [
    { value: 'blue', label: 'Blue', color: '#0066cc' },
    { value: 'purple', label: 'Purple', color: '#6633cc' },
    { value: 'green', label: 'Green', color: '#00b371' },
    { value: 'orange', label: 'Orange', color: '#ff8800' },
    { value: 'pink', label: 'Pink', color: '#ff3366' },
    { value: 'default', label: 'Default', color: '#0066cc' }
  ];

  // Font size options
  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'x-large', label: 'X-Large' }
  ];

  // Corner radius options
  const cornerRadiusOptions = [
    { value: 'none', label: 'None' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  return (
    <FadeIn className={cn("w-full", className)}>
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium flex items-center">
              <Paintbrush className="mr-2 h-5 w-5" />
              Appearance
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPreferences}
              className="text-xs"
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          <Tabs defaultValue="theme" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Color Scheme</label>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={preferences.theme === option.value ? "default" : "outline"}
                      className={cn("justify-start gap-2", 
                        preferences.theme === option.value ? "border-primary" : ""
                      )}
                      onClick={() => setTheme(option.value as any)}
                    >
                      {option.icon}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Accent Color</label>
                <div className="grid grid-cols-6 gap-3">
                  {accentOptions.map((option) => (
                    <button
                      key={option.value}
                      className={cn(
                        "w-full aspect-square rounded-md flex items-center justify-center",
                        preferences.accent === option.value
                          ? "ring-2 ring-offset-2 ring-primary"
                          : "ring-1 ring-inset ring-border hover:ring-primary/50"
                      )}
                      style={{ backgroundColor: option.color }}
                      onClick={() => setAccent(option.value as any)}
                      title={option.label}
                    >
                      {preferences.accent === option.value && (
                        <ScaleIn>
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </ScaleIn>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium flex items-center">
                  <Type className="mr-2 h-4 w-4" />
                  Font Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {fontSizeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={preferences.fontSize === option.value ? "default" : "outline"}
                      className={preferences.fontSize === option.value ? "border-primary" : ""}
                      onClick={() => setFontSize(option.value as any)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-sm text-muted-foreground">Text Preview</p>
                <Card className="border p-4">
                  <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                    Heading 1
                  </h1>
                  <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors mb-4">
                    Heading 2
                  </h2>
                  <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3">
                    Heading 3
                  </h3>
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2">
                    Heading 4
                  </h4>
                  <p className="leading-7 mb-4">
                    This is a paragraph of text that should be long enough to wrap to the
                    next line. We can use this to see how the font size affects readability.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This is smaller text often used for captions or supporting information.
                  </p>
                </Card>
              </div>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      High Contrast
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Increase contrast between elements
                    </p>
                  </div>
                  <Switch
                    checked={preferences.highContrast}
                    onCheckedChange={setHighContrast}
                  />
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium flex items-center">
                      <SquareAsterisk className="mr-2 h-4 w-4" />
                      Reduce Motion
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    checked={preferences.reduceMotion}
                    onCheckedChange={setReduceMotion}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium flex items-center">
                  <SquareCorners className="mr-2 h-4 w-4" />
                  Corner Radius
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {cornerRadiusOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={preferences.cornerRadius === option.value ? "default" : "outline"}
                      className={preferences.cornerRadius === option.value ? "border-primary" : ""}
                      onClick={() => setCornerRadius(option.value as any)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">UI Component Preview</p>
                <Card className="border p-4 grid grid-cols-2 gap-4">
                  <Button>Primary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-2 block">
                      Slider Example
                    </label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </FadeIn>
  );
};

/**
 * ThemePreferencesPopover - A theme preferences panel in a popover
 */
export const ThemePreferencesPopover: React.FC<{
  trigger?: React.ReactNode;
}> = ({ trigger }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <Paintbrush className="h-5 w-5" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="end">
        <ThemePreferencesPanel />
      </PopoverContent>
    </Popover>
  );
};

export default ThemePreferencesPanel;