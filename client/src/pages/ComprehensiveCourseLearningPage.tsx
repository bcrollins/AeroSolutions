import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Play,
  Clock,
  Video,
  Code,
  MessageSquare,
  BookMarked,
  Award,
  Settings,
  Save,
  Download,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  ChevronDown,
  Bookmark,
  Star,
  BarChart4
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { aiCourseStructure, CourseModule, Lesson } from '@/data/courseStructure';
import InteractiveQuizComponent from '@/components/course/InteractiveQuizComponent';
import InteractiveCodingLab from '@/components/course/InteractiveCodingLab';
import CourseProgressTracker from '@/components/course/CourseProgressTracker';

const NotesEditor = ({ lessonId }: { lessonId: string }) => {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(true);
  const { toast } = useToast();

  // Load saved notes on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_${lessonId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    } else {
      setNotes('');
    }
  }, [lessonId]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setSaved(false);
  };

  const saveNotes = () => {
    localStorage.setItem(`notes_${lessonId}`, notes);
    setSaved(true);
    toast({
      title: "Notes saved",
      description: "Your notes have been saved successfully.",
      duration: 3000,
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Personal Notes</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={saveNotes}
          disabled={saved}
        >
          <Save className="mr-2 h-4 w-4" />
          {saved ? 'Saved' : 'Save'}
        </Button>
      </div>
      <textarea
        className="w-full h-64 p-3 rounded-md border"
        placeholder="Take notes as you learn..."
        value={notes}
        onChange={handleNotesChange}
      />
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        <span>{notes.length} characters</span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            if (notes && confirm('Are you sure you want to download your notes?')) {
              const blob = new Blob([notes], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `notes_${lessonId}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          }}
        >
          <Download className="mr-1 h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
};

const LessonResources = ({ resources }: { resources?: { id: string; title: string; type: string; url: string; isRequired: boolean }[] }) => {
  if (!resources || resources.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50 text-center">
        <BookMarked className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="font-medium mb-1">No resources available</h3>
        <p className="text-sm text-gray-500">This lesson doesn't have any additional resources.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-3">Lesson Resources</h3>
      <div className="space-y-3">
        {resources.map((resource) => (
          <div key={resource.id} className="flex items-start border-b pb-3 last:border-0 last:pb-0">
            <div className="flex-shrink-0 mr-3">
              {resource.type === 'pdf' && <BookMarked className="h-5 w-5 text-red-500" />}
              {resource.type === 'code' && <Code className="h-5 w-5 text-blue-500" />}
              {resource.type === 'link' && <BookOpen className="h-5 w-5 text-green-500" />}
              {resource.type === 'dataset' && <BarChart4 className="h-5 w-5 text-purple-500" />}
              {resource.type === 'notebook' && <BookOpen className="h-5 w-5 text-amber-500" />}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{resource.title}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {resource.type.toUpperCase()} • {resource.isRequired ? 'Required' : 'Supplemental'}
              </p>
            </div>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const DiscussionForum = ({ lessonId }: { lessonId: string }) => {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Simulate fetching discussion data
  useEffect(() => {
    // In a real app, this would be an API call
    const mockDiscussions = [
      {
        id: '1',
        author: 'Sarah Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        date: '2 days ago',
        content: 'I found the explanation of gradient descent really helpful. Anyone else implementing it from scratch?',
        likes: 5,
        replies: [
          {
            id: '1.1',
            author: 'Michael Chen',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            date: '1 day ago',
            content: 'Yes! I implemented it with numpy and it worked really well. Happy to share my code if anyone is interested.',
            likes: 2,
          }
        ]
      },
      {
        id: '2',
        author: 'David Rodriguez',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        date: '4 days ago',
        content: 'Does anyone have additional resources on attention mechanisms in transformers? I\'m trying to understand multi-head attention better.',
        likes: 3,
        replies: []
      }
    ];
    
    setDiscussions(mockDiscussions);
  }, [lessonId]);

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to participate in discussions",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would be an API call
    const newDiscussion = {
      id: `${Date.now()}`,
      author: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Anonymous User',
      avatar: user?.profileImageUrl || 'https://randomuser.me/api/portraits/lego/1.jpg',
      date: 'Just now',
      content: newComment,
      likes: 0,
      replies: []
    };
    
    setDiscussions([newDiscussion, ...discussions]);
    setNewComment('');
    
    toast({
      title: "Comment posted",
      description: "Your comment has been posted to the discussion",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="font-medium mb-1">Join the discussion</h3>
        <p className="text-sm text-gray-500 mb-4">Sign in to participate in the lesson discussion</p>
        <Button onClick={() => window.location.href = '/api/login'}>
          Sign In to Comment
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-4">Discussion Forum</h3>
      
      {/* Comment input */}
      <div className="mb-6">
        <textarea
          className="w-full p-3 rounded-md border min-h-24"
          placeholder="Share your thoughts or questions about this lesson..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <Button 
            onClick={handlePostComment}
            disabled={!newComment.trim()}
          >
            Post Comment
          </Button>
        </div>
      </div>
      
      {/* Discussion threads */}
      <div className="space-y-6">
        {discussions.length > 0 ? (
          discussions.map(discussion => (
            <div key={discussion.id} className="border rounded-lg p-4">
              <div className="flex items-start">
                <img 
                  src={discussion.avatar} 
                  alt={discussion.author} 
                  className="h-10 w-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium">{discussion.author}</h4>
                    <span className="text-xs text-gray-500 ml-2">{discussion.date}</span>
                  </div>
                  <p className="mt-1 text-gray-800">{discussion.content}</p>
                  <div className="flex items-center mt-2">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                      <Star className="h-4 w-4 mr-1" /> Like ({discussion.likes})
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <MessageSquare className="h-4 w-4 mr-1" /> Reply
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Replies */}
              {discussion.replies && discussion.replies.length > 0 && (
                <div className="ml-12 mt-3 space-y-3">
                  {discussion.replies.map(reply => (
                    <div key={reply.id} className="border-l-2 pl-4 py-2">
                      <div className="flex items-start">
                        <img 
                          src={reply.avatar} 
                          alt={reply.author} 
                          className="h-8 w-8 rounded-full mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h5 className="font-medium text-sm">{reply.author}</h5>
                            <span className="text-xs text-gray-500 ml-2">{reply.date}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-800">{reply.content}</p>
                          <div className="flex items-center mt-1">
                            <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-blue-500">
                              <Star className="h-3 w-3 mr-1" /> Like ({reply.likes})
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Be the first to start a discussion about this lesson!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoLesson = ({ videoUrl, title, transcript }: { videoUrl?: string; title: string; transcript?: string }) => {
  // Use a placeholder video URL if none is provided
  const videoSrc = videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  
  return (
    <div className="space-y-4">
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
        <iframe 
          src={videoSrc}
          className="absolute top-0 left-0 w-full h-full"
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      {transcript && (
        <div className="border rounded-lg p-4 mt-4">
          <h3 className="font-medium mb-2">Transcript</h3>
          <div className="max-h-64 overflow-y-auto">
            <p className="text-gray-700 whitespace-pre-line">{transcript}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Example quiz for demo purposes
const exampleQuiz = {
  title: "Neural Network Fundamentals Quiz",
  description: "Test your understanding of neural network basics",
  questions: [
    {
      id: "q1",
      question: "What is a neuron in the context of neural networks?",
      options: [
        "A biological cell in the human brain",
        "A mathematical function that processes inputs and produces an output",
        "A type of computer hardware",
        "A programming language for AI"
      ],
      correctAnswer: 1,
      explanation: "In neural networks, a neuron (or node) is a mathematical function that takes one or more inputs, applies weights, adds a bias, and passes the result through an activation function to produce an output.",
      difficulty: "beginner" as const,
      points: 10
    },
    {
      id: "q2",
      question: "Which of the following is NOT a common activation function?",
      options: [
        "ReLU (Rectified Linear Unit)",
        "Sigmoid",
        "Tanh",
        "Quadratic"
      ],
      correctAnswer: 3,
      explanation: "Common activation functions include ReLU, Sigmoid, Tanh, and Softmax. Quadratic is not typically used as an activation function in neural networks.",
      difficulty: "intermediate" as const,
      points: 15
    },
    {
      id: "q3",
      question: "What is backpropagation in neural networks?",
      options: [
        "A method of data preprocessing",
        "An algorithm for training neural networks by adjusting weights based on error",
        "A technique for compressing neural networks",
        "A way to visualize neural network outputs"
      ],
      correctAnswer: 1,
      explanation: "Backpropagation is an algorithm used to train neural networks by calculating the gradient of the loss function with respect to the weights and biases, and then adjusting them to minimize the loss.",
      difficulty: "intermediate" as const,
      points: 15
    }
  ]
};

// Example coding lab for demo purposes
const exampleCodingLab = {
  title: "Building a Simple Neural Network",
  description: "Implement a basic neural network with numpy",
  language: "python" as const,
  initialCode: `import numpy as np

# Neural Network class
class NeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        # Initialize weights and biases
        self.W1 = np.random.randn(input_size, hidden_size)
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, output_size)
        self.b2 = np.zeros((1, output_size))
    
    def forward(self, X):
        # Forward propagation
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.a2 = self.sigmoid(self.z2)
        return self.a2
    
    def sigmoid(self, z):
        # TODO: Implement the sigmoid activation function
        # Hint: sigmoid(z) = 1 / (1 + exp(-z))
        return # Your code here
    
    def sigmoid_derivative(self, z):
        # TODO: Implement the derivative of sigmoid
        # Hint: sigmoid_derivative(z) = sigmoid(z) * (1 - sigmoid(z))
        return # Your code here

# Test your implementation
nn = NeuralNetwork(2, 4, 1)
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
output = nn.forward(X)
print(output)`,
  solution: `import numpy as np

# Neural Network class
class NeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        # Initialize weights and biases
        self.W1 = np.random.randn(input_size, hidden_size)
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, output_size)
        self.b2 = np.zeros((1, output_size))
    
    def forward(self, X):
        # Forward propagation
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.a2 = self.sigmoid(self.z2)
        return self.a2
    
    def sigmoid(self, z):
        # Sigmoid activation function
        return 1 / (1 + np.exp(-z))
    
    def sigmoid_derivative(self, z):
        # Derivative of sigmoid
        s = self.sigmoid(z)
        return s * (1 - s)

# Test your implementation
nn = NeuralNetwork(2, 4, 1)
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
output = nn.forward(X)
print(output)`,
  hints: [
    "The sigmoid function is defined as 1 / (1 + e^(-z)), where e is the base of natural logarithm.",
    "In numpy, you can compute exponentials using np.exp()",
    "The derivative of the sigmoid function can be written in terms of the sigmoid function itself: sigmoid(z) * (1 - sigmoid(z))"
  ],
  testCases: [
    {
      input: "nn.sigmoid(np.array([0]))",
      expectedOutput: "0.5",
      description: "Sigmoid of 0 should be 0.5"
    },
    {
      input: "nn.sigmoid(np.array([-10, 0, 10]))",
      expectedOutput: "array([0.00004539, 0.5, 0.99995461])",
      description: "Sigmoid should handle arrays correctly"
    },
    {
      input: "nn.sigmoid_derivative(nn.sigmoid(np.array([0])))",
      expectedOutput: "0.25",
      description: "Derivative of sigmoid at z=0 should be 0.25"
    }
  ]
};

const ComprehensiveCourseLearningPage: React.FC = () => {
  const { moduleId, lessonId } = useParams();
  const [activeTab, setActiveTab] = useState<string>('content');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Find current module and lesson
  const currentModule = aiCourseStructure.find(module => module.id === moduleId);
  const currentLesson = currentModule?.lessons.find(lesson => lesson.id === lessonId);
  
  // Get adjacent lessons for navigation
  const flatLessons = aiCourseStructure.flatMap(module => 
    module.lessons.map(lesson => ({ 
      ...lesson, 
      moduleId: module.id,
      moduleTitle: module.title 
    }))
  );
  
  const currentLessonIndex = flatLessons.findIndex(lesson => lesson.id === lessonId);
  const prevLesson = currentLessonIndex > 0 ? flatLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < flatLessons.length - 1 ? flatLessons[currentLessonIndex + 1] : null;
  
  // Track lesson completion status
  const [lessonCompleted, setLessonCompleted] = useState(false);
  
  // Calculate module progress
  const calculateModuleProgress = (module: CourseModule): number => {
    // In a real app, this would come from the backend
    // For demo, we'll use localStorage
    const completedLessonsString = localStorage.getItem('course_progress');
    let completedLessons: string[] = [];
    
    if (completedLessonsString) {
      const progress = JSON.parse(completedLessonsString);
      completedLessons = progress.completedLessons || [];
    }
    
    const completedInModule = module.lessons.filter(lesson => 
      completedLessons.includes(lesson.id)
    ).length;
    
    return Math.round((completedInModule / module.lessons.length) * 100);
  };
  
  // Check if current lesson is completed
  useEffect(() => {
    if (!lessonId) return;
    
    const completedLessonsString = localStorage.getItem('course_progress');
    if (completedLessonsString) {
      const progress = JSON.parse(completedLessonsString);
      setLessonCompleted(progress.completedLessons?.includes(lessonId) || false);
    }
  }, [lessonId]);
  
  // Mark lesson as complete
  const markLessonComplete = () => {
    if (!lessonId || !isAuthenticated) return;
    
    try {
      // Get existing progress data
      const progressString = localStorage.getItem('course_progress');
      let progressData = progressString ? JSON.parse(progressString) : {
        completedLessons: [],
        quizScores: {},
        projectSubmissions: {},
        startDate: new Date().toISOString(),
        totalTimeSpent: 0,
        streakDays: 0,
        currentStreak: 0
      };
      
      // Add lesson to completed lessons if not already included
      if (!progressData.completedLessons.includes(lessonId)) {
        progressData.completedLessons.push(lessonId);
        
        // Save updated progress
        localStorage.setItem('course_progress', JSON.stringify(progressData));
        
        setLessonCompleted(true);
        
        toast({
          title: "Progress updated",
          description: "This lesson has been marked as complete",
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error updating progress",
        description: "There was a problem saving your progress",
        variant: "destructive",
      });
    }
  };
  
  // Handle quiz completion
  const handleQuizComplete = (score: number, totalPossible: number) => {
    if (!lessonId || !isAuthenticated) return;
    
    try {
      // Get existing progress data
      const progressString = localStorage.getItem('course_progress');
      let progressData = progressString ? JSON.parse(progressString) : {
        completedLessons: [],
        quizScores: {},
        projectSubmissions: {},
        startDate: new Date().toISOString(),
        totalTimeSpent: 0,
        streakDays: 0,
        currentStreak: 0
      };
      
      // Save quiz score
      progressData.quizScores[lessonId] = {
        score,
        totalPossible,
        completedAt: new Date().toISOString()
      };
      
      // Add lesson to completed lessons if not already included
      if (!progressData.completedLessons.includes(lessonId)) {
        progressData.completedLessons.push(lessonId);
      }
      
      // Save updated progress
      localStorage.setItem('course_progress', JSON.stringify(progressData));
      
      setLessonCompleted(true);
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };
  
  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // If no module or lesson found, show error
  if (!currentModule || !currentLesson) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Not Found</CardTitle>
            <CardDescription>
              The requested lesson could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The lesson you're looking for does not exist or you may not have access to it.</p>
            <Button asChild>
              <Link href="/courses">Return to Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{currentLesson.title} | AI Learning Platform</title>
        <meta name="description" content={currentLesson.description} />
      </Helmet>
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-2 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/courses" className="flex items-center">
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Back to Courses</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>
            
            <div className="flex-1 mx-4">
              <h1 className="text-lg font-semibold truncate">
                {currentLesson.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <Button 
                  variant={lessonCompleted ? "ghost" : "default"}
                  size="sm"
                  onClick={markLessonComplete}
                  disabled={lessonCompleted}
                >
                  {lessonCompleted ? (
                    <>
                      <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                      Completed
                    </>
                  ) : (
                    "Mark Complete"
                  )}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Sign In
                </Button>
              )}
              
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: isMobile ? "100%" : "320px", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`md:relative fixed inset-0 z-20 bg-white md:bg-transparent ${isMobile ? "p-4" : "mr-6"}`}
              >
                <div className="md:sticky md:top-20 bg-white border rounded-lg overflow-hidden h-[calc(100vh-120px)] flex flex-col">
                  {isMobile && (
                    <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                      <h2 className="font-semibold">Course Content</h2>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSidebarOpen(false)}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="overflow-y-auto flex-1">
                    {aiCourseStructure.map((module, moduleIndex) => (
                      <div key={module.id} className="border-b last:border-0">
                        <div className="p-3 bg-gray-50 flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-sm">Module {moduleIndex + 1}</h3>
                            <p className="text-xs text-gray-500">{module.lessons.length} lessons • {module.durationHours} hours</p>
                          </div>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-800">
                              {calculateModuleProgress(module)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="divide-y">
                          {module.lessons.map((lesson, lessonIndex) => {
                            // Check if this lesson is completed
                            const completedLessonsString = localStorage.getItem('course_progress');
                            let isCompleted = false;
                            
                            if (completedLessonsString) {
                              const progress = JSON.parse(completedLessonsString);
                              isCompleted = progress.completedLessons?.includes(lesson.id) || false;
                            }
                            
                            // Check if this is the current lesson
                            const isCurrent = lesson.id === lessonId;
                            
                            return (
                              <Link 
                                key={lesson.id} 
                                href={`/courses/${module.id}/learn/${lesson.id}`}
                              >
                                <div 
                                  className={`p-3 flex items-start hover:bg-gray-50 transition-colors ${
                                    isCurrent ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                                    isCompleted ? 'bg-green-100 text-green-700' : 
                                    isCurrent ? 'bg-blue-100 text-blue-700' : 
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {isCompleted ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : (
                                      <span className="text-xs">{lessonIndex + 1}</span>
                                    )}
                                  </div>
                                  <div>
                                    <p className={`text-sm ${isCurrent ? 'font-medium' : ''}`}>
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      {lesson.contentType === 'video' && <Video className="h-3 w-3 mr-1" />}
                                      {lesson.contentType === 'text' && <BookOpen className="h-3 w-3 mr-1" />}
                                      {lesson.contentType === 'interactive' && <Code className="h-3 w-3 mr-1" />}
                                      {lesson.contentType === 'quiz' && <HelpCircle className="h-3 w-3 mr-1" />}
                                      {lesson.contentType === 'project' && <Code className="h-3 w-3 mr-1" />}
                                      <span className="capitalize">{lesson.contentType}</span>
                                      <span className="mx-1">•</span>
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span>{lesson.durationMinutes} min</span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t bg-gray-50">
                    <Button variant="outline" className="w-full">
                      <Award className="mr-2 h-4 w-4" />
                      View Your Progress
                    </Button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
          
          {/* Main Content */}
          <main className={`flex-1 ${isMobile && sidebarOpen ? 'hidden' : 'block'}`}>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-1">
                      {currentLesson.contentType === 'video' && <Video className="h-5 w-5 mr-2 text-blue-500" />}
                      {currentLesson.contentType === 'text' && <BookOpen className="h-5 w-5 mr-2 text-green-500" />}
                      {currentLesson.contentType === 'interactive' && <Code className="h-5 w-5 mr-2 text-purple-500" />}
                      {currentLesson.contentType === 'quiz' && <HelpCircle className="h-5 w-5 mr-2 text-orange-500" />}
                      {currentLesson.contentType === 'project' && <Code className="h-5 w-5 mr-2 text-red-500" />}
                      <Badge className="capitalize">{currentLesson.contentType}</Badge>
                    </div>
                    
                    <CardTitle className="text-2xl">{currentLesson.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {currentLesson.description}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{currentLesson.durationMinutes} minutes</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="content" className="flex-1">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Lesson Content
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex-1">
                      <BookMarked className="mr-2 h-4 w-4" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Resources
                    </TabsTrigger>
                    <TabsTrigger value="discussion" className="flex-1">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Discussion
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="pt-6">
                    {/* Lesson content based on type */}
                    {currentLesson.contentType === 'video' && (
                      <VideoLesson
                        title={currentLesson.title}
                        transcript="In this video, we're going to explore the fundamentals of neural networks. We'll start by understanding what a neuron is in the context of artificial neural networks. Unlike biological neurons in our brains, artificial neurons are mathematical functions that process inputs and produce outputs. Each neuron takes in one or more inputs, multiplies them by weights, adds a bias term, and then passes the result through an activation function. This activation function introduces non-linearity into the model, allowing neural networks to learn complex patterns. The most commonly used activation functions include ReLU, Sigmoid, and Tanh, each with their own advantages for different applications..."
                      />
                    )}
                    
                    {currentLesson.contentType === 'quiz' && (
                      <InteractiveQuizComponent
                        moduleId={moduleId || ''}
                        lessonId={lessonId || ''}
                        title={exampleQuiz.title}
                        description={exampleQuiz.description}
                        questions={exampleQuiz.questions}
                        onComplete={handleQuizComplete}
                      />
                    )}
                    
                    {currentLesson.contentType === 'interactive' && (
                      <InteractiveCodingLab
                        title={exampleCodingLab.title}
                        description={exampleCodingLab.description}
                        initialCode={exampleCodingLab.initialCode}
                        language={exampleCodingLab.language}
                        hints={exampleCodingLab.hints}
                        solution={exampleCodingLab.solution}
                        testCases={exampleCodingLab.testCases}
                      />
                    )}
                    
                    {(currentLesson.contentType === 'text' || currentLesson.contentType === 'project') && (
                      <div className="prose prose-blue max-w-none">
                        <h2>Introduction to Neural Networks</h2>
                        <p>
                          Neural networks are a class of machine learning models inspired by the structure and function of the human brain. They consist of interconnected nodes, or "neurons," organized in layers. Each connection between neurons has an associated weight, which is adjusted during the training process.
                        </p>
                        
                        <h3>Basic Structure</h3>
                        <p>
                          A typical neural network consists of three types of layers:
                        </p>
                        <ul>
                          <li><strong>Input Layer:</strong> Receives the initial data</li>
                          <li><strong>Hidden Layers:</strong> Process the information</li>
                          <li><strong>Output Layer:</strong> Produces the final result</li>
                        </ul>
                        
                        <h3>How Neural Networks Learn</h3>
                        <p>
                          Neural networks learn through a process called backpropagation, which involves:
                        </p>
                        <ol>
                          <li>Forward propagation of input data through the network</li>
                          <li>Calculation of error based on the output</li>
                          <li>Backward propagation of error to adjust weights</li>
                          <li>Repeating this process many times with different examples</li>
                        </ol>
                        
                        <h3>Activation Functions</h3>
                        <p>
                          Activation functions introduce non-linearity into the model, allowing neural networks to learn complex patterns. Common activation functions include:
                        </p>
                        <ul>
                          <li><strong>ReLU (Rectified Linear Unit):</strong> f(x) = max(0, x)</li>
                          <li><strong>Sigmoid:</strong> f(x) = 1 / (1 + e^(-x))</li>
                          <li><strong>Tanh:</strong> f(x) = (e^x - e^(-x)) / (e^x + e^(-x))</li>
                        </ul>
                        
                        <h3>Applications</h3>
                        <p>
                          Neural networks are used in a wide range of applications, including:
                        </p>
                        <ul>
                          <li>Image and speech recognition</li>
                          <li>Natural language processing</li>
                          <li>Game playing and decision making</li>
                          <li>Medical diagnosis and prediction</li>
                        </ul>
                        
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                          <h4 className="text-lg font-bold text-blue-700">Key Takeaway</h4>
                          <p className="mt-1">
                            Neural networks excel at finding patterns in complex, high-dimensional data where traditional algorithms struggle. Their ability to learn from examples makes them powerful tools for solving a wide range of problems.
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="notes" className="pt-6">
                    <NotesEditor lessonId={lessonId || ''} />
                  </TabsContent>
                  
                  <TabsContent value="resources" className="pt-6">
                    <LessonResources resources={currentLesson.resources} />
                  </TabsContent>
                  
                  <TabsContent value="discussion" className="pt-6">
                    <DiscussionForum lessonId={lessonId || ''} />
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-4">
                {prevLesson ? (
                  <Button variant="outline" asChild>
                    <Link href={`/courses/${prevLesson.moduleId}/learn/${prevLesson.id}`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous Lesson
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous Lesson
                  </Button>
                )}
                
                {nextLesson ? (
                  <Button asChild>
                    <Link href={`/courses/${nextLesson.moduleId}/learn/${nextLesson.id}`}>
                      Next Lesson
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button>
                    Complete Course
                    <Award className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {/* Progress Tracking */}
            <CourseProgressTracker />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveCourseLearningPage;