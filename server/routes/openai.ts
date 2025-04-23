import { Router, Request, Response } from 'express';
import { openaiRateLimiter } from '../utils/rate-limiting';
import { validateCompletionRequest, validateImageRequest, validateSentimentRequest, validateSummaryRequest } from '../utils/validation';
import openai from '../openai';

// Create router with rate limiting
const openaiRouter = Router();
openaiRouter.use(openaiRateLimiter);

// Generate completion endpoint
openaiRouter.post('/completion', validateCompletionRequest, async (req: Request, res: Response) => {
  try {
    const { prompt, model, maxTokens, temperature } = req.body;
    
    // Call OpenAI API
    const completion = await openai.generateCompletion(
      prompt,
      {
        model,
        maxTokens,
        temperature,
        userId: req.user?.id
      }
    );
    
    // Return response
    return res.json({
      success: true,
      data: {
        text: completion.choices[0].message.content,
        model: completion.model,
        usage: completion.usage
      }
    });
  } catch (error: any) {
    console.error('Error generating completion:', error);
    
    // Handle OpenAI API errors
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: {
          message: error.response.data.error.message,
          type: error.response.data.error.type,
          code: error.response.data.error.code
        }
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected error occurred',
        detail: error.message
      }
    });
  }
});

// Generate image endpoint
openaiRouter.post('/image', validateImageRequest, async (req: Request, res: Response) => {
  try {
    const { prompt, size } = req.body;
    
    // Call OpenAI API
    const response = await openai.generateImage(
      prompt,
      {
        size,
        userId: req.user?.id
      }
    );
    
    // Return response
    return res.json({
      success: true,
      data: {
        url: response.data[0].url,
        model: 'dall-e-3'
      }
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    
    // Handle OpenAI API errors
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: {
          message: error.response.data.error.message,
          type: error.response.data.error.type,
          code: error.response.data.error.code
        }
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected error occurred',
        detail: error.message
      }
    });
  }
});

// Analyze sentiment endpoint
openaiRouter.post('/sentiment', validateSentimentRequest, async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    // Call OpenAI API
    const sentiment = await openai.analyzeSentiment(text);
    
    // Return response
    return res.json({
      success: true,
      data: sentiment
    });
  } catch (error: any) {
    console.error('Error analyzing sentiment:', error);
    
    // Handle errors
    return res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected error occurred',
        detail: error.message
      }
    });
  }
});

// Generate summary endpoint
openaiRouter.post('/summary', validateSummaryRequest, async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    // Call OpenAI API
    const summary = await openai.generateSummary(text);
    
    // Return response
    return res.json({
      success: true,
      data: {
        summary
      }
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    
    // Handle errors
    return res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected error occurred',
        detail: error.message
      }
    });
  }
});

// Get API status
openaiRouter.get('/status', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      status: 'active',
      model: 'gpt-4o',
      apiKey: process.env.OPENAI_API_KEY ? 'configured' : 'missing'
    }
  });
});

export default openaiRouter;