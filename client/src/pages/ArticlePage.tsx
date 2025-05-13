import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Tag, User, Bookmark, Share2, MessageSquare, ArrowLeft, Car, BrainCircuit, Eye, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Post } from '@shared/schema';

const ArticlePage: React.FC = () => {
  const [, params] = useRoute('/news/:slug');
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ['/api/posts', slug],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${slug}`);
      if (!response.ok) {
        throw new Error('Article not found');
      }
      return response.json();
    },
    enabled: !!slug
  });

  // Get related articles
  const { data: relatedArticles } = useQuery<Post[]>({
    queryKey: ['/api/posts/related', slug],
    queryFn: async () => {
      if (!post) return [];
      const response = await fetch(`/api/posts/related?category=${post.category}&limit=3&exclude=${post.id}`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
    enabled: !!post
  });

  if (isLoading) {
    return <ArticleSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/news">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News Hub
          </Button>
        </Link>
      </div>
    );
  }

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determine article type icon and badge
  const getArticleTypeInfo = () => {
    switch (post.postType) {
      case 'car_event':
        return {
          icon: <Car className="h-5 w-5 text-blue-500" />,
          badge: <Badge className="bg-blue-500 text-white">Car Event</Badge>,
          color: 'text-blue-500'
        };
      case 'ai_qa':
        return {
          icon: <BrainCircuit className="h-5 w-5 text-purple-500" />,
          badge: <Badge className="bg-purple-500 text-white">AI Q&A</Badge>,
          color: 'text-purple-500'
        };
      default:
        return {
          icon: <MessageSquare className="h-5 w-5 text-primary" />,
          badge: post.premium ? <Badge className="bg-amber-500 text-white">Premium</Badge> : null,
          color: 'text-primary'
        };
    }
  };

  const { icon, badge, color } = getArticleTypeInfo();

  // Create SEO meta data
  const metaTitle = post.seoTitle || post.title;
  const metaDescription = post.seoDescription || post.summary || post.content.substring(0, 160);
  const metaKeywords = post.seoKeywords || post.tags?.join(', ');

  return (
    <>
      <Helmet>
        <title>{metaTitle} | ROLLINSX</title>
        <meta name="description" content={metaDescription} />
        {metaKeywords && <meta name="keywords" content={metaKeywords} />}
        {post.canonicalUrl && <link rel="canonical" href={post.canonicalUrl} />}
        
        {/* Open Graph / Social Media */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/news/${post.slug}`} />
        {post.socialImage && <meta property="og:image" content={post.socialImage} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content={post.twitterCardType || "summary_large_image"} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {post.socialImage && <meta name="twitter:image" content={post.socialImage} />}
        
        {/* Schema.org markup for Google */}
        {post.schemaMarkup && (
          <script type="application/ld+json">
            {post.schemaMarkup}
          </script>
        )}
      </Helmet>

      <div className="container py-12 max-w-5xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/news">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News Hub
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            {icon}
            {post.category && (
              <Link href={`/news/category/${post.category.toLowerCase()}`}>
                <Badge variant="outline" className={`hover:${color}`}>{post.category}</Badge>
              </Link>
            )}
            {badge}
            {post.premium && <Badge className="bg-amber-500 text-white">Premium</Badge>}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {post.postType === 'ai_qa' ? post.question || post.title : post.title}
          </h1>

          {post.summary && (
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {post.summary}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.authorId && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>ROLLINSX Editor</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            
            {post.readTimeMinutes && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{post.readTimeMinutes} min read</span>
              </div>
            )}

            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span>{post.viewCount || 0} views</span>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {post.imageUrl && (
          <div className="mb-10 rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-auto object-cover max-h-[500px]" 
            />
          </div>
        )}

        {/* Event Details (for car events) */}
        {post.postType === 'car_event' && post.eventDate && (
          <Card className="mb-10 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Date & Time</h3>
                  <p>{new Date(post.eventDate).toLocaleString()}</p>
                </div>
                {post.eventLocation && (
                  <div>
                    <h3 className="font-medium mb-1">Location</h3>
                    <p>{post.eventLocation}</p>
                  </div>
                )}
                {post.eventOrganizer && (
                  <div>
                    <h3 className="font-medium mb-1">Organizer</h3>
                    <p>{post.eventOrganizer}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Article Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none mb-10">
          {post.postType === 'ai_qa' && post.question && (
            <div className="bg-purple-50 dark:bg-purple-950/30 p-6 rounded-lg mb-8 border border-purple-200 dark:border-purple-800">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-purple-500" />
                Question
              </h2>
              <p className="text-lg">{post.question}</p>
              
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <BrainCircuit className="h-4 w-4 mr-2 text-purple-500" />
                <span>Answered by {post.aiGeneratedBy === 'xai' ? 'Grok AI' : post.aiGeneratedBy || 'AI'}</span>
              </div>
            </div>
          )}

          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Link key={index} href={`/news/tag/${tag.toLowerCase()}`}>
                  <Badge variant="outline" className="hover:bg-primary/10">{tag}</Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Social Sharing */}
        <div className="flex items-center gap-4 mb-10">
          <Button variant="outline" size="sm">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Like {post.likeCount ? `(${post.likeCount})` : ''}
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <Separator className="my-10" />

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((article) => (
                <Card key={article.id} className="h-full">
                  {article.imageUrl && (
                    <div className="aspect-w-16 aspect-h-9 w-full h-40">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="h-full w-full object-cover rounded-t-lg" 
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
                    <CardDescription className="flex items-center text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(article.publishedAt || article.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {article.summary || article.content.substring(0, 100) + '...'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/news/${article.slug}`}>
                      <Button size="sm">Read More</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Skeleton loader for article
const ArticleSkeleton: React.FC = () => {
  return (
    <div className="container py-12 max-w-5xl">
      <div className="mb-8">
        <Skeleton className="h-10 w-32" />
      </div>
      
      <header className="mb-10">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-8 w-full max-w-2xl mb-6" />
        
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
        </div>
      </header>
      
      <Skeleton className="h-80 w-full mb-10 rounded-lg" />
      
      <div className="space-y-6 mb-10">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </div>
      
      <div className="mb-10">
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      
      <div className="flex gap-4 mb-10">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      <Skeleton className="h-1 w-full my-10" />
      
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;