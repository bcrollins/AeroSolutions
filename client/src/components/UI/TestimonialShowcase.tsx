import React from 'react';
import TestimonialCard, { TestimonialCardProps } from './TestimonialCard';
import { StaggerChildren } from './MicroInteractions';

interface TestimonialShowcaseProps {
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'carousel' | 'masonry';
  maxColumns?: 2 | 3 | 4;
  className?: string;
  testimonials?: Omit<TestimonialCardProps, 'className'>[];
}

export default function TestimonialShowcase({
  title = 'What Our Students Say',
  subtitle = 'Hear from the RXAI community about their learning experience.',
  layout = 'grid',
  maxColumns = 3,
  className = '',
  testimonials = defaultTestimonials,
}: TestimonialShowcaseProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  if (layout === 'masonry') {
    // Simple masonry layout with CSS
    const firstColumn = testimonials.filter((_, i) => i % 3 === 0);
    const secondColumn = testimonials.filter((_, i) => i % 3 === 1);
    const thirdColumn = testimonials.filter((_, i) => i % 3 === 2);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-6">
            <StaggerChildren staggerDelay={0.15}>
              {firstColumn.map((testimonial, index) => (
                <TestimonialCard
                  key={`col1-${index}`}
                  {...testimonial}
                  className="h-full"
                />
              ))}
            </StaggerChildren>
          </div>
          <div className="flex flex-col gap-6 mt-0 md:mt-12">
            <StaggerChildren staggerDelay={0.15}>
              {secondColumn.map((testimonial, index) => (
                <TestimonialCard
                  key={`col2-${index}`}
                  {...testimonial}
                  className="h-full"
                />
              ))}
            </StaggerChildren>
          </div>
          <div className="flex flex-col gap-6 mt-0 lg:mt-24">
            <StaggerChildren staggerDelay={0.15}>
              {thirdColumn.map((testimonial, index) => (
                <TestimonialCard
                  key={`col3-${index}`}
                  {...testimonial}
                  className="h-full"
                />
              ))}
            </StaggerChildren>
          </div>
        </div>
      </div>
    );
  }

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

      <StaggerChildren containerClassName={`grid gap-6 ${columnClasses[maxColumns]}`}>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} className="h-full" />
        ))}
      </StaggerChildren>
    </div>
  );
}

const defaultTestimonials: Omit<TestimonialCardProps, 'className'>[] = [
  {
    quote: "The AI course structure at RXAI is exceptional. The hands-on approach and real-world projects helped me transition from theory to practical application faster than I expected.",
    name: "Alex Morgan",
    title: "Software Engineer at TechCorp",
    rating: 5,
    isVerified: true,
    variant: 'highlight'
  },
  {
    quote: "What sets RXAI apart is the quality of instruction. The AI instructors aren't just knowledgeable—they're actively working in the field and bring current best practices to every lesson.",
    name: "Jordan Chen",
    title: "Data Scientist",
    rating: 5,
    isVerified: true
  },
  {
    quote: "I evaluated several AI learning platforms before choosing RXAI. The curriculum depth and career-focused approach made the difference for me. I landed a new job within two months of completing my certificate.",
    name: "Priya Sharma",
    title: "AI Implementation Specialist",
    rating: 5,
    isVerified: true
  },
  {
    quote: "The project-based learning at RXAI prepared me for real-world challenges in machine learning implementation. My portfolio from the course directly led to new opportunities.",
    name: "Michael Okafor",
    title: "Machine Learning Engineer",
    rating: 5
  },
  {
    quote: "The community aspect is incredible. Connecting with other AI professionals and mentors created opportunities I couldn't have found elsewhere. Worth every penny.",
    name: "Sophia Rodriguez",
    title: "Product Manager",
    rating: 4,
    variant: 'highlight'
  },
  {
    quote: "As someone transitioning from traditional software development to AI, RXAI provided the perfect bridge. The incremental learning path kept me motivated throughout the journey.",
    name: "Thomas Weber",
    title: "Senior Developer at InnovateTech",
    rating: 5,
    isVerified: true
  },
  {
    quote: "I've taken several online courses before, but RXAI's combination of theory, practice, and career guidance is unmatched. The mentorship program alone is worth the investment.",
    name: "Aisha Johnson",
    title: "AI Strategy Consultant",
    rating: 5
  },
  {
    quote: "The advanced certification program gave me specialized knowledge in NLP that immediately translated to my work. My team now looks to me as the subject matter expert.",
    name: "Ryan Park",
    title: "NLP Specialist",
    rating: 5,
    isVerified: true,
    variant: 'highlight'
  },
  {
    quote: "The flexibility of RXAI's learning platform allowed me to balance full-time work with skill development. The mobile experience is seamless, letting me learn on the go.",
    name: "Emma Lewis",
    title: "Business Intelligence Analyst",
    rating: 4
  },
];