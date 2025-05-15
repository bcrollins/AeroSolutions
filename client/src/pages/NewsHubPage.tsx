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
  const [postsPerPage] = useState(15); // Show more articles per page
  
  // Initialize sound effects
  const { playSound } = useSoundEffects();

  // Fetch posts from our API - get all 50 articles with newest first
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['/api/posts?limit=50&sort=newest'],
    retry: 3,
    retryDelay: 1000,
    staleTime: 10000, // 10 seconds - refresh more frequently to get new articles
    refetchOnWindowFocus: true, // Refresh data when user returns to the tab
    refetchInterval: 15000, // Refresh every 15 seconds to get newly generated articles
  });

  // Make sure we have an array of posts
  const allPosts: ArticlePost[] = Array.isArray(postsData) ? postsData : [];
  
  // Force query refresh when no articles are loaded but generation is happening
  useEffect(() => {
    if (allPosts.length === 0) {
      // If we don't have any articles yet, refresh more frequently
      const interval = setInterval(() => {
        console.log('Checking for new articles...');
        if (window.location.pathname.includes('/news')) {
          // Only refresh if we're still on the news page
          window.location.reload();
        } else {
          clearInterval(interval);
        }
      }, 10000); // Check every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [allPosts.length]);
  
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
  
  // Reference to search input
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with / key
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        playSound('hover');
      }
      
      // Navigate tabs with number keys
      if (!isNaN(parseInt(e.key)) && parseInt(e.key) >= 1 && parseInt(e.key) <= 6) {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        const tabValues = ['all', 'ai', 'business', 'tech', 'tutorials', 'news'];
        if (tabIndex < tabValues.length) {
          setActiveTab(tabValues[tabIndex]);
          playSound('click');
        }
      }
      
      // Navigate pages with arrow keys or j/k
      if (['ArrowLeft', 'k'].includes(e.key) && page > 1) {
        setPage(prev => prev - 1);
        playSound('click');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      if (['ArrowRight', 'j'].includes(e.key) && page < totalPages) {
        setPage(prev => prev + 1);
        playSound('click');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Escape key clears search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
        playSound('click');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [page, totalPages, activeTab, searchQuery, playSound]);

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
          {allPosts.length > 0 && allPosts.length < 50 && (
            <div className="flex items-center ml-2 animate-pulse">
              <span className="bg-blue-500/10 text-blue-600 text-xs py-0.5 px-2 rounded-full border border-blue-200">
                Generating {allPosts.length}/50
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 tracking-tight leading-tight">
                  RXAI News & Articles
                </h1>
                <p className="text-gray-500 mt-3 max-w-2xl text-lg leading-relaxed">
                  Your comprehensive resource for articles on artificial intelligence, business applications, and the latest in technology innovations.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <span className="font-semibold">50</span> Professional Articles
                  </span>
                  <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <span className="font-semibold">Updated Daily</span>
                  </span>
                </div>
              </div>
              
              {/* Keyboard shortcuts guide */}
              <div className="hidden md:block relative group">
                <button 
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                  onClick={() => playSound('click')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-keyboard">
                    <rect width="20" height="12" x="2" y="4" rx="2" ry="2" />
                    <path d="M6 8h.001" />
                    <path d="M10 8h.001" />
                    <path d="M14 8h.001" />
                    <path d="M18 8h.001" />
                    <path d="M8 12h.001" />
                    <path d="M12 12h.001" />
                    <path d="M16 12h.001" />
                    <path d="M7 16h10" />
                  </svg>
                  Keyboard Shortcuts
                </button>
                
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white rounded-xl shadow-lg p-4 border border-gray-100 w-64 z-50">
                  <div className="text-sm font-semibold mb-3 text-gray-800">Keyboard Shortcuts</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Focus search</span>
                      <span className="bg-gray-100 px-2 py-1 rounded font-mono">/</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Clear search</span>
                      <span className="bg-gray-100 px-2 py-1 rounded font-mono">Esc</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Switch tabs</span>
                      <span className="bg-gray-100 px-2 py-1 rounded font-mono">1-6</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Next page</span>
                      <div className="flex gap-1">
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">→</span>
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">j</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Previous page</span>
                      <div className="flex gap-1">
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">←</span>
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">k</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Articles Generation Status */}
          <div className="mt-6 md:mt-0">
            <div className="bg-blue-50/90 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 flex items-center shadow-sm">
              <div className="flex-shrink-0 mr-4 relative">
                {allPosts.length < 50 ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-40"></div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  {allPosts.length < 50 
                    ? `Generating Articles (${allPosts.length}/50)...` 
                    : 'All 50 AI-Generated Articles Loaded'}
                </h3>
                <p className="text-xs text-blue-600">
                  {allPosts.length < 50 
                    ? 'RXAI is creating professional-quality articles in real-time.' 
                    : 'All articles have been successfully generated using advanced AI technology.'}
                </p>
                {allPosts.length < 50 && (
                  <div className="w-full max-w-xs mt-2 bg-white rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.max(5, (allPosts.length / 50) * 100)}%` }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
          <div className="relative md:col-span-5">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
              <Input 
                ref={searchInputRef}
                placeholder="Search articles... (Press '/' to focus)" 
                className="pl-11 h-12 bg-gray-50/80 backdrop-blur-sm border-transparent focus:border-blue-300 focus:ring-blue-300 shadow-sm rounded-xl group-hover:bg-white transition-all duration-300"
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
              <TabsList className="w-full grid grid-cols-6 bg-gray-50/80 backdrop-blur-sm rounded-2xl p-1.5 h-12">
                <TabsTrigger 
                  value="all" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md text-gray-500 transition-all duration-300"
                >
                  All Topics
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md text-gray-500 transition-all duration-300"
                >
                  AI
                </TabsTrigger>
                <TabsTrigger 
                  value="business" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md text-gray-500 transition-all duration-300"
                >
                  Business
                </TabsTrigger>
                <TabsTrigger 
                  value="tech" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md text-gray-500 transition-all duration-300"
                >
                  Technology
                </TabsTrigger>
                <TabsTrigger 
                  value="tutorials" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md text-gray-500 transition-all duration-300"
                >
                  Tutorials
                </TabsTrigger>
                <TabsTrigger 
                  value="news" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md text-gray-500 transition-all duration-300"
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
        <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-white rounded-2xl border border-blue-100/60 shadow-sm backdrop-blur-sm">
          {allPosts.length === 0 ? (
            // No articles are loaded yet but they're being generated
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-5 shadow-lg">
                  <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-medium mb-3 text-blue-600">Generating Articles</h3>
              <p className="text-muted-foreground mb-4 max-w-lg">
                RXAI is currently generating professional-quality AI articles. This process takes a few minutes as we create comprehensive, well-researched content.
              </p>
              <div className="w-full max-w-md mx-auto bg-white/50 backdrop-blur-sm rounded-full h-3 mb-6 overflow-hidden shadow-inner">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full animate-progress relative">
                  <div className="absolute inset-0 bg-white/10 overflow-hidden">
                    <div className="h-full w-1/4 bg-white/20 skew-x-30 animate-shimmer"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-blue-600">
                Your articles will automatically appear once they are ready. The page will refresh automatically.
              </p>
            </div>
          ) : (
            // No articles match the filters
            <div>
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
          )}
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
                {/* Show a featured article if at least one exists */}
                {filteredPosts.length > 0 && (
                  <ArticleCard 
                    key={filteredPosts[0].id} 
                    post={filteredPosts.find(post => post.featuredPost) || filteredPosts[0]} 
                    featured={true} 
                    className="scale-in"
                  />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 articles-grid">
              {/* Skip the first post if it's featured and we're showing all posts */}
              {currentPagePosts
                .filter((post, index) => !(
                  index === 0 && 
                  !searchQuery && 
                  activeTab === 'all' && 
                  (post.featuredPost || filteredPosts.filter(p => p.featuredPost).length === 0)
                ))
                .map((post, index) => (
                  <ArticleCard 
                    key={post.id} 
                    post={post} 
                    className={`transition-all duration-300 slide-in-article`} 
                    style={{ animationDelay: `${index * 0.08}s` }}
                  />
                ))}
              
              {/* Show message when more articles are being generated */}
              {allPosts.length > 0 && allPosts.length < 50 && currentPagePosts.length < 5 && (
                <div className="col-span-full p-6 bg-blue-50 rounded-lg border border-blue-100 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-blue-800 mb-1">
                    More Articles Coming
                  </h3>
                  <p className="text-sm text-blue-600">
                    We're generating additional AI-powered articles. Check back in a moment to see new content.
                  </p>
                </div>
              )}
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
const ArticleCard = ({ 
  post, 
  featured = false,
  className = '',
  style = {}
}: { 
  post: ArticlePost, 
  featured?: boolean,
  className?: string,
  style?: React.CSSProperties
}) => {
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
        className={`overflow-hidden h-full transition-all duration-300 hover:shadow-lg group ${className}`}
        style={style}
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
  
  // Regular article card - Apple-inspired design
  return (
    <Card 
      className={`overflow-hidden h-full transition-all duration-300 hover:shadow-md group border-0 bg-white ${className}`}
      style={{...style, borderRadius: '1.25rem'}}
      onMouseEnter={() => playSound('hover')}
    >
      <div className="h-48 w-full relative overflow-hidden">
        {post.imageUrl ? (
          <div className="absolute inset-0 transform group-hover:scale-105 transition-transform duration-700">
            <img 
              src={post.imageUrl} 
              alt={safeTitle} 
              className="h-full w-full object-cover" 
              onError={(e) => {
                // Replace broken image with a fallback gradient and icon
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.classList.add('bg-gradient-to-br', 'from-blue-50', 'to-indigo-50', 'flex', 'items-center', 'justify-center');
                
                // Create and append an icon element based on article category
                const icon = document.createElement('div');
                
                if (post.category?.toLowerCase().includes('ai')) {
                  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-12 w-12 text-blue-400/50"><path d="M12 2v1m0 18v1m9-9h-1M4 12H3m15.364 6.364-.7071-.7071M6.34315 6.34315l-.70711-.70711m12.72796.00003-.7071.70708M6.3432 17.6569l-.70711.7071M16 12c0 2.2091-1.7909 4-4 4-2.20914 0-4-1.7909-4-4 0-2.20914 1.79086-4 4-4 2.2091 0 4 1.79086 4 4Z"></path></svg>`;
                } else if (post.category?.toLowerCase().includes('business')) {
                  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-12 w-12 text-blue-400/50"><path d="M3 12H5M5 12C7.76142 12 10 9.76142 10 7C10 4.23858 7.76142 2 5 2H3V22H5C7.76142 22 10 19.7614 10 17C10 14.2386 7.76142 12 5 12Z"></path><path d="M21 12H19M19 12C16.2386 12 14 9.76142 14 7C14 4.23858 16.2386 2 19 2H21V22H19C16.2386 22 14 19.7614 14 17C14 14.2386 16.2386 12 19 12Z"></path></svg>`;
                } else {
                  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-12 w-12 text-blue-400/50"><path d="M21 12a9 9.00001 0 11-18 0 9 9.00001 0 0118 0z"></path><path d="M12 8v4l2.5 2.5"></path></svg>`;
                }
                
                target.parentElement!.appendChild(icon);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <BrainCircuit className="h-12 w-12 text-blue-400/50" />
          </div>
        )}
        
        {/* Reading time indicator badge */}
        <div className="absolute -bottom-5 right-5 z-10">
          <div className="bg-white rounded-full h-10 w-10 flex flex-col items-center justify-center shadow-sm border border-gray-100">
            <span className="text-sm font-bold text-blue-600 leading-none">{readTime}</span>
            <span className="text-[9px] text-gray-500 leading-none mt-0.5">min</span>
          </div>
        </div>
        
        {/* New articles get a badge */}
        {(new Date().getTime() - new Date(safeDate).getTime()) / (1000 * 60 * 60 * 24) < 3 && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-blue-600/90 backdrop-blur-sm shadow-sm text-white font-medium text-xs px-2.5 py-0.5 rounded-full">New</Badge>
          </div>
        )}
      </div>
      
      <div className="p-5 relative z-10">
        {post.category && (
          <div className="mb-2.5">
            <Badge variant="outline" className="text-xs rounded-full px-3 py-1 bg-blue-50/80 text-blue-600 border-blue-100 font-medium">
              {post.category}
            </Badge>
          </div>
        )}
        
        <Link 
          href={`/news/${safeSlug}`}
          onClick={() => playSound('click')}
          className="block transition-transform duration-300 group-hover:translate-x-1"
        >
          <h3 className="font-semibold text-lg tracking-tight mb-2 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors">
            {safeTitle}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {post.summary || post.content?.substring(0, 120) + '...' || 'Read the full article for more information.'}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
          <span className="font-medium text-gray-500">{new Date(safeDate).toLocaleDateString(undefined, {
            month: 'short', 
            day: 'numeric'
          })}</span>
          
          <Button variant="ghost" size="sm" className="h-7 px-3 text-xs text-blue-600 hover:text-blue-800 group">
            Read <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NewsHubPage;