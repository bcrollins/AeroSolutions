import React from 'react';
import { Helmet } from 'react-helmet';
import AICourseContent from '@/components/course/AICourseContent';

/**
 * AI Mastery Course - Primary entry point to our single comprehensive AI learning program
 */
const AIMasteryCourse: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AI Mastery Course | Complete AI Learning Path</title>
        <meta 
          name="description" 
          content="Master AI from fundamentals to advanced applications with our comprehensive learning path covering machine learning, deep learning, NLP, and more."
        />
      </Helmet>
      
      <AICourseContent />
    </>
  );
};

export default AIMasteryCourse;