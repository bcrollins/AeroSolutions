import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Code, FileText, BarChart4, Palette, MessageSquare, AlertCircle, Info } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  requiresPlan: 'free' | 'basic' | 'pro' | 'enterprise';
  features: string[];
  tutorials: Tutorial[];
}

interface Tutorial {
  id: string;
  title: string;
  content: React.ReactNode;
}

const DigitalToolsPage: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const userPlan = user?.subscriptionPlan || 'free';

  const tools: Tool[] = [
    {
      id: 'content-generator',
      name: 'AI Content Generator',
      description: 'Create SEO-optimized articles, social media posts, and product descriptions with AI assistance.',
      icon: <FileText className="h-10 w-10 text-blue-400" />,
      path: '/ai-tools/content-generator',
      requiresPlan: 'free',
      features: [
        'Blog post generation',
        'Social media caption creation',
        'Product description writing',
        'SEO optimization suggestions',
        'Grammar and style checking',
        'Multiple content formats',
      ],
      tutorials: [
        {
          id: 'content-basics',
          title: 'Getting Started with Content Generation',
          content: (
            <div className="space-y-4">
              <p>Welcome to the AI Content Generator! This tool helps you create high-quality content in seconds.</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Select your content type (blog post, social media, product description)</li>
                <li>Enter your topic or keywords</li>
                <li>Adjust tone and style preferences</li>
                <li>Click "Generate" and review the results</li>
                <li>Edit as needed and export your content</li>
              </ol>
              <p className="text-muted-foreground">Pro tip: The more specific your topic and keywords, the better your results will be!</p>
            </div>
          )
        },
        {
          id: 'seo-tips',
          title: 'SEO Optimization Tips',
          content: (
            <div className="space-y-4">
              <p>Use these tips to make your generated content more search-engine friendly:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Include your target keyword in the title</li>
                <li>Use related keywords throughout the content</li>
                <li>Aim for a readability score of 60-70</li>
                <li>Include subheadings with relevant keywords</li>
                <li>Optimize meta descriptions and alt text</li>
              </ul>
              <p className="text-muted-foreground">Remember: Write for humans first, search engines second!</p>
            </div>
          )
        }
      ]
    },
    {
      id: 'code-assistant',
      name: 'Code Assistant',
      description: 'Generate, debug, and optimize code snippets in Python, JavaScript, and other popular languages.',
      icon: <Code className="h-10 w-10 text-blue-400" />,
      path: '/ai-tools/code-assistant',
      requiresPlan: 'basic',
      features: [
        'Code generation from descriptions',
        'Debugging assistance',
        'Code optimization suggestions',
        'Multiple language support',
        'Function/class documentation',
        'Framework-specific patterns',
      ],
      tutorials: [
        {
          id: 'code-basics',
          title: 'Code Assistant Fundamentals',
          content: (
            <div className="space-y-4">
              <p>The Code Assistant helps you write better code faster. Here's how to use it:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Choose your programming language</li>
                <li>Describe what you want to create or paste code to debug</li>
                <li>Add any specific requirements or constraints</li>
                <li>Click "Generate" to get code or "Debug" for issue detection</li>
                <li>Review, test, and refine as needed</li>
              </ol>
              <p className="text-muted-foreground">For best results, be as specific as possible in your descriptions!</p>
            </div>
          )
        },
        {
          id: 'advanced-code',
          title: 'Advanced Code Features',
          content: (
            <div className="space-y-4">
              <p>Take your coding to the next level with these advanced features:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Use "Optimize" to make existing code more efficient</li>
                <li>Try "Explain" to get a line-by-line breakdown of complex code</li>
                <li>Generate unit tests for your functions automatically</li>
                <li>Convert code between different programming languages</li>
                <li>Get framework-specific patterns for React, Django, etc.</li>
              </ul>
              <p className="text-muted-foreground">Pro users can access up to 500 code generations per month!</p>
            </div>
          )
        }
      ]
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      description: 'Track website and app performance metrics with Google Analytics integration and customizable reports.',
      icon: <BarChart4 className="h-10 w-10 text-blue-400" />,
      path: '/ai-tools/analytics-dashboard',
      requiresPlan: 'pro',
      features: [
        'Google Analytics integration',
        'Custom performance metrics',
        'Visitor behavior tracking',
        'Conversion analytics',
        'Traffic source analysis',
        'Automated performance reporting',
      ],
      tutorials: [
        {
          id: 'analytics-setup',
          title: 'Setting Up Your Analytics Dashboard',
          content: (
            <div className="space-y-4">
              <p>Get started with your Analytics Dashboard in a few simple steps:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Connect your Google Analytics account (requires GA4)</li>
                <li>Select the properties and views you want to track</li>
                <li>Choose your key metrics and KPIs</li>
                <li>Set up custom dashboards for different teams/purposes</li>
                <li>Configure automated reporting schedules</li>
              </ol>
              <p className="text-muted-foreground">Need help with Google Analytics? Contact our support team!</p>
            </div>
          )
        },
        {
          id: 'advanced-analytics',
          title: 'Advanced Analytics Features',
          content: (
            <div className="space-y-4">
              <p>Maximize insights with these advanced analytics capabilities:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Set up custom event tracking for specific user actions</li>
                <li>Create audience segments for targeted analysis</li>
                <li>Configure funnel visualization for conversion paths</li>
                <li>Enable predictive metrics with AI forecasting</li>
                <li>Integrate with CRM data for full-customer journey analysis</li>
              </ul>
              <p className="text-muted-foreground">Pro and Enterprise users get access to AI-powered insights!</p>
            </div>
          )
        }
      ]
    },
    {
      id: 'design-prototyping',
      name: 'Design Prototyping Tool',
      description: 'Create wireframes and mockups with drag-and-drop functionality and reusable components.',
      icon: <Palette className="h-10 w-10 text-blue-400" />,
      path: '/ai-tools/design-prototyping',
      requiresPlan: 'pro',
      features: [
        'Drag-and-drop interface',
        'Pre-built component library',
        'Responsive design preview',
        'Design system management',
        'Collaboration features',
        'Export to various formats',
      ],
      tutorials: [
        {
          id: 'design-basics',
          title: 'Design Prototyping Basics',
          content: (
            <div className="space-y-4">
              <p>Create amazing designs with our prototyping tool:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Start with a template or blank canvas</li>
                <li>Drag components from the left sidebar onto your canvas</li>
                <li>Customize colors, styles, and properties</li>
                <li>Create interactions with the connections tool</li>
                <li>Preview your design across different screen sizes</li>
              </ol>
              <p className="text-muted-foreground">Use keyboard shortcuts (press H to view) for faster designing!</p>
            </div>
          )
        },
        {
          id: 'advanced-prototyping',
          title: 'Advanced Prototyping Techniques',
          content: (
            <div className="space-y-4">
              <p>Take your designs to the next level with these advanced features:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Create reusable components with variants</li>
                <li>Set up design tokens for consistent styling</li>
                <li>Create complex animations and transitions</li>
                <li>Use constraints for responsive layouts</li>
                <li>Generate code from your designs (React, HTML/CSS)</li>
              </ul>
              <p className="text-muted-foreground">Enterprise users can access brand asset libraries and team collaboration!</p>
            </div>
          )
        }
      ]
    },
    {
      id: 'chatbot-builder',
      name: 'Chatbot Builder',
      description: 'Build custom chatbots with no-code interface, conversation flows, and integration options.',
      icon: <MessageSquare className="h-10 w-10 text-blue-400" />,
      path: '/ai-tools/chatbot-builder',
      requiresPlan: 'enterprise',
      features: [
        'No-code conversation builder',
        'AI-powered responses',
        'Multi-channel deployment',
        'Customer data integration',
        'Analytics and optimization',
        'Customizable appearance',
      ],
      tutorials: [
        {
          id: 'chatbot-basics',
          title: 'Getting Started with Chatbot Builder',
          content: (
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
            </div>
          )
        },
        {
          id: 'advanced-chatbots',
          title: 'Advanced Chatbot Features',
          content: (
            <div className="space-y-4">
              <p>Create sophisticated chatbot experiences with these advanced capabilities:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Connect to your knowledge base for AI-powered answers</li>
                <li>Integrate with CRM systems to personalize conversations</li>
                <li>Set up handoff protocols to live agents</li>
                <li>Implement entity recognition for complex user inputs</li>
                <li>Deploy across multiple channels (website, WhatsApp, etc.)</li>
              </ul>
              <p className="text-muted-foreground">Enterprise users get dedicated training for their chatbot team!</p>
            </div>
          )
        }
      ]
    }
  ];

  const filteredTools = activeTab === 'all' 
    ? tools 
    : tools.filter(tool => {
        if (activeTab === 'free') return tool.requiresPlan === 'free';
        if (activeTab === 'basic') return tool.requiresPlan === 'basic' || tool.requiresPlan === 'free';
        if (activeTab === 'pro') return tool.requiresPlan === 'pro' || tool.requiresPlan === 'basic' || tool.requiresPlan === 'free';
        if (activeTab === 'enterprise') return true; // All tools
        return false;
      });

  const canAccessTool = (toolPlan: string) => {
    const planLevels = {
      'free': 0,
      'basic': 1,
      'pro': 2,
      'enterprise': 3
    };
    
    return planLevels[userPlan as keyof typeof planLevels] >= planLevels[toolPlan as keyof typeof planLevels];
  };

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
    
    // Track tool interaction
    trackEvent('tool_view', 'digital_tools', tool.id);
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to access digital tools.",
        variant: "destructive",
      });
      return;
    }
    
    if (!canAccessTool(tool.requiresPlan)) {
      toast({
        title: "Subscription Required",
        description: `This tool requires a ${tool.requiresPlan.charAt(0).toUpperCase() + tool.requiresPlan.slice(1)} plan or higher.`,
        variant: "destructive",
      });
      return;
    }
  };

  const openTutorial = (tool: Tool, tutorial: Tutorial) => {
    setSelectedTool(tool);
    setCurrentTutorial(tutorial);
    setTutorialOpen(true);
    trackEvent('tutorial_view', 'digital_tools', `${tool.id}_${tutorial.id}`);
  };

  return (
    <div className="container py-8">
      <Helmet>
        <title>Digital Tools Suite | RXAI</title>
        <meta name="description" content="Access a suite of AI-powered digital tools for content creation, code assistance, analytics, design, and more." />
      </Helmet>
      
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-3">RXAI Digital Tools Suite</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Powerful AI-driven tools to enhance your productivity and creativity
        </p>
      </div>
      
      <div className="mb-8">
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full max-w-4xl mx-auto"
        >
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All Tools</TabsTrigger>
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="pro">Pro</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderToolCards(filteredTools)}
            </div>
          </TabsContent>
          <TabsContent value="free" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderToolCards(filteredTools)}
            </div>
          </TabsContent>
          <TabsContent value="basic" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderToolCards(filteredTools)}
            </div>
          </TabsContent>
          <TabsContent value="pro" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderToolCards(filteredTools)}
            </div>
          </TabsContent>
          <TabsContent value="enterprise" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderToolCards(filteredTools)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {selectedTool && (
        <Dialog open={!!selectedTool && !tutorialOpen && !canAccessTool(selectedTool.requiresPlan)} onOpenChange={() => setSelectedTool(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upgrade Required</DialogTitle>
              <DialogDescription>
                This tool requires a higher subscription plan.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 pt-4">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>You need a <strong>{selectedTool.requiresPlan.charAt(0).toUpperCase() + selectedTool.requiresPlan.slice(1)}</strong> plan or higher.</span>
            </div>
            <div className="space-y-4 pt-4">
              <h4 className="font-medium">Tool features:</h4>
              <ul className="list-disc list-inside space-y-1">
                {selectedTool.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <DialogFooter>
              <Link href="/subscriptions">
                <Button variant="default">Upgrade Subscription</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {currentTutorial && selectedTool && (
        <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentTutorial.title}</DialogTitle>
              <DialogDescription>
                {selectedTool.name} - Tutorial
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {currentTutorial.content}
            </div>
            <DialogFooter>
              <Button onClick={() => setTutorialOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  function renderToolCards(toolsList: Tool[]) {
    return toolsList.map(tool => (
      <Card key={tool.id} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            {tool.icon}
            <div className="px-2 py-1 text-xs font-medium rounded-full bg-muted">
              {tool.requiresPlan.charAt(0).toUpperCase() + tool.requiresPlan.slice(1)}
            </div>
          </div>
          <CardTitle className="mt-2">{tool.name}</CardTitle>
          <CardDescription className="min-h-[60px]">{tool.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {tool.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between pt-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Info className="h-4 w-4 mr-1" />
                Tutorials
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{tool.name} Tutorials</DialogTitle>
                <DialogDescription>
                  Learn how to use this tool effectively
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {tool.tutorials.map(tutorial => (
                  <Button
                    key={tutorial.id}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => openTutorial(tool, tutorial)}
                  >
                    {tutorial.title}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => handleToolClick(tool)}
            disabled={!isAuthenticated || !canAccessTool(tool.requiresPlan)}
          >
            Try Now
          </Button>
        </CardFooter>
      </Card>
    ));
  }
};

export default DigitalToolsPage;