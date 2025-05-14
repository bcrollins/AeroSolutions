import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ContentCalendarList from '@/components/content-calendar/ContentCalendarList';
import CreateCalendarForm from '@/components/content-calendar/CreateCalendarForm';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ContentCalendar() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch calendars
  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/api/content-calendar'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
  };

  // Filter calendars based on active tab
  const getFilteredCalendars = () => {
    if (!data?.calendars) return [];

    switch (activeTab) {
      case 'active':
        return data.calendars.filter(calendar => 
          calendar.status !== 'archived' && 
          new Date(calendar.endDate) >= new Date()
        );
      case 'completed':
        return data.calendars.filter(calendar => 
          new Date(calendar.endDate) < new Date()
        );
      case 'all':
      default:
        return data.calendars;
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Content Calendar</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage AI-generated content for your social media platforms
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Calendar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Content Calendar</DialogTitle>
                <DialogDescription>
                  Set up your content calendar preferences and AI will generate personalized content for your brand.
                </DialogDescription>
              </DialogHeader>
              <CreateCalendarForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">All Calendars</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <ContentCalendarList 
          calendars={getFilteredCalendars()} 
          isLoading={isLoading}
          onRefresh={refetch}
        />
      </div>
    </DashboardLayout>
  );
}