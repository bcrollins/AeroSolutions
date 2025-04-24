import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, Cell, Sector, RadarChart, Radar, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Default color palette
const DEFAULT_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#6366F1', // indigo-500
  '#EC4899', // pink-500
  '#8B5CF6', // violet-500
  '#EF4444', // red-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#06B6D4', // cyan-500
];

// Custom active sector for PieChart
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={-18} textAnchor="middle" fill="#888">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" className="text-lg font-bold">
        {value}
      </text>
      <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius}
        fill={fill}
      />
    </g>
  );
};

// Common props for all chart types
interface BaseChartProps {
  /**
   * Title for the chart
   */
  title?: string;
  
  /**
   * Description for the chart
   */
  description?: string;
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Custom class names
   */
  className?: string;
  
  /**
   * Height of the chart
   * @default 300
   */
  height?: number;
  
  /**
   * Custom color palette
   */
  colors?: string[];
  
  /**
   * Whether to use a responsive container (will use parent's width)
   * @default true
   */
  responsive?: boolean;
  
  /**
   * Show animation
   * @default true
   */
  animate?: boolean;
  
  /**
   * Show grid lines
   * @default true
   */
  showGrid?: boolean;
  
  /**
   * Show tooltip
   * @default true
   */
  showTooltip?: boolean;
  
  /**
   * Show legend
   * @default true
   */
  showLegend?: boolean;
  
  /**
   * Aspect ratio (width/height) for responsive container
   * @default undefined (uses parent width)
   */
  aspect?: number;
}

// Line Chart Props
interface LineChartProps extends BaseChartProps {
  /**
   * Data for the chart
   */
  data: any[];
  
  /**
   * Lines to display
   */
  lines: {
    /**
     * Data key for the line
     */
    dataKey: string;
    
    /**
     * Name to display in legend
     */
    name?: string;
    
    /**
     * Line color (uses palette index if not provided)
     */
    color?: string;
    
    /**
     * Line stroke width
     * @default 2
     */
    strokeWidth?: number;
    
    /**
     * Show area under line
     * @default false
     */
    area?: boolean;
    
    /**
     * Show dots on data points
     * @default true
     */
    dots?: boolean;
    
    /**
     * Connect null/missing values
     * @default false
     */
    connectNulls?: boolean;
    
    /**
     * Type of curve to use
     * @default "linear"
     */
    type?: 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
  }[];
  
  /**
   * X-axis data key
   * @default "name"
   */
  xAxisDataKey?: string;
  
  /**
   * Format function for X-axis tick
   */
  xAxisTickFormatter?: (value: any) => string;
  
  /**
   * Format function for Y-axis tick
   */
  yAxisTickFormatter?: (value: any) => string;
  
  /**
   * Format function for tooltip values
   */
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  
  /**
   * Format function for label
   */
  labelFormatter?: (label: any) => string;
}

// Bar Chart Props
interface BarChartProps extends BaseChartProps {
  /**
   * Data for the chart
   */
  data: any[];
  
  /**
   * Bars to display
   */
  bars: {
    /**
     * Data key for the bar
     */
    dataKey: string;
    
    /**
     * Name to display in legend
     */
    name?: string;
    
    /**
     * Bar color (uses palette index if not provided)
     */
    color?: string;
    
    /**
     * Bar width
     */
    barSize?: number;
    
    /**
     * Stack ID for stacked bars
     */
    stackId?: string;
  }[];
  
  /**
   * X-axis data key
   * @default "name"
   */
  xAxisDataKey?: string;
  
  /**
   * Format function for X-axis tick
   */
  xAxisTickFormatter?: (value: any) => string;
  
  /**
   * Format function for Y-axis tick
   */
  yAxisTickFormatter?: (value: any) => string;
  
  /**
   * Format function for tooltip values
   */
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  
  /**
   * Format function for label
   */
  labelFormatter?: (label: any) => string;
  
  /**
   * Layout direction
   * @default "vertical"
   */
  layout?: 'vertical' | 'horizontal';
}

// Pie Chart Props
interface PieChartProps extends BaseChartProps {
  /**
   * Data for the chart
   */
  data: any[];
  
  /**
   * Data key for the pie value
   * @default "value"
   */
  dataKey?: string;
  
  /**
   * Data key for the name
   * @default "name"
   */
  nameKey?: string;
  
  /**
   * Inner radius for donut chart
   * @default 0 (pie chart)
   */
  innerRadius?: number | string;
  
  /**
   * Outer radius
   * @default "80%"
   */
  outerRadius?: number | string;
  
  /**
   * Start angle in degrees
   * @default 0
   */
  startAngle?: number;
  
  /**
   * End angle in degrees
   * @default 360
   */
  endAngle?: number;
  
  /**
   * Corner radius for pie sectors
   * @default 0
   */
  cornerRadius?: number;
  
  /**
   * Padding angle between sectors
   * @default 0
   */
  paddingAngle?: number;
  
  /**
   * Enable active sector animation
   * @default true
   */
  activeShape?: boolean;
  
  /**
   * Label visibility and position
   * @default false
   */
  label?: boolean | { position: 'inside' | 'outside' };
}

// Radar Chart Props
interface RadarChartProps extends BaseChartProps {
  /**
   * Data for the chart
   */
  data: any[];
  
  /**
   * Radars to display
   */
  radars: {
    /**
     * Data key for the radar
     */
    dataKey: string;
    
    /**
     * Name to display in legend
     */
    name?: string;
    
    /**
     * Radar color (uses palette index if not provided)
     */
    color?: string;
    
    /**
     * Fill opacity
     * @default 0.6
     */
    fillOpacity?: number;
    
    /**
     * Stroke width
     * @default 1
     */
    strokeWidth?: number;
  }[];
  
  /**
   * Fixed value for outer radius, otherwise uses responsive sizing
   */
  outerRadius?: number;
  
  /**
   * Format function for polarAngleAxis tick
   */
  angleAxisFormatter?: (value: any) => string;
  
  /**
   * Format function for polarRadiusAxis tick
   */
  radiusAxisFormatter?: (value: any) => string;
}

// Scatter Chart Props
interface ScatterChartProps extends BaseChartProps {
  /**
   * Data for the chart
   */
  data: any[];
  
  /**
   * Scatter sets to display
   */
  scatters: {
    /**
     * Data key for the scatter x-axis
     */
    xAxisKey: string;
    
    /**
     * Data key for the scatter y-axis
     */
    yAxisKey: string;
    
    /**
     * Data key for the scatter z-axis (bubble size)
     */
    zAxisKey?: string;
    
    /**
     * Name to display in legend
     */
    name?: string;
    
    /**
     * Scatter color (uses palette index if not provided)
     */
    color?: string;
    
    /**
     * Fill opacity
     * @default 0.6
     */
    fillOpacity?: number;
  }[];
  
  /**
   * X-axis label
   */
  xAxisLabel?: string;
  
  /**
   * Y-axis label
   */
  yAxisLabel?: string;
  
  /**
   * Format function for X-axis tick
   */
  xAxisTickFormatter?: (value: any) => string;
  
  /**
   * Format function for Y-axis tick
   */
  yAxisTickFormatter?: (value: any) => string;
}

// Simple Line Chart Component
export function SimpleLineChart({
  data,
  lines,
  title,
  description,
  isLoading = false,
  className,
  height = 300,
  colors = DEFAULT_COLORS,
  responsive = true,
  animate = true,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  aspect,
  xAxisDataKey = 'name',
  xAxisTickFormatter,
  yAxisTickFormatter,
  tooltipFormatter,
  labelFormatter,
}: LineChartProps) {
  // Get theme mode
  const { isDark } = useTheme();
  
  // Memoize chart colors based on theme
  const chartColors = useMemo(() => {
    return colors.map(color => isDark ? color : color);
  }, [colors, isDark]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="w-full" style={{ height }}>
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!data || data.length === 0 || !lines || lines.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center w-full" style={{ height }}>
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chart = (
    <LineChart
      data={data}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.1} />}
      <XAxis 
        dataKey={xAxisDataKey}
        tickFormatter={xAxisTickFormatter}
        tick={{ fill: isDark ? '#888' : '#333' }}
      />
      <YAxis 
        tickFormatter={yAxisTickFormatter} 
        tick={{ fill: isDark ? '#888' : '#333' }}
      />
      {showTooltip && (
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={labelFormatter}
          contentStyle={{ 
            backgroundColor: isDark ? '#333' : '#fff',
            border: `1px solid ${isDark ? '#555' : '#ddd'}`,
            borderRadius: '4px',
            color: isDark ? '#eee' : '#333'
          }}
        />
      )}
      {showLegend && (
        <Legend 
          wrapperStyle={{ paddingTop: 10 }}
          formatter={(value) => (
            <span style={{ color: isDark ? '#eee' : '#333' }}>{value}</span>
          )}
        />
      )}
      
      {lines.map((line, index) => (
        <Line
          key={line.dataKey}
          type={line.type || 'linear'}
          dataKey={line.dataKey}
          name={line.name || line.dataKey}
          stroke={line.color || chartColors[index % chartColors.length]}
          strokeWidth={line.strokeWidth || 2}
          activeDot={{ r: 6 }}
          dot={line.dots !== false}
          connectNulls={line.connectNulls}
          isAnimationActive={animate}
        />
      ))}
    </LineChart>
  );
  
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="w-full" style={{ height }}>
          {responsive ? (
            <ResponsiveContainer width="100%" height="100%" aspect={aspect}>
              {chart}
            </ResponsiveContainer>
          ) : (
            chart
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple Bar Chart Component
export function SimpleBarChart({
  data,
  bars,
  title,
  description,
  isLoading = false,
  className,
  height = 300,
  colors = DEFAULT_COLORS,
  responsive = true,
  animate = true,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  aspect,
  xAxisDataKey = 'name',
  xAxisTickFormatter,
  yAxisTickFormatter,
  tooltipFormatter,
  labelFormatter,
  layout = 'vertical',
}: BarChartProps) {
  // Get theme mode
  const { isDark } = useTheme();
  
  // Memoize chart colors based on theme
  const chartColors = useMemo(() => {
    return colors.map(color => isDark ? color : color);
  }, [colors, isDark]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="w-full" style={{ height }}>
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!data || data.length === 0 || !bars || bars.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center w-full" style={{ height }}>
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chart = (
    <BarChart
      data={data}
      layout={layout}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.1} />}
      <XAxis 
        dataKey={layout === 'vertical' ? xAxisDataKey : undefined}
        type={layout === 'vertical' ? 'category' : 'number'}
        tickFormatter={xAxisTickFormatter}
        tick={{ fill: isDark ? '#888' : '#333' }}
      />
      <YAxis 
        dataKey={layout === 'horizontal' ? xAxisDataKey : undefined}
        type={layout === 'horizontal' ? 'category' : 'number'}
        tickFormatter={yAxisTickFormatter} 
        tick={{ fill: isDark ? '#888' : '#333' }}
      />
      {showTooltip && (
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={labelFormatter}
          contentStyle={{ 
            backgroundColor: isDark ? '#333' : '#fff',
            border: `1px solid ${isDark ? '#555' : '#ddd'}`,
            borderRadius: '4px',
            color: isDark ? '#eee' : '#333'
          }}
        />
      )}
      {showLegend && (
        <Legend 
          wrapperStyle={{ paddingTop: 10 }}
          formatter={(value) => (
            <span style={{ color: isDark ? '#eee' : '#333' }}>{value}</span>
          )}
        />
      )}
      
      {bars.map((bar, index) => (
        <Bar
          key={bar.dataKey}
          dataKey={bar.dataKey}
          name={bar.name || bar.dataKey}
          fill={bar.color || chartColors[index % chartColors.length]}
          stackId={bar.stackId}
          barSize={bar.barSize}
          isAnimationActive={animate}
        />
      ))}
    </BarChart>
  );
  
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="w-full" style={{ height }}>
          {responsive ? (
            <ResponsiveContainer width="100%" height="100%" aspect={aspect}>
              {chart}
            </ResponsiveContainer>
          ) : (
            chart
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple Pie Chart Component
export function SimplePieChart({
  data,
  title,
  description,
  isLoading = false,
  className,
  height = 300,
  colors = DEFAULT_COLORS,
  responsive = true,
  animate = true,
  showTooltip = true,
  showLegend = true,
  aspect,
  dataKey = 'value',
  nameKey = 'name',
  innerRadius = 0,
  outerRadius = '80%',
  startAngle = 0,
  endAngle = 360,
  cornerRadius = 0,
  paddingAngle = 0,
  activeShape = true,
  label = false,
}: PieChartProps) {
  // Get theme mode
  const { isDark } = useTheme();
  
  // State for active segment
  const [activeIndex, setActiveIndex] = useState(-1);
  
  // Memoize chart colors based on theme
  const chartColors = useMemo(() => {
    return colors.map(color => isDark ? color : color);
  }, [colors, isDark]);
  
  // Handle pie segment hover
  const onPieEnter = (_: any, index: number) => {
    if (activeShape) {
      setActiveIndex(index);
    }
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="w-full" style={{ height }}>
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center w-full" style={{ height }}>
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chart = (
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={label !== false}
        label={label === true || (typeof label === 'object' && label.position === 'outside')}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        cornerRadius={cornerRadius}
        paddingAngle={paddingAngle}
        dataKey={dataKey}
        nameKey={nameKey}
        activeIndex={activeIndex}
        activeShape={activeShape ? renderActiveShape : undefined}
        onMouseEnter={onPieEnter}
        isAnimationActive={animate}
      >
        {data.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={chartColors[index % chartColors.length]} 
          />
        ))}
      </Pie>
      
      {showTooltip && (
        <Tooltip
          contentStyle={{ 
            backgroundColor: isDark ? '#333' : '#fff',
            border: `1px solid ${isDark ? '#555' : '#ddd'}`,
            borderRadius: '4px',
            color: isDark ? '#eee' : '#333'
          }}
        />
      )}
      
      {showLegend && (
        <Legend 
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ paddingTop: 20 }}
          formatter={(value) => (
            <span style={{ color: isDark ? '#eee' : '#333' }}>{value}</span>
          )}
        />
      )}
    </PieChart>
  );
  
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="w-full" style={{ height }}>
          {responsive ? (
            <ResponsiveContainer width="100%" height="100%" aspect={aspect}>
              {chart}
            </ResponsiveContainer>
          ) : (
            chart
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple Radar Chart Component
export function SimpleRadarChart({
  data,
  radars,
  title,
  description,
  isLoading = false,
  className,
  height = 300,
  colors = DEFAULT_COLORS,
  responsive = true,
  animate = true,
  showTooltip = true,
  showLegend = true,
  aspect,
  outerRadius,
  angleAxisFormatter,
  radiusAxisFormatter,
}: RadarChartProps) {
  // Get theme mode
  const { isDark } = useTheme();
  
  // Memoize chart colors based on theme
  const chartColors = useMemo(() => {
    return colors.map(color => isDark ? color : color);
  }, [colors, isDark]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="w-full" style={{ height }}>
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!data || data.length === 0 || !radars || radars.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center w-full" style={{ height }}>
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chart = (
    <RadarChart outerRadius={outerRadius} data={data}>
      <PolarGrid stroke={isDark ? '#555' : '#ddd'} />
      <PolarAngleAxis 
        dataKey="name" 
        tick={{ fill: isDark ? '#888' : '#333' }}
        tickFormatter={angleAxisFormatter}
      />
      <PolarRadiusAxis 
        tick={{ fill: isDark ? '#888' : '#333' }}
        tickFormatter={radiusAxisFormatter}
      />
      
      {radars.map((radar, index) => (
        <Radar
          key={radar.dataKey}
          name={radar.name || radar.dataKey}
          dataKey={radar.dataKey}
          stroke={radar.color || chartColors[index % chartColors.length]}
          fill={radar.color || chartColors[index % chartColors.length]}
          fillOpacity={radar.fillOpacity || 0.6}
          strokeWidth={radar.strokeWidth || 1}
          isAnimationActive={animate}
        />
      ))}
      
      {showTooltip && (
        <Tooltip
          contentStyle={{ 
            backgroundColor: isDark ? '#333' : '#fff',
            border: `1px solid ${isDark ? '#555' : '#ddd'}`,
            borderRadius: '4px',
            color: isDark ? '#eee' : '#333'
          }}
        />
      )}
      
      {showLegend && (
        <Legend 
          wrapperStyle={{ paddingTop: 20 }}
          formatter={(value) => (
            <span style={{ color: isDark ? '#eee' : '#333' }}>{value}</span>
          )}
        />
      )}
    </RadarChart>
  );
  
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="w-full" style={{ height }}>
          {responsive ? (
            <ResponsiveContainer width="100%" height="100%" aspect={aspect}>
              {chart}
            </ResponsiveContainer>
          ) : (
            chart
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple Scatter Chart Component
export function SimpleScatterChart({
  data,
  scatters,
  title,
  description,
  isLoading = false,
  className,
  height = 300,
  colors = DEFAULT_COLORS,
  responsive = true,
  animate = true,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  aspect,
  xAxisLabel,
  yAxisLabel,
  xAxisTickFormatter,
  yAxisTickFormatter,
}: ScatterChartProps) {
  // Get theme mode
  const { isDark } = useTheme();
  
  // Memoize chart colors based on theme
  const chartColors = useMemo(() => {
    return colors.map(color => isDark ? color : color);
  }, [colors, isDark]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="w-full" style={{ height }}>
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!data || data.length === 0 || !scatters || scatters.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center w-full" style={{ height }}>
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chart = (
    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.1} />}
      <XAxis 
        type="number"
        dataKey={scatters[0].xAxisKey}
        name={xAxisLabel || scatters[0].xAxisKey}
        tickFormatter={xAxisTickFormatter}
        tick={{ fill: isDark ? '#888' : '#333' }}
      />
      <YAxis 
        type="number"
        dataKey={scatters[0].yAxisKey}
        name={yAxisLabel || scatters[0].yAxisKey}
        tickFormatter={yAxisTickFormatter} 
        tick={{ fill: isDark ? '#888' : '#333' }}
      />
      
      {showTooltip && (
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ 
            backgroundColor: isDark ? '#333' : '#fff',
            border: `1px solid ${isDark ? '#555' : '#ddd'}`,
            borderRadius: '4px',
            color: isDark ? '#eee' : '#333'
          }}
        />
      )}
      
      {showLegend && (
        <Legend 
          wrapperStyle={{ paddingTop: 10 }}
          formatter={(value) => (
            <span style={{ color: isDark ? '#eee' : '#333' }}>{value}</span>
          )}
        />
      )}
      
      {scatters.map((scatter, index) => {
        const color = scatter.color || chartColors[index % chartColors.length];
        
        return (
          <Scatter
            key={`${scatter.xAxisKey}-${scatter.yAxisKey}`}
            name={scatter.name || `${scatter.xAxisKey} vs ${scatter.yAxisKey}`}
            data={data}
            fill={color}
            fillOpacity={scatter.fillOpacity || 0.6}
            isAnimationActive={animate}
          >
            {scatter.zAxisKey && (
              <ZAxis 
                type="number" 
                dataKey={scatter.zAxisKey} 
                range={[60, 500]} 
                name={scatter.zAxisKey} 
              />
            )}
          </Scatter>
        );
      })}
    </ScatterChart>
  );
  
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="w-full" style={{ height }}>
          {responsive ? (
            <ResponsiveContainer width="100%" height="100%" aspect={aspect}>
              {chart}
            </ResponsiveContainer>
          ) : (
            chart
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple Area Chart Component
export function SimpleAreaChart(props: LineChartProps) {
  // Get theme mode
  const { isDark } = useTheme();
  
  // Destructure props
  const {
    data,
    lines,
    title,
    description,
    isLoading = false,
    className,
    height = 300,
    colors = DEFAULT_COLORS,
    responsive = true,
    animate = true,
    showGrid = true,
    showTooltip = true,
    showLegend = true,
    aspect,
    xAxisDataKey = 'name',
    xAxisTickFormatter,
    yAxisTickFormatter,
    tooltipFormatter,
    labelFormatter,
  } = props;
  
  // Memoize chart colors based on theme
  const chartColors = useMemo(() => {
    return colors.map(color => isDark ? color : color);
  }, [colors, isDark]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="w-full" style={{ height }}>
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!data || data.length === 0 || !lines || lines.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center w-full" style={{ height }}>
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chart = (
    <AreaChart
      data={data}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.1} />}
      <XAxis 
        dataKey={xAxisDataKey}
        tickFormatter={xAxisTickFormatter}
        tick={{ fill: isDark ? '#888' : '#333' }}
      />
      <YAxis 
        tickFormatter={yAxisTickFormatter} 
        tick={{ fill: isDark ? '#888' : '#333' }}
      />
      {showTooltip && (
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={labelFormatter}
          contentStyle={{ 
            backgroundColor: isDark ? '#333' : '#fff',
            border: `1px solid ${isDark ? '#555' : '#ddd'}`,
            borderRadius: '4px',
            color: isDark ? '#eee' : '#333'
          }}
        />
      )}
      {showLegend && (
        <Legend 
          wrapperStyle={{ paddingTop: 10 }}
          formatter={(value) => (
            <span style={{ color: isDark ? '#eee' : '#333' }}>{value}</span>
          )}
        />
      )}
      
      {lines.map((line, index) => {
        const color = line.color || chartColors[index % chartColors.length];
        
        return (
          <Area
            key={line.dataKey}
            type={line.type || 'monotone'}
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            strokeWidth={line.strokeWidth || 2}
            activeDot={{ r: 6 }}
            dot={line.dots !== false}
            connectNulls={line.connectNulls}
            isAnimationActive={animate}
          />
        );
      })}
    </AreaChart>
  );
  
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="w-full" style={{ height }}>
          {responsive ? (
            <ResponsiveContainer width="100%" height="100%" aspect={aspect}>
              {chart}
            </ResponsiveContainer>
          ) : (
            chart
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for theme detection
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    // Check for dark mode
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    return false;
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') setIsDark(true);
      else if (theme === 'light') setIsDark(false);
      else setIsDark(mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          mutation.target === document.documentElement
        ) {
          const htmlClass = document.documentElement.className;
          setIsDark(htmlClass.includes('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);
  
  return { isDark };
}