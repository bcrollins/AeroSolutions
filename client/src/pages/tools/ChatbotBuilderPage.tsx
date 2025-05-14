import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ToolLayout from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  PlusCircle, 
  Settings, 
  Trash2, 
  Copy, 
  Save, 
  Bot, 
  Send, 
  User, 
  LayoutPanelLeft, 
  Repeat, 
  Code, 
  HelpCircle,
  ArrowRight,
  Database,
  Braces,
  AlertCircle,
  X
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

// Tutorial content for the Chatbot Builder tool
const ChatbotBuilderTutorial = (
  <div className="space-y-4">
    <p>Build your first chatbot in minutes:</p>
    <ol className="list-decimal list-inside space-y-2">
      <li>Create a new bot project with a template or from scratch</li>
      <li>Design your conversation flow using the visual editor</li>
      <li>Add message blocks, questions, and conditional logic</li>
      <li>Customize your bot's appearance to match your brand</li>
      <li>Test your bot in the preview environment</li>
    </ol>
    <p className="text-muted-foreground">Start with a template to see how powerful bots are structured!</p>
    
    <div className="bg-muted p-4 rounded-md mt-4">
      <h4 className="font-medium mb-2">Enterprise Features:</h4>
      <ul className="list-disc list-inside space-y-1">
        <li>Connect to your knowledge base for AI-powered answers</li>
        <li>Integrate with CRM systems to personalize conversations</li>
        <li>Set up handoff protocols to live agents</li>
        <li>Implement entity recognition for complex user inputs</li>
        <li>Deploy across multiple channels (website, WhatsApp, etc.)</li>
      </ul>
    </div>
  </div>
);

// Template options
const botTemplates = [
  { 
    id: 'customer-support', 
    name: 'Customer Support Bot', 
    description: 'Handle common customer inquiries and route complex issues to human agents',
    icon: <HelpCircle className="h-10 w-10 text-blue-400" />
  },
  { 
    id: 'lead-generation', 
    name: 'Lead Generation Bot', 
    description: 'Qualify leads and collect contact information for your sales team',
    icon: <User className="h-10 w-10 text-blue-400" />
  },
  { 
    id: 'product-recommendation', 
    name: 'Product Recommendation Bot', 
    description: 'Guide customers to the right products based on their needs',
    icon: <ArrowRight className="h-10 w-10 text-blue-400" />
  },
  { 
    id: 'appointment-booking', 
    name: 'Appointment Booking Bot', 
    description: 'Help users schedule appointments with your team',
    icon: <LayoutPanelLeft className="h-10 w-10 text-blue-400" />
  },
  { 
    id: 'faq', 
    name: 'FAQ Bot', 
    description: 'Answer frequently asked questions about your business',
    icon: <Database className="h-10 w-10 text-blue-400" />
  },
  { 
    id: 'blank', 
    name: 'Blank Bot', 
    description: 'Start from scratch and build your custom bot',
    icon: <PlusCircle className="h-10 w-10 text-blue-400" />
  },
];

// Default conversation nodes
const defaultConversationFlow = [
  {
    id: 'welcome',
    type: 'message',
    content: 'Hello! Welcome to our chatbot. How can I help you today?',
    nextNodeId: 'options',
  },
  {
    id: 'options',
    type: 'options',
    content: 'Please select an option:',
    options: [
      { 
        label: 'Get information about your services', 
        value: 'services',
        nextNodeId: 'services-info'
      },
      { 
        label: 'I need support with my account', 
        value: 'account',
        nextNodeId: 'account-support'
      },
      { 
        label: 'I have a different question', 
        value: 'other',
        nextNodeId: 'other-question'
      },
    ],
  },
  {
    id: 'services-info',
    type: 'message',
    content: 'We offer a wide range of services including web development, digital marketing, and AI solutions. Would you like to know more about any specific service?',
    nextNodeId: null,
  },
  {
    id: 'account-support',
    type: 'message',
    content: 'I can help with account issues. What specific problem are you experiencing?',
    nextNodeId: 'account-options',
  },
  {
    id: 'account-options',
    type: 'options',
    content: 'What issue are you facing?',
    options: [
      { 
        label: 'I forgot my password', 
        value: 'password',
        nextNodeId: 'password-reset'
      },
      { 
        label: 'Billing question', 
        value: 'billing',
        nextNodeId: 'billing-question'
      },
      { 
        label: 'Speak to a human agent', 
        value: 'human',
        nextNodeId: 'human-agent'
      },
    ],
  },
  {
    id: 'password-reset',
    type: 'message',
    content: 'You can reset your password by going to the login page and clicking on "Forgot Password". You will receive an email with instructions.',
    nextNodeId: null,
  },
  {
    id: 'billing-question',
    type: 'message',
    content: 'For billing questions, please check your latest invoice in the account section. If you need more help, I can connect you with our billing department.',
    nextNodeId: null,
  },
  {
    id: 'human-agent',
    type: 'message',
    content: 'I\'ll connect you with a human agent shortly. Please wait a moment.',
    nextNodeId: null,
  },
  {
    id: 'other-question',
    type: 'input',
    content: 'Please type your question below and I\'ll do my best to help:',
    nextNodeId: 'other-response',
  },
  {
    id: 'other-response',
    type: 'ai',
    content: 'Thank you for your question. Let me see if I can find an answer for you.',
    nextNodeId: null,
  },
];

const ChatbotBuilderPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('flow');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [botName, setBotName] = useState('New Chatbot');
  const [botDescription, setBotDescription] = useState('');
  const [conversationFlow, setConversationFlow] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [botSettings, setBotSettings] = useState({
    primaryColor: '#007bff',
    welcomeMessage: 'Hello! How can I help you today?',
    placeholderText: 'Type your message...',
    logoUrl: '',
    aiEnabled: false,
    handoffEnabled: false,
    multiLanguage: false,
  });
  
  // Chatbot preview state
  const [previewMessages, setPreviewMessages] = useState<{ sender: 'bot' | 'user', content: string }[]>([
    { sender: 'bot' as 'bot', content: botSettings.welcomeMessage },
  ]);
  const [userInput, setUserInput] = useState('');
  const [previewNode, setPreviewNode] = useState('welcome');

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Set template name and flow based on selection
    const template = botTemplates.find(t => t.id === templateId);
    if (template) {
      setBotName(template.name);
      setBotDescription(template.description);
      
      if (templateId === 'blank') {
        setConversationFlow([{
          id: 'welcome',
          type: 'message',
          content: 'Hello! Welcome to our chatbot. How can I help you today?',
          nextNodeId: null,
        }]);
      } else {
        // Load template-specific flow
        setConversationFlow(defaultConversationFlow);
      }
    }
    
    trackEvent('select_template', 'chatbot_builder', templateId);
    
    toast({
      title: "Template Selected",
      description: `Using the ${template?.name} template`,
    });
  };

  // Handle adding a new node
  const handleAddNode = (nodeType: string) => {
    const newNodeId = `node-${Date.now()}`;
    let newNode: any = {
      id: newNodeId,
      type: nodeType,
      content: '',
      nextNodeId: null,
    };
    
    if (nodeType === 'options') {
      newNode.options = [
        { label: 'Option 1', value: 'option1', nextNodeId: null },
      ];
    }
    
    setConversationFlow([...conversationFlow, newNode]);
    setSelectedNode(newNodeId);
    
    trackEvent('add_node', 'chatbot_builder', nodeType);
    
    toast({
      title: "Node Added",
      description: `Added new ${nodeType} node to your chatbot flow`,
    });
  };

  // Handle node deletion
  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === 'welcome') {
      toast({
        title: "Cannot Delete",
        description: "The welcome node cannot be deleted",
        variant: "destructive",
      });
      return;
    }
    
    setConversationFlow(conversationFlow.filter(node => node.id !== nodeId));
    
    // Update any nodes that point to this one
    setConversationFlow(prev => prev.map(node => {
      if (node.nextNodeId === nodeId) {
        return { ...node, nextNodeId: null };
      }
      
      if (node.type === 'options') {
        const updatedOptions = node.options.map((opt: any) => {
          if (opt.nextNodeId === nodeId) {
            return { ...opt, nextNodeId: null };
          }
          return opt;
        });
        return { ...node, options: updatedOptions };
      }
      
      return node;
    }));
    
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
    
    trackEvent('delete_node', 'chatbot_builder', nodeId);
    
    toast({
      title: "Node Deleted",
      description: "The selected node has been removed from your chatbot flow",
    });
  };

  // Handle node update
  const handleUpdateNode = (nodeId: string, updates: any) => {
    setConversationFlow(prev => prev.map(node => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      return node;
    }));
  };

  // Handle settings update
  const handleUpdateSettings = (key: string, value: any) => {
    setBotSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'welcomeMessage') {
      setPreviewMessages([{ sender: 'bot', content: value }]);
    }
  };

  // Handle building/publishing the bot
  const handleBuildBot = () => {
    setIsBuilding(true);
    trackEvent('build_bot', 'chatbot_builder', botName);
    
    // Simulate building process
    setTimeout(() => {
      setIsBuilding(false);
      toast({
        title: "Bot Built Successfully",
        description: "Your chatbot is ready to be deployed",
      });
    }, 2000);
  };

  // Handle user message in preview
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    const newMessages = [...previewMessages, { sender: 'user' as 'user', content: userInput }];
    setPreviewMessages(newMessages);
    
    // Find current node
    const currentNode = conversationFlow.find(node => node.id === previewNode);
    
    if (currentNode) {
      // Add bot response based on flow
      setTimeout(() => {
        if (currentNode.type === 'options') {
          // Find selected option
          const option = currentNode.options.find((opt: any) => 
            opt.label.toLowerCase().includes(userInput.toLowerCase())
          );
          
          if (option) {
            // Find next node
            const nextNode = conversationFlow.find(node => node.id === option.nextNodeId);
            if (nextNode) {
              setPreviewMessages(prev => [...prev, { sender: 'bot' as 'bot', content: nextNode.content }]);
              setPreviewNode(nextNode.id);
            }
          } else {
            setPreviewMessages(prev => [...prev, { 
              sender: 'bot' as 'bot', 
              content: "I'm sorry, I didn't understand. Could you try selecting one of the options?" 
            }]);
          }
        } else if (currentNode.type === 'input' || currentNode.type === 'ai') {
          // Find next node
          const nextNode = conversationFlow.find(node => node.id === currentNode.nextNodeId);
          if (nextNode) {
            setPreviewMessages(prev => [...prev, { sender: 'bot' as 'bot', content: nextNode.content }]);
            setPreviewNode(nextNode.id);
          } else {
            setPreviewMessages(prev => [...prev, { 
              sender: 'bot' as 'bot', 
              content: "Thanks for your input! I've recorded your response." 
            }]);
          }
        }
      }, 1000);
    }
    
    setUserInput('');
  };

  return (
    <ToolLayout
      title="Chatbot Builder"
      description="Build custom chatbots with no-code interface, conversation flows, and integration options."
      tutorial={ChatbotBuilderTutorial}
      tutorialTitle="Getting Started with Chatbot Builder"
    >
      {selectedTemplate === null ? (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Choose a Bot Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {botTemplates.map(template => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    {template.icon}
                    {template.id === 'blank' ? (
                      <Badge>Basic</Badge>
                    ) : template.id === 'faq' || template.id === 'lead-generation' ? (
                      <Badge variant="secondary">Pro</Badge>
                    ) : (
                      <Badge variant="outline">Enterprise</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{template.description}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Select Template</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{botName}</h2>
              <p className="text-muted-foreground">{botDescription}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
              >
                Change Template
              </Button>
              <Button 
                onClick={handleBuildBot}
                disabled={isBuilding || conversationFlow.length === 0}
              >
                {isBuilding ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Building...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Build & Deploy
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-6">
              <TabsTrigger value="flow" className="flex items-center">
                <Repeat className="h-4 w-4 mr-2" />
                Conversation Flow
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Bot Settings
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Integration
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="flow" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left panel - Flow list */}
                <div className="md:col-span-1 border rounded-lg">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-medium">Conversation Nodes</h3>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleAddNode('message')}>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddNode('options')}>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Options
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddNode('input')}>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Input
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[500px]">
                    <div className="p-2">
                      {conversationFlow.map(node => (
                        <div 
                          key={node.id} 
                          className={`p-3 mb-2 rounded border cursor-pointer ${selectedNode === node.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                          onClick={() => setSelectedNode(node.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {node.type === 'message' && <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />}
                              {node.type === 'options' && <LayoutPanelLeft className="h-4 w-4 mr-2 text-purple-500" />}
                              {node.type === 'input' && <User className="h-4 w-4 mr-2 text-green-500" />}
                              {node.type === 'ai' && <Bot className="h-4 w-4 mr-2 text-red-500" />}
                              <span className="font-medium truncate max-w-[150px]">
                                {node.id === 'welcome' ? 'Welcome Message' : node.content.substring(0, 20)}
                                {node.content.length > 20 ? '...' : ''}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newNodeId = `node-${Date.now()}`;
                                  setConversationFlow([
                                    ...conversationFlow, 
                                    {
                                      id: newNodeId,
                                      type: node.type,
                                      content: node.content,
                                      nextNodeId: node.nextNodeId,
                                      options: node.options ? [...node.options] : undefined,
                                    }
                                  ]);
                                  setSelectedNode(newNodeId);
                                  
                                  toast({
                                    title: "Node Duplicated",
                                    description: "A copy of the selected node has been created",
                                  });
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-destructive" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNode(node.id);
                                }}
                                disabled={node.id === 'welcome'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Type: {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                            {node.nextNodeId && <span> → {node.nextNodeId}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                
                {/* Right panel - Node editor */}
                <div className="md:col-span-2 border rounded-lg">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Node Editor</h3>
                  </div>
                  
                  {selectedNode ? (
                    <div className="p-4">
                      {conversationFlow.map(node => (
                        node.id === selectedNode && (
                          <div key={node.id} className="space-y-4">
                            <div>
                              <Label htmlFor="nodeId">Node ID</Label>
                              <Input
                                id="nodeId"
                                value={node.id}
                                disabled
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="nodeType">Node Type</Label>
                              <Select
                                disabled={node.id === 'welcome'}
                                value={node.type}
                                onValueChange={(value) => handleUpdateNode(node.id, { type: value })}
                              >
                                <SelectTrigger id="nodeType" className="mt-1">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="message">Message</SelectItem>
                                  <SelectItem value="options">Options</SelectItem>
                                  <SelectItem value="input">Input</SelectItem>
                                  <SelectItem value="ai">AI Response</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="nodeContent">Content</Label>
                              <Textarea
                                id="nodeContent"
                                value={node.content}
                                onChange={(e) => handleUpdateNode(node.id, { content: e.target.value })}
                                className="mt-1 min-h-[100px]"
                                placeholder="Enter the message content..."
                              />
                            </div>
                            
                            {node.type !== 'options' && (
                              <div>
                                <Label htmlFor="nextNode">Next Node</Label>
                                <Select
                                  value={node.nextNodeId || ''}
                                  onValueChange={(value) => handleUpdateNode(node.id, { nextNodeId: value || null })}
                                >
                                  <SelectTrigger id="nextNode" className="mt-1">
                                    <SelectValue placeholder="Select next node" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">None (End conversation)</SelectItem>
                                    {conversationFlow
                                      .filter(n => n.id !== node.id)
                                      .map(n => (
                                        <SelectItem key={n.id} value={n.id}>
                                          {n.id === 'welcome' ? 'Welcome Message' : `${n.id} (${n.type})`}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            
                            {node.type === 'options' && (
                              <div className="space-y-4">
                                <Label>Options</Label>
                                {node.options.map((option: any, index: number) => (
                                  <div key={index} className="border p-3 rounded-md">
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                      <div className="col-span-2">
                                        <Label htmlFor={`option-label-${index}`} className="text-xs">Option Label</Label>
                                        <Input
                                          id={`option-label-${index}`}
                                          value={option.label}
                                          onChange={(e) => {
                                            const newOptions = [...node.options];
                                            newOptions[index].label = e.target.value;
                                            handleUpdateNode(node.id, { options: newOptions });
                                          }}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`option-value-${index}`} className="text-xs">Value</Label>
                                        <Input
                                          id={`option-value-${index}`}
                                          value={option.value}
                                          onChange={(e) => {
                                            const newOptions = [...node.options];
                                            newOptions[index].value = e.target.value;
                                            handleUpdateNode(node.id, { options: newOptions });
                                          }}
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`option-next-${index}`} className="text-xs">Next Node</Label>
                                      <Select
                                        value={option.nextNodeId || ''}
                                        onValueChange={(value) => {
                                          const newOptions = [...node.options];
                                          newOptions[index].nextNodeId = value || null;
                                          handleUpdateNode(node.id, { options: newOptions });
                                        }}
                                      >
                                        <SelectTrigger id={`option-next-${index}`} className="mt-1">
                                          <SelectValue placeholder="Select next node" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="">None (End conversation)</SelectItem>
                                          {conversationFlow
                                            .filter(n => n.id !== node.id)
                                            .map(n => (
                                              <SelectItem key={n.id} value={n.id}>
                                                {n.id === 'welcome' ? 'Welcome Message' : `${n.id} (${n.type})`}
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="flex justify-end mt-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => {
                                          if (node.options.length > 1) {
                                            const newOptions = node.options.filter((_: any, i: number) => i !== index);
                                            handleUpdateNode(node.id, { options: newOptions });
                                          } else {
                                            toast({
                                              title: "Cannot Delete",
                                              description: "Options node must have at least one option",
                                              variant: "destructive",
                                            });
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    const newOptions = [...node.options, { 
                                      label: `Option ${node.options.length + 1}`, 
                                      value: `option${node.options.length + 1}`, 
                                      nextNodeId: null 
                                    }];
                                    handleUpdateNode(node.id, { options: newOptions });
                                  }}
                                >
                                  <PlusCircle className="h-4 w-4 mr-1" />
                                  Add Option
                                </Button>
                              </div>
                            )}
                            
                            {node.type === 'ai' && (
                              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start">
                                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                  <p className="text-amber-800 font-medium">Enterprise Feature</p>
                                  <p className="text-amber-700 text-sm">AI-powered responses require an Enterprise plan. You can still configure the flow, but the AI functionality will be limited in this preview.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 flex flex-col items-center justify-center h-[500px] text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Node Selected</h3>
                      <p className="text-muted-foreground max-w-md">
                        Select a node from the list on the left to edit its properties, or add a new node to your conversation flow.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Settings</CardTitle>
                    <CardDescription>Configure the core settings for your chatbot</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="botName">Bot Name</Label>
                      <Input
                        id="botName"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="botDescription">Description</Label>
                      <Textarea
                        id="botDescription"
                        value={botDescription}
                        onChange={(e) => setBotDescription(e.target.value)}
                        className="mt-1"
                        placeholder="Describe what your chatbot does..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="welcomeMessage">Welcome Message</Label>
                      <Textarea
                        id="welcomeMessage"
                        value={botSettings.welcomeMessage}
                        onChange={(e) => handleUpdateSettings('welcomeMessage', e.target.value)}
                        className="mt-1"
                        placeholder="The first message users will see..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="placeholderText">Input Placeholder</Label>
                      <Input
                        id="placeholderText"
                        value={botSettings.placeholderText}
                        onChange={(e) => handleUpdateSettings('placeholderText', e.target.value)}
                        className="mt-1"
                        placeholder="Type your message..."
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how your chatbot looks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex items-center mt-1">
                        <div 
                          className="w-8 h-8 rounded mr-2 border" 
                          style={{ backgroundColor: botSettings.primaryColor }}
                        ></div>
                        <Input
                          id="primaryColor"
                          type="text"
                          value={botSettings.primaryColor}
                          onChange={(e) => handleUpdateSettings('primaryColor', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                      <Input
                        id="logoUrl"
                        value={botSettings.logoUrl}
                        onChange={(e) => handleUpdateSettings('logoUrl', e.target.value)}
                        className="mt-1"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Advanced Features</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="aiEnabled">AI-powered responses</Label>
                            <p className="text-sm text-muted-foreground">Generate dynamic responses from your knowledge base</p>
                          </div>
                          <Switch
                            id="aiEnabled"
                            checked={botSettings.aiEnabled}
                            onCheckedChange={(checked) => {
                              handleUpdateSettings('aiEnabled', checked);
                              if (checked) {
                                toast({
                                  title: "Enterprise Feature",
                                  description: "AI responses require an Enterprise plan",
                                  variant: "default",
                                });
                              }
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="handoffEnabled">Human handoff</Label>
                            <p className="text-sm text-muted-foreground">Allow conversations to be transferred to human agents</p>
                          </div>
                          <Switch
                            id="handoffEnabled"
                            checked={botSettings.handoffEnabled}
                            onCheckedChange={(checked) => {
                              handleUpdateSettings('handoffEnabled', checked);
                              if (checked) {
                                toast({
                                  title: "Enterprise Feature",
                                  description: "Human handoff requires an Enterprise plan",
                                  variant: "default",
                                });
                              }
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="multiLanguage">Multi-language support</Label>
                            <p className="text-sm text-muted-foreground">Support conversations in multiple languages</p>
                          </div>
                          <Switch
                            id="multiLanguage"
                            checked={botSettings.multiLanguage}
                            onCheckedChange={(checked) => {
                              handleUpdateSettings('multiLanguage', checked);
                              if (checked) {
                                toast({
                                  title: "Enterprise Feature",
                                  description: "Multi-language support requires an Enterprise plan",
                                  variant: "default",
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-6">
              <div className="max-w-md mx-auto border rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 bg-primary text-primary-foreground flex items-center justify-between">
                  <div className="flex items-center">
                    {botSettings.logoUrl ? (
                      <img src={botSettings.logoUrl} alt="Bot logo" className="h-8 w-8 rounded mr-2" />
                    ) : (
                      <Bot className="h-5 w-5 mr-2" />
                    )}
                    <span className="font-medium">{botName}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="text-primary-foreground">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="h-[400px] bg-background p-4 overflow-y-auto">
                  {previewMessages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'} mb-3`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'bot' 
                            ? 'bg-muted text-foreground rounded-tl-none' 
                            : `bg-primary text-primary-foreground rounded-tr-none`
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 border-t bg-background">
                  <div className="flex items-center">
                    <Input
                      placeholder={botSettings.placeholderText}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      className="ml-2" 
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!userInput.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>This is a preview of how your chatbot will appear to users. Try interacting with it!</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setPreviewMessages([{ sender: 'bot', content: botSettings.welcomeMessage }]);
                    setPreviewNode('welcome');
                  }}
                >
                  Reset Conversation
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="code" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Code</CardTitle>
                  <CardDescription>Use this code to add your chatbot to your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-auto">
                    <pre>
{`<!-- Copy and paste this code before the closing </body> tag -->
<script>
  (function(d, w) {
    const botId = "${selectedTemplate === 'blank' ? 'YOUR_BOT_ID' : 'bot_' + selectedTemplate + '_' + Math.floor(Math.random() * 10000)}";
    
    function loadBot() {
      const container = document.createElement('div');
      container.id = 'rxai-chatbot-container';
      document.body.appendChild(container);
      
      const script = document.createElement('script');
      script.src = 'https://chatbot.rxai.com/loader.js?id=' + botId;
      script.async = true;
      
      script.onload = function() {
        window.RXAIBot.init({
          containerSelector: '#rxai-chatbot-container',
          primaryColor: '${botSettings.primaryColor}',
          welcomeMessage: '${botSettings.welcomeMessage.replace(/'/g, "\\'")}',
          placeholderText: '${botSettings.placeholderText.replace(/'/g, "\\'")}',
          logoUrl: '${botSettings.logoUrl}'
        });
      };
      
      document.body.appendChild(script);
    }
    
    if (d.readyState === 'complete') {
      loadBot();
    } else {
      w.addEventListener('load', loadBot);
    }
  })(document, window);
</script>`}
                    </pre>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      navigator.clipboard.writeText(document.querySelector('pre')?.textContent || '');
                      toast({
                        title: "Copied to Clipboard",
                        description: "Integration code has been copied",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Documentation</CardTitle>
                  <CardDescription>Integrate your chatbot with other platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">REST API</h4>
                      <p className="text-sm text-muted-foreground">
                        Interact with your chatbot programmatically using our REST API. Perfect for custom integrations.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Braces className="h-4 w-4 mr-2" />
                        View API Docs
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium">Channel Integrations</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button variant="outline" disabled>
                          WhatsApp
                        </Button>
                        <Button variant="outline" disabled>
                          Facebook Messenger
                        </Button>
                        <Button variant="outline" disabled>
                          Slack
                        </Button>
                        <Button variant="outline" disabled>
                          Discord
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Channel integrations require an Enterprise plan
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium">Webhooks</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure webhooks to connect your chatbot with your business systems.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" disabled>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Webhooks
                      </Button>
                      <span className="text-xs text-muted-foreground ml-2">
                        (Enterprise plan)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </ToolLayout>
  );
};

export default ChatbotBuilderPage;