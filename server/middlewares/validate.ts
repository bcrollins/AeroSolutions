/**
 * Request Validation Middleware
 * 
 * This module provides middleware for validating request data using express-validator.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
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