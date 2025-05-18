import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Users, 
  Video, 
  UserPlus, 
  Settings, 
  Send, 
  Smile, 
  FileText, 
  Link as LinkIcon, 
  Mic as MicrophoneIcon, 
  Clock, 
  Hand as HandIcon, 
  Share2, 
  Lightbulb,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Brain
} from 'lucide-react';

// Types for collaborative study room
interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'question' | 'answer' | 'resource' | 'system';
}

interface ActiveUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'presenting';
  role: 'student' | 'instructor' | 'teaching_assistant';
  raisedHand?: boolean;
}

interface StudyResource {
  id: string;
  title: string;
  type: 'link' | 'pdf' | 'code' | 'note';
  url?: string;
  content?: string;
  addedBy: string;
  timestamp: string;
}

interface StudyRoomProps {
  courseId: string;
  lessonId: string;
  roomId?: string; // If provided, join an existing room
  onClose?: () => void;
}

const CollaborativeStudyRoom: React.FC<StudyRoomProps> = ({
  courseId,
  lessonId,
  roomId,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>('AI Fundamentals Study Group');
  const [studyNotes, setStudyNotes] = useState<string>('');
  const [handRaised, setHandRaised] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  
  // Initialize websocket connection
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // In a real implementation, this would be a secure WebSocket connection
    // to your backend with authentication
    const wsUrl = `ws://${window.location.hostname}:${window.location.port}/ws/study-room/${roomId || 'new'}`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      setIsConnected(true);
      
      // Send join message
      if (user) {
        const joinMessage = {
          type: 'join',
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`.trim() || 'Anonymous User',
          userAvatar: user.profileImageUrl || undefined,
          courseId,
          lessonId,
        };
        
        socket.send(JSON.stringify(joinMessage));
      }
      
      // Add system message
      addSystemMessage('You joined the study room');
    };
    
    socket.onclose = () => {
      setIsConnected(false);
      addSystemMessage('Disconnected from study room');
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the study room. Please try again later.',
        variant: 'destructive',
      });
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        switch (data.type) {
          case 'chat':
            handleChatMessage(data);
            break;
          case 'user_joined':
            handleUserJoined(data);
            break;
          case 'user_left':
            handleUserLeft(data);
            break;
          case 'resource_shared':
            handleResourceShared(data);
            break;
          case 'hand_raised':
            handleHandRaised(data);
            break;
          case 'room_info':
            handleRoomInfo(data);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socketRef.current = socket;
    
    // Cleanup WebSocket connection on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [isAuthenticated, courseId, lessonId, roomId, user, toast]);
  
  // Auto-scroll to bottom of message container when new messages arrive
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // For the demo, let's initialize with some sample data
  useEffect(() => {
    // Sample users
    const sampleUsers: ActiveUser[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        status: 'online',
        role: 'instructor'
      },
      {
        id: '2',
        name: 'Michael Chen',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        status: 'online',
        role: 'student'
      },
      {
        id: '3',
        name: 'Aisha Patel',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        status: 'online',
        role: 'student'
      },
      {
        id: '4',
        name: 'David Rodriguez',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        status: 'away',
        role: 'teaching_assistant'
      }
    ];
    
    // Add current user if authenticated
    if (isAuthenticated && user) {
      const currentUser: ActiveUser = {
        id: user.id || 'current-user',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'You',
        avatar: user.profileImageUrl || undefined,
        status: 'online',
        role: 'student'
      };
      
      setActiveUsers([...sampleUsers, currentUser]);
    } else {
      setActiveUsers(sampleUsers);
    }
    
    // Sample messages
    const sampleMessages: Message[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Sarah Johnson',
        userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        content: 'Welcome to our study group on Neural Networks! Today we\'ll be discussing backpropagation and gradient descent.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        type: 'text'
      },
      {
        id: '2',
        userId: '2',
        userName: 'Michael Chen',
        userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        content: 'I\'ve been having trouble understanding how the chain rule applies to backpropagation. Could someone explain?',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        type: 'question'
      },
      {
        id: '3',
        userId: '1',
        userName: 'Sarah Johnson',
        userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        content: 'Great question, Michael! Backpropagation uses the chain rule from calculus to calculate the gradient of the loss function with respect to each weight in the network. It\'s how we know how to adjust the weights during training.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        type: 'answer'
      },
      {
        id: '4',
        userId: '3',
        userName: 'Aisha Patel',
        userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        content: 'I found this great resource on visualizing backpropagation that might help: https://playground.tensorflow.org/',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: 'resource'
      },
      {
        id: '5',
        userId: 'system',
        userName: 'System',
        content: 'You joined the study room',
        timestamp: new Date().toISOString(),
        type: 'system'
      }
    ];
    
    setMessages(sampleMessages);
    
    // Sample resources
    const sampleResources: StudyResource[] = [
      {
        id: '1',
        title: 'Neural Networks Playground',
        type: 'link',
        url: 'https://playground.tensorflow.org/',
        addedBy: 'Aisha Patel',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      },
      {
        id: '2',
        title: 'Backpropagation Explained',
        type: 'pdf',
        url: '/resources/backpropagation.pdf',
        addedBy: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      },
      {
        id: '3',
        title: 'Gradient Descent Code Example',
        type: 'code',
        content: `import numpy as np

def gradient_descent(x, y, theta, alpha, num_iters):
    """
    Performs gradient descent to learn theta
    """
    m = len(y)
    J_history = np.zeros(num_iters)
    
    for i in range(num_iters):
        h = np.dot(x, theta)
        error = h - y
        gradient = np.dot(x.T, error) / m
        theta = theta - alpha * gradient
        J_history[i] = compute_cost(x, y, theta)
        
    return theta, J_history`,
        addedBy: 'Michael Chen',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString()
      }
    ];
    
    setResources(sampleResources);
    
    // Sample study notes
    const sampleNotes = `## Neural Networks Study Notes

### Key Concepts:
- A neural network is a series of algorithms that attempts to recognize patterns in data
- Basic structure: Input layer, hidden layers, output layer
- Each connection has a weight that adjusts during training

### Backpropagation:
1. Forward pass: Compute outputs
2. Calculate error (difference between output and target)
3. Backward pass: Propagate error back through the network
4. Update weights based on error gradient

### Gradient Descent:
- Optimization algorithm to minimize the cost function
- Learning rate controls the step size
- Types: Batch, stochastic, mini-batch

### Questions:
- How do we choose the right number of hidden layers?
- What's the difference between dropout and batch normalization?

### Resources to review:
- [3Blue1Brown Neural Network videos](https://www.youtube.com/watch?v=aircAruvnKk)
- Chapter 3 of Deep Learning book`;
    
    setStudyNotes(sampleNotes);
    
  }, [isAuthenticated, user]);
  
  // Helper functions for handling WebSocket messages
  const handleChatMessage = (data: any) => {
    const newMessage: Message = {
      id: data.messageId || `msg-${Date.now()}`,
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      content: data.content,
      timestamp: data.timestamp || new Date().toISOString(),
      type: data.messageType || 'text'
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };
  
  const handleUserJoined = (data: any) => {
    // Add user to active users list
    const newUser: ActiveUser = {
      id: data.userId,
      name: data.userName,
      avatar: data.userAvatar,
      status: 'online',
      role: data.role || 'student'
    };
    
    setActiveUsers(prevUsers => {
      // Check if user is already in the list
      if (prevUsers.some(user => user.id === newUser.id)) {
        return prevUsers;
      }
      return [...prevUsers, newUser];
    });
    
    // Add system message about user joining
    addSystemMessage(`${data.userName} joined the study room`);
  };
  
  const handleUserLeft = (data: any) => {
    // Remove user from active users list
    setActiveUsers(prevUsers => 
      prevUsers.filter(user => user.id !== data.userId)
    );
    
    // Add system message about user leaving
    addSystemMessage(`${data.userName} left the study room`);
  };
  
  const handleResourceShared = (data: any) => {
    // Add new resource
    const newResource: StudyResource = {
      id: data.resourceId || `resource-${Date.now()}`,
      title: data.title,
      type: data.resourceType,
      url: data.url,
      content: data.content,
      addedBy: data.userName,
      timestamp: data.timestamp || new Date().toISOString()
    };
    
    setResources(prevResources => [...prevResources, newResource]);
    
    // Add system message about resource
    addSystemMessage(`${data.userName} shared a resource: ${data.title}`);
  };
  
  const handleHandRaised = (data: any) => {
    // Update user hand raised status
    setActiveUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === data.userId 
          ? { ...user, raisedHand: data.raised } 
          : user
      )
    );
    
    // Add system message about hand raised/lowered
    if (data.raised) {
      addSystemMessage(`${data.userName} raised their hand`);
    }
  };
  
  const handleRoomInfo = (data: any) => {
    // Update room information
    if (data.roomName) {
      setRoomName(data.roomName);
    }
    
    // Update user list if provided
    if (data.users && Array.isArray(data.users)) {
      setActiveUsers(data.users);
    }
    
    // Update messages if provided
    if (data.messages && Array.isArray(data.messages)) {
      setMessages(data.messages);
    }
    
    // Update resources if provided
    if (data.resources && Array.isArray(data.resources)) {
      setResources(data.resources);
    }
  };
  
  // Helper function to add system messages
  const addSystemMessage = (content: string) => {
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      userId: 'system',
      userName: 'System',
      content,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    setMessages(prevMessages => [...prevMessages, systemMessage]);
  };
  
  // Send a new message
  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;
    
    // In a real implementation, this would send through the WebSocket
    const messageData = {
      type: 'chat',
      messageType: 'text',
      content: newMessage,
      userId: user?.id || 'current-user',
      userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You',
      userAvatar: user?.profileImageUrl || undefined,
      timestamp: new Date().toISOString()
    };
    
    // Send through WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messageData));
    }
    
    // For the demo, also add locally
    const newMessageObj: Message = {
      id: `msg-${Date.now()}`,
      userId: user?.id || 'current-user',
      userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You',
      userAvatar: user?.profileImageUrl || undefined,
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    setMessages(prevMessages => [...prevMessages, newMessageObj]);
    setNewMessage('');
  };
  
  // Toggle hand raised status
  const toggleHandRaised = () => {
    const newStatus = !handRaised;
    setHandRaised(newStatus);
    
    // Send through WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const handRaisedData = {
        type: 'hand_raised',
        userId: user?.id || 'current-user',
        userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You',
        raised: newStatus
      };
      
      socketRef.current.send(JSON.stringify(handRaisedData));
    }
    
    // For the demo, also update locally
    if (user) {
      setActiveUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id 
            ? { ...u, raisedHand: newStatus } 
            : u
        )
      );
    }
    
    // Add system message
    addSystemMessage(newStatus ? 'You raised your hand' : 'You lowered your hand');
  };
  
  // Share a resource
  const shareResource = (resourceType: 'link' | 'note') => {
    let title = '';
    let url = '';
    let content = '';
    
    if (resourceType === 'link') {
      title = prompt('Enter resource title:') || 'Shared Link';
      url = prompt('Enter resource URL:') || '';
      
      if (!url) return;
    } else if (resourceType === 'note') {
      title = prompt('Enter note title:') || 'Shared Note';
      content = prompt('Enter note content:') || '';
      
      if (!content) return;
    }
    
    // Create resource object
    const newResource: StudyResource = {
      id: `resource-${Date.now()}`,
      title,
      type: resourceType,
      url,
      content,
      addedBy: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You',
      timestamp: new Date().toISOString()
    };
    
    // Send through WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const resourceData = {
        type: 'resource_shared',
        resourceId: newResource.id,
        title: newResource.title,
        resourceType: newResource.type,
        url: newResource.url,
        content: newResource.content,
        userId: user?.id || 'current-user',
        userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You',
      };
      
      socketRef.current.send(JSON.stringify(resourceData));
    }
    
    // For the demo, also add locally
    setResources(prevResources => [...prevResources, newResource]);
    
    // Add system message
    addSystemMessage(`You shared a resource: ${title}`);
    
    toast({
      title: 'Resource Shared',
      description: `Your ${resourceType} has been shared with the study room.`,
    });
  };
  
  // Save study notes
  const saveNotes = () => {
    localStorage.setItem(`study_notes_${courseId}_${lessonId}`, studyNotes);
    
    toast({
      title: 'Notes Saved',
      description: 'Your study notes have been saved.',
    });
  };
  
  // Start a call feature (would actually integrate with WebRTC or similar in a real implementation)
  const startVideoCall = () => {
    toast({
      title: 'Video Call',
      description: 'This feature would integrate with a WebRTC provider in a real implementation.',
    });
  };
  
  // Invite others to the study room
  const inviteOthers = () => {
    const inviteLink = `${window.location.origin}/courses/${courseId}/learn/${lessonId}?room=${roomId || 'new'}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast({
        title: 'Invite Link Copied',
        description: 'Share this link with others to invite them to your study room.',
      });
    });
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get badge color based on user role
  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'teaching_assistant':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Check if the current user is the message sender
  const isCurrentUser = (userId: string): boolean => {
    return userId === user?.id || userId === 'current-user';
  };
  
  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <LinkIcon className="h-4 w-4 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'code':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'note':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  // Get icon for message type
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <HelpCircle className="h-4 w-4 text-orange-500" />;
      case 'answer':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'resource':
        return <LinkIcon className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  return (
    <Card 
      className={`${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'} overflow-hidden`}
    >
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="flex items-center">
                {roomName}
                <Badge 
                  variant="outline" 
                  className="ml-2 bg-green-100 text-green-800 border-green-200"
                >
                  Live
                </Badge>
              </CardTitle>
              <CardDescription>
                {activeUsers.length} participants • Neural Networks study session
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={startVideoCall}
            >
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={toggleHandRaised}
              className={handRaised ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
            >
              <HandIcon className="h-4 w-4 mr-2" />
              {handRaised ? 'Lower Hand' : 'Raise Hand'}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={inviteOthers}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsFullScreen(!isFullScreen)}
            >
              {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            </Button>
            
            {onClose && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <div className="grid grid-cols-4 h-[600px]">
        {/* Main content area (chat, notes, resources) - 3/4 width */}
        <div className="col-span-3 border-r">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b">
              <TabsList className="mx-4 my-2">
                <TabsTrigger value="chat" className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Study Notes
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Resources ({resources.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 h-full">
              {/* Messages container */}
              <ScrollArea 
                className="flex-1 p-4" 
              >
                <div className="space-y-4" ref={messageContainerRef}>
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${
                        message.type === 'system' ? 'justify-center' : 
                        isCurrentUser(message.userId) ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.type === 'system' ? (
                        <div className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded-md">
                          {message.content}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex max-w-[70%] ${isCurrentUser(message.userId) ? 'flex-row-reverse' : ''}`}
                        >
                          {!isCurrentUser(message.userId) && (
                            <Avatar className="h-8 w-8 mt-1 mx-2">
                              <AvatarImage src={message.userAvatar} />
                              <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div>
                            <div className={`flex items-center ${isCurrentUser(message.userId) ? 'justify-end' : ''} mb-1`}>
                              <span className="text-xs text-gray-500">
                                {isCurrentUser(message.userId) ? 'You' : message.userName}
                              </span>
                              <span className="text-xs text-gray-400 mx-2">
                                {formatTimestamp(message.timestamp)}
                              </span>
                              {getMessageIcon(message.type) && (
                                <span>{getMessageIcon(message.type)}</span>
                              )}
                            </div>
                            
                            <div 
                              className={`p-3 rounded-lg ${
                                isCurrentUser(message.userId)
                                  ? 'bg-blue-500 text-white'
                                  : message.type === 'question'
                                  ? 'bg-amber-50 border border-amber-200'
                                  : message.type === 'answer'
                                  ? 'bg-green-50 border border-green-200'
                                  : message.type === 'resource'
                                  ? 'bg-blue-50 border border-blue-200'
                                  : 'bg-gray-100'
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                          
                          {isCurrentUser(message.userId) && (
                            <Avatar className="h-8 w-8 mt-1 mx-2">
                              <AvatarImage src={message.userAvatar} />
                              <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t">
                <div className="flex items-center">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="flex-1 mr-2"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || !isConnected}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
                
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const messageType = prompt('Select message type (question/text/resource):');
                        if (messageType && ['question', 'text', 'resource'].includes(messageType)) {
                          setNewMessage(prev => `[${messageType}] ${prev}`);
                        }
                      }}
                      className="flex items-center hover:text-blue-500"
                    >
                      <HelpCircle className="h-4 w-4 mr-1" />
                      Ask Question
                    </button>
                    
                    <button
                      onClick={() => shareResource('link')}
                      className="flex items-center hover:text-blue-500"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Share Link
                    </button>
                    
                    <button
                      onClick={() => shareResource('note')}
                      className="flex items-center hover:text-blue-500"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Share Note
                    </button>
                    
                    <button className="flex items-center hover:text-blue-500">
                      <Smile className="h-4 w-4 mr-1" />
                      Emoji
                    </button>
                  </div>
                  
                  <div className="flex-1 text-right">
                    <span className={`inline-flex items-center ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                      <span className={`h-2 w-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="flex-1 flex flex-col p-0 m-0 h-full">
              <div className="p-4 border-b">
                <h3 className="font-medium flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                  Collaborative Study Notes
                </h3>
                <p className="text-sm text-gray-500">
                  Take notes during your study session. Changes are automatically shared with all participants.
                </p>
              </div>
              
              <div className="flex-1 p-4">
                <Textarea
                  value={studyNotes}
                  onChange={(e) => setStudyNotes(e.target.value)}
                  placeholder="Start taking notes..."
                  className="w-full h-full min-h-[300px] font-mono"
                />
              </div>
              
              <div className="p-4 border-t">
                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Last saved: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div>
                    <Button 
                      onClick={saveNotes}
                      variant="outline"
                      className="mr-2"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Notes
                    </Button>
                    
                    <Button onClick={saveNotes}>
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="flex-1 flex flex-col p-0 m-0 h-full">
              <div className="p-4 border-b">
                <h3 className="font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  Shared Resources
                </h3>
                <p className="text-sm text-gray-500">
                  Resources shared by all participants in this study session.
                </p>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <Card key={resource.id} className="overflow-hidden">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getResourceIcon(resource.type)}
                            <CardTitle className="text-base ml-2">{resource.title}</CardTitle>
                          </div>
                          
                          <Badge variant="outline">
                            {resource.type.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription className="flex justify-between items-center mt-1">
                          <span>Shared by {resource.addedBy}</span>
                          <span>{new Date(resource.timestamp).toLocaleString()}</span>
                        </CardDescription>
                      </CardHeader>
                      
                      {resource.type === 'code' && resource.content && (
                        <CardContent className="p-0">
                          <div className="bg-gray-900 text-gray-50 p-4 font-mono text-sm overflow-x-auto">
                            <pre>{resource.content}</pre>
                          </div>
                        </CardContent>
                      )}
                      
                      <CardFooter className="py-3 flex justify-end">
                        {resource.url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Open Resource
                            </a>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {resources.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No resources have been shared yet</p>
                      <Button 
                        variant="outline" 
                        onClick={() => shareResource('link')}
                        className="mt-4"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Share a Resource
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    Share useful resources with your study group
                  </p>
                  
                  <div>
                    <Button 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => shareResource('link')}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Share Link
                    </Button>
                    
                    <Button 
                      onClick={() => shareResource('note')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Share Note
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Participants sidebar - 1/4 width */}
        <div className="col-span-1 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              Participants ({activeUsers.length})
            </h3>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {activeUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span 
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white ${
                          user.status === 'online' ? 'bg-green-500' : 
                          user.status === 'away' ? 'bg-yellow-500' : 
                          'bg-gray-500'
                        }`}
                      ></span>
                    </div>
                    
                    <div className="ml-3">
                      <p className="text-sm font-medium">{user.name}</p>
                      <div className="flex items-center">
                        <Badge 
                          variant="outline"
                          className={`text-xs px-1 py-0 ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role === 'teaching_assistant' ? 'TA' : user.role}
                        </Badge>
                        
                        {user.raisedHand && (
                          <span className="ml-2 text-yellow-500">
                            <HandIcon className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button className="text-gray-400 hover:text-gray-600">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <h3 className="font-medium mb-3 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
              Study Tips
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="bg-amber-50 p-2 rounded-md border border-amber-200">
                <p className="font-medium">Active Recall</p>
                <p className="text-xs text-gray-600">Test yourself frequently rather than just re-reading material.</p>
              </div>
              
              <div className="bg-blue-50 p-2 rounded-md border border-blue-200">
                <p className="font-medium">Spaced Repetition</p>
                <p className="text-xs text-gray-600">Review material at increasing intervals for better retention.</p>
              </div>
              
              <div className="bg-green-50 p-2 rounded-md border border-green-200">
                <p className="font-medium">Teach Others</p>
                <p className="text-xs text-gray-600">Explaining concepts to others improves your understanding.</p>
              </div>
            </div>
            
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                <Brain className="h-4 w-4 mr-2" />
                Get Study Recommendations
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CollaborativeStudyRoom;