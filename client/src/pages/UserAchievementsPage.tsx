import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Award, Trophy, Medal, BookOpen, Zap, Clock, Target, Star, Shield } from 'lucide-react';
import UserAchievements, { Achievement } from '@/components/course/UserAchievements';
import SocialShareWidget from '@/components/course/SocialShareWidget';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const UserAchievementsPage: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data - would typically come from an API
  const achievements: Achievement[] = [
    {
      id: 'ai-basics',
      title: 'AI Foundations',
      description: 'Completed the AI Foundations module',
      icon: 'book',
      date: new Date(2025, 4, 15),
      type: 'course',
      level: 'gold',
      unlocked: true
    },
    {
      id: 'perfect-quiz',
      title: 'Perfect Score',
      description: 'Achieved 100% on a course quiz',
      icon: 'star',
      date: new Date(2025, 4, 16),
      type: 'quiz',
      level: 'gold',
      unlocked: true
    },
    {
      id: 'five-day-streak',
      title: 'Learning Streak',
      description: 'Studied for 5 consecutive days',
      icon: 'zap',
      date: new Date(2025, 4, 17),
      type: 'streak',
      level: 'silver',
      unlocked: true
    },
    {
      id: 'deep-learning-expert',
      title: 'Deep Learning Expert',
      description: 'Mastered neural network architectures',
      icon: 'trophy',
      date: new Date(2025, 4, 18),
      type: 'course',
      level: 'platinum',
      unlocked: false,
      progress: 75
    },
    {
      id: 'quick-learner',
      title: 'Quick Learner',
      description: 'Completed a module in record time',
      icon: 'clock',
      date: new Date(2025, 4, 19),
      type: 'milestone',
      level: 'bronze',
      unlocked: true
    },
    {
      id: 'contributing-member',
      title: 'Contributing Member',
      description: 'Shared valuable insights in the discussion forum',
      icon: 'shield',
      date: new Date(2025, 4, 19),
      type: 'milestone',
      level: 'bronze',
      unlocked: false,
      progress: 30
    }
  ];
  
  // Stats for the user (would come from API)
  const userStats = {
    coursesCompleted: 3,
    totalCourses: 9,
    quizzesPassed: 12,
    totalQuizzes: 25,
    streak: 7,
    points: 1250,
    level: 4
  };
  
  // Handle sharing of achievements
  const handleShareAchievement = (achievement: Achievement) => {
    toast({
      title: "Sharing Achievement",
      description: `Preparing to share "${achievement.title}" achievement`,
    });
  };
  
  return (
    <>
      <Helmet>
        <title>Your Achievements | AI Learning Platform</title>
        <meta name="description" content="Track your learning progress and achievements in your AI courses" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Achievements</h1>
            <p className="text-gray-600 mt-1">Track your learning journey and milestones</p>
          </div>
          
          <SocialShareWidget 
            title="Check out my achievements on the AI Learning Platform!" 
            description="I've been mastering AI concepts and earning achievements. Join me!"
            buttonText="Share All Achievements"
            className="mt-4 md:mt-0"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Courses Completed</span>
                    <span className="font-medium">{userStats.coursesCompleted}/{userStats.totalCourses}</span>
                  </div>
                  <Progress value={(userStats.coursesCompleted / userStats.totalCourses) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quizzes Passed</span>
                    <span className="font-medium">{userStats.quizzesPassed}/{userStats.totalQuizzes}</span>
                  </div>
                  <Progress value={(userStats.quizzesPassed / userStats.totalQuizzes) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Medal className="h-5 w-5 mr-2 text-blue-500" />
                Your Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <span className="text-2xl font-bold text-blue-700">{userStats.level}</span>
                </div>
                <div>
                  <h3 className="font-medium">Advanced Learner</h3>
                  <p className="text-sm text-gray-500">Next level: {userStats.points}/1500 points</p>
                  <Progress value={(userStats.points / 1500) * 100} className="h-2 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-500" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <span className="text-2xl font-bold text-purple-700">{userStats.streak}</span>
                </div>
                <div>
                  <h3 className="font-medium">Day Streak</h3>
                  <p className="text-sm text-gray-500">Keep it going to earn more rewards!</p>
                  
                  <div className="flex gap-1 mt-2">
                    {[...Array(7)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-2 w-6 rounded-full ${i < userStats.streak ? 'bg-purple-500' : 'bg-gray-200'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <UserAchievements 
          achievements={achievements} 
          onShare={handleShareAchievement}
        />
      </div>
    </>
  );
};

export default UserAchievementsPage;