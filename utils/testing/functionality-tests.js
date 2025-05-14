/**
 * RXAI Platform Functionality Testing Utility
 * 
 * This utility provides automated tests for critical platform functionality
 * including navigation, content rendering, and interactive features.
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'functionality-testing' },
  transports: [
    new winston.transports.File({ filename: 'logs/functionality-tests.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Test critical endpoints to ensure they return proper responses
 * @returns {Promise<Object>} Test results
 */
async function testEndpoints(baseUrl = 'http://localhost:5000') {
  logger.info('Starting endpoint testing');
  const startTime = performance.now();
  const endpoints = [
    { path: '/api/auth/user', method: 'GET', expectedStatus: [200, 401] }, // May return 401 if not authenticated
    { path: '/api/ab-tests/active', method: 'GET', expectedStatus: [200] },
    { path: '/api/content/seo-analysis', method: 'GET', expectedStatus: [200] },
    { path: '/api/articles', method: 'GET', expectedStatus: [200] },
    { path: '/api/articles/featured', method: 'GET', expectedStatus: [200] },
    { path: '/api/courses', method: 'GET', expectedStatus: [200] }
  ];

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${baseUrl}${endpoint.path}`,
        validateStatus: status => true // Don't throw on any status
      });

      const isPassed = endpoint.expectedStatus.includes(response.status);
      
      results.details.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        expected: endpoint.expectedStatus,
        actual: response.status,
        passed: isPassed,
        responseTime: response.headers['x-response-time'] || 'N/A'
      });

      if (isPassed) {
        results.passed++;
        logger.info(`✓ Endpoint test passed: ${endpoint.method} ${endpoint.path}`);
      } else {
        results.failed++;
        logger.error(`✗ Endpoint test failed: ${endpoint.method} ${endpoint.path} - Expected: ${endpoint.expectedStatus.join(' or ')}, Got: ${response.status}`);
      }
    } catch (error) {
      results.failed++;
      results.details.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        expected: endpoint.expectedStatus,
        error: error.message,
        passed: false
      });
      logger.error(`✗ Endpoint test error: ${endpoint.method} ${endpoint.path} - ${error.message}`);
    }
  }

  const endTime = performance.now();
  results.totalTime = (endTime - startTime).toFixed(2);
  logger.info(`Endpoint testing completed in ${results.totalTime}ms. Passed: ${results.passed}, Failed: ${results.failed}`);
  
  return results;
}

/**
 * Test page rendering and critical UI components
 * @returns {Promise<Object>} Test results
 */
async function testPageRendering(baseUrl = 'http://localhost:5000') {
  logger.info('Starting page rendering tests');
  const startTime = performance.now();
  
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/articles', name: 'Articles' },
    { path: '/news', name: 'News Hub' },
    { path: '/ai-course-platform', name: 'AI Course Platform' },
    { path: '/digital-tools', name: 'Digital Tools' }
  ];

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  for (const page of pages) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${baseUrl}${page.path}`,
        validateStatus: status => true
      });

      const isPassed = response.status === 200;
      
      results.details.push({
        page: page.name,
        path: page.path,
        status: response.status,
        passed: isPassed,
        responseTime: response.headers['x-response-time'] || 'N/A'
      });

      if (isPassed) {
        results.passed++;
        logger.info(`✓ Page test passed: ${page.name} (${page.path})`);
      } else {
        results.failed++;
        logger.error(`✗ Page test failed: ${page.name} (${page.path}) - Status: ${response.status}`);
      }
    } catch (error) {
      results.failed++;
      results.details.push({
        page: page.name,
        path: page.path,
        error: error.message,
        passed: false
      });
      logger.error(`✗ Page test error: ${page.name} (${page.path}) - ${error.message}`);
    }
  }

  const endTime = performance.now();
  results.totalTime = (endTime - startTime).toFixed(2);
  logger.info(`Page rendering tests completed in ${results.totalTime}ms. Passed: ${results.passed}, Failed: ${results.failed}`);
  
  return results;
}

/**
 * Run all functionality tests
 */
async function runAllTests() {
  logger.info('Starting comprehensive functionality testing');
  
  const endpointResults = await testEndpoints();
  const renderingResults = await testPageRendering();
  
  const overallResults = {
    endpointTests: endpointResults,
    renderingTests: renderingResults,
    summary: {
      totalTests: endpointResults.passed + endpointResults.failed + renderingResults.passed + renderingResults.failed,
      totalPassed: endpointResults.passed + renderingResults.passed,
      totalFailed: endpointResults.failed + renderingResults.failed,
      passRate: ((endpointResults.passed + renderingResults.passed) / 
                (endpointResults.passed + endpointResults.failed + renderingResults.passed + renderingResults.failed) * 100).toFixed(2)
    }
  };
  
  logger.info(`Functionality testing completed. Overall pass rate: ${overallResults.summary.passRate}%`);
  logger.info(`Total tests: ${overallResults.summary.totalTests}, Passed: ${overallResults.summary.totalPassed}, Failed: ${overallResults.summary.totalFailed}`);
  
  return overallResults;
}

// Export testing functions
module.exports = {
  testEndpoints,
  testPageRendering,
  runAllTests
};

// Run tests directly if executed as a script
if (require.main === module) {
  runAllTests()
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
      process.exit(results.summary.totalFailed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Testing failed:', error);
      process.exit(1);
    });
}