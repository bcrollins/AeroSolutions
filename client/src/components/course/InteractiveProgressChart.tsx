import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  LineChart, 
  PieChart, 
  Star, 
  Target, 
  Zap
} from 'lucide-react';

interface ProgressDataPoint {
  day: string;
  minutes: number;
  lessons: number;
  streak: boolean;
}

interface LearningMetric {
  label: string;
  value: number;
  previousValue: number;
  icon: React.ReactNode;
  color: string;
}

interface InteractiveProgressChartProps {
  totalCourseProgress: number;
  weeklyData: ProgressDataPoint[];
  metrics: LearningMetric[];
  streakCount: number;
  onTabChange?: (tab: string) => void;
}

const InteractiveProgressChart: React.FC<InteractiveProgressChartProps> = ({
  totalCourseProgress,
  weeklyData,
  metrics,
  streakCount,
  onTabChange
}) => {
  const [selectedTab, setSelectedTab] = useState('weekly');
  const [isVisible, setIsVisible] = useState(false);
  
  // Get the last 7 days for labels
  const getDayLabel = (offset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  const dayLabels = Array.from({ length: 7 }, (_, i) => getDayLabel(6 - i));
  
  // Calculate metrics
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes));
  const totalWeekMinutes = weeklyData.reduce((acc, curr) => acc + curr.minutes, 0);
  const totalWeekLessons = weeklyData.reduce((acc, curr) => acc + curr.lessons, 0);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };
  
  // Animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate sparkline paths
  const getSparklinePath = (data: number[], height: number = 40): string => {
    const max = Math.max(...data, 1);
    const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${(1 - val / max) * height}`);
    return `M${points.join(' L')}`;
  };
  
  // Generate color based on progress
  const getProgressColor = (progress: number): string => {
    if (progress < 30) return 'rgb(239, 68, 68)';
    if (progress < 70) return 'rgb(250, 204, 21)';
    return 'rgb(34, 197, 94)';
  };
  
  return (
    <Card className="bg-gray-800 border-gray-700 p-6 overflow-hidden">
      <Tabs defaultValue="weekly" className="w-full" onValueChange={handleTabChange}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Learning Progress</h3>
          <TabsList className="bg-gray-700">
            <TabsTrigger value="weekly" className="data-[state=active]:bg-electric-cyan-500">
              <BarChart3 className="w-4 h-4 mr-1" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-electric-cyan-500">
              <LineChart className="w-4 h-4 mr-1" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="focus" className="data-[state=active]:bg-electric-cyan-500">
              <Target className="w-4 h-4 mr-1" />
              Focus
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="weekly" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
              const percentChange = metric.previousValue > 0 
                ? ((metric.value - metric.previousValue) / metric.previousValue) * 100
                : 0;
              const isPositive = percentChange >= 0;
              
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="bg-gray-750 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className={`rounded-full p-2 ${metric.color}`}>
                      {metric.icon}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${isPositive ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                      {isPositive ? '+' : ''}{percentChange.toFixed(0)}%
                    </div>
                  </div>
                  <h4 className="mt-3 text-sm text-gray-400">{metric.label}</h4>
                  <div className="mt-1 text-2xl font-bold">{metric.value}</div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-300">Daily Study Time (minutes)</h4>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{totalWeekMinutes} min total</span>
              </div>
            </div>
            
            <div className="relative h-[140px] mt-6">
              {weeklyData.map((day, index) => {
                const normalizedHeight = (day.minutes / maxMinutes) * 100;
                const hasStreak = day.streak;
                
                return (
                  <div 
                    key={index} 
                    className="absolute bottom-0 flex flex-col items-center justify-end"
                    style={{ left: `${(index / (weeklyData.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="relative">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: isVisible ? `${normalizedHeight}%` : 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                        className={`w-6 rounded-t-md ${hasStreak ? 'bg-electric-cyan-500' : 'bg-gray-600'}`}
                      />
                      {hasStreak && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0 }}
                          transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                          className="absolute -top-2 -right-2"
                        >
                          <Zap className="w-4 h-4 text-yellow-400" />
                        </motion.div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">{dayLabels[index]}</div>
                  </div>
                );
              })}
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                <div>{maxMinutes}</div>
                <div>{Math.round(maxMinutes / 2)}</div>
                <div>0</div>
              </div>
            </div>
          </div>
          
          {/* Streak information */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-4 p-4 bg-gray-750 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold"
                >
                  {streakCount > 9 ? '9+' : streakCount}
                </motion.div>
              </div>
              <div>
                <h4 className="font-bold">Current Streak: {streakCount} days</h4>
                <p className="text-sm text-gray-400">Keep learning daily to maintain your streak!</p>
              </div>
            </div>
            <div className="text-xs bg-gray-700 px-2 py-1 rounded-full">
              Best: {Math.max(streakCount, 7)} days
            </div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="trends">
          <div className="h-[200px] flex items-center justify-center text-gray-400">
            <LineChart className="w-5 h-5 mr-2" />
            Detailed trends will appear after more study sessions
          </div>
        </TabsContent>
        
        <TabsContent value="focus">
          <div className="h-[200px] flex items-center justify-center text-gray-400">
            <Target className="w-5 h-5 mr-2" />
            Focus metrics are being calculated
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default InteractiveProgressChart;