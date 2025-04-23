/**
 * Logger Configuration
 * 
 * This module configures and exports a Winston logger instance.
 * It provides standardized logging with structured output.
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

/**
 * Function to anonymize potentially sensitive data like IP addresses
 * 
 * @param {string} value - The value to anonymize
 * @returns {string} - The anonymized value
 */
function anonymize(value) {
  if (!value) return value;
  
  // Handle IP addresses
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    // IPv4 - keep first half, anonymize second half
    const parts = value.split('.');
    return `${parts[0]}.${parts[1]}.*.*`;
  } 
  
  if (value.includes(':') && value.includes('.')) {
    // IPv6 with embedded IPv4
    return value.replace(/(\d{1,3}\.){3}\d{1,3}/, '*.*.*.*)');
  }
  
  if (value.includes(':')) {
    // IPv6 - keep first half, anonymize second half
    const parts = value.split(':');
    const visible = parts.slice(0, 4).join(':');
    return `${visible}:****:****`;
  }
  
  // For other values, show only 40% of the string
  const visibleLength = Math.floor(value.length * 0.4);
  return value.substring(0, visibleLength) + '*'.repeat(value.length - visibleLength);
}

// Custom format for log output
const customFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create Winston logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'api-server' },
  transports: [
    // Console output with color coding
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(info => {
          const { timestamp, level, message, ...rest } = info;
          let logMessage = `${timestamp} ${level}: ${message}`;
          
          // Add additional metadata if present, but exclude large properties
          const metadata = { ...rest };
          delete metadata.service; // Already included above
          delete metadata.stack; // Too verbose for console
          
          if (Object.keys(metadata).length > 0) {
            logMessage += ` ${JSON.stringify(metadata)}`;
          }
          
          // Add stack trace for errors, if available
          if (info.stack) {
            logMessage += `\n${info.stack}`;
          }
          
          return logMessage;
        })
      )
    }),
    
    // Write logs to files, splitting errors and combined logs
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add method to get express-winston middleware if needed
logger.getExpressMiddleware = () => {
  const expressWinston = require('express-winston');
  return expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: true
  });
};

// Expose the anonymize function
logger.anonymize = anonymize;

module.exports = logger;