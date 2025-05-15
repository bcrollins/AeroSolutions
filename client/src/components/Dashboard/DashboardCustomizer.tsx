import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutGrid, 
  Palette, 
  Settings, 
  Check, 
  Sun, 
  Moon, 
  Laptop, 
  Columns
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface DashboardCustomizerProps {
  onClose?: () => void;
}

// Form schema for layout settings
const layoutFormSchema = z.object({
  columns: z.coerce.number().min(1).max(4),
});

// Form schema for theme settings
const themeFormSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']),
  accentColor: z.string(),
  showGradients: z.boolean(),
  reduceMotion: z.boolean(),
  compactMode: z.boolean(),
});

// Form schema for preferences
const preferencesFormSchema = z.object({
  showWelcomeMessage: z.boolean(),
  autoRefresh: z.boolean(),
  refreshInterval: z.coerce.number().min(1).max(60),
  defaultView: z.enum(['grid', 'list']),
});

/**
 * DashboardCustomizer - Component for customizing dashboard settings
 */
const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({ onClose }) => {
  const { layout, theme, preferences, updateLayout, updateTheme, updatePreferences } = useDashboard();
  const { toast } = useToast();
  
  // Form for layout settings
  const layoutForm = useForm<z.infer<typeof layoutFormSchema>>({
    resolver: zodResolver(layoutFormSchema),
    defaultValues: {
      columns: layout.columns,
    },
  });
  
  // Form for theme settings
  const themeForm = useForm<z.infer<typeof themeFormSchema>>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      mode: theme.mode,
      accentColor: theme.accentColor,
      showGradients: theme.showGradients,
      reduceMotion: theme.reduceMotion,
      compactMode: theme.compactMode,
    },
  });
  
  // Form for preferences
  const preferencesForm = useForm<z.infer<typeof preferencesFormSchema>>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      showWelcomeMessage: preferences.showWelcomeMessage,
      autoRefresh: preferences.autoRefresh,
      refreshInterval: preferences.refreshInterval,
      defaultView: preferences.defaultView,
    },
  });
  
  // Submit handler for layout form
  const onLayoutSubmit = (data: z.infer<typeof layoutFormSchema>) => {
    updateLayout({ columns: data.columns });
    toast({
      title: 'Layout updated',
      description: 'Your dashboard layout settings have been updated.',
    });
    if (onClose) onClose();
  };
  
  // Submit handler for theme form
  const onThemeSubmit = (data: z.infer<typeof themeFormSchema>) => {
    updateTheme(data);
    toast({
      title: 'Theme updated',
      description: 'Your dashboard theme settings have been updated.',
    });
    if (onClose) onClose();
  };
  
  // Submit handler for preferences form
  const onPreferencesSubmit = (data: z.infer<typeof preferencesFormSchema>) => {
    updatePreferences(data);
    toast({
      title: 'Preferences updated',
      description: 'Your dashboard preferences have been updated.',
    });
    if (onClose) onClose();
  };
  
  return (
    <Tabs defaultValue="layout">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="layout">
          <LayoutGrid className="h-4 w-4 mr-1.5" /> Layout
        </TabsTrigger>
        <TabsTrigger value="theme">
          <Palette className="h-4 w-4 mr-1.5" /> Theme
        </TabsTrigger>
        <TabsTrigger value="preferences">
          <Settings className="h-4 w-4 mr-1.5" /> Preferences
        </TabsTrigger>
      </TabsList>
      
      {/* Layout Settings */}
      <TabsContent value="layout">
        <Form {...layoutForm}>
          <form onSubmit={layoutForm.handleSubmit(onLayoutSubmit)} className="space-y-6">
            <FormField
              control={layoutForm.control}
              name="columns"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Dashboard Columns</FormLabel>
                  <FormDescription>
                    Choose how many columns to display on your dashboard.
                  </FormDescription>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm" htmlFor="columns-stepper">Columns: {field.value}</Label>
                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => field.onChange(Math.max(1, field.value - 1))}
                          disabled={field.value <= 1}
                        >
                          -
                        </Button>
                        <div className="px-2 h-8 flex items-center justify-center border-y bg-background">
                          {field.value}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => field.onChange(Math.min(4, field.value + 1))}
                          disabled={field.value >= 4}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((cols) => (
                        <Button
                          key={cols}
                          type="button"
                          variant={field.value === cols ? "default" : "outline"}
                          className="h-20 p-0"
                          onClick={() => field.onChange(cols)}
                        >
                          <div className="w-full h-full flex flex-col justify-center items-center">
                            <div className="grid grid-cols-4 gap-1 p-2" style={{ opacity: field.value === cols ? 1 : 0.6 }}>
                              {Array.from({ length: 8 }).map((_, i) => (
                                <div 
                                  key={i}
                                  className={`bg-primary/40 rounded-sm ${i < 8 / cols ? `col-span-${cols}` : 'col-span-1'}`}
                                  style={{ height: '6px' }}
                                />
                              ))}
                            </div>
                            <span className="text-xs mt-1">{cols} Column{cols > 1 ? 's' : ''}</span>
                            {field.value === cols && (
                              <Check className="h-3 w-3 absolute bottom-2 right-2 text-primary" />
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">Save Layout Settings</Button>
          </form>
        </Form>
      </TabsContent>
      
      {/* Theme Settings */}
      <TabsContent value="theme">
        <Form {...themeForm}>
          <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-6">
            <FormField
              control={themeForm.control}
              name="mode"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Color Mode</FormLabel>
                  <FormDescription>
                    Choose your preferred color theme.
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4 pt-2"
                    >
                      <div>
                        <RadioGroupItem
                          value="light"
                          id="theme-light"
                          className="sr-only"
                        />
                        <Label
                          htmlFor="theme-light"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                            field.value === "light" ? "border-primary" : ""
                          }`}
                        >
                          <Sun className="h-5 w-5 mb-2" />
                          <span className="text-sm font-medium">Light</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="dark"
                          id="theme-dark"
                          className="sr-only"
                        />
                        <Label
                          htmlFor="theme-dark"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                            field.value === "dark" ? "border-primary" : ""
                          }`}
                        >
                          <Moon className="h-5 w-5 mb-2" />
                          <span className="text-sm font-medium">Dark</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="system"
                          id="theme-system"
                          className="sr-only"
                        />
                        <Label
                          htmlFor="theme-system"
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                            field.value === "system" ? "border-primary" : ""
                          }`}
                        >
                          <Laptop className="h-5 w-5 mb-2" />
                          <span className="text-sm font-medium">System</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={themeForm.control}
              name="accentColor"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Accent Color</FormLabel>
                  <FormDescription>
                    Choose the primary color for your dashboard.
                  </FormDescription>
                  <FormControl>
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {[
                        { name: 'Blue', value: '#0066cc' },
                        { name: 'Purple', value: '#8a63d2' },
                        { name: 'Pink', value: '#e83e8c' },
                        { name: 'Red', value: '#dc3545' },
                        { name: 'Orange', value: '#fd7e14' },
                        { name: 'Yellow', value: '#ffc107' },
                        { name: 'Green', value: '#28a745' },
                        { name: 'Teal', value: '#20c997' },
                        { name: 'Cyan', value: '#17a2b8' },
                        { name: 'Gray', value: '#6c757d' },
                      ].map((color) => (
                        <Button
                          key={color.value}
                          type="button"
                          variant="outline"
                          className={`h-10 p-0 rounded-md ${
                            field.value === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
                          }`}
                          onClick={() => field.onChange(color.value)}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                      <div className="col-span-5 pt-2">
                        <Input
                          type="color"
                          {...field}
                          className="h-10 w-full"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <div className="space-y-4">
              <FormField
                control={themeForm.control}
                name="showGradients"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Show Gradients</FormLabel>
                      <FormDescription>
                        Enable subtle gradient effects on widgets.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={themeForm.control}
                name="reduceMotion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Reduce Motion</FormLabel>
                      <FormDescription>
                        Minimize animations for better accessibility.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={themeForm.control}
                name="compactMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Compact Mode</FormLabel>
                      <FormDescription>
                        Display more content with reduced spacing.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full">Save Theme Settings</Button>
          </form>
        </Form>
      </TabsContent>
      
      {/* Preferences Settings */}
      <TabsContent value="preferences">
        <Form {...preferencesForm}>
          <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={preferencesForm.control}
                name="showWelcomeMessage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Welcome Message</FormLabel>
                      <FormDescription>
                        Show personalized welcome message on the dashboard.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={preferencesForm.control}
                name="autoRefresh"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Auto-Refresh Dashboard</FormLabel>
                      <FormDescription>
                        Periodically refresh dashboard content.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {preferencesForm.watch('autoRefresh') && (
                <FormField
                  control={preferencesForm.control}
                  name="refreshInterval"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Refresh Interval (minutes)</FormLabel>
                      <FormDescription className="flex justify-between items-center">
                        <span>How often to refresh dashboard data.</span>
                        <span className="font-medium">{field.value} min</span>
                      </FormDescription>
                      <FormControl>
                        <Slider
                          min={1}
                          max={60}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="pt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={preferencesForm.control}
                name="defaultView"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Default Widget View</FormLabel>
                    <FormDescription>
                      Choose the default layout for widgets.
                    </FormDescription>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a view" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="grid">
                          <div className="flex items-center">
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            <span>Grid View</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="list">
                          <div className="flex items-center">
                            <Columns className="h-4 w-4 mr-2" />
                            <span>List View</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full">Save Preferences</Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardCustomizer;