/**
 * Logger Utility
 * 
 * This module provides a centralized logging system using winston.
 * It supports different log levels and formats.
 */

import winston from 'winston';

// Define log formats
const formats = {
  console: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...meta } = info;
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`;
    })
  ),
  file: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
};

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: formats.console,
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: formats.file,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: formats.file,
    }),
  ],
});

// Export Winston for direct usage
export { winston };