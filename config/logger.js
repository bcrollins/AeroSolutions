/**
 * Logger Configuration
 * 
 * Winston logger configuration for application-wide logging
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log formats
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { service: 'api-platform' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development environment
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Helper methods for common logging patterns
logger.logApiError = (req, err) => {
  logger.error(`API Error: ${err.message}`, {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
      name: err.name,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });
};

logger.logSecurityEvent = (event, details) => {
  logger.warn(`Security Event: ${event}`, {
    securityEvent: event,
    details,
    timestamp: new Date().toISOString(),
  });
};

logger.logDatabaseError = (operation, error, details) => {
  logger.error(`Database Error: ${operation}`, {
    operation,
    error: {
      message: error.message,
      code: error.code,
      stack: error.stack,
    },
    details,
  });
};

logger.logOpenAIRequest = (endpoint, params, status) => {
  // Don't log full prompt/response content in production to reduce log size and avoid sensitive data
  const sanitizedParams = process.env.NODE_ENV === 'production'
    ? { ...params, prompt: params.prompt ? `${params.prompt.substring(0, 50)}...` : undefined }
    : params;
    
  logger.info(`OpenAI Request: ${endpoint}`, {
    openai: {
      endpoint,
      params: sanitizedParams,
      status,
    },
  });
};

module.exports = logger;