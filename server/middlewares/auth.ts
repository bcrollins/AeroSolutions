/**
 * Authentication Middleware
 * 
 * This middleware provides authentication and authorization functions.
 * It verifies user authentication status and role-based access.
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { logger } from '../utils/logger';

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    return next();
  }
  
  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Authentication required',
  });
};

/**
 * Check if user has admin role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }
  
  const user = req.user as any;
  if (user && user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    error: 'Forbidden',
    message: 'Admin access required',
  });
};

/**
 * Check if user has required role
 * @param role Required role for access
 */
export const hasRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }
    
    const user = req.user as any;
    if (user && user.role === role) {
      return next();
    }
    
    return res.status(403).json({
      error: 'Forbidden',
      message: `${role} access required`,
    });
  };
};

// Aliases for the posts routes
export const requireAuth = isAuthenticated;
export const requireAdmin = isAdmin;