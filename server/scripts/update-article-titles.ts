import { Pool } from '@neondatabase/serverless';
import { logger } from '../utils/logger';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// AI Topics - these are the topics we intended to generate articles about
const AI_TOPICS = [
  "AI-Powered Decision Making in Corporate Strategy",
  "Ethical Frameworks for Generative AI in Business",
  "AI and the Future of Customer Experience Personalization",
  "Machine Learning for Business Forecasting and Planning",
  "Practical Applications of Large Language Models in Marketing",
  "AI Governance and Compliance for Technology Leaders",
  "Implementing AI Solutions for Process Automation",
  "The Role of AI in Data Analytics and Business Intelligence",
  "Privacy-Preserving AI Technologies in Enterprise Settings",
  "AI Augmentation vs. Automation in the Modern Workplace",
  "Leveraging Computer Vision for Retail Innovation",
  "Explainable AI for Non-Technical Stakeholders",
  "AI-Enabled Supply Chain Optimization Strategies",
  "The Evolution of Natural Language Processing in Business Communication",
  "AI-Enhanced Cybersecurity Protection for Enterprises",
  "The Role of AI in Sustainable Business Practices",
  "AI Tools for Content Creation and Marketing",
  "Measuring ROI on Enterprise AI Implementations",
  "Conversational AI and the Future of Customer Support",
  "AI-Powered HR and Talent Management Solutions",
  "Edge AI Applications for Business Efficiency",
  "AI in Product Development and Innovation Cycles",
  "Building AI Literacy Across Organization Levels",
  "Quantum Computing and AI: Practical Convergence Points",
  "AI-Driven Competitive Intelligence Strategies",
  "Emotional Intelligence in AI Systems",
  "AI for Small Business: Accessible Implementation Approaches",
  "The Impact of AI on Digital Transformation Initiatives",
  "AI-Enhanced Decision Support Systems",
  "Addressing AI Hallucinations in Business Applications",
  "Low-Code/No-Code AI Development Platforms",
  "AI in Legal and Regulatory Compliance",
  "Neurosymbolic AI Applications in Enterprise Settings",
  "AI-Powered Marketing Attribution Models",
  "Multimodal AI in Content Analysis and Creation",
  "AI-Assisted Collaborative Work Environments",
  "Responsible AI and Data Privacy Compliance",
  "AI Integration with IoT for Business Intelligence",
  "The Role of AI in Enhancing Remote Work Productivity",
  "Foundation Models Customization for Industry-Specific Needs",
  "AI in Energy Optimization and Management",
  "Predictive Maintenance with AI and Machine Learning",
  "AI-Driven Customer Segmentation Strategies",
  "Blockchain and AI Integration for Business Solutions",
  "AI Ethics and Brand Reputation Management",
  "AI Applications in Pricing Strategy and Optimization",
  "Voice AI Advancements in Business Applications",
  "AI for Environmental Sustainability in Business Operations",
  "AI-Enhanced Project Management Methodologies"
];

/**
 * Creates a SEO-friendly slug from a title
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Updates article titles and SEO titles with specific AI topics
 */
export async function updateArticleTitles(): Promise<{
  success: number;
  total: number;
  topics: string[];
}> {
  try {
    logger.info('Starting article title update...');
    
    // Get all articles with generic "AI Article" title
    const { rows: articles } = await pool.query(
      'SELECT id FROM posts WHERE title = $1 ORDER BY id ASC',
      ['AI Article']
    );
    
    if (articles.length === 0) {
      logger.info('No generic articles found to update');
      return;
    }
    
    logger.info(`Found ${articles.length} articles to update`);
    
    // Process max 50 topics (or as many as we have)
    const topicsToUse = AI_TOPICS.slice(0, Math.min(articles.length, AI_TOPICS.length));
    
    let successCount = 0;
    
    // Update each article with a topic from our list
    for (let i = 0; i < articles.length && i < topicsToUse.length; i++) {
      const articleId = articles[i].id;
      const newTitle = topicsToUse[i];
      const seoTitle = createSlug(newTitle);
      
      // Update the article title, seo_title, and category
      await pool.query(
        'UPDATE posts SET title = $1, seo_title = $2, category = $3 WHERE id = $4',
        [newTitle, seoTitle, 'AI & Technology', articleId]
      );
      
      // Also update the tags to include topic-specific keywords
      const keywords = newTitle.toLowerCase()
        .replace(/[^\w\s]/g, ' ')  // Replace non-alphanumeric with spaces
        .split(' ')
        .filter(word => word.length > 3)  // Only use words longer than 3 chars
        .filter((word, index, self) => self.indexOf(word) === index)  // Remove duplicates
        .slice(0, 5);  // Take up to 5 keywords
      
      const tags = JSON.stringify([...new Set(['ai', 'technology', 'business', ...keywords])]);
      
      await pool.query(
        'UPDATE posts SET tags = $1 WHERE id = $2',
        [tags, articleId]
      );
      
      logger.info(`Updated article ${articleId}: "${newTitle}"`);
      successCount++;
    }
    
    logger.info(`Article title update complete. Updated ${successCount} of ${articles.length} articles`);
    
  } catch (error) {
    logger.error('Error updating article titles:', error);
  } finally {
    pool.end();
  }
}

// Run the update function
updateArticleTitles()
  .then(() => logger.info('Title update process finished'))
  .catch(err => logger.error('Title update process failed:', err));