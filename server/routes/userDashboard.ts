import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Get user's enrolled courses
router.get('/enrolled-courses', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const enrolledCourses = await storage.getUserEnrollments(userId);
    res.json(enrolledCourses);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled courses' });
  }
});

// Get user's badges/achievements
router.get('/user-badges', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const badges = await storage.getUserBadges(userId);
    res.json(badges);
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ message: 'Failed to fetch user badges' });
  }
});

// Get course recommendations for the user
router.get('/course-recommendations', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const recommendations = await storage.getRecommendedCourses(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching course recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch course recommendations' });
  }
});

// Get user's learning statistics (optional)
router.get('/learning-stats', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Calculate learning stats
    // For a real implementation, you would collect this from your database
    const stats = {
      coursesEnrolled: 0,
      badgesEarned: 0,
      hoursSpentLearning: 0,
      lastLogin: new Date().toISOString(),
      completedLessons: 0,
      completionRate: 0
    };
    
    // Get enrollments for stat calculation
    const enrollments = await storage.getUserEnrollments(userId);
    stats.coursesEnrolled = enrollments.length;
    
    // Get badges count
    const badges = await storage.getUserBadges(userId);
    stats.badgesEarned = badges.length;
    
    // For a real implementation, you would calculate these from user activity
    // Here just using basic estimation
    if (enrollments.length > 0) {
      let totalCompletedLessons = 0;
      let totalLessons = 0;
      
      // In a real app, you would track and sum up actual hours
      stats.hoursSpentLearning = enrollments.reduce((total, course) => {
        // For demo purposes, estimate 1 hour per 10% progress
        return total + (course.progress / 10);
      }, 0);
      
      stats.completionRate = enrollments.reduce((avg, course) => avg + course.progress, 0) / enrollments.length;
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching learning stats:', error);
    res.status(500).json({ message: 'Failed to fetch learning stats' });
  }
});

export default router;