import { grokApi } from '../grok';
import { db } from '../db';
import { posts } from '@shared/schema';
import { logger } from '../utils/logger';
import slugify from '../utils/slugify';

// Customer Q&A questions extracted from the attached file
const CUSTOMER_QUESTIONS = [
  // AI section
  "What is artificial intelligence (AI)?",
  "How does AI work?",
  "What are the main types of AI?",
  "What is machine learning?",
  "What is deep learning?",
  "How can I start learning AI?",
  "What are the applications of AI?",
  "What is natural language processing (NLP)?",
  "What is the difference between AI and machine learning?",
  "What are neural networks?",
  
  // Automation section
  "What is automation?",
  "How does automation work?",
  "What are the benefits of automation?",
  "What tools are used for automation?",
  "How can I learn automation?",
  "What is robotic process automation (RPA)?",
  "How is AI used in automation?",
  "What is the impact of automation on jobs?",
  "What are the challenges of implementing automation?",
  "How can automation improve business processes?",
  
  // Web Development section
  "What is web development?",
  "What are the key programming languages for web development?",
  "What is the difference between front-end and back-end development?",
  "What is responsive web design?",
  "How can I start learning web development?",
  "What are web frameworks?",
  "What is a content management system (CMS)?",
  "What is the role of JavaScript in web development?",
  "What is SEO in web development?",
  "How can AI be used in web development?",
  
  // Intersection section
  "How can AI be integrated into web applications?",
  "What is the role of automation in web development?",
  "How can machine learning improve web applications?",
  "What are AI-powered chatbots?",
  "How can automation tools help in web testing?",
  "What is the future of AI in web development?",
  "How can I use AI to analyze website traffic?",
  "What is the role of automation in DevOps?",
  "How can AI improve cybersecurity in web applications?",
  "What are the ethical considerations of using AI in web development?",
  
  // Advanced Topics section
  "What is reinforcement learning?",
  "What is transfer learning in AI?",
  "How do convolutional neural networks (CNNs) work?",
  "What is the difference between supervised and unsupervised learning?",
  "What is a REST API in web development?",
  "How does cloud computing impact web development?",
  "What is the role of Docker in automation?",
  "How can AI be used in predictive analytics?",
  "What is the difference between AI and deep learning?",
  "How can I build a portfolio for AI and web development projects?"
];

/**
 * Categorize a question into one of the main topics
 */
function categorizeQuestion(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('ai') || 
      lowerQuestion.includes('artificial intelligence') || 
      lowerQuestion.includes('machine learning') || 
      lowerQuestion.includes('neural') || 
      lowerQuestion.includes('nlp') ||
      lowerQuestion.includes('deep learning')) {
    return 'Artificial Intelligence';
  }
  
  if (lowerQuestion.includes('automation') || 
      lowerQuestion.includes('rpa') || 
      lowerQuestion.includes('process')) {
    return 'Automation';
  }
  
  if (lowerQuestion.includes('web') || 
      lowerQuestion.includes('programming') || 
      lowerQuestion.includes('cms') || 
      lowerQuestion.includes('javascript') ||
      lowerQuestion.includes('html') ||
      lowerQuestion.includes('css') ||
      lowerQuestion.includes('seo')) {
    return 'Web Development';
  }
  
  if (lowerQuestion.includes('docker') || 
      lowerQuestion.includes('cloud') || 
      lowerQuestion.includes('api') || 
      lowerQuestion.includes('devops')) {
    return 'Advanced Topics';
  }
  
  // Default category if we can't determine
  return 'Technology';
}

/**
 * Generate an article answering a customer question
 */
async function generateQnAArticle(question: string, index: number): Promise<{
  title: string;
  content: string;
  summary: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  tags: string[];
  readTimeMinutes: number;
  category: string;
  isAiGenerated: boolean;
  question: string;
  aiGeneratedBy: string;
}> {
  logger.info(`Generating article for question: "${question}"`);

  const category = categorizeQuestion(question);
  
  // Generate tags based on the question and category
  const baseTags = ['RollinsX', 'AI Knowledge Hub'];
  const categoryTags = [category];
  
  // Add more relevant tags based on the question
  const questionWords = question.toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .filter(word => word.length > 3 && !['what', 'when', 'where', 'which', 'with', 'from', 'that', 'this', 'there', 'their', 'would', 'could', 'should'].includes(word));
  
  // Take up to 3 important words from the question for tags
  const questionTags = [...new Set(questionWords)].slice(0, 3).map(word => word.charAt(0).toUpperCase() + word.slice(1));
  
  const tags = [...baseTags, ...categoryTags, ...questionTags];
  
  // Create a title based on the question
  const title = `${question.replace(/\?$/, '')}: A Comprehensive Guide`;
  
  // Create a slug from the title
  const slug = slugify(title);

  try {
    // Format the system prompt to guide the AI
    const systemPrompt = `You are an expert AI instructor at RollinsX, writing a professional, educational article that answers a common customer question. 
Your article should be authoritative, well-structured, and follow SEO best practices. Include practical examples, current industry insights, and cross-promote RollinsX courses and tools where relevant.

Format the article in HTML using proper semantic tags (h2, h3, h4, p, ul, li, etc.) for structure. Make the article comprehensive, between 1,500-2,500 words.

You MUST follow this structure:
1. Introduction: Engage readers, establish expertise, and clearly state what they'll learn
2. Main content: Organized with clear headings, subheadings, examples, and actionable advice
3. Internal cross-promotion: Include 2-3 natural references to RollinsX courses, tools, or services related to the topic
4. Conclusion: Summarize key points and include a clear call-to-action

Include everything in a single, well-formatted response.`;

    // Format the user prompt
    const prompt = `Write a comprehensive, SEO-optimized article answering the question: "${question}"

The article should:
- Have a strong introduction addressing the question directly
- Include 4-6 sections with descriptive H2 headings and H3 subheadings where needed
- Provide practical, actionable information with concrete examples
- Include current statistics or trends where relevant
- Cross-promote RollinsX offerings with 2-3 natural internal links (e.g., "Learn more in our AI for Business course" or "Explore this further with our AI Development Service")
- End with a clear conclusion and call-to-action like "Start your free trial with RollinsX to master AI today"

Follow SEO best practices:
- Include the question naturally in the first paragraph
- Use proper HTML semantic structure
- Include a FAQ section at the end with 3-5 related questions and concise answers

Add a table of contents after the introduction, with anchor links to each section.

Remember to maintain a professional, informative tone throughout the article.`;

    // Generate article content with the API
    const rawContent = await grokApi.generateContent(prompt, systemPrompt, {
      temperature: 0.7,
      max_tokens: 3000
    });

    // Generate SEO metadata
    const seoData = await grokApi.generateJson<{
      seoTitle: string;
      seoDescription: string;
      seoKeywords: string;
      summary: string;
    }>(`Based on the article about "${question}", generate optimized SEO metadata including:
1. SEO Title (60-65 characters)
2. Meta Description (150-160 characters)
3. SEO Keywords (comma-separated, 5-8 keywords)
4. Summary (75-100 words overview of the article)

Return as JSON with fields: seoTitle, seoDescription, seoKeywords, summary.`, 
    "You are an SEO expert. Generate concise, optimized metadata for the article. Follow character limits exactly.", 
    { temperature: 0.5 });

    // Estimate reading time (average reading speed 225 words per minute)
    const wordCount = rawContent.split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 225));

    return {
      title,
      content: rawContent,
      summary: seoData.summary || `A comprehensive guide answering the question: ${question}`,
      slug,
      seoTitle: seoData.seoTitle || title,
      seoDescription: seoData.seoDescription || `Learn everything about ${question.replace(/\?$/, '')} in this comprehensive guide from RollinsX. Discover practical insights, examples, and expert advice.`,
      seoKeywords: seoData.seoKeywords || tags.join(', '),
      tags,
      readTimeMinutes,
      category,
      isAiGenerated: true,
      question,
      aiGeneratedBy: 'xai'
    };
  } catch (error) {
    logger.error(`Error generating article for question "${question}":`, error);
    throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Save an article to the database
 */
async function saveArticle(article: ReturnType<typeof generateQnAArticle> extends Promise<infer T> ? T : never) {
  try {
    logger.info(`Saving article: ${article.title.substring(0, 30)}...`);
    
    const [savedArticle] = await db.insert(posts).values({
      title: article.title,
      content: article.content,
      summary: article.summary,
      slug: article.slug,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      seoKeywords: article.seoKeywords,
      tags: article.tags,
      readTimeMinutes: article.readTimeMinutes,
      category: article.category,
      postType: 'ai_qa',
      question: article.question,
      aiGeneratedBy: article.aiGeneratedBy,
      status: 'published',
      publishedAt: new Date()
    }).returning();
    
    logger.info(`Successfully saved article: "${article.title.substring(0, 30)}..." (ID: ${savedArticle.id}, AI-generated: true)`);
    return savedArticle;
  } catch (error) {
    logger.error(`Error saving article "${article.title}":`, error);
    throw new Error(`Failed to save article: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Main function to generate and save customer Q&A articles
 */
export async function generateCustomerQnAArticles(startIndex = 0, count = CUSTOMER_QUESTIONS.length) {
  logger.info('Starting Customer Q&A article generation...');
  
  // Validate parameters
  const actualStartIndex = Math.max(0, Math.min(startIndex, CUSTOMER_QUESTIONS.length - 1));
  const actualCount = Math.min(count, CUSTOMER_QUESTIONS.length - actualStartIndex);
  
  const endIndex = actualStartIndex + actualCount;
  const questionsToProcess = CUSTOMER_QUESTIONS.slice(actualStartIndex, endIndex);
  
  logger.info(`Processing ${questionsToProcess.length} questions from index ${actualStartIndex} to ${endIndex - 1}`);
  
  // Track results
  const results = {
    success: 0,
    failed: 0,
    questions: questionsToProcess.length,
    articles: [] as any[]
  };
  
  // Generate and save articles for each question
  for (let i = 0; i < questionsToProcess.length; i++) {
    const question = questionsToProcess[i];
    try {
      logger.info(`Generating article ${i+1}/${questionsToProcess.length}: "${question}" (overall: ${actualStartIndex + i + 1}/${CUSTOMER_QUESTIONS.length})`);
      
      // Generate article content
      const articleData = await generateQnAArticle(question, actualStartIndex + i);
      
      // Save article to database
      const savedArticle = await saveArticle(articleData);
      
      logger.info(`Successfully saved article: "${articleData.title}"`);
      results.success++;
      results.articles.push({
        id: savedArticle.id,
        title: savedArticle.title,
        slug: savedArticle.slug
      });
      
      // Add a delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error(`Failed to generate/save article for question "${question}":`, error);
      results.failed++;
    }
  }
  
  logger.info(`Customer Q&A article generation completed. Results:`, results);
  return results;
}