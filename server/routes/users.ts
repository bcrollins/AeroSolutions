/**
 * User Routes
 * Handles API endpoints related to user management
 */

import express from 'express';
import { db } from '../db';
import { storage } from '../storage';
import { isAuthenticated, isAdmin } from '../middlewares/auth';
import { logger } from '../utils/logger';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

/**
 * GET /api/users/profile
 * Get the current user's profile
 */
router.get('/profile', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't return sensitive fields
    const userProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return res.json({
      success: true,
      data: userProfile
    });
  } catch (error: any) {
    logger.error('Error getting user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

/**
 * PUT /api/users/:id/role
 * Update a user's role (admin only)
 */
router.put('/:id/role', isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!role || !['user', 'admin', 'editor', 'instructor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    // Find the user
    const existingUser = await storage.getUser(id);
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update the user's role
    await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id));
    
    logger.info(`User ${id} role updated to ${role} by admin ${req.user.claims?.sub}`);
    
    return res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id,
        role
      }
    });
  } catch (error: any) {
    logger.error('Error updating user role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user (admin only, soft delete)
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // Find the user
    const existingUser = await storage.getUser(id);
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't allow deleting yourself
    if (id === req.user.claims?.sub) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    // Soft delete by updating verification status
    await db.update(users)
      .set({ 
        verified: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
    logger.info(`User ${id} soft deleted by admin ${req.user.claims?.sub}`);
    
    return res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error: any) {
    logger.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

export default router;