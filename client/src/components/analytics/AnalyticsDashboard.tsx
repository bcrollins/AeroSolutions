import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  CreditCard,
  BarChart2,
  TrendingUp,
  Activity,
  Globe,
  Zap,
  Settings,
  LineChart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SubscriptionAnalytics from './SubscriptionAnalytics';
import SubscriptionEventsAnalytics from './SubscriptionEventsAnalytics';
import UserAnalytics from './UserAnalytics';

interface AnalyticsDashboardProps {
  className?: string;
}

// General overview stats for the dashboard
interface OverviewStats {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  growthRate: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  
  // Example overview stats - in a real implementation, these would come from an API
  const overviewStats: OverviewStats = {
    totalUsers: 2547,
    totalRevenue: 128450,
    activeSubscriptions: 1243,
    growthRate: 12.5
  };

  // Only allow access to users with admin role or specific owner email
  const isAuthorized = user && (
    user.role === 'admin' || 
    user.email === 'brollins565@gmail.com'
  );

  if (!isAuthorized) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              You don't have permission to access the analytics dashboard.
              Please contact an administrator if you need access.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15%
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overviewStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.activeSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.3%
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Growth Rate
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.growthRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.1%
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>
                Key metrics and performance indicators for the Rollins X platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                <p className="text-muted-foreground">
                  Overview charts and metrics will appear here
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest user actions on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-blue-100 mr-2 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-green-100 mr-2 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New subscription purchased</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-purple-100 mr-2 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Premium feature accessed</p>
                      <p className="text-xs text-muted-foreground">32 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-yellow-100 mr-2 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">International user signup</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Current system health and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Uptime</span>
                    <span className="text-sm font-medium text-green-500">99.98%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '99.98%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Response Time</span>
                    <span className="text-sm font-medium text-green-500">142ms</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Load</span>
                    <span className="text-sm font-medium text-yellow-500">45%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium text-blue-500">32%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <div className="grid gap-6">
            <SubscriptionAnalytics />
            <Card>
              <CardHeader>
                <CardTitle>Subscription Events</CardTitle>
                <CardDescription>
                  Track the lifecycle of subscriptions through various events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionEventsAnalytics />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <UserAnalytics />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Settings</CardTitle>
              <CardDescription>
                Configure data collection and reporting preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                <Settings className="h-12 w-12 text-muted-foreground opacity-50" />
                <p className="ml-4 text-muted-foreground">
                  Analytics settings and configuration will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;