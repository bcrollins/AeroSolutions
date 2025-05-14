import React from 'react';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Code, 
  BarChart3, 
  FileCode, 
  MessageSquare, 
  Lightbulb,
  Newspaper,
  Bookmark
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface CTACardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkText: string;
  linkHref: string;
  ctaType: string;
  className?: string;
}

const CTACard: React.FC<CTACardProps> = ({
  title,
  description,
  icon,
  linkText,
  linkHref,
  ctaType,
  className = '',
}) => {
  const handleClick = () => {
    trackEvent('article_cta_clicked', 'conversion', ctaType);
  };

  return (
    <Card className={`shadow-md hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Link href={linkHref}>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 transition-colors w-full"
            onClick={handleClick}
          >
            {linkText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

interface EmbeddedCTAsProps {
  contentType?: 'ai' | 'development' | 'marketing' | 'general';
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'minimal';
}

const EmbeddedCTAs: React.FC<EmbeddedCTAsProps> = ({
  contentType = 'general',
  className = '',
  variant = 'vertical',
}) => {
  // Determine which CTAs to show based on content type
  let ctaContent: CTACardProps[] = [];
  
  if (variant === 'minimal') {
    // Minimal variant for inline CTAs
    return (
      <div className={`my-8 px-6 py-4 bg-blue-600/10 border border-blue-600/20 rounded-lg ${className}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <p className="font-medium">
              {contentType === 'ai' 
                ? 'Enhance your AI skills with our interactive courses' 
                : contentType === 'development'
                ? 'Need custom development? We build tailored solutions'
                : contentType === 'marketing'
                ? 'Generate AI-powered content for your marketing needs'
                : 'Discover our tools and resources for digital transformation'}
            </p>
          </div>
          <Link 
            href={contentType === 'ai' 
              ? '/ai-courses/catalog' 
              : contentType === 'development'
              ? '/service-packages'
              : contentType === 'marketing'
              ? '/digital-tools/ai-content-generator'
              : '/pricing'}
            onClick={() => trackEvent('inline_cta_clicked', 'conversion', contentType)}
          >
            <Button 
              size="sm" 
              className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
            >
              {contentType === 'ai' 
                ? 'Explore Courses' 
                : contentType === 'development'
                ? 'Get a Quote'
                : contentType === 'marketing'
                ? 'Try Content Generator'
                : 'Try Free'}
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  switch (contentType) {
    case 'ai':
      ctaContent = [
        {
          title: 'AI Courses',
          description: 'Enhance your skills with our comprehensive AI training courses',
          icon: <Lightbulb className="h-4 w-4 text-white" />,
          linkText: 'Browse Courses',
          linkHref: '/ai-courses/catalog',
          ctaType: 'ai_courses',
        },
        {
          title: 'AI Content Generator',
          description: 'Create high-quality content with our AI-powered tools',
          icon: <FileCode className="h-4 w-4 text-white" />,
          linkText: 'Try Generator',
          linkHref: '/digital-tools/ai-content-generator',
          ctaType: 'ai_generator',
        },
      ];
      break;
    case 'development':
      ctaContent = [
        {
          title: 'Development Services',
          description: 'Custom web and mobile solutions for your business needs',
          icon: <Code className="h-4 w-4 text-white" />,
          linkText: 'View Services',
          linkHref: '/service-packages',
          ctaType: 'dev_services',
        },
        {
          title: 'Code Assistant',
          description: 'Get AI-powered code suggestions and debugging help',
          icon: <FileCode className="h-4 w-4 text-white" />,
          linkText: 'Try Assistant',
          linkHref: '/digital-tools/code-assistant',
          ctaType: 'code_assistant',
        },
      ];
      break;
    case 'marketing':
      ctaContent = [
        {
          title: 'Content Calendar Creator',
          description: 'Plan your social media content with AI-driven suggestions',
          icon: <Newspaper className="h-4 w-4 text-white" />,
          linkText: 'Create Calendar',
          linkHref: '/digital-tools/content-calendar',
          ctaType: 'content_calendar',
        },
        {
          title: 'Analytics Dashboard',
          description: 'Track performance metrics with our comprehensive analytics',
          icon: <BarChart3 className="h-4 w-4 text-white" />,
          linkText: 'View Analytics',
          linkHref: '/digital-tools/analytics-dashboard',
          ctaType: 'analytics',
        },
      ];
      break;
    default:
      ctaContent = [
        {
          title: 'Digital Tools Suite',
          description: 'Access our collection of professional AI-powered tools',
          icon: <Bookmark className="h-4 w-4 text-white" />,
          linkText: 'Explore Tools',
          linkHref: '/digital-tools',
          ctaType: 'digital_tools',
        },
        {
          title: 'Community Forum',
          description: 'Join discussions and share insights with other professionals',
          icon: <MessageSquare className="h-4 w-4 text-white" />,
          linkText: 'Join Community',
          linkHref: '/community',
          ctaType: 'community',
        },
      ];
  }
  
  if (variant === 'horizontal') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 my-8 ${className}`}>
        {ctaContent.map((cta, index) => (
          <CTACard key={index} {...cta} />
        ))}
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 my-6 ${className}`}>
      {ctaContent.map((cta, index) => (
        <CTACard key={index} {...cta} />
      ))}
    </div>
  );
};

export default EmbeddedCTAs;