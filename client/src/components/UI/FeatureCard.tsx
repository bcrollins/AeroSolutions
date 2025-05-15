import React from 'react';
import { HoverScale, ButtonPress } from './MicroInteractions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionLink?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'minimal' | 'modern';
  className?: string;
  isNew?: boolean;
  isPro?: boolean;
}

const variantStyles = {
  primary: 'bg-primary/5 hover:bg-primary/10 border-primary/20',
  secondary: 'bg-secondary/50 hover:bg-secondary/80 border-secondary/30',
  accent: 'bg-accent/5 hover:bg-accent/10 border-accent/20',
  minimal: 'bg-background/50 hover:bg-background/80 border-border/50',
  modern: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-md',
};

export default function FeatureCard({
  title,
  description,
  icon,
  actionLabel = 'Learn more',
  onAction,
  actionLink,
  variant = 'primary',
  className = '',
  isNew = false,
  isPro = false,
}: FeatureCardProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionLink) {
      window.open(actionLink, '_blank', 'noopener,noreferrer');
    }
  };

  const isExternalLink = actionLink && !onAction;

  return (
    <HoverScale scale={1.02}>
      <Card 
        className={`${variantStyles[variant]} overflow-hidden transition-all border card-feature ${className}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-primary dark:text-primary-foreground h-10 w-10 flex items-center justify-center rounded-full bg-primary/10">
              {icon}
            </div>
            <div className="flex gap-2">
              {isNew && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">
                  NEW
                </span>
              )}
              {isPro && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  PRO
                </span>
              )}
            </div>
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">{title}</CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          {/* Card content can be extended here */}
        </CardContent>
        <CardFooter>
          <ButtonPress>
            <Button 
              variant="ghost" 
              className="p-0 h-8 text-primary hover:text-primary/80 hover:bg-transparent"
              onClick={handleAction}
            >
              <span className="mr-1">{actionLabel}</span>
              {isExternalLink ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
            </Button>
          </ButtonPress>
        </CardFooter>
      </Card>
    </HoverScale>
  );
}