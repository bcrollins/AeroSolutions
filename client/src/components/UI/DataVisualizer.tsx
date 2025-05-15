import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart,
  BarChart2, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Activity, 
  HelpCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Custom types for data visualization
export type DataPoint = {
  label: string;
  value: number;
  color?: string;
  // Additional contextual data that can be shown in tooltips
  context?: Record<string, any>;
};

export type TimeSeriesPoint = {
  timestamp: Date | string;
  value: number;
  label?: string;
  color?: string;
  context?: Record<string, any>;
};

export type ComparisonData = {
  category: string;
  values: { label: string; value: number; color?: string }[];
};

interface ChartPalette {
  colors: string[];
  backgroundColor: string;
  axisColor: string;
  gridColor: string;
  labelColor: string;
  tooltipBackground: string;
  tooltipText: string;
}

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'radar' | 'comparison';

interface DataVisualizerProps {
  // Data props
  data: DataPoint[] | TimeSeriesPoint[] | ComparisonData[];
  type: ChartType;
  title?: string;
  description?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  
  // Visual props
  className?: string;
  height?: number | string;
  width?: number | string;
  animated?: boolean;
  showLegend?: boolean;
  showTooltips?: boolean;
  showControls?: boolean;
  allowTypeChange?: boolean;
  allowDownload?: boolean;
  allowRefresh?: boolean;
  
  // Function props
  onRefresh?: () => void;
  onTypeChange?: (type: ChartType) => void;
  formatValue?: (value: number) => string;
  formatTimestamp?: (timestamp: Date | string) => string;
  colorPalette?: Partial<ChartPalette>;
  
  // Interaction props
  onDataPointClick?: (point: DataPoint | TimeSeriesPoint) => void;
  highlightedIndices?: number[];
  interactive?: boolean;
}

const defaultPalette: ChartPalette = {
  colors: [
    '#0066CC', // primary blue
    '#34C759', // green
    '#FF9500', // orange
    '#FF2D55', // red
    '#5856D6', // purple
    '#00A2FF', // sky blue
    '#FF375F', // pink
    '#87BBFF', // light blue
  ],
  backgroundColor: 'transparent',
  axisColor: '#BEBEBE',
  gridColor: '#EFEFEF',
  labelColor: '#4A4A4A',
  tooltipBackground: 'rgba(255, 255, 255, 0.95)',
  tooltipText: '#000000'
};

/**
 * Enhanced data visualization component with multiple chart types and interactions
 */
export function DataVisualizer({
  data,
  type = 'bar',
  title,
  description,
  xAxisLabel,
  yAxisLabel,
  className = '',
  height = 300,
  width = '100%',
  animated = true,
  showLegend = true,
  showTooltips = true,
  showControls = true,
  allowTypeChange = false,
  allowDownload = true,
  allowRefresh = false,
  onRefresh,
  onTypeChange,
  formatValue = (value) => value.toLocaleString(),
  formatTimestamp = (timestamp) => 
    typeof timestamp === 'string' 
      ? timestamp 
      : timestamp.toLocaleDateString(),
  colorPalette = {},
  onDataPointClick,
  highlightedIndices = [],
  interactive = true
}: DataVisualizerProps) {
  const [currentType, setCurrentType] = useState<ChartType>(type);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: null
  });
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Merge provided palette with defaults
  const palette: ChartPalette = {
    ...defaultPalette,
    ...colorPalette
  };
  
  // Check if data is time series
  const isTimeSeries = Array.isArray(data) && 
    data.length > 0 && 
    'timestamp' in data[0];
  
  // Check if data is comparison
  const isComparison = Array.isArray(data) && 
    data.length > 0 && 
    'category' in data[0] && 
    'values' in data[0];
  
  // Handle type change
  const handleTypeChange = (newType: ChartType) => {
    setCurrentType(newType);
    
    if (onTypeChange) {
      onTypeChange(newType);
    }
  };
  
  // Get appropriate chart icon based on type
  const getChartIcon = (chartType: ChartType) => {
    switch (chartType) {
      case 'bar':
        return <BarChart size={18} />;
      case 'line':
        return <TrendingUp size={18} />;
      case 'pie':
        return <PieChartIcon size={18} />;
      case 'area':
        return <AreaChart size={18} />;
      case 'radar':
        return <Activity size={18} />;
      case 'comparison':
        return <BarChart2 size={18} />;
      default:
        return <BarChart size={18} />;
    }
  };
  
  // Download chart as SVG
  const downloadAsSVG = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'chart'}_${new Date().toISOString().slice(0, 10)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Handle chart refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  
  // Render controls
  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {title && (
            <h3 className="text-base font-medium">{title}</h3>
          )}
          
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    aria-label="Chart description"
                  >
                    <HelpCircle size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {allowTypeChange && (
            <Select
              value={currentType}
              onValueChange={(value) => handleTypeChange(value as ChartType)}
            >
              <SelectTrigger className="w-[130px] h-8">
                <div className="flex items-center gap-2">
                  {getChartIcon(currentType as ChartType)}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="radar">Radar Chart</SelectItem>
                {isComparison && (
                  <SelectItem value="comparison">Comparison</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
          
          {allowDownload && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={downloadAsSVG}
              aria-label="Download chart"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
          
          {allowRefresh && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleRefresh}
              aria-label="Refresh data"
            >
              <RefreshCw size={14} />
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  // This is a placeholder for actual chart rendering
  // In a real implementation, you would use a chart library like recharts, d3.js, or chart.js
  // Or implement SVG-based charts directly
  const renderChart = () => {
    const chartComponent = (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {getChartIcon(currentType)}
          </div>
          <p className="text-muted-foreground">
            Chart visualization would be rendered here based on the data. 
            <br />
            Use a charting library like recharts, d3.js, or chart.js for implementation.
          </p>
        </div>
      </div>
    );
    
    return (
      <div className="relative h-full w-full">
        {chartComponent}
        {/* Overlay for tooltip handling */}
        {interactive && (
          <div 
            className="absolute inset-0 cursor-pointer"
            onMouseMove={(e) => {
              // Handle mouse interactions with the chart
              // This would be implemented with the actual chart library
            }}
            onMouseLeave={() => {
              setActiveIndex(null);
              setTooltip({ ...tooltip, visible: false });
            }}
            onClick={(e) => {
              // Handle click on data points
              // This would be implemented with the actual chart library
            }}
          />
        )}
        
        {/* Tooltip */}
        <AnimatePresence>
          {tooltip.visible && showTooltips && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bg-white border rounded-lg shadow-lg p-2 text-sm z-10 pointer-events-none"
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: 'translate(-50%, -100%)',
                maxWidth: '200px'
              }}
            >
              {tooltip.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  // Render legend for the chart
  const renderLegend = () => {
    if (!showLegend) return null;
    
    // For standard data points
    if (!isTimeSeries && !isComparison) {
      const standardData = data as DataPoint[];
      
      return (
        <div className="p-4 border-t flex flex-wrap gap-3">
          {standardData.map((point, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center gap-1.5",
                interactive && "cursor-pointer hover:text-primary transition-colors",
                (activeIndex === index || highlightedIndices.includes(index)) && "text-primary"
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => onDataPointClick && onDataPointClick(point)}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: 
                    point.color || 
                    palette.colors[index % palette.colors.length] 
                }}
              />
              <span className="text-xs font-medium">{point.label}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // For time series data
    if (isTimeSeries) {
      return (
        <div className="p-4 border-t">
          <div className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: palette.colors[0] }}
            />
            <span className="text-xs font-medium">{title || 'Time Series Data'}</span>
          </div>
        </div>
      );
    }
    
    // For comparison data
    if (isComparison) {
      const comparisonData = data as ComparisonData[];
      
      return (
        <div className="p-4 border-t flex flex-wrap gap-3">
          {comparisonData[0].values.map((value, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center gap-1.5",
                interactive && "cursor-pointer hover:text-primary transition-colors",
                (activeIndex === index || highlightedIndices.includes(index)) && "text-primary"
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: 
                    value.color || 
                    palette.colors[index % palette.colors.length] 
                }}
              />
              <span className="text-xs font-medium">{value.label}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col border rounded-lg overflow-hidden bg-background",
        className
      )}
      style={{ height, width }}
    >
      {renderControls()}
      
      <div className="flex-1 overflow-hidden">
        {renderChart()}
      </div>
      
      {renderLegend()}
    </div>
  );
}