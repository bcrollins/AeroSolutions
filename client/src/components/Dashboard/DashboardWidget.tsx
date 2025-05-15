import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Trash, 
  Edit, 
  Maximize, 
  Minimize, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Settings 
} from 'lucide-react';
import { Widget, useDashboard } from '@/contexts/DashboardContext';
import { cn } from '@/lib/utils';

interface DashboardWidgetProps {
  widget: Widget;
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  onEdit?: () => void;
  onConfigure?: () => void;
  onRefresh?: () => void;
}

/**
 * Base component for all dashboard widgets
 * Handles common widget functionality like resizing, moving, etc.
 */
const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  widget,
  className,
  children,
  isLoading = false,
  onEdit,
  onConfigure,
  onRefresh,
}) => {
  const { isEditing, updateWidget, removeWidget } = useDashboard();
  const [isHovered, setIsHovered] = useState(false);

  // Map widget size to Tailwind classes
  const getSizeClasses = () => {
    switch (widget.size) {
      case 'small':
        return 'col-span-1 row-span-1';
      case 'medium':
        return 'col-span-1 row-span-2';
      case 'large':
        return 'col-span-2 row-span-2';
      case 'full':
        return 'col-span-3 row-span-2';
      default:
        return 'col-span-1 row-span-1';
    }
  };

  // Toggle widget size
  const toggleSize = () => {
    const sizeMap: Record<Widget['size'], Widget['size']> = {
      'small': 'medium',
      'medium': 'large',
      'large': 'full',
      'full': 'small',
    };
    updateWidget(widget.id, { size: sizeMap[widget.size] });
  };

  // Toggle widget visibility
  const toggleVisibility = () => {
    updateWidget(widget.id, { visible: !widget.visible });
  };

  // Move widget up in order
  const moveUp = () => {
    if (widget.position > 0) {
      updateWidget(widget.id, { position: widget.position - 1 });
    }
  };

  // Move widget down in order
  const moveDown = () => {
    updateWidget(widget.id, { position: widget.position + 1 });
  };

  // Delete widget
  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this widget?')) {
      removeWidget(widget.id);
    }
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out h-full',
        getSizeClasses(),
        !widget.visible && 'opacity-50',
        isHovered && isEditing && 'ring-2 ring-primary',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-3 flex flex-row items-center space-y-0 gap-2 select-none">
        <CardTitle className="text-base flex-1 truncate">{widget.title}</CardTitle>
        
        {isEditing && (
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={toggleVisibility}
              title={widget.visible ? 'Hide widget' : 'Show widget'}
            >
              {widget.visible ? 
                <EyeOff className="h-4 w-4" /> : 
                <Eye className="h-4 w-4" />
              }
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={toggleSize}
              title="Change size"
            >
              {widget.size === 'small' || widget.size === 'medium' ? 
                <Maximize className="h-4 w-4" /> : 
                <Minimize className="h-4 w-4" />
              }
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                )}
                {onConfigure && (
                  <DropdownMenuItem onClick={onConfigure}>
                    <Settings className="h-4 w-4 mr-2" /> Configure
                  </DropdownMenuItem>
                )}
                {onRefresh && (
                  <DropdownMenuItem onClick={onRefresh}>
                    <RotateCcw className="h-4 w-4 mr-2" /> Refresh
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={moveUp}>
                  <ArrowUp className="h-4 w-4 mr-2" /> Move Up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={moveDown}>
                  <ArrowDown className="h-4 w-4 mr-2" /> Move Down
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={handleDelete}
                >
                  <Trash className="h-4 w-4 mr-2" /> Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        {!isEditing && (onEdit || onConfigure || onRefresh) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
              )}
              {onConfigure && (
                <DropdownMenuItem onClick={onConfigure}>
                  <Settings className="h-4 w-4 mr-2" /> Configure
                </DropdownMenuItem>
              )}
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Refresh
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      
      <CardContent 
        className={cn(
          'p-3 pt-0 h-[calc(100%-3rem)] overflow-auto',
          isLoading && 'opacity-60'
        )}
      >
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;