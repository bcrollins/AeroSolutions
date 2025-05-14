import express from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// Get user's enrolled courses with progress
router.get('/enrollments', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const enrollments = await storage.getUserEnrollments(userId);
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    res.status(500).json({ message: 'Failed to fetch enrollments' });
  }
});

// Get user's achievement badges
router.get('/badges', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const badges = await storage.getUserBadges(userId);
    res.json(badges);
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ message: 'Failed to fetch badges' });
  }
});

// Get personalized course recommendations for the user
router.get('/course-recommendations', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const recommendations = await storage.getRecommendedCourses(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching course recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

export default router;