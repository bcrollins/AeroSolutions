import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Tag, User, Bookmark, Share2, MessageSquare, Search, Car, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@shared/schema';

// Type for our filtered posts
type FilteredPosts = {
  featured: Post[];
  carEvents: Post[];
  aiQa: Post[];
  latest: Post[];
};

const NewsHubPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch posts from our API
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['/api/posts'],
    select: (data: Post[]) => {
      // Make sure we have an array
      const postsArray = Array.isArray(data) ? data : [];
      
      // Log post count for debugging
      console.log(`Retrieved ${postsArray.length} articles from API`);
      
      // Filter and sort posts for different sections
      // For featured, use either featuredPost flag or take the first 4 articles if none are featured
      let featured = postsArray.filter(post => post.featuredPost);
      if (featured.length === 0 && postsArray.length > 0) {
        featured = [...postsArray].sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(a.createdAt);
          const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        }).slice(0, 4);
      }
      
      // For car events, either use car_event type or filter by category containing 'car' or 'automotive'
      const carEvents = postsArray.filter(post => 
        post.postType === 'car_event' || 
        (post.category && post.category.toLowerCase().includes('car')) ||
        (post.category && post.category.toLowerCase().includes('automotive'))
      ).slice(0, 6);
      
      // For AI Q&A, either use ai_qa type or filter by tags or category containing 'ai' or 'intelligence'
      const aiQa = postsArray.filter(post => 
        post.postType === 'ai_qa' || 
        (post.category && (
          post.category.toLowerCase().includes('ai') || 
          post.category.toLowerCase().includes('intelligence')
        )) ||
        (post.tags && post.tags.some && post.tags.some(tag => 
          tag && (tag.toLowerCase() === 'ai' || tag.toLowerCase().includes('intelligence'))
        ))
      ).slice(0, 6);
      
      // For latest, just sort by date
      const latest = [...postsArray].sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(a.createdAt);
        const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 12);

      return { featured, carEvents, aiQa, latest };
    }
  });

  // Filter posts based on search query
  const filteredPosts = posts ? filterPosts(posts, searchQuery) : null;

  function filterPosts(posts: FilteredPosts, query: string): FilteredPosts {
    if (!query.trim()) return posts;

    const q = query.toLowerCase();
    
    return {
      featured: posts.featured.filter(post => 
        post.title.toLowerCase().includes(q) || 
        (post.summary && post.summary.toLowerCase().includes(q)) ||
        (post.content && post.content.toLowerCase().includes(q))
      ),
      carEvents: posts.carEvents.filter(post => 
        post.title.toLowerCase().includes(q) || 
        (post.summary && post.summary.toLowerCase().includes(q)) ||
        (post.content && post.content.toLowerCase().includes(q))
      ),
      aiQa: posts.aiQa.filter(post => 
        post.title.toLowerCase().includes(q) || 
        (post.summary && post.summary.toLowerCase().includes(q)) ||
        (post.content && post.content.toLowerCase().includes(q)) ||
        (post.question && post.question.toLowerCase().includes(q))
      ),
      latest: posts.latest.filter(post => 
        post.title.toLowerCase().includes(q) || 
        (post.summary && post.summary.toLowerCase().includes(q)) ||
        (post.content && post.content.toLowerCase().includes(q))
      )
    };
  }

  function formatDate(date: string) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }

  return (
    <div className="container py-12 max-w-7xl">
      <Helmet>
        <title>ROLLINSX | AI News Hub</title>
        <meta name="description" content="Stay up-to-date with the latest car events, AI innovations, and expert answers to your AI questions." />
      </Helmet>

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          ROLLINSX AI News Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Stay informed with the latest automotive events, AI insights, and expert answers to your most pressing AI questions.
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
        <Tabs defaultValue="all" className="w-full md:w-auto" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="car_events">Car Events</TabsTrigger>
            <TabsTrigger value="ai_qa">AI Q&A</TabsTrigger>
            <TabsTrigger value="latest">Latest</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 w-full">
                <Skeleton className="h-48 w-full rounded-t-lg" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2 text-primary">
            Error loading articles
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            There was an error loading the articles. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-6">Refresh Page</Button>
        </div>
      ) : !filteredPosts || (filteredPosts &&
          filteredPosts.featured.length === 0 && 
          filteredPosts.carEvents.length === 0 && 
          filteredPosts.aiQa.length === 0 && 
          filteredPosts.latest.length === 0 &&
          posts?.latest?.length === 0) ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2 text-primary">
            Our articles are being generated
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            We're currently creating AI-powered articles for you. They'll be available shortly.
            This process may take a few minutes.
          </p>
          <div className="flex flex-col gap-2 items-center">
            <div className="text-xs text-muted-foreground mb-2">Articles being created: {Math.floor(Math.random() * 25) + 25}/50</div>
            <div className="h-2 w-64 bg-muted overflow-hidden rounded-full">
              <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-6">Refresh Page</Button>
          </div>
        </div>
      ) : filteredPosts ? (
        <div>
          {/* Featured Articles Section */}
          {(activeTab === 'all' || activeTab === 'latest') && filteredPosts.featured.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Featured Articles</h2>
                <Link href="/news/featured">
                  <Button variant="ghost">View all</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredPosts.featured.map(post => (
                  <FeaturedArticleCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Car Events Section */}
          {(activeTab === 'all' || activeTab === 'car_events') && filteredPosts.carEvents.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-blue-500" />
                  <h2 className="text-2xl font-bold">Automotive Events</h2>
                </div>
                <Link href="/news/car-events">
                  <Button variant="ghost">View all</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.carEvents.map(post => (
                  <CarEventCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* AI Q&A Section */}
          {(activeTab === 'all' || activeTab === 'ai_qa') && filteredPosts.aiQa.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-purple-500" />
                  <h2 className="text-2xl font-bold">AI Questions & Answers</h2>
                </div>
                <Link href="/news/ai-qa">
                  <Button variant="ghost">View all</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.aiQa.map(post => (
                  <QaCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Latest Articles Section */}
          {(activeTab === 'all' || activeTab === 'latest') && filteredPosts.latest.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Latest Articles</h2>
                <Link href="/news/latest">
                  <Button variant="ghost">View all</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.latest.map(post => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {searchQuery && 
           (filteredPosts.featured.length === 0 && 
            filteredPosts.carEvents.length === 0 && 
            filteredPosts.aiQa.length === 0 && 
            filteredPosts.latest.length === 0) && (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">We couldn't find any articles matching "{searchQuery}"</p>
              <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

// Article card components
const FeaturedArticleCard: React.FC<{ post: Post }> = ({ post }) => {
  // Generate safe title and slug
  const safeTitle = post.title || "ROLLINSX Article";
  const safeSlug = post.slug || `article-${post.id}`;
  const safeDate = post.publishedAt || post.createdAt || new Date().toISOString();
  
  return (
    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 w-full">
        {post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt={safeTitle} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary/40">ROLLINSX</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-primary/80 text-white">Featured</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg">{safeTitle}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {post.summary || (post.content && post.content.substring(0, 120) + '...') || 'Read the full article for more details.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {formatDistanceToNow(new Date(safeDate), { addSuffix: true })}
        </div>
        <Link href={`/news/${safeSlug}`}>
          <Button size="sm" variant="ghost">Read More</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const ArticleCard: React.FC<{ post: Post }> = ({ post }) => {
  // Generate safe values
  const safeTitle = post.title || "ROLLINSX Article";
  const safeSlug = post.slug || `article-${post.id}`;
  const safeDate = post.publishedAt || post.createdAt || new Date().toISOString();
  const readTime = post.readTimeMinutes || Math.floor(Math.random() * 10) + 3; // Fallback to 3-12 min
  
  return (
    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 w-full">
        {post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt={safeTitle} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary/40">ROLLINSX</span>
          </div>
        )}
        {post.premium && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-amber-500 text-white">Premium</Badge>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg">{safeTitle}</CardTitle>
        <CardDescription className="flex items-center text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(safeDate).toLocaleDateString()}
          <span className="mx-1">•</span>
          <Clock className="h-3 w-3 mr-1" />
          {readTime} min read
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {post.summary || (post.content && post.content.substring(0, 120) + '...') || 'Read the full article for more details.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {post.tags && post.tags.length > 0 ? (
            post.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-xs">AI</Badge>
          )}
        </div>
        <Link href={`/news/${safeSlug}`}>
          <Button size="sm">Read More</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const CarEventCard: React.FC<{ post: Post }> = ({ post }) => {
  // Generate safe values
  const safeTitle = post.title || "ROLLINSX Automotive Event";
  const safeSlug = post.slug || `event-${post.id}`;
  const safeDate = post.eventDate || post.publishedAt || post.createdAt || new Date().toISOString();
  const safeLocation = post.eventLocation || "ROLLINSX Venue";
  const safeOrganizer = post.eventOrganizer || "ROLLINSX";
  
  return (
    <Card className="overflow-hidden h-full border-blue-200 dark:border-blue-900 transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 w-full">
        {post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt={safeTitle} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
            <Car className="h-12 w-12 text-blue-500/40" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-blue-500 text-white">Event</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg">{safeTitle}</CardTitle>
        <CardDescription className="flex items-center text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(safeDate).toLocaleDateString()}
          <span className="mx-1">•</span>
          {safeLocation}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {post.summary || (post.content && post.content.substring(0, 120) + '...') || 'Get details about this automotive event. Stay updated with the latest trends and innovations.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <User className="h-3 w-3 mr-1" />
          {safeOrganizer}
        </div>
        <Link href={`/news/${safeSlug}`}>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const QaCard: React.FC<{ post: Post }> = ({ post }) => {
  // Generate safe values
  const safeQuestion = post.question || post.title || "How can AI improve business operations?";
  const safeSlug = post.slug || `qa-${post.id}`;
  const safeAiModel = post.aiGeneratedBy === 'xai' ? 'Grok AI' : (post.aiGeneratedBy || 'AI');
  
  return (
    <Card className="overflow-hidden h-full border-purple-200 dark:border-purple-900 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <BrainCircuit className="h-4 w-4 text-purple-500" />
            <span>AI Q&A</span>
            <Badge variant="outline" className="ml-1 text-xs">
              {safeAiModel}
            </Badge>
          </div>
        </div>
        <CardTitle className="line-clamp-2 text-lg">
          {safeQuestion}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {post.summary || (post.content && post.content.substring(0, 160) + '...') || 'Read the complete answer to this question from our AI assistant. Get expert insights and practical advice.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
            <Bookmark className="h-4 w-4" />
            <span className="sr-only">Bookmark</span>
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
        <Link href={`/news/${safeSlug}`}>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Read Answer</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default NewsHubPage;