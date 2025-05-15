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
        <div className="relative w-full md:w-96 group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary">
            <Search size={18} className="transition-transform group-focus-within:scale-110" />
          </div>
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search articles..."
            className="pl-10 h-11 rounded-lg border-gray-200 dark:border-gray-700 shadow-sm
              focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-300"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleClearSearch();
                playSound('focus');
              } else if (e.key === 'Enter') {
                playSound('navigation');
                // Focus away from input after search
                e.currentTarget.blur();
              }
            }}
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 opacity-70 hover:opacity-100
                hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              onClick={() => {
                handleClearSearch();
                playSound('focus');
              }}
              aria-label="Clear search"
            >
              <X size={16} className="text-gray-500 dark:text-gray-400" />
            </Button>
          )}
          
          {/* Search suggestions - show when typing */}
          {searchQuery.length > 0 && (
            <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Suggested Topics
              </div>
              <div className="p-2 grid grid-cols-2 gap-2">
                {['AI Ethics', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'Natural Language Processing']
                  .filter(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 4)
                  .map((topic, idx) => (
                    <Button 
                      key={idx} 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start h-auto py-1.5 text-left"
                      onClick={() => {
                        setSearchQuery(topic);
                        playSound('click');
                        searchInputRef.current?.blur();
                      }}
                    >
                      <BrainCircuit className="h-3.5 w-3.5 mr-2 text-primary/70" />
                      {topic}
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </div>
        
        <Tabs value={activeTab} className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-3 md:flex md:flex-row gap-1.5 bg-gray-100/80 dark:bg-gray-800/50 p-1.5 rounded-lg shadow-inner">
            <TabsTrigger 
              value="all" 
              onClick={() => {
                setActiveTab('all');
                playSound('navigation');
              }}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm
                rounded-md py-2 px-4 font-medium text-gray-700 dark:text-gray-300
                data-[state=active]:text-primary dark:data-[state=active]:text-primary
                transition-all duration-200 hover:bg-white/40 dark:hover:bg-gray-700/40"
            >
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                All
              </span>
              <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-primary/80 rounded-full transform scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="ai" 
              onClick={() => {
                setActiveTab('ai');
                playSound('navigation');
              }}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm
                rounded-md py-2 px-4 font-medium text-gray-700 dark:text-gray-300
                data-[state=active]:text-primary dark:data-[state=active]:text-primary
                transition-all duration-200 hover:bg-white/40 dark:hover:bg-gray-700/40"
            >
              <span className="flex items-center">
                <BrainCircuit size={16} className="mr-1.5" />
                AI
              </span>
              <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-primary/80 rounded-full transform scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="business" 
              onClick={() => {
                setActiveTab('business');
                playSound('navigation');
              }}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm
                rounded-md py-2 px-4 font-medium text-gray-700 dark:text-gray-300
                data-[state=active]:text-primary dark:data-[state=active]:text-primary
                transition-all duration-200 hover:bg-white/40 dark:hover:bg-gray-700/40"
            >
              <span className="flex items-center">
                <Briefcase size={16} className="mr-1.5" />
                Business
              </span>
              <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-primary/80 rounded-full transform scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="tech" 
              onClick={() => {
                setActiveTab('tech');
                playSound('navigation');
              }}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm
                rounded-md py-2 px-4 font-medium text-gray-700 dark:text-gray-300
                data-[state=active]:text-primary dark:data-[state=active]:text-primary
                transition-all duration-200 hover:bg-white/40 dark:hover:bg-gray-700/40"
            >
              <span className="flex items-center">
                <Cpu size={16} className="mr-1.5" />
                Tech
              </span>
              <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-primary/80 rounded-full transform scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="tutorials" 
              onClick={() => {
                setActiveTab('tutorials');
                playSound('navigation');
              }}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm
                rounded-md py-2 px-4 font-medium text-gray-700 dark:text-gray-300
                data-[state=active]:text-primary dark:data-[state=active]:text-primary
                transition-all duration-200 hover:bg-white/40 dark:hover:bg-gray-700/40"
            >
              <span className="flex items-center">
                <BookOpen size={16} className="mr-1.5" />
                Tutorials
              </span>
              <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-primary/80 rounded-full transform scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300"></div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="news" 
              onClick={() => {
                setActiveTab('news');
                playSound('navigation');
              }}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm
                rounded-md py-2 px-4 font-medium text-gray-700 dark:text-gray-300
                data-[state=active]:text-primary dark:data-[state=active]:text-primary
                transition-all duration-200 hover:bg-white/40 dark:hover:bg-gray-700/40"
            >
              <span className="flex items-center">
                <Newspaper size={16} className="mr-1.5" />
                News
              </span>
              <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-primary/80 rounded-full transform scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300"></div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Results count and sorting options */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
          <div className="bg-primary/10 rounded-full p-1.5 mr-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="9" y="3" width="6" height="4" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 10h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {getResultCountText()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activeTab === 'all' ? 'Showing all articles' : `Filtered by ${activeTab}`}
              {searchQuery && ` • Search: "${searchQuery}"`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Sort by:</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            onClick={() => playSound('click')}
          >
            <Clock className="h-3 w-3 mr-1" />
            Newest first
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => playSound('click')}
          >
            <svg className="h-3 w-3 mr-1" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 2C7.77614 2 8 1.77614 8 1.5C8 1.22386 7.77614 1 7.5 1C7.22386 1 7 1.22386 7 1.5C7 1.77614 7.22386 2 7.5 2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
              <path d="M7.5 8C7.77614 8 8 7.77614 8 7.5C8 7.22386 7.77614 7 7.5 7C7.22386 7 7 7.22386 7 7.5C7 7.77614 7.22386 8 7.5 8Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
              <path d="M7.5 14C7.77614 14 8 13.7761 8 13.5C8 13.2239 7.77614 13 7.5 13C7.22386 13 7 13.2239 7 13.5C7 13.7761 7.22386 14 7.5 14Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
            Relevance
          </Button>
        </div>
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
                                playSound('click');
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
                      onClick={() => playSound('click')}
                    >
                      <span>Read article</span>
                      <ChevronRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
          {/* Enhanced Pagination with Animations and Micro-interactions */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <div className="flex flex-col items-center space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing page {page} of {totalPages} ({filteredPosts.length} articles)
                </p>
                <div className="flex items-center bg-gray-50 dark:bg-gray-800/70 rounded-lg p-1.5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPage(prev => Math.max(1, prev - 1));
                      playSound('navigation');
                    }}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className={`text-gray-700 dark:text-gray-300 h-8 px-2 rounded-md ${page === 1 ? 'opacity-50' : 'hover:bg-white dark:hover:bg-gray-700'}`}
                  >
                    <div className="flex items-center">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span>Previous</span>
                    </div>
                  </Button>
                  
                  <div className="flex items-center space-x-1 mx-2 px-3 border-x border-gray-200 dark:border-gray-700">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                      .map((p, i, arr) => {
                        // Add ellipsis
                        const needsEllipsisBefore = i > 0 && arr[i - 1] !== p - 1;
                        const needsEllipsisAfter = i < arr.length - 1 && arr[i + 1] !== p + 1;
                        
                        return (
                          <React.Fragment key={p}>
                            {needsEllipsisBefore && (
                              <span className="px-2.5 py-1.5 text-gray-400 dark:text-gray-500">•••</span>
                            )}
                            
                            <Button
                              variant={p === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setPage(p);
                                playSound('click');
                              }}
                              className={`h-8 w-8 ${p === page 
                                ? "bg-primary hover:bg-primary/90 text-white ring-2 ring-primary/30 transform scale-105 transition-all" 
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all"}`}
                              aria-label={`Page ${p}`}
                              aria-current={p === page ? "page" : undefined}
                            >
                              {p}
                            </Button>
                            
                            {needsEllipsisAfter && (
                              <span className="px-2.5 py-1.5 text-gray-400 dark:text-gray-500">•••</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPage(prev => Math.min(totalPages, prev + 1));
                      playSound('navigation');
                    }}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className={`text-gray-700 dark:text-gray-300 h-8 px-2 rounded-md ${page === totalPages ? 'opacity-50' : 'hover:bg-white dark:hover:bg-gray-700'}`}
                  >
                    <div className="flex items-center">
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Button>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <div className="flex items-center gap-1 mr-4">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 9v12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Jump to page: </span>
                  </div>
                  {[1, 2, Math.floor(totalPages/2), totalPages-1, totalPages].filter((v, i, a) => a.indexOf(v) === i && v > 0 && v <= totalPages)
                    .map(p => (
                      <Button
                        key={p}
                        variant="link"
                        size="sm"
                        onClick={() => {
                          setPage(p);
                          playSound('click');
                        }}
                        className={`p-1 h-6 ${p === page ? 'text-primary font-medium' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        {p}
                      </Button>
                    ))}
                </div>
                
                <div className="text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1.5 mt-1">
                  <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-500 dark:text-gray-400">
                    ←
                  </kbd>
                  <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-500 dark:text-gray-400">
                    →
                  </kbd>
                  <span> to navigate</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsHubPage;