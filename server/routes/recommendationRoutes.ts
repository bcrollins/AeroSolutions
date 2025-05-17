import express from 'express';
import { getPersonalRecommendations, getLessonBasedRecommendations } from '../controllers/recommendationController';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// Route for getting personalized recommendations (requires authentication)
router.get('/personalized', isAuthenticated, getPersonalRecommendations);

// Route for submitting preferences and getting recommendations
router.post('/personalized', isAuthenticated, getPersonalRecommendations);

// Route for getting recommendations based on completed lessons
router.post('/lesson-based', getLessonBasedRecommendations);

// Public route for topic-based recommendations
router.get('/topic/:topic', async (req, res) => {
  try {
    const topic = req.params.topic;
    const count = req.query.count ? parseInt(req.query.count as string) : 3;
    
    // Forward to the controller with the topic in the query
    req.query.topic = topic;
    return getPersonalRecommendations(req, res);
  } catch (error) {
    console.error('Error in topic recommendations route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get topic recommendations',
      error: (error as Error).message
    });
  }
});

export default router;