import React from 'react';
import { Helmet } from 'react-helmet';
import AICourseContent from '@/components/course/AICourseContent';

/**
 * AI Course Page serving as the main entry point to our comprehensive AI learning program
 */
const AICoursePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AI Learning Course | RXAI Learning Platform</title>
        <meta 
          name="description" 
          content="Access our comprehensive AI course covering fundamentals, machine learning, deep learning, and advanced applications."
        />
      </Helmet>
      
      <AICourseContent />
    </>
  );
};

export default AICoursePage;