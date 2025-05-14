import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { analyticsEvents, pageViews, subscriptionAnalytics } from '@shared/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

const router = Router();

// Validate page view data
const pageViewSchema = z.object({
  path: z.string().min(1),
  userId: z.string().nullable().optional(),
  referrer: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  timestamp: z.string().optional(),
});

// Validate event tracking data
const eventSchema = z.object({
  category: z.string().min(1),
  action: z.string().min(1),
  label: z.string().nullable().optional(),
  value: z.number().nullable().optional(),
  userId: z.string().nullable().optional(),
  path: z.string().min(1),
  timestamp: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Timeframe validation for data retrieval
const timeframeSchema = z.enum(['7days', '30days', '90days', 'year']);

// Track page views
router.post('/page-view', async (req, res) => {
  try {
    const data = pageViewSchema.parse(req.body);
    
    // Get device and browser from user agent
    const userAgent = data.userAgent || '';
    const device = getDeviceFromUserAgent(userAgent);
    const browser = getBrowserFromUserAgent(userAgent);
    
    // Insert page view into database
    await db.insert(pageViews).values({
      path: data.path,
      userId: data.userId || null,
      sessionId: req.sessionID || null,
      referrer: data.referrer || null,
      userAgent: userAgent || null,
      device,
      browser,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError 
        ? error.errors 
        : 'Error tracking page view' 
    });
  }
});

// Track custom events
router.post('/event', async (req, res) => {
  try {
    const data = eventSchema.parse(req.body);
    
    // Insert event into database
    await db.insert(analyticsEvents).values({
      category: data.category,
      action: data.action,
      label: data.label || null,
      value: data.value || null,
      userId: data.userId || null,
      sessionId: req.sessionID || null,
      path: data.path,
      metadata: data.metadata || {},
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    return res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError 
        ? error.errors 
        : 'Error tracking event' 
    });
  }
});

// Get user analytics data
router.get('/user-analytics', isAuthenticated, async (req, res) => {
  try {
    const timeframe = req.query.timeframe as string || '30days';
    const validTimeframe = timeframeSchema.parse(timeframe);
    
    // Calculate date range based on timeframe
    const { startDate, endDate } = getDateRangeFromTimeframe(validTimeframe);
    
    // Get user activity summary
    const userStats = await getUserStats(startDate, endDate);
    
    // Get user activity over time
    const userActivity = await getUserActivity(startDate, endDate);
    
    // Get top active users
    const topUsers = await getTopUsers(startDate, endDate);
    
    // Get geographical distribution
    const geoDistribution = await getGeoDistribution(startDate, endDate);
    
    return res.status(200).json({
      summary: userStats,
      userActivity,
      topUsers,
      geoDistribution
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    return res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError 
        ? error.errors 
        : 'Error retrieving user analytics' 
    });
  }
});

// Get subscription analytics data
router.get('/subscription-analytics', isAuthenticated, async (req, res) => {
  try {
    const timeframe = req.query.timeframe as string || '30days';
    const validTimeframe = timeframeSchema.parse(timeframe);
    
    // Calculate date range based on timeframe
    const { startDate, endDate } = getDateRangeFromTimeframe(validTimeframe);
    
    // Get subscription summary
    const summary = await getSubscriptionSummary(startDate, endDate);
    
    // Get plan breakdown
    const planBreakdown = await getPlanBreakdown();
    
    // Get recent transactions
    const recentTransactions = await getRecentTransactions(startDate, endDate);
    
    // Get subscription trends
    const subscriptionTrends = await getSubscriptionTrends(startDate, endDate, validTimeframe);
    
    return res.status(200).json({
      summary,
      planBreakdown,
      recentTransactions,
      subscriptionTrends
    });
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    return res.status(400).json({ 
      success: false, 
      message: error instanceof z.ZodError 
        ? error.errors 
        : 'Error retrieving subscription analytics' 
    });
  }
});

// Helper functions
function getDeviceFromUserAgent(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
    if (/ipad/i.test(userAgent)) return 'tablet';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'mobile';
  }
  
  return 'desktop';
}

function getBrowserFromUserAgent(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  if (/chrome/i.test(userAgent) && !/edge|edg/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent) && !/chrome|chromium/i.test(userAgent)) return 'Safari';
  if (/edge|edg/i.test(userAgent)) return 'Edge';
  if (/opera|opr/i.test(userAgent)) return 'Opera';
  if (/msie|trident/i.test(userAgent)) return 'Internet Explorer';
  
  return 'unknown';
}

function getDateRangeFromTimeframe(timeframe: string): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeframe) {
    case '7days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  return { startDate, endDate };
}

// Get user stats function - this would be implemented with real database queries
async function getUserStats(startDate: Date, endDate: Date) {
  // Sample implementation - would be replaced with actual database queries
  const totalUsers = await storage.getUserCount();
  
  // Get active users (users who have logged in during the timeframe)
  const activeUsers = await storage.getActiveUserCount(startDate, endDate);
  
  // Get new users registered during the timeframe
  const newUsers = await storage.getNewUserCount(startDate, endDate);
  
  // Calculate returning users
  const returningUsers = activeUsers - newUsers > 0 ? activeUsers - newUsers : 0;
  
  // Get average session duration in seconds
  const avgSessionDuration = await storage.getAverageSessionDuration(startDate, endDate);
  
  // Calculate user growth rate
  const previousPeriodStart = new Date(startDate);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousUsers = await storage.getActiveUserCount(previousPeriodStart, startDate);
  const userGrowthRate = previousUsers > 0 ? ((activeUsers - previousUsers) / previousUsers) * 100 : 0;
  
  // Get bounce rate
  const bounceRate = 35; // This would be calculated from actual session data
  
  // Get device breakdown
  const usersByDevice = {
    mobile: Math.round(activeUsers * 0.45),
    desktop: Math.round(activeUsers * 0.48),
    tablet: Math.round(activeUsers * 0.07),
  };
  
  // Get browser breakdown
  const usersByBrowser = {
    Chrome: Math.round(activeUsers * 0.65),
    Firefox: Math.round(activeUsers * 0.12),
    Safari: Math.round(activeUsers * 0.18),
    Edge: Math.round(activeUsers * 0.04),
    Other: Math.round(activeUsers * 0.01),
  };
  
  return {
    totalUsers,
    activeUsers,
    newUsers,
    returningUsers,
    averageSessionDuration: avgSessionDuration,
    userGrowthRate,
    bounceRate,
    usersByDevice,
    usersByBrowser,
  };
}

async function getUserActivity(startDate: Date, endDate: Date) {
  // This would be implemented with actual database queries
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const activity = [];
  
  const currentDate = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const date = currentDate.toISOString().split('T')[0];
    activity.push({
      date,
      pageViews: Math.floor(Math.random() * 1000) + 500,
      uniqueUsers: Math.floor(Math.random() * 200) + 100,
      avgSessionTime: Math.floor(Math.random() * 300) + 60,
      registrations: Math.floor(Math.random() * 20) + 5,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return activity;
}

async function getTopUsers(startDate: Date, endDate: Date) {
  // This would be implemented with actual database queries
  // For now, return sample data
  return [
    {
      id: "user1",
      username: "john_doe",
      email: "john@example.com",
      totalSessions: 42,
      lastActive: "2025-05-10T15:30:00Z",
      totalTimeSpent: 4500,
      role: "user",
      registrationDate: "2024-01-15T10:00:00Z",
    },
    {
      id: "user2",
      username: "jane_smith",
      email: "jane@example.com",
      totalSessions: 37,
      lastActive: "2025-05-12T09:15:00Z",
      totalTimeSpent: 3600,
      role: "user",
      registrationDate: "2024-02-20T14:30:00Z",
    },
    {
      id: "admin1",
      username: "admin_user",
      email: "admin@example.com",
      totalSessions: 85,
      lastActive: "2025-05-13T17:45:00Z",
      totalTimeSpent: 7200,
      role: "admin",
      registrationDate: "2023-11-05T08:00:00Z",
    },
    {
      id: "rollins",
      username: "brollins",
      email: "brollins565@gmail.com",
      totalSessions: 120,
      lastActive: "2025-05-14T01:20:00Z",
      totalTimeSpent: 9600,
      role: "admin",
      registrationDate: "2023-10-01T00:00:00Z",
    },
  ];
}

async function getGeoDistribution(startDate: Date, endDate: Date) {
  // This would be implemented with actual database queries
  // For now, return sample data
  return [
    { country: "United States", users: 1250, percentage: 62.5 },
    { country: "United Kingdom", users: 320, percentage: 16.0 },
    { country: "Canada", users: 180, percentage: 9.0 },
    { country: "Australia", users: 120, percentage: 6.0 },
    { country: "Germany", users: 80, percentage: 4.0 },
    { country: "Other", users: 50, percentage: 2.5 },
  ];
}

async function getSubscriptionSummary(startDate: Date, endDate: Date) {
  // This would be implemented with actual database queries
  
  // Get active subscriptions
  const activeSubscriptions = await storage.getActiveSubscriptionCount();
  
  // Get trial subscriptions
  const trialSubscriptions = await storage.getTrialSubscriptionCount();
  
  // Get canceled subscriptions during the timeframe
  const canceledSubscriptions = await storage.getCanceledSubscriptionCount(startDate, endDate);
  
  // Get total revenue
  const totalRevenue = await storage.getTotalRevenue();
  
  // Get monthly recurring revenue
  const monthlyRecurringRevenue = await storage.getMonthlyRecurringRevenue();
  
  // Get annual recurring revenue
  const annualRecurringRevenue = await storage.getAnnualRecurringRevenue();
  
  // Calculate conversion rate (percentage of users who have subscriptions)
  const totalUsers = await storage.getUserCount();
  const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0;
  
  // Calculate trial conversion rate
  const completedTrials = await storage.getCompletedTrialCount(startDate, endDate);
  const trialConversions = await storage.getTrialConversionCount(startDate, endDate);
  const trialConversionRate = completedTrials > 0 ? (trialConversions / completedTrials) * 100 : 0;
  
  // Calculate average subscription value
  const averageSubscriptionValue = activeSubscriptions > 0 ? monthlyRecurringRevenue / activeSubscriptions : 0;
  
  // Calculate churn rate
  const previousPeriodEnd = new Date(startDate);
  const previousPeriodStart = new Date(startDate);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousSubscribers = await storage.getActiveSubscriptionCount(previousPeriodStart, previousPeriodEnd);
  const churnRate = previousSubscribers > 0 ? (canceledSubscriptions / previousSubscribers) * 100 : 0;
  
  return {
    activeSubscriptions,
    trialSubscriptions,
    canceledSubscriptions,
    totalRevenue,
    monthlyRecurringRevenue,
    annualRecurringRevenue,
    conversionRate,
    trialConversionRate,
    averageSubscriptionValue,
    churnRate,
  };
}

async function getPlanBreakdown() {
  // This would be implemented with actual database queries
  // For now, return sample data
  return [
    {
      planId: 1,
      planName: "Basic",
      subscribers: 350,
      percentageOfTotal: 28,
      revenue: 6650,
    },
    {
      planId: 2,
      planName: "Pro",
      subscribers: 750,
      percentageOfTotal: 60,
      revenue: 36750,
    },
    {
      planId: 3,
      planName: "Enterprise",
      subscribers: 150,
      percentageOfTotal: 12,
      revenue: 29850,
    },
  ];
}

async function getRecentTransactions(startDate: Date, endDate: Date) {
  // This would be implemented with actual database queries
  // For now, return sample data
  return [
    {
      id: 12345,
      userId: "user123",
      planName: "Pro",
      amount: 49,
      status: "successful",
      date: "2025-05-13T10:30:00Z",
    },
    {
      id: 12344,
      userId: "user456",
      planName: "Enterprise",
      amount: 199,
      status: "successful",
      date: "2025-05-12T15:45:00Z",
    },
    {
      id: 12343,
      userId: "user789",
      planName: "Basic",
      amount: 19,
      status: "successful",
      date: "2025-05-12T09:15:00Z",
    },
    {
      id: 12342,
      userId: "user234",
      planName: "Pro",
      amount: 49,
      status: "successful",
      date: "2025-05-11T14:20:00Z",
    },
    {
      id: 12341,
      userId: "user567",
      planName: "Pro",
      amount: 49,
      status: "failed",
      date: "2025-05-10T11:10:00Z",
    },
  ];
}

async function getSubscriptionTrends(startDate: Date, endDate: Date, timeframe: string) {
  // This would be implemented with actual database queries
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const trends = [];
  
  // Determine interval based on timeframe
  let interval = 1; // days
  if (timeframe === 'year' && days > 90) {
    interval = 7; // weekly for yearly view
  } else if (timeframe === '90days' && days > 30) {
    interval = 3; // every 3 days for 90-day view
  }
  
  const currentDate = new Date(startDate);
  for (let i = 0; i < days; i += interval) {
    const date = currentDate.toISOString().split('T')[0];
    
    // Generate sample data - would be replaced with actual database queries
    const newSubscriptions = Math.floor(Math.random() * 15) + 5;
    const cancelations = Math.floor(Math.random() * 8);
    const netGrowth = newSubscriptions - cancelations;
    const revenue = (Math.floor(Math.random() * 1000) + 500) * interval;
    
    trends.push({
      date,
      newSubscriptions,
      cancelations,
      netGrowth,
      revenue,
    });
    
    currentDate.setDate(currentDate.getDate() + interval);
  }
  
  return trends;
}

export default router;