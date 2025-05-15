import React from 'react';
import { ThemePreferencesPanel, ThemePreferencesPopover } from '@/components/UI/ThemePreferencesPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Settings, Paintbrush, Moon, Sun, Laptop, Zap } from 'lucide-react';
import { FadeIn } from '@/components/UI/MicroInteractions';

/**
 * ThemePreferencesDemo - A page that demonstrates the ThemePreferencesPanel functionality
 */
const ThemePreferencesDemo: React.FC = () => {
  const { preferences, setTheme, getCurrentTheme } = useTheme();
  
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <FadeIn>
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Theme Preferences</h1>
            <p className="text-lg text-muted-foreground">
              Customize your experience with our advanced theme preferences panel
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <ThemePreferencesPanel />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Current Settings
                  </CardTitle>
                  <CardDescription>
                    Your active theme preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {preferences.theme === 'light' && <Sun className="mr-2 h-4 w-4" />}
                        {preferences.theme === 'dark' && <Moon className="mr-2 h-4 w-4" />}
                        {preferences.theme === 'system' && <Laptop className="mr-2 h-4 w-4" />}
                        <span>Theme</span>
                      </div>
                      <span className="capitalize">{preferences.theme}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Paintbrush className="mr-2 h-4 w-4" />
                        <span>Accent Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{preferences.accent}</span>
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ 
                            backgroundColor: 
                              preferences.accent === 'blue' ? '#0066cc' :
                              preferences.accent === 'purple' ? '#6633cc' :
                              preferences.accent === 'green' ? '#00b371' :
                              preferences.accent === 'orange' ? '#ff8800' :
                              preferences.accent === 'pink' ? '#ff3366' : 
                              '#0066cc'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Font Size</span>
                      <span className="capitalize">{preferences.fontSize}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Reduce Motion</span>
                      <span>{preferences.reduceMotion ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>High Contrast</span>
                      <span>{preferences.highContrast ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Corner Radius</span>
                      <span className="capitalize">{preferences.cornerRadius}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Current theme: <span className="font-semibold capitalize">{getCurrentTheme()}</span>
                    </span>
                    <ThemePreferencesPopover 
                      trigger={
                        <Button variant="secondary" size="sm">
                          <Paintbrush className="mr-2 h-4 w-4" />
                          Customize
                        </Button>
                      } 
                    />
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Theme Toggle</CardTitle>
                  <CardDescription>
                    Switch between light and dark themes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant={getCurrentTheme() === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                      className="flex-1"
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </Button>
                    <Button 
                      variant={getCurrentTheme() === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                      className="flex-1"
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Pro Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Use the <kbd className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded border">Cmd</kbd> + <kbd className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded border">K</kbd> shortcut to access the command palette, where you can quickly change theme settings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default ThemePreferencesDemo;