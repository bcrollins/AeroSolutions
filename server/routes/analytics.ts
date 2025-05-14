import express from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// Authentication and admin check middleware
const isAdmin = (req: any, res: express.Response, next: express.NextFunction) => {
  const user = req.user?.claims;
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Check if the user is an admin by email (super admin)
  // You can enhance this with proper role-based checks from your user table
  if (user.email === 'brollins565@gmail.com') {
    return next();
  }
  
  return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
};

// Get page view statistics
router.get('/pageviews', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
      
    const pageViews = await storage.getPageViewsByPeriod(startDate, endDate);
    const mostViewedPages = await storage.getMostViewedPages(10);
    
    res.json({
      pageViews,
      mostViewedPages,
      totalViews: pageViews.length
    });
  } catch (error) {
    console.error('Error getting page view analytics:', error);
    res.status(500).json({ message: 'Failed to fetch page view data' });
  }
});

// Get user analytics events
router.get('/events', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const eventType = req.query.type as string;
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    let events;
    if (eventType) {
      events = await storage.getEventsByType(eventType, startDate, endDate);
    } else {
      // For all event types, we need to implement a separate method or handle it differently
      // This is a simplified approach
      events = await storage.getEventsByType('all', startDate, endDate);
    }
    
    res.json({
      events,
      totalEvents: events.length,
      period: {
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error getting analytics events:', error);
    res.status(500).json({ message: 'Failed to fetch analytics events' });
  }
});

// Get subscription metrics
router.get('/subscription-metrics', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    const newSubscriptionsCount = await storage.getNewSubscriptionsCount(startDate, endDate);
    const canceledSubscriptionsCount = await storage.getCanceledSubscriptionCount(startDate, endDate);
    const totalRevenue = await storage.getTotalRevenue(startDate, endDate);
    const subscriptionsByPlan = await storage.getSubscriptionsByPlan(startDate, endDate);
    const activeSubscriberCount = await storage.getActiveSubscriberCount();
    const churnRate = await storage.getSubscriptionChurnRate(startDate, endDate);
    
    res.json({
      newSubscriptionsCount,
      canceledSubscriptionsCount,
      totalRevenue,
      subscriptionsByPlan,
      activeSubscriberCount,
      churnRate,
      period: {
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error getting subscription metrics:', error);
    res.status(500).json({ message: 'Failed to fetch subscription metrics' });
  }
});

// Get subscription events (newest endpoint)
router.get('/subscription-events', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const eventType = req.query.eventType as string;
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    // If eventType is 'all' or not provided, get all event types
    let events;
    if (eventType && eventType !== 'all') {
      events = await storage.getSubscriptionEventsByType(eventType, startDate, endDate, 100);
    } else {
      // Get all event types for the period (we need to implement this method)
      // For simplicity, we're combining multiple calls
      const createdEvents = await storage.getSubscriptionEventsByType('created', startDate, endDate, 100);
      const updatedEvents = await storage.getSubscriptionEventsByType('updated', startDate, endDate, 100);
      const canceledEvents = await storage.getSubscriptionEventsByType('canceled', startDate, endDate, 100);
      const trialStartedEvents = await storage.getSubscriptionEventsByType('trial_started', startDate, endDate, 100);
      const trialEndedEvents = await storage.getSubscriptionEventsByType('trial_ended', startDate, endDate, 100);
      const trialConvertedEvents = await storage.getSubscriptionEventsByType('trial_converted', startDate, endDate, 100);
      const paymentSucceededEvents = await storage.getSubscriptionEventsByType('payment_succeeded', startDate, endDate, 100);
      const paymentFailedEvents = await storage.getSubscriptionEventsByType('payment_failed', startDate, endDate, 100);
      
      events = [
        ...createdEvents,
        ...updatedEvents,
        ...canceledEvents,
        ...trialStartedEvents,
        ...trialEndedEvents,
        ...trialConvertedEvents,
        ...paymentSucceededEvents,
        ...paymentFailedEvents
      ];
    }
    
    // Get active subscription count
    const activeSubscriptions = await storage.getActiveSubscriberCount();
    
    // Include user info for reference
    const userIds = [...new Set(events.map(event => event.userId))];
    const users = await Promise.all(userIds.map(id => storage.getUser(id)))
      .then(results => results.filter(user => user !== undefined));
    
    res.json({
      events,
      users,
      activeSubscriptions,
      period: {
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error getting subscription events:', error);
    res.status(500).json({ message: 'Failed to fetch subscription events' });
  }
});

// Get trial conversion rate
router.get('/subscription-conversion-rate', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    const rate = await storage.getSubscriptionConversionRate(startDate, endDate);
    
    res.json({
      rate,
      period: {
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error getting subscription conversion rate:', error);
    res.status(500).json({ message: 'Failed to fetch conversion rate' });
  }
});

export default router;