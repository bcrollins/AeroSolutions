import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Clock, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  PlaySquare,
  Download,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Lightbulb,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import InteractiveQuiz from './InteractiveQuiz';
import { useAuth } from '@/hooks/useAuth';

interface LessonContentProps {
  moduleId: string;
  lessonId: string;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Sample lesson data - would be replaced by API call or data from props
const sampleLessonData = {
  id: 'intro-ai',
  title: 'Introduction to Artificial Intelligence',
  duration: '25 min',
  type: 'video',
  description: 'This lesson introduces the fundamental concepts of artificial intelligence, its history, and its applications in the modern world.',
  videoUrl: 'https://www.youtube.com/embed/JMUxmLyrhSk',
  content: `
  <h2>What is Artificial Intelligence?</h2>
  <p>Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. The term can also be applied to any machine that exhibits traits associated with a human mind such as learning and problem-solving.</p>
  
  <h3>Key Concepts in AI</h3>
  <p>AI encompasses several key concepts:</p>
  <ul>
    <li><strong>Machine Learning</strong>: A subset of AI that provides systems the ability to automatically learn and improve from experience without being explicitly programmed.</li>
    <li><strong>Neural Networks</strong>: Computing systems inspired by the biological neural networks that constitute animal brains.</li>
    <li><strong>Deep Learning</strong>: A subset of machine learning that uses neural networks with many layers (hence "deep") to analyze various factors of data.</li>
    <li><strong>Natural Language Processing</strong>: The ability of a computer program to understand human language as it is spoken.</li>
    <li><strong>Computer Vision</strong>: The ability to analyze and understand images.</li>
  </ul>
  
  <h3>Brief History of AI</h3>
  <p>The concept of artificial intelligence dates back to ancient history with myths, stories, and rumors of artificial beings endowed with intelligence or consciousness by master craftsmen. However, the field of AI as we understand it today began to take shape in the mid-20th century.</p>
  
  <p>Here are key milestones in AI development:</p>
  <ul>
    <li><strong>1950</strong>: Alan Turing publishes "Computing Machinery and Intelligence," proposing the Turing Test as a measure of machine intelligence.</li>
    <li><strong>1956</strong>: The term "artificial intelligence" is coined at the Dartmouth Conference, the first AI conference.</li>
    <li><strong>1960s</strong>: Early AI programs demonstrate basic human reasoning.</li>
    <li><strong>1970s-80s</strong>: AI winter - disappointment in AI's progress leads to reduced funding.</li>
    <li><strong>1990s</strong>: Revival of AI through machine learning approaches.</li>
    <li><strong>2010s</strong>: Deep learning breakthroughs and practical applications in speech recognition, image recognition, and natural language processing.</li>
    <li><strong>Present</strong>: Widespread adoption of AI in various industries, rise of large language models, and increasing focus on AI ethics and governance.</li>
  </ul>
  
  <h3>AI Applications in the Modern World</h3>
  <p>Today, AI is used in numerous fields:</p>
  <ul>
    <li><strong>Healthcare</strong>: Disease diagnosis, drug discovery, personalized treatment plans</li>
    <li><strong>Finance</strong>: Fraud detection, algorithmic trading, risk assessment</li>
    <li><strong>Transportation</strong>: Self-driving cars, traffic management, route optimization</li>
    <li><strong>Customer Service</strong>: Chatbots, recommendation systems</li>
    <li><strong>Manufacturing</strong>: Quality control, predictive maintenance, supply chain optimization</li>
    <li><strong>Entertainment</strong>: Content recommendation, game AI, content creation</li>
  </ul>
  
  <h3>Types of AI</h3>
  <p>AI can be categorized based on its capabilities:</p>
  <ul>
    <li><strong>Narrow or Weak AI</strong>: Designed to perform a narrow task (e.g., facial recognition).</li>
    <li><strong>General or Strong AI</strong>: A hypothetical AI that can perform any intellectual task that a human being can do.</li>
    <li><strong>Superintelligent AI</strong>: An intellect that is much smarter than the best human brains in practically every field.</li>
  </ul>
  
  <p>Currently, all existing AI systems are narrow AI. General AI remains a theoretical concept, and superintelligent AI is purely speculative at this point.</p>
  
  <h3>AI Ethics and Challenges</h3>
  <p>As AI becomes more prevalent, several ethical concerns and challenges arise:</p>
  <ul>
    <li><strong>Bias and Fairness</strong>: AI systems can perpetuate and amplify existing biases in data.</li>
    <li><strong>Privacy</strong>: AI systems often require vast amounts of data, raising privacy concerns.</li>
    <li><strong>Transparency</strong>: Some AI systems are "black boxes," making it difficult to understand how they reach decisions.</li>
    <li><strong>Job Displacement</strong>: AI automation may replace certain jobs while creating others.</li>
    <li><strong>Security</strong>: AI systems can be vulnerable to adversarial attacks or misuse.</li>
    <li><strong>Accountability</strong>: Determining responsibility when AI systems cause harm.</li>
  </ul>
  
  <h3>Conclusion</h3>
  <p>Artificial Intelligence is transforming our world in profound ways. Understanding its basic concepts, history, applications, and challenges is essential for anyone looking to navigate or contribute to this rapidly evolving field.</p>
  
  <p>In the following lessons, we'll dive deeper into specific areas of AI, starting with machine learning fundamentals.</p>
  `,
  resources: [
    {
      id: 'resource-1',
      title: 'AI Fundamentals Glossary',
      type: 'pdf',
      url: '/resources/ai-glossary.pdf'
    },
    {
      id: 'resource-2',
      title: 'AI History Timeline',
      type: 'pdf',
      url: '/resources/ai-timeline.pdf'
    },
    {
      id: 'resource-3',
      title: 'Recommended Reading List',
      type: 'pdf',
      url: '/resources/ai-reading-list.pdf'
    }
  ],
  quiz: {
    title: 'Introduction to AI Quiz',
    description: 'Test your understanding of AI fundamentals',
    questions: [
      {
        id: 'q1',
        question: 'What is the primary goal of artificial intelligence?',
        options: [
          { id: 'q1-a', text: 'To replace human workers in all industries', isCorrect: false, explanation: 'AI aims to augment human capabilities, not necessarily replace humans entirely.' },
          { id: 'q1-b', text: 'To simulate human intelligence in machines', isCorrect: true, explanation: 'AI is fundamentally about creating systems that can perform tasks that would typically require human intelligence.' },
          { id: 'q1-c', text: 'To create sentient machines with consciousness', isCorrect: false, explanation: 'Creating consciousness is not the primary goal of AI research, though some philosophical discussions do involve this topic.' },
          { id: 'q1-d', text: 'To automate only repetitive manual tasks', isCorrect: false, explanation: 'While automation is an application of AI, it extends beyond just repetitive manual tasks to include complex cognitive tasks.' }
        ],
        explanation: 'Artificial Intelligence aims to create systems that can perform tasks requiring human-like intelligence, such as reasoning, learning, problem-solving, perception, and language understanding.',
        difficulty: 'beginner',
        points: 10
      },
      {
        id: 'q2',
        question: 'When was the term "artificial intelligence" officially coined?',
        options: [
          { id: 'q2-a', text: '1943', isCorrect: false },
          { id: 'q2-b', text: '1950', isCorrect: false },
          { id: 'q2-c', text: '1956', isCorrect: true },
          { id: 'q2-d', text: '1965', isCorrect: false }
        ],
        explanation: 'The term "artificial intelligence" was coined at the Dartmouth Conference in 1956, which is considered the founding event of AI as a field.',
        difficulty: 'beginner',
        points: 10
      },
      {
        id: 'q3',
        question: 'Which of the following is NOT a subset of AI?',
        options: [
          { id: 'q3-a', text: 'Machine Learning', isCorrect: false },
          { id: 'q3-b', text: 'Deep Learning', isCorrect: false },
          { id: 'q3-c', text: 'Cloud Computing', isCorrect: true },
          { id: 'q3-d', text: 'Natural Language Processing', isCorrect: false }
        ],
        explanation: 'Cloud Computing is a technology for delivering computing services over the internet, not a subset of AI. Machine Learning, Deep Learning, and Natural Language Processing are all fields within AI.',
        difficulty: 'beginner',
        points: 10
      },
      {
        id: 'q4',
        question: 'What is Narrow AI?',
        options: [
          { id: 'q4-a', text: 'AI that can perform any intellectual task that a human can', isCorrect: false },
          { id: 'q4-b', text: 'AI designed to perform a specific task', isCorrect: true },
          { id: 'q4-c', text: 'AI with a physical form that resembles humans', isCorrect: false },
          { id: 'q4-d', text: 'AI that has consciousness and self-awareness', isCorrect: false }
        ],
        explanation: 'Narrow AI (also called Weak AI) is designed to perform a specific task, such as facial recognition or voice assistants. All current AI systems are considered Narrow AI.',
        difficulty: 'beginner',
        points: 10
      },
      {
        id: 'q5',
        question: 'Which ethical challenge involves AI systems reflecting human prejudices present in training data?',
        options: [
          { id: 'q5-a', text: 'Transparency', isCorrect: false },
          { id: 'q5-b', text: 'Privacy', isCorrect: false },
          { id: 'q5-c', text: 'Bias', isCorrect: true },
          { id: 'q5-d', text: 'Job displacement', isCorrect: false }
        ],
        explanation: 'Bias in AI occurs when systems reflect or amplify human prejudices present in their training data, leading to unfair or discriminatory outcomes for certain groups.',
        difficulty: 'intermediate',
        points: 15
      }
    ],
    passThreshold: 70
  },
  notes: '',
  completed: false,
  nextLessonId: 'ai-history',
  previousLessonId: null
};

const LessonContent: React.FC<LessonContentProps> = ({
  moduleId,
  lessonId,
  onComplete,
  onNext,
  onPrevious,
  hasNext = true,
  hasPrevious = true
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [lessonData, setLessonData] = useState(sampleLessonData);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0, passed: false });
  const [lessonNotes, setLessonNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // In a real app, you would fetch the lesson data based on moduleId and lessonId
  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      // This would be replaced with actual API call
      setLessonData(sampleLessonData);
      setLoading(false);
    }, 500);
  }, [moduleId, lessonId]);

  // Save notes when they change
  useEffect(() => {
    if (lessonNotes !== lessonData.notes) {
      // In a real app, you would save this to a database
      console.log('Saving notes:', lessonNotes);
    }
  }, [lessonNotes, lessonData.notes]);

  // Mark lesson as completed
  const markAsCompleted = () => {
    // In a real app, you would update the user's progress
    toast({
      title: "Lesson completed!",
      description: "Your progress has been updated.",
      duration: 3000
    });

    if (onComplete) {
      onComplete();
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (score: number, totalPoints: number, passed: boolean) => {
    setQuizCompleted(true);
    setQuizScore({ score, total: totalPoints, passed });

    toast({
      title: passed ? "Quiz passed!" : "Quiz completed",
      description: `You scored ${score} out of ${totalPoints} points.`,
      duration: 3000
    });

    if (passed && !lessonData.completed) {
      // In a real app, you would update the user's progress
      markAsCompleted();
    }
  };

  // Toggle bookmark
  const toggleBookmark = () => {
    setIsBookmarked(prev => !prev);
    toast({
      title: isBookmarked ? "Bookmark removed" : "Lesson bookmarked",
      description: isBookmarked ? "This lesson has been removed from your bookmarks." : "This lesson has been added to your bookmarks.",
      duration: 3000
    });
  };

  // Handle resource download
  const handleResourceDownload = (resource: any) => {
    // In a real app, you would handle the download logic
    toast({
      title: "Downloading resource",
      description: `${resource.title} is being downloaded.`,
      duration: 3000
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content area - 2/3 width */}
        <div className="md:w-2/3">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <Link href={`/ai-mastery/modules/${moduleId}`}>
                <Button variant="outline" size="sm" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Module
                </Button>
              </Link>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleBookmark}
                  className={isBookmarked ? "text-yellow-500" : ""}
                >
                  <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? "fill-yellow-500" : ""}`} />
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>

                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">{lessonData.title}</h1>

            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
              <div className="flex items-center mr-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>{lessonData.duration}</span>
              </div>
              <div className="flex items-center mr-4">
                <BookOpen className="h-4 w-4 mr-1" />
                <span>{lessonData.type.charAt(0).toUpperCase() + lessonData.type.slice(1)}</span>
              </div>
              {lessonData.completed && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            <p className="text-gray-600">{lessonData.description}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="content">Lesson Content</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0">
              {lessonData.type === 'video' && lessonData.videoUrl && (
                <div className="mb-6 rounded-lg overflow-hidden aspect-video">
                  <iframe
                    src={lessonData.videoUrl}
                    title={lessonData.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div 
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: lessonData.content }}
              ></div>

              {!lessonData.completed && (
                <div className="mt-8 flex justify-center">
                  <Button size="lg" onClick={markAsCompleted}>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Mark as Complete
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources" className="mt-0">
              <h2 className="text-2xl font-bold mb-4">Lesson Resources</h2>
              
              {lessonData.resources && lessonData.resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessonData.resources.map((resource) => (
                    <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-start">
                            <div className="bg-blue-100 p-2 rounded-md mr-3">
                              <FileText className="h-5 w-5 text-blue-700" />
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-medium">{resource.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">{resource.type.toUpperCase()}</p>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full mt-4"
                            variant="outline"
                            onClick={() => handleResourceDownload(resource)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Resource
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No resources available for this lesson.</p>
              )}
            </TabsContent>

            <TabsContent value="quiz" className="mt-0">
              {!isAuthenticated && (
                <Card className="bg-yellow-50 border-yellow-200 mb-6">
                  <CardContent className="p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Limited access</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>You need to be logged in to save your quiz results. Your progress won't be tracked if you continue without logging in.</p>
                        </div>
                        <div className="mt-4">
                          <div className="-mx-2 -my-1.5 flex">
                            <Link href="/api/login">
                              <Button variant="secondary" size="sm" className="ml-3">
                                Log in
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {lessonData.quiz ? (
                <InteractiveQuiz
                  moduleId={moduleId}
                  lessonId={lessonId}
                  title={lessonData.quiz.title}
                  description={lessonData.quiz.description}
                  questions={lessonData.quiz.questions}
                  onComplete={handleQuizComplete}
                  onExit={() => setActiveTab('content')}
                  passThreshold={lessonData.quiz.passThreshold}
                />
              ) : (
                <p className="text-gray-500">No quiz available for this lesson.</p>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-12">
            <Button 
              variant="outline" 
              onClick={onPrevious}
              disabled={!hasPrevious}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Lesson
            </Button>
            
            <Button 
              onClick={onNext}
              disabled={!hasNext}
            >
              Next Lesson
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Sidebar - 1/3 width */}
        <div className="md:w-1/3">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Your Progress</h3>
                
                {quizCompleted ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quiz Score</span>
                      <span className="font-medium">{Math.round((quizScore.score / quizScore.total) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(quizScore.score / quizScore.total) * 100} 
                      className={`h-2 ${quizScore.passed ? 'bg-green-100' : 'bg-orange-100'}`}
                    />
                    <p className="text-sm text-gray-500">
                      You scored {quizScore.score} out of {quizScore.total} points
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">Complete the lesson and take the quiz to track your progress</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('quiz')}
                    >
                      Take Quiz Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Personal Notes</h3>
                <textarea
                  className="w-full p-3 border rounded-md min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Take notes as you go through the lesson..."
                  value={lessonNotes}
                  onChange={(e) => setLessonNotes(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm">
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Discussion</h3>
                
                {isAuthenticated ? (
                  <>
                    <div className="space-y-4 mb-4">
                      {[
                        { 
                          name: "Michael Johnson", 
                          comment: "Great explanation of the AI foundations. I never understood the difference between narrow and general AI before.", 
                          time: "2 days ago",
                          likes: 12
                        },
                        { 
                          name: "Sarah Lee", 
                          comment: "Does anyone have additional resources on the history of AI? I'm interested in learning more about the AI winters.", 
                          time: "1 day ago",
                          likes: 5
                        }
                      ].map((comment, index) => (
                        <div key={index} className="border-b pb-3">
                          <div className="flex justify-between">
                            <span className="font-medium">{comment.name}</span>
                            <span className="text-xs text-gray-500">{comment.time}</span>
                          </div>
                          <p className="text-sm mt-1 mb-2">{comment.comment}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <button className="flex items-center mr-3 hover:text-blue-600">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              <span>{comment.likes}</span>
                            </button>
                            <button className="flex items-center hover:text-blue-600">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <textarea
                        className="w-full p-3 border rounded-md min-h-[80px] mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add to the discussion..."
                      ></textarea>
                      <Button size="sm">Post Comment</Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">Log in to join the discussion</p>
                    <Link href="/api/login">
                      <Button variant="outline" size="sm">Log In to Comment</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Learning Tips</h3>
                <div className="space-y-3">
                  {[
                    "Take brief notes on key concepts to aid memory retention",
                    "Try explaining the material to someone else to solidify understanding",
                    "Take short breaks every 25 minutes to maintain focus",
                    "Review quiz questions you answered incorrectly"
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonContent;