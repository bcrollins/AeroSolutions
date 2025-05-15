import React, { useState } from 'react';
import { 
  FadeIn, 
  SlideIn, 
  ScaleIn, 
  Float, 
  Pulse, 
  Shimmer, 
  ButtonPress,
  HoverScale,
  StaggerChildren
} from '../components/UI/MicroInteractions';
import FeatureShowcase from '../components/UI/FeatureShowcase';
import TestimonialShowcase from '../components/UI/TestimonialShowcase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Check, Lightbulb, Zap } from 'lucide-react';

export default function MicroInteractionsDemo() {
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-12 pb-24">
      <div className="container mx-auto px-4">
        <header className="text-center mb-16">
          <SlideIn direction="down" duration={0.7}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              RXAI Micro-Interactions
            </h1>
          </SlideIn>
          <FadeIn delay={0.3}>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Explore our library of elegant micro-interactions designed to enhance user experiences
              with subtle motion and feedback.
            </p>
          </FadeIn>
        </header>

        <Tabs defaultValue="basics" className="mb-16">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="basics">Basic Effects</TabsTrigger>
            <TabsTrigger value="components">UI Components</TabsTrigger>
            <TabsTrigger value="showcases">Showcases</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Basic Fade In */}
              <Card>
                <CardHeader>
                  <CardTitle>Fade In</CardTitle>
                  <CardDescription>
                    Smoothly transitions elements from invisible to visible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <FadeIn>
                    <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">Fade In</span>
                    </div>
                  </FadeIn>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<FadeIn duration={0.5} delay={0}>
  <YourContent />
</FadeIn>`}
                  </code>
                </CardFooter>
              </Card>

              {/* Slide In */}
              <Card>
                <CardHeader>
                  <CardTitle>Slide In</CardTitle>
                  <CardDescription>
                    Enters the viewport with a sliding motion from any direction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <SlideIn direction="up">
                    <div className="w-24 h-24 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">Slide Up</span>
                    </div>
                  </SlideIn>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<SlideIn direction="up" duration={0.5}>
  <YourContent />
</SlideIn>`}
                  </code>
                </CardFooter>
              </Card>

              {/* Scale In */}
              <Card>
                <CardHeader>
                  <CardTitle>Scale In</CardTitle>
                  <CardDescription>
                    Grows elements from smaller to full size with a fade effect.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <ScaleIn>
                    <div className="w-24 h-24 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">Scale In</span>
                    </div>
                  </ScaleIn>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<ScaleIn scale={0.95} duration={0.5}>
  <YourContent />
</ScaleIn>`}
                  </code>
                </CardFooter>
              </Card>

              {/* Float */}
              <Card>
                <CardHeader>
                  <CardTitle>Float</CardTitle>
                  <CardDescription>
                    Creates a gentle floating motion to draw attention.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <Float amplitude={5}>
                    <div className="w-24 h-24 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">Float</span>
                    </div>
                  </Float>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<Float amplitude={5} duration={3}>
  <YourContent />
</Float>`}
                  </code>
                </CardFooter>
              </Card>

              {/* Pulse */}
              <Card>
                <CardHeader>
                  <CardTitle>Pulse</CardTitle>
                  <CardDescription>
                    Creates a subtle pulsing effect to highlight elements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <Pulse>
                    <div className="w-24 h-24 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">Pulse</span>
                    </div>
                  </Pulse>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<Pulse scale={1.05} duration={2}>
  <YourContent />
</Pulse>`}
                  </code>
                </CardFooter>
              </Card>

              {/* Shimmer */}
              <Card>
                <CardHeader>
                  <CardTitle>Shimmer</CardTitle>
                  <CardDescription>
                    Adds a glossy shimmer effect across elements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <Shimmer>
                    <div className="w-24 h-24 bg-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">Shimmer</span>
                    </div>
                  </Shimmer>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<Shimmer>
  <YourContent />
</Shimmer>`}
                  </code>
                </CardFooter>
              </Card>

              {/* Button Press */}
              <Card>
                <CardHeader>
                  <CardTitle>Button Press</CardTitle>
                  <CardDescription>
                    Adds a tactile press effect for interactive elements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <ButtonPress>
                    <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600">
                      Press Me
                    </Button>
                  </ButtonPress>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<ButtonPress scale={0.97}>
  <Button>Press Me</Button>
</ButtonPress>`}
                  </code>
                </CardFooter>
              </Card>

              {/* Hover Scale */}
              <Card>
                <CardHeader>
                  <CardTitle>Hover Scale</CardTitle>
                  <CardDescription>
                    Subtle zoom effect on hover to enhance interactivity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <HoverScale>
                    <div className="w-24 h-24 bg-teal-500 rounded-lg flex items-center justify-center cursor-pointer">
                      <span className="text-white font-bold">Hover Me</span>
                    </div>
                  </HoverScale>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<HoverScale scale={1.03}>
  <YourContent />
</HoverScale>`}
                  </code>
                </CardFooter>
              </Card>



              {/* Stagger Children */}
              <Card>
                <CardHeader>
                  <CardTitle>Stagger Children</CardTitle>
                  <CardDescription>
                    Creates a cascading animation effect for multiple elements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <StaggerChildren>
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-10 h-10 my-2 rounded-md"
                        style={{ 
                          backgroundColor: ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981'][i] 
                        }}
                      />
                    ))}
                  </StaggerChildren>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<StaggerChildren staggerDelay={0.1}>
  {children.map(child => (
    <div key={child.id}>{child}</div>
  ))}
</StaggerChildren>`}
                  </code>
                </CardFooter>
              </Card>




            </div>
          </TabsContent>

          <TabsContent value="components">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Cards</CardTitle>
                  <CardDescription>
                    Cards for highlighting product features with micro-interactions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <HoverScale>
                    <Card className="bg-primary/5 border-primary/20 h-full">
                      <CardHeader className="pb-2">
                        <div className="text-primary h-10 w-10 flex items-center justify-center rounded-full bg-primary/10">
                          <Lightbulb className="h-6 w-6" />
                        </div>
                        <CardTitle className="mt-2 text-base">AI-Powered Learning</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-500">
                        Personalized learning experiences with adaptive curriculum.
                      </CardContent>
                      <CardFooter className="pt-0">
                        <ButtonPress>
                          <Button variant="ghost" className="p-0 h-8 text-primary">
                            <span className="mr-1">Learn more</span>
                            <ArrowRight size={16} />
                          </Button>
                        </ButtonPress>
                      </CardFooter>
                    </Card>
                  </HoverScale>

                  <HoverScale>
                    <Card className="bg-blue-500/10 border-blue-500/20 h-full">
                      <CardHeader className="pb-2">
                        <div className="text-blue-500 h-10 w-10 flex items-center justify-center rounded-full bg-blue-500/10">
                          <Zap className="h-6 w-6" />
                        </div>
                        <CardTitle className="mt-2 text-base">Interactive Coding</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-500">
                        Practice with real-time feedback and guidance.
                      </CardContent>
                      <CardFooter className="pt-0">
                        <ButtonPress>
                          <Button variant="ghost" className="p-0 h-8 text-blue-500">
                            <span className="mr-1">Try now</span>
                            <ArrowRight size={16} />
                          </Button>
                        </ButtonPress>
                      </CardFooter>
                    </Card>
                  </HoverScale>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<FeatureCard
  title="AI-Powered Learning"
  description="Personalized learning paths"
  icon={<Lightbulb />}
  variant="primary"
/>`}
                  </code>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Testimonial Cards</CardTitle>
                  <CardDescription>
                    Showcase user testimonials with eye-catching animations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HoverScale>
                    <Card className="bg-primary/5 border-primary/20 overflow-hidden">
                      <Shimmer>
                        <div className="h-1 bg-gradient-to-r from-primary/60 to-primary w-full" />
                      </Shimmer>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-1 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className="h-4 w-4 text-yellow-400 fill-yellow-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <blockquote className="text-gray-700 dark:text-gray-300 italic mb-6">
                          "The AI course structure at RXAI is exceptional. The hands-on approach helped me transition from theory to practical application."
                        </blockquote>
                      </CardContent>
                      <CardFooter className="pt-0 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
                            <span className="font-medium text-sm">AM</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center">
                              Alex Morgan
                              <Check className="ml-1 w-4 h-4 text-blue-500" />
                            </div>
                            <p className="text-sm text-gray-500">Software Engineer</p>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </HoverScale>
                </CardContent>
                <CardFooter>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded w-full">
                    {`<TestimonialCard
  quote="The AI course structure at RXAI..."
  name="Alex Morgan"
  title="Software Engineer"
  rating={5}
  isVerified={true}
  variant="highlight"
/>`}
                  </code>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="showcases">
            <div className="space-y-16">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Feature Showcase</h2>
                <div className="mb-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <code className="text-sm">
                    {`<FeatureShowcase
  title="Platform Features"
  subtitle="Discover our powerful features"
  layout="grid"
  maxColumns={3}
  showFilters={true}
/>`}
                  </code>
                </div>
                <FeatureShowcase 
                  title="AI Learning Features" 
                  subtitle="Discover how our platform can enhance your AI learning journey."
                  maxColumns={3}
                  showFilters={true}
                />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Testimonial Showcase</h2>
                <div className="mb-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <code className="text-sm">
                    {`<TestimonialShowcase
  title="What Our Students Say"
  subtitle="Hear from our community"
  layout="masonry"
/>`}
                  </code>
                </div>
                <TestimonialShowcase 
                  title="Student Success Stories" 
                  subtitle="Read what our students have to say about their RXAI learning experience."
                  layout="masonry"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}