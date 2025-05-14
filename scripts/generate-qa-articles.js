/**
 * Admin script to initiate the generation of Customer Q&A articles
 * 
 * Usage:
 * node scripts/generate-qa-articles.js [startIndex] [count]
 * 
 * Examples:
 * - Generate all 50 articles: node scripts/generate-qa-articles.js
 * - Generate 10 articles starting from index 0: node scripts/generate-qa-articles.js 0 10
 * - Generate 5 articles starting from index 20: node scripts/generate-qa-articles.js 20 5
 */

const fetch = require('node-fetch');

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0] || '0', 10);
  const count = parseInt(args[1] || '50', 10);
  
  console.log(`Initiating Customer Q&A article generation: startIndex=${startIndex}, count=${count}`);
  
  try {
    // Make the API request to start the generation process
    const response = await fetch('http://localhost:5000/api/content-generation/customer-qa-articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In a real environment, you would need to include authentication headers
        // This script assumes you're running it locally and are already authenticated
      },
      body: JSON.stringify({
        startIndex,
        count
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Response:', data);
    console.log(`
====================================
Article generation has been initiated!
====================================

${data.message}

Estimated time: ${data.estimatedTime}

You can check the progress in the server logs.
Articles will appear in the Content Hub as they are generated.
    `);
  } catch (error) {
    console.error('Error initiating article generation:', error);
    process.exit(1);
  }
}

main();