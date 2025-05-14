import express from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get current authenticated user
router.get('/user', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update last login time if needed
    if (!user.lastLoginAt || new Date(user.lastLoginAt).getTime() < Date.now() - 86400000) {
      await storage.updateUser(userId, { 
        lastLoginAt: new Date() 
      });
    }
    
    // Return user without sensitive information
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error: any) {
    logger.error("Error fetching authenticated user:", { error: error.message });
    res.status(500).json({ message: "Failed to fetch user information" });
  }
});

// Check user authentication status
router.get('/status', (req, res) => {
  res.json({ 
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? { id: req.user?.claims?.sub } : null
  });
});

export default router;