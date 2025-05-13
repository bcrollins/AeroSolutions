/**
 * Request Validation Middleware
 * 
 * This middleware validates request data using zod.
 * It checks for validation errors and returns a standardized error response.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { fromZodError } from 'zod-validation-error';

/**
 * Middleware to validate request using zod schemas
 * @param schemas Array of zod schemas to validate against
 */
export const validateRequest = (schemas: z.ZodTypeAny[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Apply each schema
      for (const schema of schemas) {
        const validationResult = await schema.safeParseAsync(req.body);
        
        if (!validationResult.success) {
          const zodError = validationResult.error;
          const formattedError = fromZodError(zodError);
          
          logger.warn(`Validation error: ${formattedError.message}`, {
            path: req.path,
            errors: zodError.errors,
          });
          
          return res.status(400).json({
            error: 'Validation Error',
            message: formattedError.message,
            details: zodError.errors,
          });
        }
      }
      
      next();
    } catch (error: any) {
      logger.error(`Validation middleware error: ${error.message}`, {
        error,
        path: req.path,
      });
      
      return res.status(500).json({
        error: 'Server Error',
        message: 'An error occurred during request validation',
      });
    }
  };
};