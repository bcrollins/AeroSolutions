import express from 'express';
import { storage } from '../storage';
import { isAuthenticated, isAdmin } from '../middlewares/auth';
import { updateArticleTitles } from '../scripts/update-article-titles';
import { logger } from '../utils/logger';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
    const userId = req.user.claims.sub;
    const adminUser = await storage.getUser(userId);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Basic platform stats
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const adminCount = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'admin'));
    
    const stats = {
      userCount: Number(userCount[0].count),
      adminCount: Number(adminCount[0].count),
      currentAdmin: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        lastLoginAt: adminUser.lastLoginAt
      },
      platformStats: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      }
    };
    
    return res.json({
      success: true,
      data: stats
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