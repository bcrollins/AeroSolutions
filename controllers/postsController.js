/**
 * Posts Controller
 * 
 * This controller handles all operations related to blog posts, news articles,
 * car events, and AI Q&A content.
 */

const { db } = require('../server/db');
const { sql } = require('drizzle-orm');
const { posts, articleEngagement } = require('../shared/schema');
const { eq, like, and, or, not, desc, asc, gte } = require('drizzle-orm');
const logger = require('../config/logger');
const { generateAIContent } = require('../utils/aiContentGenerator');

/**
 * Get all posts with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllPosts(req, res, next) {
  try {
    const { 
      category, 
      postType, 
      tag, 
      featured,
      premium,
      limit = 20,
      offset = 0,
      sort = 'newest'
    } = req.query;

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
      // This is postgres-specific syntax
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
  } catch (error) {
    logger.error('Error fetching posts', { error: error.message, stack: error.stack });
    next(error);
  }
}

/**
 * Get a single post by slug
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getPostBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug));
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
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
    } catch (engagementError) {
      // Log but don't fail the request
      logger.error('Error tracking article engagement', { 
        error: engagementError.message
      });
    }
    
    res.json(post);
  } catch (error) {
    logger.error('Error fetching post by slug', { 
      error: error.message, 
      slug: req.params.slug
    });
    next(error);
  }
}

/**
 * Get related posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getRelatedPosts(req, res, next) {
  try {
    const { category, postType, tag, exclude, limit = 3 } = req.query;
    
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
  } catch (error) {
    logger.error('Error fetching related posts', { error: error.message });
    next(error);
  }
}

/**
 * Create a new post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createPost(req, res, next) {
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
    
    // If generateWithAI flag is true, generate content using AI
    if (postData.generateWithAI) {
      try {
        const aiContent = await generateAIContent({
          title: postData.title,
          type: postData.postType || 'regular',
          question: postData.question,
          topic: postData.topic || postData.category,
          keywords: postData.seoKeywords || postData.tags?.join(', ')
        });

        // Merge AI generated content
        postData.content = aiContent.content;
        postData.summary = aiContent.summary || postData.summary;
        postData.seoDescription = aiContent.seoDescription || postData.seoDescription;
        postData.seoKeywords = aiContent.seoKeywords || postData.seoKeywords;
        postData.tags = aiContent.tags || postData.tags;
        postData.readTimeMinutes = aiContent.readTimeMinutes || postData.readTimeMinutes;
        postData.aiGeneratedBy = aiContent.generator || 'xai';
      } catch (aiError) {
        logger.error('Error generating AI content', { 
          error: aiError.message, 
          title: postData.title
        });
        // Continue without AI content if it fails
      }
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
  } catch (error) {
    logger.error('Error creating post', { 
      error: error.message, 
      body: req.body
    });
    next(error);
  }
}

/**
 * Update an existing post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if post exists
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(id)));
    
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
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
          error: 'Slug already exists',
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
  } catch (error) {
    logger.error('Error updating post', { 
      error: error.message, 
      postId: req.params.id,
      body: req.body
    });
    next(error);
  }
}

/**
 * Delete a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    
    // Check if post exists
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(id)));
    
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Delete the post
    await db
      .delete(posts)
      .where(eq(posts.id, parseInt(id)));
    
    // Delete related engagements (cascade should handle this automatically)
    
    res.status(204).end();
  } catch (error) {
    logger.error('Error deleting post', { 
      error: error.message, 
      postId: req.params.id
    });
    next(error);
  }
}

/**
 * Update like count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updateLikes(req, res, next) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'increment' or 'decrement'
    
    if (!['increment', 'decrement'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "increment" or "decrement"' });
    }
    
    // Get current post
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(id)));
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Calculate new like count
    const currentLikes = post.likeCount || 0;
    const newLikes = action === 'increment' ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    
    // Update the post
    const [updatedPost] = await db
      .update(posts)
      .set({ 
        likeCount: newLikes,
        updatedAt: new Date()
      })
      .where(eq(posts.id, parseInt(id)))
      .returning();
    
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
    } catch (engagementError) {
      // Log but don't fail the request
      logger.error('Error updating article engagement likes', { 
        error: engagementError.message,
        postId: id
      });
    }
    
    res.json({ likes: newLikes });
  } catch (error) {
    logger.error('Error updating post likes', { 
      error: error.message, 
      postId: req.params.id
    });
    next(error);
  }
}

/**
 * Search posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function searchPosts(req, res, next) {
  try {
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
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
  } catch (error) {
    logger.error('Error searching posts', { 
      error: error.message, 
      query: req.query
    });
    next(error);
  }
}

/**
 * Get upcoming car events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getUpcomingEvents(req, res, next) {
  try {
    const { limit = 5 } = req.query;
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
  } catch (error) {
    logger.error('Error fetching upcoming events', { error: error.message });
    next(error);
  }
}

module.exports = {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  createPost,
  updatePost,
  deletePost,
  updateLikes,
  searchPosts,
  getUpcomingEvents
};