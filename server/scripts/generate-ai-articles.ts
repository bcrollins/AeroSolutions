import { db } from '../db';
import { posts } from '../../shared/schema';
import { grokApi } from '../grok';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Admin user ID for content authorship
const ADMIN_USER_ID = 1; // Assuming this is the ID of the superadmin account

/**
 * Generate trending AI topics
 * @returns Promise<Array<string>> List of trending AI topics
 */
async function generateTrendingAITopics(): Promise<string[]> {
  try {
    const systemPrompt = `You are an AI research expert. Generate a list of the top 50 currently trending AI topics that would be valuable for business professionals, innovators, and technology enthusiasts. Focus on topics that combine practical business applications, emerging technologies, ethical considerations, and future predictions.`;
    
    const prompt = `Generate a JSON array of 50 trending AI topics in 2025. Each topic should be specific enough to write a detailed article about. Include a mix of business applications, technical innovations, ethical considerations, and future predictions. Format the response as a JSON array of strings containing only the topic titles.`;
    
    try {
      // First try to generate with the API
      const topics = await grokApi.generateJson<string[]>(prompt, systemPrompt, {
        temperature: 0.7,
        max_tokens: 1500
      });
      
      if (Array.isArray(topics)) {
        return topics.slice(0, 50); // Ensure we have exactly 50 topics
      } else {
        // Handle non-array response
        logger.warn('AI API returned non-array response, using fallback topics');
        return getFallbackTopics();
      }
    } catch (apiError) {
      // API call failed, log and use fallback
      logger.error('Error calling AI API:', apiError);
      logger.info('Using fallback topics due to API error');
      return getFallbackTopics();
    }
  } catch (error) {
    logger.error('Error generating AI topics:', error);
    throw new Error('Failed to generate AI topics');
  }
}

// Fallback topics in case the API fails
function getFallbackTopics(): string[] {
  logger.info('Using pre-defined trending AI topics due to API limitations');
  return [
    "AI-Powered Decision Making in Corporate Strategy",
    "Ethical Frameworks for Generative AI in Business",
    "AI and the Future of Customer Experience Personalization",
    "Multimodal AI Systems in Enterprise Applications",
    "Practical Applications of Large Language Models in Marketing",
    "AI Governance and Compliance for Technology Leaders",
    "The Rise of AI Co-pilots in Professional Workflows",
    "AI-Driven Predictive Analytics for Business Intelligence",
    "Responsible AI Implementation in Healthcare Settings",
    "AI and the Transformation of Financial Services",
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
}

/**
 * Generate an article on a specific AI topic
 * @param topic The AI topic to write about
 * @returns Generated article content and metadata
 */
async function generateArticle(topic: string, index: number): Promise<{
  title: string;
  content: string;
  summary: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  tags: string[];
  readTimeMinutes: number;
}> {
  try {
    const systemPrompt = `You are a professional technology journalist specializing in AI for ROLLINSX, a premier AI design and technology company. Write in a clear, authoritative style with deep expertise. Use proper HTML formatting for the article body with h2, h3, p, ul, li, and other appropriate tags. Include real industry examples, current trends, and actionable insights. Target an audience of business professionals and technology decision-makers.`;
    
    const prompt = `Write a comprehensive, professional article about "${topic}". The article should:

1. Have a compelling title that includes the main topic
2. Include an introduction that explains the importance of the topic
3. Break down the topic into 3-5 key subtopics with proper headings (use h2 and h3 tags)
4. Provide specific examples, use cases, or applications
5. Include current industry trends and statistics where relevant
6. Address challenges and limitations
7. Conclude with future outlook and recommendations
8. Format the article with proper HTML tags for structure

Return the response as a JSON object with the following structure:
{
  "title": "Compelling title that includes the main topic",
  "content": "Full HTML-formatted article content with proper tags",
  "summary": "A 2-3 sentence summary of the article",
  "slug": "url-friendly-version-of-title",
  "seoTitle": "SEO-optimized title",
  "seoDescription": "Meta description for SEO (150-160 characters)",
  "seoKeywords": "comma, separated, keywords, for, seo",
  "tags": ["tag1", "tag2", "tag3"],
  "readTimeMinutes": estimated reading time in minutes
}`;

    try {
      const articleData = await grokApi.generateJson<{
        title: string;
        content: string;
        summary: string;
        slug: string;
        seoTitle: string;
        seoDescription: string;
        seoKeywords: string;
        tags: string[];
        readTimeMinutes: number;
      }>(prompt, systemPrompt, {
        temperature: 0.7,
        max_tokens: 3500
      });
      
      // Ensure slug uniqueness by adding an index if needed
      articleData.slug = `${articleData.slug}-${index}`;
      
      return articleData;
    } catch (apiError) {
      logger.error(`API error generating article for topic "${topic}":`, apiError);
      logger.info(`Using fallback article for topic "${topic}" due to API error`);
      
      // Create a fallback article when API fails
      return generateFallbackArticle(topic, index);
    }
  } catch (error) {
    logger.error(`Error generating article for topic "${topic}":`, error);
    throw new Error(`Failed to generate article for topic: ${topic}`);
  }
}

/**
 * Generate a fallback article when the API fails
 * @param topic The topic to write about
 * @param index Index to ensure unique slugs
 * @returns Formatted article data
 */
function generateFallbackArticle(topic: string, index: number): {
  title: string;
  content: string;
  summary: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  tags: string[];
  readTimeMinutes: number;
  isAiGenerated: boolean;
} {
  const cleanTopic = topic.replace(/"/g, '');
  
  // Generate a variety of title formats to make articles more diverse
  const titleTemplates = [
    `${cleanTopic}: Transforming Business in the AI Era`,
    `How ${cleanTopic} is Revolutionizing Modern Enterprise`,
    `The Future of ${cleanTopic} in Business and Technology`,
    `${cleanTopic}: Insights and Strategies for 2025 and Beyond`,
    `Leveraging ${cleanTopic} for Competitive Advantage`,
    `${cleanTopic}: Innovation Pathways for Forward-Thinking Organizations`
  ];
  
  // Select a random title template
  const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
  
  // Create a URL-friendly slug
  const slug = cleanTopic.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-') + `-${index}`;
  
  // Generate tags based on the topic
  const topicWords = cleanTopic.split(' ');
  const baseTagSet = ['artificial intelligence', 'ai technology', 'business innovation', 'digital transformation'];
  const additionalTagOptions = [
    'machine learning', 'neural networks', 'deep learning', 'predictive analytics',
    'computer vision', 'natural language processing', 'robotic process automation',
    'data science', 'big data', 'generative ai', 'enterprise ai', 'ai ethics'
  ];
  
  // Select 2-4 random additional tags
  const randomAdditionalTags = [...additionalTagOptions]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + 2);
  
  // Add topic-specific tags
  const topicSpecificTags = topicWords
    .filter(word => word.length > 3)
    .map(word => word.toLowerCase())
    .slice(0, 3);
  
  const tags = [...new Set([...baseTagSet, ...randomAdditionalTags, ...topicSpecificTags])].slice(0, 8);
  
  return {
    title,
    content: `<h1>${title}</h1>
<p>In today's rapidly evolving technological landscape, ${cleanTopic} has emerged as a pivotal innovation that is reshaping how businesses operate, compete, and deliver value to customers. This comprehensive exploration examines the current state of this technology, its practical applications, and its future trajectory.</p>

<h2>Understanding ${cleanTopic}</h2>
<p>${cleanTopic} represents the convergence of advanced computational techniques, domain expertise, and business strategy. At its core, this technology leverages artificial intelligence and machine learning frameworks to solve complex problems that were previously intractable using conventional methods.</p>
<p>The primary components driving this innovation include:</p>
<ul>
  <li>Advanced algorithms optimized for business-critical tasks</li>
  <li>Integration capabilities with existing enterprise systems</li>
  <li>Scalable infrastructure designed for production environments</li>
  <li>Ethical frameworks ensuring responsible implementation</li>
</ul>

<h2>Business Applications and Use Cases</h2>
<p>Forward-thinking organizations across industries are implementing ${cleanTopic} to achieve tangible business outcomes:</p>

<h3>Enhanced Decision Making</h3>
<p>By synthesizing vast amounts of data and surfacing actionable insights, ${cleanTopic} enables leaders to make more informed strategic decisions. This capability is particularly valuable in complex, fast-moving markets where traditional analysis methods cannot keep pace with change.</p>

<h3>Operational Efficiency</h3>
<p>Automation of routine processes and workflows reduces manual intervention, minimizes errors, and accelerates time-to-completion. Organizations implementing these solutions have reported efficiency improvements ranging from 30% to 70% for specific business functions.</p>

<h3>Customer Experience Transformation</h3>
<p>The ability to personalize interactions at scale has revolutionized how companies engage with customers. From tailored recommendations to proactive service interventions, ${cleanTopic} creates more meaningful and valuable customer journeys.</p>

<h2>Implementation Challenges and Limitations</h2>
<p>Despite its transformative potential, organizations face several challenges when adopting ${cleanTopic}:</p>
<ul>
  <li>Talent acquisition and development in a competitive market</li>
  <li>Integration with legacy systems and processes</li>
  <li>Data quality and governance considerations</li>
  <li>Ensuring ethical use and addressing bias concerns</li>
  <li>Change management across the organization</li>
</ul>

<h2>Future Outlook and Strategic Recommendations</h2>
<p>Looking ahead, we anticipate several key developments in the ${cleanTopic} landscape:</p>
<ol>
  <li>Increased accessibility through low-code/no-code platforms</li>
  <li>Enhanced explainability to address the "black box" problem</li>
  <li>Cross-domain integration capabilities</li>
  <li>Stronger industry-specific applications and solutions</li>
</ol>

<p>For organizations seeking to capitalize on ${cleanTopic}, consider the following strategic approach:</p>
<ol>
  <li>Begin with clearly defined business objectives rather than technology-first initiatives</li>
  <li>Invest in developing both technical capabilities and domain knowledge</li>
  <li>Implement robust governance frameworks to ensure ethical and compliant use</li>
  <li>Embrace iterative development with continuous learning and improvement</li>
</ol>

<h2>Conclusion</h2>
<p>As ${cleanTopic} continues to mature, its impact on business operations, competitive dynamics, and customer relationships will only deepen. Organizations that thoughtfully implement these technologies with a focus on both capabilities and readiness will create sustainable competitive advantages in an increasingly AI-driven marketplace.</p>

<p>By developing a clear strategy for ${cleanTopic} adoption that balances technological innovation with organizational considerations, business leaders can position themselves at the forefront of this transformative wave.</p>`,

    summary: `This comprehensive analysis explores how ${cleanTopic} is revolutionizing business operations and strategy in 2025. From enhancing decision-making to transforming customer experiences, discover the practical applications, implementation challenges, and strategic recommendations for leveraging this technology in your organization.`,
    
    seoTitle: `${cleanTopic}: Business Applications & Implementation Guide`,
    
    seoDescription: `Discover how ${cleanTopic} is transforming business operations, enhancing decision-making, and creating competitive advantages in today's AI-driven marketplace.`,
    
    seoKeywords: `${cleanTopic}, artificial intelligence, business innovation, digital transformation, AI implementation, technology strategy`,
    
    tags: tags.slice(0, 5), // Ensure we don't have too many tags
    
    readTimeMinutes: 7 // Average reading time for the fallback article
  };
}

/**
 * Save the generated article to the database
 * @param articleData The article data to save
 * @returns The saved article
 */
async function saveArticle(articleData: any): Promise<any> {
  try {
    // Direct SQL with minimal fields
    // Using dynamic SQL with proper escaping for text values
    const safeTitle = articleData.title ? articleData.title.replace(/'/g, "''") : 'AI Article';
    const safeContent = articleData.content ? articleData.content.replace(/'/g, "''") : 'This is a sample article about AI technology.';
    
    const sql = `
      INSERT INTO posts (
        title, 
        content, 
        author_id,
        category,
        status,
        created_at, 
        updated_at
      ) VALUES (
        '${safeTitle}', 
        '${safeContent}', 
        1,
        'AI & Technology',
        'published',
        NOW(),
        NOW()
      ) RETURNING id
    `;
    
    logger.info(`Saving article: ${safeTitle.substring(0, 30)}...`);
    
    // Execute direct SQL
    const res = await db.execute(sql);
    
    // Handle response
    if (res && res.rows && res.rows.length > 0) {
      return { 
        id: res.rows[0].id,
        title: safeTitle,
        content: safeContent,
        author_id: 1,
        category: 'AI & Technology',
        status: 'published'
      };
    } else {
      throw new Error('No article was created');
    }
  } catch (error) {
    logger.error('Error saving article:', error);
    throw new Error('Failed to save article to database');
  }
}

/**
 * Main function to generate and save AI articles
 */
export async function generateAIArticles() {
  logger.info('Starting AI article generation...');
  
  try {
    // Generate trending AI topics
    const topics = await generateTrendingAITopics();
    logger.info(`Generated ${topics.length} trending AI topics`);
    
    // Track results
    const results = {
      success: 0,
      failed: 0,
      topics: topics.length,
      articles: [] as any[]
    };
    
    // Generate and save articles for each topic
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      try {
        logger.info(`Generating article ${i+1}/${topics.length}: "${topic}"`);
        
        // Generate article content
        const articleData = await generateArticle(topic, i);
        
        // Save article to database
        const savedArticle = await saveArticle(articleData);
        
        logger.info(`Successfully saved article: "${articleData.title}"`);
        results.success++;
        results.articles.push({
          id: savedArticle.id,
          title: savedArticle.title,
          slug: savedArticle.slug
        });
        
        // Add a small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Failed to generate/save article for topic "${topic}":`, error);
        results.failed++;
      }
    }
    
    logger.info(`AI article generation completed. Results:`, results);
    return results;
  } catch (error) {
    logger.error('AI article generation failed:', error);
    throw error;
  }
}

// For ES modules, use a different approach to detect if file is run directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Check if this file is being run directly
const isMainModule = import.meta.url.endsWith(fileURLToPath(import.meta.url));

if (isMainModule) {
  generateAIArticles()
    .then(results => {
      console.log('Article generation complete!', results);
      process.exit(0);
    })
    .catch(error => {
      console.error('Article generation failed:', error);
      process.exit(1);
    });
}