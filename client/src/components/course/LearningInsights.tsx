import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  BookOpen, 
  BrainCircuit, 
  Clock, 
  Lightbulb, 
  BarChart4, 
  Target, 
  Zap, 
  TrendingUp, 
  Star, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { aiCourseStructure } from '@/data/courseStructure';
import axios from 'axios';

interface LearningStrength {
  area: string;
  score: number;
  details: string;
}

interface LearningInsightsData {
  strengths: string[];
  improvementAreas: string[];
  learningStyle: string;
  nextSteps: string[];
  achievements: string[];
}

interface QuizPerformance {
  moduleId: string;
  lessonId: string;
  title: string;
  score: number;
  totalPossible: number;
  completedAt: string;
}

interface LearningPatternProps {
  userId?: string;
}

const LearningInsights: React.FC<LearningPatternProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [insightsData, setInsightsData] = useState<LearningInsightsData | null>(null);
  const [quizzes, setQuizzes] = useState<QuizPerformance[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [learningStrengths, setLearningStrengths] = useState<LearningStrength[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { toast } = useToast();

  // Fetch learning data from local storage or API
  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setIsLoading(true);
        
        // For demo purposes, get data from localStorage
        // In a production app, this would come from the API
        const progressString = localStorage.getItem('course_progress');
        if (!progressString) {
          // No progress data available
          setIsLoading(false);
          return;
        }
        
        const progressData = JSON.parse(progressString);
        
        // Extract completed lessons
        setCompletedLessons(progressData.completedLessons || []);
        
        // Transform quiz scores into our format
        const quizData: QuizPerformance[] = [];
        for (const [lessonId, scoreData] of Object.entries(progressData.quizScores || {})) {
          // Find the corresponding module and lesson
          for (const module of aiCourseStructure) {
            const lesson = module.lessons.find(l => l.id === lessonId);
            if (lesson) {
              quizData.push({
                moduleId: module.id,
                lessonId,
                title: lesson.title,
                score: (scoreData as any).score,
                totalPossible: (scoreData as any).totalPossible,
                completedAt: (scoreData as any).completedAt,
              });
              break;
            }
          }
        }
        setQuizzes(quizData);
        
        // Try to get AI insights from API
        try {
          // Prepare user history for the API
          const userHistory = [{
            courseId: 'master-ai',
            completedLessons: progressData.completedLessons || [],
            quizScores: progressData.quizScores || {},
            timeSpent: progressData.totalTimeSpent || 0
          }];
          
          const response = await axios.post('/api/recommendations/insights', {
            userHistory,
            courseModules: aiCourseStructure
          });
          
          setInsightsData(response.data);
        } catch (error) {
          console.error('Error fetching AI insights:', error);
          // Generate fallback insights locally
          generateFallbackInsights(progressData, quizData);
        }
        
        // Generate strengths data based on quiz performance
        generateStrengthsData(quizData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading learning data:', error);
        setIsLoading(false);
        toast({
          title: 'Error loading data',
          description: 'There was a problem loading your learning data',
          variant: 'destructive',
        });
      }
    };
    
    fetchLearningData();
  }, [toast]);
  
  // Generate fallback insights when API is not available
  const generateFallbackInsights = (progressData: any, quizData: QuizPerformance[]) => {
    // Calculate quiz performance
    const averageQuizScore = quizData.length > 0
      ? quizData.reduce((sum, quiz) => sum + (quiz.score / quiz.totalPossible) * 100, 0) / quizData.length
      : 0;
    
    // Generate basic insights based on available data
    const insights: LearningInsightsData = {
      strengths: [
        'Consistent learning pattern throughout the course',
        'Strong performance in theoretical concepts'
      ],
      improvementAreas: [
        'Consider spending more time on practical coding exercises',
        'Review deep learning fundamentals before attempting advanced modules'
      ],
      learningStyle: 'Visual and text-based learning seem to be your preferred formats',
      nextSteps: [
        'Complete the "Neural Network Fundamentals" lesson',
        'Practice with the coding exercises in the Deep Learning module',
        'Revisit quizzes where you scored less than 80%'
      ],
      achievements: [
        `Completed ${progressData.completedLessons?.length || 0} lessons`,
        `Maintained a ${progressData.currentStreak || 0}-day learning streak`,
        `Achieved an average quiz score of ${Math.round(averageQuizScore)}%`
      ]
    };
    
    setInsightsData(insights);
  };
  
  // Generate strengths data based on quiz performance
  const generateStrengthsData = (quizData: QuizPerformance[]) => {
    // Group quiz results by topic area
    const moduleResults: Record<string, { total: number; correct: number; count: number }> = {};
    
    // Calculate scores by module
    quizData.forEach(quiz => {
      const module = aiCourseStructure.find(m => m.id === quiz.moduleId);
      if (module) {
        if (!moduleResults[module.title]) {
          moduleResults[module.title] = { total: 0, correct: 0, count: 0 };
        }
        
        moduleResults[module.title].total += quiz.totalPossible;
        moduleResults[module.title].correct += quiz.score;
        moduleResults[module.title].count += 1;
      }
    });
    
    // Convert to learning strengths
    const strengths: LearningStrength[] = Object.entries(moduleResults).map(([area, data]) => {
      const score = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      return {
        area,
        score,
        details: `Based on ${data.count} quiz${data.count !== 1 ? 'zes' : ''} with an average score of ${Math.round(score)}%`
      };
    });
    
    // Add some additional strengths if we don't have many
    if (strengths.length < 3) {
      if (completedLessons.length > 0) {
        strengths.push({
          area: 'Consistent Learning',
          score: 85,
          details: `You've completed ${completedLessons.length} lessons, showing good progression`
        });
      }
    }
    
    setLearningStrengths(strengths);
  };
  
  // Calculate progress through the entire course
  const calculateOverallProgress = (): number => {
    const totalLessons = aiCourseStructure.reduce((total, module) => total + module.lessons.length, 0);
    return totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
  };
  
  // Calculate the average quiz score
  const calculateAverageQuizScore = (): number => {
    if (quizzes.length === 0) return 0;
    
    const totalScore = quizzes.reduce((sum, quiz) => sum + (quiz.score / quiz.totalPossible), 0);
    return (totalScore / quizzes.length) * 100;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analyzing Your Learning Patterns</CardTitle>
          <CardDescription>Please wait while we process your learning data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render empty state if no learning data
  if (completedLessons.length === 0 && quizzes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Learning Insights</CardTitle>
          <CardDescription>Complete lessons and quizzes to generate personalized learning insights</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <BrainCircuit className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">
            As you progress through the course, we'll analyze your learning patterns and provide
            personalized recommendations to help you learn more effectively.
          </p>
          <Button variant="outline">Start Learning Now</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Learning Insights</span>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          AI-powered analysis of your learning patterns and performance
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">
              <BarChart className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="strengths" className="flex-1">
              <Star className="mr-2 h-4 w-4" />
              Strengths
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex-1">
              <Lightbulb className="mr-2 h-4 w-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          <TabsContent value="overview" className="mt-0">
            <div className="space-y-6">
              {/* Progress Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <BarChart4 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Course Progress</p>
                    <div className="flex items-center">
                      <p className="text-xl font-bold mr-2">{Math.round(calculateOverallProgress())}%</p>
                      <Progress value={calculateOverallProgress()} className="h-2 w-20" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lessons Completed</p>
                    <p className="text-xl font-bold">
                      {completedLessons.length} / {aiCourseStructure.reduce((total, module) => total + module.lessons.length, 0)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full mr-4">
                    <Star className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quiz Performance</p>
                    <p className="text-xl font-bold">{Math.round(calculateAverageQuizScore())}%</p>
                  </div>
                </div>
              </div>
              
              {/* AI Insights */}
              {insightsData && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b flex items-center">
                    <BrainCircuit className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium">AI-Generated Learning Insights</h3>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* Learning Style */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Your Learning Style</h4>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="flex">
                          <Sparkles className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <p>{insightsData.learningStyle}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Strengths */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Your Strengths</h4>
                      <ul className="space-y-2">
                        {insightsData.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Areas for Improvement */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Areas for Improvement</h4>
                      <ul className="space-y-2">
                        {insightsData.improvementAreas.map((area, index) => (
                          <li key={index} className="flex items-start">
                            <TrendingUp className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Achievements */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Your Achievements</h4>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <ul className="space-y-2">
                          {insightsData.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quiz Performance */}
              {quizzes.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Quiz Performance</h3>
                  <div className="border rounded-lg divide-y">
                    {quizzes.map((quiz) => (
                      <div key={quiz.lessonId} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{quiz.title}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(quiz.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`${
                            (quiz.score / quiz.totalPossible) * 100 >= 80
                              ? 'bg-green-100 text-green-800'
                              : (quiz.score / quiz.totalPossible) * 100 >= 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {Math.round((quiz.score / quiz.totalPossible) * 100)}%
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Score: {quiz.score}/{quiz.totalPossible}</span>
                            <span>{Math.round((quiz.score / quiz.totalPossible) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(quiz.score / quiz.totalPossible) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="strengths" className="mt-0">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium flex items-center">
                  <Star className="h-5 w-5 text-blue-600 mr-2" />
                  Your Learning Strengths
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Based on your quiz performance and learning patterns, we've identified these key areas where you excel:
                </p>
              </div>
              
              {learningStrengths.length > 0 ? (
                <div className="space-y-4">
                  {learningStrengths.map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{strength.area}</h4>
                        <Badge className={`${
                          strength.score >= 90 ? 'bg-green-100 text-green-800' :
                          strength.score >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {Math.round(strength.score)}%
                        </Badge>
                      </div>
                      <div className="mt-2 mb-3">
                        <Progress value={strength.score} className="h-2" />
                      </div>
                      <p className="text-sm text-gray-600">{strength.details}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BrainCircuit className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Complete more quizzes to generate detailed insights about your learning strengths
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-0">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium flex items-center">
                  <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                  Personalized Recommendations
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Based on your learning patterns, here are personalized recommendations to help you maximize your learning:
                </p>
              </div>
              
              {insightsData && insightsData.nextSteps.length > 0 ? (
                <div className="space-y-4">
                  {insightsData.nextSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
                          {index === 0 ? (
                            <Target className="h-5 w-5 text-blue-600" />
                          ) : index === 1 ? (
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Zap className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{step}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {index === 0 ? 'High priority recommendation based on your learning patterns' :
                             index === 1 ? 'This will help reinforce concepts you\'re currently learning' :
                             'Recommended to address areas for improvement'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Continue learning to receive personalized recommendations
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="border-t pt-6">
        <p className="text-sm text-gray-500">
          These insights are generated using AI based on your learning patterns and performance.
          Continue making progress to receive more personalized recommendations.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LearningInsights;