/**
 * RXAI Platform SEO Audit Utility
 * 
 * This utility provides automated testing for SEO compliance across the platform
 * including meta tags, schema markup, and internal linking structure.
 */

const axios = require('axios');
const cheerio = require('cheerio');
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
  defaultMeta: { service: 'seo-audit' },
  transports: [
    new winston.transports.File({ filename: 'logs/seo-audit.log' }),
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
 * Analyze meta tags on a page
 * @param {Object} $ - Cheerio DOM object
 * @param {string} url - Page URL
 * @returns {Object} Meta tag analysis
 */
function analyzeMetaTags($, url) {
  const pageTitle = $('title').text();
  const metaDescription = $('meta[name="description"]').attr('content');
  const metaKeywords = $('meta[name="keywords"]').attr('content');
  const canonicalUrl = $('link[rel="canonical"]').attr('href');
  const robots = $('meta[name="robots"]').attr('content');
  
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogUrl = $('meta[property="og:url"]').attr('content');
  const ogType = $('meta[property="og:type"]').attr('content');
  
  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  const twitterDescription = $('meta[name="twitter:description"]').attr('content');
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  
  // Required meta tags for SEO best practices
  const requiredTags = [
    { name: 'title', value: pageTitle },
    { name: 'meta description', value: metaDescription },
    { name: 'canonical url', value: canonicalUrl },
    { name: 'og:title', value: ogTitle },
    { name: 'og:description', value: ogDescription },
    { name: 'og:image', value: ogImage },
    { name: 'twitter:card', value: twitterCard },
    { name: 'twitter:title', value: twitterTitle },
    { name: 'twitter:description', value: twitterDescription }
  ];
  
  const missingTags = requiredTags.filter(tag => !tag.value);
  
  // Check title length (recommended: 50-60 characters)
  const titleLengthIssue = pageTitle && (pageTitle.length < 30 || pageTitle.length > 60);
  
  // Check description length (recommended: 150-160 characters)
  const descriptionLengthIssue = metaDescription && (metaDescription.length < 120 || metaDescription.length > 160);
  
  // Results object
  const results = {
    title: {
      value: pageTitle,
      length: pageTitle ? pageTitle.length : 0,
      issues: titleLengthIssue ? [`Title length (${pageTitle ? pageTitle.length : 0}) is outside recommended range of 50-60 characters`] : []
    },
    description: {
      value: metaDescription,
      length: metaDescription ? metaDescription.length : 0,
      issues: descriptionLengthIssue ? [`Description length (${metaDescription ? metaDescription.length : 0}) is outside recommended range of 150-160 characters`] : []
    },
    keywords: {
      value: metaKeywords
    },
    canonical: {
      value: canonicalUrl,
      issues: !canonicalUrl ? ['Missing canonical URL'] : []
    },
    robots: {
      value: robots
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      url: ogUrl,
      type: ogType,
      issues: []
    },
    twitter: {
      card: twitterCard,
      title: twitterTitle,
      description: twitterDescription,
      image: twitterImage,
      issues: []
    },
    missingTags: missingTags.map(tag => tag.name),
    overallScore: 0
  };
  
  // Check for OpenGraph issues
  if (!ogTitle) results.openGraph.issues.push('Missing og:title');
  if (!ogDescription) results.openGraph.issues.push('Missing og:description');
  if (!ogImage) results.openGraph.issues.push('Missing og:image');
  if (!ogUrl) results.openGraph.issues.push('Missing og:url');
  if (!ogType) results.openGraph.issues.push('Missing og:type');
  
  // Check for Twitter card issues
  if (!twitterCard) results.twitter.issues.push('Missing twitter:card');
  if (!twitterTitle) results.twitter.issues.push('Missing twitter:title');
  if (!twitterDescription) results.twitter.issues.push('Missing twitter:description');
  if (!twitterImage) results.twitter.issues.push('Missing twitter:image');
  
  // Calculate overall score (10 = perfect, 0 = very poor)
  let score = 10;
  
  // Deduct for missing tags (0.5 points each)
  score -= missingTags.length * 0.5;
  
  // Deduct for title/description length issues (1 point each)
  if (titleLengthIssue) score -= 1;
  if (descriptionLengthIssue) score -= 1;
  
  // Ensure score is in 0-10 range
  results.overallScore = Math.max(0, Math.min(10, score));
  
  return results;
}

/**
 * Analyze JSON-LD schema markup on a page
 * @param {Object} $ - Cheerio DOM object
 * @returns {Object} Schema markup analysis
 */
function analyzeSchemaMarkup($) {
  const schemas = [];
  const issues = [];
  
  $('script[type="application/ld+json"]').each((i, element) => {
    try {
      const schema = JSON.parse($(element).html());
      schemas.push(schema);
    } catch (error) {
      issues.push(`Invalid JSON-LD schema: ${error.message}`);
    }
  });
  
  return {
    foundSchemas: schemas.length,
    schemas,
    issues,
    hasValidSchema: schemas.length > 0 && issues.length === 0
  };
}

/**
 * Analyze internal links on a page
 * @param {Object} $ - Cheerio DOM object
 * @param {string} baseUrl - Base URL of the site
 * @returns {Object} Internal link analysis
 */
function analyzeInternalLinks($, baseUrl) {
  const links = [];
  const issues = [];
  
  $('a').each((i, element) => {
    const href = $(element).attr('href');
    const text = $(element).text().trim();
    
    if (!href) {
      issues.push(`Link #${i+1} has no href attribute: ${text}`);
      return;
    }
    
    // Filter out external links, anchors, and javascript links
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return;
    }
    
    // Determine if internal or external
    const isInternal = !href.startsWith('http') || href.startsWith(baseUrl);
    
    links.push({
      href,
      text,
      isInternal
    });
    
    // Check for SEO issues with links
    if (text.length < 3 && isInternal) {
      issues.push(`Link text too short (${text.length} chars): ${text}`);
    }
    
    if (text.toLowerCase() === 'click here' || text.toLowerCase() === 'read more') {
      issues.push(`Generic link text "${text}" is not descriptive`);
    }
  });
  
  // Filter to just internal links
  const internalLinks = links.filter(link => link.isInternal);
  
  return {
    totalLinks: links.length,
    internalLinks: internalLinks.length,
    externalLinks: links.length - internalLinks.length,
    links,
    issues,
    overallScore: calculateLinkScore(internalLinks.length, issues.length)
  };
}

/**
 * Calculate a score for internal linking (10 = excellent, 0 = poor)
 * @param {number} internalLinkCount - Number of internal links
 * @param {number} issueCount - Number of issues found
 * @returns {number} Score from 0-10
 */
function calculateLinkScore(internalLinkCount, issueCount) {
  // Start with base score based on number of internal links
  let score = 0;
  
  if (internalLinkCount >= 20) score = 10;
  else if (internalLinkCount >= 15) score = 9;
  else if (internalLinkCount >= 10) score = 8;
  else if (internalLinkCount >= 7) score = 7;
  else if (internalLinkCount >= 5) score = 6;
  else if (internalLinkCount >= 3) score = 5;
  else if (internalLinkCount >= 1) score = 4;
  else score = 2;
  
  // Deduct for issues (0.5 points per issue, max 5 points deduction)
  score -= Math.min(5, issueCount * 0.5);
  
  // Ensure score is in 0-10 range
  return Math.max(0, Math.min(10, score));
}

/**
 * Test a single page for SEO compliance
 * @param {string} url - URL to test
 * @param {string} name - Page name
 * @returns {Promise<Object>} SEO audit results
 */
async function testPage(url, name) {
  logger.info(`Testing SEO for page: ${name} (${url})`);
  
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const baseUrl = new URL(url).origin;
    
    const metaTagAnalysis = analyzeMetaTags($, url);
    const schemaAnalysis = analyzeSchemaMarkup($);
    const linkAnalysis = analyzeInternalLinks($, baseUrl);
    
    // Calculate overall score (weighted average)
    const metaWeight = 0.5; // 50%
    const schemaWeight = 0.3; // 30%
    const linkWeight = 0.2; // 20%
    
    // Schema score based on presence and validity
    const schemaScore = schemaAnalysis.hasValidSchema ? 10 : (schemaAnalysis.foundSchemas > 0 ? 5 : 0);
    
    const overallScore = (
      metaTagAnalysis.overallScore * metaWeight +
      schemaScore * schemaWeight +
      linkAnalysis.overallScore * linkWeight
    );
    
    const results = {
      url,
      name,
      title: metaTagAnalysis.title.value,
      metaTags: metaTagAnalysis,
      schema: schemaAnalysis,
      links: linkAnalysis,
      overallScore,
      rating: getSeoRating(overallScore),
      issues: [
        ...metaTagAnalysis.missingTags.map(tag => `Missing ${tag}`),
        ...metaTagAnalysis.title.issues,
        ...metaTagAnalysis.description.issues,
        ...metaTagAnalysis.canonical.issues,
        ...metaTagAnalysis.openGraph.issues,
        ...metaTagAnalysis.twitter.issues,
        ...schemaAnalysis.issues,
        ...linkAnalysis.issues
      ]
    };
    
    logger.info(`SEO test results for ${name}: Score: ${overallScore.toFixed(1)}/10, Rating: ${results.rating}`);
    logger.info(`Found ${results.issues.length} issues`);
    
    return results;
  } catch (error) {
    logger.error(`SEO test failed for ${name}: ${error.message}`);
    return {
      url,
      name,
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
function getSeoRating(score) {
  if (score >= 9) return 'Excellent';
  if (score >= 7.5) return 'Good';
  if (score >= 6) return 'Satisfactory';
  if (score >= 4) return 'Needs Improvement';
  return 'Poor';
}

/**
 * Run a full SEO audit on multiple pages
 * @param {string} baseUrl - Base URL of the site
 * @returns {Promise<Object>} Comprehensive SEO audit results
 */
async function runSeoAudit(baseUrl = 'http://localhost:5000') {
  logger.info('Starting comprehensive SEO audit');
  const startTime = performance.now();
  
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/articles', name: 'Articles' },
    { path: '/news', name: 'News Hub' },
    { path: '/ai-course-platform', name: 'AI Course Platform' },
    { path: '/digital-tools', name: 'Digital Tools' }
  ];
  
  const results = {
    pages: {},
    summary: {}
  };
  
  for (const page of pages) {
    const url = `${baseUrl}${page.path}`;
    results.pages[page.path] = await testPage(url, page.name);
  }
  
  // Calculate overall site stats
  const pageResults = Object.values(results.pages).filter(result => !result.failed);
  
  if (pageResults.length > 0) {
    const totalScore = pageResults.reduce((sum, page) => sum + page.overallScore, 0);
    const avgScore = totalScore / pageResults.length;
    
    // Count total issues across all pages
    const allIssues = pageResults.flatMap(page => page.issues);
    
    // Count pages by rating
    const ratingCounts = {
      Excellent: pageResults.filter(page => page.rating === 'Excellent').length,
      Good: pageResults.filter(page => page.rating === 'Good').length,
      Satisfactory: pageResults.filter(page => page.rating === 'Satisfactory').length,
      'Needs Improvement': pageResults.filter(page => page.rating === 'Needs Improvement').length,
      Poor: pageResults.filter(page => page.rating === 'Poor').length
    };
    
    results.summary = {
      pagesAudited: pages.length,
      pagesSucceeded: pageResults.length,
      pagesFailed: pages.length - pageResults.length,
      averageScore: avgScore,
      overallRating: getSeoRating(avgScore),
      totalIssues: allIssues.length,
      ratingCounts
    };
  } else {
    results.summary = {
      pagesAudited: pages.length,
      pagesSucceeded: 0,
      pagesFailed: pages.length,
      failed: true
    };
  }
  
  const endTime = performance.now();
  results.executionTime = (endTime - startTime).toFixed(2);
  
  logger.info(`SEO audit completed in ${results.executionTime}ms`);
  logger.info(`Overall SEO rating: ${results.summary.overallRating || 'Failed'}, Avg score: ${results.summary.averageScore ? results.summary.averageScore.toFixed(1) : 'N/A'}`);
  logger.info(`Found ${results.summary.totalIssues || 'N/A'} issues across ${results.summary.pagesSucceeded} pages`);
  
  // Save SEO report
  const reportPath = path.join('logs', `seo-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  logger.info(`SEO report saved to ${reportPath}`);
  
  return results;
}

// Export functions
module.exports = {
  testPage,
  runSeoAudit
};

// Run audit directly if executed as a script
if (require.main === module) {
  runSeoAudit()
    .then(results => {
      console.log(`SEO audit completed. Overall rating: ${results.summary.overallRating || 'Failed'}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('SEO audit failed:', error);
      process.exit(1);
    });
}