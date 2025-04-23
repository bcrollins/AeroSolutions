import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Middleware factory to validate request using Zod schema
 * @param schema - Zod schema for validation
 * @param source - Source of data to validate (default: 'body')
 */
export function validateRequest(schema: z.Schema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Select data source to validate
      const data = req[source];
      
      // Validate data against schema
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const errors = result.error.format();
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      // Replace validated data
      req[source] = result.data;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Validation error'
      });
    }
  };
}

/**
 * Validate OpenAI text completion request
 */
export const validateCompletionRequest = (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    model: z.string().optional(),
    maxTokens: z.number().positive().optional(),
    temperature: z.number().min(0).max(1).optional()
  });
  
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request data',
      details: result.error.errors
    });
  }
  
  req.body = result.data;
  next();
};

/**
 * Validate OpenAI image generation request
 */
export const validateImageRequest = (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    size: z.enum(['256x256', '512x512', '1024x1024']).optional()
  });
  
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request data',
      details: result.error.errors
    });
  }
  
  req.body = result.data;
  next();
};

/**
 * Validate OpenAI sentiment analysis request
 */
export const validateSentimentRequest = (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({
    text: z.string().min(1, 'Text is required')
  });
  
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request data',
      details: result.error.errors
    });
  }
  
  req.body = result.data;
  next();
};

/**
 * Validate OpenAI text summarization request
 */
export const validateSummaryRequest = (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({
    text: z.string().min(10, 'Text must be at least 10 characters')
  });
  
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request data',
      details: result.error.errors
    });
  }
  
  req.body = result.data;
  next();
};