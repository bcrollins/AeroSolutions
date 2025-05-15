import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyzes an article and provides insights such as summary, key points, and recommendations
 * @param title The article title
 * @param content The article content
 * @param tags Array of tags associated with the article
 * @returns Analysis object with insights about the article
 */
export async function analyzeArticleContent(
  title: string,
  content: string,
  tags: string[] = []
): Promise<ArticleAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // latest model for the best results
      messages: [
        {
          role: "system",
          content: 
            "You are an expert content analyst specializing in AI and technology topics. " +
            "Analyze the provided article and extract valuable insights. " +
            "Respond with JSON in this format: { 'summary': string, 'keyPoints': string[], 'readingLevel': string, 'audienceMatch': string, 'recommendations': string[], 'contentQuality': number, 'relevanceScore': number }"
        },
        {
          role: "user",
          content: `Please analyze this article with title "${title || 'Untitled'}" and the following tags: ${tags ? tags.join(', ') : 'none'}.\n\nContent: ${content || 'No content available'}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Keep consistent, analytical outputs
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Ensure all expected fields are present
    return {
      summary: result.summary || "Summary not available",
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
      readingLevel: result.readingLevel || "Intermediate",
      audienceMatch: result.audienceMatch || "General",
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      contentQuality: typeof result.contentQuality === 'number' ? result.contentQuality : 7,
      relevanceScore: typeof result.relevanceScore === 'number' ? result.relevanceScore : 7
    };
  } catch (error) {
    console.error("Error analyzing article content:", error);
    // Return fallback values
    return {
      summary: "Unable to generate article analysis at this time.",
      keyPoints: ["Analysis currently unavailable"],
      readingLevel: "Intermediate",
      audienceMatch: "General",
      recommendations: ["Try analyzing again later"],
      contentQuality: 5,
      relevanceScore: 5
    };
  }
}

/**
 * Generates related topics based on an article
 * @param title The article title
 * @param content The article content
 * @param count Number of related topics to generate
 * @returns Array of related topic strings
 */
export async function generateRelatedTopics(
  title: string,
  content: string,
  count: number = 5
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI education expert. Generate related topics for further exploration. " +
            "Response should be a JSON array of strings, each representing a related topic."
        },
        {
          role: "user",
          content: `Based on this article titled "${title || 'Untitled'}" with content: "${(content || 'No content available').substring(0, Math.min(content?.length || 0, 1000))}...", suggest ${count} related topics for further exploration.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Allow for some creativity
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content);
    return Array.isArray(result.topics) ? result.topics.slice(0, count) : [];
  } catch (error) {
    console.error("Error generating related topics:", error);
    return [];
  }
}

/**
 * Generates a personalized study path based on a user's interests and articles
 * @param userInterests Array of user interest topics
 * @param articleHistory Array of recent article titles the user has read
 * @returns Personalized learning path with recommended topics and resources
 */
export async function generatePersonalizedPath(
  userInterests: string[],
  articleHistory: string[]
): Promise<StudyPathRecommendation> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an AI education advisor. Create personalized learning paths for users based on their interests and reading history. " +
            "Respond with JSON in this format: { 'path': string, 'topics': string[], 'recommendedArticles': string[], 'estimatedTimeHours': number }"
        },
        {
          role: "user",
          content: `Create a personalized learning path based on these user interests: ${userInterests.join(', ')}. They have recently read articles titled: ${articleHistory.join(', ')}.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      path: result.path || "Advanced AI Technologies",
      topics: Array.isArray(result.topics) ? result.topics : [],
      recommendedArticles: Array.isArray(result.recommendedArticles) ? result.recommendedArticles : [],
      estimatedTimeHours: typeof result.estimatedTimeHours === 'number' ? result.estimatedTimeHours : 10
    };
  } catch (error) {
    console.error("Error generating personalized path:", error);
    return {
      path: "General AI Learning Path",
      topics: ["AI Fundamentals", "Machine Learning Basics", "AI Ethics"],
      recommendedArticles: ["Introduction to AI", "Getting Started with Machine Learning"],
      estimatedTimeHours: 10
    };
  }
}

/**
 * Generates a quiz based on article content for learning reinforcement
 * @param title The article title
 * @param content The article content
 * @param questionCount Number of questions to generate
 * @returns Quiz object with questions and answers
 */
export async function generateContentQuiz(
  title: string,
  content: string,
  questionCount: number = 3
): Promise<ArticleQuiz> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an education specialist. Create engaging multiple-choice questions based on article content for learning reinforcement. " +
            "Respond with JSON in this format: { 'questions': [{ 'question': string, 'options': string[], 'correctIndex': number, 'explanation': string }] }"
        },
        {
          role: "user",
          content: `Create ${questionCount} multiple-choice questions based on this article titled "${title}" with content: "${content.substring(0, 2000)}..."`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    if (!Array.isArray(result.questions)) {
      throw new Error("Invalid response format");
    }
    
    return {
      title: `Quiz: ${title}`,
      questions: result.questions.map((q: any) => ({
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || ""
      }))
    };
  } catch (error) {
    console.error("Error generating content quiz:", error);
    // Return a simple fallback quiz
    return {
      title: `Quiz: ${title}`,
      questions: [
        {
          question: "What is the main topic of this article?",
          options: ["AI Technology", "Business Strategy", "Data Science", "Web Development"],
          correctIndex: 0,
          explanation: "This article primarily focuses on AI Technology."
        }
      ]
    };
  }
}

// Type definitions for the OpenAI service responses
export interface ArticleAnalysis {
  summary: string;
  keyPoints: string[];
  readingLevel: string;
  audienceMatch: string;
  recommendations: string[];
  contentQuality: number; // 1-10 scale
  relevanceScore: number; // 1-10 scale
}

export interface StudyPathRecommendation {
  path: string;
  topics: string[];
  recommendedArticles: string[];
  estimatedTimeHours: number;
}

export interface ArticleQuiz {
  title: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}