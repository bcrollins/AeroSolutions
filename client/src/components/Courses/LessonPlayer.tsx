import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaBook, 
  FaVideo, 
  FaCode, 
  FaQuestionCircle,
  FaCheck,
  FaUndo,
  FaRegClock,
  FaCog,
  FaExpand,
  FaTimes,
  FaListUl,
  FaRegLightbulb,
  FaVolumeUp,
  FaVolumeMute,
  FaPlayCircle,
  FaPauseCircle
} from 'react-icons/fa';
import { useNotification } from '@/components/UI/NotificationSystem';

type LessonType = 'video' | 'text' | 'interactive' | 'quiz';

type LessonContent = {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  completed?: boolean;
  content: {
    // For text lessons
    sections?: {
      title?: string;
      content: string;
      code?: string;
      codeLanguage?: string;
      image?: string;
    }[];
    
    // For video lessons 
    videoUrl?: string;
    transcript?: string;
    
    // For interactive lessons
    interactiveUrl?: string;
    instructions?: string;
    
    // For quiz lessons
    questions?: {
      id: string;
      text: string;
      options: {
        id: string;
        text: string;
      }[];
      correctOptionId: string;
      explanation: string;
    }[];
  };
};

export type ModuleInfo = {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    type: LessonType;
    duration: string;
    completed?: boolean;
  }[];
};

type LessonPlayerProps = {
  moduleId: string;
  lessonId: string;
  lesson: LessonContent;
  modules: ModuleInfo[];
  onBack?: () => void;
  onComplete?: (moduleId: string, lessonId: string) => void;
  onNextLesson?: (moduleId: string, lessonId: string) => void;
  onPrevLesson?: (moduleId: string, lessonId: string) => void;
  onNavigateToLesson?: (moduleId: string, lessonId: string) => void;
};

// Helper to calculate time remaining in the format "X:XX"
const formatTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Helper to find next and previous lessons
const findNextAndPrevLessons = (
  modules: ModuleInfo[],
  currentModuleId: string,
  currentLessonId: string
): { 
  next: { moduleId: string; lessonId: string } | null;
  prev: { moduleId: string; lessonId: string } | null;
} => {
  let found = false;
  let prev: { moduleId: string; lessonId: string } | null = null;
  let next: { moduleId: string; lessonId: string } | null = null;
  
  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    
    for (let j = 0; j < module.lessons.length; j++) {
      const lesson = module.lessons[j];
      
      if (found) {
        next = { moduleId: module.id, lessonId: lesson.id };
        return { next, prev };
      }
      
      if (module.id === currentModuleId && lesson.id === currentLessonId) {
        found = true;
      } else {
        prev = { moduleId: module.id, lessonId: lesson.id };
      }
    }
  }
  
  return { next, prev };
};

// Helper for random quiz responses
const getQuizFeedback = (correct: boolean): string => {
  const correctResponses = [
    "Great job! That's correct!",
    "Excellent! You've got it right!",
    "Perfect answer!",
    "Spot on! Well done!",
    "You're right! Impressive knowledge!"
  ];
  
  const incorrectResponses = [
    "Not quite right. Let's review the correct answer.",
    "Good try, but that's not correct.",
    "That's not right. Let's see why.",
    "Incorrect, but don't worry - this is a learning opportunity.",
    "Not the right answer. Let's look at why."
  ];
  
  const responses = correct ? correctResponses : incorrectResponses;
  return responses[Math.floor(Math.random() * responses.length)];
};

export default function LessonPlayer({
  moduleId,
  lessonId,
  lesson,
  modules,
  onBack,
  onComplete,
  onNextLesson,
  onPrevLesson,
  onNavigateToLesson
}: LessonPlayerProps) {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0); // 0-100
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8); // 0-1
  const [isMuted, setIsMuted] = useState(false);
  const [completionTracked, setCompletionTracked] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();
  
  // Find next and previous lessons
  const { next: nextLesson, prev: prevLesson } = findNextAndPrevLessons(modules, moduleId, lessonId);
  
  // Handle lesson completion
  const handleMarkComplete = () => {
    if (!completionTracked) {
      onComplete?.(moduleId, lessonId);
      setCompletionTracked(true);
      
      showNotification({
        title: "Lesson Completed!",
        message: `You've completed ${lesson.title}. Keep up the good work!`,
        type: "success",
        duration: 5000
      });
    }
  };
  
  // Handle quiz submission
  const handleQuizSubmit = () => {
    if (lesson.content.questions) {
      const totalQuestions = lesson.content.questions.length;
      let correctAnswers = 0;
      
      lesson.content.questions.forEach(question => {
        if (selectedOptions[question.id] === question.correctOptionId) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      setQuizScore(score);
      setQuizSubmitted(true);
      
      if (score >= 70) {
        handleMarkComplete();
      }
    }
  };
  
  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || lesson.type !== 'video') return;
    
    const handleTimeUpdate = () => {
      const current = videoElement.currentTime;
      const duration = videoElement.duration;
      
      if (duration > 0) {
        setVideoProgress((current / duration) * 100);
        setCurrentTime(current);
      }
      
      // Mark lesson as complete when 90% watched
      if (!completionTracked && (current / duration) > 0.9) {
        handleMarkComplete();
      }
    };
    
    const handleLoadedMetadata = () => {
      setVideoDuration(videoElement.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (!completionTracked) {
        handleMarkComplete();
      }
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('ended', handleEnded);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [lesson.type, completionTracked]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const seekTo = parseFloat(e.target.value);
    setVideoProgress(seekTo);
    
    const timeToSeek = (seekTo / 100) * videoDuration;
    videoElement.currentTime = timeToSeek;
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoElement.volume = newVolume;
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isMuted) {
      videoElement.volume = volume;
      setIsMuted(false);
    } else {
      videoElement.volume = 0;
      setIsMuted(true);
    }
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!fullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setFullscreen(!fullscreen);
  };
  
  // Check if this is the last question in the quiz
  const isLastQuestion = lesson.type === 'quiz' && 
    lesson.content.questions && 
    currentQuestionIndex === lesson.content.questions.length - 1;
  
  // Get question result for the current question
  const getQuestionResult = (questionId: string) => {
    if (!lesson.content.questions) return null;
    
    const question = lesson.content.questions.find(q => q.id === questionId);
    if (!question) return null;
    
    const selectedOption = selectedOptions[questionId];
    if (!selectedOption) return null;
    
    return {
      correct: selectedOption === question.correctOptionId,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation
    };
  };
  
  // Determine next lesson button state
  const renderNextLessonButton = () => {
    if (lesson.type === 'quiz' && !quizSubmitted) {
      return null;
    }
    
    if (nextLesson) {
      return (
        <button 
          onClick={() => onNextLesson?.(nextLesson.moduleId, nextLesson.lessonId)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Next Lesson <FaChevronRight className="ml-2" />
        </button>
      );
    } else {
      return (
        <button 
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Complete Course <FaCheck className="ml-2" />
        </button>
      );
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={`flex flex-col h-full relative ${fullscreen ? 'bg-black' : 'bg-white'}`}
    >
      {/* Header with lesson info and navigation */}
      <div className={`p-4 flex items-center justify-between border-b ${fullscreen ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'}`}>
        <div className="flex items-center">
          <button
            onClick={onBack}
            className={`mr-4 p-2 rounded-full ${fullscreen ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            aria-label="Go back"
          >
            <FaChevronLeft />
          </button>
          
          <div>
            <h1 className="text-lg font-semibold">{lesson.title}</h1>
            <div className="flex items-center text-sm mt-0.5">
              {lesson.type === 'video' && <FaVideo className={`mr-1.5 ${fullscreen ? 'text-blue-400' : 'text-blue-600'}`} />}
              {lesson.type === 'text' && <FaBook className={`mr-1.5 ${fullscreen ? 'text-green-400' : 'text-green-600'}`} />}
              {lesson.type === 'interactive' && <FaCode className={`mr-1.5 ${fullscreen ? 'text-purple-400' : 'text-purple-600'}`} />}
              {lesson.type === 'quiz' && <FaQuestionCircle className={`mr-1.5 ${fullscreen ? 'text-yellow-400' : 'text-yellow-600'}`} />}
              <span className={fullscreen ? 'text-gray-300' : 'text-gray-600'}>
                {lesson.duration}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-full ${fullscreen ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            aria-label="Toggle lesson outline"
          >
            <FaListUl />
          </button>
          
          {lesson.type === 'video' && (
            <button
              onClick={toggleFullscreen}
              className={`ml-2 p-2 rounded-full ${fullscreen ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              aria-label="Toggle fullscreen"
            >
              {fullscreen ? <FaTimes /> : <FaExpand />}
            </button>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main lesson content */}
        <div className={`flex-1 overflow-y-auto p-6 ${fullscreen ? 'bg-gray-900 text-white' : 'bg-white'}`}>
          {/* Video lesson */}
          {lesson.type === 'video' && lesson.content.videoUrl && (
            <div className="mb-6">
              <div className="relative">
                <video
                  ref={videoRef}
                  src={lesson.content.videoUrl}
                  className="w-full rounded-lg"
                  poster="https://via.placeholder.com/800x450/2563eb/FFFFFF?text=Video+Lesson"
                ></video>
                
                {/* Video controls overlay */}
                <div className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                  <button 
                    onClick={togglePlayPause}
                    className="text-white text-5xl transition-transform transform hover:scale-110"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <FaPauseCircle /> : <FaPlayCircle />}
                  </button>
                </div>
                
                {/* Video progress controls */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                  <div className="flex items-center text-white mb-2">
                    <button 
                      onClick={togglePlayPause}
                      className="mr-3"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <FaPauseCircle /> : <FaPlayCircle />}
                    </button>
                    
                    <div className="flex-1 mx-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={videoProgress}
                        onChange={handleSeek}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>
                    
                    <div className="text-sm ml-3 whitespace-nowrap">
                      {formatTimeRemaining(currentTime)} / {formatTimeRemaining(videoDuration)}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <div className="flex items-center">
                      <button 
                        onClick={toggleMute}
                        className="mr-2"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                      </button>
                      
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-24 accent-blue-500 cursor-pointer"
                      />
                    </div>
                    
                    <div className="ml-auto">
                      <button
                        onClick={toggleFullscreen}
                        aria-label="Toggle fullscreen"
                      >
                        {fullscreen ? <FaTimes /> : <FaExpand />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Transcript (if available) */}
              {lesson.content.transcript && (
                <div className={`mt-6 p-4 rounded-lg ${fullscreen ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${fullscreen ? 'text-white' : 'text-gray-900'}`}>Transcript</h3>
                  <p className={`whitespace-pre-line text-sm ${fullscreen ? 'text-gray-300' : 'text-gray-700'}`}>
                    {lesson.content.transcript}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Text lesson */}
          {lesson.type === 'text' && lesson.content.sections && (
            <div>
              {lesson.content.sections.map((section, index) => (
                <div key={index} className="mb-8">
                  {section.title && (
                    <h2 className={`text-xl font-bold mb-4 ${fullscreen ? 'text-white' : 'text-gray-900'}`}>
                      {section.title}
                    </h2>
                  )}
                  
                  {section.image && (
                    <img 
                      src={section.image} 
                      alt={section.title || 'Lesson image'} 
                      className="w-full max-w-3xl mx-auto rounded-lg mb-6 shadow-md"
                    />
                  )}
                  
                  <div 
                    className={`prose max-w-none ${fullscreen ? 'prose-invert' : ''}`}
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                  
                  {section.code && (
                    <div className={`mt-6 rounded-lg overflow-hidden shadow-md ${fullscreen ? '' : 'border border-gray-200'}`}>
                      <div className={`p-2 text-xs font-mono ${fullscreen ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {section.codeLanguage || 'code'}
                      </div>
                      <pre className={`p-4 overflow-x-auto text-sm ${fullscreen ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
                        <code>{section.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Text lesson completion button */}
              {!completionTracked && (
                <div className="flex justify-center my-8">
                  <button
                    onClick={handleMarkComplete}
                    className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <FaCheck className="mr-2" />
                    Mark as Complete
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Interactive lesson */}
          {lesson.type === 'interactive' && (
            <div>
              {lesson.content.instructions && (
                <div className={`mb-6 p-4 rounded-lg border ${fullscreen ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
                  <h3 className={`flex items-center text-lg font-semibold mb-2 ${fullscreen ? 'text-white' : 'text-gray-900'}`}>
                    <FaRegLightbulb className={`mr-2 ${fullscreen ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    Instructions
                  </h3>
                  <p className={`${fullscreen ? 'text-gray-300' : 'text-gray-700'}`}>
                    {lesson.content.instructions}
                  </p>
                </div>
              )}
              
              {lesson.content.interactiveUrl ? (
                <div className="border rounded-lg overflow-hidden h-[600px]">
                  <iframe
                    src={lesson.content.interactiveUrl}
                    className="w-full h-full"
                    title="Interactive Lesson"
                    allow="accelerometer; camera; microphone; clipboard-write; encrypted-media; geolocation"
                  ></iframe>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center p-12 border rounded-lg ${fullscreen ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                  <FaCode className={`text-5xl mb-4 ${fullscreen ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-center ${fullscreen ? 'text-gray-400' : 'text-gray-500'}`}>
                    Interactive content not available in preview mode.
                  </p>
                </div>
              )}
              
              {/* Interactive lesson completion button */}
              {!completionTracked && (
                <div className="flex justify-center my-8">
                  <button
                    onClick={handleMarkComplete}
                    className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <FaCheck className="mr-2" />
                    Mark as Complete
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Quiz lesson */}
          {lesson.type === 'quiz' && lesson.content.questions && (
            <div>
              {/* Quiz intro */}
              {!quizSubmitted && (
                <div className={`mb-8 ${fullscreen ? 'text-white' : ''}`}>
                  <h2 className="text-xl font-bold mb-2">Knowledge Check</h2>
                  <p className={`${fullscreen ? 'text-gray-300' : 'text-gray-700'}`}>
                    Test your understanding of the concepts covered in this lesson.
                    You need to score at least 70% to complete this quiz.
                  </p>
                  
                  {/* Question progress */}
                  <div className="mt-4 mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${fullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                        Question {currentQuestionIndex + 1} of {lesson.content.questions.length}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${((currentQuestionIndex + 1) / lesson.content.questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quiz results */}
              {quizSubmitted ? (
                <div className={`rounded-xl p-6 ${fullscreen ? 'bg-gray-800' : 'bg-white border'}`}>
                  <div className="flex flex-col items-center mb-6">
                    <div 
                      className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mb-4 ${
                        quizScore >= 70 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {quizScore}%
                    </div>
                    
                    <h3 className={`text-xl font-bold mb-1 ${fullscreen ? 'text-white' : 'text-gray-900'}`}>
                      {quizScore >= 70 ? 'Quiz Passed!' : 'Keep Learning'}
                    </h3>
                    
                    <p className={`text-center ${fullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                      {quizScore >= 70 
                        ? "Great job! You've demonstrated a good understanding of the material." 
                        : "You didn't reach the passing score of 70%. Review the material and try again."}
                    </p>
                  </div>
                  
                  {/* Question review */}
                  <h4 className={`text-lg font-semibold mb-4 ${fullscreen ? 'text-white' : 'text-gray-900'}`}>
                    Review your answers:
                  </h4>
                  
                  <div className="space-y-6">
                    {lesson.content.questions.map((question, index) => {
                      const result = getQuestionResult(question.id);
                      
                      return (
                        <div 
                          key={question.id} 
                          className={`p-4 rounded-lg ${
                            result && result.correct 
                              ? (fullscreen ? 'bg-green-900 bg-opacity-20' : 'bg-green-50 border border-green-100') 
                              : (fullscreen ? 'bg-red-900 bg-opacity-20' : 'bg-red-50 border border-red-100')
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                              result && result.correct 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {index + 1}
                            </div>
                            
                            <div>
                              <p className={`font-medium ${fullscreen ? 'text-white' : 'text-gray-900'}`}>
                                {question.text}
                              </p>
                              
                              <div className="mt-3 space-y-2">
                                {question.options.map(option => (
                                  <div 
                                    key={option.id} 
                                    className={`flex items-center p-2 rounded ${
                                      result && option.id === result.correctOptionId
                                        ? (fullscreen ? 'bg-green-900 bg-opacity-30' : 'bg-green-100')
                                        : result && option.id === selectedOptions[question.id] && !result.correct
                                          ? (fullscreen ? 'bg-red-900 bg-opacity-30' : 'bg-red-100')
                                          : (fullscreen ? 'bg-gray-800' : 'bg-white border border-gray-200')
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                      option.id === selectedOptions[question.id]
                                        ? (fullscreen ? 'border-white bg-blue-600' : 'border-blue-600 bg-blue-600')
                                        : (fullscreen ? 'border-gray-500' : 'border-gray-300')
                                    }`}>
                                      {option.id === selectedOptions[question.id] && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                      )}
                                    </div>
                                    
                                    <span className={fullscreen ? 'text-white' : 'text-gray-800'}>
                                      {option.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Explanation */}
                              {result && (
                                <div className={`mt-4 p-3 rounded ${
                                  fullscreen 
                                    ? 'bg-gray-800' 
                                    : 'bg-white border border-gray-200'
                                }`}>
                                  <p className={`font-medium mb-1 ${
                                    result.correct 
                                      ? 'text-green-600' 
                                      : 'text-red-600'
                                  }`}>
                                    {getQuizFeedback(result.correct)}
                                  </p>
                                  <p className={`text-sm ${fullscreen ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {result.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Retry button for failed quiz */}
                  {quizScore < 70 && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => {
                          setSelectedOptions({});
                          setCurrentQuestionIndex(0);
                          setQuizSubmitted(false);
                        }}
                        className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <FaUndo className="mr-2" />
                        Retry Quiz
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Current question
                <div className={`rounded-xl p-6 ${fullscreen ? 'bg-gray-800' : 'bg-white border'}`}>
                  {lesson.content.questions[currentQuestionIndex] && (
                    <div>
                      <h3 className={`text-xl font-semibold mb-4 ${fullscreen ? 'text-white' : 'text-gray-900'}`}>
                        {lesson.content.questions[currentQuestionIndex].text}
                      </h3>
                      
                      <div className="space-y-3 mt-6">
                        {lesson.content.questions[currentQuestionIndex].options.map(option => (
                          <div
                            key={option.id}
                            onClick={() => setSelectedOptions({
                              ...selectedOptions, 
                              [lesson.content.questions[currentQuestionIndex].id]: option.id
                            })}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedOptions[lesson.content.questions[currentQuestionIndex].id] === option.id
                                ? (fullscreen ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-50 border border-blue-300')
                                : (fullscreen ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200')
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                              selectedOptions[lesson.content.questions[currentQuestionIndex].id] === option.id
                                ? (fullscreen ? 'border-white bg-blue-600' : 'border-blue-600 bg-blue-600')
                                : (fullscreen ? 'border-gray-400' : 'border-gray-300')
                            }`}>
                              {selectedOptions[lesson.content.questions[currentQuestionIndex].id] === option.id && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            
                            <span className={`${
                              fullscreen 
                                ? 'text-white' 
                                : selectedOptions[lesson.content.questions[currentQuestionIndex].id] === option.id
                                  ? 'text-blue-900'
                                  : 'text-gray-800'
                            }`}>
                              {option.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation buttons */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                        currentQuestionIndex === 0
                          ? (fullscreen ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                          : (fullscreen ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                      }`}
                      disabled={currentQuestionIndex === 0}
                    >
                      <FaChevronLeft className="mr-2" />
                      Previous
                    </button>
                    
                    {isLastQuestion ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={!Object.keys(selectedOptions).length || Object.keys(selectedOptions).length !== lesson.content.questions.length}
                        className={`px-4 py-2 rounded-lg flex items-center ${
                          !Object.keys(selectedOptions).length || Object.keys(selectedOptions).length !== lesson.content.questions.length
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Submit Quiz <FaCheck className="ml-2" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(lesson.content.questions.length - 1, prev + 1))}
                        disabled={!selectedOptions[lesson.content.questions[currentQuestionIndex].id]}
                        className={`px-4 py-2 rounded-lg flex items-center ${
                          !selectedOptions[lesson.content.questions[currentQuestionIndex].id]
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Next <FaChevronRight className="ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
            {prevLesson ? (
              <button 
                onClick={() => onPrevLesson?.(prevLesson.moduleId, prevLesson.lessonId)}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  fullscreen 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaChevronLeft className="mr-2" />
                Previous Lesson
              </button>
            ) : (
              <div></div> // Empty div to maintain layout
            )}
            
            {renderNextLessonButton()}
          </div>
        </div>
        
        {/* Lesson sidebar (module outline) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`border-l overflow-y-auto ${
                fullscreen 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="p-4">
                <h3 className={`text-lg font-semibold mb-4 ${fullscreen ? 'text-white' : 'text-gray-900'}`}>
                  Course Outline
                </h3>
                
                <div className="space-y-6">
                  {modules.map((module) => (
                    <div key={module.id}>
                      <h4 className={`font-medium mb-2 ${fullscreen ? 'text-gray-300' : 'text-gray-700'}`}>
                        {module.title}
                      </h4>
                      
                      <ul className="space-y-1 pl-2">
                        {module.lessons.map((moduleLesson) => (
                          <li 
                            key={moduleLesson.id}
                            className={`relative pl-6 py-1.5 rounded-md cursor-pointer ${
                              moduleId === module.id && lessonId === moduleLesson.id
                                ? (fullscreen ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50')
                                : (fullscreen ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
                            }`}
                            onClick={() => onNavigateToLesson?.(module.id, moduleLesson.id)}
                          >
                            <div className="absolute left-1 top-2">
                              {moduleLesson.type === 'video' && <FaVideo className={`h-3 w-3 ${fullscreen ? 'text-blue-400' : 'text-blue-600'}`} />}
                              {moduleLesson.type === 'text' && <FaBook className={`h-3 w-3 ${fullscreen ? 'text-green-400' : 'text-green-600'}`} />}
                              {moduleLesson.type === 'interactive' && <FaCode className={`h-3 w-3 ${fullscreen ? 'text-purple-400' : 'text-purple-600'}`} />}
                              {moduleLesson.type === 'quiz' && <FaQuestionCircle className={`h-3 w-3 ${fullscreen ? 'text-yellow-400' : 'text-yellow-600'}`} />}
                            </div>
                            
                            <div className={`text-sm ${
                              moduleId === module.id && lessonId === moduleLesson.id
                                ? (fullscreen ? 'text-white font-medium' : 'text-blue-700 font-medium')
                                : (fullscreen ? 'text-gray-300' : 'text-gray-700')
                            }`}>
                              {moduleLesson.title}
                            </div>
                            
                            {moduleLesson.completed && (
                              <div className="absolute right-2 top-2">
                                <FaCheck className="h-3 w-3 text-green-500" />
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}