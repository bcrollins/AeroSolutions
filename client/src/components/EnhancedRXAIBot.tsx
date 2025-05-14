import { useState, useEffect, useRef } from "react";
import { 
  FaRocket, FaTimes, FaPaperPlane, FaCode, FaDesktop, 
  FaPalette, FaMobileAlt, FaUser, FaLaptopCode, FaHeadset,
  FaSpinner, FaCircle, FaStar, FaInfoCircle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface EnhancedRXAIBotProps {
  isOpen?: boolean;
  initialOption?: string | null;
  hideFloatingButton?: boolean;
  className?: string;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'bot' | 'user' | 'agent';
  isProcessing?: boolean;
  timestamp?: Date;
  agentName?: string;
}

export default function EnhancedRXAIBot({ 
  isOpen: externalIsOpen, 
  initialOption, 
  hideFloatingButton = false,
  className = ""
}: EnhancedRXAIBotProps = {}) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [activeOption, setActiveOption] = useState<string | null>(initialOption || null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessType: '',
    businessSize: '',
    websiteStatus: '',
    goals: ''
  });
  const [showBusinessInfoForm, setShowBusinessInfoForm] = useState(false);
  const [connectedToAgent, setConnectedToAgent] = useState(false);
  const [agentConnecting, setAgentConnecting] = useState(false);
  const [showSupportOptions, setShowSupportOptions] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get user subscription tier (Free, Pro, Enterprise)
  const userTier = (user as any)?.subscriptionPlan?.name || 'Free';
  const hasHumanSupportAccess = userTier === 'Pro' || userTier === 'Enterprise';
  
  // AI assistant personas based on subscription tier
  const assistantPersonas = {
    'Free': {
      name: 'RXAI Assistant',
      intro: "Hi there! I'm the RXAI Assistant. I can answer basic questions about our services and features. For more personalized assistance, consider upgrading to Pro.",
      capabilities: ['General information', 'Basic troubleshooting', 'Service descriptions']
    },
    'Pro': {
      name: 'RXAI Pro Advisor',
      intro: "Welcome to Pro support! I'm your RXAI Pro Advisor, ready to provide detailed assistance with your projects. You can also connect to a human agent if needed.",
      capabilities: ['Detailed technical guidance', 'Project-specific advice', 'Priority response', 'Human agent escalation']
    },
    'Enterprise': {
      name: 'RXAI Enterprise Consultant',
      intro: "Welcome to Enterprise support! I'm your dedicated RXAI Enterprise Consultant. I offer comprehensive expertise for your business needs, with immediate human escalation available.",
      capabilities: ['Advanced technical consulting', 'Custom solution architecture', 'Priority human support', 'Business strategy guidance']
    }
  };
  
  // Mock agent names for human support
  const supportAgents = [
    { name: 'Alex Taylor', specialty: 'Frontend Development' },
    { name: 'Jordan Chen', specialty: 'Backend Systems' },
    { name: 'Morgan Rivera', specialty: 'Full-Stack Development' },
    { name: 'Sam Washington', specialty: 'DevOps & Deployment' }
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle external props changes
  // Check if business info is stored in localStorage
  useEffect(() => {
    const storedBusinessInfo = localStorage.getItem('rxai_business_info');
    if (storedBusinessInfo) {
      try {
        setBusinessInfo(JSON.parse(storedBusinessInfo));
      } catch (e) {
        console.error("Error parsing stored business info:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
      
      if (externalIsOpen) {
        // When opening from external source
        setIsTyping(true);
        setTypingComplete(false);
        
        // If initialOption is provided, skip showing options and go straight to response
        if (initialOption) {
          setActiveOption(initialOption);
        }
        
        // Simulate typing and then show content
        setTimeout(() => {
          setIsTyping(false);
          setTypingComplete(true);
          
          // If we don't have business info yet, prompt for it after a short delay
          const hasBusinessInfo = Object.values(businessInfo).some(value => value.trim() !== '');
          if (!hasBusinessInfo && messages.length === 0) {
            setTimeout(() => {
              // Add persona-specific greeting based on subscription tier
              const persona = assistantPersonas[userTier as keyof typeof assistantPersonas] || assistantPersonas.Free;
              
              const botMessage: ChatMessage = {
                id: Date.now(),
                text: persona.intro,
                sender: 'bot',
                timestamp: new Date()
              };
              
              setMessages(prev => [...prev, botMessage]);
              
              // Then show business info form after a short delay
              setTimeout(() => {
                const businessInfoMessage: ChatMessage = {
                  id: Date.now() + 1,
                  text: "To provide you with more tailored assistance, I'd love to learn about your business. Would you mind sharing some quick info?",
                  sender: 'bot',
                  timestamp: new Date()
                };
                
                setMessages(prev => [...prev, businessInfoMessage]);
                setShowBusinessInfoForm(true);
              }, 1500);
            }, 1000);
          }
        }, 1500);
      }
    }
  }, [externalIsOpen, initialOption, businessInfo, messages.length, userTier]);
  
  // Listen for custom event to open tech assistant
  useEffect(() => {
    const handleOpenTechAssistant = () => {
      console.log("Custom event received: openTechAssistant");
      setIsOpen(true);
      setIsTyping(true);
      setTypingComplete(false);
      setActiveOption(null);
      
      // Simulate typing and then show content
      setTimeout(() => {
        setIsTyping(false);
        setTypingComplete(true);
      }, 1500);
    };
    
    window.addEventListener('openTechAssistant', handleOpenTechAssistant);
    
    return () => {
      window.removeEventListener('openTechAssistant', handleOpenTechAssistant);
    };
  }, []);
  
  // Update unread counter when chat is closed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      // Count messages that came after the user's last message
      const lastUserMsgIndex = [...messages].reverse().findIndex(msg => msg.sender === 'user');
      const newUnread = lastUserMsgIndex >= 0 
        ? lastUserMsgIndex 
        : messages.filter(msg => msg.sender !== 'user').length;
      
      setUnreadMessages(newUnread);
    } else {
      setUnreadMessages(0);
    }
  }, [isOpen, messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset unread counter when opening
      setUnreadMessages(0);
      
      // Reset states when opening
      if (messages.length === 0) {
        setActiveOption(null);
        setIsTyping(true);
        setTypingComplete(false);
        
        // Simulate typing
        setTimeout(() => {
          setIsTyping(false);
          setTypingComplete(true);
          
          // Add persona-specific greeting based on subscription tier
          const persona = assistantPersonas[userTier as keyof typeof assistantPersonas] || assistantPersonas.Free;
          
          const botMessage: ChatMessage = {
            id: Date.now(),
            text: persona.intro,
            sender: 'bot',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
        }, 1500);
      }
    }
  };

  const handleOptionClick = async (option: string) => {
    setActiveOption(option);
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: getOptionText(option),
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Prepare bot response
    const botMessage: ChatMessage = {
      id: Date.now() + 1,
      text: '',
      sender: 'bot',
      isProcessing: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
    
    try {
      // Send request to dedicated RXAI endpoint powered by RXAI
      const response = await apiRequest("POST", "/api/rxai/support", { 
        query: `User selected option: ${option}. ${getOptionText(option)}`,
        userTier: userTier
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response from RXAI Assistant");
      }
      
      const data = await response.json();
      
      // Update the message with AI response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessage.id 
            ? { ...msg, text: data.response, isProcessing: false } 
            : msg
        )
      );
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Update with error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessage.id 
            ? { 
                ...msg, 
                text: "Sorry, I'm having trouble connecting right now. Please try again later or contact our team directly.", 
                isProcessing: false 
              } 
            : msg
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to get response from RXAI Assistant",
        variant: "destructive"
      });
    }
  };

  const getOptionText = (option: string): string => {
    switch (option) {
      case "website-design":
        return "I'd like to learn more about website design";
      case "web-development":
        return "Tell me about your web development services";
      case "mobile-optimization":
        return "How can you help with mobile optimization?";
      case "branding-design":
        return "I need help with branding and identity";
      case "pricing":
        return "What are your pricing options?";
      case "support-options":
        return "Tell me about your support plans";
      default:
        return "Tell me more about RXAI's services";
    }
  };
  
  const handleConnectWithAgent = () => {
    if (!hasHumanSupportAccess) {
      // Show upgrade message
      const botMessage: ChatMessage = {
        id: Date.now(),
        text: "Human support is available for Pro and Enterprise customers. Would you like to learn more about upgrading your plan?",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      return;
    }
    
    // Simulate connecting to an agent
    setAgentConnecting(true);
    
    const connectingMessage: ChatMessage = {
      id: Date.now(),
      text: "Connecting you with a support agent. This typically takes 1-2 minutes...",
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, connectingMessage]);
    
    // Simulate connection time
    setTimeout(() => {
      setAgentConnecting(false);
      setConnectedToAgent(true);
      
      // Select random agent
      const agent = supportAgents[Math.floor(Math.random() * supportAgents.length)];
      
      const agentMessage: ChatMessage = {
        id: Date.now(),
        text: `Hi there! I'm ${agent.name}, a ${agent.specialty} specialist. I've reviewed your conversation, and I'm happy to help with your questions. What specific aspects of your project would you like to discuss?`,
        sender: 'agent',
        agentName: agent.name,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 3000);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const userInput = message.trim();
    setMessage("");
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: userInput,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // If connected to agent, simulate agent response
    if (connectedToAgent) {
      // Get last agent name
      const lastAgentMsg = [...messages].reverse().find(msg => msg.sender === 'agent');
      const agentName = lastAgentMsg?.agentName || 'Support Agent';
      
      // Simulate typing
      setTimeout(() => {
        const agentMessage: ChatMessage = {
          id: Date.now(),
          text: getAgentResponse(userInput),
          sender: 'agent',
          agentName: agentName,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, agentMessage]);
      }, 1500 + Math.random() * 1000);
      
      return;
    }
    
    // Add bot processing message
    const botMessage: ChatMessage = {
      id: Date.now() + 1,
      text: '',
      sender: 'bot',
      isProcessing: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
    
    try {
      // Send request to dedicated RXAI endpoint powered by RXAI
      // Include business info and tier in the request
      const hasBusinessInfo = Object.values(businessInfo).some(value => value.trim() !== '');
      
      const response = await apiRequest("POST", "/api/rxai/support", { 
        query: userInput,
        userContext: hasBusinessInfo ? businessInfo : undefined,
        userTier: userTier
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response from RXAIBot");
      }
      
      const data = await response.json();
      
      // Update the message with AI response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessage.id 
            ? { ...msg, text: data.response, isProcessing: false } 
            : msg
        )
      );
      
      // If the user asked about human support, show the support options
      if (userInput.toLowerCase().includes('human') || 
          userInput.toLowerCase().includes('agent') || 
          userInput.toLowerCase().includes('person') ||
          userInput.toLowerCase().includes('speak to someone') ||
          userInput.toLowerCase().includes('talk to someone')) {
        setShowSupportOptions(true);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Update with error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessage.id 
            ? { 
                ...msg, 
                text: "Sorry, I'm having trouble connecting right now. Please try again later or contact our team directly.", 
                isProcessing: false 
              } 
            : msg
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to get response from RXAIBot",
        variant: "destructive"
      });
    }
  };
  
  const getAgentResponse = (query: string): string => {
    // Simple simulation of agent responses
    const responses = [
      `Thanks for the details. Based on your requirements, I'd recommend our custom web application development service. We can schedule a more detailed consultation to discuss the specifics of your project.`,
      `I understand your concerns. For your particular use case, I'd suggest starting with our Professional service package, which includes all the features you mentioned plus ongoing support.`,
      `Great question! The technology stack we'd recommend for your project would include React for the frontend and Node.js with Express for the backend, connected to a PostgreSQL database.`,
      `Based on your timeline and requirements, I estimate this project would take approximately 6-8 weeks to complete, including the testing and deployment phases.`,
      `I'd be happy to set up a call with our technical lead to discuss these specific requirements in more detail. When would be a good time for you?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const handleBusinessInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save business info to localStorage for persistence
    localStorage.setItem('rxai_business_info', JSON.stringify(businessInfo));
    
    // Hide the form
    setShowBusinessInfoForm(false);
    
    // Add a message from the bot acknowledging the information
    const botMessage: ChatMessage = {
      id: Date.now(),
      text: `Thanks for sharing information about your business! I'll use this to provide more tailored assistance. How can I help you with your ${businessInfo.businessType || 'business'} today?`,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
  };
  
  const handleDisconnectAgent = () => {
    setConnectedToAgent(false);
    
    const botMessage: ChatMessage = {
      id: Date.now(),
      text: "You've been disconnected from the live agent. I'm your RXAI Assistant again. How else can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
  };
  
  const getStatusColor = () => {
    if (connectedToAgent) return "text-green-500";
    if (userTier === 'Enterprise') return "text-purple-500";
    if (userTier === 'Pro') return "text-blue-500";
    return "text-gray-500";
  };
  
  const getStatusText = () => {
    if (connectedToAgent) return "Connected to Agent";
    if (userTier === 'Enterprise') return "Enterprise Support";
    if (userTier === 'Pro') return "Pro Support";
    return "Basic Support";
  };

  return (
    <div className={className}>
      {/* Floating Chat Button - Only show if not hidden */}
      {!hideFloatingButton && (
        <button
          onClick={toggleChatbot}
          className="fixed bottom-6 right-6 bg-blue-700 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg z-30 flex items-center justify-center"
          aria-label="Chat with RXAI Assistant"
        >
          {isOpen ? (
            <FaTimes className="text-xl" />
          ) : (
            <div className="relative">
              <FaHeadset className="text-xl" />
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadMessages}
                </span>
              )}
            </div>
          )}
        </button>
      )}

      {/* Chatbot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 w-80 sm:w-96 bg-gray-900 rounded-xl shadow-xl overflow-hidden z-30 flex flex-col border border-gray-700"
            style={{ maxHeight: "80vh" }}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-900/50 text-blue-300 flex items-center justify-center mr-3">
                  {connectedToAgent ? <FaHeadset /> : <FaRocket />}
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-bold">
                      {connectedToAgent ? "Live Support" : "RXAI Assistant"}
                    </h3>
                    {userTier !== 'Free' && (
                      <div className="ml-2 bg-blue-900/50 px-2 py-0.5 rounded text-xs font-medium">
                        {userTier}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-xs">
                    <FaCircle className={`${getStatusColor()} text-xs mr-1`} />
                    <span className="text-gray-300">{getStatusText()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
                <FaTimes />
              </button>
            </div>

            {/* Chat Content */}
            <div 
              className="flex-grow overflow-y-auto p-4 bg-gray-900"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(16, 185, 129, 0.03) 100%)`,
              }}
            >
              {/* Welcome Message - Only shown if no messages yet */}
              {messages.length === 0 && (
                <div className="flex mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center mr-2 flex-shrink-0">
                    <FaRocket />
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg rounded-tl-none max-w-[80%] shadow-sm">
                    {isTyping ? (
                      <div className="flex space-x-2 items-center py-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    ) : typingComplete ? (
                      <div>
                        <p className="text-white">
                          {assistantPersonas[userTier as keyof typeof assistantPersonas]?.intro || 
                           "Hi there! I'm your RXAI Assistant. How can I help you today?"}
                        </p>
                        {userTier !== 'Free' && (
                          <div className="mt-2 text-xs text-blue-400 flex items-center">
                            <FaStar className="mr-1" /> 
                            {userTier} support features enabled
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, index) => (
                <div 
                  key={msg.id} 
                  className={`flex mb-4 ${msg.sender !== 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.sender !== 'user' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                      msg.sender === 'agent' ? 'bg-green-700 text-white' : 'bg-blue-700 text-white'
                    }`}>
                      {msg.sender === 'agent' ? <FaUser /> : <FaRocket />}
                    </div>
                  )}
                  
                  <div className={`${
                    msg.sender === 'user' 
                      ? 'bg-blue-700 text-white rounded-lg rounded-tr-none' 
                      : msg.sender === 'agent'
                        ? 'bg-green-900/50 text-white rounded-lg rounded-tl-none border border-green-700/50'
                        : 'bg-gray-800 text-white rounded-lg rounded-tl-none'
                  } p-3 max-w-[80%] shadow-sm`}>
                    {msg.sender === 'agent' && (
                      <div className="text-xs text-green-400 font-medium mb-1">
                        {msg.agentName || 'Support Agent'}
                      </div>
                    )}
                    
                    {msg.isProcessing ? (
                      <div className="flex space-x-2 items-center py-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.timestamp && (
                          <div className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center ml-2 flex-shrink-0">
                      <FaUser />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Human support options - shown when user asks about agent */}
              {showSupportOptions && !connectedToAgent && !agentConnecting && (
                <div className="my-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-white font-medium mb-2 flex items-center">
                    <FaHeadset className="mr-2 text-blue-400" />
                    Human Support Options
                  </h4>
                  
                  {hasHumanSupportAccess ? (
                    <div>
                      <p className="text-gray-300 text-sm mb-3">
                        As a {userTier} user, you have access to live human support. Would you like to connect with a support agent now?
                      </p>
                      <button
                        onClick={handleConnectWithAgent}
                        className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
                      >
                        <FaHeadset className="mr-2" /> Connect with Support Agent
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-300 text-sm mb-3">
                        Human support is available for Pro and Enterprise subscribers. Upgrade your plan to get access to live support agents.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOptionClick("pricing")}
                          className="py-2 px-3 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors flex-grow text-sm"
                        >
                          View Pricing Plans
                        </button>
                        <button
                          onClick={() => setShowSupportOptions(false)}
                          className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                        >
                          Continue with AI
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Business Info Form */}
              {showBusinessInfoForm && (
                <div className="my-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-white font-medium mb-2">Tell us about your business</h4>
                  <form onSubmit={handleBusinessInfoSubmit}>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Business Name</label>
                        <input 
                          type="text"
                          value={businessInfo.businessName}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          placeholder="Your business name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Business Type</label>
                        <select
                          value={businessInfo.businessType}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessType: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        >
                          <option value="">Select business type</option>
                          <option value="E-commerce">E-commerce</option>
                          <option value="Service Provider">Service Provider</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Education">Education</option>
                          <option value="Finance">Finance</option>
                          <option value="Technology">Technology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Business Size</label>
                        <select
                          value={businessInfo.businessSize}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessSize: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        >
                          <option value="">Select business size</option>
                          <option value="1-10 employees">1-10 employees</option>
                          <option value="11-50 employees">11-50 employees</option>
                          <option value="51-200 employees">51-200 employees</option>
                          <option value="201-1000 employees">201-1000 employees</option>
                          <option value="1000+ employees">1000+ employees</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Website Status</label>
                        <select
                          value={businessInfo.websiteStatus}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, websiteStatus: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        >
                          <option value="">Select website status</option>
                          <option value="No website yet">No website yet</option>
                          <option value="Basic website">Basic website</option>
                          <option value="Needs redesign">Needs redesign</option>
                          <option value="E-commerce site">E-commerce site</option>
                          <option value="Custom web application">Custom web application</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Primary Goals</label>
                        <select
                          value={businessInfo.goals}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, goals: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        >
                          <option value="">Select primary goal</option>
                          <option value="Increase online sales">Increase online sales</option>
                          <option value="Generate leads">Generate leads</option>
                          <option value="Improve brand awareness">Improve brand awareness</option>
                          <option value="Streamline operations">Streamline operations</option>
                          <option value="Launch new product/service">Launch new product/service</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <button
                        type="button"
                        onClick={() => setShowBusinessInfoForm(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                      >
                        Skip
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Options - only shown initially if no messages */}
              {messages.length === 0 && typingComplete && !activeOption && (
                <div className="flex flex-col space-y-2 pl-10 mt-4">
                  <h4 className="text-gray-400 text-xs font-medium mb-1">SELECT AN OPTION</h4>
                  <button
                    onClick={() => handleOptionClick("website-design")}
                    className="bg-gray-800 p-3 rounded-lg text-left hover:bg-gray-700 border border-gray-700 transition-colors flex items-center"
                  >
                    <FaPalette className="text-blue-400 mr-2" />
                    <span className="text-white">Website Design</span>
                  </button>
                  <button
                    onClick={() => handleOptionClick("web-development")}
                    className="bg-gray-800 p-3 rounded-lg text-left hover:bg-gray-700 border border-gray-700 transition-colors flex items-center"
                  >
                    <FaCode className="text-blue-400 mr-2" />
                    <span className="text-white">Web Development</span>
                  </button>
                  <button
                    onClick={() => handleOptionClick("mobile-optimization")}
                    className="bg-gray-800 p-3 rounded-lg text-left hover:bg-gray-700 border border-gray-700 transition-colors flex items-center"
                  >
                    <FaMobileAlt className="text-blue-400 mr-2" />
                    <span className="text-white">Mobile Optimization</span>
                  </button>
                  <button
                    onClick={() => handleOptionClick("pricing")}
                    className="bg-gray-800 p-3 rounded-lg text-left hover:bg-gray-700 border border-gray-700 transition-colors flex items-center"
                  >
                    <FaDesktop className="text-blue-400 mr-2" />
                    <span className="text-white">Pricing & Plans</span>
                  </button>
                </div>
              )}

              {/* Make sure messages scroll to bottom */}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-gray-800 border-t border-gray-700 relative">
              {/* Agent is connecting indicator */}
              {agentConnecting && (
                <div className="absolute -top-8 left-0 right-0 bg-green-900 text-white text-center py-1 text-sm flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" /> Connecting to support agent...
                </div>
              )}
              
              {/* Connected to agent indicator */}
              {connectedToAgent && (
                <div className="absolute -top-8 left-0 right-0 bg-green-800 text-white text-center py-1 text-sm flex items-center justify-center">
                  <FaCircle className="text-green-500 text-xs mr-2" /> Connected to support agent
                  <button 
                    onClick={handleDisconnectAgent}
                    className="ml-2 px-2 py-0.5 bg-green-700 hover:bg-green-600 rounded text-xs"
                  >
                    End Chat
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={connectedToAgent 
                    ? "Type your message to the support agent..." 
                    : "Type your message..."}
                  className="flex-grow py-2 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-white transition-colors"
                >
                  <FaPaperPlane />
                </button>
              </form>
              
              {/* Subscription tier indicator */}
              <div className="mt-2 flex justify-between items-center text-xs">
                <div className="text-gray-400 flex items-center">
                  <FaInfoCircle className="mr-1" />
                  {hasHumanSupportAccess 
                    ? "Human support available" 
                    : "Upgrade for human support"}
                </div>
                <div className="text-gray-400">
                  {userTier === 'Free' ? 'Basic' : userTier} Support
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}