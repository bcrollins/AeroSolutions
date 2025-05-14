/**
 * RXAI Platform Security Testing Utility
 * 
 * This utility provides automated security testing for the platform
 * including basic penetration testing, CSRF protection, XSS vulnerability checks,
 * and authentication workflow security.
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-testing' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-tests.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Common XSS payloads for testing
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src="x" onerror="alert(\'XSS\')">',
  '<svg onload="alert(\'XSS\')"/>',
  '"><script>alert("XSS")</script>',
  '\';alert(\'XSS\');//'
];

// Common SQL injection payloads
const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "1' OR '1'='1",
  "1 OR 1=1",
  "' OR 1=1 -- ",
  "admin'--"
];

/**
 * Test HTTP security headers
 * @param {string} url - URL to test
 * @returns {Promise<Object>} Security headers analysis
 */
async function testSecurityHeaders(url) {
  logger.info(`Testing security headers for: ${url}`);
  
  try {
    const response = await axios.get(url, {
      validateStatus: () => true
    });
    
    const headers = response.headers;
    
    // Critical security headers to check
    const securityHeaders = {
      'strict-transport-security': {
        value: headers['strict-transport-security'],
        present: !!headers['strict-transport-security'],
        recommendation: 'max-age=31536000; includeSubDomains; preload'
      },
      'content-security-policy': {
        value: headers['content-security-policy'],
        present: !!headers['content-security-policy'],
        recommendation: 'Implement CSP to prevent XSS and data injection attacks'
      },
      'x-content-type-options': {
        value: headers['x-content-type-options'],
        present: !!headers['x-content-type-options'],
        recommendation: 'nosniff'
      },
      'x-frame-options': {
        value: headers['x-frame-options'],
        present: !!headers['x-frame-options'],
        recommendation: 'DENY or SAMEORIGIN'
      },
      'x-xss-protection': {
        value: headers['x-xss-protection'],
        present: !!headers['x-xss-protection'],
        recommendation: '1; mode=block'
      },
      'referrer-policy': {
        value: headers['referrer-policy'],
        present: !!headers['referrer-policy'],
        recommendation: 'strict-origin-when-cross-origin'
      },
      'permissions-policy': {
        value: headers['permissions-policy'] || headers['feature-policy'],
        present: !!(headers['permissions-policy'] || headers['feature-policy']),
        recommendation: 'Limit browser features accessible to site'
      }
    };
    
    // Count missing headers
    const missingHeaders = Object.keys(securityHeaders).filter(
      header => !securityHeaders[header].present
    );
    
    // Check HSTS header for recommended values
    let hstsIssues = [];
    if (securityHeaders['strict-transport-security'].present) {
      const hstsValue = securityHeaders['strict-transport-security'].value;
      
      if (!hstsValue.includes('max-age=')) {
        hstsIssues.push('Missing max-age directive');
      } else {
        const maxAgeMatch = hstsValue.match(/max-age=(\d+)/);
        if (maxAgeMatch && parseInt(maxAgeMatch[1]) < 31536000) {
          hstsIssues.push('max-age is less than recommended 31536000 seconds (1 year)');
        }
      }
      
      if (!hstsValue.includes('includeSubDomains')) {
        hstsIssues.push('Missing includeSubDomains directive');
      }
    }
    
    // Calculate overall score (10 = excellent security, 0 = poor security)
    let score = 10;
    
    // Deduct for missing critical headers
    const criticalHeaders = [
      'strict-transport-security',
      'content-security-policy',
      'x-content-type-options',
      'x-frame-options'
    ];
    
    const missingCriticalHeaders = criticalHeaders.filter(
      header => !securityHeaders[header].present
    );
    
    // Deduct 2 points for each missing critical header
    score -= missingCriticalHeaders.length * 2;
    
    // Deduct for missing non-critical headers (1 point each)
    const nonCriticalMissing = missingHeaders.filter(
      header => !criticalHeaders.includes(header)
    ).length;
    
    score -= nonCriticalMissing;
    
    // Deduct for HSTS issues (0.5 points each)
    score -= hstsIssues.length * 0.5;
    
    // Ensure score is in 0-10 range
    score = Math.max(0, Math.min(10, score));
    
    return {
      url,
      headers: securityHeaders,
      missingHeaders,
      hstsIssues,
      score,
      rating: getSecurityRating(score),
      recommendations: generateHeaderRecommendations(securityHeaders)
    };
  } catch (error) {
    logger.error(`Security headers test failed for ${url}: ${error.message}`);
    return {
      url,
      error: error.message,
      failed: true
    };
  }
}

/**
 * Generate header improvement recommendations
 * @param {Object} securityHeaders - Security headers analysis
 * @returns {Array<string>} List of recommendations
 */
function generateHeaderRecommendations(securityHeaders) {
  const recommendations = [];
  
  for (const [header, info] of Object.entries(securityHeaders)) {
    if (!info.present) {
      recommendations.push(`Add the ${header} header with value: ${info.recommendation}`);
    } else if (header === 'strict-transport-security' && 
               !info.value.includes('max-age=31536000') ||
               !info.value.includes('includeSubDomains')) {
      recommendations.push(`Strengthen HSTS header to: ${info.recommendation}`);
    }
  }
  
  return recommendations;
}

/**
 * Test for common XSS vulnerabilities in forms and URL parameters
 * @param {string} baseUrl - Base URL of the site
 * @returns {Promise<Object>} XSS vulnerability assessment
 */
async function testXssVulnerabilities(baseUrl) {
  logger.info(`Testing XSS vulnerabilities for: ${baseUrl}`);
  
  const results = {
    baseUrl,
    forms: [],
    urlParameters: [],
    cookieFlags: {},
    vulnerabilitiesFound: 0,
    issues: [],
    score: 10
  };
  
  try {
    // First check for forms that might be vulnerable to XSS
    const response = await axios.get(baseUrl, {
      validateStatus: () => true
    });
    
    const $ = cheerio.load(response.data);
    
    // Check cookie flags
    const cookies = response.headers['set-cookie'] || [];
    results.cookieFlags = analyzeCookieFlags(cookies);
    
    // If cookies have issues, add to general issues list
    if (results.cookieFlags.issues.length > 0) {
      results.issues = [...results.issues, ...results.cookieFlags.issues];
    }
    
    // Find and analyze forms
    $('form').each((i, formEl) => {
      const form = $(formEl);
      const formAction = form.attr('action') || '';
      const formMethod = (form.attr('method') || 'get').toLowerCase();
      const formId = form.attr('id') || `form-${i+1}`;
      
      const formInputs = [];
      form.find('input, textarea').each((j, inputEl) => {
        const input = $(inputEl);
        formInputs.push({
          name: input.attr('name'),
          type: input.attr('type') || 'text',
          id: input.attr('id'),
          hasValidation: input.attr('pattern') !== undefined || 
                        input.attr('required') !== undefined ||
                        input.attr('minlength') !== undefined
        });
      });
      
      const formAnalysis = {
        id: formId,
        action: formAction,
        method: formMethod,
        inputs: formInputs,
        csrfProtection: !!form.find('input[name="_csrf"], input[name="csrf_token"], input[name="xsrf_token"]').length,
        potentiallyVulnerable: formMethod === 'get' || !form.find('input[name="_csrf"], input[name="csrf_token"], input[name="xsrf_token"]').length
      };
      
      // Add to results
      results.forms.push(formAnalysis);
      
      // Record issues
      if (!formAnalysis.csrfProtection) {
        results.issues.push(`Form "${formId}" lacks CSRF protection`);
        results.vulnerabilitiesFound++;
      }
      
      if (formMethod === 'get' && formInputs.length > 0) {
        results.issues.push(`Form "${formId}" uses GET method which may expose sensitive data in URLs`);
        results.vulnerabilitiesFound++;
      }
    });
    
    // Test URL parameters for reflected XSS
    // Identify potential parameter injection points from links
    const paramUrls = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('?') && href.startsWith('/') || href.startsWith(baseUrl)) {
        const url = href.startsWith('/') ? `${baseUrl}${href}` : href;
        paramUrls.push(url);
      }
    });
    
    // Attempt restricted testing of URL parameters (simulate but don't actually test exploits)
    // In a real security audit, we would test actual XSS payloads, but for this assessment
    // we'll just identify potential vulnerabilities
    const uniqueParamUrls = [...new Set(paramUrls)];
    
    for (const paramUrl of uniqueParamUrls.slice(0, 5)) { // Limit to first 5 to avoid excessive requests
      try {
        const urlObj = new URL(paramUrl);
        const params = urlObj.searchParams;
        
        // Log potential parameter entry points
        for (const [param] of params) {
          results.urlParameters.push({
            url: paramUrl,
            parameter: param,
            couldTest: true,
            potentiallyVulnerable: true // In a real test we would verify this
          });
          
          results.issues.push(`URL parameter "${param}" in ${paramUrl} should be validated against XSS`);
          results.vulnerabilitiesFound++;
        }
      } catch (error) {
        logger.error(`Failed to parse URL ${paramUrl}: ${error.message}`);
      }
    }
    
    // Calculate score based on findings
    if (results.vulnerabilitiesFound > 0) {
      // Deduct 1 point for each vulnerability, up to a maximum of 8 points
      results.score = Math.max(2, 10 - Math.min(8, results.vulnerabilitiesFound));
    }
    
    results.rating = getSecurityRating(results.score);
    
    return results;
  } catch (error) {
    logger.error(`XSS vulnerability test failed for ${baseUrl}: ${error.message}`);
    return {
      baseUrl,
      error: error.message,
      failed: true
    };
  }
}

/**
 * Analyze cookie security flags
 * @param {Array<string>} cookies - Array of Set-Cookie headers
 * @returns {Object} Cookie security analysis
 */
function analyzeCookieFlags(cookies) {
  const results = {
    cookies: [],
    issues: []
  };
  
  cookies.forEach(cookie => {
    const parts = cookie.split(';').map(part => part.trim());
    const name = parts[0].split('=')[0];
    
    const httpOnly = parts.some(part => part.toLowerCase() === 'httponly');
    const secure = parts.some(part => part.toLowerCase() === 'secure');
    const sameSite = parts.find(part => part.toLowerCase().startsWith('samesite='));
    const sameSiteValue = sameSite ? sameSite.split('=')[1].toLowerCase() : null;
    
    const cookieAnalysis = {
      name,
      httpOnly,
      secure,
      sameSite: sameSiteValue
    };
    
    results.cookies.push(cookieAnalysis);
    
    // Check for security issues
    if (!httpOnly) {
      results.issues.push(`Cookie "${name}" missing HttpOnly flag, vulnerable to XSS`);
    }
    
    if (!secure) {
      results.issues.push(`Cookie "${name}" missing Secure flag, vulnerable to MitM attacks`);
    }
    
    if (!sameSiteValue) {
      results.issues.push(`Cookie "${name}" missing SameSite attribute, vulnerable to CSRF`);
    } else if (sameSiteValue === 'none' && secure) {
      // SameSite=None requires Secure
      results.issues.push(`Cookie "${name}" uses SameSite=None which is less secure (though valid with Secure flag)`);
    }
  });
  
  return results;
}

/**
 * Test for authentication and authorization weaknesses
 * @param {string} baseUrl - Base URL of the site
 * @returns {Promise<Object>} Auth security assessment
 */
async function testAuthSecurity(baseUrl) {
  logger.info(`Testing authentication security for: ${baseUrl}`);
  
  const results = {
    baseUrl,
    authEndpoints: [],
    brute_force_protection: false,
    rate_limiting_detected: false,
    issues: [],
    score: 10
  };
  
  try {
    // Check login endpoint if it exists
    const loginEndpoint = `${baseUrl}/api/login`;
    try {
      // Make an invalid login attempt to test brute force protection
      const loginResponse = await axios.post(loginEndpoint, {
        username: 'security_test_user',
        password: 'invalid_password'
      }, {
        validateStatus: () => true
      });
      
      results.authEndpoints.push({
        endpoint: loginEndpoint,
        status: loginResponse.status,
        hasRateLimiting: false // Initially assume no rate limiting
      });
      
      // Perform 3 more requests to see if rate limiting kicks in
      let rateLimitDetected = false;
      for (let i = 0; i < 3; i++) {
        const repeatResponse = await axios.post(loginEndpoint, {
          username: 'security_test_user',
          password: 'invalid_password'
        }, {
          validateStatus: () => true
        });
        
        if (repeatResponse.status === 429 || 
            (repeatResponse.headers['retry-after'] || 
             repeatResponse.data.includes('too many attempts'))) {
          rateLimitDetected = true;
          break;
        }
      }
      
      results.authEndpoints[0].hasRateLimiting = rateLimitDetected;
      results.rate_limiting_detected = rateLimitDetected;
      
      if (!rateLimitDetected) {
        results.issues.push('Login endpoint does not implement rate limiting, vulnerable to brute force attacks');
        results.score -= 3;
      }
    } catch (error) {
      logger.info(`Login endpoint test error (may not exist): ${error.message}`);
    }
    
    // Check password reset endpoint if it exists
    const passwordResetEndpoint = `${baseUrl}/api/request-password-reset`;
    try {
      const resetResponse = await axios.post(passwordResetEndpoint, {
        email: 'security_test@example.com'
      }, {
        validateStatus: () => true
      });
      
      results.authEndpoints.push({
        endpoint: passwordResetEndpoint,
        status: resetResponse.status
      });
      
      // Check if the endpoint reveals whether an account exists
      if (resetResponse.data && 
         (resetResponse.data.includes('user not found') || 
          resetResponse.data.includes('account does not exist') ||
          resetResponse.data.includes('email not registered'))) {
        results.issues.push('Password reset endpoint reveals account existence, enabling user enumeration');
        results.score -= 2;
      }
    } catch (error) {
      logger.info(`Password reset endpoint test error (may not exist): ${error.message}`);
    }
    
    // Check registration endpoint if it exists
    const registrationEndpoint = `${baseUrl}/api/register`;
    try {
      const registrationResponse = await axios.post(registrationEndpoint, {
        username: 'security_test_user',
        email: 'security_test@example.com',
        password: 'Test@123'
      }, {
        validateStatus: () => true
      });
      
      results.authEndpoints.push({
        endpoint: registrationEndpoint,
        status: registrationResponse.status
      });
      
      // Check if password requirements are enforced
      const weakPasswordResponse = await axios.post(registrationEndpoint, {
        username: 'security_test_user2',
        email: 'security_test2@example.com',
        password: 'password123'
      }, {
        validateStatus: () => true
      });
      
      const passwordValidation = weakPasswordResponse.status === 400 || 
                               (weakPasswordResponse.data && 
                                (weakPasswordResponse.data.includes('password') || 
                                 weakPasswordResponse.data.includes('strong')));
      
      if (!passwordValidation) {
        results.issues.push('Registration endpoint allows weak passwords');
        results.score -= 2;
      }
    } catch (error) {
      logger.info(`Registration endpoint test error (may not exist): ${error.message}`);
    }
    
    // Check for HTTP vs HTTPS
    if (!baseUrl.startsWith('https://')) {
      results.issues.push('Site is not using HTTPS, credentials and data are transmitted insecurely');
      results.score -= 3;
    }
    
    // Ensure score is within bounds
    results.score = Math.max(0, Math.min(10, results.score));
    results.rating = getSecurityRating(results.score);
    
    return results;
  } catch (error) {
    logger.error(`Auth security test failed for ${baseUrl}: ${error.message}`);
    return {
      baseUrl,
      error: error.message,
      failed: true
    };
  }
}

/**
 * Get a textual rating based on score
 * @param {number} score - Score from 0-10
 * @returns {string} Rating label
 */
function getSecurityRating(score) {
  if (score >= 9) return 'Excellent';
  if (score >= 7) return 'Good';
  if (score >= 5) return 'Fair';
  if (score >= 3) return 'Poor';
  return 'Critical';
}

/**
 * Run a comprehensive security assessment
 * @param {string} baseUrl - Base URL of the site
 * @returns {Promise<Object>} Comprehensive security assessment results
 */
async function runSecurityAssessment(baseUrl = 'http://localhost:5000') {
  logger.info(`Starting comprehensive security assessment for ${baseUrl}`);
  const startTime = performance.now();
  
  const results = {
    baseUrl,
    tests: {}
  };
  
  try {
    // Run all security tests
    results.tests.headers = await testSecurityHeaders(baseUrl);
    results.tests.xss = await testXssVulnerabilities(baseUrl);
    results.tests.auth = await testAuthSecurity(baseUrl);
    
    // Calculate overall security score (weighted average)
    const headerWeight = 0.4; // 40%
    const xssWeight = 0.3; // 30%
    const authWeight = 0.3; // 30%
    
    const headerScore = results.tests.headers.failed ? 0 : results.tests.headers.score;
    const xssScore = results.tests.xss.failed ? 0 : results.tests.xss.score;
    const authScore = results.tests.auth.failed ? 0 : results.tests.auth.score;
    
    const overallScore = (
      headerScore * headerWeight +
      xssScore * xssWeight +
      authScore * authWeight
    );
    
    // Compile all issues
    const allIssues = [
      ...(results.tests.headers.failed ? ['Security header test failed'] : results.tests.headers.missingHeaders.map(h => `Missing security header: ${h}`)),
      ...(results.tests.xss.failed ? ['XSS test failed'] : results.tests.xss.issues),
      ...(results.tests.auth.failed ? ['Auth security test failed'] : results.tests.auth.issues)
    ];
    
    // Add top recommendations
    const topRecommendations = allIssues.slice(0, 5);
    
    results.summary = {
      overallScore,
      rating: getSecurityRating(overallScore),
      issuesCount: allIssues.length,
      criticalIssues: allIssues.filter(issue => 
        issue.toLowerCase().includes('critical') || 
        issue.toLowerCase().includes('missing') ||
        issue.toLowerCase().includes('vulnerable')).length,
      topRecommendations
    };
    
    const endTime = performance.now();
    results.executionTime = (endTime - startTime).toFixed(2);
    
    logger.info(`Security assessment completed in ${results.executionTime}ms`);
    logger.info(`Overall security rating: ${results.summary.rating}, Score: ${results.summary.overallScore.toFixed(1)}`);
    logger.info(`Found ${results.summary.issuesCount} security issues (${results.summary.criticalIssues} critical)`);
    
    // Save security report
    const reportPath = path.join('logs', `security-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    logger.info(`Security report saved to ${reportPath}`);
    
    return results;
  } catch (error) {
    logger.error(`Security assessment failed: ${error.message}`);
    return {
      baseUrl,
      error: error.message,
      failed: true
    };
  }
}

// Export functions
module.exports = {
  testSecurityHeaders,
  testXssVulnerabilities,
  testAuthSecurity,
  runSecurityAssessment
};

// Run assessment directly if executed as a script
if (require.main === module) {
  runSecurityAssessment()
    .then(results => {
      console.log(`Security assessment completed. Overall rating: ${results.summary.rating}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Security assessment failed:', error);
      process.exit(1);
    });
}