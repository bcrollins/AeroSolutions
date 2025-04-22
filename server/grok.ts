import { generateText as generateTextUtil, generateJson as generateJsonUtil, analyzeImage as analyzeImageUtil } from './utils/xaiClient';

// Interface for OpenAI API options
interface OpenAIApiOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// Class for interacting with OpenAI API
class OpenAIApi {
  private defaultModel: string = 'gpt-4o';
  
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
      return await generateTextUtil(prompt, {
        model: this.defaultModel,
        systemPrompt,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.max_tokens,
      });
    } catch (error: any) {
      console.error('Error generating text with OpenAI:', error.message);
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
      return await generateJsonUtil<T>(prompt, {
        model: this.defaultModel,
        systemPrompt,
        temperature: options.temperature ?? 0.5, // Lower temperature for more consistent JSON
        maxTokens: options.max_tokens,
      });
    } catch (error: any) {
      console.error('Error generating JSON with OpenAI:', error.message);
      throw new Error(`OpenAI JSON generation failed: ${error.message}`);
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
      return await analyzeImageUtil(base64Image, prompt, {
        model: this.defaultModel,
        maxTokens: options.max_tokens ?? 500,
      });
    } catch (error: any) {
      console.error('Error analyzing image with OpenAI:', error.message);
      throw new Error(`OpenAI image analysis failed: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
export const openaiApi = new OpenAIApi();
// For backward compatibility, also export as grokApi
export const grokApi = openaiApi;