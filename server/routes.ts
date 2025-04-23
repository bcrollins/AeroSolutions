import { Router, Application } from 'express';
import express from 'express';
import http from 'http';
import openaiRouter from './routes/openai';
import subscriptionRouter from './routes/subscription';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Module compatibility for __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create main router
const router = Router();

/**
 * Register all application routes on the Express app
 * @param app Express application instance
 * @returns HTTP server instance
 */
export async function registerRoutes(app: Application): Promise<http.Server> {
  // Add API routes
  router.use('/api/openai', openaiRouter);
  router.use('/api/subscription', subscriptionRouter);

  // API status endpoint
  router.get('/api/status', (req, res) => {
    res.json({
      success: true,
      timestamp: new Date(),
      message: 'API is operational',
      version: '1.0.0'
    });
  });

  // Serve static files
  app.use(express.static('public'));

  // Apply router to app
  app.use(router);

  // Serve landing page
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  // Create public directory and HTML landing page if they don't exist
  const publicDir = path.join(__dirname, '../public');
  const indexPath = path.join(publicDir, 'index.html');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (!fs.existsSync(indexPath)) {
    const landingPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenAI API Service</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 1px solid #eee;
      margin-bottom: 40px;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: #2a2a72;
    }
    h2 {
      font-size: 1.8rem;
      margin-top: 30px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
      color: #3a3a9e;
    }
    .subheading {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 30px;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin: 40px 0;
    }
    .feature {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .feature h3 {
      color: #2a2a72;
      margin-top: 0;
    }
    .feature-icon {
      font-size: 2rem;
      margin-bottom: 15px;
      color: #3a3a9e;
    }
    .cta {
      text-align: center;
      background: #2a2a72;
      color: white;
      padding: 40px;
      border-radius: 8px;
      margin: 50px 0;
    }
    .cta h2 {
      color: white;
      border: none;
    }
    .btn {
      display: inline-block;
      background: #fff;
      color: #2a2a72;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 20px;
      transition: all 0.3s ease;
    }
    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .api-example {
      background: #f1f1f1;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 20px 0;
    }
    code {
      font-family: 'Courier New', Courier, monospace;
    }
    footer {
      text-align: center;
      padding: 30px 0;
      margin-top: 50px;
      border-top: 1px solid #eee;
      color: #666;
    }
    @media (max-width: 768px) {
      .features {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>OpenAI API Service</h1>
    <p class="subheading">Harness the power of AI with our simple and intuitive API</p>
  </header>

  <main>
    <section>
      <h2>About Our Service</h2>
      <p>Our API provides seamless access to OpenAI's advanced AI models, allowing you to integrate powerful AI capabilities into your applications with ease. From text generation to image creation, our service offers a range of AI functionalities to enhance your projects.</p>
    </section>

    <section class="features">
      <div class="feature">
        <div class="feature-icon">💬</div>
        <h3>Text Generation</h3>
        <p>Generate human-like text for various applications including content creation, chatbots, and more.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🖼️</div>
        <h3>Image Creation</h3>
        <p>Create stunning, unique images from text descriptions using DALL-E models.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📊</div>
        <h3>Sentiment Analysis</h3>
        <p>Analyze the sentiment and emotional tone of text to gain valuable insights.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📝</div>
        <h3>Text Summarization</h3>
        <p>Condense long-form content into concise summaries while preserving key information.</p>
      </div>
    </section>

    <section>
      <h2>API Reference</h2>
      <p>Our API is designed to be simple and intuitive. Here are some examples of how to use it:</p>

      <h3>Text Completion</h3>
      <div class="api-example">
        <code>
          POST /api/openai/completion<br>
          {<br>
            &nbsp;&nbsp;"prompt": "Write a short story about a robot learning to feel emotions",<br>
            &nbsp;&nbsp;"model": "gpt-4o",<br>
            &nbsp;&nbsp;"maxTokens": 500,<br>
            &nbsp;&nbsp;"temperature": 0.7<br>
          }
        </code>
      </div>

      <h3>Image Generation</h3>
      <div class="api-example">
        <code>
          POST /api/openai/image<br>
          {<br>
            &nbsp;&nbsp;"prompt": "A futuristic city with flying cars and neon lights",<br>
            &nbsp;&nbsp;"size": "1024x1024"<br>
          }
        </code>
      </div>

      <h3>Sentiment Analysis</h3>
      <div class="api-example">
        <code>
          POST /api/openai/sentiment<br>
          {<br>
            &nbsp;&nbsp;"text": "I absolutely love this product! It exceeded all my expectations."<br>
          }
        </code>
      </div>

      <h3>Text Summarization</h3>
      <div class="api-example">
        <code>
          POST /api/openai/summary<br>
          {<br>
            &nbsp;&nbsp;"text": "Long article or document that you want to summarize..."<br>
          }
        </code>
      </div>
    </section>

    <section class="cta">
      <h2>Ready to Get Started?</h2>
      <p>Start integrating powerful AI capabilities into your applications today.</p>
      <a href="/api/status" class="btn">Check API Status</a>
    </section>
  </main>

  <footer>
    <p>&copy; 2025 OpenAI API Service. All rights reserved.</p>
  </footer>
</body>
</html>`;

    fs.writeFileSync(indexPath, landingPage);
  }

  // Create HTTP server instance
  return http.createServer(app);
}

export default router;