import OpenAI from 'openai';
import { db } from '../db';

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cache for recommendations to reduce API calls
const recommendationCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface RecommendationParams {
  userId: string;
  interests?: string[];
  recentCourseIds?: string[];
  completedLessonIds?: string[];
  learningGoal?: string;
  count?: number;
}

interface CourseRecommendation {
  courseId: string;
  title: string;
  description: string;
  matchScore: number;
  reasonForRecommendation: string;
}

/**
 * Generates personalized course recommendations for a user
 */
export async function getPersonalizedRecommendations({
  userId,
  interests = [],
  recentCourseIds = [],
  completedLessonIds = [],
  learningGoal = '',
  count = 3
}: RecommendationParams): Promise<CourseRecommendation[]> {
  // Check cache first
  const cacheKey = `user_recommendations_${userId}`;
  const cachedRecommendations = recommendationCache.get(cacheKey);
  
  if (cachedRecommendations && cachedRecommendations.timestamp > Date.now() - CACHE_TTL) {
    return cachedRecommendations.data;
  }

  try {
    // Get all courses for recommendation
    const allCourses = await db.query.courses.findMany();
    
    // Prepare data for the AI model
    const userProfile = {
      userId,
      interests,
      recentCourses: recentCourseIds,
      completedLessons: completedLessonIds,
      learningGoal
    };
    
    const courseData = allCourses.map(course => ({
      id: course.id.toString(),
      title: course.title,
      description: course.description || '',
      difficulty: course.difficulty || 'intermediate',
      category: course.category || 'general'
    }));
    
    // Create the prompt for the OpenAI API
    const prompt = `
      Generate ${count} personalized course recommendations for a user based on their profile and available courses.
      
      User Profile:
      ${JSON.stringify(userProfile, null, 2)}
      
      Available Courses:
      ${JSON.stringify(courseData, null, 2)}
      
      Return recommendations in JSON format with the following structure:
      {
        "recommendations": [
          {
            "courseId": string,
            "title": string,
            "description": string,
            "matchScore": number (between 0-100),
            "reasonForRecommendation": string (explain why this course matches the user's profile)
          }
        ]
      }
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educational advisor specializing in personalized learning recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content || '{"recommendations": []}';
    const recommendations = JSON.parse(content)?.recommendations || [];
    
    // Cache the results
    recommendationCache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now()
    });
    
    return recommendations;
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    
    // Return basic recommendations if there's an error
    const allCourses = await db.query.courses.findMany();
    return generateBasicRecommendations(allCourses, count);
  }
}

/**
 * Generates basic recommendations when AI recommendations fail
 */
function generateBasicRecommendations(allCourses: any[], count: number): CourseRecommendation[] {
  // Sort by newest or most popular courses
  const sortedCourses = [...allCourses].sort((a, b) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
  
  return sortedCourses.slice(0, count).map(course => ({
    courseId: course.id.toString(),
    title: course.title,
    description: course.description || '',
    matchScore: 70, // Default match score
    reasonForRecommendation: 'This is a popular course that matches your general interests'
  }));
}

/**
 * Gets course recommendations for a specific topic
 */
export async function getTopicBasedRecommendations(
  topic: string,
  count: number = 3
): Promise<CourseRecommendation[]> {
  try {
    // Get all courses
    const allCourses = await db.query.courses.findMany();
    
    // Call OpenAI to match courses with the topic
    const prompt = `
      Find the ${count} most relevant courses for someone interested in learning about "${topic}" from the following list:
      ${JSON.stringify(allCourses.map(c => ({
        id: c.id.toString(),
        title: c.title,
        description: c.description || '',
        difficulty: c.difficulty || 'intermediate',
        category: c.category || 'general'
      })), null, 2)}
      
      Return recommendations in JSON format with the following structure:
      {
        "recommendations": [
          {
            "courseId": string,
            "title": string,
            "description": string,
            "matchScore": number (between 0-100),
            "reasonForRecommendation": string (explain why this course is relevant to the topic)
          }
        ]
      }
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educational advisor that matches learning topics with the most relevant courses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content || '{"recommendations": []}';
    const recommendations = JSON.parse(content)?.recommendations || [];
    
    return recommendations;
  } catch (error) {
    console.error('Error generating topic-based recommendations:', error);
    return [];
  }
}