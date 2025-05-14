import { Router } from 'express';
import { db } from '../db';
import { analytics, insertAnalyticsSchema } from '@shared/schema';
import { and, eq } from 'drizzle-orm';

const router = Router();

/**
 * POST /api/analytics/events
 * 
 * Endpoint to receive and store analytics events from the client
 */
router.post('/events', async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ message: 'No events provided or invalid format' });
    }
    
    // Map events to database format
    const dbEvents = events.map(event => {
      const userId = req.user?.claims?.sub || null;
      const sessionId = req.sessionID || null;

      return {
        userId,
        sessionId,
        eventType: event.type,
        eventAction: 'action' in event ? event.action : null,
        path: 'path' in event ? event.path : null,
        referrer: 'referrer' in event ? event.referrer : null,
        articleId: 'articleId' in event ? event.articleId : null,
        articleTitle: 'articleTitle' in event ? event.articleTitle : null,
        category: ('category' in event ? event.category : 
                 ('articleCategory' in event ? event.articleCategory : null)),
        label: 'label' in event ? event.label : null,
        value: 'value' in event ? event.value : 
              ('readTime' in event ? event.readTime : null),
        clientTimestamp: new Date(event.timestamp)
      };
    });
    
    // Store events in database
    await db.insert(analytics).values(dbEvents);
    
    res.status(200).json({ message: `Successfully stored ${events.length} events` });
  } catch (error) {
    console.error('Error storing analytics events:', error);
    res.status(500).json({ message: 'Failed to store analytics events' });
  }
});

/**
 * GET /api/analytics/summary
 * 
 * Endpoint to get a summary of analytics data (for admin dashboards)
 */
router.get('/summary', async (req, res) => {
  try {
    // Get page view counts
    const pageViews = await db
      .select({
        path: analytics.path,
        count: db.fn.count(analytics.id)
      })
      .from(analytics)
      .where(eq(analytics.eventType, 'pageview'))
      .groupBy(analytics.path)
      .orderBy(db.desc(db.fn.count(analytics.id)));
    
    // Get popular articles
    const popularArticles = await db
      .select({
        articleId: analytics.articleId,
        articleTitle: analytics.articleTitle,
        count: db.fn.count(analytics.id)
      })
      .from(analytics)
      .where(and(
        eq(analytics.eventType, 'article'),
        eq(analytics.eventAction, 'view')
      ))
      .groupBy(analytics.articleId, analytics.articleTitle)
      .orderBy(db.desc(db.fn.count(analytics.id)))
      .limit(10);
    
    // Get event counts by type
    const eventCounts = await db
      .select({
        eventType: analytics.eventType,
        count: db.fn.count(analytics.id)
      })
      .from(analytics)
      .groupBy(analytics.eventType)
      .orderBy(db.desc(db.fn.count(analytics.id)));
    
    res.status(200).json({
      pageViews,
      popularArticles,
      eventCounts
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ message: 'Failed to fetch analytics summary' });
  }
});

export default router;