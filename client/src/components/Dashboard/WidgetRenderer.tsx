import React, { useState } from 'react';
import { Widget } from '@/contexts/DashboardContext';
import DashboardWidget from './DashboardWidget';
import RecentCoursesWidget from './Widgets/RecentCoursesWidget';
import ProgressWidget from './Widgets/ProgressWidget';
import RecommendationsWidget from './Widgets/RecommendationsWidget';
import AchievementsWidget from './Widgets/AchievementsWidget';
import CalendarWidget from './Widgets/CalendarWidget';
import NewsWidget from './Widgets/NewsWidget';
import ForumWidget from './Widgets/ForumWidget';
import AnalyticsWidget from './Widgets/AnalyticsWidget';
import NotesWidget from './Widgets/NotesWidget';
import TodoWidget from './Widgets/TodoWidget';
import SubscriptionWidget from './Widgets/SubscriptionWidget';
import CertificationsWidget from './Widgets/CertificationsWidget';
import RecentToolsWidget from './Widgets/RecentToolsWidget';
import FavouriteCoursesWidget from './Widgets/FavouriteCoursesWidget';
import UpcomingEventsWidget from './Widgets/UpcomingEventsWidget';
import { useQuery } from '@tanstack/react-query';
import { APIErrorBoundary } from '@/components/ErrorHandling/APIErrorBoundary';

interface WidgetRendererProps {
  widget: Widget;
}

/**
 * WidgetRenderer - Renders the appropriate widget component based on the widget type
 */
const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Function to handle widget refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
  };
  
  // Render the widget based on its type
  const renderWidget = () => {
    switch (widget.type) {
      case 'recentCourses':
        return <RecentCoursesWidget widget={widget} />;
        
      case 'progress':
        return <ProgressWidget widget={widget} />;
        
      case 'recommendations':
        return <RecommendationsWidget widget={widget} />;
        
      case 'achievements':
        return <AchievementsWidget widget={widget} />;
        
      case 'calendar':
        return <CalendarWidget widget={widget} />;
        
      case 'news':
        return <NewsWidget widget={widget} />;
        
      case 'forum':
        return <ForumWidget widget={widget} />;
        
      case 'analytics':
        return <AnalyticsWidget widget={widget} />;
        
      case 'notes':
        return <NotesWidget widget={widget} />;
        
      case 'todo':
        return <TodoWidget widget={widget} />;
        
      case 'subscription':
        return <SubscriptionWidget widget={widget} />;
        
      case 'certifications':
        return <CertificationsWidget widget={widget} />;
        
      case 'recentTools':
        return <RecentToolsWidget widget={widget} />;
        
      case 'favouriteCourses':
        return <FavouriteCoursesWidget widget={widget} />;
        
      case 'upcomingEvents':
        return <UpcomingEventsWidget widget={widget} />;
        
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Unknown widget type: {widget.type}</p>
          </div>
        );
    }
  };
  
  return renderWidget();
};

export default WidgetRenderer;