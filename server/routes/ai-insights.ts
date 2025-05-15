import { Router } from 'express';
import { z } from 'zod';
import OpenAI from "openai";

const router = Router();

// Initialize OpenAI with API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Validate article input
const articleSchema = z.object({
  articleId: z.number(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
});

/**
 * POST /api/ai-insights/summary
 * Generate a summary of an article using OpenAI
 */
router.post('/summary', async (req, res) => {
  try {
    // Validate request body
    const validation = articleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors 
      });
    }
    
    const { title, content } = validation.data;
    
    // Call OpenAI API to generate summary
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in summarizing articles. Create concise, informative summaries that capture the key points."
        },
        {
          role: "user",
          content: `Please generate a concise summary (around 80-100 words) of the following article:\n\nTitle: ${title}\n\nContent: ${content.substring(0, 4000)}...`
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
    });
    
    const summary = response.choices[0].message.content;
    
    // Return the generated summary
    return res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Error generating article summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating article summary',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai-insights/analysis
 * Analyze article content to extract insights, topics, and sentiment
 */
router.post('/analysis', async (req, res) => {
  try {
    // Validate request body
    const validation = articleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors 
      });
    }
    
    const { title, content } = validation.data;
    
    // Call OpenAI API to analyze article
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in content analysis. Analyze articles to extract insights, topics, and sentiment in a structured format."
        },
        {
          role: "user",
          content: `Analyze this article and provide insights, key topics, and sentiment analysis in JSON format:\n\nTitle: ${title}\n\nContent: ${content.substring(0, 4000)}...`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    // Parse the JSON response
    const analysisData = JSON.parse(response.choices[0].message.content);
    
    // Return the analysis data
    return res.json({
      success: true,
      analysis: analysisData,
    });
  } catch (error) {
    console.error('Error analyzing article:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing article',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai-insights/recommendations
 * Generate personalized article recommendations
 */
router.post('/recommendations', async (req, res) => {
  try {
    // Validate request body
    const recommendationSchema = z.object({
      userInterests: z.array(z.string()),
      recentArticles: z.array(z.string()),
      count: z.number().optional().default(5),
    });
    
    const validation = recommendationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors 
      });
    }
    
    const { userInterests, recentArticles, count } = validation.data;
    
    // Call OpenAI API to generate recommendations
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in content recommendation. Generate personalized article recommendations based on user interests and recent activity."
        },
        {
          role: "user",
          content: `Generate ${count} personalized article recommendations in JSON format. The response should be an array of objects with 'title' and 'description' fields.\n\nUser interests: ${userInterests.join(', ')}\n\nRecently viewed articles: ${recentArticles.join(', ')}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    // Parse the JSON response
    const recommendationsData = JSON.parse(response.choices[0].message.content);
    
    // Return the recommendations
    return res.json({
      success: true,
      recommendations: recommendationsData,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;