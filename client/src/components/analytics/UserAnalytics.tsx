import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Users,
  Clock,
  Activity,
  RefreshCw,
  Search,
  Map,
  BarChart4,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Define types for user analytics data
interface UserAnalyticsData {
  summary: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    averageSessionDuration: number;
    userGrowthRate: number;
    bounceRate: number;
    usersByDevice: {
      mobile: number;
      desktop: number;
      tablet: number;
    };
    usersByBrowser: {
      [key: string]: number;
    };
  };
  userActivity: {
    date: string;
    pageViews: number;
    uniqueUsers: number;
    avgSessionTime: number;
    registrations: number;
  }[];
  topUsers: {
    id: string;
    username?: string;
    email: string;
    totalSessions: number;
    lastActive: string;
    totalTimeSpent: number;
    role: string;
    registrationDate: string;
  }[];
  geoDistribution: {
    country: string;
    users: number;
    percentage: number;
  }[];
}

const UserAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>('30days');
  const [userFilter, setUserFilter] = useState<string>('');
  
  // Fetch user analytics data
  const { data, isLoading, isError, refetch } = useQuery<UserAnalyticsData>({
    queryKey: ['admin', 'user-analytics', timeframe],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/user-analytics?timeframe=${timeframe}`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      return response.json();
    }
  });

  // Stats cards for key metrics
  const summaryStats = data?.summary ? [
    {
      name: 'Total Users',
      value: data.summary.totalUsers,
      icon: Users,
      change: `+${data.summary.newUsers}`,
      trend: 'up',
    },
    {
      name: 'Active Users',
      value: data.summary.activeUsers,
      icon: Activity,
      change: `${Math.round((data.summary.activeUsers / data.summary.totalUsers) * 100)}%`,
      trend: 'neutral',
      subtitle: 'of total users'
    },
    {
      name: 'Avg. Session Duration',
      value: `${Math.round(data.summary.averageSessionDuration / 60)}m ${data.summary.averageSessionDuration % 60}s`,
      icon: Clock,
      change: '+5%',
      trend: 'up',
    },
    {
      name: 'Bounce Rate',
      value: `${data.summary.bounceRate}%`,
      icon: ArrowDownRight,
      change: '-2%',
      trend: 'up',
    },
  ] : [];

  // Filter top users based on search input
  const filteredUsers = data?.topUsers.filter(user => 
    user.email.toLowerCase().includes(userFilter.toLowerCase()) || 
    (user.username && user.username.toLowerCase().includes(userFilter.toLowerCase()))
  );

  // Placeholder for when data is not available
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="text-muted-foreground mb-4">No user analytics data available</p>
      <Button onClick={() => refetch()} variant="outline" className="flex items-center">
        <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">User Analytics</h2>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-500">
              <p>Error loading user analytics data.</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {summaryStats.map((stat) => (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span
                      className={
                        stat.trend === 'up'
                          ? 'text-green-500 flex items-center'
                          : stat.trend === 'down'
                            ? 'text-red-500 flex items-center'
                            : 'text-muted-foreground flex items-center'
                      }
                    >
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : stat.trend === 'down' ? (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      ) : null}
                      {stat.change}
                    </span>{' '}
                    {stat.subtitle || 'from previous period'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList>
              <TabsTrigger value="activity">User Activity</TabsTrigger>
              <TabsTrigger value="top-users">Top Users</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="devices">Devices & Browsers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity Trends</CardTitle>
                  <CardDescription>
                    Page views and active users over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <BarChart4 className="h-16 w-16 text-muted-foreground opacity-50" />
                    <p className="ml-4 text-muted-foreground">
                      User activity visualization will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity by Hour</CardTitle>
                    <CardDescription>
                      When users are most active
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full flex items-center justify-center">
                      <Clock className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Activity by Day</CardTitle>
                    <CardDescription>
                      User engagement throughout the week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="top-users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Active Users</CardTitle>
                  <CardDescription>
                    Users with the most activity on the platform
                  </CardDescription>
                  <div className="pt-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by email or username"
                        className="pl-8"
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredUsers && filteredUsers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Last Active</TableHead>
                          <TableHead>Sessions</TableHead>
                          <TableHead>Time Spent</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div>
                                {user.username || user.email.split('@')[0]}
                                {user.email === 'brollins565@gmail.com' && (
                                  <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">Owner</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.lastActive}</TableCell>
                            <TableCell>{user.totalSessions}</TableCell>
                            <TableCell>
                              {Math.floor(user.totalTimeSpent / 60)}m {user.totalTimeSpent % 60}s
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {userFilter ? 'No users match your search' : 'No user data available'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="demographics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Geographical Distribution</CardTitle>
                  <CardDescription>
                    Where your users are located
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center justify-center md:w-1/2">
                      <Map className="h-24 w-24 text-muted-foreground opacity-50" />
                    </div>
                    <div className="md:w-1/2">
                      {data.geoDistribution.map((geo) => (
                        <div key={geo.country} className="flex justify-between items-center mb-4">
                          <div>
                            <p className="font-medium">{geo.country}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{geo.users} users</p>
                            <p className="text-sm text-muted-foreground">{geo.percentage}% of total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="devices" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Types</CardTitle>
                    <CardDescription>
                      Breakdown of users by device type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                            <path d="M12 18h.01" />
                          </svg>
                          Mobile
                        </span>
                        <span className="text-sm font-medium">{data.summary.usersByDevice.mobile} users</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ 
                          width: `${(data.summary.usersByDevice.mobile / data.summary.totalUsers) * 100}%` 
                        }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                          </svg>
                          Desktop
                        </span>
                        <span className="text-sm font-medium">{data.summary.usersByDevice.desktop} users</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ 
                          width: `${(data.summary.usersByDevice.desktop / data.summary.totalUsers) * 100}%` 
                        }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                            <line x1="12" y1="18" x2="12" y2="18.01" />
                          </svg>
                          Tablet
                        </span>
                        <span className="text-sm font-medium">{data.summary.usersByDevice.tablet} users</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div className="bg-purple-500 h-2.5 rounded-full" style={{ 
                          width: `${(data.summary.usersByDevice.tablet / data.summary.totalUsers) * 100}%` 
                        }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Browser Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of users by browser
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(data.summary.usersByBrowser).map(([browser, count]) => (
                        <div key={browser} className="flex justify-between items-center">
                          <span className="text-sm">{browser}</span>
                          <span className="text-sm font-medium">{count} users</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        emptyState
      )}
    </div>
  );
};

export default UserAnalytics;