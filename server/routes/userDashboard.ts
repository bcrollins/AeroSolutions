import express from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';

const router = express.Router();

// Get enrolled courses for the user
router.get('/enrolled-courses', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const enrolledCourses = await storage.getUserEnrollments(userId);
    return res.json(enrolledCourses);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return res.status(500).json({
      message: 'Failed to fetch enrolled courses'
    });
  }
});

// Get badges for the user
router.get('/badges', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const badges = await storage.getUserBadges(userId);
    return res.json(badges);
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return res.status(500).json({
      message: 'Failed to fetch badges'
    });
  }
});

// Get course recommendations for the user
router.get('/recommendations', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const recommendations = await storage.getRecommendedCourses(userId);
    return res.json(recommendations);
  } catch (error) {
    console.error('Error fetching course recommendations:', error);
    return res.status(500).json({
      message: 'Failed to fetch course recommendations'
    });
  }
});

// Get dashboard summary (counts and stats)
router.get('/summary', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Get enrolled courses to calculate count and avg progress
    const enrolledCourses = await storage.getUserEnrollments(userId);
    const badges = await storage.getUserBadges(userId);
    
    // Calculate the average progress
    let avgProgress = 0;
    if (enrolledCourses.length > 0) {
      const totalProgress = enrolledCourses.reduce((acc, course) => acc + course.progress, 0);
      avgProgress = Math.round(totalProgress / enrolledCourses.length);
    }
    
    return res.json({
      enrolledCoursesCount: enrolledCourses.length,
      badgesCount: badges.length,
      averageProgress: avgProgress
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({
      message: 'Failed to fetch dashboard summary'
    });
  }
});

export default router;