/**
 * Logger Configuration
 * 
 * Winston logger configuration for application-wide logging
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

// Configure winston format
const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...rest }) => {
  let logMessage = `${timestamp} [${level}]: ${message}`;
  
  // Add additional metadata if present
  if (Object.keys(rest).length > 0) {
    logMessage += ` ${JSON.stringify(rest)}`;
  }
  
  return logMessage;
});

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    // Write errors to error.log
    new winston.transports.File({ 
      filename: errorLogPath, 
      level: 'error',
      maxFiles: 5,
      maxsize: 5242880 // 5MB
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: combinedLogPath,
      maxFiles: 5,
      maxsize: 5242880 // 5MB
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'exceptions.log'),
      maxFiles: 5,
      maxsize: 5242880 // 5MB
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'rejections.log'),
      maxFiles: 5,
      maxsize: 5242880 // 5MB
    })
  ]
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp(),
      logFormat
    )
  }));
}

module.exports = logger;