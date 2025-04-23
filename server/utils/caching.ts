import { Request, Response, NextFunction } from 'express';

// Cache control types
type CacheControlOptions = {
  public?: boolean;
  private?: boolean;
  maxAge?: number;
  sMaxAge?: number;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  proxyRevalidate?: boolean;
  immutable?: boolean;
};

/**
 * Apply cache control headers
 * @param options - Cache control options
 */
function setCacheControl(res: Response, options: CacheControlOptions): void {
  const directives: string[] = [];
  
  // Add cache visibility
  if (options.public) directives.push('public');
  if (options.private) directives.push('private');
  
  // Add cache duration
  if (options.maxAge !== undefined) directives.push(`max-age=${options.maxAge}`);
  if (options.sMaxAge !== undefined) directives.push(`s-maxage=${options.sMaxAge}`);
  
  // Add cache behavior
  if (options.noCache) directives.push('no-cache');
  if (options.noStore) directives.push('no-store');
  if (options.mustRevalidate) directives.push('must-revalidate');
  if (options.proxyRevalidate) directives.push('proxy-revalidate');
  if (options.immutable) directives.push('immutable');
  
  res.setHeader('Cache-Control', directives.join(', '));
}

/**
 * Middleware for applying cache control headers based on path patterns
 */
export function cachingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;
    
    // API routes - minimal caching
    if (path.startsWith('/api/')) {
      setCacheControl(res, {
        private: true,
        maxAge: 5,  // 5 seconds
        mustRevalidate: true
      });
    }
    // Static assets - aggressive caching
    else if (path.match(/\.(css|js|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      setCacheControl(res, {
        public: true,
        maxAge: 86400,  // 1 day
        sMaxAge: 604800,  // 1 week
        immutable: true
      });
    }
    // HTML content - moderate caching
    else if (path.endsWith('.html') || path === '/') {
      setCacheControl(res, {
        public: true,
        maxAge: 300,  // 5 minutes
        mustRevalidate: true
      });
    }
    // Default - cautious caching
    else {
      setCacheControl(res, {
        private: true,
        maxAge: 60,  // 1 minute
        mustRevalidate: true
      });
    }
    
    next();
  };
}

/**
 * Middleware for conditional request handling (ETag, If-Modified-Since)
 */
export function conditionalRequestMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    // Override send method to handle ETags
    res.send = function(body) {
      // Skip for certain content types or empty responses
      if (!res.get('Content-Type') || !body) {
        return originalSend.call(this, body);
      }
      
      // Generate simple ETag based on content length and hash
      const etag = `W/"${body.length}-${Date.now().toString(36)}"`;
      res.setHeader('ETag', etag);
      
      // Handle 304 Not Modified responses
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        res.status(304).end();
        return this;
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}