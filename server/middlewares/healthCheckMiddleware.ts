/**
 * Health Check Middleware
 * 
 * This middleware provides health check endpoints for the application.
 * It should be applied before any other middleware that might interfere with
 * the root path and health check requests.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Get health status information
 * @returns Health status object
 */
export function getHealthStatus() {
  const backgroundTasks = (global as any).backgroundTaskMetrics || {
    status: 'unknown',
    lastRun: 'never'
  };

  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    backgroundTasks
  };
}

/**
 * Middleware that handles health check requests
 * This is specifically designed to handle root path requests
 * for deployment health checks
 */
/**
 * Health check middleware function
 * - Always responds to HEAD requests at root path with 200 OK
 * - Always responds to GET requests with proper Accept headers at root with health status JSON
 * - Always responds to GET requests at /health or /deployment-health with health status JSON
 * - Passes through all other requests to next middleware
 */
export function healthCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  // CRITICAL: Root path handling for deployment health checks
  // Replit Deployments perform health checks at the root path
  
  // Normalize the path to handle various root path formats
  const normalizedPath = req.path === '' ? '/' : req.path;
  
  if (normalizedPath === '/') {
    // Always respond to HEAD requests at root with 200 OK
    if (req.method === 'HEAD') {
      res.status(200).end();
      return;
    }
    
    // For GET requests to root path
    if (req.method === 'GET') {
      // If it explicitly wants JSON or doesn't prefer HTML, respond with health status
      if (req.get('Accept') === 'application/json' || 
          (req.accepts('json') && !req.accepts('html'))) {
        res.status(200).json(getHealthStatus());
        return;
      }
      
      // For GET requests that accept HTML, continue to next middleware
      // which will eventually serve the frontend app
    }
  }
  
  // Special handling for explicit health check endpoints
  if (normalizedPath === '/health' || normalizedPath === '/deployment-health') {
    res.status(200).json(getHealthStatus());
    return;
  }
  
  // Not a health check request, continue to next middleware
  return next();
}