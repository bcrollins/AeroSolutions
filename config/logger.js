/**
 * Logger Configuration
 * 
 * Winston logger configuration for application-wide logging
 */

const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log formats
const formats = [
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(...formats),
  defaultMeta: { service: 'api-platform' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
  ],
  // Prevent winston from exiting on uncaught exceptions
  exitOnError: false
});

// Add console transport in development environment
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(info => {
        const { timestamp, level, message, ...rest } = info;
        return `${timestamp} [${level}]: ${message} ${Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''}`;
      })
    ),
  }));
}

/**
 * Log an API request
 * @param {Object} req - Express request object
 * @param {number} responseTime - Response time in milliseconds
 */
logger.logApiRequest = (req, responseTime) => {
  const { method, originalUrl, ip } = req;
  logger.info('API Request', {
    method,
    url: originalUrl,
    ip,
    responseTime,
    userAgent: req.get('user-agent')
  });
};

/**
 * Log an API error
 * @param {Object} req - Express request object
 * @param {Error} error - Error object
 */
logger.logApiError = (req, error) => {
  const { method, originalUrl, ip } = req;
  logger.error('API Error', {
    method,
    url: originalUrl,
    ip,
    errorMessage: error.message,
    errorStack: error.stack
  });
};

/**
 * Log a database query (redacted for security)
 * @param {string} query - SQL query text (method name for ORM)
 * @param {number} responseTime - Response time in milliseconds
 */
logger.logDatabaseQuery = (query, responseTime) => {
  logger.debug('Database Query', {
    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    responseTime
  });
};

/**
 * Log an OpenAI API request (redacted for security)
 * @param {string} model - The model name
 * @param {number} tokens - Number of tokens used
 */
logger.logOpenAiRequest = (model, tokens) => {
  logger.info('OpenAI API Request', {
    model,
    tokens
  });
};

/**
 * Log security events
 * @param {string} event - Security event type
 * @param {Object} details - Event details
 */
logger.logSecurityEvent = (event, details) => {
  logger.warn('Security Event', {
    event,
    ...details
  });
};

module.exports = logger;