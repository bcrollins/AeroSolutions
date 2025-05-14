/**
 * RXAI Platform Load Testing Utility
 * 
 * This utility provides load testing capabilities to ensure the platform
 * can handle the required traffic volume and concurrent users.
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'load-testing' },
  transports: [
    new winston.transports.File({ filename: 'logs/load-tests.log' }),
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

// Create HTTP agents with keep-alive for better performance
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

/**
 * Simulate a single user session
 * @param {string} baseUrl - Base URL of the site
 * @param {number} userId - Unique user ID for this session
 * @returns {Promise<Object>} Session results
 */
async function simulateUserSession(baseUrl, userId) {
  const sessionId = `user-${userId}`;
  const startTime = performance.now();
  
  const results = {
    userId,
    sessionId,
    requests: [],
    errors: [],
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    sessionDuration: 0
  };
  
  // Define sequence of pages to visit in this session
  const pageSequence = [
    { path: '/', name: 'Home' },
    { path: '/articles', name: 'Articles' },
    { path: '/ai-course-platform', name: 'AI Course Platform' },
    { path: '/news', name: 'News Hub' },
    { path: '/digital-tools', name: 'Digital Tools' }
  ];
  
  // Add some API endpoints to request
  const apiEndpoints = [
    { path: '/api/articles/featured', name: 'Featured Articles API' },
    { path: '/api/content/seo-analysis', name: 'SEO Analysis API' }
  ];
  
  // Randomly select 1-2 API endpoints to call
  const selectedApiEndpoints = apiEndpoints.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
  
  // Combined list of requests to make
  const requests = [...pageSequence, ...selectedApiEndpoints];
  
  // Create axios instance with keep-alive
  const agent = baseUrl.startsWith('https') ? httpsAgent : httpAgent;
  const apiClient = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    httpAgent: agent,
    httpsAgent: agent
  });
  
  // Execute each request in sequence
  for (const request of requests) {
    try {
      results.totalRequests++;
      
      const requestStartTime = performance.now();
      const response = await apiClient.get(request.path, {
        validateStatus: () => true, // Don't throw on error status codes
        headers: {
          'X-Load-Test': sessionId,
          'User-Agent': `RXAI-LoadTest/${sessionId}`
        }
      });
      const requestEndTime = performance.now();
      
      const requestDuration = requestEndTime - requestStartTime;
      const success = response.status >= 200 && response.status < 400;
      
      if (success) {
        results.successfulRequests++;
      } else {
        results.failedRequests++;
      }
      
      results.requests.push({
        path: request.path,
        name: request.name,
        status: response.status,
        duration: requestDuration,
        contentLength: response.headers['content-length'],
        success
      });
      
      // Add small random delay between requests (50-300ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 250 + 50));
    } catch (error) {
      results.totalRequests++;
      results.failedRequests++;
      results.errors.push({
        path: request.path,
        name: request.name,
        error: error.message
      });
      
      logger.error(`User ${sessionId} error on ${request.path}: ${error.message}`);
    }
  }
  
  const endTime = performance.now();
  results.sessionDuration = endTime - startTime;
  
  return results;
}

/**
 * Run a load test with multiple concurrent users
 * @param {Object} options - Load test options
 * @returns {Promise<Object>} Load test results
 */
async function runLoadTest(options = {}) {
  const defaultOptions = {
    baseUrl: 'http://localhost:5000',
    concurrentUsers: 20,            // Number of users to simulate concurrently
    rampUpTime: 5000,               // Time in ms to ramp up to full user load
    testDuration: 30000,            // Total test duration in ms
    targetRps: 10,                  // Target requests per second
    maxUsers: 100                   // Maximum users to simulate
  };
  
  const testOptions = { ...defaultOptions, ...options };
  
  logger.info(`Starting load test with ${testOptions.concurrentUsers} concurrent users`);
  logger.info(`Target RPS: ${testOptions.targetRps}, Test duration: ${testOptions.testDuration / 1000}s`);
  
  const startTime = performance.now();
  
  const results = {
    options: testOptions,
    sessions: [],
    summary: {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      errorRate: 0,
      avgResponseTime: 0,
      peakResponseTime: 0,
      p95ResponseTime: 0,
      rps: 0,
      testDuration: 0
    }
  };
  
  // Create and run user sessions
  const userSessions = [];
  
  // Function to start a user session
  const startUserSession = async (userId) => {
    const sessionResult = await simulateUserSession(testOptions.baseUrl, userId);
    results.sessions.push(sessionResult);
    return sessionResult;
  };
  
  // Calculate delay between adding users to achieve ramp-up
  const userStartDelay = testOptions.rampUpTime / testOptions.concurrentUsers;
  
  // Start initial users with staggered delays
  for (let i = 0; i < testOptions.concurrentUsers; i++) {
    const delay = i * userStartDelay;
    userSessions.push(
      new Promise(resolve => {
        setTimeout(async () => {
          const result = await startUserSession(i + 1);
          resolve(result);
        }, delay);
      })
    );
  }
  
  // Wait for all sessions to complete
  await Promise.all(userSessions);
  
  const endTime = performance.now();
  const actualTestDuration = endTime - startTime;
  
  // Calculate summary metrics
  const responseTimes = results.sessions.flatMap(session => 
    session.requests.map(req => req.duration)
  );
  
  results.summary.totalRequests = results.sessions.reduce((sum, session) => sum + session.totalRequests, 0);
  results.summary.successfulRequests = results.sessions.reduce((sum, session) => sum + session.successfulRequests, 0);
  results.summary.failedRequests = results.sessions.reduce((sum, session) => sum + session.failedRequests, 0);
  results.summary.errorRate = results.summary.failedRequests / results.summary.totalRequests;
  results.summary.rps = results.summary.totalRequests / (actualTestDuration / 1000);
  results.summary.testDuration = actualTestDuration;
  
  if (responseTimes.length > 0) {
    results.summary.avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    results.summary.peakResponseTime = Math.max(...responseTimes);
    
    // Calculate p95 (95th percentile) response time
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    results.summary.p95ResponseTime = sortedTimes[p95Index];
  }
  
  // Analyze if the system can handle the required load
  // Calculate estimated capacity based on current performance
  const estimatedCapacity = {
    estimatedMaxRps: results.summary.rps * (1 / (results.summary.avgResponseTime / 1000)),
    estimatedMaxConcurrentUsers: Math.round(testOptions.concurrentUsers * (1000 / results.summary.avgResponseTime)),
    canHandle20kRenewals: false,
    projectedPerformance: {}
  };
  
  // Simulate 20k renewals per hour (5.56 RPS)
  const targetRpsFor20k = 5.56;
  
  // Calculate performance projections
  if (results.summary.avgResponseTime > 0) {
    estimatedCapacity.projectedPerformance = {
      at100Users: {
        estimatedRps: 100 / (results.summary.avgResponseTime / 1000),
        estimatedResponseTime: results.summary.avgResponseTime
      },
      at500Users: {
        estimatedRps: 500 / (results.summary.avgResponseTime / 1000),
        estimatedResponseTime: results.summary.avgResponseTime * (500 / testOptions.concurrentUsers)
      },
      at1000Users: {
        estimatedRps: 1000 / (results.summary.avgResponseTime / 1000),
        estimatedResponseTime: results.summary.avgResponseTime * (1000 / testOptions.concurrentUsers)
      }
    };
    
    // Check if system can handle 20k renewals/hour
    estimatedCapacity.canHandle20kRenewals = 
      estimatedCapacity.estimatedMaxRps >= targetRpsFor20k && 
      results.summary.errorRate < 0.01;  // Error rate below 1%
  }
  
  results.capacity = estimatedCapacity;
  
  // Log results
  logger.info(`Load test completed in ${actualTestDuration.toFixed(2)}ms`);
  logger.info(`Achieved RPS: ${results.summary.rps.toFixed(2)}, Target: ${testOptions.targetRps}`);
  logger.info(`Avg response time: ${results.summary.avgResponseTime.toFixed(2)}ms, P95: ${results.summary.p95ResponseTime.toFixed(2)}ms`);
  logger.info(`Success rate: ${((1 - results.summary.errorRate) * 100).toFixed(2)}%`);
  logger.info(`Estimated capacity: ${estimatedCapacity.estimatedMaxConcurrentUsers} concurrent users`);
  logger.info(`Can handle 20k renewals per hour: ${estimatedCapacity.canHandle20kRenewals}`);
  
  // Save load test report
  const reportPath = path.join('logs', `load-test-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  logger.info(`Load test report saved to ${reportPath}`);
  
  return results;
}

/**
 * Run a scalability test to determine maximum capacity
 * @param {Object} options - Scalability test options
 * @returns {Promise<Object>} Scalability test results
 */
async function runScalabilityTest(options = {}) {
  const defaultOptions = {
    baseUrl: 'http://localhost:5000',
    startUsers: 10,           // Starting number of concurrent users
    maxUsers: 200,            // Maximum number of concurrent users to test
    incrementUsers: 10,       // How many users to add per step
    stepDuration: 15000,      // Duration of each step in ms
    targetRps: null,          // Target RPS (optional)
    maxAcceptableErrorRate: 0.05,  // 5% max acceptable error rate
    maxAcceptableResponseTime: 2000 // 2000ms max acceptable response time
  };
  
  const testOptions = { ...defaultOptions, ...options };
  
  logger.info(`Starting scalability test from ${testOptions.startUsers} to ${testOptions.maxUsers} users`);
  
  const results = {
    options: testOptions,
    steps: [],
    summary: {
      maxUsers: 0,
      maxRps: 0,
      breakingPoint: {
        users: 0,
        errorRate: 0,
        avgResponseTime: 0,
        reason: 'Not found'
      }
    }
  };
  
  let currentUsers = testOptions.startUsers;
  let breakingPointFound = false;
  
  while (currentUsers <= testOptions.maxUsers && !breakingPointFound) {
    logger.info(`Testing with ${currentUsers} concurrent users...`);
    
    const stepStartTime = performance.now();
    
    const stepOptions = {
      baseUrl: testOptions.baseUrl,
      concurrentUsers: currentUsers,
      rampUpTime: Math.min(5000, testOptions.stepDuration / 3),
      testDuration: testOptions.stepDuration,
      targetRps: testOptions.targetRps
    };
    
    const stepResults = await runLoadTest(stepOptions);
    
    const stepEndTime = performance.now();
    const stepDuration = stepEndTime - stepStartTime;
    
    // Add step results to overall results
    results.steps.push({
      users: currentUsers,
      rps: stepResults.summary.rps,
      avgResponseTime: stepResults.summary.avgResponseTime,
      p95ResponseTime: stepResults.summary.p95ResponseTime,
      errorRate: stepResults.summary.errorRate,
      duration: stepDuration
    });
    
    // Update max values if this step performed better
    if (stepResults.summary.rps > results.summary.maxRps) {
      results.summary.maxRps = stepResults.summary.rps;
      results.summary.maxUsers = currentUsers;
    }
    
    // Check for breaking point conditions
    if (stepResults.summary.errorRate > testOptions.maxAcceptableErrorRate) {
      breakingPointFound = true;
      results.summary.breakingPoint = {
        users: currentUsers,
        errorRate: stepResults.summary.errorRate,
        avgResponseTime: stepResults.summary.avgResponseTime,
        reason: 'Error rate exceeded maximum acceptable threshold'
      };
    } else if (stepResults.summary.avgResponseTime > testOptions.maxAcceptableResponseTime) {
      breakingPointFound = true;
      results.summary.breakingPoint = {
        users: currentUsers,
        errorRate: stepResults.summary.errorRate,
        avgResponseTime: stepResults.summary.avgResponseTime,
        reason: 'Response time exceeded maximum acceptable threshold'
      };
    }
    
    // If we haven't found a breaking point yet, increment users
    if (!breakingPointFound) {
      currentUsers += testOptions.incrementUsers;
    }
  }
  
  // If we reached max users without finding a breaking point
  if (!breakingPointFound) {
    results.summary.breakingPoint = {
      users: testOptions.maxUsers,
      errorRate: results.steps[results.steps.length - 1].errorRate,
      avgResponseTime: results.steps[results.steps.length - 1].avgResponseTime,
      reason: 'Maximum user limit reached without finding breaking point'
    };
  }
  
  // Calculate if the system can handle 20k renewals per hour (5.56 RPS)
  const targetRpsFor20k = 5.56;
  
  const can20kRenewals = results.summary.maxRps >= targetRpsFor20k;
  results.summary.can20kRenewals = can20kRenewals;
  
  // Calculate if the system can handle 20k concurrent users
  const can20kConcurrentUsers = results.summary.breakingPoint.users >= 20000;
  results.summary.can20kConcurrentUsers = can20kConcurrentUsers;
  
  // Log results
  logger.info(`Scalability test completed`);
  logger.info(`Maximum performance: ${results.summary.maxRps.toFixed(2)} RPS with ${results.summary.maxUsers} users`);
  logger.info(`Breaking point: ${results.summary.breakingPoint.users} users (${results.summary.breakingPoint.reason})`);
  logger.info(`Can handle 20k renewals per hour: ${results.summary.can20kRenewals}`);
  logger.info(`Can handle 20k concurrent users: ${results.summary.can20kConcurrentUsers}`);
  
  // Save scalability test report
  const reportPath = path.join('logs', `scalability-test-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  logger.info(`Scalability test report saved to ${reportPath}`);
  
  return results;
}

// Export functions
module.exports = {
  simulateUserSession,
  runLoadTest,
  runScalabilityTest
};

// Run test directly if executed as a script
if (require.main === module) {
  // Default to a moderate load test
  runLoadTest({ concurrentUsers: 25, testDuration: 30000 })
    .then(results => {
      console.log(`Load test completed. Achieved RPS: ${results.summary.rps.toFixed(2)}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Load test failed:', error);
      process.exit(1);
    });
}