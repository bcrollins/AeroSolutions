import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaLock, FaCheck, FaStar, FaTrophy, FaRocket } from 'react-icons/fa';
import { MdTimeline, MdOutlineTimeline } from 'react-icons/md';
import { MicroInteractions } from '@/components/UI/NotificationSystem';

type LearningLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

type CourseNode = {
  id: string;
  title: string;
  description: string;
  level: LearningLevel;
  duration: string;
  progress?: number; // 0-100
  completed?: boolean;
  locked?: boolean;
  prerequisiteIds?: string[];
  skills: string[];
  certification?: boolean;
};

type PathVisualizerProps = {
  userId?: string;
  initialLevel?: LearningLevel;
  highlightedCourseId?: string;
  onCourseSelect?: (courseId: string) => void;
};

const MOCK_COURSES: CourseNode[] = [
  {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    description: 'Introduction to key AI concepts and technologies',
    level: 'beginner',
    duration: '4 weeks',
    progress: 100,
    completed: true,
    locked: false,
    skills: ['AI Basics', 'Machine Learning Intro', 'Data Analysis'],
    certification: true
  },
  {
    id: 'ml-foundations',
    title: 'Machine Learning Foundations',
    description: 'Core principles of machine learning algorithms',
    level: 'beginner',
    duration: '6 weeks',
    progress: 75,
    completed: false,
    locked: false,
    prerequisiteIds: ['ai-fundamentals'],
    skills: ['Supervised Learning', 'Data Preprocessing', 'Model Evaluation']
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning Essentials',
    description: 'Neural networks and deep learning architectures',
    level: 'intermediate',
    duration: '8 weeks',
    progress: 30,
    completed: false,
    locked: false,
    prerequisiteIds: ['ml-foundations'],
    skills: ['Neural Networks', 'Backpropagation', 'TensorFlow/PyTorch']
  },
  {
    id: 'nlp-intro',
    title: 'Natural Language Processing',
    description: 'Processing and analyzing human language with AI',
    level: 'intermediate',
    duration: '6 weeks',
    progress: 0,
    completed: false,
    locked: true,
    prerequisiteIds: ['deep-learning'],
    skills: ['Text Processing', 'Sentiment Analysis', 'Language Models']
  },
  {
    id: 'cv-intro',
    title: 'Computer Vision',
    description: 'Image recognition and visual data processing',
    level: 'intermediate',
    duration: '6 weeks',
    progress: 0,
    completed: false,
    locked: true,
    prerequisiteIds: ['deep-learning'],
    skills: ['Image Processing', 'Object Detection', 'CNN Architectures']
  },
  {
    id: 'llm-advanced',
    title: 'Large Language Models',
    description: 'Working with advanced transformer-based models',
    level: 'advanced',
    duration: '8 weeks',
    progress: 0,
    completed: false,
    locked: true,
    prerequisiteIds: ['nlp-intro'],
    skills: ['Transformers', 'Fine-tuning', 'Prompt Engineering']
  },
  {
    id: 'ai-ethics',
    title: 'AI Ethics & Governance',
    description: 'Ethical considerations in AI systems',
    level: 'advanced',
    duration: '4 weeks',
    progress: 0,
    completed: false,
    locked: true,
    prerequisiteIds: ['llm-advanced', 'cv-intro'],
    skills: ['Bias Detection', 'Fairness', 'Governance Frameworks']
  },
  {
    id: 'ai-research',
    title: 'AI Research Methods',
    description: 'Advanced research techniques in artificial intelligence',
    level: 'expert',
    duration: '12 weeks',
    progress: 0,
    completed: false,
    locked: true,
    prerequisiteIds: ['ai-ethics'],
    skills: ['Research Design', 'Paper Writing', 'Experimental Methods'],
    certification: true
  }
];

// Helper functions
const getLevelColor = (level: LearningLevel) => {
  switch (level) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'advanced':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'expert':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getLevelNumber = (level: LearningLevel): number => {
  switch (level) {
    case 'beginner': return 1;
    case 'intermediate': return 2;
    case 'advanced': return 3;
    case 'expert': return 4;
    default: return 1;
  }
};

export default function AILearningPathVisualizer({ 
  userId,
  initialLevel = 'beginner',
  highlightedCourseId,
  onCourseSelect
}: PathVisualizerProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel>(initialLevel);
  const [courses, setCourses] = useState<CourseNode[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, fetch from API
        // const response = await fetch(`/api/courses/learning-path?userId=${userId}`);
        // const data = await response.json();
        // setCourses(data.courses);
        
        // For now, use sample data with a delay to simulate loading
        setTimeout(() => {
          setCourses(MOCK_COURSES);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching learning path data:', error);
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  // Filter courses by selected level
  const filteredCourses = courses.filter(course => 
    viewMode === 'timeline' || course.level === selectedLevel
  );

  // Handle course click
  const handleCourseClick = (courseId: string) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
    }
    
    if (onCourseSelect) {
      onCourseSelect(courseId);
    }
  };

  // Check if we should highlight a course
  useEffect(() => {
    if (highlightedCourseId) {
      setExpandedCourse(highlightedCourseId);
      
      // Find the course and make sure we show the right level
      const course = courses.find(c => c.id === highlightedCourseId);
      if (course) {
        setSelectedLevel(course.level);
      }
    }
  }, [highlightedCourseId, courses]);

  // Calculate dependencies (for timeline connections)
  const courseConnections = courses.flatMap(course => 
    (course.prerequisiteIds || []).map(prereqId => ({
      from: prereqId,
      to: course.id
    }))
  );

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center">
          <FaGraduationCap className="animate-bounce text-blue-600 h-10 w-10 mb-4" />
          <p className="text-gray-600">Loading your personalized learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* View mode toggle */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Your AI Learning Path</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg flex items-center ${
              viewMode === 'timeline' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
            }`}
          >
            <MdOutlineTimeline className="mr-1.5" />
            Timeline
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg flex items-center ${
              viewMode === 'grid' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
            }`}
          >
            <FaGraduationCap className="mr-1.5" />
            Courses
          </button>
        </div>
      </div>

      {/* Level selection (for grid view) */}
      {viewMode === 'grid' && (
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {(['beginner', 'intermediate', 'advanced', 'expert'] as LearningLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedLevel === level 
                    ? `${getLevelColor(level)} border` 
                    : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="relative mt-8 pl-8">
          {/* Main Timeline */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <MicroInteractions.StaggerChildren staggerDelay={0.1} className="space-y-12">
            {filteredCourses.map((course, index) => (
              <div key={course.id} className="relative">
                {/* Timeline indicator */}
                <div className={`absolute -left-8 mt-1.5 h-6 w-6 rounded-full border-2 flex items-center justify-center z-10 ${
                  course.completed 
                    ? 'bg-green-100 border-green-500 text-green-600' 
                    : course.locked 
                      ? 'bg-gray-100 border-gray-300 text-gray-500'
                      : 'bg-blue-100 border-blue-500 text-blue-600'
                }`}>
                  {course.completed ? (
                    <FaCheck className="h-3 w-3" />
                  ) : course.locked ? (
                    <FaLock className="h-3 w-3" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                
                {/* Course card */}
                <motion.div 
                  whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  onClick={() => handleCourseClick(course.id)}
                  className={`pl-4 pr-8 py-4 bg-white rounded-xl shadow-md border-l-4 cursor-pointer relative ${
                    expandedCourse === course.id 
                      ? 'ring-2 ring-blue-300 shadow-lg' 
                      : 'hover:shadow-md'
                  } ${
                    course.locked 
                      ? 'border-l-gray-300 opacity-70' 
                      : course.completed 
                        ? 'border-l-green-500' 
                        : 'border-l-blue-500'
                  }`}
                >
                  {/* Course level badge */}
                  <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </div>
                  
                  {/* Certification badge */}
                  {course.certification && (
                    <div className="absolute bottom-4 right-4">
                      <MicroInteractions.Pulse>
                        <FaTrophy className="text-yellow-500 h-5 w-5" />
                      </MicroInteractions.Pulse>
                    </div>
                  )}
                  
                  {/* Lock indicator */}
                  {course.locked && (
                    <div className="absolute inset-0 bg-gray-50 bg-opacity-60 rounded-xl flex items-center justify-center z-20">
                      <div className="bg-white rounded-lg p-3 shadow-md flex items-center">
                        <FaLock className="text-gray-400 mr-2" />
                        <span className="text-gray-600 font-medium">Complete prerequisites to unlock</span>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                  
                  {/* Progress bar */}
                  {(course.progress !== undefined && course.progress > 0) && (
                    <div className="mt-2 mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-600">Progress</span>
                        <span className="font-medium text-blue-600">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Duration */}
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <span className="mr-4">{course.duration}</span>
                  </div>
                  
                  {/* Expanded content */}
                  {expandedCourse === course.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills you'll learn:</h4>
                        <div className="flex flex-wrap gap-2">
                          {course.skills.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Prerequisites */}
                      {course.prerequisiteIds && course.prerequisiteIds.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Prerequisites:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                            {course.prerequisiteIds.map(prereqId => {
                              const prereq = courses.find(c => c.id === prereqId);
                              return prereq ? (
                                <li key={prereqId}>
                                  {prereq.title}
                                  {prereq.completed && (
                                    <FaCheck className="inline-block ml-1 text-green-500" />
                                  )}
                                </li>
                              ) : null;
                            })}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-3 flex justify-end">
                        <button 
                          className={`px-4 py-2 rounded-md text-white flex items-center ${
                            course.locked 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          disabled={course.locked}
                        >
                          {course.progress && course.progress > 0 
                            ? 'Continue Learning' 
                            : 'Start Course'
                          }
                          <FaRocket className="ml-2" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Connection lines for prerequisites */}
                {courseConnections
                  .filter(conn => conn.to === course.id)
                  .map((conn, idx) => {
                    const fromIndex = filteredCourses.findIndex(c => c.id === conn.from);
                    // Only draw connections to courses that are visible in the timeline
                    if (fromIndex >= 0 && fromIndex < index) {
                      return (
                        <div 
                          key={`${conn.from}-${conn.to}`}
                          className="absolute w-8 border-t-2 border-dashed border-gray-300"
                          style={{ 
                            top: '-30px',
                            left: '-24px',
                            transform: `rotate(90deg) translateY(${(index - fromIndex) * 135}px)`,
                            transformOrigin: 'left top',
                            height: '2px',
                            width: `${(index - fromIndex) * 150}px`
                          }}
                        ></div>
                      );
                    }
                    return null;
                  })
                }
              </div>
            ))}
          </MicroInteractions.StaggerChildren>
        </div>
      )}
      
      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            <MicroInteractions.StaggerChildren staggerDelay={0.08} className="contents">
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  whileHover={{ y: -4, boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.1)' }}
                  onClick={() => handleCourseClick(course.id)}
                  className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer border ${
                    expandedCourse === course.id 
                      ? 'ring-2 ring-blue-300 border-blue-300' 
                      : 'border-gray-200 hover:border-blue-200'
                  } ${course.locked ? 'opacity-70' : ''}`}
                >
                  {/* Course header with color based on level */}
                  <div className={`h-3 ${getLevelColor(course.level).split(' ')[0]}`}></div>
                  
                  <div className="p-5">
                    {/* Lock indicator */}
                    {course.locked && (
                      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-xl">
                        <div className="bg-white rounded-lg p-3 shadow-md flex flex-col items-center">
                          <FaLock className="text-gray-400 mb-2 h-6 w-6" />
                          <span className="text-gray-600 font-medium text-center">Complete prerequisites first</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      
                      {/* Status indicator */}
                      {course.completed ? (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                          <FaCheck className="mr-1 h-3 w-3" />
                          Completed
                        </span>
                      ) : course.progress && course.progress > 0 ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          In Progress
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          Not Started
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    {/* Progress bar */}
                    {(course.progress !== undefined && course.progress > 0) && (
                      <div className="mt-2 mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-600">Progress</span>
                          <span className="font-medium text-blue-600">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                      <div className="flex items-center">
                        <FaGraduationCap className="mr-1.5 text-gray-400" />
                        <span>{course.duration}</span>
                      </div>
                      
                      {course.certification && (
                        <div className="flex items-center">
                          <FaTrophy className="mr-1.5 text-yellow-500" />
                          <span className="text-gray-700">Certification</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Skills */}
                    <div className="mt-4 flex flex-wrap gap-1">
                      {course.skills.slice(0, 3).map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {course.skills.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                          +{course.skills.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {/* Expanded content */}
                    {expandedCourse === course.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        {/* Prerequisites */}
                        {course.prerequisiteIds && course.prerequisiteIds.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Prerequisites:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 ml-1">
                              {course.prerequisiteIds.map(prereqId => {
                                const prereq = courses.find(c => c.id === prereqId);
                                return prereq ? (
                                  <li key={prereqId} className="mb-1">
                                    {prereq.title}
                                    {prereq.completed && (
                                      <FaCheck className="inline-block ml-1 text-green-500" />
                                    )}
                                  </li>
                                ) : null;
                              })}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-end">
                          <button 
                            className={`px-4 py-2 rounded-md text-white flex items-center ${
                              course.locked 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            disabled={course.locked}
                          >
                            {course.progress && course.progress > 0 
                              ? 'Continue Learning' 
                              : 'Start Course'
                            }
                            <FaRocket className="ml-2" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </MicroInteractions.StaggerChildren>
          ) : (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <FaGraduationCap className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No courses found</h3>
              <p className="text-gray-500">
                There are no {selectedLevel} level courses available at this time.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}