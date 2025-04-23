/**
 * Logger Configuration
 * 
 * This module configures and exports a Winston logger instance.
 * It provides standardized logging with structured output.
 */

const winston = require('winston');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

// Custom log format with timestamps, log level, and structured data
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

// Create and configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'api-server' },
  transports: [
    // Console logger - colorized for better readability
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // Error log file - only log error level and above
    new winston.transports.File({
      filename: errorLogPath,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file - log all levels
    new winston.transports.File({
      filename: combinedLogPath,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Don't exit on uncaught exceptions
  exitOnError: false
});

/**
 * Function to anonymize potentially sensitive data like IP addresses
 * 
 * @param {string} value - The value to anonymize
 * @returns {string} - The anonymized value
 */
logger.anonymize = function(value) {
  if (!value) return 'unknown';
  
  // If it's an IP address, hash the last part
  if (value.includes('.')) {
    // IPv4 address
    const parts = value.split('.');
    if (parts.length === 4) {
      // Only hash the last octet
      parts[3] = crypto.createHash('sha256').update(parts[3]).digest('hex').substring(0, 8);
      return parts.join('.');
    }
  } else if (value.includes(':')) {
    // IPv6 address - hash last 64 bits
    const parts = value.split(':');
    if (parts.length > 4) {
      // Anonymize the last 4 segments
      for (let i = 4; i < parts.length; i++) {
        if (parts[i]) {
          parts[i] = crypto.createHash('sha256').update(parts[i]).digest('hex').substring(0, 4);
        }
      }
      return parts.join(':');
    }
  }
  
  // For other values, hash the whole thing and take first 8 chars
  return crypto.createHash('sha256').update(value).digest('hex').substring(0, 8);
};

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason.toString(),
    stack: reason.stack || 'No stack trace available'
  });
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack || 'No stack trace available'
  });
  
  // Give logger time to write to files before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = logger;