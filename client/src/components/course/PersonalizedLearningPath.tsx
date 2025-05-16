import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  BarChart3, 
  Code, 
  Globe, 
  LayoutDashboard, 
  PieChart, 
  Server, 
  Sparkles, 
  Star
} from 'lucide-react';

// Define types for our component props
interface LearningPath {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  matchScore: number;
  skills: string[];
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  popularity: number;
}

interface CourseRecommendation {
  id: number;
  title: string;
  thumbnail?: string;
  matchScore: number;
  description: string;
  estimatedHours: number;
  prerequisites: string[];
}

interface PersonalizedLearningPathProps {
  userPreferences?: {
    interests: string[];
    goals: string[];
    currentSkillLevel: string;
    timeCommitment: string;
  };
  hasCompletedAssessment: boolean;
  onStartAssessment: () => void;
  onSelectPath: (pathId: string) => void;
}

const PersonalizedLearningPath: React.FC<PersonalizedLearningPathProps> = ({
  userPreferences,
  hasCompletedAssessment = false,
  onStartAssessment,
  onSelectPath
}) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('paths');
  const [isAnimating, setIsAnimating] = useState(false);

  // Sample learning paths
  const learningPaths: LearningPath[] = [
    {
      id: 'data-science',
      name: 'Data Science',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Master data analysis, visualization, and machine learning for insights from complex datasets.',
      matchScore: 95,
      skills: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
      estimatedHours: 120,
      difficulty: 'Intermediate',
      popularity: 90
    },
    {
      id: 'ml-engineer',
      name: 'ML Engineering',
      icon: <Brain className="w-5 h-5" />,
      description: 'Build and deploy scalable machine learning systems and infrastructure.',
      matchScore: 87,
      skills: ['Python', 'TensorFlow/PyTorch', 'MLOps', 'Cloud Infrastructure'],
      estimatedHours: 160,
      difficulty: 'Advanced',
      popularity: 85
    },
    {
      id: 'ai-product',
      name: 'AI Product',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Learn to design, develop and manage AI-powered products and services.',
      matchScore: 82,
      skills: ['Product Management', 'AI Ethics', 'UX for AI', 'Project Planning'],
      estimatedHours: 100,
      difficulty: 'Intermediate',
      popularity: 75
    },
    {
      id: 'nlp-specialist',
      name: 'NLP Specialist',
      icon: <Globe className="w-5 h-5" />,
      description: 'Specialize in processing, understanding and generating human language with AI.',
      matchScore: 78,
      skills: ['Python', 'Linguistics', 'Transformers', 'LLM Frameworks'],
      estimatedHours: 140,
      difficulty: 'Advanced',
      popularity: 80
    },
    {
      id: 'ai-coding',
      name: 'AI Coding',
      icon: <Code className="w-5 h-5" />,
      description: 'Master the integration of AI capabilities into software applications.',
      matchScore: 73,
      skills: ['Python/JavaScript', 'API Integration', 'Prompt Engineering', 'Software Design'],
      estimatedHours: 110,
      difficulty: 'Intermediate',
      popularity: 85
    },
    {
      id: 'ai-infra',
      name: 'AI Infrastructure',
      icon: <Server className="w-5 h-5" />,
      description: 'Build and manage the infrastructure needed for AI systems at scale.',
      matchScore: 68,
      skills: ['Cloud Computing', 'Kubernetes', 'GPU Optimization', 'ML System Design'],
      estimatedHours: 150,
      difficulty: 'Advanced',
      popularity: 70
    }
  ];

  // Sample course recommendations
  const courseRecommendations: CourseRecommendation[] = [
    {
      id: 101,
      title: 'Practical Machine Learning with Python',
      matchScore: 98,
      description: 'A hands-on approach to machine learning fundamentals using Python and scikit-learn.',
      estimatedHours: 40,
      prerequisites: ['Basic Python', 'Statistics Fundamentals']
    },
    {
      id: 102,
      title: 'Deep Learning Fundamentals',
      matchScore: 92,
      description: 'Understanding neural networks and deep learning architectures from first principles.',
      estimatedHours: 50,
      prerequisites: ['Machine Learning Basics', 'Linear Algebra']
    },
    {
      id: 103,
      title: 'Natural Language Processing with Transformers',
      matchScore: 87,
      description: 'Working with state-of-the-art language models for text processing tasks.',
      estimatedHours: 45,
      prerequisites: ['Python', 'Machine Learning Basics']
    },
    {
      id: 104,
      title: 'AI Ethics and Responsible Implementation',
      matchScore: 85,
      description: 'Understanding the ethical considerations and best practices in AI system development.',
      estimatedHours: 30,
      prerequisites: ['None']
    }
  ];

  // When a path is selected
  const handlePathSelect = (pathId: string) => {
    setIsAnimating(true);
    setSelectedPath(pathId);
    setTimeout(() => {
      setIsExpanded(true);
      setIsAnimating(false);
    }, 300);
    onSelectPath(pathId);
  };

  // Generate difficulty badge based on level
  const getDifficultyBadge = (difficulty: 'Beginner' | 'Intermediate' | 'Advanced') => {
    const colors = {
      Beginner: 'bg-green-900/60 text-green-400',
      Intermediate: 'bg-blue-900/60 text-blue-400',
      Advanced: 'bg-purple-900/60 text-purple-400'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[difficulty]}`}>
        {difficulty}
      </span>
    );
  };

  // If the user hasn't completed the assessment
  if (!hasCompletedAssessment) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-16 h-16 rounded-full bg-electric-cyan-500/20 flex items-center justify-center mb-4"
          >
            <Sparkles className="w-8 h-8 text-electric-cyan-400" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2">Personalized Learning Path</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Take a quick assessment to discover your optimal learning path and get tailored course recommendations.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={onStartAssessment}
              className="bg-electric-cyan-600 hover:bg-electric-cyan-700"
            >
              Start Assessment
            </Button>
          </motion.div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-6 overflow-hidden">
      <Tabs defaultValue="paths" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold">Your Learning Path</h3>
            <p className="text-gray-400">Personalized recommendations based on your profile</p>
          </div>
          <TabsList className="bg-gray-700">
            <TabsTrigger value="paths" className="data-[state=active]:bg-electric-cyan-500">
              <LayoutDashboard className="w-4 h-4 mr-1" />
              Paths
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-electric-cyan-500">
              <Brain className="w-4 h-4 mr-1" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-electric-cyan-500">
              <Star className="w-4 h-4 mr-1" />
              Skills
            </TabsTrigger>
          </TabsList>
        </div>

        {userPreferences && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-gray-700/50 p-3 rounded-md flex flex-wrap gap-3"
          >
            {userPreferences.interests.map((interest, i) => (
              <span key={i} className="text-xs bg-electric-cyan-500/20 text-electric-cyan-400 px-2 py-1 rounded-full">
                {interest}
              </span>
            ))}
            {userPreferences.goals.map((goal, i) => (
              <span key={i} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                {goal}
              </span>
            ))}
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
              Level: {userPreferences.currentSkillLevel}
            </span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              Time: {userPreferences.timeCommitment}
            </span>
          </motion.div>
        )}

        <TabsContent value="paths" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {learningPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`${
                    selectedPath && selectedPath !== path.id && isExpanded ? 'hidden' : ''
                  } ${selectedPath === path.id && isExpanded ? 'md:col-span-2 lg:col-span-3' : ''}`}
                >
                  <Card 
                    className={`bg-gray-750 border-gray-700 p-4 h-full transition-all duration-300 ${
                      selectedPath === path.id ? 'ring-2 ring-electric-cyan-400' : 'hover:bg-gray-700 cursor-pointer'
                    }`}
                    onClick={() => selectedPath !== path.id && handlePathSelect(path.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-md mr-3 ${
                          selectedPath === path.id ? 'bg-electric-cyan-500/30' : 'bg-gray-700'
                        }`}>
                          {path.icon}
                        </div>
                        <div>
                          <h4 className="font-bold">{path.name}</h4>
                          <div className="flex items-center mt-1">
                            <div className="w-8 h-8 rounded-full bg-electric-cyan-500/30 flex items-center justify-center mr-2">
                              <span className="text-xs font-bold">{path.matchScore}%</span>
                            </div>
                            <span className="text-sm text-gray-400">match with your profile</span>
                          </div>
                        </div>
                      </div>
                      {getDifficultyBadge(path.difficulty)}
                    </div>

                    <p className="text-sm text-gray-300 mt-3 mb-4">
                      {path.description}
                    </p>

                    {selectedPath === path.id && isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-800/50 p-3 rounded-md">
                            <h5 className="text-sm font-medium mb-2">Key Skills</h5>
                            <div className="flex flex-wrap gap-2">
                              {path.skills.map((skill, i) => (
                                <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="bg-gray-800/50 p-3 rounded-md">
                            <h5 className="text-sm font-medium mb-2">Path Details</h5>
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Estimated Duration:</span>
                                <span>{path.estimatedHours} hours</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Difficulty:</span>
                                <span>{path.difficulty}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Popularity:</span>
                                <div className="flex items-center">
                                  <Progress value={path.popularity} className="w-20 h-2 mr-2" />
                                  <span>{path.popularity}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                          <Button 
                            variant="outline" 
                            className="border-gray-600 text-gray-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPath(null);
                              setIsExpanded(false);
                            }}
                          >
                            Back to Paths
                          </Button>
                          <Button 
                            className="bg-electric-cyan-600 hover:bg-electric-cyan-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle enrollment
                              console.log(`Enrolled in ${path.name} path`);
                            }}
                          >
                            Start This Path
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {(selectedPath !== path.id || !isExpanded) && (
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-400">Est. Duration:</span> {path.estimatedHours} hours
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-electric-cyan-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePathSelect(path.id);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseRecommendations.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-gray-750 border-gray-700 p-4 h-full hover:bg-gray-700 transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-lg">{course.title}</h4>
                    <div className="bg-electric-cyan-500/30 text-white text-xs px-2 py-1 rounded-full">
                      {course.matchScore}% match
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{course.description}</p>
                  
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>Prerequisites:</span>
                    <span>{course.prerequisites.join(', ')}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span>Duration:</span>
                    <span>{course.estimatedHours} hours</span>
                  </div>
                  
                  <Button 
                    className="w-full bg-electric-cyan-600 hover:bg-electric-cyan-700"
                  >
                    View Course
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="bg-gray-750 border-gray-700 p-6 rounded-lg">
            <h4 className="text-lg font-bold mb-4">Your Skill Analysis</h4>
            <p className="text-gray-400 mb-6">
              Based on your assessment, here's your skill breakdown and recommended areas for improvement.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium mb-3">Current Strengths</h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Python Programming</span>
                      <span className="text-electric-cyan-400">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Statistics</span>
                      <span className="text-electric-cyan-400">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Visualization</span>
                      <span className="text-electric-cyan-400">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-3">Recommended Focus Areas</h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Machine Learning</span>
                      <span className="text-amber-400">45%</span>
                    </div>
                    <Progress value={45} className="h-2 bg-gray-700">
                      <div className="h-full bg-amber-500 transition-all" style={{ width: '45%' }}></div>
                    </Progress>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Neural Networks</span>
                      <span className="text-amber-400">38%</span>
                    </div>
                    <Progress value={38} className="h-2 bg-gray-700">
                      <div className="h-full bg-amber-500 transition-all" style={{ width: '38%' }}></div>
                    </Progress>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>MLOps</span>
                      <span className="text-amber-400">30%</span>
                    </div>
                    <Progress value={30} className="h-2 bg-gray-700">
                      <div className="h-full bg-amber-500 transition-all" style={{ width: '30%' }}></div>
                    </Progress>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h5 className="text-sm font-medium mb-3">Skill Gap Analysis</h5>
              <div className="bg-gray-800/70 p-4 rounded-md">
                <p className="text-sm mb-3">
                  Your profile shows strong foundations in programming and data analysis, but you would benefit from developing deeper expertise in machine learning algorithms and model deployment. 
                </p>
                <Button className="bg-electric-cyan-600 hover:bg-electric-cyan-700">
                  View Personalized Skill Plan
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PersonalizedLearningPath;