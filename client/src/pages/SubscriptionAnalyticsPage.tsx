import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionAnalytics from '@/components/analytics/SubscriptionAnalytics';
import SubscriptionEventsAnalytics from '@/components/analytics/SubscriptionEventsAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const SubscriptionAnalyticsPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">You need admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <AdminLayout title="Subscription Analytics">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Metrics Overview</CardTitle>
            <CardDescription>
              Track and analyze subscription performance and metrics over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="overview">Subscription Overview</TabsTrigger>
                <TabsTrigger value="events">Subscription Events</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <SubscriptionAnalytics />
              </TabsContent>
              <TabsContent value="events" className="space-y-4">
                <SubscriptionEventsAnalytics />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionAnalyticsPage;