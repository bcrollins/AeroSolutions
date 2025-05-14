import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Plus, RefreshCw, Filter, Facebook, Instagram, BarChart3, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ContentCalendarList from "@/components/content-calendar/ContentCalendarList";
import CreateCalendarForm from "@/components/content-calendar/CreateCalendarForm";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ContentCalendar() {
  const [location, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("calendars");
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  const { data: calendars, isLoading: calendarsLoading, refetch } = useQuery({
    queryKey: ["/api/content-calendar"],
    enabled: isAuthenticated
  });
  
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Calendar list has been refreshed",
    });
  };
  
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>AI Content Calendar Creator</CardTitle>
              <CardDescription>
                You need to be logged in to access this feature.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-4">
                Please log in to create and manage your AI-generated content calendars.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => window.location.href = '/api/login'}>
                Log In
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Content Calendar Creator</h1>
              <p className="text-muted-foreground">Generate custom content calendars for multiple social media platforms</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setSelectedTab("create")}>
                <Plus className="h-4 w-4 mr-2" />
                New Calendar
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Content Tabs */}
          <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="calendars">My Calendars</TabsTrigger>
              <TabsTrigger value="create">Create Calendar</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendars">
              <ContentCalendarList
                calendars={calendars?.calendars || []}
                isLoading={calendarsLoading}
                onRefresh={refetch}
              />
            </TabsContent>
            
            <TabsContent value="create">
              <CreateCalendarForm onSuccess={() => {
                setSelectedTab("calendars");
                refetch();
              }} />
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance Analytics</CardTitle>
                  <CardDescription>
                    Track how your AI-generated content is performing across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Analytics dashboard is coming soon
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Track engagement, reach, and performance of your content across platforms
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Settings</CardTitle>
                  <CardDescription>
                    Configure your preferences for AI content generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Settings panel is coming soon
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Configure AI preferences, default platforms, and content templates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}