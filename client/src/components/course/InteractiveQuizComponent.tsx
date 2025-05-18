import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, HelpCircle, BarChart, Trophy, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
}

interface QuizProps {
  moduleId: string;
  lessonId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, totalPossible: number) => void;
}

const InteractiveQuizComponent: React.FC<QuizProps> = ({
  moduleId,
  lessonId,
  title,
  description,
  questions,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const totalPossiblePoints = questions.reduce((total, q) => total + q.points, 0);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && !quizCompleted) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, quizCompleted]);

  const handleAnswerSelect = (index: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      toast({
        title: "Please select an answer",
        description: "You need to select an option before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsAnswerSubmitted(true);
    
    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
    
    // Update score if correct
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prevScore => prevScore + currentQuestion.points);
      // Play sound effect for correct answer
      playCorrectSound();
    } else {
      // Play sound effect for incorrect answer
      playIncorrectSound();
    }
    
    // Pause timer while showing explanation
    setTimerActive(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setTimerActive(true);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    
    // Calculate final score percentage
    const scorePercentage = Math.round((score / totalPossiblePoints) * 100);
    
    // Trigger confetti for good scores
    if (scorePercentage >= 70) {
      triggerConfetti();
    }
    
    // Notify parent component
    if (onComplete) {
      onComplete(score, totalPossiblePoints);
    }
    
    // Show completion toast
    toast({
      title: `Quiz Completed!`,
      description: `You scored ${score} out of ${totalPossiblePoints} points (${scorePercentage}%)`,
      variant: scorePercentage >= 70 ? "default" : "destructive",
    });
    
    // Save results to local storage
    saveQuizResults();
  };

  const saveQuizResults = () => {
    const results = {
      moduleId,
      lessonId,
      score,
      totalPossiblePoints,
      answers,
      timeSpent,
      completedAt: new Date().toISOString(),
    };
    
    try {
      // Get existing quiz results
      const existingResultsString = localStorage.getItem('quiz_results');
      const existingResults = existingResultsString ? JSON.parse(existingResultsString) : [];
      
      // Add new result
      existingResults.push(results);
      
      // Save back to localStorage
      localStorage.setItem('quiz_results', JSON.stringify(existingResults));
      
      // Also store best scores separately for quick access
      const quizKey = `${moduleId}_${lessonId}`;
      const bestScores = JSON.parse(localStorage.getItem('quiz_best_scores') || '{}');
      
      if (!bestScores[quizKey] || bestScores[quizKey] < score) {
        bestScores[quizKey] = score;
        localStorage.setItem('quiz_best_scores', JSON.stringify(bestScores));
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const playCorrectSound = () => {
    try {
      const audio = new Audio('/sounds/correct-answer.mp3');
      audio.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const playIncorrectSound = () => {
    try {
      const audio = new Audio('/sounds/incorrect-answer.mp3');
      audio.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Results screen if quiz is completed
  if (quizCompleted) {
    const scorePercentage = Math.round((score / totalPossiblePoints) * 100);
    let resultMessage = '';
    let resultIcon = <AlertCircle className="h-12 w-12 text-gray-400" />;
    
    if (scorePercentage >= 90) {
      resultMessage = 'Excellent! You\'ve mastered this material!';
      resultIcon = <Trophy className="h-12 w-12 text-yellow-500" />;
    } else if (scorePercentage >= 70) {
      resultMessage = 'Great job! You have a solid understanding.';
      resultIcon = <CheckCircle className="h-12 w-12 text-green-500" />;
    } else if (scorePercentage >= 50) {
      resultMessage = 'Good effort. Review the material to improve.';
      resultIcon = <AlertCircle className="h-12 w-12 text-orange-500" />;
    } else {
      resultMessage = 'Keep practicing. Review the course material and try again.';
      resultIcon = <XCircle className="h-12 w-12 text-red-500" />;
    }
    
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title} - Results</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            {resultIcon}
            <h3 className="text-xl font-semibold mt-4">{resultMessage}</h3>
            <div className="flex items-center mt-4">
              <BarChart className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-lg font-bold">
                {score} / {totalPossiblePoints} points ({scorePercentage}%)
              </span>
            </div>
            <div className="flex items-center mt-2">
              <Timer className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-sm">Completed in {formatTime(timeSpent)}</span>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h3 className="font-semibold mb-4">Question Review:</h3>
          <div className="space-y-4">
            {questions.map((q, index) => {
              const isCorrect = answers[index] === q.correctAnswer;
              return (
                <div key={q.id} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-start">
                    <div className="mr-2 mt-1">
                      {isCorrect ? 
                        <CheckCircle className="h-5 w-5 text-green-500" /> : 
                        <XCircle className="h-5 w-5 text-red-500" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{index + 1}. {q.question}</p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Your answer:</span> {answers[index] !== null ? q.options[answers[index]] : 'No answer'}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm mt-1">
                          <span className="font-medium">Correct answer:</span> {q.options[q.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm mt-2 text-gray-600">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              setCurrentQuestionIndex(0);
              setSelectedAnswer(null);
              setIsAnswerSubmitted(false);
              setScore(0);
              setAnswers(Array(questions.length).fill(null));
              setTimeSpent(0);
              setQuizCompleted(false);
              setTimerActive(true);
            }}
            className="mb-2 sm:mb-0"
          >
            Retake Quiz
          </Button>
          <Button 
            onClick={() => {
              // Here you would navigate to the next lesson
              // For now just showing a toast
              toast({
                title: "Moving to next lesson",
                description: "This functionality would navigate to the next lesson",
              });
            }}
          >
            Continue to Next Lesson
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center">
            <Badge variant="outline" className="ml-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="outline" className="ml-2">
              <Timer className="h-4 w-4 mr-1" />
              {formatTime(timeSpent)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
              <Badge className={`${getDifficultyColor(currentQuestion.difficulty)}`}>
                {currentQuestion.difficulty}
              </Badge>
            </div>
            
            <div className="mb-6">
              <Badge variant="outline" className="text-xs">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </Badge>
            </div>
            
            <RadioGroup value={selectedAnswer?.toString()} className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedAnswer === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  } ${
                    isAnswerSubmitted && index === currentQuestion.correctAnswer ? 'border-green-500 bg-green-50' : ''
                  } ${
                    isAnswerSubmitted && selectedAnswer === index && index !== currentQuestion.correctAnswer ? 'border-red-500 bg-red-50' : ''
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`} 
                    disabled={isAnswerSubmitted}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`option-${index}`}
                      className={`flex items-center text-base font-medium cursor-pointer ${
                        isAnswerSubmitted && index === currentQuestion.correctAnswer ? 'text-green-700' : ''
                      } ${
                        isAnswerSubmitted && selectedAnswer === index && index !== currentQuestion.correctAnswer ? 'text-red-700' : ''
                      }`}
                    >
                      {option}
                    </Label>
                  </div>
                  {isAnswerSubmitted && (
                    <div className="ml-2">
                      {index === currentQuestion.correctAnswer ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        selectedAnswer === index && <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </RadioGroup>
            
            {isAnswerSubmitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg"
              >
                <h4 className="font-semibold mb-1">Explanation:</h4>
                <p>{currentQuestion.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isAnswerSubmitted ? (
          <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        )}
        <div className="flex items-center">
          <Badge variant="outline" className="ml-2">
            Score: {score}/{totalPossiblePoints}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
};

export default InteractiveQuizComponent;