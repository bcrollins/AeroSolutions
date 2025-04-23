import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { callOpenAI } from '../utils/xaiClient';
import { ChatCompletion } from 'openai/resources';

const router = Router();

/**
 * @route POST /api/generate
 * @desc Generate text using OpenAI API
 * @access Public
 */
router.post('/generate', [
  // Validate input
  body('prompt')
    .notEmpty().withMessage('Prompt is required')
    .isString().withMessage('Prompt must be a string')
    .trim(),
  body('model')
    .optional()
    .isString().withMessage('Model must be a string'),
  body('max_tokens')
    .optional()
    .isInt({ min: 1, max: 4000 }).withMessage('Max tokens must be between 1 and 4000'),
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 }).withMessage('Temperature must be between 0 and 2')
], async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: errors.array()
      });
    }

    const { prompt, model = 'gpt-4o', max_tokens = 150, temperature = 0.7 } = req.body;

    // Call OpenAI API using our utility function
    const response = await callOpenAI('/chat/completions', {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens,
      temperature
    }) as ChatCompletion;

    // Return the generated text
    res.json({
      success: true,
      result: response.choices?.[0]?.message?.content?.trim() || '',
      model,
      usage: response.usage || null
    });
  } catch (error: any) {
    console.error('Error generating text:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate text',
      error: error.message
    });
  }
});

export default router;