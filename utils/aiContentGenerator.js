/**
 * AI Content Generator
 * 
 * This utility uses xAI's API to generate blog posts, articles, Q&A content,
 * and car event descriptions based on provided prompts and parameters.
 */

const OpenAI = require('openai');
const logger = require('../config/logger');

// Initialize xAI client
const xai = new OpenAI({ 
  baseURL: 'https://api.x.ai/v1', 
  apiKey: process.env.XAI_API_KEY 
});

// Initialize OpenAI client as fallback
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Generate content using AI
 * @param {Object} options - Content generation options
 * @param {string} options.title - Article title or topic
 * @param {string} options.type - Content type (regular, car_event, ai_qa)
 * @param {string} [options.question] - Question for Q&A content
 * @param {string} [options.topic] - Topic category
 * @param {string} [options.keywords] - SEO keywords
 * @returns {Promise<Object>} Generated content and metadata
 */
async function generateAIContent(options) {
  const { title, type, question, topic, keywords } = options;
  
  try {
    // Create a prompt based on content type
    const prompt = createPrompt(options);
    
    // Try with xAI first
    try {
      const xaiResponse = await generateWithXAI(prompt, type);
      return {
        ...xaiResponse,
        generator: 'xai'
      };
    } catch (xaiError) {
      logger.warn('xAI generation failed, falling back to OpenAI', { 
        error: xaiError.message 
      });
      
      // Fall back to OpenAI if xAI fails
      const openaiResponse = await generateWithOpenAI(prompt, type);
      return {
        ...openaiResponse,
        generator: 'openai'
      };
    }
  } catch (error) {
    logger.error('Content generation failed with both xAI and OpenAI', { 
      error: error.message, title, type 
    });
    throw error;
  }
}

/**
 * Create appropriate prompt based on content type
 * @param {Object} options - Content options
 * @returns {string} Formatted prompt
 */
function createPrompt(options) {
  const { title, type, question, topic, keywords } = options;
  
  // Base instructions for all content types
  const baseInstructions = `
Create professional, informative content that is at least 3000 characters long.
The content should be well-structured, easy to understand for scannable reading, and SEO optimized.
Use a professional tone that conveys expertise and authority in the subject matter.
Include relevant headings, subheadings, and bullet points where appropriate.
The content should be 100% original and factually accurate.
Include a brief, engaging summary/excerpt.
Suggest relevant tags for categorization.
Estimate appropriate reading time in minutes.
Use markdown formatting for the content.

Content should be specifically formatted with:
- A compelling introduction that hooks the reader
- Well-structured body with clear headings (using ## and ### markdown syntax)
- A concise conclusion or call-to-action
- High-value information density with actionable insights
- Professional vocabulary without being overly technical

Return the response as a JSON object with these fields:
{
  "content": "The full markdown-formatted article",
  "summary": "A compelling 2-3 sentence summary",
  "seoDescription": "160-character SEO meta description",
  "seoKeywords": "comma,separated,keywords",
  "tags": ["tag1", "tag2", "tag3"],
  "readTimeMinutes": estimatedReadingTimeInMinutes
}
  `;
  
  // Specific instructions based on content type
  let specificInstructions = '';
  
  switch (type) {
    case 'car_event':
      specificInstructions = `
This content is about an automotive event: "${title}".
${topic ? `The event category is: ${topic}.` : ''}
${keywords ? `Include these keywords in the content: ${keywords}` : ''}

The article should:
- Describe the automotive event in detail
- Include information about the vehicles, technology, or innovations featured
- Mention the significance of the event in the automotive industry
- Provide context on why this event matters to automotive enthusiasts
- Include relevant details that would help someone understand the importance of the event

Structure the article to cover:
1. Event overview and significance
2. Key highlights and featured elements
3. Industry impact and technological significance
4. Historical context or future implications
5. Conclusion with takeaways for readers
      `;
      break;
      
    case 'ai_qa':
      specificInstructions = `
This is a question and answer format about AI technology.
${question ? `The specific question is: "${question}"` : `The topic question relates to: "${title}"`}
${keywords ? `Include these keywords in the answer: ${keywords}` : ''}

The content should:
- Provide a comprehensive, factual answer to the question
- Explain AI concepts in an accessible but technically accurate way
- Include relevant examples to illustrate key points
- Address common misconceptions if applicable
- Cite general principles and best practices
- Maintain a balanced, educational perspective

Structure the answer to:
1. Directly address the core question
2. Provide necessary background context
3. Explain key technical concepts in accessible language
4. Offer practical applications or implications
5. Summarize with main takeaways
      `;
      break;
      
    default: // regular article
      specificInstructions = `
This is a general informative article with the title: "${title}".
${topic ? `The article category is: ${topic}.` : ''}
${keywords ? `Include these keywords in the article: ${keywords}` : ''}

The article should:
- Provide comprehensive coverage of the topic
- Include relevant background information
- Discuss current trends, developments, or applications
- Address potential challenges or controversies if applicable
- Offer insights or predictions about future developments

Structure the article with:
1. Introduction to the topic and its significance
2. Background information and context
3. Key aspects, components, or considerations
4. Practical applications or implications
5. Future outlook and conclusion
      `;
      break;
  }
  
  return `${baseInstructions}\n\n${specificInstructions}`;
}

/**
 * Generate content using xAI
 * @param {string} prompt - Generation prompt
 * @param {string} type - Content type
 * @returns {Promise<Object>} Generated content and metadata
 */
async function generateWithXAI(prompt, type) {
  try {
    const response = await xai.chat.completions.create({
      model: "grok-2-1212", // using the most capable text model
      messages: [
        {
          role: "system",
          content: "You are an expert content creator specializing in creating high-quality, professional articles, blog posts, and Q&A content. You write in a clear, engaging style that balances authority with accessibility."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      content: result.content,
      summary: result.summary,
      seoDescription: result.seoDescription,
      seoKeywords: result.seoKeywords,
      tags: result.tags,
      readTimeMinutes: result.readTimeMinutes
    };
  } catch (error) {
    logger.error('xAI content generation failed', { 
      error: error.message, 
      contentType: type 
    });
    throw error;
  }
}

/**
 * Generate content using OpenAI as a fallback
 * @param {string} prompt - Generation prompt
 * @param {string} type - Content type
 * @returns {Promise<Object>} Generated content and metadata
 */
async function generateWithOpenAI(prompt, type) {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert content creator specializing in creating high-quality, professional articles, blog posts, and Q&A content. You write in a clear, engaging style that balances authority with accessibility."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      content: result.content,
      summary: result.summary,
      seoDescription: result.seoDescription,
      seoKeywords: result.seoKeywords,
      tags: result.tags,
      readTimeMinutes: result.readTimeMinutes
    };
  } catch (error) {
    logger.error('OpenAI content generation failed', { 
      error: error.message, 
      contentType: type 
    });
    throw error;
  }
}

module.exports = {
  generateAIContent
};