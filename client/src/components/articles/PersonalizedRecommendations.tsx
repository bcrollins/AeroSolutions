import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, TrendingUp, History, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { trackEvent } from '@/lib/analytics';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  category?: string;
  tags: string[];
  readTimeMinutes?: number;
  createdAt: string;
  authorName?: string;
  viewCount: number;
}

interface PersonalizedRecommendationsProps {
  recentPosts?: Post[];
  trendingPosts?: Post[];
  personalizedPosts?: Post[];
  currentPostId?: number;
}

const ArticleCard = ({ post }: { post: Post }) => {
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-4 pb-2">
        <Link 
          href={`/articles/${post.slug}`}
          onClick={() => trackEvent('recommendation_clicked', 'engagement', post.title)}
        >
          <CardTitle className="text-sm font-medium line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
            {post.title}
          </CardTitle>
        </Link>
      </CardHeader>
      
      {post.imageUrl && (
        <CardContent className="p-0">
          <Link href={`/articles/${post.slug}`}>
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-32 object-cover"
            />
          </Link>
        </CardContent>
      )}
      
      <CardFooter className="p-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>{post.readTimeMinutes || 5} min</span>
        </div>
        
        <Link href={`/articles/${post.slug}`}>
          <Button variant="link" className="p-0 h-auto text-xs text-blue-600">
            Read more
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  recentPosts = [],
  trendingPosts = [],
  personalizedPosts = [],
  currentPostId,
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Filter out the current article from recommendations
  const filteredRecent = recentPosts.filter(post => post.id !== currentPostId);
  const filteredTrending = trendingPosts.filter(post => post.id !== currentPostId);
  const filteredPersonalized = personalizedPosts.filter(post => post.id !== currentPostId);
  
  const hasRecommendations = filteredRecent.length > 0 || filteredTrending.length > 0 || filteredPersonalized.length > 0;
  
  if (!hasRecommendations) return null;

  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recommended for You</CardTitle>
        <CardDescription>Articles you might be interested in</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <Tabs defaultValue={isAuthenticated && filteredPersonalized.length > 0 ? "personalized" : "trending"}>
          <TabsList className="w-full mb-4">
            {isAuthenticated && filteredPersonalized.length > 0 && (
              <TabsTrigger value="personalized" className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>For You</span>
              </TabsTrigger>
            )}
            {filteredTrending.length > 0 && (
              <TabsTrigger value="trending" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Trending</span>
              </TabsTrigger>
            )}
            {filteredRecent.length > 0 && (
              <TabsTrigger value="recent" className="flex-1">
                <History className="h-4 w-4 mr-2" />
                <span>Recent</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          {isAuthenticated && filteredPersonalized.length > 0 && (
            <TabsContent value="personalized">
              <div className="space-y-4">
                {filteredPersonalized.slice(0, 3).map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            </TabsContent>
          )}
          
          {filteredTrending.length > 0 && (
            <TabsContent value="trending">
              <div className="space-y-4">
                {filteredTrending.slice(0, 3).map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            </TabsContent>
          )}
          
          {filteredRecent.length > 0 && (
            <TabsContent value="recent">
              <div className="space-y-4">
                {filteredRecent.slice(0, 3).map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-0 justify-center">
        <Link href="/articles">
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-transparent">
            View all articles
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PersonalizedRecommendations;