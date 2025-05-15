import React from 'react';
import { HoverScale, Shimmer } from './MicroInteractions';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

export interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  avatarUrl?: string;
  rating?: number;
  className?: string;
  variant?: 'default' | 'highlight' | 'minimal';
  isVerified?: boolean;
}

const variantClasses = {
  default: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
  highlight: 'bg-primary/5 border-primary/20',
  minimal: 'bg-transparent border-transparent shadow-none',
};

export default function TestimonialCard({
  quote,
  name,
  title,
  avatarUrl,
  rating = 5,
  className = '',
  variant = 'default',
  isVerified = false
}: TestimonialCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <HoverScale scale={1.01}>
      <Card className={`${variantClasses[variant]} overflow-hidden ${className}`}>
        {variant === 'highlight' && (
          <Shimmer>
            <div className="h-1 bg-gradient-to-r from-primary/60 to-primary w-full" />
          </Shimmer>
        )}
        <CardContent className="pt-6">
          <div className="flex items-center space-x-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 fill-gray-300 dark:text-gray-600 dark:fill-gray-600'
                }`}
              />
            ))}
          </div>
          <blockquote className="text-gray-700 dark:text-gray-300 italic mb-6">
            "{quote}"
          </blockquote>
        </CardContent>
        <CardFooter className="pt-0 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-4">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900 dark:text-white flex items-center">
                {name}
                {isVerified && (
                  <svg
                    className="ml-1 w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </HoverScale>
  );
}