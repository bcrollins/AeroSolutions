import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Cache for storing rate limit data
const rateLimitCache = new NodeCache({ 
  stdTTL: 60,  // Default TTL: 60 seconds
  checkperiod: 120  // Check for expired keys every 120 seconds
});

// Rate limiter configuration types
type RateLimiterOptions = {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum number of requests per window
  message?: string;  // Custom error message
  statusCode?: number;  // Custom status code
  headers?: boolean;  // Whether to add rate limit headers
  keyGenerator?: (req: Request) => string;  // Function to generate a unique key for each request
};

/**
 * Generate a unique key for each request
 * By default, uses IP address or X-Forwarded-For header if available
 */
function defaultKeyGenerator(req: Request): string {
  // Get IP from X-Forwarded-For header if available, otherwise use remoteAddress
  const ip = req.headers['x-forwarded-for'] || 
             req.socket.remoteAddress || 
             'unknown';
  
  return `${ip}`;
}

/**
 * Create a rate limiter middleware
 * @param options - Rate limiter configuration
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs = 60 * 1000,  // Default: 1 minute
    maxRequests = 100,  // Default: 100 requests per minute
    message = 'Too many requests, please try again later.',
    statusCode = 429,  // Too Many Requests
    headers = true,
    keyGenerator = defaultKeyGenerator
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Generate key for this request
    const key = keyGenerator(req);
    
    // Get current hits from cache
    const hits = rateLimitCache.get<number>(key) || 0;
    
    // Check if rate limit exceeded
    if (hits >= maxRequests) {
      // Add rate limit headers
      if (headers) {
        res.setHeader('X-RateLimit-Limit', maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('Retry-After', Math.floor(windowMs / 1000).toString());
      }
      
      return res.status(statusCode).json({
        success: false,
        error: 'rate_limit_exceeded',
        message
      });
    }
    
    // Increment hits
    rateLimitCache.set(key, hits + 1, Math.ceil(windowMs / 1000));
    
    // Add rate limit headers
    if (headers) {
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (maxRequests - hits - 1).toString());
    }
    
    next();
  };
}

// Create different rate limiters for various routes
export const defaultRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 100,  // 100 requests per minute
  message: 'Too many requests from this IP, please try again after a minute.'
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 60,  // 60 requests per minute (1 per second)
  message: 'Too many API requests from this IP, please try again after a minute.'
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 10,  // 10 requests per 15 minutes
  message: 'Too many authentication attempts, please try again after 15 minutes.'
});

export const openaiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 10,  // 10 requests per minute
  message: 'OpenAI API rate limit exceeded. Please try again later.'
});