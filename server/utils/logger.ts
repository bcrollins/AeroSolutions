/**
 * Logger Utility
 * 
 * This module provides a centralized logging system for the application.
 * It uses Winston for structured logging with different severity levels.
 */

import winston from 'winston';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create Winston logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'api-service' },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),
    
    // File transport for error logs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    
    // Combined logs
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

// If we're not in production, also log to the console with simpler format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

/**
 * Function to mask sensitive data in logs (e.g., emails, tokens)
 * @param data - Object containing data to mask
 * @returns Masked data object
 */
export function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  if (!data) return data;
  
  const maskedData = { ...data };
  
  // Mask email addresses
  if (maskedData.email) {
    const [name, domain] = maskedData.email.split('@');
    maskedData.email = `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`;
  }
  
  // Mask tokens and passwords
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key', 'accessToken'];
  sensitiveFields.forEach(field => {
    if (maskedData[field]) {
      maskedData[field] = '**********';
    }
  });
  
  // Recursively mask nested objects
  Object.keys(maskedData).forEach(key => {
    if (typeof maskedData[key] === 'object' && maskedData[key] !== null) {
      maskedData[key] = maskSensitiveData(maskedData[key]);
    }
  });
  
  return maskedData;
}

/**
 * Log HTTP request details
 * @param req - Express request object
 * @param statusCode - HTTP response status code
 * @param duration - Request duration in milliseconds
 */
export function logHttpRequest(req: any, statusCode: number, duration: number): void {
  const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  
  const logData = {
    method: req.method,
    url: req.originalUrl,
    status: statusCode,
    duration: `${duration}ms`,
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    userAgent: req.headers['user-agent'],
    userId: req.user?.id || 'anonymous'
  };
  
  // Filter out sensitive data from request body for logging
  let sanitizedBody = null;
  if (req.body && Object.keys(req.body).length > 0) {
    sanitizedBody = maskSensitiveData(req.body);
  }
  
  logger[logLevel](`HTTP ${req.method} ${req.originalUrl}`, {
    ...logData,
    body: sanitizedBody
  });
}