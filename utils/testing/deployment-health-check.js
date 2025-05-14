/**
 * RXAI Platform Deployment Health Check
 * 
 * This utility performs a comprehensive health check of all platform 
 * components to verify deployment readiness before launch.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Pool } = require('pg');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'deployment-health-check' },
  transports: [
    new winston.transports.File({ filename: 'logs/deployment-health-check.log' }),
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
 * Check server health and uptime
 * @param {string} baseUrl - Base URL to check
 * @returns {Promise<Object>} Health check results
 */
async function checkServerHealth(baseUrl) {
  logger.info(`Checking server health at ${baseUrl}`);
  
  try {
    // Test explicit health endpoint
    const healthResponse = await axios.get(`${baseUrl}/health`, {
      timeout: 5000,
      validateStatus: () => true // Don't throw on any status
    });
    
    // Test API status
    const apiResponse = await axios.get(`${baseUrl}/api/ab-tests/active`, {
      timeout: 5000,
      validateStatus: () => true
    });
    
    // Test basic page load
    const homeResponse = await axios.get(baseUrl, {
      timeout: 5000,
      validateStatus: () => true,
      headers: {
        'Accept': 'text/html'
      }
    });
    
    const results = {
      serverRunning: healthResponse.status === 200,
      healthEndpoint: {
        status: healthResponse.status,
        responseTime: healthResponse.headers['x-response-time'],
        data: healthResponse.data
      },
      apiEndpoint: {
        status: apiResponse.status,
        responseTime: apiResponse.headers['x-response-time']
      },
      homePage: {
        status: homeResponse.status,
        responseTime: homeResponse.headers['x-response-time']
      }
    };
    
    // Calculate overall health score (0-100)
    let score = 0;
    if (results.serverRunning) score += 40;
    if (results.apiEndpoint.status === 200) score += 30;
    if (results.homePage.status === 200) score += 30;
    
    results.score = score;
    results.status = score === 100 ? 'healthy' : (score >= 70 ? 'degraded' : 'unhealthy');
    
    logger.info(`Server health check: ${results.status} (${results.score}/100)`);
    
    return results;
  } catch (error) {
    logger.error(`Server health check failed: ${error.message}`);
    return {
      serverRunning: false,
      error: error.message,
      score: 0,
      status: 'offline'
    };
  }
}

/**
 * Check database connectivity and health
 * @returns {Promise<Object>} Database health check results
 */
async function checkDatabaseHealth() {
  logger.info('Checking database health');
  
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL environment variable not set');
    return {
      connected: false,
      error: 'DATABASE_URL environment variable not set',
      score: 0,
      status: 'configuration_error'
    };
  }
  
  let pool;
  try {
    // Create a new pool with a short connection timeout
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    });
    
    // Test basic connectivity
    const connectResult = await pool.query('SELECT NOW()');
    
    // Test critical tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    // Check for critical tables
    const criticalTables = [
      'users', 'sessions', 'articles', 'courses', 'subscriptions'
    ];
    
    const missingTables = criticalTables.filter(table => !tables.includes(table));
    
    // Get row counts for existing critical tables
    const tableCounts = {};
    for (const table of criticalTables) {
      if (tables.includes(table)) {
        try {
          const countResult = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
          tableCounts[table] = parseInt(countResult.rows[0].count);
        } catch (err) {
          tableCounts[table] = `Error: ${err.message}`;
        }
      } else {
        tableCounts[table] = 'Table does not exist';
      }
    }
    
    const results = {
      connected: true,
      tables: {
        total: tables.length,
        critical: criticalTables.length - missingTables.length,
        missing: missingTables,
        counts: tableCounts
      },
      version: connectResult.rows[0].now,
      timestamp: new Date().toISOString()
    };
    
    // Calculate overall health score (0-100)
    let score = 0;
    if (results.connected) score += 60;
    score += Math.min(40, (results.tables.critical / criticalTables.length) * 40);
    
    results.score = Math.round(score);
    results.status = score === 100 ? 'healthy' : (score >= 60 ? 'degraded' : 'unhealthy');
    
    logger.info(`Database health check: ${results.status} (${results.score}/100)`);
    logger.info(`Found ${results.tables.critical}/${criticalTables.length} critical tables`);
    
    if (missingTables.length > 0) {
      logger.warn(`Missing tables: ${missingTables.join(', ')}`);
    }
    
    return results;
  } catch (error) {
    logger.error(`Database health check failed: ${error.message}`);
    return {
      connected: false,
      error: error.message,
      score: 0,
      status: 'connection_error'
    };
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

/**
 * Check for required environment variables
 * @returns {Object} Environment check results
 */
function checkEnvironmentVariables() {
  logger.info('Checking environment variables');
  
  const requiredVars = [
    'DATABASE_URL',
    'NODE_ENV',
    'SESSION_SECRET',
    'XAI_API_KEY'
  ];
  
  const optionalVars = [
    'STRIPE_SECRET_KEY',
    'VITE_STRIPE_PUBLIC_KEY',
    'VITE_GA_MEASUREMENT_ID'
  ];
  
  const results = {
    requiredVars: {
      total: requiredVars.length,
      present: 0,
      missing: []
    },
    optionalVars: {
      total: optionalVars.length,
      present: 0,
      missing: []
    }
  };
  
  // Check required vars
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      results.requiredVars.present++;
    } else {
      results.requiredVars.missing.push(varName);
    }
  });
  
  // Check optional vars
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      results.optionalVars.present++;
    } else {
      results.optionalVars.missing.push(varName);
    }
  });
  
  // Calculate overall health score (0-100)
  let score = 0;
  score += (results.requiredVars.present / results.requiredVars.total) * 80;
  score += (results.optionalVars.present / results.optionalVars.total) * 20;
  
  results.score = Math.round(score);
  results.status = score === 100 ? 'healthy' : (score >= 80 ? 'warning' : 'configuration_error');
  
  logger.info(`Environment check: ${results.status} (${results.score}/100)`);
  
  if (results.requiredVars.missing.length > 0) {
    logger.error(`Missing required environment variables: ${results.requiredVars.missing.join(', ')}`);
  }
  
  if (results.optionalVars.missing.length > 0) {
    logger.warn(`Missing optional environment variables: ${results.optionalVars.missing.join(', ')}`);
  }
  
  return results;
}

/**
 * Check external API connectivity
 * @returns {Promise<Object>} API health check results
 */
async function checkExternalAPIs() {
  logger.info('Checking external API connectivity');
  
  const apis = [
    { name: 'xAI API', url: 'https://api.x.ai/v1', key: 'XAI_API_KEY', required: true },
    { name: 'Stripe API', url: 'https://api.stripe.com/v1/balance', key: 'STRIPE_SECRET_KEY', required: false }
  ];
  
  const results = {
    apis: {},
    success: 0,
    failed: 0,
    skipped: 0
  };
  
  for (const api of apis) {
    if (!process.env[api.key]) {
      logger.warn(`Skipping ${api.name} check - ${api.key} not set`);
      results.apis[api.name] = {
        status: 'skipped',
        reason: `${api.key} not set`
      };
      results.skipped++;
      continue;
    }
    
    try {
      logger.info(`Testing connectivity to ${api.name}`);
      
      const headers = {};
      if (api.key === 'XAI_API_KEY') {
        headers['Authorization'] = `Bearer ${process.env[api.key]}`;
      } else if (api.key === 'STRIPE_SECRET_KEY') {
        const auth = Buffer.from(`${process.env[api.key]}:`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      }
      
      const response = await axios.get(api.url, {
        headers,
        timeout: 10000,
        validateStatus: () => true // Don't throw on any status
      });
      
      const success = response.status >= 200 && response.status < 300;
      
      results.apis[api.name] = {
        status: success ? 'healthy' : 'error',
        statusCode: response.status,
        responseTime: response.headers['x-response-time'] || 'N/A'
      };
      
      if (success) {
        results.success++;
        logger.info(`${api.name} check successful`);
      } else {
        results.failed++;
        logger.error(`${api.name} check failed with status ${response.status}`);
      }
    } catch (error) {
      results.apis[api.name] = {
        status: 'error',
        error: error.message
      };
      results.failed++;
      logger.error(`${api.name} check failed: ${error.message}`);
    }
  }
  
  // Calculate overall API health score (0-100)
  const requiredApis = apis.filter(api => api.required);
  const requiredSuccess = Object.entries(results.apis)
    .filter(([name]) => apis.find(api => api.name === name && api.required))
    .filter(([, data]) => data.status === 'healthy')
    .length;
  
  let score = 0;
  if (requiredApis.length > 0) {
    score += (requiredSuccess / requiredApis.length) * 100;
  } else {
    score = 100; // No required APIs
  }
  
  results.score = Math.round(score);
  results.status = score === 100 ? 'healthy' : (score > 0 ? 'degraded' : 'unhealthy');
  
  logger.info(`External API check: ${results.status} (${results.score}/100)`);
  
  return results;
}

/**
 * Check file system health and permissions
 * @returns {Object} File system health check results
 */
function checkFileSystem() {
  logger.info('Checking file system health');
  
  const criticalDirs = [
    '.', 'public', 'logs', 'client', 'server'
  ];
  
  const results = {
    directories: {},
    success: 0,
    failed: 0
  };
  
  for (const dir of criticalDirs) {
    try {
      const stats = fs.statSync(dir);
      const writable = fs.accessSync(dir, fs.constants.W_OK | fs.constants.R_OK) === undefined;
      
      results.directories[dir] = {
        exists: true,
        isDirectory: stats.isDirectory(),
        writable,
        size: stats.isDirectory() ? 'N/A' : stats.size,
        permissions: stats.mode.toString(8).slice(-3)
      };
      
      if (stats.isDirectory() && writable) {
        results.success++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.directories[dir] = {
        exists: false,
        error: error.message
      };
      results.failed++;
    }
  }
  
  // Calculate overall file system health score (0-100)
  const score = (results.success / criticalDirs.length) * 100;
  
  results.score = Math.round(score);
  results.status = score === 100 ? 'healthy' : (score >= 60 ? 'degraded' : 'unhealthy');
  
  logger.info(`File system check: ${results.status} (${results.score}/100)`);
  
  return results;
}

/**
 * Run a comprehensive deployment health check
 * @param {string} baseUrl - Base URL to check
 * @returns {Promise<Object>} Comprehensive health check results
 */
async function runDeploymentHealthCheck(baseUrl = 'http://localhost:5000') {
  logger.info(`Starting deployment health check for ${baseUrl}`);
  const startTime = Date.now();
  
  try {
    // Run all health checks
    const serverHealth = await checkServerHealth(baseUrl);
    const databaseHealth = await checkDatabaseHealth();
    const environmentHealth = checkEnvironmentVariables();
    const apiHealth = await checkExternalAPIs();
    const fileSystemHealth = checkFileSystem();
    
    // Compile results
    const results = {
      timestamp: new Date().toISOString(),
      server: serverHealth,
      database: databaseHealth,
      environment: environmentHealth,
      apis: apiHealth,
      fileSystem: fileSystemHealth,
      summary: {}
    };
    
    // Calculate overall health score (weighted average)
    const weightedScores = [
      serverHealth.score * 0.3,       // Server: 30%
      databaseHealth.score * 0.3,      // Database: 30%
      environmentHealth.score * 0.2,   // Environment: 20%
      apiHealth.score * 0.1,           // APIs: 10%
      fileSystemHealth.score * 0.1     // File System: 10%
    ];
    
    const overallScore = weightedScores.reduce((sum, score) => sum + score, 0);
    
    // Determine overall status
    let overallStatus = 'healthy';
    if (overallScore < 60) {
      overallStatus = 'unhealthy';
    } else if (overallScore < 90) {
      overallStatus = 'degraded';
    }
    
    // Generate critical issues list
    const criticalIssues = [];
    
    if (serverHealth.status !== 'healthy') {
      criticalIssues.push(`Server health: ${serverHealth.status} (${serverHealth.score}/100)`);
    }
    
    if (databaseHealth.status !== 'healthy') {
      criticalIssues.push(`Database health: ${databaseHealth.status} (${databaseHealth.score}/100)`);
      if (databaseHealth.tables && databaseHealth.tables.missing && databaseHealth.tables.missing.length > 0) {
        criticalIssues.push(`Missing database tables: ${databaseHealth.tables.missing.join(', ')}`);
      }
    }
    
    if (environmentHealth.requiredVars.missing.length > 0) {
      criticalIssues.push(`Missing required environment variables: ${environmentHealth.requiredVars.missing.join(', ')}`);
    }
    
    // Add summary to results
    results.summary = {
      score: Math.round(overallScore),
      status: overallStatus,
      criticalIssues,
      readyForDeployment: overallStatus === 'healthy'
    };
    
    const endTime = Date.now();
    results.executionTime = (endTime - startTime) / 1000;
    
    logger.info(`Deployment health check completed in ${results.executionTime.toFixed(2)} seconds`);
    logger.info(`Overall health: ${results.summary.status} (${results.summary.score}/100)`);
    logger.info(`Ready for deployment: ${results.summary.readyForDeployment}`);
    
    if (criticalIssues.length > 0) {
      logger.error(`Critical issues (${criticalIssues.length}):`);
      criticalIssues.forEach((issue, i) => {
        logger.error(`${i+1}. ${issue}`);
      });
    }
    
    // Save results
    const resultsPath = path.join('logs', `deployment-health-check-${new Date().toISOString().replace(/:/g, '-')}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    logger.info(`Full health check report saved to: ${resultsPath}`);
    
    return results;
  } catch (error) {
    logger.error(`Deployment health check failed: ${error.message}`);
    throw error;
  }
}

// Run health check if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:5000';
  
  runDeploymentHealthCheck(baseUrl)
    .then(results => {
      console.log('\n================================================');
      console.log('📊 RXAI PLATFORM DEPLOYMENT HEALTH CHECK RESULTS 📊');
      console.log('================================================\n');
      
      console.log(`Overall Health: ${results.summary.status} (${results.summary.score}/100)`);
      console.log(`Ready for Deployment: ${results.summary.readyForDeployment ? 'YES ✅' : 'NO ❌'}`);
      
      console.log('\nComponent Health:');
      console.log(`- Server: ${results.server.status} (${results.server.score}/100)`);
      console.log(`- Database: ${results.database.status} (${results.database.score}/100)`);
      console.log(`- Environment: ${results.environment.status} (${results.environment.score}/100)`);
      console.log(`- External APIs: ${results.apis.status} (${results.apis.score}/100)`);
      console.log(`- File System: ${results.fileSystem.status} (${results.fileSystem.score}/100)`);
      
      if (results.summary.criticalIssues.length > 0) {
        console.log('\n⚠️ CRITICAL ISSUES TO RESOLVE:');
        results.summary.criticalIssues.forEach((issue, i) => {
          console.log(`  ${i+1}. ${issue}`);
        });
      }
      
      console.log(`\nFull report saved to: ${path.join('logs', 'deployment-health-check-*.json')}`);
      
      process.exit(results.summary.readyForDeployment ? 0 : 1);
    })
    .catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}

module.exports = {
  checkServerHealth,
  checkDatabaseHealth,
  checkEnvironmentVariables,
  checkExternalAPIs,
  checkFileSystem,
  runDeploymentHealthCheck
};