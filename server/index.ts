
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import helmet from "helmet";
import { authMiddleware } from "./utils/auth";
import { cachingMiddleware, conditionalRequestMiddleware } from "./utils/caching";
import { apiRateLimiter, authRateLimiter, defaultRateLimiter } from "./utils/rate-limiting";
import { healthCheckMiddleware, getHealthStatus } from "./middlewares/healthCheckMiddleware";
import { enhancedSecurityHeadersMiddleware } from "./middlewares/enhancedSecurityHeadersMiddleware";
import compression from "express-compression";
import fs from "fs/promises";
import path from "path";
import { pool } from "./db";

// Extend Express Request type to include user property and timing
declare global {
  namespace Express {
    interface Request {
      user?: any;
      startTime?: [number, number]; // hrtime tuple
    }
  }
  
  // Add backgroundTaskMetrics to global scope
  interface BackgroundTaskMetrics {
    lastRun: string;
    status: 'success' | 'failed';
    taskCount: number;
    lastError?: string;
  }
  
  var backgroundTaskMetrics: BackgroundTaskMetrics | undefined;
}

const app = express();

// Register health check middleware first, before any other middleware
// This ensures health checks are processed immediately and without authentication
app.use(healthCheckMiddleware);

// These explicit health check endpoints are deliberately redundant
// with the healthCheckMiddleware to ensure deployment health checks never fail
// even if middleware registration has issues.

// Explicit /health endpoint (fallback in case middleware fails)
app.get('/health', (req, res) => {
  res.status(200).json(getHealthStatus());
});

// Explicit /deployment-health endpoint (fallback in case middleware fails)
app.get('/deployment-health', (req, res) => {
  res.status(200).json(getHealthStatus());
});

// Explicit HEAD handler for root path (fallback in case middleware fails)
app.head('/', (req, res) => {
  res.status(200).end();
});

// Explicit JSON handler for root path (fallback in case middleware fails)
app.get('/', (req, res, next) => {
  // Only handle JSON requests
  if (req.get('Accept') === 'application/json' || 
      (req.accepts('json') && !req.accepts('html'))) {
    res.status(200).json(getHealthStatus());
    return;
  }
  return next();
});

// Middleware for the root path is now handled by explicit routes above

// Performance and security middleware
// Compress responses
app.use(compression({
  threshold: 0, // Compress all responses
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      // Don't compress responses with this request header
      return false;
    }
    // Compress by default
    return true;
  }
}));

// Apply security headers with Helmet for base protection
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://www.googletagmanager.com", "https:", "http:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      fontSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.x.ai", "https://api.stripe.com", "wss:", "ws:", "https:", "http:"],
      frameSrc: ["'self'", "https://js.stripe.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply enhanced security headers for stricter protection
app.use(enhancedSecurityHeadersMiddleware);

// Apply caching headers
app.use(cachingMiddleware());
app.use(conditionalRequestMiddleware());

// Apply rate limiting - protect different routes with appropriate limits
app.use('/api/auth', authRateLimiter);  // Stricter rate limiting for auth endpoints
app.use('/api', apiRateLimiter);        // Standard API rate limiting
app.use(defaultRateLimiter);            // Default rate limiting for all other routes

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Define a custom type for the request with timing
interface TimedRequest extends Request {
  startTime?: [number, number]; // hrtime tuple
}

// Add request timing middleware
app.use((req: TimedRequest, res: Response, next: NextFunction) => {
  // Track request start time
  req.startTime = process.hrtime();
  
  // Store original send method
  const originalSend = res.send;
  
  // Override send method to add timing header
  res.send = function(...args) {
    if (req.startTime) {
      const diff = process.hrtime(req.startTime);
      const time = diff[0] * 1e3 + diff[1] * 1e-6; // time in ms
      res.setHeader('X-Response-Time', `${time.toFixed(2)}ms`);
    }
    return originalSend.apply(this, args);
  };
  
  next();
});

// JWT Authentication middleware - skip applying it here since 
// the authMiddleware in utils/auth.ts is designed to be applied on individual routes 
// or routers as needed. It has its own public path exceptions logic.

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database tables
  try {
    // Read the SQL initialization file
    const initSqlPath = path.join(process.cwd(), 'init.sql');
    try {
      const initSql = await fs.readFile(initSqlPath, 'utf8');
      await pool.query(initSql);
      log("Database tables initialized successfully");
    } catch (fsError) {
      log("Warning: init.sql file not found or couldn't be read", "warn");
    }
  } catch (error) {
    log(`Error initializing database tables: ${error}`, "error");
  }
  
  // Initialize sample data
  try {
    await (storage as any).initSampleData();
    log("Sample data initialized successfully");
  } catch (error) {
    log(`Error initializing sample data: ${error}`, "error");
  }
  
  const server = await registerRoutes(app);
  
  // We now handle health checks via the healthCheckMiddleware 
  // that's registered at the top of the middleware stack

  // Global error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Log detailed error information
    console.error(`Error processing ${req.method} ${req.path}:`, err);
    
    // Determine appropriate status code
    const status = err.status || err.statusCode || 500;
    
    // Create appropriate error message
    const message = err.message || "Internal Server Error";
    
    // Create response object with appropriate level of detail
    const errorResponse = {
      success: false,
      message,
      // Include error details in development, but not in production
      ...(process.env.NODE_ENV !== 'production' && { 
        error: {
          name: err.name,
          stack: err.stack,
          code: err.code
        }
      }),
      path: req.path,
      timestamp: new Date().toISOString()
    };
    
    // Send error response
    res.status(status).json(errorResponse);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Start background tasks
  async function runBackgroundTasks() {
    try {
      log('Starting background tasks...', 'info');
      
      // Run any scheduled tasks here in sequence
      // Example: await generateContentTask();
      //          await cleanupOldDataTask();
      //          await updateCacheTask();
      
      // Add health check metrics to indicate background tasks are running
      const taskMetrics: BackgroundTaskMetrics = {
        lastRun: new Date().toISOString(),
        status: 'success' as const,
        taskCount: 0 // Update this with actual count when tasks are added
      };
      
      // Store metrics for health check endpoint to access
      (global as any).backgroundTaskMetrics = taskMetrics;
      
      log('Background tasks completed successfully', 'info');
    } catch (error) {
      log(`Error in background tasks: ${error}`, 'error');
      
      // Update metrics even on failure
      if ((global as any).backgroundTaskMetrics) {
        (global as any).backgroundTaskMetrics.status = 'failed';
        (global as any).backgroundTaskMetrics.lastError = String(error);
      }
    }

    // Schedule the next run in 10 minutes
    setTimeout(runBackgroundTasks, 10 * 60 * 1000);
  }

  // Start background tasks and keep the server running
  runBackgroundTasks();

})();
