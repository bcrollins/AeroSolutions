import OpenAI from "openai";
import { storage } from "./storage";

// Check if API key is set
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY environment variable is not set. OpenAI API calls will fail.');
}

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default parameters
const DEFAULT_MODEL = "gpt-4o"; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MAX_TOKENS = 1000;
const DEFAULT_TEMPERATURE = 0.7;

// Options type for text completion
interface CompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  userId?: number;
}

// Options type for image generation
interface ImageOptions {
  size?: string;
  userId?: number;
}

/**
 * OpenAI API service
 */
class OpenAIService {
  /**
   * Generate text completion
   * @param prompt - The text prompt
   * @param options - Configuration options
   * @returns Completion response
   */
  async generateCompletion(prompt: string, options?: CompletionOptions) {
    // Apply defaults
    const model = options?.model || DEFAULT_MODEL;
    const maxTokens = options?.maxTokens || DEFAULT_MAX_TOKENS;
    const temperature = options?.temperature || DEFAULT_TEMPERATURE;
    
    // Call OpenAI API
    const completion = await openaiClient.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    // Log request to database if user is authenticated
    if (options?.userId) {
      try {
        await storage.createOpenAIRequest({
          userId: options.userId,
          type: 'completion',
          prompt,
          model,
          response: JSON.stringify(completion),
          tokens: completion.usage?.total_tokens || 0
        });
      } catch (error) {
        console.error('Error logging OpenAI request:', error);
      }
    }
    
    return completion;
  }

  /**
   * Generate image from text prompt
   * @param prompt - Text description for image generation
   * @param options - Configuration options
   * @returns Image generation response
   */
  async generateImage(prompt: string, options?: ImageOptions) {
    // Apply defaults
    const size = options?.size || "1024x1024";
    
    // Call OpenAI API
    const response = await openaiClient.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: size as any, // Type issue with size parameter
      quality: "standard",
    });

    // Log request to database if user is authenticated
    if (options?.userId) {
      try {
        await storage.createOpenAIRequest({
          userId: options.userId,
          type: 'image',
          prompt,
          model: 'dall-e-3',
          response: JSON.stringify(response),
          tokens: 0 // DALL-E doesn't report token usage
        });
      } catch (error) {
        console.error('Error logging OpenAI request:', error);
      }
    }
    
    return response;
  }

  /**
   * Analyze sentiment of text
   * @param text - The text to analyze
   * @returns Sentiment analysis result
   */
  async analyzeSentiment(text: string): Promise<{
    rating: number;
    confidence: number;
  }> {
    try {
      const response = await openaiClient.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
          },
          {
            role: "user",
            content: text,
          },
        ],
        response_format: { type: "json_object" },
      });

      // Parse the response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }
      
      const result = JSON.parse(content);

      return {
        rating: Math.max(1, Math.min(5, Math.round(result.rating))),
        confidence: Math.max(0, Math.min(1, result.confidence)),
      };
    } catch (error) {
      console.error("Failed to analyze sentiment:", error);
      throw error;
    }
  }

  /**
   * Generate a summary of text
   * @param text - The text to summarize
   * @returns Summarized text
   */
  async generateSummary(text: string): Promise<string> {
    try {
      const response = await openaiClient.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a professional summarizer. Create a concise summary of the text while preserving the key points and main ideas.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
      });

      return response.choices[0].message.content || "No summary generated";
    } catch (error) {
      console.error("Failed to generate summary:", error);
      throw error;
    }
  }
}

// Create and export service instance
const openai = new OpenAIService();
export default openai;