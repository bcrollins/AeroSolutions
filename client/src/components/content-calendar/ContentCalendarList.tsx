import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Calendar, Facebook, Twitter, Instagram, RefreshCw, MoreHorizontal, Trash2, Edit, Copy, Clipboard, Clock, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const { toast } = useToast();
  
  const filteredCalendars = calendars
    .filter(calendar => 
      calendar.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      calendar.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calendar.industry.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(calendar => 
      filterPlatform === "all" || calendar.platforms.includes(filterPlatform)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  
  const handleDeleteCalendar = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/content-calendar/${id}`);
      toast({
        title: "Calendar deleted",
        description: "Content calendar has been deleted successfully."
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the calendar. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'X':
        return <Twitter className="h-4 w-4" />;
      case 'Facebook':
        return <Facebook className="h-4 w-4" />;
      case 'Instagram':
        return <Instagram className="h-4 w-4" />;
      case 'Threads':
        return <Clipboard className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Ready</Badge>;
      case 'generating':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Generating</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search calendars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-1/4">
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="X">X (Twitter)</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Threads">Threads</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="hidden md:block ml-auto">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {filteredCalendars.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {calendars.length === 0 
                ? "You haven't created any content calendars yet"
                : "No calendars match your search criteria"}
            </p>
            {calendars.length === 0 && (
              <Button className="mt-4" asChild>
                <Link href="/content-calendar?tab=create">Create your first calendar</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCalendars.map((calendar) => (
            <Card key={calendar.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{calendar.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/content-calendar/${calendar.id}`}>
                          <Eye className="h-4 w-4 mr-2" /> View Calendar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/content-calendar/${calendar.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" /> Edit Calendar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/content-calendar/${calendar.id}/analytics`}>
                          <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Calendar
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the calendar "{calendar.name}" and all its content.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteCalendar(calendar.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{calendar.brandName} • {calendar.industry}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex space-x-2 my-2">
                    {calendar.platforms.map((platform) => (
                      <Badge key={platform} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                        {getPlatformIcon(platform)}
                        <span>{platform}</span>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {format(new Date(calendar.startDate), 'MMM d, yyyy')} - {format(new Date(calendar.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {calendar.frequency.charAt(0).toUpperCase() + calendar.frequency.slice(1)} posts
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    {getStatusBadge(calendar.status)}
                    {calendar.lastGeneratedAt && (
                      <span className="text-xs text-muted-foreground">
                        Last generated: {format(new Date(calendar.lastGeneratedAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/content-calendar/${calendar.id}`}>
                    View Calendar
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}