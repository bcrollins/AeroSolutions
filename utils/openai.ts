import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a summary of an article
 * @param text The article text to summarize
 * @returns A concise summary of the article
 */
export async function generateArticleSummary(text: string): Promise<string> {
  try {
    const prompt = `Please generate a concise summary (max 80 words) of the following article that highlights the key points:\n\n${text}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    return content ? content : "Summary not available";
  } catch (error) {
    console.error("Error generating article summary:", error);
    return "Unable to generate summary at this time.";
  }
}

/**
 * Analyze article sentiment and generate insights
 * @param text The article text to analyze
 * @returns Analysis results in a structured format
 */
export async function analyzeArticleSentiment(text: string): Promise<{
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  topics: string[];
  keyInsights: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI specialized in content analysis. Analyze the sentiment, extract main topics, and provide key insights from the given text.",
        },
        {
          role: "user",
          content: `Analyze this article text and provide sentiment analysis, main topics, and key insights:\n\n${text}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      sentiment: result.sentiment || "neutral",
      confidence: result.confidence || 0.5,
      topics: result.topics || [],
      keyInsights: result.keyInsights || [],
    };
  } catch (error) {
    console.error("Error analyzing article sentiment:", error);
    return {
      sentiment: "neutral",
      confidence: 0.5,
      topics: [],
      keyInsights: [],
    };
  }
}

/**
 * Generate personalized article recommendations based on user interests
 * @param userInterests Array of user interest topics
 * @param recentArticles Array of recently viewed article titles or topics
 * @returns Array of recommended topic ideas
 */
export async function getPersonalizedRecommendations(
  userInterests: string[],
  recentArticles: string[]
): Promise<string[]> {
  try {
    const interestsText = userInterests.join(", ");
    const recentText = recentArticles.join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI specialized in content recommendation. Suggest relevant content topics based on user interests and recent activity.",
        },
        {
          role: "user",
          content: `Generate 5 personalized article topic recommendations. User interests: ${interestsText}. Recently viewed: ${recentText}. Respond in JSON format with an array of topic strings.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.recommendations || [];
  } catch (error) {
    console.error("Error generating personalized recommendations:", error);
    return [];
  }
}

/**
 * Generate a catchy image prompt for article thumbnail generation
 * @param articleTitle The title of the article
 * @param articleContent Brief content or summary of the article
 * @returns A prompt suitable for image generation
 */
export async function generateImagePrompt(articleTitle: string, articleContent: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI specialized in generating creative image prompts for article thumbnails. Create vivid, descriptive prompts that would work well with DALL-E or similar image generation systems.",
        },
        {
          role: "user",
          content: `Generate a creative, detailed image prompt for an article thumbnail based on this title and content:\n\nTitle: ${articleTitle}\n\nContent: ${articleContent.substring(0, 500)}...`,
        },
      ],
      temperature: 0.8,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;
    return content ? content : "A futuristic digital landscape with abstract technology elements";
  } catch (error) {
    console.error("Error generating image prompt:", error);
    return "A futuristic digital landscape with abstract technology elements";
  }
}

export default {
  generateArticleSummary,
  analyzeArticleSentiment,
  getPersonalizedRecommendations,
  generateImagePrompt,
};