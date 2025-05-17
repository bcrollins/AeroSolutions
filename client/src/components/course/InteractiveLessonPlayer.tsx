import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  BookOpen,
  Code,
  Trophy,
  ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import VideoPlayer from './VideoPlayer';

type QuestionType = 'multipleChoice' | 'trueFalse' | 'codeChallenge' | 'openEnded';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  explanation?: string;
  options?: Option[];
  correctAnswer?: string; // For true/false or reference in code challenges
  points: number;
}

interface LessonSection {
  id: string;
  type: 'video' | 'text' | 'quiz' | 'code' | 'interactive';
  title: string;
  content: {
    text?: string;
    videoUrl?: string;
    questions?: Question[];
    codeTemplate?: string;
    interactiveUrl?: string;
    instructions?: string;
  };
  duration?: number; // in seconds
  isCompleted?: boolean;
}

interface InteractiveLessonPlayerProps {
  lessonId: string;
  courseId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgress?: (progress: number) => void;
  initialSection?: number;
}

const InteractiveLessonPlayer: React.FC<InteractiveLessonPlayerProps> = ({
  lessonId,
  courseId,
  onComplete,
  onProgress,
  initialSection = 0
}) => {
  const { toast } = useToast();
  const { playSound } = useSoundEffects();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(initialSection);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasBeenCompleted, setHasBeenCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Sample data - In a real app, you'd fetch this from an API
  const lessonData: { sections: LessonSection[] } = {
    sections: [
      {
        id: 'section-1',
        type: 'video',
        title: 'Introduction to Neural Networks',
        content: {
          videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
          instructions: 'Watch this video introduction to understand the basics of neural networks.'
        },
        duration: 300, // 5 minutes
        isCompleted: false
      },
      {
        id: 'section-2',
        type: 'text',
        title: 'Key Concepts of Neural Networks',
        content: {
          text: `
            <h2>Understanding Neural Networks</h2>
            <p>Neural networks are a series of algorithms that mimic the operations of a human brain to recognize relationships between vast amounts of data.</p>
            
            <h3>Key Components:</h3>
            <ul>
              <li><strong>Neurons:</strong> Basic computational units that take inputs, apply an activation function, and produce outputs.</li>
              <li><strong>Layers:</strong> Groups of neurons that process specific aspects of data. A typical network has:
                <ul>
                  <li>Input layer: Receives initial data</li>
                  <li>Hidden layers: Process and transform data</li>
                  <li>Output layer: Produces the final result</li>
                </ul>
              </li>
              <li><strong>Weights and Biases:</strong> Parameters that determine the strength of connections between neurons.</li>
              <li><strong>Activation Functions:</strong> Mathematical equations that determine whether a neuron should be activated based on inputs.</li>
            </ul>
            
            <h3>Training Process:</h3>
            <ol>
              <li>Forward Propagation: Data passes through the network</li>
              <li>Loss Calculation: Error between prediction and true value is measured</li>
              <li>Backpropagation: Error is propagated back through the network</li>
              <li>Weight Update: Model parameters are adjusted to reduce error</li>
            </ol>
          `
        },
        isCompleted: false
      },
      {
        id: 'section-3',
        type: 'quiz',
        title: 'Neural Networks Fundamentals Quiz',
        content: {
          questions: [
            {
              id: 'q1',
              type: 'multipleChoice',
              text: 'Which of the following is NOT a type of layer in a neural network?',
              options: [
                { id: 'a', text: 'Input Layer', isCorrect: false },
                { id: 'b', text: 'Hidden Layer', isCorrect: false },
                { id: 'c', text: 'Storage Layer', isCorrect: true },
                { id: 'd', text: 'Output Layer', isCorrect: false }
              ],
              explanation: 'Neural networks typically consist of three types of layers: input layers, hidden layers, and output layers. There is no "storage layer" in standard neural network architecture.',
              points: 10
            },
            {
              id: 'q2',
              type: 'trueFalse',
              text: 'Backpropagation is a process where errors are propagated from the output layer back to the input layer to update weights.',
              correctAnswer: 'true',
              explanation: 'Correct! Backpropagation is the mechanism by which neural networks learn. It involves calculating the gradient of the error function with respect to the network weights and adjusting them to minimize error.',
              points: 5
            },
            {
              id: 'q3',
              type: 'multipleChoice',
              text: 'Which activation function ranges from 0 to 1?',
              options: [
                { id: 'a', text: 'ReLU', isCorrect: false },
                { id: 'b', text: 'Sigmoid', isCorrect: true },
                { id: 'c', text: 'Tanh', isCorrect: false },
                { id: 'd', text: 'Leaky ReLU', isCorrect: false }
              ],
              explanation: 'The sigmoid activation function squashes input values to a range between 0 and 1, making it useful for models where we need to predict probability as an output.',
              points: 10
            }
          ]
        },
        isCompleted: false
      },
      {
        id: 'section-4',
        type: 'code',
        title: 'Implementing a Simple Neural Network',
        content: {
          instructions: 'Complete the code below to create a simple neural network with one hidden layer.',
          codeTemplate: `
import numpy as np

class SimpleNeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        # Initialize weights
        self.weights1 = np.random.randn(input_size, hidden_size)
        self.weights2 = np.random.randn(hidden_size, output_size)
        
    def sigmoid(self, x):
        # TODO: Implement the sigmoid activation function
        return # Your code here
        
    def sigmoid_derivative(self, x):
        # TODO: Implement the derivative of sigmoid
        return # Your code here
        
    def forward(self, X):
        # TODO: Implement forward propagation
        # Calculate hidden layer output
        self.hidden = # Your code here
        
        # Calculate final output
        self.output = # Your code here
        
        return self.output
        
    def backward(self, X, y, learning_rate):
        # TODO: Implement backpropagation
        # Calculate error
        self.error = # Your code here
        
        # Calculate delta for output layer
        self.delta_output = # Your code here
        
        # Calculate delta for hidden layer
        self.delta_hidden = # Your code here
        
        # Update weights
        self.weights2 += # Your code here
        self.weights1 += # Your code here
`
        },
        isCompleted: false
      },
      {
        id: 'section-5',
        type: 'interactive',
        title: 'Neural Network Visualization',
        content: {
          interactiveUrl: 'https://playground.tensorflow.org/',
          instructions: 'Experiment with this interactive neural network visualization tool to understand how different parameters affect learning.'
        },
        isCompleted: false
      }
    ]
  };
  
  // Calculate max quiz score
  useEffect(() => {
    let totalPoints = 0;
    lessonData.sections.forEach(section => {
      if (section.type === 'quiz' && section.content.questions) {
        section.content.questions.forEach(question => {
          totalPoints += question.points;
        });
      }
    });
    setMaxScore(totalPoints);
  }, []);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [timerActive]);
  
  // Update progress
  useEffect(() => {
    const newProgress = Math.round((currentSectionIndex / lessonData.sections.length) * 100);
    setProgress(newProgress);
    
    if (onProgress) {
      onProgress(newProgress);
    }
  }, [currentSectionIndex, lessonData.sections.length, onProgress]);
  
  const currentSection = lessonData.sections[currentSectionIndex];
  
  const handleNextSection = () => {
    playSound('click');
    
    // Mark current section as completed
    const updatedSections = [...lessonData.sections];
    updatedSections[currentSectionIndex].isCompleted = true;
    
    if (currentSectionIndex < lessonData.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setIsAnswerSubmitted(false);
      // In a real app, you'd save progress to the backend here
    } else {
      // Lesson completed!
      if (!hasBeenCompleted) {
        setHasBeenCompleted(true);
        setShowCelebration(true);
        
        if (onComplete) {
          onComplete(score, timeSpent);
        }
        
        playSound('success');
        
        toast({
          title: "Lesson Completed!",
          description: `You've earned ${score} points out of ${maxScore} possible points.`,
          variant: "default",
        });
        
        // In a real app, you'd save completion status to the backend here
      }
    }
  };
  
  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      playSound('click');
      setCurrentSectionIndex(currentSectionIndex - 1);
      setIsAnswerSubmitted(false);
    }
  };
  
  const handleQuizOptionSelect = (questionId: string, optionId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  const handleTrueFalseSelect = (questionId: string, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleCodeSubmit = (questionId: string, code: string) => {
    // In a real app, you'd evaluate the code submission
    // Here, we're just storing it
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: code
    }));
  };
  
  const handleQuizSubmit = () => {
    playSound('click');
    
    let newScore = score;
    
    // Calculate score
    if (currentSection.type === 'quiz' && currentSection.content.questions) {
      currentSection.content.questions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        
        if (question.type === 'multipleChoice' && question.options) {
          const correctOption = question.options.find(option => option.isCorrect);
          if (correctOption && userAnswer === correctOption.id) {
            newScore += question.points;
          }
        } else if (question.type === 'trueFalse') {
          if (userAnswer === question.correctAnswer) {
            newScore += question.points;
          }
        }
        // For code and open-ended questions, you'd typically have manual or automated review
      });
    }
    
    setScore(newScore);
    setIsAnswerSubmitted(true);
  };
  
  // Render different section types
  const renderSectionContent = () => {
    switch (currentSection.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden">
              <VideoPlayer 
                src={currentSection.content.videoUrl || ''} 
                title={currentSection.title}
                onComplete={() => setTimeout(() => handleNextSection(), 1000)}
              />
            </div>
            {currentSection.content.instructions && (
              <div className="text-gray-700 bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-medium mb-2">Instructions</h3>
                <p>{currentSection.content.instructions}</p>
              </div>
            )}
          </div>
        );
        
      case 'text':
        return (
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: currentSection.content.text || '' }}
          />
        );
        
      case 'quiz':
        return (
          <div className="space-y-6">
            {currentSection.content.questions?.map((question, qIndex) => (
              <Card key={question.id} className={`relative ${
                isAnswerSubmitted 
                  ? userAnswers[question.id] === (
                    question.type === 'multipleChoice' 
                      ? question.options?.find(o => o.isCorrect)?.id
                      : question.correctAnswer
                  )
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                  : ''
              }`}>
                {isAnswerSubmitted && (
                  <div className="absolute top-4 right-4">
                    {userAnswers[question.id] === (
                      question.type === 'multipleChoice' 
                        ? question.options?.find(o => o.isCorrect)?.id
                        : question.correctAnswer
                    ) ? (
                      <CheckCircle className="text-green-500 h-6 w-6" />
                    ) : (
                      <XCircle className="text-red-500 h-6 w-6" />
                    )}
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-start">
                    <span className="bg-gray-100 text-gray-700 h-6 w-6 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0">
                      {qIndex + 1}
                    </span>
                    <span>{question.text}</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {question.type === 'multipleChoice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map(option => (
                        <div 
                          key={option.id}
                          className={`p-3 rounded-lg border ${
                            userAnswers[question.id] === option.id
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          } ${
                            isAnswerSubmitted && option.isCorrect
                              ? 'bg-green-50 border-green-200'
                              : isAnswerSubmitted && userAnswers[question.id] === option.id && !option.isCorrect
                                ? 'bg-red-50 border-red-200'
                                : ''
                          } cursor-pointer transition-colors`}
                          onClick={() => !isAnswerSubmitted && handleQuizOptionSelect(question.id, option.id)}
                        >
                          <div className="flex items-center">
                            <div className={`h-5 w-5 rounded-full border ${
                              userAnswers[question.id] === option.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            } mr-3 flex items-center justify-center`}>
                              {userAnswers[question.id] === option.id && (
                                <div className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span>{option.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'trueFalse' && (
                    <div className="space-y-2">
                      {['true', 'false'].map(value => (
                        <div 
                          key={value}
                          className={`p-3 rounded-lg border ${
                            userAnswers[question.id] === value
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          } ${
                            isAnswerSubmitted && value === question.correctAnswer
                              ? 'bg-green-50 border-green-200'
                              : isAnswerSubmitted && userAnswers[question.id] === value && value !== question.correctAnswer
                                ? 'bg-red-50 border-red-200'
                                : ''
                          } cursor-pointer transition-colors`}
                          onClick={() => !isAnswerSubmitted && handleTrueFalseSelect(question.id, value)}
                        >
                          <div className="flex items-center">
                            <div className={`h-5 w-5 rounded-full border ${
                              userAnswers[question.id] === value
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            } mr-3 flex items-center justify-center`}>
                              {userAnswers[question.id] === value && (
                                <div className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="capitalize">{value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'codeChallenge' && (
                    <div className="bg-gray-900 text-gray-50 p-4 rounded-lg font-mono text-sm">
                      <div className="mb-4">
                        <pre>
                          <code>
                            {currentSection.content.codeTemplate}
                          </code>
                        </pre>
                      </div>
                      {/* In a real app, you'd have a code editor here */}
                      <textarea 
                        className="w-full h-24 bg-gray-800 text-gray-50 p-2 rounded-md font-mono"
                        placeholder="Write your solution here..."
                        value={userAnswers[question.id] as string || ''}
                        onChange={(e) => handleCodeSubmit(question.id, e.target.value)}
                        disabled={isAnswerSubmitted}
                      />
                    </div>
                  )}
                  
                  {question.type === 'openEnded' && (
                    <div>
                      <textarea 
                        className="w-full h-24 p-2 rounded-md border"
                        placeholder="Write your answer here..."
                        value={userAnswers[question.id] as string || ''}
                        onChange={(e) => setUserAnswers(prev => ({
                          ...prev,
                          [question.id]: e.target.value
                        }))}
                        disabled={isAnswerSubmitted}
                      />
                    </div>
                  )}
                </CardContent>
                
                {isAnswerSubmitted && question.explanation && (
                  <CardFooter className="block bg-blue-50 border-t border-blue-100">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-700 mb-1">Explanation</h4>
                        <p className="text-blue-600 text-sm">{question.explanation}</p>
                      </div>
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))}
            
            {!isAnswerSubmitted && (
              <Button 
                onClick={handleQuizSubmit}
                disabled={
                  !currentSection.content.questions?.every(q => 
                    userAnswers[q.id] !== undefined
                  )
                }
                className="w-full"
              >
                Submit Answers
              </Button>
            )}
          </div>
        );
        
      case 'code':
        return (
          <div className="space-y-4">
            {currentSection.content.instructions && (
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold mb-2">Instructions</h3>
                <p>{currentSection.content.instructions}</p>
              </div>
            )}
            
            <div className="bg-gray-900 text-gray-50 p-4 rounded-lg font-mono text-sm overflow-auto">
              <pre>
                <code>
                  {currentSection.content.codeTemplate}
                </code>
              </pre>
            </div>
            
            {/* In a real app, you'd integrate a code editor and evaluation */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Your Solution</h3>
              <textarea 
                className="w-full h-48 p-2 rounded-md border font-mono text-sm"
                placeholder="Write your solution here..."
              />
              
              <div className="mt-4 flex justify-end">
                <Button>
                  Test Code
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'interactive':
        return (
          <div className="space-y-4">
            {currentSection.content.instructions && (
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold mb-2">Instructions</h3>
                <p>{currentSection.content.instructions}</p>
              </div>
            )}
            
            <div className="h-[600px] border rounded-lg overflow-hidden">
              <iframe
                src={currentSection.content.interactiveUrl}
                className="w-full h-full"
                title="Interactive Content"
                allow="accelerometer; camera; microphone; clipboard-write; encrypted-media; geolocation"
              />
            </div>
          </div>
        );
        
      default:
        return <div>Unknown section type</div>;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600">
            Section {currentSectionIndex + 1} of {lessonData.sections.length}
          </div>
          <div className="text-sm font-medium text-gray-700">
            {progress}% Complete
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Section title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {currentSection.title}
        </h2>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          {currentSection.type === 'video' && (
            <>
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                Video Lesson
              </span>
              {currentSection.duration && (
                <span className="ml-4">{Math.round(currentSection.duration / 60)} min</span>
              )}
            </>
          )}
          {currentSection.type === 'text' && (
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Reading
            </span>
          )}
          {currentSection.type === 'quiz' && (
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Quiz
            </span>
          )}
          {currentSection.type === 'code' && (
            <span className="flex items-center">
              <Code className="h-4 w-4 mr-1" />
              Coding Exercise
            </span>
          )}
          {currentSection.type === 'interactive' && (
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Interactive Demo
            </span>
          )}
        </div>
      </div>
      
      {/* Section content */}
      <div className="mb-8">
        {renderSectionContent()}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousSection}
          disabled={currentSectionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={handleNextSection}
          disabled={
            (currentSection.type === 'quiz' && !isAnswerSubmitted) ||
            (hasBeenCompleted && currentSectionIndex === lessonData.sections.length - 1)
          }
        >
          {currentSectionIndex === lessonData.sections.length - 1
            ? 'Complete Lesson'
            : 'Next'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      {/* Completion celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto h-20 w-20 flex items-center justify-center bg-green-100 rounded-full mb-4">
                <Trophy className="h-10 w-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Lesson Completed!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Great job! You've successfully completed this lesson and earned {score} out of {maxScore} possible points.
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Score</span>
                  <span className="font-medium">{score}/{maxScore} points</span>
                </div>
                <Progress value={(score / maxScore) * 100} className="h-2 mb-3" />
                
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Time Spent</span>
                  <span className="font-medium">
                    {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                  </span>
                </div>
              </div>
              
              <div className="mt-6 space-x-3">
                <Button
                  onClick={() => setShowCelebration(false)}
                  className="w-full"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveLessonPlayer;