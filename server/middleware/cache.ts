import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Create cache instances with different TTL for different data types
export const contentCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes for content
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false
});

export const courseCache = new NodeCache({ 
  stdTTL: 900, // 15 minutes for course data
  checkperiod: 120
});

export const userCache = new NodeCache({ 
  stdTTL: 180, // 3 minutes for user data
  checkperiod: 60
});

// Cache middleware factory
export const cacheMiddleware = (cache: NodeCache, keyGenerator?: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator ? keyGenerator(req) : `${req.method}:${req.originalUrl}`;
    const cachedData = cache.get(key);
    
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = function(data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };
    
    next();
  };
};

// Cache invalidation helpers
export const invalidateCache = (pattern: string) => {
  const keys = contentCache.keys().filter(key => key.includes(pattern));
  contentCache.del(keys);
  
  const courseKeys = courseCache.keys().filter(key => key.includes(pattern));
  courseCache.del(courseKeys);
};

// Cache statistics
export const getCacheStats = () => {
  return {
    content: contentCache.getStats(),
    courses: courseCache.getStats(),
    users: userCache.getStats()
  };
};