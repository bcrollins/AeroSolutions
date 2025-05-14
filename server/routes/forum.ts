import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertForumThreadSchema, insertForumReplySchema, insertForumLikeSchema } from "@shared/schema";
import { isAuthenticated } from "../replitAuth";
import WebSocket from "ws";

const router = Router();

// WebSocket connections map to track active users
const connections: Map<number, WebSocket> = new Map();

export function setupForumWebSocket(wss: WebSocket.Server) {
  console.log('Setting up forum WebSocket server');
  
  wss.on('connection', (ws: WebSocket, req: any) => {
    console.log('New WebSocket connection received');
    let userId: number | null = null;

    // Send a welcome message to confirm connection is working
    try {
      ws.send(JSON.stringify({
        type: 'connection_status',
        status: 'connected',
        message: 'Connected to RXAI Forum WebSocket server'
      }));
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }

    ws.on('message', async (message: string) => {
      try {
        console.log('WebSocket message received:', message);
        const data = JSON.parse(message);
        
        // Handle authentication message
        if (data.type === 'auth' && data.userId) {
          try {
            userId = Number(data.userId);
            // Verify that the user exists
            const user = await storage.getUser(userId);
            
            if (!user) {
              console.error(`WebSocket auth failed: User ${userId} not found`);
              ws.send(JSON.stringify({
                type: 'auth_error',
                message: 'User not found'
              }));
              return;
            }
            
            connections.set(userId, ws);
            console.log(`User ${userId} authenticated on forum WebSocket`);
            
            // Send confirmation back to client
            ws.send(JSON.stringify({
              type: 'auth_success',
              userId: userId
            }));
            
            // Send unread notification count on connect
            try {
              const unreadCount = await storage.getUnreadNotificationCount(userId);
              ws.send(JSON.stringify({
                type: 'unread_count',
                count: unreadCount
              }));
            } catch (countError) {
              console.error('Error getting unread notification count:', countError);
            }
          } catch (authError) {
            console.error('Error during WebSocket authentication:', authError);
            ws.send(JSON.stringify({
              type: 'auth_error',
              message: 'Authentication failed'
            }));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        try {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Error processing message'
          }));
        } catch (sendError) {
          console.error('Error sending error message back to client:', sendError);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (userId) {
        connections.delete(userId);
        console.log(`User ${userId} disconnected from forum WebSocket due to error`);
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`WebSocket closed with code ${code}${reason ? `, reason: ${reason}` : ''}`);
      if (userId) {
        connections.delete(userId);
        console.log(`User ${userId} disconnected from forum WebSocket`);
      }
    });
  });
}

// Send notification to a user via WebSocket if they're connected
export function sendNotification(userId: number, notification: any) {
  try {
    const connection = connections.get(userId);
    
    if (!connection) {
      console.log(`User ${userId} is not connected, can't send notification`);
      return false;
    }
    
    if (connection.readyState !== WebSocket.OPEN) {
      console.log(`User ${userId} connection is not open (state: ${connection.readyState}), can't send notification`);
      // Remove stale connection
      if (connection.readyState === WebSocket.CLOSED || connection.readyState === WebSocket.CLOSING) {
        connections.delete(userId);
      }
      return false;
    }
    
    // Send the notification
    connection.send(JSON.stringify({
      type: 'notification',
      data: notification
    }));
    
    console.log(`Notification sent to user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
    return false;
  }
}

// Get course-specific forum threads
router.get('/courses/:courseId/threads', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const result = await storage.getForumThreads(page, limit, {
      courseId,
      search,
      approved: true // Only return approved threads
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching forum threads:', error);
    res.status(500).json({ message: 'Failed to fetch forum threads' });
  }
});

// Get all forum threads (with optional category filter)
router.get('/threads', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;
    
    const result = await storage.getForumThreads(page, limit, {
      category,
      search,
      approved: true // Only return approved threads
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching forum threads:', error);
    res.status(500).json({ message: 'Failed to fetch forum threads' });
  }
});

// Get threads for moderation (admin only)
router.get('/moderation/threads', isAuthenticated, async (req: any, res) => {
  try {
    // Check if user is admin
    const userId = req.user.claims?.sub;
    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const approved = req.query.approved === 'true';
    const rejected = req.query.rejected === 'true';
    const pending = req.query.pending === 'true';
    
    let filters: any = {};
    
    if (pending) {
      filters.approved = false;
    } else if (approved) {
      filters.approved = true;
    } else if (rejected) {
      filters.rejected = true;
    }
    
    const result = await storage.getForumThreads(page, limit, filters);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching threads for moderation:', error);
    res.status(500).json({ message: 'Failed to fetch threads for moderation' });
  }
});

// Get a specific thread with its replies
router.get('/threads/:threadId', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const thread = await storage.getForumThreadById(threadId);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    // Only allow access to approved threads unless the user is the creator or an admin
    if (!thread.isApproved) {
      if (req.isAuthenticated()) {
        const userId = req.user.claims?.sub;
        const user = await storage.getUser(userId);
        
        if (thread.userId !== Number(userId) && user?.role !== 'admin') {
          return res.status(403).json({ message: 'Thread awaiting moderation' });
        }
      } else {
        return res.status(403).json({ message: 'Thread awaiting moderation' });
      }
    }
    
    // Get thread replies (paginated)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Check if user is admin or thread creator to show unapproved replies
    let includeUnapproved = false;
    if (req.isAuthenticated()) {
      const userId = req.user.claims?.sub;
      const user = await storage.getUser(userId);
      includeUnapproved = thread.userId === Number(userId) || user?.role === 'admin';
    }
    
    const { replies, total } = await storage.getForumReplies(threadId, page, limit, includeUnapproved);
    
    // Get author info
    const author = await storage.getUser(thread.userId);
    const authorActivity = await storage.getUserForumActivity(thread.userId);
    
    const replyAuthors = new Map();
    for (const reply of replies) {
      if (!replyAuthors.has(reply.userId)) {
        const user = await storage.getUser(reply.userId);
        replyAuthors.set(reply.userId, {
          id: user.id,
          username: user.username,
          profileImageUrl: user.profileImageUrl
        });
      }
    }
    
    res.json({
      thread,
      replies,
      total,
      author: {
        id: author.id,
        username: author.username,
        profileImageUrl: author.profileImageUrl,
        threadCount: authorActivity?.threadCount || 0,
        replyCount: authorActivity?.replyCount || 0,
        acceptedAnswers: authorActivity?.acceptedAnswers || 0
      },
      replyAuthors: Object.fromEntries(replyAuthors)
    });
  } catch (error) {
    console.error('Error fetching thread details:', error);
    res.status(500).json({ message: 'Failed to fetch thread details' });
  }
});

// Create a new thread
router.post('/threads', isAuthenticated, async (req: any, res) => {
  try {
    const userId = Number(req.user.claims?.sub);
    
    // Validate request body
    const threadSchema = insertForumThreadSchema.extend({
      courseId: z.number().optional(),
      category: z.string().min(1).max(50),
      title: z.string().min(5).max(200),
      content: z.string().min(20).max(10000),
      tags: z.array(z.string()).optional()
    });
    
    const validatedData = threadSchema.parse({
      ...req.body,
      userId
    });
    
    // Create the thread
    const newThread = await storage.createForumThread(validatedData);
    
    if (!newThread) {
      return res.status(500).json({ message: 'Failed to create thread' });
    }
    
    res.status(201).json(newThread);
  } catch (error) {
    console.error('Error creating forum thread:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create thread' });
  }
});

// Create a reply to a thread
router.post('/threads/:threadId/replies', isAuthenticated, async (req: any, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const userId = Number(req.user.claims?.sub);
    
    // Check if thread exists and is not locked
    const thread = await storage.getForumThreadById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    if (thread.isLocked) {
      return res.status(403).json({ message: 'Thread is locked and cannot receive new replies' });
    }
    
    // Validate request body
    const replySchema = insertForumReplySchema.extend({
      content: z.string().min(5).max(5000),
      parentReplyId: z.number().optional()
    });
    
    const validatedData = replySchema.parse({
      ...req.body,
      threadId,
      userId
    });
    
    // Check if parent reply exists if provided
    if (validatedData.parentReplyId) {
      const parentReply = await storage.getReplyById(validatedData.parentReplyId);
      if (!parentReply || parentReply.threadId !== threadId) {
        return res.status(400).json({ message: 'Invalid parent reply' });
      }
    }
    
    // Create the reply
    const newReply = await storage.createForumReply(validatedData);
    
    if (!newReply) {
      return res.status(500).json({ message: 'Failed to create reply' });
    }
    
    // Get author info for the response
    const author = await storage.getUser(userId);
    
    res.status(201).json({
      ...newReply,
      author: {
        id: author.id,
        username: author.username,
        profileImageUrl: author.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Error creating forum reply:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create reply' });
  }
});

// Like/unlike a thread or reply
router.post('/like', isAuthenticated, async (req: any, res) => {
  try {
    const userId = Number(req.user.claims?.sub);
    
    // Validate request body
    const likeSchema = insertForumLikeSchema.extend({
      threadId: z.number().optional(),
      replyId: z.number().optional()
    }).refine(data => data.threadId || data.replyId, {
      message: 'Either threadId or replyId must be provided'
    });
    
    const validatedData = likeSchema.parse({
      ...req.body,
      userId
    });
    
    // Check if thread or reply exists
    if (validatedData.threadId) {
      const thread = await storage.getForumThreadById(validatedData.threadId);
      if (!thread) {
        return res.status(404).json({ message: 'Thread not found' });
      }
    } else if (validatedData.replyId) {
      const reply = await storage.getReplyById(validatedData.replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }
    }
    
    // Toggle like
    const like = await storage.likeForumContent(validatedData);
    
    res.json({ liked: !!like });
  } catch (error) {
    console.error('Error liking forum content:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to like content' });
  }
});

// Moderate a thread (admin only)
router.post('/moderation/threads/:threadId', isAuthenticated, async (req: any, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const moderatorId = Number(req.user.claims?.sub);
    
    // Check if user is admin
    const user = await storage.getUser(moderatorId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    // Validate request body
    const moderationSchema = z.object({
      isApproved: z.boolean(),
      isRejected: z.boolean(),
      moderationNotes: z.string().optional()
    }).refine(data => !(data.isApproved && data.isRejected), {
      message: "A thread cannot be both approved and rejected"
    });
    
    const validatedData = moderationSchema.parse(req.body);
    
    // Update thread moderation status
    const updatedThread = await storage.moderateThread(threadId, {
      ...validatedData,
      moderatedBy: moderatorId
    });
    
    if (!updatedThread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    // Notify thread author
    const notification = await storage.createForumNotification({
      userId: updatedThread.userId,
      threadId: updatedThread.id,
      type: validatedData.isApproved ? 'thread_approved' : 'thread_rejected',
      message: validatedData.isApproved 
        ? `Your thread "${updatedThread.title}" has been approved` 
        : `Your thread "${updatedThread.title}" has been rejected`
    });
    
    // Send real-time notification if user is connected
    if (notification) {
      sendNotification(updatedThread.userId, notification);
    }
    
    res.json(updatedThread);
  } catch (error) {
    console.error('Error moderating thread:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to moderate thread' });
  }
});

// Moderate a reply (admin only)
router.post('/moderation/replies/:replyId', isAuthenticated, async (req: any, res) => {
  try {
    const replyId = parseInt(req.params.replyId);
    const moderatorId = Number(req.user.claims?.sub);
    
    // Check if user is admin
    const user = await storage.getUser(moderatorId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    // Validate request body
    const moderationSchema = z.object({
      isApproved: z.boolean(),
      isRejected: z.boolean(),
      moderationNotes: z.string().optional()
    }).refine(data => !(data.isApproved && data.isRejected), {
      message: "A reply cannot be both approved and rejected"
    });
    
    const validatedData = moderationSchema.parse(req.body);
    
    // Update reply moderation status
    const updatedReply = await storage.moderateReply(replyId, {
      ...validatedData,
      moderatedBy: moderatorId
    });
    
    if (!updatedReply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Notify reply author
    const notification = await storage.createForumNotification({
      userId: updatedReply.userId,
      threadId: updatedReply.threadId,
      replyId: updatedReply.id,
      type: validatedData.isApproved ? 'reply_approved' : 'reply_rejected',
      message: validatedData.isApproved 
        ? 'Your reply has been approved' 
        : 'Your reply has been rejected'
    });
    
    // Send real-time notification if user is connected
    if (notification) {
      sendNotification(updatedReply.userId, notification);
    }
    
    res.json(updatedReply);
  } catch (error) {
    console.error('Error moderating reply:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to moderate reply' });
  }
});

// Mark a reply as accepted answer (thread creator or admin only)
router.post('/threads/:threadId/replies/:replyId/accept', isAuthenticated, async (req: any, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const replyId = parseInt(req.params.replyId);
    const userId = Number(req.user.claims?.sub);
    
    // Check if thread exists and user has permission
    const thread = await storage.getForumThreadById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    // Check if user is thread creator or admin
    const user = await storage.getUser(userId);
    if (thread.userId !== userId && user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only thread creator or admin can mark accepted answer' });
    }
    
    // Check if reply exists and belongs to the thread
    const reply = await storage.getReplyById(replyId);
    if (!reply || reply.threadId !== threadId) {
      return res.status(404).json({ message: 'Reply not found or does not belong to this thread' });
    }
    
    // Toggle accepted answer status
    const updatedReply = await storage.toggleAcceptedAnswer(replyId);
    
    if (!updatedReply) {
      return res.status(500).json({ message: 'Failed to update reply' });
    }
    
    // If reply was accepted, notify reply author
    if (updatedReply.isAcceptedAnswer && updatedReply.userId !== userId) {
      const notification = await storage.createForumNotification({
        userId: updatedReply.userId,
        threadId: threadId,
        replyId: replyId,
        type: 'accepted_answer',
        message: 'Your reply has been marked as the accepted answer'
      });
      
      // Send real-time notification if user is connected
      if (notification) {
        sendNotification(updatedReply.userId, notification);
      }
      
      // Update user's forum activity to include accepted answer
      await storage.updateUserForumActivity(updatedReply.userId);
    }
    
    res.json(updatedReply);
  } catch (error) {
    console.error('Error accepting answer:', error);
    res.status(500).json({ message: 'Failed to accept answer' });
  }
});

// Get notifications for the current user
router.get('/notifications', isAuthenticated, async (req: any, res) => {
  try {
    const userId = Number(req.user.claims?.sub);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const unreadOnly = req.query.unread === 'true';
    
    const { notifications, total } = await storage.getUserNotifications(userId, page, limit, unreadOnly);
    
    res.json({ notifications, total });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notifications as read
router.post('/notifications/read', isAuthenticated, async (req: any, res) => {
  try {
    const userId = Number(req.user.claims?.sub);
    const { notificationIds } = req.body;
    
    // Mark specific notifications or all notifications as read
    const updatedCount = await storage.markNotificationsAsRead(userId, notificationIds);
    
    res.json({ success: true, count: updatedCount });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
});

// Get top contributors
router.get('/top-contributors', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const contributors = await storage.getTopContributors(limit);
    
    // Enrich with user details
    const enrichedContributors = await Promise.all(
      contributors.map(async (contributor) => {
        const user = await storage.getUser(contributor.userId);
        return {
          ...contributor,
          username: user?.username,
          profileImageUrl: user?.profileImageUrl
        };
      })
    );
    
    res.json(enrichedContributors);
  } catch (error) {
    console.error('Error fetching top contributors:', error);
    res.status(500).json({ message: 'Failed to fetch top contributors' });
  }
});

export default router;