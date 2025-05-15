import React, { useState } from 'react';
import { useLocation } from 'wouter';
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
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { SectionTransition } from '@/components/UI/PageTransition';
import EnhancedCard from '@/components/UI/EnhancedCard';
import EnhancedButton from '@/components/UI/EnhancedButton';
import EnhancedTooltip from '@/components/UI/EnhancedTooltip';
import EnhancedInput from '@/components/UI/EnhancedInput';
import { EnhancedToast, useEnhancedToast } from '@/components/UI/EnhancedToast';
import ScrollToTop from '@/components/UI/ScrollToTop';
import EnhancedProgressBar from '@/components/UI/EnhancedProgressBar';
import EnhancedSelect from '@/components/UI/EnhancedSelect';
import KeyboardShortcuts, { defaultShortcuts } from '@/components/UI/KeyboardShortcuts';
import { Skeleton, TextSkeleton, CardSkeleton } from '@/components/UI/LoadingSkeleton';
import { EnhancedAccordion, EnhancedAccordionItem } from '@/components/UI/EnhancedAccordion';
import { useCommandPalette } from '@/components/UI/CommandPalette';
import { 
  Mail, 
  Info, 
  Layers, 
  Zap, 
  Eye, 
  ExternalLink, 
  Github, 
  Search, 
  GraduationCap 
} from 'lucide-react';

/**
 * Component showcase page that demonstrates all UI components
 */
export default function ComponentShowcase() {
  const [location, navigate] = useLocation();
  const enhancedToast = useEnhancedToast();
  const [selectedValue, setSelectedValue] = useState('apple');
  const { isOpen, setIsOpen } = useCommandPalette();
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [progress, setProgress] = useState(65);
  
  // Sample data for demo
  const sampleOptions = [
    { value: 'apple', label: 'Apple', description: 'The company that makes iPhones' },
    { value: 'google', label: 'Google', description: 'The search giant' },
    { value: 'amazon', label: 'Amazon', description: 'Everything from A to Z' },
    { value: 'microsoft', label: 'Microsoft', description: 'The Windows company' },
    { value: 'meta', label: 'Meta', description: 'Formerly known as Facebook' },
  ];
  
  // Calculate password strength
  const getPasswordStrength = (password: string) => {
    if (!password) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };
  
  // Progress bar demo
  const decreaseProgress = () => {
    setProgress(prev => Math.max(0, prev - 10));
  };
  
  const increaseProgress = () => {
    setProgress(prev => Math.min(100, prev + 10));
  };
  
  // Toast demo
  const showAllToasts = () => {
    enhancedToast.success({
      title: 'Success',
      description: 'Your action was completed successfully.',
      duration: 3000
    });
    
    setTimeout(() => {
      enhancedToast.error({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        duration: 3000
      });
    }, 300);
    
    setTimeout(() => {
      enhancedToast.warning({
        title: 'Warning',
        description: 'This action may have consequences.',
        duration: 3000
      });
    }, 600);
    
    setTimeout(() => {
      enhancedToast.info({
        title: 'Information',
        description: 'Here is some useful information for you.',
        duration: 3000
      });
    }, 900);
  };
  
  // Handle loading demo
  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      enhancedToast.success({
        title: 'Success',
        description: 'Action completed successfully',
      });
    }, 2000);
  };
  
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <SectionTransition>
        <h1 className="text-4xl font-bold mb-2">Component Showcase</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
          A collection of enhanced UI components for the RXAI platform.
        </p>
      </SectionTransition>
      
      <Tabs defaultValue="buttons" className="space-y-8">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:flex">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="tooltips">Tooltips</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="selects">Selects</TabsTrigger>
          <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
          <TabsTrigger value="accordions">Accordions</TabsTrigger>
          <TabsTrigger value="toasts">Toasts</TabsTrigger>
          <TabsTrigger value="keyboard">Shortcuts</TabsTrigger>
        </TabsList>
        
        {/* Button Components */}
        <TabsContent value="buttons" className="space-y-8">
          <SectionTransition transition="slide" staggerChildren>
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Buttons</CardTitle>
                <CardDescription>
                  Interactive buttons with loading states, variants, and animations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Button Variants</h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <EnhancedButton>Default</EnhancedButton>
                    <EnhancedButton variant="destructive">Destructive</EnhancedButton>
                    <EnhancedButton variant="outline">Outline</EnhancedButton>
                    <EnhancedButton variant="secondary">Secondary</EnhancedButton>
                    <EnhancedButton variant="ghost">Ghost</EnhancedButton>
                    <EnhancedButton variant="link">Link</EnhancedButton>
                    <EnhancedButton variant="premium">Premium</EnhancedButton>
                    <EnhancedButton variant="success">Success</EnhancedButton>
                    <EnhancedButton variant="warning">Warning</EnhancedButton>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Button Sizes</h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <EnhancedButton size="sm">Small</EnhancedButton>
                    <EnhancedButton>Default</EnhancedButton>
                    <EnhancedButton size="lg">Large</EnhancedButton>
                    <EnhancedButton size="icon"><Mail className="h-4 w-4" /></EnhancedButton>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Button with Loading State</h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <EnhancedButton 
                      isLoading={loading} 
                      loadingText="Loading..." 
                      onClick={simulateLoading}
                    >
                      Click to Load
                    </EnhancedButton>
                    <EnhancedButton variant="outline" isLoading={loading} onClick={simulateLoading}>
                      Submit Form
                    </EnhancedButton>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Button with Icons</h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <EnhancedButton icon={<Mail className="h-4 w-4" />}>
                      Send Email
                    </EnhancedButton>
                    <EnhancedButton 
                      icon={<ExternalLink className="h-4 w-4" />} 
                      iconPosition="right"
                      variant="outline"
                    >
                      Open Link
                    </EnhancedButton>
                    <EnhancedButton 
                      icon={<Github className="h-4 w-4" />} 
                      variant="secondary"
                    >
                      View on GitHub
                    </EnhancedButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SectionTransition>
        </TabsContent>
        
        {/* Card Components */}
        <TabsContent value="cards" className="space-y-8">
          <SectionTransition staggerChildren>
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Cards</CardTitle>
                <CardDescription>
                  Versatile card components with hover effects and animations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <EnhancedCard
                    title="Default Card"
                    description="This is a standard card with default styling."
                    image="https://images.unsplash.com/photo-1644088379091-d574269d422f?q=80&w=2073&auto=format&fit=crop"
                    footer={<Button variant="outline" className="w-full">View Details</Button>}
                  >
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Cards can contain various types of content including text, images, and actions.
                    </p>
                  </EnhancedCard>
                  
                  <EnhancedCard
                    title="Glass Card"
                    variant="glass"
                    description="A card with a glass effect background."
                    image="https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=2069&auto=format&fit=crop"
                    imageHeight={180}
                    tag="Featured"
                  >
                    <p className="text-gray-600 dark:text-gray-400">
                      Glass effect cards have subtle transparency and blur.
                    </p>
                  </EnhancedCard>
                  
                  <EnhancedCard
                    title="Floating Card"
                    variant="floating"
                    description="This card appears to float above the surface."
                    footer={<Button size="sm">Learn More</Button>}
                  >
                    <p className="text-gray-600 dark:text-gray-400">
                      Floating cards have elevation and lift on hover.
                    </p>
                  </EnhancedCard>
                  
                  <EnhancedCard
                    title="Gradient Card"
                    variant="gradient"
                    description="A card with a subtle gradient background."
                    imageHeight={160}
                    footer={<div className="flex justify-between"><span className="text-sm text-gray-500">Last updated: Today</span><Button variant="ghost" size="sm">Share</Button></div>}
                  >
                    <p className="text-gray-600 dark:text-gray-400">
                      Gradient cards use subtle color transitions for visual interest.
                    </p>
                  </EnhancedCard>
                  
                  <EnhancedCard
                    title="Bordered Card"
                    variant="bordered"
                    description="A card with distinctive border styling."
                  >
                    <p className="text-gray-600 dark:text-gray-400">
                      Bordered cards emphasize their boundaries with colored borders.
                    </p>
                  </EnhancedCard>
                  
                  <EnhancedCard
                    title="Interactive Card"
                    variant="interactive"
                    description="A card designed for interaction."
                    clickable
                    onClick={() => toast({
                      title: "Card Clicked",
                      description: "You clicked the interactive card"
                    })}
                  >
                    <p className="text-gray-600 dark:text-gray-400">
                      Click this card to trigger an action. Interactive cards are fully clickable.
                    </p>
                  </EnhancedCard>
                </div>
              </CardContent>
            </Card>
          </SectionTransition>
        </TabsContent>
        
        {/* Input Components */}
        <TabsContent value="inputs" className="space-y-8">
          <SectionTransition transition="slide">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Inputs</CardTitle>
                <CardDescription>
                  Form inputs with improved validation and interaction states.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Standard Input</h3>
                    <EnhancedInput
                      id="standard-input"
                      label="Email Address"
                      placeholder="Enter your email"
                      required
                    />
                    
                    <h3 className="text-lg font-medium">Input with Icon</h3>
                    <EnhancedInput
                      id="icon-input"
                      label="Search"
                      placeholder="Search for anything..."
                      leftIcon={<Search className="h-4 w-4" />}
                      showClearButton
                    />
                    
                    <h3 className="text-lg font-medium">Input with Hint</h3>
                    <EnhancedInput
                      id="hint-input"
                      label="Username"
                      placeholder="Choose a username"
                      hint="Username must be between 3-20 characters"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Input with Error</h3>
                    <EnhancedInput
                      id="error-input"
                      label="Phone Number"
                      placeholder="Enter phone number"
                      error="Please enter a valid phone number"
                    />
                    
                    <h3 className="text-lg font-medium">Password Input</h3>
                    <EnhancedInput
                      id="password-input"
                      label="Password"
                      placeholder="Enter password"
                      isPassword
                      value={passwordValue}
                      onTextChange={setPasswordValue}
                      strength={getPasswordStrength(passwordValue)}
                    />
                    
                    <h3 className="text-lg font-medium">Input with Floating Label</h3>
                    <EnhancedInput
                      id="floating-input"
                      label="Company Name"
                      placeholder="Enter company name"
                      animateLabel
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SectionTransition>
        </TabsContent>
        
        {/* Tooltip Components */}
        <TabsContent value="tooltips" className="space-y-8">
          <SectionTransition>
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Tooltips</CardTitle>
                <CardDescription>
                  Rich tooltips with images, descriptions, and custom content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center">
                      <EnhancedTooltip
                        title="Basic Tooltip"
                        description="This is a simple tooltip with a title and description."
                      >
                        <Button variant="outline">Hover Me</Button>
                      </EnhancedTooltip>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <EnhancedTooltip
                        title="Tooltip with Icon"
                        description="This tooltip includes an information icon indicator."
                        showIcon
                        icon={<Info className="h-4 w-4" />}
                      >
                        <Button variant="outline">With Info Icon</Button>
                      </EnhancedTooltip>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <EnhancedTooltip
                        title="Tooltip with Image"
                        description="This tooltip includes an image at the top."
                        image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29kaW5nfGVufDB8fDB8fHww"
                      >
                        <Button variant="outline">With Image</Button>
                      </EnhancedTooltip>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-center">
                      <EnhancedTooltip
                        side="bottom"
                        align="center"
                        delay={100}
                        title="Bottom Aligned"
                        description="This tooltip appears below the trigger element."
                      >
                        <Button variant="outline">Bottom Tooltip</Button>
                      </EnhancedTooltip>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <EnhancedTooltip
                        side="right"
                        title="Right Aligned"
                        description="This tooltip appears to the right of the trigger element."
                      >
                        <Button variant="outline">Right Tooltip</Button>
                      </EnhancedTooltip>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <EnhancedTooltip
                        customContent={
                          <div className="p-4">
                            <h4 className="text-base font-semibold mb-2">Custom Content</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              This tooltip contains completely custom content
                            </p>
                            <div className="flex justify-between">
                              <Button size="sm" variant="outline">Cancel</Button>
                              <Button size="sm">Confirm</Button>
                            </div>
                          </div>
                        }
                      >
                        <Button variant="outline">Custom Content</Button>
                      </EnhancedTooltip>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SectionTransition>
        </TabsContent>
        
        {/* Progress Components */}
        <TabsContent value="progress" className="space-y-8">
          <SectionTransition>
            <Card>
              <CardHeader>
                <CardTitle>Progress Indicators</CardTitle>
                <CardDescription>
                  Progress bars and indicators with various styles and animations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Standard Progress Bar</h3>
                    <EnhancedProgressBar 
                      value={progress} 
                      showLabel 
                      labelPosition="right"
                    />
                    <div className="flex justify-center gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={decreaseProgress}>Decrease</Button>
                      <Button variant="outline" size="sm" onClick={increaseProgress}>Increase</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Progress Bar Variants</h3>
                    <div className="space-y-4">
                      <EnhancedProgressBar 
                        value={75} 
                        color="#0066cc" 
                        showLabel 
                        labelPosition="top"
                        showValue
                      />
                      
                      <EnhancedProgressBar 
                        value={50} 
                        striped 
                        showLabel 
                        showValue
                        valueFormat={(value, max) => `${value}/${max}`}
                      />
                      
                      <EnhancedProgressBar 
                        value={50} 
                        indeterminate
                        height={10} 
                        color="#8A2BE2" 
                        showLabel 
                        labelPosition="top"
                      />
                      
                      <EnhancedProgressBar 
                        value={65} 
                        showLabel 
                        labelPosition="inside" 
                        height={20}
                        cornerRadius={10}
                        showValue
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SectionTransition>
        </TabsContent>
        
        {/* Select Components */}
        <TabsContent value="selects" className="space-y-8">
          <SectionTransition>
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Selects</CardTitle>
                <CardDescription>
                  Dropdown selects with improved interaction and feedback.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Standard Select</h3>
                    <EnhancedSelect
                      id="standard-select"
                      label="Choose a company"
                      options={sampleOptions}
                      value={selectedValue}
                      onChange={setSelectedValue}
                    />
                    
                    <h3 className="text-lg font-medium">Select with Error</h3>
                    <EnhancedSelect
                      id="error-select"
                      label="Choose a plan"
                      options={[
                        { value: 'basic', label: 'Basic Plan' },
                        { value: 'pro', label: 'Pro Plan' },
                        { value: 'enterprise', label: 'Enterprise Plan' },
                      ]}
                      value="basic"
                      onChange={() => {}}
                      error="Please select a different plan"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Select with Hint</h3>
                    <EnhancedSelect
                      id="hint-select"
                      label="Select Category"
                      options={[
                        { value: 'technology', label: 'Technology' },
                        { value: 'finance', label: 'Finance' },
                        { value: 'healthcare', label: 'Healthcare' },
                        { value: 'education', label: 'Education' },
                      ]}
                      value="technology"
                      onChange={() => {}}
                      hint="Choose the category that best fits your project"
                    />
                    
                    <h3 className="text-lg font-medium">Select with Icon</h3>
                    <EnhancedSelect
                      id="icon-select"
                      label="Select Feature"
                      options={[
                        { 
                          value: 'analytics', 
                          label: 'Analytics', 
                          icon: <Layers className="h-4 w-4" />,
                          description: 'Powerful data insights'
                        },
                        { 
                          value: 'automation', 
                          label: 'Automation', 
                          icon: <Zap className="h-4 w-4" />,
                          description: 'Streamline workflows'
                        },
                        { 
                          value: 'monitoring', 
                          label: 'Monitoring',
                          icon: <Eye className="h-4 w-4" />,
                          description: 'Real-time system monitoring'
                        },
                      ]}
                      value="analytics"
                      onChange={() => {}}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SectionTransition>
        </TabsContent>
        
        {/* Skeleton Components */}
        <TabsContent value="skeletons" className="space-y-8">
          <SectionTransition>
            <Card>
              <CardHeader>
                <CardTitle>Loading Skeletons</CardTitle>
                <CardDescription>
                  Skeleton loaders for different content types.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Skeletons</h3>
                    <div className="space-y-2">
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="100%" height={24} />
                      <Skeleton width="60%" height={24} />
                    </div>
                    
                    <h3 className="text-lg font-medium">Text Skeleton</h3>
                    <TextSkeleton lines={4} lastLineWidth={70} />
                    
                    <h3 className="text-lg font-medium">Avatar with Text</h3>
                    <div className="space-y-4">
                      <Skeleton variant="circular" width={64} height={64} className="mb-2" />
                      <Skeleton width="70%" height={20} className="mb-2" />
                      <Skeleton width="40%" height={16} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Card Skeleton</h3>
                    <CardSkeleton 
                      imageHeight={150} 
                      hasHeader 
                      contentLines={3} 
                      hasFooter
                    />
                    
                    <h3 className="text-lg font-medium">Animation Types</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-20">Pulse:</span>
                        <Skeleton width="100%" height={24} animation="pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-20">Wave:</span>
                        <Skeleton width="100%" height={24} animation="wave" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-20">Shimmer:</span>
                        <Skeleton width="100%" height={24} animation="shimmer" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SectionTransition>
        </TabsContent>
        
        {/* Accordion Components */}
        <TabsContent value="accordions" className="space-y-8">
          <SectionTransition>
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Accordions</CardTitle>
                <CardDescription>
                  Expandable content sections with improved animations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Default Accordion</h3>
                    <EnhancedAccordion type="single" collapsible>
                      <EnhancedAccordionItem
                        value="item-1"
                        title="What is RXAI?"
                      >
                        <p className="text-gray-600 dark:text-gray-400">
                          RXAI is the world leader in artificial intelligence education, offering cutting-edge courses, tools, and resources to help you master AI technologies.
                        </p>
                      </EnhancedAccordionItem>
                      
                      <EnhancedAccordionItem
                        value="item-2"
                        title="How do I get started?"
                      >
                        <p className="text-gray-600 dark:text-gray-400">
                          Getting started is easy! Simply create an account, choose a course or tool that interests you, and begin your AI learning journey. We offer both free and premium content to suit your needs.
                        </p>
                      </EnhancedAccordionItem>
                      
                      <EnhancedAccordionItem
                        value="item-3"
                        title="What payment options are available?"
                      >
                        <p className="text-gray-600 dark:text-gray-400">
                          We accept all major credit cards, PayPal, and cryptocurrency payments. Our subscriptions can be paid monthly or annually, with annual plans offering significant savings.
                        </p>
                      </EnhancedAccordionItem>
                    </EnhancedAccordion>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Card Style Accordion</h3>
                    <EnhancedAccordion type="multiple" variant="card">
                      <EnhancedAccordionItem
                        value="feature-1"
                        title="Interactive Learning"
                        description="Engage with hands-on exercises"
                        icon={<Zap className="h-5 w-5 text-blue-500" />}
                      >
                        <p className="text-gray-600 dark:text-gray-400">
                          Our interactive learning approach ensures you gain practical experience alongside theoretical knowledge. Complete coding challenges, build real AI projects, and receive instant feedback.
                        </p>
                      </EnhancedAccordionItem>
                      
                      <EnhancedAccordionItem
                        value="feature-2"
                        title="Expert Instructors"
                        description="Learn from industry leaders"
                        icon={<Layers className="h-5 w-5 text-purple-500" />}
                        highlight
                      >
                        <p className="text-gray-600 dark:text-gray-400">
                          All our courses are taught by experienced AI practitioners and researchers from top tech companies and academic institutions. Gain insights from experts who are shaping the future of AI.
                        </p>
                      </EnhancedAccordionItem>
                      
                      <EnhancedAccordionItem
                        value="feature-3"
                        title="Certification"
                        description="Earn recognized credentials"
                        icon={<GraduationCap className="h-5 w-5 text-green-500" />}
                        badge={<span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-100">Popular</span>}
                      >
                        <p className="text-gray-600 dark:text-gray-400">
                          Upon course completion, receive industry-recognized certifications that demonstrate your AI expertise to employers. Our certificates are valued by leading tech companies worldwide.
                        </p>
                      </EnhancedAccordionItem>
                    </EnhancedAccordion>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SectionTransition>
        </TabsContent>
        
        {/* Toast Components */}
        <TabsContent value="toasts" className="space-y-8">
          <SectionTransition>
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Toasts</CardTitle>
                <CardDescription>
                  Notification toasts with improved visuals and animations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Toast Variants</h3>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => enhancedToast.success({
                          title: 'Success',
                          description: 'Action completed successfully.',
                        })}
                        variant="outline"
                        className="w-full"
                      >
                        Show Success Toast
                      </Button>
                      
                      <Button 
                        onClick={() => enhancedToast.error({
                          title: 'Error',
                          description: 'An error occurred. Please try again.',
                        })}
                        variant="outline"
                        className="w-full"
                      >
                        Show Error Toast
                      </Button>
                      
                      <Button 
                        onClick={() => enhancedToast.warning({
                          title: 'Warning',
                          description: 'This action may have consequences.',
                        })}
                        variant="outline"
                        className="w-full"
                      >
                        Show Warning Toast
                      </Button>
                      
                      <Button 
                        onClick={() => enhancedToast.info({
                          title: 'Information',
                          description: 'Here is some useful information for you.',
                        })}
                        variant="outline"
                        className="w-full"
                      >
                        Show Info Toast
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Toast with Action</h3>
                    <Button 
                      onClick={() => enhancedToast.toast({
                        title: 'New Message',
                        description: 'You have a new message from John Doe.',
                        action: <Button size="sm">View</Button>,
                      })}
                      variant="outline"
                      className="w-full"
                    >
                      Toast with Action Button
                    </Button>
                    
                    <h3 className="text-lg font-medium">Toast with Custom Duration</h3>
                    <Button 
                      onClick={() => enhancedToast.info({
                        title: 'Custom Duration',
                        description: 'This toast will disappear in 10 seconds.',
                        duration: 10000,
                      })}
                      variant="outline"
                      className="w-full"
                    >
                      Show Long Duration Toast
                    </Button>
                    
                    <h3 className="text-lg font-medium">Show All Toast Types</h3>
                    <Button 
                      onClick={showAllToasts}
                      variant="default"
                      className="w-full"
                    >
                      Show All Toast Types
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SectionTransition>
        </TabsContent>
        
        {/* Keyboard Shortcuts */}
        <TabsContent value="keyboard" className="space-y-8">
          <SectionTransition>
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Shortcuts</CardTitle>
                <CardDescription>
                  Keyboard-centric navigation and controls.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Keyboard Shortcuts Help</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Display available keyboard shortcuts in a dialog.
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <KeyboardShortcuts groups={defaultShortcuts}>
                        <Button>
                          View Keyboard Shortcuts
                        </Button>
                      </KeyboardShortcuts>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Command Palette</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Access the command palette for quick navigation and actions (Press Cmd+K or Ctrl+K).
                    </p>
                    
                    <Button onClick={() => setIsOpen(true)}>
                      Open Command Palette
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SectionTransition>
        </TabsContent>
      </Tabs>
      
      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
}