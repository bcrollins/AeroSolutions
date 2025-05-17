import { Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';

/**
 * Controller for checking premium content access
 */

// Check if user has access to premium content
export const checkPremiumAccess = async (req: Request, res: Response) => {
  const { productId } = req.params;
  
  // Ensure the user is authenticated
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      hasAccess: false,
      message: 'Authentication required'
    });
  }

  try {
    // Get the user ID from the session
    const userId = req.user.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({
        hasAccess: false,
        message: 'Invalid user session'
      });
    }

    // Get the user from storage
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        hasAccess: false,
        message: 'User not found'
      });
    }

    // Get the product details to determine required subscription level
    const product = await storage.getCourse(parseInt(productId));
    
    if (!product) {
      return res.status(404).json({
        hasAccess: false,
        message: 'Product not found'
      });
    }

    // If the product is not premium, everyone has access
    if (!product.isPremium) {
      return res.json({
        hasAccess: true,
        requiresSubscription: false,
        currentPlanName: user.subscriptionPlan || null,
        requiredPlanId: null
      });
    }

    // Check if the user has an active subscription
    const hasValidSubscription = await storage.checkUserSubscription(userId, product.requiredSubscription);
    
    // Return access information
    return res.json({
      hasAccess: hasValidSubscription,
      requiresSubscription: true,
      currentPlanName: user.subscriptionPlan || null,
      requiredPlanId: product.requiredSubscription
    });
  } catch (error) {
    console.error('Error checking premium access:', error);
    return res.status(500).json({
      hasAccess: false,
      message: 'Server error checking premium access'
    });
  }
};