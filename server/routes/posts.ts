import express from 'express';
import { db } from '../db';
import { posts, articleEngagement } from '../../shared/schema';
import { eq, like, and, or, not, desc, asc, gte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/posts - Get all posts with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      postType, 
      tag, 
      featured,
      premium,
      limit = '20',
      offset = '0',
      sort = 'newest'
    } = req.query as Record<string, string>;

    let query = db.select().from(posts);
    
    // Apply filters
    const filters = [];
    
    if (category) {
      filters.push(eq(posts.category, category));
    }
    
    if (postType) {
      filters.push(eq(posts.postType, postType));
    }
    
    if (tag) {
      // Since tags is a JSON array, we need to use a specific SQL function
      filters.push(sql`${posts.tags} ? ${tag}`);
    }
    
    if (featured === 'true') {
      filters.push(eq(posts.featuredPost, true));
    }
    
    if (premium === 'true') {
      filters.push(eq(posts.premium, true));
    }
    
    if (filters.length > 0) {
      query = query.where(and(...filters));
    }
    
    // Apply sorting
    if (sort === 'newest') {
      query = query.orderBy(desc(posts.publishedAt || posts.createdAt));
    } else if (sort === 'oldest') {
      query = query.orderBy(asc(posts.publishedAt || posts.createdAt));
    } else if (sort === 'popular') {
      query = query.orderBy(desc(posts.viewCount));
    }
    
    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));
    
    const allPosts = await query;
    
    res.json(allPosts);
  } catch (error: any) {
    logger.error('Error fetching posts', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch posts'
    });
  }
});

/**
 * GET /api/posts/search - Search posts
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = '20', offset = '0' } = req.query as Record<string, string>;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Search query is required'
      });
    }
    
    const searchQuery = `%${q.toLowerCase()}%`;
    
    const results = await db
      .select()
      .from(posts)
      .where(
        or(
          like(sql`LOWER(${posts.title})`, searchQuery),
          like(sql`LOWER(${posts.content})`, searchQuery),
          like(sql`LOWER(${posts.summary})`, searchQuery),
          like(sql`LOWER(${posts.question})`, searchQuery),
          like(sql`LOWER(${posts.seoKeywords})`, searchQuery),
          like(sql`LOWER(${posts.focusKeyword})`, searchQuery)
        )
      )
      .orderBy(desc(posts.publishedAt || posts.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));
    
    res.json(results);
  } catch (error: any) {
    logger.error('Error searching posts', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search posts'
    });
  }
});

/**
 * GET /api/posts/related - Get related posts
 */
router.get('/related', async (req, res) => {
  try {
    const { category, postType, tag, exclude, limit = '3' } = req.query as Record<string, string>;
    
    let query = db.select().from(posts);
    const filters = [];
    
    // Filter by category if provided
    if (category) {
      filters.push(eq(posts.category, category));
    }
    
    // Filter by postType if provided
    if (postType) {
      filters.push(eq(posts.postType, postType));
    }
    
    // Filter by tag if provided
    if (tag) {
      filters.push(sql`${posts.tags} ? ${tag}`);
    }
    
    // Exclude specific post if needed
    if (exclude) {
      filters.push(not(eq(posts.id, parseInt(exclude))));
    }
    
    if (filters.length > 0) {
      query = query.where(and(...filters));
    }
    
    // Limit results and sort by newest
    query = query
      .orderBy(desc(posts.publishedAt || posts.createdAt))
      .limit(parseInt(limit));
    
    const relatedPosts = await query;
    
    res.json(relatedPosts);
  } catch (error: any) {
    logger.error('Error fetching related posts', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch related posts'
    });
  }
});

/**
 * GET /api/posts/events/upcoming - Get upcoming car events
 */
router.get('/events/upcoming', async (req, res) => {
  try {
    const { limit = '5' } = req.query as Record<string, string>;
    const now = new Date();
    
    const events = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.postType, 'car_event'),
          gte(posts.eventDate, now)
        )
      )
      .orderBy(asc(posts.eventDate))
      .limit(parseInt(limit));
    
    res.json(events);
  } catch (error: any) {
    logger.error('Error fetching upcoming events', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch upcoming events'
    });
  }
});

/**
 * GET /api/posts/:slug - Get a single post by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug));
    
    if (!post) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Post not found'
      });
    }
    
    // Increment view count
    await db
      .update(posts)
      .set({ 
        viewCount: (post.viewCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(posts.id, post.id));
    
    // Track engagement
    try {
      const [existingEngagement] = await db
        .select()
        .from(articleEngagement)
        .where(eq(articleEngagement.article_id, post.id));
      
      if (existingEngagement) {
        await db
          .update(articleEngagement)
          .set({ 
            views: existingEngagement.views + 1,
            lastUpdated: new Date()
          })
          .where(eq(articleEngagement.id, existingEngagement.id));
      } else {
        await db
          .insert(articleEngagement)
          .values({
            article_id: post.id,
            views: 1,
            lastUpdated: new Date()
          });
      }
    } catch (engagementError: any) {
      // Log but don't fail the request
      logger.error('Error tracking article engagement', { 
        error: engagementError.message
      });
    }
    
    res.json(post);
  } catch (error: any) {
    logger.error('Error fetching post by slug', { 
      error: error.message,
      slug: req.params.slug
    });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch post'
    });
  }
});

/**
 * POST /api/posts/:id/likes - Update post likes
 */
router.post('/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    if (!['increment', 'decrement'].includes(action)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Invalid action. Use "increment" or "decrement"'
      });
    }
    
    // Get current post
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(id)));
    
    if (!post) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Post not found'
      });
    }
    
    // Calculate new like count
    const currentLikes = post.likeCount || 0;
    const newLikes = action === 'increment' ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    
    // Update the post
    await db
      .update(posts)
      .set({ 
        likeCount: newLikes,
        updatedAt: new Date()
      })
      .where(eq(posts.id, parseInt(id)));
    
    // Update engagement record
    try {
      const [engagement] = await db
        .select()
        .from(articleEngagement)
        .where(eq(articleEngagement.article_id, parseInt(id)));
      
      if (engagement) {
        await db
          .update(articleEngagement)
          .set({ 
            likes: newLikes,
            lastUpdated: new Date()
          })
          .where(eq(articleEngagement.id, engagement.id));
      }
    } catch (engagementError: any) {
      // Log but don't fail the request
      logger.error('Error updating article engagement likes', { 
        error: engagementError.message,
        postId: id
      });
    }
    
    res.json({ likes: newLikes });
  } catch (error: any) {
    logger.error('Error updating post likes', { 
      error: error.message, 
      postId: req.params.id
    });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update likes'
    });
  }
});

// Admin-only routes below

/**
 * POST /api/posts - Create a new post (admin only)
 */
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const postData = req.body;
    
    // Check if slug is provided, otherwise generate from title
    if (!postData.slug && postData.title) {
      postData.slug = postData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    // Check if slug already exists
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, postData.slug));
    
    if (existingPost) {
      // Append a random string to make the slug unique
      postData.slug = `${postData.slug}-${Math.random().toString(36).substring(2, 8)}`;
    }
    
    // Set published date if status is published
    if (postData.status === 'published' && !postData.publishedAt) {
      postData.publishedAt = new Date();
    }
    
    // Insert the post
    const [newPost] = await db
      .insert(posts)
      .values(postData)
      .returning();
    
    // Create initial engagement record
    await db
      .insert(articleEngagement)
      .values({
        article_id: newPost.id,
        views: 0,
        shares: 0,
        likes: 0,
        comments: 0,
        avgReadTime: 0,
        socialShares: {},
        lastUpdated: new Date()
      });
    
    res.status(201).json(newPost);
  } catch (error: any) {
    logger.error('Error creating post', { 
      error: error.message, 
      body: req.body
    });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create post'
    });
  }
});

/**
 * PUT /api/posts/:id - Update an existing post (admin only)
 */
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if post exists
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(id)));
    
    if (!existingPost) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Post not found'
      });
    }
    
    // If slug is being changed, verify it's unique
    if (updateData.slug && updateData.slug !== existingPost.slug) {
      const [slugCheck] = await db
        .select()
        .from(posts)
        .where(and(
          eq(posts.slug, updateData.slug),
          not(eq(posts.id, parseInt(id)))
        ));
      
      if (slugCheck) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'This URL slug is already in use by another post'
        });
      }
    }
    
    // If status is changing to published, set publishedAt date
    if (updateData.status === 'published' && existingPost.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    
    // Update the post
    const [updatedPost] = await db
      .update(posts)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(posts.id, parseInt(id)))
      .returning();
    
    res.json(updatedPost);
  } catch (error: any) {
    logger.error('Error updating post', { 
      error: error.message, 
      postId: req.params.id,
      body: req.body
    });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update post'
    });
  }
});

/**
 * DELETE /api/posts/:id - Delete a post (admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if post exists
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(id)));
    
    if (!existingPost) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Post not found'
      });
    }
    
    // Delete the post
    await db
      .delete(posts)
      .where(eq(posts.id, parseInt(id)));
    
    res.status(204).end();
  } catch (error: any) {
    logger.error('Error deleting post', { 
      error: error.message, 
      postId: req.params.id
    });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete post'
    });
  }
});

export default router;