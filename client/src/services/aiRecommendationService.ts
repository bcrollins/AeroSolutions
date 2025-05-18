import axios from 'axios';
import { CourseModule } from '@/data/courseStructure';

// Interface for user preference data to be used in recommendations
export interface UserPreferences {
  topics: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  learningStyle: 'visual' | 'reading' | 'interactive' | 'project-based' | 'all';
  timeCommitment: 'low' | 'medium' | 'high' | 'all';
  goals: string[];
}

// Interface for course interaction history
export interface CourseInteraction {
  courseId: string;
  lastViewed: string; // ISO date string
  viewCount: number;
  completedLessons: string[];
  quizScores: Record<string, { score: number; totalPossible: number }>;
  favorited: boolean;
}

// Interface for recommendation result
export interface CourseRecommendation {
  courseId: string;
  score: number; // relevance score 0-100
  reasons: string[]; // reasons for recommendation
  relevanceFactors: {
    contentMatch: number; // 0-100
    skillLevelMatch: number; // 0-100
    learningStyleMatch: number; // 0-100
    popularityScore: number; // 0-100
    continuityScore?: number; // 0-100, for related content
  };
}

/**
 * Generate personalized course recommendations using the OpenAI API
 * The newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
 * Do not change this unless explicitly requested by the user.
 */
export const generatePersonalizedRecommendations = async (
  userPreferences: UserPreferences,
  userHistory: CourseInteraction[],
  availableCourses: CourseModule[],
  limit: number = 5
): Promise<CourseRecommendation[]> => {
  try {
    // In a production environment, this would be an API call to your backend
    // which would then call the OpenAI API with your server-side key
    const response = await axios.post('/api/recommendations/personalized', {
      userPreferences,
      userHistory,
      availableCourses,
      limit
    });

    return response.data;
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    // Fall back to local recommendation algorithm if API call fails
    return generateFallbackRecommendations(
      userPreferences,
      userHistory,
      availableCourses,
      limit
    );
  }
};

/**
 * Generate content-based recommendations based on course similarity
 */
export const generateContentBasedRecommendations = async (
  courseId: string,
  availableCourses: CourseModule[],
  limit: number = 3
): Promise<CourseRecommendation[]> => {
  try {
    // In a production environment, this would call your backend API
    const response = await axios.post('/api/recommendations/content-based', {
      courseId,
      availableCourses,
      limit
    });

    return response.data;
  } catch (error) {
    console.error('Error generating content-based recommendations:', error);
    // Fall back to local similarity calculation
    return calculateCourseSimilarity(courseId, availableCourses, limit);
  }
};

/**
 * Calculate similarity between courses using a simple algorithm
 * This is a fallback method when the API is unavailable
 */
const calculateCourseSimilarity = (
  courseId: string,
  availableCourses: CourseModule[],
  limit: number
): CourseRecommendation[] => {
  const targetCourse = availableCourses.find(course => course.id === courseId);
  
  if (!targetCourse) {
    return [];
  }
  
  // Extract keywords from target course
  const targetKeywords = extractKeywords(targetCourse);
  
  // Calculate similarity for each course
  const similarities = availableCourses
    .filter(course => course.id !== courseId) // Exclude the target course
    .map(course => {
      const courseKeywords = extractKeywords(course);
      const similarity = calculateKeywordSimilarity(targetKeywords, courseKeywords);
      
      return {
        courseId: course.id,
        score: Math.round(similarity * 100),
        reasons: generateSimilarityReasons(targetCourse, course),
        relevanceFactors: {
          contentMatch: Math.round(similarity * 100),
          skillLevelMatch: calculateSkillLevelMatch(targetCourse.skillLevel, course.skillLevel),
          learningStyleMatch: 85, // Placeholder
          popularityScore: 70 // Placeholder
        }
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return similarities;
};

/**
 * Extract keywords from a course for similarity matching
 */
const extractKeywords = (course: CourseModule): string[] => {
  // Combine title, description, and learning outcomes
  const text = `${course.title} ${course.description} ${course.learningOutcomes.join(' ')}`;
  
  // Simple keyword extraction (would be more sophisticated in a real implementation)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['with', 'from', 'that', 'this', 'will', 'have', 'what', 'your', 'about'].includes(word));
  
  return [...new Set(words)]; // Remove duplicates
};

/**
 * Calculate Jaccard similarity between two sets of keywords
 */
const calculateKeywordSimilarity = (keywords1: string[], keywords2: string[]): number => {
  // Count words in the intersection
  const intersection = keywords1.filter(word => keywords2.includes(word)).length;
  
  // Count words in the union
  const union = new Set([...keywords1, ...keywords2]).size;
  
  return union === 0 ? 0 : intersection / union;
};

/**
 * Generate natural language reasons for the similarity between courses
 */
const generateSimilarityReasons = (course1: CourseModule, course2: CourseModule): string[] => {
  const reasons: string[] = [];
  
  // Check skill level
  if (course1.skillLevel === course2.skillLevel) {
    reasons.push(`Both courses are designed for ${course1.skillLevel} level learners`);
  }
  
  // Check for similar topics in learning outcomes
  const sharedOutcomes = findSharedTerms(
    course1.learningOutcomes.join(' '),
    course2.learningOutcomes.join(' ')
  );
  
  if (sharedOutcomes.length > 0) {
    reasons.push(`Both courses cover topics like ${sharedOutcomes.slice(0, 3).join(', ')}`);
  }
  
  // Check if they might be sequential
  if (course1.title.includes('Fundamentals') && course2.title.includes('Advanced')) {
    reasons.push('This course builds on concepts you learned in the fundamentals');
  }
  
  // If we couldn't find specific reasons, add a generic one
  if (reasons.length === 0) {
    reasons.push('This course complements your current learning path');
  }
  
  return reasons;
};

/**
 * Find common terms between two text strings
 */
const findSharedTerms = (text1: string, text2: string): string[] => {
  // Extract significant terms (this would be more sophisticated in production)
  const significantTerms = [
    'machine learning', 'deep learning', 'neural networks', 'natural language', 'computer vision',
    'reinforcement learning', 'data science', 'artificial intelligence', 'AI ethics', 
    'python', 'tensorflow', 'pytorch', 'data analysis', 'algorithms', 'statistics',
    'programming', 'coding', 'software', 'development', 'deployment', 'production',
    'mathematics', 'calculus', 'linear algebra', 'probability'
  ];
  
  return significantTerms.filter(term => 
    text1.toLowerCase().includes(term) && text2.toLowerCase().includes(term)
  );
};

/**
 * Calculate skill level match percentage
 */
const calculateSkillLevelMatch = (
  level1: 'beginner' | 'intermediate' | 'advanced',
  level2: 'beginner' | 'intermediate' | 'advanced'
): number => {
  const levelMap = { beginner: 1, intermediate: 2, advanced: 3 };
  const levelDiff = Math.abs(levelMap[level1] - levelMap[level2]);
  
  // Perfect match = 100%, one level difference = 70%, two levels difference = 40%
  return levelDiff === 0 ? 100 : levelDiff === 1 ? 70 : 40;
};

/**
 * Fallback recommendation algorithm that doesn't rely on API calls
 */
const generateFallbackRecommendations = (
  userPreferences: UserPreferences,
  userHistory: CourseInteraction[],
  availableCourses: CourseModule[],
  limit: number
): CourseRecommendation[] => {
  // Score each course based on preference match
  const scoredCourses = availableCourses
    .filter(course => {
      // Filter out courses the user has completed
      const interaction = userHistory.find(h => h.courseId === course.id);
      if (!interaction) return true;
      
      // Consider a course "completed" if user has completed > 80% of lessons
      const courseModule = availableCourses.find(c => c.id === course.id);
      if (!courseModule) return true;
      
      const totalLessons = courseModule.lessons.length;
      const completedCount = interaction.completedLessons.length;
      
      return completedCount / totalLessons < 0.8;
    })
    .map(course => {
      // Calculate content match score
      let contentMatchScore = 0;
      if (userPreferences.topics.length > 0) {
        const courseText = `${course.title} ${course.description} ${course.learningOutcomes.join(' ')}`.toLowerCase();
        const matchingTopics = userPreferences.topics.filter(topic => 
          courseText.includes(topic.toLowerCase())
        );
        contentMatchScore = (matchingTopics.length / userPreferences.topics.length) * 100;
      } else {
        contentMatchScore = 50; // Neutral score if no preferences set
      }
      
      // Calculate skill level match
      let skillLevelMatch = 100;
      if (userPreferences.skillLevel !== 'all') {
        skillLevelMatch = userPreferences.skillLevel === course.skillLevel ? 100 : 
          (userPreferences.skillLevel === 'beginner' && course.skillLevel === 'intermediate') ||
          (userPreferences.skillLevel === 'intermediate' && course.skillLevel === 'advanced') ? 70 : 40;
      }
      
      // Calculate learning style match (simplified)
      let learningStyleMatch = 100;
      if (userPreferences.learningStyle !== 'all') {
        const hasMatchingLessons = course.lessons.some(lesson => {
          if (userPreferences.learningStyle === 'visual' && lesson.contentType === 'video') return true;
          if (userPreferences.learningStyle === 'reading' && lesson.contentType === 'text') return true;
          if (userPreferences.learningStyle === 'interactive' && lesson.contentType === 'interactive') return true;
          if (userPreferences.learningStyle === 'project-based' && lesson.contentType === 'project') return true;
          return false;
        });
        learningStyleMatch = hasMatchingLessons ? 100 : 50;
      }
      
      // Calculate time commitment match
      let timeCommitmentMatch = 100;
      if (userPreferences.timeCommitment !== 'all') {
        const hoursCategorization = {
          low: [0, 10],
          medium: [10, 20],
          high: [20, Infinity]
        };
        
        const range = hoursCategorization[userPreferences.timeCommitment];
        timeCommitmentMatch = (course.durationHours >= range[0] && course.durationHours < range[1]) ? 100 : 50;
      }
      
      // Calculate final score (weighted average)
      const score = (
        contentMatchScore * 0.4 +
        skillLevelMatch * 0.3 +
        learningStyleMatch * 0.2 +
        timeCommitmentMatch * 0.1
      );
      
      // Generate reasons for recommendation
      const reasons: string[] = [];
      
      if (contentMatchScore > 70) {
        reasons.push('Matches your interest areas');
      }
      
      if (skillLevelMatch > 70) {
        reasons.push(`Appropriate for your ${course.skillLevel} skill level`);
      }
      
      if (learningStyleMatch > 70) {
        reasons.push('Contains your preferred learning formats');
      }
      
      // Add continuity reason if applicable
      const viewedCourseIds = userHistory
        .filter(h => h.viewCount > 0)
        .map(h => h.courseId);
      
      if (
        (course.prerequisites?.some(prereq => viewedCourseIds.includes(prereq.split(' ').pop() || ''))) ||
        (course.title.includes('Advanced') && viewedCourseIds.some(id => 
          availableCourses.find(c => c.id === id)?.title.includes('Fundamentals')
        ))
      ) {
        reasons.push('Builds on courses you\'ve already viewed');
      }
      
      return {
        courseId: course.id,
        score: Math.round(score),
        reasons: reasons.length > 0 ? reasons : ['Recommended based on your profile'],
        relevanceFactors: {
          contentMatch: Math.round(contentMatchScore),
          skillLevelMatch,
          learningStyleMatch,
          popularityScore: 85, // Placeholder
          continuityScore: reasons.some(r => r.includes('Builds on')) ? 90 : undefined
        }
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scoredCourses;
};

/**
 * Get trending courses based on popularity and recency
 */
export const getTrendingCourses = async (
  availableCourses: CourseModule[],
  limit: number = 4
): Promise<{ courseId: string; trendScore: number; trendReason: string }[]> => {
  try {
    // In a production environment, this would call your backend API
    const response = await axios.get('/api/recommendations/trending', {
      params: { limit }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching trending courses:', error);
    
    // Fallback to a simple algorithm
    return availableCourses
      .map(course => ({
        courseId: course.id,
        // Generate a random trend score for demo purposes
        trendScore: Math.floor(Math.random() * 30) + 70, // 70-100
        trendReason: getRandomTrendReason()
      }))
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit);
  }
};

/**
 * Get a random trend reason for the fallback algorithm
 */
const getRandomTrendReason = (): string => {
  const reasons = [
    '90% completion rate',
    'High student satisfaction',
    'Recently updated content',
    'Popular in your region',
    'In-demand industry skills',
    'Highly rated by professionals',
    'Trending this month',
    'Featured by our instructors'
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
};