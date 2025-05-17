import express from 'express';
import { isAuthenticated } from '../replitAuth';
import { getCourse, checkUserSubscription } from '../storage.premium';

const router = express.Router();

// Check if a user has access to a premium product/course
router.get('/api/product/:productId/access', isAuthenticated, async (req, res) => {
  const { productId } = req.params;
  
  try {
    // Ensure the user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({
        hasAccess: false,
        message: 'Authentication required'
      });
    }

    // Get the user ID from the session
    const userId = req.user.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({
        hasAccess: false,
        message: 'Invalid user session'
      });
    }

    // Get the course details
    const course = await getCourse(parseInt(productId));
    
    if (!course) {
      return res.status(404).json({
        hasAccess: false,
        message: 'Course not found'
      });
    }

    // If the course is not premium, everyone has access
    if (!course.isPremium) {
      return res.json({
        hasAccess: true,
        requiresSubscription: false,
        currentPlanName: req.user.claims?.plan || null,
        requiredPlanId: null
      });
    }

    // Check if the user has an active subscription with the required level
    const hasValidSubscription = await checkUserSubscription(
      userId, 
      course.requiredSubscription || 'basic'
    );
    
    // Return access information
    return res.json({
      hasAccess: hasValidSubscription,
      requiresSubscription: true,
      currentPlanName: req.user.claims?.plan || null,
      requiredPlanId: course.requiredSubscription || 'basic'
    });
  } catch (error) {
    console.error('Error checking premium access:', error);
    return res.status(500).json({
      hasAccess: false,
      message: 'Server error checking premium access'
    });
  }
});

export default router;