# AI Platform

This project is a web application that uses OpenAI API for text generation.

## Two Server Options

### 1. Original Full-Featured Server

The original server includes all features, including PostgreSQL database integration, authentication, and OpenAI API integration.

```bash
npm run dev
```

### 2. Simple Server (0.0.0.0:8080)

A simplified version that runs on 0.0.0.0:8080 is available:

```bash
node simple-server.js
```

## Available Routes

- `/` - Landing page
- `/test` - Test page with OpenAI API testing UI
- `/login` - Login page
- `/api/test-db` - Test database connection
- `/api/test-xai` - Test OpenAI API connection
- `/api/generate` - Generate text using OpenAI API

## Configuration

To use the simplified server with Replit:

1. Rename `.replit.simple` to `.replit`
2. The simplified server will run on port 8080

## API Usage

### Text Generation API

Endpoint: `/api/generate`
Method: POST

Request Body:
```json
{
  "prompt": "Your text prompt here",
  "model": "gpt-4o",            // Optional, defaults to gpt-4o
  "max_tokens": 500,            // Optional, defaults to 500
  "temperature": 0.7            // Optional, defaults to 0.7
}
```

Response:
```json
{
  "success": true,
  "result": "Generated text will appear here",
  "model": "gpt-4o",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}
```

## Environment Variables

- `PORT` - Server port (defaults to 8080 for simple server, 5000 for full server)
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key