import React, { useState } from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock,
  BookOpen,
  CheckCircle,
  Play,
  Award,
  Star,
  Calendar,
  Download,
  FileText,
  Info,
  Users,
  Video,
  Code,
  Laptop,
  PenTool,
  Zap,
  Lock,
  MousePointer
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface ILesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz' | 'project' | 'interactive';
  completed?: boolean;
  description?: string;
  locked?: boolean;
}

interface IModule {
  id: string;
  title: string;
  description: string;
  lessons: ILesson[];
  completed?: number;
  total?: number;
}

// Main AI Course structure with all modules and lessons
const aiCourseModules: IModule[] = [
  {
    id: 'fundamentals',
    title: 'AI Fundamentals',
    description: 'Master the core concepts and terminology of artificial intelligence to build a solid foundation for your AI journey.',
    lessons: [
      { id: 'intro', title: 'Welcome to AI Learning', duration: '10 min', type: 'video', completed: true },
      { id: 'ai-history', title: 'The Evolution of AI', duration: '25 min', type: 'video', completed: true },
      { id: 'ai-types', title: 'Types of Artificial Intelligence', duration: '20 min', type: 'video', completed: true },
      { id: 'machine-learning', title: 'Introduction to Machine Learning', duration: '30 min', type: 'video', completed: true },
      { id: 'deep-learning', title: 'Deep Learning Basics', duration: '35 min', type: 'video', completed: false },
      { id: 'ai-ethics', title: 'Ethical Considerations in AI', duration: '25 min', type: 'text', completed: false },
      { id: 'fundamentals-quiz', title: 'AI Fundamentals Quiz', duration: '15 min', type: 'quiz', completed: false }
    ],
    completed: 4,
    total: 7
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning Essentials',
    description: 'Learn the fundamentals of machine learning algorithms, data preparation, and model evaluation techniques.',
    lessons: [
      { id: 'supervised-learning', title: 'Supervised Learning Algorithms', duration: '40 min', type: 'video', completed: false },
      { id: 'unsupervised-learning', title: 'Unsupervised Learning Techniques', duration: '35 min', type: 'video', completed: false },
      { id: 'reinforcement', title: 'Reinforcement Learning Fundamentals', duration: '45 min', type: 'video', completed: false },
      { id: 'data-preprocessing', title: 'Data Preparation & Preprocessing', duration: '30 min', type: 'video', completed: false },
      { id: 'feature-engineering', title: 'Feature Engineering Techniques', duration: '35 min', type: 'video', completed: false },
      { id: 'model-evaluation', title: 'Model Evaluation & Validation', duration: '25 min', type: 'video', completed: false },
      { id: 'ml-project', title: 'Build Your First ML Model', duration: '60 min', type: 'project', completed: false },
      { id: 'ml-quiz', title: 'Machine Learning Quiz', duration: '20 min', type: 'quiz', completed: false }
    ],
    completed: 0,
    total: 8
  },
  {
    id: 'python-programming',
    title: 'Python for AI Development',
    description: 'Master the programming language most widely used in AI with hands-on exercises focused on AI applications.',
    lessons: [
      { id: 'python-basics', title: 'Python Fundamentals for AI', duration: '45 min', type: 'video', completed: false },
      { id: 'numpy-pandas', title: 'Data Manipulation with NumPy & Pandas', duration: '50 min', type: 'video', completed: false },
      { id: 'data-visualization', title: 'Data Visualization with Matplotlib & Seaborn', duration: '40 min', type: 'video', completed: false },
      { id: 'sklearn-intro', title: 'Introduction to Scikit-Learn', duration: '45 min', type: 'video', completed: false },
      { id: 'python-project-1', title: 'Data Analysis Project', duration: '60 min', type: 'project', completed: false },
      { id: 'python-project-2', title: 'Build a Prediction Model', duration: '90 min', type: 'project', completed: false },
      { id: 'python-quiz', title: 'Python for AI Quiz', duration: '20 min', type: 'quiz', completed: false }
    ],
    completed: 0,
    total: 7
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning & Neural Networks',
    description: 'Explore neural networks architectures and frameworks that power cutting-edge AI applications.',
    lessons: [
      { id: 'neural-networks', title: 'Neural Network Fundamentals', duration: '45 min', type: 'video', locked: true },
      { id: 'cnn', title: 'Convolutional Neural Networks', duration: '50 min', type: 'video', locked: true },
      { id: 'rnn-lstm', title: 'Recurrent Networks & LSTMs', duration: '55 min', type: 'video', locked: true },
      { id: 'transformers', title: 'Transformer Architectures', duration: '60 min', type: 'video', locked: true },
      { id: 'tensorflow', title: 'Building Models with TensorFlow', duration: '70 min', type: 'video', locked: true },
      { id: 'pytorch', title: 'Deep Learning with PyTorch', duration: '65 min', type: 'video', locked: true },
      { id: 'dl-project', title: 'Image Classification Project', duration: '120 min', type: 'project', locked: true },
      { id: 'dl-quiz', title: 'Deep Learning Assessment', duration: '30 min', type: 'quiz', locked: true }
    ],
    completed: 0,
    total: 8
  },
  {
    id: 'nlp',
    title: 'Natural Language Processing',
    description: 'Learn how to process, analyze and generate human language with state-of-the-art NLP techniques.',
    lessons: [
      { id: 'nlp-basics', title: 'NLP Fundamentals', duration: '40 min', type: 'video', locked: true },
      { id: 'text-processing', title: 'Text Preprocessing Techniques', duration: '35 min', type: 'video', locked: true },
      { id: 'word-embeddings', title: 'Word Embeddings & Language Models', duration: '50 min', type: 'video', locked: true },
      { id: 'sequence-models', title: 'Sequence Models for Text', duration: '55 min', type: 'video', locked: true },
      { id: 'transformers-nlp', title: 'Transformers for NLP', duration: '65 min', type: 'video', locked: true },
      { id: 'gpt-llm', title: 'Understanding LLMs & GPT', duration: '60 min', type: 'video', locked: true },
      { id: 'nlp-project', title: 'Build a Text Generation Model', duration: '100 min', type: 'project', locked: true },
      { id: 'nlp-quiz', title: 'NLP Assessment', duration: '25 min', type: 'quiz', locked: true }
    ],
    completed: 0,
    total: 8
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision',
    description: 'Master techniques for image recognition, object detection, and visual data analysis.',
    lessons: [
      { id: 'cv-intro', title: 'Introduction to Computer Vision', duration: '35 min', type: 'video', locked: true },
      { id: 'image-processing', title: 'Image Processing Fundamentals', duration: '45 min', type: 'video', locked: true },
      { id: 'object-detection', title: 'Object Detection Algorithms', duration: '55 min', type: 'video', locked: true },
      { id: 'face-recognition', title: 'Face Recognition Systems', duration: '50 min', type: 'video', locked: true },
      { id: 'semantic-segmentation', title: 'Semantic Segmentation', duration: '60 min', type: 'video', locked: true },
      { id: 'cv-applications', title: 'Real-world CV Applications', duration: '40 min', type: 'video', locked: true },
      { id: 'cv-project', title: 'Object Detection Project', duration: '110 min', type: 'project', locked: true },
      { id: 'cv-quiz', title: 'Computer Vision Assessment', duration: '30 min', type: 'quiz', locked: true }
    ],
    completed: 0,
    total: 8
  },
  {
    id: 'generative-ai',
    title: 'Generative AI & Creative Applications',
    description: 'Explore how AI can generate new content, from text and images to music and code.',
    lessons: [
      { id: 'generative-models', title: 'Introduction to Generative Models', duration: '40 min', type: 'video', locked: true },
      { id: 'gans', title: 'Generative Adversarial Networks', duration: '55 min', type: 'video', locked: true },
      { id: 'diffusion-models', title: 'Diffusion Models', duration: '60 min', type: 'video', locked: true },
      { id: 'text-to-image', title: 'Text-to-Image Generation', duration: '50 min', type: 'video', locked: true },
      { id: 'creative-text', title: 'Creative Text Generation', duration: '45 min', type: 'video', locked: true },
      { id: 'music-generation', title: 'AI Music Generation', duration: '40 min', type: 'video', locked: true },
      { id: 'generative-project', title: 'Build an Image Generator', duration: '120 min', type: 'project', locked: true },
      { id: 'generative-quiz', title: 'Generative AI Assessment', duration: '25 min', type: 'quiz', locked: true }
    ],
    completed: 0,
    total: 8
  },
  {
    id: 'ai-applications',
    title: 'AI in Real-World Applications',
    description: 'Learn how AI is transforming industries and how to apply your skills to solve real-world problems.',
    lessons: [
      { id: 'ai-healthcare', title: 'AI in Healthcare', duration: '35 min', type: 'video', locked: true },
      { id: 'ai-finance', title: 'AI in Finance & Fintech', duration: '40 min', type: 'video', locked: true },
      { id: 'ai-marketing', title: 'AI for Marketing & Sales', duration: '35 min', type: 'video', locked: true },
      { id: 'ai-manufacturing', title: 'AI in Manufacturing & IoT', duration: '45 min', type: 'video', locked: true },
      { id: 'ai-entertainment', title: 'AI in Entertainment & Media', duration: '30 min', type: 'video', locked: true },
      { id: 'ai-sustainability', title: 'AI for Sustainability', duration: '40 min', type: 'video', locked: true },
      { id: 'industry-project', title: 'Industry Application Project', duration: '150 min', type: 'project', locked: true },
      { id: 'applications-quiz', title: 'AI Applications Assessment', duration: '30 min', type: 'quiz', locked: true }
    ],
    completed: 0,
    total: 8
  },
  {
    id: 'career-development',
    title: 'AI Career Development',
    description: 'Prepare for a successful career in AI with portfolio building, interview preparation, and networking strategies.',
    lessons: [
      { id: 'ai-career-paths', title: 'AI Career Paths & Opportunities', duration: '30 min', type: 'video', locked: true },
      { id: 'portfolio-building', title: 'Building an AI Portfolio', duration: '40 min', type: 'video', locked: true },
      { id: 'resume-linkedin', title: 'Resume & LinkedIn Optimization', duration: '35 min', type: 'video', locked: true },
      { id: 'interview-prep', title: 'AI Job Interview Preparation', duration: '50 min', type: 'video', locked: true },
      { id: 'technical-challenges', title: 'Solving Technical Challenges', duration: '60 min', type: 'interactive', locked: true },
      { id: 'networking', title: 'Networking in the AI Community', duration: '25 min', type: 'video', locked: true },
      { id: 'career-project', title: 'Career Development Project', duration: '90 min', type: 'project', locked: true },
      { id: 'final-assessment', title: 'Final Course Assessment', duration: '45 min', type: 'quiz', locked: true }
    ],
    completed: 0,
    total: 8
  }
];

// Helper function to get icon based on lesson type
const getLessonTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'text':
      return <FileText className="h-4 w-4" />;
    case 'quiz':
      return <PenTool className="h-4 w-4" />;
    case 'project':
      return <Code className="h-4 w-4" />;
    case 'interactive':
      return <MousePointer className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

const AICourseContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('modules');
  const [activeModule, setActiveModule] = useState('fundamentals');
  const { isAuthenticated } = useAuth();
  
  // Calculate overall course progress
  const totalLessons = aiCourseModules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = aiCourseModules.reduce((acc, module) => acc + (module.completed || 0), 0);
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>AI Course Learning Portal | RXAI Learning Platform</title>
        <meta name="description" content="Access your AI course content, track progress, and expand your knowledge with our comprehensive learning materials." />
      </Helmet>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left sidebar - Course navigation */}
        <div className="md:w-1/4">
          <Card className="sticky top-4">
            <CardHeader className="pb-4">
              <CardTitle>AI Learning Path</CardTitle>
              <CardDescription>
                Your comprehensive AI education journey
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 pb-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Overall Progress</p>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{completedLessons} of {totalLessons} lessons</span>
                    <span className="text-xs font-medium">{progressPercentage}%</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Active since May 1, 2025</span>
                </div>
                
                {isAuthenticated ? (
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Award className="h-4 w-4 mr-2 text-green-500" />
                    <span>Premium Access Granted</span>
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Lock className="h-4 w-4 mr-2 text-orange-500" />
                    <span>Free Preview (Limited Access)</span>
                  </div>
                )}
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {aiCourseModules.map((module, index) => {
                  const isLocked = index > 3 && !isAuthenticated;
                  const moduleProgress = module.completed ? Math.round((module.completed / module.total!) * 100) : 0;
                  
                  return (
                    <AccordionItem 
                      key={module.id} 
                      value={module.id}
                      className={`border-0 ${isLocked ? 'opacity-60' : ''}`}
                    >
                      <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
                        <div className="flex items-start space-x-2 text-left">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${moduleProgress === 100 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {moduleProgress === 100 ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{module.title}</div>
                            <div className="flex items-center mt-1">
                              {isLocked ? (
                                <div className="flex items-center text-orange-500 text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  <span>Premium Content</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-500 text-xs">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  <span>{module.lessons.length} lessons</span>
                                  {moduleProgress > 0 && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>{moduleProgress}% complete</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3 pt-0">
                        <ul className="space-y-2 ml-8">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <li key={lesson.id} className="text-sm">
                              <Link href={`/courses/ai-mastery/lessons/${lesson.id}`}>
                                <div 
                                  className={`flex items-center p-2 rounded-md ${
                                    lesson.completed ? 'text-green-600 hover:bg-green-50' : 
                                    lesson.locked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {lesson.completed ? (
                                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                  ) : lesson.locked ? (
                                    <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-gray-300 mr-2 flex-shrink-0" />
                                  )}
                                  <span className="mr-auto">{lesson.title}</span>
                                  {!lesson.locked && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      {getLessonTypeIcon(lesson.type)}
                                      <span className="ml-1">{lesson.duration}</span>
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              
              {!isAuthenticated && (
                <div className="p-4 bg-blue-50 mt-4">
                  <h3 className="font-medium text-blue-900 mb-2">Unlock Full Course</h3>
                  <p className="text-sm text-blue-700 mb-3">Get access to all 9 modules, 70+ lessons, and certification.</p>
                  <Button className="w-full">
                    Upgrade to Premium
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right content area - Module content */}
        <div className="md:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="modules">Course Modules</TabsTrigger>
              <TabsTrigger value="progress">My Progress</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>
            
            <TabsContent value="modules" className="mt-0">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Master AI: Complete Course</h1>
                <p className="text-gray-600">Your comprehensive AI learning journey from basics to advanced applications</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="h-4 bg-blue-600" />
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Current Progress</h2>
                      <Badge variant="outline" className="font-normal">{progressPercentage}% Complete</Badge>
                    </div>
                    <Progress value={progressPercentage} className="h-2 mb-4" />
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{completedLessons}</p>
                        <p className="text-sm text-gray-500">Lessons Completed</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{totalLessons - completedLessons}</p>
                        <p className="text-sm text-gray-500">Lessons Remaining</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Link href="/courses/ai-mastery/lessons/machine-learning">
                        <Button className="w-full">Continue Learning</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="h-4 bg-green-600" />
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold mb-2">Course Certification</h2>
                        <p className="text-gray-600 text-sm mb-4">Complete all modules to earn your AI Mastery certificate</p>
                        <div className="flex items-center gap-2">
                          <Progress value={progressPercentage} className="h-2 flex-grow" />
                          <span className="text-sm font-medium">{progressPercentage}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      {progressPercentage === 100 ? (
                        <Button className="w-full" variant="outline">
                          View Certificate
                        </Button>
                      ) : (
                        <Button className="w-full" variant="outline" disabled>
                          Certificate Locked
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiCourseModules.map((module, index) => {
                  const isLocked = index > 3 && !isAuthenticated;
                  const moduleProgress = module.completed ? Math.round((module.completed / module.total!) * 100) : 0;
                  
                  return (
                    <motion.div
                      key={module.id}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={`h-full overflow-hidden hover:shadow-md transition-shadow duration-300 ${isLocked ? 'opacity-75' : ''}`}>
                        <div className={`h-2 ${moduleProgress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} />
                        <CardContent className="p-6">
                          <div className="flex items-center mb-4">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${moduleProgress === 100 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                              {moduleProgress === 100 ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="ml-3">
                              <h3 className="font-bold">{module.title}</h3>
                              <div className="flex items-center text-xs text-gray-500">
                                <BookOpen className="h-3 w-3 mr-1" />
                                <span>{module.lessons.length} lessons</span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</p>
                          
                          {isLocked ? (
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center text-orange-500 text-sm">
                                <Lock className="h-4 w-4 mr-1" />
                                <span>Premium Content</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-4">
                              <div className="flex justify-between mb-1 text-xs font-medium">
                                <span>Progress</span>
                                <span>{moduleProgress}%</span>
                              </div>
                              <Progress value={moduleProgress} className="h-1.5" />
                            </div>
                          )}
                          
                          <Link href={isLocked ? "/pricing" : `/courses/ai-mastery/modules/${module.id}`}>
                            <Button 
                              className="w-full" 
                              variant={isLocked ? "outline" : "default"}
                            >
                              {isLocked ? "Unlock Module" : moduleProgress > 0 ? "Continue" : "Start Module"}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="progress" className="mt-0">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">My Learning Progress</h1>
                <p className="text-gray-600">Track your journey through the AI mastery course</p>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Progress Overview</CardTitle>
                  <CardDescription>Your journey through the complete AI course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Overall Course Completion</span>
                        <span className="text-sm font-medium">{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2.5" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Lessons Completed</p>
                              <p className="text-xl font-bold">{completedLessons} / {totalLessons}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <Clock className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Learning Hours</p>
                              <p className="text-xl font-bold">12.5 hours</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Quizzes Passed</p>
                              <p className="text-xl font-bold">1 / 9</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-full">
                              <Code className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Projects Completed</p>
                              <p className="text-xl font-bold">0 / 9</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Module Progress */}
                    <div className="space-y-4 mt-6">
                      <h3 className="font-medium">Module Progress</h3>
                      {aiCourseModules.map((module, index) => {
                        const isLocked = index > 3 && !isAuthenticated;
                        const moduleProgress = module.completed ? Math.round((module.completed / module.total!) * 100) : 0;
                        
                        return (
                          <div key={module.id} className={isLocked ? 'opacity-60' : ''}>
                            <div className="flex justify-between mb-1">
                              <div className="flex items-center">
                                <span className="text-sm font-medium">{module.title}</span>
                                {isLocked && (
                                  <Lock className="h-3 w-3 ml-2 text-orange-500" />
                                )}
                              </div>
                              <span className="text-sm font-medium">{moduleProgress}%</span>
                            </div>
                            <Progress value={moduleProgress} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Learning Statistics</CardTitle>
                  <CardDescription>Your activity and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm text-gray-500 mb-1">Study Streak</h3>
                        <div className="flex items-center">
                          <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="text-2xl font-bold">3 days</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Keep learning daily to build your streak!</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm text-gray-500 mb-1">Average Daily Time</h3>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-2xl font-bold">45 minutes</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Aim for 1+ hour for optimal learning</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm text-gray-500 mb-1">Quiz Average Score</h3>
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-2xl font-bold">82%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Score at least 80% to pass each quiz</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="resources" className="mt-0">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Learning Resources</h1>
                <p className="text-gray-600">Additional materials to enhance your learning experience</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Downloadable Resources</CardTitle>
                    <CardDescription>Course materials, cheat sheets, and reference guides</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {[
                        { name: "AI Fundamentals Cheat Sheet", type: "PDF", size: "2.4 MB" },
                        { name: "Machine Learning Algorithms Guide", type: "PDF", size: "3.1 MB" },
                        { name: "Python for AI Quick Reference", type: "PDF", size: "1.8 MB" },
                        { name: "Neural Networks Visualization Guide", type: "PDF", size: "4.5 MB" },
                        { name: "AI Ethics Framework", type: "PDF", size: "1.2 MB" }
                      ].map((resource, i) => (
                        <li key={i} className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="bg-red-100 p-2 rounded-md mr-3">
                              <FileText className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{resource.name}</p>
                              <p className="text-xs text-gray-500">{resource.type} • {resource.size}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Supplementary Learning</CardTitle>
                    <CardDescription>Books, articles, and external resources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {[
                        { name: "Hands-On Machine Learning with Scikit-Learn & TensorFlow", type: "Book", author: "Aurélien Géron" },
                        { name: "Deep Learning by Ian Goodfellow", type: "Book", author: "Ian Goodfellow et al." },
                        { name: "AI Ethics: An Overview", type: "Article", author: "Stanford HAI" },
                        { name: "Python Data Science Handbook", type: "Book", author: "Jake VanderPlas" },
                        { name: "Introduction to Statistical Learning", type: "Book", author: "Gareth James et al." }
                      ].map((resource, i) => (
                        <li key={i} className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-md mr-3">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{resource.name}</p>
                              <p className="text-xs text-gray-500">{resource.type} • {resource.author}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Info className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Practice Datasets</CardTitle>
                  <CardDescription>Real-world datasets for hands-on practice</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "Image Classification Dataset", type: "Computer Vision", size: "1.2 GB", samples: "10,000 images" },
                      { name: "Sentiment Analysis Dataset", type: "NLP", size: "450 MB", samples: "25,000 reviews" },
                      { name: "Customer Churn Prediction", type: "Machine Learning", size: "120 MB", samples: "7,000 records" },
                      { name: "Time Series Financial Data", type: "Forecasting", size: "350 MB", samples: "10 years daily data" },
                      { name: "Medical Imaging Dataset", type: "Computer Vision", size: "2.4 GB", samples: "5,000 scans" },
                      { name: "Recommendation System Dataset", type: "Machine Learning", size: "800 MB", samples: "1M interactions" }
                    ].map((dataset, i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="p-4">
                          <h3 className="font-medium text-sm">{dataset.name}</h3>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Badge variant="outline" className="mr-2">{dataset.type}</Badge>
                            <span>{dataset.size}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">{dataset.samples}</p>
                          <Button size="sm" className="w-full mt-3" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="community" className="mt-0">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Learning Community</h1>
                <p className="text-gray-600">Connect with fellow learners and get support</p>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Discussion Forums</CardTitle>
                  <CardDescription>Join conversations about course topics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: "Getting started with TensorFlow", replies: 24, views: 156, last: "2 hours ago" },
                      { title: "Debugging neural networks - common issues", replies: 36, views: 210, last: "Yesterday" },
                      { title: "Career transition advice: from software dev to ML engineer", replies: 42, views: 385, last: "2 days ago" },
                      { title: "Project showcase: Image classification app", replies: 18, views: 124, last: "3 days ago" },
                      { title: "Tips for optimizing CNN training times", replies: 27, views: 196, last: "5 days ago" }
                    ].map((topic, i) => (
                      <div key={i} className="p-4 border rounded-md hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{topic.title}</h3>
                          <Badge variant="outline">{topic.replies} replies</Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{topic.views} views</span>
                          <span className="mx-2">•</span>
                          <span>Last activity: {topic.last}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Button className="w-full">View All Discussion Topics</Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Study Sessions</CardTitle>
                    <CardDescription>Join scheduled group learning sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { title: "Deep Learning Q&A", date: "May 20, 2025", time: "7:00 PM EST", host: "Dr. Sarah Chen" },
                        { title: "Python Coding Workshop", date: "May 22, 2025", time: "6:00 PM EST", host: "Michael Johnson" },
                        { title: "Computer Vision Project Review", date: "May 25, 2025", time: "5:30 PM EST", host: "Dr. James Liu" }
                      ].map((session, i) => (
                        <div key={i} className="p-4 border rounded-md">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{session.title}</h3>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{session.date}</span>
                                <span className="mx-1">•</span>
                                <span>{session.time}</span>
                              </div>
                              <p className="text-sm mt-1">Hosted by: {session.host}</p>
                            </div>
                            <Button size="sm" variant="outline">Register</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Buddies</CardTitle>
                    <CardDescription>Find peers to study and collaborate with</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Alex Johnson", progress: 45, focus: "Machine Learning", location: "New York, USA" },
                        { name: "Maria Garcia", progress: 38, focus: "Computer Vision", location: "Barcelona, Spain" },
                        { name: "Raj Patel", progress: 52, focus: "NLP", location: "Toronto, Canada" }
                      ].map((buddy, i) => (
                        <div key={i} className="flex items-center p-3 border rounded-md">
                          <Avatar className="mr-3">
                            <AvatarFallback>{buddy.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{buddy.name}</h3>
                              <Badge variant="outline">{buddy.progress}% complete</Badge>
                            </div>
                            <p className="text-sm text-gray-500">Focus: {buddy.focus}</p>
                            <p className="text-xs text-gray-500">{buddy.location}</p>
                          </div>
                          <Button size="sm" variant="ghost">Connect</Button>
                        </div>
                      ))}
                      
                      <div className="mt-2">
                        <Button className="w-full" variant="outline">Find More Study Partners</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AICourseContent;