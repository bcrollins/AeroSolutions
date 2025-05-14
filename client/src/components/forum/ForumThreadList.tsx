import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/shadcn-pagination";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Tag,
  Search,
  Filter,
  Pin,
  Lock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Thread item skeleton for loading state
export function ThreadItemSkeleton() {
  return (
    <div className="py-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
            <Skeleton className="h-6 w-[250px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <Skeleton className="h-4 w-[70%] mb-2" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ForumThreadListProps {
  courseId?: number;
  isModerationView?: boolean;
}

const CATEGORIES = [
  "General",
  "Questions",
  "AI",
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Career",
  "Projects",
  "Resources",
  "Events",
];

export default function ForumThreadList({ courseId, isModerationView }: ForumThreadListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [moderationFilter, setModerationFilter] = useState<string>("pending");

  // Build the API endpoint based on props
  const getEndpoint = () => {
    if (isModerationView) {
      return "/api/forum/moderation/threads";
    }
    
    if (courseId) {
      return `/api/forum/courses/${courseId}/threads`;
    }
    
    return "/api/forum/threads";
  };

  // Get query parameters
  const getQueryParams = () => {
    const params: Record<string, string> = {
      page: currentPage.toString(),
      limit: "10",
    };

    if (search) {
      params.search = search;
    }

    if (category) {
      params.category = category;
    }

    if (isModerationView) {
      if (moderationFilter === "pending") {
        params.pending = "true";
      } else if (moderationFilter === "approved") {
        params.approved = "true";
      } else if (moderationFilter === "rejected") {
        params.rejected = "true";
      }
    }

    return new URLSearchParams(params);
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [getEndpoint(), currentPage, search, category, moderationFilter],
    queryFn: async () => {
      const params = getQueryParams();
      const response = await fetch(`${getEndpoint()}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }
      
      return response.json();
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setCurrentPage(1);
    refetch();
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forum Threads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 w-[300px]" />
              <Skeleton className="h-10 w-[120px]" />
            </div>
            <Separator />
            <ThreadItemSkeleton />
            <Separator />
            <ThreadItemSkeleton />
            <Separator />
            <ThreadItemSkeleton />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forum Threads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load forum threads. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const { threads, total } = data;
  const totalPages = Math.ceil(total / 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{courseId ? 'Course Discussions' : 'Forum Threads'}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and filters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search threads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {isModerationView && (
            <Select value={moderationFilter} onValueChange={setModerationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Button type="submit">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          
          {(search || category) && (
            <Button type="button" variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </form>
        
        {/* Thread List */}
        {threads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No threads found.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {threads.map((thread: any, index: number) => (
              <div key={thread.id}>
                <div className="py-4">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={thread.authorProfileImage} alt={thread.authorName || 'User'} />
                      <AvatarFallback>{(thread.authorName || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <Link to={`/forum/threads/${thread.id}`} className="hover:text-primary transition-colors">
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            {thread.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                            {thread.isLocked && <Lock className="h-4 w-4 text-orange-500" />}
                            {thread.title}
                          </h3>
                        </Link>
                        
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(thread.lastReplyAt || thread.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      
                      {thread.tags && thread.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {thread.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <Tag className="mr-1 h-3 w-3" /> {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          <span>{thread.replyCount || 0} replies</span>
                        </div>
                        
                        <div className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          <span>{thread.likesCount || 0} likes</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Eye className="mr-1 h-4 w-4" />
                          <span>{thread.views || 0} views</span>
                        </div>
                        
                        {thread.category && (
                          <Badge variant="outline">{thread.category}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {index < threads.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <CardFooter>
          <Pagination className="mx-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Logic to show pages around current page
                let pageToShow = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3 && currentPage < totalPages - 1) {
                    pageToShow = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2][i];
                  } else if (currentPage >= totalPages - 1) {
                    pageToShow = totalPages - 4 + i;
                  }
                }
                
                return (
                  <PaginationItem key={pageToShow}>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageToShow);
                      }}
                      isActive={currentPage === pageToShow}
                    >
                      {pageToShow}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
}