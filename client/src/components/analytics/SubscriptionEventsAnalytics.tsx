import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Custom types
interface SubscriptionEvent {
  id: number;
  userId: string;
  subscriptionId: number;
  eventType: string;
  previousStatus?: string;
  newStatus?: string;
  metadata: Record<string, any>;
  timestamp: string;
  createdAt: string;
}

interface EventsByType {
  eventType: string;
  count: number;
}

interface UserWithEvents {
  userId: string;
  email: string;
  eventCount: number;
}

// Helper function to format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'PPP');
};

// Event type to color mapping
const EVENT_COLORS = {
  created: '#4ade80', // green
  updated: '#60a5fa', // blue
  canceled: '#f87171', // red
  trial_started: '#c084fc', // purple
  trial_ended: '#fb923c', // orange
  trial_converted: '#34d399', // emerald
  payment_succeeded: '#22c55e', // green
  payment_failed: '#ef4444', // red
  default: '#94a3b8' // slate
};

// Helper function to get color based on event type
const getEventColor = (eventType: string) => {
  return EVENT_COLORS[eventType as keyof typeof EVENT_COLORS] || EVENT_COLORS.default;
};

// Helper function to get badge variant based on event type
const getEventBadgeVariant = (eventType: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (eventType) {
    case 'created':
    case 'trial_converted':
    case 'payment_succeeded':
      return 'default';
    case 'canceled':
    case 'payment_failed':
      return 'destructive';
    case 'trial_started':
    case 'trial_ended':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const SubscriptionEventsAnalytics: React.FC = () => {
  // State for date filters
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState<Date>(new Date()); // today
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  // Fetch subscription events data
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/subscription-events', startDate.toISOString(), endDate.toISOString(), eventTypeFilter],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch conversion rate
  const { data: conversionRateData } = useQuery({
    queryKey: ['/api/analytics/subscription-conversion-rate', startDate.toISOString(), endDate.toISOString()],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Process data for charts
  const processedData = React.useMemo(() => {
    if (!eventsData?.events) return { eventsByType: [], recentEvents: [], activeUsers: [] };
    
    // Count events by type
    const eventCounts: Record<string, number> = {};
    eventsData.events.forEach((event: SubscriptionEvent) => {
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
    });
    
    const eventsByType = Object.entries(eventCounts).map(([eventType, count]) => ({
      eventType,
      count
    }));
    
    // Most recent events (10)
    const recentEvents = [...eventsData.events]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    
    // Most active users
    const userEventCounts: Record<string, { userId: string, email: string, count: number }> = {};
    eventsData.events.forEach((event: SubscriptionEvent) => {
      const userId = event.userId;
      const user = eventsData.users.find((u: any) => u.id === userId);
      
      if (!userEventCounts[userId]) {
        userEventCounts[userId] = {
          userId,
          email: user?.email || 'Unknown',
          count: 0
        };
      }
      
      userEventCounts[userId].count += 1;
    });
    
    const activeUsers = Object.values(userEventCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return { eventsByType, recentEvents, activeUsers };
  }, [eventsData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Events Analytics</CardTitle>
          <CardDescription>Loading subscription events data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load subscription events data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subscription Events Analytics</CardTitle>
        <CardDescription>
          Track and analyze subscription lifecycle events to optimize conversion and retention
        </CardDescription>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Date Range:</span>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[130px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[130px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Event Type:</span>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="trial_started">Trial Started</SelectItem>
                  <SelectItem value="trial_ended">Trial Ended</SelectItem>
                  <SelectItem value="trial_converted">Trial Converted</SelectItem>
                  <SelectItem value="payment_succeeded">Payment Succeeded</SelectItem>
                  <SelectItem value="payment_failed">Payment Failed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Recent Events</TabsTrigger>
            <TabsTrigger value="users">Active Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-md">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {eventsData?.events?.length || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-md">Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {eventsData?.activeSubscriptions || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-md">Trial Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {conversionRateData?.rate ? `${conversionRateData.rate.toFixed(1)}%` : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Event Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Event Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {processedData.eventsByType.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <div className="flex flex-col sm:flex-row h-full">
                        <div className="w-full sm:w-1/2 h-full">
                          <BarChart
                            data={processedData.eventsByType}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="eventType" 
                              angle={-45} 
                              textAnchor="end"
                              height={70}
                              interval={0}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar 
                              dataKey="count" 
                              name="Number of Events" 
                              fill="#3b82f6"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </div>
                        <div className="w-full sm:w-1/2 h-full">
                          <PieChart>
                            <Pie
                              data={processedData.eventsByType}
                              dataKey="count"
                              nameKey="eventType"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({ eventType, percent }) => 
                                `${eventType}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {processedData.eventsByType.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={getEventColor(entry.eventType)} 
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </div>
                      </div>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-lg text-muted-foreground">No event data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Recent Subscription Events</CardTitle>
                <CardDescription>
                  The most recent subscription lifecycle events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of recent subscription events</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status Change</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.recentEvents.length > 0 ? (
                      processedData.recentEvents.map((event) => {
                        const user = eventsData.users.find((u: any) => u.id === event.userId);
                        return (
                          <TableRow key={event.id}>
                            <TableCell>
                              <Badge variant={getEventBadgeVariant(event.eventType)}>
                                {event.eventType}
                              </Badge>
                            </TableCell>
                            <TableCell>{user?.email || 'Unknown'}</TableCell>
                            <TableCell>
                              {event.previousStatus && event.newStatus ? (
                                <span>
                                  {event.previousStatus} → {event.newStatus}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(event.timestamp)}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No recent events found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
                <CardDescription>
                  Users with the most subscription-related activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {processedData.activeUsers.length > 0 ? (
                    <div className="space-y-4">
                      {processedData.activeUsers.map((user) => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{user.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">
                              {user.count} events
                            </div>
                            <div className="relative w-40 h-3 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                                style={{
                                  width: `${Math.min(100, (user.count / (processedData.activeUsers[0]?.count || 1)) * 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-lg text-muted-foreground">No user activity data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SubscriptionEventsAnalytics;