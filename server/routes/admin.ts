import express from 'express';
import { storage } from '../storage';
import { isAuthenticated, isAdmin } from '../middlewares/auth';
import { updateArticleTitles } from '../scripts/update-article-titles';
import { logger } from '../utils/logger';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

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
 * GET /api/admin/dashboard-stats
 * Gets stats for the admin dashboard
 */
router.get('/dashboard-stats', isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    // Get the current user (admin)
    const userId = req.user.claims?.sub;
    const adminUser = await storage.getUser(userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Query user stats
    const usersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const usersCount = Number(usersResult[0].count);
    
    // Calculate users joined today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    
    const newUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${todayStr}`);
    
    const newUsersCount = Number(newUsersResult[0].count);
    
    // For demonstration, we'll create some sample statistics that match our frontend expectations
    // In a production environment, these would be real queries to your database
    const statsData = {
      users: { 
        total: usersCount, 
        newToday: newUsersCount, 
        percentChange: 5 
      },
      courses: { 
        total: 12, 
        active: 8, 
        percentChange: 10 
      },
      articles: { 
        total: 50, 
        views: 1245, 
        percentChange: 15 
      },
      forum: { 
        threads: 32, 
        posts: 189, 
        percentChange: 8 
      },
      subscriptions: { 
        total: 95, 
        active: 82, 
        percentChange: 7 
      },
      certificates: { 
        issued: 37, 
        percentChange: 12 
      },
      revenue: { 
        monthly: '$4,850', 
        annual: '$58,200', 
        percentChange: 9 
      },
      platformStats: {
        uptime: Math.floor(process.uptime() / 3600), // in hours
        nodeVersion: process.version,
        platform: process.platform,
        adminUser: {
          id: adminUser.id,
          username: adminUser.username || adminUser.email,
          email: adminUser.email,
          role: adminUser.role
        }
      }
    };
    
    return res.json({
      success: true,
      data: statsData
    });
  } catch (error: any) {
    logger.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch admin dashboard stats',
      error: error?.message || 'Unknown error' 
    });
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
  } catch (error: any) {
    logger.error('Error updating article titles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update article titles',
      error: error?.message || 'Unknown error' 
    });
  }
});

/**
 * GET /api/admin/users
 * Get a list of all users (admin only)
 */
router.get('/users', isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    // Pagination parameters (optional)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Get all users with pagination
    const usersList = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      verified: users.verified,
      onboardingComplete: users.onboardingComplete,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt
    })
    .from(users)
    .limit(limit)
    .offset(offset)
    .orderBy(users.createdAt);
    
    // Get total count for pagination
    const totalCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    return res.json({
      success: true,
      data: {
        users: usersList,
        pagination: {
          total: Number(totalCount[0].count),
          page,
          limit,
          pages: Math.ceil(Number(totalCount[0].count) / limit)
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching users list:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users list',
      error: error?.message || 'Unknown error' 
    });
  }
});

export default router;