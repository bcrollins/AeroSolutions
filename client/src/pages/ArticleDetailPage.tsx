import React, { useEffect, useState, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, User, Share2, MessageSquare, ThumbsUp, Tag, FileText, BrainCircuit, Book, Fullscreen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';
import ReadingProgressBar from '@/components/articles/ReadingProgressBar';
import EnhancedTableOfContents from '@/components/articles/EnhancedTableOfContents';
import SocialSharingButtons from '@/components/articles/SocialSharingButtons';
import CommentsSection from '@/components/articles/CommentsSection';
import RelatedArticlesCarousel from '@/components/articles/RelatedArticlesCarousel';
import PersonalizedRecommendations from '@/components/articles/PersonalizedRecommendations';
import VoiceNarration from '@/components/articles/VoiceNarration';
import EmbeddedCTAs from '@/components/articles/EmbeddedCTAs';
import ImmersiveReadingMode from '@/components/articles/ImmersiveReadingMode';

// Types for articles and related components
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
  question?: string;
  aiGeneratedBy?: string;
  faqs?: { question: string; answer: string }[];
  schemaMarkup?: string;
};

// Article Skeleton Component for loading state
const ArticleSkeleton: React.FC = () => {
  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8 h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="mb-4 h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="mb-8 h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      <div className="mb-8">
        <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
      </div>
    </div>
  );
};

// Related Article Card Component
const RelatedArticleCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-4 pb-2">
        <Link href={`/articles/${post.slug}`}>
          <CardTitle className="text-base font-bold hover:text-blue-600 cursor-pointer transition-colors line-clamp-2">
            {post.title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {post.summary || post.content.substring(0, 100)}...
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{post.readTimeMinutes || 5} min read</span>
        </div>
        <Link href={`/articles/${post.slug}`}>
          <Button variant="link" className="p-0 h-auto text-sm">Read more</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

// Using EnhancedTableOfContents component instead

// Main Article Detail Page Component
const ArticleDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const [, params] = useRoute('/articles/:slug');
  const { toast } = useToast();
  const slug = params?.slug;
  const articleRef = useRef<HTMLDivElement>(null);
  const [isImmersiveModeActive, setIsImmersiveModeActive] = useState(false);
  
  // Share function
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.summary,
        url: window.location.href,
      })
      .then(() => {
        trackEvent('article_shared', 'engagement', post?.title);
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
      trackEvent('article_link_copied', 'engagement', post?.title);
    }
  };
  
  // Toggle immersive reading mode
  const toggleImmersiveMode = () => {
    setIsImmersiveModeActive(!isImmersiveModeActive);
    trackEvent(
      isImmersiveModeActive ? 'exit_immersive_mode' : 'enter_immersive_mode',
      'engagement',
      post?.title
    );
  };

  // Fetch article data
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

  // Get related articles based on category and tags
  const { data: relatedArticles = [] } = useQuery<Post[]>({
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

  // Track article view
  useEffect(() => {
    if (post) {
      // Record view with analytics
      trackEvent('article_viewed', 'engagement', post.title);
      
      // Attempt to increment view count in the database
      fetch(`/api/posts/${post.id}/view`, { method: 'POST' })
        .catch(error => console.error('Failed to record view', error));
    }
  }, [post]);

  // Processing content to add IDs to headings for the table of contents
  const processContent = (content: string) => {
    return content.replace(/^(#{2,3})\s+(.+)$/gm, (match, hashes, title) => {
      const id = title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
      return `${hashes} <a id="${id}"></a>${title}`;
    });
  };

  // Loading state
  if (isLoading) {
    return <ArticleSkeleton />;
  }

  // Error or article not found
  if (error || !post) {
    return (
      <div className="container py-16 text-center">
        <Helmet>
          <title>Article Not Found | RXAI</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/articles">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
        </Link>
      </div>
    );
  }

  // Format date
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Determine the appropriate icon for different article types
  const getTypeIcon = () => {
    if (post.question) {
      return <BrainCircuit className="h-5 w-5 text-purple-500" />;
    }
    return null;
  };

  // Schema markup for SEO
  const generateSchemaMarkup = () => {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.summary,
      "image": post.imageUrl,
      "datePublished": post.createdAt,
      "dateModified": post.updatedAt,
      "author": {
        "@type": "Person",
        "name": post.authorName || "RXAI Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "RXAI",
        "logo": {
          "@type": "ImageObject",
          "url": "https://rollinsx.dev/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://rollinsx.dev/articles/${post.slug}`
      }
    };

    // Add FAQ schema if available
    if (post.faqs && post.faqs.length > 0) {
      (articleSchema as any).mainEntity = post.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }));
    }

    return JSON.stringify(articleSchema);
  };

  // If immersive mode is active, render the immersive reading view
  if (isImmersiveModeActive && post) {
    return (
      <ImmersiveReadingMode
        content={post.content}
        title={post.title}
        onExit={toggleImmersiveMode}
      />
    );
  }

  // Determine content type for targeted CTAs
  const determineContentType = () => {
    if (!post) return 'general';
    
    if (post.tags.includes('ai') || post.category?.toLowerCase() === 'ai') {
      return 'ai';
    }
    if (post.tags.includes('development') || post.tags.includes('web development')) {
      return 'development';
    }
    if (post.tags.includes('marketing') || post.category?.toLowerCase() === 'marketing') {
      return 'marketing';
    }
    
    return 'general';
  };
  
  // Get mock comments data (in a real app, this would come from the API)
  const getMockComments = () => {
    return [
      {
        id: 1,
        content: "Great article! I found the insights about AI decision-making particularly useful for my business.",
        authorName: "Alex Johnson",
        authorImage: "https://ui-avatars.com/api/?name=AJ&background=0D8ABC&color=fff",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        likes: 5,
        replies: [
          {
            id: 2,
            content: "I agree! The practical applications section was exactly what I needed.",
            authorName: "Taylor Smith",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            likes: 2,
            replies: []
          }
        ]
      }
    ];
  };
  
  return (
    <div className="container py-6 md:py-12">
      <Helmet>
        <title>{post.title} | RXAI</title>
        <meta name="description" content={post.summary || post.content.substring(0, 160)} />
        <meta name="keywords" content={post.tags.join(', ')} />
        <link rel="canonical" href={`https://rollinsx.dev/articles/${post.slug}`} />
        <script type="application/ld+json">
          {post.schemaMarkup || generateSchemaMarkup()}
        </script>
      </Helmet>

      {/* Reading Progress Bar */}
      <ReadingProgressBar color="#007bff" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" ref={articleRef}>
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Navigation */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/articles">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
            
            {/* Immersive Mode Toggle */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleImmersiveMode}
              className="flex items-center gap-2"
            >
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">Immersive Mode</span>
            </Button>
          </div>

          {/* Article Header */}
          <header className="mb-10">
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              {getTypeIcon()}
              {post.category && (
                <Link href={`/articles/category/${post.category.toLowerCase()}`}>
                  <Badge variant="outline" className="hover:bg-blue-600 hover:text-white">{post.category}</Badge>
                </Link>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {post.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
                {post.readTimeMinutes && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTimeMinutes} min read</span>
                  </div>
                )}
                {post.authorName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.authorName}</span>
                  </div>
                )}
              </div>
              
              {/* Social Sharing Buttons */}
              <SocialSharingButtons 
                title={post.title}
                url={window.location.href}
                summary={post.summary}
              />
            </div>
          </header>

          {/* Featured Image */}
          {post.imageUrl && (
            <div className="mb-10">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-auto rounded-lg" 
              />
            </div>
          )}

          {/* If it's a Q&A post, display the question prominently */}
          {post.question && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg mb-8 border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                Question
              </h2>
              <p className="text-lg">{post.question}</p>
              
              {post.aiGeneratedBy && (
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <BrainCircuit className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Answered by {post.aiGeneratedBy === 'xai' ? 'Grok AI' : post.aiGeneratedBy}</span>
                </div>
              )}
            </div>
          )}

          {/* Voice Narration */}
          <VoiceNarration 
            content={post.content}
            title={post.title}
          />

          {/* Article Content - First Part */}
          <article className="prose prose-lg dark:prose-invert max-w-none mb-6">
            <ReactMarkdown>{processContent(post.content.substring(0, post.content.length / 3))}</ReactMarkdown>
          </article>
          
          {/* First CTA - Embedded within content */}
          <EmbeddedCTAs 
            contentType={determineContentType()} 
            variant="minimal"
          />
          
          {/* Article Content - Second Part */}
          <article className="prose prose-lg dark:prose-invert max-w-none mb-10">
            <ReactMarkdown>{processContent(post.content.substring(post.content.length / 3))}</ReactMarkdown>
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-10">
              <div className="flex flex-wrap gap-2 items-center">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag, index) => (
                  <Link key={index} href={`/articles/tag/${tag}`}>
                    <Badge variant="secondary" className="hover:bg-secondary-foreground hover:text-secondary transition-colors">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-10 pt-6 border-t">
            <div className="flex gap-4">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <div className="flex gap-4">
              {/* Link to our courses or services based on the article topic */}
              {post.tags.includes('ai') && (
                <Link href="/ai-courses/catalog">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Explore AI Courses
                  </Button>
                </Link>
              )}
              {post.tags.includes('web development') && (
                <Link href="/service-packages">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    See Development Services
                  </Button>
                </Link>
              )}
              {!post.tags.includes('ai') && !post.tags.includes('web development') && (
                <Link href="/pricing">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Try Free
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* FAQs - Collapsible */}
          {post.faqs && post.faqs.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {post.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-base font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose dark:prose-invert">
                        <ReactMarkdown>{faq.answer}</ReactMarkdown>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Comments Section */}
          <CommentsSection 
            postId={post.id}
            comments={getMockComments()}
          />

          {/* Related Articles Carousel */}
          <RelatedArticlesCarousel 
            articles={relatedArticles}
            currentPostId={post.id}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Enhanced Table of Contents */}
          <EnhancedTableOfContents content={post.content} />
          
          {/* Personalized Recommendations */}
          <PersonalizedRecommendations
            recentPosts={relatedArticles}
            trendingPosts={relatedArticles}
            personalizedPosts={relatedArticles}
            currentPostId={post.id}
          />
          
          {/* Cross-Promotion for Premium Subscription */}
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Premium Access</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Get unlimited access to all our articles, AI courses, and digital tools with a premium subscription.
              </p>
              <Link href="/pricing">
                <Button className="w-full">Try Free</Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Featured Tool or Course */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Featured Tool</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-muted-foreground mb-4">
                <h3 className="font-medium text-foreground mb-1">AI Content Generator</h3>
                <p>Create high-quality content for your blog, social media, and marketing campaigns.</p>
              </div>
              <Link href="/ai-tools">
                <Button variant="outline" className="w-full">Explore Tools</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;