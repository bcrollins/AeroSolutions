import { Request, Response } from 'express';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate personalized course recommendations using OpenAI
 */
export const getPersonalizedRecommendations = async (req: Request, res: Response) => {
  try {
    const { userPreferences, userHistory, availableCourses, limit = 5 } = req.body;

    if (!userPreferences || !userHistory || !availableCourses) {
      return res.status(400).json({ 
        error: 'Missing required parameters (userPreferences, userHistory, availableCourses)' 
      });
    }

    // Prepare data for OpenAI API
    const prompt = `
      You are an AI learning advisor helping to recommend courses to a user based on their preferences and learning history.
      
      USER PREFERENCES:
      - Topics of interest: ${userPreferences.topics.join(', ')}
      - Skill level: ${userPreferences.skillLevel}
      - Learning style preference: ${userPreferences.learningStyle}
      - Time commitment: ${userPreferences.timeCommitment}
      - Learning goals: ${userPreferences.goals.join(', ')}
      
      USER HISTORY:
      The user has interacted with the following courses:
      ${userHistory.map(interaction => `
        - Course ID: ${interaction.courseId}
        - View count: ${interaction.viewCount}
        - Completed lessons: ${interaction.completedLessons.length}
        - Favorited: ${interaction.favorited ? 'Yes' : 'No'}
      `).join('\n')}
      
      AVAILABLE COURSES:
      ${availableCourses.map(course => `
        - Course ID: ${course.id}
        - Title: ${course.title}
        - Description: ${course.description}
        - Skill level: ${course.skillLevel}
        - Duration: ${course.durationHours} hours
        - Topics: ${course.learningOutcomes.join(', ')}
      `).join('\n')}
      
      Based on this information, recommend the top ${limit} courses for this user that would best match their preferences, learning style, and history. 
      For each recommendation, provide a relevance score (0-100), specific reasons for the recommendation, and a breakdown of relevance factors.
      
      Return the recommendations as a JSON array with the following structure:
      [
        {
          "courseId": "string",
          "score": number,
          "reasons": ["string", "string"],
          "relevanceFactors": {
            "contentMatch": number,
            "skillLevelMatch": number,
            "learningStyleMatch": number,
            "popularityScore": number,
            "continuityScore": number (optional)
          }
        }
      ]
      
      Do not include any courses the user has already completed (having completed more than 80% of lessons).
      Prioritize courses that align with the user's specified topics of interest and learning goals.
    `;

    // Call OpenAI API for recommendations
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: "You are an expert AI learning advisor that helps students find the best courses." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    // Parse the response
    const content = response.choices[0].message.content;
    const recommendationsData = JSON.parse(content || '{"recommendations":[]}');
    
    // Get the recommendations array from the parsed response
    const recommendations = Array.isArray(recommendationsData) 
      ? recommendationsData 
      : recommendationsData.recommendations || [];

    // Return recommendations
    return res.json(recommendations);
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recommendations', 
      details: error.message 
    });
  }
};

/**
 * Generate content-based course recommendations using OpenAI
 */
export const getContentBasedRecommendations = async (req: Request, res: Response) => {
  try {
    const { courseId, availableCourses, limit = 3 } = req.body;

    if (!courseId || !availableCourses) {
      return res.status(400).json({ 
        error: 'Missing required parameters (courseId, availableCourses)' 
      });
    }

    // Find the target course
    const targetCourse = availableCourses.find(course => course.id === courseId);
    
    if (!targetCourse) {
      return res.status(404).json({ error: 'Target course not found' });
    }

    // Prepare data for OpenAI API
    const prompt = `
      You are an AI learning advisor helping to recommend similar courses based on content.
      
      TARGET COURSE:
      - Course ID: ${targetCourse.id}
      - Title: ${targetCourse.title}
      - Description: ${targetCourse.description}
      - Skill level: ${targetCourse.skillLevel}
      - Topics: ${targetCourse.learningOutcomes.join(', ')}
      
      AVAILABLE COURSES:
      ${availableCourses
        .filter(course => course.id !== courseId) // Exclude the target course
        .map(course => `
          - Course ID: ${course.id}
          - Title: ${course.title}
          - Description: ${course.description}
          - Skill level: ${course.skillLevel}
          - Topics: ${course.learningOutcomes.join(', ')}
        `).join('\n')}
      
      Based on content similarity, recommend the top ${limit} courses that are most similar to the target course.
      For each recommendation, provide a relevance score (0-100), specific reasons for the similarity, and a breakdown of relevance factors.
      
      Return the recommendations as a JSON array with the following structure:
      [
        {
          "courseId": "string",
          "score": number,
          "reasons": ["string", "string"],
          "relevanceFactors": {
            "contentMatch": number,
            "skillLevelMatch": number,
            "learningStyleMatch": number,
            "popularityScore": number
          }
        }
      ]
      
      Focus on finding courses with similar topics, progression in learning path, or complementary skills.
    `;

    // Call OpenAI API for recommendations
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: "You are an expert AI learning advisor that identifies course similarities and learning pathways." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    // Parse the response
    const content = response.choices[0].message.content;
    const recommendationsData = JSON.parse(content || '{"recommendations":[]}');
    
    // Get the recommendations array from the parsed response
    const recommendations = Array.isArray(recommendationsData) 
      ? recommendationsData 
      : recommendationsData.recommendations || [];

    // Return recommendations
    return res.json(recommendations);
  } catch (error) {
    console.error('Error generating content-based recommendations:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recommendations', 
      details: error.message 
    });
  }
};

/**
 * Get trending courses
 */
export const getTrendingCourses = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 4;
    
    // In a real implementation, this would query a database for trending courses
    // based on recent enrollments, high completion rates, etc.
    
    // For demo purposes, we'll generate trending recommendations with OpenAI
    const prompt = `
      You are an AI learning advisor helping to identify trending courses in AI and technology education.
      
      Generate a list of ${limit} trending courses with the following information for each:
      1. Course ID (from module-1 to module-6)
      2. A trending score between 70-100
      3. A specific reason why the course is trending (e.g., "90% completion rate", "Popular among data scientists")
      
      Return the list as a JSON array with the following structure:
      [
        {
          "courseId": "module-1",
          "trendScore": 85,
          "trendReason": "High student satisfaction rating"
        }
      ]
      
      Make the reasons diverse and realistic, focusing on factors like completion rates, student satisfaction, 
      industry demand, recent updates, or professional endorsements.
    `;

    // Call OpenAI API for trending courses
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: "You are an expert AI learning advisor that identifies trending courses and learning opportunities." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Higher temperature for more variety
    });

    // Parse the response
    const content = response.choices[0].message.content;
    const trendingData = JSON.parse(content || '{"trending":[]}');
    
    // Get the trending courses array from the parsed response
    const trendingCourses = Array.isArray(trendingData) 
      ? trendingData 
      : trendingData.trending || [];

    // Return trending courses
    return res.json(trendingCourses);
  } catch (error) {
    console.error('Error fetching trending courses:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch trending courses', 
      details: error.message 
    });
  }
};

/**
 * Analyze learning patterns to provide insights
 */
export const getLearningInsights = async (req: Request, res: Response) => {
  try {
    const { userHistory, courseModules } = req.body;

    if (!userHistory || !courseModules) {
      return res.status(400).json({ 
        error: 'Missing required parameters (userHistory, courseModules)' 
      });
    }

    // Prepare data for OpenAI API
    const prompt = `
      You are an AI learning analyst helping a student understand their learning patterns and progress.
      
      USER LEARNING HISTORY:
      ${userHistory.map(interaction => `
        - Course: ${courseModules.find(c => c.id === interaction.courseId)?.title || interaction.courseId}
        - Completed lessons: ${interaction.completedLessons.length}
        - Quiz average: ${
          Object.values(interaction.quizScores || {}).length > 0
            ? Math.round(
                Object.values(interaction.quizScores || {}).reduce((sum, quiz) => sum + quiz.score / quiz.totalPossible, 0) / 
                Object.values(interaction.quizScores || {}).length * 100
              )
            : 'No quizzes taken'
        }%
        - Time spent: ${interaction.timeSpent || 'Unknown'} minutes
      `).join('\n')}
      
      Based on this learning history, provide the following insights:
      1. Learning Strengths: What topics or types of content does the user excel at?
      2. Areas for Improvement: What areas might need more attention?
      3. Learning Style: What learning style seems to work best for the user based on their interactions?
      4. Recommended Next Steps: What specific actions would help the user improve their learning outcomes?
      5. Achievement Highlights: What notable achievements has the user accomplished?
      
      Return the insights as a JSON object with the following structure:
      {
        "strengths": ["string", "string"],
        "improvementAreas": ["string", "string"],
        "learningStyle": "string",
        "nextSteps": ["string", "string"],
        "achievements": ["string", "string"]
      }
      
      Provide specific, actionable insights based on the patterns in the user's learning history.
    `;

    // Call OpenAI API for learning insights
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: "You are an expert learning analyst that helps students understand their learning patterns and improve their educational outcomes." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    // Parse the response
    const content = response.choices[0].message.content;
    const insights = JSON.parse(content || '{}');

    // Return learning insights
    return res.json(insights);
  } catch (error) {
    console.error('Error generating learning insights:', error);
    return res.status(500).json({ 
      error: 'Failed to generate learning insights', 
      details: error.message 
    });
  }
};