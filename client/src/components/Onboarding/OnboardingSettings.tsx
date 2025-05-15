import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Lightbulb, Info, Keyboard, HelpCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingSettingsProps {
  className?: string;
}

/**
 * OnboardingSettings - Component for configuring onboarding preferences
 */
const OnboardingSettings: React.FC<OnboardingSettingsProps> = ({ className }) => {
  const { 
    preferences, 
    updatePreferences, 
    allFlows, 
    startFlow,
    isFlowCompleted,
    resetOnboarding
  } = useOnboarding();
  
  const { toast } = useToast();
  
  // Handle global setting toggle
  const handleSettingToggle = (key: keyof typeof preferences) => {
    if (typeof preferences[key] === 'boolean') {
      updatePreferences({
        [key]: !preferences[key as keyof typeof preferences]
      });
    }
  };
  
  // Handle onboarding restart
  const handleRestartOnboarding = () => {
    resetOnboarding();
    toast({
      title: 'Onboarding reset',
      description: 'All onboarding progress has been reset. You can now restart any guide.',
    });
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">Onboarding Settings</CardTitle>
        <CardDescription>
          Customize your learning journey through the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Preferences */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">General Preferences</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Show Onboarding Guides</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Display interactive tutorials and guides
              </p>
            </div>
            <Switch 
              checked={preferences.showOnboarding}
              onCheckedChange={() => handleSettingToggle('showOnboarding')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Show Hints</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Display helpful hints while using the platform
              </p>
            </div>
            <Switch 
              checked={preferences.showHints}
              onCheckedChange={() => handleSettingToggle('showHints')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Keyboard className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Show Keyboard Shortcuts</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Display available keyboard shortcuts
              </p>
            </div>
            <Switch 
              checked={preferences.showKeyboardShortcuts}
              onCheckedChange={() => handleSettingToggle('showKeyboardShortcuts')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Enable Tooltips</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Show tooltips when hovering over UI elements
              </p>
            </div>
            <Switch 
              checked={preferences.enableTooltips}
              onCheckedChange={() => handleSettingToggle('enableTooltips')}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Available Guides */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Available Guides</h3>
          <div className="space-y-3">
            {allFlows.map((flow) => (
              <div key={flow.id} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <span className="font-medium">{flow.title}</span>
                    {isFlowCompleted(flow.id) && (
                      <Badge variant="secondary" className="ml-2">Completed</Badge>
                    )}
                  </div>
                  {flow.description && (
                    <p className="text-sm text-muted-foreground">
                      {flow.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startFlow(flow.id)}
                >
                  {isFlowCompleted(flow.id) ? 'Revisit' : 'Start'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          variant="outline" 
          className="ml-auto flex items-center"
          onClick={handleRestartOnboarding}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Reset All Onboarding
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingSettings;