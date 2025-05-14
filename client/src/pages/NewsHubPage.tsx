import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Tag, 
  Search, 
  BrainCircuit, 
  ArrowRight, 
  Filter, 
  ChevronRight,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Pagination } from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Post } from '@shared/schema';

// Define a safer version of Post type to handle potentially missing type definitions
interface SafePost extends Post {
  tags?: string[];
}

// News Hub Page component
const NewsHubPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(12);

  // Scroll to top button visibility
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Track scroll position to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Fetch posts from our API
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['/api/posts'],
    retry: 3,
    retryDelay: 1000,
  });

  // Make sure we have an array of posts with proper typing
  const allPosts: SafePost[] = Array.isArray(postsData) ? postsData : [];
  
  useEffect(() => {
    if (allPosts.length > 0) {
      console.log(`Successfully loaded ${allPosts.length} articles`);
    }
  }, [allPosts.length]);

  // Filter posts based on active tab
  const filteredPosts = React.useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];

    let filtered = [...allPosts];

    // Filter by category if not 'all'
    if (category !== 'all') {
      filtered = filtered.filter(post => post.category === category);
    }

    // Filter by tab selection
    if (activeTab !== 'all') {
      if (activeTab === 'ai') {
        filtered = filtered.filter(post => 
          post.tags?.some((tag: Tag) => tag.toLowerCase().includes('ai')) ||
          (post.category && post.category.toLowerCase().includes('ai'))
        );
      } else if (activeTab === 'business') {
        filtered = filtered.filter(post => 
          post.tags?.some((tag: Tag) => tag.toLowerCase().includes('business')) ||
          (post.category && post.category.toLowerCase().includes('business'))
        );
      } else if (activeTab === 'tech') {
        filtered = filtered.filter(post => 
          post.tags?.some((tag: Tag) => tag.toLowerCase().includes('tech')) ||
          (post.category && post.category.toLowerCase().includes('tech'))
        );
      }
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        (post.summary && post.summary.toLowerCase().includes(query)) ||
        (post.content && post.content.toLowerCase().includes(query)) ||
        (post.tags && post.tags.some((tag: Tag) => tag.toLowerCase().includes(query)))
      );
    }

    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(a.createdAt);
      const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }, [allPosts, activeTab, searchQuery, category]);

  // Get all unique categories
  const categories = React.useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];
    
    const categorySet = new Set<string>();
    
    allPosts.forEach(post => {
      if (post.category) {
        categorySet.add(post.category);
      }
    });
    
    return Array.from(categorySet);
  }, [allPosts]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPagePosts = filteredPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, category]);

  return (
    <div className="container py-12 max-w-7xl">
      <Helmet>
        <title>ROLLINSX | Knowledge Hub - Latest AI Articles</title>
        <meta 
          name="description" 
          content="Explore our comprehensive collection of AI articles, business intelligence insights, and tech innovations at ROLLINSX Knowledge Hub." 
        />
      </Helmet>

      {/* Header with breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-primary font-medium">Knowledge Hub</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
              ROLLINSX Knowledge Hub
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Explore our comprehensive collection of articles on artificial intelligence, business applications, and technology innovations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-primary text-white hover:bg-primary/90' : ''}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Grid View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-primary text-white hover:bg-primary/90' : ''}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>List View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 mb-8">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Filters</h3>
              
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search articles..." 
                  className="pl-10 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Topic Tabs */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Topics</h4>
                <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 h-auto">
                    <TabsTrigger value="all" className="text-xs py-2">All Topics</TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs py-2">AI</TabsTrigger>
                    <TabsTrigger value="business" className="text-xs py-2">Business</TabsTrigger>
                    <TabsTrigger value="tech" className="text-xs py-2">Technology</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  <div 
                    className={`py-2 px-3 rounded-md cursor-pointer flex items-center justify-between ${category === 'all' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted transition-colors'}`}
                    onClick={() => setCategory('all')}
                  >
                    <span className="text-sm">All Categories</span>
                    {category === 'all' && <ChevronRight className="h-4 w-4" />}
                  </div>
                  
                  {categories.slice(0, 8).map((cat) => (
                    <div 
                      key={cat}
                      className={`py-2 px-3 rounded-md cursor-pointer flex items-center justify-between ${category === cat ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted transition-colors'}`}
                      onClick={() => setCategory(cat)}
                    >
                      <span className="text-sm truncate">{cat}</span>
                      {category === cat && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h4 className="font-medium">Join our newsletter</h4>
            <p className="text-sm text-muted-foreground">Get the latest updates on AI, business innovations, and tech trends.</p>
            <Link href="/subscribe">
              <Button className="w-full">Subscribe</Button>
            </Link>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div>
          {/* Results header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-medium">
              {filteredPosts.length === 0 && !isLoading ? 'No articles found' : (
                searchQuery ? 
                  `${filteredPosts.length} results for "${searchQuery}"` : 
                  `Showing ${filteredPosts.length} articles`
              )}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <select 
                className="bg-background border rounded-md px-2 py-1 text-sm"
                value={postsPerPage}
                onChange={(e) => {
                  setPostsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
              </select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
          </div>
          
          {/* Loading state */}
          {isLoading ? (
            viewMode === 'grid' ? (
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
            ) : (
              <div className="space-y-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                      <Skeleton className="h-24 w-full md:w-48 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
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
                setCategory('all');
                setActiveTab('all');
              }}>Clear Filters</Button>
            </div>
          ) : (
            <>
              {/* Article Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentPagePosts.map(post => (
                    <ArticleGridCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {currentPagePosts.map(post => (
                    <ArticleListCard key={post.id} post={post} />
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={page - 1} // Our component is 0-indexed
                  totalPages={totalPages}
                  onPageChange={(newPage) => setPage(newPage + 1)} // Convert back to 1-indexed for our state
                  showFirstLastButtons={true}
                  siblingCount={1}
                  className="mt-6"
                  disabled={isLoading}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Scroll to top button */}
      {showScrollToTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-primary text-white h-10 w-10 rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

// Article Card Components
const ArticleGridCard: React.FC<{ post: Post }> = ({ post }) => {
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

const ArticleListCard: React.FC<{ post: Post }> = ({ post }) => {
  // Generate safe values
  const safeTitle = post.title || "ROLLINSX Article";
  const safeSlug = post.slug || `article-${post.id}`;
  const safeDate = post.publishedAt || post.createdAt || new Date().toISOString();
  const readTime = post.readTimeMinutes || Math.ceil((post.content?.length || 0) / 1500) || 5;
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
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
        
        <div className="p-5 flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {post.category && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                {post.category}
              </Badge>
            )}
            {post.tags && post.tags.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {post.tags[0]}
              </Badge>
            )}
          </div>
          
          <Link href={`/news/${safeSlug}`}>
            <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
              {safeTitle}
            </h3>
          </Link>
          
          <p className="text-muted-foreground mb-3">
            {post.summary || post.content?.substring(0, 150) + '...' || 'Read the full article for more information.'}
          </p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{readTime} min read</span>
              </div>
              <span>{new Date(safeDate).toLocaleDateString()}</span>
            </div>
            
            <Link href={`/news/${safeSlug}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                Read More <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NewsHubPage;