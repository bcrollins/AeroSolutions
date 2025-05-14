/**
 * RXAI Platform Performance Testing Utility
 * 
 * This utility provides automated tests for measuring and validating platform performance
 * including load times, server response, and handling of concurrent user load.
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'performance-testing' },
  transports: [
    new winston.transports.File({ filename: 'logs/performance-tests.log' }),
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

/**
 * Test page load performance for critical pages
 * @param {number} iterations - Number of times to test each page
 * @returns {Promise<Object>} Test results
 */
async function testPageLoadPerformance(iterations = 5, baseUrl = 'http://localhost:5000') {
  logger.info(`Starting page load performance testing (${iterations} iterations per page)`);
  
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/articles', name: 'Articles' },
    { path: '/news', name: 'News Hub' },
    { path: '/ai-course-platform', name: 'AI Course Platform' }
  ];

  const results = {
    details: {},
    summary: {}
  };

  for (const page of pages) {
    logger.info(`Testing page load performance for: ${page.name} (${page.path})`);
    results.details[page.path] = [];
    
    const loadTimes = [];
    const ttfbTimes = []; // Time to first byte
    
    for (let i = 0; i < iterations; i++) {
      try {
        const start = performance.now();
        const response = await axios({
          method: 'GET',
          url: `${baseUrl}${page.path}`,
          validateStatus: status => status === 200
        });
        const end = performance.now();
        
        const loadTime = end - start;
        loadTimes.push(loadTime);
        
        // Calculate time to first byte if available
        const ttfb = response.headers['x-response-time'] ? 
          parseFloat(response.headers['x-response-time'].replace('ms', '')) : null;
        
        if (ttfb) ttfbTimes.push(ttfb);
        
        results.details[page.path].push({
          iteration: i + 1,
          loadTime,
          ttfb,
          status: response.status,
          contentLength: response.headers['content-length'] || 'N/A'
        });
        
        logger.info(`✓ Iteration ${i + 1} - ${page.name}: Load time: ${loadTime.toFixed(2)}ms, TTFB: ${ttfb ? ttfb.toFixed(2) + 'ms' : 'N/A'}`);
      } catch (error) {
        logger.error(`✗ Iteration ${i + 1} - ${page.name}: Failed - ${error.message}`);
        results.details[page.path].push({
          iteration: i + 1,
          error: error.message,
          failed: true
        });
      }
    }
    
    // Calculate statistics
    if (loadTimes.length > 0) {
      const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
      const minLoadTime = Math.min(...loadTimes);
      const maxLoadTime = Math.max(...loadTimes);
      
      results.summary[page.path] = {
        name: page.name,
        avgLoadTime,
        minLoadTime,
        maxLoadTime,
        meetsTarget: avgLoadTime < 2000, // Target: < 2 seconds
        successRate: (loadTimes.length / iterations) * 100
      };
      
      if (ttfbTimes.length > 0) {
        const avgTtfb = ttfbTimes.reduce((sum, time) => sum + time, 0) / ttfbTimes.length;
        results.summary[page.path].avgTtfb = avgTtfb;
      }
      
      logger.info(`Page statistics for ${page.name}: Avg: ${avgLoadTime.toFixed(2)}ms, Min: ${minLoadTime.toFixed(2)}ms, Max: ${maxLoadTime.toFixed(2)}ms, Target met: ${results.summary[page.path].meetsTarget}`);
    } else {
      results.summary[page.path] = {
        name: page.name,
        failed: true,
        successRate: 0
      };
      logger.error(`All tests failed for ${page.name}`);
    }
  }
  
  // Calculate overall statistics
  const overallAvgLoadTimes = Object.values(results.summary)
    .filter(summary => !summary.failed)
    .map(summary => summary.avgLoadTime);
  
  if (overallAvgLoadTimes.length > 0) {
    results.summary.overall = {
      avgLoadTime: overallAvgLoadTimes.reduce((sum, time) => sum + time, 0) / overallAvgLoadTimes.length,
      targetMet: overallAvgLoadTimes.every(time => time < 2000),
      successRate: Object.values(results.summary)
        .filter(summary => !summary.failed)
        .reduce((sum, summary) => sum + summary.successRate, 0) / pages.length
    };
    
    logger.info(`Overall performance: Avg load time: ${results.summary.overall.avgLoadTime.toFixed(2)}ms, Target met: ${results.summary.overall.targetMet}, Success rate: ${results.summary.overall.successRate.toFixed(2)}%`);
  } else {
    results.summary.overall = {
      failed: true
    };
    logger.error('All performance tests failed');
  }
  
  return results;
}

/**
 * Test API endpoint performance
 * @param {number} iterations - Number of times to test each endpoint
 * @returns {Promise<Object>} Test results
 */
async function testApiPerformance(iterations = 10, baseUrl = 'http://localhost:5000') {
  logger.info(`Starting API performance testing (${iterations} iterations per endpoint)`);
  
  const endpoints = [
    { path: '/api/articles', method: 'GET' },
    { path: '/api/articles/featured', method: 'GET' },
    { path: '/api/courses', method: 'GET' },
    { path: '/api/content/seo-analysis', method: 'GET' }
  ];

  const results = {
    details: {},
    summary: {}
  };

  for (const endpoint of endpoints) {
    const key = `${endpoint.method} ${endpoint.path}`;
    logger.info(`Testing API performance for: ${key}`);
    results.details[key] = [];
    
    const responseTimes = [];
    
    for (let i = 0; i < iterations; i++) {
      try {
        const start = performance.now();
        const response = await axios({
          method: endpoint.method,
          url: `${baseUrl}${endpoint.path}`,
          validateStatus: status => status === 200
        });
        const end = performance.now();
        
        const responseTime = end - start;
        responseTimes.push(responseTime);
        
        results.details[key].push({
          iteration: i + 1,
          responseTime,
          status: response.status,
          contentLength: response.headers['content-length'] || 'N/A'
        });
        
        logger.info(`✓ Iteration ${i + 1} - ${key}: Response time: ${responseTime.toFixed(2)}ms`);
      } catch (error) {
        logger.error(`✗ Iteration ${i + 1} - ${key}: Failed - ${error.message}`);
        results.details[key].push({
          iteration: i + 1,
          error: error.message,
          failed: true
        });
      }
    }
    
    // Calculate statistics
    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);
      
      results.summary[key] = {
        avgResponseTime,
        minResponseTime,
        maxResponseTime,
        meetsTarget: avgResponseTime < 500, // Target: < 500ms for API endpoints
        successRate: (responseTimes.length / iterations) * 100
      };
      
      logger.info(`API statistics for ${key}: Avg: ${avgResponseTime.toFixed(2)}ms, Min: ${minResponseTime.toFixed(2)}ms, Max: ${maxResponseTime.toFixed(2)}ms, Target met: ${results.summary[key].meetsTarget}`);
    } else {
      results.summary[key] = {
        failed: true,
        successRate: 0
      };
      logger.error(`All tests failed for ${key}`);
    }
  }
  
  // Calculate overall API statistics
  const overallAvgResponseTimes = Object.values(results.summary)
    .filter(summary => !summary.failed)
    .map(summary => summary.avgResponseTime);
  
  if (overallAvgResponseTimes.length > 0) {
    results.summary.overall = {
      avgResponseTime: overallAvgResponseTimes.reduce((sum, time) => sum + time, 0) / overallAvgResponseTimes.length,
      targetMet: overallAvgResponseTimes.every(time => time < 500),
      successRate: Object.values(results.summary)
        .filter(summary => !summary.failed)
        .reduce((sum, summary) => sum + summary.successRate, 0) / endpoints.length
    };
    
    logger.info(`Overall API performance: Avg response time: ${results.summary.overall.avgResponseTime.toFixed(2)}ms, Target met: ${results.summary.overall.targetMet}, Success rate: ${results.summary.overall.successRate.toFixed(2)}%`);
  } else {
    results.summary.overall = {
      failed: true
    };
    logger.error('All API performance tests failed');
  }
  
  return results;
}

/**
 * Run all performance tests
 */
async function runAllTests() {
  logger.info('Starting comprehensive performance testing');
  
  const pageLoadResults = await testPageLoadPerformance();
  const apiResults = await testApiPerformance();
  
  const overallResults = {
    pageLoadTests: pageLoadResults,
    apiTests: apiResults,
    summary: {
      avgPageLoadTime: pageLoadResults.summary.overall.avgLoadTime,
      avgApiResponseTime: apiResults.summary.overall.avgResponseTime,
      pageLoadTargetMet: pageLoadResults.summary.overall.targetMet,
      apiTargetMet: apiResults.summary.overall.targetMet,
      overallPerformanceRating: calculatePerformanceRating(pageLoadResults, apiResults)
    }
  };
  
  logger.info(`Performance testing completed.`);
  logger.info(`Page load: Avg ${overallResults.summary.avgPageLoadTime.toFixed(2)}ms, Target met: ${overallResults.summary.pageLoadTargetMet}`);
  logger.info(`API: Avg ${overallResults.summary.avgApiResponseTime.toFixed(2)}ms, Target met: ${overallResults.summary.apiTargetMet}`);
  logger.info(`Overall performance rating: ${overallResults.summary.overallPerformanceRating}/10`);
  
  // Save performance report
  const reportPath = path.join('logs', `performance-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(overallResults, null, 2));
  logger.info(`Performance report saved to ${reportPath}`);
  
  return overallResults;
}

/**
 * Calculate an overall performance rating on a scale of 1-10
 * @param {Object} pageLoadResults - Page load test results
 * @param {Object} apiResults - API test results
 * @returns {number} Performance rating (1-10)
 */
function calculatePerformanceRating(pageLoadResults, apiResults) {
  // Initialize with a perfect score
  let rating = 10;
  
  // Deduct points based on page load performance
  if (pageLoadResults.summary.overall.avgLoadTime > 2000) {
    // Deduct 1 point for every 500ms over 2s (max deduction: 4 points)
    rating -= Math.min(4, Math.floor((pageLoadResults.summary.overall.avgLoadTime - 2000) / 500));
  }
  
  // Deduct points based on API performance
  if (apiResults.summary.overall.avgResponseTime > 500) {
    // Deduct 1 point for every 100ms over 500ms (max deduction: 4 points)
    rating -= Math.min(4, Math.floor((apiResults.summary.overall.avgResponseTime - 500) / 100));
  }
  
  // Deduct points for pages/APIs not meeting targets
  const totalTests = Object.keys(pageLoadResults.summary).length - 1 + Object.keys(apiResults.summary).length - 1;
  const failedTests = Object.values(pageLoadResults.summary)
    .filter(summary => summary !== pageLoadResults.summary.overall && !summary.meetsTarget).length +
    Object.values(apiResults.summary)
    .filter(summary => summary !== apiResults.summary.overall && !summary.meetsTarget).length;
  
  if (failedTests > 0) {
    // Deduct points based on percentage of failed tests (max deduction: 2 points)
    rating -= Math.min(2, Math.ceil((failedTests / totalTests) * 4));
  }
  
  // Ensure rating is within 1-10 range
  return Math.max(1, Math.min(10, rating));
}

// Export testing functions
module.exports = {
  testPageLoadPerformance,
  testApiPerformance,
  runAllTests
};

// Run tests directly if executed as a script
if (require.main === module) {
  runAllTests()
    .then(results => {
      console.log(`Performance testing completed. Overall rating: ${results.summary.overallPerformanceRating}/10`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Performance testing failed:', error);
      process.exit(1);
    });
}