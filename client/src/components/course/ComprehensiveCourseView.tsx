import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock,
  BookOpen,
  Play,
  FileText,
  CheckCircle,
  Sparkles,
  Star,
  Calendar,
  Download,
  Code,
  Database,
  ExternalLink,
  PenTool,
  Video,
  Lock,
  Award,
  Users,
  CheckSquare,
  BookMarked
} from 'lucide-react';
import { motion } from 'framer-motion';
import { aiCourseStructure, CourseModule, Lesson, Resource } from '@/data/courseStructure';
import useRecommendationTracker from '@/hooks/useRecommendationTracker';
import { useAuth } from '@/hooks/useAuth';

// Component for a resource item
const ResourceItem = ({ resource, isLocked }: { resource: Resource; isLocked: boolean }) => {
  // Map resource type to appropriate icon
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'dataset': return <Database className="h-4 w-4" />;
      case 'link': return <ExternalLink className="h-4 w-4" />;
      case 'notebook': return <PenTool className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };
  
  return (
    <div className={`flex items-center justify-between p-2 rounded-md ${isLocked ? 'bg-gray-50' : 'bg-blue-50'}`}>
      <div className="flex items-center">
        <div className={`p-1.5 rounded-full mr-2 ${isLocked ? 'bg-gray-200' : 'bg-blue-100'}`}>
          {getResourceIcon(resource.type)}
        </div>
        <div>
          <p className="text-sm font-medium line-clamp-1">{resource.title}</p>
          <p className="text-xs text-gray-500">
            {resource.type.toUpperCase()} • {resource.isRequired ? 'Required' : 'Supplemental'}
          </p>
        </div>
      </div>
      <Button size="sm" variant="ghost" disabled={isLocked}>
        {isLocked ? <Lock className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      </Button>
    </div>
  );
};

// Component for a lesson item
const LessonItem = ({ lesson, moduleIndex, lessonIndex, isLocked, isPremium }: {
  lesson: Lesson;
  moduleIndex: number;
  lessonIndex: number;
  isLocked: boolean;
  isPremium: boolean;
}) => {
  // Map content type to appropriate icon
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <BookOpen className="h-4 w-4" />;
      case 'interactive': return <PenTool className="h-4 w-4" />;
      case 'quiz': return <CheckSquare className="h-4 w-4" />;
      case 'project': return <Code className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className={`border rounded-md overflow-hidden mb-3 ${isLocked ? 'border-gray-200' : 'border-blue-200'}`}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
            {lessonIndex + 1}
          </div>
          <div>
            <h4 className="font-medium">
              {lesson.title}
              {lesson.isPreview && (
                <Badge variant="outline" className="ml-2 font-normal">Preview</Badge>
              )}
            </h4>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <div className="flex items-center mr-3">
                {getContentIcon(lesson.contentType)}
                <span className="ml-1">{lesson.contentType.charAt(0).toUpperCase() + lesson.contentType.slice(1)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{lesson.durationMinutes} min</span>
              </div>
              {isPremium && !lesson.isPreview && (
                <div className="flex items-center ml-3">
                  <Lock className="h-4 w-4 mr-1" />
                  <span>Premium</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button size="sm" variant={lesson.isPreview || !isLocked ? "default" : "outline"} disabled={isLocked && !lesson.isPreview}>
          {isLocked && !lesson.isPreview ? 
            <Lock className="h-4 w-4 mr-2" /> : 
            <Play className="h-4 w-4 mr-2" />
          }
          {lesson.isPreview || !isLocked ? "Start" : "Locked"}
        </Button>
      </div>
      
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="bg-gray-50 p-3 border-t">
          <p className="text-sm font-medium mb-2">Lesson Resources</p>
          <div className="space-y-2">
            {lesson.resources.map((resource) => (
              <ResourceItem 
                key={resource.id} 
                resource={resource} 
                isLocked={isLocked && !lesson.isPreview} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for a module item in the curriculum
const ModuleItem = ({ module, index, isPremium }: { 
  module: CourseModule; 
  index: number; 
  isPremium: boolean; 
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <AccordionItem value={module.id} className="border rounded-md mb-4 overflow-hidden">
      <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 transition-all duration-300">
        <div className="flex items-center text-left">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mr-3">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{module.title}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <div className="flex items-center mr-3">
                <Clock className="h-4 w-4 mr-1" />
                <span>{module.durationHours} hours</span>
              </div>
              <div className="flex items-center mr-3">
                <BookOpen className="h-4 w-4 mr-1" />
                <span>{module.lessons.length} lessons</span>
              </div>
              <Badge className="capitalize ml-1">{module.skillLevel}</Badge>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <p className="text-gray-600 mb-4">{module.description}</p>
        
        {module.learningOutcomes && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">What you'll learn:</h4>
            <ul className="space-y-1">
              {module.learningOutcomes.map((outcome, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {module.prerequisites && module.prerequisites.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Prerequisites:</h4>
            <ul className="space-y-1">
              {module.prerequisites.map((prereq, i) => (
                <li key={i} className="flex items-start">
                  <BookMarked className="h-4 w-4 text-orange-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">{prereq}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <h4 className="font-medium mb-3">Module Lessons:</h4>
        <div className="space-y-1">
          {module.lessons.map((lesson, lessonIndex) => (
            <LessonItem 
              key={lesson.id} 
              lesson={lesson} 
              moduleIndex={index} 
              lessonIndex={lessonIndex} 
              isLocked={isPremium && !isAuthenticated}
              isPremium={isPremium}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const ComprehensiveCourseView = () => {
  const [activeTab, setActiveTab] = useState('curriculum');
  const { trackCourseView } = useRecommendationTracker();
  const { isAuthenticated } = useAuth();
  
  // Course metadata
  const courseMetadata = {
    id: "master-ai",
    title: "Master AI: From Fundamentals to Advanced Applications",
    description: "A comprehensive program covering the full spectrum of artificial intelligence concepts, technologies, and applications. Whether you're a beginner or experienced professional, this course will elevate your AI skills to the next level.",
    price: 199.99,
    regularPrice: 499.99,
    discount: 60,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    rating: 4.8,
    ratingCount: 2345,
    studentsCount: 12500,
    lastUpdated: "2025-05-01",
    language: "English",
    certificate: true,
    instructor: {
      name: "Dr. Sarah Collins",
      title: "AI Research Lead & Former Google AI Scientist",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      bio: "Dr. Collins holds a PhD in Computer Science with a specialization in Machine Learning from Stanford University. With over 15 years of experience in AI research and development at top tech companies, she brings practical insights and cutting-edge knowledge to her teaching."
    }
  };

  // Track course view
  React.useEffect(() => {
    trackCourseView(courseMetadata.id);
  }, [courseMetadata.id, trackCourseView]);
  
  // Calculate total course stats
  const totalLessons = aiCourseStructure.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalHours = aiCourseStructure.reduce((acc, module) => acc + module.durationHours, 0);
  const totalProjects = aiCourseStructure.reduce((acc, module) => 
    acc + module.lessons.filter(lesson => lesson.contentType === 'project').length, 0);
  
  // Preview content details
  const previewCount = aiCourseStructure.reduce((acc, module) => 
    acc + module.lessons.filter(lesson => lesson.isPreview).length, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{courseMetadata.title} | AI Learning Platform</title>
        <meta name="description" content={courseMetadata.description} />
      </Helmet>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-3">{courseMetadata.title}</h1>
            
            <div className="flex items-center space-x-1 text-yellow-500 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(courseMetadata.rating) ? 'fill-current' : ''}`} />
              ))}
              <span className="text-gray-700 ml-2">({courseMetadata.ratingCount} ratings)</span>
            </div>
            
            <p className="text-gray-600 text-lg">{courseMetadata.description}</p>
            
            <div className="flex flex-wrap items-center mt-4 text-sm text-gray-600">
              <div className="flex items-center mr-6 mb-2">
                <Users className="h-4 w-4 mr-1" />
                <span>{courseMetadata.studentsCount.toLocaleString()} students enrolled</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Last updated: {courseMetadata.lastUpdated}</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <BookOpen className="h-4 w-4 mr-1" />
                <span>{totalLessons} lessons</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>{totalHours} hours of content</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <Code className="h-4 w-4 mr-1" />
                <span>{totalProjects} hands-on projects</span>
              </div>
              {courseMetadata.certificate && (
                <div className="flex items-center mb-2">
                  <Award className="h-4 w-4 mr-1" />
                  <span>Certificate of completion</span>
                </div>
              )}
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="w-full">
              <TabsTrigger value="curriculum" className="flex-1">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor" className="flex-1">Instructor</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
              <TabsTrigger value="faq" className="flex-1">FAQ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum" className="pt-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3">Course Curriculum</h2>
                <p className="text-gray-600">
                  This comprehensive AI course is structured into {aiCourseStructure.length} modules, covering 
                  everything from the foundations of AI to cutting-edge applications and strategic implementation.
                </p>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {aiCourseStructure.map((module, index) => (
                  <ModuleItem 
                    key={module.id} 
                    module={module} 
                    index={index} 
                    isPremium={index > 0} // First module is free, rest are premium
                  />
                ))}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="instructor" className="pt-6">
              <div className="bg-gray-50 rounded-lg p-6 border">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={courseMetadata.instructor.avatar} />
                    <AvatarFallback>{courseMetadata.instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold">{courseMetadata.instructor.name}</h2>
                    <p className="text-blue-600 mb-3">{courseMetadata.instructor.title}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{courseMetadata.rating} Instructor Rating</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-500 mr-1" />
                        <span className="font-medium">{courseMetadata.studentsCount.toLocaleString()} Students</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-green-500 mr-1" />
                        <span className="font-medium">5 Courses</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600">{courseMetadata.instructor.bio}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-6">
              <div className="bg-gray-50 rounded-lg p-6 border mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600">{courseMetadata.rating}</div>
                    <div className="flex items-center justify-center space-x-1 text-yellow-500 my-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < Math.round(courseMetadata.rating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{courseMetadata.ratingCount} ratings</div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      // Calculate percentage for each star rating (example distribution)
                      const percentages = { 5: 68, 4: 20, 3: 8, 2: 3, 1: 1 };
                      const percent = percentages[star as keyof typeof percentages];
                      
                      return (
                        <div key={star} className="flex items-center">
                          <div className="flex items-center w-20 justify-end mr-3">
                            <span className="text-sm font-medium mr-1">{star}</span>
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          </div>
                          <div className="flex-1">
                            <Progress value={percent} className="h-2" />
                          </div>
                          <div className="w-12 text-xs text-gray-500 text-right ml-2">
                            {percent}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Sample reviews */}
              <div className="space-y-6">
                {[
                  {
                    name: "Michael J.",
                    avatar: "M",
                    rating: 5,
                    date: "April 25, 2025",
                    review: "This course completely transformed my understanding of AI. The practical projects were invaluable, and Dr. Collins explains complex concepts with remarkable clarity. I've already started applying what I've learned to real-world problems at work."
                  },
                  {
                    name: "Lisa T.",
                    avatar: "L",
                    rating: 5,
                    date: "March 17, 2025",
                    review: "As someone with a non-technical background, I was worried this course might be too advanced. However, the instructors did an amazing job breaking down complex topics. The progression from basics to advanced applications was perfect. Highly recommend!"
                  },
                  {
                    name: "David K.",
                    avatar: "D",
                    rating: 4,
                    date: "February 10, 2025",
                    review: "Excellent content and structure. I particularly enjoyed the LLM and Generative AI modules as they cover the most current technologies. The hands-on projects were challenging but extremely beneficial for learning. My only suggestion would be to add more content on AI ethics."
                  }
                ].map((review, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>{review.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{review.name}</p>
                          <span className="mx-2">•</span>
                          <div className="flex space-x-1 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{review.date}</p>
                        <p className="text-gray-700">{review.review}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  View All Reviews
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="faq" className="pt-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                
                <Accordion type="single" collapsible className="w-full">
                  {[
                    {
                      question: "Do I need prior programming experience for this course?",
                      answer: "While some modules (especially those involving hands-on ML and deep learning) require basic programming knowledge, the course starts with fundamentals that are accessible to beginners. Python programming basics are introduced as needed, and additional resources are provided to help you get up to speed if necessary."
                    },
                    {
                      question: "How long do I have access to the course?",
                      answer: "Once enrolled, you have lifetime access to the course content, including all future updates and additional resources. You can learn at your own pace and revisit materials whenever you need."
                    },
                    {
                      question: "Is the certificate recognized by employers?",
                      answer: "Yes, our certificates are recognized by many employers in the tech industry. The certificate demonstrates your proficiency in AI concepts and applications, which is valuable for career advancement in data science, machine learning, and AI-related roles."
                    },
                    {
                      question: "What hardware requirements are there for the practical exercises?",
                      answer: "For most exercises, a standard laptop or desktop computer is sufficient. For the deep learning modules, we provide alternatives including Colab notebooks that use cloud GPUs, so you don't need specialized hardware. Detailed setup instructions are provided at the beginning of each module."
                    },
                    {
                      question: "Can I get a refund if the course doesn't meet my expectations?",
                      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with the course, you can request a full refund within 30 days of enrollment."
                    },
                    {
                      question: "Is there any support available if I get stuck?",
                      answer: "Absolutely! We have a dedicated Q&A forum where instructors and teaching assistants respond to questions, usually within 24-48 hours. You'll also have access to our community of learners who often help each other solve problems."
                    }
                  ].map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`} className="border rounded-md mb-2">
                      <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <p className="text-gray-600">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar - 1/3 width on desktop, full width on mobile */}
        <div>
          <Card className="sticky top-4 overflow-hidden">
            <div className="relative">
              <img 
                src={courseMetadata.image} 
                alt={courseMetadata.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all duration-300 cursor-pointer">
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-3xl font-bold">${courseMetadata.price}</div>
                  <Badge variant="destructive">{courseMetadata.discount}% off</Badge>
                </div>
                <div className="flex items-center mb-4">
                  <span className="text-gray-500 line-through mr-2">${courseMetadata.regularPrice}</span>
                  <span className="text-xs text-gray-500">Sale ends in 2 days</span>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button className="w-full mb-3 py-6 text-lg">
                    {isAuthenticated ? 'Enroll Now' : 'Get Started'}
                  </Button>
                </motion.div>
                <Button variant="outline" className="w-full mb-6">Start Free Preview</Button>
                
                <div className="text-center text-sm text-gray-500 mb-4">
                  <p>30-Day Money-Back Guarantee</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">This course includes:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Video className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{totalHours} hours on-demand video</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{totalLessons} lessons</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Download className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">100+ downloadable resources</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Code className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{totalProjects} hands-on projects</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Award className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Certificate of completion</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Sparkles className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{previewCount} free preview lessons</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-3">Share this course</h3>
                <div className="flex justify-center space-x-3">
                  {['Twitter', 'Facebook', 'LinkedIn', 'Email'].map((platform) => (
                    <Button key={platform} variant="outline" size="sm" className="rounded-full">
                      {platform}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveCourseView;