/**
 * Logger Configuration
 * 
 * This module configures and exports a Winston logger instance.
 * It provides standardized logging with structured output.
 */

const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: errorLogPath, 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: combinedLogPath,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console output in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}] ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
      })
    )
  }));
}

/**
 * Function to anonymize potentially sensitive data like IP addresses
 * 
 * @param {string} value - The value to anonymize
 * @returns {string} - The anonymized value
 */
function anonymize(value) {
  if (!value) return 'unknown';
  
  if (typeof value === 'string') {
    // For IPv4
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(value)) {
      const parts = value.split('.');
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    
    // For IPv6 (simplified approach)
    if (value.includes(':')) {
      return value.split(':').slice(0, 3).join(':') + ':xxxx:xxxx:xxxx:xxxx';
    }
  }
  
  return value;
}

// Add anonymization function to logger
logger.anonymize = anonymize;

module.exports = logger;