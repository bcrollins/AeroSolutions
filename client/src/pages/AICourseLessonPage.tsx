import React from 'react';
import { useParams } from 'wouter';
import { Helmet } from 'react-helmet';
import LessonContent from '@/components/course/LessonContent';

/**
 * AI Course Lesson Page - Displays individual lesson content
 */
const AICourseLessonPage: React.FC = () => {
  const { moduleId = '', lessonId = '' } = useParams();
  
  return (
    <>
      <Helmet>
        <title>AI Course Lesson | RXAI Learning Platform</title>
        <meta 
          name="description" 
          content="Access interactive AI course lessons with videos, quizzes, and hands-on projects to master artificial intelligence concepts."
        />
      </Helmet>
      
      <LessonContent 
        moduleId={moduleId}
        lessonId={lessonId}
        hasNext={true}
        hasPrevious={lessonId !== 'intro'}
        onNext={() => console.log('Next lesson')}
        onPrevious={() => console.log('Previous lesson')}
        onComplete={() => console.log('Lesson completed')}
      />
    </>
  );
};

export default AICourseLessonPage;