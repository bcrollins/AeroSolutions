import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
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

// Article Card Component
const ArticleCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-4 pb-2">
        <div className="flex gap-2 mb-2">
          {post.category && (
            <Badge variant="outline" className="text-xs font-medium text-blue-600">
              {post.category}
            </Badge>
          )}
          {post.readTimeMinutes && (
            <Badge variant="secondary" className="text-xs font-normal flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTimeMinutes} min read
            </Badge>
          )}
        </div>
        <Link href={`/articles/${post.slug}`}>
          <CardTitle className="text-lg font-bold hover:text-blue-600 cursor-pointer transition-colors">
            {post.title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {post.summary || post.content.substring(0, 150)}...
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {post.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {post.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{post.tags.length - 2}
            </Badge>
          )}
        </div>
        <Link href={`/articles/${post.slug}`}>
          <Button variant="link" className="p-0 h-auto font-semibold flex items-center">
            Read more <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

// Featured Article Card Component
const FeaturedArticleCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {post.imageUrl ? (
        <div 
          className="h-48 w-full bg-cover bg-center" 
          style={{ backgroundImage: `url(${post.imageUrl})` }}
        />
      ) : (
        <div className="h-48 w-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
          <FileText className="h-16 w-16 text-white" />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex gap-2 mb-3">
          {post.category && (
            <Badge className="bg-blue-600 text-white hover:bg-blue-700">
              {post.category}
            </Badge>
          )}
          {post.readTimeMinutes && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTimeMinutes} min read
            </Badge>
          )}
        </div>
        <Link href={`/articles/${post.slug}`}>
          <h3 className="text-xl font-bold mb-3 hover:text-blue-600 cursor-pointer transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.summary || post.content.substring(0, 180)}...
        </p>
        <Link href={`/articles/${post.slug}`}>
          <Button>
            Read Article <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

// Main Articles Page Component
const ArticlesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch all posts from API
  const { data: posts = [], isLoading, error } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    retry: 3,
    retryDelay: 1000,
    select: (data) => {
      // If we want to organize posts into categories and sections
      return data;
    },
  });

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

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          RXAI Knowledge Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore in-depth articles about artificial intelligence, automation, and web development to find answers to your most pressing questions.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search articles..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
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
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
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

      {/* Content */}
      <div className="space-y-16">
        {/* Featured Articles */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Articles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <FeaturedArticleCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        {/* Topic Tabs */}
        <section>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="all">All Topics</TabsTrigger>
              <TabsTrigger value="ai">Artificial Intelligence</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="webdev">Web Development</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any articles matching your filters.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
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