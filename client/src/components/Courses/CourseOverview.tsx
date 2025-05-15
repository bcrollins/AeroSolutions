import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaBook, FaCode, FaClock, FaCalendarAlt, FaStar, FaLock, FaUnlock } from 'react-icons/fa';
import { MicroInteractions } from '@/components/UI/NotificationSystem';

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

type Module = {
  id: string;
  title: string;
  description: string;
  duration: string;
  locked?: boolean; 
  lessons: Lesson[];
};

type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'interactive' | 'quiz';
  duration: string;
  completed?: boolean;
  locked?: boolean;
};

type CourseOverviewProps = {
  courseId: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  duration: string;
  difficulty: Difficulty;
  rating?: number;
  ratingCount?: number;
  learningPoints?: string[];
  prerequisites?: string[];
  coverImage?: string;
  modules: Module[];
  enrollmentStatus?: 'not-enrolled' | 'enrolled' | 'completed';
  progress?: number; // 0-100
  onEnroll?: () => void;
  onStartLesson?: (moduleId: string, lessonId: string) => void;
  onContinue?: () => void;
};

// Helper function to get the type icon
const getLessonTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <FaPlay className="text-blue-500" />;
    case 'reading':
      return <FaBook className="text-green-500" />;
    case 'interactive':
      return <FaCode className="text-purple-500" />;
    case 'quiz':
      return <FaStar className="text-yellow-500" />;
    default:
      return <FaPlay className="text-blue-500" />;
  }
};

// Helper function to format duration
const formatDuration = (duration: string): string => {
  // If it's already in a nice format, return it
  if (duration.includes('hour') || duration.includes('min') || duration.includes('sec')) {
    return duration;
  }
  
  // If it's minutes, format it
  if (duration.match(/^\d+$/)) {
    const mins = parseInt(duration);
    if (mins < 60) {
      return `${mins} min${mins === 1 ? '' : 's'}`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours} hour${hours === 1 ? '' : 's'}${remainingMins > 0 ? ` ${remainingMins} min${remainingMins === 1 ? '' : 's'}` : ''}`;
    }
  }
  
  return duration;
};

// Calculate the total duration of a course
const calculateTotalDuration = (modules: Module[]): string => {
  const totalMinutes = modules.reduce((total, module) => {
    return total + module.lessons.reduce((moduleTotal, lesson) => {
      const duration = lesson.duration;
      
      // If duration is in format "X mins" or "X min"
      const minsMatch = duration.match(/(\d+)\s*min/);
      if (minsMatch) {
        return moduleTotal + parseInt(minsMatch[1]);
      }
      
      // If duration is in format "X hours" or "X hour"
      const hoursMatch = duration.match(/(\d+)\s*hour/);
      if (hoursMatch) {
        return moduleTotal + parseInt(hoursMatch[1]) * 60;
      }
      
      // If it's just a number, assume minutes
      if (duration.match(/^\d+$/)) {
        return moduleTotal + parseInt(duration);
      }
      
      return moduleTotal;
    }, 0);
  }, 0);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else if (minutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  } else {
    return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
};

// Helper function to get difficulty color
const getDifficultyColor = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'advanced':
      return 'bg-purple-100 text-purple-800';
    case 'expert':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Count total lessons and completed lessons
const countLessons = (modules: Module[]): { total: number; completed: number } => {
  let total = 0;
  let completed = 0;
  
  modules.forEach(module => {
    module.lessons.forEach(lesson => {
      total++;
      if (lesson.completed) {
        completed++;
      }
    });
  });
  
  return { total, completed };
};

export default function CourseOverview({
  courseId,
  title,
  description,
  instructor,
  duration,
  difficulty,
  rating,
  ratingCount,
  learningPoints,
  prerequisites,
  coverImage,
  modules,
  enrollmentStatus = 'not-enrolled',
  progress = 0,
  onEnroll,
  onStartLesson,
  onContinue
}: CourseOverviewProps) {
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(modules[0]?.id || null);
  
  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
  };
  
  // Calculate stats
  const { total: totalLessons, completed: completedLessons } = countLessons(modules);
  const calculatedProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const actualProgress = progress > 0 ? progress : calculatedProgress;
  
  // Find the first incomplete lesson for "Continue Learning" button
  const findNextLesson = (): { moduleId: string; lessonId: string } | null => {
    for (const module of modules) {
      if (module.locked) continue;
      
      for (const lesson of module.lessons) {
        if (!lesson.completed && !lesson.locked) {
          return { moduleId: module.id, lessonId: lesson.id };
        }
      }
    }
    
    return null;
  };
  
  const nextLesson = findNextLesson();
  
  // Rating stars
  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`h-5 w-5 ${
              i < fullStars 
                ? 'text-yellow-400' 
                : i === fullStars && hasHalfStar 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
            }`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            {i === fullStars && hasHalfStar ? (
              <defs>
                <linearGradient id="half-fill" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="#D1D5DB" />
                </linearGradient>
              </defs>
            ) : null}
            <path 
              fill={i === fullStars && hasHalfStar ? "url(#half-fill)" : "currentColor"}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        ))}
        <span className="ml-1 text-gray-600 text-sm">
          {rating.toFixed(1)} {ratingCount ? `(${ratingCount})` : ''}
        </span>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Course header */}
      <div className="relative">
        {/* Cover image */}
        <div 
          className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center relative overflow-hidden"
          style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {!coverImage && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute transform rotate-12 -right-16 -top-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
              <div className="absolute transform -rotate-12 -left-16 -bottom-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
            </div>
          )}
          
          <div className="relative z-10 text-center text-white px-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <h1 className="text-3xl font-bold mt-2 mb-1 drop-shadow-sm">{title}</h1>
          </div>
        </div>
        
        {/* Enrollment status indicator */}
        {enrollmentStatus !== 'not-enrolled' && (
          <div className="absolute top-4 right-4 py-1 px-3 bg-white bg-opacity-90 rounded-full text-xs font-medium shadow-sm">
            {enrollmentStatus === 'enrolled' ? (
              <div className="flex items-center text-blue-600">
                <FaUnlock className="mr-1" />
                <span>Enrolled</span>
              </div>
            ) : (
              <div className="flex items-center text-green-600">
                <FaCheck className="mr-1" />
                <span>Completed</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Course stats */}
      <div className="flex flex-wrap justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center mr-4 mb-2 sm:mb-0">
          <FaClock className="text-gray-500 mr-2" />
          <span className="text-gray-700">{formatDuration(duration || calculateTotalDuration(modules))}</span>
        </div>
        
        <div className="flex items-center mr-4 mb-2 sm:mb-0">
          <FaBook className="text-gray-500 mr-2" />
          <span className="text-gray-700">{totalLessons} Lessons</span>
        </div>
        
        {rating && (
          <div className="flex items-center mb-2 sm:mb-0">
            {renderRatingStars(rating)}
          </div>
        )}
      </div>
      
      {/* Course content */}
      <div className="grid md:grid-cols-3 gap-0">
        {/* Left column - Course info */}
        <div className="md:col-span-1 p-6 border-r border-gray-200 bg-white">
          {/* Progress bar (if enrolled) */}
          {enrollmentStatus !== 'not-enrolled' && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Your Progress</span>
                <span className="text-blue-600 font-medium">{actualProgress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${actualProgress}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-gray-500 text-right">
                {completedLessons}/{totalLessons} lessons completed
              </div>
            </div>
          )}
          
          {/* Course description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Course</h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">{description}</p>
          </div>
          
          {/* Instructor info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructor</h3>
            <div className="flex items-center">
              <img 
                src={instructor.avatar} 
                alt={instructor.name} 
                className="w-12 h-12 rounded-full object-cover mr-3"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(instructor.name);
                }}
              />
              <div>
                <h4 className="text-gray-900 font-medium">{instructor.name}</h4>
                <p className="text-gray-600 text-sm">{instructor.title}</p>
              </div>
            </div>
          </div>
          
          {/* What you'll learn */}
          {learningPoints && learningPoints.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h3>
              <ul className="space-y-2">
                {learningPoints.map((point, index) => (
                  <li key={index} className="flex text-sm">
                    <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Prerequisites */}
          {prerequisites && prerequisites.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
              <ul className="space-y-2">
                {prerequisites.map((prerequisite, index) => (
                  <li key={index} className="flex text-sm">
                    <svg className="h-5 w-5 text-blue-500 shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Enrollment/Continue button */}
          <div className="mt-6">
            {enrollmentStatus === 'not-enrolled' ? (
              <MicroInteractions.Pulse className="w-full">
                <button
                  onClick={onEnroll}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                >
                  <FaUnlock className="mr-2" />
                  Enroll Now
                </button>
              </MicroInteractions.Pulse>
            ) : nextLesson ? (
              <button
                onClick={() => nextLesson && onStartLesson?.(nextLesson.moduleId, nextLesson.lessonId)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
              >
                <FaPlay className="mr-2" />
                Continue Learning
              </button>
            ) : (
              <button
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                disabled
              >
                <FaCheck className="mr-2" />
                Course Completed
              </button>
            )}
          </div>
        </div>
        
        {/* Right column - Course curriculum */}
        <div className="md:col-span-2 p-6 bg-white">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h3>
          
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <div 
                key={module.id}
                className={`border rounded-lg overflow-hidden ${
                  module.locked ? 'border-gray-200 bg-gray-50' : 'border-gray-200'
                }`}
              >
                {/* Module header */}
                <div 
                  onClick={() => !module.locked && toggleModule(module.id)}
                  className={`p-4 flex justify-between items-center cursor-pointer ${
                    expandedModuleId === module.id ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center border border-gray-200 text-sm font-medium mr-3 mt-0.5">
                      {moduleIndex + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{module.title}</h4>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <FaClock className="h-3 w-3 mr-1" />
                          {module.duration}
                        </span>
                        <span className="flex items-center">
                          <FaBook className="h-3 w-3 mr-1" />
                          {module.lessons.length} lessons
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {module.locked ? (
                      <FaLock className="text-gray-400" />
                    ) : (
                      <svg 
                        className={`h-5 w-5 text-gray-500 transform transition-transform ${
                          expandedModuleId === module.id ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Module lessons */}
                {(expandedModuleId === module.id && !module.locked) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ul className="divide-y divide-gray-200">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="mr-3 text-gray-500">
                                {getLessonTypeIcon(lesson.type)}
                              </div>
                              <div>
                                <h5 className={`text-sm font-medium ${lesson.locked ? 'text-gray-400' : 'text-gray-900'}`}>
                                  {lesson.title}
                                </h5>
                                <span className="text-xs text-gray-500 mt-0.5">{lesson.duration}</span>
                              </div>
                            </div>
                            
                            {lesson.completed ? (
                              <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                                <FaCheck className="text-green-600 h-3 w-3" />
                              </div>
                            ) : lesson.locked ? (
                              <FaLock className="text-gray-400" />
                            ) : (
                              <button
                                onClick={() => onStartLesson?.(module.id, lesson.id)}
                                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                              >
                                Start
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                
                {/* Locked module overlay */}
                {module.locked && (
                  <div className="p-4 flex items-center justify-center text-gray-500 bg-gray-50">
                    <FaLock className="mr-2" />
                    <span>This module is locked. Complete previous modules to unlock.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}