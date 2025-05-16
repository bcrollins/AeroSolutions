import React from 'react';
import { useLocation } from 'wouter';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { Card } from '@/components/ui/card';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { formatDistanceToNow } from 'date-fns';
import { designSystem } from '@/styles/designSystem';

interface ArticleCardProps {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readingTime?: number;
  category?: string;
  tags?: string[];
  trending?: boolean;
  featured?: boolean;
  variant?: 'default' | 'compact' | 'horizontal' | 'minimal';
  className?: string;
}

/**
 * ArticleCard component with Apple-inspired design
 * 
 * Features:
 * - Optimized image loading
 * - Multiple layout variants
 * - Consistent spacing and typography
 * - Subtle hover effects
 * - Sound feedback on interaction
 */
const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  excerpt,
  slug,
  coverImage,
  author,
  publishedAt,
  readingTime = 5,
  category,
  tags = [],
  trending = false,
  featured = false,
  variant = 'default',
  className = ''
}) => {
  const [, setLocation] = useLocation();
  const { playSound } = useSoundEffects();
  
  // Format the published date
  const formattedDate = formatDistanceToNow(new Date(publishedAt), { addSuffix: true });
  
  // Handle card click to navigate to article detail
  const handleCardClick = () => {
    playSound('navigation');
    setLocation(`/news/${slug}`);
  };
  
  // For featured articles, use the glass effect
  const cardVariant = featured ? 'glass' : 'default';
  
  // Render the compact variant
  if (variant === 'compact') {
    return (
      <div
        onClick={handleCardClick}
        className={`${className} max-w-xs h-full rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 ${featured ? 'border-transparent bg-background/60 backdrop-blur-md' : 'border-border bg-card'} ${featured ? 'shadow-md hover:shadow-lg' : ''} p-4 cursor-pointer hover:scale-[1.01]`}
      >
        {coverImage && (
          <div className="relative aspect-video mb-3 rounded-md overflow-hidden">
            <OptimizedImage
              src={coverImage}
              alt={title}
              className="object-cover w-full h-full"
            />
            {trending && (
              <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                Trending
              </div>
            )}
          </div>
        )}
        
        {category && (
          <div className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
            {category}
          </div>
        )}
        
        <h3 className="text-base font-semibold line-clamp-2 mb-1 text-gray-900 dark:text-white">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>{formattedDate}</span>
          <span>{readingTime} min read</span>
        </div>
      </div>
    );
  }
  
  // Render the horizontal variant
  if (variant === 'horizontal') {
    return (
      <div
        onClick={handleCardClick}
        className={`${className} w-full flex flex-row h-full rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 ${featured ? 'border-transparent bg-background/60 backdrop-blur-md' : 'border-border bg-card'} ${featured ? 'shadow-md hover:shadow-lg' : ''} p-6 cursor-pointer hover:scale-[1.01]`}
      >
        {coverImage && (
          <div className="relative w-1/3 mr-4 rounded-md overflow-hidden">
            <OptimizedImage
              src={coverImage}
              alt={title}
              className="object-cover w-full h-full"
            />
            {trending && (
              <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                Trending
              </div>
            )}
          </div>
        )}
        
        <div className="flex-1">
          {category && (
            <div className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
              {category}
            </div>
          )}
          
          <h3 className="text-lg font-semibold line-clamp-2 mb-2 text-gray-900 dark:text-white">
            {title}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              {author && author.avatar && (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-6 h-6 rounded-full mr-2"
                />
              )}
              <span className="text-gray-700 dark:text-gray-300">
                {author ? author.name : 'AI Learning Platform'}
              </span>
            </div>
            
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <span className="mr-3">{formattedDate}</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the minimal variant
  if (variant === 'minimal') {
    return (
      <div 
        className={`${className} border-b border-gray-100 dark:border-gray-800 py-3 cursor-pointer`}
        onClick={handleCardClick}
      >
        <div className="flex items-start">
          {coverImage && (
            <div className="w-16 h-16 rounded overflow-hidden mr-3 flex-shrink-0">
              <OptimizedImage
                src={coverImage}
                alt={title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <div>
            <h3 className="text-base font-medium line-clamp-2 text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              {category && (
                <span className="mr-2 text-primary-600 dark:text-primary-400">
                  {category}
                </span>
              )}
              <span className="mr-2">{formattedDate}</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default (standard) variant
  return (
    <div
      onClick={handleCardClick}
      className={`${className} max-w-md h-full rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 ${featured ? 'border-transparent bg-background/60 backdrop-blur-md' : 'border-border bg-card'} ${featured ? 'shadow-md hover:shadow-lg' : ''} cursor-pointer hover:scale-[1.01]`}
    >
      {coverImage && (
        <div className="relative aspect-video">
          <OptimizedImage
            src={coverImage}
            alt={title}
            className="object-cover w-full h-full rounded-t-lg"
          />
          
          {(trending || featured) && (
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {trending && (
                <div className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                  Trending
                </div>
              )}
              {featured && (
                <div className="bg-primary-700 text-white text-xs px-2 py-1 rounded-full">
                  Featured
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        {category && (
          <div className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
            {category}
          </div>
        )}
        
        <h3 className="text-xl font-semibold line-clamp-2 mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
          {excerpt}
        </p>
        
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
          <div className="flex items-center">
            {author && author.avatar && (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-6 h-6 rounded-full mr-2"
              />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {author ? author.name : 'AI Learning Platform'}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="mr-3">{formattedDate}</span>
            <span>{readingTime} min read</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;