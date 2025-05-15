import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MoreHorizontal, RefreshCw, X, Maximize2, Minimize2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Widget, useDashboard } from '@/contexts/DashboardContext';
import { cn } from '@/lib/utils';

interface DashboardWidgetProps {
  widget: Widget;
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  onRefresh?: () => void;
}

/**
 * DashboardWidget - Container component for dashboard widgets
 */
const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  widget,
  className,
  children,
  isLoading = false,
  onRefresh,
}) => {
  const { removeWidget, updateWidget } = useDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle refresh
  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };
  
  // Handle widget size change
  const handleSizeChange = (size: 'small' | 'medium' | 'large' | 'full') => {
    updateWidget(widget.id, { size });
  };
  
  // Handle widget removal
  const handleRemove = () => {
    removeWidget(widget.id);
  };
  
  // Animations for loading state
  const contentAnimation = {
    initial: { opacity: 0.6 },
    animate: { opacity: isRefreshing ? 0.6 : 1 },
    transition: { duration: 0.2 },
  };
  
  return (
    <Card 
      className={cn(
        'flex flex-col overflow-hidden',
        widget.size === 'small' ? 'h-52' : 
        widget.size === 'medium' ? 'h-80' : 
        widget.size === 'large' ? 'h-96' : 
        'h-full',
        className
      )}
    >
      <CardHeader className="px-4 py-3 flex flex-row items-center space-y-0 gap-4">
        <CardTitle className="text-base font-medium flex-1 truncate">
          {widget.title}
        </CardTitle>
        
        <div className="flex items-center gap-1">
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="sr-only">Refresh</span>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem
                onClick={() => handleSizeChange('small')}
                disabled={widget.size === 'small'}
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Small Size
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSizeChange('medium')}
                disabled={widget.size === 'medium'}
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Medium Size
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSizeChange('large')}
                disabled={widget.size === 'large'}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Large Size
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSizeChange('full')}
                disabled={widget.size === 'full'}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Full Size
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleRemove}
                className="text-destructive focus:text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Widget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-3 flex-1 overflow-auto">
        <motion.div 
          {...contentAnimation}
          className="h-full"
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : children}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;