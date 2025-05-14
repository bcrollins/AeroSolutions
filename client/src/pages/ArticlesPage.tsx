import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { initAnalytics, trackPageView, trackArticleEvent } from "@/lib/analytics";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Search, Filter, FileText, ArrowRight, Clock, Tag } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types for articles
type Post = {
  id: number;
  title: string;
  content: string;
  summary?: string;
  slug: string;
  imageUrl?: string;
  category?: string;
  tags: string[];
  readTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
  authorId?: number;
  authorName?: string;
  status: string;
  viewCount: number;
};

// Article Card Component - Newspaper Style
const ArticleCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className="flex flex-col group">
      {/* Image Section */}
      <div className="relative mb-4 overflow-hidden">
        {post.imageUrl ? (
          <div 
            className="h-48 w-full bg-cover bg-center transform transition-transform duration-500 group-hover:scale-105" 
            style={{ backgroundImage: `url(${post.imageUrl})` }}
          />
        ) : (
          <div className="h-48 w-full bg-gradient-to-r from-blue-900 to-indigo-800 flex items-center justify-center">
            <FileText className="h-12 w-12 text-white/70" />
          </div>
        )}
        
        {/* Category Badge - Positioned on image */}
        {post.category && (
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1">
            {post.category}
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="flex flex-col flex-grow">
        {/* Date and Read Time */}
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <span className="font-medium">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          {post.readTimeMinutes && (
            <>
              <span className="mx-2">•</span>
              <Clock className="h-3 w-3 mr-1" />
              <span>{post.readTimeMinutes} min read</span>
            </>
          )}
        </div>
        
        {/* Title */}
        <Link href={`/articles/${post.slug}`}>
          <h3 className="text-lg font-bold leading-tight mb-2 transition-colors group-hover:text-blue-600">
            {post.title}
          </h3>
        </Link>
        
        {/* Summary */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {post.summary || post.content.substring(0, 150)}...
        </p>
        
        {/* Tags and Read More */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags && post.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="text-xs text-blue-500 hover:text-blue-700">
                #{tag}
              </span>
            ))}
            {post.tags && post.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{post.tags.length - 2}
              </span>
            )}
          </div>
          
          <Link href={`/articles/${post.slug}`} className="font-medium text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center">
            Read Article <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// No longer used - Featured articles are now handled in the newspaper-style layout

// Main Articles Page Component
const ArticlesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch all posts from API
  const { data: postsData, isLoading, error } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    retry: 3,
    retryDelay: 1000,
    select: (data) => {
      // Ensure we always have an array
      return Array.isArray(data) ? data : [];
    },
  });
  
  // Safely handle the posts data
  const posts = Array.isArray(postsData) ? postsData : [];

  // Filter posts based on search query, tab, and category
  const filteredPosts = posts.filter((post) => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    // Filter by tab
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'ai' && post.tags.includes('ai')) ||
      (activeTab === 'automation' && post.tags.includes('automation')) ||
      (activeTab === 'webdev' && post.tags.includes('web development'));
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Get categories from posts
  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean))) as string[];

  // Get featured posts (for now, just take the top 3 posts)
  const featuredPosts = [...posts]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 3);

  return (
    <div className="container py-12">
      <Helmet>
        <title>Articles | RXAI - AI, Automation, and Web Development Resources</title>
        <meta 
          name="description" 
          content="Explore our collection of SEO-optimized articles about artificial intelligence, automation, and web development. Find answers to your questions and learn with RXAI." 
        />
        <meta 
          name="keywords" 
          content="AI articles, artificial intelligence, automation guides, web development tutorials, RXAI resources" 
        />
      </Helmet>

      {/* Header - Newspaper Style Masthead */}
      <div className="border-b border-gray-800 mb-8 pb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight uppercase">
            RXAI <span className="font-light">News</span>
          </h1>
          <div className="text-sm text-muted-foreground flex justify-center items-center gap-6 mt-2">
            <span>May 14, 2025</span>
            <span>•</span>
            <span>Volume 1, Issue 7</span>
            <span>•</span>
            <span>Your Source for AI Innovation</span>
          </div>
        </div>
        
        {/* Newspaper-style Tagline */}
        <div className="border-y border-gray-800 py-3 text-center">
          <p className="text-lg font-medium italic">
            "Exploring in-depth articles about artificial intelligence, automation, and cutting-edge web development"
          </p>
        </div>
      </div>

      {/* Search & Navigation Bar - Newspaper Style */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-800 pb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search articles..." 
            className="pl-10 border-gray-700 focus:border-blue-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mr-2">
            <span>Filter by:</span>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] border-gray-700 bg-gray-900">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-gray-700 bg-gray-900">
                <Filter className="h-4 w-4" />
                Topics
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveTab('all')}>
                All Topics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('ai')}>
                Artificial Intelligence
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('automation')}>
                Automation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('webdev')}>
                Web Development
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content - Newspaper Layout */}
      <div className="space-y-16">
        {/* Featured Articles - Lead Story + Headlines */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b-2 border-blue-600">
            <h2 className="text-2xl font-bold uppercase tracking-wider">Featured Stories</h2>
          </div>
          
          {/* Newspaper Grid Layout */}
          {featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Lead Story (First column, spans 8 cols) */}
              {featuredPosts.length > 0 && (
                <div className="lg:col-span-8 border-r border-gray-800 lg:pr-6">
                  <div className="relative">
                    {featuredPosts[0].imageUrl ? (
                      <div 
                        className="h-[300px] md:h-[400px] w-full bg-cover bg-center" 
                        style={{ backgroundImage: `url(${featuredPosts[0].imageUrl})` }}
                      />
                    ) : (
                      <div className="h-[300px] md:h-[400px] w-full bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-center">
                        <FileText className="h-20 w-20 text-white/80" />
                      </div>
                    )}
                    
                    <div className="mt-4">
                      {featuredPosts[0].category && (
                        <span className="inline-block bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider px-2 py-1 mb-3">
                          {featuredPosts[0].category}
                        </span>
                      )}
                      
                      <Link href={`/articles/${featuredPosts[0].slug}`}>
                        <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight hover:text-blue-600 transition-colors">
                          {featuredPosts[0].title}
                        </h3>
                      </Link>
                      
                      <p className="text-lg text-muted-foreground mb-4 line-clamp-3">
                        {featuredPosts[0].summary || featuredPosts[0].content.substring(0, 280)}...
                      </p>
                      
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{featuredPosts[0].readTimeMinutes || '5'} min read</span>
                        </div>
                        
                        <Link href={`/articles/${featuredPosts[0].slug}`}>
                          <span className="font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center">
                            Continue Reading <ArrowRight className="h-3 w-3 ml-1" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Sidebar Stories (Second column, spans 4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-gray-800 pb-2 mb-4">
                  Top Headlines
                </h4>
                
                {featuredPosts.slice(1, 4).map((post, index) => (
                  <div key={post.id} className={`${index < featuredPosts.slice(1, 4).length - 1 ? 'pb-6 border-b border-gray-800 mb-6' : ''}`}>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {post.imageUrl ? (
                          <div 
                            className="h-20 w-20 bg-cover bg-center rounded-sm" 
                            style={{ backgroundImage: `url(${post.imageUrl})` }}
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gradient-to-r from-blue-800 to-indigo-800 flex items-center justify-center rounded-sm">
                            <FileText className="h-8 w-8 text-white/80" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        {post.category && (
                          <span className="inline-block text-blue-600 text-xs font-semibold uppercase mb-1">
                            {post.category}
                          </span>
                        )}
                        
                        <Link href={`/articles/${post.slug}`}>
                          <h4 className="text-base font-bold leading-tight hover:text-blue-600 transition-colors mb-2">
                            {post.title}
                          </h4>
                        </Link>
                        
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{post.readTimeMinutes || '5'} min read</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-gray-800 rounded-md">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No featured articles available</h3>
              <p className="text-muted-foreground">
                Featured articles will appear here when published.
              </p>
            </div>
          )}
        </section>

        {/* Topic Tabs - News Sections */}
        <section className="border-t border-gray-800 pt-8">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 border-b border-gray-800 pb-0">
              <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:rounded-none data-[state=active]:text-white rounded-none">
                All Articles
              </TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:rounded-none data-[state=active]:text-white rounded-none">
                AI Research
              </TabsTrigger>
              <TabsTrigger value="automation" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:rounded-none data-[state=active]:text-white rounded-none">
                Automation
              </TabsTrigger>
              <TabsTrigger value="webdev" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:rounded-none data-[state=active]:text-white rounded-none">
                Technology
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {filteredPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-12 border border-gray-800 rounded-md">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any articles matching your filters.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-gray-700 hover:bg-gray-800"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('all');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No AI articles found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any AI articles matching your filters.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('ai');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="automation" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No automation articles found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any automation articles matching your filters.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('automation');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="webdev" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No web development articles found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any web development articles matching your filters.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('webdev');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
};

export default ArticlesPage;