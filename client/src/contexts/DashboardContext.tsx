import React, { createContext, useContext, useState, useEffect } from 'react';

// Define widget types and layout settings
export type WidgetType = 
  | 'recentCourses' 
  | 'progress' 
  | 'achievements' 
  | 'recommendations' 
  | 'calendar' 
  | 'news' 
  | 'forum' 
  | 'analytics' 
  | 'notes' 
  | 'todo' 
  | 'subscription' 
  | 'certifications'
  | 'recentTools'
  | 'favouriteCourses'
  | 'upcomingEvents';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number;
  visible: boolean;
  config?: Record<string, any>;
}

export interface DashboardLayout {
  columns: number;
  widgets: Widget[];
}

export interface DashboardTheme {
  mode: 'light' | 'dark' | 'system';
  accentColor: string;
  showGradients: boolean;
  reduceMotion: boolean;
  compactMode: boolean;
}

export interface DashboardPreferences {
  showWelcomeMessage: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  defaultView: 'grid' | 'list';
  hiddenSections: string[];
}

// Default dashboard settings
const defaultLayout: DashboardLayout = {
  columns: 3,
  widgets: [
    {
      id: 'recent-courses',
      type: 'recentCourses',
      title: 'Recent Courses',
      size: 'medium',
      position: 0,
      visible: true,
    },
    {
      id: 'progress',
      type: 'progress',
      title: 'Your Progress',
      size: 'medium',
      position: 1,
      visible: true,
    },
    {
      id: 'recommendations',
      type: 'recommendations',
      title: 'Recommended For You',
      size: 'large',
      position: 2,
      visible: true,
    },
    {
      id: 'achievements',
      type: 'achievements',
      title: 'Achievements',
      size: 'small',
      position: 3,
      visible: true,
    },
    {
      id: 'calendar',
      type: 'calendar',
      title: 'Your Schedule',
      size: 'medium',
      position: 4,
      visible: true,
    },
    {
      id: 'news',
      type: 'news',
      title: 'AI News',
      size: 'medium',
      position: 5,
      visible: true,
    },
    {
      id: 'forum',
      type: 'forum',
      title: 'Recent Discussions',
      size: 'medium',
      position: 6,
      visible: true,
    },
  ],
};

const defaultTheme: DashboardTheme = {
  mode: 'system',
  accentColor: '#0066cc',
  showGradients: true,
  reduceMotion: false,
  compactMode: false,
};

const defaultPreferences: DashboardPreferences = {
  showWelcomeMessage: true,
  autoRefresh: true,
  refreshInterval: 5,
  defaultView: 'grid',
  hiddenSections: [],
};

// Create context types
interface DashboardContextType {
  layout: DashboardLayout;
  theme: DashboardTheme;
  preferences: DashboardPreferences;
  isEditing: boolean;
  isCustomizing: boolean;
  updateLayout: (newLayout: Partial<DashboardLayout>) => void;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
  addWidget: (widget: Omit<Widget, 'id' | 'position'>) => void;
  removeWidget: (widgetId: string) => void;
  reorderWidgets: (widgetIds: string[]) => void;
  resetLayout: () => void;
  updateTheme: (newTheme: Partial<DashboardTheme>) => void;
  updatePreferences: (newPreferences: Partial<DashboardPreferences>) => void;
  setEditing: (editing: boolean) => void;
  setCustomizing: (customizing: boolean) => void;
}

// Create context with default values
const DashboardContext = createContext<DashboardContextType>({
  layout: defaultLayout,
  theme: defaultTheme,
  preferences: defaultPreferences,
  isEditing: false,
  isCustomizing: false,
  updateLayout: () => {},
  updateWidget: () => {},
  addWidget: () => {},
  removeWidget: () => {},
  reorderWidgets: () => {},
  resetLayout: () => {},
  updateTheme: () => {},
  updatePreferences: () => {},
  setEditing: () => {},
  setCustomizing: () => {},
});

// Storage keys for persisting dashboard settings
const STORAGE_KEYS = {
  LAYOUT: 'dashboard_layout',
  THEME: 'dashboard_theme',
  PREFERENCES: 'dashboard_preferences',
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for dashboard settings
  const [layout, setLayout] = useState<DashboardLayout>(defaultLayout);
  const [theme, setTheme] = useState<DashboardTheme>(defaultTheme);
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultPreferences);
  const [isEditing, setIsEditing] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Load saved dashboard settings from localStorage on initial render
  useEffect(() => {
    try {
      // Load layout
      const savedLayout = localStorage.getItem(STORAGE_KEYS.LAYOUT);
      if (savedLayout) {
        setLayout(JSON.parse(savedLayout));
      }

      // Load theme
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme) {
        setTheme(JSON.parse(savedTheme));
      }

      // Load preferences
      const savedPreferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('Error loading dashboard settings:', error);
      // Fallback to defaults
      setLayout(defaultLayout);
      setTheme(defaultTheme);
      setPreferences(defaultPreferences);
    }
  }, []);

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAYOUT, JSON.stringify(layout));
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
    }
  }, [layout]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    } catch (error) {
      console.error('Error saving dashboard theme:', error);
    }
  }, [theme]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving dashboard preferences:', error);
    }
  }, [preferences]);

  // Update layout
  const updateLayout = (newLayoutPartial: Partial<DashboardLayout>) => {
    setLayout(prevLayout => ({
      ...prevLayout,
      ...newLayoutPartial,
    }));
  };

  // Update a specific widget
  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    setLayout(prevLayout => ({
      ...prevLayout,
      widgets: prevLayout.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
    }));
  };

  // Add a new widget
  const addWidget = (widget: Omit<Widget, 'id' | 'position'>) => {
    const id = `widget-${Date.now()}`;
    const position = layout.widgets.length;
    
    setLayout(prevLayout => ({
      ...prevLayout,
      widgets: [
        ...prevLayout.widgets,
        { ...widget, id, position },
      ],
    }));
  };

  // Remove a widget
  const removeWidget = (widgetId: string) => {
    setLayout(prevLayout => ({
      ...prevLayout,
      widgets: prevLayout.widgets
        .filter(widget => widget.id !== widgetId)
        .map((widget, index) => ({ ...widget, position: index })),
    }));
  };

  // Reorder widgets based on an array of widget IDs
  const reorderWidgets = (widgetIds: string[]) => {
    const reorderedWidgets = widgetIds.map((id, index) => {
      const widget = layout.widgets.find(w => w.id === id);
      if (!widget) return null;
      return { ...widget, position: index };
    }).filter(Boolean) as Widget[];
    
    // Handle any widgets not included in the reordering
    const remainingWidgets = layout.widgets
      .filter(widget => !widgetIds.includes(widget.id))
      .map((widget, index) => ({ 
        ...widget, 
        position: reorderedWidgets.length + index 
      }));
    
    setLayout(prevLayout => ({
      ...prevLayout,
      widgets: [...reorderedWidgets, ...remainingWidgets],
    }));
  };

  // Reset layout to defaults
  const resetLayout = () => {
    setLayout(defaultLayout);
  };

  // Update theme
  const updateTheme = (newThemePartial: Partial<DashboardTheme>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...newThemePartial,
    }));
  };

  // Update preferences
  const updatePreferences = (newPreferencesPartial: Partial<DashboardPreferences>) => {
    setPreferences(prevPreferences => ({
      ...prevPreferences,
      ...newPreferencesPartial,
    }));
  };

  // Set editing mode
  const setEditing = (editing: boolean) => {
    setIsEditing(editing);
  };

  // Set customizing mode
  const setCustomizing = (customizing: boolean) => {
    setIsCustomizing(customizing);
  };

  // Provide context value
  const contextValue: DashboardContextType = {
    layout,
    theme,
    preferences,
    isEditing,
    isCustomizing,
    updateLayout,
    updateWidget,
    addWidget,
    removeWidget,
    reorderWidgets,
    resetLayout,
    updateTheme,
    updatePreferences,
    setEditing,
    setCustomizing,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook for using dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;