import React, { useRef } from 'react';
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
import { ChevronRight, ChevronLeft, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Types
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

interface RelatedArticlesCarouselProps {
  articles: Post[];
  title?: string;
  currentPostId?: number;
}

const RelatedArticlesCarousel: React.FC<RelatedArticlesCarouselProps> = ({
  articles,
  title = 'Related Articles',
  currentPostId,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Filter out the current article if it's in the list
  const filteredArticles = currentPostId 
    ? articles.filter(article => article.id !== currentPostId)
    : articles;
  
  if (filteredArticles.length === 0) {
    return null;
  }
  
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="mt-12 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={scrollLeft}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll left</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={scrollRight}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      </div>
      
      <div 
        ref={carouselRef}
        className="flex space-x-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredArticles.map((article) => (
          <div 
            key={article.id} 
            className="min-w-[300px] max-w-[350px] snap-start"
          >
            <Card className="h-full hover:shadow-md transition-shadow duration-300">
              {article.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                  />
                </div>
              )}
              
              <CardHeader className="p-4 pb-0">
                {article.category && (
                  <Link href={`/articles/category/${article.category.toLowerCase()}`}>
                    <Badge 
                      variant="outline" 
                      className="mb-2 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      {article.category}
                    </Badge>
                  </Link>
                )}
                
                <Link href={`/articles/${article.slug}`}>
                  <CardTitle className="text-lg font-bold line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                    {article.title}
                  </CardTitle>
                </Link>
                
                <CardDescription className="line-clamp-2 mt-2">
                  {article.summary || article.content.substring(0, 120) + '...'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 pt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="flex items-center mr-4">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(article.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  {article.readTimeMinutes && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{article.readTimeMinutes} min read</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <Link href={`/articles/${article.slug}`}>
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto text-blue-600 hover:text-blue-700 hover:bg-transparent"
                  >
                    Read article
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Add custom CSS to hide scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
    </div>
  );
};

export default RelatedArticlesCarousel;