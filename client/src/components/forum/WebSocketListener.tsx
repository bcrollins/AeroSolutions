import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ToastAction } from "@/components/ui/toast";

interface WebSocketMessage {
  type: string;
  data?: any;
  count?: number;
}

export default function WebSocketListener() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    if (!user?.id) return;
    
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    // Connection opened
    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setConnected(true);
      
      // Authenticate the WebSocket connection
      socket.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        // Handle different message types
        switch (message.type) {
          case 'notification':
            handleNotification(message.data);
            break;
          case 'unread_count':
            handleUnreadCount(message.count || 0);
            break;
          default:
            console.log('Unknown message type:', message);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle errors
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    });
    
    // Connection closed
    socket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    });
    
    // Clean up on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user?.id]);
  
  // Handle notifications
  const handleNotification = (notification: any) => {
    // Invalidate notifications query to refresh count
    queryClient.invalidateQueries({ queryKey: ['/api/forum/notifications'] });
    
    // Show toast notification
    toast({
      title: notification.type === 'thread_approved' ? 'Thread Approved' : 
             notification.type === 'thread_rejected' ? 'Thread Rejected' :
             notification.type === 'reply_approved' ? 'Reply Approved' :
             notification.type === 'reply_rejected' ? 'Reply Rejected' :
             notification.type === 'reply' ? 'New Reply' :
             notification.type === 'like' ? 'New Like' :
             notification.type === 'accepted_answer' ? 'Answer Accepted' : 
             'New Notification',
      description: notification.message,
      variant: notification.type.includes('rejected') ? 'destructive' : 'default',
      action: notification.threadId ? (
        <ToastAction 
          altText="View thread" 
          onClick={() => setLocation(`/forum/threads/${notification.threadId}`)}
        >
          View
        </ToastAction>
      ) : undefined,
    });
  };
  
  // Handle unread count
  const handleUnreadCount = (count: number) => {
    // Update notifications count in UI
    // This could dispatch an action to a global state or update a context
    console.log('Unread notifications:', count);
    
    // You could set this count in localStorage or another global state management solution
    localStorage.setItem('unreadNotificationsCount', count.toString());
    
    // Dispatch a custom event that other components can listen for
    window.dispatchEvent(new CustomEvent('unreadNotificationsUpdate', { detail: { count } }));
  };
  
  // This component doesn't render anything visible
  return null;
}