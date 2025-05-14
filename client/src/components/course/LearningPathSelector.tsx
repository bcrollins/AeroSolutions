import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Brain,
  Code,
  Gauge,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Layers,
  FileText,
  Calculator,
  Image,
  MessageSquare,
  ChevronRight,
  Settings,
  BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define learning path types
interface LearningPath {
  id: string;
  name: string;
  description: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ReactNode;
  topics: string[];
  duration: string;
  prerequisites: string[];
  matchScore?: number; // How well this path matches the user's profile
}

interface LearningPathSelectorProps {
  onPathSelect?: (pathId: string) => void;
  initialAssessmentCompleted?: boolean;
}

const learningPaths: LearningPath[] = [
  {
    id: 'general-ai',
    name: 'General AI Foundations',
    description: 'A broad introduction to AI concepts covering machine learning fundamentals, neural networks, and practical applications.',
    skillLevel: 'beginner',
    icon: <Brain className="h-6 w-6" />,
    topics: ['AI Ethics', 'Machine Learning Basics', 'Neural Networks', 'AI Applications'],
    duration: '8 weeks',
    prerequisites: ['Basic programming knowledge', 'High school math'],
    matchScore: 92
  },
  {
    id: 'ml-specialist',
    name: 'Machine Learning Specialist',
    description: 'Deep dive into machine learning algorithms, feature engineering, and model evaluation with a focus on practical implementation.',
    skillLevel: 'intermediate',
    icon: <BarChart3 className="h-6 w-6" />,
    topics: ['Supervised Learning', 'Unsupervised Learning', 'Feature Engineering', 'Model Evaluation'],
    duration: '10 weeks',
    prerequisites: ['Python programming', 'Statistics basics', 'Linear algebra'],
    matchScore: 78
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning Expert',
    description: 'Specialized track on deep learning architectures, training techniques, and implementing cutting-edge neural network models.',
    skillLevel: 'advanced',
    icon: <Layers className="h-6 w-6" />,
    topics: ['CNNs', 'RNNs', 'Transformers', 'GANs', 'Transfer Learning'],
    duration: '12 weeks',
    prerequisites: ['Machine learning fundamentals', 'Python with PyTorch/TensorFlow', 'Advanced mathematics'],
    matchScore: 85
  },
  {
    id: 'nlp-track',
    name: 'Natural Language Processing',
    description: 'Focused path on understanding and processing human language, building language models, and creating NLP applications.',
    skillLevel: 'intermediate',
    icon: <MessageSquare className="h-6 w-6" />,
    topics: ['Text Processing', 'Language Models', 'Sentiment Analysis', 'Named Entity Recognition'],
    duration: '10 weeks',
    prerequisites: ['Python programming', 'Machine learning basics'],
    matchScore: 89
  },
  {
    id: 'computer-vision',
    name: 'Computer Vision Engineer',
    description: 'Learn to process and analyze visual data, build image recognition systems, and implement object detection applications.',
    skillLevel: 'intermediate',
    icon: <Image className="h-6 w-6" />,
    topics: ['Image Processing', 'Object Detection', 'Image Classification', 'Video Analysis'],
    duration: '10 weeks',
    prerequisites: ['Python programming', 'Machine learning basics'],
    matchScore: 72
  },
  {
    id: 'ai-business',
    name: 'AI for Business Leaders',
    description: 'A non-technical track focused on AI strategy, implementation considerations, and managing AI projects in organizations.',
    skillLevel: 'beginner',
    icon: <BarChart2 className="h-6 w-6" />,
    topics: ['AI Strategy', 'Project Management', 'Ethical Considerations', 'AI Implementation'],
    duration: '6 weeks',
    prerequisites: ['No technical prerequisites'],
    matchScore: 65
  }
];

// Sort learning paths by match score
const sortedPaths = [...learningPaths].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

// Assessment questions for recommending a path
const assessmentQuestions = [
  {
    id: 1,
    question: 'What is your programming experience level?',
    options: [
      { id: 'a', text: 'None or very limited', paths: ['ai-business'] },
      { id: 'b', text: 'Beginner (some basics)', paths: ['general-ai'] },
      { id: 'c', text: 'Intermediate', paths: ['ml-specialist', 'nlp-track', 'computer-vision'] },
      { id: 'd', text: 'Advanced', paths: ['deep-learning'] }
    ]
  },
  {
    id: 2,
    question: 'What aspect of AI interests you most?',
    options: [
      { id: 'a', text: 'Understanding the business implications', paths: ['ai-business'] },
      { id: 'b', text: 'Building practical applications', paths: ['general-ai', 'ml-specialist'] },
      { id: 'c', text: 'Working with text and language', paths: ['nlp-track'] },
      { id: 'd', text: 'Image and video processing', paths: ['computer-vision'] },
      { id: 'e', text: 'Neural network architecture and design', paths: ['deep-learning'] }
    ]
  },
  {
    id: 3,
    question: 'How much time can you dedicate to learning each week?',
    options: [
      { id: 'a', text: 'Less than 5 hours', paths: ['ai-business', 'general-ai'] },
      { id: 'b', text: '5-10 hours', paths: ['general-ai', 'ml-specialist', 'nlp-track', 'computer-vision'] },
      { id: 'c', text: '10-15 hours', paths: ['ml-specialist', 'nlp-track', 'computer-vision', 'deep-learning'] },
      { id: 'd', text: '15+ hours', paths: ['deep-learning'] }
    ]
  },
  {
    id: 4,
    question: 'What is your goal after completing this course?',
    options: [
      { id: 'a', text: 'Better decision-making for my business', paths: ['ai-business'] },
      { id: 'b', text: 'Start a career in AI', paths: ['general-ai', 'ml-specialist'] },
      { id: 'c', text: 'Specialize in a specific AI domain', paths: ['nlp-track', 'computer-vision', 'deep-learning'] },
      { id: 'd', text: 'Apply AI to research problems', paths: ['deep-learning', 'ml-specialist'] }
    ]
  },
  {
    id: 5,
    question: 'What is your math background?',
    options: [
      { id: 'a', text: 'Basic or high school level', paths: ['ai-business', 'general-ai'] },
      { id: 'b', text: 'College-level statistics', paths: ['general-ai', 'ml-specialist', 'nlp-track', 'computer-vision'] },
      { id: 'c', text: 'Advanced (linear algebra, calculus)', paths: ['ml-specialist', 'deep-learning'] },
      { id: 'd', text: 'Research level mathematics', paths: ['deep-learning'] }
    ]
  }
];

const LearningPathSelector: React.FC<LearningPathSelectorProps> = ({
  onPathSelect,
  initialAssessmentCompleted = false
}) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [showAssessment, setShowAssessment] = useState<boolean>(!initialAssessmentCompleted);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [assessmentCompleted, setAssessmentCompleted] = useState<boolean>(initialAssessmentCompleted);
  const [recommendedPaths, setRecommendedPaths] = useState<string[]>([]);
  
  // Calculate progress percentage for assessment
  const progressPercentage = (currentQuestion / assessmentQuestions.length) * 100;
  
  // Handle answer selection
  const handleAnswerSelect = (questionId: number, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };
  
  // Handle navigation through assessment
  const handleNextQuestion = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Process answers to generate recommendations
      const pathScores: Record<string, number> = {};
      
      // Calculate scores for each path based on answers
      Object.entries(answers).forEach(([questionId, optionId]) => {
        const question = assessmentQuestions.find(q => q.id === parseInt(questionId));
        if (question) {
          const selectedOption = question.options.find(o => o.id === optionId);
          if (selectedOption) {
            selectedOption.paths.forEach(path => {
              pathScores[path] = (pathScores[path] || 0) + 1;
            });
          }
        }
      });
      
      // Sort paths by score
      const sortedPaths = Object.entries(pathScores)
        .sort((a, b) => b[1] - a[1])
        .map(([path]) => path);
      
      // Set recommended paths
      setRecommendedPaths(sortedPaths);
      setAssessmentCompleted(true);
      setShowAssessment(false);
      
      // Auto-select the top recommended path
      if (sortedPaths.length > 0) {
        setSelectedPath(sortedPaths[0]);
        if (onPathSelect) {
          onPathSelect(sortedPaths[0]);
        }
      }
    }
  };
  
  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Handle path selection
  const handleSelectPath = (pathId: string) => {
    setSelectedPath(pathId);
    if (onPathSelect) {
      onPathSelect(pathId);
    }
  };
  
  // Get the current question
  const currentAssessmentQuestion = assessmentQuestions[currentQuestion];
  
  // Filter paths based on recommendations if assessment is complete
  const displayPaths = assessmentCompleted && recommendedPaths.length > 0
    ? learningPaths.filter(path => recommendedPaths.includes(path.id))
    : sortedPaths;

  return (
    <div className="space-y-6">
      {showAssessment ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">Learning Path Assessment</h3>
            <p className="text-gray-400 mb-6">
              Let's find the best learning path for you. Answer these questions about your background and goals.
            </p>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Question {currentQuestion + 1} of {assessmentQuestions.length}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-gray-700" />
            </div>
            
            <div className="mb-8">
              <h4 className="text-lg font-medium mb-4">{currentAssessmentQuestion.question}</h4>
              <div className="space-y-3">
                {currentAssessmentQuestion.options.map(option => (
                  <div 
                    key={option.id}
                    onClick={() => handleAnswerSelect(currentAssessmentQuestion.id, option.id)}
                    className={cn(
                      "p-4 rounded-lg cursor-pointer transition-all duration-200",
                      answers[currentAssessmentQuestion.id] === option.id
                        ? "bg-electric-cyan-900/30 border border-electric-cyan-500"
                        : "bg-gray-750 border border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "w-5 h-5 rounded-full mr-3 flex items-center justify-center border",
                        answers[currentAssessmentQuestion.id] === option.id
                          ? "border-electric-cyan-400 bg-electric-cyan-400/20"
                          : "border-gray-600"
                      )}>
                        {answers[currentAssessmentQuestion.id] === option.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-electric-cyan-400" />
                        )}
                      </div>
                      <span>{option.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={!answers[currentAssessmentQuestion.id]}
                className="bg-electric-cyan-600 hover:bg-electric-cyan-700"
              >
                {currentQuestion === assessmentQuestions.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <>
          {assessmentCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
                  <h3 className="text-xl font-bold">Assessment Complete</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Based on your responses, we've identified the following learning paths that best match your goals and background.
                </p>
                <div className="p-4 bg-gray-750 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    <h4 className="font-bold">Top Recommendation</h4>
                  </div>
                  <p className="text-electric-cyan-400 font-medium">
                    {learningPaths.find(p => p.id === recommendedPaths[0])?.name}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Select a learning path below to get started or take the assessment again for a different recommendation.
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAssessment(true);
                      setCurrentQuestion(0);
                      setAnswers({});
                    }}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Retake Assessment
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className={cn(
                    "bg-gray-800 border-gray-700 p-6 h-full transition-all duration-300 hover:shadow-lg",
                    selectedPath === path.id ? "ring-2 ring-electric-cyan-400" : "",
                    recommendedPaths[0] === path.id ? "border-electric-cyan-400" : ""
                  )}
                  onClick={() => handleSelectPath(path.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                        path.skillLevel === 'beginner' ? "bg-green-900/50 text-green-400" :
                        path.skillLevel === 'intermediate' ? "bg-blue-900/50 text-blue-400" :
                        "bg-purple-900/50 text-purple-400"
                      )}>
                        {path.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{path.name}</h3>
                        <div className="flex items-center">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            path.skillLevel === 'beginner' ? "bg-green-900/50 text-green-400" :
                            path.skillLevel === 'intermediate' ? "bg-blue-900/50 text-blue-400" :
                            "bg-purple-900/50 text-purple-400"
                          )}>
                            {path.skillLevel.charAt(0).toUpperCase() + path.skillLevel.slice(1)}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">{path.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    {path.matchScore && (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full border-2 border-electric-cyan-400 flex items-center justify-center">
                          <span className="font-bold text-sm">{path.matchScore}%</span>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">Match</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{path.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Topics Covered</h4>
                      <div className="flex flex-wrap gap-2">
                        {path.topics.map(topic => (
                          <span 
                            key={topic} 
                            className="text-xs bg-gray-750 text-gray-300 px-2 py-1 rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Prerequisites</h4>
                      <ul className="text-xs text-gray-300 list-disc list-inside">
                        {path.prerequisites.map(prereq => (
                          <li key={prereq}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Button 
                    className={cn(
                      "w-full",
                      selectedPath === path.id 
                        ? "bg-electric-cyan-600 hover:bg-electric-cyan-700" 
                        : "bg-gray-700 hover:bg-gray-600"
                    )}
                    onClick={() => handleSelectPath(path.id)}
                  >
                    {selectedPath === path.id ? (
                      <>Selected <CheckCircle className="ml-2 h-4 w-4" /></>
                    ) : (
                      <>Choose This Path <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LearningPathSelector;