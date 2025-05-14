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
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  BarChart4,
  PieChart,
  LineChart,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Define types for subscription analytics data
interface SubscriptionAnalyticsData {
  summary: {
    activeSubscriptions: number;
    trialSubscriptions: number;
    canceledSubscriptions: number;
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    conversionRate: number;
    trialConversionRate: number;
    averageSubscriptionValue: number;
    churnRate: number;
  };
  planBreakdown: {
    planId: number;
    planName: string;
    subscribers: number;
    percentageOfTotal: number;
    revenue: number;
  }[];
  recentTransactions: {
    id: number;
    userId: string;
    planName: string;
    amount: number;
    status: string;
    date: string;
  }[];
  subscriptionTrends: {
    date: string;
    newSubscriptions: number;
    cancelations: number;
    netGrowth: number;
    revenue: number;
  }[];
}

const SubscriptionAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>('30days');
  
  // Fetch subscription analytics data
  const { data, isLoading, isError, refetch } = useQuery<SubscriptionAnalyticsData>({
    queryKey: ['admin', 'subscription-analytics', timeframe],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/subscription-analytics?timeframe=${timeframe}`, null, {
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
      name: 'Active Subscriptions',
      value: data.summary.activeSubscriptions,
      icon: Users,
      change: data.subscriptionTrends[data.subscriptionTrends.length - 1]?.netGrowth > 0 
        ? `+${data.subscriptionTrends[data.subscriptionTrends.length - 1]?.netGrowth}` 
        : data.subscriptionTrends[data.subscriptionTrends.length - 1]?.netGrowth,
      trend: data.subscriptionTrends[data.subscriptionTrends.length - 1]?.netGrowth >= 0 ? 'up' : 'down',
    },
    {
      name: 'Monthly Recurring Revenue',
      value: `$${data.summary.monthlyRecurringRevenue.toLocaleString()}`,
      icon: CreditCard,
      change: '+12%',
      trend: 'up',
    },
    {
      name: 'Trial Conversion Rate',
      value: `${data.summary.trialConversionRate}%`,
      icon: RefreshCw,
      change: '+3%',
      trend: 'up',
    },
    {
      name: 'Churn Rate',
      value: `${data.summary.churnRate}%`,
      icon: ArrowDownRight,
      change: '-0.5%',
      trend: 'up',
    },
  ] : [];

  // Placeholder for when data is not available
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="text-muted-foreground mb-4">No subscription data available</p>
      <Button onClick={() => refetch()} variant="outline" className="flex items-center">
        <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Subscription Analytics</h2>
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
              <p>Error loading subscription analytics data.</p>
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
                          : 'text-red-500 flex items-center'
                      }
                    >
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {stat.change}
                    </span>{' '}
                    from previous period
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="plans">Plan Breakdown</TabsTrigger>
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="retention">Retention Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Trends</CardTitle>
                  <CardDescription>
                    Subscription growth and revenue over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <LineChart className="h-16 w-16 text-muted-foreground opacity-50" />
                    <p className="ml-4 text-muted-foreground">
                      Subscription trend visualization will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Lifetime Value</CardTitle>
                    <CardDescription>
                      Average revenue per subscription over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full flex items-center justify-center">
                      <BarChart4 className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Health</CardTitle>
                    <CardDescription>
                      Current state of subscription metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Trial Conversion</span>
                        <span className="text-sm font-medium">{data.summary.trialConversionRate}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${data.summary.trialConversionRate}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Churn Rate</span>
                        <span className="text-sm font-medium">{data.summary.churnRate}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${data.summary.churnRate}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Annual Plan Adoption</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="plans" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of subscribers by plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-center">
                      <PieChart className="h-24 w-24 text-muted-foreground opacity-50" />
                    </div>
                    <div className="md:col-span-2">
                      {data.planBreakdown.map((plan) => (
                        <div key={plan.planId} className="flex justify-between items-center mb-4">
                          <div>
                            <p className="font-medium">{plan.planName}</p>
                            <p className="text-sm text-muted-foreground">{plan.subscribers} subscribers</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${plan.revenue.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{plan.percentageOfTotal}% of total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Latest subscription payments and renewals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {data.recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center border-b pb-4">
                          <div>
                            <p className="font-medium">{transaction.planName}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{transaction.date}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {transaction.amount.toFixed(2)}
                            </p>
                            <p className={`text-xs ${
                              transaction.status === 'successful' 
                                ? 'text-green-500' 
                                : transaction.status === 'failed' 
                                  ? 'text-red-500' 
                                  : 'text-yellow-500'
                            }`}>
                              {transaction.status.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent transactions found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="retention" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Retention Analysis</CardTitle>
                  <CardDescription>
                    Subscription retention cohorts and patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Retention cohort analysis visualization will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Reasons</CardTitle>
                  <CardDescription>
                    Analysis of subscription cancellation reasons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Cancellation reason analysis will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        emptyState
      )}
    </div>
  );
};

export default SubscriptionAnalytics;