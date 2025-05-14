/**
 * Enhanced Security Headers Middleware
 * 
 * This middleware adds important security headers to all responses
 * to protect against common web vulnerabilities and improve security posture.
 * It extends the basic Helmet configuration to provide more granular control.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Adds enhanced security headers to HTTP responses
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export function enhancedSecurityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // HTTP Strict Transport Security
  // Tells browsers to prefer HTTPS over HTTP
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // X-Content-Type-Options
  // Prevents browsers from MIME-sniffing (interpreting the response as a different content-type)
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  // Prevents your page from being placed in an iframe on another domain (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  // Enables the built-in XSS filter in most browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  // Controls how much referrer information is included with requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy (formerly Feature-Policy)
  // Limits which browser features and APIs can be used
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );

  // Custom Content-Security-Policy beyond what Helmet provides
  // Only set if not already set by Helmet
  if (!res.getHeader('Content-Security-Policy')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com; connect-src 'self' https://api.stripe.com https://api.x.ai https://api.openai.com wss: ws:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-src 'self' https://js.stripe.com; object-src 'none'"
    );
  }

  // Cache-Control
  // Don't add cache control headers for API routes as they need specific caching rules
  if (!req.path.startsWith('/api/')) {
    // Reasonable caching for static assets
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    } else if (!res.getHeader('Cache-Control')) {
      // For HTML and other content, only set if not already set
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }

  next();
}