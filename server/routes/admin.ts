import express from 'express';
import { storage } from '../storage';
import { isAuthenticated, isAdmin } from '../middlewares/auth';
import { updateArticleTitles } from '../scripts/update-article-titles';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/admin/status
 * Simple status endpoint for the admin API
 */
router.get('/status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    res.json({ 
      status: 'active',
      message: 'Admin API is operational',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.error('Error in admin status endpoint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/admin/update-article-titles
 * Updates generic article titles with more specific AI topics
 */
router.post('/update-article-titles', isAuthenticated, isAdmin, async (req, res) => {
  try {
    logger.info('Admin requested article title update');
    
    // Run the update process
    const result = await updateArticleTitles();
    
    res.json({
      success: true,
      message: 'Article title update process completed',
      result
    });
  } catch (error) {
    logger.error('Error updating article titles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update article titles',
      error: error.message 
    });
  }
});

export default router;