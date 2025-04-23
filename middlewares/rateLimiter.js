/**
 * Rate Limiter Middleware
 * 
 * Middleware to prevent abuse of API by limiting requests per client
 */

// Store client request data in memory
const clients = new Map();

// Configuration
const WINDOW_MS = 60000; // 1 minute window
const MAX_REQUESTS = 30; // 30 requests per minute
const MAX_REQUESTS_OPENAI = 10; // 10 OpenAI requests per minute

/**
 * Check if client exceeds rate limit
 * @param {string} ip - Client IP address
 * @param {number} maxRequests - Maximum requests allowed in window
 * @returns {boolean} True if allowed, false if limit exceeded
 */
const checkRateLimit = (ip, maxRequests) => {
  const now = Date.now();
  const client = clients.get(ip);
  
  // Create new client entry if not exists or reset if window expired
  if (!client || now > client.resetTime) {
    clients.set(ip, { 
      count: 1, 
      resetTime: now + WINDOW_MS 
    });
    return true;
  }
  
  // Increment request count
  client.count++;
  
  // Check if exceeded limit
  if (client.count > maxRequests) {
    return false;
  }
  
  return true;
};

/**
 * Rate limiter middleware for general API requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const rateLimiterMiddleware = (req, res, next) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  
  if (!checkRateLimit(clientIp, MAX_REQUESTS)) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retry_after: Math.ceil((clients.get(clientIp)?.resetTime || 0) - Date.now()) / 1000
    });
  }
  
  next();
};

/**
 * Rate limiter middleware for OpenAI API requests
 * Applies stricter limits for AI-based endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const openaiRateLimiterMiddleware = (req, res, next) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  
  if (!checkRateLimit(clientIp, MAX_REQUESTS_OPENAI)) {
    return res.status(429).json({
      success: false,
      message: 'Too many AI requests, please try again later',
      retry_after: Math.ceil((clients.get(clientIp)?.resetTime || 0) - Date.now()) / 1000
    });
  }
  
  next();
};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Array.from(clients.entries()).forEach(([ip, client]) => {
    if (now > client.resetTime) {
      clients.delete(ip);
    }
  });
}, 5 * 60 * 1000);

// Use the general rate limiter by default
module.exports = rateLimiterMiddleware;

// Export both middlewares for specific use cases
module.exports.general = rateLimiterMiddleware;
module.exports.openai = openaiRateLimiterMiddleware;