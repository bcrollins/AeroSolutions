import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, BrainCircuit, ChevronRight, Clock, X, BookOpen, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useSoundEffects } from '@/hooks/use-sound-effects';

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
  
  // Initialize sound effects
  const { playSound } = useSoundEffects();

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
      
      // Play a success sound when articles load
      if (allPosts.length > 0) {
        playSound('success');
      }
    }
  }, [postsData, allPosts.length, playSound]);

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

      {/* Enhanced Search and Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
          <div className="relative md:col-span-5">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 transition-colors" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10 h-11 border-blue-100 focus:border-blue-300 focus:ring-blue-300 shadow-sm rounded-lg group-hover:border-blue-200 transition-all"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length % 3 === 0 && e.target.value.length > 0) {
                    // Play sound every 3 characters typed for subtle feedback
                    playSound('hover');
                  }
                }}
                onFocus={() => playSound('click')}
              />
              {searchQuery && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors"
                  onClick={() => {
                    setSearchQuery('');
                    playSound('notification');
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          
          <div className="md:col-span-7 w-full">
            <Tabs 
              defaultValue="all" 
              className="w-full" 
              value={activeTab} 
              onValueChange={(value) => {
                setActiveTab(value);
                playSound('click');
              }}
            >
              <TabsList className="w-full grid grid-cols-6 bg-blue-50/50 rounded-xl p-1 h-11">
                <TabsTrigger 
                  value="all" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  All Topics
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  AI
                </TabsTrigger>
                <TabsTrigger 
                  value="business" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  Business
                </TabsTrigger>
                <TabsTrigger 
                  value="tech" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  Technology
                </TabsTrigger>
                <TabsTrigger 
                  value="tutorials" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  Tutorials
                </TabsTrigger>
                <TabsTrigger 
                  value="news" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  News
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Results header with animation */}
        <div className="flex items-center justify-between mb-6 py-2 border-b border-blue-100">
          <h2 className="text-xl font-medium text-blue-800">
            {isLoading ? (
              <Skeleton className="h-7 w-48" />
            ) : filteredPosts.length === 0 ? (
              'No articles found'
            ) : (
              <span className="flex items-center">
                {searchQuery ? (
                  <>
                    <span className="text-blue-600 font-semibold">{filteredPosts.length}</span>
                    <span className="mx-1">results for</span>
                    <span className="text-blue-600 font-semibold">"{searchQuery}"</span>
                  </>
                ) : (
                  <>
                    Showing <span className="text-blue-600 font-semibold mx-1">{filteredPosts.length}</span> articles
                  </>
                )}
              </span>
            )}
          </h2>
          
          {/* Additional sort options could be added here */}
        </div>
      </div>
      
      {/* Content area */}
      {isLoading ? (
        <div className="space-y-8">
          {/* Loading state for featured articles */}
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 h-80">
                <div className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-8 w-full mb-3" />
                  <Skeleton className="h-8 w-3/4 mb-6" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-6" />
                  <Skeleton className="h-4 w-32 mt-4" />
                </div>
                <Skeleton className="h-full w-full" />
              </div>
            </Card>
          </div>
          
          {/* Loading state for regular articles */}
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-full mt-4" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-xl font-medium mb-2 text-blue-600">
            Error loading articles
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            There was an error loading the articles. Please try again later.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Refresh Page
          </Button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-xl font-medium mb-2 text-blue-600">No articles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 
              `We couldn't find any articles matching "${searchQuery}".` : 
              "No articles match the selected filters."
            }
          </p>
          <Button 
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Featured Articles Section - only show if not searching */}
          {!searchQuery && activeTab === 'all' && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-blue-600 flex items-center">
                <span className="relative">
                  Featured Articles
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600/30 rounded"></span>
                </span>
              </h2>
              
              <div className="grid grid-cols-1 gap-8">
                {filteredPosts
                  .filter(post => post.featuredPost)
                  .slice(0, 1)
                  .map(post => (
                    <ArticleCard key={post.id} post={post} featured={true} />
                  ))}
                  
                {filteredPosts.filter(post => post.featuredPost).length === 0 && (
                  // If no featured posts, use the most recent post
                  filteredPosts.slice(0, 1).map(post => (
                    <ArticleCard key={post.id} post={post} featured={true} />
                  ))
                )}
              </div>
            </section>
          )}
          
          {/* Latest Articles Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-blue-600 flex items-center">
              <span className="relative">
                {activeTab === 'all' ? 'Latest Articles' : (
                  activeTab === 'ai' ? 'AI Articles' :
                  activeTab === 'business' ? 'Business Articles' :
                  activeTab === 'tech' ? 'Technology Articles' :
                  activeTab === 'tutorials' ? 'Tutorials' : 'Latest News'
                )}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600/30 rounded"></span>
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Skip the first post if it's featured and we're showing all posts */}
              {currentPagePosts
                .filter((post, index) => !(
                  index === 0 && 
                  !searchQuery && 
                  activeTab === 'all' && 
                  (post.featuredPost || filteredPosts.filter(p => p.featuredPost).length === 0)
                ))
                .map(post => (
                  <ArticleCard key={post.id} post={post} />
                ))}
            </div>
          </section>
          
          {/* Improved Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  playSound('click');
                }}
                disabled={page === 1}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
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
                      onClick={() => {
                        setPage(pageNum);
                        playSound('click');
                      }}
                      className={page === pageNum ? 
                        "w-10 bg-blue-600 hover:bg-blue-700" : 
                        "w-10 border-blue-200 text-blue-600 hover:bg-blue-50"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setPage(p => Math.min(totalPages, p + 1));
                  playSound('click');
                }}
                disabled={page === totalPages}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Article Card Component
const ArticleCard = ({ post, featured = false }: { post: ArticlePost, featured?: boolean }) => {
  // Access sound effects
  const { playSound } = useSoundEffects();
  
  // Generate safe values
  const safeTitle = post.title || "RXAI Article";
  const safeSlug = post.slug || `article-${post.id}`;
  const safeDate = post.publishedAt || post.createdAt || new Date().toISOString();
  const readTime = post.readTimeMinutes || Math.ceil((post.content?.length || 0) / 1500) || 5;
  
  // Use a different layout for featured articles
  if (featured) {
    return (
      <Card 
        className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg group"
        onMouseEnter={() => playSound('hover')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          <div className="h-full md:order-2">
            {post.imageUrl ? (
              <img 
                src={post.imageUrl} 
                alt={safeTitle} 
                className="h-full w-full object-cover" 
                onError={(e) => {
                  // Replace broken image with a fallback gradient and icon
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.classList.add('bg-gradient-to-br', 'from-blue-600/20', 'to-indigo-600/20', 'flex', 'items-center', 'justify-center');
                  
                  // Create and append an icon element
                  const icon = document.createElement('div');
                  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-16 w-16 text-blue-500/30"><path d="M12 2v1m0 18v1m9-9h-1M4 12H3m15.364 6.364-.7071-.7071M6.34315 6.34315l-.70711-.70711m12.72796.00003-.7071.70708M6.3432 17.6569l-.70711.7071M16 12c0 2.2091-1.7909 4-4 4-2.20914 0-4-1.7909-4-4 0-2.20914 1.79086-4 4-4 2.2091 0 4 1.79086 4 4Z"></path></svg>`;
                  target.parentElement!.appendChild(icon);
                }}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                <BrainCircuit className="h-16 w-16 text-blue-500/30" />
              </div>
            )}
          </div>
          
          <div className="p-6 flex flex-col justify-between md:order-1">
            {post.category && (
              <div className="mb-3">
                <Badge variant="outline" className="text-xs rounded-full px-3 py-0.5 bg-blue-500/10 text-blue-600 border-blue-500/20 font-medium">
                  {post.category}
                </Badge>
                {post.featuredPost && (
                  <Badge variant="outline" className="ml-2 text-xs rounded-full px-3 py-0.5 bg-amber-500/10 text-amber-600 border-amber-500/20 font-medium">
                    Featured
                  </Badge>
                )}
              </div>
            )}
            
            <div>
              <Link 
                href={`/news/${safeSlug}`} 
                onClick={() => playSound('click')}
              >
                <h3 className="text-xl md:text-2xl font-bold mb-3 line-clamp-3 group-hover:text-blue-600 transition-colors">
                  {safeTitle}
                </h3>
              </Link>
              
              <p className="text-muted-foreground text-sm md:text-base mb-4 line-clamp-3">
                {post.summary || post.content?.substring(0, 160) + '...' || 'Read the full article for more information.'}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground pt-3 border-t">
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{readTime} min read</span>
              </div>
              <span>{new Date(safeDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  // Regular article card
  return (
    <Card 
      className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg group border border-transparent hover:border-blue-100"
      onMouseEnter={() => playSound('hover')}
    >
      <div className="h-48 w-full relative">
        {post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt={safeTitle} 
            className="h-full w-full object-cover" 
            onError={(e) => {
              // Replace broken image with a fallback gradient and icon
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.classList.add('bg-gradient-to-br', 'from-blue-600/10', 'to-indigo-600/10', 'flex', 'items-center', 'justify-center');
              
              // Create and append an icon element based on article category
              const icon = document.createElement('div');
              
              if (post.category?.toLowerCase().includes('ai')) {
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-10 w-10 text-blue-500/30"><path d="M12 2v1m0 18v1m9-9h-1M4 12H3m15.364 6.364-.7071-.7071M6.34315 6.34315l-.70711-.70711m12.72796.00003-.7071.70708M6.3432 17.6569l-.70711.7071M16 12c0 2.2091-1.7909 4-4 4-2.20914 0-4-1.7909-4-4 0-2.20914 1.79086-4 4-4 2.2091 0 4 1.79086 4 4Z"></path></svg>`;
              } else if (post.category?.toLowerCase().includes('business')) {
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-10 w-10 text-blue-500/30"><path d="M3 12H5M5 12C7.76142 12 10 9.76142 10 7C10 4.23858 7.76142 2 5 2H3V22H5C7.76142 22 10 19.7614 10 17C10 14.2386 7.76142 12 5 12Z"></path><path d="M21 12H19M19 12C16.2386 12 14 9.76142 14 7C14 4.23858 16.2386 2 19 2H21V22H19C16.2386 22 14 19.7614 14 17C14 14.2386 16.2386 12 19 12Z"></path></svg>`;
              } else {
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-10 w-10 text-blue-500/30"><path d="M21 12a9 9.00001 0 11-18 0 9 9.00001 0 0118 0z"></path><path d="M12 8v4l2.5 2.5"></path></svg>`;
              }
              
              target.parentElement!.appendChild(icon);
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-600/10 to-indigo-600/10 flex items-center justify-center">
            <BrainCircuit className="h-10 w-10 text-blue-500/30" />
          </div>
        )}
        
        {/* New element: if article is less than 3 days old */}
        {(new Date().getTime() - new Date(safeDate).getTime()) / (1000 * 60 * 60 * 24) < 3 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-medium">New</Badge>
          </div>
        )}
      </div>
      
      <div className="p-5">
        {post.category && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs rounded-full px-3 py-0.5 bg-blue-500/10 text-blue-600 border-blue-500/20 font-medium">
              {post.category}
            </Badge>
          </div>
        )}
        
        <Link 
          href={`/news/${safeSlug}`}
          onClick={() => playSound('click')}
        >
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {safeTitle}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {post.summary || post.content?.substring(0, 120) + '...' || 'Read the full article for more information.'}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{readTime} min read</span>
          </div>
          <span>{new Date(safeDate).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
};

export default NewsHubPage;