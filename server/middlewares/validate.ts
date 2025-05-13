/**
 * Request Validation Middleware
 * 
 * This module provides middleware for validating request data using express-validator and Zod.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * Middleware to validate request based on express-validator rules
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export function validateRequest(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }
  
  // Extract and format validation errors
  const extractedErrors: { [key: string]: string } = {};
  errors.array().forEach(err => {
    // Handle both validation error types
    if ('path' in err) {
      extractedErrors[err.path] = err.msg;
    } else if ('param' in err) {
      extractedErrors[err.param] = err.msg;
    }
  });
  
  // Log validation errors
  logger.warn(`Validation failed for ${req.method} ${req.originalUrl}`, {
    errors: extractedErrors,
    body: req.body,
    ip: req.ip
  });
  
  return res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    errors: extractedErrors
  });
}

/**
 * Creates a middleware to validate request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validate(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const extractedErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          extractedErrors[path] = err.message;
        });
        
        // Log validation errors
        logger.warn(`Zod validation failed for ${req.method} ${req.originalUrl}`, {
          errors: extractedErrors,
          body: req.body,
          ip: req.ip
        });
        
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: extractedErrors
        });
      }
      
      logger.error(`Unexpected validation error: ${error}`, {
        url: req.originalUrl,
        method: req.method
      });
      
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during validation'
      });
    }
  };
}