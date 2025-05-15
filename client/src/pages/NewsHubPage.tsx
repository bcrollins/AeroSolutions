import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, BrainCircuit, ChevronRight, ChevronLeft, Clock, X, BookOpen, Newspaper, Cpu, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import ArticleReactionBar from '@/components/articles/ArticleReactionBar';
import { useToast } from "@/hooks/use-toast";

// Add custom keyframes animations
const CustomAnimations = () => (
  <style>
    {`
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-shimmer {
        animation: shimmer 2.5s infinite;
      }
    `}
  </style>
);

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
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : [];
  });
  
  // References
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { toast } = useToast();
  
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
  
  // Generate search suggestions based on current input and post data
  const generateSearchSuggestions = (query: string, posts: ArticlePost[]) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    
    const allTerms = new Set<string>();
    
    // Extract terms from titles
    posts.forEach(post => {
      const title = post.title.toLowerCase();
      if (title.includes(query.toLowerCase())) {
        allTerms.add(post.title);
      }
      
      // Add terms from tags
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            allTerms.add(tag);
          }
        });
      }
      
      // Add terms from categories
      if (post.category && post.category.toLowerCase().includes(query.toLowerCase())) {
        allTerms.add(post.category);
      }
    });
    
    // Also add recent searches that match
    recentSearches.forEach(search => {
      if (search.toLowerCase().includes(query.toLowerCase())) {
        allTerms.add(search);
      }
    });
    
    // Limit to 5 suggestions
    const suggestions = Array.from(allTerms).slice(0, 5);
    setSearchSuggestions(suggestions);
  };
  
  // Save search to recent searches
  const saveToRecentSearches = (query: string) => {
    if (!query || query.trim().length < 2) return;
    
    setRecentSearches(prev => {
      // Remove if already exists
      const filtered = prev.filter(s => s !== query);
      // Add to front of array
      const updated = [query, ...filtered].slice(0, 5);
      // Save to localStorage
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    generateSearchSuggestions(value, allPosts);
    setShowSuggestions(true);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    // Try to focus on search input after clearing
    searchInputRef.current?.focus();
  };
  
  // Select a suggestion
  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    saveToRecentSearches(suggestion);
    playSound('click');
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
      {/* Add custom keyframe animations */}
      <CustomAnimations />
      
      <Helmet>
        <title>News Hub | RXAI - Artificial Intelligence Articles</title>
        <meta name="description" content="Stay up to date with the latest AI technology news, research breakthroughs, and industry insights." />
      </Helmet>
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-50 group">
          News Hub
          <div className="relative inline-flex ml-2">
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Stay up to date with the latest AI technology news, research breakthroughs, and industry insights.
        </p>
      </div>
      
      {/* Floating Quick Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        {/* Reading List Quick Access */}
        <button 
          className="bg-white dark:bg-gray-800 text-primary shadow-lg rounded-full p-3 flex items-center justify-center 
            transition-all duration-300 hover:bg-primary hover:text-white transform hover:scale-110 
            border border-primary/20"
          onMouseEnter={() => playSound('focus')}
          onClick={() => {
            playSound('click');
            toast({
              title: "Coming Soon!",
              description: "Reading list feature will be available soon.",
            });
          }}
          aria-label="View reading list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        
        {/* Quick Filter Button */}
        <button 
          className="bg-primary text-white shadow-lg rounded-full p-4 flex items-center justify-center 
            transition-all duration-300 hover:bg-primary/90 transform hover:scale-110"
          onMouseEnter={() => playSound('focus')}
          onClick={() => {
            playSound('navigation');
            // Toggle filter visibility here
            toast({
              title: "Quick Filters",
              description: "Advanced filtering options coming soon!",
            });
          }}
          aria-label="Show quick filters"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </button>
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
                saveToRecentSearches(searchQuery);
                setShowSuggestions(false);
                // Focus away from input after search
                e.currentTarget.blur();
              } else if (e.key === 'ArrowDown' && searchSuggestions.length > 0) {
                // Focus the first suggestion
                const suggestionElements = suggestionsRef.current?.querySelectorAll('button');
                if (suggestionElements && suggestionElements.length > 0) {
                  (suggestionElements[0] as HTMLElement).focus();
                  playSound('focus');
                }
              }
            }}
            onFocus={() => {
              if (searchQuery.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onBlur={(e) => {
              // Only hide suggestions if we're not clicking on a suggestion
              if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
                setTimeout(() => setShowSuggestions(false), 150);
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
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0) && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 mt-1 rounded-lg shadow-lg 
                border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                animation: 'fadeIn 150ms ease-out forwards'
              }}
            >
              {searchSuggestions.length > 0 && (
                <div className="p-1">
                  <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Suggestions
                  </div>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                        focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none rounded-md
                        transition-colors flex items-center gap-2 group"
                      onClick={() => selectSuggestion(suggestion)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          selectSuggestion(suggestion);
                        } else if (e.key === 'ArrowDown') {
                          const next = e.currentTarget.nextElementSibling as HTMLElement;
                          if (next) {
                            next.focus();
                            playSound('focus');
                          }
                        } else if (e.key === 'ArrowUp') {
                          const prev = e.currentTarget.previousElementSibling as HTMLElement;
                          if (prev && prev.tagName === 'BUTTON') {
                            prev.focus();
                            playSound('focus');
                          } else {
                            searchInputRef.current?.focus();
                            playSound('focus');
                          }
                        }
                      }}
                    >
                      <Search size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                      <span className="flex-1 truncate">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {recentSearches.length > 0 && !searchQuery && (
                <div className="p-1 border-t border-gray-100 dark:border-gray-700">
                  <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium flex justify-between items-center">
                    <span>Recent Searches</span>
                    <button 
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('recent-searches');
                        playSound('click');
                        setShowSuggestions(false);
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={`recent-${index}`}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                        focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none rounded-md
                        transition-colors flex items-center gap-2 group"
                      onClick={() => selectSuggestion(search)}
                    >
                      <Clock size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                      <span className="flex-1 truncate">{search}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* End of search bar */}
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
      
      {/* Articles grid with enhanced loading states */}
      {isLoading ? (
        <>
          <div className="flex flex-col items-center justify-center mb-12 bg-gray-50/50 dark:bg-gray-800/20 p-6 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="relative mb-4">
              <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700 animate-spin"></div>
              <div className="h-16 w-16 rounded-full border-t-4 border-primary animate-spin absolute top-0 left-0"></div>
              <BrainCircuit className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-200">Loading articles</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
              Retrieving the latest AI content for you. This should only take a moment...
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card 
                key={index} 
                className="overflow-hidden h-[400px] transition-all border border-gray-200 dark:border-gray-800
                  hover:shadow-md group"
                style={{ 
                  animation: `fadeIn 800ms ease-out forwards`,
                  animationDelay: `${index * 150}ms`,
                  opacity: 0
                }}
              >
                <div className="h-40 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 -translate-x-full animate-shimmer"
                    style={{
                      background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)'
                    }}
                  ></div>
                  
                  <div className="absolute top-3 left-3 backdrop-blur-sm bg-white/20 dark:bg-black/20 p-1 rounded-full">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  
                  {/* Random height variation for image placeholders */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 bg-gray-300/40 dark:bg-gray-600/40 backdrop-blur-sm rounded-t-lg`} 
                    style={{ height: `${Math.random() * 20 + 10}%` }}
                  ></div>
                </div>
                
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-4/5 mb-1" />
                  <div className="flex items-center mt-2">
                    <Skeleton className="h-4 w-4 rounded-full mr-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                
                <CardFooter className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-3 mt-auto">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Skeleton pagination */}
          <div className="mt-10 flex justify-center">
            <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg flex space-x-2 items-center">
              <Skeleton className="h-8 w-20 rounded-md" />
              <div className="px-4 flex space-x-1 border-x border-gray-200 dark:border-gray-700">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded-md" />
                ))}
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </>
      ) : error ? (
        <div className="text-center p-10 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500">
              <path d="M12 8v4m0 4h.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Error Loading Articles
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            We encountered a problem fetching the latest articles. This might be due to temporary server issues or network connectivity problems.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="secondary" 
              className="bg-red-100 hover:bg-red-200 text-red-600 border-red-200 hover:border-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:border-red-900/50"
              onClick={() => {
                window.location.reload();
                playSound('navigation');
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M1 4v6h6m16 10v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Refresh Page
            </Button>
            <Button 
              variant="outline"
              onClick={() => playSound('click')}
            >
              Try Again Later
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
            Error Code: {error instanceof Error ? error.message : 'Unknown error'} • {new Date().toLocaleTimeString()}
          </p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20 rounded-xl shadow-sm">
          <div className="mb-6 relative">
            <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-md animate-pulse"></div>
              <Newspaper className="h-16 w-16 mx-auto text-primary relative" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-100 dark:bg-amber-900/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-100 dark:bg-purple-900/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            {searchQuery ? 'No matching articles found' : 'Articles are being generated'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
            {searchQuery 
              ? (
                <>
                  We couldn't find any articles matching <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">"{searchQuery}"</span>. Try a different search term or browse by category.
                </>
              ) 
              : (
                <>
                  We're creating new AI-generated articles just for you! They'll appear here automatically in just a moment - no need to refresh.
                </>
              )}
          </p>
          
          {!searchQuery && (
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
            {searchQuery ? (
              <Button 
                variant="secondary" 
                onClick={() => {
                  handleClearSearch();
                  playSound('navigation');
                }}
                className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              >
                <X className="h-4 w-4 mr-2" />
                Clear search
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                onClick={() => {
                  window.location.reload();
                  playSound('navigation');
                }}
                className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              >
                <svg className="h-4 w-4 mr-2" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.90321 7.29677C1.90321 10.341 4.11041 12.4147 6.58893 13.1559C6.87255 13.2372 7.06773 13.0148 7.00273 12.7271C6.93773 12.4394 6.87179 12.1405 6.80273 11.8042C6.74273 11.5159 6.68321 11.2229 6.63321 10.9299C4.33393 10.8633 3.33893 9.34385 3.26893 9.2299C3.23821 9.17971 3.22893 9.12485 3.23893 9.06988C3.24893 9.0149 3.27655 8.96398 3.31821 8.92166C3.36143 8.87771 3.41893 8.84271 3.48393 8.82271C3.54893 8.80271 3.61821 8.79785 3.68393 8.80771C3.74607 8.81837 3.80536 8.84106 3.85786 8.87441C3.91071 8.90441 4.99393 9.51623 6.53893 9.58324C6.78539 8.35752 7.52286 7.25238 8.61893 6.56494C7.33393 6.13994 6.61893 5.50549 6.22607 5.08681C5.84286 4.65854 5.77393 4.2816 5.77393 3.98167C5.77393 3.6304 5.91286 3.17114 6.19893 2.88077C6.52286 2.55255 6.96893 2.38898 7.55393 2.38898C8.14286 2.38898 8.58893 2.55248 8.90893 2.88077C9.19893 3.17114 9.33393 3.6304 9.33393 3.98167C9.33393 4.2816 9.26893 4.65854 8.88571 5.08681C8.49286 5.50557 7.77393 6.14001 6.49286 6.56494C7.07286 6.91229 7.54393 7.38442 7.88393 7.94162C8.22393 8.49883 8.41821 9.12693 8.44643 9.7666C8.93643 9.67895 9.56643 9.46988 10.1164 9.11988C10.4864 8.88231 10.8171 8.57359 11.0214 8.18681C11.2414 7.77432 11.2927 7.31165 11.1664 6.84583C11.1346 6.72166 11.0814 6.60462 11.008 6.50064C10.9352 6.39459 10.843 6.30384 10.7364 6.2321C10.6284 6.16263 10.5009 6.11462 10.368 6.09064C10.2364 6.06256 10.1014 6.06256 9.96893 6.08851C9.83643 6.10851 9.70821 6.15645 9.59464 6.22934C9.47821 6.29934 9.37464 6.39529 9.29821 6.50848C9.22179 6.61781 9.16464 6.74681 9.13714 6.88167C9.10464 7.02473 9.10715 7.16992 9.13714 7.31511C9.15652 7.40173 9.19312 7.48359 9.24358 7.55594H9.24393C9.29393 7.62359 9.3532 7.68286 9.42177 7.72932C9.49107 7.78026 9.56964 7.81666 9.65143 7.83857C9.73107 7.85666 9.8132 7.86338 9.89607 7.85666C9.97893 7.84994 10.0607 7.82994 10.1357 7.79994C10.0957 7.89244 10.0364 7.98208 9.95893 8.03994C9.87429 8.10536 9.78143 8.1433 9.68286 8.1522C9.58429 8.1611 9.48571 8.14162 9.39821 8.10068C9.30429 8.05567 9.23143 7.98328 9.18429 7.89958C9.12893 7.80599 9.10322 7.70167 9.10322 7.59584C9.10322 7.48657 9.12893 7.38069 9.18429 7.28717C9.23429 7.19364 9.30715 7.12278 9.39464 7.07778C9.48571 7.03278 9.58429 7.0133 9.68286 7.0222C9.78143 7.03111 9.87429 7.06911 9.95893 7.13446C10.0943 7.24373 10.188 7.39607 10.2221 7.56271C10.2584 7.73692 10.2307 7.92092 10.1421 8.08328C10.0564 8.24564 9.91429 8.36778 9.75322 8.41935C9.59143 8.47585 9.40715 8.46328 9.24393 8.38342C9.0807 8.30342 8.95179 8.16514 8.8807 7.99085C8.81322 7.81664 8.80715 7.62414 8.86786 7.44985C8.92786 7.27414 9.04429 7.13428 9.19393 7.05021C9.34429 6.95828 9.52144 6.92035 9.69071 6.93885C9.86393 6.95828 10.0264 7.03235 10.1557 7.14978C10.2882 7.26042 10.3852 7.40642 10.4414 7.57371C10.5002 7.74099 10.5164 7.92064 10.4877 8.09493C10.457 8.26907 10.3857 8.43386 10.2771 8.57007C10.1677 8.70706 10.0243 8.80971 9.86179 8.87778C9.75107 8.91713 9.63429 8.94713 9.51429 8.96042C9.52643 9.0962 9.51429 9.23184 9.47857 9.36591C9.41357 9.60355 9.28429 9.82527 9.10321 9.99956C8.93107 10.1731 8.71679 10.3124 8.47857 10.4089C8.37429 10.4481 8.26429 10.4817 8.15143 10.5091C7.86786 11.5334 7.18071 12.356 6.22321 12.8094C6.2457 12.899 6.27 12.9916 6.29714 13.0842C6.33429 13.2138 6.37714 13.356 6.42714 13.5095C6.49214 13.7055 6.71893 13.7725 6.87143 13.6521C9.6307 11.9004 11.2371 9.39242 10.9064 6.68677C10.5977 4.17863 8.62821 2.20499 6.1207 1.89591C2.97786 1.51977 0.281786 3.7352 0.281786 6.82371C0.281786 9.39184 1.61893 11.6025 3.58571 12.7126C3.8357 12.8594 4.14714 12.6994 4.13607 12.4125C4.12893 12.242 4.11357 12.0526 4.08571 11.8439C1.68571 10.6833 0.0139286 8.19363 0.903215 5.10606C1.79322 2.01742 4.87679 -0.0631418 8.00572 0.881823C11.1346 1.82678 13.2157 4.91442 12.3264 8.00306C11.899 9.58678 10.9064 10.8568 9.6557 11.7287C10.0914 12.8769 10.5264 14.0362 10.5264 14.0362C10.6264 14.3074 10.4314 14.5963 10.1457 14.5963H4.86071C4.57071 14.5963 4.38071 14.3167 4.4707 14.0429C4.4707 14.0429 4.6882 13.3553 5.01178 12.3452C2.59321 11.2725 1.90321 9.12698 1.90321 7.29677Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
                Try refreshing
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                setActiveTab('all');
                playSound('click');
              }}
              className="border-gray-200 dark:border-gray-700"
            >
              <BrainCircuit className="h-4 w-4 mr-2" />
              View all topics
            </Button>
          </div>
          
          {!searchQuery && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Suggested topics while you wait:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['AI Ethics', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'NLP'].map((topic, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    size="sm"
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    onClick={() => {
                      setSearchQuery(topic);
                      playSound('click');
                    }}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          )}
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
                <Card 
                  key={post.id} 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5
                   dark:hover:shadow-primary/10 group border border-transparent hover:border-primary/20 
                   dark:hover:border-primary/30 relative hover:-translate-y-1 hover:translate-x-0.5 bg-white/70 dark:bg-gray-900/70
                   backdrop-blur-sm rounded-xl"
                  style={{ 
                    animation: `fadeIn 800ms ease-out ${post.id % 10 * 100}ms forwards`,
                    opacity: 0
                  }}
                  onMouseEnter={() => playSound('focus')}
                  onClick={() => playSound('click')}
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                    {/* Animated glow effect on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 
                      opacity-0 group-hover:opacity-100 -z-10 blur-xl transition-opacity duration-700"></div>
                    
                    <img 
                      src={displayImage}
                      alt={post.title}
                      className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-105 
                        filter group-hover:brightness-110 group-hover:contrast-105 group-hover:saturate-105"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = getFallbackImage(post.id);
                      }}
                    />
                    
                    {/* Animated highlight gradient on top of image with additional visual effects */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 
                      group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Add a subtle overlay pattern for depth */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgMjAgMTAgTSAxMCAwIEwgMTAgMjAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] 
                      mix-blend-multiply dark:mix-blend-screen opacity-30"></div>
                    
                    {/* Animated shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 
                      group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1500 ease-in-out"></div>
                    
                    {/* Category label with enhanced animation */}
                    {post.category && (
                      <div className="absolute top-3 left-3 transition-transform duration-300 group-hover:translate-y-0.5">
                        <Badge 
                          variant="secondary" 
                          className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 
                            text-gray-700 dark:text-gray-300 shadow-sm backdrop-blur-sm
                            hover:scale-105 transition-all duration-200 font-medium"
                        >
                          {post.category === 'AI' || post.category.includes('AI') ? (
                            <span className="flex items-center">
                              <BrainCircuit className="h-3 w-3 mr-1 text-primary group-hover:animate-pulse" />
                              {post.category}
                            </span>
                          ) : post.category === 'Technology' || post.category === 'Tech' ? (
                            <span className="flex items-center">
                              <Cpu className="h-3 w-3 mr-1 text-blue-500" />
                              {post.category}
                            </span>
                          ) : post.category === 'Business' ? (
                            <span className="flex items-center">
                              <Briefcase className="h-3 w-3 mr-1 text-amber-500" />
                              {post.category}
                            </span>
                          ) : (
                            post.category
                          )}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Enhanced New badge with animation */}
                    {isNew && (
                      <div className="absolute top-3 right-3 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:translate-x-0.5">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/40 blur-sm rounded-full animate-pulse"></div>
                          <Badge 
                            variant="default" 
                            className="font-semibold shadow-md backdrop-blur-sm bg-primary/90 hover:bg-primary transition-all duration-500 relative"
                          >
                            <span className="relative inline-flex overflow-hidden">
                              <span className="animate-pulse">New</span>
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></span>
                            </span>
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="p-5 pb-2">
                    <Link 
                      href={`/articles/${post.id}`} 
                      className="outline-none group-hover:scale-[1.01] inline-block transition-transform duration-300
                        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={() => playSound('navigation')}
                    >
                      <CardTitle className="text-xl font-semibold line-clamp-2 group-hover:text-primary 
                        transition-colors relative inline"
                      >
                        {/* Underline animation on hover */}
                        <span className="bg-gradient-to-r from-primary to-primary bg-[length:0%_2px] group-hover:bg-[length:100%_2px] 
                          bg-no-repeat bg-bottom transition-all duration-500">
                          {post.title}
                        </span>
                        {isNew && (
                          <div className="inline-block ml-2 relative -top-1">
                            <span className="text-xs text-white dark:text-black font-medium bg-primary/80 dark:bg-primary px-1.5 py-0.5 rounded-sm">
                              New!
                            </span>
                          </div>
                        )}
                      </CardTitle>
                    </Link>
                    
                    <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 flex-wrap gap-2">
                      <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full
                        group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-300">
                        <Clock size={14} className="mr-1 text-primary/70 group-hover:text-primary transition-colors" />
                        {readingTime} min read
                      </span>
                      
                      <span className="flex items-center text-gray-500 dark:text-gray-400 group-hover:text-gray-700 
                        dark:group-hover:text-gray-300 transition-colors"
                      >
                        <svg className="h-3.5 w-3.5 mr-1 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 7V3M16 7V3M7 11h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-5 pt-2">
                    <div className="relative">
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-3 text-sm leading-relaxed group-hover:text-gray-700 
                        dark:group-hover:text-gray-200 transition-colors duration-300">
                        {post.summary || post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'}
                      </p>
                      <div className="absolute bottom-0 right-0 w-full h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs bg-transparent hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 
                                dark:hover:border-primary/30 cursor-pointer transition-all group-hover:-translate-y-0.5"
                              onClick={() => {
                                setSearchQuery(tag);
                                playSound('click');
                              }}
                            >
                              <span className="text-primary/70">#</span>{tag}
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