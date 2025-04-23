/**
 * Request Logger Middleware
 * 
 * Logs HTTP requests and responses for monitoring and debugging
 */

const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique request ID
 * @returns {string} - UUID
 */
function generateRequestId() {
  return uuidv4();
}

/**
 * Request logger middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware
 */
function requestLogger(req, res, next) {
  // Generate a unique request ID
  req.id = generateRequestId();

  // Log the request
  const startTime = Date.now();
  const requestBody = req.method !== 'GET' && req.body ? maskSensitiveData(req.body) : undefined;
  
  logger.info(`Request ${req.method} ${req.originalUrl}`, {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    body: requestBody
  });

  // Capture the response data
  const originalSend = res.send;
  res.send = function(body) {
    res.send = originalSend;
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    const responseBodySize = body ? body.length : 0;
    
    // Add request ID to response headers
    res.set('X-Request-ID', req.id);
    
    // Log the response
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`Response ${res.statusCode} in ${responseTime}ms`, {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      responseSize: responseBodySize
    });
    
    // Send the original response
    return originalSend.call(this, body);
  };
  
  next();
}

/**
 * Mask sensitive data in request body
 * @param {Object} body - Request body
 * @returns {Object} - Masked request body
 */
function maskSensitiveData(body) {
  // Create a deep copy of the body
  const maskedBody = JSON.parse(JSON.stringify(body));
  
  // List of fields to mask
  const sensitiveFields = [
    'password', 'passwordConfirmation', 'oldPassword', 'newPassword',
    'token', 'apiKey', 'api_key', 'secret', 'email', 'apiSecret', 'api_secret',
    'clientSecret', 'client_secret', 'accessToken', 'access_token',
    'refreshToken', 'refresh_token', 'idToken', 'id_token',
    'cardNumber', 'card_number', 'cvv', 'cvc', 'creditCard', 'credit_card',
    'ssn', 'socialSecurity'
  ];
  
  // Recursive function to mask sensitive fields
  function maskRecursive(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
        obj[key] = '******';
      } else if (typeof obj[key] === 'object') {
        maskRecursive(obj[key]);
      }
    });
  }
  
  maskRecursive(maskedBody);
  return maskedBody;
}

module.exports = requestLogger;