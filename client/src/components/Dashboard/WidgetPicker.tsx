import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  LineChart, 
  Medal, 
  Calendar, 
  Newspaper, 
  MessageSquare, 
  BarChart, 
  StickyNote, 
  CheckSquare, 
  CreditCard, 
  Award, 
  Bookmark, 
  Tool,
  CalendarClock,
  Info,
  Plus,
  Search
} from 'lucide-react';
import { useDashboard, WidgetType } from '@/contexts/DashboardContext';
import { useToast } from '@/hooks/use-toast';

interface WidgetPickerProps {
  onClose: () => void;
}

interface WidgetOption {
  type: WidgetType;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'learning' | 'productivity' | 'social' | 'analytics';
}

/**
 * WidgetPicker - Component for selecting and adding widgets to the dashboard
 */
const WidgetPicker: React.FC<WidgetPickerProps> = ({ onClose }) => {
  const { addWidget, layout } = useDashboard();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // List of available widgets
  const widgetOptions: WidgetOption[] = [
    {
      type: 'recentCourses',
      title: 'Recent Courses',
      description: 'Shows your most recently accessed courses',
      icon: <BookOpen className="h-5 w-5" />,
      category: 'learning',
    },
    {
      type: 'progress',
      title: 'Learning Progress',
      description: 'Track your progress across all courses',
      icon: <LineChart className="h-5 w-5" />,
      category: 'learning',
    },
    {
      type: 'achievements',
      title: 'Achievements',
      description: 'Displays your earned badges and achievements',
      icon: <Medal className="h-5 w-5" />,
      category: 'learning',
    },
    {
      type: 'favouriteCourses',
      title: 'Favorite Courses',
      description: 'Quick access to your favorited courses',
      icon: <Bookmark className="h-5 w-5" />,
      category: 'learning',
    },
    {
      type: 'calendar',
      title: 'Learning Calendar',
      description: 'Calendar view of your scheduled learning activities',
      icon: <Calendar className="h-5 w-5" />,
      category: 'productivity',
    },
    {
      type: 'upcomingEvents',
      title: 'Upcoming Events',
      description: 'Shows upcoming webinars, deadlines and events',
      icon: <CalendarClock className="h-5 w-5" />,
      category: 'productivity',
    },
    {
      type: 'news',
      title: 'AI News',
      description: 'Latest articles and news in artificial intelligence',
      icon: <Newspaper className="h-5 w-5" />,
      category: 'learning',
    },
    {
      type: 'forum',
      title: 'Community Forum',
      description: 'Recent discussions from the community forum',
      icon: <MessageSquare className="h-5 w-5" />,
      category: 'social',
    },
    {
      type: 'analytics',
      title: 'Learning Analytics',
      description: 'Detailed analytics about your learning patterns',
      icon: <BarChart className="h-5 w-5" />,
      category: 'analytics',
    },
    {
      type: 'notes',
      title: 'Quick Notes',
      description: 'A place to jot down thoughts and notes',
      icon: <StickyNote className="h-5 w-5" />,
      category: 'productivity',
    },
    {
      type: 'todo',
      title: 'To-Do List',
      description: 'Keep track of tasks and assignments',
      icon: <CheckSquare className="h-5 w-5" />,
      category: 'productivity',
    },
    {
      type: 'subscription',
      title: 'Subscription Status',
      description: 'Information about your current subscription',
      icon: <CreditCard className="h-5 w-5" />,
      category: 'analytics',
    },
    {
      type: 'recommendations',
      title: 'Recommendations',
      description: 'Personalized course and content recommendations',
      icon: <Info className="h-5 w-5" />,
      category: 'learning',
    },
    {
      type: 'certifications',
      title: 'Your Certifications',
      description: 'View and access your earned certifications',
      icon: <Award className="h-5 w-5" />,
      category: 'learning',
    },
    {
      type: 'recentTools',
      title: 'Recent Tools',
      description: 'Quick access to recently used AI tools',
      icon: <Tool className="h-5 w-5" />,
      category: 'productivity',
    },
  ];

  // Check if a widget is already added
  const isWidgetAdded = (type: WidgetType): boolean => {
    return layout.widgets.some(widget => widget.type === type);
  };

  // Filter widgets based on search query and active tab
  const filteredWidgets = widgetOptions.filter(widget => {
    const matchesSearch = searchQuery === '' || 
      widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeTab === 'all' || widget.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  // Add a widget to the dashboard
  const handleAddWidget = (widget: WidgetOption) => {
    if (isWidgetAdded(widget.type)) {
      toast({
        title: 'Widget already added',
        description: `The ${widget.title} widget is already on your dashboard.`,
        variant: 'destructive',
      });
      return;
    }
    
    addWidget({
      type: widget.type,
      title: widget.title,
      size: 'medium',
      visible: true,
    });
    
    toast({
      title: 'Widget Added',
      description: `The ${widget.title} widget has been added to your dashboard.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search widgets..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[60vh] mt-2 pr-4">
          <div className="grid grid-cols-1 gap-3 py-4">
            {filteredWidgets.length > 0 ? (
              filteredWidgets.map((widget) => (
                <div
                  key={widget.type}
                  className="flex items-start p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors"
                >
                  <div className="mr-4 mt-0.5">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      {widget.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{widget.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{widget.description}</p>
                    <Button
                      variant={isWidgetAdded(widget.type) ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleAddWidget(widget)}
                      disabled={isWidgetAdded(widget.type)}
                    >
                      {isWidgetAdded(widget.type) ? (
                        'Already Added'
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add Widget
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No widgets found matching your search.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>
      
      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
};

export default WidgetPicker;