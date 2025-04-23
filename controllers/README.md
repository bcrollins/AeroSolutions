# Controllers

This directory contains the business logic for handling API routes and requests.

## Purpose

Controllers handle the application's business logic, processing requests, interacting with the database through models, and returning appropriate responses. They separate the route definitions from the actual logic implementation, promoting cleaner code and better maintainability.

## Structure

Each controller typically corresponds to a specific resource or feature in the application:

- `authController.js`: Authentication-related logic (login, registration, password reset)
- `userController.js`: User management operations
- `marketplaceController.js`: Marketplace item and order management
- `subscriptionController.js`: Subscription plans and user subscriptions
- `contentController.js`: Content generation and management
- `analyticController.js`: Analytics data processing

## Implementation

Controllers follow a modular approach, with each controller handling a specific domain of the application. They:

1. Receive requests from routes
2. Validate input data
3. Process the request using models and services
4. Format and return appropriate responses

## Current Status

Currently, controller logic is embedded directly in the route handlers in the server/routes directory. As part of future refactoring, this logic should be extracted into dedicated controller files in this directory to improve code organization and maintainability.

## Example Controller Structure

```javascript
// Example of what a controller file might look like after refactoring

import { storage } from '../server/storage';
import { callOpenAI } from '../server/utils/xaiClient';

export const generateTextController = {
  
  // Generate text using OpenAI
  generateText: async (req, res) => {
    try {
      const { prompt, model, max_tokens, temperature } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'Prompt is required'
        });
      }
      
      const response = await callOpenAI('/chat/completions', {
        model: model || 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: max_tokens || 500,
        temperature: temperature || 0.7
      });
      
      const result = response.choices?.[0]?.message?.content || '';
      
      return res.json({
        success: true,
        result,
        model: model || 'gpt-4o',
        usage: response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      });
    } catch (error) {
      console.error('Error in generateText controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Error generating content',
        error: error.message
      });
    }
  },
  
  // Other controller methods...
};
```