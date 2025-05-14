/**
 * RXAI Platform Pre-Launch Assessment
 * 
 * This utility runs all pre-launch checks to verify platform readiness
 * for production deployment. It provides a comprehensive report and 
 * go/no-go recommendation.
 */

import { runComprehensiveTests } from './utils/testing/run-tests.js';
import { runAllOptimizations } from './utils/optimization/performance-optimization.js';
import { checkAllMetadata } from './utils/optimization/metadata-checker.js';
import { runDeploymentHealthCheck } from './utils/testing/deployment-health-check.js';
import fs from 'fs';
import path from 'path';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'prelaunch-assessment' },
  transports: [
    new winston.transports.File({ filename: 'logs/prelaunch-assessment.log' }),
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
 * Run pre-launch assessment
 * @param {Object} options - Assessment options
 * @returns {Promise<Object>} Assessment results
 */
async function runPrelaunchAssessment(options = {}) {
  const defaultOptions = {
    baseUrl: 'http://localhost:5000',
    runComprehensive: true,    // Run comprehensive tests
    runOptimizations: true,    // Run performance optimizations
    runMetadataCheck: true,    // Run metadata checks
    runHealthCheck: true,      // Run deployment health check
    generateReport: true       // Generate HTML report
  };
  
  const assessmentOptions = { ...defaultOptions, ...options };
  
  console.log('\n=============================================');
  console.log('🚀 RXAI PLATFORM PRE-LAUNCH ASSESSMENT 🚀');
  console.log('=============================================\n');
  
  const startTime = Date.now();
  
  console.log(`Starting pre-launch assessment for ${assessmentOptions.baseUrl}`);
  console.log(`Started at: ${new Date().toLocaleString()}\n`);
  
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl: assessmentOptions.baseUrl,
    options: assessmentOptions,
    tests: {},
    summary: {
      readyForLaunch: false,
      criticalIssues: [],
      recommendations: [],
      passingComponents: [],
      failingComponents: []
    }
  };
  
  try {
    // Run comprehensive tests
    if (assessmentOptions.runComprehensive) {
      console.log('📊 Running comprehensive tests...');
      results.tests.comprehensive = await runComprehensiveTests({
        baseUrl: assessmentOptions.baseUrl,
        runFunctionalityTests: true,
        runPerformanceTests: true,
        runSecurityTests: true,
        runSeoTests: true,
        runLoadTests: true,
        concurrentUsers: 20,
        testDuration: 30000
      });
      
      if (results.tests.comprehensive.summary.readyForProduction) {
        results.summary.passingComponents.push('Functionality Tests');
      } else {
        results.summary.failingComponents.push('Functionality Tests');
        
        // Add critical issues
        if (results.tests.comprehensive.summary.criticalIssues) {
          results.tests.comprehensive.summary.criticalIssues.forEach(issue => {
            results.summary.criticalIssues.push(`Functionality: ${issue}`);
          });
        }
        
        // Add recommendations
        if (results.tests.comprehensive.summary.recommendations) {
          results.tests.comprehensive.summary.recommendations.forEach(rec => {
            results.summary.recommendations.push(`Functionality: ${rec}`);
          });
        }
      }
    }
    
    // Run performance optimizations
    if (assessmentOptions.runOptimizations) {
      console.log('🚀 Running performance optimizations...');
      results.tests.optimizations = await runAllOptimizations();
      
      // Consider optimizations ready if they can handle 20k users
      const optimizationsReady = results.tests.optimizations.summary.estimatedImpact.userCapacityEstimate.includes('25,000+');
      
      if (optimizationsReady) {
        results.summary.passingComponents.push('Performance Optimization');
      } else {
        results.summary.failingComponents.push('Performance Optimization');
        
        // Add optimization issues and recommendations
        results.summary.criticalIssues.push(`Performance: Platform may not handle 20,000 concurrent users`);
        results.summary.recommendations.push(`Performance: Implement suggested optimizations to improve capacity`);
      }
    }
    
    // Run metadata check
    if (assessmentOptions.runMetadataCheck) {
      console.log('🔍 Running metadata checks...');
      results.tests.metadata = await checkAllMetadata(assessmentOptions.baseUrl);
      
      // Consider metadata ready if average score is at least 80
      const metadataReady = results.tests.metadata.summary.averageScore >= 80;
      
      if (metadataReady) {
        results.summary.passingComponents.push('SEO Metadata');
      } else {
        results.summary.failingComponents.push('SEO Metadata');
        
        // Add metadata issues and recommendations
        results.summary.criticalIssues.push(`SEO: Metadata score (${results.tests.metadata.summary.averageScore}/100) below threshold`);
        
        // Add specific recommendations for most common missing metadata
        const sortedMissing = Object.entries(results.tests.metadata.summary.missingMeta || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        
        sortedMissing.forEach(([metaType, count]) => {
          results.summary.recommendations.push(`SEO: Add missing ${metaType} tags to ${count} pages`);
        });
      }
    }
    
    // Run deployment health check
    if (assessmentOptions.runHealthCheck) {
      console.log('🏥 Running deployment health check...');
      results.tests.health = await runDeploymentHealthCheck(assessmentOptions.baseUrl);
      
      if (results.tests.health.summary.readyForDeployment) {
        results.summary.passingComponents.push('Deployment Health');
      } else {
        results.summary.failingComponents.push('Deployment Health');
        
        // Add health check issues
        if (results.tests.health.summary.criticalIssues) {
          results.tests.health.summary.criticalIssues.forEach(issue => {
            results.summary.criticalIssues.push(`Deployment: ${issue}`);
          });
        }
      }
    }
    
    // Determine overall readiness based on component results
    const requiredComponents = [
      'Functionality Tests',
      'Deployment Health'
    ];
    
    const passingRequiredComponents = requiredComponents.filter(comp => 
      results.summary.passingComponents.includes(comp)
    );
    
    // Ready for launch if all required components pass and no more than one optional component fails
    results.summary.readyForLaunch = 
      passingRequiredComponents.length === requiredComponents.length && 
      results.summary.failingComponents.length <= 1;
    
    const endTime = Date.now();
    results.executionTime = ((endTime - startTime) / 1000).toFixed(2);
    
    logger.info(`Pre-launch assessment completed in ${results.executionTime} seconds`);
    logger.info(`Ready for launch: ${results.summary.readyForLaunch}`);
    logger.info(`Passing components: ${results.summary.passingComponents.join(', ')}`);
    
    if (results.summary.failingComponents.length > 0) {
      logger.warn(`Failing components: ${results.summary.failingComponents.join(', ')}`);
    }
    
    // Save results to file
    const resultsPath = path.join('logs', `prelaunch-assessment-${new Date().toISOString().replace(/:/g, '-')}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    logger.info(`Assessment results saved to: ${resultsPath}`);
    
    // Generate HTML report
    if (assessmentOptions.generateReport) {
      const reportPath = path.join('logs', `prelaunch-assessment-${new Date().toISOString().replace(/:/g, '-')}.html`);
      const htmlReport = generateHtmlReport(results);
      fs.writeFileSync(reportPath, htmlReport);
      logger.info(`HTML report saved to: ${reportPath}`);
    }
    
    return results;
  } catch (error) {
    logger.error(`Pre-launch assessment failed: ${error.message}`);
    return {
      error: error.message,
      failed: true
    };
  }
}

/**
 * Generate HTML report from assessment results
 * @param {Object} results - Assessment results
 * @returns {string} HTML report
 */
function generateHtmlReport(results) {
  const readyStatus = results.summary.readyForLaunch ? 
    '<span style="color: #22c55e; font-weight: bold;">READY FOR LAUNCH ✅</span>' : 
    '<span style="color: #ef4444; font-weight: bold;">NOT READY FOR LAUNCH ❌</span>';
  
  let criticalIssuesHtml = '';
  if (results.summary.criticalIssues.length > 0) {
    criticalIssuesHtml = `
      <div class="section critical-issues">
        <h2>Critical Issues (${results.summary.criticalIssues.length})</h2>
        <ul>
          ${results.summary.criticalIssues.map(issue => `<li>${issue}</li>`).join('\n')}
        </ul>
      </div>
    `;
  }
  
  let recommendationsHtml = '';
  if (results.summary.recommendations.length > 0) {
    recommendationsHtml = `
      <div class="section recommendations">
        <h2>Recommendations (${results.summary.recommendations.length})</h2>
        <ul>
          ${results.summary.recommendations.map(rec => `<li>${rec}</li>`).join('\n')}
        </ul>
      </div>
    `;
  }
  
  // Component result sections
  let componentsHtml = '';
  
  // Comprehensive tests
  if (results.tests.comprehensive) {
    const status = results.tests.comprehensive.summary.readyForProduction ? 
      '<span class="status-pass">PASS</span>' : 
      '<span class="status-fail">FAIL</span>';
    
    componentsHtml += `
      <div class="section component">
        <h2>Functionality Tests ${status}</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Tests Run</div>
            <div class="metric-value">${results.tests.comprehensive.summary.testsRun}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Tests Passed</div>
            <div class="metric-value">${results.tests.comprehensive.summary.testsSucceeded}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Tests Failed</div>
            <div class="metric-value">${results.tests.comprehensive.summary.testsFailed}</div>
          </div>
        </div>
        
        ${results.tests.comprehensive.functionality ? `
        <h3>API Endpoints</h3>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Success Rate</div>
            <div class="metric-value">${results.tests.comprehensive.functionality.summary.passRate}%</div>
          </div>
        </div>
        ` : ''}
        
        ${results.tests.comprehensive.performance ? `
        <h3>Performance</h3>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Avg Page Load</div>
            <div class="metric-value">${results.tests.comprehensive.performance.summary.overall.avgLoadTime.toFixed(2)}ms</div>
          </div>
          <div class="metric">
            <div class="metric-label">Target Met</div>
            <div class="metric-value">${results.tests.comprehensive.performance.summary.overall.targetMet ? 'Yes' : 'No'}</div>
          </div>
        </div>
        ` : ''}
        
        ${results.tests.comprehensive.security ? `
        <h3>Security</h3>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Score</div>
            <div class="metric-value">${results.tests.comprehensive.security.summary.overallScore.toFixed(1)}/10</div>
          </div>
        </div>
        ` : ''}
        
        ${results.tests.comprehensive.load ? `
        <h3>Load Testing</h3>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Can Handle 20k Users</div>
            <div class="metric-value">${results.tests.comprehensive.load.capacity.canHandle20kRenewals ? 'Yes' : 'No'}</div>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  }
  
  // Optimization results
  if (results.tests.optimizations) {
    componentsHtml += `
      <div class="section component">
        <h2>Performance Optimization</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Optimizations</div>
            <div class="metric-value">${results.tests.optimizations.summary.optimizationsIdentified}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Expected Impact</div>
            <div class="metric-value">${results.tests.optimizations.summary.estimatedImpact.loadTimeReduction} load time reduction</div>
          </div>
          <div class="metric">
            <div class="metric-label">User Capacity</div>
            <div class="metric-value">${results.tests.optimizations.summary.estimatedImpact.userCapacityEstimate}</div>
          </div>
        </div>
        
        <h3>Key Optimization Areas</h3>
        <ul>
          ${results.tests.optimizations.database.slice(0, 3).map(opt => 
            `<li><strong>${opt.issue}</strong>: ${opt.recommendation}</li>`).join('\n')}
        </ul>
      </div>
    `;
  }
  
  // Metadata results
  if (results.tests.metadata) {
    const status = results.tests.metadata.summary.averageScore >= 80 ? 
      '<span class="status-pass">PASS</span>' : 
      '<span class="status-fail">FAIL</span>';
    
    componentsHtml += `
      <div class="section component">
        <h2>SEO Metadata ${status}</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Average Score</div>
            <div class="metric-value">${results.tests.metadata.summary.averageScore}/100</div>
          </div>
          <div class="metric">
            <div class="metric-label">Pages Checked</div>
            <div class="metric-value">${results.tests.metadata.summary.pagesChecked}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Pages With Issues</div>
            <div class="metric-value">${results.tests.metadata.summary.pagesWithIssues}</div>
          </div>
        </div>
        
        ${results.tests.metadata.summary.missingMeta && Object.keys(results.tests.metadata.summary.missingMeta).length > 0 ? `
        <h3>Common Missing Metadata</h3>
        <ul>
          ${Object.entries(results.tests.metadata.summary.missingMeta)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type, count]) => `<li>${type}: missing on ${count} pages</li>`)
            .join('\n')}
        </ul>
        ` : ''}
      </div>
    `;
  }
  
  // Deployment health
  if (results.tests.health) {
    const status = results.tests.health.summary.readyForDeployment ? 
      '<span class="status-pass">PASS</span>' : 
      '<span class="status-fail">FAIL</span>';
    
    componentsHtml += `
      <div class="section component">
        <h2>Deployment Health ${status}</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Overall Score</div>
            <div class="metric-value">${results.tests.health.summary.score}/100</div>
          </div>
          <div class="metric">
            <div class="metric-label">Status</div>
            <div class="metric-value">${results.tests.health.summary.status}</div>
          </div>
        </div>
        
        <h3>Component Health</h3>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Server</div>
            <div class="metric-value">${results.tests.health.server.score}/100</div>
          </div>
          <div class="metric">
            <div class="metric-label">Database</div>
            <div class="metric-value">${results.tests.health.database.score}/100</div>
          </div>
          <div class="metric">
            <div class="metric-label">Environment</div>
            <div class="metric-value">${results.tests.health.environment.score}/100</div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Create checklist for launch
  const checklist = [
    { item: 'Functionality tests passing', status: results.summary.passingComponents.includes('Functionality Tests') },
    { item: 'Performance meets <2s load time target', status: results.tests.comprehensive?.performance?.summary?.overall?.targetMet || false },
    { item: 'Security assessment passing', status: results.tests.comprehensive?.security?.summary?.overallScore >= 7 || false },
    { item: 'Platform can handle 20,000 concurrent users', status: results.tests.optimizations?.summary?.estimatedImpact?.userCapacityEstimate?.includes('25,000+') || false },
    { item: 'SEO metadata properly implemented', status: results.tests.metadata?.summary?.averageScore >= 80 || false },
    { item: 'Deployment health check passing', status: results.tests.health?.summary?.readyForDeployment || false },
    { item: 'All critical issues addressed', status: results.summary.criticalIssues.length === 0 }
  ];
  
  // Generate HTML report
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RXAI Platform Pre-Launch Assessment</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    h1, h2, h3, h4 {
      color: #0066cc;
    }
    .header {
      background-color: #0066cc;
      color: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header h1 {
      color: white;
      margin: 0 0 10px 0;
    }
    .summary {
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .critical-issues {
      background-color: #fee2e2;
      border-left: 5px solid #ef4444;
      padding: 15px 20px;
      border-radius: 0 10px 10px 0;
      margin-bottom: 20px;
    }
    .recommendations {
      background-color: #e0f2fe;
      border-left: 5px solid #0284c7;
      padding: 15px 20px;
      border-radius: 0 10px 10px 0;
      margin-bottom: 20px;
    }
    .section {
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .component {
      border-top: 5px solid #0066cc;
    }
    .status-pass {
      color: #22c55e;
      font-weight: bold;
      background-color: #dcfce7;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.9rem;
      margin-left: 8px;
    }
    .status-fail {
      color: #ef4444;
      font-weight: bold;
      background-color: #fee2e2;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.9rem;
      margin-left: 8px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 15px;
      margin: 15px 0;
    }
    .metric {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
    }
    .metric-label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9em;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 1.2em;
      font-weight: 500;
    }
    .checklist {
      margin: 20px 0;
    }
    .checklist-item {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #e5e7eb;
      background-color: white;
    }
    .checklist-item:first-child {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    .checklist-item:last-child {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      border-bottom: none;
    }
    .checklist-item.pass {
      background-color: #f0fdf4;
    }
    .checklist-item.fail {
      background-color: #fef2f2;
    }
    .checklist-icon {
      margin-right: 15px;
      font-size: 1.2em;
    }
    .checklist-label {
      flex-grow: 1;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #6b7280;
      font-size: 0.9em;
    }
    .launch-button {
      display: inline-block;
      background-color: ${results.summary.readyForLaunch ? '#22c55e' : '#9ca3af'};
      color: white;
      font-weight: bold;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: ${results.summary.readyForLaunch ? 'pointer' : 'not-allowed'};
      text-decoration: none;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>RXAI Platform Pre-Launch Assessment</h1>
    <p>Assessment completed on ${new Date(results.timestamp).toLocaleString()}</p>
  </div>
  
  <div class="summary">
    <h2>Launch Readiness</h2>
    <p style="font-size: 1.2em;">${readyStatus}</p>
    
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Passing Components</div>
        <div class="metric-value">${results.summary.passingComponents.length}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Failing Components</div>
        <div class="metric-value">${results.summary.failingComponents.length}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Critical Issues</div>
        <div class="metric-value">${results.summary.criticalIssues.length}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Recommendations</div>
        <div class="metric-value">${results.summary.recommendations.length}</div>
      </div>
    </div>
    
    <h3>Launch Checklist</h3>
    <div class="checklist">
      ${checklist.map(item => `
        <div class="checklist-item ${item.status ? 'pass' : 'fail'}">
          <span class="checklist-icon">${item.status ? '✅' : '❌'}</span>
          <span class="checklist-label">${item.item}</span>
        </div>
      `).join('\n')}
    </div>
    
    ${results.summary.readyForLaunch ? `
    <div style="text-align: center;">
      <a href="#" class="launch-button">PROCEED WITH LAUNCH</a>
    </div>
    ` : `
    <div style="text-align: center;">
      <div class="launch-button">FIX ISSUES BEFORE LAUNCH</div>
    </div>
    `}
  </div>
  
  ${criticalIssuesHtml}
  ${recommendationsHtml}
  
  <h2>Component Details</h2>
  ${componentsHtml}
  
  <div class="footer">
    <p>RXAI Platform Pre-Launch Assessment | Generated on ${new Date(results.timestamp).toLocaleString()}</p>
    <p>Assessment completed in ${results.executionTime} seconds</p>
  </div>
</body>
</html>`;
}

// Run assessment if this file is executed directly
// (Using a different approach for ES modules since require.main === module doesn't work)
const isMainModule = import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:5000';
  
  runPrelaunchAssessment({ baseUrl })
    .then(results => {
      console.log('\n================================================');
      console.log('📋 RXAI PLATFORM PRE-LAUNCH ASSESSMENT RESULTS 📋');
      console.log('================================================\n');
      
      console.log(`Launch Readiness: ${results.summary.readyForLaunch ? 'READY FOR LAUNCH ✅' : 'NOT READY FOR LAUNCH ❌'}`);
      console.log(`Passing Components: ${results.summary.passingComponents.length}`);
      console.log(`Failing Components: ${results.summary.failingComponents.length}`);
      
      if (results.summary.criticalIssues.length > 0) {
        console.log('\n⚠️ CRITICAL ISSUES:');
        results.summary.criticalIssues.forEach((issue, i) => {
          console.log(`  ${i+1}. ${issue}`);
        });
      }
      
      if (results.summary.recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        results.summary.recommendations.forEach((rec, i) => {
          console.log(`  ${i+1}. ${rec}`);
        });
      }
      
      console.log(`\nFull report saved to: ${path.join('logs', 'prelaunch-assessment-*.html')}`);
      
      process.exit(results.summary.readyForLaunch ? 0 : 1);
    })
    .catch(error => {
      console.error('Assessment failed:', error);
      process.exit(1);
    });
}

export {
  runPrelaunchAssessment
};