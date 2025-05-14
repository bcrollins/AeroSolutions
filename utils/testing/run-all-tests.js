/**
 * RXAI Platform Comprehensive Test Runner
 * 
 * This script runs all tests and generates a comprehensive report
 * to verify platform readiness for launch.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const functionalityTests = require('./functionality-tests');
const performanceTests = require('./performance-tests');
const securityTests = require('./security-tests');
const seoTests = require('./seo-audit');
const loadTests = require('./load-tests');
const { runComprehensiveTests } = require('./run-tests');

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

/**
 * Main function to run all tests and generate a comprehensive report
 */
async function runAllTests() {
  console.log('\n=============================================');
  console.log('🚀 RXAI PLATFORM COMPREHENSIVE TEST RUNNER 🚀');
  console.log('=============================================\n');
  
  const startTime = Date.now();
  
  // Get base URL from command line or use default
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:5000';
  
  console.log(`Running tests against: ${baseUrl}`);
  console.log(`Started at: ${new Date().toLocaleString()}\n`);
  
  try {
    console.log('Running comprehensive tests...');
    const results = await runComprehensiveTests({
      baseUrl,
      runFunctionalityTests: true,
      runPerformanceTests: true,
      runSecurityTests: true,
      runSeoTests: true,
      runLoadTests: true,
      concurrentUsers: 20,
      testDuration: 30000
    });
    
    // Generate readable summary
    generateReadableSummary(results);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ All tests completed in ${duration} seconds`);
    
    if (results.summary.readyForProduction) {
      console.log('\n🎉 PLATFORM IS READY FOR PRODUCTION 🎉');
    } else {
      console.log('\n⚠️ PLATFORM REQUIRES ATTENTION BEFORE LAUNCH ⚠️');
      
      if (results.summary.criticalIssues.length > 0) {
        console.log('\nCritical issues to resolve:');
        results.summary.criticalIssues.forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue}`);
        });
      }
      
      if (results.summary.recommendations.length > 0) {
        console.log('\nRecommendations:');
        results.summary.recommendations.forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec}`);
        });
      }
    }
    
    console.log('\nDetailed reports are available in the logs directory.');
    console.log('\nNext Steps:');
    console.log('1. Review the full HTML report');
    console.log('2. Address any critical issues');
    console.log('3. Complete the launch checklist');
    console.log('4. Prepare marketing materials for launch');
    
    return results.summary.readyForProduction ? 0 : 1;
  } catch (error) {
    console.error('\n❌ Error running tests:', error);
    return 1;
  }
}

/**
 * Generate a readable summary of test results
 * @param {Object} results - Test results
 */
function generateReadableSummary(results) {
  console.log('\n=============================================');
  console.log('📊 TEST RESULTS SUMMARY 📊');
  console.log('=============================================\n');
  
  console.log(`Overall Status: ${results.summary.overallStatus}`);
  console.log(`Ready for Production: ${results.summary.readyForProduction ? 'Yes' : 'No'}`);
  console.log(`Tests Run: ${results.summary.testsRun}`);
  console.log(`Tests Passed: ${results.summary.testsSucceeded}`);
  console.log(`Tests Failed: ${results.summary.testsFailed}`);
  
  if (results.functionality) {
    console.log('\n----- Functionality Tests -----');
    console.log(`Pass Rate: ${results.functionality.summary.passRate}%`);
    console.log(`API Endpoints: ${results.functionality.endpointTests.passed}/${results.functionality.endpointTests.details.length} passed`);
    console.log(`Page Rendering: ${results.functionality.renderingTests.passed}/${results.functionality.renderingTests.details.length} passed`);
  }
  
  if (results.performance) {
    console.log('\n----- Performance Tests -----');
    console.log(`Average Page Load Time: ${results.performance.summary.overall.avgLoadTime.toFixed(2)}ms`);
    console.log(`Average API Response Time: ${results.performance.summary.overall.avgResponseTime.toFixed(2)}ms`);
    console.log(`Page Performance Rating: ${results.performance.summary.overallPerformanceRating}/10`);
  }
  
  if (results.security) {
    console.log('\n----- Security Tests -----');
    console.log(`Security Score: ${results.security.summary.overallScore.toFixed(1)}/10`);
    console.log(`Security Rating: ${results.security.summary.rating}`);
    console.log(`Issues Found: ${results.security.summary.issuesCount}`);
    console.log(`Critical Issues: ${results.security.summary.criticalIssues}`);
  }
  
  if (results.seo) {
    console.log('\n----- SEO Tests -----');
    console.log(`Average SEO Score: ${results.seo.summary.averageScore ? results.seo.summary.averageScore.toFixed(1) : 'N/A'}/10`);
    console.log(`SEO Rating: ${results.seo.summary.overallRating || 'N/A'}`);
    console.log(`Pages Audited: ${results.seo.summary.pagesAudited}`);
    console.log(`Total SEO Issues: ${results.seo.summary.totalIssues || 'N/A'}`);
  }
  
  if (results.load) {
    console.log('\n----- Load Tests -----');
    console.log(`Requests Per Second: ${results.load.summary.rps.toFixed(2)}`);
    console.log(`Average Response Time: ${results.load.summary.avgResponseTime.toFixed(2)}ms`);
    console.log(`Error Rate: ${(results.load.summary.errorRate * 100).toFixed(2)}%`);
    console.log(`Can Handle 20k Renewals/Hour: ${results.load.capacity.canHandle20kRenewals ? 'Yes' : 'No'}`);
  }
  
  if (results.summary.criticalIssues && results.summary.criticalIssues.length > 0) {
    console.log('\n⚠️ Critical Issues:');
    results.summary.criticalIssues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests
};