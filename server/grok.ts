import { generateText as generateTextUtil, generateJson as generateJsonUtil, analyzeImage as analyzeImageUtil } from './utils/xaiClient';
import { logger } from './utils/logger';

// Interface for OpenAI API options
interface OpenAIApiOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// Track API call statistics
const apiStats = {
  totalCalls: 0,
  successCalls: 0,
  failedCalls: 0,
  
  recordSuccess() {
    this.totalCalls++;
    this.successCalls++;
    logger.info(`API Stats - Success: ${this.successCalls}/${this.totalCalls} (${Math.round(this.successCalls/this.totalCalls*100)}%)`);
  },
  
  recordFailure() {
    this.totalCalls++;
    this.failedCalls++;
    logger.warn(`API Stats - Failures: ${this.failedCalls}/${this.totalCalls} (${Math.round(this.failedCalls/this.totalCalls*100)}%)`);
  }
};

// Class for interacting with xAI API (Grok)
class OpenAIApi {
  private defaultModel: string = 'grok-2-1212';
  
  /**
   * Generate a text response from OpenAI
   * 
   * @param prompt The prompt to send to OpenAI
   * @param systemPrompt Optional system prompt to set the context
   * @param options Additional options for the API call
   * @returns The generated text response
   */
  async generateText(
    prompt: string, 
    systemPrompt: string = '', 
    options: OpenAIApiOptions = {}
  ): Promise<string> {
    try {
      const result = await generateTextUtil(prompt, {
        model: this.defaultModel,
        systemPrompt,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.max_tokens,
      });
      apiStats.recordSuccess();
      return result;
    } catch (error: any) {
      apiStats.recordFailure();
      logger.error('Error generating text with OpenAI:', error);
      throw new Error(`OpenAI text generation failed: ${error.message}`);
    }
  }
  
  /**
   * Generate a JSON response from OpenAI
   * 
   * @param prompt The prompt to send to OpenAI
   * @param systemPrompt Optional system prompt to set the context
   * @param options Additional options for the API call
   * @returns The parsed JSON response
   */
  async generateJson<T = any>(
    prompt: string, 
    systemPrompt: string = '', 
    options: OpenAIApiOptions = {}
  ): Promise<T> {
    try {
      const result = await generateJsonUtil<T>(prompt, {
        model: this.defaultModel,
        systemPrompt,
        temperature: options.temperature ?? 0.5, // Lower temperature for more consistent JSON
        maxTokens: options.max_tokens,
      });
      apiStats.recordSuccess();
      return result;
    } catch (error: any) {
      apiStats.recordFailure();
      logger.error('OpenAI JSON generation error:', error);
      throw new Error(`OpenAI JSON generation failed: ${error.message}`);
    }
  }
  
  /**
   * Generate content - a convenience wrapper around generateText
   * specifically for article or long-form content generation
   *
   * @param prompt The prompt to send to OpenAI
   * @param systemPrompt Optional system prompt to set the context
   * @param options Additional options for the API call
   * @returns The generated content
   */
  async generateContent(
    prompt: string,
    systemPrompt: string = '',
    options: OpenAIApiOptions = {}
  ): Promise<string> {
    try {
      // Set higher max tokens for content generation if not specified
      const contentOptions = {
        ...options,
        max_tokens: options.max_tokens || 3000
      };
      
      const result = await this.generateText(prompt, systemPrompt, contentOptions);
      return result;
    } catch (error: any) {
      logger.error('Error generating content with OpenAI:', error);
      throw new Error(`OpenAI content generation failed: ${error.message}`);
    }
  }
  
  /**
   * Analyze an image with OpenAI vision
   * 
   * @param base64Image The base64-encoded image data
   * @param prompt The prompt describing what to analyze in the image
   * @param options Additional options for the API call
   * @returns The text analysis of the image
   */
  async analyzeImage(
    base64Image: string,
    prompt: string = 'Describe this image in detail',
    options: OpenAIApiOptions = {}
  ): Promise<string> {
    try {
      const result = await analyzeImageUtil(base64Image, prompt, {
        model: 'grok-2-vision-1212',
        maxTokens: options.max_tokens ?? 500,
      });
      apiStats.recordSuccess();
      return result;
    } catch (error: any) {
      apiStats.recordFailure();
      logger.error('Error analyzing image with OpenAI:', error);
      throw new Error(`OpenAI image analysis failed: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
export const openaiApi = new OpenAIApi();
// For backward compatibility, also export as grokApi
export const grokApi = openaiApi;