import React from 'react';

interface ChartProps {
  data: any[];
  index: string;
  categories?: string[];
  category?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const AreaChart: React.FC<ChartProps> = ({ 
  data, 
  index, 
  categories = [], 
  colors = [], 
  valueFormatter, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center text-sm text-muted-foreground">
        [Area Chart Component]
      </div>
    </div>
  );
};

export const BarChart: React.FC<ChartProps> = ({ 
  data, 
  index, 
  categories = [], 
  colors = [], 
  valueFormatter, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center text-sm text-muted-foreground">
        [Bar Chart Component]
      </div>
    </div>
  );
};

export const LineChart: React.FC<ChartProps> = ({ 
  data, 
  index, 
  categories = [], 
  colors = [], 
  valueFormatter, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center text-sm text-muted-foreground">
        [Line Chart Component]
      </div>
    </div>
  );
};

export const PieChart: React.FC<ChartProps> = ({ 
  data, 
  index, 
  category = '', 
  colors = [], 
  valueFormatter, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center text-sm text-muted-foreground">
        [Pie Chart Component]
      </div>
    </div>
  );
};