/**
 * Logger Configuration
 * 
 * Winston logger configuration for application-wide logging
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');
const apiLogPath = path.join(logsDir, 'api.log');
const openaiLogPath = path.join(logsDir, 'openai.log');
const databaseLogPath = path.join(logsDir, 'database.log');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configure transports based on environment
const transports = [
  // Always log errors to a file
  new winston.transports.File({
    filename: errorLogPath,
    level: 'error',
    format: logFormat,
  }),
  
  // Always log to combined log file
  new winston.transports.File({
    filename: combinedLogPath,
    format: logFormat,
  }),
  
  // API-specific log file
  new winston.transports.File({
    filename: apiLogPath,
    format: logFormat,
  }),
  
  // OpenAI-specific log file
  new winston.transports.File({
    filename: openaiLogPath,
    format: logFormat,
  }),
  
  // Database-specific log file
  new winston.transports.File({
    filename: databaseLogPath,
    format: logFormat,
  }),
];

// In development, also log to console with colorization
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'debug',
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'api-platform' },
  format: logFormat,
  transports,
});

// Log API error with request details
logger.logApiError = (req, error) => {
  logger.error('API Error', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: req.body,
    error: {
      message: error.message,
      stack: error.stack,
      status: error.statusCode || 500,
    },
  });
};

// Log OpenAI request and response
logger.logOpenAIRequest = (type, data, status) => {
  const logObject = {
    type,
    status,
    ...data,
  };
  
  if (status === 'error') {
    logger.error('OpenAI API Error', logObject);
  } else {
    logger.info('OpenAI API Request', logObject);
  }
};

// Log database error
logger.logDatabaseError = (operation, error, details) => {
  logger.error('Database Error', {
    operation,
    details,
    error: {
      message: error.message,
      code: error.code,
      stack: error.stack,
    },
  });
};

// Export the logger
module.exports = logger;