import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

// Types for study room WebSocket messages
interface StudyRoomMessage {
  type: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  [key: string]: any;
}

interface ChatMessage extends StudyRoomMessage {
  messageId: string;
  content: string;
  messageType: 'text' | 'question' | 'answer' | 'resource';
  timestamp: string;
}

interface StudyRoom {
  id: string;
  name: string;
  courseId: string;
  lessonId: string;
  createdAt: string;
  clients: Map<WebSocket, StudyRoomClient>;
  messages: ChatMessage[];
  resources: ResourceShare[];
}

interface StudyRoomClient {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'student' | 'instructor' | 'teaching_assistant';
  joinedAt: string;
  raisedHand: boolean;
}

interface ResourceShare {
  id: string;
  title: string;
  type: 'link' | 'pdf' | 'code' | 'note';
  url?: string;
  content?: string;
  addedBy: string;
  addedById: string;
  timestamp: string;
}

// Store active study rooms
const studyRooms = new Map<string, StudyRoom>();

/**
 * Setup WebSocket handlers for study room functionality
 */
export function setupStudyRoomWebSockets(wss: WebSocketServer): void {
  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    try {
      // Parse URL to get room ID
      const { pathname } = parse(req.url || '', true);
      
      if (!pathname || !pathname.startsWith('/ws/study-room/')) {
        logger.warn('Invalid WebSocket connection attempt: incorrect path');
        ws.close(1008, 'Invalid path');
        return;
      }
      
      // Extract room ID from path
      const roomId = pathname.replace('/ws/study-room/', '');
      
      // Create or join study room
      let room: StudyRoom;
      
      if (roomId === 'new') {
        // Create new room with a random ID
        const newRoomId = randomUUID();
        room = createStudyRoom(newRoomId);
        logger.info(`Created new study room: ${newRoomId}`);
      } else if (studyRooms.has(roomId)) {
        // Join existing room
        room = studyRooms.get(roomId)!;
        logger.info(`Client joining existing study room: ${roomId}`);
      } else {
        // Room doesn't exist
        logger.warn(`Study room not found: ${roomId}`);
        ws.close(1008, 'Study room not found');
        return;
      }
      
      // Wait for join message to complete setup
      const clientSetupTimeout = setTimeout(() => {
        logger.warn('Client connection timeout - no join message received');
        ws.close(1008, 'Connection timeout - no join message received');
      }, 10000); // 10 second timeout
      
      // Handle first message (should be join)
      ws.once('message', (messageData: Buffer) => {
        try {
          const message = JSON.parse(messageData.toString()) as StudyRoomMessage;
          
          if (message.type !== 'join') {
            logger.warn('First message was not a join message');
            ws.close(1008, 'First message must be a join message');
            clearTimeout(clientSetupTimeout);
            return;
          }
          
          // Clear timeout since we received the join message
          clearTimeout(clientSetupTimeout);
          
          // Register client in the room
          const client: StudyRoomClient = {
            userId: message.userId,
            userName: message.userName,
            userAvatar: message.userAvatar,
            role: message.role || 'student',
            joinedAt: new Date().toISOString(),
            raisedHand: false
          };
          
          // Add client to room
          room.clients.set(ws, client);
          
          // Send room info to the new client
          sendRoomInfo(ws, room);
          
          // Notify other clients about the new user
          broadcastUserJoined(room, client, ws);
          
          // Setup message handler for this client
          setupMessageHandler(ws, room);
          
          logger.info(`Client ${client.userName} (${client.userId}) joined study room ${room.id}`);
        } catch (error) {
          logger.error('Error processing join message', { error });
          ws.close(1008, 'Invalid join message');
          clearTimeout(clientSetupTimeout);
        }
      });
      
      // Handle client disconnect
      ws.on('close', () => {
        if (room && room.clients.has(ws)) {
          const client = room.clients.get(ws)!;
          
          // Remove client from room
          room.clients.delete(ws);
          
          // Notify other clients
          broadcastUserLeft(room, client);
          
          logger.info(`Client ${client.userName} (${client.userId}) left study room ${room.id}`);
          
          // Clean up empty rooms after a while
          if (room.clients.size === 0) {
            // Schedule room cleanup after 10 minutes of inactivity
            setTimeout(() => {
              if (studyRooms.has(room.id) && studyRooms.get(room.id)!.clients.size === 0) {
                studyRooms.delete(room.id);
                logger.info(`Removed inactive study room: ${room.id}`);
              }
            }, 10 * 60 * 1000);
          }
        }
      });
    } catch (error) {
      logger.error('Error handling WebSocket connection', { error });
      ws.close(1011, 'Server error');
    }
  });
  
  logger.info('Study room WebSocket handlers initialized');
}

/**
 * Create a new study room
 */
function createStudyRoom(id: string): StudyRoom {
  const room: StudyRoom = {
    id,
    name: 'AI Study Group',
    courseId: '',
    lessonId: '',
    createdAt: new Date().toISOString(),
    clients: new Map(),
    messages: [],
    resources: []
  };
  
  studyRooms.set(id, room);
  return room;
}

/**
 * Send room information to a client
 */
function sendRoomInfo(ws: WebSocket, room: StudyRoom): void {
  const roomInfo = {
    type: 'room_info',
    roomId: room.id,
    roomName: room.name,
    users: Array.from(room.clients.values()).map(client => ({
      id: client.userId,
      name: client.userName,
      avatar: client.userAvatar,
      role: client.role,
      raisedHand: client.raisedHand,
      status: 'online'
    })),
    messages: room.messages,
    resources: room.resources
  };
  
  ws.send(JSON.stringify(roomInfo));
}

/**
 * Broadcast a user joined message to all clients in a room
 */
function broadcastUserJoined(room: StudyRoom, client: StudyRoomClient, excludeWs?: WebSocket): void {
  const userJoinedMessage = {
    type: 'user_joined',
    userId: client.userId,
    userName: client.userName,
    userAvatar: client.userAvatar,
    role: client.role,
    timestamp: new Date().toISOString()
  };
  
  broadcastToRoom(room, userJoinedMessage, excludeWs);
}

/**
 * Broadcast a user left message to all clients in a room
 */
function broadcastUserLeft(room: StudyRoom, client: StudyRoomClient): void {
  const userLeftMessage = {
    type: 'user_left',
    userId: client.userId,
    userName: client.userName,
    timestamp: new Date().toISOString()
  };
  
  broadcastToRoom(room, userLeftMessage);
}

/**
 * Broadcast a message to all clients in a room
 */
function broadcastToRoom(room: StudyRoom, message: any, excludeWs?: WebSocket): void {
  const messageStr = JSON.stringify(message);
  
  for (const [ws, _] of room.clients.entries()) {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  }
}

/**
 * Setup message handler for a client
 */
function setupMessageHandler(ws: WebSocket, room: StudyRoom): void {
  ws.on('message', (messageData: Buffer) => {
    try {
      const message = JSON.parse(messageData.toString()) as StudyRoomMessage;
      const client = room.clients.get(ws);
      
      if (!client) {
        logger.warn('Received message from unregistered client');
        return;
      }
      
      switch (message.type) {
        case 'chat':
          handleChatMessage(ws, room, message, client);
          break;
        
        case 'hand_raised':
          handleHandRaised(ws, room, message, client);
          break;
        
        case 'resource_shared':
          handleResourceShared(ws, room, message, client);
          break;
        
        case 'notes_updated':
          handleNotesUpdated(ws, room, message, client);
          break;
        
        default:
          logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('Error processing WebSocket message', { error });
    }
  });
}

/**
 * Handle chat messages
 */
function handleChatMessage(
  ws: WebSocket, 
  room: StudyRoom, 
  message: StudyRoomMessage, 
  client: StudyRoomClient
): void {
  // Create chat message
  const chatMessage: ChatMessage = {
    type: 'chat',
    messageId: message.messageId || randomUUID(),
    userId: client.userId,
    userName: client.userName,
    userAvatar: client.userAvatar,
    content: message.content,
    messageType: message.messageType || 'text',
    timestamp: message.timestamp || new Date().toISOString()
  };
  
  // Save message in room history
  room.messages.push(chatMessage);
  
  // Keep message history at a reasonable size
  if (room.messages.length > 100) {
    room.messages = room.messages.slice(-100);
  }
  
  // Broadcast message to all clients
  broadcastToRoom(room, chatMessage);
  
  // Log for analytics - in a production system we might store in the database
  logger.debug(`Chat in room ${room.id}: ${client.userName}: ${message.content}`);
}

/**
 * Handle hand raised events
 */
function handleHandRaised(
  ws: WebSocket, 
  room: StudyRoom, 
  message: StudyRoomMessage, 
  client: StudyRoomClient
): void {
  // Update client's hand raised status
  client.raisedHand = !!message.raised;
  
  // Create hand raised message
  const handRaisedMessage = {
    type: 'hand_raised',
    userId: client.userId,
    userName: client.userName,
    raised: client.raisedHand,
    timestamp: new Date().toISOString()
  };
  
  // Broadcast hand raised status to all clients
  broadcastToRoom(room, handRaisedMessage);
  
  logger.debug(`Hand ${client.raisedHand ? 'raised' : 'lowered'} in room ${room.id}: ${client.userName}`);
}

/**
 * Handle resource sharing
 */
function handleResourceShared(
  ws: WebSocket, 
  room: StudyRoom, 
  message: StudyRoomMessage, 
  client: StudyRoomClient
): void {
  // Create resource object
  const resource: ResourceShare = {
    id: message.resourceId || randomUUID(),
    title: message.title,
    type: message.resourceType,
    url: message.url,
    content: message.content,
    addedBy: client.userName,
    addedById: client.userId,
    timestamp: message.timestamp || new Date().toISOString()
  };
  
  // Save resource in room
  room.resources.push(resource);
  
  // Create resource shared message
  const resourceMessage = {
    type: 'resource_shared',
    resourceId: resource.id,
    userId: client.userId,
    userName: client.userName,
    title: resource.title,
    resourceType: resource.type,
    url: resource.url,
    content: resource.content,
    timestamp: resource.timestamp
  };
  
  // Broadcast resource to all clients
  broadcastToRoom(room, resourceMessage);
  
  logger.debug(`Resource shared in room ${room.id}: ${client.userName}: ${resource.title}`);
}

/**
 * Handle notes updates
 */
function handleNotesUpdated(
  ws: WebSocket, 
  room: StudyRoom, 
  message: StudyRoomMessage, 
  client: StudyRoomClient
): void {
  // In a real implementation, we might store the notes in the room state
  // and sync them with the database for persistence
  
  // Broadcast notes update to all other clients
  const notesMessage = {
    type: 'notes_updated',
    userId: client.userId,
    userName: client.userName,
    content: message.content,
    timestamp: new Date().toISOString()
  };
  
  broadcastToRoom(room, notesMessage, ws); // Don't send back to the originator
  
  logger.debug(`Notes updated in room ${room.id} by ${client.userName}`);
}

/**
 * Get active study rooms (for admin purposes)
 */
export function getActiveStudyRooms(): Array<{
  id: string;
  name: string;
  participants: number;
  createdAt: string;
}> {
  return Array.from(studyRooms.entries()).map(([id, room]) => ({
    id,
    name: room.name,
    participants: room.clients.size,
    createdAt: room.createdAt
  }));
}