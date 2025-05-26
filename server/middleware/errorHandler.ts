import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Configure Winston logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-learning-platform' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for production
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ],
});

// Error types for better categorization
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  EXTERNAL_API = 'EXTERNAL_API',
  INTERNAL = 'INTERNAL'
}

// Custom error class
export class AppError extends Error {
  statusCode: number;
  type: ErrorType;
  isOperational: boolean;

  constructor(message: string, statusCode: number, type: ErrorType = ErrorType.INTERNAL) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let type = ErrorType.INTERNAL;
  
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    type = error.type;
  }

  // Log error details
  logger.error({
    message: error.message,
    stack: error.stack,
    statusCode,
    type,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    message: isDevelopment ? error.message : 'An error occurred',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};