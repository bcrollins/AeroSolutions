import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Pencil, 
  Save, 
  RefreshCw, 
  Sliders, 
  LayoutGrid, 
  RotateCcw, 
  X, 
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboard, Widget, WidgetType } from '@/contexts/DashboardContext';
import DashboardWidget from './DashboardWidget';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import DashboardSkeleton from './DashboardSkeleton';
import WidgetPicker from './WidgetPicker';
import WidgetRenderer from './WidgetRenderer';
import DashboardCustomizer from './DashboardCustomizer';
import ErrorBoundary from '@/components/ErrorHandling/ErrorBoundary';

/**
 * PersonalizedDashboard - Main dashboard component that displays and manages widgets
 */
const PersonalizedDashboard: React.FC = () => {
  const { layout, theme, preferences, isEditing, setEditing, resetLayout } = useDashboard();
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useAuth();
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh action
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
    toast({
      title: 'Dashboard refreshed',
      description: 'All widgets have been updated with the latest data.',
    });
  };

  // Handle reset layout action
  const handleResetLayout = () => {
    if (confirm('Are you sure you want to reset your dashboard layout? This cannot be undone.')) {
      resetLayout();
      toast({
        title: 'Dashboard reset',
        description: 'Your dashboard has been reset to the default layout.',
      });
    }
  };

  // Set up auto-refresh interval if enabled
  useEffect(() => {
    if (preferences.autoRefresh && preferences.refreshInterval > 0) {
      const intervalId = setInterval(
        handleRefresh, 
        preferences.refreshInterval * 60 * 1000
      );
      
      return () => clearInterval(intervalId);
    }
  }, [preferences.autoRefresh, preferences.refreshInterval]);

  // Show loading state while user data is loading
  if (isUserLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {preferences.showWelcomeMessage && user ? 
              `Welcome back, ${user.firstName || 'there'}!` : 
              'Your Dashboard'
            }
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 
              'Customize your dashboard by reordering, resizing, or removing widgets.' : 
              'View and manage your personalized learning experience.'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsAddWidgetOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add Widget
              </Button>
              
              <Button 
                variant="default" 
                onClick={() => setEditing(false)}
              >
                <Save className="h-4 w-4 mr-1.5" /> Save Layout
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setEditing(false)}
              >
                <X className="h-4 w-4 mr-1.5" /> Cancel
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                Refresh
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-1.5" /> Customize
              </Button>
              
              <Sheet open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost">
                    <Sliders className="h-4 w-4 mr-1.5" /> Settings
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[350px] sm:w-[450px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Dashboard Settings</SheetTitle>
                    <SheetDescription>
                      Customize your dashboard appearance and behavior.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-6">
                    <DashboardCustomizer onClose={() => setIsCustomizeOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button 
                variant="ghost" 
                onClick={handleResetLayout}
                className="text-destructive hover:text-destructive/90"
              >
                <RotateCcw className="h-4 w-4 mr-1.5" /> Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Widget Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-${layout.columns} gap-4 mb-8`}>
        {layout.widgets
          .filter(widget => widget.visible)
          .sort((a, b) => a.position - b.position)
          .map(widget => (
            <ErrorBoundary key={widget.id}>
              <WidgetRenderer widget={widget} />
            </ErrorBoundary>
          ))}
        
        {isEditing && layout.widgets.length === 0 && (
          <div className="col-span-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center">
            <LayoutGrid className="h-8 w-8 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No widgets added yet</h3>
            <p className="text-muted-foreground mb-4">
              Add widgets to customize your dashboard experience.
            </p>
            <Button onClick={() => setIsAddWidgetOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Your First Widget
            </Button>
          </div>
        )}
      </div>

      {/* Add Widget Dialog */}
      <Sheet open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
        <SheetContent side="right" className="w-[350px] sm:w-[550px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Widgets</SheetTitle>
            <SheetDescription>
              Select widgets to add to your dashboard.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            <WidgetPicker onClose={() => setIsAddWidgetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PersonalizedDashboard;