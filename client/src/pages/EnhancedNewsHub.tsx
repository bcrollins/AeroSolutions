import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { optimizedFetch } from '@/utils/optimizedFetch';
import { debounce } from '@/utils/performanceUtils';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { usePerformance } from '@/hooks/use-performance';
import VirtualList from '@/components/ui/VirtualList';
import { Card } from '@/components/ui/card';
import PrimaryButton from '@/components/ui/PrimaryButton';
import NavigationMenu from '@/components/ui/NavigationMenu';
import ArticleCard from '@/components/articles/ArticleCard';
import { Search, TrendingUp, Clock, Filter } from 'lucide-react';

// Types
interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readingTime: number;
  category?: string;
  tags: string[];
  trending: boolean;
  featured: boolean;
}

interface CategoryFilter {
  name: string;
  slug: string;
  count: number;
}

/**
 * Enhanced News Hub with Apple-inspired design
 * 
 * Features:
 * - Optimized image loading
 * - Virtual list for performance
 * - Debounced search input
 * - Category filtering
 * - Responsive layout for mobile and desktop
 * - Advanced article UI components
 */
const EnhancedNewsHub: React.FC = () => {
  // Hooks for performance optimization and effects
  const { playSound } = useSoundEffects();
  const { throttleRender, debounceInput } = usePerformance();
  const [location, setLocation] = useLocation();
  
  // State for filters and layout
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  
  // Load articles with React Query for caching and automatic refetching
  const { 
    data: articlesData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['articles', searchTerm, activeCategory, page],
    queryFn: () => optimizedFetch<{ 
      articles: Article[],
      totalCount: number,
      categories: CategoryFilter[]
    }>(
      `/api/articles?search=${encodeURIComponent(searchTerm)}&category=${activeCategory}&page=${page}&limit=${pageSize}`
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const articles = articlesData?.articles || [];
  const totalCount = articlesData?.totalCount || 0;
  const categories = articlesData?.categories || [];
  
  // Debounced search handler
  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setPage(1); // Reset to first page on new search
    }, 300),
    []
  );
  
  // Navigate to article detail
  const handleArticleClick = (slug: string) => {
    playSound('navigation');
    setLocation(`/news/${slug}`);
  };
  
  // Load more articles
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };
  
  // Render all categories as filters
  const renderCategoryFilters = () => {
    const allCategories = [
      { name: 'All Categories', slug: 'all', count: totalCount },
      ...categories
    ];
    
    return (
      <NavigationMenu
        items={allCategories.map(cat => ({
          label: `${cat.name} (${cat.count})`,
          path: cat.slug,
        }))}
        variant="pill"
        className="mb-6 pb-2 overflow-x-auto"
        onItemClick={(item) => {
          playSound('click');
          setActiveCategory(item.path);
          setPage(1);
        }}
      />
    );
  };
  
  // Render different views (grid or list)
  const renderArticles = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div 
              key={`skeleton-${i}`}
              className="h-[400px] animate-pulse rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="p-6 text-center rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Unable to load articles</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We encountered an error while loading the articles. Please try again later.
          </p>
          <PrimaryButton
            onClick={() => window.location.reload()}
          >
            Retry
          </PrimaryButton>
        </div>
      );
    }
    
    if (articles.length === 0) {
      return (
        <div className="p-6 text-center rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="text-xl font-semibold mb-2">No articles found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No articles match your current search criteria. Try adjusting your filters.
          </p>
          <PrimaryButton
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('all');
            }}
          >
            Clear Filters
          </PrimaryButton>
        </div>
      );
    }
    
    // Grid view (default)
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              title={article.title}
              excerpt={article.excerpt}
              slug={article.slug}
              coverImage={article.coverImage}
              author={article.author}
              publishedAt={article.publishedAt}
              readingTime={article.readingTime}
              category={article.category}
              tags={article.tags}
              trending={article.trending}
              featured={article.featured}
            />
          ))}
        </div>
      );
    }
    
    // List view
    return (
      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            id={article.id}
            title={article.title}
            excerpt={article.excerpt}
            slug={article.slug}
            coverImage={article.coverImage}
            author={article.author}
            publishedAt={article.publishedAt}
            readingTime={article.readingTime}
            category={article.category}
            tags={article.tags}
            trending={article.trending}
            featured={article.featured}
            variant="horizontal"
          />
        ))}
      </div>
    );
  };
  
  return (
    <>
      <Helmet>
        <title>AI Learning Platform | News Hub</title>
        <meta 
          name="description" 
          content="Stay up-to-date with the latest news, articles, and insights on artificial intelligence, machine learning, and technology trends."
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            AI News Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Stay informed with the latest developments, trends, and insights in artificial intelligence and machine learning.
          </p>
        </div>
        
        {/* Featured articles section */}
        {articles.filter(a => a.featured).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Featured Articles
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {articles
                .filter(article => article.featured)
                .slice(0, 2)
                .map(article => (
                  <ArticleCard
                    key={`featured-${article.id}`}
                    id={article.id}
                    title={article.title}
                    excerpt={article.excerpt}
                    slug={article.slug}
                    coverImage={article.coverImage}
                    author={article.author}
                    publishedAt={article.publishedAt}
                    readingTime={article.readingTime}
                    category={article.category}
                    tags={article.tags}
                    trending={article.trending}
                    featured={true}
                    variant="horizontal"
                  />
                ))}
            </div>
          </div>
        )}
        
        {/* Search and filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search articles..."
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <button
                  className={`px-3 py-1.5 ${viewMode === 'grid' ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                  onClick={() => {
                    setViewMode('grid');
                    playSound('click');
                  }}
                  aria-label="Grid view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2z"/>
                  </svg>
                </button>
                <button
                  className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                  onClick={() => {
                    setViewMode('list');
                    playSound('click');
                  }}
                  aria-label="List view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                  </svg>
                </button>
              </div>
              
              <PrimaryButton
                variant="outline"
                size="sm"
                icon={<Filter className="w-4 h-4" />}
                onClick={() => playSound('click')}
              >
                Filter
              </PrimaryButton>
            </div>
          </div>
        </div>
        
        {/* Category filters */}
        {renderCategoryFilters()}
        
        {/* Main content */}
        <div className="mb-8">
          {renderArticles()}
          
          {/* Load more button */}
          {articles.length > 0 && articles.length < totalCount && (
            <div className="flex justify-center mt-8">
              <PrimaryButton
                onClick={handleLoadMore}
                loading={isLoading}
                icon={<Clock className="w-4 h-4" />}
              >
                Load More Articles
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EnhancedNewsHub;