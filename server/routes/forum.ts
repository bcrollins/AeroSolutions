import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { logger } from '../utils/logger';
import { isAuthenticated } from '../middlewares/auth';
import { z } from 'zod';
import { validateRequest } from '../middlewares/validate';
import { 
  insertForumThreadSchema, 
  insertForumReplySchema,
} from '@shared/schema';

const router = Router();

// Validation schemas
const threadIdParam = z.object({
  id: z.coerce.number()
});

const replyIdParam = z.object({
  id: z.coerce.number()
});

const getThreadsQuery = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().optional()
});

/**
 * @route GET /api/forum/threads
 * @desc Get forum threads, optionally filtered by category
 * @access Public
 */
router.get('/threads', validateRequest({ query: getThreadsQuery }), async (req: Request, res: Response) => {
  try {
    const { category, limit } = req.query;
    const threads = await storage.getForumThreads(
      category as string | undefined, 
      limit ? parseInt(limit as string) : undefined
    );
    res.json(threads);
  } catch (error) {
    logger.error('Error fetching forum threads', { error });
    res.status(500).json({ error: 'Failed to fetch forum threads' });
  }
});

/**
 * @route GET /api/forum/threads/:id
 * @desc Get a specific forum thread with its replies
 * @access Public
 */
router.get('/threads/:id', validateRequest({ params: threadIdParam }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const thread = await storage.getForumThreadById(parseInt(id));
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    // Increment view count
    await storage.incrementThreadViews(thread.id);
    
    // Get replies
    const replies = await storage.getForumRepliesByThreadId(thread.id);
    
    // Get author details
    const author = await storage.getUser(thread.userId);
    
    // Get reply authors
    const replyAuthors = await Promise.all(
      replies.map(async (reply) => {
        const author = await storage.getUser(reply.userId);
        return {
          id: author?.id,
          username: author?.username,
          profileImageUrl: author?.profileImageUrl
        };
      })
    );
    
    // Format thread with replies and authors
    const threadWithReplies = {
      ...thread,
      author: {
        id: author?.id,
        username: author?.username,
        profileImageUrl: author?.profileImageUrl
      },
      replies: replies.map((reply, index) => ({
        ...reply,
        author: replyAuthors[index]
      }))
    };
    
    res.json(threadWithReplies);
  } catch (error) {
    logger.error('Error fetching forum thread', { error, threadId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch forum thread' });
  }
});

/**
 * @route POST /api/forum/threads
 * @desc Create a new forum thread
 * @access Private
 */
router.post('/threads', isAuthenticated, validateRequest({ 
  body: insertForumThreadSchema.extend({
    title: z.string().min(5).max(200),
    content: z.string().min(20),
    category: z.string().min(2)
  })
}), async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { title, content, tags, category } = req.body;
    
    const threadData = {
      userId,
      title,
      content,
      tags: tags || [],
      category,
      isPinned: false,
      isLocked: false
    };
    
    const thread = await storage.createForumThread(threadData);
    
    res.status(201).json(thread);
  } catch (error) {
    logger.error('Error creating forum thread', { error, userId: (req.user as any).id });
    res.status(500).json({ error: 'Failed to create forum thread' });
  }
});

/**
 * @route POST /api/forum/threads/:id/replies
 * @desc Reply to a forum thread
 * @access Private
 */
router.post('/threads/:id/replies', isAuthenticated, validateRequest({ 
  params: threadIdParam,
  body: insertForumReplySchema.extend({
    content: z.string().min(5),
    parentReplyId: z.number().optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const threadId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    const { content, parentReplyId } = req.body;
    
    // Check if thread exists and is not locked
    const thread = await storage.getForumThreadById(threadId);
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    if (thread.isLocked) {
      return res.status(403).json({ error: 'Thread is locked' });
    }
    
    // If there's a parent reply, check if it exists
    if (parentReplyId) {
      const replies = await storage.getForumRepliesByThreadId(threadId);
      const parentExists = replies.some(reply => reply.id === parentReplyId);
      
      if (!parentExists) {
        return res.status(404).json({ error: 'Parent reply not found' });
      }
    }
    
    // Create reply
    const replyData = {
      threadId,
      userId,
      content,
      isAcceptedAnswer: false,
      parentReplyId
    };
    
    const reply = await storage.createForumReply(replyData);
    
    // Update thread's lastReplyAt timestamp (done by database trigger if possible)
    // Or do it manually here if needed
    
    res.status(201).json(reply);
  } catch (error) {
    logger.error('Error creating forum reply', { 
      error, 
      threadId: req.params.id, 
      userId: (req.user as any).id 
    });
    res.status(500).json({ error: 'Failed to create forum reply' });
  }
});

/**
 * @route PUT /api/forum/replies/:id/accept
 * @desc Mark a reply as accepted answer (thread creator or admin only)
 * @access Private
 */
router.put('/replies/:id/accept', isAuthenticated, validateRequest({ 
  params: replyIdParam
}), async (req: Request, res: Response) => {
  try {
    const replyId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Get the reply
    const replies = await storage.getForumRepliesByThreadId(-1); // This is a workaround, we need a method to get a reply by id
    const reply = replies.find(r => r.id === replyId);
    
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    
    // Get the thread to check if user is the creator
    const thread = await storage.getForumThreadById(reply.threadId);
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    // Check if user is thread creator or admin
    const user = await storage.getUser(userId);
    
    if (thread.userId !== userId && user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only thread creators or admins can mark answers as accepted' });
    }
    
    // Mark as accepted
    const updatedReply = await storage.markReplyAsAcceptedAnswer(replyId);
    
    res.json(updatedReply);
  } catch (error) {
    logger.error('Error accepting forum reply', { 
      error, 
      replyId: req.params.id, 
      userId: (req.user as any).id 
    });
    res.status(500).json({ error: 'Failed to accept forum reply' });
  }
});

/**
 * @route GET /api/forum/user/activity
 * @desc Get a user's forum activity (threads and replies)
 * @access Private
 */
router.get('/user/activity', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const activity = await storage.getUserForumActivity(userId);
    res.json(activity);
  } catch (error) {
    logger.error('Error fetching user forum activity', { error, userId: (req.user as any).id });
    res.status(500).json({ error: 'Failed to fetch user forum activity' });
  }
});

export default router;