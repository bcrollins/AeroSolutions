import React from 'react';
import FeatureCard from './FeatureCard';
import { StaggerChildren } from './MicroInteractions';
import { Brain, Code, LightbulbIcon, Users, Workflow, BookOpen, LineChart, Zap, Star, Award } from 'lucide-react';

interface FeatureShowcaseProps {
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'list';
  maxColumns?: 2 | 3 | 4;
  className?: string;
  showFilters?: boolean;
}

export default function FeatureShowcase({
  title = 'Platform Features',
  subtitle = 'Discover the powerful features that make RXAI the leader in AI education.',
  layout = 'grid',
  maxColumns = 3,
  className = '',
  showFilters = false,
}: FeatureShowcaseProps) {
  const features = [
    {
      title: 'AI-Powered Learning Paths',
      description: 'Personalized learning journeys adapting to your skill level and interests.',
      icon: <Brain className="h-6 w-6" />,
      actionLabel: 'Start learning',
      variant: 'primary' as const,
      isNew: true
    },
    {
      title: 'Interactive Coding Labs',
      description: 'Learn by doing with real-time code examples and instant feedback.',
      icon: <Code className="h-6 w-6" />,
      actionLabel: 'Try a lab',
      variant: 'secondary' as const
    },
    {
      title: 'Expert Mentorship',
      description: 'Connect with industry leaders for personalized guidance and support.',
      icon: <Users className="h-6 w-6" />,
      actionLabel: 'Meet mentors',
      variant: 'accent' as const,
      isPro: true
    },
    {
      title: 'Project-Based Learning',
      description: 'Build real-world AI projects that enhance your portfolio and skills.',
      icon: <Workflow className="h-6 w-6" />,
      actionLabel: 'Browse projects',
      variant: 'modern' as const
    },
    {
      title: 'In-depth Tutorials',
      description: 'Step-by-step guides on implementing advanced AI concepts and techniques.',
      icon: <BookOpen className="h-6 w-6" />,
      actionLabel: 'View tutorials',
      variant: 'minimal' as const
    },
    {
      title: 'Skill Assessments',
      description: 'Evaluate your progress with comprehensive exams and AI-graded assignments.',
      icon: <LineChart className="h-6 w-6" />,
      actionLabel: 'Test your skills',
      variant: 'primary' as const
    },
    {
      title: 'AI Tools Marketplace',
      description: 'Access cutting-edge AI tools and APIs to accelerate your development.',
      icon: <Zap className="h-6 w-6" />,
      actionLabel: 'Explore tools',
      variant: 'secondary' as const,
      isNew: true,
      isPro: true
    },
    {
      title: 'Certification Programs',
      description: 'Earn industry-recognized credentials to showcase your AI expertise.',
      icon: <Award className="h-6 w-6" />,
      actionLabel: 'View certificates',
      variant: 'accent' as const
    },
    {
      title: 'Innovation Lab',
      description: 'Experiment with emerging AI technologies in our virtual sandbox environment.',
      icon: <LightbulbIcon className="h-6 w-6" />,
      actionLabel: 'Start innovating',
      variant: 'modern' as const,
      isPro: true
    },
  ];

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`container mx-auto px-4 py-12 ${className}`}>
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium">
            All Features
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
            Free
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
            Pro
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
            New
          </button>
        </div>
      )}

      {layout === 'grid' ? (
        <StaggerChildren containerClassName={`grid gap-6 ${columnClasses[maxColumns]}`}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              actionLabel={feature.actionLabel}
              variant={feature.variant}
              isNew={feature.isNew}
              isPro={feature.isPro}
            />
          ))}
        </StaggerChildren>
      ) : (
        <StaggerChildren containerClassName="space-y-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              actionLabel={feature.actionLabel}
              variant={feature.variant}
              isNew={feature.isNew}
              isPro={feature.isPro}
              className="flex flex-col md:flex-row md:items-center"
            />
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}