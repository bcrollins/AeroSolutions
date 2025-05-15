import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { EnhancedTooltip } from '@/components/UI/EnhancedTooltip';
import { MicroFeedback } from '@/components/UI/MicroFeedback';
import { Skeleton } from '@/components/UI/Skeleton';
import { ErrorHandler } from '@/components/UI/ErrorHandler';
import { DataVisualizer } from '@/components/UI/DataVisualizer';
import { KeyboardNavigation } from '@/components/UI/KeyboardNavigation';
import { EnhancedAccordion } from '@/components/UI/EnhancedAccordion';
import { AccessibilityPanel } from '@/components/UI/AccessibilityPanel';
import MicroAnimations, { 
  SlideIn, 
  FadeIn, 
  Float, 
  Pulse, 
  ScaleIn 
} from '@/components/UI/MicroInteractions';

export default function ComponentShowcase() {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  
  // Sample data for DataVisualizer
  const sampleChartData = [
    { label: 'AI Development', value: 65, color: '#0066cc' },
    { label: 'Design', value: 45, color: '#34C759' },
    { label: 'Marketing', value: 30, color: '#FF9500' },
    { label: 'Infrastructure', value: 50, color: '#FF2D55' },
    { label: 'Training', value: 75, color: '#5856D6' },
  ];
  
  // Sample keyboard shortcuts for KeyboardNavigation
  const keyboardShortcuts = [
    {
      key: 'k',
      modifier: 'meta' as 'meta',
      description: 'Open command palette',
      action: () => console.log('Command palette triggered'),
      category: 'Navigation',
      isGlobal: true,
    },
    {
      key: '/',
      description: 'Focus search',
      action: () => console.log('Search focused'),
      category: 'Navigation',
      isGlobal: true,
    },
    {
      key: 'h',
      description: 'Go to home',
      action: () => console.log('Home navigation triggered'),
      category: 'Navigation',
      isGlobal: true,
    },
    {
      key: 'd',
      description: 'Go to dashboard',
      action: () => console.log('Dashboard navigation triggered'),
      category: 'Navigation',
      isGlobal: true,
    },
    {
      key: 'escape',
      description: 'Close modal or dismiss notification',
      action: () => console.log('Escape pressed'),
      category: 'Interface',
      isGlobal: true,
    },
    {
      key: 'n',
      modifier: 'meta' as 'meta',
      description: 'Create new document',
      action: () => console.log('Create new document triggered'),
      category: 'Content',
      isGlobal: true,
    },
    {
      key: 's',
      modifier: 'meta' as 'meta',
      description: 'Save current work',
      action: () => console.log('Save triggered'),
      category: 'Content',
      isGlobal: true,
    },
    {
      key: 'p',
      modifier: 'meta' as 'meta',
      description: 'Print or export',
      action: () => console.log('Print/export triggered'),
      category: 'Content',
      isGlobal: true,
    },
    {
      key: 'b',
      modifier: 'meta' as 'meta',
      description: 'Toggle sidebar',
      action: () => console.log('Sidebar toggle triggered'),
      category: 'Interface',
      isGlobal: true,
    }
  ];
  
  // Sample error for ErrorHandler
  const sampleError = {
    title: 'Connection Error',
    message: 'Unable to connect to the service. Please check your network connection and try again.',
    timestamp: new Date(),
    code: 'ERR_NETWORK_FAILURE',
    severity: 'major' as 'major',
    source: 'network' as 'network',
    retry: () => setShowError(false),
    recoveryTips: [
      'Check your internet connection',
      'Refresh the page',
      'Try again in a few minutes'
    ]
  };
  
  return (
    <div className="container py-10 space-y-10">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">RXAI UI Component Library</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          An Apple-inspired design system with enhanced accessibility and user interactions
        </p>
      </header>
      
      <Tabs defaultValue="animations" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 mb-8">
          <TabsTrigger value="animations">Animations</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="loading">Loading States</TabsTrigger>
          <TabsTrigger value="errors">Error Handling</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="tooltips">Tooltips</TabsTrigger>
          <TabsTrigger value="data">Data Visualization</TabsTrigger>
          <TabsTrigger value="keyboard">Keyboard</TabsTrigger>
        </TabsList>
        
        {/* Micro-interactions Section */}
        <TabsContent value="animations" className="space-y-6">
          <h2 className="text-2xl font-bold">Micro-interactions & Animations</h2>
          <p className="text-muted-foreground mb-6">
            Subtle animations that enhance user interactions and provide visual feedback.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Slide In</CardTitle>
                <CardDescription>Elements slide into view from different directions</CardDescription>
              </CardHeader>
              <CardContent className="h-32 flex items-center justify-center">
                <SlideIn direction="right">
                  <div className="bg-primary/10 text-primary p-4 rounded-lg font-medium">
                    Slide In Example
                  </div>
                </SlideIn>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    document.querySelector('[data-animation="slide-in"]')?.classList.remove('animate-in');
                    setTimeout(() => {
                      document.querySelector('[data-animation="slide-in"]')?.classList.add('animate-in');
                    }, 10);
                  }}
                >
                  Replay Animation
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Fade In</CardTitle>
                <CardDescription>Smooth opacity transitions for subtle appearances</CardDescription>
              </CardHeader>
              <CardContent className="h-32 flex items-center justify-center">
                <FadeIn delay={0.1}>
                  <div className="bg-primary/10 text-primary p-4 rounded-lg font-medium">
                    Fade In Example
                  </div>
                </FadeIn>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    document.querySelector('[data-animation="fade-in"]')?.classList.remove('animate-in');
                    setTimeout(() => {
                      document.querySelector('[data-animation="fade-in"]')?.classList.add('animate-in');
                    }, 10);
                  }}
                >
                  Replay Animation
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Scale In</CardTitle>
                <CardDescription>Grow or shrink elements with smooth transitions</CardDescription>
              </CardHeader>
              <CardContent className="h-32 flex items-center justify-center">
                <ScaleIn>
                  <div className="bg-primary/10 text-primary p-4 rounded-lg font-medium">
                    Scale In Example
                  </div>
                </ScaleIn>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    document.querySelector('[data-animation="scale-in"]')?.classList.remove('animate-in');
                    setTimeout(() => {
                      document.querySelector('[data-animation="scale-in"]')?.classList.add('animate-in');
                    }, 10);
                  }}
                >
                  Replay Animation
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Micro-feedback Section */}
        <TabsContent value="feedback" className="space-y-6">
          <h2 className="text-2xl font-bold">Micro-Feedback Components</h2>
          <p className="text-muted-foreground mb-6">
            Contextual user feedback mechanisms to improve engagement and gather insights.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inline Feedback</CardTitle>
                <CardDescription>Embedded feedback collection directly in content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg mb-4">
                  <p className="mb-4">
                    This is an example of content that might require feedback from users.
                    The feedback component appears directly within the content flow.
                  </p>
                  
                  <MicroFeedback 
                    elementId="inline-feedback-example"
                    type="inline"
                    question="Was this explanation helpful?"
                    allowComment={true}
                    onFeedbackSubmit={(feedback) => console.log("Feedback received:", feedback)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Floating Feedback</CardTitle>
                <CardDescription>Non-intrusive feedback positioned at screen edges</CardDescription>
              </CardHeader>
              <CardContent className="h-64 relative border rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={() => {
                      const feedbackEl = document.getElementById('floating-feedback-example');
                      if (feedbackEl) {
                        feedbackEl.style.display = feedbackEl.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                  >
                    Toggle Feedback
                  </Button>
                  
                  <div id="floating-feedback-example" style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'none' }}>
                    <MicroFeedback 
                      elementId="floating-feedback-example"
                      type="floating"
                      position="bottom"
                      question="How would you rate your experience?"
                      compact={true}
                      allowComment={false}
                      onFeedbackSubmit={(feedback) => console.log("Feedback received:", feedback)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Loading States Section */}
        <TabsContent value="loading" className="space-y-6">
          <h2 className="text-2xl font-bold">Loading States & Skeletons</h2>
          <p className="text-muted-foreground mb-6">
            Optimized loading indicators and skeleton screens for improved perceived performance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Skeletons</CardTitle>
                <CardDescription>Placeholder elements that match the final content structure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Text Skeleton</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsLoading(!isLoading)}
                    >
                      {isLoading ? "Show Content" : "Show Skeleton"}
                    </Button>
                  </div>
                
                  {isLoading ? (
                    <Skeleton variant="text" count={3} />
                  ) : (
                    <div className="space-y-2">
                      <p>This is an example of actual content that would be loaded.</p>
                      <p>The skeleton preview matches the structure of this content.</p>
                      <p>This creates a smoother loading experience for users.</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <h3 className="text-sm font-medium">Card Skeleton</h3>
                  
                  {isLoading ? (
                    <Skeleton variant="card" />
                  ) : (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Card Title</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        This is an example of a card with content that would be loaded.
                      </p>
                      <div className="bg-muted h-20 rounded-md mb-2" />
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">Action</Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Article Skeleton</CardTitle>
                <CardDescription>Article loading states with heading and paragraph placeholders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Article Preview</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsLoading(!isLoading)}
                    >
                      {isLoading ? "Show Content" : "Show Skeleton"}
                    </Button>
                  </div>
                
                  {isLoading ? (
                    <Skeleton variant="article" />
                  ) : (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold">Article Title Goes Here</h2>
                      <p>
                        This is the first paragraph of the article content. It would typically
                        contain an introduction to the topic being discussed.
                      </p>
                      <p>
                        This is the second paragraph with more detailed information.
                        The skeleton preview matches this structure.
                      </p>
                      <div className="bg-muted h-40 rounded-md" />
                      <p>
                        Final paragraph with concluding thoughts or a call to action.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Error Handling Section */}
        <TabsContent value="errors" className="space-y-6">
          <h2 className="text-2xl font-bold">Error Handling Components</h2>
          <p className="text-muted-foreground mb-6">
            Consistent error states with helpful recovery options and clarity.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inline Error States</CardTitle>
                <CardDescription>Contextual error messages within the interface flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Network Error Example</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowError(!showError)}
                    >
                      {showError ? "Hide Error" : "Show Error"}
                    </Button>
                  </div>
                  
                  {showError && (
                    <ErrorHandler
                      error={sampleError}
                      variant="inline"
                      onClose={() => setShowError(false)}
                    />
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-error">Email</Label>
                    <Input
                      id="email-error"
                      className="border-red-500 focus-visible:ring-red-500"
                      placeholder="example@email.com"
                    />
                    <p className="text-sm text-red-500">
                      Please enter a valid email address
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Full Page Error</CardTitle>
                <CardDescription>Comprehensive error handling for critical failures</CardDescription>
              </CardHeader>
              <CardContent className="h-64 relative border rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={() => {
                      const errorEl = document.getElementById('fullpage-error-example');
                      if (errorEl) {
                        errorEl.style.display = errorEl.style.display === 'none' ? 'flex' : 'none';
                      }
                    }}
                  >
                    Show Full Page Error
                  </Button>
                  
                  <div
                    id="fullpage-error-example"
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 items-center justify-center"
                    style={{ display: 'none' }}
                  >
                    <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-lg">
                      <div className="flex items-start">
                        <div className="mr-4 mt-1 text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-medium mb-2">Application Error</h3>
                          <p className="text-foreground/80 mb-4">
                            We're sorry, but something went wrong. Our team has been notified
                            and is working to fix the issue.
                          </p>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Try these steps:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li className="text-sm text-foreground/80">Refresh the page</li>
                              <li className="text-sm text-foreground/80">Clear your browser cache</li>
                              <li className="text-sm text-foreground/80">Try again in a few minutes</li>
                            </ul>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-6">
                            <Button 
                              variant="default" 
                              onClick={() => {
                                document.getElementById('fullpage-error-example')!.style.display = 'none';
                              }}
                            >
                              Reload Page
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                document.getElementById('fullpage-error-example')!.style.display = 'none';
                              }}
                            >
                              Go Back
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Accessibility Section */}
        <TabsContent value="accessibility" className="space-y-6">
          <h2 className="text-2xl font-bold">Accessibility Features</h2>
          <p className="text-muted-foreground mb-6">
            Enhanced accessibility controls for inclusive user experiences.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Panel</CardTitle>
                <CardDescription>User-configurable accessibility settings</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[300px]">
                <p className="mb-4">
                  The Accessibility Panel provides users with a comprehensive set of options
                  to customize their experience, including:
                </p>
                
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Font size adjustments</li>
                  <li>High contrast mode</li>
                  <li>Grayscale mode for reduced visual stimulation</li>
                  <li>Reduced motion for users with vestibular disorders</li>
                  <li>Enhanced keyboard navigation</li>
                  <li>Screen reader optimizations</li>
                </ul>
                
                <Button
                  onClick={() => {
                    const panelEl = document.getElementById('accessibility-panel-example');
                    if (panelEl) {
                      panelEl.style.display = panelEl.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                >
                  Open Accessibility Panel
                </Button>
                
                <div id="accessibility-panel-example" style={{ display: 'none', position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px', zIndex: 1000 }}>
                  <AccessibilityPanel 
                    position="right"
                    persistent={true}
                    showLanguageOptions={true}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Accordion</CardTitle>
                <CardDescription>Fully accessible expandable sections with animations</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedAccordion type="single" collapsible>
                  <EnhancedAccordion.Item value="item-1">
                    <EnhancedAccordion.Trigger>Keyboard Navigation</EnhancedAccordion.Trigger>
                    <EnhancedAccordion.Content>
                      All components are fully navigable using keyboard controls.
                      Users can tab through interactive elements, use arrow keys for
                      navigation within components, and use Enter/Space to activate.
                    </EnhancedAccordion.Content>
                  </EnhancedAccordion.Item>
                  
                  <EnhancedAccordion.Item value="item-2">
                    <EnhancedAccordion.Trigger>Screen Reader Support</EnhancedAccordion.Trigger>
                    <EnhancedAccordion.Content>
                      Components include appropriate ARIA labels and roles to ensure
                      compatibility with screen readers. This helps users with visual
                      impairments navigate the interface effectively.
                    </EnhancedAccordion.Content>
                  </EnhancedAccordion.Item>
                  
                  <EnhancedAccordion.Item value="item-3">
                    <EnhancedAccordion.Trigger>Focus Management</EnhancedAccordion.Trigger>
                    <EnhancedAccordion.Content>
                      Enhanced focus indicators make it clear which element is currently
                      focused, improving usability for keyboard users and those with
                      motor impairments.
                    </EnhancedAccordion.Content>
                  </EnhancedAccordion.Item>
                </EnhancedAccordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Enhanced Tooltips Section */}
        <TabsContent value="tooltips" className="space-y-6">
          <h2 className="text-2xl font-bold">Enhanced Tooltips</h2>
          <p className="text-muted-foreground mb-6">
            Informative and contextual tooltips to improve user understanding.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Tooltips</CardTitle>
                <CardDescription>Simple tooltips with consistent styling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4 p-4">
                  <EnhancedTooltip content="Default tooltip">
                    <Button variant="outline">Default</Button>
                  </EnhancedTooltip>
                  
                  <EnhancedTooltip 
                    content="Information tooltip" 
                    description="Provides additional details about a feature"
                    variant="info"
                  >
                    <Button variant="outline">With Description</Button>
                  </EnhancedTooltip>
                  
                  <EnhancedTooltip 
                    content="Warning tooltip" 
                    description="Indicates a potential issue"
                    variant="warning"
                  >
                    <Button variant="outline">Warning</Button>
                  </EnhancedTooltip>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Advanced Tooltips</CardTitle>
                <CardDescription>Tooltips with rich content and interaction options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4 p-4">
                  <EnhancedTooltip 
                    content="Interactive Tooltip"
                    description="This tooltip allows user interaction and has larger hit area"
                    interactive={true}
                    size="large"
                  >
                    <Button variant="outline">Interactive</Button>
                  </EnhancedTooltip>
                  
                  <EnhancedTooltip 
                    content="Persistent Tooltip"
                    description="Stays open until dismissed by clicking the trigger again"
                    persistent={true}
                  >
                    <Button variant="outline">Persistent</Button>
                  </EnhancedTooltip>
                  
                  <EnhancedTooltip 
                    content="Position Control"
                    description="This tooltip appears to the right"
                    side="right"
                    align="start"
                  >
                    <Button variant="outline">Position</Button>
                  </EnhancedTooltip>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Data Visualization Section */}
        <TabsContent value="data" className="space-y-6">
          <h2 className="text-2xl font-bold">Data Visualization</h2>
          <p className="text-muted-foreground mb-6">
            Interactive data visualization components for accessible insights.
          </p>
          
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Visualizer</CardTitle>
                <CardDescription>Flexible chart component with multiple visualization options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <DataVisualizer
                    data={sampleChartData}
                    type="bar"
                    title="Project Resource Allocation"
                    description="Visualization of how resources are allocated across different project areas"
                    showLegend={true}
                    allowTypeChange={true}
                    animated={true}
                    onDataPointClick={(point) => console.log("Clicked on:", point)}
                  />
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <p>
                  Note: This component integrates with charting libraries like Recharts or Chart.js
                  to render different chart types. The example shown here is a placeholder.
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Keyboard Navigation Section */}
        <TabsContent value="keyboard" className="space-y-6">
          <h2 className="text-2xl font-bold">Keyboard Navigation</h2>
          <p className="text-muted-foreground mb-6">
            Enhanced keyboard shortcuts and navigation options for power users.
          </p>
          
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Shortcuts</CardTitle>
                <CardDescription>Global keyboard shortcuts for improved productivity</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  The KeyboardNavigation component provides a consistent system for keyboard shortcuts
                  throughout the application. Press <kbd className="px-2 py-1 bg-muted rounded border">?</kbd> to see all available shortcuts.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Navigation</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between text-sm">
                        <span>Command Palette</span>
                        <kbd className="px-2 py-0.5 bg-background rounded border">⌘K</kbd>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Search</span>
                        <kbd className="px-2 py-0.5 bg-background rounded border">/</kbd>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Go Home</span>
                        <kbd className="px-2 py-0.5 bg-background rounded border">h</kbd>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Content</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between text-sm">
                        <span>New Document</span>
                        <kbd className="px-2 py-0.5 bg-background rounded border">⌘N</kbd>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Save</span>
                        <kbd className="px-2 py-0.5 bg-background rounded border">⌘S</kbd>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Print/Export</span>
                        <kbd className="px-2 py-0.5 bg-background rounded border">⌘P</kbd>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Interface</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between text-sm">
                        <span>Close Modal</span>
                        <kbd className="px-2 py-0.5 bg-background rounded border">Esc</kbd>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Toggle Sidebar</span>
                        <kbd className="px-2 py-0.5 bg-background rounded border">⌘B</kbd>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Help</span>
                        <kbd className="px-2 py-0.5 bg-background rounded border">?</kbd>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={() => {
                    // This is just for demo purposes
                    alert('In a real implementation, this would integrate with the KeyboardNavigation component to show a keyboard shortcut overlay.');
                  }}>
                    View All Shortcuts
                  </Button>
                </div>
                
                {/* The actual KeyboardNavigation component would be implemented here */}
                {/* This is invisible but provides the functionality */}
                <div style={{ display: 'none' }}>
                  <KeyboardNavigation shortcuts={keyboardShortcuts} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}