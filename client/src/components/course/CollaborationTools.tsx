import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageSquare, 
  PenTool, 
  FileEdit, 
  Download, 
  Share2, 
  Undo2, 
  Redo2, 
  Square, 
  Circle, 
  Type, 
  Pencil, 
  Image, 
  Hand, 
  SaveAll, 
  Trash2, 
  ChevronDown, 
  Plus, 
  Minus,
  Eraser,
  LayoutGrid,
  MoreVertical,
  Settings,
  Upload,
  Clock,
  UserPlus,
  UserMinus,
  XCircle,
  Info,
  MailPlus,
  Video
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CollaborationToolsProps {
  projectId?: string;
  groupId?: string;
}

// Mock data for collaboration participants
const participants = [
  {
    id: '1',
    name: 'Marcus Johnson',
    avatar: '/images/avatars/avatar1.jpg',
    role: 'Project Lead',
    isActive: true,
    lastActive: 'now'
  },
  {
    id: '2',
    name: 'Emily Wang',
    avatar: '/images/avatars/avatar2.jpg',
    role: 'Contributor',
    isActive: true,
    lastActive: 'now'
  },
  {
    id: '3',
    name: 'James Wilson',
    avatar: '/images/avatars/avatar3.jpg',
    role: 'Contributor',
    isActive: false,
    lastActive: '10 minutes ago'
  },
  {
    id: '4',
    name: 'Sophia Lee',
    avatar: '/images/avatars/avatar4.jpg',
    role: 'Contributor',
    isActive: false,
    lastActive: '1 hour ago'
  }
];

// Mock chat messages
const chatMessages = [
  {
    id: '1',
    senderId: '2',
    senderName: 'Emily Wang',
    senderAvatar: '/images/avatars/avatar2.jpg',
    message: 'I think we should focus on the neural network architecture first.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    senderId: '1',
    senderName: 'Marcus Johnson',
    senderAvatar: '/images/avatars/avatar1.jpg',
    message: 'Agreed. Let me sketch out some ideas on the whiteboard.',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    senderId: '3',
    senderName: 'James Wilson',
    senderAvatar: '/images/avatars/avatar3.jpg',
    message: 'I found a great resource on CNN architectures, sharing it in the document section.',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    senderId: '1',
    senderName: 'Marcus Johnson',
    senderAvatar: '/images/avatars/avatar1.jpg',
    message: "Here's the basic structure I'm thinking of. What do you all think?",
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString()
  }
];

// Shared documents
const sharedDocuments = [
  {
    id: '1',
    name: 'Project Proposal.docx',
    owner: 'Marcus Johnson',
    lastEdited: '10 minutes ago',
    size: '234 KB',
    type: 'document'
  },
  {
    id: '2',
    name: 'Research Notes.md',
    owner: 'Emily Wang',
    lastEdited: '1 hour ago',
    size: '102 KB',
    type: 'markdown'
  },
  {
    id: '3',
    name: 'Neural Network Diagram.png',
    owner: 'James Wilson',
    lastEdited: '2 hours ago',
    size: '1.2 MB',
    type: 'image'
  },
  {
    id: '4',
    name: 'Data Analysis.ipynb',
    owner: 'Sophia Lee',
    lastEdited: 'Yesterday',
    size: '345 KB',
    type: 'notebook'
  }
];

const CollaborationTools: React.FC<CollaborationToolsProps> = ({ projectId, groupId }) => {
  // State for whiteboard
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolType, setToolType] = useState<'pencil' | 'eraser' | 'line' | 'square' | 'circle' | 'text'>('pencil');
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#3b82f6');
  const [message, setMessage] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initial canvas setup
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    
    const gridSize = 20;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Example drawing (mockup of what a user might draw)
    // Neural network architecture sketch
    const drawExampleNeuralNetwork = () => {
      // Input layer
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3b82f6';
      
      // Nodes
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(100, 100 + i * 50, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#3b82f680';
        ctx.fill();
      }
      
      // Hidden layer 1
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(200, 75 + i * 50, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#3b82f680';
        ctx.fill();
      }
      
      // Hidden layer 2
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(300, 75 + i * 50, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#3b82f680';
        ctx.fill();
      }
      
      // Output layer
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.arc(400, 125 + i * 50, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#3b82f680';
        ctx.fill();
      }
      
      // Connections
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      
      // Connect input to hidden layer 1
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
          ctx.beginPath();
          ctx.moveTo(115, 100 + i * 50);
          ctx.lineTo(185, 75 + j * 50);
          ctx.stroke();
        }
      }
      
      // Connect hidden layer 1 to hidden layer 2
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          ctx.beginPath();
          ctx.moveTo(215, 75 + i * 50);
          ctx.lineTo(285, 75 + j * 50);
          ctx.stroke();
        }
      }
      
      // Connect hidden layer 2 to output
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 2; j++) {
          ctx.beginPath();
          ctx.moveTo(315, 75 + i * 50);
          ctx.lineTo(385, 125 + j * 50);
          ctx.stroke();
        }
      }
      
      // Labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.fillText('Input', 80, 50);
      ctx.fillText('Hidden 1', 170, 50);
      ctx.fillText('Hidden 2', 270, 50);
      ctx.fillText('Output', 380, 50);
      
      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Proposed Neural Network Architecture', 120, 300);
      
      // Legend
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText('• 3 input nodes', 80, 330);
      ctx.fillText('• 4 neurons in first hidden layer', 80, 350);
      ctx.fillText('• 4 neurons in second hidden layer', 80, 370);
      ctx.fillText('• 2 output nodes (classification)', 80, 390);
    };
    
    drawExampleNeuralNetwork();
    
  }, []);

  // Handle message sending
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // In a real app, you would send this to a backend
    console.log('Sending message:', message);
    
    // Clear the input
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Group Collaboration Tools</h2>
          <p className="text-gray-400">Work together with your team on shared projects and assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-600">
            <Video className="h-4 w-4 mr-2" />
            Start Video Meeting
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        </div>
      </div>

      <Tabs defaultValue="whiteboard" className="w-full">
        <TabsList className="bg-gray-800 mb-6">
          <TabsTrigger value="whiteboard" className="data-[state=active]:bg-gray-700">
            <PenTool className="h-4 w-4 mr-2" />
            Whiteboard
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-gray-700">
            <FileEdit className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-gray-700">
            <MessageSquare className="h-4 w-4 mr-2" />
            Group Chat
          </TabsTrigger>
          <TabsTrigger value="members" className="data-[state=active]:bg-gray-700">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="whiteboard" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">Collaborative Whiteboard</h3>
                <div className="flex -space-x-2">
                  {participants.slice(0, 3).map((participant) => (
                    <TooltipProvider key={participant.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="w-6 h-6 border-2 border-gray-800">
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{participant.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {participants.length > 3 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                            +{participants.length - 3}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{participants.length - 3} more collaborators</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs border-gray-600">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs border-gray-600">
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-gray-600">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Whiteboard Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <SaveAll className="h-4 w-4 mr-2" /> Save
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Upload className="h-4 w-4 mr-2" /> Import Image
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LayoutGrid className="h-4 w-4 mr-2" /> Toggle Grid
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="h-4 w-4 mr-2" /> Clear All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex h-[calc(100vh-350px)] min-h-[600px]">
              {/* Toolbar */}
              <div className="flex flex-col items-center p-2 bg-gray-850 rounded-l-md border-r border-gray-700 space-y-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-md ${toolType === 'pencil' ? 'bg-gray-700' : ''}`}
                        onClick={() => setToolType('pencil')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Pencil</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-md ${toolType === 'eraser' ? 'bg-gray-700' : ''}`}
                        onClick={() => setToolType('eraser')}
                      >
                        <Eraser className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Eraser</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-md ${toolType === 'line' ? 'bg-gray-700' : ''}`}
                        onClick={() => setToolType('line')}
                      >
                        <PenTool className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Line</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-md ${toolType === 'square' ? 'bg-gray-700' : ''}`}
                        onClick={() => setToolType('square')}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Square</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-md ${toolType === 'circle' ? 'bg-gray-700' : ''}`}
                        onClick={() => setToolType('circle')}
                      >
                        <Circle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Circle</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-md ${toolType === 'text' ? 'bg-gray-700' : ''}`}
                        onClick={() => setToolType('text')}
                      >
                        <Type className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Text</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Separator className="my-2" />
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-8 h-8 flex items-center justify-center">
                        <input 
                          type="color" 
                          value={brushColor}
                          onChange={(e) => setBrushColor(e.target.value)}
                          className="w-6 h-6 bg-transparent border-0 cursor-pointer"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Color</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="flex flex-col items-center space-y-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-md"
                          onClick={() => setBrushSize(Math.min(brushSize + 1, 10))}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Increase Size</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <span className="text-xs">{brushSize}px</span>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-md"
                          onClick={() => setBrushSize(Math.max(brushSize - 1, 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Decrease Size</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <Separator className="my-2" />
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Undo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                        <Redo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Redo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md mt-auto">
                        <Hand className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Hand Tool (Pan)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Canvas */}
              <div className="flex-1 relative bg-gray-850 rounded-r-md overflow-hidden">
                <canvas 
                  ref={canvasRef}
                  className="w-full h-full"
                />
                
                {/* Live cursors would be shown here in a real collaborative app */}
                <div className="absolute bottom-4 left-4 bg-gray-900/90 py-1 px-2 rounded text-xs flex items-center">
                  <Users className="h-3 w-3 mr-1 text-electric-cyan-400" />
                  <span className="text-electric-cyan-400 font-medium">{participants.filter(p => p.isActive).length} users</span>
                  <span className="text-gray-400 ml-1">currently editing</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Shared Documents</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
            
            <div className="space-y-4">
              {sharedDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className={`p-4 rounded-md flex items-center justify-between ${
                    selectedDocument === doc.id ? 'bg-electric-cyan-900/20 border border-electric-cyan-500/30' : 'bg-gray-750'
                  }`}
                  onClick={() => setSelectedDocument(doc.id)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-md bg-gray-700 flex items-center justify-center mr-3">
                      {doc.type === 'document' && <FileEdit className="h-5 w-5 text-blue-400" />}
                      {doc.type === 'markdown' && <FileEdit className="h-5 w-5 text-green-400" />}
                      {doc.type === 'image' && <Image className="h-5 w-5 text-purple-400" />}
                      {doc.type === 'notebook' && <FileEdit className="h-5 w-5 text-amber-400" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <div className="text-xs text-gray-400 flex items-center">
                        <span>Owned by {doc.owner}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Edited {doc.lastEdited}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8">
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" /> Properties
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Document editor placeholder */}
            {selectedDocument && (
              <div className="mt-6 p-4 border border-gray-700 rounded-md bg-gray-850">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium flex items-center">
                    <FileEdit className="h-4 w-4 mr-2 text-electric-cyan-400" />
                    {sharedDocuments.find(d => d.id === selectedDocument)?.name || 'Document'}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {participants.slice(0, 3).map((participant) => (
                        <Avatar key={participant.id} className="w-6 h-6 border-2 border-gray-850">
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Save
                    </Button>
                  </div>
                </div>
                <div className="border border-gray-700 rounded-md p-4 min-h-[300px] bg-gray-900">
                  <Textarea 
                    placeholder="Enter document content here..."
                    className="w-full h-full min-h-[300px] bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="chat" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Group Chat</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-2">{participants.filter(p => p.isActive).length} online</span>
                <div className="flex -space-x-2">
                  {participants.filter(p => p.isActive).slice(0, 3).map((participant) => (
                    <Avatar key={participant.id} className="w-6 h-6 border-2 border-gray-800">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex h-[500px]">
              <ScrollArea className="flex-1 pr-4 h-full">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start">
                      <Avatar className="w-8 h-8 mr-3">
                        <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                        <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center mb-1">
                          <p className="font-medium">{msg.senderName}</p>
                          <p className="text-xs text-gray-400 ml-2">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
            </div>
            
            <div className="flex items-center mt-4">
              <Input 
                placeholder="Type a message..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 mr-2 bg-gray-750 border-gray-700"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Group Members</h3>
              <div className="flex gap-2">
                <Button variant="outline" className="border-gray-600">
                  <MailPlus className="h-4 w-4 mr-2" />
                  Invite by Email
                </Button>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {participants.map((participant) => (
                <div key={participant.id} className="p-4 bg-gray-750 rounded-md flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {participant.isActive && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-750"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{participant.name}</h4>
                      <div className="flex items-center text-xs">
                        <span className={participant.isActive ? 'text-green-400' : 'text-gray-400'}>
                          {participant.isActive ? 'Online' : `Last seen ${participant.lastActive}`}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-400">{participant.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 border-gray-600">
                      Message
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" /> Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Info className="h-4 w-4 mr-2" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                          <UserMinus className="h-4 w-4 mr-2" /> Remove from Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Invitation Controls</h4>
              <div className="p-4 bg-gray-750 rounded-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-medium">Share Link</h5>
                    <p className="text-sm text-gray-400">Anyone with this link can request to join the group</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-electric-cyan-600 text-electric-cyan-400">
                    Generate Link
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Pending Invitations</h5>
                    <p className="text-sm text-gray-400">Review and manage sent invitations</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    View 2 Pending
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationTools;