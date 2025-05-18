import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Clock, Award, ArrowRight, RotateCcw, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  explanation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
}

interface QuizProps {
  moduleId: string;
  lessonId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  onComplete: (score: number, totalPoints: number, passed: boolean) => void;
  onExit?: () => void;
  passThreshold?: number; // Percentage required to pass the quiz (0-100)
  timeLimit?: number; // Time limit in seconds, if any
}

const InteractiveQuiz: React.FC<QuizProps> = ({
  moduleId,
  lessonId,
  title,
  description,
  questions,
  onComplete,
  onExit,
  passThreshold = 70,
  timeLimit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [showExplanation, setShowExplanation] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  
  const totalPoints = questions.reduce((total, q) => total + q.points, 0);
  const currentQuestion = questions[currentQuestionIndex];
  
  // Timer effect
  useEffect(() => {
    if (timeLimit && timeRemaining && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (!prev || prev <= 1) {
            clearInterval(timer);
            if (!quizCompleted && !reviewMode) {
              handleQuizComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeLimit, timeRemaining, quizCompleted, reviewMode]);
  
  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    if (!timeRemaining) return '';
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle option selection
  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (submitted || reviewMode) return;
    
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  // Submit current question answer
  const handleSubmit = () => {
    if (!selectedOptions[currentQuestion.id] || submitted) return;
    
    setSubmitted(true);
    
    // Check if the selected option is correct
    const selectedOption = currentQuestion.options.find(
      option => option.id === selectedOptions[currentQuestion.id]
    );
    
    if (selectedOption?.isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }
  };
  
  // Move to the next question
  const handleNextQuestion = () => {
    setSubmitted(false);
    setShowExplanation(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (!quizCompleted) {
      handleQuizComplete();
    }
  };
  
  // Move to the previous question (only in review mode)
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0 && reviewMode) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Complete the quiz
  const handleQuizComplete = () => {
    setQuizCompleted(true);
    
    const percentageScore = (score / totalPoints) * 100;
    const passed = percentageScore >= passThreshold;
    
    // Trigger confetti if passed
    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    onComplete(score, totalPoints, passed);
  };
  
  // Reset the quiz
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptions({});
    setSubmitted(false);
    setQuizCompleted(false);
    setScore(0);
    setTimeRemaining(timeLimit);
    setShowExplanation(false);
    setReviewMode(false);
  };
  
  // Enter review mode
  const handleReview = () => {
    setReviewMode(true);
    setCurrentQuestionIndex(0);
  };
  
  // Toggle explanation
  const handleToggleExplanation = () => {
    setShowExplanation(prev => !prev);
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Final score percentage
  const scorePercentage = (score / totalPoints) * 100;
  const passed = scorePercentage >= passThreshold;
  
  // Render the current question
  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    const selectedOption = selectedOptions[question.id];
    
    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">{question.question}</h2>
            <p className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length} • 
              <span className={`ml-1 ${
                question.difficulty === 'beginner' ? 'text-green-500' :
                question.difficulty === 'intermediate' ? 'text-orange-500' : 'text-red-500'
              }`}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </span>
              <span className="ml-2 text-blue-600">{question.points} points</span>
            </p>
          </div>
          
          {timeLimit && (
            <div className={`flex items-center px-3 py-1 rounded-full ${
              timeRemaining && timeRemaining < 30 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{formatTimeRemaining()}</span>
            </div>
          )}
        </div>
        
        <RadioGroup
          value={selectedOption}
          className="space-y-3"
          onValueChange={(value) => handleOptionSelect(question.id, value)}
        >
          {question.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const showResult = submitted || reviewMode;
            const isCorrect = option.isCorrect;
            
            let optionClassName = "border p-4 rounded-md relative flex items-start";
            
            if (showResult) {
              if (isSelected && isCorrect) {
                optionClassName += " bg-green-50 border-green-200";
              } else if (isSelected && !isCorrect) {
                optionClassName += " bg-red-50 border-red-200";
              } else if (!isSelected && isCorrect) {
                optionClassName += " bg-green-50 border-green-200";
              }
            } else if (isSelected) {
              optionClassName += " border-blue-200 bg-blue-50";
            } else {
              optionClassName += " hover:bg-gray-50";
            }
            
            return (
              <div key={option.id} className={optionClassName}>
                <div className="flex items-center h-5 mt-0.5">
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    disabled={submitted || reviewMode}
                    className="mr-2"
                  />
                </div>
                <div className="ml-2 flex-grow">
                  <Label
                    htmlFor={option.id}
                    className={`text-sm font-medium ${isSelected ? 'text-blue-700' : ''}`}
                  >
                    {option.text}
                  </Label>
                  
                  {showResult && option.explanation && showExplanation && (
                    <p className="mt-1 text-sm text-gray-600">{option.explanation}</p>
                  )}
                </div>
                
                {showResult && (
                  <div className="absolute right-3 top-3">
                    {isCorrect ? (
                      <div className="bg-green-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      isSelected && (
                        <div className="bg-red-100 rounded-full p-1">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>
        
        {(submitted || reviewMode) && question.explanation && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToggleExplanation}
              className="mb-2"
            >
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </Button>
            
            {showExplanation && (
              <Alert>
                <AlertTitle className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Explanation
                </AlertTitle>
                <AlertDescription className="mt-1">
                  {question.explanation}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          {reviewMode ? (
            <>
              <Button 
                variant="outline" 
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button 
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={onExit}
              >
                Exit Quiz
              </Button>
              
              {!submitted ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={!selectedOptions[question.id]}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>Next Question <ArrowRight className="ml-1 h-4 w-4" /></>
                  ) : (
                    "Complete Quiz"
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  };
  
  // Render the quiz completion screen
  const renderCompletionScreen = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6 py-6"
      >
        <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-blue-50 mb-4">
          {passed ? (
            <Award className="h-12 w-12 text-blue-600" />
          ) : (
            <AlertCircle className="h-12 w-12 text-orange-500" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold">
          {passed ? "Congratulations!" : "Quiz Completed"}
        </h2>
        
        <p className="text-gray-600">
          {passed 
            ? "You've successfully passed the quiz!" 
            : "Keep practicing to improve your knowledge."}
        </p>
        
        <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Your Score</span>
            <span className="font-bold">{score} / {totalPoints} points</span>
          </div>
          
          <Progress 
            value={scorePercentage} 
            className={`h-2 ${passed ? 'bg-green-100' : 'bg-orange-100'}`} 
          />
          
          <div className="flex justify-between mt-1">
            <span className="text-sm text-gray-500">{Math.round(scorePercentage)}%</span>
            <span className="text-sm text-gray-500">Passing: {passThreshold}%</span>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Correct Answers</p>
              <p className="text-xl font-bold text-green-600">
                {Object.entries(selectedOptions).filter(([qId, optId]) => {
                  const question = questions.find(q => q.id === qId);
                  const option = question?.options.find(opt => opt.id === optId);
                  return option?.isCorrect;
                }).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Questions</p>
              <p className="text-xl font-bold">{questions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-6">
          <Button variant="outline" onClick={handleReview}>
            Review Answers
          </Button>
          <Button onClick={handleRestart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Quiz
          </Button>
        </div>
      </motion.div>
    );
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        
        {!quizCompleted && (
          <div className="mt-2">
            <div className="flex justify-between mb-1 text-xs">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} of {questions.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-1" />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait">
          {quizCompleted ? renderCompletionScreen() : renderQuestion()}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default InteractiveQuiz;