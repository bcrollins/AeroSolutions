import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, BrainCircuit, ChevronRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

// Type definitions
interface ArticlePost {
  id: number;
  title: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  authorId?: number | null;
  category?: string | null;
  tags?: string[] | null;
  imageUrl?: string | null;
  status?: string;
  viewCount?: number;
  likeCount?: number;
  postType?: string;
  eventDate?: string | Date;
  eventLocation?: string;
  eventOrganizer?: string;
  question?: string;
  aiGeneratedBy?: string;
  readTimeMinutes?: number;
  summary?: string;
  featuredPost?: boolean;
  premium?: boolean;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string | Date | null;
}

// Basic News Hub Page component
const NewsHubPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [postsPerPage] = useState(12);

  // Fetch posts from our API
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['/api/posts'],
    retry: 3,
    retryDelay: 1000,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true, // Refresh data when user returns to the tab
  });

  // Make sure we have an array of posts
  const allPosts: ArticlePost[] = Array.isArray(postsData) ? postsData : [];
  
  useEffect(() => {
    if (postsData) {
      console.log('Posts data:', postsData);
      console.log(`Successfully loaded ${allPosts.length} articles`);
    }
  }, [postsData, allPosts.length]);

  // Filter posts based on active tab
  const filteredPosts = React.useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];

    let filtered = [...allPosts];
    
    // Filter by tab selection
    if (activeTab !== 'all') {
      if (activeTab === 'ai') {
        filtered = filtered.filter(post => 
          (post.tags && Array.isArray(post.tags) && post.tags.some((tag: string) => tag.toLowerCase().includes('ai'))) || 
          (post.category && post.category.toLowerCase().includes('ai'))
        );
      } else if (activeTab === 'business') {
        filtered = filtered.filter(post => 
          (post.tags && Array.isArray(post.tags) && post.tags.some((tag: string) => tag.toLowerCase().includes('business'))) || 
          (post.category && post.category.toLowerCase().includes('business'))
        );
      } else if (activeTab === 'tech') {
        filtered = filtered.filter(post => 
          (post.tags && Array.isArray(post.tags) && post.tags.some((tag: string) => tag.toLowerCase().includes('tech'))) || 
          (post.category && post.category.toLowerCase().includes('tech'))
        );
      } else if (activeTab === 'tutorials') {
        filtered = filtered.filter(post => 
          (post.tags && Array.isArray(post.tags) && post.tags.some((tag: string) => tag.toLowerCase().includes('tutorial') || tag.toLowerCase().includes('guide') || tag.toLowerCase().includes('how-to'))) || 
          (post.category && (post.category.toLowerCase().includes('tutorial') || post.category.toLowerCase().includes('learning'))) ||
          (post.title && post.title.toLowerCase().includes('how to'))
        );
      } else if (activeTab === 'news') {
        filtered = filtered.filter(post => 
          (post.tags && Array.isArray(post.tags) && post.tags.some((tag: string) => tag.toLowerCase().includes('news') || tag.toLowerCase().includes('update') || tag.toLowerCase().includes('announcement'))) || 
          (post.category && post.category.toLowerCase().includes('news')) ||
          (post.postType && post.postType.toLowerCase() === 'news')
        );
      }
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        (post.summary && post.summary.toLowerCase().includes(query)) ||
        (post.content && post.content.toLowerCase().includes(query))
      );
    }

    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(a.createdAt);
      const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }, [allPosts, activeTab, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPagePosts = filteredPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  return (
    <div className="container py-12 max-w-7xl">
      <Helmet>
        <title>RXAI | AI News & Articles Hub</title>
        <meta 
          name="description" 
          content="Explore our comprehensive collection of AI articles, tutorials, business intelligence insights, and tech innovations at the RXAI News Hub." 
        />
      </Helmet>

      {/* Header with breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-primary font-medium">AI News & Articles</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
              RXAI News & Articles
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Your comprehensive resource for articles on artificial intelligence, business applications, and the latest in technology innovations.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search articles..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" className="w-full md:w-auto" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Topics</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="tech">Technology</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">
            {filteredPosts.length === 0 && !isLoading ? 'No articles found' : (
              searchQuery ? 
                `${filteredPosts.length} results for "${searchQuery}"` : 
                `Showing ${filteredPosts.length} articles`
            )}
          </h2>
        </div>
      </div>
      
      {/* Content area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-medium mb-2 text-primary">
            Error loading articles
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            There was an error loading the articles. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 
              `We couldn't find any articles matching "${searchQuery}".` : 
              "No articles match the selected filters."
            }
          </p>
          <Button onClick={() => {
            setSearchQuery('');
            setActiveTab('all');
          }}>Clear Filters</Button>
        </div>
      ) : (
        <>
          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentPagePosts.map(post => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
          
          {/* Simple Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Calculate which page numbers to show
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Article Card Component
const ArticleCard = ({ post }: { post: ArticlePost }) => {
  // Generate safe values
  const safeTitle = post.title || "ROLLINSX Article";
  const safeSlug = post.slug || `article-${post.id}`;
  const safeDate = post.publishedAt || post.createdAt || new Date().toISOString();
  const readTime = post.readTimeMinutes || Math.ceil((post.content?.length || 0) / 1500) || 5;
  
  return (
    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
      <div className="h-48 w-full">
        {post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt={safeTitle} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-900/30 to-indigo-900/30 flex items-center justify-center">
            <BrainCircuit className="h-10 w-10 text-primary/40" />
          </div>
        )}
      </div>
      
      <div className="p-5">
        {post.category && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {post.category}
            </Badge>
          </div>
        )}
        
        <Link href={`/news/${safeSlug}`}>
          <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-primary transition-colors">
            {safeTitle}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {post.summary || post.content?.substring(0, 120) + '...' || 'Read the full article for more information.'}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{readTime} min read</span>
          </div>
          <span>{new Date(safeDate).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
};

export default NewsHubPage;