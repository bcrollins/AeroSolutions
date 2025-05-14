import { useState } from 'react';
import { Calendar, Edit, Eye, MoreHorizontal, Plus, RefreshCw, Trash } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Types
type ContentCalendar = {
  id: number;
  name: string;
  brandName: string;
  industry: string;
  platforms: string[];
  startDate: string;
  endDate: string;
  frequency: string;
  status: string;
  lastGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
};

interface ContentCalendarListProps {
  calendars: ContentCalendar[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ContentCalendarList({ calendars, isLoading, onRefresh }: ContentCalendarListProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-500">Ready</Badge>;
      case 'generating':
        return <Badge className="bg-amber-500">Generating</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleGenerateContent = async (calendarId: number) => {
    try {
      setIsGenerating(calendarId);
      const response = await apiRequest(
        'POST',
        `/api/content-calendar/${calendarId}/generate`,
        { count: 10 }
      );
      
      const data = await response.json();
      
      toast({
        title: 'Content generated successfully',
        description: `Generated ${data.count} content items for your calendar`,
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error generating content',
        description: 'Failed to generate content. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDeleteCalendar = (id: number) => {
    setCalendarToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!calendarToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/content-calendar/${calendarToDelete}`);
      
      toast({
        title: 'Calendar deleted',
        description: 'Content calendar has been successfully deleted',
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error deleting calendar',
        description: 'Failed to delete the calendar. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCalendarToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24 rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No content calendars</CardTitle>
          <CardDescription className="text-center mb-6">
            You haven't created any content calendars yet. Create one to get started.
          </CardDescription>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create new calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Content Calendars</h2>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {calendars.map((calendar) => (
          <Card key={calendar.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="mb-1">{calendar.name}</CardTitle>
                  <CardDescription>
                    Brand: {calendar.brandName} | Industry: {calendar.industry}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit calendar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={() => handleDeleteCalendar(calendar.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {calendar.platforms.map((platform) => (
                  <Badge key={platform} variant="outline">{platform}</Badge>
                ))}
                {getStatusBadge(calendar.status)}
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex flex-col space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="font-medium">{calendar.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-medium">
                    {format(parseISO(calendar.startDate), 'MMM dd, yyyy')} - 
                    {format(parseISO(calendar.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                {calendar.lastGeneratedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Generated:</span>
                    <span className="font-medium">
                      {format(parseISO(calendar.lastGeneratedAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={`/content-calendar/${calendar.id}`}>View Content</a>
              </Button>
              <Button
                size="sm"
                disabled={isGenerating === calendar.id || calendar.status === 'generating'}
                onClick={() => handleGenerateContent(calendar.id)}
              >
                {isGenerating === calendar.id ? 'Generating...' : 'Generate Content'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this calendar and all its content items. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}