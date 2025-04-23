import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

// JWT secret key - Should be moved to environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = '24h';

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/api/status',
  '/api/auth/login',
  '/api/auth/register',
  '/api/openai/status',
  '/api/subscription/status',
  '/api/subscription/plans'
];

// Check if a path is public
const isPublicPath = (path: string): boolean => {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith('/public/') || 
    path.match(/\.(css|js|svg|png|jpg|jpeg|gif|ico)$/)
  );
};

/**
 * Authentication middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication for public paths
  if (isPublicPath(req.path)) {
    return next();
  }

  // Get token from headers, query or cookies
  const token = 
    req.headers.authorization?.split(' ')[1] || 
    req.query.token as string || 
    req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    
    // Set user property on request
    storage.getUser(decoded.id).then(user => {
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Remove sensitive fields
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
      next();
    }).catch(error => {
      console.error('Error fetching user:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error' 
      });
    });
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

/**
 * Admin authorization middleware
 * Must be used after authMiddleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }

  next();
};

/**
 * Generate JWT token for authenticated user
 * @param userId - User ID
 * @returns JWT token
 */
export const generateToken = (userId: number): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

/**
 * Verify JWT token
 * @param token - JWT token
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): { id: number } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};