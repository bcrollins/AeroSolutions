import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ChevronRight, Award, Zap, Brain, BookOpen } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Module {
  id: number;
  title: string;
  description: string;
  lessons: any[]; // Using any here for simplicity
  duration: number;
  progress?: number;
}

interface LearningPathVisualizerProps {
  courseId: number;
  modules: Module[];
  currentProgress: number;
  onModuleSelect?: (moduleId: number) => void;
  onLessonSelect?: (lessonId: number) => void;
}

const LearningPathVisualizer: React.FC<LearningPathVisualizerProps> = ({
  courseId,
  modules,
  currentProgress,
  onModuleSelect,
  onLessonSelect
}) => {
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  
  // Calculate which module to focus on based on progress
  useEffect(() => {
    if (modules.length === 0) return;
    
    // Find the first incomplete module
    const firstIncompleteModule = modules.find(module => 
      module.progress === undefined || module.progress < 100
    );
    
    if (firstIncompleteModule) {
      setActiveModule(firstIncompleteModule.id);
    } else {
      // If all modules are complete, focus on the last one
      setActiveModule(modules[modules.length - 1].id);
    }
  }, [modules]);
  
  // Resize logic
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    // Initial width calculation
    updateWidth();
    
    // Update on resize
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);
  
  // Handle module click
  const handleModuleClick = (moduleId: number) => {
    setActiveModule(moduleId);
    if (onModuleSelect) {
      onModuleSelect(moduleId);
    }
  };
  
  // Handle lesson click
  const handleLessonClick = (lessonId: number) => {
    if (onLessonSelect) {
      onLessonSelect(lessonId);
    }
  };
  
  // Check if a module is locked (not yet available)
  const isModuleLocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return false; // First module is never locked
    
    // A module is locked if all previous modules haven't been completed
    for (let i = 0; i < moduleIndex; i++) {
      if (!modules[i].progress || modules[i].progress < 100) {
        return true;
      }
    }
    
    return false;
  };
  
  return (
    <div 
      ref={containerRef}
      className="p-6 relative"
    >
      {/* Visual progress bar at the top */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Course Progress</span>
          <span className="text-sm font-medium text-gray-700">{currentProgress}%</span>
        </div>
        <Progress
          value={currentProgress}
          className="h-2"
        />
      </div>
      
      {/* Modules timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-6 left-6 h-full w-0.5 bg-gray-200" />
        
        {/* Modules */}
        <div className="space-y-8">
          {modules.map((module, index) => {
            const isComplete = module.progress === 100;
            const isActive = activeModule === module.id;
            const isLocked = isModuleLocked(index);
            
            return (
              <div key={module.id} className="relative">
                {/* Module node */}
                <div className="relative z-10 flex">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => !isLocked && handleModuleClick(module.id)}
                          className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                            isLocked 
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : isComplete 
                                ? 'bg-green-100 hover:bg-green-200 text-green-600' 
                                : isActive 
                                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                          disabled={isLocked}
                        >
                          {isLocked ? (
                            <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                          ) : isComplete ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <Circle className="h-6 w-6" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="max-w-xs">
                          <p className="font-medium">{module.title}</p>
                          {isLocked ? (
                            <p className="text-xs text-amber-600">Complete previous modules to unlock</p>
                          ) : (
                            <p className="text-xs text-gray-500">{module.description}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Module details */}
                  <div 
                    className={`ml-4 cursor-pointer flex-1 ${isLocked ? 'opacity-50' : ''}`}
                    onClick={() => !isLocked && handleModuleClick(module.id)}
                  >
                    <div className="flex items-start">
                      <h4 className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                        {module.title}
                      </h4>
                      
                      {isLocked && (
                        <Badge variant="outline" className="ml-2 text-amber-600 border-amber-200">
                          Locked
                        </Badge>
                      )}
                      
                      {isComplete && (
                        <Badge variant="outline" className="ml-2 text-green-600 border-green-200">
                          Completed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span className="mr-3">{module.lessons.length} lessons</span>
                      <span>{Math.round(module.duration / 60)} hours</span>
                    </div>
                    
                    {module.progress !== undefined && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={module.progress} className="h-1.5 w-24" />
                        <span className="text-xs text-gray-600">{module.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expanded lessons (shown when module is active) */}
                {isActive && !isLocked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 ml-16 pl-4 border-l-2 border-blue-200 space-y-3"
                  >
                    {module.lessons.map((lesson) => {
                      const isLessonComplete = lesson.completed || false;
                      const isLessonLocked = lesson.locked || false;
                      
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => !isLessonLocked && handleLessonClick(lesson.id)}
                          className={`pl-4 py-2 border-l-2 relative flex items-start ${
                            isLessonComplete
                              ? 'border-green-500 text-green-700'
                              : 'border-gray-200 text-gray-700'
                          } ${isLessonLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                        >
                          <div className="absolute -left-[9px] top-1/2 transform -translate-y-1/2">
                            <div className={`h-4 w-4 rounded-full ${
                              isLessonComplete 
                                ? 'bg-green-500' 
                                : isLessonLocked 
                                  ? 'bg-gray-300' 
                                  : 'bg-blue-100 border-2 border-blue-500'
                            }`}>
                              {isLessonComplete && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h5 className="font-medium text-sm">{lesson.title}</h5>
                              
                              {/* Lesson type icon */}
                              {lesson.type === 'video' && (
                                <Badge variant="outline" className="ml-2 text-blue-600 border-blue-200 text-xs">
                                  Video
                                </Badge>
                              )}
                              {lesson.type === 'quiz' && (
                                <Badge variant="outline" className="ml-2 text-purple-600 border-purple-200 text-xs">
                                  Quiz
                                </Badge>
                              )}
                              {lesson.type === 'assignment' && (
                                <Badge variant="outline" className="ml-2 text-amber-600 border-amber-200 text-xs">
                                  Assignment
                                </Badge>
                              )}
                              
                              {isLessonLocked && (
                                <Badge variant="outline" className="ml-2 text-gray-600 border-gray-200 text-xs">
                                  Locked
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-0.5">
                              {lesson.duration} min · {isLessonComplete ? 'Completed' : 'Not completed'}
                            </p>
                          </div>
                          
                          {!isLessonLocked && (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Module completion badge (shown at the end of completed modules) */}
                    {isComplete && (
                      <div className="pl-4 py-4 flex items-center justify-center">
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg flex items-center">
                          <Award className="h-5 w-5 mr-2" />
                          <span className="font-medium">Module Completed!</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
          
          {/* Final achievement (shown when all modules are complete) */}
          {modules.every(module => module.progress === 100) && (
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              
              <div className="mt-6 ml-16 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-100 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Award className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-amber-800 mb-2">
                  Course Completed!
                </h3>
                <p className="text-amber-700 mb-4">
                  Congratulations! You've successfully completed all modules in this course.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm flex items-center border border-amber-200">
                    <Zap className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="text-sm text-gray-700 font-medium">
                      {Math.round(modules.reduce((total, module) => total + module.duration, 0) / 60)} hours completed
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm flex items-center border border-amber-200">
                    <Brain className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="text-sm text-gray-700 font-medium">
                      {modules.reduce((total, module) => total + module.lessons.length, 0)} lessons mastered
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm flex items-center border border-amber-200">
                    <BookOpen className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="text-sm text-gray-700 font-medium">Certificate earned</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPathVisualizer;