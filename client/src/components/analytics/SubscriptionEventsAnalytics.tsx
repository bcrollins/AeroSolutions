import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

// Interface for subscription event data
interface SubscriptionEvent {
  id: string;
  eventType: 'created' | 'updated' | 'canceled' | 'payment_failed' | 'trial_converted' | 'renewal';
  subscriptionId: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  timestamp: string;
}

interface GroupedData {
  date: string;
  created: number;
  updated: number;
  canceled: number;
  payment_failed: number;
  trial_converted: number;
  renewal: number;
}

const SubscriptionEventsAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  // Fetch subscription events data
  const { data: subscriptionEvents, isLoading } = useQuery<SubscriptionEvent[]>({
    queryKey: ['/api/analytics/subscription-events', dateRange, groupBy],
    queryFn: async () => {
      const response = await apiRequest(
        'GET', 
        `/api/analytics/subscription-events?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}&groupBy=${groupBy}`
      );
      return response.json();
    }
  });

  // Helper function to group events by date
  const groupEventsByDate = (events: SubscriptionEvent[] = []): GroupedData[] => {
    const grouped: { [key: string]: GroupedData } = {};
    
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      
      if (!grouped[date]) {
        grouped[date] = {
          date,
          created: 0,
          updated: 0,
          canceled: 0,
          payment_failed: 0,
          trial_converted: 0,
          renewal: 0
        };
      }
      
      grouped[date][event.eventType]++;
    });
    
    // Convert to array and sort by date
    return Object.values(grouped).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const groupedData = groupEventsByDate(subscriptionEvents);

  // Custom tooltip to display detailed information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-md shadow-md">
          <p className="font-semibold">{format(new Date(label), 'PPP')}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">{entry.name.replace('_', ' ')}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange(range);
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select
            value={groupBy}
            onValueChange={(value: 'day' | 'week' | 'month') => setGroupBy(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={groupedData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => format(new Date(value), 'MMM d')}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="top" 
              align="center"
              formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
            />
            <Bar 
              dataKey="created" 
              stackId="a" 
              fill="#10B981" 
              name="Created" 
            />
            <Bar 
              dataKey="trial_converted" 
              stackId="a" 
              fill="#6366F1" 
              name="Trial Converted" 
            />
            <Bar 
              dataKey="renewal" 
              stackId="a" 
              fill="#8B5CF6" 
              name="Renewal" 
            />
            <Bar 
              dataKey="updated" 
              stackId="a" 
              fill="#F59E0B" 
              name="Updated" 
            />
            <Bar 
              dataKey="payment_failed" 
              stackId="a" 
              fill="#EF4444" 
              name="Payment Failed" 
            />
            <Bar 
              dataKey="canceled" 
              stackId="a" 
              fill="#6B7280" 
              name="Canceled" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Event Count Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">New Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groupedData.reduce((acc, item) => acc + item.created, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">Cancellations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groupedData.reduce((acc, item) => acc + item.canceled, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-indigo-600">Trial Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groupedData.reduce((acc, item) => acc + item.trial_converted, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionEventsAnalytics;