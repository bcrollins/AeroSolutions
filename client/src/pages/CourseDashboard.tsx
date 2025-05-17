import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Clock,
  Award,
  Zap,
  BarChart,
  ChevronRight,
  Bookmark,
  CheckCircle,
  Users,
  AlertCircle,
  Flame,
  BookMarked,
  GraduationCap,
  Trophy,
  Star
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  progress: number;
  lastAccessed: string;
  instructor: string;
  completedLessons: number;
  totalLessons: number;
  nextLesson?: {
    id: number;
    title: string;
    moduleTitle: string;
  };
  dueAssignment?: {
    id: number;
    title: string;
    dueDate: string;
  };
  upcomingQuiz?: {
    id: number;
    title: string;
    date: string;
  };
  category: string;
  tags: string[];
  estimatedTimeToComplete: string;
}

interface UserStats {
  streak: number;
  totalTimeSpent: number; // in minutes
  totalPointsEarned: number;
  completedCourses: number;
  completedLessons: number;
  totalQuizzes: number;
  averageScore: number;
  nextCertificate?: {
    title: string;
    percentageToComplete: number;
  };
  badges: {
    id: number;
    name: string;
    icon: string;
    dateEarned: string;
    description: string;
  }[];
  recentAchievements: {
    id: number;
    title: string;
    date: string;
    points: number;
    type: 'certificate' | 'badge' | 'milestone' | 'streak';
  }[];
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: 'assignment' | 'quiz' | 'live' | 'deadline';
  courseId: number;
  courseTitle: string;
}

const CourseDashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('in-progress');
  
  // Fetch user's enrolled courses
  const { data: enrolledCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['/api/user/enrolled-courses'],
    placeholderData: mockEnrolledCourses, // Using mock data
  });
  
  // Fetch user stats
  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/user/stats'],
    placeholderData: mockUserStats, // Using mock data
  });
  
  // Fetch upcoming events
  const { data: calendarEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/user/calendar'],
    placeholderData: mockCalendarEvents, // Using mock data
  });
  
  // Filter courses based on active tab
  const filteredCourses = enrolledCourses?.filter(course => {
    if (activeTab === 'in-progress') {
      return course.progress > 0 && course.progress < 100;
    } else if (activeTab === 'not-started') {
      return course.progress === 0;
    } else if (activeTab === 'completed') {
      return course.progress === 100;
    }
    return true; // 'all' tab
  });
  
  // Sort upcoming events
  const upcomingEvents = calendarEvents
    ? [...calendarEvents]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .filter(event => new Date(event.date) >= new Date())
        .slice(0, 3)
    : [];
  
  // Format time spent in hours and minutes
  const formatTimeSpent = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Format relative time (e.g., "2 days ago")
  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Format date for calendar events
  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  // Calculate days until (or days passed) for events
  const getDaysUntil = (dateString: string): { days: number; isPast: boolean } => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = date.getTime() - now.getTime();
    const isPast = diffTime < 0;
    const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
    return { days: diffDays, isPast };
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your progress and continue your learning journey</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - Left and Middle columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Learning Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoadingStats ? (
              // Loading skeletons for stats
              <>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </>
            ) : (
              // Actual stats
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <Flame className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Learning Streak</p>
                        <div className="flex items-baseline space-x-2">
                          <h4 className="text-2xl font-semibold text-gray-900">{userStats?.streak}</h4>
                          <p className="text-sm text-gray-500">days</p>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Keep going to earn streak rewards!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Time Spent Learning</p>
                        <div className="flex items-baseline space-x-2">
                          <h4 className="text-2xl font-semibold text-gray-900">
                            {formatTimeSpent(userStats?.totalTimeSpent || 0)}
                          </h4>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">
                          {userStats?.completedLessons} lessons completed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                        <Award className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Points Earned</p>
                        <div className="flex items-baseline space-x-2">
                          <h4 className="text-2xl font-semibold text-gray-900">
                            {userStats?.totalPointsEarned.toLocaleString()}
                          </h4>
                          <p className="text-sm text-gray-500">XP</p>
                        </div>
                        <p className="text-xs text-amber-600 mt-1">
                          {userStats?.badges.length} badges earned
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </section>
          
          {/* Continue Learning Section */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
              <Button variant="link" asChild>
                <Link href="/courses">
                  View All Courses
                </Link>
              </Button>
            </div>
            
            {isLoadingCourses ? (
              // Loading skeletons for courses
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-lg" />
                ))}
              </div>
            ) : (
              <Tabs defaultValue="in-progress" onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="in-progress">
                    In Progress ({enrolledCourses?.filter(c => c.progress > 0 && c.progress < 100).length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="not-started">
                    Not Started ({enrolledCourses?.filter(c => c.progress === 0).length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({enrolledCourses?.filter(c => c.progress === 100).length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    All ({enrolledCourses?.length || 0})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-0">
                  {filteredCourses?.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {activeTab === 'in-progress' 
                            ? "No courses in progress" 
                            : activeTab === 'completed'
                              ? "No completed courses yet"
                              : "No courses found"}
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          {activeTab === 'in-progress' 
                            ? "Start learning today by enrolling in a course or continuing one you've already started."
                            : activeTab === 'completed'
                              ? "Complete a course to see it listed here. Keep learning to earn certificates and badges!"
                              : "Explore our course catalog to find the perfect learning opportunity for you."}
                        </p>
                        <Button asChild>
                          <Link href="/courses">Explore Courses</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {filteredCourses?.map((course) => (
                        <Card key={course.id} className="overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            {/* Course Image (for medium screens and up) */}
                            <div className="md:w-1/4 lg:w-1/5 hidden md:block">
                              <div className="h-full w-full bg-gray-100">
                                {course.coverImage ? (
                                  <img 
                                    src={course.coverImage} 
                                    alt={course.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                    <BookOpen className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Course Details */}
                            <div className="p-6 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                                  <p className="text-sm text-gray-500 mb-2">Instructor: {course.instructor}</p>
                                </div>
                                
                                <div className="text-right">
                                  <Badge variant="outline" className="mb-1">
                                    {course.category}
                                  </Badge>
                                  <p className="text-xs text-gray-500">
                                    Last accessed {getRelativeTime(course.lastAccessed)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="mt-4 mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-medium">{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-2" />
                                <p className="text-xs text-gray-500 mt-1">
                                  {course.completedLessons} of {course.totalLessons} lessons completed
                                </p>
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex flex-wrap gap-2 mt-4">
                                {course.progress < 100 ? (
                                  <Button 
                                    onClick={() => course.nextLesson 
                                      ? setLocation(`/courses/${course.id}/learn/${course.nextLesson.id}`)
                                      : setLocation(`/courses/${course.id}`)
                                    }
                                  >
                                    {course.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                                  </Button>
                                ) : (
                                  <Button variant="outline">
                                    Review Course
                                  </Button>
                                )}
                                
                                <Button variant="outline" asChild>
                                  <Link href={`/courses/${course.id}`}>
                                    Course Details
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Quick info footer */}
                          {(course.nextLesson || course.dueAssignment || course.upcomingQuiz) && (
                            <div className="bg-gray-50 px-6 py-3 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                              {course.nextLesson && (
                                <div className="flex items-center text-sm">
                                  <BookOpen className="h-4 w-4 text-blue-500 mr-2" />
                                  <div>
                                    <p className="text-gray-500">Next Lesson</p>
                                    <p className="font-medium text-gray-900 truncate">{course.nextLesson.title}</p>
                                  </div>
                                </div>
                              )}
                              
                              {course.dueAssignment && (
                                <div className="flex items-center text-sm">
                                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                                  <div>
                                    <p className="text-gray-500">Due Assignment</p>
                                    <p className="font-medium text-gray-900 truncate">{course.dueAssignment.title}</p>
                                    <p className="text-xs text-amber-600">Due {formatEventDate(course.dueAssignment.dueDate)}</p>
                                  </div>
                                </div>
                              )}
                              
                              {course.upcomingQuiz && (
                                <div className="flex items-center text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <div>
                                    <p className="text-gray-500">Upcoming Quiz</p>
                                    <p className="font-medium text-gray-900 truncate">{course.upcomingQuiz.title}</p>
                                    <p className="text-xs text-green-600">On {formatEventDate(course.upcomingQuiz.date)}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </section>
          
          {/* Recent achievements */}
          {userStats?.recentAchievements && userStats.recentAchievements.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Achievements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userStats.recentAchievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        achievement.type === 'badge' 
                          ? 'bg-purple-100 text-purple-600'
                          : achievement.type === 'certificate'
                            ? 'bg-green-100 text-green-600'
                            : achievement.type === 'streak'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-blue-100 text-blue-600'
                      }`}>
                        {achievement.type === 'badge' && <Award className="h-6 w-6" />}
                        {achievement.type === 'certificate' && <GraduationCap className="h-6 w-6" />}
                        {achievement.type === 'streak' && <Flame className="h-6 w-6" />}
                        {achievement.type === 'milestone' && <Trophy className="h-6 w-6" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-900">{achievement.title}</p>
                          <Badge variant="outline" className="ml-2">+{achievement.points} XP</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Earned {getRelativeTime(achievement.date)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-8">
          {/* Upcoming events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <span>Upcoming Events</span>
              </CardTitle>
              <CardDescription>
                Your schedule for the next few days
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoadingEvents ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">No upcoming events</p>
                  <p className="text-sm text-gray-500">
                    You don't have any scheduled learning events.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => {
                    const { days, isPast } = getDaysUntil(event.date);
                    return (
                      <div 
                        key={event.id} 
                        className={`p-3 rounded-lg border ${
                          isPast 
                            ? 'border-red-200 bg-red-50' 
                            : days === 0 
                              ? 'border-amber-200 bg-amber-50'
                              : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            event.type === 'assignment' 
                              ? 'bg-blue-100 text-blue-600' 
                              : event.type === 'quiz'
                                ? 'bg-purple-100 text-purple-600'
                                : event.type === 'live'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-amber-100 text-amber-600'
                          }`}>
                            {event.type === 'assignment' && <BookMarked className="h-4 w-4" />}
                            {event.type === 'quiz' && <CheckCircle className="h-4 w-4" />}
                            {event.type === 'live' && <Users className="h-4 w-4" />}
                            {event.type === 'deadline' && <AlertCircle className="h-4 w-4" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{event.title}</p>
                            <p className="text-sm text-gray-600 truncate">{event.courseTitle}</p>
                            <p className={`text-sm ${
                              isPast 
                                ? 'text-red-600' 
                                : days === 0 
                                  ? 'text-amber-600'
                                  : 'text-gray-500'
                            }`}>
                              {formatEventDate(event.date)}
                              {isPast && ' (Overdue)'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/calendar">
                  View Full Calendar
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Learning progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-gray-500" />
                <span>Learning Progress</span>
              </CardTitle>
              <CardDescription>
                Your learning achievements so far
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-5">
              {isLoadingStats ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Courses Completed</span>
                      <span className="font-medium">{userStats?.completedCourses || 0}</span>
                    </div>
                    <Progress 
                      value={userStats?.completedCourses 
                        ? (userStats.completedCourses / Math.max(1, enrolledCourses?.length || 1)) * 100 
                        : 0
                      } 
                      className="h-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {userStats?.completedCourses || 0} of {enrolledCourses?.length || 0} enrolled courses
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Quizzes Completed</span>
                      <span className="font-medium">{userStats?.totalQuizzes || 0}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 mr-2">Average Score:</span>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(userStats?.averageScore || 0) / 20
                                ? "fill-current"
                                : "fill-none"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-medium">{userStats?.averageScore || 0}%</span>
                    </div>
                  </div>
                  
                  {userStats?.nextCertificate && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Next Certificate</span>
                        <span className="font-medium">{userStats.nextCertificate.percentageToComplete}% to go</span>
                      </div>
                      <Progress value={100 - (userStats.nextCertificate.percentageToComplete || 0)} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {userStats.nextCertificate.title}
                      </p>
                    </div>
                  )}
                  
                  {userStats?.badges && userStats.badges.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Badges</h4>
                      <div className="flex -space-x-2">
                        {userStats.badges.slice(0, 5).map((badge) => (
                          <div 
                            key={badge.id} 
                            className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center"
                            title={badge.name}
                          >
                            {badge.icon ? (
                              <img src={badge.icon} alt={badge.name} className="h-6 w-6" />
                            ) : (
                              <Award className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                        ))}
                        
                        {userStats.badges.length > 5 && (
                          <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                            +{userStats.badges.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/achievements">
                  View All Achievements
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Recommended courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bookmark className="h-5 w-5 mr-2 text-gray-500" />
                <span>Recommended For You</span>
              </CardTitle>
              <CardDescription>
                Courses selected based on your interests
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoadingCourses ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {mockRecommendedCourses.map((course) => (
                    <div key={course.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {course.coverImage ? (
                          <img 
                            src={course.coverImage} 
                            alt={course.title}
                            className="h-full w-full object-cover rounded-md"
                          />
                        ) : (
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{course.title}</p>
                        <p className="text-sm text-gray-500 truncate">{course.instructor}</p>
                        <div className="flex items-center text-xs text-yellow-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(course.rating)
                                  ? "fill-current"
                                  : "fill-none"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-gray-600">({course.ratingCount})</span>
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/courses/recommended">
                  View More Recommendations
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Mock data for demonstration purposes
const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: 1,
    title: "Advanced AI Development",
    description: "Learn how to build and deploy sophisticated AI systems using cutting-edge techniques.",
    coverImage: "/images/courses/ai-development.jpg",
    progress: 65,
    lastAccessed: "2025-05-16T15:30:00",
    instructor: "Dr. Sarah Chen",
    completedLessons: 7,
    totalLessons: 12,
    nextLesson: {
      id: 103,
      title: "Knowledge Check: AI Foundations",
      moduleTitle: "Foundations of Modern AI"
    },
    dueAssignment: {
      id: 201,
      title: "Implement a Basic Neural Network",
      dueDate: "2025-05-20T23:59:59"
    },
    category: "Artificial Intelligence",
    tags: ["python", "machine learning", "neural networks"],
    estimatedTimeToComplete: "12h 30m"
  },
  {
    id: 2,
    title: "Machine Learning Fundamentals",
    description: "A comprehensive introduction to machine learning concepts, algorithms, and applications.",
    coverImage: "/images/courses/ml-fundamentals.jpg",
    progress: 30,
    lastAccessed: "2025-05-15T10:15:00",
    instructor: "Prof. Michael Wong",
    completedLessons: 4,
    totalLessons: 15,
    nextLesson: {
      id: 205,
      title: "Supervised Learning: Classification Models",
      moduleTitle: "Supervised Learning"
    },
    upcomingQuiz: {
      id: 4,
      title: "Supervised Learning Concepts Quiz",
      date: "2025-05-18T14:00:00"
    },
    category: "Machine Learning",
    tags: ["algorithms", "data science", "python"],
    estimatedTimeToComplete: "18h 45m"
  },
  {
    id: 3,
    title: "Data Science for Business",
    description: "Learn how to leverage data science techniques to drive business decisions and growth.",
    coverImage: "/images/courses/data-science-business.jpg",
    progress: 100,
    lastAccessed: "2025-05-10T16:45:00",
    instructor: "Dr. Emily Rodriguez",
    completedLessons: 10,
    totalLessons: 10,
    category: "Data Science",
    tags: ["business intelligence", "analytics", "decision making"],
    estimatedTimeToComplete: "15h 20m"
  },
  {
    id: 4,
    title: "Introduction to Natural Language Processing",
    description: "Explore the fundamentals of NLP and learn how to build applications that can understand human language.",
    coverImage: "/images/courses/nlp-intro.jpg",
    progress: 0,
    lastAccessed: "2025-05-01T09:30:00",
    instructor: "Dr. James Kim",
    completedLessons: 0,
    totalLessons: 8,
    category: "Natural Language Processing",
    tags: ["NLP", "BERT", "transformers"],
    estimatedTimeToComplete: "10h 15m"
  }
];

const mockUserStats: UserStats = {
  streak: 12,
  totalTimeSpent: 1560, // 26 hours
  totalPointsEarned: 5750,
  completedCourses: 1,
  completedLessons: 21,
  totalQuizzes: 8,
  averageScore: 85,
  nextCertificate: {
    title: "Advanced AI Development Certificate",
    percentageToComplete: 35
  },
  badges: [
    {
      id: 1,
      name: "Fast Learner",
      icon: "/images/badges/fast-learner.svg",
      dateEarned: "2025-05-12T14:30:00",
      description: "Completed 5 lessons in a single day"
    },
    {
      id: 2,
      name: "Quiz Master",
      icon: "/images/badges/quiz-master.svg",
      dateEarned: "2025-05-10T11:15:00",
      description: "Scored 90% or higher on 3 consecutive quizzes"
    },
    {
      id: 3,
      name: "Consistency Champion",
      icon: "/images/badges/consistency-champion.svg",
      dateEarned: "2025-05-07T09:45:00",
      description: "Maintained a 10-day learning streak"
    }
  ],
  recentAchievements: [
    {
      id: 1,
      title: "Quiz Master Badge",
      date: "2025-05-10T11:15:00",
      points: 100,
      type: "badge"
    },
    {
      id: 2,
      title: "10-Day Streak",
      date: "2025-05-07T09:45:00",
      points: 50,
      type: "streak"
    },
    {
      id: 3,
      title: "Data Science for Business Certificate",
      date: "2025-05-05T16:30:00",
      points: 500,
      type: "certificate"
    },
    {
      id: 4,
      title: "Completed 20 Lessons",
      date: "2025-05-03T14:20:00",
      points: 200,
      type: "milestone"
    }
  ]
};

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Neural Network Implementation Due",
    date: "2025-05-20T23:59:59",
    type: "assignment",
    courseId: 1,
    courseTitle: "Advanced AI Development"
  },
  {
    id: 2,
    title: "Supervised Learning Quiz",
    date: "2025-05-18T14:00:00",
    type: "quiz",
    courseId: 2,
    courseTitle: "Machine Learning Fundamentals"
  },
  {
    id: 3,
    title: "Live Q&A Session: Deep Learning Techniques",
    date: "2025-05-21T18:00:00",
    type: "live",
    courseId: 1,
    courseTitle: "Advanced AI Development"
  },
  {
    id: 4,
    title: "Project Proposal Deadline",
    date: "2025-05-25T23:59:59",
    type: "deadline",
    courseId: 2,
    courseTitle: "Machine Learning Fundamentals"
  }
];

const mockRecommendedCourses = [
  {
    id: 101,
    title: "Deep Learning for Computer Vision",
    description: "Master cutting-edge computer vision techniques using deep learning frameworks like TensorFlow and PyTorch.",
    coverImage: "/images/courses/deep-learning-cv.jpg",
    instructor: "Prof. Alex Martinez",
    rating: 4.9,
    ratingCount: 256,
    price: "129.99"
  },
  {
    id: 102,
    title: "Reinforcement Learning: Theory to Practice",
    description: "A deep dive into reinforcement learning techniques, from foundational algorithms to cutting-edge applications.",
    coverImage: "/images/courses/reinforcement-learning.jpg",
    instructor: "Dr. Lisa Wang",
    rating: 4.8,
    ratingCount: 189,
    price: "149.99"
  },
  {
    id: 103,
    title: "AI Ethics and Responsible Development",
    description: "Explore the ethical considerations and best practices for developing AI systems that are fair, transparent, and accountable.",
    coverImage: "/images/courses/ai-ethics.jpg",
    instructor: "Dr. Maya Patel",
    rating: 4.7,
    ratingCount: 142,
    price: "89.99"
  }
];

export default CourseDashboard;