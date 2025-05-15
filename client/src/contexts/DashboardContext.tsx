import React, { createContext, useContext, useState, useEffect } from 'react';

// Widget types
export type WidgetType = 
  | 'recent-courses'
  | 'progress'
  | 'recommendations'
  | 'achievements'
  | 'calendar'
  | 'news'
  | 'forum'
  | 'analytics'
  | 'notes'
  | 'todo'
  | 'subscription'
  | 'certifications'
  | 'recent-tools'
  | 'favorite-courses'
  | 'upcoming-events';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  size: WidgetSize;
  position: number;
  config?: any;
}

// Dashboard layout types
export type LayoutType = 'grid' | 'list' | 'masonry';

export interface DashboardLayout {
  type: LayoutType;
  columns: number;
}

// Context state interface
interface DashboardState {
  widgets: Widget[];
  layout: DashboardLayout;
  availableWidgets: Widget[];
  isCustomizing: boolean;
}

// Context actions interface
interface DashboardActions {
  addWidget: (widgetType: WidgetType) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<Omit<Widget, 'id' | 'type'>>) => void;
  reorderWidgets: (startIndex: number, endIndex: number) => void;
  setLayout: (layout: Partial<DashboardLayout>) => void;
  setIsCustomizing: (isCustomizing: boolean) => void;
  resetDashboard: () => void;
}

// Combined context type
type DashboardContextType = DashboardState & DashboardActions;

// Default context state
const defaultContext: DashboardContextType = {
  widgets: [],
  layout: { type: 'grid', columns: 3 },
  availableWidgets: [],
  isCustomizing: false,
  addWidget: () => {},
  removeWidget: () => {},
  updateWidget: () => {},
  reorderWidgets: () => {},
  setLayout: () => {},
  setIsCustomizing: () => {},
  resetDashboard: () => {},
};

// Create the context
const DashboardContext = createContext<DashboardContextType>(defaultContext);

// Default available widgets
const DEFAULT_AVAILABLE_WIDGETS: Widget[] = [
  {
    id: 'template-recent-courses',
    type: 'recent-courses',
    title: 'Recent Courses',
    description: 'Shows your recently accessed courses',
    size: 'medium',
    position: -1,
  },
  {
    id: 'template-progress',
    type: 'progress',
    title: 'Learning Progress',
    description: 'Track your overall learning progress',
    size: 'medium',
    position: -1,
  },
  {
    id: 'template-recommendations',
    type: 'recommendations',
    title: 'Recommended for You',
    description: 'AI-powered course and resource recommendations',
    size: 'medium',
    position: -1,
  },
  {
    id: 'template-achievements',
    type: 'achievements',
    title: 'Achievements',
    description: 'View your recent achievements and badges',
    size: 'small',
    position: -1,
  },
  {
    id: 'template-calendar',
    type: 'calendar',
    title: 'Calendar',
    description: 'Upcoming courses, deadlines and events',
    size: 'medium',
    position: -1,
  },
  {
    id: 'template-news',
    type: 'news',
    title: 'AI News & Updates',
    description: 'Latest AI news and platform updates',
    size: 'medium',
    position: -1,
  },
  {
    id: 'template-forum',
    type: 'forum',
    title: 'Community Discussions',
    description: 'Recent forum posts and discussions',
    size: 'medium',
    position: -1,
  },
  {
    id: 'template-analytics',
    type: 'analytics',
    title: 'Learning Analytics',
    description: 'Insights into your learning patterns',
    size: 'large',
    position: -1,
  },
  {
    id: 'template-notes',
    type: 'notes',
    title: 'Notes',
    description: 'Your recent notes from courses',
    size: 'medium',
    position: -1,
  },
  {
    id: 'template-todo',
    type: 'todo',
    title: 'To-Do List',
    description: 'Track your learning tasks and deadlines',
    size: 'small',
    position: -1,
  },
  {
    id: 'template-subscription',
    type: 'subscription',
    title: 'Subscription',
    description: 'Information about your current subscription',
    size: 'small',
    position: -1,
  },
  {
    id: 'template-certifications',
    type: 'certifications',
    title: 'Certifications',
    description: 'Track your certifications and progress',
    size: 'medium',
    position: -1,
  },
  {
    id: 'template-recent-tools',
    type: 'recent-tools',
    title: 'Recent Tools',
    description: 'Quick access to your recently used AI tools',
    size: 'small',
    position: -1,
  },
  {
    id: 'template-favorite-courses',
    type: 'favorite-courses',
    title: 'Favorite Courses',
    description: 'Your favorite and pinned courses',
    size: 'medium',
    position: -1,
  },
  {
    id: 'template-upcoming-events',
    type: 'upcoming-events',
    title: 'Upcoming Events',
    description: 'Upcoming live sessions and events',
    size: 'medium',
    position: -1,
  },
];

// Default dashboard widgets
const DEFAULT_DASHBOARD_WIDGETS: Widget[] = [
  {
    id: 'default-recent-courses',
    type: 'recent-courses',
    title: 'Recent Courses',
    description: 'Shows your recently accessed courses',
    size: 'medium',
    position: 0,
  },
  {
    id: 'default-progress',
    type: 'progress',
    title: 'Learning Progress',
    description: 'Track your overall learning progress',
    size: 'medium',
    position: 1,
  },
  {
    id: 'default-recommendations',
    type: 'recommendations',
    title: 'Recommended for You',
    description: 'AI-powered course and resource recommendations',
    size: 'medium',
    position: 2,
  },
  {
    id: 'default-upcoming-events',
    type: 'upcoming-events',
    title: 'Upcoming Events',
    description: 'Upcoming live sessions and events',
    size: 'small',
    position: 3,
  },
];

// Create the provider component
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [layout, setLayoutState] = useState<DashboardLayout>({ type: 'grid', columns: 3 });
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // Initialize dashboard on first load
  useEffect(() => {
    // In a real app, we would fetch user's dashboard from API
    // For now, use default widgets
    setWidgets(DEFAULT_DASHBOARD_WIDGETS);
    setAvailableWidgets(DEFAULT_AVAILABLE_WIDGETS);
    
    // Load from localStorage if available
    const savedDashboard = localStorage.getItem('rxai-dashboard');
    if (savedDashboard) {
      try {
        const parsed = JSON.parse(savedDashboard);
        if (parsed.widgets && Array.isArray(parsed.widgets)) {
          setWidgets(parsed.widgets);
        }
        if (parsed.layout) {
          setLayoutState(parsed.layout);
        }
      } catch (error) {
        console.error('Failed to parse saved dashboard:', error);
      }
    }
  }, []);
  
  // Save dashboard to localStorage when it changes
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem('rxai-dashboard', JSON.stringify({
        widgets,
        layout,
      }));
    }
  }, [widgets, layout]);
  
  // Actions
  const addWidget = (widgetType: WidgetType) => {
    const templateWidget = availableWidgets.find(w => w.type === widgetType);
    if (!templateWidget) return;
    
    const newWidget: Widget = {
      ...templateWidget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: widgets.length,
    };
    
    setWidgets(prev => [...prev, newWidget]);
  };
  
  const removeWidget = (widgetId: string) => {
    setWidgets(prev => {
      const filtered = prev.filter(w => w.id !== widgetId);
      // Reposition remaining widgets
      return filtered.map((widget, index) => ({
        ...widget,
        position: index,
      }));
    });
  };
  
  const updateWidget = (widgetId: string, updates: Partial<Omit<Widget, 'id' | 'type'>>) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, ...updates } 
          : widget
      )
    );
  };
  
  const reorderWidgets = (startIndex: number, endIndex: number) => {
    setWidgets(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Update positions after reordering
      return result.map((widget, index) => ({
        ...widget,
        position: index,
      }));
    });
  };
  
  const setLayout = (layoutUpdates: Partial<DashboardLayout>) => {
    setLayoutState(prev => ({ ...prev, ...layoutUpdates }));
  };
  
  const resetDashboard = () => {
    setWidgets(DEFAULT_DASHBOARD_WIDGETS);
    setLayoutState({ type: 'grid', columns: 3 });
  };
  
  // Combine state and actions for context value
  const contextValue: DashboardContextType = {
    widgets,
    layout,
    availableWidgets,
    isCustomizing,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    setLayout,
    setIsCustomizing,
    resetDashboard,
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook for using the dashboard context
export const useDashboard = () => useContext(DashboardContext);