import express, { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { callOpenAI } from '../utils/xaiClient';
import { z } from 'zod';

const router = Router();

// Define input validation schema with Zod
const generateSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().optional().default('gpt-4o'),
  max_tokens: z.number().int().positive().optional().default(500),
  temperature: z.number().min(0).max(2).optional().default(0.7),
});

// API endpoint to generate text using OpenAI
router.post('/generate', [
  body('prompt').isString().notEmpty().withMessage('Prompt is required'),
  body('model').optional().isString(),
  body('max_tokens').optional().isInt({ min: 1, max: 4000 }),
  body('temperature').optional().isFloat({ min: 0, max: 2 }),
], async (req: Request, res: Response) => {
  try {
    // Express-validator validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    // Zod validation for type safety
    const validationResult = generateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        errors: validationResult.error.errors
      });
    }

    const { prompt, model, max_tokens, temperature } = validationResult.data;

    console.log(`Generating text with prompt: "${prompt.substring(0, 50)}..."`);
    
    const response = await callOpenAI('/chat/completions', {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens,
      temperature
    });
    
    // Extract and return the generated text
    const result = response.choices?.[0]?.message?.content || '';
    
    // Return the response
    res.json({
      success: true,
      result,
      model,
      usage: response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    });
  } catch (error: any) {
    console.error('Error in /api/generate endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating content',
      error: error.message
    });
  }
});

export default router;