import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  const { user, isAuthenticated } = useAuth();
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [recommendedCategory, setRecommendedCategory] = useState<InterestCategory | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Get user interests based on browsing history, previous interactions, or cookies
  useEffect(() => {
    // For authenticated users, we could fetch their interests from the server
    if (isAuthenticated && user) {
      // In a real implementation, this would be a server call
      // For now, simulate with localStorage + random selection for demo
      const storedInterests = localStorage.getItem(`user-interests-${user.id}`);
      if (storedInterests) {
        setUserInterests(JSON.parse(storedInterests));
      }
    } else {
      // For non-authenticated users, use local storage to remember interests
      const storedInterests = localStorage.getItem('guest-interests');
      if (storedInterests) {
        setUserInterests(JSON.parse(storedInterests));
      }
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
        view.interests.forEach(interest => {
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
        
        // Save it
        if (isAuthenticated && user) {
          localStorage.setItem(`user-interests-${user.id}`, JSON.stringify([topInterest]));
        } else {
          localStorage.setItem('guest-interests', JSON.stringify([topInterest]));
        }
      } else if (Math.random() > 0.5) {
        // If still no interests, randomly select one for this demo (50% chance)
        const randomInterest = interestCategories[Math.floor(Math.random() * interestCategories.length)].id;
        setUserInterests([randomInterest]);
      }
    }
  }, [isAuthenticated, user]);

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
      const updatedInterests = [...new Set([...userInterests, recommendedCategory.id])];
      
      if (isAuthenticated && user) {
        localStorage.setItem(`user-interests-${user.id}`, JSON.stringify(updatedInterests));
      } else {
        localStorage.setItem('guest-interests', JSON.stringify(updatedInterests));
      }
      
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
      <Card className="bg-[#2a2a2a] border-electric-cyan-400/30 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6">
            <div className="text-sm text-electric-cyan-400 mb-2">Based on your interests</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Recommended for you: {recommendedCategory.name}
            </h3>
            <p className="text-gray-300 mb-4">
              {recommendedCategory.description}
            </p>
            <div className="mt-4">
              <Button 
                onClick={handleRecommendationClick}
                className="bg-electric-cyan-600 hover:bg-electric-cyan-700 text-white"
              >
                Explore {recommendedCategory.recommendedCourse}
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/3 bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-sm text-gray-400">Personalized Recommendation</div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PersonalizedContent;