import express from 'express';
import { 
  getPersonalizedRecommendations, 
  getContentBasedRecommendations, 
  getTrendingCourses,
  getLearningInsights
} from '../controllers/recommendationController';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// Route for personalized recommendations (requires authentication)
router.post('/personalized', isAuthenticated, getPersonalizedRecommendations);

// Route for content-based recommendations
router.post('/content-based', getContentBasedRecommendations);

// Route for trending courses
router.get('/trending', getTrendingCourses);

// Route for learning insights (requires authentication)
router.post('/insights', isAuthenticated, getLearningInsights);

export default router;