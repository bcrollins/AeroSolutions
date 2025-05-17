import express from 'express';
import { getPersonalRecommendations, getLessonBasedRecommendations } from '../controllers/recommendationController';
import { trackCourseInteraction, getUserInteractionHistory } from '../controllers/courseInteractionController';
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

// Course interaction tracking routes
router.post('/track', isAuthenticated, trackCourseInteraction);
router.get('/history', isAuthenticated, getUserInteractionHistory);

// Get related courses based on the current course
router.get('/related/:courseId', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const limit = parseInt(req.query.count as string) || 3;
    
    if (isNaN(courseId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid course ID'
      });
    }
    
    // Forward to controller with current course ID
    req.query.sourceId = courseId.toString();
    req.query.limit = limit.toString();
    
    return getPersonalRecommendations(req, res);
  } catch (error) {
    console.error('Error getting related courses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get related courses',
      error: (error as Error).message
    });
  }
});

export default router;