/**
 * RXAI Platform Metadata Checker
 * 
 * This utility verifies and optimizes SEO metadata across all pages
 * to ensure proper search engine indexing and social sharing.
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const axios = require('axios');
const cheerio = require('cheerio');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'metadata-checker' },
  transports: [
    new winston.transports.File({ filename: 'logs/metadata-checker.log' }),
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
 * List of critical pages to check
 */
const CRITICAL_PAGES = [
  { path: '/', name: 'Home Page' },
  { path: '/articles', name: 'Articles List' },
  { path: '/news', name: 'News Hub' },
  { path: '/ai-course-platform', name: 'AI Course Platform' },
  { path: '/digital-tools', name: 'Digital Tools' },
  { path: '/subscriptions', name: 'Subscriptions' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' }
];

/**
 * Required metadata for proper SEO
 */
const REQUIRED_META = [
  { name: 'title', selector: 'title', required: true },
  { name: 'meta description', selector: 'meta[name="description"]', attr: 'content', required: true },
  { name: 'canonical URL', selector: 'link[rel="canonical"]', attr: 'href', required: true },
  { name: 'og:title', selector: 'meta[property="og:title"]', attr: 'content', required: true },
  { name: 'og:description', selector: 'meta[property="og:description"]', attr: 'content', required: true },
  { name: 'og:image', selector: 'meta[property="og:image"]', attr: 'content', required: true },
  { name: 'og:url', selector: 'meta[property="og:url"]', attr: 'content', required: true },
  { name: 'og:type', selector: 'meta[property="og:type"]', attr: 'content', required: true },
  { name: 'twitter:card', selector: 'meta[name="twitter:card"]', attr: 'content', required: true },
  { name: 'twitter:title', selector: 'meta[name="twitter:title"]', attr: 'content', required: true },
  { name: 'twitter:description', selector: 'meta[name="twitter:description"]', attr: 'content', required: true },
  { name: 'twitter:image', selector: 'meta[name="twitter:image"]', attr: 'content', required: true },
  { name: 'robots', selector: 'meta[name="robots"]', attr: 'content', required: false },
  { name: 'keywords', selector: 'meta[name="keywords"]', attr: 'content', required: false }
];

/**
 * Check metadata on a single page
 * @param {string} url - URL to check
 * @param {string} pageName - Human-readable page name
 * @returns {Promise<Object>} Metadata analysis
 */
async function checkPageMetadata(url, pageName) {
  logger.info(`Checking metadata for ${pageName} (${url})`);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'RXAI-MetadataChecker/1.0'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const results = {
      url,
      name: pageName,
      present: [],
      missing: [],
      issues: [],
      score: 0
    };
    
    // Check each required metadata element
    REQUIRED_META.forEach(meta => {
      const element = $(meta.selector);
      const value = meta.attr ? element.attr(meta.attr) : element.text();
      
      if (!value || value.trim() === '') {
        if (meta.required) {
          results.missing.push(meta.name);
          results.issues.push(`Missing required ${meta.name}`);
        }
      } else {
        results.present.push({
          name: meta.name,
          value: value.trim()
        });
        
        // Check for quality issues
        if (meta.name === 'title') {
          if (value.length < 10 || value.length > 70) {
            results.issues.push(`Title length (${value.length}) outside recommended range (10-70 characters)`);
          }
          if (!value.toLowerCase().includes('rxai') && !value.toLowerCase().includes('ai')) {
            results.issues.push(`Title should include brand name or AI reference`);
          }
        }
        
        if (meta.name === 'meta description') {
          if (value.length < 50 || value.length > 160) {
            results.issues.push(`Description length (${value.length}) outside recommended range (50-160 characters)`);
          }
        }
        
        if (meta.name === 'og:image' || meta.name === 'twitter:image') {
          if (!value.startsWith('http')) {
            results.issues.push(`${meta.name} should use absolute URL`);
          }
        }
      }
    });
    
    // Check for structured data (JSON-LD)
    const jsonLD = $('script[type="application/ld+json"]');
    if (jsonLD.length === 0) {
      results.issues.push('Missing structured data (JSON-LD)');
    } else {
      results.present.push({
        name: 'JSON-LD',
        value: 'Present'
      });
    }
    
    // Calculate score (0-100)
    const requiredCount = REQUIRED_META.filter(m => m.required).length + 1; // +1 for JSON-LD
    const foundCount = requiredCount - results.missing.length - (jsonLD.length === 0 ? 1 : 0);
    const percentage = (foundCount / requiredCount) * 100;
    
    // Deduct points for quality issues (10 points max)
    const qualityPenalty = Math.min(10, results.issues.length * 2);
    
    results.score = Math.max(0, Math.round(percentage - qualityPenalty));
    results.grade = getMetadataGrade(results.score);
    
    logger.info(`${pageName} metadata score: ${results.score}/100 (${results.grade})`);
    if (results.issues.length > 0) {
      logger.warn(`${pageName} has ${results.issues.length} metadata issues`);
    }
    
    return results;
  } catch (error) {
    logger.error(`Error checking metadata for ${pageName}: ${error.message}`);
    return {
      url,
      name: pageName,
      error: error.message,
      failed: true,
      score: 0,
      grade: 'F'
    };
  }
}

/**
 * Get a letter grade based on numeric score
 * @param {number} score - Score from 0-100
 * @returns {string} Letter grade
 */
function getMetadataGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Generate template for missing metadata
 * @param {Object} pageResults - Results of page analysis
 * @returns {string} HTML metadata template
 */
function generateMetadataTemplate(pageResults) {
  const pageName = pageResults.name;
  const pageTitle = `RXAI - ${pageName} | The World Leader in Artificial Intelligence Education`;
  const pageDescription = `Explore RXAI's ${pageName.toLowerCase()}, part of our comprehensive AI education platform. Learn AI skills, access digital tools, and transform your knowledge with the world leader in artificial intelligence education.`;
  
  const template = `
<!-- SEO Metadata for ${pageName} -->
<title>${pageTitle}</title>
<meta name="description" content="${pageDescription}" />
<link rel="canonical" href="${pageResults.url}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${pageResults.url}" />
<meta property="og:title" content="${pageTitle}" />
<meta property="og:description" content="${pageDescription}" />
<meta property="og:image" content="https://rxai.com/images/rxai-${pageName.toLowerCase().replace(/\s+/g, '-')}-cover.jpg" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${pageResults.url}" />
<meta name="twitter:title" content="${pageTitle}" />
<meta name="twitter:description" content="${pageDescription}" />
<meta name="twitter:image" content="https://rxai.com/images/rxai-${pageName.toLowerCase().replace(/\s+/g, '-')}-cover.jpg" />

<!-- Optional but recommended -->
<meta name="robots" content="index, follow" />
<meta name="keywords" content="RXAI, artificial intelligence, ${pageName.toLowerCase()}, AI education, learn AI" />

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "${pageTitle}",
  "description": "${pageDescription}",
  "url": "${pageResults.url}",
  "image": "https://rxai.com/images/rxai-${pageName.toLowerCase().replace(/\s+/g, '-')}-cover.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "RXAI",
    "logo": {
      "@type": "ImageObject",
      "url": "https://rxai.com/images/rxai-logo.png"
    }
  }
}
</script>
`;

  return template;
}

/**
 * Check metadata across all critical pages
 * @param {string} baseUrl - Base URL of the site
 * @returns {Promise<Object>} Comprehensive metadata analysis
 */
async function checkAllMetadata(baseUrl = 'http://localhost:5000') {
  logger.info(`Starting comprehensive metadata check for ${baseUrl}`);
  const startTime = Date.now();
  
  const results = {
    pages: {},
    summary: {
      pagesChecked: 0,
      pagesWithIssues: 0,
      totalIssues: 0,
      averageScore: 0,
      missingMeta: {}
    }
  };
  
  // Check each critical page
  for (const page of CRITICAL_PAGES) {
    const pageUrl = `${baseUrl}${page.path}`;
    results.pages[page.path] = await checkPageMetadata(pageUrl, page.name);
    results.summary.pagesChecked++;
    
    if (results.pages[page.path].issues && results.pages[page.path].issues.length > 0) {
      results.summary.pagesWithIssues++;
      results.summary.totalIssues += results.pages[page.path].issues.length;
    }
    
    // Track missing metadata types
    if (results.pages[page.path].missing) {
      results.pages[page.path].missing.forEach(metaType => {
        results.summary.missingMeta[metaType] = (results.summary.missingMeta[metaType] || 0) + 1;
      });
    }
  }
  
  // Calculate average score
  let totalScore = 0;
  let scoredPages = 0;
  
  Object.values(results.pages).forEach(page => {
    if (!page.failed && typeof page.score === 'number') {
      totalScore += page.score;
      scoredPages++;
    }
  });
  
  results.summary.averageScore = scoredPages > 0 ? Math.round(totalScore / scoredPages) : 0;
  results.summary.averageGrade = getMetadataGrade(results.summary.averageScore);
  
  // Generate templates for pages with issues
  results.templates = {};
  Object.entries(results.pages).forEach(([path, pageResult]) => {
    if (pageResult.issues && pageResult.issues.length > 0) {
      results.templates[path] = generateMetadataTemplate(pageResult);
    }
  });
  
  const endTime = Date.now();
  results.executionTime = (endTime - startTime) / 1000;
  
  logger.info(`Metadata check completed in ${results.executionTime.toFixed(2)} seconds`);
  logger.info(`Average metadata score: ${results.summary.averageScore}/100 (${results.summary.averageGrade})`);
  logger.info(`Pages with issues: ${results.summary.pagesWithIssues}/${results.summary.pagesChecked}`);
  
  // Save results to file
  const resultsPath = path.join('logs', `metadata-check-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  logger.info(`Metadata check results saved to: ${resultsPath}`);
  
  // Create a more readable report for templates
  if (Object.keys(results.templates).length > 0) {
    const templatePath = path.join('logs', `metadata-templates-${new Date().toISOString().replace(/:/g, '-')}.txt`);
    let templateContent = '# RXAI METADATA TEMPLATES\n\n';
    
    Object.entries(results.templates).forEach(([path, template]) => {
      templateContent += `## ${results.pages[path].name} (${path})\n\n\`\`\`html\n${template}\n\`\`\`\n\n`;
    });
    
    fs.writeFileSync(templatePath, templateContent);
    logger.info(`Metadata templates saved to: ${templatePath}`);
  }
  
  return results;
}

// Run checkAllMetadata if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:5000';
  
  checkAllMetadata(baseUrl)
    .then(results => {
      console.log(`\n=== METADATA CHECK SUMMARY ===`);
      console.log(`Pages checked: ${results.summary.pagesChecked}`);
      console.log(`Pages with issues: ${results.summary.pagesWithIssues}`);
      console.log(`Average score: ${results.summary.averageScore}/100 (${results.summary.averageGrade})`);
      console.log(`Total issues found: ${results.summary.totalIssues}`);
      
      if (Object.keys(results.summary.missingMeta).length > 0) {
        console.log(`\nMost common missing metadata:`);
        const sortedMissing = Object.entries(results.summary.missingMeta)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        
        sortedMissing.forEach(([metaType, count]) => {
          console.log(`  - ${metaType}: missing on ${count} pages`);
        });
      }
      
      console.log(`\nSee ${path.join('logs', 'metadata-check-*.json')} for full details`);
      if (Object.keys(results.templates).length > 0) {
        console.log(`See ${path.join('logs', 'metadata-templates-*.txt')} for recommended templates`);
      }
      
      process.exit(results.summary.averageScore >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('Metadata check failed:', error);
      process.exit(1);
    });
}

module.exports = {
  checkPageMetadata,
  checkAllMetadata,
  generateMetadataTemplate
};