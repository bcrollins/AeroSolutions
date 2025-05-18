import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Trophy, Star, Clock, Target, Zap, Award, BookOpen, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: Date;
  type: 'course' | 'quiz' | 'streak' | 'milestone';
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress?: number;
  unlocked: boolean;
}

interface UserAchievementsProps {
  achievements: Achievement[];
  onShare?: (achievement: Achievement) => void;
}

const UserAchievements: React.FC<UserAchievementsProps> = ({ 
  achievements,
  onShare 
}) => {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  
  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'trophy': return <Trophy />;
      case 'star': return <Star />;
      case 'clock': return <Clock />;
      case 'target': return <Target />;
      case 'zap': return <Zap />;
      case 'award': return <Award />;
      case 'book': return <BookOpen />;
      case 'shield': return <Shield />;
      default: return <Trophy />;
    }
  };
  
  const getBadgeStyle = (level?: string) => {
    switch(level) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  const renderAchievement = (achievement: Achievement) => {
    return (
      <motion.div
        key={achievement.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="col-span-1"
      >
        <Card className={`border h-full ${achievement.unlocked ? '' : 'opacity-60'}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-full ${achievement.unlocked 
                ? getBadgeStyle(achievement.level) 
                : 'bg-gray-100 text-gray-400'}`}
              >
                <div className="w-8 h-8">
                  {getIconComponent(achievement.icon)}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold">{achievement.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                
                {achievement.level && achievement.unlocked && (
                  <Badge className={`mt-2 ${getBadgeStyle(achievement.level)}`}>
                    {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
                  </Badge>
                )}
                
                {achievement.progress !== undefined && achievement.progress < 100 && (
                  <div className="w-full mt-3">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{achievement.progress}% completed</p>
                  </div>
                )}
                
                {achievement.unlocked && onShare && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => onShare(achievement)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };
  
  return (
    <div className="w-full">
      <Tabs defaultValue="unlocked" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="unlocked">
            Unlocked ({unlockedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="locked">
            Locked ({lockedAchievements.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unlocked">
          {unlockedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map(renderAchievement)}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-700">No Achievements Yet</h3>
              <p className="text-gray-500 mt-1">Complete courses and quizzes to earn achievements!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="locked">
          {lockedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map(renderAchievement)}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-700">All Achievements Unlocked!</h3>
              <p className="text-gray-500 mt-1">Congratulations! You've unlocked all available achievements.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAchievements;