import { Router } from 'express';
import { db } from '../db';
import { analytics, insertAnalyticsSchema } from '@shared/schema';
import { and, eq, count, sql, desc, asc } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { isAuthenticated } from '../replitAuth';
import { z } from 'zod';

const router = Router();

// Schema for validating analytics events
const analyticsEventSchema = z.object({
  events: z.array(
    z.object({
      type: z.enum(['pageview', 'article', 'custom']),
      action: z.string().optional(),
      path: z.string().optional(),
      referrer: z.string().optional(),
      articleId: z.union([z.string(), z.number()]).optional(),
      articleTitle: z.string().optional(),
      articleCategory: z.string().optional(),
      category: z.string().optional(), 
      label: z.string().optional(),
      value: z.number().optional(),
      readTime: z.number().optional(),
      timestamp: z.number()
    })
  ),
  sessionId: z.string()
});

/**
 * POST /api/analytics/events
 * 
 * Endpoint to receive and store analytics events from the client
 */
router.post('/events', async (req, res) => {
  try {
    const { events, sessionId } = analyticsEventSchema.parse(req.body);
    
    // Get user ID if authenticated
    const userId = req.user?.id;
    
    // Process and store each event
    for (const event of events) {
      try {
        await db.insert(analytics).values({
          userId: userId || null,
          sessionId,
          eventType: event.type,
          eventAction: event.action,
          path: event.path,
          referrer: event.referrer,
          articleId: event.articleId?.toString(),
          articleTitle: event.articleTitle,
          category: event.category || event.articleCategory,
          label: event.label,
          value: event.value || event.readTime,
          clientTimestamp: new Date(event.timestamp)
        });
      } catch (error: any) {
        logger.error('Error storing individual analytics event', { 
          error: error.message,
          event
        });
        // Continue processing other events even if one fails
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error('Error processing analytics events', { error: error.message });
    
    // Send appropriate error response
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to process analytics events'
    });
  }
});

/**
 * GET /api/analytics/summary
 * 
 * Endpoint to get a summary of analytics data (for admin dashboards)
 */
router.get('/summary', isAuthenticated, async (req, res) => {
  try {
    // Only allow admins to access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can access analytics summary'
      });
    }
    
    // Period selection (default to last 30 days)
    const periodDays = parseInt(req.query.period as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    
    // Get pageview stats
    const pageviews = await db
      .select({
        path: analytics.path,
        count: count(),
      })
      .from(analytics)
      .where(
        and(
          eq(analytics.eventType, 'pageview'),
          sql`${analytics.timestamp} >= ${startDate}`
        )
      )
      .groupBy(analytics.path)
      .orderBy(desc(count()))
      .limit(10);
    
    // Get article view stats
    const articleViews = await db
      .select({
        articleId: analytics.articleId,
        articleTitle: analytics.articleTitle,
        views: count(),
      })
      .from(analytics)
      .where(
        and(
          eq(analytics.eventType, 'article'),
          eq(analytics.eventAction, 'view'),
          sql`${analytics.timestamp} >= ${startDate}`
        )
      )
      .groupBy(analytics.articleId, analytics.articleTitle)
      .orderBy(desc(count()))
      .limit(10);
    
    // Get article engagement metrics (likes, shares, comments)
    const articleEngagement = await db
      .select({
        articleId: analytics.articleId,
        articleTitle: analytics.articleTitle,
        action: analytics.eventAction,
        count: count(),
      })
      .from(analytics)
      .where(
        and(
          eq(analytics.eventType, 'article'),
          sql`${analytics.eventAction} IN ('like', 'share', 'comment')`,
          sql`${analytics.timestamp} >= ${startDate}`
        )
      )
      .groupBy(analytics.articleId, analytics.articleTitle, analytics.eventAction)
      .orderBy(desc(count()))
      .limit(15);
    
    // Get referral sources
    const referralSources = await db
      .select({
        referrer: analytics.referrer,
        count: count(),
      })
      .from(analytics)
      .where(
        and(
          eq(analytics.eventType, 'pageview'),
          sql`${analytics.referrer} IS NOT NULL`,
          sql`${analytics.timestamp} >= ${startDate}`
        )
      )
      .groupBy(analytics.referrer)
      .orderBy(desc(count()))
      .limit(10);
    
    res.json({
      period: periodDays,
      pageviews,
      articleViews,
      articleEngagement,
      referralSources
    });
    
  } catch (error: any) {
    logger.error('Error fetching analytics summary', { error: error.message });
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch analytics summary'
    });
  }
});

// Export routes
export default router;