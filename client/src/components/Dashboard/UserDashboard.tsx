import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'wouter';
import { FaBook, FaGraduationCap, FaCertificate, FaBell, FaChartLine, FaRegCalendarAlt, FaRegClock, FaBookmark, FaCheckCircle, FaChevronRight, FaTools, FaLayerGroup, FaTrophy, FaUserFriends, FaUserGraduate, FaPlay } from 'react-icons/fa';
import { RiChat1Line, RiSettings4Line } from 'react-icons/ri';
import { MicroInteractions } from '@/components/UI/NotificationSystem';
import { useNotification } from '@/components/UI/NotificationSystem';

type CourseProgress = {
  id: string;
  title: string;
  progress: number; // 0-100
  lastAccessed: string; // ISO date string
  nextLesson: {
    id: string;
    moduleId: string;
    title: string;
  };
  totalLessons: number;
  completedLessons: number;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  earnedDate: string; // ISO date string
  icon: string;
  type: 'course' | 'skill' | 'engagement' | 'milestone';
};

type UpcomingEvent = {
  id: string;
  title: string;
  date: string; // ISO date string
  type: 'liveSession' | 'webinar' | 'deadline' | 'newContent';
  url?: string;
  description?: string;
};

type SavedResource = {
  id: string;
  title: string;
  type: 'article' | 'video' | 'tool' | 'reference';
  url: string;
  savedDate: string; // ISO date string
};

type RecommendedCourse = {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  matchScore: number; // 0-100
  imageUrl?: string;
};

type UserStats = {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  totalTimeSpent: number; // in minutes
  certificatesEarned: number;
  learningStreak: number; // days
};

interface DashboardProps {
  username: string;
  avatarUrl?: string;
  courseProgress: CourseProgress[];
  achievements: Achievement[];
  upcomingEvents: UpcomingEvent[];
  savedResources: SavedResource[];
  recommendedCourses: RecommendedCourse[];
  userStats: UserStats;
  hasNewNotifications?: boolean;
  onCourseSelect?: (courseId: string) => void;
}

export default function UserDashboard({
  username,
  avatarUrl,
  courseProgress,
  achievements,
  upcomingEvents,
  savedResources,
  recommendedCourses,
  userStats,
  hasNewNotifications = false,
  onCourseSelect
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'achievements' | 'resources'>('overview');
  const [, navigate] = useLocation();
  const { showNotification } = useNotification();
  
  // Format a date in a user-friendly way
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(date);
  };
  
  // Format time duration
  const formatTimeSpent = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min${minutes === 1 ? '' : 's'}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    
    return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} min${remainingMinutes === 1 ? '' : 's'}`;
  };
  
  // Get relative time for last accessed
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 60) {
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      return formatDate(dateString);
    }
  };
  
  // Handle continue course action
  const handleContinueCourse = (course: CourseProgress) => {
    if (onCourseSelect) {
      onCourseSelect(course.id);
    } else {
      navigate(`/courses/${course.id}/lessons/${course.nextLesson.moduleId}/${course.nextLesson.id}`);
    }
    
    showNotification({
      title: 'Continuing Course',
      message: `Resuming ${course.title} from where you left off.`,
      type: 'info'
    });
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative">
                <img 
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0066cc&color=fff`} 
                  alt={username}
                  className="h-10 w-10 rounded-full object-cover border-2 border-blue-100"
                />
                {hasNewNotifications && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">{username}'s Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back to your learning journey</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
                <FaBell className="h-5 w-5" />
                {hasNewNotifications && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>
              
              <button className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
                <RiSettings4Line className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex -mb-px space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'achievements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resources'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Saved Resources
            </button>
          </nav>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <MicroInteractions.StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                    <FaBook className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Courses Enrolled</p>
                    <h4 className="text-xl font-semibold text-gray-900">{userStats.totalCoursesEnrolled}</h4>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100 text-green-600">
                    <FaCheckCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Lessons Completed</p>
                    <h4 className="text-xl font-semibold text-gray-900">{userStats.totalLessonsCompleted}</h4>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                    <FaRegClock className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Time Spent Learning</p>
                    <h4 className="text-xl font-semibold text-gray-900">{formatTimeSpent(userStats.totalTimeSpent)}</h4>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                    <FaTrophy className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Learning Streak</p>
                    <h4 className="text-xl font-semibold text-gray-900">{userStats.learningStreak} days</h4>
                  </div>
                </div>
              </div>
            </MicroInteractions.StaggerChildren>
            
            {/* Continue Learning */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Continue Learning</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {courseProgress.length > 0 ? (
                  courseProgress.slice(0, 3).map((course) => (
                    <div key={course.id} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="mb-4 sm:mb-0">
                          <h3 className="text-base font-medium text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Last accessed {getRelativeTime(course.lastAccessed)}
                          </p>
                        </div>
                        
                        <MicroInteractions.HoverScale className="flex items-center">
                          <button
                            onClick={() => handleContinueCourse(course)}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Continue Learning
                            <FaChevronRight className="ml-2 h-3 w-3" />
                          </button>
                        </MicroInteractions.HoverScale>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-500">
                            {course.completedLessons} of {course.totalLessons} lessons completed
                          </span>
                          <span className="font-medium text-blue-600">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <p className="text-gray-600">
                          Next lesson: <span className="font-medium text-gray-900">{course.nextLesson.title}</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <FaBook className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-base font-medium text-gray-900">No courses in progress</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by enrolling in a course.</p>
                    <div className="mt-6">
                      <Link href="/courses">
                        <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Browse Courses
                        </a>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {courseProgress.length > 3 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <Link href="/courses">
                    <a className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View all courses ({courseProgress.length})
                    </a>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Two-column layout for the rest */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Upcoming events and achievements */}
              <div className="space-y-6 lg:col-span-1">
                {/* Upcoming Events */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                <FaRegCalendarAlt />
                              </div>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">{formatDate(event.date)}</p>
                              {event.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                              )}
                              {event.url && (
                                <a 
                                  href={event.url} 
                                  className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                                >
                                  View details
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center py-8">
                        <FaRegCalendarAlt className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-500">No upcoming events</p>
                      </div>
                    )}
                  </div>
                  
                  {upcomingEvents.length > 3 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <Link href="/events">
                        <a className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          View all events
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Recent Achievements */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {achievements.length > 0 ? (
                      achievements.slice(0, 3).map((achievement) => (
                        <div key={achievement.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                                <FaTrophy />
                              </div>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900">{achievement.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                              <p className="text-xs text-gray-400 mt-1">Earned {formatDate(achievement.earnedDate)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center py-8">
                        <FaTrophy className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-500">No achievements yet</p>
                        <p className="mt-1 text-xs text-gray-400">Complete courses to earn achievements</p>
                      </div>
                    )}
                  </div>
                  
                  {achievements.length > 3 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <button 
                        onClick={() => setActiveTab('achievements')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        View all achievements
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right column - Recommended courses and saved resources */}
              <div className="space-y-6 lg:col-span-2">
                {/* Recommended Courses */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendedCourses.length > 0 ? (
                      recommendedCourses.slice(0, 4).map((course) => (
                        <MicroInteractions.HoverScale key={course.id} scale={1.02}>
                          <div
                            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col"
                          >
                            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                              {course.imageUrl ? (
                                <img
                                  src={course.imageUrl}
                                  alt={course.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <FaGraduationCap className="h-12 w-12 text-white opacity-50" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                                {course.level}
                              </div>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-medium text-gray-900 text-sm mb-1">{course.title}</h3>
                              <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{course.description}</p>
                              
                              <div className="flex items-center justify-between mt-auto">
                                <span className="text-xs text-gray-500">{course.duration}</span>
                                <div className="flex items-center">
                                  <span className="text-xs font-medium text-blue-600">{course.matchScore}% match</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </MicroInteractions.HoverScale>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <FaGraduationCap className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-base font-medium text-gray-900">No recommendations yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Complete more courses to get personalized recommendations
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {recommendedCourses.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <Link href="/courses/recommended">
                        <a className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          View all recommendations
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Saved Resources */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Saved Resources</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {savedResources.length > 0 ? (
                      savedResources.slice(0, 4).map((resource) => (
                        <div key={resource.id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {resource.type === 'article' && (
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                  <FaBook />
                                </div>
                              )}
                              {resource.type === 'video' && (
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                                  <FaPlay />
                                </div>
                              )}
                              {resource.type === 'tool' && (
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                  <FaTools />
                                </div>
                              )}
                              {resource.type === 'reference' && (
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                  <FaBookmark />
                                </div>
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between">
                                <h3 className="text-sm font-medium text-gray-900">{resource.title}</h3>
                                <span className="text-xs text-gray-500">{formatDate(resource.savedDate)}</span>
                              </div>
                              <div className="mt-1 flex justify-between items-center">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                </span>
                                <a 
                                  href={resource.url}
                                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Open Resource
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <FaBookmark className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-500">No saved resources</p>
                        <p className="mt-1 text-xs text-gray-400">
                          Save articles, videos, and tools for easy access later
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {savedResources.length > 4 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <button 
                        onClick={() => setActiveTab('resources')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        View all saved resources
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {courseProgress.length > 0 ? (
                  courseProgress.map((course) => (
                    <div key={course.id} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="mb-4 sm:mb-0">
                          <h3 className="text-base font-medium text-gray-900">{course.title}</h3>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500">
                              {course.completedLessons} of {course.totalLessons} lessons completed
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm text-gray-500">
                              Last accessed {getRelativeTime(course.lastAccessed)}
                            </span>
                          </div>
                        </div>
                        
                        <MicroInteractions.HoverScale className="flex items-center">
                          <button
                            onClick={() => handleContinueCourse(course)}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Continue Learning
                            <FaChevronRight className="ml-2 h-3 w-3" />
                          </button>
                        </MicroInteractions.HoverScale>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-500">Progress</span>
                          <span className="font-medium text-blue-600">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <p className="text-gray-600">
                          Up next: <span className="font-medium text-gray-900">{course.nextLesson.title}</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <FaBook className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-base font-medium text-gray-900">No courses in progress</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by enrolling in a course.</p>
                    <div className="mt-6">
                      <Link href="/courses">
                        <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Browse Courses
                        </a>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Completed Courses */}
            {userStats.totalCoursesCompleted > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Completed Courses</h2>
                </div>
                
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* This would show completed courses - for demo we're just showing placeholder items */}
                  {[...Array(userStats.totalCoursesCompleted)].map((_, index) => (
                    <div 
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center mb-2">
                        <FaCheckCircle className="text-green-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-900">Completed Course {index + 1}</h3>
                      </div>
                      <p className="text-xs text-gray-500">
                        Completed on {formatDate(new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)).toISOString())}
                      </p>
                      {index % 2 === 0 && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Certificate Earned
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Achievement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                    <FaTrophy className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Achievements</p>
                    <h4 className="text-xl font-semibold text-gray-900">{achievements.length}</h4>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100 text-green-600">
                    <FaCertificate className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Certificates Earned</p>
                    <h4 className="text-xl font-semibold text-gray-900">{userStats.certificatesEarned}</h4>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                    <FaChartLine className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Learning Streak</p>
                    <h4 className="text-xl font-semibold text-gray-900">{userStats.learningStreak} days</h4>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Achievement Cards */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Achievements</h2>
              </div>
              
              <div className="p-6">
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                      >
                        <div className={`h-3 ${
                          achievement.type === 'course' 
                            ? 'bg-blue-500' 
                            : achievement.type === 'skill'
                              ? 'bg-green-500'
                              : achievement.type === 'engagement'
                                ? 'bg-purple-500'
                                : 'bg-yellow-500'
                        }`}></div>
                        
                        <div className="p-4">
                          <div className="flex items-center mb-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              achievement.type === 'course' 
                                ? 'bg-blue-100 text-blue-600' 
                                : achievement.type === 'skill'
                                  ? 'bg-green-100 text-green-600'
                                  : achievement.type === 'engagement'
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'bg-yellow-100 text-yellow-600'
                            }`}>
                              <FaTrophy />
                            </div>
                            <h3 className="ml-3 text-sm font-medium text-gray-900">{achievement.title}</h3>
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-3">{achievement.description}</p>
                          
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Earned {formatDate(achievement.earnedDate)}</span>
                            <span className={`px-2 py-0.5 rounded-full ${
                              achievement.type === 'course' 
                                ? 'bg-blue-100 text-blue-800' 
                                : achievement.type === 'skill'
                                  ? 'bg-green-100 text-green-800'
                                  : achievement.type === 'engagement'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaTrophy className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-base font-medium text-gray-900">No achievements yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Complete lessons and courses to earn achievements
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Saved Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {/* Resource Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Saved Resources</h2>
              </div>
              
              <div className="p-6">
                {savedResources.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        All Resources
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        Articles
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        Videos
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        Tools
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        References
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {savedResources.map((resource) => (
                        <div 
                          key={resource.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {resource.type === 'article' && (
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                  <FaBook />
                                </div>
                              )}
                              {resource.type === 'video' && (
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                                  <FaPlay />
                                </div>
                              )}
                              {resource.type === 'tool' && (
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                  <FaTools />
                                </div>
                              )}
                              {resource.type === 'reference' && (
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                  <FaBookmark />
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="text-base font-medium text-gray-900">{resource.title}</h3>
                                <span className="text-xs text-gray-500 ml-4">{formatDate(resource.savedDate)}</span>
                              </div>
                              <div className="mt-2 flex justify-between items-center">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                </span>
                                <div className="flex space-x-2">
                                  <a 
                                    href={resource.url}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Open Resource
                                  </a>
                                  <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-gray-700 hover:bg-gray-100">
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FaBookmark className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-base font-medium text-gray-900">No saved resources</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Save articles, videos, and tools for easy access later
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}