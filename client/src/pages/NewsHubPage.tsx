import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, BrainCircuit, ChevronRight, Clock, X, BookOpen, Newspaper, Cpu, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import ArticleReactionBar from '@/components/articles/ArticleReactionBar';

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
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [postsPerPage] = useState(15); // Show more articles per page
  const [totalPages, setTotalPages] = useState(1);
  const [filteredPosts, setFilteredPosts] = useState<ArticlePost[]>([]);
  
  // References
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize sound effects and keyboard shortcuts
  const { playSound } = useSoundEffects();
  const { registerShortcut } = useKeyboardShortcuts();
  
  // Fetch posts from our API - get all 50 articles with newest first
  // Enhanced with better error handling and performance optimizations
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['/api/posts?limit=50&sort=newest'],
    queryFn: async () => {
      // Try direct path first
      try {
        const response = await fetch('/api/posts?limit=50&sort=newest');
        if (response.ok) {
          const data = await response.json();
          console.log('Posts fetched successfully:', data);
          return data;
        }
      } catch (err) {
        console.error('Error fetching from /api/posts:', err);
      }
      
      // Fallback to articles endpoint
      try {
        const response = await fetch('/api/articles?limit=50');
        if (response.ok) {
          const data = await response.json();
          console.log('Articles fetched successfully:', data);
          return data;
        }
      } catch (err) {
        console.error('Error fetching from /api/articles:', err);
      }
      
      // Last resort - try content endpoint
      try {
        const response = await fetch('/api/content/posts?limit=50');
        if (response.ok) {
          const data = await response.json();
          console.log('Content posts fetched successfully:', data);
          return data;
        }
      } catch (err) {
        console.error('Error fetching from /api/content/posts:', err);
      }
      
      throw new Error('Failed to fetch articles from any available endpoint');
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff for better network resilience
    staleTime: 5000, // 5 seconds - refresh more frequently to get new articles
    refetchOnWindowFocus: true, // Refresh data when user returns to the tab
    refetchInterval: 10000, // Refresh every 10 seconds to get newly generated articles
    refetchOnMount: true, // Always refetch when component mounts
  });
  
  // Debug article data separately to avoid TypeScript errors
  React.useEffect(() => {
    if (postsData) {
      console.log('Article data retrieved successfully:', Array.isArray(postsData) ? postsData.length : 0, 'articles found');
      if (Array.isArray(postsData) && postsData.length > 0) {
        console.log('First article sample:', postsData[0]);
      } else {
        console.log('No articles found in the API response');
      }
    }
    if (error) {
      console.error('Error fetching articles:', error);
    }
  }, [postsData, error]);

  // Make sure we have an array of posts
  const allPosts: ArticlePost[] = Array.isArray(postsData) ? postsData : [];
  
  // Force query refresh when no articles are loaded but generation is happening
  useEffect(() => {
    if (allPosts.length === 0) {
      console.log("Checking for new articles...");
      const checkInterval = setInterval(() => {
        console.log("Checking for new articles...");
      }, 10000);
      
      return () => clearInterval(checkInterval);
    }
  }, [allPosts.length]);
  
  // Log when posts data changes
  useEffect(() => {
    console.log("Posts data:", postsData);
    console.log("Successfully loaded", allPosts.length, "articles");
  }, [postsData, allPosts.length]);
  
  // Filter and sort posts based on activeTab and searchQuery
  useEffect(() => {
    if (allPosts.length === 0) {
      console.log("No posts available to filter");
      setFilteredPosts([]);
      return;
    }
    
    console.log("Processing posts:", allPosts.length, "total available");
    
    // Filter based on active tab
    let filtered = [...allPosts];
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(post => {
        // Get category from post.category or post.tags
        const category = (post.category || '').toLowerCase();
        const tags = Array.isArray(post.tags) 
          ? post.tags.map(tag => tag.toLowerCase())
          : [];
        
        // Match against activeTab
        return category === activeTab.toLowerCase() || 
               tags.includes(activeTab.toLowerCase());
      });
    }
    
    // Apply search query filter if provided
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        (post.summary && post.summary.toLowerCase().includes(query)) ||
        (post.content && post.content.toLowerCase().includes(query))
      );
    }
    
    // Sort by publish date or creation date, newest first
    setFilteredPosts(filtered.sort((a, b) => {
      try {
        const dateA = a.publishedAt ? new Date(a.publishedAt) : 
                     (a.createdAt ? new Date(a.createdAt) : new Date());
        const dateB = b.publishedAt ? new Date(b.publishedAt) : 
                     (b.createdAt ? new Date(b.createdAt) : new Date());
        return dateB.getTime() - dateA.getTime();
      } catch (e) {
        console.error("Error sorting posts by date:", e);
        return 0; // Keep original order if there's an error
      }
    }));
  }, [allPosts, activeTab, searchQuery]);

  // Calculate pagination and update totalPages state
  useEffect(() => {
    setTotalPages(Math.ceil(filteredPosts.length / postsPerPage));
  }, [filteredPosts, postsPerPage]);
  
  const currentPagePosts = filteredPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);
  
  // Register keyboard shortcuts for the news hub
  useEffect(() => {
    // Focus search with / key
    registerShortcut('/', () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        playSound('click');
      }
    });
    
    // Clear search with Escape key
    registerShortcut('Escape', () => {
      if (searchQuery) {
        setSearchQuery('');
        playSound('notification');
      }
    });
    
    // Register 1-6 keys for tab navigation
    registerShortcut('1', () => setActiveTab('all'));
    registerShortcut('2', () => setActiveTab('ai'));
    registerShortcut('3', () => setActiveTab('business'));
    registerShortcut('4', () => setActiveTab('tech'));
    registerShortcut('5', () => setActiveTab('tutorials'));
    registerShortcut('6', () => setActiveTab('news'));
    
    // Navigate pagination with arrow keys
    registerShortcut('ArrowLeft', () => {
      if (page > 1) {
        setPage(prev => prev - 1);
        playSound('click');
      }
    });
    
    registerShortcut('ArrowRight', () => {
      if (page < totalPages) {
        setPage(prev => prev + 1);
        playSound('click');
      }
    });
    
  }, [registerShortcut, searchQuery, page, totalPages, playSound, setActiveTab]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in an input field
      if (document.activeElement instanceof HTMLInputElement || 
          document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }
      
      // j/k navigation for vim users
      if (e.key === 'j' && page < totalPages) {
        setPage(prev => prev + 1);
      } else if (e.key === 'k' && page > 1) {
        setPage(prev => prev - 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page, totalPages]);
  
  // Content rendering functions
  // Calculate and display estimated reading time
  const getReadingTime = (content: string) => {
    if (!content) return 1;
    
    // Strip HTML tags
    const text = content.replace(/<\/?[^>]+(>|$)/g, "");
    
    // Average reading speed: 200 words per minute
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    
    return minutes;
  };
  
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    // Try to focus on search input after clearing
    searchInputRef.current?.focus();
  };
  
  // Get the proper count text for search results
  const getResultCountText = () => {
    if (filteredPosts.length === 0) {
      return 'No articles found';
    }
    
    if (searchQuery.trim() !== '') {
      return `${filteredPosts.length} articles found`;
    }
    
    if (activeTab !== 'all') {
      return `${filteredPosts.length} articles in ${activeTab}`;
    }
    
    return `${filteredPosts.length} articles`;
  };
  
  // Helper function to check if an article is new (less than 24 hours old)
  const isNewArticle = (publishedDate: string | Date | null | undefined, createdDate: string | Date) => {
    try {
      const date = publishedDate 
        ? new Date(publishedDate) 
        : new Date(createdDate);
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffHours = diffTime / (1000 * 60 * 60);
      
      return diffHours < 24;
    } catch (e) {
      return false;
    }
  };
  
  // Function to extract image URL from content if none is provided
  const extractImageFromContent = (content: string): string | null => {
    if (!content) return null;
    
    // Use regex to find the first image tag in the content
    const imgRegex = /<img.+?src=["'](.+?)["'].*?>/;
    const match = content.match(imgRegex);
    
    return match ? match[1] : null;
  };
  
  // Generate a fallback image based on article ID
  const getFallbackImage = (id: number): string => {
    // Use a set of stock images based on article ID
    const imageIndex = id % 5; // Cycle through 5 different images
    const fallbackImages = [
      '/img/article-placeholder-1.jpg',
      '/img/article-placeholder-2.jpg',
      '/img/article-placeholder-3.jpg',
      '/img/article-placeholder-4.jpg',
      '/img/article-placeholder-5.jpg',
    ];
    
    return fallbackImages[imageIndex];
  };
  
  // Format date for display
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Recently';
    
    try {
      // Use date-fns to get a relative time (e.g. "2 days ago")
      const parsedDate = date ? new Date(date) : new Date();
      return formatDistanceToNow(parsedDate, { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  };
  
  // Return JSX for News Hub Page
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Helmet>
        <title>News Hub | RXAI - Artificial Intelligence Articles</title>
        <meta name="description" content="Stay up to date with the latest AI technology news, research breakthroughs, and industry insights." />
      </Helmet>
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-50">News Hub</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Stay up to date with the latest AI technology news, research breakthroughs, and industry insights.
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-start">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search articles..."
            className="pl-10 h-11 rounded-lg"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={18} />
            </Button>
          )}
        </div>
        
        <Tabs value={activeTab} className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-3 md:flex md:flex-row gap-1 bg-gray-100/80 dark:bg-gray-800/50 p-1 rounded-lg">
            <TabsTrigger 
              value="all" 
              onClick={() => setActiveTab('all')}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded py-2"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              onClick={() => setActiveTab('ai')}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded py-2"
            >
              <BrainCircuit size={16} className="mr-1.5" />
              AI
            </TabsTrigger>
            <TabsTrigger 
              value="business" 
              onClick={() => setActiveTab('business')}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded py-2"
            >
              Business
            </TabsTrigger>
            <TabsTrigger 
              value="tech" 
              onClick={() => setActiveTab('tech')}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded py-2"
            >
              Tech
            </TabsTrigger>
            <TabsTrigger 
              value="tutorials" 
              onClick={() => setActiveTab('tutorials')}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded py-2"
            >
              <BookOpen size={16} className="mr-1.5" />
              Tutorials
            </TabsTrigger>
            <TabsTrigger 
              value="news" 
              onClick={() => setActiveTab('news')}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded py-2"
            >
              <Newspaper size={16} className="mr-1.5" />
              News
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Results count */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getResultCountText()}
        </p>
      </div>
      
      {/* Articles grid */}
      {isLoading ? (
        <>
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
              <BrainCircuit className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium mb-1">Loading articles...</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Retrieving the latest AI content for you
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden h-[400px] transition-all hover:shadow-md">
                <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse relative">
                  <div className="absolute top-3 left-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
                <CardHeader>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-4/5 mb-1" />
                  <div className="flex items-center mt-2">
                    <Skeleton className="h-4 w-4 rounded-full mr-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      ) : error ? (
        <div className="text-center p-10 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Error loading articles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We encountered a problem fetching the latest articles. Please try again later.
          </p>
          <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center p-10 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
          <div className="mb-3">
            <Newspaper className="h-14 w-14 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No articles found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto">
            {searchQuery 
              ? `We couldn't find any articles matching "${searchQuery}". Try a different search term.` 
              : `We're generating new AI articles right now! They'll appear here soon - check back in a few moments.`}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
            {searchQuery ? (
              <Button variant="secondary" onClick={handleClearSearch}>
                <X className="h-4 w-4 mr-2" />
                Clear search
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => window.location.reload()}>
                <ChevronRight className="h-4 w-4 mr-2" />
                Refresh page
              </Button>
            )}
            <Button variant="outline" onClick={() => setActiveTab('all')}>
              <BrainCircuit className="h-4 w-4 mr-2" />
              View all topics
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPagePosts.map(post => {
              // Extract image from content if not explicitly provided
              const displayImage = post.imageUrl || extractImageFromContent(post.content) || getFallbackImage(post.id);
              
              // Calculate reading time
              const readingTime = post.readTimeMinutes || getReadingTime(post.content);
              
              // Check if article is new
              const isNew = isNewArticle(post.publishedAt, post.createdAt);
              
              return (
                <Card key={post.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-800/30 group border border-transparent hover:border-primary/20 dark:hover:border-primary/30">
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                    <img 
                      src={displayImage}
                      alt={post.title}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 filter group-hover:brightness-110"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = getFallbackImage(post.id);
                      }}
                    />
                    
                    {/* Category label */}
                    {post.category && (
                      <div className="absolute top-3 left-3">
                        <Badge 
                          variant="secondary" 
                          className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm
                          hover:scale-105 transition-transform duration-200"
                        >
                          {post.category === 'AI' || post.category.includes('AI') ? (
                            <span className="flex items-center">
                              <BrainCircuit className="h-3 w-3 mr-1" />
                              {post.category}
                            </span>
                          ) : post.category === 'Technology' || post.category === 'Tech' ? (
                            <span className="flex items-center">
                              <Cpu className="h-3 w-3 mr-1" />
                              {post.category}
                            </span>
                          ) : post.category === 'Business' ? (
                            <span className="flex items-center">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {post.category}
                            </span>
                          ) : (
                            post.category
                          )}
                        </Badge>
                      </div>
                    )}
                    
                    {/* New badge */}
                    {isNew && (
                      <div className="absolute top-3 right-3">
                        <Badge 
                          variant="default" 
                          className="font-semibold shadow-md backdrop-blur-sm bg-primary/90 hover:bg-primary/100 transition-colors"
                        >
                          <span className="animate-pulse-slow">New</span>
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="p-5 pb-2">
                    <Link href={`/articles/${post.id}`} className="outline-none group-hover:scale-[1.01] inline-block transition-transform duration-200">
                      <CardTitle className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </Link>
                    
                    <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        <Clock size={14} className="mr-1 text-primary/70" />
                        {readingTime} min read
                      </span>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-5 pt-2">
                    <div className="relative">
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-3 text-sm leading-relaxed">
                        {post.summary || post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'}
                      </p>
                      <div className="absolute bottom-0 right-0 w-full h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                              onClick={() => {
                                setSearchQuery(tag);
                                playSound('soft-click');
                              }}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                    <ArticleReactionBar 
                      articleId={post.id}
                      compact={true}
                      variant="compact"
                    />
                    
                    <Link 
                      href={`/articles/${post.id}`}
                      className="text-sm font-medium text-primary hover:text-primary/80 dark:hover:text-primary/90 
                        flex items-center transition-all px-3 py-1.5 rounded-md 
                        bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 
                        shadow-sm hover:shadow group"
                      onClick={() => playSound('tap')}
                    >
                      <span>Read article</span>
                      <ChevronRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                    .map((p, i, arr) => {
                      // Add ellipsis
                      const needsEllipsisBefore = i > 0 && arr[i - 1] !== p - 1;
                      const needsEllipsisAfter = i < arr.length - 1 && arr[i + 1] !== p + 1;
                      
                      return (
                        <React.Fragment key={p}>
                          {needsEllipsisBefore && (
                            <span className="px-3 py-2 text-gray-400 dark:text-gray-500">...</span>
                          )}
                          
                          <Button
                            variant={p === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(p)}
                            className={p === page 
                              ? "bg-blue-600 text-white hover:bg-blue-700" 
                              : "text-gray-700 dark:text-gray-300"}
                            aria-label={`Page ${p}`}
                            aria-current={p === page ? "page" : undefined}
                          >
                            {p}
                          </Button>
                          
                          {needsEllipsisAfter && (
                            <span className="px-3 py-2 text-gray-400 dark:text-gray-500">...</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsHubPage;