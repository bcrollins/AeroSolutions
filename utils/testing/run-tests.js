/**
 * RXAI Platform Comprehensive Testing Script
 * 
 * This script runs all testing utilities to provide a complete assessment
 * of the platform before launch, covering functionality, performance,
 * security, SEO, and load capacity.
 */

const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Import test modules
const functionalityTests = require('./functionality-tests');
const performanceTests = require('./performance-tests');
const securityTests = require('./security-tests');
const seoTests = require('./seo-audit');
const loadTests = require('./load-tests');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'comprehensive-testing' },
  transports: [
    new winston.transports.File({ filename: 'logs/comprehensive-testing.log' }),
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
 * Run all tests and generate comprehensive report
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Comprehensive test results
 */
async function runComprehensiveTests(options = {}) {
  const defaultOptions = {
    baseUrl: 'http://localhost:5000',
    runFunctionalityTests: true,
    runPerformanceTests: true,
    runSecurityTests: true,
    runSeoTests: true,
    runLoadTests: true,
    // Load test specific options
    concurrentUsers: 20,
    testDuration: 30000,
    // Other test specific options can be added as needed
  };
  
  const testOptions = { ...defaultOptions, ...options };
  
  logger.info(`Starting comprehensive testing for ${testOptions.baseUrl}`);
  logger.info(`Tests enabled: ` +
    `Functionality=${testOptions.runFunctionalityTests}, ` +
    `Performance=${testOptions.runPerformanceTests}, ` +
    `Security=${testOptions.runSecurityTests}, ` +
    `SEO=${testOptions.runSeoTests}, ` +
    `Load=${testOptions.runLoadTests}`);
  
  const startTime = Date.now();
  
  const results = {
    baseUrl: testOptions.baseUrl,
    testOptions,
    functionality: null,
    performance: null,
    security: null,
    seo: null,
    load: null,
    summary: {
      testsRun: 0,
      testsSucceeded: 0,
      testsFailed: 0,
      overallStatus: 'Not Run',
      readyForProduction: false,
      criticalIssues: [],
      recommendations: []
    }
  };
  
  try {
    // Run functionality tests
    if (testOptions.runFunctionalityTests) {
      logger.info('=== Running Functionality Tests ===');
      results.functionality = await functionalityTests.runAllTests();
      results.summary.testsRun++;
      
      if (!results.functionality.summary.totalFailed) {
        results.summary.testsSucceeded++;
        logger.info('✓ Functionality tests passed');
      } else {
        logger.warn(`⚠ Functionality tests found ${results.functionality.summary.totalFailed} issues`);
        
        // Add critical issues to summary
        results.summary.criticalIssues = [
          ...results.summary.criticalIssues,
          ...results.functionality.endpointTests.details
            .filter(detail => !detail.passed)
            .map(detail => `API endpoint failure: ${detail.method} ${detail.endpoint}`)
        ];
      }
    }
    
    // Run performance tests
    if (testOptions.runPerformanceTests) {
      logger.info('=== Running Performance Tests ===');
      results.performance = await performanceTests.runAllTests();
      results.summary.testsRun++;
      
      if (results.performance.summary.overall.targetMet) {
        results.summary.testsSucceeded++;
        logger.info('✓ Performance tests passed');
      } else {
        logger.warn(`⚠ Performance tests found issues: ${results.performance.summary.overall.avgLoadTime.toFixed(2)}ms avg page load time`);
        
        // Add recommendations based on performance issues
        if (results.performance.summary.overall.avgLoadTime > 2000) {
          results.summary.recommendations.push('Optimize page load performance to meet target of <2s');
        }
      }
    }
    
    // Run security tests
    if (testOptions.runSecurityTests) {
      logger.info('=== Running Security Tests ===');
      results.security = await securityTests.runSecurityAssessment(testOptions.baseUrl);
      results.summary.testsRun++;
      
      if (results.security.summary.overallScore >= 7) {
        results.summary.testsSucceeded++;
        logger.info('✓ Security tests passed');
      } else {
        logger.warn(`⚠ Security tests found issues: ${results.security.summary.rating} (${results.security.summary.overallScore.toFixed(1)}/10)`);
        
        // Add critical security issues to summary
        results.summary.criticalIssues = [
          ...results.summary.criticalIssues,
          ...results.security.summary.topRecommendations
        ];
      }
    }
    
    // Run SEO tests
    if (testOptions.runSeoTests) {
      logger.info('=== Running SEO Tests ===');
      results.seo = await seoTests.runSeoAudit(testOptions.baseUrl);
      results.summary.testsRun++;
      
      if (results.seo.summary.averageScore >= 7) {
        results.summary.testsSucceeded++;
        logger.info('✓ SEO tests passed');
      } else {
        logger.warn(`⚠ SEO tests found issues: ${results.seo.summary.overallRating} (${results.seo.summary.averageScore.toFixed(1)}/10)`);
        
        // Add SEO recommendations
        if (results.seo.summary.totalIssues > 0) {
          const topSeoIssues = Object.values(results.seo.pages)
            .flatMap(page => page.issues || [])
            .filter(issue => issue)
            .slice(0, 3);
          
          results.summary.recommendations = [
            ...results.summary.recommendations,
            ...topSeoIssues.map(issue => `SEO: ${issue}`)
          ];
        }
      }
    }
    
    // Run load tests
    if (testOptions.runLoadTests) {
      logger.info('=== Running Load Tests ===');
      results.load = await loadTests.runLoadTest({
        baseUrl: testOptions.baseUrl,
        concurrentUsers: testOptions.concurrentUsers,
        testDuration: testOptions.testDuration
      });
      results.summary.testsRun++;
      
      if (results.load.capacity.canHandle20kRenewals) {
        results.summary.testsSucceeded++;
        logger.info('✓ Load tests passed');
      } else {
        logger.warn(`⚠ Load tests indicate system cannot handle required capacity`);
        
        results.summary.recommendations.push('Scale infrastructure to handle 20,000 renewals per hour');
      }
    }
    
    // Calculate overall test results
    results.summary.testsFailed = results.summary.testsRun - results.summary.testsSucceeded;
    
    if (results.summary.testsFailed === 0) {
      results.summary.overallStatus = 'PASS';
      results.summary.readyForProduction = true;
    } else if (results.summary.criticalIssues.length > 0) {
      results.summary.overallStatus = 'FAIL';
      results.summary.readyForProduction = false;
    } else {
      results.summary.overallStatus = 'WARNINGS';
      results.summary.readyForProduction = results.summary.testsFailed <= Math.floor(results.summary.testsRun / 4);
    }
    
    const endTime = Date.now();
    results.executionTime = endTime - startTime;
    
    logger.info(`Comprehensive testing completed in ${(results.executionTime / 1000).toFixed(2)}s`);
    logger.info(`Overall status: ${results.summary.overallStatus}`);
    logger.info(`Ready for production: ${results.summary.readyForProduction}`);
    
    if (results.summary.criticalIssues.length > 0) {
      logger.error('Critical issues found:');
      results.summary.criticalIssues.forEach(issue => logger.error(`- ${issue}`));
    }
    
    if (results.summary.recommendations.length > 0) {
      logger.info('Recommendations:');
      results.summary.recommendations.forEach(rec => logger.info(`- ${rec}`));
    }
    
    // Save comprehensive test report
    const reportPath = path.join('logs', `comprehensive-test-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    // Also save an HTML report for easier reading
    const htmlReport = generateHtmlReport(results);
    const htmlReportPath = path.join('logs', `comprehensive-test-report-${new Date().toISOString().replace(/:/g, '-')}.html`);
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    logger.info(`Comprehensive test reports saved to:`);
    logger.info(`- JSON: ${reportPath}`);
    logger.info(`- HTML: ${htmlReportPath}`);
    
    return results;
  } catch (error) {
    logger.error(`Comprehensive testing failed: ${error.message}`);
    return {
      baseUrl: testOptions.baseUrl,
      error: error.message,
      failed: true
    };
  }
}

/**
 * Generate HTML report from test results
 * @param {Object} results - Test results
 * @returns {string} HTML report
 */
function generateHtmlReport(results) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RXAI Platform Comprehensive Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4 {
      color: #0066cc;
    }
    .header {
      border-bottom: 2px solid #0066cc;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .summary {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .status {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      margin-left: 10px;
    }
    .status-pass {
      background-color: #d4edda;
      color: #155724;
    }
    .status-warnings {
      background-color: #fff3cd;
      color: #856404;
    }
    .status-fail {
      background-color: #f8d7da;
      color: #721c24;
    }
    .test-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .test-section h3 {
      margin-top: 0;
    }
    .issues, .recommendations {
      background-color: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #6c757d;
      margin: 15px 0;
    }
    .issues h4, .recommendations h4 {
      margin-top: 0;
      color: #495057;
    }
    .issues ul, .recommendations ul {
      margin-bottom: 0;
    }
    .critical {
      border-left-color: #dc3545;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      margin: 15px 0;
    }
    .metric {
      background-color: #e9ecef;
      padding: 10px 15px;
      border-radius: 6px;
    }
    .metric-label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9em;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 1.1em;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 0.9em;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>RXAI Platform Comprehensive Test Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="summary">
    <h2>Summary 
      <span class="status ${results.summary.overallStatus === 'PASS' ? 'status-pass' : 
                            results.summary.overallStatus === 'WARNINGS' ? 'status-warnings' : 
                            'status-fail'}">
        ${results.summary.overallStatus}
      </span>
    </h2>
    
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Tests Run</div>
        <div class="metric-value">${results.summary.testsRun}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Tests Passed</div>
        <div class="metric-value">${results.summary.testsSucceeded}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Tests Failed</div>
        <div class="metric-value">${results.summary.testsFailed}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Ready for Production</div>
        <div class="metric-value">${results.summary.readyForProduction ? 'Yes' : 'No'}</div>
      </div>
    </div>
    
    ${results.summary.criticalIssues.length > 0 ? `
    <div class="issues critical">
      <h4>Critical Issues (${results.summary.criticalIssues.length})</h4>
      <ul>
        ${results.summary.criticalIssues.map(issue => `<li>${issue}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    ${results.summary.recommendations.length > 0 ? `
    <div class="recommendations">
      <h4>Recommendations (${results.summary.recommendations.length})</h4>
      <ul>
        ${results.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  </div>
  
  ${results.functionality ? `
  <div class="test-section">
    <h3>Functionality Tests</h3>
    
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Total Tests</div>
        <div class="metric-value">${results.functionality.summary.totalTests}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Passed</div>
        <div class="metric-value">${results.functionality.summary.totalPassed}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Failed</div>
        <div class="metric-value">${results.functionality.summary.totalFailed}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Pass Rate</div>
        <div class="metric-value">${results.functionality.summary.passRate}%</div>
      </div>
    </div>
    
    <h4>Endpoint Tests</h4>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <tr>
        <th>Endpoint</th>
        <th>Method</th>
        <th>Status</th>
        <th>Result</th>
      </tr>
      ${results.functionality.endpointTests.details.map(detail => `
        <tr>
          <td>${detail.endpoint}</td>
          <td>${detail.method}</td>
          <td>${detail.actual || 'Error'}</td>
          <td style="color: ${detail.passed ? 'green' : 'red'}">${detail.passed ? 'PASS' : 'FAIL'}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  ` : ''}
  
  ${results.performance ? `
  <div class="test-section">
    <h3>Performance Tests</h3>
    
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Avg Page Load Time</div>
        <div class="metric-value">${results.performance.summary.overall.avgLoadTime.toFixed(2)}ms</div>
      </div>
      <div class="metric">
        <div class="metric-label">Avg API Response Time</div>
        <div class="metric-value">${results.performance.summary.overall.avgResponseTime.toFixed(2)}ms</div>
      </div>
      <div class="metric">
        <div class="metric-label">Page Target Met</div>
        <div class="metric-value">${results.performance.summary.overall.targetMet ? 'Yes' : 'No'}</div>
      </div>
      <div class="metric">
        <div class="metric-label">API Target Met</div>
        <div class="metric-value">${results.performance.summary.overall.apiTargetMet ? 'Yes' : 'No'}</div>
      </div>
    </div>
    
    <h4>Page Performance</h4>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <tr>
        <th>Page</th>
        <th>Avg Load Time</th>
        <th>Meets Target</th>
      </tr>
      ${Object.entries(results.performance.pageLoadTests.summary).filter(([key]) => key !== 'overall').map(([key, value]) => `
        <tr>
          <td>${value.name}</td>
          <td>${value.avgLoadTime?.toFixed(2) || 'N/A'}ms</td>
          <td style="color: ${value.meetsTarget ? 'green' : 'red'}">${value.meetsTarget ? 'Yes' : 'No'}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  ` : ''}
  
  ${results.security ? `
  <div class="test-section">
    <h3>Security Tests</h3>
    
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Security Score</div>
        <div class="metric-value">${results.security.summary.overallScore.toFixed(1)}/10</div>
      </div>
      <div class="metric">
        <div class="metric-label">Rating</div>
        <div class="metric-value">${results.security.summary.rating}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Issues Found</div>
        <div class="metric-value">${results.security.summary.issuesCount}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Critical Issues</div>
        <div class="metric-value">${results.security.summary.criticalIssues}</div>
      </div>
    </div>
    
    <h4>Top Recommendations</h4>
    <ul>
      ${results.security.summary.topRecommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
  </div>
  ` : ''}
  
  ${results.seo ? `
  <div class="test-section">
    <h3>SEO Tests</h3>
    
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Average SEO Score</div>
        <div class="metric-value">${results.seo.summary.averageScore?.toFixed(1) || 'N/A'}/10</div>
      </div>
      <div class="metric">
        <div class="metric-label">Overall Rating</div>
        <div class="metric-value">${results.seo.summary.overallRating || 'N/A'}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Pages Audited</div>
        <div class="metric-value">${results.seo.summary.pagesAudited}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Total Issues</div>
        <div class="metric-value">${results.seo.summary.totalIssues || 'N/A'}</div>
      </div>
    </div>
    
    <h4>Page SEO Scores</h4>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <tr>
        <th>Page</th>
        <th>Score</th>
        <th>Rating</th>
        <th>Issues</th>
      </tr>
      ${Object.entries(results.seo.pages).map(([path, page]) => `
        <tr>
          <td>${page.name || path}</td>
          <td>${page.overallScore?.toFixed(1) || 'N/A'}</td>
          <td>${page.rating || 'N/A'}</td>
          <td>${page.issues?.length || 0}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  ` : ''}
  
  ${results.load ? `
  <div class="test-section">
    <h3>Load Tests</h3>
    
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Requests Per Second</div>
        <div class="metric-value">${results.load.summary.rps.toFixed(2)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Avg Response Time</div>
        <div class="metric-value">${results.load.summary.avgResponseTime.toFixed(2)}ms</div>
      </div>
      <div class="metric">
        <div class="metric-label">P95 Response Time</div>
        <div class="metric-value">${results.load.summary.p95ResponseTime.toFixed(2)}ms</div>
      </div>
      <div class="metric">
        <div class="metric-label">Error Rate</div>
        <div class="metric-value">${(results.load.summary.errorRate * 100).toFixed(2)}%</div>
      </div>
    </div>
    
    <h4>Capacity Analysis</h4>
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Estimated Max RPS</div>
        <div class="metric-value">${results.load.capacity.estimatedMaxRps.toFixed(2)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Estimated Max Users</div>
        <div class="metric-value">${results.load.capacity.estimatedMaxConcurrentUsers}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Can Handle 20k Renewals/Hour</div>
        <div class="metric-value" style="color: ${results.load.capacity.canHandle20kRenewals ? 'green' : 'red'}">
          ${results.load.capacity.canHandle20kRenewals ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Test Execution Time: ${(results.executionTime / 1000).toFixed(2)} seconds</p>
    <p>RXAI Platform Comprehensive Testing &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`;
}

// Export function
module.exports = {
  runComprehensiveTests
};

// Run directly if executed as a script
if (require.main === module) {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:5000';
  
  runComprehensiveTests({ baseUrl })
    .then(results => {
      console.log(`Comprehensive testing completed. Status: ${results.summary.overallStatus}`);
      process.exit(results.summary.readyForProduction ? 0 : 1);
    })
    .catch(error => {
      console.error('Comprehensive testing failed:', error);
      process.exit(1);
    });
}