import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  Activity, 
  Clock, 
  Calendar, 
  BookOpen, 
  BrainCircuit, 
  Download, 
  Share2,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Info,
  CalendarDays,
  Users
} from 'lucide-react';

interface LearningAnalyticsProps {
  userId?: string;
  courseId?: string;
}

// Mock data for learning analytics
const weeklyActivityData = [
  { day: 'Mon', minutes: 42, modules: 2, quizzes: 1 },
  { day: 'Tue', minutes: 65, modules: 3, quizzes: 2 },
  { day: 'Wed', minutes: 78, modules: 4, quizzes: 1 },
  { day: 'Thu', minutes: 95, modules: 5, quizzes: 3 },
  { day: 'Fri', minutes: 55, modules: 2, quizzes: 1 },
  { day: 'Sat', minutes: 40, modules: 1, quizzes: 0 },
  { day: 'Sun', minutes: 20, modules: 1, quizzes: 0 },
];

const quizPerformanceData = [
  { name: 'Quiz 1', score: 85, average: 78 },
  { name: 'Quiz 2', score: 72, average: 75 },
  { name: 'Quiz 3', score: 90, average: 82 },
  { name: 'Quiz 4', score: 95, average: 80 },
  { name: 'Quiz 5', score: 88, average: 77 },
];

const skillRadarData = [
  { subject: 'ML Basics', A: 85, fullMark: 100 },
  { subject: 'Deep Learning', A: 65, fullMark: 100 },
  { subject: 'Data Processing', A: 78, fullMark: 100 },
  { subject: 'NLP', A: 92, fullMark: 100 },
  { subject: 'Neural Networks', A: 72, fullMark: 100 },
  { subject: 'AI Ethics', A: 88, fullMark: 100 },
];

const learningTimeDistribution = [
  { name: 'Videos', value: 35 },
  { name: 'Reading', value: 25 },
  { name: 'Quizzes', value: 15 },
  { name: 'Practice', value: 20 },
  { name: 'Discussion', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a480ff'];

const progressByModule = [
  { name: 'Module 1', completed: 100 },
  { name: 'Module 2', completed: 100 },
  { name: 'Module 3', completed: 85 },
  { name: 'Module 4', completed: 40 },
  { name: 'Module 5', completed: 0 },
  { name: 'Module 6', completed: 0 },
];

const monthlyProgressData = [
  { name: 'Jan', progress: 10 },
  { name: 'Feb', progress: 25 },
  { name: 'Mar', progress: 38 },
  { name: 'Apr', progress: 52 },
  { name: 'May', progress: 65 },
];

// Recent assessment results
const assessmentResults = [
  { id: 1, name: 'AI Basics Assessment', score: 92, date: 'May 10, 2025', status: 'passed' },
  { id: 2, name: 'Neural Networks Quiz', score: 85, date: 'May 12, 2025', status: 'passed' },
  { id: 3, name: 'Machine Learning Midterm', score: 78, date: 'May 14, 2025', status: 'passed' },
];

// Area for improvement
const improvementAreas = [
  { area: 'Neural Network Architectures', priority: 'high', resources: 3 },
  { area: 'Reinforcement Learning', priority: 'medium', resources: 5 },
  { area: 'Feature Engineering', priority: 'low', resources: 2 },
];

// Streak data
const streakData = {
  current: 5,
  longest: 12,
  weeklyGoal: 5,
  totalDays: 32,
};

// Upcoming deadlines
const upcomingDeadlines = [
  { id: 1, name: 'Project Proposal', due: 'May 20, 2025', daysLeft: 6, module: 'Module 3' },
  { id: 2, name: 'Peer Review', due: 'May 22, 2025', daysLeft: 8, module: 'Module 3' },
  { id: 3, name: 'Final Assignment', due: 'May 30, 2025', daysLeft: 16, module: 'Module 4' },
];

const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({ userId, courseId }) => {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'course'>('week');
  
  // Calculate overall stats
  const totalTimeSpent = weeklyActivityData.reduce((sum, day) => sum + day.minutes, 0);
  const averageQuizScore = quizPerformanceData.reduce((sum, quiz) => sum + quiz.score, 0) / quizPerformanceData.length;
  const completedModules = progressByModule.filter(module => module.completed === 100).length;
  const overallProgress = progressByModule.reduce((sum, module) => sum + module.completed, 0) / progressByModule.length;

  // Format time spent
  const formatTimeSpent = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-sm text-gray-400 mb-1">Course Progress</h3>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
            <div className="w-10 h-10 rounded-full bg-electric-cyan-900 flex items-center justify-center">
              <Activity className="h-5 w-5 text-electric-cyan-400" />
            </div>
          </div>
          <Progress value={overallProgress} className="h-2 mt-2 bg-gray-700" />
          <p className="text-xs text-gray-500 mt-1">
            {completedModules} of {progressByModule.length} modules completed
          </p>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-sm text-gray-400 mb-1">Time Spent</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{formatTimeSpent(totalTimeSpent)}</p>
              <p className="text-xs text-gray-500">This week</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="h-3 w-3 text-green-400 mr-1" />
            <p className="text-xs text-green-400">12% more than last week</p>
          </div>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-sm text-gray-400 mb-1">Quiz Average</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{Math.round(averageQuizScore)}%</p>
              <p className="text-xs text-gray-500">across {quizPerformanceData.length} quizzes</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-900 flex items-center justify-center">
              <BrainCircuit className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight className="h-3 w-3 text-green-400 mr-1" />
            <p className="text-xs text-green-400">5 point increase since last month</p>
          </div>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-sm text-gray-400 mb-1">Current Streak</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{streakData.current} days</p>
              <p className="text-xs text-gray-500">Longest: {streakData.longest} days</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">Weekly goal: {streakData.weeklyGoal} days</p>
            <p className="text-xs font-medium text-green-400">{streakData.current >= streakData.weeklyGoal ? 'Goal achieved!' : `${streakData.weeklyGoal - streakData.current} more to go`}</p>
          </div>
        </Card>
      </div>
      
      {/* Detailed Analytics */}
      <Tabs defaultValue="activity">
        <TabsList className="bg-gray-800 mb-6">
          <TabsTrigger value="activity" className="data-[state=active]:bg-gray-700">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gray-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-gray-700">
            <BrainCircuit className="h-4 w-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="planning" className="data-[state=active]:bg-gray-700">
            <Calendar className="h-4 w-4 mr-2" />
            Planning
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Weekly Activity</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs border-gray-600">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs border-gray-600">
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} 
                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Bar dataKey="minutes" name="Minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="modules" name="Modules" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="quizzes" name="Quizzes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-750 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Total Time Spent</h4>
                <p className="text-xl font-bold">{formatTimeSpent(totalTimeSpent)}</p>
                <p className="text-xs text-gray-500 mt-1">Avg. {formatTimeSpent(totalTimeSpent / 7)} per day</p>
              </div>
              <div className="bg-gray-750 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Modules Accessed</h4>
                <p className="text-xl font-bold">{weeklyActivityData.reduce((sum, day) => sum + day.modules, 0)}</p>
                <p className="text-xs text-gray-500 mt-1">Focused on Module 3</p>
              </div>
              <div className="bg-gray-750 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Quizzes Completed</h4>
                <p className="text-xl font-bold">{weeklyActivityData.reduce((sum, day) => sum + day.quizzes, 0)}</p>
                <p className="text-xs text-gray-500 mt-1">Avg. score: {Math.round(averageQuizScore)}%</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-4">Learning Time Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={learningTimeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {learningTimeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} 
                      formatter={(value: number) => [`${value}%`, 'Percentage']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-750 rounded-md">
                  <h4 className="font-medium mb-2">Learning Insights</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Info className="h-4 w-4 text-electric-cyan-400 mt-0.5 mr-2 flex-shrink-0" />
                      <p>You spend most of your time on <span className="font-medium text-electric-cyan-400">video content</span>, which aligns with your preferred learning style.</p>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                      <p>Consider increasing time on <span className="font-medium text-amber-400">practice exercises</span> to reinforce learning concepts.</p>
                    </li>
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 text-purple-400 mt-0.5 mr-2 flex-shrink-0" />
                      <p>Participating more in <span className="font-medium text-purple-400">discussions</span> can enhance understanding through peer learning.</p>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-electric-cyan-900/20 border border-electric-cyan-700/30 rounded-md">
                  <h4 className="font-medium text-electric-cyan-400 mb-2">Recommendations</h4>
                  <p className="text-sm mb-3">Based on your learning patterns, we recommend:</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 text-green-400 mr-2" />
                      <span>Schedule 2 practice sessions this week</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 text-green-400 mr-2" />
                      <span>Join at least one discussion forum</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 text-green-400 mr-2" />
                      <span>Review challenging concepts in Module 3</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-6">Quiz Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} 
                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Bar dataKey="score" name="Your Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="average" name="Class Average" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Recent Assessment Results</h4>
              <div className="space-y-3">
                {assessmentResults.map(result => (
                  <div key={result.id} className="p-3 bg-gray-750 rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        result.status === 'passed' ? 'bg-green-900/30' : 'bg-red-900/30'
                      }`}>
                        {result.status === 'passed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium">{result.name}</h5>
                        <p className="text-xs text-gray-400">{result.date}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.score >= 90 ? 'bg-green-900/30 text-green-400' :
                      result.score >= 80 ? 'bg-blue-900/30 text-blue-400' :
                      result.score >= 70 ? 'bg-amber-900/30 text-amber-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {result.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-6">Module Completion Progress</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={progressByModule}
                  margin={{ top: 20, right: 30, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} 
                    formatter={(value: number) => [`${value}%`, 'Completed']}
                  />
                  <Bar 
                    dataKey="completed" 
                    fill="#3b82f6" 
                    radius={[0, 4, 4, 0]}
                    label={{ 
                      position: 'right', 
                      formatter: (value: number) => `${value}%`,
                      fill: '#fff'
                    }} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Areas for Improvement</h4>
              <div className="space-y-3">
                {improvementAreas.map((area, index) => (
                  <div key={index} className="p-3 bg-gray-750 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">{area.area}</h5>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        area.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                        area.priority === 'medium' ? 'bg-amber-900/30 text-amber-400' :
                        'bg-green-900/30 text-green-400'
                      }`}>
                        {area.priority} priority
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">{area.resources} additional resources available</p>
                      <Button variant="outline" size="sm" className="h-7 text-xs border-electric-cyan-600 text-electric-cyan-400">
                        Review Resources
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-6">Progress Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyProgressData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} 
                    formatter={(value: number) => [`${value}%`, 'Progress']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#3b82f6" 
                    fill="url(#colorProgress)" 
                    activeDot={{ r: 8 }} 
                  />
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="skills" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-6">Skill Proficiency</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                  <Radar 
                    name="Skills" 
                    dataKey="A" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} 
                    formatter={(value: number) => [`${value}/100`, 'Proficiency']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {skillRadarData.map((skill, index) => (
                <div key={index} className="bg-gray-750 p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-1">{skill.subject}</h4>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-400">Proficiency</p>
                    <p className="text-xs font-medium">{skill.A}%</p>
                  </div>
                  <Progress value={skill.A} className="h-1.5 bg-gray-700" />
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-750 rounded-md">
              <h4 className="font-medium mb-3">Personalized Learning Recommendations</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-400">Deep Learning Fundamentals</h5>
                    <p className="text-sm text-gray-400 mb-1">Focus on improving your understanding of neural network architectures.</p>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-blue-600 text-blue-400">
                      View Resources
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-amber-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                    <Activity className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h5 className="font-medium text-amber-400">Reinforcement Learning</h5>
                    <p className="text-sm text-gray-400 mb-1">Work through the practice exercises in Module 4 to strengthen this skill.</p>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-amber-600 text-amber-400">
                      Start Exercises
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                    <BrainCircuit className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <h5 className="font-medium text-green-400">NLP Specialization</h5>
                    <p className="text-sm text-gray-400 mb-1">Consider the advanced NLP project to capitalize on your strengths.</p>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-green-600 text-green-400">
                      Explore Project
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="planning" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3 mb-6">
              {upcomingDeadlines.map(deadline => (
                <div key={deadline.id} className={`p-4 rounded-md ${
                  deadline.daysLeft <= 3 ? 'bg-red-900/20 border border-red-700/30' :
                  deadline.daysLeft <= 7 ? 'bg-amber-900/20 border border-amber-700/30' :
                  'bg-gray-750'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{deadline.name}</h4>
                      <p className="text-sm text-gray-400">{deadline.module}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deadline.daysLeft <= 3 ? 'bg-red-900/30 text-red-400' :
                      deadline.daysLeft <= 7 ? 'bg-amber-900/30 text-amber-400' :
                      'bg-green-900/30 text-green-400'
                    }`}>
                      {deadline.daysLeft} days left
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-gray-400">Due: {deadline.due}</p>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-bold mb-4">Recommended Study Plan</h3>
            <div className="bg-electric-cyan-900/20 border border-electric-cyan-700/30 p-4 rounded-md mb-6">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-electric-cyan-400 mr-2" />
                <h4 className="font-medium text-electric-cyan-400">This Week's Focus Areas</h4>
              </div>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Complete Module 3: Neural Networks</p>
                    <p className="text-xs text-gray-400">Estimated time: 3 hours</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Work on Project Proposal</p>
                    <p className="text-xs text-gray-400">Due in 6 days</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Practice Deep Learning Exercises</p>
                    <p className="text-xs text-gray-400">Strengthen weak areas</p>
                  </div>
                </li>
              </ul>
              <Button className="w-full bg-electric-cyan-600 hover:bg-electric-cyan-700">
                Generate Detailed Study Plan
              </Button>
            </div>
            
            <h3 className="text-lg font-bold mb-4">Study Group Sessions</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-750 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Neural Networks Discussion</h4>
                  <span className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded-full">Tomorrow</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">Join fellow students to discuss neural network architectures and applications.</p>
                <div className="flex items-center text-xs text-gray-400 gap-4 mb-3">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 7:00 PM - 8:30 PM EST</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 8 participants</span>
                </div>
                <Button variant="outline" size="sm" className="w-full h-8 border-blue-600 text-blue-400">
                  Join Session
                </Button>
              </div>
              
              <div className="p-4 bg-gray-750 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Project Workshop</h4>
                  <span className="bg-purple-900/30 text-purple-400 text-xs px-2 py-1 rounded-full">Friday</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">Collaborative workshop to get feedback on your project proposal.</p>
                <div className="flex items-center text-xs text-gray-400 gap-4 mb-3">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 6:00 PM - 7:30 PM EST</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 12 participants</span>
                </div>
                <Button variant="outline" size="sm" className="w-full h-8 border-purple-600 text-purple-400">
                  Join Session
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningAnalytics;