/**
 * Logger Configuration
 * 
 * This module configures the application logging system using Winston.
 * It provides a centralized logging setup with different log levels,
 * formats, and transports.
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format (more readable for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...rest }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    // Add additional metadata if present
    if (Object.keys(rest).length > 0) {
      // Filter out sensitive info
      const sanitized = { ...rest };
      if (sanitized.stack) delete sanitized.stack;
      if (Object.keys(sanitized).length > 0) {
        logMessage += ` ${JSON.stringify(sanitized)}`;
      }
    }
    
    return logMessage;
  })
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'api-server' },
  transports: [
    // Write to all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Console output with prettier format
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

/**
 * Anonymize sensitive data like IP addresses for privacy
 * @param {string} ip - IP address to anonymize
 * @returns {string} - Anonymized IP address
 */
logger.anonymize = function(ip) {
  if (!ip) return 'unknown';
  
  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  
  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return `${parts[0]}:${parts[1]}:xxxx:xxxx:xxxx:xxxx`;
  }
  
  return 'unknown';
};

// Export the logger
module.exports = logger;