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
function getHealthStatus() {
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
export function healthCheckMiddleware(req: Request, res: Response, next: NextFunction) {
  // Special handling for root path
  if (req.path === '/') {
    // If request accepts JSON but not HTML, it's likely a health check
    if ((req.get('Accept') === 'application/json') || 
        (req.accepts('json') && !req.accepts('html'))) {
      return res.status(200).json(getHealthStatus());
    }
  }
  
  // Special handling for specific health check endpoints
  if (req.path === '/health' || req.path === '/deployment-health') {
    return res.status(200).json(getHealthStatus());
  }
  
  // Not a health check request, continue to next middleware
  return next();
}