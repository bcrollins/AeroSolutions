import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, BrainCircuit, ChevronRight, ChevronLeft, Clock, X, BookOpen, Newspaper, Cpu, Briefcase, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import ArticleReactionBar from '@/components/articles/ArticleReactionBar';
import AIArticleInsights from '@/components/articles/AIArticleInsights';
import ArticleGenerationProgress from '@/components/ui/ArticleGenerationProgress';
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
  
  // Add article generation progress tracking
  const [articleGenerationProgress, setArticleGenerationProgress] = useState({
    current: 6,
    total: 50,
    isGenerating: true
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
      }
    }
  }, [postsData]);
  
  // Log any errors
  React.useEffect(() => {
    if (error) {
      console.error('Error loading articles:', error);
    }
  }, [error]);
  
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
        
        switch(activeTab) {
          case 'ai':
            return category.includes('ai') || 
              tags.some(tag => tag.includes('ai')) ||
              post.title.toLowerCase().includes('ai');
          case 'business':
            return category.includes('business') || 
              tags.some(tag => tag.includes('business')) ||
              post.title.toLowerCase().includes('business');
          case 'tech':
            return category.includes('tech') || 
              tags.some(tag => tag.includes('tech')) ||
              post.title.toLowerCase().includes('tech');
          case 'tutorials':
            return category.includes('tutorial') || 
              tags.some(tag => tag.includes('tutorial')) ||
              post.title.toLowerCase().includes('tutorial');
          case 'news':
            return category.includes('news') || 
              tags.some(tag => tag.includes('news')) ||
              post.title.toLowerCase().includes('news');
          default:
            return true;
        }
      });
    }
    
    // Filter based on search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      
      filtered = filtered.filter(post => {
        // Search in title, content, tags, and category
        const titleMatch = post.title.toLowerCase().includes(query);
        const contentMatch = post.content.toLowerCase().includes(query);
        const tagsMatch = post.tags 
          ? post.tags.some(tag => tag.toLowerCase().includes(query)) 
          : false;
        const categoryMatch = post.category 
          ? post.category.toLowerCase().includes(query) 
          : false;
        
        return titleMatch || contentMatch || tagsMatch || categoryMatch;
      });
    }
    
    setFilteredPosts(filtered);
    
    // Calculate total pages
    const calculatedTotalPages = Math.ceil(filtered.length / postsPerPage);
    setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
    
    // Reset page if we don't have enough results
    if (page > calculatedTotalPages && calculatedTotalPages > 0) {
      setPage(1);
    }
  }, [allPosts, activeTab, searchQuery, page, postsPerPage]);
  
  // Register keyboard shortcuts
  useEffect(() => {
    // Escape key to focus search
    const handleKeyDown = (e: KeyboardEvent) => {
      // / key to focus search
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        playSound('focus');
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
  }, [page, totalPages, playSound]);
  
  // Simulate article generation progress
  useEffect(() => {
    if (articleGenerationProgress.isGenerating && articleGenerationProgress.current < articleGenerationProgress.total) {
      const interval = setInterval(() => {
        setArticleGenerationProgress(prev => {
          const newCurrent = Math.min(prev.current + 1, prev.total);
          return {
            ...prev,
            current: newCurrent,
            isGenerating: newCurrent < prev.total
          };
        });
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [articleGenerationProgress]);
  
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
  
  // Function to get a themed placeholder image based on article ID and category
  const getFallbackImage = (id: number, category?: string | null): string => {
    // Use different placeholder images based on category if available
    if (category) {
      const lowerCategory = category.toLowerCase();
      
      if (lowerCategory.includes('business') || lowerCategory.includes('finance') || lowerCategory.includes('enterprise')) {
        return '/img/placeholders/ai-tech-2.svg';
      }
      
      if (lowerCategory.includes('green') || lowerCategory.includes('sustain') || lowerCategory.includes('environment')) {
        return '/img/placeholders/ai-tech-3.svg';
      }
      
      if (lowerCategory.includes('customer') || lowerCategory.includes('experience') || lowerCategory.includes('service')) {
        return '/img/placeholders/ai-tech-4.svg';
      }
      
      if (lowerCategory.includes('security') || lowerCategory.includes('governance') || lowerCategory.includes('compliance')) {
        return '/img/placeholders/ai-tech-5.svg';
      }
    }
    
    // Fallback: use a placeholder based on ID
    const imageIndex = id % 5;
    const fallbackImages = [
      '/img/placeholders/ai-tech-1.svg',
      '/img/placeholders/ai-tech-2.svg',
      '/img/placeholders/ai-tech-3.svg',
      '/img/placeholders/ai-tech-4.svg',
      '/img/placeholders/ai-tech-5.svg',
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
      
      {/* Hero section with our custom SVG */}
      <div className="mb-10 relative rounded-xl overflow-hidden shadow-md">
        <img 
          src="/img/news-hero.svg" 
          alt="AI News Hub"
          className="w-full h-auto object-cover"
        />
        
        <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            AI News Hub
            <div className="relative inline-flex ml-3">
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </div>
          </h1>
          <p className="text-xl text-white/90 max-w-xl drop-shadow-md">
            Stay up to date with the latest AI technology news, research breakthroughs, and industry insights.
          </p>
        </div>
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
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
          <div className="bg-primary/10 rounded-full p-1.5 mr-2">
            <Search size={16} className="text-primary" />
          </div>
          <span className="text-sm font-medium">
            {getResultCountText()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm rounded-r-none border-r border-gray-200 dark:border-gray-700"
              onClick={() => {
                playSound('click');
              }}
            >
              Newest first
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm rounded-l-none"
              onClick={() => {
                playSound('click');
              }}
            >
              Relevance
            </Button>
          </div>
        </div>
      </div>
      
      {/* Article Generation Progress */}
      {articleGenerationProgress.isGenerating && (
        <div className="mb-6">
          <ArticleGenerationProgress 
            current={articleGenerationProgress.current} 
            total={articleGenerationProgress.total} 
          />
        </div>
      )}
      
      {/* Loading state for posts */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="overflow-hidden border border-gray-100 dark:border-gray-800 h-full flex flex-col transition-all hover:shadow-md">
              <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {/* Use our themed placeholder SVGs */}
                <img
                  src={`/img/placeholders/ai-tech-${(idx % 5) + 1}.svg`}
                  alt="Loading"
                  className="w-full h-full object-cover opacity-40 dark:opacity-30"
                />
                
                {/* Enhanced shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer"></div>
                
                {/* Category pill skeleton */}
                <div className="absolute top-4 left-4">
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
              
              <CardHeader className="p-5 pb-2">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-4/5" />
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <Skeleton className="h-4 w-32 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-5 pt-2 flex-grow">
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </CardContent>
              
              <CardFooter className="p-4 flex justify-between border-t border-gray-100 dark:border-gray-800">
                <Skeleton className="h-7 w-24 rounded-md" />
                <div className="flex space-x-3">
                  <Skeleton className="h-7 w-16 rounded-md" />
                  <Skeleton className="h-7 w-16 rounded-md" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Error state */}
      {!isLoading && error && (
        <div className="bg-red-50 dark:bg-gray-900/90 border border-red-100 dark:border-red-800/30 rounded-xl p-6 text-center max-w-2xl mx-auto">
          <div className="mb-6 relative">
            <div className="w-32 h-32 mx-auto mb-2 opacity-80">
              <img src="/img/placeholders/ai-tech-5.svg" alt="Error illustration" className="w-full h-full object-cover rounded-lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-500 dark:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-3">
            Unable to load articles
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-5 max-w-md mx-auto">
            {error instanceof Error ? error.message : 'Failed to fetch articles from any available endpoint'}
          </p>
          <Button
            onClick={() => {
              window.location.reload();
              playSound('click');
            }}
            className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-800/30 dark:hover:bg-red-800/50 dark:text-red-300 px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try again
          </Button>
        </div>
      )}
      
      {/* Empty state when no posts match filters */}
      {!isLoading && !error && filteredPosts.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl p-8 text-center max-w-2xl mx-auto backdrop-blur-sm">
          <div className="mb-6 relative">
            <div className="w-40 h-40 mx-auto">
              <img 
                src={searchQuery ? "/img/placeholders/ai-tech-1.svg" : `/img/placeholders/ai-tech-${(activeTab === 'all' ? 1 : activeTab === 'ai' ? 1 : activeTab === 'business' ? 2 : activeTab === 'tech' ? 3 : 4)}.svg`} 
                alt="No articles found" 
                className="w-full h-full object-cover rounded-lg opacity-60 dark:opacity-40"
              />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            No articles found
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery ? (
              <>No articles match your search criteria "<span className="font-medium text-primary">{searchQuery}</span>". Try adjusting your search or filters.</>
            ) : (
              <>We don't have any articles in this category yet. Check back soon for updates.</>
            )}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {searchQuery && (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  playSound('navigation');
                }}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary/90 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear search
              </Button>
            )}
            
            {activeTab !== 'all' && (
              <Button
                onClick={() => {
                  setActiveTab('all');
                  playSound('navigation');
                }}
                className="bg-primary hover:bg-primary/90 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                View all articles
              </Button>
            )}
            
            <Button
              onClick={() => {
                window.location.reload();
                playSound('click');
              }}
              variant="ghost"
              className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>
      )}
      
      {/* Display posts grid */}
      {!isLoading && !error && filteredPosts.length > 0 && (
        <div>
          {/* Grid of posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.slice((page - 1) * postsPerPage, page * postsPerPage).map(post => {
              // Calculate reading time
              const readingTime = post.readTimeMinutes || getReadingTime(post.content);
              
              // Always use our custom themed placeholder images
              const displayImage = getFallbackImage(post.id, post.category);
              
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
                      className="w-full h-full object-cover transition-transform duration-500 
                        group-hover:scale-105 ease-out"
                      onError={(e) => {
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
                        <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-medium py-1 px-2.5 rounded border border-white/20 
                          shadow-lg group-hover:bg-primary/80 transition-all duration-300">
                          {post.category}
                        </div>
                      </div>
                    )}
                    
                    {/* Badge group for NEW and AI indicators */}
                    <div className="absolute top-3 right-3 flex flex-col space-y-2 items-end">
                      {/* New badge */}
                      {isNew && (
                        <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
                          <div className="bg-primary text-white text-xs font-bold py-1 px-2 rounded-sm flex items-center">
                            <span className="mr-1 animate-pulse">●</span> NEW
                          </div>
                        </div>
                      )}
                      
                      {/* AI-generated content badge */}
                      {post.aiGeneratedBy && (
                        <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
                          <div className="bg-black/40 backdrop-blur-sm text-white text-xs font-medium py-1 px-2 rounded-sm 
                            border border-white/10 flex items-center gap-1.5 group-hover:bg-purple-600/80 transition-all duration-300">
                            <BrainCircuit size={12} />
                            <span>AI Enhanced</span>
                          </div>
                        </div>
                      )}
                    </div>
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
                  
                  <CardFooter className="p-4 flex flex-col gap-3">
                    {/* AI Insights Expandable Panel */}
                    <div className="w-full">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-primary flex items-center">
                          <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-md">
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            <span className="font-medium">AI Insights</span>
                          </div>
                        </summary>
                        <div className="mt-2">
                          <AIArticleInsights 
                            articleId={post.id}
                            articleTitle={post.title}
                            articleContent={post.content}
                            tags={post.tags || []}
                          />
                        </div>
                      </details>
                    </div>
                    
                    {/* Actions Bar with Reading Time */}
                    <div className="flex flex-col gap-2">
                      {/* Reading time indicator */}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        <span>{readingTime} min read</span>
                      </div>
                      
                      {/* Actions row */}
                      <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800
                        group-hover:bg-gray-50/50 dark:group-hover:bg-gray-800/30 transition-colors duration-300 rounded-b-lg pt-3">
                        <ArticleReactionBar 
                          articleId={post.id}
                          compact={true}
                          variant="compact"
                          className="text-gray-600 dark:text-gray-400"
                        />
                        
                        <Link href={`/articles/${post.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary/80 hover:bg-primary/10 group/button transition-all duration-300
                              group-hover:shadow-sm"
                            onClick={() => playSound('navigation')}
                          >
                            Read more
                            <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover/button:translate-x-0.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
          {/* Enhanced Pagination with Animations and Micro-interactions */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-md ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => {
                    if (page > 1) {
                      setPage(prev => prev - 1);
                      playSound('click');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <div className="flex px-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // For more than 5 pages, we show a subset around the current page
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (page <= 3) {
                      pageNumber = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = page - 2 + i;
                    }
                    
                    if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= page - 1 && pageNumber <= page + 1)) {
                      return (
                        <Button
                          key={pageNumber}
                          variant={page === pageNumber ? "default" : "ghost"}
                          size="icon"
                          className={`mx-0.5 rounded-md h-9 w-9 transition-transform hover:scale-110 ${
                            page === pageNumber 
                              ? 'bg-primary text-white dark:text-white transform scale-110 shadow-md' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            setPage(pageNumber);
                            playSound('click');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          aria-label={`Page ${pageNumber}`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    } else if ((pageNumber === 2 && page > 3) || (pageNumber === totalPages - 1 && page < totalPages - 2)) {
                      return (
                        <div key={pageNumber} className="flex items-center justify-center w-9 h-9">
                          <span className="text-gray-400 dark:text-gray-600">...</span>
                        </div>
                      );
                    }
                    
                    return null;
                  })}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-md ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => {
                    if (page < totalPages) {
                      setPage(prev => prev + 1);
                      playSound('click');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsHubPage;