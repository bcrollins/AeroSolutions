import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, RadarChart, Radar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, Label, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ZAxis
} from 'recharts';
import { ScaleIn, Shimmer } from '@/components/UI/MicroInteractions';
import { cn } from '@/lib/utils';
import { LoadingState } from '@/components/UI/LoadingState';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Download, Share, MoreHorizontal, Maximize, BarChart2, PieChart as PieChartIcon } from 'lucide-react';

// Default color palette - Apple inspired
const COLORS = ['#0066CC', '#5AC8FA', '#007AFF', '#34C759', '#FF9500', '#FF2D55', '#AF52DE', '#FF3B30'];

// Chart types
export type ChartType = 
  | 'bar' 
  | 'line' 
  | 'area' 
  | 'pie' 
  | 'radar' 
  | 'scatter' 
  | 'composed' 
  | 'heatmap'
  | 'bubble';

// Data visualization props
export interface DataVizProps {
  className?: string;
  data: any[];
  type?: ChartType;
  title?: string;
  description?: string;
  xKey?: string;
  yKey?: string | string[];
  colorKey?: string;
  sizeKey?: string;
  width?: number | string;
  height?: number | string;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  isLoading?: boolean;
  dateFormat?: string;
  numberFormat?: string;
  minValue?: number;
  maxValue?: number;
  stacked?: boolean;
  animated?: boolean;
  aspectRatio?: number;
  barSize?: number;
  lineType?: 'linear' | 'monotone' | 'step' | 'stepAfter' | 'stepBefore';
  areaType?: 'linear' | 'monotone' | 'step' | 'stepAfter' | 'stepBefore';
  showPercentage?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  hiddenSeries?: string[];
  allowDownload?: boolean;
  downloadFormat?: 'png' | 'jpg' | 'svg' | 'csv';
  interactive?: boolean;
  style?: React.CSSProperties;
  filters?: React.ReactNode;
  onPointClick?: (data: any, index: number) => void;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  valueFormatter?: (value: any) => string;
  emptyState?: React.ReactNode;
  hideLegend?: boolean;
  showDataLabels?: boolean;
}

/**
 * DataViz - Advanced data visualization component
 */
export const DataViz: React.FC<DataVizProps> = ({
  className,
  data = [],
  type = 'bar',
  title,
  description,
  xKey = 'name',
  yKey = 'value',
  colorKey,
  sizeKey,
  width = '100%',
  height = 300,
  colors = COLORS,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  isLoading = false,
  dateFormat,
  numberFormat,
  minValue,
  maxValue,
  stacked = false,
  animated = true,
  aspectRatio = 16/9,
  barSize,
  lineType = 'monotone',
  areaType = 'monotone',
  showPercentage = false,
  innerRadius = 0,
  outerRadius = 80,
  hiddenSeries = [],
  allowDownload = false,
  downloadFormat = 'png',
  interactive = true,
  style,
  filters,
  onPointClick,
  tooltipFormatter,
  valueFormatter = (value) => value?.toString() || '',
  emptyState,
  hideLegend = false,
  showDataLabels = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<ChartType>(type);
  const [fullscreen, setFullscreen] = useState(false);
  const [visibleData, setVisibleData] = useState<any[]>(data);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  useEffect(() => {
    setVisibleData(data);
  }, [data]);
  
  // Get colors based on data item index or color key
  const getItemColor = (entry: any, index: number) => {
    if (colorKey && entry[colorKey]) {
      // Hash the colorKey value to get a consistent color
      const hash = String(entry[colorKey]).split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const colorIndex = Math.abs(hash) % colors.length;
      return colors[colorIndex];
    }
    return colors[index % colors.length];
  };
  
  // Handle point click
  const handlePointClick = (data: any, index: number) => {
    if (onPointClick && interactive) {
      onPointClick(data, index);
    }
    setActiveIndex(index === activeIndex ? null : index);
  };
  
  // Download chart as image
  const downloadChart = () => {
    if (!chartRef.current || !allowDownload) return;
    
    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) return;
    
    if (downloadFormat === 'svg') {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'chart'}.svg`;
      link.click();
      
      URL.revokeObjectURL(url);
      return;
    }
    
    if (downloadFormat === 'csv') {
      // Convert data to CSV
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(item => 
        Object.values(item).map(val => 
          typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(',')
      ).join('\n');
      
      const csvContent = `${headers}\n${rows}`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'chart-data'}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
      return;
    }
    
    // For PNG/JPG
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL(`image/${downloadFormat}`);
      link.download = `${title || 'chart'}.${downloadFormat}`;
      link.click();
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
  };
  
  // Determine if we should render multiple series
  const isMultiSeries = Array.isArray(yKey) && yKey.length > 1;
  
  // Convert yKey to array if it's a string
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];
  
  // Filter out hidden series
  const visibleYKeys = yKeys.filter(key => !hiddenSeries.includes(key));
  
  // Render empty state
  if (!isLoading && (!data || data.length === 0)) {
    return (
      <Card className={cn("overflow-hidden", className)} style={style}>
        {title && (
          <CardHeader className="pb-2">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="flex items-center justify-center" style={{ height }}>
          {emptyState || (
            <div className="text-center p-6">
              <BarChart2 className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)} style={style}>
        {title && (
          <CardHeader className="pb-2">
            <div className="w-1/2">
              <LoadingState type="text" />
            </div>
            <div className="w-2/3 mt-1">
              <LoadingState type="text" />
            </div>
          </CardHeader>
        )}
        <CardContent>
          <div className="pt-2">
            <LoadingState className="mx-auto" height={height} width={width} />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render the appropriate chart type
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%" aspect={fullscreen ? aspectRatio : undefined}>
            <BarChart 
              data={visibleData}
              barSize={barSize}
              onClick={(data) => interactive && data?.activePayload && handlePointClick(data.activePayload[0]?.payload, data.activeTooltipIndex || 0)}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              {showXAxis && <XAxis dataKey={xKey} />}
              {showYAxis && <YAxis domain={[minValue || 'auto', maxValue || 'auto']} />}
              {showTooltip && <Tooltip formatter={tooltipFormatter} />}
              {showLegend && !hideLegend && <Legend />}
              
              {stacked ? (
                // Stacked bar chart
                visibleYKeys.map((key, index) => (
                  <Bar 
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={colors[index % colors.length]}
                    isAnimationActive={animated}
                  >
                    {showDataLabels && visibleData.map((entry, index) => (
                      <Label
                        key={`label-${index}`}
                        position="top"
                        content={(props) => {
                          const value = entry[key];
                          return (
                            <text
                              x={props.x}
                              y={props.y - 6}
                              fill={colors[index % colors.length]}
                              textAnchor="middle"
                              fontSize={12}
                            >
                              {valueFormatter(value)}
                            </text>
                          );
                        }}
                      />
                    ))}
                  </Bar>
                ))
              ) : (
                // Regular bar chart
                visibleYKeys.map((key, index) => (
                  <Bar 
                    key={key}
                    dataKey={key}
                    fill={colors[index % colors.length]}
                    isAnimationActive={animated}
                  >
                    {showDataLabels && visibleData.map((entry, index) => (
                      <Label
                        key={`label-${index}`}
                        position="top"
                        content={(props) => {
                          const value = entry[key];
                          return (
                            <text
                              x={props.x}
                              y={props.y - 6}
                              fill={colors[index % colors.length]}
                              textAnchor="middle"
                              fontSize={12}
                            >
                              {valueFormatter(value)}
                            </text>
                          );
                        }}
                      />
                    ))}
                  </Bar>
                ))
              )}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%" aspect={fullscreen ? aspectRatio : undefined}>
            <LineChart 
              data={visibleData}
              onClick={(data) => interactive && data?.activePayload && handlePointClick(data.activePayload[0]?.payload, data.activeTooltipIndex || 0)}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              {showXAxis && <XAxis dataKey={xKey} />}
              {showYAxis && <YAxis domain={[minValue || 'auto', maxValue || 'auto']} />}
              {showTooltip && <Tooltip formatter={tooltipFormatter} />}
              {showLegend && !hideLegend && <Legend />}
              
              {visibleYKeys.map((key, index) => (
                <Line 
                  key={key}
                  type={lineType}
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  activeDot={{ r: 8, onClick: (data) => handlePointClick(data.payload, data.index) }}
                  isAnimationActive={animated}
                  dot={showDataLabels ? {
                    stroke: colors[index % colors.length],
                    strokeWidth: 2,
                    r: 4,
                    fill: 'white'
                  } : false}
                  label={showDataLabels ? {
                    position: 'top',
                    content: (props) => {
                      const value = props.payload[key];
                      return (
                        <text
                          x={props.x}
                          y={props.y - 10}
                          fill={colors[index % colors.length]}
                          textAnchor="middle"
                          fontSize={12}
                        >
                          {valueFormatter(value)}
                        </text>
                      );
                    }
                  } : false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%" aspect={fullscreen ? aspectRatio : undefined}>
            <AreaChart 
              data={visibleData}
              onClick={(data) => interactive && data?.activePayload && handlePointClick(data.activePayload[0]?.payload, data.activeTooltipIndex || 0)}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              {showXAxis && <XAxis dataKey={xKey} />}
              {showYAxis && <YAxis domain={[minValue || 'auto', maxValue || 'auto']} />}
              {showTooltip && <Tooltip formatter={tooltipFormatter} />}
              {showLegend && !hideLegend && <Legend />}
              
              {stacked ? (
                // Stacked area chart
                visibleYKeys.map((key, index) => (
                  <Area 
                    key={key}
                    type={areaType}
                    dataKey={key}
                    stackId="1"
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.6}
                    isAnimationActive={animated}
                  />
                ))
              ) : (
                // Regular area chart
                visibleYKeys.map((key, index) => (
                  <Area 
                    key={key}
                    type={areaType}
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.6}
                    isAnimationActive={animated}
                  />
                ))
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%" aspect={fullscreen ? aspectRatio : undefined}>
            <PieChart>
              <Pie
                data={visibleData}
                dataKey={visibleYKeys[0]}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                isAnimationActive={animated}
                onClick={(data) => handlePointClick(data, data.index)}
                label={showPercentage || showDataLabels ? {
                  position: 'outside',
                  content: (props) => {
                    const percent = Math.round(props.percent * 100);
                    const value = props.value;
                    return (
                      <text
                        x={props.x}
                        y={props.y}
                        fill="#333"
                        textAnchor={props.x > props.cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={12}
                      >
                        {showPercentage && showDataLabels
                          ? `${props.name}: ${valueFormatter(value)} (${percent}%)`
                          : showPercentage
                          ? `${percent}%`
                          : showDataLabels
                          ? `${valueFormatter(value)}`
                          : ''}
                      </text>
                    );
                  }
                } : false}
              >
                {visibleData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getItemColor(entry, index)}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip formatter={tooltipFormatter} />}
              {showLegend && !hideLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%" aspect={fullscreen ? aspectRatio : undefined}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={visibleData}>
              <PolarGrid />
              <PolarAngleAxis dataKey={xKey} />
              <PolarRadiusAxis domain={[minValue || 0, maxValue || 'auto']} />
              
              {visibleYKeys.map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                  isAnimationActive={animated}
                />
              ))}
              
              {showTooltip && <Tooltip formatter={tooltipFormatter} />}
              {showLegend && !hideLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%" aspect={fullscreen ? aspectRatio : undefined}>
            <ScatterChart onClick={(data) => interactive && data?.activePayload && handlePointClick(data.activePayload[0]?.payload, data.activeTooltipIndex || 0)}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              {showXAxis && <XAxis dataKey={xKey} domain={['auto', 'auto']} />}
              {showYAxis && <YAxis dataKey={visibleYKeys[0]} domain={[minValue || 'auto', maxValue || 'auto']} />}
              
              {sizeKey && (
                <ZAxis
                  dataKey={sizeKey}
                  range={[50, 500]}
                  scale="pow"
                />
              )}
              
              {showTooltip && <Tooltip formatter={tooltipFormatter} cursor={{ strokeDasharray: '3 3' }} />}
              {showLegend && !hideLegend && <Legend />}
              
              <Scatter
                data={visibleData}
                fill={colors[0]}
                isAnimationActive={animated}
              >
                {visibleData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getItemColor(entry, index)}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <ResponsiveContainer width="100%" height="100%" aspect={fullscreen ? aspectRatio : undefined}>
            <BarChart data={visibleData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              {showXAxis && <XAxis dataKey={xKey} />}
              {showYAxis && <YAxis />}
              {showTooltip && <Tooltip />}
              {showLegend && !hideLegend && <Legend />}
              
              {visibleYKeys.map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key} 
                  fill={colors[index % colors.length]}
                  isAnimationActive={animated}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300",
        fullscreen && "fixed inset-0 z-50 m-0 rounded-none h-screen w-screen bg-white dark:bg-slate-900",
        className
      )} 
      style={fullscreen ? { height: '100vh', width: '100vw' } : style}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex items-center space-x-2">
          {interactive && (
            <div className="flex items-center">
              <Select
                value={chartType}
                onValueChange={(value: ChartType) => setChartType(value as ChartType)}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="radar">Radar Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex gap-1">
            {allowDownload && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={downloadChart}
                title="Download chart"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setFullscreen(!fullscreen)}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {filters && (
        <div className="px-6 pb-2">
          {filters}
        </div>
      )}
      
      <CardContent>
        <div 
          ref={chartRef}
          className="w-full"
          style={{ height: fullscreen ? 'calc(100vh - 140px)' : height }}
        >
          <ScaleIn>
            {renderChart()}
          </ScaleIn>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataViz;