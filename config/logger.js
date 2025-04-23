/**
 * Logging Configuration
 * 
 * This module configures a Winston logger with appropriate transports and formats
 * for structured logging across the application.
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

// Add colors to Winston
winston.addColors(logColors);

// Environment-based logging level
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message}${metaString ? `\n${metaString}` : ''}`;
  })
);

// Format for file logging
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Create the Winston logger
const logger = winston.createLogger({
  level,
  levels: logLevels,
  format: fileFormat,
  transports: [
    // Console transport for all logs
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  exitOnError: false
});

// Specialized HTTP request logger method
logger.httpRequest = (req, res, duration) => {
  const { method, originalUrl, ip, headers } = req;
  const userAgent = headers['user-agent'];
  const statusCode = res.statusCode;
  
  const logLevel = statusCode >= 500 ? 'error' : 
                   statusCode >= 400 ? 'warn' : 
                   'http';
  
  logger.log(logLevel, `${method} ${originalUrl} ${statusCode} ${duration}ms`, {
    method,
    url: originalUrl,
    status: statusCode,
    responseTime: duration,
    ip,
    userAgent
  });
};

// Export the logger
module.exports = logger;