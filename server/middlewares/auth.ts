/**
 * Authentication Middleware
 * 
 * This module provides authentication middleware for protecting routes
 * and verifying user sessions.
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { logger } from '../utils/logger';

// Extended request interface for authentication
interface AuthRequest extends Request {
  user?: any;
  isAuthenticated(): boolean;
}

/**
 * Middleware to check if a user is authenticated
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export function isAuthenticated(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  logger.info(`Unauthorized access attempt to ${req.originalUrl}`);
  return res.status(401).json({ 
    error: 'Unauthorized', 
    message: 'You must be logged in to access this resource' 
  });
}

/**
 * Middleware to check if a user has admin role
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    logger.info(`Unauthorized access attempt to admin route ${req.originalUrl}`);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'You must be logged in to access this resource' 
    });
  }
  
  // Check if the user has admin role
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get user from storage to check role
  storage.getUserById(userId)
    .then(user => {
      if (!user || user.role !== 'admin') {
        logger.warn(`Non-admin user ${userId} attempted to access admin route ${req.originalUrl}`);
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'You do not have permission to access this resource' 
        });
      }
      
      return next();
    })
    .catch(err => {
      logger.error(`Error checking admin status: ${err.message}`);
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'An error occurred while checking permissions' 
      });
    });
}

/**
 * Middleware to check if the authenticated user has access to a specific resource
 * @param resourceField - Name of the field in the request parameter that contains the resource ID
 * @param resourceType - Type of resource to check (e.g., 'project', 'document')
 */
export function hasResourceAccess(resourceField: string, resourceType: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = req.user?.id;
    const resourceId = req.params[resourceField];
    
    if (!userId || !resourceId) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing user ID or resource ID' });
    }
    
    try {
      // Check if the user has access to the resource
      // This is a simplified version; you'd need to implement the actual access check
      // based on your resource types and access control rules
      const hasAccess = await checkResourceAccess(userId, resourceId, resourceType);
      
      if (!hasAccess) {
        logger.warn(`User ${userId} attempted to access unauthorized ${resourceType} ${resourceId}`);
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'You do not have permission to access this resource' 
        });
      }
      
      return next();
    } catch (err: any) {
      logger.error(`Error checking resource access: ${err.message}`);
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'An error occurred while checking resource access' 
      });
    }
  };
}

/**
 * Check if a user has access to a specific resource
 * @param userId - ID of the user
 * @param resourceId - ID of the resource
 * @param resourceType - Type of resource
 * @returns True if the user has access, false otherwise
 */
async function checkResourceAccess(userId: number, resourceId: string, resourceType: string): Promise<boolean> {
  // Implementation would depend on your specific access control model
  // This is a placeholder that allows access for simplicity
  // In a real application, you would check against your database or access control list
  
  // For now, we'll implement a simple check for demonstration
  switch (resourceType) {
    case 'subscription':
      // Check if the subscription belongs to the user
      try {
        const user = await storage.getUserById(userId);
        return user?.stripeSubscriptionId === resourceId;
      } catch {
        return false;
      }
      
    case 'product':
      // Check if the product is accessible by the user (e.g., based on subscription)
      return true; // For demonstration purposes
      
    default:
      // By default, deny access to unknown resource types
      return false;
  }
}