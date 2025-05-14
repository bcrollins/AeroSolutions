import React from 'react';
import { Helmet } from 'react-helmet';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/components/AdminLayout';
import SubscriptionAnalytics from '@/components/analytics/SubscriptionAnalytics';
import SubscriptionEventsAnalytics from '@/components/analytics/SubscriptionEventsAnalytics';
import { useAuth } from '@/hooks/useAuth';

const SubscriptionAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const isAuthorized = user && (
    user.role === 'admin' || 
    user.email === 'brollins565@gmail.com'
  );

  if (!isAuthorized) {
    return (
      <AdminLayout title="Subscription Analytics">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                You don't have permission to access the subscription analytics.
                Please contact an administrator if you need access.
              </p>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Subscription Analytics">
      <Helmet>
        <title>Subscription Analytics | ROLLINSX Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Subscription Analytics</h1>
          <p className="text-muted-foreground">
            Monitor subscription metrics, trends, and events to optimize your subscription strategy
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Metrics Overview</TabsTrigger>
            <TabsTrigger value="events">Subscription Events</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Metrics</CardTitle>
                <CardDescription>
                  Key metrics and performance indicators for subscription business model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Events Analytics</CardTitle>
                <CardDescription>
                  Track and analyze the lifecycle of subscriptions through different events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionEventsAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>
                  Track monthly recurring revenue (MRR), annual recurring revenue (ARR), and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Coming soon: Detailed revenue analytics for subscription business
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionAnalyticsPage;