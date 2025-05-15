import React, { useState, useEffect } from 'react';
// Removing auth dependency for public view
// import { useAuth } from '@/hooks/useAuth';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface InterestCategory {
  id: string;
  name: string;
  description: string;
  recommendedCourse: string;
  coursePath: string;
}

const interestCategories: InterestCategory[] = [
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    description: 'Master algorithms and statistical models that computer systems use to perform tasks without explicit instructions.',
    recommendedCourse: 'Advanced Machine Learning Specialization',
    coursePath: '/ai-courses/catalog?category=machine-learning'
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning',
    description: 'Dive into neural networks and learn how to implement them for solving complex AI problems.',
    recommendedCourse: 'Deep Learning and Neural Networks',
    coursePath: '/ai-courses/catalog?category=deep-learning'
  },
  {
    id: 'computer-vision',
    name: 'Computer Vision',
    description: 'Learn techniques to enable computers to see, identify and process images in the same way that human vision does.',
    recommendedCourse: 'Computer Vision with TensorFlow',
    coursePath: '/ai-courses/catalog?category=computer-vision'
  },
  {
    id: 'nlp',
    name: 'Natural Language Processing',
    description: 'Understand how to process and analyze large amounts of natural language data.',
    recommendedCourse: 'Advanced NLP with Transformers',
    coursePath: '/ai-courses/catalog?category=nlp'
  },
  {
    id: 'ai-ethics',
    name: 'AI Ethics',
    description: 'Explore the ethical implications of AI systems and how to implement responsible AI practices.',
    recommendedCourse: 'Ethics in Artificial Intelligence',
    coursePath: '/ai-courses/catalog?category=ai-ethics'
  }
];

const PersonalizedContent: React.FC = () => {
  // Using a fixed isAuthenticated = false for public access
  const isAuthenticated = false;
  const user = null;
  
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [recommendedCategory, setRecommendedCategory] = useState<InterestCategory | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Get user interests based on browsing history, previous interactions, or cookies
  useEffect(() => {
    // For non-authenticated users (public view), use local storage
    const storedInterests = localStorage.getItem('guest-interests');
    if (storedInterests) {
      setUserInterests(JSON.parse(storedInterests));
    }

    // If no interests are found, initialize with page view history
    if (!localStorage.getItem('pageViewHistory')) {
      localStorage.setItem('pageViewHistory', JSON.stringify([]));
    }

    // Track this page view
    const pageViewHistory = JSON.parse(localStorage.getItem('pageViewHistory') || '[]');
    const currentPath = window.location.pathname;
    
    // Extract potential interests from path
    let potentialInterests: string[] = [];
    
    // Map URL paths to interest categories
    if (currentPath.includes('machine-learning')) {
      potentialInterests.push('machine-learning');
    } else if (currentPath.includes('deep-learning')) {
      potentialInterests.push('deep-learning');
    } else if (currentPath.includes('computer-vision')) {
      potentialInterests.push('computer-vision');
    } else if (currentPath.includes('nlp')) {
      potentialInterests.push('nlp');
    } else if (currentPath.includes('ethics')) {
      potentialInterests.push('ai-ethics');
    }
    
    // Update page view history
    const updatedHistory = [...pageViewHistory, { path: currentPath, timestamp: Date.now(), interests: potentialInterests }];
    localStorage.setItem('pageViewHistory', JSON.stringify(updatedHistory));
    
    // If we have no user interests yet, analyze page view history to make an educated guess
    if (userInterests.length === 0) {
      const interestCounts: Record<string, number> = {};
      
      updatedHistory.forEach(view => {
        view.interests.forEach((interest: string) => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      });
      
      // Find most frequent interest
      let maxCount = 0;
      let topInterest = '';
      
      Object.entries(interestCounts).forEach(([interest, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topInterest = interest;
        }
      });
      
      // If we found an interest, set it
      if (topInterest) {
        setUserInterests([topInterest]);
        localStorage.setItem('guest-interests', JSON.stringify([topInterest]));
      } else {
        // If still no interests, randomly select one for public demo
        const randomInterest = interestCategories[Math.floor(Math.random() * interestCategories.length)].id;
        setUserInterests([randomInterest]);
      }
    }
  }, []);

  // Set recommended category based on user interests
  useEffect(() => {
    if (userInterests.length > 0) {
      // Find matching category
      const matchingCategory = interestCategories.find(cat => userInterests.includes(cat.id));
      
      if (matchingCategory) {
        setRecommendedCategory(matchingCategory);
        
        // Track event for analytics
        trackEvent('personalized_recommendation_shown', 'personalization', matchingCategory.id);
      } else {
        // Fallback to a random recommendation
        const randomCategory = interestCategories[Math.floor(Math.random() * interestCategories.length)];
        setRecommendedCategory(randomCategory);
        
        // Track event for analytics
        trackEvent('random_recommendation_shown', 'personalization', randomCategory.id);
      }
    }
  }, [userInterests]);

  // Handle click on recommendation
  const handleRecommendationClick = () => {
    if (recommendedCategory) {
      // Track the event
      trackEvent('recommendation_clicked', 'engagement', recommendedCategory.id);
      setHasInteracted(true);
      
      // Save this interest more permanently
      const updatedInterests = Array.from(new Set([...userInterests, recommendedCategory.id]));
      localStorage.setItem('guest-interests', JSON.stringify(updatedInterests));
      
      setUserInterests(updatedInterests);
      
      // Navigate to the recommended course
      window.location.href = recommendedCategory.coursePath;
    }
  };

  // Only display if we have a recommendation and user hasn't interacted with this component yet
  if (!recommendedCategory || hasInteracted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="my-8"
    >
      <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-xl">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6">
            <div className="text-sm text-[#0066cc] mb-2 font-medium">Based on your interests</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">
              Recommended for you: {recommendedCategory.name}
            </h3>
            <p className="text-gray-700 mb-4">
              {recommendedCategory.description}
            </p>
            <div className="mt-4">
              <Button 
                onClick={handleRecommendationClick}
                className="bg-[#0066cc] hover:bg-[#0055b3] text-white font-medium px-5 py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Explore {recommendedCategory.recommendedCourse}
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/3 bg-gradient-to-r from-[#f8f9fa] to-[#f0f0f0] flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-sm text-gray-500 font-medium">Personalized Recommendation</div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PersonalizedContent;