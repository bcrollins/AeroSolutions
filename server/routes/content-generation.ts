import express from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { generateAIArticles } from '../scripts/generate-ai-articles';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * POST /api/content-generation/ai-articles
 * Generate AI articles using XAI API
 * Admin only endpoint
 */
router.post('/ai-articles', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Extract request parameters
    const { count = 50 } = req.body;
    
    logger.info(`Admin user initiated AI article generation, requested count: ${count}`);
    
    // Queue the generation process to run asynchronously
    // This prevents timeouts since generating 50 articles will take time
    const generationPromise = generateAIArticles()
      .then(results => {
        logger.info('AI article generation completed successfully', { results });
      })
      .catch(error => {
        logger.error('AI article generation failed', { error: error.message });
      });
    
    // Respond immediately that the process has started
    res.status(202).json({
      success: true,
      message: 'AI article generation has been initiated. This process may take several minutes to complete. The articles will appear in the Content Hub as they are generated.',
      estimatedTime: '10-15 minutes for 50 articles'
    });
  } catch (error: any) {
    logger.error('Error initiating AI article generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate AI article generation',
      error: error.message
    });
  }
});

/**
 * GET /api/content-generation/status
 * Check the status of article generation (admin only)
 */
router.get('/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    // In a real implementation, we would track the status of the generation process
    // For now, we'll just return a placeholder status
    res.json({
      success: true,
      status: 'Unknown', // Would be 'in-progress', 'completed', or 'failed' in a real implementation
      message: 'Status tracking is not implemented yet. Please check the Content Hub to see generated articles.'
    });
  } catch (error: any) {
    logger.error('Error checking generation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check generation status',
      error: error.message
    });
  }
});

export default router;